import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Building2, CheckCircle, ArrowLeft } from 'lucide-react';

const API_URL = 'https://api.rafdi.com';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateEmail(email)) { setError('يرجى إدخال بريد إلكتروني صحيح'); return; }
    if (!password) { setError('يرجى إدخال كلمة المرور'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || 'البريد الإلكتروني أو كلمة المرور غير صحيحة'); return; }
      localStorage.setItem('token', data.access_token);
      navigate('/home');
    } catch {
      setError('حدث خطأ في الاتصال، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-[#1a3a5c] p-12">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
            <span className="text-white font-black text-sm">ر</span>
          </div>
          <span className="text-white font-black text-lg">رفدي</span>
        </div>

        {/* Main content */}
        <div>
          <h1 className="text-4xl font-black text-white leading-snug mb-4">
            منصة حجز<br />وإدارة المستودعات
          </h1>
          <p className="text-blue-200 text-base leading-relaxed mb-10 max-w-sm">
            ربط مباشر بين أصحاب المستودعات والشركات الباحثة عن مساحة تخزين آمنة وموثوقة.
          </p>

          {/* Trust indicators */}
          <div className="space-y-3">
            {[
              'مستودعات في مناطق متعددة بالمملكة',
              'نظام حجز وتتبع فوري',
              'دفع آمن عبر ميسر',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                <span className="text-blue-100 text-sm">{item}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex gap-8 mt-10 pt-10 border-t border-white/10">
            {[
              { value: '+128', label: 'مستودع نشط' },
              { value: '+500', label: 'شركة مسجلة' },
              { value: '٩٩٪', label: 'رضا العملاء' },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-blue-300 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-blue-400 text-xs">© 2026 Rafdi Platform</p>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#f7f8fa] p-6">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-[#1a3a5c] flex items-center justify-center">
              <span className="text-white font-black text-sm">ر</span>
            </div>
            <span className="text-[#1a3a5c] font-black text-lg">رفدي</span>
          </div>

          {/* Header */}
          <div className="mb-7 text-right">
            <h2 className="text-2xl font-black text-gray-900 mb-1">تسجيل الدخول</h2>
            <p className="text-gray-500 text-sm">أدخل بياناتك للوصول إلى حسابك</p>
          </div>

          {/* Tabs */}
          <div className="flex bg-white border border-gray-200 rounded-xl p-1 mb-6">
            <button className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white bg-[#1a3a5c] transition-all">
              تسجيل الدخول
            </button>
            <Link to="/register" className="flex-1">
              <button className="w-full py-2.5 rounded-lg text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors">
                حساب جديد
              </button>
            </Link>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl text-sm flex items-start gap-2.5 bg-red-50 border border-red-200">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-red-600 text-xs font-black">!</span>
              </div>
              <p className="font-semibold text-red-700 text-right">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="text-right">
              <label className="block text-xs font-bold text-gray-600 mb-1.5">البريد الإلكتروني</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="name@company.com"
                  className="w-full py-3 px-4 pr-10 rounded-xl text-sm font-medium text-right bg-white border border-gray-200 outline-none focus:border-[#1a3a5c] transition-colors placeholder:text-gray-400 text-gray-900"
                  value={email}
                  onChange={e => { setEmail(e.target.value); if (error) setError(''); }}
                />
                <Mail size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="text-right">
              <div className="flex justify-between items-center mb-1.5">
                <Link to="/forgot-password" className="text-xs font-semibold text-[#1a3a5c] hover:underline">
                  نسيت كلمة المرور؟
                </Link>
                <label className="text-xs font-bold text-gray-600">كلمة المرور</label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full py-3 px-4 pr-10 pl-10 rounded-xl text-sm font-medium text-right bg-white border border-gray-200 outline-none focus:border-[#1a3a5c] transition-colors placeholder:text-gray-400 text-gray-900"
                  value={password}
                  onChange={e => { setPassword(e.target.value); if (error) setError(''); }}
                />
                <Lock size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white text-sm bg-[#1a3a5c] hover:bg-[#14304e] disabled:opacity-60 transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin block" />
                  جاري الدخول...
                </span>
              ) : (
                <>
                  <ArrowLeft size={16} />
                  تسجيل الدخول
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-8">
            © 2026 Rafdi Platform — جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;