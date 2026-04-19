// AdminPersonsScreen — Data table with search, filters, pagination
const PERSONS_DATA = [
  { id:'p1', firstName:'Ivan',    lastName:'Petrov',   gender:'male',   dateOfBirth:'1920-03-15', country:'RU', dateOfDeath:'1985-11-02' },
  { id:'p2', firstName:'Natalia', lastName:'Petrova',  gender:'female', dateOfBirth:'1925-07-22', country:'RU', dateOfDeath:'2001-06-14' },
  { id:'p3', firstName:'Sergei',  lastName:'Petrov',   gender:'male',   dateOfBirth:'1952-09-30', country:'RU', dateOfDeath:null },
  { id:'p4', firstName:'Olga',    lastName:'Petrova',  gender:'female', dateOfBirth:'1955-07-22', country:'RU', dateOfDeath:null },
  { id:'p5', firstName:'Alexei',  lastName:'Petrov',   gender:'male',   dateOfBirth:'1978-04-10', country:'RU', dateOfDeath:null },
  { id:'p6', firstName:'Marina',  lastName:'Sidorova', gender:'female', dateOfBirth:'1981-12-01', country:'RU', dateOfDeath:null },
  { id:'p7', firstName:'Dmitri',  lastName:'Petrov',   gender:'male',   dateOfBirth:'1983-08-25', country:'RU', dateOfDeath:null },
  { id:'p8', firstName:'Anna',    lastName:'Kuznetsova',gender:'female',dateOfBirth:'1948-02-11', country:'RU', dateOfDeath:'2019-03-30' },
];

function fmtDate(iso) {
  if (!iso) return '—';
  const [y,m,d] = iso.split('-'); return `${d}.${m}.${y}`;
}

function AdminPersonsScreen({ onToast, onEdit }) {
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [page, setPage] = React.useState(1);
  const [delTarget, setDelTarget] = React.useState(null);
  const [rows, setRows] = React.useState(PERSONS_DATA);
  const LIMIT = 5;

  const filtered = rows.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || `${p.firstName} ${p.lastName}`.toLowerCase().includes(q);
    const isDead = !!p.dateOfDeath;
    const matchStatus = statusFilter === 'all' || (statusFilter === 'dead' ? isDead : !isDead);
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / LIMIT));
  const paginated = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  function handleDelete(person) {
    setDelTarget(person);
  }
  function confirmDelete() {
    setRows(r => r.filter(p => p.id !== delTarget.id));
    setDelTarget(null);
    onToast && onToast(`${delTarget.firstName} ${delTarget.lastName} deleted`, 'success');
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ margin: '0 0 20px', fontSize: 32, fontWeight: 400, color: 'var(--md-sys-color-on-surface)' }}>Persons</h1>

      {/* Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16, alignItems: 'flex-end' }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Icon name="search" size={18} color="var(--md-sys-color-on-surface-variant)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search persons…"
            style={{
              border: '1px solid var(--md-sys-color-outline)', borderRadius: 'var(--md-sys-shape-corner-extra-small)',
              padding: '8px 12px 8px 34px', fontSize: 14, fontFamily: 'var(--md-ref-typeface-plain)',
              background: 'transparent', color: 'var(--md-sys-color-on-surface)', outline: 'none', width: 220,
            }}
          />
        </div>
        {/* Status filter */}
        <div style={{ position: 'relative' }}>
          <label style={{ position: 'absolute', top: -9, left: 10, background: 'var(--md-sys-color-background)', padding: '0 4px', fontSize: 12, color: 'var(--md-sys-color-primary)', fontWeight: 500 }}>Status</label>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            style={{
              border: '1px solid var(--md-sys-color-outline)', borderRadius: 'var(--md-sys-shape-corner-extra-small)',
              padding: '8px 32px 8px 12px', fontSize: 14, fontFamily: 'var(--md-ref-typeface-plain)',
              background: 'transparent', color: 'var(--md-sys-color-on-surface)', outline: 'none', minWidth: 140, cursor: 'pointer',
              appearance: 'none',
            }}
          >
            <option value="all">All</option>
            <option value="alive">Living</option>
            <option value="dead">Deceased</option>
          </select>
          <Icon name="expand_more" size={18} color="var(--md-sys-color-on-surface-variant)" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ borderRadius: 'var(--md-sys-shape-corner-medium)', overflow: 'hidden', border: '1px solid var(--md-sys-color-outline-variant)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--md-sys-color-surface-container)' }}>
              {['', 'First name', 'Last name', 'Gender', 'Birth date', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 13, fontWeight: 500, color: 'var(--md-sys-color-on-surface-variant)', borderBottom: '1px solid var(--md-sys-color-outline-variant)', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={7}>
                <EmptyState icon="badge" title="No persons found" description="Try adjusting your search or filters." />
              </td></tr>
            ) : paginated.map(p => {
              const isDead = !!p.dateOfDeath;
              const imgPlaceholder = isDead
                ? (p.gender === 'female' ? '../../assets/placeholder-female-dead.svg' : '../../assets/placeholder-male-dead.svg')
                : (p.gender === 'female' ? '../../assets/placeholder-female.svg' : '../../assets/placeholder-male.svg');
              return (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--md-sys-color-outline-variant)' }}>
                  <td style={{ padding: '10px 14px' }}>
                    <img src={imgPlaceholder} alt="" style={{ width: 36, height: 36, borderRadius: 4, objectFit: 'cover', display: 'block' }} />
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 14, color: 'var(--md-sys-color-on-surface)' }}>{p.firstName}</td>
                  <td style={{ padding: '10px 14px', fontSize: 14, color: 'var(--md-sys-color-on-surface)' }}>{p.lastName}</td>
                  <td style={{ padding: '10px 14px', fontSize: 14, color: 'var(--md-sys-color-on-surface-variant)' }}>{p.gender === 'male' ? 'M' : 'F'}</td>
                  <td style={{ padding: '10px 14px', fontSize: 14, color: 'var(--md-sys-color-on-surface)' }}>{fmtDate(p.dateOfBirth)}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13 }}>
                    <span style={{ color: isDead ? 'var(--md-sys-color-on-surface-variant)' : 'var(--md-sys-color-primary)', fontWeight: 500 }}>
                      {isDead ? 'Deceased' : 'Living'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', gap: 2 }}>
                      <IconBtn icon="edit" title="Edit" onClick={() => onEdit && onEdit(p)} />
                      <IconBtn icon="delete" title="Delete" onClick={() => handleDelete(p)} color="var(--md-sys-color-error)" />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', background: 'var(--md-sys-color-surface-container-lowest)', borderTop: '1px solid var(--md-sys-color-outline-variant)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <IconBtn icon="first_page" onClick={() => setPage(1)} />
            <IconBtn icon="chevron_left" onClick={() => setPage(p => Math.max(1, p - 1))} />
            <span style={{ fontSize: 13, color: 'var(--md-sys-color-on-surface-variant)', padding: '0 8px' }}>Page {page} of {totalPages}</span>
            <IconBtn icon="chevron_right" onClick={() => setPage(p => Math.min(totalPages, p + 1))} />
            <IconBtn icon="last_page" onClick={() => setPage(totalPages)} />
          </div>
          <span style={{ fontSize: 13, color: 'var(--md-sys-color-on-surface-variant)' }}>Total: {filtered.length}</span>
        </div>
      </div>

      {/* FAB */}
      <div style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 20 }}>
        <Fab icon="add" label="Add Person" onClick={() => onToast && onToast('Create person form would open here', 'success')} />
      </div>

      {/* Delete confirmation dialog */}
      {delTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.32)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--md-sys-color-surface)', borderRadius: 'var(--md-sys-shape-corner-extra-large)', padding: 24, maxWidth: 360, width: '90%', boxShadow: '0 8px 24px rgba(0,0,0,.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <Icon name="warning" size={24} color="var(--md-sys-color-error)" />
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 400, color: 'var(--md-sys-color-on-surface)' }}>Delete person?</h2>
            </div>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: 'var(--md-sys-color-on-surface-variant)' }}>
              This will permanently delete <strong>{delTarget.firstName} {delTarget.lastName}</strong>. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Btn variant="text" onClick={() => setDelTarget(null)}>Cancel</Btn>
              <Btn variant="error" onClick={confirmDelete}>Delete</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
Object.assign(window, { AdminPersonsScreen });
