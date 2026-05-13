import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Building2, Calendar, CreditCard, CheckCircle} from "lucide-react";

function BookingsPage() {
  const navigate = useNavigate();

  const bookings = [
    {
      id: 1,
      warehouseName: "مستودع الرياض",
      startDate: "2026-05-01",
      endDate: "2026-06-01",
      totalPrice: 15000,
      status: "مؤكد",
      paymentStatus: "مدفوع",
    },
    {
      id: 2,
      warehouseName: "مستودع الخرج",
      startDate: "2026-06-10",
      endDate: "2026-07-10",
      totalPrice: 12000,
      status: "قيد المراجعة",
      paymentStatus: "غير مدفوع",
    },
  ];

  return (
    <div
      className="min-h-screen bg-[#F8FAFC]"
      dir="rtl"
      style={{ fontFamily: "'Cairo', sans-serif" }}
    >
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 text-gray-400 hover:text-[#2E5F8A] font-bold text-sm transition-colors"
          >
            <ArrowLeft size={18} className="rotate-180" />
            رجوع
          </button>

          <div className="h-5 w-px bg-gray-200" />

          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #4A8ABF, #2E5F8A)",
              }}
            >
              <span className="text-white font-black text-sm">ر</span>
            </div>

            <span className="text-[#0f2744] font-black">رفدي</span>
          </div>
        </div>
      </nav>

      <section
        className="py-16 px-6 text-right"
        style={{
          background:
            "linear-gradient(135deg, #0f2744 0%, #1a3f6f 50%, #2E5F8A 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto">
          <p className="text-white/60 text-sm font-bold mb-2">
            حجوزاتي
          </p>

          <h1 className="text-4xl font-black text-white mb-4">
            إدارة حجوزات المستودعات
          </h1>

          <p className="text-white/60 max-w-xl leading-relaxed">
            يمكنك متابعة جميع حجوزاتك وحالة الدفع والتواريخ من هذه الصفحة.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 text-right">
            <h2 className="text-2xl font-black text-[#0f2744]">
              قائمة الحجوزات
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              جميع الحجوزات الخاصة بحسابك
            </p>
          </div>

          <div className="divide-y divide-gray-100">
            {bookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 text-right"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{
                      background: "rgba(46,95,138,0.08)",
                    }}
                  >
                    <Building2 size={24} className="text-[#2E5F8A]" />
                  </div>

                  <div>
                    <h3 className="font-black text-[#0f2744] text-lg">
                      {booking.warehouseName}
                    </h3>

                    <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
                      <Calendar size={14} />
                      <span>
                        من {booking.startDate} إلى {booking.endDate}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-4 py-2 rounded-full text-xs font-black bg-emerald-50 text-emerald-600">
                    <CheckCircle size={14} className="inline ml-1" />
                    {booking.status}
                  </span>

                  <span className="px-4 py-2 rounded-full text-xs font-black bg-blue-50 text-blue-600">
                    <CreditCard size={14} className="inline ml-1" />
                    {booking.paymentStatus}
                  </span>

                  <span className="font-black text-[#2E5F8A]">
                    {booking.totalPrice.toLocaleString()} ر.س
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default BookingsPage;