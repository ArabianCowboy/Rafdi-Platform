import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(undefined);

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [language, setLanguage] = useState('ar');

  const switchRole = (newRole) => {
    if (user && user.roles.includes(newRole)) {
      setUser({ ...user, role: newRole });
    }
  };

  const addNotification = (params) => {
    const newNote = {
      ...params,
      id: Math.random().toString(),
      date: new Date().toLocaleString(),
      read: false
    };
    setNotifications(prev => [newNote, ...prev]);
  };

  useEffect(() => {
    const mockCompanies = [
      { id: '1', companyName: 'شركة اللوجستيات العربية', email: 'owner@example.com', registrationNumber: '1010101', role: 'OWNER', roles: ['OWNER'], status: 'APPROVED' },
      { id: '2', companyName: 'مخازن طيبة', email: 'owner2@example.com', registrationNumber: '2020202', role: 'OWNER', roles: ['OWNER', 'RENTER'], status: 'APPROVED' },
      { id: '3', companyName: 'حلول الشحن السريع', email: 'renter@example.com', registrationNumber: '3030303', role: 'RENTER', roles: ['RENTER'], status: 'APPROVED' },
      { id: '4', companyName: 'مدير المنصة', email: 'admin@rafdi.com', registrationNumber: '0000000', role: 'ADMIN', roles: ['ADMIN'], status: 'APPROVED' },
    ];

    const mockWarehouses = [
      { id: 'w1', ownerId: '1', ownerName: 'شركة اللوجستيات العربية', name: 'مستودع الميناء النموذجي', location: 'جدة، المنطقة الصناعية', size: 5000, pricePerMonth: 15000, description: 'مستودع واسع مجهز بأنظمة مكافحة الحريق وتكييف مركزي.', image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800', active: true },
      { id: 'w2', ownerId: '2', ownerName: 'مخازن طيبة', name: 'مستودع شرق الرياض', location: 'الرياض، السلي', size: 2500, pricePerMonth: 8000, description: 'موقع استراتيجي بالقرب من الطرق السريعة الرئيسية.', image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&q=80&w=800', active: true },
      { id: 'w3', ownerId: '1', ownerName: 'شركة اللوجستيات العربية', name: 'مستودع الدمام اللوجستي', location: 'الدمام، ميناء الملك عبد العزيز', size: 3000, pricePerMonth: 12000, description: 'مخصص للبضائع الجافة والمبردة.', image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&q=80&w=800', active: true },
    ];

    const mockBookings = [
      { id: 'b1', warehouseId: 'w1', warehouseName: 'مستودع الميناء النموذجي', renterId: '3', renterName: 'حلول الشحن السريع', startDate: '2026-05-01', endDate: '2026-06-01', totalPrice: 15000, status: 'CONFIRMED', paymentStatus: 'PAID' },
      { id: 'b2', warehouseId: 'w2', warehouseName: 'مستودع شرق الرياض', renterId: '3', renterName: 'حلول الشحن السريع', startDate: '2026-07-01', endDate: '2026-08-01', totalPrice: 8000, status: 'PENDING', paymentStatus: 'UNPAID' },
    ];

    setCompanies(mockCompanies);
    setWarehouses(mockWarehouses);
    setBookings(mockBookings);
  }, []);

  return (
    <AppContext.Provider value={{
      user, setUser, warehouses, setWarehouses, bookings, setBookings,
      companies, setCompanies, notifications, setNotifications, addNotification,
      language, setLanguage, switchRole
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};