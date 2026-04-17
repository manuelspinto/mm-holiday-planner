import { useState } from 'react';
import { signIn, confirmSignIn } from 'aws-amplify/auth';
import { COLORS } from '../constants';

export default function LoginPage({ onSignIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [step, setStep] = useState('login'); // 'login' | 'new-password'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { nextStep } = await signIn({ username: email.trim(), password });
      if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        setStep('new-password');
      } else {
        onSignIn();
      }
    } catch (err) {
      setError(err.message || 'Sign-in failed. Check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== newPasswordConfirm) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await confirmSignIn({ challengeResponse: newPassword });
      onSignIn();
    } catch (err) {
      setError(err.message || 'Failed to set new password.');
    } finally {
      setLoading(false);
    }
  };

  const field = {
    width: '100%', padding: '10px 12px',
    border: '1px solid #e5e7eb', borderRadius: 8,
    fontSize: 14, outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit',
  };

  const card = (
    <div style={{ background: 'white', borderRadius: 16, padding: '40px 36px', width: 360, maxWidth: '94vw', boxShadow: '0 8px 32px rgba(0,0,0,.1)' }}>
      <div style={{ textAlign: 'center', marginBottom: 30 }}>
        <div style={{ fontSize: 44, lineHeight: 1, marginBottom: 10 }}>🗓</div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.5px' }}>M&amp;M Holidays</div>
        <div style={{ color: '#6b7280', fontSize: 13, marginTop: 5 }}>
          {step === 'login' ? 'Sign in to plan your time off' : 'Choose a permanent password'}
        </div>
      </div>

      {step === 'login' ? (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: '#374151', marginBottom: 5 }}>Email</label>
            <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={field} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: '#374151', marginBottom: 5 }}>Password</label>
            <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={field} />
          </div>
          {error && <div style={{ fontSize: 13, color: '#dc2626', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 7, padding: '8px 12px', marginBottom: 16 }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '11px 0', background: loading ? '#a78bfa' : COLORS.mm, color: 'white', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', transition: 'background .15s', fontFamily: 'inherit' }}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleNewPassword}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: '#374151', marginBottom: 5 }}>New Password</label>
            <input type="password" autoComplete="new-password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" style={field} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: '#374151', marginBottom: 5 }}>Confirm Password</label>
            <input type="password" autoComplete="new-password" required value={newPasswordConfirm} onChange={(e) => setNewPasswordConfirm(e.target.value)} placeholder="••••••••" style={field} />
          </div>
          {error && <div style={{ fontSize: 13, color: '#dc2626', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 7, padding: '8px 12px', marginBottom: 16 }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '11px 0', background: loading ? '#a78bfa' : COLORS.mm, color: 'white', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', transition: 'background .15s', fontFamily: 'inherit' }}>
            {loading ? 'Setting password…' : 'Set password & sign in'}
          </button>
        </form>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8f9fa' }}>
      {card}
    </div>
  );
}
