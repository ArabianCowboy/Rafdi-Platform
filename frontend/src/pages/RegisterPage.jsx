import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, Building2, ShieldCheck, ArrowLeft } from 'lucide-react';

const API_URL = 'https://www.rafdi.com';

function RegisterPage() {
  const [companyName, setCompanyName] = useState('');
  const [commercialRegistration, setCommercialRegistration] = useState('');
  const [accountType, setAccountType] = useState('warehouse_owner');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!companyName) { setError('يرجى إدخال اسم الشركة'); return; }
    if (!commercialRegistration) { setError('يرجى إدخال رقم السجل التجاري'); return; }
    if (!validateEmail(email)) { setError('يرجى إدخال بريد إلكتروني صحيح'); return; }
    if (!password) { setError('يرجى إدخال كلمة المرور'); return; }
    if (password.length < 6) { setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: companyName,
          commercial_registration: commercialRegistration,
          account_types: [accountType],
          email,
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || 'حدث خطأ أثناء إنشاء الحساب'); return; }
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch {
      setError('حدث خطأ في الاتصال، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" dir="rtl" style={{fontFamily: "'Cairo', sans-serif"}}>

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{background: 'linear-gradient(135deg, #0f2744 0%, #1a3f6f 40%, #2E5F8A 100%)'}}>

        <div className="absolute inset-0 opacity-10"
          style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px'}} />

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
          <p className="text-white/50 text-xs mb-1 font-bold uppercase tracking-widest">انضم إلى</p>
          <p className="text-white text-3xl font-black">+500</p>
          <p className="text-white/50 text-xs mt-1 font-bold">شركة مسجلة</p>
        </motion.div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-32 left-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 w-48"
        >
          <p className="text-white/50 text-xs mb-1 font-bold uppercase tracking-widest">مستودع متاح</p>
          <p className="text-white text-3xl font-black">77</p>
          <p className="text-emerald-400 text-xs font-bold mt-1">في جميع المناطق</p>
        </motion.div>

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
              انضم إلى<br />
              <span style={{color: '#4A8ABF'}}>منصة رفدي</span><br />
              اليوم
            </h1>
            <p className="text-white/50 text-lg leading-relaxed max-w-sm">
              سجّل شركتك وابدأ بإدارة وحجز المستودعات بكل سهولة وأمان.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: '🏭', text: 'أضف مستودعاتك وابدأ التأجير فوراً' },
              { icon: '🔒', text: 'بيانات محمية بأعلى معايير الأمان' },
              { icon: '📊', text: 'تتبع حجوزاتك ومدفوعاتك بسهولة' },
            ].map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <span className="text-xl">{item.icon}</span>
                <p className="text-white/70 font-medium">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#F8FAFC] overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md py-8"
        >
          {/* Header */}
          <div className="mb-8 text-right">
            <div className="flex items-center gap-3 mb-6 lg:hidden">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{background: 'linear-gradient(135deg, #4A8ABF, #2E5F8A)'}}>
                <span className="text-white font-black">ر</span>
              </div>
              <span className="text-[#0f2744] font-black text-xl">رفدي</span>
            </div>
            <h2 className="text-3xl font-black text-[#0f2744] mb-2">إنشاء حساب جديد ✨</h2>
            <p className="text-gray-400 font-medium">أدخل بيانات شركتك للبدء</p>
          </div>

          {/* Tabs */}
          <div className="flex bg-white rounded-2xl p-1.5 mb-8 shadow-sm border border-gray-100">
            <Link to="/login" className="flex-1">
              <button className="w-full py-3 rounded-xl font-black text-sm text-gray-400 hover:text-gray-600 transition-all">
                تسجيل الدخول
              </button>
            </Link>
            <button className="flex-1 py-3 rounded-xl font-black text-sm transition-all"
              style={{background: 'linear-gradient(135deg, #1a3f6f, #2E5F8A)', color: 'white'}}>
              إنشاء حساب
            </button>
          </div>

          {/* Alerts */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-6 p-4 rounded-2xl text-sm flex items-center gap-3 text-right"
                style={{background: '#FEF2F2', border: '1px solid #FCA5A5'}}
              >
                <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center shrink-0 text-red-500 font-black text-lg">!</div>
                <p className="font-bold text-red-700">{error}</p>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-6 p-4 rounded-2xl text-sm flex items-center gap-3 text-right"
                style={{background: '#F0FDF4', border: '1px solid #86EFAC'}}
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-500 text-lg">✓</div>
                <p className="font-bold text-emerald-700">تم إنشاء الحساب بنجاح! جاري التحويل...</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4">

            {/* Company Name */}
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 text-right">اسم الشركة</label>
              <div className="relative">
                <input type="text" placeholder="مثال: شركة رفدي للخدمات اللوجستية"
                  className="w-full py-4 px-5 pr-12 rounded-2xl font-bold text-right outline-none transition-all bg-white border-2 border-transparent placeholder:text-gray-300 text-[#0f2744]"
                  onFocus={e => e.target.style.borderColor = '#2E5F8A'}
                  onBlur={e => e.target.style.borderColor = 'transparent'}
                  value={companyName} onChange={e => { setCompanyName(e.target.value); if(error) setError(''); }} />
                <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              </div>
            </div>

            {/* Commercial Registration */}
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 text-right">رقم السجل التجاري</label>
              <div className="relative">
                <input type="text" placeholder="1010XXXXXX"
                  className="w-full py-4 px-5 pr-12 rounded-2xl font-bold text-right outline-none transition-all bg-white border-2 border-transparent placeholder:text-gray-300 text-[#0f2744]"
                  onFocus={e => e.target.style.borderColor = '#2E5F8A'}
                  onBlur={e => e.target.style.borderColor = 'transparent'}
                  value={commercialRegistration} onChange={e => { setCommercialRegistration(e.target.value); if(error) setError(''); }} />
                <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              </div>
            </div>

            {/* Account Type */}
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 text-right">نوع الحساب</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'warehouse_owner', label: 'مالك مستودع', icon: '🏭', desc: 'أرغب في التأجير' },
                  { value: 'renter_company', label: 'مستأجر', icon: '📦', desc: 'أرغب في الاستئجار' },
                ].map((type) => (
                  <button key={type.value} type="button"
                    onClick={() => setAccountType(type.value)}
                    className="p-4 rounded-2xl text-right transition-all border-2 bg-white"
                    style={{
                      borderColor: accountType === type.value ? '#2E5F8A' : 'transparent',
                      background: accountType === type.value ? 'rgba(46,95,138,0.05)' : 'white'
                    }}
                  >
                    <span className="text-2xl block mb-1">{type.icon}</span>
                    <p className="font-black text-sm text-[#0f2744]">{type.label}</p>
                    <p className="text-[10px] text-gray-400 font-bold">{type.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 text-right">البريد الإلكتروني</label>
              <div className="relative">
                <input type="text" placeholder="name@company.com"
                  className="w-full py-4 px-5 pr-12 rounded-2xl font-bold text-right outline-none transition-all bg-white border-2 border-transparent placeholder:text-gray-300 text-[#0f2744]"
                  onFocus={e => e.target.style.borderColor = '#2E5F8A'}
                  onBlur={e => e.target.style.borderColor = 'transparent'}
                  value={email} onChange={e => { setEmail(e.target.value); if(error) setError(''); }} />
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 text-right">كلمة المرور</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                  className="w-full py-4 px-5 pr-12 pl-12 rounded-2xl font-bold text-right outline-none transition-all bg-white border-2 border-transparent placeholder:text-gray-300 text-[#0f2744]"
                  onFocus={e => e.target.style.borderColor = '#2E5F8A'}
                  onBlur={e => e.target.style.borderColor = 'transparent'}
                  value={password} onChange={e => { setPassword(e.target.value); if(error) setError(''); }} />
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
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
                  إنشاء الحساب
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

export default RegisterPage;