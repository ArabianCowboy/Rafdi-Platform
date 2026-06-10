function RoleSelector({ token, onSelect }) {
  const companyName = getCompanyNameFromToken(token);

  return (
    <div className="min-h-screen" dir="rtl"
      style={{ background: '#f8fafc', fontFamily: "'IBM Plex Sans Arabic', 'Tajawal', sans-serif" }}>

      {/* Header */}
      <div style={{ background: '#0d1b3e', padding: '40px 24px 60px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'right' }}>
          <h1 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 'clamp(28px,4vw,42px)', color: '#fff', marginBottom: 10 }}>
            أهلاً، {companyName}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 16 }}>
            اختر طريقة الدخول للمنصة
          </p>
        </div>
      </div>

      {/* Cards */}
      <div style={{ maxWidth: 900, margin: '-30px auto 0', padding: '0 24px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>

          {/* مالك مستودع */}
          <div style={{
            background: '#fff', borderRadius: 16, padding: 28,
            border: '1px solid #e2e8f0', textAlign: 'right',
            boxShadow: '0 4px 20px -8px rgba(15,23,42,0.1)',
            display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, background: '#eff6ff',
                display: 'grid', placeItems: 'center',
              }}>
                <Building2 size={24} color="#2563eb" />
              </div>
              <div>
                <h3 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 20, color: '#0f172a', marginBottom: 4 }}>
                  مالك مستودع
                </h3>
                <p style={{ fontSize: 13, color: '#64748b' }}>إدارة مستودعاتك وتتبع الحجوزات</p>
              </div>
            </div>

            <button onClick={() => onSelect('owner')}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                color: '#2563eb', fontWeight: 700, fontSize: 14,
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', padding: 0, marginTop: 4,
              }}>
              <ArrowLeft size={16} />
              دخول
            </button>
          </div>

          {/* مستأجر */}
          <div style={{
            background: '#fff', borderRadius: 16, padding: 28,
            border: '1px solid #e2e8f0', textAlign: 'right',
            boxShadow: '0 4px 20px -8px rgba(15,23,42,0.1)',
            display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, background: '#ecfdf5',
                display: 'grid', placeItems: 'center',
              }}>
                <Layers size={24} color="#10b981" />
              </div>
              <div>
                <h3 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 20, color: '#0f172a', marginBottom: 4 }}>
                  مستأجر
                </h3>
                <p style={{ fontSize: 13, color: '#64748b' }}>ابحث عن مستودع واحجز بسهولة</p>
              </div>
            </div>

            <button onClick={() => onSelect('renter')}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                color: '#10b981', fontWeight: 700, fontSize: 14,
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', padding: 0, marginTop: 4,
              }}>
              <ArrowLeft size={16} />
              دخول
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}