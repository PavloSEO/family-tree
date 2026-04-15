import type { Photo } from "@family-tree/shared";
import type {
  ChangeEvent,
  DragEvent,
  KeyboardEvent,
} from "react";
import { useCallback, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { uploadAlbumPhoto } from "../api/photos.js";
import { MdButton } from "./md/index.js";

const ACCEPT = "image/jpeg,image/png,image/webp";
const ACCEPT_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

/** Согласовано с дефолтом сервера `MAX_UPLOAD_SIZE_MB` (10). */
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_MB = String(MAX_FILE_BYTES / 1024 / 1024);

export type PhotoUploaderProps = {
  albumId: string;
  disabled?: boolean;
  /** Вызывается после каждого успешно загруженного файла. */
  onUploaded?: (photo: Photo) => void;
  className?: string;
};

type QueuedFile = {
  key: string;
  file: File;
  previewUrl: string;
};

function isAllowedImage(file: File): boolean {
  if (file.type && ACCEPT_MIME.has(file.type)) {
    return true;
  }
  const name = file.name.toLowerCase();
  return (
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".png") ||
    name.endsWith(".webp")
  );
}

export function PhotoUploader({
  albumId,
  disabled = false,
  onUploaded,
  className,
}: PhotoUploaderProps) {
  const { t } = useTranslation("albums");
  const { t: tc } = useTranslation("common");
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const addFiles = useCallback(
    (list: FileList | File[]) => {
    if (uploading) {
      return;
    }
    setMessage(null);
    const next: QueuedFile[] = [];
    let rejectedSize = 0;
    for (const file of list) {
      if (!isAllowedImage(file)) {
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        rejectedSize += 1;
        continue;
      }
      next.push({
        key: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }
    if (next.length === 0 && list.length > 0) {
      if (rejectedSize > 0) {
        setMessage(t("uploader.errAllTooBig", { mb: MAX_MB }));
        return;
      }
      setMessage(t("uploader.errMimeOnly"));
      return;
    }
    if (rejectedSize > 0) {
      setMessage(
        t("uploader.errSomeTooBig", {
          mb: MAX_MB,
          count: String(rejectedSize),
        }),
      );
    }
    setQueue((q) => [...q, ...next]);
  },
    [uploading, t],
  );

  const removeQueued = useCallback((key: string) => {
    setQueue((q) => {
      const item = q.find((x) => x.key === key);
      if (item) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return q.filter((x) => x.key !== key);
    });
  }, []);

  const clearQueue = useCallback(() => {
    setQueue((q) => {
      for (const x of q) {
        URL.revokeObjectURL(x.previewUrl);
      }
      return [];
    });
  }, []);

  const runUpload = useCallback(async () => {
    if (disabled) {
      return;
    }
    const snapshot = [...queue];
    if (snapshot.length === 0) {
      return;
    }
    setMessage(null);
    setUploading(true);
    const totalBytes = snapshot.reduce((s, x) => s + x.file.size, 0) || 1;
    let doneBytes = 0;

    try {
      for (const item of snapshot) {
        const photo = await uploadAlbumPhoto(
          albumId,
          item.file,
          (loaded, total) => {
            const ratio = total > 0 ? loaded / total : 0;
            setProgress((doneBytes + ratio * item.file.size) / totalBytes);
          },
        );
        doneBytes += item.file.size;
        setProgress(doneBytes / totalBytes);
        URL.revokeObjectURL(item.previewUrl);
        onUploaded?.(photo);
        setQueue((q) => q.filter((x) => x.key !== item.key));
      }
    } catch (e) {
      const text =
        e instanceof Error ? e.message : t("uploader.errUploadFailed");
      setMessage(text);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [albumId, disabled, onUploaded, queue, t]);

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) {
      addFiles(files);
    }
    e.target.value = "";
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled || uploading) {
      return;
    }
    if (e.dataTransfer.files?.length) {
      addFiles(e.dataTransfer.files);
    }
  };

  const openPicker = () => {
    if (!disabled && !uploading) {
      inputRef.current?.click();
    }
  };

  const zoneDisabled = disabled || uploading;

  return (
    <div className={className ?? "flex flex-col gap-4"}>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        onChange={onInputChange}
        disabled={zoneDisabled}
      />

      <div
        role="button"
        tabIndex={zoneDisabled ? -1 : 0}
        aria-disabled={zoneDisabled}
        aria-labelledby={`${inputId}-label`}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] px-6 py-10 text-center outline-none transition-colors hover:bg-[var(--md-sys-color-surface-container)] focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] ${zoneDisabled ? "pointer-events-none opacity-50" : ""}`}
        onClick={openPicker}
        onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
          if (zoneDisabled) {
            return;
          }
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPicker();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
        }}
        onDrop={onDrop}
      >
        <md-icon className="material-symbols-outlined text-4xl text-[var(--md-sys-color-primary)]">
          upload_file
        </md-icon>
        <p
          id={`${inputId}-label`}
          className="md-typescale-body-large m-0 text-[var(--md-sys-color-on-surface)]"
        >
          {t("uploader.hintDropOrClick")}
        </p>
        <p className="md-typescale-body-small m-0 text-[var(--md-sys-color-on-surface-variant)]">
          {t("uploader.hintMimeAndSize", { mb: MAX_MB })}
        </p>
      </div>

      {queue.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="md-typescale-title-small m-0 text-[var(--md-sys-color-on-surface)]">
            {t("uploader.queueHeading", { count: String(queue.length) })}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {queue.map((item) => (
              <div
                key={item.key}
                className="relative overflow-hidden rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)]"
              >
                <img
                  src={item.previewUrl}
                  alt=""
                  className="aspect-square w-full object-cover"
                />
                <p className="md-typescale-label-small m-0 truncate px-2 py-1 text-[var(--md-sys-color-on-surface-variant)]">
                  {item.file.name}
                </p>
                {!uploading && (
                  <div className="absolute right-1 top-1">
                    <md-icon-button
                      title={t("uploader.removeFromQueueTitle")}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        removeQueued(item.key);
                      }}
                    >
                      <md-icon className="material-symbols-outlined">close</md-icon>
                    </md-icon-button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <MdButton
            variant="filled"
            type="button"
            disabled={uploading || disabled}
            onClick={() => {
              void runUpload();
            }}
          >
            {tc("upload")}
          </MdButton>
        </div>
      )}

      {uploading && (
        <div className="flex flex-col gap-2">
          <p className="md-typescale-body-medium m-0 text-[var(--md-sys-color-on-surface-variant)]">
            {t("uploader.uploading")}
          </p>
          <md-linear-progress max={1} value={progress} />
        </div>
      )}

      {message ? (
        <p className="md-typescale-body-medium m-0 text-[var(--md-sys-color-error)]">
          {message}
        </p>
      ) : null}

      {queue.length > 0 && !uploading && (
        <MdButton variant="text" type="button" disabled={disabled} onClick={clearQueue}>
          {t("uploader.clearQueue")}
        </MdButton>
      )}
    </div>
  );
}
