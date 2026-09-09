import { Link, useParams } from 'react-router';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { useLang } from '../providers/LanguageProvider';
import { Eyebrow, FadeUp, MaskReveal } from '../components/primitives';
import { getNews, listNews } from '../dashboard/services/news';
import { useApiResource } from '../lib/publicApi';
import { mediaUrl } from '../lib/siteContent';

/* ARTICLE — reads on the same dark instrument-panel ground as the rest of
   the redesigned site. Wired to the real backend: the News resource has no
   category, date, or reading-time field, so the header tag/meta line is
   gone rather than faked, and the related-articles strip shows title +
   thumbnail only. Body copy is authored in the Dashboard's News editor as
   one paragraph per line, joined with a blank line between paragraphs —
   read back here the same way. */

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

export function ArticlePage() {
  const { id } = useParams();
  const { isAr, t } = useLang();
  const { data: article, loading, error } = useApiResource(() => getNews(Number(id)), [id]);
  const { data: allArticles } = useApiResource(() => listNews(), []);
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  if (loading) {
    return (
      <section className="inner-page flex min-h-[70vh] items-center justify-center">
        <p className="text-[var(--sorouh-steel)]" style={{ fontSize: 16 }}>{t('جاري التحميل...', 'Loading...')}</p>
      </section>
    );
  }

  if (error || !article) {
    return (
      <section className="inner-page flex min-h-[70vh] flex-col items-center justify-center px-6 pb-24 pt-40 text-center">
        <h1 className="font-display text-[var(--sorouh-ivory)]" style={{ fontSize: 'clamp(32px,4vw,48px)', fontWeight: 800 }}>
          {t('المقال غير موجود', 'Article not found')}
        </h1>
        <Link
          to="/news"
          className="mt-8 inline-flex items-center gap-3 border-b border-[var(--sorouh-bronze)] pb-2 text-[var(--sorouh-bronze)]"
        >
          {t('العودة إلى الأخبار والمقالات', 'Back to News & Articles')}
        </Link>
      </section>
    );
  }

  const title = t(article.news_title_ar, article.news_title);
  const summary = t(article.news_description_ar, article.news_description);
  const bodyText = t(article.news_content_ar, article.news_content);
  const paragraphs = bodyText.split('\n\n').filter(Boolean);
  const related = (allArticles?.results ?? []).filter((item) => item.id !== article.id).slice(0, 3);

  return (
    <article className="inner-page">
      {/* HEADER */}
      <header className="relative min-h-[560px] overflow-hidden cinematic-grain vignette lg:min-h-[680px]">
        <div className="absolute inset-0">
          <img
            src={mediaUrl(article.news_img)}
            alt=""
            loading="eager"
            fetchpriority="high"
            decoding="async"
            className="h-full w-full object-cover"
            style={{ filter: 'brightness(0.34) contrast(1.08) saturate(0.7)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060708] via-[#060708]/55 via-45% to-[#060708]/70" />
        </div>

        <div className="hero-gutter relative z-10 flex min-h-[560px] flex-col justify-end pb-14 pt-32 lg:min-h-[680px] lg:pb-20 lg:pt-40">
          <Link
            to="/news"
            className="group mb-8 inline-flex w-fit items-center gap-3 text-sm text-[var(--sorouh-steel)] transition-colors duration-300 hover:text-[var(--sorouh-bronze)]"
          >
            <BackArrow size={16} className="transition-transform duration-300 group-hover:-translate-x-1 rtl:group-hover:translate-x-1" />
            {t('العودة إلى الأخبار والمقالات', 'Back to News & Articles')}
          </Link>
          <div className="mt-6">
            <MaskReveal duration={1.2} delay={0.15}>
              <h1
                className="font-display block max-w-[860px] text-[var(--sorouh-ivory)]"
                style={{ fontSize: 'clamp(34px,4.6vw,68px)', fontWeight: 800, lineHeight: 1.16, paddingBottom: '0.08em' }}
              >
                {title}
              </h1>
            </MaskReveal>
          </div>
        </div>
      </header>

      {/* BODY */}
      <section className="page-gutter py-20 lg:py-28">
        <div className="mx-auto max-w-[760px]">
          <FadeUp>
            <p
              className="font-display text-[var(--sorouh-ivory)]"
              style={{ fontSize: 'clamp(24px, 2.8vw, 36px)', lineHeight: 1.5, fontWeight: 600 }}
            >
              {summary}
            </p>
          </FadeUp>
          <FadeUp delay={0.1}>
            <div className="mt-14 space-y-7 text-[var(--sorouh-steel)]" style={{ fontSize: 18, lineHeight: 1.9 }}>
              {paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </FadeUp>

          <FadeUp delay={0.18}>
            <div className="relative mt-16 border border-[var(--sorouh-line)] p-8 lg:p-10">
              <CornerFrame />
              <span
                className={`text-[var(--sorouh-bronze)] ${isAr ? 'font-body' : 'font-mono-tech uppercase'}`}
                style={{ fontSize: 11, fontWeight: 600, letterSpacing: isAr ? 0 : '0.24em' }}
              >
                {t('هل تحتاج إلى تقييم دقيق؟', 'Need a precise assessment?')}
              </span>
              <h2 className="font-display mt-4 text-[var(--sorouh-ivory)]" style={{ fontSize: 'clamp(24px,2.4vw,32px)', fontWeight: 700, lineHeight: 1.35 }}>
                {t('ابدأ محادثة خاصة حول مركبتك.', 'Start a private conversation about your vehicle.')}
              </h2>
              <Link
                to="/contact"
                className="group mt-7 inline-flex items-center gap-3 border border-[var(--sorouh-line-strong)] px-6 py-3.5 text-[var(--sorouh-bronze)] transition-colors duration-300 hover:bg-[var(--sorouh-bronze)] hover:text-[#060708]"
              >
                <span style={{ fontSize: 14, fontWeight: 500 }}>{t('تواصل معنا', 'Contact Us')}</span>
                <ArrowUpRight size={16} className={isAr ? '-scale-x-100' : ''} />
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* RELATED */}
      {related.length > 0 && (
        <section className="page-gutter border-t border-[var(--sorouh-line)] pb-24 pt-16 lg:pb-32">
          <FadeUp>
            <Eyebrow>{t('مقالات ذات صلة', 'Related Articles')}</Eyebrow>
          </FadeUp>
          <div className="mt-10 grid gap-x-8 gap-y-14 md:grid-cols-3">
            {related.map((item, i) => {
              const relatedTitle = t(item.news_title_ar, item.news_title);
              return (
                <FadeUp key={item.id} delay={i * 0.08}>
                  <Link to={`/news/${item.id}`} className="group block border-t border-[var(--sorouh-line)] pt-4">
                    <div className="aspect-[4/3] overflow-hidden bg-[#0b0c0e]">
                      <img
                        src={mediaUrl(item.news_img)}
                        alt={relatedTitle}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <h2 className="font-display mt-4 text-[var(--sorouh-ivory)]" style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.3 }}>
                      {relatedTitle}
                    </h2>
                  </Link>
                </FadeUp>
              );
            })}
          </div>
        </section>
      )}
    </article>
  );
}
