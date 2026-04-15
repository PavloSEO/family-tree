import type { Person } from "@family-tree/shared";
import { HTTPError } from "ky";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { fetchPerson } from "../api/persons.js";
import { PersonForm } from "../components/person/PersonForm.js";

function loadErrorMessage(e: unknown): string {
  if (e instanceof HTTPError) {
    return e.message;
  }
  if (e instanceof Error) {
    return e.message;
  }
  return String(e);
}

export function AdminPersonEditPage() {
  const { id } = useParams<{ id: string }>();
  const isCreate = !id;
  const navigate = useNavigate();
  const { t } = useTranslation("admin");
  const { t: tc } = useTranslation("common");
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(!isCreate);
  const [loadError, setLoadError] = useState<string | null>(null);

  const goBack = useCallback(() => {
    navigate("/admin/persons");
  }, [navigate]);

  useEffect(() => {
    if (isCreate || !id) {
      setPerson(null);
      setLoading(false);
      setLoadError(null);
      return;
    }
    let cancelled = false;
    setPerson(null);
    setLoading(true);
    setLoadError(null);
    void (async () => {
      try {
        const p = await fetchPerson(id);
        if (!cancelled) {
          setPerson(p);
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(loadErrorMessage(e));
          setPerson(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isCreate]);

  const title = isCreate
    ? t("personEdit.createTitle")
    : person
      ? t("personEdit.editTitleWithName", {
          firstName: person.firstName,
          lastName: person.lastName,
        })
      : t("personEdit.editTitleFallback");

  return (
    <div className="p-6">
      <h1 className="md-typescale-headline-large m-0 mb-4">{title}</h1>

      {!isCreate && loading ? (
        <p className="md-typescale-body-large m-0">{tc("loading")}</p>
      ) : null}

      {!isCreate && loadError ? (
        <p
          className="md-typescale-body-medium m-0 mb-4"
          style={{ color: "var(--md-sys-color-error)" }}
        >
          {loadError}
        </p>
      ) : null}

      {!isCreate && !loading && !loadError && id && person ? (
        <PersonForm
          mode="edit"
          personId={id}
          person={person}
          onSuccess={goBack}
          onCancel={goBack}
        />
      ) : null}

      {isCreate ? (
        <PersonForm
          mode="create"
          onSuccess={goBack}
          onCancel={goBack}
        />
      ) : null}
    </div>
  );
}
