import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, ArrowLeftRight, ArrowUpRight, X } from 'lucide-react';
import { useLang } from '../providers/LanguageProvider';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider';
import { Eyebrow, FadeUp, MaskReveal } from '../components/primitives';
import { listProjects } from '../dashboard/services/projects';
import { listProjectCategories } from '../dashboard/services/projectCategories';
import type { Project, ProjectCategory } from '../dashboard/types';
import { useApiResource, fetchAllPages } from '../lib/publicApi';
import { mediaUrl, usePageHeroImage } from '../lib/siteContent';

/* PROJECTS — a documented catalogue, not a lead-gen gallery. Al-Sorouh no
   longer takes bookings from this site (removed sitewide alongside the
   Contact page rework), so this page carries no appointment CTA anywhere —
   the grid and modal exist purely to show finished work. Visual language
   matches the established dark instrument-panel system (Contact, Warranty &
   Trust): hairline framing, TechLabel index tags, no shadows, no rounded
   card chrome. */

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

function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const { t, isAr } = useLang();
  const closeRef = useRef<HTMLButtonElement>(null);
  const title = t(project.project_name_ar, project.project_name);
  const summary = t(project.project_description_ar, project.project_description);
  const categoryLabel = t(project.category_name_ar, project.category_name);
  const hasComparison = !!(project.before_img && project.after_img);

  useEffect(() => {
    closeRef.current?.focus();
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = bodyOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 overflow-y-auto bg-[#060708]/92 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="mx-auto max-w-4xl px-4 py-16 lg:py-24" onClick={(e) => e.stopPropagation()}>
        <div className="relative border border-[var(--sorouh-line)] bg-[#060708]">
          <CornerFrame />
          <div className="relative aspect-[16/9] overflow-hidden">
            {project.cover_img ? (
              <img
                src={mediaUrl(project.cover_img)}
                alt={title}
                loading="eager"
                decoding="async"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-[#0b0c0e]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#060708]/70 via-transparent to-transparent" />
            <button
              ref={closeRef}
              onClick={onClose}
              aria-label={t('إغلاق', 'Close')}
              className="absolute end-4 top-4 flex h-10 w-10 items-center justify-center border border-[var(--sorouh-line-strong)] bg-[#060708]/70 text-[var(--sorouh-ivory)] transition-colors duration-300 hover:border-[var(--sorouh-bronze)] hover:text-[var(--sorouh-bronze)]"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-8 lg:p-12">
            <div className="flex items-center justify-between gap-4">
              <span className="uppercase text-[var(--sorouh-bronze)]" style={{ fontSize: 12, letterSpacing: '0.06em', fontWeight: 500 }}>{categoryLabel}</span>
              <span dir="ltr" className="tabular-latin text-[var(--sorouh-steel)]" style={{ fontSize: 13 }}>{project.date}</span>
            </div>
            <h2 className="font-display mt-5 text-[var(--sorouh-ivory)]" style={{ fontSize: 'clamp(24px,2.6vw,34px)', fontWeight: 700, lineHeight: 1.3 }}>
              {title}
            </h2>
            <p className="mt-2 text-[var(--sorouh-steel)]" style={{ fontSize: 15 }}>{project.car_model}</p>
            <p className="mt-5 max-w-2xl text-[var(--sorouh-steel)]" style={{ fontSize: 15, lineHeight: 1.85 }}>{summary}</p>

            {hasComparison && (
              <div className="mt-10 border-t border-[var(--sorouh-line)] pt-10">
                <Eyebrow>{t('مقارنة قبل وبعد', 'Before & After Comparison')}</Eyebrow>
                <div className="mt-6">
                  <BeforeAfterSlider
                    before={mediaUrl(project.before_img)!}
                    after={mediaUrl(project.after_img)!}
                    beforeLabel={t('قبل', 'Before')}
                    afterLabel={t('بعد', 'After')}
                  />
                </div>
              </div>
            )}

            <Link
              to="/contact"
              className="group mt-10 inline-flex items-center gap-3 border border-[var(--sorouh-line-strong)] px-6 py-3.5 text-[var(--sorouh-bronze)] transition-colors duration-300 hover:bg-[var(--sorouh-bronze)] hover:text-[#060708]"
              onClick={onClose}
            >
              <span style={{ fontSize: 14, fontWeight: 500 }}>{t('تواصل بخصوص خدمة مشابهة', 'Ask About a Similar Service')}</span>
              <ArrowUpRight size={16} className={isAr ? '-scale-x-100' : ''} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProjectsPage() {
  const { t, isAr } = useLang();
  const reduceMotion = !!useReducedMotion();
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const Arrow = isAr ? ArrowLeft : ArrowRight;
  const heroImage = usePageHeroImage('projects');

  const { data: projects, loading: projectsLoading, error: projectsError } = useApiResource(
    () => fetchAllPages<Project>((page) => listProjects({ page })), []
  );
  const { data: categories } = useApiResource(
    () => fetchAllPages<ProjectCategory>((page) => listProjectCategories({ page })), []
  );

  const filters = [
    { id: 'all', ar: 'الكل', en: 'All' },
    ...(categories ?? []).map((c) => ({ id: c.id, ar: c.category_name_ar, en: c.category_name })),
  ];

  const filtered = activeFilter === 'all' ? (projects ?? []) : (projects ?? []).filter((p) => p.category === activeFilter);

  return (
    <div className="inner-page">
      {/* HERO */}
      <section className="relative min-h-[560px] overflow-hidden cinematic-grain vignette lg:min-h-[680px]">
        <div className="absolute inset-0">
          {heroImage && (
            <img
              src={heroImage}
              alt={t('أعمال الصروح', 'Al-Sorouh completed work')}
              loading="eager"
              fetchpriority="high"
              decoding="async"
              className="h-full w-full object-cover"
              style={{ filter: 'brightness(0.4) contrast(1.06) saturate(0.8)' }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#060708] via-[#060708]/55 via-45% to-[#060708]/70" />
        </div>

        <div className="hero-gutter relative z-10 flex min-h-[560px] flex-col justify-end pb-14 pt-32 lg:min-h-[680px] lg:pb-20 lg:pt-40">
          <MaskReveal>
            <Eyebrow>{t('أعمالنا', 'Our Work')}</Eyebrow>
          </MaskReveal>
          <div className="mt-6">
            <MaskReveal duration={1.2} delay={0.15}>
              <h1
                className="font-display block max-w-[820px] text-[var(--sorouh-ivory)]"
                style={{ fontSize: 'clamp(34px,4.2vw,64px)', fontWeight: 800, lineHeight: 1.18, paddingBottom: '0.08em' }}
              >
                {t('أعمال تعكس دقة التنفيذ', 'Work That Reflects Precision of Execution')}
              </h1>
            </MaskReveal>
          </div>
          <FadeUp delay={0.3}>
            <p className="mt-6 max-w-[560px] text-[var(--sorouh-steel)]" style={{ fontSize: 'clamp(15px,1.3vw,18px)', lineHeight: 1.85 }}>
              {t('مجموعة مختارة من مشاريعنا في مختلف أنواع الخدمات.', 'A curated selection of our projects across different service types.')}
            </p>
          </FadeUp>
        </div>
      </section>

      {/* FILTERS */}
      <section className="page-gutter pt-10 lg:pt-14">
        <div className="flex gap-8 overflow-x-auto border-b border-[var(--sorouh-line)] pb-4" dir={isAr ? 'rtl' : 'ltr'}>
          {filters.map((f) => (
            <button
              key={f.id}
              aria-pressed={activeFilter === f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`relative shrink-0 whitespace-nowrap pb-3 text-sm transition-colors focus-visible:rounded-sm ${
                activeFilter === f.id ? 'font-semibold text-[var(--sorouh-ivory)]' : 'text-[var(--sorouh-steel)] hover:text-[var(--sorouh-ivory)]'
              }`}
            >
              {isAr ? f.ar : f.en}
              {activeFilter === f.id && (
                <motion.span
                  layoutId="projects-filter"
                  className="absolute inset-x-0 -bottom-px h-[2px] bg-[var(--sorouh-bronze)]"
                  transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
                />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* GRID */}
      <section className="page-gutter pb-20 lg:pb-28">
        {projectsLoading ? (
          <div className="py-24 text-center text-[var(--sorouh-steel)]">
            <p style={{ fontSize: 18 }}>{t('جاري تحميل الأعمال...', 'Loading projects...')}</p>
          </div>
        ) : projectsError ? (
          <div className="py-24 text-center text-[var(--sorouh-steel)]">
            <p style={{ fontSize: 18 }}>{t('تعذر تحميل الأعمال حالياً.', 'Unable to load projects right now.')}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center text-[var(--sorouh-steel)]">
            <p style={{ fontSize: 18 }}>{t('لا توجد مشاريع في هذه الفئة', 'No projects in this category')}</p>
          </div>
        ) : (
          <div className="mt-14 grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project, index) => {
              const title = t(project.project_name_ar, project.project_name);
              const summary = t(project.project_description_ar, project.project_description);
              const categoryLabel = t(project.category_name_ar, project.category_name);
              const hasComparison = !!(project.before_img && project.after_img);
              return (
                <FadeUp key={project.id} delay={(index % 3) * 0.06}>
                  <button
                    onClick={() => setSelectedProject(project)}
                    className="group block w-full border-t border-[var(--sorouh-line)] pt-4 text-start"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#0b0c0e]">
                      {project.cover_img ? (
                        <img
                          src={mediaUrl(project.cover_img)}
                          alt={title}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full bg-[#0b0c0e]" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#060708]/50 via-transparent to-transparent" />
                      {hasComparison && (
                        <div className="absolute start-4 top-4 flex items-center gap-2 border border-[var(--sorouh-line-strong)] bg-[#060708]/70 px-2.5 py-1.5 backdrop-blur-sm">
                          <ArrowLeftRight size={12} strokeWidth={1.75} className="text-[var(--sorouh-bronze)]" />
                          <span className="text-[var(--sorouh-steel)]" style={{ fontSize: 11.5, fontWeight: 500 }}>
                            {t('قبل / بعد', 'Before / After')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-4">
                      <span className="flex items-center gap-1.5 text-[var(--sorouh-bronze)]" style={{ fontSize: 11, letterSpacing: '0.06em', fontWeight: 500 }}>
                        <span dir="ltr" className="tabular-latin">{String(index + 1).padStart(2, '0')}</span>
                        <span aria-hidden>·</span>
                        <span>{categoryLabel}</span>
                      </span>
                      <span dir="ltr" className="tabular-latin text-[var(--sorouh-steel)]" style={{ fontSize: 12 }}>{project.date}</span>
                    </div>
                    <h2 className="font-display mt-4 text-[var(--sorouh-ivory)]" style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.3 }}>
                      {title}
                    </h2>
                    <p className="mt-1.5 text-[var(--sorouh-steel)]" style={{ fontSize: 14 }}>{project.car_model}</p>
                    <p className="mt-3 text-[var(--sorouh-steel)]" style={{ fontSize: 14.5, lineHeight: 1.75 }}>{summary}</p>
                    <span className="mt-5 inline-flex items-center gap-3 text-sm font-medium text-[var(--sorouh-ivory)] transition-all group-hover:gap-5">
                      {t('عرض المشروع', 'View Project')} <Arrow size={16} />
                    </span>
                  </button>
                </FadeUp>
              );
            })}
          </div>
        )}
      </section>

      {selectedProject && <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />}
    </div>
  );
}
