import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpLeft,
  Building2,
  CheckCircle,
  ChevronLeft,
  Loader,
  LogOut,
  Package,
  Shield,
  Users,
  Wallet,
} from 'lucide-react';
import NotificationBell from '../components/NotificationBell';
import { API_URL, getHeaders, apiFetch, logout } from '../config/api';

const tabs = [
  { key: 'dashboard', label: 'لوحة التحكم' },
  { key: 'companies', label: 'الشركات' },
  { key: 'warehouses', label: 'المستودعات' },
  { key: 'users', label: 'المستخدمون' },
];

const getToken = () => localStorage.getItem('token');

const getTokenPayload = () => {
  try {
    const token = getToken();
    if (!token) return null;
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
};

const isAdminToken = () => {
  const payload = getTokenPayload();
  return !!payload?.roles?.includes('admin');
};

const parseError = (detail) => {
  if (!detail) return 'حدث خطأ في الاتصال، حاول مرة أخرى';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map((item) => item.msg).filter(Boolean).join('، ');
  return 'حدث خطأ في الاتصال، حاول مرة أخرى';
};

const formatNumber = (value) => Number(value || 0).toLocaleString('ar-SA');

const formatCurrency = (value) => `${formatNumber(value)} ر.س`;

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('ar-SA');
};

const CompanyStatusBadge = ({ active }) => (
  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md border ${
    active
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : 'bg-red-50 text-red-600 border-red-200'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-red-500'}`} />
    {active ? 'نشطة' : 'معلقة'}
  </span>
);

const WarehouseStatusBadge = ({ active }) => (
  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md border ${
    active
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : 'bg-gray-100 text-gray-500 border-gray-200'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
    {active ? 'نشط' : 'معطل'}
  </span>
);

const RoleBadge = ({ role }) => {
  const labels = {
    admin: 'مدير',
    warehouse_owner: 'مالك مستودع',
    renter_company: 'شركة مستأجرة',
  };

  return (
    <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-semibold text-gray-600">
      {labels[role] || role}
    </span>
  );
};

const StatCard = ({ icon: Icon, label, value, accent }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-4 text-right">
    <div className="mb-3 flex items-center justify-between">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}>
        <Icon size={18} />
      </div>
      <p className="text-2xl font-black text-gray-900">{value}</p>
    </div>
    <p className="text-xs font-semibold text-gray-500">{label}</p>
  </div>
);

const EmptyState = ({ icon: Icon, title, actionLabel, onAction }) => (
  <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
    <Icon size={32} className="mx-auto mb-3 text-gray-300" />
    <p className="mb-4 text-sm font-medium text-gray-500">{title}</p>
    {actionLabel && onAction ? (
      <button
        onClick={onAction}
        className="inline-flex items-center gap-1.5 rounded-lg bg-[#1a3a5c] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#14304e]"
      >
        {actionLabel}
      </button>
    ) : null}
  </div>
);

function AdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboard, setDashboard] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingByTab, setLoadingByTab] = useState({
    dashboard: false,
    companies: false,
    warehouses: false,
    users: false,
  });
  const [loadedTabs, setLoadedTabs] = useState({
    dashboard: false,
    companies: false,
    warehouses: false,
    users: false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionPending, setActionPending] = useState('');

  const token = getToken();
  const payload = getTokenPayload();
  const isAuthorized = !!token && !!payload?.roles?.includes('admin');
  const companyName = payload?.company_name || payload?.name || payload?.email || 'مدير المنصة';

  const setTabLoading = (tab, loading) => {
    setLoadingByTab((current) => ({ ...current, [tab]: loading }));
  };

  const markTabLoaded = (tab) => {
    setLoadedTabs((current) => ({ ...current, [tab]: true }));
  };

  const fetchTabData = async (tab, force = false) => {
    if (!token) return;
    if (!force && loadedTabs[tab]) return;

    setTabLoading(tab, true);
    setError('');

    try {
      const res = await apiFetch(`${API_URL}/admin/${tab === 'dashboard' ? 'dashboard' : tab}`, {
        headers: getHeaders(false),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(parseError(data?.detail));
        return;
      }

      if (tab === 'dashboard') setDashboard(data);
      if (tab === 'companies') setCompanies(Array.isArray(data) ? data : []);
      if (tab === 'warehouses') setWarehouses(Array.isArray(data) ? data : []);
      if (tab === 'users') setUsers(Array.isArray(data) ? data : []);
      markTabLoaded(tab);
    } catch {
      setError('حدث خطأ في الاتصال، حاول مرة أخرى');
    } finally {
      setTabLoading(tab, false);
    }
  };

  useEffect(() => {
    if (!token || !isAdminToken()) {
      navigate('/login', { replace: true });
    }
  }, [navigate, token]);

  useEffect(() => {
    if (!isAuthorized) return undefined;

    const timeoutId = window.setTimeout(() => {
      void fetchTabData(activeTab);
    }, 0);

    return () => window.clearTimeout(timeoutId);
    // fetchTabData reads loadedTabs internally to avoid redundant fetches
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isAuthorized]);

  const handleLogout = () => {
    logout();
  };

  const handleCompanyStatus = async (company) => {
    if (!token) return;
    const nextStatus = !company.Status;
    const pendingKey = `company-${company.CompanyID}`;

    setActionPending(pendingKey);
    setError('');
    setSuccess('');

    try {
      const res = await apiFetch(`${API_URL}/admin/companies/${company.CompanyID}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ Status: nextStatus }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(parseError(data?.detail));
        return;
      }

      setSuccess(nextStatus ? 'تم تفعيل الشركة بنجاح' : 'تم تعليق الشركة بنجاح');
      await fetchTabData('companies', true);
    } catch {
      setError('حدث خطأ في الاتصال، حاول مرة أخرى');
    } finally {
      setActionPending('');
    }
  };

  const handleWarehouseStatus = async (warehouse) => {
    if (!token) return;
    const nextStatus = !warehouse.IsActive;
    const pendingKey = `warehouse-${warehouse.WarehouseID}`;

    setActionPending(pendingKey);
    setError('');
    setSuccess('');

    try {
      const res = await apiFetch(`${API_URL}/admin/warehouses/${warehouse.WarehouseID}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ IsActive: nextStatus }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(parseError(data?.detail));
        return;
      }

      setSuccess(nextStatus ? 'تم تفعيل المستودع بنجاح' : 'تم تعطيل المستودع بنجاح');
      await fetchTabData('warehouses', true);
    } catch {
      setError('حدث خطأ في الاتصال، حاول مرة أخرى');
    } finally {
      setActionPending('');
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#f7f8fa]" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>
        <div className="flex min-h-screen items-center justify-center">
          <Loader size={28} className="animate-spin text-[#1a3a5c]" />
        </div>
      </div>
    );
  }

  const isLoading = loadingByTab[activeTab];

  return (
    <div className="min-h-screen bg-[#f7f8fa]" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/home')}
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 transition-colors hover:text-gray-800"
            >
              <ChevronLeft size={16} className="rotate-180" />
              رجوع
            </button>
            <div className="h-4 w-px bg-gray-200" />
            <div className="flex cursor-pointer items-center gap-2" onClick={() => setActiveTab('dashboard')}>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1a3a5c]">
                <span className="text-xs font-black text-white">ر</span>
              </div>
              <span className="text-base font-black text-[#1a3a5c]">رفدي</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="hidden items-center gap-2 border-r border-gray-200 pr-3 md:flex">
              <span className="max-w-[180px] truncate text-sm font-semibold text-gray-700">{companyName}</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a3a5c]">
                <span className="text-xs font-bold text-white">{companyName.charAt(0)}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-red-600"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      <div className="bg-[#1a3a5c] px-4 py-8">
        <div className="mx-auto max-w-6xl text-right">
          <h1 className="mb-1 text-xl font-black text-white">إدارة المنصة</h1>
          <p className="text-sm text-blue-200">متابعة الشركات والمستودعات والمستخدمين من لوحة واحدة</p>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-lg px-3 py-1.5 text-sm font-bold transition-colors ${
                  activeTab === tab.key
                    ? 'bg-[#1a3a5c] text-white'
                    : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchTabData(activeTab, true)}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-800"
          >
            <ArrowUpLeft size={14} />
            تحديث البيانات
          </button>
        </div>

        {error ? (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm">
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100">
              <span className="text-xs font-black text-red-600">!</span>
            </div>
            <p className="text-right font-semibold text-red-700">{error}</p>
          </div>
        ) : null}

        {success ? (
          <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm">
            <CheckCircle size={15} className="shrink-0 text-emerald-600" />
            <span className="font-semibold text-emerald-700">{success}</span>
          </div>
        ) : null}

        {activeTab === 'dashboard' ? (
          isLoading ? (
            <div className="flex justify-center py-20">
              <Loader size={26} className="animate-spin text-[#1a3a5c]" />
            </div>
          ) : dashboard ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
              <StatCard icon={Building2} label="إجمالي الشركات" value={formatNumber(dashboard.total_companies)} accent="bg-blue-50 text-[#1a3a5c]" />
              <StatCard icon={Package} label="إجمالي المستودعات" value={formatNumber(dashboard.total_warehouses)} accent="bg-gray-100 text-gray-600" />
              <StatCard icon={Shield} label="المستودعات النشطة" value={formatNumber(dashboard.active_warehouses)} accent="bg-emerald-50 text-emerald-600" />
              <StatCard icon={Users} label="إجمالي الحجوزات" value={formatNumber(dashboard.total_bookings)} accent="bg-amber-50 text-amber-700" />
              <StatCard icon={Wallet} label="إجمالي الإيرادات" value={formatCurrency(dashboard.total_payments)} accent="bg-emerald-50 text-emerald-600" />
            </div>
          ) : (
            <EmptyState icon={Shield} title="لا توجد بيانات للوحة التحكم حالياً" actionLabel="إعادة المحاولة" onAction={() => fetchTabData('dashboard', true)} />
          )
        ) : null}

        {activeTab === 'companies' ? (
          isLoading ? (
            <div className="flex justify-center py-20">
              <Loader size={26} className="animate-spin text-[#1a3a5c]" />
            </div>
          ) : companies.length === 0 ? (
            <EmptyState icon={Building2} title="لا توجد شركات مسجلة حالياً" actionLabel="تحديث" onAction={() => fetchTabData('companies', true)} />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
              <table className="min-w-full text-right">
                <thead className="bg-[#f9fafb] text-xs font-bold text-gray-500">
                  <tr>
                    <th className="px-4 py-3">اسم الشركة</th>
                    <th className="px-4 py-3">السجل التجاري</th>
                    <th className="px-4 py-3">الحالة</th>
                    <th className="px-4 py-3">الأعضاء</th>
                    <th className="px-4 py-3">المستودعات</th>
                    <th className="px-4 py-3">حجوزات كمستأجر</th>
                    <th className="px-4 py-3">حجوزات على المستودعات</th>
                    <th className="px-4 py-3">تاريخ الانضمام</th>
                    <th className="px-4 py-3">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                  {companies.map((company) => {
                    const pending = actionPending === `company-${company.CompanyID}`;
                    const isActive = !!company.Status;

                    return (
                      <tr key={company.CompanyID} className="hover:bg-gray-50/70">
                        <td className="px-4 py-3 font-bold text-gray-900">{company.Name || 'شركة غير محددة'}</td>
                        <td className="px-4 py-3 text-gray-500">{company.CommercialRegistration || '—'}</td>
                        <td className="px-4 py-3"><CompanyStatusBadge active={isActive} /></td>
                        <td className="px-4 py-3">{formatNumber(company.total_users)}</td>
                        <td className="px-4 py-3">{formatNumber(company.total_warehouses)}</td>
                        <td className="px-4 py-3">{formatNumber(company.total_bookings_as_renter)}</td>
                        <td className="px-4 py-3">{formatNumber(company.total_bookings_on_warehouses)}</td>
                        <td className="px-4 py-3 text-gray-500">{formatDate(company.CreatedAt)}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleCompanyStatus(company)}
                            disabled={pending}
                            className={`inline-flex min-w-[92px] items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-60 ${
                              isActive
                                ? 'border-red-200 text-red-600 hover:bg-red-50'
                                : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {pending ? <span className="block h-3.5 w-3.5 rounded-full border border-current border-t-transparent animate-spin" /> : null}
                            {isActive ? 'تعليق' : 'تفعيل'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : null}

        {activeTab === 'warehouses' ? (
          isLoading ? (
            <div className="flex justify-center py-20">
              <Loader size={26} className="animate-spin text-[#1a3a5c]" />
            </div>
          ) : warehouses.length === 0 ? (
            <EmptyState icon={Package} title="لا توجد مستودعات متاحة في النظام حالياً" actionLabel="تحديث" onAction={() => fetchTabData('warehouses', true)} />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
              <table className="min-w-full text-right">
                <thead className="bg-[#f9fafb] text-xs font-bold text-gray-500">
                  <tr>
                    <th className="px-4 py-3">اسم المستودع</th>
                    <th className="px-4 py-3">الشركة المالكة</th>
                    <th className="px-4 py-3">الموقع</th>
                    <th className="px-4 py-3">المساحة</th>
                    <th className="px-4 py-3">السعر اليومي</th>
                    <th className="px-4 py-3">الحالة</th>
                    <th className="px-4 py-3">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                  {warehouses.map((warehouse) => {
                    const pending = actionPending === `warehouse-${warehouse.WarehouseID}`;
                    const ownerName = warehouse.company?.Name || warehouse.company?.CompanyName || 'شركة غير محددة';

                    return (
                      <tr key={warehouse.WarehouseID} className="hover:bg-gray-50/70">
                        <td className="px-4 py-3 font-bold text-gray-900">{warehouse.Name || `مستودع #${warehouse.WarehouseID}`}</td>
                        <td className="px-4 py-3 text-gray-500">{ownerName}</td>
                        <td className="px-4 py-3 text-gray-500">{warehouse.Location || '—'}</td>
                        <td className="px-4 py-3">{warehouse.Size ? `${formatNumber(warehouse.Size)} م²` : '—'}</td>
                        <td className="px-4 py-3">{formatCurrency(warehouse.PricePerDay)}</td>
                        <td className="px-4 py-3"><WarehouseStatusBadge active={warehouse.IsActive} /></td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleWarehouseStatus(warehouse)}
                            disabled={pending}
                            className={`inline-flex min-w-[92px] items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-60 ${
                              warehouse.IsActive
                                ? 'border-red-200 text-red-600 hover:bg-red-50'
                                : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {pending ? <span className="block h-3.5 w-3.5 rounded-full border border-current border-t-transparent animate-spin" /> : null}
                            {warehouse.IsActive ? 'تعطيل' : 'تفعيل'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : null}

        {activeTab === 'users' ? (
          isLoading ? (
            <div className="flex justify-center py-20">
              <Loader size={26} className="animate-spin text-[#1a3a5c]" />
            </div>
          ) : users.length === 0 ? (
            <EmptyState icon={Users} title="لا يوجد مستخدمون مسجلون حالياً" actionLabel="تحديث" onAction={() => fetchTabData('users', true)} />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
              <table className="min-w-full text-right">
                <thead className="bg-[#f9fafb] text-xs font-bold text-gray-500">
                  <tr>
                    <th className="px-4 py-3">البريد الإلكتروني</th>
                    <th className="px-4 py-3">الشركة</th>
                    <th className="px-4 py-3">الأدوار</th>
                    <th className="px-4 py-3">رقم المستخدم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                  {users.map((user) => (
                    <tr key={user.UserID} className="hover:bg-gray-50/70">
                      <td className="px-4 py-3 font-medium text-gray-900">{user.Email}</td>
                      <td className="px-4 py-3 text-gray-500">{user.CompanyName || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap justify-end gap-1.5">
                          {(user.Roles || []).length > 0 ? user.Roles.map((role) => <RoleBadge key={role} role={role} />) : '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">#{user.UserID}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : null}
      </main>

      <footer className="mt-12 border-t border-gray-200 bg-white py-5">
        <p className="text-center text-xs text-gray-400">© 2026 Rafdi Platform — جميع الحقوق محفوظة</p>
      </footer>
    </div>
  );
}

export default AdminPage;
