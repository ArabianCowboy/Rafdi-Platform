import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <main className="home-page" dir="rtl">

      <nav className="navbar">
        <div className="brand">رفدي</div>

        <div className="nav-links">
          <span>الرئيسية</span>
          <span>المستودعات</span>
          <span>الحجوزات</span>
          <span>الدعم</span>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          تسجيل الخروج
        </button>
      </nav>

      <section className="hero-section">
        <h1>مرحبًا بك في منصة رفدي</h1>

        <p>
          منصة لإدارة وحجز المستودعات اللوجستية .
        </p>

        <button className="primary-btn">
         المستودعات المتاحة
        </button>
      </section>

      <section className="cards-section">

        <div className="dashboard-card">
          <h3>عدد المستودعات</h3>
          <p>128</p>
        </div>

        <div className="dashboard-card">
          <h3>الحجوزات النشطة</h3>
          <p>34</p>
        </div>

        <div className="dashboard-card">
          <h3>المستودعات المتاحة</h3>
          <p>77</p>
        </div>


        <div className="dashboard-card">
          <h3>الشركات المسجلة</h3>
          <p>52</p>
        </div>

      </section>

    </main>
  );
}

export default HomePage;