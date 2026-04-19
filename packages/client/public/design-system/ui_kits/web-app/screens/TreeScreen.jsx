// TreeScreen v2 — proper genealogical layout
// Couples side-by-side, spouse lines, children bar, photo avatars

const NW = 162, NH = 60; // node width/height

const PEOPLE = {
  ivan:   { id:'ivan',   firstName:'Иван',    lastName:'Петров',   gender:'male',   dead:true,  years:'1905–1972' },
  anna:   { id:'anna',   firstName:'Анна',    lastName:'Петрова',  gender:'female', dead:true,  years:'1908–1980' },
  pyotr:  { id:'pyotr',  firstName:'Пётр',    lastName:'Сидоров',  gender:'male',   dead:true,  years:'1902–1968' },
  maria:  { id:'maria',  firstName:'Мария',   lastName:'Сидорова', gender:'female', dead:true,  years:'1910–1990' },
  sergei: { id:'sergei', firstName:'Сергей',  lastName:'Петров',   gender:'male',   dead:false, years:'1935–2001' },
  olga:   { id:'olga',   firstName:'Ольга',   lastName:'Петрова',  gender:'female', dead:false, years:'1938',     isRoot:true },
  alexei: { id:'alexei', firstName:'Алексей', lastName:'Петров',   gender:'male',   dead:false, years:'1962' },
  marina: { id:'marina', firstName:'Марина',  lastName:'Петрова',  gender:'female', dead:false, years:'1965' },
  dmitri: { id:'dmitri', firstName:'Дмитрий', lastName:'Петров',   gender:'male',   dead:false, years:'1970' },
};

// Node positions (top-left corner)
const POS = {
  ivan:   { x: 20,  y: 30  },
  anna:   { x: 200, y: 30  },
  pyotr:  { x: 400, y: 30  },
  maria:  { x: 580, y: 30  },
  sergei: { x: 100, y: 190 },
  olga:   { x: 480, y: 190 },
  alexei: { x: 20,  y: 370 },
  marina: { x: 220, y: 370 },
  dmitri: { x: 420, y: 370 },
};

const CANVAS_W = 780, CANVAS_H = 480;

// Helper: center of node bottom/top/left/right
function nc(id, side = 'bottom') {
  const p = POS[id]; if (!p) return {x:0,y:0};
  if (side === 'bottom') return { x: p.x + NW/2, y: p.y + NH };
  if (side === 'top')    return { x: p.x + NW/2, y: p.y };
  if (side === 'left')   return { x: p.x,         y: p.y + NH/2 };
  if (side === 'right')  return { x: p.x + NW,    y: p.y + NH/2 };
  return { x: p.x + NW/2, y: p.y + NH/2 };
}

function TreeNodeDiv({ person, selected, highlighted, onClick }) {
  const pos = POS[person.id];
  if (!pos) return null;
  const isMale = person.gender === 'male';
  const isDead = person.dead;
  const isRoot = person.isRoot;

  const imgPlaceholder = isDead
    ? (isMale ? '../../assets/placeholder-male-dead.svg' : '../../assets/placeholder-female-dead.svg')
    : (isMale ? '../../assets/placeholder-male.svg' : '../../assets/placeholder-female.svg');

  const borderColor = isRoot ? 'var(--md-sys-color-primary)'
    : selected ? (isMale ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-tertiary)')
    : isDead ? 'var(--md-sys-color-outline)'
    : isMale ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-tertiary)';

  const bgColor = isRoot
    ? (isMale ? 'var(--md-sys-color-primary-container)' : 'var(--md-sys-color-tertiary-container)')
    : selected
      ? (isMale ? 'var(--md-sys-color-primary-container)' : 'var(--md-sys-color-tertiary-container)')
      : isDead ? 'var(--md-sys-color-surface-container)' : 'var(--md-sys-color-surface)';

  const nameColor = (isRoot || selected)
    ? (isMale ? 'var(--md-sys-color-on-primary-container)' : 'var(--md-sys-color-on-tertiary-container)')
    : isDead ? 'var(--md-sys-color-on-surface-variant)' : 'var(--md-sys-color-on-surface)';

  return (
    <div
      onClick={() => onClick(person)}
      style={{
        position: 'absolute', left: pos.x, top: pos.y,
        width: NW, height: NH, cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 8,
        borderRadius: 28, padding: '0 12px 0 8px',
        background: bgColor,
        border: `${isRoot ? 2.5 : 1.5}px solid ${borderColor}`,
        boxShadow: isRoot
          ? '0 2px 8px rgba(0,0,0,.18), 0 1px 3px rgba(0,0,0,.12)'
          : selected ? '0 1px 4px rgba(0,0,0,.15)' : 'none',
        outline: highlighted ? '2px solid var(--md-sys-color-tertiary)' : undefined,
        outlineOffset: highlighted ? 3 : undefined,
        opacity: isDead ? 0.8 : 1,
        transition: 'box-shadow .15s, background .15s',
        userSelect: 'none',
      }}
    >
      {/* Avatar */}
      <img
        src={imgPlaceholder}
        alt=""
        style={{
          width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', flexShrink: 0,
          filter: isDead ? 'grayscale(0.55) brightness(0.88)' : undefined,
          background: isMale ? 'var(--md-sys-color-primary-container)' : 'var(--md-sys-color-tertiary-container)',
        }}
      />
      {/* Text */}
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: nameColor, lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {person.firstName} {person.lastName}
        </div>
        <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.3 }}>
          {person.years}
        </div>
      </div>
      {/* Root star */}
      {isRoot && (
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--md-sys-color-primary)', flexShrink: 0 }} />
      )}
    </div>
  );
}

function TreeEdgesSVG() {
  // Spouse midpoints
  const ivanAnnaMid   = (nc('ivan','right').x + nc('anna','left').x) / 2;
  const pyotrMariaMid = (nc('pyotr','right').x + nc('maria','left').x) / 2;
  const sergeiOlgaMid = (nc('sergei','right').x + nc('olga','left').x) / 2;
  const y0mid = POS.ivan.y + NH / 2;
  const y1mid = POS.sergei.y + NH / 2;

  // Children bar y
  const childBarY = POS.alexei.y - 26;
  const parentDropY = nc('sergei','bottom').y + 20;
  const coupleDropX = sergeiOlgaMid;

  return (
    <svg
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', overflow: 'visible' }}
      width={CANVAS_W} height={CANVAS_H}
    >
      {/* ── Row 0 spouse lines ── */}
      {/* Ivan ═ Anna */}
      <line x1={nc('ivan','right').x} y1={y0mid} x2={nc('anna','left').x} y2={y0mid}
        stroke="var(--md-sys-color-tertiary)" strokeWidth="2" strokeDasharray="5 3" />
      <text x={ivanAnnaMid} y={y0mid - 5} textAnchor="middle"
        style={{ fontSize: 9, fill: 'var(--md-sys-color-tertiary)', fontFamily: 'var(--md-ref-typeface-plain)', fontWeight: 500 }}>
        супруги
      </text>

      {/* Pyotr ═ Maria */}
      <line x1={nc('pyotr','right').x} y1={y0mid} x2={nc('maria','left').x} y2={y0mid}
        stroke="var(--md-sys-color-tertiary)" strokeWidth="2" strokeDasharray="5 3" />
      <text x={pyotrMariaMid} y={y0mid - 5} textAnchor="middle"
        style={{ fontSize: 9, fill: 'var(--md-sys-color-tertiary)', fontFamily: 'var(--md-ref-typeface-plain)', fontWeight: 500 }}>
        супруги
      </text>

      {/* ── Row 0 → Row 1 (parents → children) ── */}
      {/* Ivan+Anna → Sergei */}
      <line x1={ivanAnnaMid} y1={nc('ivan','bottom').y} x2={ivanAnnaMid} y2={POS.sergei.y - 20}
        stroke="var(--md-sys-color-outline)" strokeWidth="1.5" />
      <line x1={ivanAnnaMid} y1={POS.sergei.y - 20} x2={nc('sergei','top').x} y2={POS.sergei.y - 20}
        stroke="var(--md-sys-color-outline)" strokeWidth="1.5" />
      <line x1={nc('sergei','top').x} y1={POS.sergei.y - 20} x2={nc('sergei','top').x} y2={POS.sergei.y}
        stroke="var(--md-sys-color-outline)" strokeWidth="1.5" />

      {/* Pyotr+Maria → Olga */}
      <line x1={pyotrMariaMid} y1={nc('pyotr','bottom').y} x2={pyotrMariaMid} y2={POS.olga.y - 20}
        stroke="var(--md-sys-color-outline)" strokeWidth="1.5" />
      <line x1={pyotrMariaMid} y1={POS.olga.y - 20} x2={nc('olga','top').x} y2={POS.olga.y - 20}
        stroke="var(--md-sys-color-outline)" strokeWidth="1.5" />
      <line x1={nc('olga','top').x} y1={POS.olga.y - 20} x2={nc('olga','top').x} y2={POS.olga.y}
        stroke="var(--md-sys-color-outline)" strokeWidth="1.5" />

      {/* ── Row 1 spouse line: Sergei ═ Olga ── */}
      <line x1={nc('sergei','right').x} y1={y1mid} x2={nc('olga','left').x} y2={y1mid}
        stroke="var(--md-sys-color-tertiary)" strokeWidth="2.5" strokeDasharray="6 3" />
      <text x={sergeiOlgaMid} y={y1mid - 6} textAnchor="middle"
        style={{ fontSize: 9, fill: 'var(--md-sys-color-tertiary)', fontFamily: 'var(--md-ref-typeface-plain)', fontWeight: 500 }}>
        супруги
      </text>

      {/* ── Row 1 → Row 2 (Sergei+Olga → children) ── */}
      {/* Drop from couple midpoint */}
      <line x1={coupleDropX} y1={y1mid + NH/2 - 2} x2={coupleDropX} y2={parentDropY}
        stroke="var(--md-sys-color-outline)" strokeWidth="1.5" />
      {/* Horizontal children bar */}
      <line
        x1={nc('alexei','top').x} y1={childBarY}
        x2={nc('dmitri','top').x} y2={childBarY}
        stroke="var(--md-sys-color-outline)" strokeWidth="1.5"
      />
      {/* Drop from bar to couple midpoint */}
      <line x1={coupleDropX} y1={parentDropY} x2={coupleDropX} y2={childBarY}
        stroke="var(--md-sys-color-outline)" strokeWidth="1.5" />
      {/* Drops to each child */}
      {['alexei','marina','dmitri'].map(id => (
        <line key={id}
          x1={nc(id,'top').x} y1={childBarY}
          x2={nc(id,'top').x} y2={POS[id].y}
          stroke="var(--md-sys-color-outline)" strokeWidth="1.5"
        />
      ))}

      {/* Sibling label */}
      <text x={nc('marina','top').x} y={childBarY - 5} textAnchor="middle"
        style={{ fontSize: 9, fill: 'var(--md-sys-color-on-surface-variant)', fontFamily: 'var(--md-ref-typeface-plain)' }}>
        дети
      </text>
    </svg>
  );
}

const RELATION_LABELS = {
  ivan:   'Дед (по отцу)',   anna:   'Баба (по отцу)',
  pyotr:  'Дед (по матери)', maria:  'Баба (по матери)',
  sergei: 'Отец',            olga:   'Мать (корень)',
  alexei: 'Сын',             marina: 'Дочь',             dmitri: 'Сын',
};

function TreeScreen({ onPersonClick }) {
  const [selected, setSelected] = React.useState('olga');
  const [search, setSearch]     = React.useState('');
  const [mode, setMode]         = React.useState('Полное дерево');
  const modes = ['Полное дерево', 'Предки', 'Потомки', 'Прямая линия'];

  const searchMatch = search.trim()
    ? Object.values(PEOPLE).find(p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase())
      )?.id ?? null
    : null;

  const selectedPerson = PEOPLE[selected];

  return (
    <div style={{ background: 'var(--md-sys-color-background)', minHeight: 'calc(100vh - 49px)', display: 'flex', flexDirection: 'column' }}>

      {/* ── Controls bar ── */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 8, padding: '10px 16px', alignItems: 'center',
        borderBottom: '1px solid var(--md-sys-color-outline-variant)',
        background: 'var(--md-sys-color-surface-container-lowest)',
      }}>
        <div style={{ display: 'flex', border: '1px solid var(--md-sys-color-outline)', borderRadius: 999, overflow: 'hidden' }}>
          {modes.map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              padding: '6px 14px', border: 'none', cursor: 'pointer',
              background: mode === m ? 'var(--md-sys-color-secondary-container)' : 'transparent',
              color: mode === m ? 'var(--md-sys-color-on-secondary-container)' : 'var(--md-sys-color-on-surface-variant)',
              fontFamily: 'var(--md-ref-typeface-plain)', fontSize: 12, fontWeight: 500,
            }}>{m}</button>
          ))}
        </div>
        <div style={{ position: 'relative' }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="var(--md-sys-color-on-surface-variant)"
            style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск…"
            style={{
              border: '1px solid var(--md-sys-color-outline)', borderRadius: 999,
              padding: '7px 12px 7px 32px', fontSize: 13,
              fontFamily: 'var(--md-ref-typeface-plain)', background: 'transparent',
              color: 'var(--md-sys-color-on-surface)', outline: 'none', width: 180,
            }}
          />
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 12, marginLeft: 'auto', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--md-sys-color-on-surface-variant)' }}>
            <svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" stroke="var(--md-sys-color-tertiary)" strokeWidth="2" strokeDasharray="5 3"/></svg>
            супруги
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--md-sys-color-on-surface-variant)' }}>
            <svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" stroke="var(--md-sys-color-outline)" strokeWidth="1.5"/></svg>
            родитель/ребёнок
          </div>
        </div>
      </div>

      {/* ── Canvas ── */}
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 16px 16px', position: 'relative' }}>
        <div style={{ position: 'relative', width: CANVAS_W, height: CANVAS_H, margin: '0 auto' }}>
          <TreeEdgesSVG />
          {Object.values(PEOPLE).map(p => (
            <TreeNodeDiv
              key={p.id}
              person={p}
              selected={selected === p.id}
              highlighted={searchMatch === p.id}
              onClick={person => { setSelected(person.id); onPersonClick && onPersonClick(person); }}
            />
          ))}
        </div>
      </div>

      {/* ── Info panel ── */}
      {selectedPerson && (
        <div style={{
          borderTop: '1px solid var(--md-sys-color-outline-variant)',
          background: 'var(--md-sys-color-surface-container-lowest)',
          padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <img
            src={selectedPerson.dead
              ? (selectedPerson.gender==='male' ? '../../assets/placeholder-male-dead.svg' : '../../assets/placeholder-female-dead.svg')
              : (selectedPerson.gender==='male' ? '../../assets/placeholder-male.svg' : '../../assets/placeholder-female.svg')}
            alt=""
            style={{ width:44, height:44, borderRadius:'50%', objectFit:'cover',
              filter: selectedPerson.dead ? 'grayscale(0.5)' : undefined,
              background: selectedPerson.gender==='male' ? 'var(--md-sys-color-primary-container)' : 'var(--md-sys-color-tertiary-container)',
            }}
          />
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--md-sys-color-on-surface)' }}>
              {selectedPerson.firstName} {selectedPerson.lastName}
            </div>
            <div style={{ fontSize: 12, color: 'var(--md-sys-color-on-surface-variant)', marginTop: 1 }}>
              {selectedPerson.years}
              {RELATION_LABELS[selected] ? ` · ${RELATION_LABELS[selected]}` : ''}
            </div>
          </div>
          <span style={{
            marginLeft: 8, padding: '2px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 500,
            background: selectedPerson.dead ? 'var(--md-sys-color-surface-container-highest)' : 'var(--md-sys-color-primary-container)',
            color: selectedPerson.dead ? 'var(--md-sys-color-on-surface-variant)' : 'var(--md-sys-color-on-primary-container)',
          }}>
            {selectedPerson.dead ? 'Умер(ла)' : 'Живёт'}
          </span>
          <button
            onClick={() => onPersonClick && onPersonClick(selectedPerson)}
            style={{
              marginLeft: 'auto', border: 'none', background: 'transparent',
              color: 'var(--md-sys-color-primary)', cursor: 'pointer',
              fontSize: 13, fontWeight: 500, fontFamily: 'var(--md-ref-typeface-plain)',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            Открыть профиль
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
Object.assign(window, { TreeScreen });
