import { useRef, useState } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
  useTransform,
} from 'motion/react';
import { img, IMG } from '../../lib/images';
import { Eyebrow } from '../../components/primitives';
import { listServices, sortServicesByPriority } from '../../dashboard/services/services';
import { useApiResource } from '../../lib/publicApi';
import { mediaUrl } from '../../lib/siteContent';
import { useLang } from '../../providers/LanguageProvider';

/* SERVICES — NOT CARDS
   A full-screen configurator: oversized service names on one side, a full-height
   cinematic visual on the other. Scroll drives which service dominates; the image
   changes through a clip mask, light shifts, the number moves vertically. */

/* Real services never exceed ten (a hard product limit, not a display cap),
   so this covers every possible count rather than only the six the previous
   hardcoded copy assumed. Arabic uses correct counted-noun grammar (singular
   for one, dual for two, plural 3-10) rather than a generic "N مجال". */
const DOMAIN_COUNT_AR = [
  '', 'مجال واحد', 'مجالان', 'ثلاثة مجالات', 'أربعة مجالات', 'خمسة مجالات',
  'ستة مجالات', 'سبعة مجالات', 'ثمانية مجالات', 'تسعة مجالات', 'عشرة مجالات',
];
const DOMAIN_COUNT_EN = [
  '', 'One discipline', 'Two disciplines', 'Three disciplines', 'Four disciplines',
  'Five disciplines', 'Six disciplines', 'Seven disciplines', 'Eight disciplines',
  'Nine disciplines', 'Ten disciplines',
];

const DEFAULT_SERVICES = [
  {
    n: '01',
    name: 'التشخيص والبرمجة',
    desc: 'فحص الأعطال، قراءة الأنظمة الإلكترونية، برمجة المركبات، فحص المحرك والناقل والبطاريات.',
    detail: 'DIAGNOSTICS · ECU PROGRAMMING',
    image: IMG.diagnostic,
    imageUrl: img(IMG.diagnostic, 1400),
  },
  {
    n: '02',
    name: 'الصيانة الميكانيكية والكهربائية',
    desc: 'صيانة المحرك، أنظمة التبريد والتكييف، الدوائر الكهربائية والأنظمة الإلكترونية.',
    detail: 'MECHANICAL · ELECTRICAL',
    image: IMG.engineBay,
    imageUrl: img(IMG.engineBay, 1400),
  },
  {
    n: '03',
    name: 'الإطارات والتعليق',
    desc: 'تبديل الإطارات، الموازنة، الميزان، البطاريات وفحص أنظمة التعليق.',
    detail: 'TIRES · ALIGNMENT · SUSPENSION',
    image: IMG.wheel,
    imageUrl: img(IMG.wheel, 1400),
  },
  {
    n: '04',
    name: 'استعادة الهيكل والحوادث',
    desc: 'إصلاحات البدي، معالجة أضرار الحوادث، تعديل الهيكل، الصبغ وإصلاح الانبعاجات بنظام PDR.',
    detail: 'BODYWORK · PDR · REFINISH',
    image: IMG.paintBumper,
    imageUrl: img(IMG.paintBumper, 1400),
  },
  {
    n: '05',
    name: 'الحماية والعناية',
    desc: 'أفلام الحماية PPF، التظليل، العوازل، التلميع والعناية الداخلية والخارجية.',
    detail: 'PPF · TINT · DETAILING',
    image: IMG.paintShine,
    imageUrl: img(IMG.paintShine, 1400),
  },
  {
    n: '06',
    name: 'التحديث والتخصيص',
    desc: 'تطوير المظهر الخارجي، تحسين المقصورة، تركيب الإكسسوارات والتحديثات الفاخرة.',
    detail: 'STYLING · INTERIOR · UPGRADES',
    image: IMG.leatherQuilt,
    imageUrl: img(IMG.leatherQuilt, 1400),
  },
];

export function Services() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { t, isAr } = useLang();
  const { data: servicesResponse } = useApiResource(() => listServices(), []);

  const items =
    servicesResponse && servicesResponse.results.length > 0
      ? sortServicesByPriority(servicesResponse.results).slice(0, 10).map((service, index) => ({
          n: String(index + 1).padStart(2, '0'),
          name: t(service.service_name_ar, service.service_name),
          desc: t(service.service_description_ar, service.service_description),
          detail: t(service.service_rank_ar, service.service_rank) || '',
          imageUrl: mediaUrl(service.img),
        }))
      : DEFAULT_SERVICES;

  const domainCountLabel = DOMAIN_COUNT_AR[items.length]
    ? t(`الخدمات — ${DOMAIN_COUNT_AR[items.length]}`, `Services — ${DOMAIN_COUNT_EN[items.length]}`)
    : t('الخدمات', 'Services');

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  const lineScale = useTransform(scrollYProgress, [0, 0.08], [0, 1]);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const idx = Math.min(
      items.length - 1,
      Math.floor(v * items.length)
    );
    if (idx !== active) setActive(idx);
  });

  const s = items[Math.min(active, items.length - 1)];

  return (
    <section id="services" ref={ref} className="relative h-[560vh] bg-[#060708]">
      <div className="sticky top-0 flex h-screen w-full overflow-hidden">
        {/* Visual side (left, ~46%) */}
        <div
          className="relative hidden h-full w-[46%] overflow-hidden cinematic-grain lg:block"
        >
          <AnimatePresence>
            <motion.div
              key={active}
              className="absolute inset-0"
              initial={{ clipPath: 'inset(0 0 0 100%)' }}
              animate={{ clipPath: 'inset(0 0 0 0%)' }}
              exit={{ clipPath: 'inset(0 100% 0 0)' }}
              transition={{ duration: 0.9, ease: [0.7, 0, 0.2, 1] }}
            >
              <img
                src={s.imageUrl}
                alt={s.name}
                className="h-full w-full object-cover"
                style={{ filter: 'brightness(0.62) contrast(1.12)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-l from-[#060708]/70 to-transparent" />
            </motion.div>
          </AnimatePresence>

          {/* shifting light direction per service */}
          <motion.div
            key={`light-${active}`}
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background:
                active % 2 === 0
                  ? 'radial-gradient(50% 60% at 20% 20%, rgba(188,172,134,0.22), transparent 70%)'
                  : 'radial-gradient(50% 60% at 80% 80%, rgba(188,172,134,0.22), transparent 70%)',
            }}
          />

          {/* Technical detail */}
          <div className="absolute bottom-10 left-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={s.detail}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.5 }}
              >
                {/* Not TechLabel: this caption is the API's own bilingual
                    service_rank text, so it must follow the active
                    language's real font (Lama Sans for Arabic) rather than
                    TechLabel's hardcoded lang="en" Lucida Sans. */}
                <span
                  className={`uppercase text-[var(--sorouh-bronze)] ${isAr ? 'font-body' : 'font-mono-tech'}`}
                  style={{ fontSize: 12, letterSpacing: isAr ? 0 : '0.34em', fontWeight: 400 }}
                >
                  {s.detail}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Text side (right, dominant) */}
        <div className="page-gutter relative flex h-full flex-1 flex-col justify-center">
          {/* Connecting line from Transformation */}
          <motion.div
            className="mb-8 h-px w-16 origin-right bg-[var(--sorouh-bronze)]"
            style={{ scaleX: lineScale }}
          />

          <div className="mb-14">
            <Eyebrow>{domainCountLabel}</Eyebrow>
            <div className="mt-4 flex items-baseline gap-4">
              <span
                className="font-display text-[var(--sorouh-ivory)]"
                style={{ fontSize: 'clamp(30px,3.4vw,52px)', fontWeight: 700, lineHeight: 1.2 }}
              >
                منظومة عناية متكاملة
              </span>
            </div>
            <p
              className="mt-4 text-[var(--sorouh-muted)]"
              style={{ fontSize: 15, lineHeight: 1.8 }}
            >
              خدماتنا تشمل المركبات التقليدية، الهجينة والكهربائية.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            {items.map((item, i) => {
              const on = i === active;
              return (
                <button
                  key={item.n}
                  onClick={() => {
                    const el = ref.current;
                    if (!el) return;
                    const top =
                      el.offsetTop +
                      (i / items.length) * (el.offsetHeight - window.innerHeight);
                    window.scrollTo({ top, behavior: 'smooth' });
                  }}
                  className="group flex items-center gap-5 text-right"
                >
                  <span
                    className="font-mono-tech w-10 shrink-0 transition-colors duration-300"
                    style={{
                      fontSize: 12,
                      color: on ? 'var(--sorouh-bronze)' : 'var(--sorouh-muted)',
                    }}
                  >
                    {item.n}
                  </span>
                  <motion.span
                    className="font-display block origin-right transition-colors duration-500"
                    animate={{
                      opacity: on ? 1 : 0.32,
                      x: on ? 0 : 8,
                    }}
                    style={{
                      fontSize: on ? 'clamp(34px,4.6vw,68px)' : 'clamp(26px,3vw,40px)',
                      fontWeight: on ? 900 : 500,
                      color: on ? 'var(--sorouh-ivory)' : 'var(--sorouh-steel)',
                      lineHeight: 1.1,
                    }}
                  >
                    {item.name}
                  </motion.span>
                </button>
              );
            })}
          </div>

          {/* Active description */}
          <div className="mt-12 h-[64px] max-w-[520px]">
            <AnimatePresence mode="wait">
              <motion.p
                key={active}
                className="text-[var(--sorouh-steel)]"
                style={{ fontSize: 18, lineHeight: 1.85 }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5 }}
              >
                {s.desc}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* progress rail */}
          <div className="mt-12 flex gap-2">
            {items.map((_, i) => (
              <span
                key={i}
                className="h-px flex-1 origin-right transition-all duration-500"
                style={{
                  backgroundColor:
                    i <= active ? 'var(--sorouh-bronze)' : 'rgba(237,233,224,0.14)',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
