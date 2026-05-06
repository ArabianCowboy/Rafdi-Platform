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

        <button className="logout-btn" onClick={handleLogout}>
          تسجيل الخروج
        </button>
      </nav>

      <section className="page-header">
        <h1>مرحبًا بك في منصة رفدي</h1>
        <p>تم تسجيل الدخول بنجاح، ويمكنك الآن متابعة استخدام المنصة.</p>
      </section>
    </main>
  );
}

export default HomePage;