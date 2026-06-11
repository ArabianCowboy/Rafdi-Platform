import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, ShieldCheck, Save, CheckCircle, KeyRound, Loader } from 'lucide-react';
import Navbar from '../components/Navbar';
import { API_URL, getHeaders } from '../config/api';

const getUserInfo = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return {};
    return JSON.parse(atob(token.split('.')[1]));
  } catch { return {}; }
};

function ProfilePage() {
  const navigate = useNavigate();
  const userInfo = getUserInfo();

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingCompany, setLoadingCompany] = useState(false);

  const roles = userInfo.roles || [];
  const isOwner = roles.includes('warehouse_owner');
  const isRenter = roles.includes('renter_company');

  const showSuccess = (msg) => { setSuccessMsg(msg); setErrorMsg(''); setTimeout(() => setSuccessMsg(''), 3000); };
  const showError = (msg) => { setErrorMsg(msg); setSuccessMsg(''); };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/me`, { headers: getHeaders(false) });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setCompanyName(data.company?.CompanyName || '');
          setEmail(data.Email || '');
        }
      } catch {}
      finally { setLoadingProfile(false); }
    };
    fetchProfile();
  }, []);

  const handleUpdateCompany = async (e) => {
    e.preventDefault();
    if (!companyName) { showError('يرجى إدخال اسم الشركة'); return; }
    setLoadingCompany(true);
    try {
      const res = await fetch(`${API_URL}/auth/profile/company`, {
        method: 'PATCH', headers: getHeaders(),
        body: JSON.stringify({ company_name: companyName }),
      });
      const data = await res.json();
      if (!res.ok) { showError(data.detail || 'حدث خطأ'); return; }
      setProfile(prev => ({ ...prev, company: { ...prev.company, CompanyName: companyName } }));
      showSuccess('تم تحديث اسم الشركة بنجاح ✓');
    } catch { showError('حدث خطأ في الاتصال');
    } finally { setLoadingCompany(false); }
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    if (!email) { showError('يرجى إدخال البريد الإلكتروني'); return; }
    setLoadingEmail(true);
    try {
      const res = await fetch(`${API_URL}/auth/profile/email`, {
        method: 'PATCH', headers: getHeaders(),
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { showError(data.detail || 'حدث خطأ'); return; }
      setProfile(prev => ({ ...prev, Email: email }));
      showSuccess('تم تحديث البريد الإلكتروني بنجاح ✓');
    } catch { showError('حدث خطأ في الاتصال');
    } finally { setLoadingEmail(false); }
  };

  const displayName = profile?.company?.CompanyName || userInfo.company_name || 'الملف الشخصي';
  const displayEmail = profile?.Email || userInfo.email || '—';
  const displayCR = profile?.company?.CommercialRegistration || '—';

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc',
    fontSize: 14, color: '#0f172a', direction: 'rtl', fontFamily: 'inherit',
    boxSizing: 'border-box', transition: 'border-color .15s, background .15s',
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]" dir="rtl" style={{ fontFamily: "'IBM Plex Sans Arabic', 'Tajawal', sans-serif" }}>

      <Navbar />

      {/* Header */}
      <div style={{ background: '#0d1b3e', position: 'relative', overflow: 'hidden' }} className="py-10 px-4">
        <div style={{
          position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 400,
          background: 'radial-gradient(ellipse, rgba(37,99,235,0.3), transparent 65%)',
          pointerEvents: 'none',
        }} />
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="flex items-center gap-4">
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: 'linear-gradient(135deg, #2563eb, #1e3a8a)',
              border: '2px solid rgba(255,255,255,0.15)',
              display: 'grid', placeItems: 'center', flexShrink: 0,
              boxShadow: '0 8px 24px -8px rgba(37,99,235,0.6)',
            }}>
              <span style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 24, color: '#fff' }}>
                {displayName.charAt(0)}
              </span>
            </div>
            <div className="text-right">
              <h1 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 20, color: '#fff', marginBottom: 4 }}>
                {displayName}
              </h1>
              <div className="flex items-center justify-end gap-2">
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>{displayEmail}</span>
                {isOwner && <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: 'rgba(37,99,235,0.3)', color: '#93c5fd', border: '1px solid rgba(37,99,235,0.4)' }}>مالك</span>}
                {isRenter && <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: 'rgba(16,185,129,0.2)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.3)' }}>مستأجر</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-8">

        {/* Alerts */}
        {successMsg && (
          <div className="mb-5 p-3.5 rounded-xl flex items-center gap-2.5 bg-emerald-50 border border-emerald-200">
            <CheckCircle size={15} color="#10b981" className="shrink-0" />
            <p style={{ fontSize: 13, fontWeight: 600, color: '#059669' }}>{successMsg}</p>
          </div>
        )}
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl flex items-start gap-2.5 bg-red-50 border border-red-200">
            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-red-600 text-xs font-black">!</span>
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#b91c1c' }}>{errorMsg}</p>
          </div>
        )}

        {loadingProfile ? (
          <div className="flex justify-center py-16">
            <Loader size={26} color="#2563eb" className="animate-spin" />
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden"
            style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 4px 16px -8px rgba(15,23,42,0.08)' }}>

            {/* ======= بيانات الشركة ======= */}
            <div className="p-6 text-right">
              <div className="flex items-center justify-end gap-2 mb-5">
                <h2 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 700, fontSize: 16, color: '#0f172a' }}>
                  بيانات الشركة
                </h2>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: '#eff6ff', display: 'grid', placeItems: 'center' }}>
                  <Building2 size={14} color="#2563eb" />
                </div>
              </div>

              {/* Info row */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #f1f5f9', textAlign: 'right' }}>
                  <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 3 }}>اسم الشركة</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{displayName}</p>
                </div>
                <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #f1f5f9', textAlign: 'right' }}>
                  <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 3 }}>السجل التجاري</p>
                  <p style={{ fontSize: 13, color: '#64748b', fontFamily: 'monospace' }}>{displayCR}</p>
                </div>
              </div>

              <form onSubmit={handleUpdateCompany}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                  تعديل اسم الشركة
                </label>
                <div className="flex gap-2">
                  <input type="text" value={companyName} placeholder="اسم الشركة"
                    style={{ ...inputStyle, flex: 1 }}
                    onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.background = '#fff'; }}
                    onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
                    onChange={e => { setCompanyName(e.target.value); setErrorMsg(''); }} />
                  <button type="submit" disabled={loadingCompany}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
                      padding: '10px 16px', borderRadius: 10, border: 'none',
                      background: loadingCompany ? '#93c5fd' : '#2563eb', color: '#fff',
                      fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                    {loadingCompany
                      ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin block" />
                      : <Save size={13} />}
                    حفظ
                  </button>
                </div>
              </form>
            </div>

            <div style={{ height: 1, background: '#f1f5f9' }} />

            {/* ======= البريد الإلكتروني ======= */}
            <div className="p-6 text-right">
              <div className="flex items-center justify-end gap-2 mb-5">
                <h2 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 700, fontSize: 16, color: '#0f172a' }}>
                  البريد الإلكتروني
                </h2>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: '#eff6ff', display: 'grid', placeItems: 'center' }}>
                  <Mail size={14} color="#2563eb" />
                </div>
              </div>

              <div className="mb-5" style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #f1f5f9' }}>
                <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 3 }}>البريد الحالي</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{displayEmail}</p>
              </div>

              <form onSubmit={handleUpdateEmail}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                  تعديل البريد الإلكتروني
                </label>
                <div className="flex gap-2">
                  <button type="submit" disabled={loadingEmail}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
                      padding: '10px 16px', borderRadius: 10, border: 'none',
                      background: loadingEmail ? '#93c5fd' : '#2563eb', color: '#fff',
                      fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                    {loadingEmail
                      ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin block" />
                      : <Save size={13} />}
                    حفظ
                  </button>
                  <input type="email" value={email} placeholder="name@company.com"
                    style={{ ...inputStyle, flex: 1 }}
                    onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.background = '#fff'; }}
                    onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
                    onChange={e => { setEmail(e.target.value); setErrorMsg(''); }} />
                </div>
              </form>
            </div>

            <div style={{ height: 1, background: '#f1f5f9' }} />

            {/* ======= معلومات الحساب ======= */}
            <div className="p-6 text-right">
              <div className="flex items-center justify-end gap-2 mb-5">
                <h2 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 700, fontSize: 16, color: '#0f172a' }}>
                  معلومات الحساب
                </h2>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: '#eff6ff', display: 'grid', placeItems: 'center' }}>
                  <ShieldCheck size={14} color="#2563eb" />
                </div>
              </div>

              <div className="space-y-0 divide-y divide-gray-50">
                <div className="flex justify-between items-center py-3">
                  <div className="flex gap-1.5">
                    {isOwner && <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 6, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #dbeafe' }}>مالك مستودع</span>}
                    {isRenter && <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 6, background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>مستأجر</span>}
                  </div>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>نوع الحساب</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span style={{ fontSize: 13, color: '#64748b', fontFamily: 'monospace' }}>{userInfo.user_id}</span>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>رقم المستخدم</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span style={{ fontSize: 13, color: '#64748b', fontFamily: 'monospace' }}>{userInfo.company_id}</span>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>رقم الشركة</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <button onClick={() => navigate('/forgot-password')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '8px 14px', borderRadius: 8,
                      border: '1px solid #e2e8f0', background: '#fff',
                      fontSize: 13, fontWeight: 600, color: '#475569',
                      cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.color = '#2563eb'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }}>
                    <KeyRound size={13} />
                    تغيير كلمة المرور
                  </button>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>الأمان</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-2xl mx-auto px-4 py-5 text-center">
          <span style={{ color: '#94a3b8', fontSize: 13 }}>© Rafdi Platform 2026</span>
        </div>
      </footer>
    </div>
  );
}

export default ProfilePage;