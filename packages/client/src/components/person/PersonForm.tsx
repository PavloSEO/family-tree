import { zodResolver } from "@hookform/resolvers/zod";
import type { Person } from "@family-tree/shared";
import { HTTPError } from "ky";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
import { createPerson, updatePerson } from "../../api/persons.js";
import { Accordion } from "../Accordion.js";
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
  onSuccess: () => void;
  onCancel: () => void;
};

export function PersonForm({
  mode,
  personId,
  person,
  sessionStorageDraftKey,
  showAdminSaveToast = false,
  onSuccess,
  onCancel,
}: PersonFormProps) {
  const { t } = useTranslation("person");
  const { t: tc } = useTranslation("common");
  const { t: ta } = useTranslation("admin");
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
            const body = formInputToPersonCreate(values);
            await createPerson(body);
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

      <fieldset className="m-0 border-0 p-0">
        <legend className="md-typescale-label-large mb-2 text-[var(--md-sys-color-on-surface-variant)]">
          {t("form.genderLegend")}
        </legend>
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <div className="flex flex-wrap gap-6">
              <md-radio
                name="person-gender"
                value="male"
                checked={field.value === "male"}
                onInput={() => {
                  field.onChange("male");
                }}
              >
                {t("gender.maleShort")}
              </md-radio>
              <md-radio
                name="person-gender"
                value="female"
                checked={field.value === "female"}
                onInput={() => {
                  field.onChange("female");
                }}
              >
                {t("gender.femaleShort")}
              </md-radio>
            </div>
          )}
        />
      </fieldset>

      <Accordion summary={t("form.accordionExtraName")}>
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

      <Accordion summary={t("form.accordionDatesPlaces")}>
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

      <Accordion summary={t("form.accordionPhoto")}>
        <p className="md-typescale-body-medium m-0 text-[var(--md-sys-color-on-surface-variant)]">
          {t("form.photoLine1")}{" "}
          <code className="rounded bg-[var(--md-sys-color-surface-container-high)] px-1 text-sm">
            POST /api/persons/:id/photo
          </code>{" "}
          {t("form.photoLine2")}{" "}
          <code className="rounded bg-[var(--md-sys-color-surface-container-high)] px-1 text-sm">
            file
          </code>
          {t("form.photoLine3")}
        </p>
      </Accordion>

      <Accordion summary={t("form.accordionContacts")}>
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

      <Accordion summary={t("form.accordionAbout")}>
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

      <Accordion summary={t("form.accordionMedical")}>
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

      <Accordion summary={t("form.accordionCustom")}>
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
