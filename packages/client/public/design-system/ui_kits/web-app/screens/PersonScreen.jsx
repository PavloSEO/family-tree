// PersonScreen — Full person profile card
const SAMPLE_PERSON = {
  id: 'p4',
  firstName: 'Olga', patronymic: 'Ivanovna', lastName: 'Petrova', maidenName: 'Sidorova',
  gender: 'female', dead: false,
  dateOfBirth: '1955-07-22', dateOfDeath: null,
  birthPlace: 'Leningrad, USSR', currentLocation: 'Moscow, Russia',
  bio: 'Retired school teacher. Loves gardening and reading classic literature. Proud grandmother of three.',
  occupation: 'Schoolteacher (retired)',
  hobbies: ['Gardening', 'Reading', 'Cooking', 'Knitting'],
  country: 'RU',
  phone: '+7 495 123-45-67',
  email: 'olga@example.com',
};

const RELATIVES = [
  { personId: 'p3', displayName: 'Sergei Petrov',  relationshipLabel: 'Husband' },
  { personId: 'p5', displayName: 'Alexei Petrov',  relationshipLabel: 'Son' },
  { personId: 'p7', displayName: 'Dmitri Petrov',  relationshipLabel: 'Son' },
  { personId: 'p1', displayName: 'Ivan Petrov',    relationshipLabel: 'Father' },
  { personId: 'p2', displayName: 'Natalia Petrova', relationshipLabel: 'Mother' },
];

function formatDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

function PersonScreen({ onBack }) {
  const p = SAMPLE_PERSON;
  const imgSrc = p.dead ? '../../assets/placeholder-female-dead.svg' : '../../assets/placeholder-female.svg';

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
      {/* Actions row */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', marginBottom: 12 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--md-sys-color-primary)', fontSize: 14, fontWeight: 500, fontFamily: 'var(--md-ref-typeface-plain)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon name="arrow_back" size={18} /> Back to Tree
        </button>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--md-sys-color-primary)', fontSize: 14, fontWeight: 500, fontFamily: 'var(--md-ref-typeface-plain)' }}>
          Edit
        </button>
      </div>

      {/* Header card */}
      <div style={{ background: 'var(--md-sys-color-surface-container-low)', borderRadius: 'var(--md-sys-shape-corner-medium)', boxShadow: '0 1px 2px rgba(0,0,0,.12)', padding: 24, marginBottom: 16, display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <img src={imgSrc} alt="" style={{ width: 112, height: 112, borderRadius: 'var(--md-sys-shape-corner-medium)', objectFit: 'cover', flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <h1 style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 400, color: 'var(--md-sys-color-on-surface)' }}>
            {p.firstName} {p.patronymic} {p.lastName}
            {p.maidenName && <span style={{ fontSize: 16, fontWeight: 400, color: 'var(--md-sys-color-on-surface-variant)', marginLeft: 8 }}>(née {p.maidenName})</span>}
          </h1>
          <p style={{ margin: '0 0 4px', fontSize: 16, color: 'var(--md-sys-color-on-surface-variant)' }}>
            Gender: {p.gender === 'female' ? 'Female' : 'Male'}
          </p>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--md-sys-color-on-surface-variant)' }}>
            🇷🇺 Russia
          </p>
        </div>
      </div>

      {/* About */}
      <SectionCard title="About" icon="person">
        <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'minmax(8rem,auto) 1fr', gap: '10px 16px' }}>
          {[
            ['Date of birth', formatDate(p.dateOfBirth)],
            ['Birth place',   p.birthPlace],
            ['Location',      p.currentLocation],
            ['Bio',           p.bio],
          ].map(([k, v]) => v ? [
            <dt key={k+'-k'} style={{ margin: 0, fontSize: 13, fontWeight: 500, color: 'var(--md-sys-color-on-surface-variant)' }}>{k}</dt>,
            <dd key={k+'-v'} style={{ margin: 0, fontSize: 14, color: 'var(--md-sys-color-on-surface)', whiteSpace: 'pre-wrap' }}>{v}</dd>,
          ] : null)}
        </dl>
      </SectionCard>

      {/* Relatives */}
      <SectionCard title="Relatives" icon="family_restroom">
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 0 }}>
          {RELATIVES.map(r => (
            <li key={r.personId} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              padding: '8px 0', borderBottom: '1px solid var(--md-sys-color-outline-variant)',
            }}>
              <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--md-sys-color-primary)', cursor: 'pointer' }}>{r.displayName}</span>
              <span style={{ fontSize: 13, color: 'var(--md-sys-color-on-surface-variant)' }}>{r.relationshipLabel}</span>
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* Work & Hobbies */}
      <SectionCard title="Work & Hobbies" icon="work">
        <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 500, color: 'var(--md-sys-color-on-surface-variant)' }}>OCCUPATION</p>
        <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--md-sys-color-on-surface)' }}>{p.occupation}</p>
        <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 500, color: 'var(--md-sys-color-on-surface-variant)' }}>HOBBIES</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {p.hobbies.map(h => <Chip key={h} label={h} />)}
        </div>
      </SectionCard>

      {/* Contacts */}
      <SectionCard title="Contacts" icon="contact_mail">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="phone" size={20} color="var(--md-sys-color-on-surface-variant)" />
            <span style={{ fontSize: 14, color: 'var(--md-sys-color-on-surface)' }}>{p.phone}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="mail" size={20} color="var(--md-sys-color-on-surface-variant)" />
            <span style={{ fontSize: 14, color: 'var(--md-sys-color-primary)' }}>{p.email}</span>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
Object.assign(window, { PersonScreen });
