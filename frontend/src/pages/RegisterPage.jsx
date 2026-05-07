import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, Mail, Lock, ShieldCheck, UserCircle2 } from 'lucide-react';

const API_URL = 'https://www.rafdi.com';

function RegisterPage() {
  const [companyName, setCompanyName] = useState('');
  const [commercialRegistration, setCommercialRegistration] = useState('');
  const [accountType, setAccountType] = useState('warehouse_owner');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

      if (!res.ok) {
        setError(data.detail || 'حدث خطأ أثناء إنشاء الحساب');
        return;
      }

      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch {
      setError('حدث خطأ في الاتصال، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6"
      style={{background: 'radial-gradient(circle at top right, rgba(46,95,138,0.15), transparent), radial-gradient(circle at bottom left, rgba(46,95,138,0.05), transparent)'}}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[3rem] shadow-[0_48px_96px_-12px_rgba(0,0,0,0.12)] overflow-hidden max-w-5xl w-full flex flex-col md:flex-row border border-gray-100">

        {/* Left */}
        <div className="bg-[#2E5F8A] text-white p-16 md:w-[45%] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-12">
              <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                <Building2 size={36} />
              </div>
              <h1 className="text-4xl font-black tracking-tight italic">رفدي</h1>
            </div>
            <h2 className="text-4xl font-extrabold mb-8 leading-tight">ابدأ رحلتك معنا</h2>
            <p className="text-white/70 text-xl leading-relaxed mb-16">منصة الخدمات اللوجستية للمستودعات</p>
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/5">
                  <Building2 size={24} className="text-[#4A8ABF]" />
                </div>
                <p className="font-bold text-lg text-white/90">إدارة المستودعات بكل سلاسة</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/5">
                  <ShieldCheck size={24} className="text-[#4A8ABF]" />
                </div>
                <p className="font-bold text-lg text-white/90">بيئة عمل آمنة وموثقة</p>
              </div>
            </div>
          </div>
          <div className="relative z-10 pt-10 border-t border-white/10 opacity-40 text-center">
            <p className="text-sm font-black uppercase tracking-[0.2em]">© 2026 Rafdi Platform</p>
          </div>
        </div>

        {/* Right */}
        <div className="p-16 md:w-[55%] bg-white flex flex-col justify-center overflow-y-auto">
          <div className="flex p-1.5 bg-gray-50 rounded-2xl mb-12 w-fit border border-gray-100">
            <Link to="/login">
              <button className="py-3.5 px-10 rounded-xl font-black text-sm text-gray-400 hover:text-gray-600 transition-all">
                تسجيل الدخول
              </button>
            </Link>
            <button className="py-3.5 px-10 rounded-xl font-black text-sm bg-white text-[#2E5F8A] shadow-lg">
              إنشاء حساب
            </button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="mb-8 p-6 bg-red-50 border-r-4 border-red-500 text-red-800 rounded-2xl text-sm flex items-start gap-4">
                <div className="p-2 bg-red-100 rounded-xl text-red-600"><ShieldCheck size={20} /></div>
                <p className="font-black leading-relaxed text-right">{error}</p>
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="mb-8 p-6 bg-emerald-50 border-r-4 border-emerald-500 text-emerald-900 rounded-2xl text-sm flex items-start gap-4">
                <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600"><ShieldCheck size={20} /></div>
                <p className="font-black leading-relaxed text-right">تم إنشاء الحساب بنجاح! سيتم تحويلك لصفحة تسجيل الدخول...</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleRegister} className="space-y-5 text-right">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2.5">اسم الشركة</label>
              <div className="relative">
                <UserCircle2 className="absolute right-5 top-[1.1rem] text-gray-300" size={20} />
                <input type="text" placeholder="مثال: شركة رفدي"
                  className="w-full pr-14 px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold placeholder:text-gray-300 focus:ring-4 focus:ring-[#2E5F8A]/10 focus:bg-white transition-all"
                  value={companyName} onChange={e => { setCompanyName(e.target.value); if(error) setError(''); }} />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2.5">رقم السجل التجاري</label>
              <div className="relative">
                <ShieldCheck className="absolute right-5 top-[1.1rem] text-gray-300" size={20} />
                <input type="text" placeholder="1010XXXXXX"
                  className="w-full pr-14 px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold placeholder:text-gray-300 focus:ring-4 focus:ring-[#2E5F8A]/10 focus:bg-white transition-all"
                  value={commercialRegistration} onChange={e => { setCommercialRegistration(e.target.value); if(error) setError(''); }} />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2.5">نوع الحساب</label>
              <div className="space-y-3">
                <label className="flex items-center gap-4 cursor-pointer bg-gray-50 px-6 py-4 rounded-2xl hover:bg-white border border-transparent hover:border-[#2E5F8A]/20 transition-all">
                  <input type="radio" name="accountType" value="warehouse_owner"
                    className="w-5 h-5 accent-[#2E5F8A]"
                    checked={accountType === 'warehouse_owner'}
                    onChange={e => setAccountType(e.target.value)} />
                  <div>
                    <p className="font-black text-gray-900">مالك مستودع</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">أرغب في تأجير مستودعاتي</p>
                  </div>
                </label>
                <label className="flex items-center gap-4 cursor-pointer bg-gray-50 px-6 py-4 rounded-2xl hover:bg-white border border-transparent hover:border-[#2E5F8A]/20 transition-all">
                  <input type="radio" name="accountType" value="renter_company"
                    className="w-5 h-5 accent-[#2E5F8A]"
                    checked={accountType === 'renter_company'}
                    onChange={e => setAccountType(e.target.value)} />
                  <div>
                    <p className="font-black text-gray-900">مستأجر مستودع</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">أرغب في استئجار مستودعات</p>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2.5">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-5 top-[1.1rem] text-gray-300" size={20} />
                <input type="text" placeholder="name@company.com"
                  className="w-full pr-14 px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold placeholder:text-gray-300 focus:ring-4 focus:ring-[#2E5F8A]/10 focus:bg-white transition-all"
                  value={email} onChange={e => { setEmail(e.target.value); if(error) setError(''); }} />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2.5">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-5 top-[1.1rem] text-gray-300" size={20} />
                <input type="password" placeholder="••••••••"
                  className="w-full pr-14 px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold placeholder:text-gray-300 focus:ring-4 focus:ring-[#2E5F8A]/10 focus:bg-white transition-all"
                  value={password} onChange={e => { setPassword(e.target.value); if(error) setError(''); }} />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#2E5F8A] text-white py-5 rounded-[1.5rem] font-black text-lg shadow-xl hover:bg-[#1E3F5C] hover:-translate-y-1 transition-all active:scale-[0.98] disabled:opacity-70 mt-4">
              {loading ? 'جاري التحميل...' : 'إنشاء الحساب'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default RegisterPage;