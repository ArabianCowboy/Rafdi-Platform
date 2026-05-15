import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Building2, ShieldCheck, ArrowLeft, CheckCircle } from 'lucide-react';

const API_URL = 'https://api.rafdi.com';

function RegisterPage() {
  const [companyName, setCompanyName] = useState('');
  const [commercialRegistration, setCommercialRegistration] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [isRenter, setIsRenter] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!companyName) { setError('يرجى إدخال اسم الشركة'); return; }
    if (!commercialRegistration) { setError('يرجى إدخال رقم السجل التجاري'); return; }
    if (!isOwner && !isRenter) { setError('يرجى اختيار نوع الحساب'); return; }
    if (!validateEmail(email)) { setError('يرجى إدخال بريد إلكتروني صحيح'); return; }
    if (!password) { setError('يرجى إدخال كلمة المرور'); return; }
    if (password.length < 6) { setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return; }

    const accountTypes = [];
    if (isOwner) accountTypes.push('warehouse_owner');
    if (isRenter) accountTypes.push('renter_company');

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: companyName,
          commercial_registration: commercialRegistration,
          account_types: accountTypes,
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
          <h1 className="text-4xl font-black text-white leading-snug mb-4">
            ابدأ رحلتك مع<br />منصة رفدي
          </h1>
          <p className="text-blue-200 text-base leading-relaxed mb-10 max-w-sm">
            سواء كنت تمتلك مستودعاً أو تبحث عن مساحة تخزين — رفدي يربطك بالطرف الآخر مباشرة.
          </p>

          <div className="space-y-3 mb-10">
            {[
              'إدارة مستودعاتك وتتبع الحجوزات لحظياً',
              'نظام دفع آمن عبر ميسر',
              'بيانات شركتك محمية بالكامل',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                <span className="text-blue-100 text-sm">{item}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-8 pt-8 border-t border-white/10">
            {[
              { value: '+500', label: 'شركة مسجلة' },
              { value: '+128', label: 'مستودع نشط' },
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

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-start justify-center bg-[#f7f8fa] overflow-y-auto p-6 py-10">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-[#1a3a5c] flex items-center justify-center">
              <span className="text-white font-black text-sm">ر</span>
            </div>
            <span className="text-[#1a3a5c] font-black text-lg">رفدي</span>
          </div>

          {/* Header */}
          <div className="mb-6 text-right">
            <h2 className="text-2xl font-black text-gray-900 mb-1">إنشاء حساب جديد</h2>
            <p className="text-gray-500 text-sm">أدخل بيانات شركتك للبدء</p>
          </div>

          {/* Tabs */}
          <div className="flex bg-white border border-gray-200 rounded-xl p-1 mb-6">
            <Link to="/login" className="flex-1">
              <button className="w-full py-2.5 rounded-lg text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors">
                تسجيل الدخول
              </button>
            </Link>
            <button className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white bg-[#1a3a5c] transition-all">
              حساب جديد
            </button>
          </div>

          {/* Alerts */}
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
              <p className="font-semibold text-emerald-700">تم إنشاء الحساب بنجاح! جاري التحويل...</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">

            {/* Company Name */}
            <div className="text-right">
              <label className="block text-xs font-bold text-gray-600 mb-1.5">اسم الشركة</label>
              <div className="relative">
                <input type="text" placeholder="شركة رفدي للخدمات اللوجستية"
                  className="w-full py-3 px-4 pr-10 rounded-xl text-sm font-medium text-right bg-white border border-gray-200 outline-none focus:border-[#1a3a5c] transition-colors placeholder:text-gray-400 text-gray-900"
                  value={companyName}
                  onChange={e => { setCompanyName(e.target.value); if (error) setError(''); }} />
                <Building2 size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* CR */}
            <div className="text-right">
              <label className="block text-xs font-bold text-gray-600 mb-1.5">رقم السجل التجاري</label>
              <div className="relative">
                <input type="text" placeholder="1010XXXXXX"
                  className="w-full py-3 px-4 pr-10 rounded-xl text-sm font-medium text-right bg-white border border-gray-200 outline-none focus:border-[#1a3a5c] transition-colors placeholder:text-gray-400 text-gray-900"
                  value={commercialRegistration}
                  onChange={e => { setCommercialRegistration(e.target.value); if (error) setError(''); }} />
                <ShieldCheck size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Account Type */}
            <div className="text-right">
              <label className="block text-xs font-bold text-gray-600 mb-2">نوع الحساب <span className="text-gray-400 font-normal">(يمكن اختيار أكثر من نوع)</span></label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'مالك مستودع', desc: 'أرغب في التأجير', checked: isOwner, onChange: () => { setIsOwner(!isOwner); if (error) setError(''); } },
                  { label: 'مستأجر', desc: 'أرغب في الاستئجار', checked: isRenter, onChange: () => { setIsRenter(!isRenter); if (error) setError(''); } },
                ].map((type, i) => (
                  <button key={i} type="button" onClick={type.onChange}
                    className="p-3.5 rounded-xl text-right border transition-all relative"
                    style={{
                      borderColor: type.checked ? '#1a3a5c' : '#e5e7eb',
                      background: type.checked ? '#f0f4f8' : 'white',
                    }}>
                    {type.checked && (
                      <div className="absolute top-2 left-2 w-4 h-4 rounded-full bg-[#1a3a5c] flex items-center justify-center">
                        <span className="text-white text-[10px] font-black">✓</span>
                      </div>
                    )}
                    <p className="font-bold text-sm text-gray-900">{type.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{type.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Email */}
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

            {/* Password */}
            <div className="text-right">
              <label className="block text-xs font-bold text-gray-600 mb-1.5">كلمة المرور</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} placeholder="٦ أحرف على الأقل"
                  className="w-full py-3 px-4 pr-10 pl-10 rounded-xl text-sm font-medium text-right bg-white border border-gray-200 outline-none focus:border-[#1a3a5c] transition-colors placeholder:text-gray-400 text-gray-900"
                  value={password}
                  onChange={e => { setPassword(e.target.value); if (error) setError(''); }} />
                <Lock size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white text-sm bg-[#1a3a5c] hover:bg-[#14304e] disabled:opacity-60 transition-colors flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin block" />
                  جاري الإنشاء...
                </span>
              ) : (
                <>
                  <ArrowLeft size={16} />
                  إنشاء الحساب
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

export default RegisterPage;