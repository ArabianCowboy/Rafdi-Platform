import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, Plus, MapPin, Package, Edit2, Power, X, Loader, ArrowLeft, Save } from 'lucide-react';

const API_URL = 'https://api.rafdi.com';

const getUserRoles = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return [];
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.roles || [];
  } catch { return []; }
};

const getCompanyId = () => {
  try {
    const token = localStorage.getItem('token');
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.company_id;
  } catch { return null; }
};

const parseError = (detail) => {
  if (!detail) return 'حدث خطأ';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map(e => e.msg).join(', ');
  return 'حدث خطأ';
};

const emptyForm = { Name: '', Location: '', Size: '', PricePerDay: '', Description: '', IsActive: true, ImagePath: '' };

function WarehousesPage() {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editWarehouse, setEditWarehouse] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
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
      const res = await fetch(`${API_URL}/warehouses/`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setWarehouses(await res.json());
    } catch {} finally { setLoading(false); }
  };

  const openCreate = () => { setForm(emptyForm); setEditWarehouse(null); setError(''); setShowModal(true); };
  const openEdit = (w) => {
    setForm({ Name: w.Name, Location: w.Location, Size: w.Size, PricePerDay: w.PricePerDay, Description: w.Description || '', IsActive: w.IsActive, ImagePath: w.ImagePath || '' });
    setEditWarehouse(w); setError(''); setShowModal(true);
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
      setSuccess(editWarehouse ? 'تم تعديل المستودع بنجاح ✅' : 'تم إنشاء المستودع بنجاح ✅');
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
    <div className="min-h-screen bg-[#F8FAFC]" dir="rtl" style={{fontFamily: "'Cairo', sans-serif"}}>

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/home')}
              className="flex items-center gap-2 text-gray-400 hover:text-[#2E5F8A] font-bold text-sm transition-colors">
              <ArrowLeft size={18} className="rotate-180" />
              رجوع
            </button>
            <div className="h-5 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{background: 'linear-gradient(135deg, #4A8ABF, #2E5F8A)'}}>
                <span className="text-white font-black text-sm">ر</span>
              </div>
              <span className="text-[#0f2744] font-black">رفدي</span>
            </div>
          </div>
          {isOwner && (
            <motion.button onClick={openCreate} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-sm text-white"
              style={{background: 'linear-gradient(135deg, #1a3f6f, #2E5F8A)', boxShadow: '0 4px 15px rgba(46,95,138,0.3)'}}>
              <Plus size={18} />
              إضافة مستودع
            </motion.button>
          )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">

        <div className="flex justify-between items-center mb-10 text-right">
          <div />
          <div>
            <h1 className="text-3xl font-black text-[#0f2744]">إدارة المستودعات</h1>
            <p className="text-gray-400 font-medium mt-1">إضافة وتعديل وإدارة مستودعاتك</p>
          </div>
        </div>

        <AnimatePresence>
          {success && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-6 p-4 rounded-2xl text-sm font-bold text-emerald-700 text-right"
              style={{background: '#F0FDF4', border: '1px solid #86EFAC'}}>
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader size={40} className="text-[#2E5F8A] animate-spin" />
          </div>
        ) : warehouses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <Building2 size={60} className="text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-bold text-lg">لا توجد مستودعات</p>
            {isOwner && (
              <button onClick={openCreate}
                className="mt-4 px-6 py-3 rounded-2xl font-black text-white text-sm"
                style={{background: 'linear-gradient(135deg, #1a3f6f, #2E5F8A)'}}>
                أضف مستودعك الأول
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {warehouses.map((w, idx) => (
              <motion.div key={w.WarehouseID}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(46,95,138,0.12)' }}
                className="bg-white rounded-3xl overflow-hidden border border-gray-100 transition-all duration-300 group">

                <div className="h-44 relative overflow-hidden"
                  style={{background: 'linear-gradient(135deg, #1a3f6f, #2E5F8A)'}}>
                  {w.ImagePath ? (
                    <img src={w.ImagePath} alt={w.Name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <Building2 className="absolute inset-0 m-auto text-white/10" size={80} />
                  )}
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-black text-white border ${w.IsActive ? 'bg-emerald-500/30 border-emerald-400/30' : 'bg-red-500/30 border-red-400/30'}`}>
                      {w.IsActive ? 'نشط' : 'معطل'}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-3 py-1.5">
                    <p className="text-white font-black text-sm">
                      {w.PricePerDay?.toLocaleString()} <span className="text-white/60 font-bold text-xs">ر.س/يوم</span>
                    </p>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-black text-[#0f2744] text-right text-lg mb-3">{w.Name}</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-end gap-2 text-gray-400 text-sm">
                      <span className="font-medium">{w.Location}</span>
                      <MapPin size={14} className="text-[#2E5F8A]" />
                    </div>
                    <div className="flex items-center justify-end gap-2 text-gray-400 text-sm">
                      <span className="font-medium">{w.Size} م²</span>
                      <Package size={14} className="text-[#2E5F8A]" />
                    </div>
                  </div>

                  {w.Description && (
                    <p className="text-gray-400 text-xs font-medium text-right mb-4 leading-relaxed line-clamp-2">{w.Description}</p>
                  )}

                  {isOwner && (
                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                      <motion.button onClick={() => openEdit(w)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl font-black text-sm transition-all border-2 border-[#2E5F8A]/20 text-[#2E5F8A] hover:bg-[#2E5F8A]/5">
                        <Edit2 size={15} />
                        تعديل
                      </motion.button>
                      <motion.button onClick={() => handleToggle(w)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl font-black text-sm transition-all border-2 ${w.IsActive ? 'border-red-200 text-red-500 hover:bg-red-50' : 'border-emerald-200 text-emerald-500 hover:bg-emerald-50'}`}>
                        <Power size={15} />
                        {w.IsActive ? 'تعطيل' : 'تفعيل'}
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden max-h-[90vh] overflow-y-auto">

              <div className="p-6 text-right sticky top-0 z-10"
                style={{background: 'linear-gradient(135deg, #0f2744, #2E5F8A)'}}>
                <div className="flex items-center justify-between">
                  <button onClick={() => setShowModal(false)}
                    className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all">
                    <X size={18} />
                  </button>
                  <div>
                    <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">
                      {editWarehouse ? 'تعديل المستودع' : 'إضافة مستودع جديد'}
                    </p>
                    <h3 className="text-xl font-black text-white">
                      {editWarehouse ? editWarehouse.Name : 'مستودع جديد'}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="mb-4 p-4 rounded-2xl text-sm flex items-center gap-3"
                      style={{background: '#FEF2F2', border: '1px solid #FCA5A5'}}>
                      <div className="w-7 h-7 rounded-xl bg-red-100 flex items-center justify-center shrink-0 text-red-500 font-black">!</div>
                      <p className="font-bold text-red-700 text-right">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-4 text-right">
                  {[
                    { label: 'اسم المستودع', key: 'Name', placeholder: 'مستودع الرياض الرئيسي', type: 'text' },
                    { label: 'الموقع', key: 'Location', placeholder: 'الرياض، حي العارض', type: 'text' },
                    { label: 'رابط الصورة', key: 'ImagePath', placeholder: 'https://...', type: 'text' },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">{field.label}</label>
                      <input type={field.type} placeholder={field.placeholder}
                        className="w-full py-3.5 px-5 rounded-2xl font-bold outline-none transition-all bg-gray-50 border-2 border-transparent text-[#0f2744] placeholder:text-gray-300"
                        onFocus={e => e.target.style.borderColor = '#2E5F8A'}
                        onBlur={e => e.target.style.borderColor = 'transparent'}
                        value={form[field.key]}
                        onChange={e => { setForm({...form, [field.key]: e.target.value}); if(error) setError(''); }} />
                    </div>
                  ))}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">المساحة (م²)</label>
                      <input type="number" min="1" placeholder="500"
                        className="w-full py-3.5 px-5 rounded-2xl font-bold outline-none transition-all bg-gray-50 border-2 border-transparent text-[#0f2744] placeholder:text-gray-300"
                        onFocus={e => e.target.style.borderColor = '#2E5F8A'}
                        onBlur={e => e.target.style.borderColor = 'transparent'}
                        value={form.Size}
                        onChange={e => { setForm({...form, Size: e.target.value}); if(error) setError(''); }} />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">السعر اليومي (ر.س)</label>
                      <input type="number" min="1" placeholder="500"
                        className="w-full py-3.5 px-5 rounded-2xl font-bold outline-none transition-all bg-gray-50 border-2 border-transparent text-[#0f2744] placeholder:text-gray-300"
                        onFocus={e => e.target.style.borderColor = '#2E5F8A'}
                        onBlur={e => e.target.style.borderColor = 'transparent'}
                        value={form.PricePerDay}
                        onChange={e => { setForm({...form, PricePerDay: e.target.value}); if(error) setError(''); }} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">الوصف</label>
                    <textarea rows={3} placeholder="وصف المستودع وما يميزه..."
                      className="w-full py-3.5 px-5 rounded-2xl font-bold outline-none transition-all bg-gray-50 border-2 border-transparent text-[#0f2744] placeholder:text-gray-300 resize-none"
                      onFocus={e => e.target.style.borderColor = '#2E5F8A'}
                      onBlur={e => e.target.style.borderColor = 'transparent'}
                      value={form.Description}
                      onChange={e => setForm({...form, Description: e.target.value})} />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50">
                    <button type="button" onClick={() => setForm({...form, IsActive: !form.IsActive})}
                      className="relative w-12 h-6 rounded-full transition-all"
                      style={{background: form.IsActive ? '#2E5F8A' : '#D1D5DB'}}>
                      <span className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                        style={{right: form.IsActive ? '4px' : 'auto', left: form.IsActive ? 'auto' : '4px'}} />
                    </button>
                    <span className="font-black text-sm text-[#0f2744]">
                      {form.IsActive ? 'المستودع نشط ومتاح للحجز' : 'المستودع معطل'}
                    </span>
                  </div>

                  <motion.button type="submit" disabled={submitting}
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                    className="w-full py-4 rounded-2xl font-black text-white text-lg flex items-center justify-center gap-3 disabled:opacity-70"
                    style={{background: submitting ? '#93b4d4' : 'linear-gradient(135deg, #1a3f6f, #2E5F8A)', boxShadow: '0 8px 32px rgba(46,95,138,0.35)'}}>
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full block" />
                        جاري الحفظ...
                      </span>
                    ) : (
                      <>
                        <Save size={20} />
                        {editWarehouse ? 'حفظ التعديلات' : 'إنشاء المستودع'}
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default WarehousesPage;