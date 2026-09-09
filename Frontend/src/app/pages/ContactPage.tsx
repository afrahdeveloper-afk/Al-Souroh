import {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  Instagram,
  Facebook,
  Music2,
  ArrowUpRight,
} from 'lucide-react';
import { useLang } from '../providers/LanguageProvider';
import { Eyebrow, FadeUp, MaskReveal, TechLabel } from '../components/primitives';
import { useContactUs, usePageHeroImage } from '../lib/siteContent';

/* CONTACT — read as an access panel, not a lead-capture form. Al-Sorouh
   handles requests by WhatsApp, phone, and in person; there is no service
   -request pipeline behind this page, so it carries no inputs at all. Every
   channel is displayed as a fixed, reachable fact — framed like an
   instrument readout with hairline corner brackets, echoing the "certificate,
   not a film frame" language already established for Warranty & Trust.
   There is deliberately no live open/closed status anywhere on this page —
   a Baghdad-time heuristic previously lived here (hero badge + a working-
   hours-card row) and was removed outright at the client's request, not
   just hidden: the client does not want that computed function maintained
   at all. The working-hours card's footer row was replaced with a static,
   always-true fact (walk-ins welcome, no appointment needed) instead of
   being left empty. */

/**
 * Single source of truth for this page's factual content — extracted from
 * inline JSX literals so the Dashboard's Contact Info editor
 * (figma-spec.md §6.6) has one typed object to read its initial values from,
 * mirroring the `{ ar, en }` pattern ServicesPage/ProjectsPage already use.
 * Values are byte-identical to what previously rendered inline; nothing
 * changed visually. There is no backend yet, so the Dashboard editor seeds
 * its local form state from this constant but cannot persist edits back
 * here — see CLAUDE.md's Admin Dashboard section log.
 */
export const CONTACT_INFO = {
  phone: { value: '+964 770 000 0000', href: 'tel:+9647700000000' },
  whatsapp: { value: '+964 770 000 0000', href: 'https://wa.me/9647700000000' },
  mapsQuery: 'Al-Karrada,Baghdad,Iraq',
  mapsHref: 'https://maps.google.com/?q=Al-Karrada,Baghdad,Iraq',
  address: { ar: 'بغداد – الكرادة، شارع 52', en: 'Baghdad, Al-Karrada, Street 52' },
  workshopName: { ar: 'ركن الصروح لخدمات المركبات', en: 'Al-Sorouh Vehicle Services' },
  workingDays: { ar: 'السبت – الخميس', en: 'Saturday – Thursday' },
  workingHours: '08:00 – 18:00',
  friday: { ar: 'الجمعة', en: 'Friday' },
  fridayStatus: { ar: 'مغلق', en: 'Closed' },
  socials: {
    instagram: { handle: '@alsorouh', href: '#' },
    facebook: { handle: '/alsorouh', href: '#' },
    tiktok: { handle: '@alsorouh', href: '#' },
  },
} as const;

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
        <span
          key={c}
          aria-hidden
          className={`pointer-events-none absolute h-4 w-4 border-[var(--sorouh-bronze)]/45 ${c}`}
        />
      ))}
    </>
  );
}

export function ContactPage() {
  const { t, isAr } = useLang();

  const record = useContactUs();
  const heroImage = usePageHeroImage('contact-us');

  const phoneValue = record?.phone_number ?? CONTACT_INFO.phone.value;
  const phoneHref = `tel:${phoneValue.replace(/[^\d+]/g, '')}`;
  const whatsappValue = record?.whatsapp_number ?? CONTACT_INFO.whatsapp.value;
  const whatsappHref = `https://wa.me/${whatsappValue.replace(/\D/g, '')}`;
  const mapsHref = record?.google_map_link || CONTACT_INFO.mapsHref;
  const addressAr = record?.address_ar ?? CONTACT_INFO.address.ar;
  const addressEn = record?.address ?? CONTACT_INFO.address.en;
  const workingDaysText = record
    ? t(record.work_days_ar || record.work_days, record.work_days)
    : t(CONTACT_INFO.workingDays.ar, CONTACT_INFO.workingDays.en);
  const workingHoursText = record?.work_hours ?? CONTACT_INFO.workingHours;
  const emailValue = record?.email ?? null;

  function socialHref(rawValue: string | undefined, fallback: string, platformDomain: string) {
    if (!rawValue) return fallback;
    if (rawValue.startsWith('http')) return rawValue;
    return `https://${platformDomain}/${rawValue.replace(/^@/, '')}`;
  }
  const instagramHref = socialHref(record?.instagram_user, CONTACT_INFO.socials.instagram.href, 'instagram.com');
  const facebookHref = socialHref(record?.facebook_user, CONTACT_INFO.socials.facebook.href, 'facebook.com');
  const tiktokHref = socialHref(record?.tiktok_user, CONTACT_INFO.socials.tiktok.href, 'tiktok.com/@');

  const CHANNELS = [
    {
      tag: 'WHATSAPP',
      icon: MessageCircle,
      title: t('واتساب', 'WhatsApp'),
      description: t('رد سريع خلال أوقات العمل', 'Quick response during working hours'),
      value: whatsappValue,
      href: whatsappHref,
      external: true,
    },
    {
      tag: 'PHONE',
      icon: Phone,
      title: t('اتصال مباشر', 'Direct call'),
      description: t('للاستفسار أو حجز موعد هاتفياً', 'For inquiries or booking by phone'),
      value: phoneValue,
      href: phoneHref,
      external: false,
    },
    ...(emailValue
      ? [
          {
            tag: 'EMAIL',
            icon: Mail,
            title: t('البريد الإلكتروني', 'Email'),
            description: t('للاستفسارات والمراسلات', 'For inquiries and correspondence'),
            value: emailValue,
            href: `mailto:${emailValue}`,
            external: false,
          },
        ]
      : []),
  ];

  const SOCIALS = [
    { icon: Instagram, label: 'Instagram', href: instagramHref },
    { icon: Facebook, label: 'Facebook', href: facebookHref },
    { icon: Music2, label: 'TikTok', href: tiktokHref },
  ];

  return (
    <div className="inner-page">
      {/* HERO */}
      <section className="relative min-h-[560px] overflow-hidden cinematic-grain vignette lg:min-h-[680px]">
        <div className="absolute inset-0">
          {heroImage && (
            <img
              src={heroImage}
              alt={t('صالة ركن الصروح', 'The Al-Sorouh workshop floor')}
              loading="eager"
              fetchpriority="high"
              decoding="async"
              className="h-full w-full object-cover"
              style={{ filter: 'brightness(0.32) contrast(1.08) saturate(0.65)' }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#060708] via-[#060708]/55 via-45% to-[#060708]/70" />
        </div>

        <div className="hero-gutter relative z-10 flex min-h-[560px] flex-col justify-end pb-14 pt-32 lg:min-h-[680px] lg:pb-20 lg:pt-40">
          <MaskReveal>
            <Eyebrow>{t('تواصل معنا', 'Contact Us')}</Eyebrow>
          </MaskReveal>
          <div className="mt-6">
            <MaskReveal duration={1.2} delay={0.15}>
              <h1
                className="font-display block max-w-[820px] text-[var(--sorouh-ivory)]"
                style={{ fontSize: 'clamp(34px,4.2vw,64px)', fontWeight: 800, lineHeight: 1.18, paddingBottom: '0.08em' }}
              >
                {t('نحن قريبون من مركبتك.', "We're close to your vehicle.")}
              </h1>
            </MaskReveal>
          </div>
          <FadeUp delay={0.3}>
            <p className="mt-6 max-w-[560px] text-[var(--sorouh-steel)]" style={{ fontSize: 'clamp(15px,1.3vw,18px)', lineHeight: 1.85 }}>
              {t(
                'تواصل مباشرة عبر واتساب أو الهاتف، أو زر ركن الصروح في الكرادة — دون نماذج ولا انتظار.',
                'Reach us directly by WhatsApp or phone, or visit Al-Sorouh in Al-Karrada — no forms, no waiting.'
              )}
            </p>
          </FadeUp>
        </div>
      </section>

      {/* DIRECT CHANNELS */}
      <section className="page-gutter py-16 lg:py-24">
        <FadeUp>
          <Eyebrow>{t('القنوات المباشرة', 'Direct lines')}</Eyebrow>
        </FadeUp>
        <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:gap-8">
          {CHANNELS.map((c, i) => (
            <FadeUp key={c.tag} delay={i * 0.08}>
              <a
                href={c.href}
                target={c.external ? '_blank' : undefined}
                rel={c.external ? 'noopener noreferrer' : undefined}
                className="group relative flex h-full flex-col justify-between gap-10 border border-[var(--sorouh-line)] p-8 transition-colors duration-300 hover:border-[var(--sorouh-bronze)]/60 lg:p-10"
              >
                <CornerFrame />
                <div className="flex items-start justify-between">
                  <TechLabel>
                    {String(i + 1).padStart(2, '0')} · {c.tag}
                  </TechLabel>
                  <c.icon
                    size={22}
                    strokeWidth={1.5}
                    className="text-[var(--sorouh-steel)] transition-colors duration-300 group-hover:text-[var(--sorouh-bronze)]"
                  />
                </div>
                <div>
                  <p className="text-[var(--sorouh-steel)]" style={{ fontSize: 14, lineHeight: 1.7 }}>
                    {c.description}
                  </p>
                  <p
                    dir="ltr"
                    className={`tabular-latin font-display mt-3 text-[var(--sorouh-ivory)] ${isAr ? 'text-right' : 'text-left'}`}
                    style={{ fontSize: 'clamp(22px,2.2vw,32px)', fontWeight: 700 }}
                  >
                    {c.value}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[var(--sorouh-bronze)]">
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{c.title}</span>
                  <ArrowUpRight size={16} className={isAr ? '-scale-x-100' : ''} />
                </div>
              </a>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* VISIT + HOURS */}
      <section className="page-gutter pb-16 lg:pb-24">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:gap-8">
          <FadeUp>
            <div className="relative h-full overflow-hidden border border-[var(--sorouh-line)] p-8 lg:p-10">
              <CornerFrame />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-50"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(237,233,224,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(237,233,224,0.035) 1px, transparent 1px)',
                  backgroundSize: '44px 44px',
                  maskImage: 'radial-gradient(75% 75% at 50% 40%, black, transparent)',
                }}
              />
              <div className="relative flex items-start justify-between">
                <TechLabel>{t('الموقع', 'LOCATION')}</TechLabel>
                <MapPin size={20} strokeWidth={1.5} className="text-[var(--sorouh-steel)]" />
              </div>
              <p
                className="font-display relative mt-8 text-[var(--sorouh-ivory)]"
                style={{ fontSize: 'clamp(20px,2vw,28px)', fontWeight: 700, lineHeight: 1.5 }}
              >
                {t(addressAr, addressEn)}
              </p>
              <p className="relative mt-2 text-[var(--sorouh-steel)]" style={{ fontSize: 14 }}>
                {t(CONTACT_INFO.workshopName.ar, CONTACT_INFO.workshopName.en)}
              </p>
              <a
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="relative mt-8 inline-flex items-center gap-2 border border-[var(--sorouh-line-strong)] px-5 py-3 text-[var(--sorouh-bronze)] transition-colors duration-300 hover:bg-[var(--sorouh-bronze)] hover:text-[#060708]"
              >
                <span style={{ fontSize: 14, fontWeight: 500 }}>{t('فتح في خرائط جوجل', 'Open in Google Maps')}</span>
                <ArrowUpRight size={15} className={isAr ? '-scale-x-100' : ''} />
              </a>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="relative h-full border border-[var(--sorouh-line)] p-8 lg:p-10">
              <CornerFrame />
              <div className="flex items-start justify-between">
                <TechLabel>{t('ساعات العمل', 'WORKING HOURS')}</TechLabel>
                <Clock size={20} strokeWidth={1.5} className="text-[var(--sorouh-steel)]" />
              </div>
              <ul className="mt-8 divide-y divide-[var(--sorouh-line)]">
                <li className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                  <span className="text-[var(--sorouh-steel)]" style={{ fontSize: 14 }}>
                    {workingDaysText}
                  </span>
                  <span dir="ltr" className="tabular-latin text-[var(--sorouh-ivory)]" style={{ fontSize: 14, fontWeight: 600 }}>
                    {workingHoursText}
                  </span>
                </li>
              </ul>
              <div className="mt-8 flex items-center gap-3 border-t border-[var(--sorouh-line)] pt-6">
                <span aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ background: 'var(--sorouh-bronze)' }} />
                <span className="text-[var(--sorouh-ivory)]" style={{ fontSize: 13, fontWeight: 500 }}>
                  {t('استقبال مباشر دون حجز مسبق', 'Walk-ins welcome — no appointment needed')}
                </span>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* SOCIAL */}
      <section className="page-gutter pb-24 lg:pb-32">
        <div className="border-t border-[var(--sorouh-line)] pt-14">
          <FadeUp>
            <Eyebrow>{t('تابعنا', 'Follow us')}</Eyebrow>
          </FadeUp>
          <FadeUp delay={0.1}>
            <div className="mt-8 flex flex-wrap gap-4">
              {SOCIALS.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 border border-[var(--sorouh-line)] px-6 py-4 transition-colors duration-300 hover:border-[var(--sorouh-bronze)]/60"
                >
                  <Icon
                    size={18}
                    strokeWidth={1.5}
                    className="text-[var(--sorouh-steel)] transition-colors duration-300 group-hover:text-[var(--sorouh-bronze)]"
                  />
                  <span className="font-mono-tech text-[var(--sorouh-ivory)]" style={{ fontSize: 13, letterSpacing: '0.08em' }}>
                    {label}
                  </span>
                </a>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
