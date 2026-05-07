import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function RegisterPage() {
  const [companyName, setCompanyName] = useState("");
  const [commercialRegistration, setCommercialRegistration] = useState("");
  const [accountType, setAccountType] = useState("warehouse_owner");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!companyName || !commercialRegistration || !email || !password) {
      setError("الرجاء تعبئة جميع الحقول");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("https://www.rafdi.com/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: companyName,
          commercial_registration: commercialRegistration,
          account_types: [accountType],
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "حدث خطأ أثناء إنشاء الحساب");
        return;
      }

      navigate("/login");
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
          <Link to="/login">
            <button>تسجيل الدخول</button>
          </Link>
          <button className="active-tab">إنشاء حساب</button>
        </div>

        <div className="auth-form">
          <label>اسم الشركة</label>
          <input
            type="text"
            placeholder="مثال: شركة رفدي"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />

          <label>رقم السجل التجاري</label>
          <input
            type="text"
            placeholder="1010XXXXXX"
            value={commercialRegistration}
            onChange={(e) => setCommercialRegistration(e.target.value)}
          />

          <label>نوع الحساب</label>
          <select
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
          >
            <option value="warehouse_owner">مالك مستودع</option>
            <option value="warehouse_renter">مستأجر مستودع</option>
          </select>

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

          <button className="primary-btn" onClick={handleRegister} disabled={loading}>
            {loading ? "جاري التحميل..." : "إنشاء الحساب"}
          </button>

          {error && <p className="error-message">{error}</p>}
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