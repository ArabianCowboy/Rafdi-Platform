import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Settings } from 'lucide-react';
import NotificationBell from './NotificationBell';

const getUserRoles = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return [];
    return JSON.parse(atob(token.split('.')[1])).roles || [];
  } catch { return []; }
};

const getUserInfo = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return {};
    return JSON.parse(atob(token.split('.')[1]));
  } catch { return {}; }
};

const WarehouseLogo = () => (
  <svg width="20" height="20" viewBox="0 0 64 64" fill="none">
    <path d="M32 7 L61 28 L3 28 Z" fill="#fff" stroke="#fff" strokeWidth="2.4" strokeLinejoin="round"/>
    <path d="M8 28 L8 57 L56 57 L56 28" stroke="#fff" strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round"/>
    <line x1="2" y1="57" x2="62" y2="57" stroke="#fff" strokeWidth="3.4" strokeLinecap="round"/>
    <rect x="13" y="44" width="10" height="13" fill="#fff" rx="1"/>
    <rect x="27" y="37" width="10" height="20" fill="#fff" rx="1"/>
    <rect x="41" y="41" width="10" height="16" fill="#fff" rx="1"/>
  </svg>
);

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const roles = getUserRoles();
  const userInfo = getUserInfo();
  const isOwner = roles.includes('warehouse_owner');
  const isRenter = roles.includes('renter_company');
  const companyName = userInfo.company_name || '';
  const displayName = companyName || userInfo.email || 'المستخدم';
  const avatarLetter = companyName.charAt(0) || userInfo.email?.charAt(0) || 'م';

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navLinks = [
    { label: 'الرئيسية', path: '/home' },
    ...(isRenter ? [{ label: 'حجوزاتي', path: '/bookings' }] : []),
    ...(isOwner ? [{ label: 'مستودعاتي', path: '/warehouses' }] : []),
    ...(isOwner ? [{ label: 'إدارة الحجوزات', path: '/owner-bookings' }] : []),
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: '#fff',
      borderBottom: '1px solid #e2e8f0',
      boxShadow: '0 1px 0 rgba(15,23,42,0.02), 0 4px 14px -10px rgba(15,23,42,0.08)',
      fontFamily: "'IBM Plex Sans Arabic', 'Tajawal', sans-serif",
    }} dir="rtl">
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '14px 36px', display: 'flex', alignItems: 'center', gap: 28 }}>

        {/* Logo */}
        <div onClick={() => navigate('/home')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0 }}>
          <span style={{
            width: 32, height: 32, background: '#2563eb', borderRadius: 8,
            display: 'grid', placeItems: 'center',
            boxShadow: '0 6px 14px -6px rgba(37,99,235,0.55), inset 0 -2px 0 rgba(0,0,0,0.08)',
            flexShrink: 0,
          }}>
            <WarehouseLogo />
          </span>
          <span style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: '-0.01em', color: '#0f172a' }}>
            رفدي
          </span>
        </div>

        {/* Nav Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4, marginRight: 24 }}>
          {navLinks.map(link => (
            <button key={link.path} onClick={() => navigate(link.path)}
              style={{
                padding: '8px 14px', borderRadius: 8, border: 'none',
                background: isActive(link.path) ? '#eff6ff' : 'transparent',
                color: isActive(link.path) ? '#2563eb' : '#475569',
                fontWeight: isActive(link.path) ? 700 : 500,
                fontSize: 15, cursor: 'pointer', fontFamily: 'inherit',
                transition: 'background .15s, color .15s',
              }}
              onMouseEnter={e => { if (!isActive(link.path)) { e.target.style.background = '#f1f5f9'; e.target.style.color = '#0f172a'; }}}
              onMouseLeave={e => { if (!isActive(link.path)) { e.target.style.background = 'transparent'; e.target.style.color = '#475569'; }}}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right side */}
        <div style={{ marginInlineStart: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>

          {isOwner && (
            <>
              <button onClick={() => navigate('/warehouses')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '9px 16px', borderRadius: 9,
                  background: '#2563eb', color: '#fff',
                  fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer',
                  boxShadow: '0 6px 16px -6px rgba(37,99,235,0.55)', fontFamily: 'inherit',
                }}>
                <Settings size={15} />
                إدارة المستودعات
              </button>
              <span style={{ width: 1, height: 26, background: '#e2e8f0' }} />
            </>
          )}

          <NotificationBell />

          {/* Role chips */}
          <div style={{ display: 'flex', gap: 6 }}>
            {isOwner && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '5px 11px', borderRadius: 100,
                fontSize: 12.5, fontWeight: 600,
                background: '#eff6ff', color: '#1d4ed8',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563eb' }} />
                مالك
              </span>
            )}
            {isRenter && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '5px 11px', borderRadius: 100,
                fontSize: 12.5, fontWeight: 600,
                background: '#ecfdf5', color: '#047857',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                مستأجر
              </span>
            )}
          </div>

          <span style={{ width: 1, height: 26, background: '#e2e8f0' }} />

          {/* User — اسم الشركة */}
          <button onClick={() => navigate('/profile')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '4px 10px 4px 4px', borderRadius: 100,
              border: 'none', background: 'transparent',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'background .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563eb, #1e3a8a)',
              color: '#fff', display: 'grid', placeItems: 'center',
              fontWeight: 700, fontSize: 13, flexShrink: 0,
            }}>
              {avatarLetter}
            </span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayName}
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {/* Logout */}
          <button onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', padding: '8px',
              borderRadius: 8, border: 'none', background: 'transparent',
              color: '#94a3b8', cursor: 'pointer', transition: 'color .15s, background .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fef2f2'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent'; }}
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;