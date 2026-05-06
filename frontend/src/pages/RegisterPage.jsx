function RegisterPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-tabs">
          <button>تسجيل الدخول</button>
          <button className="active-tab">إنشاء حساب</button>
        </div>

        <div className="auth-form">
          <label>اسم الشركة</label>
          <input type="text" placeholder="مثال: شركة رفدي" />

          <label>رقم السجل التجاري</label>
          <input type="text" placeholder="1010XXXXXX" />

          <label>البريد الإلكتروني</label>
          <input type="email" placeholder="name@company.com" />

          <label>كلمة المرور</label>
          <input type="password" placeholder="********" />

          <button className="primary-btn">إنشاء الحساب</button>
        </div>
      </div>

      <div className="auth-side">
        <h1>رفدي</h1>
        <p>ابدأ بإدارة حجوزات المستودعات بسهولة.</p>
      </div>
    </div>
  );
}

export default RegisterPage;