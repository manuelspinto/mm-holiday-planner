import { COLORS } from '../constants';
import { format, parseISO } from 'date-fns';

const ss = (s) => { const c=COLORS[s]||COLORS.pending; return {background:c+'22',color:c,border:`1px solid ${c}55`,borderRadius:99,padding:'1px 7px',fontSize:10,fontWeight:700}; };
const fd = (dk) => { try { return format(parseISO(dk),'EEE d MMM'); } catch { return dk; } };

export default function SummaryPanel({ holidays, events, onClose }) {
  const mDays = Object.entries(holidays).filter(([,v])=>v.manuel).sort(([a],[b])=>a.localeCompare(b));
  const maDays = Object.entries(holidays).filter(([,v])=>v.marta).sort(([a],[b])=>a.localeCompare(b));
  const overlaps = Object.entries(holidays).filter(([,v])=>v.manuel&&v.marta).sort(([a],[b])=>a.localeCompare(b));
  const evDays = Object.entries(events).filter(([,v])=>v).sort(([a],[b])=>a.localeCompare(b));
  return (
    <>
      <div className="summary-overlay" onClick={onClose} />
      <div className="summary-panel">
        <div className="summary-head"><h2>Summary</h2><button className="icon-btn" onClick={onClose}>✕</button></div>
        <div className="summary-body">
          <div className="s-section">
            <div className="s-person-title" style={{background:COLORS.manuel}}>Manuel</div>
            {mDays.length===0 && <div style={{fontSize:12,color:'#9ca3af',padding:'4px 0'}}>No days booked</div>}
            {mDays.map(([dk,day])=>(
              <div key={dk} className="s-day">
                <span className="s-day-date">{fd(dk)}</span>
                <span style={ss(day.manuel.status)}>{day.manuel.status}</span>
                {day.manuel.half&&<span style={{fontSize:10,color:'#6b7280'}}>½</span>}
                {day.manuel.leaveType==='paternity'&&<span>👶</span>}
              </div>
            ))}
          </div>
          <div className="s-section">
            <div className="s-person-title" style={{background:COLORS.marta}}>Marta</div>
            {maDays.length===0 && <div style={{fontSize:12,color:'#9ca3af',padding:'4px 0'}}>No days booked</div>}
            {maDays.map(([dk,day])=>(
              <div key={dk} className="s-day">
                <span className="s-day-date">{fd(dk)}</span>
                <span style={ss(day.marta.status)}>{day.marta.status}</span>
                {day.marta.half&&<span style={{fontSize:10,color:'#6b7280'}}>½</span>}
              </div>
            ))}
          </div>
          {overlaps.length>0&&(
            <div className="overlap-box">
              <div className="overlap-title">🟣 Both off together</div>
              {overlaps.map(([dk])=>(<div key={dk} style={{fontSize:12,padding:'3px 0',borderBottom:'1px solid #ede9fe',fontFamily:'DM Mono,monospace'}}>{fd(dk)}</div>))}
            </div>
          )}
          {evDays.length>0&&(
            <div className="s-section" style={{marginTop:16}}>
              <div className="s-person-title" style={{background:COLORS.mm}}>Events / Notes</div>
              {evDays.map(([dk,text])=>(<div key={dk} className="s-day"><span className="s-day-date">{fd(dk)}</span><span style={{fontSize:12,flex:1}}>{text}</span></div>))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
