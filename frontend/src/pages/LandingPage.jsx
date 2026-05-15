import { useNavigate } from 'react-router-dom';
import { Building2, CheckCircle, MapPin, Shield, Clock, Users } from 'lucide-react';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>

      {/* Navbar */}
      <header className="border-b border-gray-100 sticky top-0 bg-white z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#1a3a5c] flex items-center justify-center">
                <span className="text-white font-black text-sm">ر</span>
              </div>
              <span className="text-[#1a3a5c] font-black text-lg">رفدي</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/login')}
                className="text-sm font-semibold text-gray-600 hover:text-[#1a3a5c] transition-colors px-3 py-1.5">
                تسجيل الدخول
              </button>
              <button onClick={() => navigate('/register')}
                className="text-sm font-bold text-white bg-[#1a3a5c] hover:bg-[#14304e] px-4 py-2 rounded-lg transition-colors">
                ابدأ مجاناً
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#1a3a5c] py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-white/80 text-xs font-semibold">منصة حجز المستودعات الأولى في المملكة</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-5">
            احجز مستودعك<br />
            <span className="text-blue-300">بكل سهولة وأمان</span>
          </h1>
          <p className="text-blue-200 text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
            رفدي يربط أصحاب المستودعات بالشركات الباحثة عن مساحة تخزين — بشكل مباشر وآمن وفوري.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={() => navigate('/register')}
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-[#1a3a5c] font-black rounded-xl hover:bg-gray-50 transition-colors text-sm">
              ابحث عن مستودع الآن
            </button>
            <button onClick={() => navigate('/register')}
              className="w-full sm:w-auto px-8 py-3.5 border border-white/30 text-white font-bold rounded-xl hover:bg-white/10 transition-colors text-sm">
              أضف مستودعك وأجّره
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { value: '+128', label: 'مستودع مسجل' },
              { value: '+500', label: 'شركة مسجلة' },
              { value: '٩٩٪', label: 'رضا العملاء' },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-2xl font-black text-[#1a3a5c]">{s.value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-[#f7f8fa]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-2">كيف يعمل رفدي؟</h2>
            <p className="text-gray-500 text-sm">ثلاث خطوات بسيطة للبدء</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { num: '١', title: 'سجّل حسابك', desc: 'أنشئ حساباً كمالك مستودع أو مستأجر في دقيقة واحدة', icon: Users },
              { num: '٢', title: 'ابحث أو أضف', desc: 'ابحث عن مستودع مناسب أو أضف مستودعك للإيجار', icon: MapPin },
              { num: '٣', title: 'احجز وادفع', desc: 'احجز بشكل فوري وادفع بأمان عبر بوابة ميسر', icon: Shield },
            ].map((step, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 text-right">
                <div className="w-9 h-9 rounded-lg bg-[#1a3a5c] flex items-center justify-center mb-4">
                  <span className="text-white font-black text-sm">{step.num}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1.5">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-2">لماذا رفدي؟</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: CheckCircle, title: 'حجز فوري', desc: 'احجز مستودعك فوراً بدون انتظار أو مفاوضات طويلة' },
              { icon: Shield, title: 'دفع آمن', desc: 'جميع المدفوعات مؤمّنة عبر بوابة ميسر المعتمدة' },
              { icon: Building2, title: 'مستودعات موثوقة', desc: 'جميع المستودعات مراجعة ومُتحقق منها قبل النشر' },
              { icon: Clock, title: 'متاح ٢٤/٧', desc: 'ابحث واحجز في أي وقت من أي مكان' },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-4 p-4 border border-gray-100 rounded-xl text-right">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <f.icon size={18} className="text-[#1a3a5c]" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{f.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-[#1a3a5c]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-black text-white mb-3">جاهز للبدء؟</h2>
          <p className="text-blue-200 text-sm mb-6">انضم لأكثر من 500 شركة تستخدم رفدي اليوم</p>
          <button onClick={() => navigate('/register')}
            className="px-8 py-3.5 bg-white text-[#1a3a5c] font-black rounded-xl hover:bg-gray-50 transition-colors text-sm">
            إنشاء حساب مجاني
          </button>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-6 bg-white">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <span className="text-xs text-gray-400">© 2026 Rafdi Platform — جميع الحقوق محفوظة</span>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#1a3a5c] flex items-center justify-center">
              <span className="text-white font-bold text-xs">ر</span>
            </div>
            <span className="text-xs font-bold text-gray-600">رفدي</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;