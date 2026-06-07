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
    border: '1px solid #e2e8f0', outline: 'none', background: '#fff',
    fontSize: 14, color: '#0f172a', direction: 'rtl', fontFamily: 'inherit',
    boxSizing: 'border-box', transition: 'border-color .15s',
  };

  const btnStyle = (loading) => ({
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '9px 18px', borderRadius: 9, border: 'none', cursor: 'pointer',
    background: loading ? '#93c5fd' : '#2563eb', color: '#fff',
    fontWeight: 600, fontSize: 14, fontFamily: 'inherit',
    boxShadow: '0 6px 14px -6px rgba(37,99,235,0.5)',
    opacity: loading ? 0.7 : 1,
  });

  return (
    <div className="min-h-screen bg-[#f8fafc]" dir="rtl" style={{ fontFamily: "'IBM Plex Sans Arabic', 'Tajawal', sans-serif" }}>

      <Navbar />

      {/* Header */}
      <div style={{ background: '#0d1b3e' }} className="py-8 px-4">
        <div className="max-w-3xl mx-auto text-right">
          <div className="flex items-center justify-end gap-4">
            <div>
              <h1 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 22, color: '#fff' }}>
                {displayName}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: 14, marginTop: 4 }}>{displayEmail}</p>
            </div>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              display: 'grid', placeItems: 'center',
            }}>
              <span style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 22, color: '#fff' }}>
                {displayName.charAt(0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-4">

        {/* Alerts */}
        {successMsg && (
          <div className="p-3.5 rounded-xl flex items-center gap-2.5 bg-emerald-50 border border-emerald-200">
            <CheckCircle size={16} className="text-emerald-600 shrink-0" />
            <p style={{ fontSize: 13, fontWeight: 600, color: '#059669' }}>{successMsg}</p>
          </div>
        )}
        {errorMsg && (
          <div className="p-3.5 rounded-xl flex items-start gap-2.5 bg-red-50 border border-red-200">
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
          <>
            {/* Company Info */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 text-right"
              style={{ boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}>
              <div className="flex items-center justify-end gap-2 mb-4">
                <h2 style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>بيانات الشركة</h2>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eff6ff', display: 'grid', placeItems: 'center' }}>
                  <Building2 size={15} color="#2563eb" />
                </div>
              </div>

              <div className="space-y-2 mb-5 p-3.5 rounded-xl" style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                <div className="flex justify-between items-center">
                  <span style={{ fontSize: 14, color: '#0f172a', fontWeight: 600 }}>{displayName}</span>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>اسم الشركة الحالي</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span style={{ fontSize: 13, color: '#64748b', fontFamily: 'monospace' }}>{displayCR}</span>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>السجل التجاري</span>
                </div>
              </div>

              <form onSubmit={handleUpdateCompany} className="space-y-3">
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                    تعديل اسم الشركة
                  </label>
                  <input type="text" value={companyName} placeholder="اسم الشركة"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#2563eb'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                    onChange={e => { setCompanyName(e.target.value); setErrorMsg(''); }} />
                </div>
                <button type="submit" disabled={loadingCompany} style={btnStyle(loadingCompany)}>
                  {loadingCompany ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin block" /> : <Save size={14} />}
                  حفظ اسم الشركة
                </button>
              </form>
            </div>

            {/* Email */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 text-right"
              style={{ boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}>
              <div className="flex items-center justify-end gap-2 mb-4">
                <h2 style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>البريد الإلكتروني</h2>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eff6ff', display: 'grid', placeItems: 'center' }}>
                  <Mail size={15} color="#2563eb" />
                </div>
              </div>

              <div className="mb-5 p-3.5 rounded-xl" style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                <div className="flex justify-between items-center">
                  <span style={{ fontSize: 14, color: '#0f172a', fontWeight: 600 }}>{displayEmail}</span>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>البريد الحالي</span>
                </div>
              </div>

              <form onSubmit={handleUpdateEmail} className="space-y-3">
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                    تعديل البريد الإلكتروني
                  </label>
                  <input type="email" value={email} placeholder="name@company.com"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#2563eb'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                    onChange={e => { setEmail(e.target.value); setErrorMsg(''); }} />
                </div>
                <button type="submit" disabled={loadingEmail} style={btnStyle(loadingEmail)}>
                  {loadingEmail ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin block" /> : <Save size={14} />}
                  حفظ البريد الإلكتروني
                </button>
              </form>
            </div>

            {/* Account Info */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 text-right"
              style={{ boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}>
              <div className="flex items-center justify-end gap-2 mb-4">
                <h2 style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>معلومات الحساب</h2>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eff6ff', display: 'grid', placeItems: 'center' }}>
                  <ShieldCheck size={15} color="#2563eb" />
                </div>
              </div>

              <div className="space-y-0 divide-y divide-gray-50 mb-4">
                <div className="flex justify-between items-center py-2.5">
                  <div className="flex gap-1.5">
                    {isOwner && (
                      <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 6, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #dbeafe' }}>
                        مالك مستودع
                      </span>
                    )}
                    {isRenter && (
                      <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 6, background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>
                        مستأجر
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>نوع الحساب</span>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span style={{ fontSize: 13, color: '#64748b', fontFamily: 'monospace' }}>{userInfo.user_id}</span>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>رقم المستخدم</span>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span style={{ fontSize: 13, color: '#64748b', fontFamily: 'monospace' }}>{userInfo.company_id}</span>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>رقم الشركة</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <button onClick={() => navigate('/forgot-password')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '9px 16px', borderRadius: 9,
                      border: '1px solid #e2e8f0', background: '#fff',
                      fontSize: 13, fontWeight: 600, color: '#475569',
                      cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.color = '#2563eb'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }}>
                    <KeyRound size={14} />
                    تغيير كلمة المرور
                  </button>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>الأمان</span>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-3xl mx-auto px-4 py-5 text-center">
          <span style={{ color: '#64748b', fontSize: 13 }}>© Rafdi Platform 2026</span>
        </div>
      </footer>
    </div>
  );
}

export default ProfilePage;