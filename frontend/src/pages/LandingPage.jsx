import { useNavigate } from 'react-router-dom';
import { Building2, CheckCircle, MapPin, Shield, Clock, Users } from 'lucide-react';

const WarehouseMark = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <path d="M32 7 L61 28 L3 28 Z" fill="#fff" stroke="#fff" strokeWidth="2.4" strokeLinejoin="round"/>
    <path d="M8 28 L8 57 L56 57 L56 28" stroke="#fff" strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round"/>
    <line x1="2" y1="57" x2="62" y2="57" stroke="#fff" strokeWidth="3.4" strokeLinecap="round"/>
    <rect x="13" y="44" width="10" height="13" fill="#fff" rx="1"/>
    <rect x="27" y="37" width="10" height="20" fill="#fff" rx="1"/>
    <rect x="41" y="41" width="10" height="16" fill="#fff" rx="1"/>
  </svg>
);

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white" dir="rtl" style={{ fontFamily: "'IBM Plex Sans Arabic', 'Tajawal', sans-serif" }}>

      {/* Navbar */}
      <header style={{
        borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0,
        background: '#fff', zIndex: 50,
        boxShadow: '0 1px 0 rgba(15,23,42,0.02), 0 4px 14px -10px rgba(15,23,42,0.08)',
      }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2.5">
              <span style={{
                width: 32, height: 32, background: '#2563eb', borderRadius: 8,
                display: 'grid', placeItems: 'center',
                boxShadow: '0 6px 14px -6px rgba(37,99,235,0.55)',
              }}>
                <WarehouseMark size={18} />
              </span>
              <span style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 22, color: '#0f172a', letterSpacing: '-0.01em' }}>
                رفدي
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/login')}
                style={{ fontSize: 14, fontWeight: 500, color: '#475569', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 14px', borderRadius: 8, fontFamily: 'inherit', transition: 'background .15s' }}
                onMouseEnter={e => e.target.style.background = '#f1f5f9'}
                onMouseLeave={e => e.target.style.background = 'none'}>
                تسجيل الدخول
              </button>
              <button onClick={() => navigate('/register')}
                style={{
                  fontSize: 14, fontWeight: 600, color: '#fff',
                  background: '#2563eb', border: 'none', cursor: 'pointer',
                  padding: '9px 18px', borderRadius: 9, fontFamily: 'inherit',
                  boxShadow: '0 6px 16px -6px rgba(37,99,235,0.55)',
                  transition: 'background .15s',
                }}
                onMouseEnter={e => e.target.style.background = '#1d4ed8'}
                onMouseLeave={e => e.target.style.background = '#2563eb'}>
                ابدأ مجاناً
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: '#0d1b3e', position: 'relative', overflow: 'hidden' }} className="py-24 px-4">
        {/* dot grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '22px 22px', opacity: 0.7,
          maskImage: 'radial-gradient(ellipse at center, #000 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, #000 40%, transparent 80%)',
        }} />
        <div style={{
          position: 'absolute', top: -180, left: '50%', transform: 'translateX(-50%)',
          width: 900, height: 600,
          background: 'radial-gradient(ellipse at center, rgba(37,99,235,0.45) 0%, rgba(37,99,235,0.18) 30%, transparent 65%)',
          pointerEvents: 'none', filter: 'blur(6px)',
        }} />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 9,
            padding: '7px 14px 7px 12px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 100, fontSize: 13, fontWeight: 500, color: '#cbd5e1', marginBottom: 22,
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%', background: '#60a5fa',
              boxShadow: '0 0 0 4px rgba(96,165,250,0.18), 0 0 14px rgba(96,165,250,0.9)',
            }} />
            منصة حجز المستودعات الأولى في المملكة
          </div>

          <h1 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 'clamp(36px,5.5vw,60px)', color: '#fff', lineHeight: 1.15, marginBottom: 18, letterSpacing: '-0.02em' }}>
            احجز مستودعك<br />
            <span style={{ color: '#93c5fd' }}>بكل سهولة وأمان</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: 17, lineHeight: 1.65, marginBottom: 32, maxWidth: 560, margin: '0 auto 32px' }}>
            رفدي يربط أصحاب المستودعات بالشركات الباحثة عن مساحة تخزين — بشكل مباشر وآمن وفوري.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={() => navigate('/register')}
              style={{
                padding: '13px 32px', background: '#fff', color: '#0d1b3e',
                fontWeight: 700, fontSize: 15, borderRadius: 10, border: 'none',
                cursor: 'pointer', fontFamily: 'inherit', width: '100%', maxWidth: 260,
                boxShadow: '0 8px 20px -8px rgba(0,0,0,0.3)',
              }}>
              ابحث عن مستودع الآن
            </button>
            <button onClick={() => navigate('/register')}
              style={{
                padding: '13px 32px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff', fontWeight: 600, fontSize: 15,
                borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
                width: '100%', maxWidth: 260,
              }}>
              أضف مستودعك وأجّره
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: '#fff', borderBottom: '1px solid #e2e8f0' }} className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { value: '+128', label: 'مستودع مسجل' },
              { value: '+500', label: 'شركة مسجلة' },
              { value: '٩٩٪', label: 'رضا العملاء' },
            ].map((s, i) => (
              <div key={i}>
                <p style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 28, color: '#2563eb' }}>{s.value}</p>
                <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: '#f8fafc' }} className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 28, color: '#0f172a', marginBottom: 8 }}>
              كيف يعمل رفدي؟
            </h2>
            <p style={{ color: '#64748b', fontSize: 15 }}>ثلاث خطوات بسيطة للبدء</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { num: '١', title: 'سجّل حسابك', desc: 'أنشئ حساباً كمالك مستودع أو مستأجر في دقيقة واحدة', icon: Users },
              { num: '٢', title: 'ابحث أو أضف', desc: 'ابحث عن مستودع مناسب أو أضف مستودعك للإيجار', icon: MapPin },
              { num: '٣', title: 'احجز وادفع', desc: 'احجز بشكل فوري وادفع بأمان عبر بوابة ميسر', icon: Shield },
            ].map((step, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, textAlign: 'right', boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8, background: '#2563eb',
                  display: 'grid', placeItems: 'center', marginBottom: 14,
                  boxShadow: '0 6px 14px -6px rgba(37,99,235,0.5)',
                }}>
                  <span style={{ color: '#fff', fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 15 }}>{step.num}</span>
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', marginBottom: 6 }}>{step.title}</h3>
                <p style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ background: '#fff' }} className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 28, color: '#0f172a' }}>لماذا رفدي؟</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: CheckCircle, title: 'حجز فوري', desc: 'احجز مستودعك فوراً بدون انتظار أو مفاوضات طويلة' },
              { icon: Shield, title: 'دفع آمن', desc: 'جميع المدفوعات مؤمّنة عبر بوابة ميسر المعتمدة' },
              { icon: Building2, title: 'مستودعات موثوقة', desc: 'جميع المستودعات مراجعة ومُتحقق منها قبل النشر' },
              { icon: Clock, title: 'متاح ٢٤/٧', desc: 'ابحث واحجز في أي وقت من أي مكان' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: 16, border: '1px solid #f1f5f9', borderRadius: 12, textAlign: 'right' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#eff6ff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <f.icon size={18} color="#2563eb" />
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: 14.5, color: '#0f172a', marginBottom: 5 }}>{f.title}</h3>
                  <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#0d1b3e', position: 'relative', overflow: 'hidden' }} className="py-16 px-4">
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: 700, height: 400,
          background: 'radial-gradient(ellipse, rgba(37,99,235,0.35), transparent 65%)',
          pointerEvents: 'none',
        }} />
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h2 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 32, color: '#fff', marginBottom: 10 }}>
            جاهز للبدء؟
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: 15, marginBottom: 28 }}>
            انضم لأكثر من 500 شركة تستخدم رفدي اليوم
          </p>
          <button onClick={() => navigate('/register')}
            style={{
              padding: '13px 36px', background: '#fff', color: '#0d1b3e',
              fontWeight: 700, fontSize: 15, borderRadius: 10, border: 'none',
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 8px 20px -8px rgba(0,0,0,0.4)',
            }}>
            إنشاء حساب مجاني
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#fff', borderTop: '1px solid #e2e8f0' }}>
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
          <span style={{ color: '#64748b', fontSize: 13 }}>© Rafdi Platform 2026 — جميع الحقوق محفوظة</span>
          <div className="flex items-center gap-2">
            <span style={{
              width: 28, height: 28, background: '#2563eb', borderRadius: 7,
              display: 'grid', placeItems: 'center',
            }}>
              <WarehouseMark size={16} />
            </span>
            <span style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 16, color: '#0f172a' }}>رفدي</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;