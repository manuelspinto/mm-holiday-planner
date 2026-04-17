import { BANK_HOLIDAYS_2026, MONTHS, DAYS_SHORT, COLORS } from '../constants';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isWeekend, isToday } from 'date-fns';

function cellBg(holidays, dateKey) {
  const day = holidays[dateKey];
  if (!day) return null;
  if (day.manuel && day.marta) return `linear-gradient(135deg, ${COLORS.manuel}33 50%, ${COLORS.marta}33 50%)`;
  if (day.manuel) return `${COLORS.manuel}22`;
  if (day.marta) return `${COLORS.marta}22`;
  return null;
}

function MiniMonth({ year, month, holidays, onClick, onDayClick }) {
  const firstDay = new Date(year, month, 1);
  const days = eachDayOfInterval({ start: startOfWeek(startOfMonth(firstDay), { weekStartsOn: 1 }), end: endOfWeek(endOfMonth(firstDay), { weekStartsOn: 1 }) });
  return (
    <div className="mini-month" onClick={() => onClick(month)}>
      <div className="mini-month-title">{MONTHS[month]} {year}</div>
      <div className="mini-grid">
        {DAYS_SHORT.map(d => <div key={d} className="mini-dow">{d[0]}</div>)}
        {days.map(day => {
          const dk = format(day, 'yyyy-MM-dd');
          const inMonth = isSameMonth(day, firstDay);
          const weekend = isWeekend(day);
          const isBH = !!BANK_HOLIDAYS_2026[dk];
          const today = isToday(day);
          const bg = inMonth && !weekend ? (isBH ? '#fef3c7' : cellBg(holidays, dk)) : null;
          return (
            <div key={dk} className={`mini-cell${inMonth&&!weekend?' clickable':''}${weekend?' weekend':''}${today?' today-cell':''}`}
              style={{ background: bg || undefined, color: inMonth ? undefined : 'transparent' }}
              onClick={e => { if (!inMonth||weekend) return; e.stopPropagation(); onDayClick(dk, month); }}>
              {today && inMonth ? <span>{day.getDate()}</span> : inMonth ? day.getDate() : ''}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function YearView({ holidays, onMonthClick, onDayClick }) {
  return (
    <div className="year-view">
      {Array.from({ length: 12 }, (_, i) => <MiniMonth key={i} year={2026} month={i} holidays={holidays} onClick={onMonthClick} onDayClick={onDayClick} />)}
    </div>
  );
}
