import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("الرجاء تعبئة جميع الحقول");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("https://www.rafdi.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "البريد الإلكتروني أو كلمة المرور غير صحيحة");
        return;
      }

      localStorage.setItem("token", data.access_token);
      navigate("/home");
    } catch (err) {
      setError("حدث خطأ في الاتصال، حاول مرة أخرى");
    } finally {
      setLoading(false);
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

          <button className="primary-btn" onClick={handleLogin} disabled={loading}>
            {loading ? "جاري التحميل..." : "متابعة"}
          </button>

          {error && <p className="error-message">{error}</p>}
        </div>
      </div>

      <div className="auth-side">
        <h1>رفدي</h1>
        <p>منصة الخدمات اللوجستية للمستودعات</p>
      </div>
    </div>
  );
}

export default LoginPage;