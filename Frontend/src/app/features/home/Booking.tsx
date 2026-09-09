import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TechLabel, Magnetic } from '../../components/primitives';
import { useLang } from '../../providers/LanguageProvider';

/* PRIVATE BOOKING EXPERIENCE
   A private service consultation — refined, minimal, no vehicle-category cards.
   A progress line, one-line interactive selectors and clean fields on the dark
   canvas. Flow: service → vehicle & model → phone → preferred contact. */

const SERVICES = [
  { ar: 'التشخيص والبرمجة', en: 'Diagnostics & Programming' },
  { ar: 'الصيانة الميكانيكية والكهربائية', en: 'Mechanical & Electrical Maintenance' },
  { ar: 'الإطارات والتعليق', en: 'Tyres & Suspension' },
  { ar: 'استعادة الهيكل والحوادث', en: 'Body & Accident Restoration' },
  { ar: 'الحماية والعناية', en: 'Protection & Care' },
  { ar: 'التحديث والتخصيص', en: 'Upgrades & Customisation' },
];

const CONTACT = [
  { key: 'wa', ar: 'واتساب', en: 'WhatsApp' },
  { key: 'call', ar: 'مكالمة', en: 'Phone call' },
];

const STEP_LABELS = [
  { ar: 'الخدمة المطلوبة', en: 'Required service' },
  { ar: 'نوع المركبة', en: 'Vehicle type' },
  { ar: 'رقم الهاتف', en: 'Phone number' },
  { ar: 'طريقة التواصل', en: 'Contact method' },
];

export function Booking() {
  const { isAr, t } = useLang();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [service, setService] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [phone, setPhone] = useState('');
  const [contact, setContact] = useState('');

  const canNext =
    (step === 0 && service) ||
    (step === 1 && vehicle) ||
    (step === 2 && phone) ||
    (step === 3 && contact);

  const next = () => {
    if (step < 3) setStep(step + 1);
    else setDone(true);
  };

  return (
    <section
      id="booking"
      className="page-gutter relative overflow-hidden bg-[#0a0b0d] py-40 cinematic-grain"
    >
      {/* ambient light */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(50% 50% at 80% 20%, rgba(188,172,134,0.12), transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-[1100px]">
        <div className="mb-4 text-center">
          <TechLabel>PRIVATE CONSULTATION</TechLabel>
        </div>
        <h2
          className="font-display text-center text-[var(--sorouh-ivory)]"
          style={{ fontSize: 'clamp(40px,5.4vw,86px)', fontWeight: 800, lineHeight: 1.14, paddingBottom: '0.06em' }}
        >
          {t('احجز استشارتك الخاصة', 'Book your private consultation')}
        </h2>
        <p className="mx-auto mt-6 max-w-[620px] text-center text-[var(--sorouh-steel)]" style={{ fontSize: 19, lineHeight: 1.9 }}>
          {t('شاركنا ما تحتاجه مركبتك، وسيتواصل معك مستشار الخدمة لترتيب التفاصيل.', 'Tell us what your vehicle needs and a service adviser will contact you to arrange the details.')}
        </p>

        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="success"
              className="mt-20 flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="flex h-24 w-24 items-center justify-center rounded-full border border-[var(--sorouh-bronze)]"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 180, damping: 16 }}
              >
                <span className="text-[var(--sorouh-bronze)]" style={{ fontSize: 34 }}>✓</span>
              </motion.div>
              <h3
                className="font-display mt-10 text-[var(--sorouh-ivory)]"
                style={{ fontSize: 'clamp(30px,4vw,56px)', fontWeight: 800 }}
              >
                {t('تم استلام طلبك.', 'Your request has been received.')}
              </h3>
              <p className="mt-5 max-w-[440px] text-[var(--sorouh-steel)]" style={{ fontSize: 18, lineHeight: 1.85 }}>
                {t('سيتواصل معك مستشار الخدمة لترتيب التفاصيل.', 'A service adviser will contact you to arrange the details.')}
              </p>
            </motion.div>
          ) : (
            <div className="mt-16">
              {/* Progress line */}
              <div className="mb-14 flex items-center gap-3">
                {STEP_LABELS.map((label, i) => (
                  <div key={label.en} className="flex flex-1 flex-col gap-3">
                    <div className="h-px w-full overflow-hidden bg-[rgba(237,233,224,0.12)]">
                      <motion.div
                        className="h-full bg-[var(--sorouh-bronze)]"
                        animate={{ width: i <= step ? '100%' : '0%' }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="font-mono-tech"
                        style={{
                          fontSize: 10,
                          letterSpacing: '0.2em',
                          color: i <= step ? 'var(--sorouh-bronze)' : 'var(--sorouh-muted)',
                        }}
                      >
                        0{i + 1}
                      </span>
                      <span
                        className="hidden lg:block"
                        style={{
                          fontSize: 13,
                          color: i === step ? 'var(--sorouh-ivory)' : 'var(--sorouh-muted)',
                        }}
                      >
                        {isAr ? label.ar : label.en}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Step body */}
              <div className="min-h-[260px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {step === 0 && (
                      <>
                        <StepTitle>{t('ما الخدمة التي تحتاجها؟', 'Which service do you need?')}</StepTitle>
                        <div className="flex flex-col">
                          {SERVICES.map((s, i) => (
                            <LineSelect
                              key={s.en}
                              index={i + 1}
                              label={isAr ? s.ar : s.en}
                              active={service === (isAr ? s.ar : s.en)}
                              onClick={() => setService(isAr ? s.ar : s.en)}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    {step === 1 && (
                      <>
                        <StepTitle>{t('نوع المركبة وموديلها', 'Vehicle type and model')}</StepTitle>
                        <Field
                          label={t('المركبة والموديل', 'Vehicle and model')}
                          value={vehicle}
                          onChange={setVehicle}
                          placeholder={t('مثال: BMW الفئة السابعة 2023', 'e.g., BMW 7 Series 2023')}
                        />
                      </>
                    )}

                    {step === 2 && (
                      <>
                        <StepTitle>{t('رقم الهاتف', 'Phone number')}</StepTitle>
                        <Field
                          label={t('رقم الهاتف', 'Phone number')}
                          value={phone}
                          onChange={setPhone}
                          placeholder="07XX XXX XXXX"
                          ltr
                        />
                      </>
                    )}

                    {step === 3 && (
                      <>
                        <StepTitle>{t('طريقة التواصل المفضلة', 'Preferred contact method')}</StepTitle>
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                          {CONTACT.map((c) => {
                            const on = contact === c.key;
                            return (
                              <button
                                key={c.key}
                                onClick={() => setContact(c.key)}
                                className={`flex items-center justify-between border px-8 py-6 transition-all duration-300 ${isAr ? 'text-right' : 'text-left'}`}
                                style={{
                                  borderColor: on ? 'var(--sorouh-bronze)' : 'rgba(237,233,224,0.16)',
                                  backgroundColor: on ? 'rgba(164,148,112,0.10)' : 'transparent',
                                }}
                              >
                                <span className="text-[var(--sorouh-ivory)]" style={{ fontSize: 22, fontWeight: 500 }}>
                                  {isAr ? c.ar : c.en}
                                </span>
                                <span
                                  className="h-2.5 w-2.5 rounded-full transition-colors"
                                  style={{ backgroundColor: on ? 'var(--sorouh-bronze)' : 'rgba(237,233,224,0.2)' }}
                                />
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Nav */}
              <div className="mt-14 flex items-center justify-between">
                <button
                  onClick={() => setStep(Math.max(0, step - 1))}
                  disabled={step === 0}
                  className="font-mono-tech text-[var(--sorouh-muted)] transition-colors hover:text-[var(--sorouh-ivory)] disabled:opacity-0"
                  style={{ fontSize: 12, letterSpacing: '0.2em' }}
                >
                  {t('→ السابق', 'Previous →')}
                </button>

                <Magnetic strength={0.4}>
                  <button
                    onClick={next}
                    disabled={!canNext}
                    className="flex items-center gap-4 bg-[var(--sorouh-bronze)] px-10 py-4 text-[#060708] transition-all duration-300 hover:bg-[var(--sorouh-bronze-soft)] disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <span style={{ fontSize: 16, fontWeight: 500 }}>
                      {step === 3 ? t('أرسل الطلب', 'Send request') : t('التالي', 'Next')}
                    </span>
                    <span>←</span>
                  </button>
                </Magnetic>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function StepTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="font-display mb-8 text-[var(--sorouh-ivory)]"
      style={{ fontSize: 'clamp(24px,2.6vw,38px)', fontWeight: 700, lineHeight: 1.2 }}
    >
      {children}
    </h3>
  );
}

/* Elegant one-line selector — replaces the large selection cards. */
function LineSelect({
  index,
  label,
  active,
  onClick,
}: {
  index: number;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  const { isAr } = useLang();
  return (
    <button
      onClick={onClick}
      className={`group flex items-center justify-between border-b py-5 transition-colors duration-300 ${isAr ? 'text-right' : 'text-left'}`}
      style={{ borderColor: active ? 'var(--sorouh-bronze)' : 'rgba(237,233,224,0.12)' }}
    >
      <span className="flex items-baseline gap-4">
        <span
          className="font-mono-tech"
          style={{ fontSize: 11, letterSpacing: '0.2em', color: active ? 'var(--sorouh-bronze)' : 'var(--sorouh-muted)' }}
        >
          0{index}
        </span>
        <span
          className="transition-colors duration-300"
          style={{ fontSize: 22, color: active ? 'var(--sorouh-ivory)' : 'var(--sorouh-steel)' }}
        >
          {label}
        </span>
      </span>
      <span
        className="h-2.5 w-2.5 rounded-full transition-colors duration-300"
        style={{ backgroundColor: active ? 'var(--sorouh-bronze)' : 'rgba(237,233,224,0.16)' }}
      />
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  ltr = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  ltr?: boolean;
}) {
  const { isAr } = useLang();
  const direction = ltr ? 'ltr' : isAr ? 'rtl' : 'ltr';
  return (
    <label className="block max-w-[620px]">
      <span className="mb-3 block text-[var(--sorouh-muted)]" style={{ fontSize: 13 }}>
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        dir={direction}
        className={`w-full border-b border-[rgba(237,233,224,0.18)] bg-transparent py-3 text-[var(--sorouh-ivory)] outline-none transition-colors placeholder:text-[var(--sorouh-muted)] focus:border-[var(--sorouh-bronze)] ${direction === 'ltr' ? 'text-left' : 'text-right'}`}
        style={{ fontSize: 22 }}
      />
    </label>
  );
}
