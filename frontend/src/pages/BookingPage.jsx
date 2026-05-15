import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, Calendar, ChevronLeft, CheckCircle, Loader, MapPin, Package, AlertCircle } from 'lucide-react';

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
        if (!res.ok) throw new Error();
        setWarehouse(await res.json());
      } catch {
        setError('حدث خطأ في تحميل بيانات المستودع');
      } finally {
        setLoading(false);
      }
    };
    fetchWarehouse();
  }, [id]);

  const calcDays = () => {
    if (!startDate || !endDate) return 0;
    const d = Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000);
    return d > 0 ? d : 0;
  };

  const days = calcDays();
  const basePrice = days > 0 && warehouse ? Math.ceil(days * warehouse.PricePerDay) : 0;
  const commission = Math.ceil(basePrice * 0.05);
  const totalPrice = basePrice + commission;

  const parseError = (detail) => {
    if (!detail) return 'حدث خطأ';
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) return detail.map(e => e.msg).join(', ');
    return 'حدث خطأ';
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
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ WarehouseID: parseInt(id), StartDate: startDate, EndDate: endDate }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(res.status === 403 ? 'الحجز متاح للمستأجرين فقط' : parseError(data.detail));
        return;
      }
      setSuccess(true);
      setTimeout(() => navigate('/payment', {
        state: {
          bookingId: data.BookingID,
          warehouseName: warehouse.Name,
          estimatedPrice: parseFloat(data.TotalPrice) * 1.05 || totalPrice
        }
      }), 1500);
    } catch {
      setError('حدث خطأ في الاتصال، حاول مرة أخرى');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa]" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>

      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4">
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

      {loading ? (
        <div className="flex justify-center items-center py-32">
          <Loader size={28} className="text-[#1a3a5c] animate-spin" />
        </div>
      ) : error && !warehouse ? (
        <div className="text-center py-32">
          <p className="text-red-500 text-sm font-semibold">{error}</p>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* Left - Warehouse Info (2/5) */}
            <div className="lg:col-span-2 space-y-4">

              {/* Warehouse Card */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="h-48 relative bg-gray-100">
                  {warehouse?.ImagePath ? (
                    <img src={warehouse.ImagePath} alt={warehouse.Name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 size={40} className="text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                      warehouse?.IsActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500 border border-gray-200'
                    }`}>
                      {warehouse?.IsActive ? 'متاح' : 'غير متاح'}
                    </span>
                  </div>
                </div>

                <div className="p-4 text-right">
                  <h2 className="font-bold text-gray-900 mb-3">{warehouse?.Name}</h2>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-end gap-1.5 text-gray-500 text-sm">
                      <span>{warehouse?.Location}</span>
                      <MapPin size={13} className="text-gray-400 shrink-0" />
                    </div>
                    <div className="flex items-center justify-end gap-1.5 text-gray-500 text-sm">
                      <span>{warehouse?.Size?.toLocaleString()} م²</span>
                      <Package size={13} className="text-gray-400 shrink-0" />
                    </div>
                  </div>
                  <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-xs text-gray-400">السعر اليومي</span>
                    <span className="font-bold text-[#1a3a5c]">
                      {warehouse?.PricePerDay?.toLocaleString()} <span className="text-xs font-normal text-gray-400">ر.س</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Commission note */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-right">
                <h4 className="text-xs font-bold text-gray-600 mb-3">رسوم المنصة</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">5%</span>
                    <span className="text-xs text-gray-500">عمولة على المستأجر</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100">7%</span>
                    <span className="text-xs text-gray-500">عمولة على المالك</span>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-right">
                <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 font-semibold leading-relaxed">
                  لا يمكن الحجز في تواريخ محجوزة مسبقاً من قبل مستأجر آخر
                </p>
              </div>
            </div>

            {/* Right - Booking Form (3/5) */}
            <div className="lg:col-span-3">
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

                {/* Header */}
                <div className="px-5 py-4 border-b border-gray-100 text-right">
                  <h3 className="font-bold text-gray-900">إتمام الحجز</h3>
                  <p className="text-xs text-gray-500 mt-0.5">اختر فترة الإيجار وأكد الحجز</p>
                </div>

                <div className="p-5">
                  {error && (
                    <div className="mb-5 p-3.5 rounded-xl text-sm flex items-start gap-2.5 bg-red-50 border border-red-200">
                      <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-red-600 text-xs font-black">!</span>
                      </div>
                      <p className="font-semibold text-red-700 text-right leading-relaxed">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="mb-5 p-5 rounded-xl text-center bg-emerald-50 border border-emerald-200">
                      <CheckCircle size={32} className="text-emerald-500 mx-auto mb-2" />
                      <p className="font-bold text-emerald-700 text-sm">تم الحجز بنجاح</p>
                      <p className="text-emerald-600 text-xs mt-1">جاري تحويلك لصفحة الدفع...</p>
                    </div>
                  )}

                  {!success && (
                    <form onSubmit={handleBooking} className="space-y-4 text-right">

                      {/* Dates */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1.5">تاريخ البداية</label>
                          <div className="relative">
                            <input type="date" min={today}
                              className="w-full py-2.5 px-3.5 pr-9 rounded-xl text-sm bg-white border border-gray-200 outline-none focus:border-[#1a3a5c] transition-colors text-gray-900"
                              value={startDate}
                              onChange={e => { setStartDate(e.target.value); setEndDate(''); if (error) setError(''); }} />
                            <Calendar size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1.5">تاريخ النهاية</label>
                          <div className="relative">
                            <input type="date" min={startDate || today}
                              className="w-full py-2.5 px-3.5 pr-9 rounded-xl text-sm bg-white border border-gray-200 outline-none focus:border-[#1a3a5c] transition-colors text-gray-900"
                              value={endDate}
                              onChange={e => { setEndDate(e.target.value); if (error) setError(''); }} />
                            <Calendar size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          </div>
                        </div>
                      </div>

                      {/* Price breakdown */}
                      {days > 0 && (
                        <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-xs font-bold text-gray-600 text-right">ملخص التكلفة</p>
                          </div>
                          <div className="px-4 py-3 space-y-2.5 text-right">
                            <div className="flex justify-between items-center text-sm">
                              <span className="font-semibold text-gray-900">{basePrice.toLocaleString()} ر.س</span>
                              <span className="text-gray-500 text-xs">
                                {days} يوم × {warehouse?.PricePerDay?.toLocaleString()} ر.س
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="font-semibold text-blue-700">+{commission.toLocaleString()} ر.س</span>
                              <span className="text-gray-500 text-xs">رسوم المنصة (5%)</span>
                            </div>
                            <div className="flex justify-between items-center pt-2.5 border-t border-gray-200">
                              <span className="font-black text-gray-900 text-base">{totalPrice.toLocaleString()} ر.س</span>
                              <span className="text-xs font-bold text-gray-500">الإجمالي</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Duration info */}
                      {days > 0 && (
                        <div className="flex items-center justify-between text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5">
                          <span className="font-semibold text-blue-700">{days} يوم</span>
                          <span>مدة الحجز</span>
                        </div>
                      )}

                      <button type="submit" disabled={submitting}
                        className="w-full py-3 rounded-xl font-bold text-white text-sm bg-[#1a3a5c] hover:bg-[#14304e] disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                        {submitting ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin block" />
                            جاري تأكيد الحجز...
                          </span>
                        ) : (
                          <>
                            <CheckCircle size={15} />
                            {days > 0 ? `تأكيد الحجز — ${totalPrice.toLocaleString()} ر.س` : 'تأكيد الحجز'}
                          </>
                        )}
                      </button>

                      <p className="text-center text-xs text-gray-400">
                        سيتم تحويلك لصفحة الدفع بعد تأكيد الحجز
                      </p>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingPage;