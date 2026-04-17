import { COLORS } from '../constants';

function AllowanceBar({ label, color, used, allowance, onAllowanceChange }) {
  const total = used.pending + used.requested + used.approved;
  const pctOf = (n) => Math.min((n / allowance) * 100, 100);
  const isOver = total > allowance;
  return (
    <div className="allowance-item">
      <div className="allowance-label">
        <strong style={{ color }}>{label}</strong>
        <span className="allowance-numbers" style={isOver ? { color: '#dc2626', fontWeight: 600 } : {}}>
          {total} /{' '}
          <input className="allowance-input" type="number" min={0} max={365} value={allowance} onChange={(e) => onAllowanceChange(Number(e.target.value))} onClick={(e) => e.stopPropagation()} />
        </span>
      </div>
      <div className="allowance-track">
        <div className="allowance-seg" style={{ width: `${pctOf(used.approved)}%`, background: COLORS.approved }} />
        <div className="allowance-seg" style={{ width: `${pctOf(used.requested)}%`, background: COLORS.requested }} />
        <div className="allowance-seg" style={{ width: `${pctOf(used.pending)}%`, background: COLORS.pending }} />
      </div>
    </div>
  );
}

export default function Header({ activePerson, setActivePerson, view, setView, allowances, onAllowanceChange, usage, onShowSummary, onShowClear, currentMonth, setCurrentMonth, userEmail, onSignOut }) {
  const shiftMonth = (d) => setCurrentMonth(m => { const dt = new Date(m.year, m.month + d); return { year: dt.getFullYear(), month: dt.getMonth() }; });
  return (
    <header className="header">
      <div className="header-row">
        <span className="app-title">🗓 M&amp;M Holidays</span>
        <div className="person-selector">
          {['manuel','marta','mm'].map(p => (
            <button key={p} className={`seg-btn${activePerson===p?' active':''}`} style={activePerson===p?{background:COLORS[p]}:{}} onClick={()=>setActivePerson(p)}>
              {p==='mm'?'M&M':p[0].toUpperCase()+p.slice(1)}
            </button>
          ))}
        </div>
        <div className="view-toggle">
          {['year','month'].map(v => (
            <button key={v} className={`seg-btn${view===v?' view-active':''}`} onClick={()=>setView(v)}>{v[0].toUpperCase()+v.slice(1)}</button>
          ))}
        </div>
        {view==='month' && (
          <div style={{display:'flex',gap:4}}>
            <button className="icon-btn" onClick={()=>shiftMonth(-1)}>‹</button>
            <button className="icon-btn" onClick={()=>shiftMonth(1)}>›</button>
          </div>
        )}
        <div className="header-spacer" />
        <button className="icon-btn" title="Summary" onClick={onShowSummary}>☰</button>
        <button className="icon-btn" title="Clear" onClick={onShowClear}>🗑</button>
        {userEmail && (
          <div style={{display:'flex',alignItems:'center',gap:6,borderLeft:'1px solid #e5e7eb',paddingLeft:10}}>
            <span style={{fontSize:11,color:'#6b7280',maxWidth:140,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{userEmail}</span>
            <button className="icon-btn" title="Sign out" onClick={onSignOut} style={{fontSize:13}}>↩</button>
          </div>
        )}
      </div>
      <div className="allowance-bars">
        <AllowanceBar label="Manuel" color={COLORS.manuel} used={usage.manuelHoliday} allowance={allowances.manuel} onAllowanceChange={v=>onAllowanceChange('manuel',v)} />
        <AllowanceBar label="Paternity 👶" color={COLORS.paternity} used={usage.manuelPaternity} allowance={allowances.paternity} onAllowanceChange={v=>onAllowanceChange('paternity',v)} />
        <AllowanceBar label="Marta" color={COLORS.marta} used={usage.marta} allowance={allowances.marta} onAllowanceChange={v=>onAllowanceChange('marta',v)} />
      </div>
    </header>
  );
}
