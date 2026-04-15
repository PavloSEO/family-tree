import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { mainPhotoSrc } from "../../../lib/person-main-photo-src.js";
import type { TreePersonNodeData } from "../tree-node-data.js";
import {
  countryFlagEmoji,
  formatYearsLabel,
  treeRootNodeBoxShadow,
} from "../tree-node-helpers.js";

export function ExternalNode(props: NodeProps) {
  const { t } = useTranslation("tree");
  const d = props.data as TreePersonNodeData;
  const [broken, setBroken] = useState(false);
  const src = mainPhotoSrc(d.mainPhoto);
  const flag = countryFlagEmoji(d.country);
  const border = d.isRoot
    ? "2px solid var(--md-sys-color-primary)"
    : "2px dashed var(--md-sys-color-outline)";
  return (
    <div
      title={t("nodeClickHint")}
      className={`flex w-[160px] cursor-pointer flex-col gap-1 rounded-[var(--md-sys-shape-corner-large)] bg-[var(--md-sys-color-surface-container-low)] p-2 ${d.isHighlighted ? "outline outline-2 outline-offset-2 outline-[var(--md-sys-color-tertiary)]" : ""}`}
      style={{
        border,
        ...(d.isRoot ? { boxShadow: treeRootNodeBoxShadow } : {}),
      }}
    >
      <Handle type="target" position={Position.Top} id="pt" className="!opacity-0" />
      <Handle type="source" position={Position.Bottom} id="pb" className="!opacity-0" />
      <Handle type="target" position={Position.Left} id="sl" className="!opacity-0" />
      <Handle type="source" position={Position.Right} id="sr" className="!opacity-0" />

      <div className="flex justify-center">
        {!src || broken ? (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--md-sys-color-surface-container-high)]">
            <md-icon className="material-symbols-outlined text-2xl text-[var(--md-sys-color-on-surface-variant)]">
              person
            </md-icon>
          </div>
        ) : (
          <img
            src={src}
            alt=""
            className="h-12 w-12 rounded-full object-cover"
            onError={() => {
              setBroken(true);
            }}
          />
        )}
      </div>
      <p className="md-typescale-label-large m-0 text-center leading-tight text-[var(--md-sys-color-on-surface)]">
        {d.firstName}
      </p>
      <p className="md-typescale-label-large m-0 text-center leading-tight text-[var(--md-sys-color-on-surface)]">
        {d.lastName}
      </p>
      <p className="md-typescale-label-small m-0 text-center text-[var(--md-sys-color-on-surface-variant)]">
        {formatYearsLabel(d.dateOfBirth, d.dateOfDeath)}
      </p>
      {flag ? (
        <p className="md-typescale-body-medium m-0 text-center" aria-hidden>
          {flag}
        </p>
      ) : null}
      <p className="md-typescale-label-small m-0 text-center text-[var(--md-sys-color-on-surface-variant)]">
        {t("externalBranchBadge")}
      </p>
    </div>
  );
}
