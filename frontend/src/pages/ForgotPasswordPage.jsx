import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ChevronLeft, CheckCircle } from 'lucide-react';
import { API_URL } from '../config/api';

const WarehouseMark = () => (
  <span style={{
    width: 32, height: 32, background: '#2563eb', borderRadius: 8,
    display: 'grid', placeItems: 'center', flexShrink: 0,
    boxShadow: '0 6px 14px -6px rgba(37,99,235,0.55), inset 0 -2px 0 rgba(0,0,0,0.08)',
  }}>
    <svg width="18" height="18" viewBox="0 0 64 64" fill="none">
      <path d="M32 7 L61 28 L3 28 Z" fill="#fff" stroke="#fff" strokeWidth="2.4" strokeLinejoin="round"/>
      <path d="M8 28 L8 57 L56 57 L56 28" stroke="#fff" strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round"/>
      <line x1="2" y1="57" x2="62" y2="57" stroke="#fff" strokeWidth="3.4" strokeLinecap="round"/>
      <rect x="13" y="44" width="10" height="13" fill="#fff" rx="1"/>
      <rect x="27" y="37" width="10" height="20" fill="#fff" rx="1"/>
      <rect x="41" y="41" width="10" height="16" fill="#fff" rx="1"/>
    </svg>
  </span>
);

function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateEmail(email)) { setError('يرجى إدخال بريد إلكتروني صحيح'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || 'حدث خطأ، تأكد من البريد الإلكتروني'); return; }
      setSuccess('تم إرسال رمز التحقق على بريدك الإلكتروني');
      setStep(2);
    } catch {
      setError('حدث خطأ في الاتصال، حاول مرة أخرى');
    } finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp) { setError('يرجى إدخال رمز التحقق'); return; }
    if (!newPassword) { setError('يرجى إدخال كلمة المرور الجديدة'); return; }
    if (newPassword.length < 6) { setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, new_password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || 'رمز التحقق غير صحيح أو منتهي الصلاحية'); return; }
      setSuccess('تم تغيير كلمة المرور بنجاح!');
      setTimeout(() => navigate('/login'), 2000);
    } catch {
      setError('حدث خطأ في الاتصال، حاول مرة أخرى');
    } finally { setLoading(false); }
  };

  const inputStyle = {
    width: '100%', padding: '11px 40px 11px 14px', borderRadius: 10,
    border: '1px solid #e2e8f0', outline: 'none', background: '#fff',
    fontSize: 14, color: '#0f172a', direction: 'rtl', fontFamily: 'inherit',
    boxSizing: 'border-box', transition: 'border-color .15s',
  };

  const btnStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 9,
    background: '#2563eb', color: '#fff',
    fontWeight: 700, fontSize: 14.5, border: 'none', cursor: 'pointer',
    fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    boxShadow: '0 8px 18px -8px rgba(37,99,235,0.6)',
    opacity: loading ? 0.6 : 1,
  };

  return (
    <div className="min-h-screen flex" dir="rtl" style={{ fontFamily: "'IBM Plex Sans Arabic', 'Tajawal', sans-serif" }}>

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12" style={{ background: '#0d1b3e' }}>
        <div className="flex items-center gap-2.5">
          <WarehouseMark />
          <span style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 22, color: '#fff', letterSpacing: '-0.01em' }}>رفدي</span>
        </div>

        <div>
          <h1 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 40, color: '#fff', lineHeight: 1.2, marginBottom: 14, letterSpacing: '-0.02em' }}>
            استعادة<br />كلمة المرور
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15, lineHeight: 1.65, marginBottom: 40, maxWidth: 340 }}>
            اتبع الخطوات البسيطة لإعادة تعيين كلمة مرورك والوصول لحسابك.
          </p>

          <div className="space-y-5">
            {[
              { num: 1, label: 'أدخل بريدك الإلكتروني', desc: 'سنرسل لك رمز التحقق' },
              { num: 2, label: 'أدخل رمز التحقق', desc: 'تحقق من صندوق بريدك' },
              { num: 3, label: 'كلمة مرور جديدة', desc: 'اختر كلمة مرور قوية' },
            ].map((s) => (
              <div key={s.num} className="flex items-center gap-3">
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  display: 'grid', placeItems: 'center',
                  fontSize: 12, fontWeight: 800,
                  background: step > s.num ? '#10b981' : step === s.num ? '#fff' : 'rgba(255,255,255,0.1)',
                  color: step > s.num ? '#fff' : step === s.num ? '#0d1b3e' : 'rgba(255,255,255,0.4)',
                  transition: 'all .2s',
                }}>
                  {step > s.num ? <CheckCircle size={14} /> : s.num}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: step >= s.num ? '#fff' : 'rgba(255,255,255,0.4)' }}>{s.label}</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ color: '#3b82f6', fontSize: 12, opacity: 0.7 }}>© 2026 Rafdi Platform</p>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6" style={{ background: '#f8fafc' }}>
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <WarehouseMark />
            <span style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 20, color: '#0f172a' }}>رفدي</span>
          </div>

          {/* Back */}
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: '#64748b', textDecoration: 'none', marginBottom: 24 }}>
            <ChevronLeft size={16} style={{ transform: 'rotate(180deg)' }} />
            العودة لتسجيل الدخول
          </Link>

          {/* Header */}
          <div className="mb-6 text-right">
            <div style={{
              width: 40, height: 40, borderRadius: 10, background: '#2563eb',
              display: 'grid', placeItems: 'center', marginBottom: 14,
              boxShadow: '0 6px 14px -6px rgba(37,99,235,0.55)',
            }}>
              <ShieldCheck size={20} color="#fff" />
            </div>
            <h2 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 24, color: '#0f172a', marginBottom: 6 }}>
              {step === 1 ? 'نسيت كلمة المرور؟' : 'أدخل رمز التحقق'}
            </h2>
            <p style={{ fontSize: 14, color: '#64748b' }}>
              {step === 1 ? 'أدخل بريدك الإلكتروني وسنرسل لك رمز التحقق' : `تم إرسال الرمز إلى ${email}`}
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl flex items-start gap-2.5 bg-red-50 border border-red-200">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-red-600 text-xs font-black">!</span>
              </div>
              <p className="font-semibold text-red-700 text-right text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-5 p-3.5 rounded-xl flex items-start gap-2.5 bg-emerald-50 border border-emerald-200">
              <CheckCircle size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <p className="font-semibold text-emerald-700 text-right text-sm">{success}</p>
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="text-right">
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <input type="text" placeholder="name@company.com"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#2563eb'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                    value={email}
                    onChange={e => { setEmail(e.target.value); if (error) setError(''); }} />
                  <Mail size={15} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                </div>
              </div>

              <button type="submit" disabled={loading} style={btnStyle}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin block" />
                    جاري الإرسال...
                  </span>
                ) : 'إرسال رمز التحقق'}
              </button>
            </form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="text-right">
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                  رمز التحقق
                </label>
                <div className="relative">
                  <input type="text" placeholder="أدخل الرمز المرسل إلى بريدك"
                    style={{ ...inputStyle, letterSpacing: '0.1em' }}
                    onFocus={e => e.target.style.borderColor = '#2563eb'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                    value={otp}
                    onChange={e => { setOtp(e.target.value); if (error) setError(''); }} />
                  <ShieldCheck size={15} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                </div>
              </div>

              <div className="text-right">
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                  كلمة المرور الجديدة
                </label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} placeholder="٦ أحرف على الأقل"
                    style={{ ...inputStyle, paddingLeft: 40 }}
                    onFocus={e => e.target.style.borderColor = '#2563eb'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                    value={newPassword}
                    onChange={e => { setNewPassword(e.target.value); if (error) setError(''); }} />
                  <Lock size={15} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} style={btnStyle}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin block" />
                    جاري التغيير...
                  </span>
                ) : 'تغيير كلمة المرور'}
              </button>

              <button type="button" onClick={() => { setStep(1); setError(''); setSuccess(''); }}
                style={{ width: '100%', padding: '10px', fontSize: 12, fontWeight: 600, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                لم تستلم الرمز؟ أعد الإرسال
              </button>
            </form>
          )}

          <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 28 }}>
            © 2026 Rafdi Platform — جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;