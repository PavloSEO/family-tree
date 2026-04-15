import type { PhotoTag } from "@family-tree/shared";
import { useTranslation } from "react-i18next";
import type { Slide, SlideImage } from "yet-another-react-lightbox";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

export type PhotoGallerySlide = SlideImage & {
  tags?: PhotoTag[];
  photoId?: string;
};

function TagOverlay({
  tags,
  personLabel,
}: {
  tags: PhotoTag[];
  personLabel: (personId: string) => string;
}) {
  if (tags.length === 0) {
    return null;
  }
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[1]"
      aria-hidden
    >
      {tags.map((tag) => (
        <div
          key={tag.id}
          className="group absolute box-border border-2 border-white/85"
          style={{
            left: `${String(tag.x * 100)}%`,
            top: `${String(tag.y * 100)}%`,
            width: `${String(tag.width * 100)}%`,
            height: `${String(tag.height * 100)}%`,
            background: "rgba(255,255,255,0.14)",
          }}
        >
          <span className="md-typescale-label-small absolute left-0 top-0 z-10 max-w-[min(90vw,14rem)] -translate-y-full truncate rounded-sm bg-black/80 px-1.5 py-0.5 text-white opacity-100 shadow sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
            {personLabel(tag.personId)}
          </span>
        </div>
      ))}
    </div>
  );
}

export type PhotoGalleryProps = {
  open: boolean;
  index: number;
  slides: readonly PhotoGallerySlide[];
  onClose: () => void;
  onIndexChange?: (index: number) => void;
  personLabel: (personId: string) => string;
};

export function PhotoGallery({
  open,
  index,
  slides,
  onClose,
  onIndexChange,
  personLabel,
}: PhotoGalleryProps) {
  const { t } = useTranslation("albums");

  return (
    <Lightbox
      open={open}
      close={onClose}
      index={index}
      slides={slides as Slide[]}
      plugins={[Zoom]}
      carousel={{ finite: slides.length <= 1, preload: 2 }}
      labels={{
        Close: t("gallery.close"),
        Next: t("gallery.next"),
        Previous: t("gallery.previous"),
      }}
      render={{
        slideContainer: ({ children, slide }) => {
          const s = slide as PhotoGallerySlide;
          return (
            <div className="relative flex h-full w-full items-center justify-center">
              {children}
              <TagOverlay tags={s.tags ?? []} personLabel={personLabel} />
            </div>
          );
        },
      }}
      on={{
        view: ({ index: i }) => {
          onIndexChange?.(i);
        },
      }}
    />
  );
}
