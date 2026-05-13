import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const API_URL = 'https://api.rafdi.com';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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
    <div className="min-h-screen flex" dir="rtl" style={{fontFamily: "'Cairo', sans-serif"}}>
      
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{background: 'linear-gradient(135deg, #0f2744 0%, #1a3f6f 40%, #2E5F8A 100%)'}}>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px'}} />
        
        {/* Glowing Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-20 blur-3xl"
          style={{background: 'radial-gradient(circle, #4A8ABF, transparent)'}} />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full opacity-15 blur-3xl"
          style={{background: 'radial-gradient(circle, #60a5fa, transparent)'}} />

        {/* Floating Cards */}
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-24 right-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 w-52"
        >
          <p className="text-white/50 text-xs mb-1 font-bold uppercase tracking-widest">المستودعات النشطة</p>
          <p className="text-white text-3xl font-black">128</p>
          <div className="mt-2 h-1 rounded-full bg-white/10">
            <div className="h-1 rounded-full bg-[#4A8ABF] w-3/4" />
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-32 left-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 w-48"
        >
          <p className="text-white/50 text-xs mb-1 font-bold uppercase tracking-widest">الحجوزات</p>
          <p className="text-white text-3xl font-black">34</p>
          <p className="text-emerald-400 text-xs font-bold mt-1">↑ 12% هذا الشهر</p>
        </motion.div>

        {/* Center Content */}
        <div className="relative z-10 flex flex-col justify-center items-start p-16 w-full">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{background: 'linear-gradient(135deg, #4A8ABF, #2E5F8A)'}}>
                <span className="text-white font-black text-lg">ر</span>
              </div>
              <span className="text-white font-black text-2xl tracking-tight">رفدي</span>
            </div>
            <h1 className="text-5xl font-black text-white leading-tight mb-4">
              منصة إدارة<br />
              <span style={{color: '#4A8ABF'}}>المستودعات</span><br />
              اللوجستية
            </h1>
            <p className="text-white/50 text-lg leading-relaxed max-w-sm">
              حلول متكاملة لإدارة وحجز المستودعات بكفاءة عالية وأمان تام.
            </p>
          </div>

          <div className="flex gap-3">
            {['موثوق', 'آمن', 'سريع'].map((tag) => (
              <span key={tag} className="px-4 py-2 rounded-full text-xs font-black text-white/70 border border-white/20 bg-white/5">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#F8FAFC]">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="mb-10 text-right">
            <div className="flex items-center gap-3 mb-8 lg:hidden">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{background: 'linear-gradient(135deg, #4A8ABF, #2E5F8A)'}}>
                <span className="text-white font-black">ر</span>
              </div>
              <span className="text-[#0f2744] font-black text-xl">رفدي</span>
            </div>
            <h2 className="text-3xl font-black text-[#0f2744] mb-2">أهلاً بعودتك 👋</h2>
            <p className="text-gray-400 font-medium">سجّل دخولك للمتابعة</p>
          </div>

          {/* Tabs */}
          <div className="flex bg-white rounded-2xl p-1.5 mb-8 shadow-sm border border-gray-100">
            <button className="flex-1 py-3 rounded-xl font-black text-sm transition-all"
              style={{background: 'linear-gradient(135deg, #1a3f6f, #2E5F8A)', color: 'white'}}>
              تسجيل الدخول
            </button>
            <Link to="/register" className="flex-1">
              <button className="w-full py-3 rounded-xl font-black text-sm text-gray-400 hover:text-gray-600 transition-all">
                إنشاء حساب
              </button>
            </Link>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 p-4 rounded-2xl text-sm flex items-center gap-3 text-right"
                style={{background: '#FEF2F2', border: '1px solid #FCA5A5'}}
              >
                <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center shrink-0 text-red-500 font-black text-lg">!</div>
                <p className="font-bold text-red-700">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 text-right">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="name@company.com"
                  className="w-full py-4 px-5 pr-12 rounded-2xl font-bold text-right outline-none transition-all bg-white border-2 border-transparent placeholder:text-gray-300 text-[#0f2744]"
                  style={{'--tw-ring-color': '#2E5F8A'}}
                  onFocus={e => e.target.style.borderColor = '#2E5F8A'}
                  onBlur={e => e.target.style.borderColor = 'transparent'}
                  value={email}
                  onChange={e => { setEmail(e.target.value); if(error) setError(''); }}
                />
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <button type="button" className="text-xs font-black text-[#2E5F8A] hover:text-[#1a3f6f] transition-colors">
                  <Link to="/forgot-password" className="text-xs font-black text-[#2E5F8A] hover:text-[#1a3f6f] transition-colors">
  نسيت كلمة المرور؟
</Link>
                </button>
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">
                  كلمة المرور
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full py-4 px-5 pr-12 pl-12 rounded-2xl font-bold text-right outline-none transition-all bg-white border-2 border-transparent placeholder:text-gray-300 text-[#0f2744]"
                  onFocus={e => e.target.style.borderColor = '#2E5F8A'}
                  onBlur={e => e.target.style.borderColor = 'transparent'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); if(error) setError(''); }}
                />
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-2xl font-black text-white text-lg flex items-center justify-center gap-3 mt-2 disabled:opacity-70"
              style={{background: loading ? '#93b4d4' : 'linear-gradient(135deg, #1a3f6f 0%, #2E5F8A 100%)', boxShadow: '0 8px 32px rgba(46,95,138,0.35)'}}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full block" />
                  جاري التحميل...
                </span>
              ) : (
                <>
                  <ArrowLeft size={20} />
                  تسجيل الدخول
                </>
              )}
            </motion.button>
          </form>

          <p className="text-center text-xs text-gray-400 font-bold mt-8">
            © 2026 Rafdi Platform — جميع الحقوق محفوظة
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default LoginPage;