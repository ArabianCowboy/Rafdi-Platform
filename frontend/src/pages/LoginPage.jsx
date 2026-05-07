import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {

 if (email === "admin@test.com" && password === "123456") {
  setError("");
  localStorage.setItem("token", "fake-jwt-token");
  navigate("/home");
} else {
  setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
}

};

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-tabs">
          <button className="active-tab">تسجيل الدخول</button>
          <Link to="/register">
            <button>إنشاء حساب</button>
          </Link>
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
        منصة الخدمات الوجستية للمستودعات
        </p>
      </div>
    </div>
  );
}

export default LoginPage;