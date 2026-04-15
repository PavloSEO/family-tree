import type { Person, RelationshipCreate } from "@family-tree/shared";
import { HTTPError } from "ky";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { createRelationship } from "../../api/relationships.js";
import { fetchPersonsList } from "../../api/persons.js";
import { MdButton, MdDialog, MdTextField } from "../md/index.js";

function errorMessage(e: unknown, unknownLabel: string): string {
  if (e instanceof HTTPError) {
    return e.message;
  }
  if (e instanceof Error) {
    return e.message;
  }
  return unknownLabel;
}

function PersonPicker({
  anchorId,
  label,
  person,
  onChange,
  searchFieldLabel,
  searchingLabel,
  changeLabel,
}: {
  anchorId: string;
  label: string;
  person: Person | null;
  onChange: (p: Person | null) => void;
  searchFieldLabel: string;
  searchingLabel: string;
  changeLabel: string;
}) {
  const [q, setQ] = useState("");
  const [candidates, setCandidates] = useState<Person[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (person) {
      setCandidates([]);
      setMenuOpen(false);
      return;
    }
    const queryTrim = q.trim();
    if (queryTrim.length < 1) {
      setCandidates([]);
      setMenuOpen(false);
      return;
    }
    const handle = window.setTimeout(() => {
      void (async () => {
        setSearching(true);
        try {
          const res = await fetchPersonsList({
            search: queryTrim,
            page: 1,
            limit: 15,
          });
          setCandidates(res.data);
          setMenuOpen(res.data.length > 0);
        } catch {
          setCandidates([]);
          setMenuOpen(false);
        } finally {
          setSearching(false);
        }
      })();
    }, 400);
    return () => {
      window.clearTimeout(handle);
    };
  }, [q, person]);

  return (
    <div className="flex max-w-md flex-col gap-2">
      <p className="md-typescale-title-medium m-0 text-[var(--md-sys-color-on-surface)]">
        {label}
      </p>
      {person ? (
        <div className="flex flex-wrap items-center gap-3 rounded-[var(--md-sys-shape-corner-medium)] border border-[var(--md-sys-color-outline-variant)] px-4 py-3">
          <span className="md-typescale-body-large">
            {person.firstName} {person.lastName}
          </span>
          <MdButton
            variant="text"
            type="button"
            onClick={() => {
              onChange(null);
              setQ("");
            }}
          >
            {changeLabel}
          </MdButton>
        </div>
      ) : (
        <div className="relative w-full">
          <MdTextField
            id={anchorId}
            label={searchFieldLabel}
            value={q}
            onValueChange={setQ}
            supportingText={searching ? searchingLabel : undefined}
          />
          <md-menu
            anchor={anchorId}
            open={menuOpen && candidates.length > 0}
            positioning="popover"
          >
            {candidates.map((p) => (
              <md-menu-item
                key={p.id}
                headline={`${p.firstName} ${p.lastName}`}
                onClick={() => {
                  onChange(p);
                  setQ("");
                  setMenuOpen(false);
                }}
              />
            ))}
          </md-menu>
        </div>
      )}
    </div>
  );
}

export type RelationshipFormProps = {
  onSuccess: () => void;
  onCancel: () => void;
};

export function RelationshipForm({ onSuccess, onCancel }: RelationshipFormProps) {
  const { t } = useTranslation("admin");
  const { t: tc } = useTranslation("common");
  const idBase = useId().replace(/:/g, "");
  const anchorA = `rel-a-${idBase}`;
  const anchorB = `rel-b-${idBase}`;

  const [personA, setPersonA] = useState<Person | null>(null);
  const [personB, setPersonB] = useState<Person | null>(null);
  const [relType, setRelType] = useState<"parent" | "spouse">("parent");
  const [parentIsA, setParentIsA] = useState(true);
  const [marriageDate, setMarriageDate] = useState("");
  const [divorceDate, setDivorceDate] = useState("");
  const [isCurrentSpouse, setIsCurrentSpouse] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [warnOpen, setWarnOpen] = useState(false);
  const [warnMessages, setWarnMessages] = useState<string[]>([]);
  const warnNavigateAfterClose = useRef(false);

  const buildPayload = useCallback((): RelationshipCreate => {
    if (!personA || !personB) {
      throw new Error(t("relationshipForm.errPickBoth"));
    }
    if (personA.id === personB.id) {
      throw new Error(t("relationshipForm.errDifferent"));
    }
    if (relType === "parent") {
      const from = parentIsA ? personA.id : personB.id;
      const to = parentIsA ? personB.id : personA.id;
      return { type: "parent", fromPersonId: from, toPersonId: to };
    }
    const body: RelationshipCreate = {
      type: "spouse",
      fromPersonId: personA.id,
      toPersonId: personB.id,
    };
    const md = marriageDate.trim();
    const dd = divorceDate.trim();
    const nt = notes.trim();
    if (md) {
      body.marriageDate = md;
    }
    if (dd) {
      body.divorceDate = dd;
    }
    body.isCurrentSpouse = isCurrentSpouse;
    if (nt) {
      body.notes = nt;
    }
    return body;
  }, [
    personA,
    personB,
    relType,
    parentIsA,
    marriageDate,
    divorceDate,
    isCurrentSpouse,
    notes,
    t,
  ]);

  async function submit() {
    setSubmitError(null);
    let payload: RelationshipCreate;
    try {
      payload = buildPayload();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : String(e));
      return;
    }
    setIsSubmitting(true);
    try {
      const { warnings } = await createRelationship(payload);
      if (warnings.length > 0) {
        setWarnMessages(warnings);
        warnNavigateAfterClose.current = true;
        setWarnOpen(true);
      } else {
        toast.success(t("toast.relationshipCreated"));
        onSuccess();
      }
    } catch (e) {
      setSubmitError(errorMessage(e, t("common.unknownError")));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex max-w-xl flex-col gap-8">
      {submitError ? (
        <p
          className="md-typescale-body-medium m-0"
          style={{ color: "var(--md-sys-color-error)" }}
        >
          {submitError}
        </p>
      ) : null}

      <PersonPicker
        anchorId={anchorA}
        label={t("relationshipForm.step1")}
        person={personA}
        onChange={setPersonA}
        searchFieldLabel={t("relationshipForm.searchLabel")}
        searchingLabel={t("relationshipForm.searching")}
        changeLabel={t("relationshipForm.change")}
      />

      <fieldset className="m-0 border-0 p-0">
        <legend className="md-typescale-title-medium mb-3 text-[var(--md-sys-color-on-surface)]">
          {t("relationshipForm.step2legend")}
        </legend>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <md-radio
            name={`rel-type-${idBase}`}
            value="parent"
            checked={relType === "parent"}
            onInput={() => {
              setRelType("parent");
            }}
          >
            {t("relationshipForm.typeParentChild")}
          </md-radio>
          <md-radio
            name={`rel-type-${idBase}`}
            value="spouse"
            checked={relType === "spouse"}
            onInput={() => {
              setRelType("spouse");
            }}
          >
            {t("relationshipForm.typeSpouse")}
          </md-radio>
        </div>
      </fieldset>

      <PersonPicker
        anchorId={anchorB}
        label={t("relationshipForm.step3")}
        person={personB}
        onChange={setPersonB}
        searchFieldLabel={t("relationshipForm.searchLabel")}
        searchingLabel={t("relationshipForm.searching")}
        changeLabel={t("relationshipForm.change")}
      />

      {relType === "parent" && personA && personB ? (
        <fieldset className="m-0 border-0 p-0">
          <legend className="md-typescale-title-medium mb-3 text-[var(--md-sys-color-on-surface)]">
            {t("relationshipForm.whoParent")}
          </legend>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <md-radio
              name={`rel-parent-${idBase}`}
              value="a"
              checked={parentIsA}
              onInput={() => {
                setParentIsA(true);
              }}
            >
              {personA.firstName} {personA.lastName}
            </md-radio>
            <md-radio
              name={`rel-parent-${idBase}`}
              value="b"
              checked={!parentIsA}
              onInput={() => {
                setParentIsA(false);
              }}
            >
              {personB.firstName} {personB.lastName}
            </md-radio>
          </div>
        </fieldset>
      ) : null}

      {relType === "spouse" ? (
        <div className="flex max-w-md flex-col gap-4">
          <p className="md-typescale-title-medium m-0 text-[var(--md-sys-color-on-surface)]">
            {t("relationshipForm.marriageData")}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <MdTextField
              label={t("relationshipForm.marriageDate")}
              type="date"
              value={marriageDate}
              onValueChange={setMarriageDate}
            />
            <MdTextField
              label={t("relationshipForm.divorceDate")}
              type="date"
              value={divorceDate}
              onValueChange={setDivorceDate}
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2">
            <md-checkbox
              checked={isCurrentSpouse}
              onInput={(e) => {
                const el = e.currentTarget as unknown as { checked: boolean };
                setIsCurrentSpouse(Boolean(el.checked));
              }}
            />
            <span className="md-typescale-body-large">
              {t("relationshipForm.currentMarriage")}
            </span>
          </label>
          <MdTextField
            label={t("relationshipForm.notes")}
            value={notes}
            onValueChange={setNotes}
          />
        </div>
      ) : null}

      <div className="flex flex-wrap justify-end gap-2">
        <MdButton
          variant="outlined"
          type="button"
          disabled={isSubmitting}
          onClick={onCancel}
        >
          {tc("cancel")}
        </MdButton>
        <MdButton
          variant="filled"
          type="button"
          disabled={isSubmitting}
          onClick={() => {
            void submit();
          }}
        >
          {t("relationshipForm.submitCreate")}
        </MdButton>
      </div>

      <MdDialog
        open={warnOpen}
        onOpenChange={(open) => {
          setWarnOpen(open);
          if (!open && warnNavigateAfterClose.current) {
            warnNavigateAfterClose.current = false;
            setWarnMessages([]);
            toast.success(t("toast.relationshipCreated"));
            onSuccess();
          }
        }}
      >
        <div className="flex max-w-md flex-col gap-4 p-6">
          <div className="flex items-start gap-3">
            <md-icon className="material-symbols-outlined shrink-0 text-[var(--md-sys-color-error)]">
              warning
            </md-icon>
            <div>
              <h2 className="md-typescale-title-large m-0">
                {t("relationshipForm.warnTitle")}
              </h2>
              <p className="md-typescale-body-medium mt-2 text-[var(--md-sys-color-on-surface-variant)]">
                {t("relationshipForm.warnIntro")}
              </p>
              <ul className="md-typescale-body-medium mt-2 list-disc pl-5">
                {warnMessages.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex justify-end">
            <MdButton
              variant="filled"
              type="button"
              onClick={() => {
                setWarnOpen(false);
              }}
            >
              {t("relationshipForm.warnOk")}
            </MdButton>
          </div>
        </div>
      </MdDialog>
    </div>
  );
}
