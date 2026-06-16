import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, Mail, Lock, ShieldCheck, UserCircle2 } from 'lucide-react';

const API_URL = 'https://www.rafdi.com';

export const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loginError, setLoginError] = useState(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [emailError, setEmailError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { setUser, language, companies } = useApp();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const [formData, setFormData] = useState({
    email: '', password: '', companyName: '', regNumber: '',
    isOwner: false, isRenter: true,
  });

  const t = {
    login: language === 'ar' ? 'تسجيل الدخول' : 'Login',
    register: language === 'ar' ? 'إنشاء حساب' : 'Register',
    email: language === 'ar' ? 'البريد الإلكتروني' : 'Email',
    password: language === 'ar' ? 'كلمة المرور' : 'Password',
    companyName: language === 'ar' ? 'اسم الشركة' : 'Company Name',
    regNumber: language === 'ar' ? 'رقم السجل التجاري' : 'Registration Number',
    role: language === 'ar' ? 'نوع الحساب' : 'Account Role',
    owner: language === 'ar' ? 'صاحب مستودع' : 'Warehouse Owner',
    renter: language === 'ar' ? 'شركة مستأجرة' : 'Renting Company',
    wantToList: language === 'ar' ? 'أرغب في تأجير مستودعاتي' : 'I want to list warehouses',
    wantToRent: language === 'ar' ? 'أرغب في استئجار مستودعات' : 'I want to rent warehouses',
    welcome: language === 'ar' ? 'مرحباً بك في رفدي' : 'Welcome to Rafdi',
    subtitle: language === 'ar' ? 'منصة الربط اللوجستي الأولى' : 'The First Logistics Connection Platform',
    successReg: language === 'ar' ? 'تم تقديم طلبك بنجاح! يرجى الانتظار لحين اعتماد حسابك.' : 'Application submitted! Please wait for admin approval.',
    emailErr: language === 'ar' ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email',
    roleErr: language === 'ar' ? 'يرجى اختيار دور واحد على الأقل' : 'Please select at least one role',
    connErr: language === 'ar' ? 'حدث خطأ في الاتصال، حاول مرة أخرى' : 'Connection error, please try again',
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoginError(null); setEmailError(null); setRegisterSuccess(false);

    if (!validateEmail(formData.email)) { setEmailError(t.emailErr); return; }
    if (!isLogin && !formData.isOwner && !formData.isRenter) { setLoginError(t.roleErr); return; }

    setLoading(true);
    try {
      if (isLogin) {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        });
        const data = await res.json();
        if (!res.ok) { setLoginError(data.detail || (language === 'ar' ? 'بيانات غير صحيحة' : 'Invalid credentials')); return; }

        localStorage.setItem('token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        setUser({
          id: data.user_id || Math.random().toString(),
          companyName: data.company_name || formData.email,
          email: formData.email,
          registrationNumber: data.commercial_registration || '',
          role: data.roles?.[0] === 'warehouse_owner' ? 'OWNER' : data.roles?.[0] === 'admin' ? 'ADMIN' : 'RENTER',
          roles: (data.roles || []).map(r => r === 'warehouse_owner' ? 'OWNER' : r === 'renter_company' ? 'RENTER' : 'ADMIN'),
          status: 'APPROVED',
        });

      } else {
        const selectedRoles = [];
        if (formData.isOwner) selectedRoles.push('warehouse_owner');
        if (formData.isRenter) selectedRoles.push('renter_company');

        const res = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company_name: formData.companyName,
            commercial_registration: formData.regNumber,
            account_types: selectedRoles,
            email: formData.email,
            password: formData.password,
          }),
        });
        const data = await res.json();
        if (!res.ok) { setLoginError(data.detail || (language === 'ar' ? 'حدث خطأ' : 'Registration failed')); return; }

        setRegisterSuccess(true);
        setIsLogin(true);
        setFormData({ ...formData, password: '' });
      }
    } catch {
      setLoginError(t.connErr);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6" style={{background: 'radial-gradient(circle at top right, rgba(46,95,138,0.15), transparent), radial-gradient(circle at bottom left, rgba(46,95,138,0.05), transparent)'}}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[3rem] shadow-[0_48px_96px_-12px_rgba(0,0,0,0.12)] overflow-hidden max-w-5xl w-full flex flex-col md:flex-row border border-gray-100"
      >
        {/* Left */}
        <div className="bg-[#2E5F8A] text-white p-16 md:w-[45%] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-12">
              <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                <Building2 size={36} />
              </div>
              <h1 className="text-4xl font-black tracking-tight italic">{language === 'ar' ? 'رفدي' : 'Rafdi'}</h1>
            </div>
            <h2 className="text-4xl font-extrabold mb-8 leading-tight">{t.welcome}</h2>
            <p className="text-white/70 text-xl leading-relaxed mb-16">{t.subtitle}</p>
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/5">
                  <Building2 size={24} className="text-[#4A8ABF]" />
                </div>
                <p className="font-bold text-lg text-white/90">{language === 'ar' ? 'إدارة المستودعات بكل سلاسة' : 'Seamless warehouse management'}</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/5">
                  <ShieldCheck size={24} className="text-[#4A8ABF]" />
                </div>
                <p className="font-bold text-lg text-white/90">{language === 'ar' ? 'بيئة عمل آمنة وموثقة' : 'Secure and verified workspace'}</p>
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
            <button onClick={() => { setIsLogin(true); setLoginError(null); setRegisterSuccess(false); }} type="button"
              className={`py-3.5 px-10 rounded-xl font-black text-sm transition-all ${isLogin ? 'bg-white text-[#2E5F8A] shadow-lg' : 'text-gray-400'}`}>
              {t.login}
            </button>
            <button onClick={() => { setIsLogin(false); setLoginError(null); setRegisterSuccess(false); }} type="button"
              className={`py-3.5 px-10 rounded-xl font-black text-sm transition-all ${!isLogin ? 'bg-white text-[#2E5F8A] shadow-lg' : 'text-gray-400'}`}>
              {t.register}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {loginError && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="mb-8 p-6 bg-red-50 border-r-4 border-red-500 text-red-800 rounded-2xl text-sm flex items-start gap-4">
                <div className="p-2 bg-red-100 rounded-xl text-red-600"><ShieldCheck size={20} /></div>
                <p className="font-black leading-relaxed text-right">{loginError}</p>
              </motion.div>
            )}
            {registerSuccess && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="mb-8 p-6 bg-emerald-50 border-r-4 border-emerald-500 text-emerald-900 rounded-2xl text-sm flex items-start gap-4">
                <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600"><ShieldCheck size={20} /></div>
                <p className="font-black leading-relaxed text-right">{t.successReg}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleAuth} className="space-y-6 text-right">
            {!isLogin && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2.5">{t.companyName}</label>
                  <div className="relative">
                    <UserCircle2 className="absolute ltr:left-5 rtl:right-5 top-[1.1rem] text-gray-300" size={20} />
                    <input type="text" required placeholder="Acme Corp Saudi"
                      className="w-full ltr:pl-14 rtl:pr-14 px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold placeholder:text-gray-300 focus:ring-4 focus:ring-[#2E5F8A]/10 focus:bg-white transition-all"
                      value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2.5">{t.regNumber}</label>
                  <div className="relative">
                    <ShieldCheck className="absolute ltr:left-5 rtl:right-5 top-[1.1rem] text-gray-300" size={20} />
                    <input type="text" required placeholder="CR: 1010XXXXXX"
                      className="w-full ltr:pl-14 rtl:pr-14 px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold placeholder:text-gray-300 focus:ring-4 focus:ring-[#2E5F8A]/10 focus:bg-white transition-all"
                      value={formData.regNumber} onChange={e => setFormData({...formData, regNumber: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2.5">{t.role}</label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-4 cursor-pointer bg-gray-50 px-6 py-4 rounded-2xl hover:bg-white border border-transparent hover:border-[#2E5F8A]/20 transition-all">
                      <input type="checkbox" className="w-6 h-6 rounded-lg accent-[#2E5F8A]"
                        checked={formData.isOwner} onChange={e => setFormData({...formData, isOwner: e.target.checked})} />
                      <div>
                        <p className="font-black text-gray-900">{t.owner}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.wantToList}</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-4 cursor-pointer bg-gray-50 px-6 py-4 rounded-2xl hover:bg-white border border-transparent hover:border-[#2E5F8A]/20 transition-all">
                      <input type="checkbox" className="w-6 h-6 rounded-lg accent-[#2E5F8A]"
                        checked={formData.isRenter} onChange={e => setFormData({...formData, isRenter: e.target.checked})} />
                      <div>
                        <p className="font-black text-gray-900">{t.renter}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.wantToRent}</p>
                      </div>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2.5">{t.email}</label>
              <div className="relative">
                <Mail className="absolute ltr:left-5 rtl:right-5 top-[1.1rem] text-gray-300" size={20} />
                <input type="email" required placeholder="name@company.com"
                  className={`w-full ltr:pl-14 rtl:pr-14 px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold placeholder:text-gray-300 focus:ring-4 focus:ring-[#2E5F8A]/10 focus:bg-white transition-all ${emailError ? 'ring-2 ring-red-400 bg-red-50' : ''}`}
                  value={formData.email} onChange={e => { setFormData({...formData, email: e.target.value}); if(emailError) setEmailError(null); }} />
              </div>
              {emailError && <p className="text-red-500 text-[10px] mt-2 font-black uppercase tracking-widest">{emailError}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2.5">{t.password}</label>
              <div className="relative">
                <Lock className="absolute ltr:left-5 rtl:right-5 top-[1.1rem] text-gray-300" size={20} />
                <input type="password" required placeholder="••••••••"
                  className="w-full ltr:pl-14 rtl:pr-14 px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold placeholder:text-gray-300 focus:ring-4 focus:ring-[#2E5F8A]/10 focus:bg-white transition-all"
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#2E5F8A] text-white py-5 rounded-[1.5rem] font-black text-lg shadow-xl hover:bg-[#1E3F5C] hover:-translate-y-1 transition-all active:scale-[0.98] disabled:opacity-70 mt-4"
            >
              {loading ? (language === 'ar' ? 'جاري التحميل...' : 'Loading...') : (isLogin ? t.login : t.register)}
            </button>
          </form>

          <div className="mt-12 pt-12 border-t border-gray-100">
            <div className="flex flex-col items-center gap-6">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Demo Quick Access</p>
              <div className="flex gap-4">
                <button onClick={() => setUser(companies[0])} className="w-12 h-12 bg-gray-50 rounded-2xl text-gray-400 hover:bg-[#2E5F8A]/5 hover:text-[#2E5F8A] transition-all font-black text-[10px]">OW</button>
                <button onClick={() => setUser(companies[2])} className="w-12 h-12 bg-gray-50 rounded-2xl text-gray-400 hover:bg-[#2E5F8A]/5 hover:text-[#2E5F8A] transition-all font-black text-[10px]">RE</button>
                <button onClick={() => setUser(companies[3])} className="w-12 h-12 bg-gray-50 rounded-2xl text-gray-400 hover:bg-[#2E5F8A]/5 hover:text-[#2E5F8A] transition-all font-black text-[10px]">AD</button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
