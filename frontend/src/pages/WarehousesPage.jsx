import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, MapPin, Package, Edit2, Power, X, Loader, Save, ImagePlus, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import { API_URL, getHeaders } from '../config/api';

const CLOUDINARY_CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD;
const CLOUDINARY_PRESET = import.meta.env.VITE_CLOUDINARY_PRESET;

const getUserRoles = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return [];
    return JSON.parse(atob(token.split('.')[1])).roles || [];
  } catch { return []; }
};

const getCompanyId = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return JSON.parse(atob(token.split('.')[1])).company_id;
  } catch { return null; }
};

const parseError = (detail) => {
  if (!detail) return 'حدث خطأ';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map(e => e.msg).join(', ');
  return 'حدث خطأ';
};

const emptyForm = { Name: '', Location: '', Size: '', PricePerDay: '', Description: '', IsActive: true, ImagePath: '' };

const StatusBadge = ({ active }) => (
  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md ${
    active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500 border border-gray-200'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
    {active ? 'نشط' : 'معطل'}
  </span>
);

function WarehousesPage() {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editWarehouse, setEditWarehouse] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const roles = getUserRoles();
  const isOwner = roles.includes('warehouse_owner');

  useEffect(() => { fetchWarehouses(); }, []);

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/warehouses/my`, { headers: getHeaders(false) });
      if (res.ok) setWarehouses(await res.json());
    } catch (err) {
      console.error('فشل تحميل المستودعات', err);
    } finally { setLoading(false); }
  };

  const openCreate = () => { setForm(emptyForm); setEditWarehouse(null); setError(''); setShowModal(true); };
  const openEdit = (w) => {
    setForm({ Name: w.Name, Location: w.Location, Size: w.Size, PricePerDay: w.PricePerDay, Description: w.Description || '', IsActive: w.IsActive, ImagePath: w.ImagePath || '' });
    setEditWarehouse(w); setError(''); setShowModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('يرجى اختيار صورة صحيحة'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('حجم الصورة يجب أن يكون أقل من 5MB'); return; }
    setUploading(true); setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_PRESET);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.secure_url) setForm(prev => ({ ...prev, ImagePath: data.secure_url }));
      else setError('فشل رفع الصورة، حاول مرة أخرى');
    } catch { setError('حدث خطأ أثناء رفع الصورة');
    } finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (!form.Name) { setError('يرجى إدخال اسم المستودع'); return; }
    if (!form.Location) { setError('يرجى إدخال الموقع'); return; }
    if (!form.Size || form.Size <= 0) { setError('يرجى إدخال مساحة صحيحة'); return; }
    if (!form.PricePerDay || form.PricePerDay <= 0) { setError('يرجى إدخال سعر صحيح'); return; }
    setSubmitting(true);
    try {
      const url = editWarehouse ? `${API_URL}/warehouses/${editWarehouse.WarehouseID}` : `${API_URL}/warehouses/`;
      const method = editWarehouse ? 'PATCH' : 'POST';
      const body = editWarehouse
        ? { ...form, Size: parseFloat(form.Size), PricePerDay: parseFloat(form.PricePerDay) }
        : { ...form, CompanyID: getCompanyId(), Size: parseFloat(form.Size), PricePerDay: parseFloat(form.PricePerDay) };
      const res = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setError(parseError(data.detail)); return; }
      setSuccess(editWarehouse ? 'تم تعديل المستودع بنجاح' : 'تم إنشاء المستودع بنجاح');
      setShowModal(false); fetchWarehouses();
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError('حدث خطأ في الاتصال');
    } finally { setSubmitting(false); }
  };

  const handleToggle = async (w) => {
    try {
      const res = await fetch(`${API_URL}/warehouses/${w.WarehouseID}/toggle`, { method: 'PATCH', headers: getHeaders(false) });
      if (res.ok) fetchWarehouses();
      else setError('فشل تغيير حالة المستودع، حاول مرة أخرى');
    } catch {
      setError('حدث خطأ في الاتصال، حاول مرة أخرى');
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    border: '1px solid #e2e8f0', outline: 'none', background: '#fff',
    fontSize: 14, color: '#0f172a', direction: 'rtl', fontFamily: 'inherit',
    boxSizing: 'border-box', transition: 'border-color .15s',
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]" dir="rtl" style={{ fontFamily: "'IBM Plex Sans Arabic', 'Tajawal', sans-serif" }}>

      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, direction: 'rtl' }}>
          {/* يمين */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {isOwner && (
              <button onClick={openCreate} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 18px', background: '#2563eb', color: '#fff',
                fontWeight: 600, fontSize: 14, borderRadius: 9, border: 'none',
                cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 6px 16px -6px rgba(37,99,235,0.55)',
              }}>
                <Plus size={15} />
                إضافة مستودع
              </button>
            )}
            <br></br>
            <div style={{ textAlign: 'right' }}>
              <h1 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 22, color: '#0f172a' }}>
                إدارة المستودعات
              </h1>
              <p style={{ fontSize: 13, color: '#64748b', marginTop: 3 }}>{warehouses.length} مستودع مسجل</p>
            </div>
          </div>
          <div />
        </div>

        {success && (
          <div className="mb-5 p-3.5 rounded-xl flex items-center gap-2.5 bg-emerald-50 border border-emerald-200">
            <CheckCircle size={15} className="text-emerald-600 shrink-0" />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#059669' }}>{success}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader size={26} color="#2563eb" className="animate-spin" />
          </div>
        ) : warehouses.length === 0 ? (
          <div className="text-center py-20 bg-white border border-dashed border-gray-300 rounded-xl">
            <Building2 size={36} className="text-gray-300 mx-auto mb-3" />
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 14 }}>لم تضف أي مستودع بعد</p>
            {isOwner && (
              <button onClick={openCreate} style={{
                padding: '9px 20px', background: '#2563eb', color: '#fff',
                fontWeight: 600, fontSize: 14, borderRadius: 9, border: 'none',
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
                أضف مستودعك الأول
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {warehouses.map((w) => (
              <div key={w.WarehouseID} dir="rtl"
                className="bg-white border border-gray-200 rounded-xl overflow-hidden transition-all"
                style={{ boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.boxShadow = '0 4px 12px -4px rgba(15,23,42,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(15,23,42,0.04)'; }}>
                <div className="h-44 relative bg-gray-100 overflow-hidden">
                  {w.ImagePath ? (
                    <img src={w.ImagePath} alt={w.Name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 size={36} color="#cbd5e1" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <StatusBadge active={w.IsActive} />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent px-4 py-3">
                    <p className="text-white font-bold text-base leading-none text-right">
                      {w.PricePerDay?.toLocaleString()}
                      <span className="text-white/70 text-xs font-normal mr-1">ر.س / يوم</span>
                    </p>
                  </div>
                </div>
                <div className="p-4 text-right">
                  <h3 style={{ fontWeight: 700, fontSize: 14.5, color: '#0f172a', marginBottom: 8 }}>{w.Name}</h3>
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: '#64748b' }}>
                      <MapPin size={11} color="#94a3b8" className="shrink-0" />
                      <span>{w.Location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: '#64748b' }}>
                      <Package size={11} color="#94a3b8" className="shrink-0" />
                      <span>{w.Size?.toLocaleString()} م²</span>
                    </div>
                  </div>
                  {w.Description && (
                    <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6, marginBottom: 10 }} className="line-clamp-2">
                      {w.Description}
                    </p>
                  )}
                  {isOwner && (
                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      <button onClick={() => openEdit(w)}
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          padding: '8px 0', borderRadius: 8, fontSize: 12, fontWeight: 600,
                          border: '1px solid #e2e8f0', color: '#475569', background: '#fff',
                          cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.color = '#2563eb'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }}>
                        <Edit2 size={13} />
                        تعديل
                      </button>
                      <button onClick={() => handleToggle(w)}
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          padding: '8px 0', borderRadius: 8, fontSize: 12, fontWeight: 600,
                          border: w.IsActive ? '1px solid #fecaca' : '1px solid #a7f3d0',
                          color: w.IsActive ? '#ef4444' : '#10b981',
                          background: '#fff', cursor: 'pointer', fontFamily: 'inherit',
                        }}>
                        <Power size={13} />
                        {w.IsActive ? 'تعطيل' : 'تفعيل'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 overflow-hidden max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100" dir="rtl">
              <div>
                <h3 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 16, color: '#0f172a' }}>
                  {editWarehouse ? 'تعديل المستودع' : 'إضافة مستودع جديد'}
                </h3>
                {editWarehouse && <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{editWarehouse.Name}</p>}
              </div>
              <button onClick={() => setShowModal(false)}
                style={{ width: 28, height: 28, borderRadius: 8, background: '#f1f5f9', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center', color: '#64748b' }}>
                <X size={15} />
              </button>
            </div>

            <div className="p-5">
              {error && (
                <div className="mb-4 p-3.5 rounded-xl flex items-start gap-2.5 bg-red-50 border border-red-200">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-red-600 text-xs font-black">!</span>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#b91c1c' }}>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-right">

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                    صورة المستودع
                  </label>
                  {form.ImagePath ? (
                    <div className="relative h-36 rounded-xl overflow-hidden border border-gray-200 mb-2">
                      <img src={form.ImagePath} alt="preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setForm(prev => ({ ...prev, ImagePath: '' }))}
                        style={{ position: 'absolute', top: 8, left: 8, width: 24, height: 24, borderRadius: '50%', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                        <X size={12} />
                      </button>
                      <div style={{ position: 'absolute', bottom: 8, right: 8, background: '#10b981', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle size={11} /> تم الرفع
                      </div>
                    </div>
                  ) : (
                    <label style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      height: 136, borderRadius: 12, border: `2px dashed ${uploading ? '#93c5fd' : '#e2e8f0'}`,
                      background: uploading ? '#eff6ff' : '#fff', cursor: 'pointer', transition: 'all .15s',
                    }}>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                      {uploading ? (
                        <>
                          <Loader size={24} color="#2563eb" className="animate-spin" style={{ marginBottom: 8 }} />
                          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>جاري الرفع...</span>
                        </>
                      ) : (
                        <>
                          <ImagePlus size={24} color="#cbd5e1" style={{ marginBottom: 8 }} />
                          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>اضغط لرفع صورة</span>
                          <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>PNG, JPG حتى 5MB</span>
                        </>
                      )}
                    </label>
                  )}
                </div>

                {[
                  { label: 'اسم المستودع', key: 'Name', placeholder: 'مستودع الرياض الرئيسي' },
                  { label: 'الموقع', key: 'Location', placeholder: 'الرياض، حي العارض' },
                ].map((field) => (
                  <div key={field.key}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                      {field.label}
                    </label>
                    <input type="text" placeholder={field.placeholder} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#2563eb'}
                      onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                      value={form[field.key]}
                      onChange={e => { setForm({ ...form, [field.key]: e.target.value }); if (error) setError(''); }} />
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'المساحة (م²)', key: 'Size', placeholder: '500' },
                    { label: 'السعر اليومي (ر.س)', key: 'PricePerDay', placeholder: '500' },
                  ].map(field => (
                    <div key={field.key}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                        {field.label}
                      </label>
                      <input type="number" min="1" placeholder={field.placeholder} style={inputStyle}
                        onFocus={e => e.target.style.borderColor = '#2563eb'}
                        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                        value={form[field.key]}
                        onChange={e => { setForm({ ...form, [field.key]: e.target.value }); if (error) setError(''); }} />
                    </div>
                  ))}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>الوصف</label>
                  <textarea rows={3} placeholder="وصف المستودع وما يميزه..."
                    style={{ ...inputStyle, resize: 'none', padding: '10px 14px' }}
                    onFocus={e => e.target.style.borderColor = '#2563eb'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                    value={form.Description}
                    onChange={e => setForm({ ...form, Description: e.target.value })} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 10, background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                  <button type="button" onClick={() => setForm({ ...form, IsActive: !form.IsActive })}
                    style={{
                      position: 'relative', width: 40, height: 22, borderRadius: 11, border: 'none',
                      background: form.IsActive ? '#2563eb' : '#cbd5e1', cursor: 'pointer', flexShrink: 0,
                      transition: 'background .2s',
                    }}>
                    <span style={{
                      position: 'absolute', top: 3,
                      right: form.IsActive ? 3 : 'auto',
                      left: form.IsActive ? 'auto' : 3,
                      width: 16, height: 16, borderRadius: '50%',
                      background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      transition: 'all .2s',
                    }} />
                  </button>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#475569' }}>
                    {form.IsActive ? 'المستودع نشط ومتاح للحجز' : 'المستودع معطل'}
                  </span>
                </div>

                <button type="submit" disabled={submitting || uploading}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 9,
                    background: submitting || uploading ? '#93c5fd' : '#2563eb',
                    color: '#fff', fontWeight: 700, fontSize: 14.5, border: 'none',
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: '0 8px 18px -8px rgba(37,99,235,0.6)',
                  }}>
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin block" />
                      جاري الحفظ...
                    </span>
                  ) : (
                    <><Save size={15} />{editWarehouse ? 'حفظ التعديلات' : 'إنشاء المستودع'}</>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WarehousesPage;