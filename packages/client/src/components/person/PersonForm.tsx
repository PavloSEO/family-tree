import { zodResolver } from "@hookform/resolvers/zod";
import type { Person } from "@family-tree/shared";
import { HTTPError } from "ky";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
import { createRelationship } from "../../api/relationships.js";
import {
  createPerson,
  updatePerson,
  uploadPersonMainPhoto,
} from "../../api/persons.js";
import { mainPhotoSrc } from "../../lib/person-main-photo-src.js";
import { personAvatarSrc } from "../../lib/person-avatar-src.js";
import { genderToPlaceholderGender } from "../../lib/person-placeholder.js";
import { Accordion } from "../Accordion.js";
import { PersonPicker } from "../relationship/RelationshipForm.js";
import {
  MdButton,
  MdSelect,
  MdSelectOption,
  MdTextField,
} from "../md/index.js";
import {
  PERSON_FORM_DEFAULTS,
  createPersonFormFieldsSchema,
  type PersonFormInput,
} from "../../forms/person-form.js";
import { loadWelcomePersonDraft } from "../../lib/welcome-person-draft.js";
import { COUNTRY_SELECT_CODES } from "../../lib/country-select-options.js";
import {
  formInputToPersonCreate,
  formInputToPersonUpdate,
  personToFormInput,
} from "../../forms/person-submit.js";

const BLOOD_CODES_EXCLUDING_EMPTY = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

export type PersonFormProps = {
  mode: "create" | "edit";
  personId?: string;
  person?: Person;
  /** When creating: periodically save values to `sessionStorage` (draft if session ends). */
  sessionStorageDraftKey?: string;
  /** Toast after successful save (admin editor only; Welcome flow unchanged). */
  showAdminSaveToast?: boolean;
  /** After a successful main-photo upload in edit mode (keeps parent `person` in sync). */
  onPhotoUploaded?: (person: Person) => void;
  onSuccess: () => void;
  onCancel: () => void;
};

export function PersonForm({
  mode,
  personId,
  person,
  sessionStorageDraftKey,
  showAdminSaveToast = false,
  onPhotoUploaded,
  onSuccess,
  onCancel,
}: PersonFormProps) {
  const { t } = useTranslation("person");
  const { t: tc } = useTranslation("common");
  const { t: ta } = useTranslation("admin");
  const parentPickId = useId().replace(/:/g, "");
  const anchorFather = `pf-${parentPickId}`;
  const anchorMother = `pm-${parentPickId}`;
  const [father, setFather] = useState<Person | null>(null);
  const [mother, setMother] = useState<Person | null>(null);
  const personSchema = useMemo(() => createPersonFormFieldsSchema(t), [t]);
  const bloodOptions = useMemo(
    () => [
      { code: "", label: t("form.bloodNotSpecified") },
      ...BLOOD_CODES_EXCLUDING_EMPTY.map((code) => ({
        code,
        label: code.replace(/-/g, "−"),
      })),
    ],
    [t],
  );
  const apiErrorMessage = useCallback(
    (e: unknown): string => {
      if (e instanceof z.ZodError) {
        return e.errors[0]?.message ?? t("validation.checkData");
      }
      if (e instanceof HTTPError) {
        return e.message;
      }
      if (e instanceof Error) {
        return e.message;
      }
      return String(e);
    },
    [t],
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [serverMainPhoto, setServerMainPhoto] = useState<string | null>(
    person?.mainPhoto ?? null,
  );
  const [blobPreviewUrl, setBlobPreviewUrl] = useState<string | null>(null);
  const [pendingPhotoFile, setPendingPhotoFile] = useState<File | null>(null);
  const [photoUploadBusy, setPhotoUploadBusy] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);
  const [photoBroken, setPhotoBroken] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setServerMainPhoto(person?.mainPhoto ?? null);
    setPhotoBroken(false);
  }, [person?.id, person?.mainPhoto]);

  useEffect(() => {
    return () => {
      if (blobPreviewUrl) {
        URL.revokeObjectURL(blobPreviewUrl);
      }
    };
  }, [blobPreviewUrl]);
  const formValues = useMemo<PersonFormInput>(() => {
    if (person) {
      return personToFormInput(person);
    }
    if (sessionStorageDraftKey) {
      const draft = loadWelcomePersonDraft(sessionStorageDraftKey);
      if (draft && Object.keys(draft).length > 0) {
        return { ...PERSON_FORM_DEFAULTS, ...draft };
      }
    }
    return PERSON_FORM_DEFAULTS;
  }, [person, sessionStorageDraftKey]);

  const { control, handleSubmit, formState, watch, getValues } = useForm<PersonFormInput>({
    resolver: zodResolver(personSchema),
    defaultValues: PERSON_FORM_DEFAULTS,
    values: formValues,
  });

  const genderWatch = useWatch({ control, name: "gender" });
  const dateOfDeathWatch = useWatch({ control, name: "dateOfDeath" });

  const previewSrc = useMemo(() => {
    const g = genderWatch === "female" ? "female" : "male";
    const dead =
      Boolean(dateOfDeathWatch) &&
      String(dateOfDeathWatch ?? "").trim().length > 0;
    if (blobPreviewUrl) {
      return blobPreviewUrl;
    }
    if (!photoBroken) {
      const fromDb = mainPhotoSrc(serverMainPhoto);
      if (fromDb) {
        return fromDb;
      }
    }
    return personAvatarSrc({
      mainPhoto: null,
      gender: genderToPlaceholderGender(g),
      dead,
      photoBroken: false,
    });
  }, [
    blobPreviewUrl,
    serverMainPhoto,
    photoBroken,
    genderWatch,
    dateOfDeathWatch,
  ]);

  const handlePhotoFileSelected = useCallback(
    async (ev: ChangeEvent<HTMLInputElement>) => {
      const f = ev.target.files?.[0];
      ev.target.value = "";
      if (!f) {
        return;
      }
      setPhotoUploadError(null);
      if (mode === "edit" && personId) {
        setPhotoUploadBusy(true);
        try {
          const updated = await uploadPersonMainPhoto(personId, f);
          setServerMainPhoto(updated.mainPhoto ?? null);
          setBlobPreviewUrl((prev) => {
            if (prev) {
              URL.revokeObjectURL(prev);
            }
            return null;
          });
          setPendingPhotoFile(null);
          setPhotoBroken(false);
          onPhotoUploaded?.(updated);
          if (showAdminSaveToast) {
            toast.success(ta("toast.personPhotoUpdated"));
          }
        } catch (e) {
          setPhotoUploadError(apiErrorMessage(e));
        } finally {
          setPhotoUploadBusy(false);
        }
        return;
      }
      setPendingPhotoFile(f);
      setBlobPreviewUrl((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }
        return URL.createObjectURL(f);
      });
      setPhotoBroken(false);
    },
    [
      mode,
      personId,
      apiErrorMessage,
      onPhotoUploaded,
      showAdminSaveToast,
      ta,
    ],
  );

  const { errors, isSubmitting } = formState;

  const draftSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (mode !== "create" || !sessionStorageDraftKey) {
      return;
    }
    const sub = watch((value) => {
      if (draftSaveTimer.current != null) {
        clearTimeout(draftSaveTimer.current);
      }
      draftSaveTimer.current = setTimeout(() => {
        draftSaveTimer.current = null;
        try {
          sessionStorage.setItem(sessionStorageDraftKey, JSON.stringify(value));
        } catch {
          /* quota / private mode */
        }
      }, 500);
    });
    return () => {
      sub.unsubscribe();
      if (draftSaveTimer.current != null) {
        clearTimeout(draftSaveTimer.current);
      }
    };
  }, [watch, mode, sessionStorageDraftKey]);

  useEffect(() => {
    if (mode !== "create" || !sessionStorageDraftKey) {
      return;
    }
    const flush = () => {
      try {
        sessionStorage.setItem(
          sessionStorageDraftKey,
          JSON.stringify(getValues()),
        );
      } catch {
        /* */
      }
    };
    const onVis = () => {
      if (document.visibilityState === "hidden") {
        flush();
      }
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [mode, sessionStorageDraftKey, getValues]);

  return (
    <form
      className="flex max-w-3xl flex-col gap-4"
      onSubmit={handleSubmit(async (values) => {
        setSubmitError(null);
        try {
          if (mode === "edit" && personId) {
            const body = formInputToPersonUpdate(values);
            await updatePerson(personId, body);
          } else {
            if (father && mother && father.id === mother.id) {
              setSubmitError(t("form.parentsSamePersonError"));
              return;
            }
            const body = formInputToPersonCreate(values);
            const created = await createPerson(body);
            const parentPayload = {
              type: "parent" as const,
              toPersonId: created.id,
            };
            const linkErrors: string[] = [];
            if (father) {
              try {
                await createRelationship({
                  ...parentPayload,
                  fromPersonId: father.id,
                });
              } catch (e) {
                linkErrors.push(apiErrorMessage(e));
              }
            }
            if (mother) {
              try {
                await createRelationship({
                  ...parentPayload,
                  fromPersonId: mother.id,
                });
              } catch (e) {
                linkErrors.push(apiErrorMessage(e));
              }
            }
            if (linkErrors.length > 0) {
              toast.error(t("form.parentsLinkPartialError"), {
                description: linkErrors.join(" · "),
              });
            }
            if (pendingPhotoFile) {
              try {
                const updated = await uploadPersonMainPhoto(
                  created.id,
                  pendingPhotoFile,
                );
                setServerMainPhoto(updated.mainPhoto ?? null);
                setBlobPreviewUrl((prev) => {
                  if (prev) {
                    URL.revokeObjectURL(prev);
                  }
                  return null;
                });
                setPendingPhotoFile(null);
                setPhotoBroken(false);
              } catch (photoErr) {
                toast.error(apiErrorMessage(photoErr));
              }
            }
          }
          if (mode === "create" && sessionStorageDraftKey) {
            try {
              sessionStorage.removeItem(sessionStorageDraftKey);
            } catch {
              /* */
            }
          }
          if (showAdminSaveToast) {
            toast.success(
              mode === "edit"
                ? ta("toast.personUpdated")
                : ta("toast.personCreated"),
            );
          }
          onSuccess();
        } catch (e) {
          setSubmitError(apiErrorMessage(e));
        }
      })}
    >
      {submitError ? (
        <p
          className="md-typescale-body-medium m-0"
          style={{ color: "var(--md-sys-color-error)" }}
        >
          {submitError}
        </p>
      ) : null}

      {mode === "create" ? (
        <fieldset className="m-0 rounded-[var(--md-sys-shape-corner-medium)] border border-[var(--md-sys-color-outline-variant)] p-4">
          <legend className="md-typescale-title-small px-1 text-[var(--md-sys-color-on-surface)]">
            {t("form.parentsLegend")}
          </legend>
          <p className="md-typescale-body-small m-0 mb-4 text-[var(--md-sys-color-on-surface-variant)]">
            {t("form.parentsHint")}
          </p>
          <div className="flex flex-col gap-6">
            <PersonPicker
              anchorId={anchorFather}
              label={t("form.parentFather")}
              person={father}
              onChange={setFather}
              searchFieldLabel={ta("relationshipForm.searchLabel")}
              searchingLabel={ta("relationshipForm.searching")}
              changeLabel={ta("relationshipForm.change")}
            />
            <PersonPicker
              anchorId={anchorMother}
              label={t("form.parentMother")}
              person={mother}
              onChange={setMother}
              searchFieldLabel={ta("relationshipForm.searchLabel")}
              searchingLabel={ta("relationshipForm.searching")}
              changeLabel={ta("relationshipForm.change")}
            />
          </div>
        </fieldset>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          name="firstName"
          control={control}
          render={({ field }) => (
            <MdTextField
              label={t("form.labels.firstName")}
              value={field.value}
              onValueChange={field.onChange}
              required
              error={!!errors.firstName}
              errorText={errors.firstName?.message}
            />
          )}
        />
        <Controller
          name="lastName"
          control={control}
          render={({ field }) => (
            <MdTextField
              label={t("form.labels.lastName")}
              value={field.value}
              onValueChange={field.onChange}
              required
              error={!!errors.lastName}
              errorText={errors.lastName?.message}
            />
          )}
        />
      </div>

      <fieldset className="person-form-gender m-0 border-0 p-0 [--md-icon-size:24px] [--md-radio-icon-size:24px]">
        <legend className="md-typescale-label-large mb-2 text-[var(--md-sys-color-on-surface-variant)]">
          {t("form.genderLegend")}
        </legend>
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <label
                className={
                  "flex min-h-[52px] cursor-pointer items-center gap-3 rounded-full border-2 px-4 py-2 transition-colors " +
                  (field.value === "male"
                    ? "border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]"
                    : "border-transparent hover:bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)]")
                }
              >
                <md-icon
                  className="material-symbols-outlined shrink-0 opacity-90"
                  aria-hidden="true"
                >
                  man
                </md-icon>
                <md-radio
                  name="person-gender"
                  value="male"
                  checked={field.value === "male"}
                  onInput={() => {
                    field.onChange("male");
                  }}
                />
                <span className="md-typescale-body-large font-medium">
                  {t("gender.maleShort")}
                </span>
              </label>
              <label
                className={
                  "flex min-h-[52px] cursor-pointer items-center gap-3 rounded-full border-2 px-4 py-2 transition-colors " +
                  (field.value === "female"
                    ? "border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]"
                    : "border-transparent hover:bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)]")
                }
              >
                <md-icon
                  className="material-symbols-outlined shrink-0 opacity-90"
                  aria-hidden="true"
                >
                  woman
                </md-icon>
                <md-radio
                  name="person-gender"
                  value="female"
                  checked={field.value === "female"}
                  onInput={() => {
                    field.onChange("female");
                  }}
                />
                <span className="md-typescale-body-large font-medium">
                  {t("gender.femaleShort")}
                </span>
              </label>
            </div>
          )}
        />
      </fieldset>

      <Accordion summary={t("form.accordionExtraName")} icon="person">
        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="patronymic"
            control={control}
            render={({ field }) => (
              <MdTextField
                label={t("form.labels.patronymic")}
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
          <Controller
            name="maidenName"
            control={control}
            render={({ field }) => (
              <MdTextField
                label={t("form.labels.maidenName")}
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
        </div>
        <Controller
          name="localizedNamesJson"
          control={control}
          render={({ field }) => (
            <MdTextField
              label={t("form.labels.localizedNamesJson")}
              type="textarea"
              rows={6}
              value={field.value}
              onValueChange={field.onChange}
              className="font-mono text-sm"
              supportingText={t("form.labels.localizedNamesHint")}
            />
          )}
        />
      </Accordion>

      <Accordion summary={t("form.accordionDatesPlaces")} icon="calendar_today">
        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="dateOfBirth"
            control={control}
            render={({ field }) => (
              <MdTextField
                label={t("form.labels.dateOfBirth")}
                type="date"
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
          <Controller
            name="dateOfDeath"
            control={control}
            render={({ field }) => (
              <MdTextField
                label={t("form.labels.dateOfDeath")}
                type="date"
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
          <Controller
            name="birthPlace"
            control={control}
            render={({ field }) => (
              <MdTextField
                label={t("form.labels.birthPlace")}
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
          <Controller
            name="currentLocation"
            control={control}
            render={({ field }) => (
              <MdTextField
                label={t("form.labels.currentLocation")}
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
          <div className="sm:col-span-2">
            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <MdSelect
                  label={t("form.labels.country")}
                  value={field.value}
                  onValueChange={(v) => {
                    field.onChange(v.toUpperCase().slice(0, 2));
                  }}
                >
                  {COUNTRY_SELECT_CODES.map((code) => (
                    <MdSelectOption
                      key={code || "none"}
                      value={code}
                      headline={
                        code === ""
                          ? tc("countries.notSpecified")
                          : tc(`countries.${code}`)
                      }
                    />
                  ))}
                </MdSelect>
              )}
            />
          </div>
        </div>
      </Accordion>

      <Accordion summary={t("form.accordionPhoto")} icon="photo_camera">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="shrink-0">
            <img
              src={previewSrc}
              alt=""
              className="h-36 w-36 rounded-lg border border-[var(--md-sys-color-outline-variant)] object-cover"
              onError={() => {
                if (blobPreviewUrl) {
                  setPhotoUploadError(t("form.photoPreviewError"));
                  setBlobPreviewUrl((prev) => {
                    if (prev) {
                      URL.revokeObjectURL(prev);
                    }
                    return null;
                  });
                  setPendingPhotoFile(null);
                  return;
                }
                setPhotoBroken(true);
              }}
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <p className="md-typescale-body-medium m-0 text-[var(--md-sys-color-on-surface-variant)]">
              {t("form.photoHint")}
            </p>
            {mode === "create" ? (
              <p className="md-typescale-body-small m-0 text-[var(--md-sys-color-on-surface-variant)]">
                {t("form.photoWillApplyOnSave")}
              </p>
            ) : null}
            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/tiff"
              className="sr-only"
              aria-hidden
              disabled={photoUploadBusy || isSubmitting}
              onChange={(ev) => {
                void handlePhotoFileSelected(ev);
              }}
            />
            <div className="flex flex-wrap items-center gap-2">
              <MdButton
                variant="outlined"
                type="button"
                disabled={photoUploadBusy || isSubmitting}
                onClick={() => {
                  photoInputRef.current?.click();
                }}
              >
                {photoUploadBusy
                  ? t("form.photoUploading")
                  : t("form.photoChooseButton")}
              </MdButton>
            </div>
            {photoUploadError ? (
              <p
                className="md-typescale-body-medium m-0"
                style={{ color: "var(--md-sys-color-error)" }}
              >
                {photoUploadError}
              </p>
            ) : null}
          </div>
        </div>
      </Accordion>

      <Accordion summary={t("form.accordionContacts")} icon="contact_mail">
        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <MdTextField
                label={t("form.labels.phone")}
                value={field.value}
                onValueChange={field.onChange}
                type="tel"
              />
            )}
          />
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <MdTextField
                label={t("form.labels.email")}
                type="email"
                value={field.value}
                onValueChange={field.onChange}
                error={!!errors.email}
                errorText={errors.email?.message}
              />
            )}
          />
        </div>
        <Controller
          name="socialLinksJson"
          control={control}
          render={({ field }) => (
            <MdTextField
              label={t("form.labels.socialLinksJson")}
              type="textarea"
              rows={5}
              value={field.value}
              onValueChange={field.onChange}
              className="font-mono text-sm"
              supportingText={t("form.labels.socialLinksHint")}
            />
          )}
        />
      </Accordion>

      <Accordion summary={t("form.accordionAbout")} icon="description">
        <Controller
          name="bio"
          control={control}
          render={({ field }) => (
            <MdTextField
              label={t("form.labels.bio")}
              type="textarea"
              rows={4}
              value={field.value}
              onValueChange={field.onChange}
            />
          )}
        />
        <Controller
          name="occupation"
          control={control}
          render={({ field }) => (
            <MdTextField
              label={t("form.labels.occupation")}
              value={field.value}
              onValueChange={field.onChange}
            />
          )}
        />
        <Controller
          name="hobbiesLines"
          control={control}
          render={({ field }) => (
            <MdTextField
              label={t("form.labels.hobbies")}
              type="textarea"
              rows={3}
              value={field.value}
              onValueChange={field.onChange}
              supportingText={t("form.labels.hobbiesHint")}
            />
          )}
        />
      </Accordion>

      <Accordion summary={t("form.accordionMedical")} icon="favorite">
        <Controller
          name="bloodType"
          control={control}
          render={({ field }) => (
            <MdSelect
              label={t("form.labels.bloodType")}
              value={field.value}
              onValueChange={field.onChange}
            >
              {bloodOptions.map((b) => (
                <MdSelectOption
                  key={b.code || "none"}
                  value={b.code}
                  headline={b.label}
                />
              ))}
            </MdSelect>
          )}
        />
      </Accordion>

      <Accordion summary={t("form.accordionCustom")} icon="tune">
        <Controller
          name="customFieldsJson"
          control={control}
          render={({ field }) => (
            <MdTextField
              label={t("form.labels.customFieldsJson")}
              type="textarea"
              rows={5}
              value={field.value}
              onValueChange={field.onChange}
              className="font-mono text-sm"
              supportingText={t("form.labels.customFieldsHint")}
            />
          )}
        />
      </Accordion>

      <div className="flex flex-wrap justify-end gap-2 pt-2">
        <MdButton
          variant="outlined"
          type="button"
          disabled={isSubmitting}
          onClick={onCancel}
        >
          {tc("cancel")}
        </MdButton>
        <MdButton variant="filled" type="submit" disabled={isSubmitting}>
          {tc("save")}
        </MdButton>
      </div>
    </form>
  );
}
