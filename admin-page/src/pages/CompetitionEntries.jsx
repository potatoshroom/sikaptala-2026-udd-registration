import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { COMPETITIONS, ENTRIES } from '../data/mock'
import { Sidebar } from './Dashboard'

export default function CompetitionEntries() {
  const { id } = useParams()
  const navigate = useNavigate()
  const competition = COMPETITIONS.find((c) => c.id === id)
  const entries = ENTRIES[id] ?? []

  const [search, setSearch] = useState('')
  const [filterYear, setFilterYear] = useState('')
  const [filterProgram, setFilterProgram] = useState('')
  const [selected, setSelected] = useState(null)

  if (!competition) {
    return <div className="loading-screen">Competition not found.</div>
  }

  function handleSignOut() {
    sessionStorage.removeItem('admin_auth')
    navigate('/login')
  }

  const filtered = entries.filter((entry) => {
    const searchTarget = competition.type === 'team'
      ? `${entry.teamName} ${entry.leader.name} ${entry.leader.studentId}`.toLowerCase()
      : `${entry.name} ${entry.studentId} ${entry.email}`.toLowerCase()

    const leaderOrEntry = competition.type === 'team' ? entry.leader : entry
    const matchesSearch = !search || searchTarget.includes(search.toLowerCase())
    const matchesYear = !filterYear || leaderOrEntry.yearLevel === filterYear
    const matchesProgram = !filterProgram || leaderOrEntry.program === filterProgram
    return matchesSearch && matchesYear && matchesProgram
  })

  return (
    <div className="admin-layout">
      <Sidebar onSignOut={handleSignOut} activeId={id} />

      <div className="admin-main">
        <div className="admin-topbar">
          <div>
            <button className="admin-topbar__back" onClick={() => navigate('/')}>
              ← Dashboard
            </button>
            <h1 className="admin-topbar__title" style={{ color: competition.color }}>
              {competition.name}
            </h1>
            <p className="admin-topbar__subtitle">
              {entries.length} {competition.type === 'team' ? 'team registrations' : 'individual entries'}
            </p>
          </div>
          <button className="btn btn--ghost" onClick={() => alert('CSV export coming soon.')}>
            <i className="bi bi-download" /> Export CSV
          </button>
        </div>

        <div className="admin-content">
          {/* Filters */}
          <div className="admin-filters">
            <div className="form-field" style={{ flex: 2 }}>
              <input
                type="search"
                placeholder={competition.type === 'team' ? 'Search by team name or leader…' : 'Search by name, student ID, or email…'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="form-field">
              <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
                <option value="">All year levels</option>
                {['1st Year','2nd Year','3rd Year','4th Year'].map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="form-field">
              <select value={filterProgram} onChange={(e) => setFilterProgram(e.target.value)}>
                <option value="">All programs</option>
                <option value="BSIT">BSIT</option>
                <option value="BSCS">BSCS</option>
              </select>
            </div>
            {(search || filterYear || filterProgram) && (
              <button className="btn btn--ghost" onClick={() => { setSearch(''); setFilterYear(''); setFilterProgram('') }}>
                Clear
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="admin-empty">No entries match your filters.</div>
          ) : competition.type === 'individual' ? (
            <IndividualTable entries={filtered} color={competition.color} onSelect={setSelected} selected={selected} />
          ) : (
            <TeamTable entries={filtered} color={competition.color} onSelect={setSelected} selected={selected} />
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <EntryDetail
          entry={selected}
          type={competition.type}
          color={competition.color}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}

function IndividualTable({ entries, color, onSelect, selected }) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Student ID</th>
            <th>Year Level</th>
            <th>Program</th>
            <th>Block</th>
            <th>Submitted</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => (
            <tr
              key={entry.uid}
              className={`admin-table__row ${selected?.uid === entry.uid ? 'admin-table__row--active' : ''}`}
              style={{ '--row-color': color }}
              onClick={() => onSelect(selected?.uid === entry.uid ? null : entry)}
            >
              <td className="admin-table__num">{i + 1}</td>
              <td className="admin-table__name">{entry.name}</td>
              <td className="admin-table__id">{entry.studentId}</td>
              <td>{entry.yearLevel}</td>
              <td>
                <span className="admin-badge" style={{ '--badge-color': color }}>{entry.program}</span>
                {entry.major && <span className="admin-badge admin-badge--muted" style={{ marginLeft: '0.35rem' }}>{entry.major}</span>}
              </td>
              <td>{entry.block}</td>
              <td className="admin-table__date">{formatDate(entry.submittedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TeamTable({ entries, color, onSelect, selected }) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Team Name</th>
            <th>Leader</th>
            <th>Members</th>
            <th>Submitted</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => (
            <tr
              key={entry.uid}
              className={`admin-table__row ${selected?.uid === entry.uid ? 'admin-table__row--active' : ''}`}
              style={{ '--row-color': color }}
              onClick={() => onSelect(selected?.uid === entry.uid ? null : entry)}
            >
              <td className="admin-table__num">{i + 1}</td>
              <td className="admin-table__name">{entry.teamName}</td>
              <td>
                <div>{entry.leader.name}</div>
                <div className="admin-table__sub">{entry.leader.studentId}</div>
              </td>
              <td>
                <span className="admin-badge" style={{ '--badge-color': color }}>{entry.totalMembers} members</span>
              </td>
              <td className="admin-table__date">{formatDate(entry.submittedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EntryDetail({ entry, type, color, onClose }) {
  return (
    <div className="detail-panel">
      <div className="detail-panel__header" style={{ '--panel-color': color }}>
        <div>
          <p className="detail-panel__label">Entry Detail</p>
          <p className="detail-panel__title">
            {type === 'team' ? entry.teamName : entry.name}
          </p>
        </div>
        <button className="detail-panel__close" onClick={onClose}>
          <i className="bi bi-x-lg" />
        </button>
      </div>

      <div className="detail-panel__body">
        {type === 'individual' ? (
          <MemberDetail member={entry} showEmail color={color} />
        ) : (
          <>
            <div className="detail-section">
              <p className="detail-section__heading">Team Leader</p>
              <MemberDetail member={entry.leader} showEmail color={color} />
            </div>
            {entry.members.map((m, i) => (
              <div key={i} className="detail-section">
                <p className="detail-section__heading">Member {i + 2}</p>
                <MemberDetail member={m} color={color} />
              </div>
            ))}
          </>
        )}

        <div className="detail-section">
          <p className="detail-section__heading">Submission</p>
          <DetailRow label="Submitted at" value={formatDateFull(entry.submittedAt)} />
        </div>
      </div>
    </div>
  )
}

function MemberDetail({ member, showEmail, color }) {
  return (
    <div className="detail-member">
      <DetailRow label="Full Name" value={member.name} />
      <DetailRow label="Student ID" value={member.studentId} />
      <DetailRow label="Year Level" value={member.yearLevel} />
      <DetailRow label="Program" value={member.program} />
      {member.major && <DetailRow label="Major" value={member.major} />}
      <DetailRow label="Block" value={member.block} />
      <DetailRow
        label="Facebook"
        value={<a href={member.facebookLink} target="_blank" rel="noopener noreferrer" style={{ color }}>{member.facebookLink}</a>}
      />
      {showEmail && <DetailRow label="Email" value={member.email} />}
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="detail-row">
      <span className="detail-row__label">{label}</span>
      <span className="detail-row__value">{value}</span>
    </div>
  )
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatDateFull(iso) {
  return new Date(iso).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })
}
