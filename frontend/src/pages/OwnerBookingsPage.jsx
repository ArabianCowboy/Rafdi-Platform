import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import WarehousePage from './pages/WarehousesPage';
import BookingsPage from './pages/BookingsPage';
import OwnerBookingsPage from './pages/OwnerBookingsPage';
import BookingPage from "./pages/BookingPage";
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import PaymentPage from './pages/PaymentPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/warehouses" element={<WarehousePage />} />
        <Route path="/booking/:id" element={<BookingPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/owner-bookings" element={<OwnerBookingsPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/payment" element={<PaymentPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;