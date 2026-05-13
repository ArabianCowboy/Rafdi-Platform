import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import WarehousePage from './pages/WarehousesPage';
import BookingsPage from './pages/BookingsPage';
import BookingPage from "./pages/BookingPage";
import ForgotPasswordPage from './pages/ForgotPasswordPage';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/warehouses" element={<WarehousePage />} />
        <Route path="/booking/:id" element={<BookingPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;