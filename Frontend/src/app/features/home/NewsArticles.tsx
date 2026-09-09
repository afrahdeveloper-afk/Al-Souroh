import { Link } from 'react-router';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useLang } from '../../providers/LanguageProvider';
import { listNews } from '../../dashboard/services/news';
import { publicClient } from '../../lib/publicClient';
import type { News } from '../../dashboard/types';
import { useApiResource, fetchAllPages } from '../../lib/publicApi';
import { mediaUrl } from '../../lib/siteContent';
import { Eyebrow } from '../../components/primitives';

export function NewsArticles() {
  const { isAr, t } = useLang();
  const { data: articles } = useApiResource(() => fetchAllPages<News>((page) => listNews({ page }, publicClient)), []);
  const recent = (articles ?? []).filter((article) => !article.is_featured).slice(0, 3);
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  return (
    <section className="safe-inline relative overflow-hidden bg-[var(--sorouh-ivory)] py-24 text-[#101113] lg:py-36">
      <div className="absolute inset-x-0 top-0 h-px bg-[#101113]/15" />
      <div className="mx-auto max-w-[1280px]">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <Eyebrow className="!text-[var(--sorouh-bronze)]">{t('الافتتاحية', 'THE EDITORIAL')}</Eyebrow>
            <h2 className="font-display mt-5" style={{ fontSize: 'clamp(42px, 6vw, 88px)', fontWeight: 800, lineHeight: 1.12, paddingBottom: '0.08em' }}>
              {t('الأخبار والمقالات', 'News & Articles')}
            </h2>
            <p className="mt-5 max-w-xl text-[#5d6063]" style={{ fontSize: 18, lineHeight: 1.8 }}>
              {t('رؤى عملية وقصص مختارة من عالم العناية الدقيقة بالمركبات.', 'Practical insight and selected stories from the world of precision vehicle care.')}
            </p>
          </div>
        </div>

        {recent.length ? <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {recent.map((article, index) => {
            const title = t(article.news_title_ar, article.news_title);
            const summary = t(article.news_description_ar, article.news_description);
            return <Link key={article.id} to={`/news/${article.id}`} className={`group block border-t border-[#101113]/20 pt-4 ${index === 1 ? 'lg:mt-12' : ''}`}>
              <div className="relative aspect-[4/3] overflow-hidden bg-[#101113]">
                <img src={mediaUrl(article.news_img)} alt={title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#101113]/40 to-transparent" />
              </div>
              <h3 className="mt-5 font-display text-[#101113]" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.25 }}>{title}</h3>
              <p className="mt-3 text-[#5d6063]" style={{ fontSize: 16, lineHeight: 1.75 }}>{summary}</p>
              <span className="mt-5 inline-flex items-center gap-3 text-sm font-medium text-[#101113] transition-all group-hover:gap-5">{t('اقرأ المزيد', 'Read More')} <Arrow size={16} /></span>
            </Link>;
          })}
        </div> : <div className="py-24 text-center text-[#5d6063]">{t('لا توجد مقالات حالياً.', 'There are no articles yet.')}</div>}

        <div className="mt-14 text-center"><Link to="/news" className="inline-flex items-center gap-4 border-b border-[var(--sorouh-bronze)] pb-3 text-sm font-medium text-[#101113] transition-colors hover:text-[var(--sorouh-bronze)]">{t('عرض جميع الأخبار والمقالات', 'View All News & Articles')} <Arrow size={16} /></Link></div>
      </div>
    </section>
  );
}
