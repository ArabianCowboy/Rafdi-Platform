import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import WarehousesPage from './pages/WarehousesPage';
import BookingsPage from './pages/BookingsPage';
import OwnerBookingsPage from './pages/OwnerBookingsPage';
import BookingPage from "./pages/BookingPage";
import BookingDetailPage from './pages/BookingDetailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import ProfilePage from './pages/ProfilePage';
import PaymentPage from './pages/PaymentPage';
import AdminPage from './pages/AdminPage';

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0 },
};

const transition = {
  duration: 0.18,
  ease: [0.16, 1, 0.3, 1],
};

const barTransition = {
  duration: 0.42,
  ease: [0.65, 0, 0.35, 1],
};

function AnimatedRoutes() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <>
      <motion.div
        key={`bar-${location.pathname}`}
        initial={{ scaleX: 0, opacity: 1 }}
        animate={{ scaleX: 1, opacity: [1, 1, 0] }}
        transition={barTransition}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          left: 0,
          zIndex: 9999,
          height: 3,
          background: 'linear-gradient(90deg, #10b981, #2563eb)',
          transformOrigin: 'right',
          pointerEvents: 'none',
        }}
      />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          variants={pageTransition}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={transition}
        >
          <Routes location={location}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/warehouses" element={<WarehousesPage />} />
            <Route path="/booking/:id" element={<BookingPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/booking-detail/:id" element={<BookingDetailPage />} />
            <Route path="/owner-bookings" element={<OwnerBookingsPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;
