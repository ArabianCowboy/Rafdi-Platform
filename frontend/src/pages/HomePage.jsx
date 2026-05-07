import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Building2, LogOut, Home, Layers, HeadphonesIcon, TrendingUp, Package, CheckCircle, Users } from "lucide-react";

function HomePage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const stats = [
    { label: "عدد المستودعات", value: "128", icon: Building2, color: "bg-blue-500" },
    { label: "الحجوزات النشطة", value: "34", icon: Layers, color: "bg-emerald-500" },
    { label: "المستودعات المتاحة", value: "77", icon: CheckCircle, color: "bg-amber-500" },
    { label: "الشركات المسجلة", value: "52", icon: Users, color: "bg-purple-500" },
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">

      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-12">
              <div className="flex items-center gap-2 text-2xl font-bold text-[#2E5F8A]">
                <div className="p-2 bg-[#2E5F8A]/5 rounded-xl">
                  <Building2 size={24} className="text-[#2E5F8A]" />
                </div>
                رفدي
              </div>
              <div className="hidden md:flex items-center gap-8">
                {[
                  { label: "الرئيسية", icon: Home },
                  { label: "المستودعات", icon: Building2 },
                  { label: "الحجوزات", icon: Layers },
                  { label: "الدعم", icon: HeadphonesIcon },
                ].map((item) => (
                  <button key={item.label}
                    className="text-gray-500 hover:text-[#2E5F8A] flex items-center gap-2 font-medium transition-all">
                    <item.icon size={18} className="opacity-70" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-all font-bold">
              <LogOut size={18} />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#2E5F8A] text-white py-32 px-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mb-48 blur-3xl" />
        <div className="max-w-7xl mx-auto relative z-10 text-right">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-6">منصة رفدي اللوجستية</p>
            <h1 className="text-6xl font-black mb-8 leading-tight tracking-tight">
              مرحبًا بك في<br />
              <span className="text-[#4A8ABF]">منصة رفدي</span>
            </h1>
            <p className="text-white/70 text-xl leading-relaxed mb-12 max-w-xl">
              منصة متكاملة لإدارة وحجز المستودعات اللوجستية بكل سهولة وأمان.
            </p>
            <button className="bg-white text-[#2E5F8A] px-10 py-5 rounded-2xl font-black text-lg shadow-2xl hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-3">
              <Package size={22} />
              المستودعات المتاحة
            </button>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <motion.div key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-white p-1 rounded-3xl shadow-sm border border-gray-100 flex items-stretch hover:shadow-xl transition-all duration-300"
            >
              <div className={`w-2 rounded-r-2xl ${stat.color} opacity-80`} />
              <div className="flex-1 p-6 flex items-center gap-4">
                <div className={`p-4 rounded-2xl text-white ${stat.color} shadow-lg group-hover:scale-110 transition-transform`}>
                  <stat.icon size={22} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "إدارة المستودعات", desc: "أضف وتحكم في مستودعاتك بكل سهولة من لوحة تحكم موحدة.", icon: Building2, color: "bg-blue-50 text-blue-600" },
            { title: "حجز سريع وآمن", desc: "احجز المستودع المناسب لك بخطوات بسيطة وادفع بأمان.", icon: CheckCircle, color: "bg-emerald-50 text-emerald-600" },
            { title: "تتبع الحجوزات", desc: "تابع جميع حجوزاتك ومدفوعاتك في مكان واحد.", icon: TrendingUp, color: "bg-purple-50 text-purple-600" },
          ].map((feature, idx) => (
            <motion.div key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + idx * 0.1 }}
              className="bg-white p-10 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all text-right"
            >
              <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                <feature.icon size={28} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-500 leading-relaxed font-medium">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
}

export default HomePage;