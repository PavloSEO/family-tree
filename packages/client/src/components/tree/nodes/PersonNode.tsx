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

export function PersonNode(props: NodeProps) {
  const { t } = useTranslation("tree");
  const d = props.data as TreePersonNodeData;
  const [broken, setBroken] = useState(false);

  const avatarSrc = personAvatarSrc({
    mainPhoto: d.mainPhoto,
    gender: d.gender,
    dead: false,
    photoBroken: broken,
  });

  const flag = countryFlagEmoji(d.country);
  const isFemale = d.gender === "female";

  /* Root gets primary border + elevation; others get outline-variant */
  const borderColor = d.isRoot
    ? "var(--md-sys-color-primary)"
    : isFemale
      ? "var(--md-sys-color-tertiary)"
      : "var(--md-sys-color-outline-variant)";

  /* Subtle tint on container for gender differentiation */
  const bgColor = d.isRoot
    ? "var(--md-sys-color-primary-container)"
    : isFemale
      ? "var(--md-sys-color-tertiary-container)"
      : "var(--md-sys-color-surface)";

  const nameColor = d.isRoot
    ? "var(--md-sys-color-on-primary-container)"
    : "var(--md-sys-color-on-surface)";

  return (
    <div
      title={t("nodeClickHint")}
      className={`flex w-[176px] cursor-pointer flex-row items-center gap-2 rounded-[var(--md-sys-shape-corner-extra-large)] p-2 pr-3 ${
        d.isHighlighted
          ? "outline outline-2 outline-offset-2 outline-[var(--md-sys-color-tertiary)]"
          : ""
      }`}
      style={{
        background: bgColor,
        border: `${d.isRoot ? "2px" : "1.5px"} solid ${borderColor}`,
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
        onError={() => setBroken(true)}
      />

      <div className="min-w-0 flex-1">
        <p
          className="md-typescale-label-large m-0 truncate leading-tight"
          style={{ color: nameColor }}
        >
          {d.firstName} {d.lastName}
        </p>
        <p className="md-typescale-label-small m-0 leading-tight text-[var(--md-sys-color-on-surface-variant)]">
          {formatYearsLabel(d.dateOfBirth, d.dateOfDeath)}
          {flag ? ` ${flag}` : ""}
        </p>
      </div>
    </div>
  );
}
