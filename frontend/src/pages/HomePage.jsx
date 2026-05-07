import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Building2, LogOut, LayoutDashboard, Layers, HeadphonesIcon, TrendingUp, Package, CheckCircle, Users, ArrowLeft, MapPin, Star } from "lucide-react";

function HomePage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const stats = [
    { label: "المستودعات", value: "128", icon: Building2, color: '#3B82F6', bg: '#EFF6FF' },
    { label: "الحجوزات النشطة", value: "34", icon: Layers, color: '#10B981', bg: '#F0FDF4' },
    { label: "المتاحة الآن", value: "77", icon: CheckCircle, color: '#F59E0B', bg: '#FFFBEB' },
    { label: "الشركات", value: "52", icon: Users, color: '#8B5CF6', bg: '#F5F3FF' },
  ];

  const warehouses = [
    { name: 'مستودع الميناء النموذجي', location: 'جدة، المنطقة الصناعية', price: '15,000', size: '5,000 م²', rating: 4.8, tag: 'الأكثر طلباً' },
    { name: 'مستودع شرق الرياض', location: 'الرياض، السلي', price: '8,000', size: '2,500 م²', rating: 4.5, tag: 'جديد' },
    { name: 'مستودع الدمام اللوجستي', location: 'الدمام، ميناء الملك عبدالعزيز', price: '12,000', size: '3,000 م²', rating: 4.7, tag: 'مميز' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]" dir="rtl" style={{fontFamily: "'Cairo', sans-serif"}}>

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-18 py-3">
            <div className="flex items-center gap-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{background: 'linear-gradient(135deg, #4A8ABF, #2E5F8A)'}}>
                  <span className="text-white font-black">ر</span>
                </div>
                <span className="text-[#0f2744] font-black text-xl">رفدي</span>
              </div>
              <div className="hidden md:flex items-center gap-1">
                {[
                  { label: 'الرئيسية', icon: LayoutDashboard, active: true },
                  { label: 'المستودعات', icon: Building2 },
                  { label: 'الحجوزات', icon: Layers },
                  { label: 'الدعم', icon: HeadphonesIcon },
                ].map((item) => (
                  <button key={item.label}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all"
                    style={{
                      background: item.active ? 'rgba(46,95,138,0.08)' : 'transparent',
                      color: item.active ? '#2E5F8A' : '#6B7280'
                    }}>
                    <item.icon size={16} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
              <LogOut size={16} />
              خروج
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-6"
        style={{background: 'linear-gradient(135deg, #0f2744 0%, #1a3f6f 50%, #2E5F8A 100%)'}}>
        <div className="absolute inset-0 opacity-10"
          style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px'}} />
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{background: 'radial-gradient(circle, #4A8ABF, transparent)'}} />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-right max-w-xl">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white/80 text-xs font-bold">77 مستودع متاح الآن</span>
              </div>
              <h1 className="text-5xl font-black text-white leading-tight mb-5">
                أدر مستودعاتك<br />
                <span style={{color: '#4A8ABF'}}>بذكاء وكفاءة</span>
              </h1>
              <p className="text-white/60 text-lg leading-relaxed mb-8">
                منصة متكاملة لإدارة وحجز المستودعات اللوجستية في جميع أنحاء المملكة العربية السعودية.
              </p>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-[#0f2744] bg-white hover:bg-gray-50 transition-all shadow-xl">
                  <Package size={20} />
                  استعرض المستودعات
                </button>
                <button className="flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-white border border-white/20 bg-white/10 hover:bg-white/20 transition-all">
                  تعرف أكثر
                </button>
              </div>
            </motion.div>

            {/* Stats floating card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 gap-4 w-full max-w-sm"
            >
              {stats.map((stat, idx) => (
                <motion.div key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{background: `${stat.color}30`}}>
                    <stat.icon size={20} style={{color: stat.color}} />
                  </div>
                  <p className="text-3xl font-black text-white">{stat.value}</p>
                  <p className="text-white/50 text-xs font-bold mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Warehouses Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex justify-between items-center mb-10">
          <button className="flex items-center gap-2 text-[#2E5F8A] font-black text-sm hover:gap-3 transition-all">
            عرض الكل
            <ArrowLeft size={16} />
          </button>
          <div className="text-right">
            <p className="text-gray-400 text-sm font-medium">اختر المناسب لك</p>
            <h2 className="text-2xl font-black text-[#0f2744]">المستودعات المميزة</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {warehouses.map((w, idx) => (
            <motion.div key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              {/* Image Placeholder */}
              <div className="h-44 relative overflow-hidden"
                style={{background: 'linear-gradient(135deg, #1a3f6f, #2E5F8A)'}}>
                <div className="absolute inset-0 opacity-10"
                  style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '30px 30px'}} />
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 rounded-full text-xs font-black text-white bg-white/20 border border-white/30">
                    {w.tag}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-3 py-1.5">
                  <p className="text-white font-black text-sm">{w.price} <span className="text-white/60 font-bold text-xs">ر.س/شهر</span></p>
                </div>
                <Building2 className="absolute inset-0 m-auto text-white/10" size={80} />
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-amber-400 fill-amber-400" />
                    <span className="text-sm font-black text-gray-700">{w.rating}</span>
                  </div>
                  <h3 className="font-black text-[#0f2744] text-right">{w.name}</h3>
                </div>

                <div className="space-y-2 mb-5">
                  <div className="flex items-center justify-end gap-2 text-gray-400 text-sm">
                    <span className="font-medium">{w.location}</span>
                    <MapPin size={14} className="text-[#2E5F8A]" />
                  </div>
                  <div className="flex items-center justify-end gap-2 text-gray-400 text-sm">
                    <span className="font-medium">{w.size}</span>
                    <Package size={14} className="text-[#2E5F8A]" />
                  </div>
                </div>

                <button className="w-full py-3 rounded-2xl font-black text-sm transition-all group-hover:shadow-lg"
                  style={{background: 'linear-gradient(135deg, #1a3f6f, #2E5F8A)', color: 'white', boxShadow: '0 4px 15px rgba(46,95,138,0.2)'}}>
                  احجز الآن
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="rounded-3xl p-10 text-right"
          style={{background: 'linear-gradient(135deg, #0f2744, #2E5F8A)'}}>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="grid grid-cols-3 gap-6 w-full lg:w-auto">
              {[
                { icon: '⚡', label: 'حجز فوري' },
                { icon: '🔒', label: 'دفع آمن' },
                { icon: '📱', label: 'متاح 24/7' },
              ].map((f, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl mb-2">{f.icon}</div>
                  <p className="text-white/80 font-black text-sm">{f.label}</p>
                </div>
              ))}
            </div>
            <div className="text-right">
              <h3 className="text-2xl font-black text-white mb-2">جاهز للبدء؟</h3>
              <p className="text-white/60 font-medium mb-4">انضم لأكثر من 500 شركة تثق بمنصة رفدي</p>
              <button className="px-8 py-3 bg-white rounded-2xl font-black text-[#0f2744] hover:bg-gray-50 transition-all">
                ابدأ الآن مجاناً
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 px-6 text-center">
        <p className="text-gray-400 text-xs font-bold">© 2026 Rafdi Platform — جميع الحقوق محفوظة</p>
      </footer>

    </div>
  );
}

export default HomePage;