import { useState, useEffect, useCallback } from 'react';
import './App.css';
import { configureAmplify } from './amplify-config';
import { getCurrentUser, fetchUserAttributes, signOut } from 'aws-amplify/auth';
import storage from './storage';
import Header from './components/Header';
import YearView from './components/YearView';
import MonthView from './components/MonthView';
import DayModal from './components/DayModal';
import SummaryPanel from './components/SummaryPanel';
import ClearModal from './components/ClearModal';
import LoginPage from './components/LoginPage';
import { COLORS } from './constants';

configureAmplify();

const DEFAULT_ALLOWANCES = { manuel: 25, marta: 25, paternity: 25 };

function computeUsage(holidays) {
  const zero = () => ({ pending: 0, requested: 0, approved: 0 });
  const usage = { manuelHoliday: zero(), manuelPaternity: zero(), marta: zero() };
  for (const day of Object.values(holidays)) {
    if (day.manuel) {
      const val = day.manuel.half ? 0.5 : 1;
      const pool = day.manuel.leaveType === 'paternity' ? 'manuelPaternity' : 'manuelHoliday';
      usage[pool][day.manuel.status] += val;
    }
    if (day.marta) {
      const val = day.marta.half ? 0.5 : 1;
      usage.marta[day.marta.status] += val;
    }
  }
  return usage;
}

const AUTH = { CHECKING: 'checking', UNAUTH: 'unauthenticated', AUTH: 'authenticated' };

export default function App() {
  const [authStatus, setAuthStatus] = useState(AUTH.CHECKING);
  const [userEmail, setUserEmail] = useState('');

  const [holidays, setHolidays] = useState({});
  const [events, setEvents] = useState({});
  const [allowances, setAllowances] = useState(DEFAULT_ALLOWANCES);
  const [activePerson, setActivePerson] = useState('manuel');
  const [view, setView] = useState('year');
  const [currentMonth, setCurrentMonth] = useState({ year: 2026, month: 0 });
  const [selectedDate, setSelectedDate] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [showClear, setShowClear] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(async (user) => {
        try {
          const attrs = await fetchUserAttributes();
          setUserEmail(attrs.email || user.username || '');
        } catch {
          setUserEmail(user.username || '');
        }
        setAuthStatus(AUTH.AUTH);
      })
      .catch(() => setAuthStatus(AUTH.UNAUTH));
  }, []);

  useEffect(() => {
    if (authStatus !== AUTH.AUTH) return;
    (async () => {
      const [h, e, a] = await Promise.all([
        storage.get('mm-holidays'),
        storage.get('mm-events'),
        storage.get('mm-allowances'),
      ]);
      if (h) setHolidays(h);
      if (e) setEvents(e);
      if (a) setAllowances((prev) => ({ ...prev, ...a }));
      setLoading(false);
    })();
  }, [authStatus]);

  useEffect(() => { if (!loading && authStatus === AUTH.AUTH) storage.set('mm-holidays', holidays); }, [holidays, loading, authStatus]);
  useEffect(() => { if (!loading && authStatus === AUTH.AUTH) storage.set('mm-events', events); }, [events, loading, authStatus]);
  useEffect(() => { if (!loading && authStatus === AUTH.AUTH) storage.set('mm-allowances', allowances); }, [allowances, loading, authStatus]);

  const handleSignIn = async () => {
    try {
      const user = await getCurrentUser();
      const attrs = await fetchUserAttributes().catch(() => ({}));
      setUserEmail(attrs.email || user.username || '');
    } catch {}
    setLoading(true);
    setAuthStatus(AUTH.AUTH);
  };

  const handleSignOut = async () => {
    await signOut();
    storage.reset();
    setAuthStatus(AUTH.UNAUTH);
    setUserEmail('');
    setHolidays({});
    setEvents({});
    setAllowances(DEFAULT_ALLOWANCES);
    setLoading(true);
  };

  const setHolidaysSafe = useCallback((updater) => {
    setHolidays((prev) => (typeof updater === 'function' ? updater(prev) : updater));
  }, []);

  const bookPerson = useCallback((dateKey, person) => {
    setHolidaysSafe((prev) => {
      const day = prev[dateKey] || {};
      if (day[person]) return prev;
      return { ...prev, [dateKey]: { ...day, [person]: { status: 'pending', half: false, ...(person === 'manuel' ? { leaveType: 'holiday' } : {}) } } };
    });
  }, [setHolidaysSafe]);

  const removePerson = useCallback((dateKey, person) => {
    setHolidaysSafe((prev) => {
      const day = prev[dateKey];
      if (!day?.[person] || day[person].status === 'approved') return prev;
      const { [person]: _, ...rest } = day;
      if (Object.keys(rest).length === 0) { const { [dateKey]: __, ...rem } = prev; return rem; }
      return { ...prev, [dateKey]: rest };
    });
  }, [setHolidaysSafe]);

  const toggleBooking = useCallback((dateKey, mode) => {
    const persons = activePerson === 'mm' ? ['manuel', 'marta'] : [activePerson];
    persons.forEach((p) => mode === 'add' ? bookPerson(dateKey, p) : removePerson(dateKey, p));
  }, [activePerson, bookPerson, removePerson]);

  const advanceStatus = useCallback((dateKey, person) => {
    setHolidaysSafe((prev) => {
      const booking = prev[dateKey]?.[person];
      if (!booking || booking.status === 'approved') return prev;
      const next = booking.status === 'pending' ? 'requested' : 'approved';
      return { ...prev, [dateKey]: { ...prev[dateKey], [person]: { ...booking, status: next } } };
    });
  }, [setHolidaysSafe]);

  const toggleHalf = useCallback((dateKey, person) => {
    setHolidaysSafe((prev) => {
      const booking = prev[dateKey]?.[person];
      if (!booking || booking.status === 'approved') return prev;
      return { ...prev, [dateKey]: { ...prev[dateKey], [person]: { ...booking, half: !booking.half } } };
    });
  }, [setHolidaysSafe]);

  const toggleLeaveType = useCallback((dateKey) => {
    setHolidaysSafe((prev) => {
      const booking = prev[dateKey]?.manuel;
      if (!booking || booking.status === 'approved') return prev;
      return { ...prev, [dateKey]: { ...prev[dateKey], manuel: { ...booking, leaveType: booking.leaveType === 'paternity' ? 'holiday' : 'paternity' } } };
    });
  }, [setHolidaysSafe]);

  const updateEvent = useCallback((dateKey, text) => {
    setEvents((prev) => {
      if (!text) { const { [dateKey]: _, ...rest } = prev; return rest; }
      return { ...prev, [dateKey]: text };
    });
  }, []);

  const handleAllowanceChange = useCallback((key, value) => {
    setAllowances((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleClear = useCallback((type) => {
    const notApproved = (b) => b?.status !== 'approved';
    setHolidaysSafe((prev) => {
      const next = { ...prev };
      for (const dk of Object.keys(next)) {
        const day = { ...next[dk] };
        if (['manuel', 'all-holidays', 'everything'].includes(type) && day.manuel && (type === 'everything' || notApproved(day.manuel))) delete day.manuel;
        if (['marta', 'all-holidays', 'everything'].includes(type) && day.marta && (type === 'everything' || notApproved(day.marta))) delete day.marta;
        if (Object.keys(day).length === 0) delete next[dk]; else next[dk] = day;
      }
      return next;
    });
    if (['all-events', 'everything'].includes(type)) setEvents({});
  }, [setHolidaysSafe]);

  if (authStatus === AUTH.CHECKING) {
    return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'#6b7280', fontSize:15 }}>Loading…</div>;
  }
  if (authStatus === AUTH.UNAUTH) {
    return <LoginPage onSignIn={handleSignIn} />;
  }
  if (loading) {
    return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'#6b7280', fontSize:15 }}>Loading your holidays…</div>;
  }

  const usage = computeUsage(holidays);

  return (
    <div className="app">
      <Header
        activePerson={activePerson} setActivePerson={setActivePerson}
        view={view} setView={setView}
        allowances={allowances} onAllowanceChange={handleAllowanceChange}
        usage={usage}
        onShowSummary={() => setShowSummary(true)}
        onShowClear={() => setShowClear(true)}
        currentMonth={currentMonth} setCurrentMonth={setCurrentMonth}
        userEmail={userEmail} onSignOut={handleSignOut}
      />
      <div className="legend">
        <div className="legend-item"><span className="legend-dot" style={{ background: COLORS.manuel }} /> Manuel</div>
        <div className="legend-item"><span className="legend-dot" style={{ background: COLORS.marta }} /> Marta</div>
        <div className="legend-item"><span className="legend-dot" style={{ background: COLORS.mm }} /> Event</div>
        <div className="legend-item"><span className="legend-swatch" style={{ background: '#fef3c7', border: '1px solid #fbbf24' }} /> Bank holiday</div>
        <div className="legend-item"><span className="legend-dot-outline" style={{ borderColor: COLORS.manuel }} /> Half day</div>
        <div className="legend-item"><span className="legend-dot" style={{ background: COLORS.paternity }} /> Paternity</div>
        <div className="legend-item" style={{ color: '#9ca3af' }}>Click → modal · Drag → bulk book · Click badge → advance status</div>
      </div>
      <div className="app-main">
        {view === 'year' ? (
          <YearView holidays={holidays} onMonthClick={(m) => { setCurrentMonth({ year:2026, month:m }); setView('month'); }} onDayClick={(dk,m) => { setCurrentMonth({ year:2026, month:m }); setView('month'); setSelectedDate(dk); }} />
        ) : (
          <MonthView year={currentMonth.year} month={currentMonth.month} holidays={holidays} events={events} activePerson={activePerson} onToggleBooking={toggleBooking} onCycleStatus={advanceStatus} onOpenDay={setSelectedDate} />
        )}
      </div>
      {selectedDate && <DayModal dateKey={selectedDate} holidays={holidays} events={events} onClose={() => setSelectedDate(null)} onBook={bookPerson} onAdvanceStatus={advanceStatus} onRemove={removePerson} onToggleHalf={toggleHalf} onToggleLeaveType={toggleLeaveType} onUpdateEvent={updateEvent} />}
      {showSummary && <SummaryPanel holidays={holidays} events={events} onClose={() => setShowSummary(false)} />}
      {showClear && <ClearModal onClose={() => setShowClear(false)} onClear={handleClear} />}
    </div>
  );
}
