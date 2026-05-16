import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ChevronLeft, CheckCircle } from 'lucide-react';

const API_URL = 'https://api.rafdi.com';

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

  return (
    <div className="min-h-screen flex" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-[#1a3a5c] p-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
            <span className="text-white font-black text-sm">ر</span>
          </div>
          <span className="text-white font-black text-lg">رفدي</span>
        </div>

        <div>
          <h1 className="text-3xl font-black text-white leading-snug mb-4">
            استعادة<br />كلمة المرور
          </h1>
          <p className="text-blue-200 text-sm leading-relaxed mb-10 max-w-sm">
            اتبع الخطوات البسيطة لإعادة تعيين كلمة مرورك والوصول لحسابك.
          </p>

          {/* Steps */}
          <div className="space-y-5">
            {[
              { num: 1, label: 'أدخل بريدك الإلكتروني', desc: 'سنرسل لك رمز التحقق' },
              { num: 2, label: 'أدخل رمز التحقق', desc: 'تحقق من صندوق بريدك' },
              { num: 3, label: 'كلمة مرور جديدة', desc: 'اختر كلمة مرور قوية' },
            ].map((s) => (
              <div key={s.num} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 transition-all ${
                  step > s.num
                    ? 'bg-emerald-500 text-white'
                    : step === s.num
                    ? 'bg-white text-[#1a3a5c]'
                    : 'bg-white/10 text-white/40'
                }`}>
                  {step > s.num ? <CheckCircle size={14} /> : s.num}
                </div>
                <div>
                  <p className={`text-sm font-bold ${step >= s.num ? 'text-white' : 'text-white/40'}`}>{s.label}</p>
                  <p className="text-xs text-white/30">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-blue-400 text-xs">© 2026 Rafdi Platform</p>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#f7f8fa] p-6">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-[#1a3a5c] flex items-center justify-center">
              <span className="text-white font-black text-sm">ر</span>
            </div>
            <span className="text-[#1a3a5c] font-black text-lg">رفدي</span>
          </div>

          {/* Back */}
          <Link to="/login"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors mb-7">
            <ChevronLeft size={16} className="rotate-180" />
            العودة لتسجيل الدخول
          </Link>

          {/* Header */}
          <div className="mb-6 text-right">
            <div className="w-10 h-10 rounded-xl bg-[#1a3a5c] flex items-center justify-center mb-4">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-1">
              {step === 1 ? 'نسيت كلمة المرور؟' : 'أدخل رمز التحقق'}
            </h2>
            <p className="text-gray-500 text-sm">
              {step === 1
                ? 'أدخل بريدك الإلكتروني وسنرسل لك رمز التحقق'
                : `تم إرسال الرمز إلى ${email}`}
            </p>
          </div>

          {/* Error / Success */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl text-sm flex items-start gap-2.5 bg-red-50 border border-red-200">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-red-600 text-xs font-black">!</span>
              </div>
              <p className="font-semibold text-red-700 text-right">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-5 p-3.5 rounded-xl text-sm flex items-start gap-2.5 bg-emerald-50 border border-emerald-200">
              <CheckCircle size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <p className="font-semibold text-emerald-700 text-right">{success}</p>
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="text-right">
                <label className="block text-xs font-bold text-gray-600 mb-1.5">البريد الإلكتروني</label>
                <div className="relative">
                  <input type="text" placeholder="name@company.com"
                    className="w-full py-3 px-4 pr-10 rounded-xl text-sm font-medium text-right bg-white border border-gray-200 outline-none focus:border-[#1a3a5c] transition-colors placeholder:text-gray-400 text-gray-900"
                    value={email}
                    onChange={e => { setEmail(e.target.value); if (error) setError(''); }} />
                  <Mail size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-white text-sm bg-[#1a3a5c] hover:bg-[#14304e] disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
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
                <label className="block text-xs font-bold text-gray-600 mb-1.5">رمز التحقق</label>
                <div className="relative">
                  <input type="text" placeholder="أدخل الرمز المرسل إلى بريدك"
                    className="w-full py-3 px-4 pr-10 rounded-xl text-sm font-medium text-right bg-white border border-gray-200 outline-none focus:border-[#1a3a5c] transition-colors placeholder:text-gray-400 text-gray-900 tracking-widest"
                    value={otp}
                    onChange={e => { setOtp(e.target.value); if (error) setError(''); }} />
                  <ShieldCheck size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div className="text-right">
                <label className="block text-xs font-bold text-gray-600 mb-1.5">كلمة المرور الجديدة</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} placeholder="٦ أحرف على الأقل"
                    className="w-full py-3 px-4 pr-10 pl-10 rounded-xl text-sm font-medium text-right bg-white border border-gray-200 outline-none focus:border-[#1a3a5c] transition-colors placeholder:text-gray-400 text-gray-900"
                    value={newPassword}
                    onChange={e => { setNewPassword(e.target.value); if (error) setError(''); }} />
                  <Lock size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-white text-sm bg-[#1a3a5c] hover:bg-[#14304e] disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin block" />
                    جاري التغيير...
                  </span>
                ) : 'تغيير كلمة المرور'}
              </button>

              <button type="button" onClick={() => { setStep(1); setError(''); setSuccess(''); }}
                className="w-full py-2.5 text-xs font-semibold text-gray-400 hover:text-[#1a3a5c] transition-colors">
                لم تستلم الرمز؟ أعد الإرسال
              </button>
            </form>
          )}

          <p className="text-center text-xs text-gray-400 mt-8">
            © 2026 Rafdi Platform — جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;