import { useRef, useEffect } from 'react';
import { BANK_HOLIDAYS_2026, COLORS, DAYS_SHORT } from '../constants';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isWeekend, isToday } from 'date-fns';

const sc = (s) => COLORS[s] || COLORS.pending;

function DayCell({ dateKey, day, inMonth, isWeekend: wk, bankHoliday: bh, isToday: today, holidays, events, onMD, onME, onMU, onBadge }) {
  const b = holidays[dateKey] || {};
  const hM = !!b.manuel, hMa = !!b.marta, both = hM && hMa;
  let bg = 'white', ex = {};
  if (bh && inMonth) bg = '#fef3c7';
  if (inMonth && !wk) {
    if (both) { bg = `linear-gradient(135deg,${COLORS.manuel}30 50%,${COLORS.marta}30 50%)`; ex = { border: `2px solid ${COLORS.mm}` }; }
    else if (hM) bg = `${COLORS.manuel}18`;
    else if (hMa) bg = `${COLORS.marta}18`;
  }
  return (
    <div className={`m-cell${wk?' weekend-cell':''}${!inMonth?' other-cell':''}${bh&&inMonth?' bh-cell':''}${both?' both-cell':''}`}
      style={{ background: bg, ...ex }}
      onMouseDown={e => { if (!wk&&inMonth) { e.preventDefault(); onMD(dateKey); } }}
      onMouseEnter={() => { if (!wk&&inMonth) onME(dateKey); }}
      onMouseUp={() => { if (!wk&&inMonth) onMU(dateKey); }}>
      <div style={{ display:'flex', alignItems:'flex-start', gap:4 }}>
        <div className={`m-cell-num${today?' today-num':''}`}>{day.getDate()}</div>
        {bh&&inMonth && <div className="m-bh-label" style={{flex:1}}>{bh}</div>}
      </div>
      {inMonth&&!wk && (
        <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginTop:4 }}>
          {hM && <span className="status-badge" style={{ background:sc(b.manuel.status)+'22', color:sc(b.manuel.status), border:`1px solid ${sc(b.manuel.status)}66` }} onClick={e=>{e.stopPropagation();onBadge(dateKey,'manuel');}}>{b.manuel.leaveType==='paternity'?'👶':'M'}{b.manuel.half?'½':''} {b.manuel.status}</span>}
          {hMa && <span className="status-badge" style={{ background:sc(b.marta.status)+'22', color:sc(b.marta.status), border:`1px solid ${sc(b.marta.status)}66` }} onClick={e=>{e.stopPropagation();onBadge(dateKey,'marta');}}>Ma{b.marta.half?'½':''} {b.marta.status}</span>}
        </div>
      )}
      <div className="m-cell-dots">
        {hM&&inMonth && (b.manuel.half ? <div className="dot-half" style={{ borderColor: b.manuel.leaveType==='paternity'?COLORS.paternity:COLORS.manuel }} /> : <div className="dot" style={{ background: b.manuel.leaveType==='paternity'?COLORS.paternity:COLORS.manuel }} />)}
        {hMa&&inMonth && (b.marta.half ? <div className="dot-half" style={{ borderColor: COLORS.marta }} /> : <div className="dot" style={{ background: COLORS.marta }} />)}
        {!!events[dateKey]&&inMonth && <div className="dot" style={{ background: COLORS.mm }} />}
      </div>
    </div>
  );
}

export default function MonthView({ year, month, holidays, events, activePerson, onToggleBooking, onCycleStatus, onOpenDay }) {
  const drag = useRef({ active:false, mode:null, didDrag:false, startKey:null });
  useEffect(() => { const up = () => { drag.current.active = false; }; window.addEventListener('mouseup', up); return () => window.removeEventListener('mouseup', up); }, []);

  const onMD = (dk) => {
    const b = holidays[dk];
    const ps = activePerson==='mm'?['manuel','marta']:[activePerson];
    drag.current = { active:true, mode: ps.some(p=>b?.[p])?'remove':'add', didDrag:false, startKey:dk };
  };
  const onME = (dk) => {
    if (!drag.current.active) return;
    drag.current.didDrag = true;
    onToggleBooking(dk, drag.current.mode);
  };
  const onMU = (dk) => {
    if (!drag.current.active) return;
    if (!drag.current.didDrag && drag.current.startKey===dk) onOpenDay(dk);
    else if (drag.current.didDrag) onToggleBooking(dk, drag.current.mode);
    drag.current.active = false;
  };

  const firstDay = new Date(year, month, 1);
  const days = eachDayOfInterval({ start: startOfWeek(startOfMonth(firstDay), { weekStartsOn:1 }), end: endOfWeek(endOfMonth(firstDay), { weekStartsOn:1 }) });

  return (
    <div className="month-view">
      <div className="month-grid-dow">{DAYS_SHORT.map(d => <div key={d} className="dow-label">{d}</div>)}</div>
      <div className="month-grid">
        {days.map(day => {
          const dk = format(day, 'yyyy-MM-dd');
          return <DayCell key={dk} dateKey={dk} day={day} inMonth={isSameMonth(day,firstDay)} isWeekend={isWeekend(day)} bankHoliday={BANK_HOLIDAYS_2026[dk]} isToday={isToday(day)} holidays={holidays} events={events} onMD={onMD} onME={onME} onMU={onMU} onBadge={onCycleStatus} />;
        })}
      </div>
    </div>
  );
}
