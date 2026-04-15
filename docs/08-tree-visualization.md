# 08 — Tree visualization

---

## Stack

| Library | Role |
|-----------|------|
| @xyflow/react 12 | Render nodes and edges, zoom, pan, minimap, controls |
| elkjs | Automatic layout (node positions) |
| packages/shared/tree-compute.ts | BFS, relationship label computation |

## Nodes

Three custom node types:

### PersonNode (living)

```
+------------------+
|   [ PHOTO ]      |   <- round avatar 48px, color
|   First name     |   <- md-typescale-label-large
|   Last name      |
|   (1985-)        |   <- md-typescale-label-small, --md-sys-color-on-surface-variant
|   [flag]         |   <- country flag emoji (if set)
+------------------+

Border: 2px solid, --md-sys-color-outline-variant
Background: --md-sys-color-surface
Radius: --md-sys-shape-corner-large (16px)
```

Root node (tree anchor): border `--md-sys-color-primary`, elevation-2 shadow.

### DeadPersonNode

Same as PersonNode, but:
- Photo: CSS `filter: grayscale(1)`
- Border: `--md-sys-color-outline` (muted)
- Years: `(1945-2010)`

### ExternalNode (external branch)

Same as PersonNode, but:
- Border: `border-style: dashed`
- Background: `--md-sys-color-surface-container-low` (slightly darker)

## Edges

| Type | Visual |
|-----|--------|
| parent -> child | Solid line, 2px, `--md-sys-color-outline` |
| spouse | Double line (two parallel paths, gap 4px), `--md-sys-color-primary` |
| external branch | Dashed, `strokeDasharray: "6,4"`, `--md-sys-color-outline-variant` |

## ELK layout

Configuration:
```typescript
{
  "elk.algorithm": "layered",
  "elk.direction": "DOWN",                              // ancestors top, descendants bottom
  "elk.layered.spacing.nodeNodeBetweenLayers": "120",   // spacing between generations
  "elk.spacing.nodeNode": "50",                         // spacing within a layer
  "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
  "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP"
}
```

Node size: 160x120px.

### Grouping couples (spouse)

ELK does not group couples automatically. Solution: before ELK, create a compound node per couple:

```typescript
// Couple = compound node containing both spouses
{
  id: "couple-uuid",
  layoutOptions: {
    "elk.direction": "RIGHT",              // spouses horizontal
    "elk.spacing.nodeNode": "20",        // close together
  },
  children: [
    { id: "husband-uuid", width: 160, height: 120 },
    { id: "wife-uuid", width: 160, height: 120 }
  ]
}
```

Children of the couple attach to the compound node.

## View modes

| Mode | Algorithm |
|-------|---------|
| Full tree | BFS up `depthUp` + BFS down `depthDown` from root |
| Ancestors only | BFS up, no descendants |
| Descendants only | BFS down, no ancestors |
| Direct line | parent->parent only (paternal line by default), no siblings |
| Family group | root + spouse + children + parents (1 level) |
| Paternal line | parent links with gender=male upward |
| Maternal line | parent links with gender=female upward |

UI: `md-outlined-segmented-button-set` (labs) with 7 buttons. On small screens — `md-outlined-select`.

## Filters

| Filter | Component | Logic |
|--------|----------|--------|
| Country | `md-outlined-select` | Only nodes with given `country` |
| Status | `md-outlined-select` (All / Living / Deceased) | Filter by `dateOfDeath` |
| Branch | `md-outlined-select` (All / Paternal / Maternal) | Switches mode |
| Search | `md-outlined-text-field` | Highlight found node + fitView |

## Navigation

- Node click: `navigate('/person/' + id)` — open card
- Double-click: rebuild tree with this node as root
- Zoom: mouse wheel / touch pinch
- Pan: drag background
- Minimap: bottom-right

## External branches

Collapsed by default. Only spouse node + “+” icon (`md-icon-button`, Material Symbol `unfold_more`). On click — animated expand of spouse ancestors up to `externalDepth`.

## BFS — relationship labels

File: `packages/shared/src/tree-compute.ts`

```typescript
// Step in path
type PathStep = {
  type: "parent" | "spouse";
  direction: "up" | "down" | "lateral";
  personId: string;
};

// BFS from fromId to toId
function findShortestPath(fromId, toId, relationships): PathStep[] | null

// Path pattern -> display label
function getRelationshipLabel(steps, fromGender, toGender): string
```

### Path patterns

English names below describe the relationship logic. Runtime strings may still follow the Russian product default until kinship is fully i18n’d — see **`to-do/english-migration-notes.md`**.

| Pattern | Male | Female |
|---------|---------|---------|
| U | Father | Mother |
| D | Son | Daughter |
| S | Husband | Wife |
| UU | Grandfather | Grandmother |
| DD | Grandson | Granddaughter |
| UUU | Great-grandfather | Great-grandmother |
| DDD | Great-great-grandson | Great-great-granddaughter |
| UD | Brother | Sister |
| UUD | Uncle | Aunt |
| UDD | Nephew | Niece |
| UUDD | First cousin (male) | First cousin (female) |
| UUUDDD | Second cousin (male) | Second cousin (female) |
| SU | Father-in-law (wife’s / husband’s side per gender) | Mother-in-law (wife’s / husband’s side per gender) |
| DS | Son-in-law | Daughter-in-law |
| SUD | Brother-in-law (spouse’s sibling’s husband) | Sister-in-law (spouse’s sibling’s wife) |

`U` = parent up, `D` = parent down, `S` = spouse.

Path longer than 6 steps or unknown pattern: distant relative (wording localized in app).

### In-law refinement (SU)

For SU (spouse’s parents) the label depends on the source person’s gender (wife’s parents vs husband’s parents). Implementation: `getRelationshipLabel(steps, fromGender, toGender)` takes both genders.
