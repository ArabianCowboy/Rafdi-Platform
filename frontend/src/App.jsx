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
  initial: { opacity: 0, x: -28 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 24 },
};

const transition = {
  duration: 0.22,
  ease: [0.4, 0, 0.2, 1],
};

function AnimatedRoutes() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
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
