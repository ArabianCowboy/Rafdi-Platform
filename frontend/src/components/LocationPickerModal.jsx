import { useState, useEffect, useRef } from 'react';
import { MapPin, Search, X, Loader, Check } from 'lucide-react';

function LocationPickerModal({ initialValue, onSelect, onClose }) {
  const [query, setQuery] = useState(initialValue || '');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [marker, setMarker] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerInstanceRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (window.L) { initMap(); return; }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => initMap();
    document.body.appendChild(script);

    return () => {};
  }, []);

  const initMap = () => {
    if (mapInstanceRef.current || !mapRef.current) return;
    const L = window.L;
    const map = L.map(mapRef.current, { zoomControl: true }).setView([24.7136, 46.6753], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    map.on('click', (e) => {
      placeMarker(e.latlng.lat, e.latlng.lng);
      reverseGeocode(e.latlng.lat, e.latlng.lng);
    });

    mapInstanceRef.current = map;
  };

  const placeMarker = (lat, lon, label) => {
    const L = window.L;
    const map = mapInstanceRef.current;
    if (!map) return;

    if (markerInstanceRef.current) {
      markerInstanceRef.current.setLatLng([lat, lon]);
    } else {
      markerInstanceRef.current = L.marker([lat, lon]).addTo(map);
    }
    map.setView([lat, lon], 14);
    setMarker({ lat, lon, label: label || marker?.label });
  };

  const reverseGeocode = async (lat, lon) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=ar`);
      const data = await res.json();
      const label = data.display_name || `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
      setMarker({ lat, lon, label });
      setQuery(label);
    } catch {
      setMarker({ lat, lon, label: `${lat.toFixed(5)}, ${lon.toFixed(5)}` });
    }
  };

  const handleSearchChange = (val) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val || val.length < 3) { setResults([]); return; }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&accept-language=ar&countrycodes=sa&limit=5`
        );
        const data = await res.json();
        setResults(data);
      } catch {
        setResults([]);
      } finally { setSearching(false); }
    }, 400);
  };

  const handleSelectResult = (item) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    setQuery(item.display_name);
    setResults([]);
    placeMarker(lat, lon, item.display_name);
  };

  const handleConfirm = () => {
    if (marker) {
      onSelect({ location: marker.label || query, lat: marker.lat, lon: marker.lon });
    } else {
      onSelect({ location: query, lat: null, lon: null });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg relative z-10 overflow-hidden">

        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: 800, fontSize: 16, color: '#0f172a' }}>
            تحديد الموقع
          </h3>
          <button onClick={onClose}
            style={{ width: 28, height: 28, borderRadius: 8, background: '#f1f5f9', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center', color: '#64748b' }}>
            <X size={15} />
          </button>
        </div>

        <div className="p-4">
          <div className="relative mb-3">
            <input
              type="text"
              value={query}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="ابحث عن مدينة أو حي..."
              style={{
                width: '100%', padding: '10px 40px 10px 14px', borderRadius: 10,
                border: '1px solid #e2e8f0', outline: 'none', background: '#fff',
                fontSize: 14, color: '#0f172a', direction: 'rtl', fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = '#2563eb'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
            <div style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
              {searching ? <Loader size={15} className="animate-spin" /> : <Search size={15} />}
            </div>

            {results.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, left: 0, marginTop: 4,
                background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10,
                boxShadow: '0 8px 24px -8px rgba(15,23,42,0.15)', zIndex: 20, overflow: 'hidden',
              }}>
                {results.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectResult(item)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 8, width: '100%',
                      padding: '10px 14px', textAlign: 'right', background: '#fff',
                      border: 'none', borderBottom: i < results.length - 1 ? '1px solid #f1f5f9' : 'none',
                      cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, color: '#334155',
                      transition: 'background .15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  >
                    <MapPin size={13} color="#94a3b8" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{item.display_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div
            ref={mapRef}
            style={{ width: '100%', height: 280, borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0' }}
          />

          <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 8, textAlign: 'right' }}>
            اضغط على الخريطة لتحديد الموقع بدقة، أو استخدم البحث أعلاه
          </p>

          <button
            onClick={handleConfirm}
            style={{
              width: '100%', marginTop: 14, padding: '12px 16px', borderRadius: 9,
              background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: 14,
              border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 8px 18px -8px rgba(37,99,235,0.6)',
            }}
          >
            <Check size={16} />
            تأكيد الموقع
          </button>
        </div>
      </div>
    </div>
  );
}

export default LocationPickerModal;