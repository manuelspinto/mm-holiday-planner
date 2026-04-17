import { useState } from 'react';
import { BANK_HOLIDAYS_2026, COLORS } from '../constants';
import { format, parseISO } from 'date-fns';

const NEXT = { pending:'requested', requested:'approved' };
const LABELS = { pending:'Pending', requested:'Requested', approved:'Approved' };
const sc = (s) => { const c = COLORS[s]||COLORS.pending; return { background:c+'22', color:c, border:`1px solid ${c}66` }; };

function PersonRow({ name, color, booking, onBook, onAdvance, onRemove, onToggleHalf, onToggleLeaveType }) {
  if (!booking) return <div className="person-row"><span className="person-row-name" style={{color}}>{name}</span><button className="btn" onClick={onBook}>Book</button></div>;
  const locked = booking.status === 'approved';
  return (
    <div className="person-row">
      <span className="person-row-name" style={{color}}>{name}</span>
      <div className="row-actions">
        {locked ? <span className="locked">✓ Locked</span> : (
          <>
            <span className="status-badge" style={sc(booking.status)}>{LABELS[booking.status]}</span>
            {NEXT[booking.status] && <button className="btn btn-success" onClick={onAdvance}>→ {LABELS[NEXT[booking.status]]}</button>}
            <button className="btn" style={booking.half?{background:'#fef3c7',borderColor:'#fbbf24',color:'#92400e'}:{}} onClick={onToggleHalf}>{booking.half?'½ day':'Full'}</button>
            {name==='Manuel' && <button className="btn" style={booking.leaveType==='paternity'?{background:'#ccfbf1',borderColor:'#5eead4',color:'#0f766e'}:{}} onClick={onToggleLeaveType}>{booking.leaveType==='paternity'?'👶 Paternity':'🌴 Holiday'}</button>}
            <button className="btn btn-danger" onClick={onRemove}>Remove</button>
          </>
        )}
      </div>
    </div>
  );
}

export default function DayModal({ dateKey, holidays, events, onClose, onBook, onAdvanceStatus, onRemove, onToggleHalf, onToggleLeaveType, onUpdateEvent }) {
  const bh = BANK_HOLIDAYS_2026[dateKey];
  const day = holidays[dateKey] || {};
  const [txt, setTxt] = useState(events[dateKey] || '');
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{position:'relative'}} onClick={e=>e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>
        <div className="modal-title">{format(parseISO(dateKey), 'EEEE, MMMM d, yyyy')}</div>
        {bh ? <div className="modal-sub">🏦 {bh}</div> : <div style={{marginBottom:18}}/>}
        <div className="modal-section">
          <div className="modal-label">Bookings</div>
          <PersonRow name="Manuel" color={COLORS.manuel} booking={day.manuel} onBook={()=>onBook(dateKey,'manuel')} onAdvance={()=>onAdvanceStatus(dateKey,'manuel')} onRemove={()=>onRemove(dateKey,'manuel')} onToggleHalf={()=>onToggleHalf(dateKey,'manuel')} onToggleLeaveType={()=>onToggleLeaveType(dateKey)} />
          <PersonRow name="Marta" color={COLORS.marta} booking={day.marta} onBook={()=>onBook(dateKey,'marta')} onAdvance={()=>onAdvanceStatus(dateKey,'marta')} onRemove={()=>onRemove(dateKey,'marta')} onToggleHalf={()=>onToggleHalf(dateKey,'marta')} />
        </div>
        <div className="modal-section">
          <div className="modal-label">Note / Event</div>
          <input className="event-input" placeholder="Add a note… (Enter to save)" value={txt} onChange={e=>setTxt(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'){onUpdateEvent(dateKey,txt.trim());e.target.blur();}}} onBlur={()=>onUpdateEvent(dateKey,txt.trim())} />
        </div>
      </div>
    </div>
  );
}
