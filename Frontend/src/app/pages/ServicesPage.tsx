import { useState } from 'react';
import { Link } from 'react-router';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useLang } from '../providers/LanguageProvider';
import { ArrowUpRight, CheckCircle } from 'lucide-react';
import { Eyebrow, FadeUp, MaskReveal } from '../components/primitives';
import { listServices, sortServicesByPriority } from '../dashboard/services/services';
import type { Service } from '../dashboard/types';
import { useApiResource, fetchAllPages } from '../lib/publicApi';
import { mediaUrl, usePageHeroImage } from '../lib/siteContent';

/* SERVICES — a service ledger, not a SaaS pricing-tab page, now reading
   the real Service catalogue from the backend (no category taxonomy, no
   equipment/vehicle-type/warranty fields on that model — see the removal
   notes below). Content is client-fetched; presentation stays the
   established dark instrument-panel system.

   Signature: the service list becomes a numbered index — a real ledger —
   that doubles as in-page navigation (sticky rail on desktop, a
   scrollable strip on mobile). The selected service reads as a technical
   work order: a frame-numbered photo (echoing Projects' corner-bracket
   badge) and a ticket-style procedure list (numbering here is meaningful
   — it's the literal order of the job). */

function CornerFrame() {
  const corners = [
    'left-0 top-0 border-l border-t',
    'right-0 top-0 border-r border-t',
    'left-0 bottom-0 border-l border-b',
    'right-0 bottom-0 border-r border-b',
  ];
  return (
    <>
      {corners.map((c) => (
        <span key={c} aria-hidden className={`pointer-events-none absolute h-4 w-4 border-[var(--sorouh-bronze)]/45 ${c}`} />
      ))}
    </>
  );
}

function FieldLabel({ children, isAr }: { children: string; isAr: boolean }) {
  return (
    <p
      className={`text-[var(--sorouh-bronze)] ${isAr ? 'font-body' : 'font-mono-tech uppercase'}`}
      style={{ fontSize: 14.5, fontWeight: 600, letterSpacing: isAr ? 0 : '0.08em' }}
    >
      {children}
    </p>
  );
}

export function ServicesPage() {
  const { t, isAr } = useLang();
  const reduceMotion = !!useReducedMotion();
  const [activeId, setActiveId] = useState<number | null>(null);
  const heroImage = usePageHeroImage('services');

  const { data: services, loading, error } = useApiResource(
    () => fetchAllPages<Service>((page) => listServices({ page })),
    []
  );

  const list = sortServicesByPriority(services ?? []);
  const activeService = list.find((s) => s.id === activeId) ?? list[0] ?? null;
  const activeIndex = activeService ? list.findIndex((s) => s.id === activeService.id) : -1;

  return (
    <div className="inner-page">
      {/* HERO */}
      <section className="relative min-h-[560px] overflow-hidden cinematic-grain vignette lg:min-h-[680px]">
        <div className="absolute inset-0">
          {heroImage && (
            <img
              src={heroImage}

              alt={t('ورشة الصروح', 'The Al-Sorouh workshop')}
              loading="eager"
              fetchpriority="high"
              decoding="async"
              className="h-full w-full object-cover"
              style={{ filter: 'brightness(0.36) contrast(1.06) saturate(0.75)' }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#060708] via-[#060708]/55 via-45% to-[#060708]/70" />
        </div>

        <div className="hero-gutter relative z-10 flex min-h-[560px] flex-col justify-end pb-14 pt-32 lg:min-h-[680px] lg:pb-20 lg:pt-40">
          <MaskReveal>
            <Eyebrow>{t('خدماتنا', 'Our Services')}</Eyebrow>
          </MaskReveal>
          <div className="mt-6">
            <MaskReveal duration={1.2} delay={0.15}>
              <h1
                className="font-display block max-w-[820px] text-[var(--sorouh-ivory)]"
                style={{ fontSize: 'clamp(34px,4.2vw,64px)', fontWeight: 800, lineHeight: 1.18, paddingBottom: '0.08em' }}
              >
                {t('حلول متكاملة لكل تفاصيل مركبتك', 'Complete Solutions for Every Vehicle Detail')}
              </h1>
            </MaskReveal>
          </div>
          <FadeUp delay={0.3}>
            <p className="mt-6 max-w-[560px] text-[var(--sorouh-steel)]" style={{ fontSize: 'clamp(15px,1.3vw,18px)', lineHeight: 1.85 }}>
              {t(
                'نقدّم خدمات الفحص، الصيانة، الإصلاح، الحماية والتحديث لمختلف المركبات التقليدية، الهجينة والكهربائية.',
                'We provide inspection, maintenance, repair, protection, and upgrade services for all conventional, hybrid, and electric vehicles.'
              )}
            </p>
          </FadeUp>
        </div>
      </section>

      {/* SERVICE INDEX + WORK ORDER */}
      <section className="page-gutter py-16 lg:py-24">
        {loading ? (
          <div className="py-24 text-center text-[var(--sorouh-steel)]">
            <p style={{ fontSize: 18 }}>{t('جاري تحميل الخدمات...', 'Loading services...')}</p>
          </div>
        ) : error ? (
          <div className="py-24 text-center text-[var(--sorouh-steel)]">
            <p style={{ fontSize: 18 }}>{t('تعذر تحميل الخدمات حالياً.', 'Unable to load services right now.')}</p>
          </div>
        ) : list.length === 0 ? (
          <div className="py-24 text-center text-[var(--sorouh-steel)]">
            <p style={{ fontSize: 18 }}>{t('لا توجد خدمات متاحة حالياً.', 'No services are available right now.')}</p>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[400px_1fr] lg:items-start lg:gap-x-16">
            {/* INDEX RAIL */}
            <div className="min-w-0 lg:sticky lg:top-28">
              <div className="hidden lg:block">
                <Eyebrow>{t('فهرس الخدمات', 'Service Index')}</Eyebrow>
              </div>
              <div
                dir={isAr ? 'rtl' : 'ltr'}
                className="mt-5 flex gap-x-7 overflow-x-auto pb-2 hide-scrollbar lg:mt-7 lg:flex-col lg:gap-x-0 lg:overflow-visible lg:pb-0"
              >
                {list.map((service, i) => {
                  const active = activeService?.id === service.id;
                  return (
                    <button
                      key={service.id}
                      onClick={() => setActiveId(service.id)}
                      aria-pressed={active}
                      className={`group relative flex shrink-0 items-center gap-3.5 whitespace-nowrap py-3 text-start transition-colors duration-300 lg:w-full lg:border-b lg:border-[var(--sorouh-line)] lg:py-4.5 lg:first:pt-0 lg:last:border-b-0 ${
                        active ? 'text-[var(--sorouh-ivory)]' : 'text-[var(--sorouh-steel)] hover:text-[var(--sorouh-ivory)]'
                      }`}
                    >
                      <span
                        dir="ltr"
                        className="tabular-latin font-mono-tech shrink-0"
                        style={{ fontSize: 13.5, letterSpacing: '0.08em', color: active ? 'var(--sorouh-bronze)' : 'var(--sorouh-steel)' }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span style={{ fontSize: 17.5, fontWeight: active ? 600 : 500 }}>
                        {t(service.service_name_ar, service.service_name)}
                      </span>
                      <span
                        aria-hidden
                        className="absolute inset-x-0 -bottom-px h-[2px] bg-[var(--sorouh-bronze)] transition-opacity duration-300 lg:inset-x-auto lg:inset-y-0 lg:start-0 lg:h-auto lg:w-[2px]"
                        style={{ opacity: active ? 1 : 0 }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* WORK ORDER */}
            {activeService && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeService.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
                  transition={{ duration: reduceMotion ? 0 : 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Eyebrow>{t(activeService.service_rank_ar, activeService.service_rank)}</Eyebrow>
                  <h2
                    className="font-display mt-4 text-[var(--sorouh-ivory)]"
                    style={{ fontSize: 'clamp(28px,3.1vw,42px)', fontWeight: 700, lineHeight: 1.28 }}
                  >
                    {t(activeService.service_name_ar, activeService.service_name)}
                  </h2>
                  <p className="mt-4 max-w-2xl text-[var(--sorouh-steel)]" style={{ fontSize: 18, lineHeight: 1.85 }}>
                    {t(activeService.service_description_ar, activeService.service_description)}
                  </p>

                  <div className="relative mt-8 aspect-[16/10] max-w-[760px] overflow-hidden border border-[var(--sorouh-line)]">
                    <img
                      src={mediaUrl(activeService.img)}
                      alt={t(activeService.service_name_ar, activeService.service_name)}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                      style={{ filter: 'brightness(0.9)' }}
                    />
                    <div className="absolute start-4 top-4 border border-[var(--sorouh-line-strong)] bg-[#060708]/70 px-2.5 py-1.5 backdrop-blur-sm">
                      <span dir="ltr" className="tabular-latin font-mono-tech text-[var(--sorouh-steel)]" style={{ fontSize: 11 }}>
                        {String(activeIndex + 1).padStart(2, '0')} / {String(list.length).padStart(2, '0')}
                      </span>
                    </div>
                  </div>

                  {/* CASES HANDLED */}
                  <div className="mt-10">
                    <FieldLabel isAr={isAr}>{t('الحالات التي نعالجها', 'Cases We Handle')}</FieldLabel>
                    <div className="mt-4 grid max-w-3xl gap-x-10 gap-y-3.5 sm:grid-cols-2">
                      {(isAr ? activeService.service_problems_ar : activeService.service_problems).map((p, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <CheckCircle size={19} strokeWidth={1.75} className="mt-0.5 shrink-0 text-[var(--sorouh-bronze)]" />
                          <span className="text-[var(--sorouh-steel)]" style={{ fontSize: 18 }}>{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* PROCEDURES — order is the real sequence of the job, so numbering is meaningful here. */}
                  <div className="mt-9">
                    <FieldLabel isAr={isAr}>{t('الإجراءات الرئيسية', 'Main Procedures')}</FieldLabel>
                    <ul className="mt-4 max-w-3xl">
                      {(isAr ? activeService.service_procedures_ar : activeService.service_procedures).map((p, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-4 border-b border-[var(--sorouh-line)] py-3.5 first:pt-0 last:border-b-0"
                        >
                          <span
                            dir="ltr"
                            className="tabular-latin font-mono-tech shrink-0 text-[var(--sorouh-bronze)]"
                            style={{ fontSize: 14.5, letterSpacing: '0.08em', width: 26 }}
                          >
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span className="text-[var(--sorouh-ivory)]" style={{ fontSize: 18 }}>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Equipment / Vehicle Types / Warranty have no field on the Service model — removed, not invented (see CLAUDE.md's Admin Dashboard log). */}

                  <Link
                    to="/contact"
                    className="group mt-10 inline-flex items-center gap-3 border border-[var(--sorouh-line-strong)] px-6 py-3.5 text-[var(--sorouh-bronze)] transition-colors duration-300 hover:bg-[var(--sorouh-bronze)] hover:text-[#060708]"
                  >
                    <span style={{ fontSize: 15, fontWeight: 500 }}>{t('تواصل بخصوص هذه الخدمة', 'Ask About This Service')}</span>
                    <ArrowUpRight size={16} className={isAr ? '-scale-x-100' : ''} />
                  </Link>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
