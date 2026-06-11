import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, CheckCircle, ArrowLeft, Building2, Layers, ArrowRight } from 'lucide-react';
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

const getRolesFromToken = (token) => {
  try { return JSON.parse(atob(token.split('.')[1])).roles || []; } catch { return []; }
};

const getCompanyNameFromToken = (token) => {
  try { return JSON.parse(atob(token.split('.')[1])).company_name || ''; } catch { return ''; }
};

function RoleSelector({ token, onSelect }) {
  const companyName = getCompanyNameFromToken(token);

  return (
    <div className="min-h-screen" dir="rtl"
      style={{ background: '#f8fafc', fontFamily: "'IBM Plex Sans Arabic', 'Tajawal', sans-serif" }}>

      {/* Header */}
      <div style={{ background: '#0d1b3e', padding: '40px 24px 60px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'right' }}>
          <div className="flex items-center justify-end gap-2.5 mb-6">
            <span style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 22, color: '#fff' }}>رفدي</span>
            <WarehouseMark />
          </div>
          <h1 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 'clamp(28px,4vw,42px)', color: '#fff', marginBottom: 10 }}>
            أهلاً، {companyName}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 16 }}>
            اختر طريقة الدخول للمنصة
          </p>
        </div>
      </div>

      {/* Cards */}
      <div style={{ maxWidth: 900, margin: '-30px auto 0', padding: '0 24px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>

          {/* مالك مستودع */}
          <div style={{
            background: '#fff', borderRadius: 16, padding: 28,
            border: '1px solid #e2e8f0', textAlign: 'right',
            boxShadow: '0 4px 20px -8px rgba(15,23,42,0.1)',
            display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eff6ff', display: 'grid', placeItems: 'center' }}>
                <Building2 size={24} color="#2563eb" />
              </div>
              <div>
                <h3 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 20, color: '#0f172a', marginBottom: 4 }}>
                  مالك مستودع
                </h3>
                <p style={{ fontSize: 13, color: '#64748b' }}>إدارة مستودعاتك وتتبع الحجوزات</p>
              </div>
            </div>
            <button onClick={() => onSelect('owner')}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                color: '#2563eb', fontWeight: 700, fontSize: 14,
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', padding: 0,
              }}>
              <ArrowLeft size={16} />
              دخول
            </button>
          </div>

          {/* مستأجر */}
          <div style={{
            background: '#fff', borderRadius: 16, padding: 28,
            border: '1px solid #e2e8f0', textAlign: 'right',
            boxShadow: '0 4px 20px -8px rgba(15,23,42,0.1)',
            display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#ecfdf5', display: 'grid', placeItems: 'center' }}>
                <Layers size={24} color="#10b981" />
              </div>
              <div>
                <h3 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 20, color: '#0f172a', marginBottom: 4 }}>
                  مستأجر
                </h3>
                <p style={{ fontSize: 13, color: '#64748b' }}>ابحث عن مستودع واحجز بسهولة</p>
              </div>
            </div>
            <button onClick={() => onSelect('renter')}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                color: '#10b981', fontWeight: 700, fontSize: 14,
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', padding: 0,
              }}>
              <ArrowLeft size={16} />
              دخول
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingToken, setPendingToken] = useState(null);
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

      const token = data.access_token;
      const roles = getRolesFromToken(token);
      const isOwner = roles.includes('warehouse_owner');
      const isRenter = roles.includes('renter_company');

      localStorage.setItem('token', token);

      const payload = JSON.parse(atob(token.split('.')[1]));
        localStorage.setItem('company_name', payload.company_name || '');

      if (isOwner && isRenter) {
        setPendingToken(token);
        return;
      }

      navigate('/home');
    } catch {
      setError('حدث خطأ في الاتصال، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (role) => {
    localStorage.setItem('selectedRole', role);
    navigate('/home');
  };

  if (pendingToken) {
    return <RoleSelector token={pendingToken} onSelect={handleRoleSelect} />;
  }

  return (
    <div className="min-h-screen flex" dir="rtl" style={{ fontFamily: "'IBM Plex Sans Arabic', 'Tajawal', sans-serif" }}>

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12" style={{ background: '#0d1b3e' }}>
        <div className="flex items-center gap-2.5">
          <WarehouseMark />
          <span style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 22, color: '#fff', letterSpacing: '-0.01em' }}>رفدي</span>
        </div>
        <div>
          <h1 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 42, color: '#fff', lineHeight: 1.2, marginBottom: 14, letterSpacing: '-0.02em' }}>
            منصة حجز<br />وإدارة المستودعات
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 16, lineHeight: 1.65, marginBottom: 36, maxWidth: 360 }}>
            ربط مباشر بين أصحاب المستودعات والشركات الباحثة عن مساحة تخزين آمنة وموثوقة.
          </p>
          <div className="space-y-3 mb-10">
            {['مستودعات في مناطق متعددة بالمملكة', 'نظام حجز وتتبع فوري', 'دفع آمن عبر ميسر'].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>{item}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-8 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            {[{ value: '+128', label: 'مستودع نشط' }, { value: '+500', label: 'شركة مسجلة' }, { value: '٩٩٪', label: 'رضا العملاء' }].map((s, i) => (
              <div key={i}>
                <p style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 26, color: '#fff' }}>{s.value}</p>
                <p style={{ color: '#93c5fd', fontSize: 12, marginTop: 3 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <p style={{ color: '#3b82f6', fontSize: 12, opacity: 0.7 }}>© 2026 Rafdi Platform</p>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6" style={{ background: '#f8fafc' }}>
        <div className="w-full max-w-sm">

          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <WarehouseMark />
            <span style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 20, color: '#0f172a' }}>رفدي</span>
          </div>

          <div className="mb-7 text-right">
            <h2 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 26, color: '#0f172a', marginBottom: 6 }}>
              تسجيل الدخول
            </h2>
            <p style={{ color: '#64748b', fontSize: 14 }}>أدخل بياناتك للوصول إلى حسابك</p>
          </div>

          <div className="flex mb-6" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 4 }}>
            <button style={{ flex: 1, padding: '10px 0', borderRadius: 9, background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              تسجيل الدخول
            </button>
            <Link to="/register" style={{ flex: 1 }}>
              <button style={{ width: '100%', padding: '10px 0', borderRadius: 9, background: 'transparent', color: '#64748b', fontWeight: 500, fontSize: 14, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                حساب جديد
              </button>
            </Link>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl flex items-start gap-2.5 bg-red-50 border border-red-200">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-red-600 text-xs font-black">!</span>
              </div>
              <p className="font-semibold text-red-700 text-right text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="text-right">
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>البريد الإلكتروني</label>
              <div className="relative">
                <input type="text" placeholder="name@company.com"
                  style={{ width: '100%', padding: '11px 40px 11px 14px', borderRadius: 10, border: '1px solid #e2e8f0', outline: 'none', background: '#fff', fontSize: 14, color: '#0f172a', direction: 'rtl', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#2563eb'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  value={email} onChange={e => { setEmail(e.target.value); if (error) setError(''); }} />
                <Mail size={15} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              </div>
            </div>

            <div className="text-right">
              <div className="flex justify-between items-center mb-1.5">
                <Link to="/forgot-password" style={{ fontSize: 12, fontWeight: 600, color: '#2563eb', textDecoration: 'none' }}>نسيت كلمة المرور؟</Link>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>كلمة المرور</label>
              </div>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                  style={{ width: '100%', padding: '11px 40px', borderRadius: 10, border: '1px solid #e2e8f0', outline: 'none', background: '#fff', fontSize: 14, color: '#0f172a', direction: 'rtl', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#2563eb'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  value={password} onChange={e => { setPassword(e.target.value); if (error) setError(''); }} />
                <Lock size={15} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '12px 16px', borderRadius: 9, background: loading ? '#93c5fd' : '#2563eb', color: '#fff', fontWeight: 700, fontSize: 14.5, border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 18px -8px rgba(37,99,235,0.6)', marginTop: 8 }}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin block" />
                  جاري الدخول...
                </span>
              ) : (<>تسجيل الدخول <ArrowLeft size={16} /></>)}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 28 }}>
            © 2026 Rafdi Platform — جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;