import { Link } from "react-router-dom";
import { useState } from "react";

function RegisterPage() {
  const [companyName, setCompanyName] = useState("");
  const [commercialRegistration, setCommercialRegistration] = useState("");
  const [accountType, setAccountType] = useState("owner");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = () => {
    if (!companyName || !commercialRegistration || !email || !password) {
      setError("الرجاء تعبئة جميع الحقول");
      return;
    }

    setError("");
    alert("تم إنشاء الحساب بنجاح");
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
            <option value="owner">مالك</option>
            <option value="renter">مستأجر</option>
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

          <button className="primary-btn" onClick={handleRegister}>
            إنشاء الحساب
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