import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import { useLang } from '../providers/LanguageProvider';
import { Eyebrow, FadeUp, MaskReveal } from '../components/primitives';
import { mediaUrl, usePageHeroImage } from '../lib/siteContent';
import { listNews } from '../dashboard/services/news';
import type { News } from '../dashboard/types';
import { useApiResource, fetchAllPages } from '../lib/publicApi';

/* NEWS & ARTICLES — a dispatch log, not a blog feed. The previous build cut
   from the dark cinematic hero straight into a light #F3F1EC panel with a
   dark #101113 featured block and white grid cards — the exact "pre-rework
   generic template" pattern already diagnosed and fixed on Contact,
   Projects, and Services. Wired to the real backend: the News resource has
   no category, date, or reading-time field, so the category filter row is
   gone rather than faked — but it does carry a real `is_featured` boolean
   (added to the backend after the initial API-wiring pass), so the featured
   -story spotlight is back, driven by that field. At most one article is
   ever featured, and it's equally valid for none to be — the spotlight
   section only renders when `list.find(a => a.is_featured)` finds one; the
   dispatch log below always excludes whichever article (if any) is
   currently featured, so it never duplicates into the log the way the very
   first mock-data build of this page once did (see CLAUDE.md's section log).

   Signature: unlike Projects' portfolio grid or Services' category rail,
   these entries read as a single ordered log — full-width rows (thumbnail +
   text) rather than a tiled grid. */

function FeaturedTag({ isAr, children }: { isAr: boolean; children: string }) {
  return (
    <span
      className={`text-[var(--sorouh-bronze)] ${isAr ? 'font-body' : 'font-mono-tech uppercase'}`}
      style={{ fontSize: 11, fontWeight: 600, letterSpacing: isAr ? 0 : '0.24em' }}
    >
      {children}
    </span>
  );
}

export function NewsPage() {
  const { isAr, t } = useLang();
  const [visible, setVisible] = useState(4);
  const { data: articles, loading, error } = useApiResource(
    () => fetchAllPages<News>((page) => listNews({ page })),
    []
  );
  const list = articles ?? [];
  const featured = list.find((article) => article.is_featured);
  const logArticles = list.filter((article) => !article.is_featured);
  const Arrow = isAr ? ArrowLeft : ArrowRight;
  const heroImage = usePageHeroImage('news');

  return (
    <div className="inner-page">
      {/* HERO */}
      <section className="relative min-h-[560px] overflow-hidden cinematic-grain vignette lg:min-h-[680px]">
        <div className="absolute inset-0">
          {heroImage && (
            <img
              src={heroImage}
              alt={t('الأخبار والمقالات', 'News & Articles')}
              loading="eager"
              fetchpriority="high"
              decoding="async"
              className="h-full w-full object-cover"
              style={{ filter: 'brightness(0.34) contrast(1.08) saturate(0.7)' }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#060708] via-[#060708]/55 via-45% to-[#060708]/70" />
        </div>

        <div className="hero-gutter relative z-10 flex min-h-[560px] flex-col justify-end pb-14 pt-32 lg:min-h-[680px] lg:pb-20 lg:pt-40">
          <MaskReveal>
            <Eyebrow>{t('المجلة', 'The Editorial')}</Eyebrow>
          </MaskReveal>
          <div className="mt-6">
            <MaskReveal duration={1.2} delay={0.15}>
              <h1
                className="font-display block max-w-[820px] text-[var(--sorouh-ivory)]"
                style={{ fontSize: 'clamp(34px,4.2vw,64px)', fontWeight: 800, lineHeight: 1.18, paddingBottom: '0.08em' }}
              >
                {t('الأخبار والمقالات', 'News & Articles')}
              </h1>
            </MaskReveal>
          </div>
          <FadeUp delay={0.3}>
            <p className="mt-6 max-w-[560px] text-[var(--sorouh-steel)]" style={{ fontSize: 'clamp(15px,1.3vw,18px)', lineHeight: 1.85 }}>
              {t(
                'أفكار واضحة وقصص متأنية عن العناية بالمركبات، وخيارات الصيانة، والعمل الدقيق وراء كل نتيجة.',
                'Clear insight and considered stories about vehicle care, maintenance choices, and the precision behind every result.'
              )}
            </p>
          </FadeUp>
        </div>
      </section>

      {/* FEATURED STORY — only rendered when the backend actually has one
          featured article; "no featured article" is an equally valid state. */}
      {!loading && !error && featured && (
        <section className="page-gutter pt-10 lg:pt-14">
          <FadeUp>
            <Link
              to={`/news/${featured.id}`}
              className="group relative grid overflow-hidden border border-[var(--sorouh-line)] transition-colors duration-300 hover:border-[var(--sorouh-bronze)]/60 lg:grid-cols-[1.4fr_1fr]"
            >
              <div className="relative min-h-[300px] overflow-hidden bg-[#0b0c0e] lg:min-h-[460px]">
                <img
                  src={mediaUrl(featured.news_img)}
                  alt={t(featured.news_title_ar, featured.news_title)}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060708]/45 via-transparent to-transparent lg:bg-gradient-to-l" />
              </div>
              <div className="flex flex-col justify-center p-8 lg:p-12">
                <FeaturedTag isAr={isAr}>{t('المقال المميز', 'Featured Story')}</FeaturedTag>
                <h2
                  className="font-display mt-6 text-[var(--sorouh-ivory)]"
                  style={{ fontSize: 'clamp(28px, 3.4vw, 46px)', fontWeight: 800, lineHeight: 1.18, paddingBottom: '0.06em' }}
                >
                  {t(featured.news_title_ar, featured.news_title)}
                </h2>
                <p className="mt-5 text-[var(--sorouh-steel)]" style={{ fontSize: 15.5, lineHeight: 1.85 }}>
                  {t(featured.news_description_ar, featured.news_description)}
                </p>
                <span className="mt-8 inline-flex items-center gap-3 text-sm font-medium text-[var(--sorouh-ivory)] transition-all group-hover:gap-5">
                  {t('قراءة المقال', 'Read Article')} <Arrow size={17} />
                </span>
              </div>
            </Link>
          </FadeUp>
        </section>
      )}

      {/* DISPATCH LOG */}
      <section className="page-gutter pb-20 pt-10 lg:pb-28 lg:pt-14">
        {loading ? (
          <div className="py-24 text-center text-[var(--sorouh-steel)]">
            <p style={{ fontSize: 18 }}>{t('جاري تحميل المقالات...', 'Loading articles...')}</p>
          </div>
        ) : error ? (
          <div className="py-24 text-center text-[var(--sorouh-steel)]">
            <p style={{ fontSize: 18 }}>{t('تعذر تحميل المقالات حالياً.', 'Unable to load articles right now.')}</p>
          </div>
        ) : logArticles.length ? (
          <div>
            {logArticles.slice(0, visible).map((article, i) => (
              <FadeUp key={article.id} delay={(i % 4) * 0.06}>
                <Link
                  to={`/news/${article.id}`}
                  className="group flex flex-col gap-5 border-t border-[var(--sorouh-line)] py-8 first:border-t-0 first:pt-0 sm:flex-row sm:gap-8"
                >
                  <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-[#0b0c0e] sm:w-60 lg:w-72">
                    <img
                      src={mediaUrl(article.news_img)}
                      alt={t(article.news_title_ar, article.news_title)}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="min-w-0 flex-1 py-1">
                    <h2 className="font-display text-[var(--sorouh-ivory)]" style={{ fontSize: 27, fontWeight: 700, lineHeight: 1.28 }}>
                      {t(article.news_title_ar, article.news_title)}
                    </h2>
                    <p className="mt-3 max-w-2xl text-[var(--sorouh-steel)]" style={{ fontSize: 15, lineHeight: 1.8 }}>
                      {t(article.news_description_ar, article.news_description)}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-3 text-sm font-medium text-[var(--sorouh-ivory)] transition-all group-hover:gap-5">
                      {t('اقرأ المزيد', 'Read More')} <Arrow size={16} />
                    </span>
                  </div>
                </Link>
              </FadeUp>
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="py-24 text-center text-[var(--sorouh-steel)]">
            <p style={{ fontSize: 18 }}>{t('لا توجد مقالات حالياً.', 'There are no articles yet.')}</p>
          </div>
        ) : null}

        {visible < logArticles.length && (
          <div className="mt-16 text-center">
            <button
              onClick={() => setVisible((current) => current + 3)}
              className="inline-flex items-center gap-3 border border-[var(--sorouh-line-strong)] px-6 py-3 text-[var(--sorouh-bronze)] transition-colors duration-300 hover:bg-[var(--sorouh-bronze)] hover:text-[#060708]"
            >
              <Plus size={16} /> <span style={{ fontSize: 14, fontWeight: 500 }}>{t('تحميل المزيد', 'Load More')}</span>
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
