import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { useLang } from '../providers/LanguageProvider';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider';
import {
  ArrowLeft, ArrowRight, CheckCircle, MessageCircle,
  ChevronDown, Shield, Camera, ClipboardCheck, Eye, Award
} from 'lucide-react';

const img = (id: string, w = 1080) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=${w}`;

const HERO = img('1632405862117-236585cfb757', 1920);
const ABOUT_IMG = img('1615906655593-ad0386982a0f');
const WORKSHOP_IMG = img('1677938438599-a55528c41b2c');
const DETAILING_IMG = img('1632823469850-2f77dd9c7f93');
const PPF_IMG = img('1632605166776-7128669886e7');
const INTERIOR_IMG = img('1687634366070-c06d3f037154');
const DIAGNOSTIC_IMG = img('1727893380169-4dda123e19f7');
const WAXING_IMG = img('1652987086612-d948b775d358');
const SUV_IMG = img('1597986346643-d54491ef85bb');
const EV_IMG = img('1593941707874-ef25b8b4a92b');
const BMW_IMG = img('1528597469186-bddab681a37f');

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function RevealSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div ref={ref} className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}>
      {children}
    </div>
  );
}

const trustItems = [
  { ar: 'خبرة تمتد منذ 1989', en: 'Experience Since 1989', num: '35+', unit: { ar: 'عاماً', en: 'Years' } },
  { ar: 'خدمات متكاملة تحت سقف واحد', en: 'Complete Services Under One Roof', num: '10+', unit: { ar: 'خدمة', en: 'Services' } },
  { ar: 'توثيق مراحل العمل', en: 'Documented Process', icon: 'camera' },
  { ar: 'ضمان من 3 أشهر وحتى 5 سنوات', en: 'Warranty: 3 Months – 5 Years', icon: 'shield' },
];

const serviceCards = [
  {
    num: '01', image: DIAGNOSTIC_IMG,
    ar: { title: 'الفحص والتشخيص والبرمجة', desc: 'تشخيص الأعطال، قراءة الأنظمة الإلكترونية، البرمجة والفحص الدوري.' },
    en: { title: 'Diagnostics & Programming', desc: 'Fault diagnosis, electronic system reading, programming, and periodic inspection.' },
  },
  {
    num: '02', image: WORKSHOP_IMG,
    ar: { title: 'الصيانة الميكانيكية والكهربائية', desc: 'المحرك، التبريد، التكييف، الأنظمة الكهربائية والإلكترونية.' },
    en: { title: 'Mechanical & Electrical', desc: 'Engine, cooling, A/C, electrical and electronic systems.' },
  },
  {
    num: '03', image: SUV_IMG,
    ar: { title: 'الإطارات والتعليق والبطاريات', desc: 'تبديل الإطارات، الموازنة، الميزان، التعليق والبطاريات.' },
    en: { title: 'Tires, Suspension & Batteries', desc: 'Tire replacement, balancing, alignment, suspension, and batteries.' },
  },
  {
    num: '04', image: WAXING_IMG,
    ar: { title: 'إصلاح الهيكل والحوادث', desc: 'إصلاح أضرار الحوادث، تعديل الهيكل، الصبغ ومعالجة الأضرار.' },
    en: { title: 'Body Repair', desc: 'Accident damage repair, body modification, painting, and damage treatment.' },
  },
  {
    num: '05', image: PPF_IMG,
    ar: { title: 'العناية والحماية', desc: 'PPF، التظليل، التلميع، العوازل والعناية الداخلية والخارجية.' },
    en: { title: 'Care & Protection', desc: 'PPF, window tinting, polishing, insulation, interior and exterior care.' },
  },
  {
    num: '06', image: INTERIOR_IMG,
    ar: { title: 'التحديث والتخصيص', desc: 'تطوير المظهر الخارجي، تحسين المقصورة، الإكسسوارات والتحديثات المخصصة.' },
    en: { title: 'Upgrades & Customization', desc: 'Exterior styling, cabin improvements, accessories, and custom upgrades.' },
  },
];

const benefits = [
  { num: '01', icon: ClipboardCheck, ar: { title: 'تشخيص دقيق', desc: 'لا يبدأ العمل قبل تحديد المشكلة وشرحها بوضوح.' }, en: { title: 'Precise Diagnosis', desc: 'Work only begins after identifying and clearly explaining the issue.' } },
  { num: '02', icon: Eye, ar: { title: 'موافقة قبل التنفيذ', desc: 'يتم توضيح تفاصيل الخدمة قبل تنفيذها.' }, en: { title: 'Pre-Work Approval', desc: 'All service details are explained before any work begins.' } },
  { num: '03', icon: Camera, ar: { title: 'توثيق مستمر', desc: 'تصلك صور وفيديوهات مراحل العمل عبر واتساب.' }, en: { title: 'Continuous Documentation', desc: 'You receive photos and videos of each work stage via WhatsApp.' } },
  { num: '04', icon: CheckCircle, ar: { title: 'رقابة على الجودة', desc: 'يتم فحص المركبة قبل التسليم النهائي.' }, en: { title: 'Quality Control', desc: 'The vehicle is fully inspected before final delivery.' } },
  { num: '05', icon: Shield, ar: { title: 'ضمان واضح', desc: 'ضمان على الخدمات والقطع حسب النوع والجهة المصنّعة.' }, en: { title: 'Clear Warranty', desc: 'Warranty on services and parts according to type and manufacturer.' } },
];

const processSteps = [
  { num: '01', ar: 'الاستقبال والتوثيق', en: 'Reception & Documentation' },
  { num: '02', ar: 'الفحص والتشخيص', en: 'Inspection & Diagnosis' },
  { num: '03', ar: 'عرض التفاصيل والموافقة', en: 'Review & Approval' },
  { num: '04', ar: 'التنفيذ والتحديثات', en: 'Execution & Updates' },
  { num: '05', ar: 'فحص الجودة', en: 'Quality Check' },
  { num: '06', ar: 'التسليم والمتابعة', en: 'Delivery & Follow-up' },
];

const projects = [
  { image: DETAILING_IMG, ar: { cat: 'عناية وتلميع', title: 'تلميع وعناية كاملة', model: 'Toyota Land Cruiser' }, en: { cat: 'Detailing', title: 'Full Detail & Polish', model: 'Toyota Land Cruiser' } },
  { image: PPF_IMG, ar: { cat: 'حماية PPF', title: 'تركيب فيلم الحماية', model: 'BMW 7 Series' }, en: { cat: 'PPF Protection', title: 'Full PPF Installation', model: 'BMW 7 Series' } },
  { image: INTERIOR_IMG, ar: { cat: 'تحديث داخلي', title: 'تطوير المقصورة', model: 'Mercedes S-Class' }, en: { cat: 'Interior Upgrade', title: 'Cabin Upgrade', model: 'Mercedes S-Class' } },
  { image: EV_IMG, ar: { cat: 'مركبات هجينة', title: 'صيانة منظومة الشحن', model: 'Toyota Prius' }, en: { cat: 'Hybrid Vehicles', title: 'Charging System Service', model: 'Toyota Prius' } },
];

const newsItems = [
  {
    image: DIAGNOSTIC_IMG, date: '2026-06-10',
    ar: { cat: 'الفحص والتشخيص', title: 'متى تحتاج مركبتك إلى فحص إلكتروني؟', excerpt: 'الفحص الإلكتروني ليس فقط عند الأعطال. تعرّف على المواعيد الصحيحة والأسباب الشائعة.' },
    en: { cat: 'Diagnostics', title: 'When Does Your Vehicle Need an Electronic Scan?', excerpt: "Electronic diagnostics aren't just for breakdowns. Learn the right timing and common reasons." },
  },
  {
    image: PPF_IMG, date: '2026-05-22',
    ar: { cat: 'العناية والحماية', title: 'حماية الطلاء وأفلام PPF — الفرق يصنعه التفصيل', excerpt: 'أفلام الحماية الشفافة باتت من أكثر الحلول طلباً لحماية الطلاء وقيمة المركبة.' },
    en: { cat: 'Care & Protection', title: 'Paint Protection & PPF — Details Make the Difference', excerpt: 'Transparent protection films are among the most sought-after solutions for preserving paint and vehicle value.' },
  },
  {
    image: EV_IMG, date: '2026-05-05',
    ar: { cat: 'الهجينة والكهربائية', title: 'صيانة المركبات الهجينة — ما الذي يختلف؟', excerpt: 'المركبات الهجينة تحتاج إلى خبرة متخصصة في منظومة البطاريات والمحرك الكهربائي.' },
    en: { cat: 'Hybrid & Electric', title: "Hybrid Vehicle Maintenance — What's Different?", excerpt: 'Hybrid vehicles require specialized expertise in battery systems and electric motors.' },
  },
];

export function HomePage() {
  const { t, isAr } = useLang();
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  return (
    <div>
      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO} alt="Al-Sorouh workshop" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B0D0F]/85 via-[#0B0D0F]/70 to-[#0B0D0F]/90" />
        </div>

        <div className="relative z-10 max-w-[1280px] mx-auto px-6 pt-40 pb-32">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-8">
              <span className="w-8 h-px bg-[#A98B5C]" />
              <span className="text-[#A98B5C] text-sm font-medium tracking-widest uppercase">
                {t('منذ عام 1989 | بغداد – الكرادة، شارع 52', 'Since 1989 | Baghdad, Al-Karrada, Street 52')}
              </span>
            </div>

            <h1 className="text-white mb-6 leading-tight" style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)', fontWeight: 700 }}>
              {t('عناية تليق بقيمة مركبتك', 'Care That Matches the Value of Your Vehicle')}
            </h1>

            <p className="text-[#A7ADB2] text-lg leading-relaxed mb-10 max-w-2xl">
              {t(
                'من الفحص والتشخيص إلى الصيانة والحماية والتحديث، نقدّم تجربة متكاملة بمعايير واضحة، تنفيذ موثّق، وضمان يحافظ على قيمة مركبتك.',
                'From diagnostics and maintenance to protection and upgrades, we deliver a complete vehicle-care experience with clear standards, documented work, and reliable warranty coverage.'
              )}
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-14">
              <Link
                to="/contact"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-[#A98B5C] text-white font-semibold text-lg hover:bg-[#8f7248] transition-all duration-300 shadow-2xl shadow-[#A98B5C]/30 group"
              >
                {t('احجز موعدك', 'Book an Appointment')}
                <Arrow size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl border border-white/30 text-white font-semibold text-lg hover:bg-white/10 transition-all duration-300 group"
              >
                {t('استكشف خدماتنا', 'Explore Our Services')}
                <Arrow size={20} className="group-hover:translate-x-1 transition-transform opacity-60" />
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              {[
                t('توثيق مراحل العمل', 'Documented Process'),
                t('ضمان واضح', 'Clear Warranty'),
                t('متابعة عبر واتساب', 'WhatsApp Updates'),
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-[#A7ADB2] text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A98B5C]" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 text-xs">
          <span>{t('اكتشف المزيد', 'Discover More')}</span>
          <ChevronDown size={20} className="animate-bounce" />
        </div>
      </section>

      {/* ─── TRUST STRIP ─── */}
      <section className="bg-[#15191D] border-y border-white/8">
        <div className="max-w-[1280px] mx-auto px-6 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {trustItems.map((item, i) => (
              <div key={i} className="flex flex-col gap-2">
                {'num' in item && item.num ? (
                  <span className="text-[#A98B5C] font-bold" style={{ fontSize: '2rem' }}>{item.num}</span>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-[#A98B5C]/20 flex items-center justify-center mb-1">
                    {item.icon === 'shield' ? <Shield size={16} className="text-[#A98B5C]" /> : <Camera size={16} className="text-[#A98B5C]" />}
                  </div>
                )}
                {'unit' in item && item.unit && (
                  <span className="text-[#A7ADB2] text-xs -mt-2">{isAr ? item.unit.ar : item.unit.en}</span>
                )}
                <p className="text-white font-medium text-sm">{isAr ? item.ar : item.en}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMPANY INTRO ─── */}
      <section className="bg-[#F3F1EC] py-24 lg:py-32">
        <div className="max-w-[1280px] mx-auto px-6">
          <RevealSection>
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              <div className={isAr ? 'order-1' : 'order-2'}>
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-8 h-px bg-[#A98B5C]" />
                  <span className="text-[#A98B5C] text-sm font-medium tracking-widest uppercase">{t('من نحن', 'About Us')}</span>
                </div>
                <h2 className="text-[#151719] mb-6 leading-tight" style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 700 }}>
                  {t('أكثر من مركز صيانة', 'More Than a Service Center')}
                </h2>
                <p className="text-[#6B7075] text-lg leading-relaxed mb-6">
                  {t(
                    'ركن الصروح مؤسسة عراقية متخصصة في خدمات المركبات، تجمع الصيانة، الفحص، العناية، الإصلاح والتحديث ضمن منظومة عمل واحدة. نبدأ بالتشخيص الدقيق، نوضح تفاصيل العمل قبل التنفيذ، ونوثّق مراحل الخدمة حتى لحظة تسليم المركبة.',
                    'Al-Sorouh is a specialized Iraqi vehicle-services institution that combines maintenance, inspection, care, repair, and upgrades within a single operational system. We start with precise diagnostics, explain work details before execution, and document every service stage until vehicle delivery.'
                  )}
                </p>
                <p className="text-[#151719] font-semibold text-lg border-s-4 border-[#A98B5C] ps-4 mb-8">
                  {t(
                    'لسنا ورشة تقليدية؛ بل تجربة متكاملة صُممت لتمنحك الثقة والوضوح وراحة البال.',
                    "We're not a traditional workshop — we're a complete experience designed to give you trust, clarity, and peace of mind."
                  )}
                </p>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-3 text-[#A98B5C] font-semibold hover:gap-4 transition-all group"
                >
                  {t('اكتشف قصتنا', 'Discover Our Story')}
                  <Arrow size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className={`relative ${isAr ? 'order-2' : 'order-1'}`}>
                <div className="relative">
                  <img
                    src={ABOUT_IMG}
                    alt="Al-Sorouh workshop"
                    className="w-full rounded-2xl object-cover shadow-2xl"
                    style={{ aspectRatio: '4/5', maxHeight: 560 }}
                  />
                  <div className="absolute -bottom-6 -start-6 w-40 h-40 rounded-xl overflow-hidden border-4 border-[#F3F1EC] shadow-xl">
                    <img src={WORKSHOP_IMG} alt="Workshop detail" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute top-6 -end-6 bg-[#0B0D0F] rounded-xl px-5 py-4 shadow-xl">
                    <div className="text-[#A98B5C] font-bold text-5xl leading-none">1989</div>
                    <div className="text-[#A7ADB2] text-xs mt-1">{t('تأسيس الجذور', 'Established')}</div>
                  </div>
                </div>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ─── SERVICES OVERVIEW ─── */}
      <section className="bg-white py-24 lg:py-32">
        <div className="max-w-[1280px] mx-auto px-6">
          <RevealSection>
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-5">
                <span className="w-8 h-px bg-[#A98B5C]" />
                <span className="text-[#A98B5C] text-sm font-medium tracking-widest uppercase">{t('خدماتنا', 'Services')}</span>
                <span className="w-8 h-px bg-[#A98B5C]" />
              </div>
              <h2 className="text-[#151719] mb-4" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 700 }}>
                {t('كل ما تحتاجه مركبتك، في مكان واحد', 'Everything Your Vehicle Needs, Under One Roof')}
              </h2>
              <p className="text-[#6B7075] text-lg max-w-xl mx-auto">
                {t(
                  'من الأداء والأنظمة الداخلية إلى الهيكل والحماية والمظهر، نقدّم حلولاً متخصصة لمختلف أنواع المركبات.',
                  'From performance and internal systems to body, protection, and appearance, we provide specialized solutions for all vehicle types.'
                )}
              </p>
            </div>
          </RevealSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceCards.map((card, i) => (
              <RevealSection key={i}>
                <Link to="/services" className="group block rounded-2xl overflow-hidden bg-[#F3F1EC] hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                  <div className="relative overflow-hidden" style={{ aspectRatio: '16/10' }}>
                    <img
                      src={card.image}
                      alt={isAr ? card.ar.title : card.en.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D0F]/80 via-transparent" />
                    <span className="absolute top-4 start-4 text-[#A98B5C] font-bold text-4xl opacity-60">{card.num}</span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-[#151719] font-bold text-lg mb-2">
                      {isAr ? card.ar.title : card.en.title}
                    </h3>
                    <p className="text-[#6B7075] text-sm leading-relaxed mb-4">
                      {isAr ? card.ar.desc : card.en.desc}
                    </p>
                    <div className="flex items-center gap-2 text-[#A98B5C] text-sm font-semibold group-hover:gap-3 transition-all">
                      {t('تفاصيل الخدمة', 'View Service')}
                      <Arrow size={16} />
                    </div>
                  </div>
                </Link>
              </RevealSection>
            ))}
          </div>

          <RevealSection>
            <div className="text-center mt-12">
              <Link
                to="/services"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl border-2 border-[#151719] text-[#151719] font-semibold text-lg hover:bg-[#151719] hover:text-white transition-all duration-300 group"
              >
                {t('عرض جميع الخدمات', 'View All Services')}
                <Arrow size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ─── FEATURED SERVICE ─── */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={DETAILING_IMG} alt="Premium protection" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D0F]/95 via-[#0B0D0F]/70 to-transparent" />
        </div>
        <div className="relative z-10 max-w-[1280px] mx-auto px-6 py-24">
          <RevealSection>
            <div className="max-w-xl">
              <div className="flex flex-wrap gap-2 mb-8">
                {['PPF', 'PDR', 'Detailing', 'Interior Upgrade', 'Exterior Upgrade'].map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full border border-[#A98B5C]/50 text-[#A98B5C] text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="text-white mb-6 leading-tight" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3.2rem)', fontWeight: 700 }}>
                {t('تفاصيل تصنع فرقاً واضحاً', 'Details That Make a Clear Difference')}
              </h2>
              <p className="text-[#A7ADB2] text-lg leading-relaxed mb-8">
                {t(
                  'من أفلام الحماية ومعالجة الطلاء إلى تحديث المقصورة والمظهر الخارجي، ننفّذ كل تفصيلة بما ينسجم مع شخصية المركبة ويحافظ على قيمتها.',
                  "From paint protection films and paint correction to cabin and exterior upgrades, we execute every detail in harmony with the vehicle's character and value."
                )}
              </p>
              <Link
                to="/services"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-[#A98B5C] text-white font-semibold hover:bg-[#8f7248] transition-all group"
              >
                {t('استعرض خدمات الحماية', 'Explore Protection Services')}
                <Arrow size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ─── WHY AL-SOROUH ─── */}
      <section className="bg-[#F3F1EC] py-24 lg:py-32">
        <div className="max-w-[1280px] mx-auto px-6">
          <RevealSection>
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-8 h-px bg-[#A98B5C]" />
                <span className="text-[#A98B5C] text-sm font-medium tracking-widest uppercase">{t('لماذا ركن الصروح؟', 'Why Al-Sorouh?')}</span>
              </div>
              <h2 className="text-[#151719]" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 700 }}>
                {t('خدمة واضحة من البداية إلى التسليم', 'Clear Service from Start to Delivery')}
              </h2>
            </div>
          </RevealSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <RevealSection key={i}>
                  <div className="bg-white rounded-2xl p-6 h-full border border-[#D9DBDD] hover:border-[#A98B5C]/40 hover:shadow-lg transition-all duration-300 group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[#A98B5C]/10 flex items-center justify-center group-hover:bg-[#A98B5C]/20 transition-colors">
                        <Icon size={20} className="text-[#A98B5C]" />
                      </div>
                      <span className="text-[#A98B5C]/40 font-bold text-3xl leading-none">{b.num}</span>
                    </div>
                    <h3 className="text-[#151719] font-bold text-base mb-2">{isAr ? b.ar.title : b.en.title}</h3>
                    <p className="text-[#6B7075] text-sm leading-relaxed">{isAr ? b.ar.desc : b.en.desc}</p>
                  </div>
                </RevealSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── SERVICE PROCESS ─── */}
      <section className="bg-[#0B0D0F] py-24 lg:py-32">
        <div className="max-w-[1280px] mx-auto px-6">
          <RevealSection>
            <div className="text-center mb-16">
              <h2 className="text-white mb-4" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 700 }}>
                {t('رحلة مركبتك معنا', "Your Vehicle's Journey With Us")}
              </h2>
              <p className="text-[#6B7075] max-w-lg mx-auto">
                {t(
                  'تبقى على اطلاع بمراحل العمل دون الحاجة إلى الحضور المستمر داخل المركز.',
                  'Stay informed on every work stage without needing to be physically present at the center.'
                )}
              </p>
            </div>
          </RevealSection>

          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute top-6 start-0 end-0 h-px bg-gradient-to-r from-transparent via-[#A98B5C]/40 to-transparent" />
              <div className="grid grid-cols-6 gap-4">
                {processSteps.map((step, i) => (
                  <RevealSection key={i}>
                    <div className="flex flex-col items-center text-center group">
                      <div className="w-12 h-12 rounded-full bg-[#15191D] border border-[#A98B5C]/40 flex items-center justify-center mb-4 group-hover:bg-[#A98B5C]/20 group-hover:border-[#A98B5C] transition-all duration-300 relative z-10">
                        <span className="text-[#A98B5C] font-bold text-sm">{step.num}</span>
                      </div>
                      <p className="text-white font-medium text-sm leading-tight">
                        {isAr ? step.ar : step.en}
                      </p>
                    </div>
                  </RevealSection>
                ))}
              </div>
            </div>
          </div>

          <div className="md:hidden space-y-6">
            {processSteps.map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[#15191D] border border-[#A98B5C]/40 flex items-center justify-center shrink-0">
                    <span className="text-[#A98B5C] font-bold text-xs">{step.num}</span>
                  </div>
                  {i < processSteps.length - 1 && <div className="w-px h-8 bg-[#A98B5C]/20 mt-2" />}
                </div>
                <div className="pb-4">
                  <p className="text-white font-medium">{isAr ? step.ar : step.en}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED PROJECTS ─── */}
      <section className="bg-white py-24 lg:py-32">
        <div className="max-w-[1280px] mx-auto px-6">
          <RevealSection>
            <div className="flex items-end justify-between mb-16 flex-wrap gap-6">
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-8 h-px bg-[#A98B5C]" />
                  <span className="text-[#A98B5C] text-sm font-medium tracking-widest uppercase">{t('مختارات من أعمالنا', 'Selected Projects')}</span>
                </div>
                <h2 className="text-[#151719]" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 700 }}>
                  {t('النتيجة تتحدث عن التفاصيل', 'The Result Speaks for the Details')}
                </h2>
              </div>
              <Link to="/projects" className="inline-flex items-center gap-2 text-[#A98B5C] font-semibold hover:gap-3 transition-all group">
                {t('جميع الأعمال', 'All Projects')}
                <Arrow size={18} />
              </Link>
            </div>
          </RevealSection>

          <RevealSection>
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <Award size={18} className="text-[#A98B5C]" />
                <span className="text-[#6B7075] text-sm font-medium">{t('مقارنة قبل وبعد | اسحب للمقارنة', 'Before & After Comparison | Drag to compare')}</span>
              </div>
              <BeforeAfterSlider
                before={WAXING_IMG}
                after={PPF_IMG}
                beforeLabel={t('قبل', 'Before')}
                afterLabel={t('بعد', 'After')}
              />
            </div>
          </RevealSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {projects.map((proj, i) => (
              <RevealSection key={i}>
                <Link to="/projects" className="group block rounded-xl overflow-hidden bg-[#F3F1EC] hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                  <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
                    <img
                      src={proj.image}
                      alt={isAr ? proj.ar.title : proj.en.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D0F]/70 via-transparent" />
                    <span className="absolute bottom-3 start-3 px-2 py-0.5 rounded bg-[#A98B5C]/90 text-white text-xs font-medium">
                      {isAr ? proj.ar.cat : proj.en.cat}
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="text-[#6B7075] text-xs mb-1">{proj.ar.model}</p>
                    <h3 className="text-[#151719] font-semibold text-sm mb-3">{isAr ? proj.ar.title : proj.en.title}</h3>
                    <div className="flex items-center gap-1 text-[#A98B5C] text-xs font-semibold group-hover:gap-2 transition-all">
                      {t('عرض المشروع', 'View Project')} <Arrow size={12} />
                    </div>
                  </div>
                </Link>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DOCUMENTATION & WARRANTY ─── */}
      <section className="py-24 lg:py-32">
        <div className="max-w-[1280px] mx-auto px-6">
          <RevealSection>
            <div className="grid lg:grid-cols-2 overflow-hidden rounded-3xl shadow-2xl">
              <div className="bg-[#0B0D0F] p-12 lg:p-16">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-8 h-px bg-[#A98B5C]" />
                  <span className="text-[#A98B5C] text-sm font-medium tracking-widest uppercase">{t('التوثيق', 'Documentation')}</span>
                </div>
                <h2 className="text-white mb-6" style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.4rem)', fontWeight: 700 }}>
                  {t('كل مرحلة موثّقة، وكل خدمة مدعومة', 'Every Stage Documented, Every Service Backed')}
                </h2>
                <p className="text-[#A7ADB2] leading-relaxed mb-8">
                  {t(
                    'نوثّق حالة المركبة عند الاستلام، مراحل الفحص والتنفيذ، والنتيجة النهائية. كما نقدّم ضماناً على الخدمات والقطع يبدأ من 3 أشهر وقد يصل إلى 5 سنوات بحسب نوع الخدمة أو القطعة والجهة المصنّعة.',
                    'We document the vehicle condition on receipt, inspection and execution stages, and the final result. We also provide warranty on services and parts starting from 3 months up to 5 years depending on service type and manufacturer.'
                  )}
                </p>
                <blockquote className="border-s-4 border-[#A98B5C] ps-6 text-white font-medium text-lg">
                  {t(
                    'الوضوح ليس إضافة إلى الخدمة؛ بل جزء أساسي منها.',
                    "Transparency isn't an addition to the service — it's an essential part of it."
                  )}
                </blockquote>
              </div>

              <div className="bg-[#F3F1EC] p-12 lg:p-16">
                <div className="space-y-6">
                  {[
                    { icon: Camera, ar: { t: 'توثيق الاستلام', d: 'تصوير حالة المركبة الكاملة عند الاستقبال' }, en: { t: 'Reception Documentation', d: 'Full vehicle condition photographed at reception' } },
                    { icon: MessageCircle, ar: { t: 'تحديثات واتساب', d: 'صور وفيديوهات مراحل العمل مباشرة على هاتفك' }, en: { t: 'WhatsApp Updates', d: 'Work-stage photos and videos sent directly to your phone' } },
                    { icon: Shield, ar: { t: 'ضمان موثّق', d: 'بطاقة ضمان واضحة مع التسليم' }, en: { t: 'Documented Warranty', d: 'Clear warranty card provided at delivery' } },
                    { icon: CheckCircle, ar: { t: 'فحص ما قبل التسليم', d: 'مراجعة شاملة تضمن جودة النتيجة النهائية' }, en: { t: 'Pre-Delivery Inspection', d: 'Comprehensive review ensuring final result quality' } },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white border border-[#D9DBDD]">
                        <div className="w-10 h-10 rounded-lg bg-[#A98B5C]/10 flex items-center justify-center shrink-0">
                          <Icon size={18} className="text-[#A98B5C]" />
                        </div>
                        <div>
                          <p className="text-[#151719] font-semibold text-sm mb-1">{isAr ? item.ar.t : item.en.t}</p>
                          <p className="text-[#6B7075] text-sm">{isAr ? item.ar.d : item.en.d}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ─── NEWS / BLOG ─── */}
      <section className="bg-[#F3F1EC] py-24 lg:py-32">
        <div className="max-w-[1280px] mx-auto px-6">
          <RevealSection>
            <div className="flex items-end justify-between mb-16 flex-wrap gap-6">
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-8 h-px bg-[#A98B5C]" />
                  <span className="text-[#A98B5C] text-sm font-medium tracking-widest uppercase">{t('المعرفة والأخبار', 'Knowledge & News')}</span>
                </div>
                <h2 className="text-[#151719]" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 700 }}>
                  {t('نشاركك ما يحافظ على مركبتك', 'We Share What Keeps Your Vehicle at Its Best')}
                </h2>
              </div>
              <Link to="/news" className="inline-flex items-center gap-2 text-[#A98B5C] font-semibold hover:gap-3 transition-all">
                {t('جميع المقالات', 'All Articles')} <Arrow size={18} />
              </Link>
            </div>
          </RevealSection>

          <div className="grid md:grid-cols-3 gap-6">
            {newsItems.map((item, i) => (
              <RevealSection key={i}>
                <Link to="/news" className="group block rounded-2xl overflow-hidden bg-white border border-[#D9DBDD] hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
                  <div className="relative overflow-hidden" style={{ aspectRatio: '16/10' }}>
                    <img
                      src={item.image}
                      alt={isAr ? item.ar.title : item.en.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <span className="absolute top-4 start-4 px-3 py-1 rounded-full bg-[#A98B5C]/90 text-white text-xs font-medium">
                      {isAr ? item.ar.cat : item.en.cat}
                    </span>
                  </div>
                  <div className="p-6">
                    <p className="text-[#6B7075] text-xs mb-3">{item.date}</p>
                    <h3 className="text-[#151719] font-bold text-base mb-3 leading-snug">
                      {isAr ? item.ar.title : item.en.title}
                    </h3>
                    <p className="text-[#6B7075] text-sm leading-relaxed mb-4">
                      {isAr ? item.ar.excerpt : item.en.excerpt}
                    </p>
                    <div className="flex items-center gap-2 text-[#A98B5C] text-sm font-semibold group-hover:gap-3 transition-all">
                      {t('اقرأ المزيد', 'Read More')} <Arrow size={14} />
                    </div>
                  </div>
                </Link>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="relative overflow-hidden py-32">
        <div className="absolute inset-0">
          <img src={BMW_IMG} alt="Premium vehicle" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#0B0D0F]/88" />
        </div>
        <div className="relative z-10 max-w-[1280px] mx-auto px-6 text-center">
          <RevealSection>
            <div className="max-w-2xl mx-auto">
              <h2 className="text-white mb-6" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 700 }}>
                {t('مركبتك تستحق مستوى أعلى من العناية', 'Your Vehicle Deserves a Higher Level of Care')}
              </h2>
              <p className="text-[#A7ADB2] text-lg leading-relaxed mb-10">
                {t(
                  'أخبرنا بما تحتاجه، وسيقوم فريقنا بالتواصل معك لتحديد الخدمة المناسبة والموعد.',
                  'Tell us what you need, and our team will contact you to determine the right service and schedule.'
                )}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-3 px-10 py-4 rounded-xl bg-[#A98B5C] text-white font-semibold text-lg hover:bg-[#8f7248] transition-all duration-300 shadow-2xl shadow-[#A98B5C]/30 group"
                >
                  {t('احجز موعدك الآن', 'Book Your Appointment Now')}
                  <Arrow size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="https://wa.me/9647700000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-10 py-4 rounded-xl bg-green-500/20 border border-green-500/40 text-green-400 font-semibold text-lg hover:bg-green-500/30 transition-all duration-300"
                >
                  <MessageCircle size={20} />
                  {t('تواصل عبر واتساب', 'Contact via WhatsApp')}
                </a>
              </div>
              <p className="text-[#A7ADB2] text-sm">
                {t('بغداد – الكرادة، شارع 52', 'Baghdad, Al-Karrada, Street 52')}
              </p>
            </div>
          </RevealSection>
        </div>
      </section>
    </div>
  );
}
