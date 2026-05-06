function LoginPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-tabs">
          <button className="active-tab">تسجيل الدخول</button>
          <button>إنشاء حساب</button>
        </div>

        <div className="auth-form">

          <label>البريد الإلكتروني</label>

          <input
            type="email"
            placeholder="name@company.com"
          />

          <label>كلمة المرور</label>

          <input
            type="password"
            placeholder="********"
          />

          <button className="primary-btn">
            متابعة
          </button>

        </div>
      </div>

      <div className="auth-side">
        <h1>رفدي</h1>

        <p>
          منصة الربط اللوجستي الأولى
        </p>
      </div>
    </div>
  );
}

export default LoginPage;