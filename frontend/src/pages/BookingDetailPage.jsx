import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Building2, MapPin, Package, Calendar, CreditCard, CheckCircle, Clock, XCircle, Loader } from 'lucide-react';

const API_URL = 'https://api.rafdi.com';

const statusConfig = {
  confirmed: { label: 'مؤكد', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: CheckCircle },
  pending:   { label: 'قيد الانتظار', className: 'bg-amber-50 text-amber-700 border border-amber-200', icon: Clock },
  cancelled: { label: 'ملغي', className: 'bg-red-50 text-red-600 border border-red-200', icon: XCircle },
};

const paymentStatusConfig = {
  paid:    { label: 'مدفوع', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  pending: { label: 'غير مدفوع', className: 'bg-amber-50 text-amber-700 border border-amber-200' },
  failed:  { label: 'فشل', className: 'bg-red-50 text-red-600 border border-red-200' },
};

function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        const bookingsRes = await fetch(`${API_URL}/bookings/my`, { headers });
        if (bookingsRes.ok) {
          const bookings = await bookingsRes.json();
          const found = bookings.find(b => b.BookingID === parseInt(id));
          if (found) setBooking(found);
          else { setError('الحجز غير موجود'); return; }
        }

        const paymentRes = await fetch(`${API_URL}/payments/${id}`, { headers });
        if (paymentRes.ok) setPayment(await paymentRes.json());

      } catch {
        setError('حدث خطأ في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const days = booking
    ? Math.ceil((new Date(booking.EndDate) - new Date(booking.StartDate)) / 86400000)
    : 0;

  return (
    <div className="min-h-screen bg-[#f7f8fa]" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>

      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center gap-4 h-14">
            <button onClick={() => navigate('/bookings')}
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

      <div className="bg-[#1a3a5c] py-8 px-4">
        <div className="max-w-3xl mx-auto text-right">
          <h1 className="text-xl font-black text-white mb-1">تفاصيل الحجز</h1>
          <p className="text-blue-200 text-sm">#{id}</p>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader size={26} className="text-[#1a3a5c] animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white border border-dashed border-gray-300 rounded-xl">
            <p className="text-sm text-red-500 font-medium">{error}</p>
          </div>
        ) : (
          <div className="space-y-4">

            {/* Booking Status */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 text-right">
              <div className="flex justify-between items-center mb-4">
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border ${
                  statusConfig[booking.Status]?.className
                }`}>
                  {booking.Status === 'confirmed' ? <CheckCircle size={13} /> : booking.Status === 'pending' ? <Clock size={13} /> : <XCircle size={13} />}
                  {statusConfig[booking.Status]?.label}
                </span>
                <h2 className="font-black text-gray-900">حالة الحجز</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-3 text-right">
                  <p className="text-xs text-gray-400 mb-1">تاريخ البداية</p>
                  <p className="font-bold text-gray-900 text-sm font-mono">{booking.StartDate}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-right">
                  <p className="text-xs text-gray-400 mb-1">تاريخ النهاية</p>
                  <p className="font-bold text-gray-900 text-sm font-mono">{booking.EndDate}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-right">
                  <p className="text-xs text-gray-400 mb-1">مدة الإيجار</p>
                  <p className="font-bold text-gray-900 text-sm">{days} يوم</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-right">
                  <p className="text-xs text-gray-400 mb-1">إجمالي الحجز</p>
                  <p className="font-bold text-[#1a3a5c] text-sm">{parseFloat(booking.TotalPrice).toLocaleString()} ر.س</p>
                </div>
              </div>
            </div>

            {/* Warehouse Info */}
            {booking.warehouse && (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {booking.warehouse.ImagePath ? (
                  <img src={booking.warehouse.ImagePath} alt={booking.warehouse.Name} className="w-full h-40 object-cover" />
                ) : (
                  <div className="h-40 bg-gray-50 flex items-center justify-center">
                    <Building2 size={36} className="text-gray-300" />
                  </div>
                )}
                <div className="p-5 text-right">
                  <h3 className="font-black text-gray-900 mb-3">بيانات المستودع</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-700">{booking.warehouse.Name}</span>
                      <span className="text-xs text-gray-400">الاسم</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm text-gray-600">{booking.warehouse.Location}</span>
                        <MapPin size={13} className="text-gray-400" />
                      </div>
                      <span className="text-xs text-gray-400">الموقع</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm text-gray-600">{booking.warehouse.Size?.toLocaleString()} م²</span>
                        <Package size={13} className="text-gray-400" />
                      </div>
                      <span className="text-xs text-gray-400">المساحة</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <span className="text-sm font-bold text-[#1a3a5c]">{parseFloat(booking.warehouse.PricePerDay).toLocaleString()} ر.س/يوم</span>
                      <span className="text-xs text-gray-400">السعر اليومي</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Info */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 text-right">
              <h3 className="font-black text-gray-900 mb-4">بيانات الدفع</h3>
              {payment ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${paymentStatusConfig[payment.Status]?.className}`}>
                      {paymentStatusConfig[payment.Status]?.label}
                    </span>
                    <span className="text-xs text-gray-400">حالة الدفع</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-gray-50">
                    <span className="text-sm font-semibold text-gray-700">{parseFloat(payment.Amount).toLocaleString()} ر.س</span>
                    <span className="text-xs text-gray-400">المبلغ المدفوع</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-gray-50">
                    <span className="text-sm font-mono text-gray-600">{payment.PaymentDate}</span>
                    <span className="text-xs text-gray-400">تاريخ الدفع</span>
                  </div>
                  {payment.PaymentMethod && (
                    <div className="flex justify-between items-center py-2 border-t border-gray-50">
                      <span className="text-sm text-gray-600 flex items-center gap-1.5">
                        <CreditCard size={13} className="text-gray-400" />
                        {payment.PaymentMethod}
                      </span>
                      <span className="text-xs text-gray-400">طريقة الدفع</span>
                    </div>
                  )}
                  {payment.MoyasarPaymentID && (
                    <div className="flex justify-between items-center py-2 border-t border-gray-50">
                      <span className="text-xs font-mono text-gray-500">{payment.MoyasarPaymentID}</span>
                      <span className="text-xs text-gray-400">رقم العملية</span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                    <div className="bg-gray-50 rounded-xl p-3 text-right">
                      <p className="text-xs text-gray-400 mb-1">عمولة المنصة</p>
                      <p className="font-bold text-gray-700 text-sm">{parseFloat(payment.commission_amount).toLocaleString()} ر.س</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-right">
                      <p className="text-xs text-gray-400 mb-1">صافي المبلغ</p>
                      <p className="font-bold text-gray-700 text-sm">{parseFloat(payment.net_amount).toLocaleString()} ر.س</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <CreditCard size={24} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">لا يوجد دفع مسجل لهذا الحجز</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-gray-200 mt-12 py-5 bg-white">
        <p className="text-center text-xs text-gray-400">© 2026 Rafdi Platform — جميع الحقوق محفوظة</p>
      </footer>
    </div>
  );
}

export default BookingDetailPage;