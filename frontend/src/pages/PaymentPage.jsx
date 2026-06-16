import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  CreditCard,
  FileText,
  Loader,
  MapPin,
  Package,
  Receipt,
  Sparkles,
  Warehouse,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { API_URL, getHeaders, apiFetch } from '../config/api';

const MOYASAR_KEY = import.meta.env.VITE_MOYASAR_KEY || 'pk_test_xZj2Ucqc3pVSkktyUTZLs1ER6JhSKxj4Pnwvt8Ds';

const cardShadow = '0 20px 50px -34px rgba(15,23,42,0.45)';

const readStoredJson = (key) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

const DetailRow = ({ label, children, icon: Icon }) => (
  <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3 first:border-t-0 first:pt-0">
    <span className="shrink-0 text-xs font-medium text-slate-400">{label}</span>
    <div className="flex min-w-0 items-center gap-2 text-slate-700">
      {Icon && (
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
          <Icon size={14} />
        </span>
      )}
      <span className="truncate text-sm font-semibold">{children}</span>
    </div>
  </div>
);

const InfoRow = ({ title, value, icon: Icon, multiline = false }) => (
  <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3 first:border-t-0 first:pt-0" dir="rtl">
    <div className="flex min-w-0 items-center gap-2 text-slate-600">
      {Icon && (
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
          <Icon size={14} />
        </span>
      )}
      <span className="shrink-0 text-sm font-semibold">{title}</span>
    </div>
    <span className={`min-w-0 text-left text-sm font-bold text-slate-800 ${multiline ? 'whitespace-normal break-words leading-6' : 'truncate'}`}>
      {value}
    </span>
  </div>
);

function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const processingRef = useRef(false);

  const bookingDraftFromState = location.state?.bookingDraft;
  const bookingPreviewFromState = location.state?.bookingPreview;

  if (bookingDraftFromState) {
    localStorage.setItem('paymentBookingDraft', JSON.stringify(bookingDraftFromState));
    localStorage.setItem('paymentBookingPreview', JSON.stringify(bookingPreviewFromState || {}));
    localStorage.removeItem('paymentBookingId');
    localStorage.removeItem('paymentWarehouseName');
    localStorage.removeItem('paymentEstimatedPrice');
  }

  const [bookingDraft] = useState(() => bookingDraftFromState || readStoredJson('paymentBookingDraft'));
  const [bookingPreview] = useState(() => bookingPreviewFromState || readStoredJson('paymentBookingPreview') || {});
  const warehouseName = bookingPreview.warehouseName || bookingPreview.warehouse?.Name || 'المستودع';
  const estimatedPrice = Number(bookingPreview.totalPrice || 0);

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  useEffect(() => {
    if (!bookingDraft) return;
    setBookingDetails({
      ...bookingDraft,
      TotalPrice: bookingPreview.basePrice || bookingPreview.totalPrice || 0,
      warehouse: bookingPreview.warehouse,
    });
  }, [bookingDraft, bookingPreview]);

  const processBackendPayment = useCallback(async (moyasarPaymentId, moyasarStatus, paymentMethod) => {
    if (processingRef.current) return;
    processingRef.current = true;
    setProcessing(true);
    setError('');

    try {
      const params = new URLSearchParams({
        moyasar_payment_id: moyasarPaymentId,
        moyasar_status: moyasarStatus,
        payment_method: paymentMethod || 'creditcard',
      });

      const res = await apiFetch(`${API_URL}/payments/with-booking?${params}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ booking: bookingDraft }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || 'حدث خطأ أثناء تأكيد الدفع');
        return;
      }

      setPaymentData(data);
      setSuccess(true);

      try {
        const bRes = await apiFetch(`${API_URL}/bookings/my`, { headers: getHeaders(false) });
        if (bRes.ok) {
          const bookings = await bRes.json();
          const found = bookings.find((b) => b.BookingID === parseInt(data.BookingID, 10));
          if (found) setBookingDetails(found);
        }
      } catch {
        // Booking details are supplemental; payment success should still render.
      }

      localStorage.removeItem('paymentBookingId');
      localStorage.removeItem('paymentWarehouseName');
      localStorage.removeItem('paymentEstimatedPrice');
      localStorage.removeItem('paymentBookingDraft');
      localStorage.removeItem('paymentBookingPreview');
    } catch {
      setError('حدث خطأ في الاتصال، حاول مرة أخرى');
    } finally {
      setProcessing(false);
      processingRef.current = false;
    }
  }, [bookingDraft]);

  useEffect(() => {
    if (!bookingDraft) {
      navigate('/home');
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const paymentId = urlParams.get('id');
    const paymentStatus = urlParams.get('status');
    const sourceType = urlParams.get('source[type]') || urlParams.get('source_type') || 'creditcard';

    if (paymentId && paymentStatus) {
      if (paymentStatus === 'paid') {
        queueMicrotask(() => processBackendPayment(paymentId, paymentStatus, sourceType));
      } else {
        queueMicrotask(() => setError(`فشل الدفع - الحالة: ${paymentStatus}`));
      }
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.moyasar.com/mpf/1.14.0/moyasar.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://cdn.moyasar.com/mpf/1.14.0/moyasar.js';
    script.async = true;
    script.onload = () => {
      if (!window.Moyasar) return;
      window.Moyasar.init({
        element: '.moyasar-form-wrapper',
        amount: Math.round(parseFloat(estimatedPrice) * 100),
        currency: 'SAR',
        description: `حجز مستودع: ${warehouseName}`,
        publishable_api_key: MOYASAR_KEY,
        callback_url: window.location.href.split('?')[0],
        methods: ['creditcard', 'applepay'],
        apple_pay: {
          country: 'SA',
          label: 'رفدي - حجز مستودع',
          validate_merchant_url: 'https://api.moyasar.com/v1/applepay/initiate',
        },
        on_completed: async (payment) => {
          if (payment.status === 'paid') {
            await processBackendPayment(payment.id, payment.status, payment.source?.type);
          }
        },
      });
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, [bookingDraft, estimatedPrice, navigate, processBackendPayment, warehouseName]);

  const warehouse = bookingDetails?.warehouse;
  const displayWarehouseName = warehouse?.Name || warehouseName;
  const displayAmount = paymentData?.Amount || estimatedPrice;
  const paidAmount = paymentData ? paymentData.Amount : displayAmount;
  const bookingDays = bookingDetails
    ? Math.ceil((new Date(bookingDetails.EndDate) - new Date(bookingDetails.StartDate)) / 86400000) + 1
    : null;

  return (
    <div className="min-h-screen bg-[#f6f8fb]" dir="rtl" style={{ fontFamily: "'IBM Plex Sans Arabic', 'Tajawal', sans-serif" }}>
      <Navbar />
      <style>{`
        .moyasar-form-wrapper .mysr-form-footer,
        .moyasar-form-wrapper .mysr-form-footer *,
        .moyasar-form-wrapper .mysr-test-mode,
        .moyasar-form-wrapper [class*="test-mode"],
        .moyasar-form-wrapper > div > p:last-child {
          display: none !important;
        }
      `}</style>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        {success ? (
          <section className="mx-auto max-w-3xl">
            <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white" style={{ boxShadow: cardShadow }}>
              <div className="relative overflow-hidden bg-[#0d1b3e] px-6 py-9 text-center sm:px-10">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-emerald-400 via-sky-400 to-blue-500" />
                <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-900/20">
                  <CheckCircle size={42} />
                </div>
                <p className="mb-2 text-sm font-bold text-emerald-200">تمت العملية</p>
                <h1 className="text-2xl font-black text-white sm:text-3xl">تم الدفع بنجاح</h1>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/70">
                  تم تأكيد حجزك وتسجيل العملية. يمكنك مراجعة تفاصيل الحجز من حسابك في أي وقت.
                </p>
              </div>

              <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[1fr_0.9fr]">
                <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-5">
                  <div className="flex items-end justify-between gap-4">
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-black text-blue-700">{Number(paidAmount || 0).toLocaleString()}</span>
                      <span className="pb-1 text-sm font-bold text-blue-400">ر.س</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-500">المبلغ المدفوع</p>
                  </div>
                  <div className="mt-5 rounded-lg bg-white/70 px-4 py-3 text-sm font-semibold text-slate-600">
                    رقم الحجز <span className="font-mono text-slate-900">#{paymentData?.BookingID}</span>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <h2 className="mb-4 text-base font-extrabold text-slate-900">تفاصيل الحجز</h2>
                  <div className="space-y-3">
                    <InfoRow title="المستودع" value={displayWarehouseName} icon={Warehouse} />
                    {bookingDetails && (
                      <>
                        <InfoRow title="الفترة" value={`${bookingDetails.StartDate} إلى ${bookingDetails.EndDate}`} icon={Calendar} />
                        <InfoRow title="المدة" value={`${bookingDays} يوم`} />
                        {warehouse?.Location && (
                          <InfoRow title="الموقع" value={warehouse.Location} icon={MapPin} multiline />
                        )}
                        {warehouse?.Size && (
                          <InfoRow title="المساحة" value={`${warehouse.Size?.toLocaleString()} م²`} icon={Package} />
                        )}
                      </>
                    )}
                  </div>
                </div>

                {paymentData && (
                  <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2">
                    <h2 className="mb-4 text-base font-extrabold text-slate-900">تفاصيل العملية</h2>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-lg bg-slate-50 p-4">
                        <p className="mb-1 text-xs font-semibold text-slate-400">رقم العملية</p>
                        <p className="font-mono text-sm font-bold text-slate-800">#{paymentData.PaymentID}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-4">
                        <p className="mb-1 text-xs font-semibold text-slate-400">طريقة الدفع</p>
                        <p className="text-sm font-bold text-slate-800">{paymentData.PaymentMethod || 'بطاقة ائتمانية'}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-4">
                        <p className="mb-1 text-xs font-semibold text-slate-400">تاريخ الدفع</p>
                        <p className="font-mono text-xs font-bold text-slate-800">{paymentData.PaymentDate}</p>
                      </div>
                      <div className="rounded-lg bg-emerald-50 p-4">
                        <p className="mb-1 text-xs font-semibold text-emerald-500">حالة الدفع</p>
                        <p className="text-sm font-black text-emerald-700">{paymentData.Status === 'paid' ? 'مدفوع' : paymentData.Status}</p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => navigate('/bookings')}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 lg:col-span-2"
                >
                  العودة للحجوزات
                  <ArrowLeft size={17} />
                </button>
              </div>
            </div>
          </section>
        ) : (
          <section className="mx-auto max-w-4xl space-y-5">
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white" style={{ boxShadow: cardShadow }}>
                <div className="relative bg-[#0d1b3e] p-6 text-white">
                  <div className="absolute left-5 top-5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/80">
                    ملخص الطلب
                  </div>
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-blue-500 shadow-lg shadow-blue-950/20">
                    <Receipt size={24} />
                  </div>
                  <h1 className="mt-5 text-xl font-black leading-8">{displayWarehouseName}</h1>
                  <p className="mt-2 text-sm leading-6 text-white/65">راجع تفاصيل الحجز قبل إتمام الدفع.</p>
                </div>

                <div className="p-5">
                  <div className="rounded-xl bg-slate-50 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-semibold text-slate-500">المبلغ الإجمالي</span>
                      <span className="flex items-end gap-1.5 text-slate-950">
                        <span className="text-3xl font-black">{Number(displayAmount || 0).toLocaleString()}</span>
                        <span className="pb-1 text-sm font-bold text-slate-400">ر.س</span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <InfoRow title="رقم الحجز" value="ينشأ بعد الدفع" icon={FileText} />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5" style={{ boxShadow: '0 12px 35px -30px rgba(15,23,42,0.45)' }}>
                <div className="mb-4 flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-600">
                    <Warehouse size={18} />
                  </span>
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-900">تفاصيل المستودع</h2>
                    <p className="text-xs font-medium text-slate-400">بيانات الحجز قبل الدفع</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <InfoRow title="المستودع" value={displayWarehouseName} icon={Warehouse} />
                  {bookingDetails && (
                    <>
                      <InfoRow title="الفترة" value={`${bookingDetails.StartDate} إلى ${bookingDetails.EndDate}`} icon={Calendar} />
                      <InfoRow title="المدة" value={`${bookingDays} يوم`} />
                    </>
                  )}
                  {warehouse?.Location && (
                    <InfoRow title="الموقع" value={warehouse.Location} icon={MapPin} multiline />
                  )}
                  {warehouse?.Size && (
                    <InfoRow title="المساحة" value={`${warehouse.Size?.toLocaleString()} م²`} icon={Package} />
                  )}
                  {warehouse?.PricePerDay && (
                    <InfoRow title="السعر اليومي" value={`${parseFloat(warehouse.PricePerDay).toLocaleString()} ر.س/يوم`} />
                  )}
                </div>
              </div>
            </div>

            {false && (
            <div className="grid gap-5 lg:grid-cols-[1fr_0.55fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-5" style={{ boxShadow: '0 12px 35px -30px rgba(15,23,42,0.45)' }}>
                <div className="mb-4 flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-600">
                    <ShieldCheck size={18} />
                  </span>
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-900">حماية الدفع</h2>
                    <p className="text-xs font-medium text-slate-400">بوابة ميسر المعتمدة</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <TrustItem>جميع البيانات مشفرة SSL</TrustItem>
                  <TrustItem>بيانات بطاقتك لا تخزن في رفدي</TrustItem>
                  <TrustItem>يدعم الدفع بالبطاقة و Apple Pay</TrustItem>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50/70 px-5 py-4">
                <span className="text-xs font-bold text-blue-400">الدفع مؤمن عبر</span>
                <div className="flex items-center gap-2 text-blue-700">
                  <CreditCard size={17} />
                  <span className="text-sm font-black">Moyasar</span>
                </div>
              </div>
            </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white" style={{ boxShadow: cardShadow }}>
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5 sm:p-6">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    <Sparkles size={13} />
                    خطوة أخيرة
                  </div>
                  <h2 className="text-xl font-black text-slate-950">إتمام الدفع</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">اختر طريقة الدفع المناسبة وأكمل العملية بأمان.</p>
                </div>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500">
                  <CreditCard size={21} />
                </span>
              </div>

              <div className="p-5 sm:p-6">
                {processing && (
                  <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 p-5 text-center">
                    <Loader size={30} color="#2563eb" className="mx-auto mb-3 animate-spin" />
                    <p className="text-sm font-extrabold text-blue-700">جاري تأكيد الدفع...</p>
                    <p className="mt-1 text-xs font-medium text-slate-500">يرجى الانتظار وعدم إغلاق الصفحة</p>
                  </div>
                )}

                {error && (
                  <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-red-100 text-red-600">
                      <AlertCircle size={18} />
                    </span>
                    <p className="pt-1 text-sm font-bold leading-6 text-red-700">{error}</p>
                  </div>
                )}

                {!processing && (
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 sm:p-4">
                    <div className="moyasar-form-wrapper" />
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="mt-10 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-5 text-center">
          <span className="text-xs font-semibold text-slate-400">© Rafdi Platform 2026</span>
        </div>
      </footer>
    </div>
  );
}

export default PaymentPage;
