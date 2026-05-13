import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Building2, ArrowLeft, Loader, MapPin, Package, Star} from "lucide-react";

const API_URL = 'https://api.rafdi.com';

function WarehousePage() {
  const navigate = useNavigate();

  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/warehouses/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("فشل في تحميل المستودعات");
        }

        const data = await res.json();
        setWarehouses(data);
      } catch {
        setError("حدث خطأ أثناء تحميل المستودعات");
      } finally {
        setLoading(false);
      }
    };

    fetchWarehouses();
  }, []);

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
            المستودعات المتوفرة
          </p>

          <h1 className="text-4xl font-black text-white mb-4">
            اختر المستودع المناسب لك
          </h1>

          <p className="text-white/60 max-w-xl leading-relaxed">
        استعرض المساحات المتوفرةوأحجز بأبسط الطرق وأسرعها 
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12">
        {loading && (
          <div className="flex justify-center items-center py-24">
            <Loader size={40} className="text-[#2E5F8A] animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-24">
            <p className="text-red-500 font-bold">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {warehouses.map((warehouse, index) => (
              <motion.div
                key={warehouse.WarehouseID}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div
                  className="h-44 relative"
                  style={{
                    background: "linear-gradient(135deg, #0f2744, #2E5F8A)",
                  }}
                >
                  {warehouse.ImagePath ? (
                    <img
                      src={warehouse.ImagePath}
                      alt={warehouse.Name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2
                      className="absolute inset-0 m-auto text-white/10"
                      size={80}
                    />
                  )}

                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full text-xs font-black text-white bg-white/20 border border-white/30">
                      {warehouse.IsActive ? "متاح" : "غير متاح"}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-3 py-1.5">
                    <p className="text-white font-black text-sm">
                      {warehouse.PricePerMonth?.toLocaleString()}{" "}
                      <span className="text-white/60 font-bold text-xs">
                        ر.س/شهر
                      </span>
                    </p>
                  </div>
                </div>

                <div className="p-6 text-right">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-amber-400 fill-amber-400" />
                      <span className="text-sm font-black text-gray-700">
                        4.5
                      </span>
                    </div>

                    <h3 className="font-black text-[#0f2744]">
                      {warehouse.Name}
                    </h3>
                  </div>

                  <div className="space-y-2 mb-5">
                    <div className="flex items-center justify-end gap-2 text-gray-400 text-sm">
                      <span className="font-medium">{warehouse.Location}</span>
                      <MapPin size={14} className="text-[#2E5F8A]" />
                    </div>

                    <div className="flex items-center justify-end gap-2 text-gray-400 text-sm">
                      <span className="font-medium">{warehouse.Size} م²</span>
                      <Package size={14} className="text-[#2E5F8A]" />
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/booking/${warehouse.WarehouseID}`)}
                    className="w-full py-3 rounded-2xl font-black text-sm text-white transition-all"
                    style={{
                      background:
                        "linear-gradient(135deg, #1a3f6f, #2E5F8A)",
                      boxShadow: "0 4px 15px rgba(46,95,138,0.2)",
                    }}
                  >
                    احجز الآن
                  </button>
                </div>
              </motion.div>
            ))}

            {warehouses.length === 0 && (
              <div className="col-span-3 text-center py-20">
                <Building2 size={60} className="text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-bold">
                  لا توجد مستودعات متاحة حالياً
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default WarehousePage;