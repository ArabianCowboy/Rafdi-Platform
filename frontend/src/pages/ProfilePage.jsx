import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Building2, Mail, ShieldCheck, Save, CheckCircle, KeyRound } from 'lucide-react';

const API_URL = 'https://api.rafdi.com';

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

  const [companyName, setCompanyName] = useState(userInfo.company_name || '');
  const [email, setEmail] = useState(userInfo.email || '');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingCompany, setLoadingCompany] = useState(false);

  const token = localStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const showSuccess = (msg) => { setSuccessMsg(msg); setErrorMsg(''); setTimeout(() => setSuccessMsg(''), 3000); };
  const showError = (msg) => { setErrorMsg(msg); setSuccessMsg(''); };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    if (!email) { showError('يرجى إدخال البريد الإلكتروني'); return; }
    setLoadingEmail(true);
    try {
      const res = await fetch(`${API_URL}/auth/profile/email`, {
        method: 'PATCH', headers,
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { showError(data.detail || 'حدث خطأ'); return; }
      showSuccess('تم تحديث البريد الإلكتروني بنجاح ✓');
    } catch { showError('حدث خطأ في الاتصال');
    } finally { setLoadingEmail(false); }
  };

  const handleUpdateCompany = async (e) => {
    e.preventDefault();
    if (!companyName) { showError('يرجى إدخال اسم الشركة'); return; }
    setLoadingCompany(true);
    try {
      const res = await fetch(`${API_URL}/auth/profile/company`, {
        method: 'PATCH', headers,
        body: JSON.stringify({ company_name: companyName }),
      });
      const data = await res.json();
      if (!res.ok) { showError(data.detail || 'حدث خطأ'); return; }
      showSuccess('تم تحديث اسم الشركة بنجاح ✓');
    } catch { showError('حدث خطأ في الاتصال');
    } finally { setLoadingCompany(false); }
  };

  const roles = userInfo.roles || [];
  const isOwner = roles.includes('warehouse_owner');
  const isRenter = roles.includes('renter_company');

  return (
    <div className="min-h-screen bg-[#f7f8fa]" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>

      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center gap-4 h-14">
            <button onClick={() => navigate('/home')}
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors">
              <ChevronLeft size={16} className="rotate-180" />
              رجوع
            </button>
            <div className="h-4 w-px bg-gray-200" />
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/home')}>
              <div className="w-7 h-7 rounded-lg bg-[#1a3a5c] flex items-center justify-center">
                <span className="text-white font-black text-xs">ر</span>
              </div>
              <span className="text-[#1a3a5c] font-black text-base">رفدي</span>
            </div>
          </div>
        </div>
      </header>

      {/* Header */}
      <div className="bg-[#1a3a5c] py-8 px-4">
        <div className="max-w-3xl mx-auto text-right">
          <div className="flex items-center justify-end gap-4">
            <div>
              <h1 className="text-xl font-black text-white">{userInfo.company_name || 'الملف الشخصي'}</h1>
              <p className="text-blue-200 text-sm mt-0.5">{userInfo.email}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
              <span className="text-white font-black text-2xl">
                {(userInfo.company_name || 'م').charAt(0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-4">

        {/* Alerts */}
        {successMsg && (
          <div className="p-3.5 rounded-xl flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-right">
            <CheckCircle size={16} className="text-emerald-600 shrink-0" />
            <p className="text-sm font-semibold text-emerald-700">{successMsg}</p>
          </div>
        )}
        {errorMsg && (
          <div className="p-3.5 rounded-xl flex items-start gap-2.5 bg-red-50 border border-red-200 text-right">
            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-red-600 text-xs font-black">!</span>
            </div>
            <p className="text-sm font-semibold text-red-700">{errorMsg}</p>
          </div>
        )}

        {/* Company Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 text-right">
          <div className="flex items-center justify-end gap-2 mb-4">
            <h2 className="font-bold text-gray-900 text-sm">بيانات الشركة</h2>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Building2 size={15} className="text-[#1a3a5c]" />
            </div>
          </div>

          {/* عرض البيانات الحالية */}
          <div className="space-y-2 mb-5 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700 font-semibold">{userInfo.company_name || '—'}</span>
              <span className="text-xs text-gray-400">اسم الشركة الحالي</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <span className="text-sm text-gray-500 font-mono">{userInfo.commercial_registration || '—'}</span>
              <span className="text-xs text-gray-400">السجل التجاري</span>
            </div>
          </div>

          <form onSubmit={handleUpdateCompany} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">تعديل اسم الشركة</label>
              <input type="text" value={companyName}
                onChange={e => { setCompanyName(e.target.value); setErrorMsg(''); }}
                className="w-full py-2.5 px-3.5 rounded-xl text-sm font-medium text-right bg-white border border-gray-200 outline-none focus:border-[#1a3a5c] transition-colors text-gray-900"
                placeholder="اسم الشركة" />
            </div>
            <button type="submit" disabled={loadingCompany}
              className="flex items-center gap-2 px-4 py-2 bg-[#1a3a5c] hover:bg-[#14304e] text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-60">
              {loadingCompany ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin block" /> : <Save size={14} />}
              حفظ اسم الشركة
            </button>
          </form>
        </div>

        {/* Email */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 text-right">
          <div className="flex items-center justify-end gap-2 mb-4">
            <h2 className="font-bold text-gray-900 text-sm">البريد الإلكتروني</h2>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Mail size={15} className="text-[#1a3a5c]" />
            </div>
          </div>

          {/* البريد الحالي */}
          <div className="mb-5 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700 font-semibold">{userInfo.email || '—'}</span>
              <span className="text-xs text-gray-400">البريد الحالي</span>
            </div>
          </div>

          <form onSubmit={handleUpdateEmail} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">تعديل البريد الإلكتروني</label>
              <input type="email" value={email}
                onChange={e => { setEmail(e.target.value); setErrorMsg(''); }}
                className="w-full py-2.5 px-3.5 rounded-xl text-sm font-medium text-right bg-white border border-gray-200 outline-none focus:border-[#1a3a5c] transition-colors text-gray-900"
                placeholder="name@company.com" />
            </div>
            <button type="submit" disabled={loadingEmail}
              className="flex items-center gap-2 px-4 py-2 bg-[#1a3a5c] hover:bg-[#14304e] text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-60">
              {loadingEmail ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin block" /> : <Save size={14} />}
              حفظ البريد الإلكتروني
            </button>
          </form>
        </div>

        {/* Account Info + تغيير كلمة السر */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 text-right">
          <div className="flex items-center justify-end gap-2 mb-4">
            <h2 className="font-bold text-gray-900 text-sm">معلومات الحساب</h2>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <ShieldCheck size={15} className="text-[#1a3a5c]" />
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <div className="flex gap-1.5">
                {isOwner && <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">مالك مستودع</span>}
                {isRenter && <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">مستأجر</span>}
              </div>
              <span className="text-xs text-gray-400">نوع الحساب</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm font-mono text-gray-600">{userInfo.user_id}</span>
              <span className="text-xs text-gray-400">رقم المستخدم</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-mono text-gray-500">{userInfo.company_id}</span>
              <span className="text-xs text-gray-400">رقم الشركة</span>
            </div>
          </div>

          {/* تغيير كلمة السر */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <button onClick={() => navigate('/forgot-password')}
                className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:border-[#1a3a5c] hover:text-[#1a3a5c] transition-colors">
                <KeyRound size={14} />
                تغيير كلمة المرور
              </button>
              <span className="text-xs text-gray-400">الأمان</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 mt-12 py-5 bg-white">
        <p className="text-center text-xs text-gray-400">© 2026 Rafdi Platform — جميع الحقوق محفوظة</p>
      </footer>
    </div>
  );
}

export default ProfilePage;