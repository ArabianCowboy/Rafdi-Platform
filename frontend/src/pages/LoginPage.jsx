import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, Mail, Lock, ShieldCheck } from 'lucide-react';

const API_URL = 'https://www.rafdi.com';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
        return;
      }

      localStorage.setItem('token', data.access_token);
      navigate('/home');
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
            <h2 className="text-4xl font-extrabold mb-8 leading-tight">مرحباً بك في رفدي</h2>
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
        <div className="p-16 md:w-[55%] bg-white flex flex-col justify-center">
          <div className="flex p-1.5 bg-gray-50 rounded-2xl mb-12 w-fit border border-gray-100">
            <button className="py-3.5 px-10 rounded-xl font-black text-sm bg-white text-[#2E5F8A] shadow-lg">
              تسجيل الدخول
            </button>
            <Link to="/register">
              <button className="py-3.5 px-10 rounded-xl font-black text-sm text-gray-400 hover:text-gray-600 transition-all">
                إنشاء حساب
              </button>
            </Link>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="mb-8 p-6 bg-red-50 border-r-4 border-red-500 text-red-800 rounded-2xl text-sm flex items-start gap-4">
                <div className="p-2 bg-red-100 rounded-xl text-red-600"><ShieldCheck size={20} /></div>
                <p className="font-black leading-relaxed text-right">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-6 text-right">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2.5">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-5 top-[1.1rem] text-gray-300" size={20} />
                <input type="email" required placeholder="name@company.com"
                  className="w-full pr-14 px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold placeholder:text-gray-300 focus:ring-4 focus:ring-[#2E5F8A]/10 focus:bg-white transition-all"
                  value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2.5">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-5 top-[1.1rem] text-gray-300" size={20} />
                <input type="password" required placeholder="••••••••"
                  className="w-full pr-14 px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold placeholder:text-gray-300 focus:ring-4 focus:ring-[#2E5F8A]/10 focus:bg-white transition-all"
                  value={password} onChange={e => setPassword(e.target.value)} />
              </div>
            </div>
            
            <button type="submit" disabled={loading}
              className="w-full bg-[#2E5F8A] text-white py-5 rounded-[1.5rem] font-black text-lg shadow-xl hover:bg-[#1E3F5C] hover:-translate-y-1 transition-all active:scale-[0.98] disabled:opacity-70 mt-4">
              {loading ? 'جاري التحميل...' : 'تسجيل الدخول'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default LoginPage;