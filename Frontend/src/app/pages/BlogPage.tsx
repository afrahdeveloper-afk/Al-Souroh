import { useState } from 'react';
import { useLang } from '../providers/LanguageProvider';
import { ArrowLeft, ArrowRight, Search, Clock, X } from 'lucide-react';

const img = (id: string, w = 1080) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=${w}`;

const HERO = img('1593941707874-ef25b8b4a92b', 1920);

const categories = [
  { id: 'all', ar: 'الكل', en: 'All' },
  { id: 'maintenance', ar: 'الصيانة', en: 'Maintenance' },
  { id: 'diagnostic', ar: 'الفحص والتشخيص', en: 'Diagnostics' },
  { id: 'protection', ar: 'العناية والحماية', en: 'Care & Protection' },
  { id: 'hybrid', ar: 'الهجينة والكهربائية', en: 'Hybrid & Electric' },
  { id: 'news', ar: 'أخبار الشركة', en: 'Company News' },
];

const articles = [
  {
    id: 1, category: 'diagnostic', featured: true,
    date: '2026-06-10', readTime: 5,
    image: img('1727893380169-4dda123e19f7'),
    ar: { title: 'متى تحتاج مركبتك إلى فحص إلكتروني؟', excerpt: 'الفحص الإلكتروني ليس فقط لحالات الأعطال. تعرّف على المواعيد الصحيحة، الأسباب الشائعة التي قد لا تنتبه إليها، وكيف يساعدك التشخيص المبكر في توفير تكاليف الصيانة.', content: 'يظن كثيرون أن الفحص الإلكتروني ضروري فقط عند ظهور أضواء التحذير في لوحة القيادة. الحقيقة أن منظومة الفحص المبكر هي مفتاح للحفاظ على أداء المركبة وقيمتها...' },
    en: { title: 'When Does Your Vehicle Need an Electronic Scan?', excerpt: 'Electronic diagnostics aren\'t just for breakdowns. Learn the right timing, common reasons you might overlook, and how early diagnosis helps save maintenance costs.', content: 'Many believe electronic scanning is only necessary when dashboard warning lights appear. The truth is early diagnostic scanning is key to maintaining vehicle performance and value...' },
  },
  {
    id: 2, category: 'protection', featured: false,
    date: '2026-05-22', readTime: 4,
    image: img('1632605166776-7128669886e7'),
    ar: { title: 'حماية الطلاء وأفلام PPF — الفرق يصنعه التفصيل', excerpt: 'أفلام الحماية الشفافة باتت من أكثر الحلول طلباً لحماية الطلاء وقيمة المركبة. ما الذي تقدمه هذه الأفلام؟ وكيف تختار بين الخيارات المتاحة؟', content: 'حماية الطلاء من الخدوش والأضرار الخارجية أصبحت أولوية لكثير من أصحاب المركبات الفاخرة والجديدة...' },
    en: { title: 'Paint Protection & PPF — Details Make the Difference', excerpt: 'Transparent protection films have become one of the most sought-after solutions for paint and vehicle value preservation. What do these films offer, and how do you choose?', content: 'Protecting paint from scratches and external damage has become a priority for many luxury and new vehicle owners...' },
  },
  {
    id: 3, category: 'hybrid', featured: false,
    date: '2026-05-05', readTime: 6,
    image: img('1593941707874-ef25b8b4a92b'),
    ar: { title: 'صيانة المركبات الهجينة — ما الذي يختلف؟', excerpt: 'المركبات الهجينة تحتاج إلى خبرة متخصصة في منظومة البطاريات والمحرك الكهربائي. تعرّف على ما يختلف في صيانتها وما يشتركان.', content: 'مع تزايد انتشار المركبات الهجينة في السوق العراقي، باتت الحاجة إلى صيانة متخصصة أكثر إلحاحاً...' },
    en: { title: 'Hybrid Vehicle Maintenance — What\'s Different?', excerpt: 'Hybrid vehicles require specialized expertise in battery systems and electric motors. Learn what differs in their maintenance and what\'s shared with conventional vehicles.', content: 'With the growing adoption of hybrid vehicles in the Iraqi market, the need for specialized maintenance has become more pressing...' },
  },
  {
    id: 4, category: 'maintenance', featured: false,
    date: '2026-04-18', readTime: 5,
    image: img('1615906655593-ad0386982a0f'),
    ar: { title: 'نصائح الصيانة الدورية — ما لا يخبرك به كثيرون', excerpt: 'الصيانة الدورية أكثر من تغيير الزيت. اكتشف القائمة الكاملة التي تحافظ على أداء مركبتك وتحميها من الأعطال المفاجئة.', content: 'كثير من أصحاب المركبات يعتقدون أن الصيانة الدورية تعني فقط تغيير الزيت وفلتر الهواء...' },
    en: { title: 'Periodic Maintenance Tips — What Many Don\'t Tell You', excerpt: 'Periodic maintenance is more than an oil change. Discover the full checklist that maintains your vehicle\'s performance and protects against unexpected breakdowns.', content: 'Many vehicle owners believe periodic maintenance only means changing the oil and air filter...' },
  },
  {
    id: 5, category: 'protection', featured: false,
    date: '2026-04-02', readTime: 3,
    image: img('1632823469850-2f77dd9c7f93'),
    ar: { title: 'الفرق بين PDR والإصلاح التقليدي — متى تختار كلاً منهما؟', excerpt: 'PDR هو الخيار الأذكى للدهون الصغيرة، لكن ليس كل ضرر مناسب له. تعرّف على الفرق وكيف تقرر الخيار الصحيح.', content: 'تقنية PDR (إصلاح الدهون بلا طلاء) أحدثت ثورة في عالم إصلاح الهيكل...' },
    en: { title: 'PDR vs. Traditional Repair — When to Choose Each', excerpt: 'PDR is the smarter choice for small dents, but not every damage qualifies. Learn the difference and how to decide the right option.', content: 'PDR (Paintless Dent Repair) technology revolutionized the world of body repair...' },
  },
  {
    id: 6, category: 'news', featured: false,
    date: '2026-03-15', readTime: 2,
    image: img('1728893119356-1702fe921cf9'),
    ar: { title: 'ركن الصروح يستقبل معدات تشخيص متطورة جديدة', excerpt: 'اقتنى فريقنا أحدث أجهزة التشخيص الإلكتروني لتوفير خدمة أسرع وأدق لجميع أنواع المركبات.', content: 'في إطار خطة التطوير المستمرة، أعلنت ركن الصروح عن اقتناء منظومة تشخيص متطورة...' },
    en: { title: 'Al-Sorouh Receives New Advanced Diagnostic Equipment', excerpt: 'Our team has acquired the latest electronic diagnostic devices to provide faster and more precise service for all vehicle types.', content: 'As part of its continuous development plan, Al-Sorouh announced the acquisition of an advanced diagnostic system...' },
  },
];

function ArticleModal({ article, onClose }: { article: typeof articles[0]; onClose: () => void }) {
  const { t, isAr } = useLang();
  const data = isAr ? article.ar : article.en;

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0D0F]/95 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div className="max-w-3xl mx-auto px-4 py-16" onClick={(e) => e.stopPropagation()}>
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
          <div className="relative">
            <img src={article.image} alt={data.title} className="w-full object-cover" style={{ maxHeight: 380 }} />
            <button onClick={onClose} className="absolute top-4 end-4 w-10 h-10 rounded-full bg-[#0B0D0F]/70 flex items-center justify-center text-white hover:bg-[#0B0D0F] transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="p-8 md:p-12">
            <div className="flex items-center gap-4 mb-6">
              <span className="px-3 py-1 rounded-full bg-[#A98B5C]/10 text-[#A98B5C] text-xs font-medium">
                {isAr ? (categories.find(c => c.id === article.category)?.ar || '') : (categories.find(c => c.id === article.category)?.en || '')}
              </span>
              <span className="text-[#6B7075] text-sm">{article.date}</span>
              <div className="flex items-center gap-1 text-[#6B7075] text-sm">
                <Clock size={13} />
                <span>{article.readTime} {t('دقائق', 'min')}</span>
              </div>
            </div>
            <h2 className="text-[#151719] mb-6" style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.2rem)', fontWeight: 700, lineHeight: 1.3 }}>{data.title}</h2>
            <p className="text-[#6B7075] leading-relaxed text-lg mb-6">{data.excerpt}</p>
            <div className="prose prose-lg max-w-none">
              <p className="text-[#6B7075] leading-relaxed">{data.content}</p>
              <p className="text-[#6B7075] leading-relaxed mt-4">
                {t(
                  'للاستشارة وتحديد الخدمة المناسبة لمركبتك، تواصل مع فريق ركن الصروح عبر واتساب أو من خلال نموذج الحجز.',
                  'For consultation and determining the right service for your vehicle, contact the Al-Sorouh team via WhatsApp or the booking form.'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BlogPage() {
  const { t, isAr } = useLang();
  const [activeCat, setActiveCat] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<typeof articles[0] | null>(null);
  const [page, setPage] = useState(1);
  const Arrow = isAr ? ArrowLeft : ArrowRight;
  const perPage = 6;

  const featured = articles.find((a) => a.featured);
  const filtered = articles.filter((a) => {
    if (activeCat !== 'all' && a.category !== activeCat) return false;
    if (search) {
      const q = search.toLowerCase();
      return a.ar.title.toLowerCase().includes(q) || a.en.title.toLowerCase().includes(q);
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice(0, page * perPage);

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[55vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO} alt="Blog" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B0D0F]/70 to-[#0B0D0F]/95" />
        </div>
        <div className="relative z-10 max-w-[1280px] mx-auto px-6 pb-16 pt-36 w-full">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-px bg-[#A98B5C]" />
            <span className="text-[#A98B5C] text-sm font-medium tracking-widest uppercase">{t('المعرفة والأخبار', 'Knowledge & News')}</span>
          </div>
          <h1 className="text-white mb-4" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 700 }}>
            {t('معرفة تساعدك على اتخاذ القرار الصحيح', 'Knowledge That Helps You Make the Right Decision')}
          </h1>
        </div>
      </section>

      {/* Search & Filters */}
      <div className="bg-white border-b border-[#D9DBDD] py-5 sticky top-0 z-20">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-[#A7ADB2]" />
              <input
                type="text"
                placeholder={t('ابحث في المقالات...', 'Search articles...')}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full ps-9 pe-4 py-2.5 rounded-xl border border-[#D9DBDD] text-[#151719] text-sm focus:border-[#A98B5C] focus:outline-none transition-colors"
              />
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto w-full sm:flex-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCat(cat.id); setPage(1); }}
                  className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeCat === cat.id
                      ? 'bg-[#A98B5C] text-white'
                      : 'bg-[#F3F1EC] text-[#6B7075] hover:text-[#151719]'
                  }`}
                >
                  {isAr ? cat.ar : cat.en}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="bg-[#F3F1EC] py-16">
        <div className="max-w-[1280px] mx-auto px-6">
          {/* Featured Article */}
          {featured && activeCat === 'all' && !search && (
            <div className="mb-12">
              <button
                onClick={() => setSelectedArticle(featured)}
                className="group w-full text-start grid lg:grid-cols-2 gap-0 bg-white rounded-3xl overflow-hidden border border-[#D9DBDD] hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
              >
                <div className="overflow-hidden" style={{ minHeight: 320 }}>
                  <img
                    src={featured.image}
                    alt={isAr ? featured.ar.title : featured.en.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    style={{ minHeight: 320 }}
                  />
                </div>
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="px-3 py-1 rounded-full bg-[#A98B5C] text-white text-xs font-medium">{t('مقال مميز', 'Featured')}</span>
                    <span className="text-[#6B7075] text-sm">{featured.date}</span>
                  </div>
                  <h2 className="text-[#151719] mb-4" style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', fontWeight: 700, lineHeight: 1.3 }}>
                    {isAr ? featured.ar.title : featured.en.title}
                  </h2>
                  <p className="text-[#6B7075] leading-relaxed mb-6">
                    {isAr ? featured.ar.excerpt : featured.en.excerpt}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[#6B7075] text-sm">
                      <Clock size={14} />
                      <span>{featured.readTime} {t('دقائق قراءة', 'min read')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#A98B5C] font-semibold group-hover:gap-3 transition-all ms-auto">
                      {t('اقرأ المقال', 'Read Article')} <Arrow size={18} />
                    </div>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Articles Grid */}
          {paginated.length === 0 ? (
            <div className="text-center py-24 text-[#6B7075]">
              <p className="text-xl">{t('لا توجد مقالات مطابقة', 'No matching articles')}</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {paginated.map((article) => {
                  const data = isAr ? article.ar : article.en;
                  return (
                    <button
                      key={article.id}
                      onClick={() => setSelectedArticle(article)}
                      className="group text-start rounded-2xl overflow-hidden bg-white border border-[#D9DBDD] hover:shadow-xl hover:-translate-y-1 transition-all duration-500"
                    >
                      <div className="relative overflow-hidden" style={{ aspectRatio: '16/10' }}>
                        <img
                          src={article.image}
                          alt={data.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <span className="absolute top-4 start-4 px-3 py-1 rounded-full bg-[#A98B5C]/90 text-white text-xs font-medium">
                          {isAr ? (categories.find(c => c.id === article.category)?.ar || '') : (categories.find(c => c.id === article.category)?.en || '')}
                        </span>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-[#6B7075] text-xs">{article.date}</span>
                          <div className="flex items-center gap-1 text-[#6B7075] text-xs">
                            <Clock size={11} />
                            <span>{article.readTime} {t('د', 'min')}</span>
                          </div>
                        </div>
                        <h3 className="text-[#151719] font-bold text-base mb-3 leading-snug">{data.title}</h3>
                        <p className="text-[#6B7075] text-sm leading-relaxed mb-4 line-clamp-2">{data.excerpt}</p>
                        <div className="flex items-center gap-2 text-[#A98B5C] text-sm font-semibold group-hover:gap-3 transition-all">
                          {t('اقرأ المزيد', 'Read More')} <Arrow size={14} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Pagination */}
              {page < totalPages && (
                <div className="text-center">
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    className="px-8 py-3 rounded-xl border-2 border-[#151719] text-[#151719] font-semibold hover:bg-[#151719] hover:text-white transition-all"
                  >
                    {t('تحميل المزيد', 'Load More')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {selectedArticle && <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />}
    </div>
  );
}
