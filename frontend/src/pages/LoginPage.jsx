import { useState } from "react";
function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (!email || !password) {
      setError("الرجاء إدخال البريد الألكتروني وكلمة المرور");
      return;
    }
    if (email === "admin@test.com" && password === "123456") {
      setError("");
      alert("تم تسجيل الدخول بنجاح");
    } else {
    setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    }
};

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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>كلمة المرور</label>

          <input
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="primary-btn" onClick={handleLogin}>
            متابعة
          </button>
          {error && <p className="error-message">{error}</p>}
          
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