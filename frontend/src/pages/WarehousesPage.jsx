import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, MapPin, Package, Edit2, Power, X, Loader, Save, ChevronLeft, ImagePlus, CheckCircle } from 'lucide-react';

const API_URL = 'https://api.rafdi.com';
const CLOUDINARY_CLOUD = 'dnhn19zpj';
const CLOUDINARY_PRESET = 'Rafdi_Image';

const getUserRoles = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return [];
    return JSON.parse(atob(token.split('.')[1])).roles || [];
  } catch { return []; }
};

const getCompanyId = () => {
  try {
    return JSON.parse(atob(localStorage.getItem('token').split('.')[1])).company_id;
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
  const token = localStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => { fetchWarehouses(); }, []);

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/warehouses/my`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setWarehouses(await res.json());
    } catch {} finally { setLoading(false); }
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

    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_PRESET);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        setForm(prev => ({ ...prev, ImagePath: data.secure_url }));
      } else {
        setError('فشل رفع الصورة، حاول مرة أخرى');
      }
    } catch {
      setError('حدث خطأ أثناء رفع الصورة');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
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

      const res = await fetch(url, { method, headers, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setError(parseError(data.detail)); return; }
      setSuccess(editWarehouse ? 'تم تعديل المستودع بنجاح' : 'تم إنشاء المستودع بنجاح');
      setShowModal(false);
      fetchWarehouses();
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError('حدث خطأ في الاتصال');
    } finally { setSubmitting(false); }
  };

  const handleToggle = async (w) => {
    try {
      const res = await fetch(`${API_URL}/warehouses/${w.WarehouseID}/toggle`, { method: 'PATCH', headers });
      if (res.ok) fetchWarehouses();
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa]" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>

      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
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
            {isOwner && (
              <button onClick={openCreate}
                className="flex items-center gap-2 px-4 py-2 bg-[#1a3a5c] hover:bg-[#14304e] text-white text-sm font-bold rounded-lg transition-colors">
                <Plus size={15} />
                إضافة مستودع
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-start mb-6 text-right">
          <div />
          <div>
            <h1 className="text-xl font-black text-gray-900">إدارة المستودعات</h1>
            <p className="text-sm text-gray-500 mt-0.5">{warehouses.length} مستودع مسجل</p>
          </div>
        </div>

        {success && (
          <div className="mb-5 p-3.5 rounded-xl text-sm flex items-center gap-2.5 bg-emerald-50 border border-emerald-200">
            <CheckCircle size={15} className="text-emerald-600 shrink-0" />
            <span className="text-emerald-600 font-semibold">{success}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader size={26} className="text-[#1a3a5c] animate-spin" />
          </div>
        ) : warehouses.length === 0 ? (
          <div className="text-center py-20 bg-white border border-dashed border-gray-300 rounded-xl">
            <Building2 size={36} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium mb-4">لم تضف أي مستودع بعد</p>
            {isOwner && (
              <button onClick={openCreate}
                className="px-4 py-2 bg-[#1a3a5c] text-white text-sm font-bold rounded-lg hover:bg-[#14304e] transition-colors">
                أضف مستودعك الأول
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {warehouses.map((w) => (
              <div key={w.WarehouseID}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all">
                <div className="h-44 relative bg-gray-100 overflow-hidden">
                  {w.ImagePath ? (
                    <img src={w.ImagePath} alt={w.Name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 size={36} className="text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <StatusBadge active={w.IsActive} />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent px-4 py-3">
                    <p className="text-white font-bold text-base leading-none">
                      {w.PricePerDay?.toLocaleString()}
                      <span className="text-white/70 text-xs font-normal mr-1">ر.س / يوم</span>
                    </p>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 text-sm mb-2 text-right">{w.Name}</h3>
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center justify-end gap-1.5 text-gray-500 text-xs">
                      <span>{w.Location}</span>
                      <MapPin size={11} className="text-gray-400 shrink-0" />
                    </div>
                    <div className="flex items-center justify-end gap-1.5 text-gray-500 text-xs">
                      <span>{w.Size?.toLocaleString()} م²</span>
                      <Package size={11} className="text-gray-400 shrink-0" />
                    </div>
                  </div>
                  {w.Description && (
                    <p className="text-xs text-gray-400 text-right line-clamp-2 leading-relaxed mb-3">{w.Description}</p>
                  )}
                  {isOwner && (
                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      <button onClick={() => openEdit(w)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold border border-gray-200 text-gray-700 hover:border-[#1a3a5c] hover:text-[#1a3a5c] transition-colors">
                        <Edit2 size={13} />
                        تعديل
                      </button>
                      <button onClick={() => handleToggle(w)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold border transition-colors ${
                          w.IsActive ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                        }`}>
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

            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <button onClick={() => setShowModal(false)}
                className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                <X size={15} />
              </button>
              <div className="text-right">
                <h3 className="font-bold text-gray-900 text-sm">
                  {editWarehouse ? 'تعديل المستودع' : 'إضافة مستودع جديد'}
                </h3>
                {editWarehouse && <p className="text-xs text-gray-400 mt-0.5">{editWarehouse.Name}</p>}
              </div>
            </div>

            <div className="p-5">
              {error && (
                <div className="mb-4 p-3.5 rounded-xl text-sm flex items-start gap-2.5 bg-red-50 border border-red-200">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-red-600 text-xs font-black">!</span>
                  </div>
                  <p className="font-semibold text-red-700 text-right">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-right">

                {/* Image Upload */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">صورة المستودع</label>
                  <div className="relative">
                    {/* Preview */}
                    {form.ImagePath ? (
                      <div className="relative h-36 rounded-xl overflow-hidden border border-gray-200 mb-2">
                        <img src={form.ImagePath} alt="preview" className="w-full h-full object-cover" />
                        <button type="button"
                          onClick={() => setForm(prev => ({ ...prev, ImagePath: '' }))}
                          className="absolute top-2 left-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors">
                          <X size={12} />
                        </button>
                        <div className="absolute bottom-2 right-2 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                          <CheckCircle size={11} />
                          تم الرفع
                        </div>
                      </div>
                    ) : (
                      <label className={`flex flex-col items-center justify-center h-36 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                        uploading ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-[#1a3a5c] hover:bg-gray-50'
                      }`}>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                        {uploading ? (
                          <div className="flex flex-col items-center gap-2">
                            <Loader size={24} className="text-[#1a3a5c] animate-spin" />
                            <span className="text-xs text-gray-500 font-medium">جاري الرفع...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <ImagePlus size={24} className="text-gray-300" />
                            <span className="text-xs text-gray-500 font-medium">اضغط لرفع صورة</span>
                            <span className="text-xs text-gray-400">PNG, JPG حتى 5MB</span>
                          </div>
                        )}
                      </label>
                    )}
                  </div>
                </div>

                {[
                  { label: 'اسم المستودع', key: 'Name', placeholder: 'مستودع الرياض الرئيسي', type: 'text' },
                  { label: 'الموقع', key: 'Location', placeholder: 'الرياض، حي العارض', type: 'text' },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">{field.label}</label>
                    <input type={field.type} placeholder={field.placeholder}
                      className="w-full py-2.5 px-3.5 rounded-xl text-sm font-medium text-right bg-white border border-gray-200 outline-none focus:border-[#1a3a5c] transition-colors placeholder:text-gray-400 text-gray-900"
                      value={form[field.key]}
                      onChange={e => { setForm({ ...form, [field.key]: e.target.value }); if (error) setError(''); }} />
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">المساحة (م²)</label>
                    <input type="number" min="1" placeholder="500"
                      className="w-full py-2.5 px-3.5 rounded-xl text-sm font-medium text-right bg-white border border-gray-200 outline-none focus:border-[#1a3a5c] transition-colors placeholder:text-gray-400 text-gray-900"
                      value={form.Size}
                      onChange={e => { setForm({ ...form, Size: e.target.value }); if (error) setError(''); }} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">السعر اليومي (ر.س)</label>
                    <input type="number" min="1" placeholder="500"
                      className="w-full py-2.5 px-3.5 rounded-xl text-sm font-medium text-right bg-white border border-gray-200 outline-none focus:border-[#1a3a5c] transition-colors placeholder:text-gray-400 text-gray-900"
                      value={form.PricePerDay}
                      onChange={e => { setForm({ ...form, PricePerDay: e.target.value }); if (error) setError(''); }} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">الوصف</label>
                  <textarea rows={3} placeholder="وصف المستودع وما يميزه..."
                    className="w-full py-2.5 px-3.5 rounded-xl text-sm font-medium text-right bg-white border border-gray-200 outline-none focus:border-[#1a3a5c] transition-colors placeholder:text-gray-400 text-gray-900 resize-none"
                    value={form.Description}
                    onChange={e => setForm({ ...form, Description: e.target.value })} />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <button type="button" onClick={() => setForm({ ...form, IsActive: !form.IsActive })}
                    className="relative w-10 h-5 rounded-full transition-colors shrink-0"
                    style={{ background: form.IsActive ? '#1a3a5c' : '#d1d5db' }}>
                    <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm"
                      style={{ right: form.IsActive ? '2px' : 'auto', left: form.IsActive ? 'auto' : '2px' }} />
                  </button>
                  <span className="text-sm font-semibold text-gray-700">
                    {form.IsActive ? 'المستودع نشط ومتاح للحجز' : 'المستودع معطل'}
                  </span>
                </div>

                <button type="submit" disabled={submitting || uploading}
                  className="w-full py-3 rounded-xl font-bold text-white text-sm bg-[#1a3a5c] hover:bg-[#14304e] disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin block" />
                      جاري الحفظ...
                    </span>
                  ) : (
                    <>
                      <Save size={15} />
                      {editWarehouse ? 'حفظ التعديلات' : 'إنشاء المستودع'}
                    </>
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