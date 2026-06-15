import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ShieldCheck, X, CheckCircle, Mail, ArrowLeft } from 'lucide-react';
import { API_URL } from '../config/api';

const getUserInfo = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return {};
    return JSON.parse(atob(token.split('.')[1]));
  } catch { return {}; }
};

function ChangePasswordPage() {
  const navigate = useNavigate();
  const userInfo = getUserInfo();
  const email = userInfo.email;

  const [step, setStep] = useState(1); // 1: إرسال الرمز، 2: إدخال الرمز وكلمة المرور
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleSendOTP = async () => {
    setError(''); setSuccess('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || 'حدث خطأ'); return; }
      setSuccess('تم إرسال رمز التحقق إلى بريدك الإلكتروني');
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
      setTimeout(() => navigate('/profile'), 1800);
    } catch {
      setError('حدث خطأ في الاتصال، حاول مرة أخرى');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" dir="rtl"
      style={{ background: '#f8fafc', fontFamily: "'IBM Plex Sans Arabic', 'Tajawal', sans-serif" }}>

      <div className="w-full max-w-sm bg-white rounded-2xl overflow-hidden"
        style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 4px 16px -8px rgba(15,23,42,0.08)', border: '1px solid #e2e8f0' }}>

        {/* Header */}
        <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <button onClick={() => navigate('/profile')}
              style={{ width: 28, height: 28, borderRadius: 8, background: '#f1f5f9', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center', color: '#64748b' }}>
              <X size={15} />
            </button>
            <div style={{
              width: 40, height: 40, borderRadius: 10, background: '#2563eb',
              display: 'grid', placeItems: 'center',
              boxShadow: '0 6px 14px -6px rgba(37,99,235,0.55)',
            }}>
              <ShieldCheck size={20} color="#fff" />
            </div>
          </div>
          <h2 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 20, color: '#0f172a', marginBottom: 4, textAlign: 'right' }}>
            تغيير كلمة المرور
          </h2>
          <p style={{ fontSize: 13, color: '#64748b', textAlign: 'right' }}>
            {step === 1
              ? 'سنرسل رمز تحقق إلى بريدك الإلكتروني'
              : `تم إرسال الرمز إلى ${email}`}
          </p>
        </div>

        <div style={{ padding: 24 }}>
          {/* Alerts */}
          {error && (
            <div className="mb-4 p-3.5 rounded-xl flex items-start gap-2.5 bg-red-50 border border-red-200">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-red-600 text-xs font-black">!</span>
              </div>
              <p className="font-semibold text-red-700 text-right text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3.5 rounded-xl flex items-start gap-2.5 bg-emerald-50 border border-emerald-200">
              <CheckCircle size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <p className="font-semibold text-emerald-700 text-right text-sm">{success}</p>
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{email}</span>
                <Mail size={14} color="#94a3b8" />
              </div>

              <button onClick={handleSendOTP} disabled={loading} style={btnStyle}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin block" />
                    جاري الإرسال...
                  </span>
                ) : (
                  <>
                    <ArrowLeft size={16} />
                    إرسال رمز التحقق
                  </>
                )}
              </button>
            </div>
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

              <button type="button" onClick={handleSendOTP} disabled={loading}
                style={{ width: '100%', padding: '8px', fontSize: 12, fontWeight: 600, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                لم تستلم الرمز؟ أعد الإرسال
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChangePasswordPage;