import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { personAvatarSrc } from "../../../lib/person-avatar-src.js";
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

  const avatarSrc = personAvatarSrc({
    mainPhoto: d.mainPhoto,
    gender: d.gender,
    dead: d.isDead,
    photoBroken: broken,
  });

  const flag = countryFlagEmoji(d.country);

  const borderColor = d.isRoot
    ? "var(--md-sys-color-primary)"
    : "var(--md-sys-color-outline-variant)";

  return (
    <div
      title={t("nodeClickHint")}
      className={`flex w-[176px] cursor-pointer flex-row items-center gap-2 rounded-[var(--md-sys-shape-corner-extra-large)] p-2 pr-3 ${
        d.isHighlighted
          ? "outline outline-2 outline-offset-2 outline-[var(--md-sys-color-tertiary)]"
          : ""
      }`}
      style={{
        background: "var(--md-sys-color-surface-container-low)",
        border: `1.5px dashed ${borderColor}`,
        opacity: d.isDead ? 0.75 : 1,
        ...(d.isRoot ? { boxShadow: treeRootNodeBoxShadow } : {}),
      }}
    >
      <Handle type="target" position={Position.Top} id="pt" className="!opacity-0" />
      <Handle type="source" position={Position.Bottom} id="pb" className="!opacity-0" />
      <Handle type="target" position={Position.Left} id="sl" className="!opacity-0" />
      <Handle type="source" position={Position.Right} id="sr" className="!opacity-0" />

      <img
        src={avatarSrc}
        alt=""
        className="h-9 w-9 shrink-0 rounded-full object-cover"
        style={d.isDead ? { filter: "grayscale(0.5) brightness(0.9)" } : undefined}
        onError={() => setBroken(true)}
      />

      <div className="min-w-0 flex-1">
        <p className="md-typescale-label-large m-0 truncate leading-tight text-[var(--md-sys-color-on-surface-variant)]">
          {d.firstName} {d.lastName}
        </p>
        <p className="md-typescale-label-small m-0 leading-tight text-[var(--md-sys-color-on-surface-variant)]">
          {formatYearsLabel(d.dateOfBirth, d.dateOfDeath)}
          {flag ? ` ${flag}` : ""}
        </p>
        <p
          className="md-typescale-label-small m-0 leading-tight"
          style={{ color: "var(--md-sys-color-outline)" }}
        >
          {t("externalBranchBadge")}
        </p>
      </div>
    </div>
  );
}
