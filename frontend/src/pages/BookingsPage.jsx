import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Building2, Calendar, CreditCard, CheckCircle, Loader, Layers } from 'lucide-react';

const API_URL = 'https://api.rafdi.com';

const statusConfig = {
  confirmed: { label: 'مؤكد', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  pending: { label: 'قيد الانتظار', className: 'bg-amber-50 text-amber-700 border border-amber-200' },
  cancelled: { label: 'ملغي', className: 'bg-red-50 text-red-600 border border-red-200' },
};

const paymentConfig = {
  paid: { label: 'مدفوع', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  pending: { label: 'غير مدفوع', className: 'bg-gray-100 text-gray-600 border border-gray-200' },
};

function BookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/bookings/my`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setBookings(await res.json());
      } catch {} finally { setLoading(false); }
    };
    fetchBookings();
  }, []);

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

      {/* Page header */}
      <div className="bg-[#1a3a5c] py-8 px-4">
        <div className="max-w-5xl mx-auto text-right">
          <h1 className="text-xl font-black text-white mb-1">حجوزاتي</h1>
          <p className="text-blue-200 text-sm">متابعة جميع حجوزاتك وحالة الدفع</p>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8">

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader size={26} className="text-[#1a3a5c] animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 bg-white border border-dashed border-gray-300 rounded-xl">
            <Layers size={36} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium mb-4">لا توجد حجوزات حتى الآن</p>
            <button onClick={() => navigate('/home')}
              className="px-4 py-2 bg-[#1a3a5c] text-white text-sm font-bold rounded-lg hover:bg-[#14304e] transition-colors">
              ابحث عن مستودع
            </button>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

            {/* Table header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-right">
              <div className="col-span-4 text-xs font-bold text-gray-500">المستودع</div>
              <div className="col-span-3 text-xs font-bold text-gray-500">الفترة</div>
              <div className="col-span-2 text-xs font-bold text-gray-500">المبلغ</div>
              <div className="col-span-1 text-xs font-bold text-gray-500">الحجز</div>
              <div className="col-span-2 text-xs font-bold text-gray-500">الدفع</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-50">
              {bookings.map((b) => {
                const status = statusConfig[b.Status] || statusConfig.pending;
                const payment = b.Status === 'confirmed' ? paymentConfig.paid : paymentConfig.pending;

                return (
                  <div key={b.BookingID}
                    className="px-5 py-4 grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-center text-right hover:bg-gray-50 transition-colors">

                    {/* Warehouse */}
                    <div className="md:col-span-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#f0f4f8] border border-gray-200 flex items-center justify-center shrink-0">
                        <Building2 size={16} className="text-[#1a3a5c]" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">
                          {b.warehouse?.Name || `مستودع #${b.WarehouseID}`}
                        </p>
                        {b.warehouse?.Location && (
                          <p className="text-xs text-gray-400 mt-0.5">{b.warehouse.Location}</p>
                        )}
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="md:col-span-3 flex items-center gap-1.5 text-gray-500 text-xs">
                      <Calendar size={12} className="text-gray-400 shrink-0" />
                      <span className="font-mono">{b.StartDate}</span>
                      <span className="text-gray-300">←</span>
                      <span className="font-mono">{b.EndDate}</span>
                    </div>

                    {/* Amount */}
                    <div className="md:col-span-2">
                      <span className="font-bold text-gray-900 text-sm">
                        {parseFloat(b.TotalPrice).toLocaleString()}
                        <span className="text-xs font-normal text-gray-400 mr-1">ر.س</span>
                      </span>
                    </div>

                    {/* Booking status */}
                    <div className="md:col-span-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${status.className}`}>
                        {status.label}
                      </span>
                    </div>

                    {/* Payment status */}
                    <div className="md:col-span-2 flex items-center gap-1.5">
                      <CreditCard size={12} className="text-gray-400 shrink-0" />
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${payment.className}`}>
                        {payment.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-right">
              <p className="text-xs text-gray-400">{bookings.length} حجز إجمالاً</p>
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

export default BookingsPage;