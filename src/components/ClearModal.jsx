export default function ClearModal({ onClose, onClear }) {
  const opts = [
    { id:'manuel', icon:'🔴', label:"Clear Manuel's bookings", desc:'Removes all non-approved Manuel bookings' },
    { id:'marta', icon:'🔵', label:"Clear Marta's bookings", desc:'Removes all non-approved Marta bookings' },
    { id:'all-holidays', icon:'🗑', label:'Clear all holidays', desc:'Removes all non-approved bookings for both' },
    { id:'all-events', icon:'📝', label:'Clear all events', desc:'Removes all notes and event text' },
    { id:'everything', icon:'💥', label:'Clear everything', desc:'Wipes all data including approved holidays' },
  ];
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{position:'relative'}} onClick={e=>e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>
        <div className="modal-title">Clear Data</div>
        <div className="modal-sub" style={{marginBottom:16}}>Approved holidays are preserved unless you choose "everything".</div>
        {opts.map(opt=>(
          <button key={opt.id} className="clear-opt" onClick={()=>{onClear(opt.id);onClose();}}>
            <span className="clear-opt-icon">{opt.icon}</span>
            <div><div className="clear-opt-label">{opt.label}</div><div className="clear-opt-desc">{opt.desc}</div></div>
          </button>
        ))}
      </div>
    </div>
  );
}
