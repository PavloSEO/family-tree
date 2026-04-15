import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { RelationshipForm } from "../components/relationship/RelationshipForm.js";

export function AdminRelationshipNewPage() {
  const { t } = useTranslation("admin");
  const navigate = useNavigate();
  const back = () => {
    navigate("/admin/relationships");
  };

  return (
    <div className="p-6">
      <h1 className="md-typescale-headline-large m-0 mb-6">
        {t("relationshipNew.title")}
      </h1>
      <RelationshipForm onSuccess={back} onCancel={back} />
    </div>
  );
}
