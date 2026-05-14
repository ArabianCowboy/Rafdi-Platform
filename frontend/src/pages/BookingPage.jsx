import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, Calendar, ArrowLeft, CheckCircle, Loader, MapPin, Package } from 'lucide-react';

const API_URL = 'https://api.rafdi.com';

const today = new Date().toISOString().split('T')[0];

function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [warehouse, setWarehouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchWarehouse = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/warehouses/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('فشل تحميل المستودع');
        const data = await res.json();
        setWarehouse(data);
      } catch {
        setError('حدث خطأ في تحميل بيانات المستودع');
      } finally {
        setLoading(false);
      }
    };
    fetchWarehouse();
  }, [id]);

  const calcEstimatedPrice = () => {
    if (!startDate || !endDate || !warehouse) return 0;
    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    if (days <= 0) return 0;
    return Math.ceil((days / 30) * warehouse.PricePerMonth);
  };

  const calcDays = () => {
    if (!startDate || !endDate) return 0;
    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const parseError = (detail) => {
    if (!detail) return 'حدث خطأ أثناء إنشاء الحجز';
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) return detail.map(e => e.msg).join(', ');
    return 'حدث خطأ أثناء إنشاء الحجز';
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setError('');

    if (!startDate) { setError('يرجى اختيار تاريخ البداية'); return; }
    if (!endDate) { setError('يرجى اختيار تاريخ النهاية'); return; }
    if (new Date(endDate) <= new Date(startDate)) { setError('تاريخ النهاية يجب أن يكون بعد تاريخ البداية'); return; }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/bookings/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          WarehouseID: parseInt(id),
          StartDate: startDate,
          EndDate: endDate,
          Status: 'pending'
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403) {
          setError('عذراً، الحجز متاح للمستأجرين فقط 🔒');
        } else {
          setError(parseError(data.detail));
        }
        return;
      }
      setSuccess(true);
      setTimeout(() => navigate('/payment', {
        state: {
          bookingId: data.BookingID,
          warehouseName: warehouse.Name,
          estimatedPrice: calcEstimatedPrice()
        }
      }), 1500);
    } catch {
      setError('حدث خطأ في الاتصال، حاول مرة أخرى');
    } finally {
      setSubmitting(false);
    }
  };

  const estimatedPrice = calcEstimatedPrice();
  const days = calcDays();

  return (
    <div className="min-h-screen bg-[#F8FAFC]" dir="rtl" style={{fontFamily: "'Cairo', sans-serif"}}>

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
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
      </nav>

      {loading ? (
        <div className="flex justify-center items-center py-40">
          <Loader size={40} className="text-[#2E5F8A] animate-spin" />
        </div>
      ) : error && !warehouse ? (
        <div className="text-center py-40">
          <p className="text-red-500 font-bold">{error}</p>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Left - Warehouse Info */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm mb-6">
                <div className="h-48 relative"
                  style={{background: 'linear-gradient(135deg, #0f2744, #2E5F8A)'}}>
                  <div className="absolute inset-0 opacity-10"
                    style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '30px 30px'}} />
                  {warehouse?.ImagePath ? (
                    <img src={warehouse.ImagePath} alt={warehouse.Name} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="absolute inset-0 m-auto text-white/10" size={80} />
                  )}
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full text-xs font-black text-white bg-white/20 border border-white/30">
                      {warehouse?.IsActive ? 'متاح' : 'غير متاح'}
                    </span>
                  </div>
                </div>

                <div className="p-6 text-right">
                  <h2 className="text-xl font-black text-[#0f2744] mb-4">{warehouse?.Name}</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-end gap-2 text-gray-500 text-sm">
                      <span className="font-medium">{warehouse?.Location}</span>
                      <MapPin size={16} className="text-[#2E5F8A]" />
                    </div>
                    <div className="flex items-center justify-end gap-2 text-gray-500 text-sm">
                      <span className="font-medium">{warehouse?.Size} م²</span>
                      <Package size={16} className="text-[#2E5F8A]" />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-[#2E5F8A]">
                        {warehouse?.PricePerMonth?.toLocaleString()} <span className="text-sm text-gray-400 font-bold">ر.س/شهر</span>
                      </span>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">السعر الشهري</span>
                    </div>
                  </div>
                </div>
              </div>

              {warehouse?.Description && (
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-right">
                  <h3 className="font-black text-[#0f2744] mb-3">وصف المستودع</h3>
                  <p className="text-gray-500 font-medium leading-relaxed text-sm">{warehouse.Description}</p>
                </div>
              )}
            </motion.div>

            {/* Right - Booking Form */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 text-right"
                  style={{background: 'linear-gradient(135deg, #0f2744, #2E5F8A)'}}>
                  <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">إتمام الحجز</p>
                  <h3 className="text-2xl font-black text-white">احجز مستودعك الآن</h3>
                </div>

                <div className="p-6">
                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="mb-6 p-4 rounded-2xl text-sm flex items-start gap-3"
                        style={{background: '#FEF2F2', border: '1px solid #FCA5A5'}}>
                        <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center shrink-0 text-red-500 font-black mt-0.5">!</div>
                        <p className="font-bold text-red-700 text-right leading-relaxed">{error}</p>
                      </motion.div>
                    )}
                    {success && (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="mb-6 p-6 rounded-2xl text-center"
                        style={{background: '#F0FDF4', border: '1px solid #86EFAC'}}>
                        <CheckCircle size={40} className="text-emerald-500 mx-auto mb-3" />
                        <p className="font-black text-emerald-700 text-lg">تم الحجز بنجاح! 🎉</p>
                        <p className="text-emerald-600 text-sm font-medium mt-1">جاري تحويلك لصفحة الدفع...</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!success && (
                    <form onSubmit={handleBooking} className="space-y-5 text-right">
                      <div>
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                          تاريخ البداية
                        </label>
                        <div className="relative">
                          <input type="date"
                            min={today}
                            className="w-full py-4 px-5 pr-12 rounded-2xl font-bold outline-none transition-all bg-gray-50 border-2 border-transparent text-[#0f2744]"
                            onFocus={e => e.target.style.borderColor = '#2E5F8A'}
                            onBlur={e => e.target.style.borderColor = 'transparent'}
                            value={startDate}
                            onChange={e => { setStartDate(e.target.value); setEndDate(''); if(error) setError(''); }} />
                          <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                          تاريخ النهاية
                        </label>
                        <div className="relative">
                          <input type="date"
                            min={startDate || today}
                            className="w-full py-4 px-5 pr-12 rounded-2xl font-bold outline-none transition-all bg-gray-50 border-2 border-transparent text-[#0f2744]"
                            onFocus={e => e.target.style.borderColor = '#2E5F8A'}
                            onBlur={e => e.target.style.borderColor = 'transparent'}
                            value={endDate}
                            onChange={e => { setEndDate(e.target.value); if(error) setError(''); }} />
                          <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        </div>
                      </div>

                      {estimatedPrice > 0 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          className="rounded-2xl p-5 text-right"
                          style={{background: 'rgba(46,95,138,0.05)', border: '1px solid rgba(46,95,138,0.1)'}}>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">ملخص تقديري</p>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[#2E5F8A] font-black text-xl">{estimatedPrice.toLocaleString()} ر.س</span>
                            <span className="text-gray-400 text-xs font-bold">التكلفة التقديرية</span>
                          </div>
                          <div className="flex justify-between items-center text-sm text-gray-400">
                            <span className="font-medium">{days} يوم</span>
                            <span className="font-bold">المدة</span>
                          </div>
                        </motion.div>
                      )}

                      <motion.button type="submit" disabled={submitting}
                        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                        className="w-full py-4 rounded-2xl font-black text-white text-lg flex items-center justify-center gap-3 disabled:opacity-70 mt-2"
                        style={{background: submitting ? '#93b4d4' : 'linear-gradient(135deg, #1a3f6f 0%, #2E5F8A 100%)', boxShadow: '0 8px 32px rgba(46,95,138,0.35)'}}>
                        {submitting ? (
                          <span className="flex items-center gap-2">
                            <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full block" />
                            جاري الحجز...
                          </span>
                        ) : (
                          <>
                            <CheckCircle size={20} />
                            تأكيد الحجز
                          </>
                        )}
                      </motion.button>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingPage;