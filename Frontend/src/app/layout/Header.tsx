import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { useLang } from '../providers/LanguageProvider';
import { Menu, X, Phone, MessageCircle, Globe } from 'lucide-react';

const navLinks = [
  { ar: 'الرئيسية', en: 'Home', path: '/' },
  { ar: 'من نحن', en: 'About Us', path: '/about' },
  { ar: 'خدماتنا', en: 'Services', path: '/services' },
  { ar: 'أعمالنا', en: 'Projects', path: '/projects' },
  { ar: 'الأخبار والمقالات', en: 'News & Articles', path: '/news' },
  { ar: 'تواصل معنا', en: 'Contact Us', path: '/contact' },
];

export function Header() {
  const { t, lang, setLang, isAr } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        {/* Top utility bar - hidden when scrolled */}
        <div
          className={`hidden md:block bg-[#0B0D0F] border-b border-white/10 text-[#A7ADB2] text-xs transition-all duration-300 overflow-hidden ${scrolled ? 'max-h-0 opacity-0' : 'max-h-10 opacity-100'}`}
        >
          <div className="max-w-[1280px] mx-auto px-6 py-2 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2">
                <Phone size={11} className="text-[#A98B5C]" />
                <span dir="ltr">+964 770 000 0000</span>
              </span>
              <span>{t('بغداد – الكرادة، شارع 52', 'Baghdad, Al-Karrada, Street 52')}</span>
            </div>
            <div className="flex items-center gap-4">
              <span>{t('السبت – الخميس: 8ص – 6م', 'Sat–Thu: 8AM – 6PM')}</span>
              <a
                href="https://wa.me/9647700000000"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-green-400 hover:text-green-300 transition-colors"
              >
                <MessageCircle size={11} />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Main nav */}
        <div
          className={`transition-all duration-500 ${
            scrolled
              ? 'bg-[#0B0D0F]/97 backdrop-blur-md shadow-2xl border-b border-white/8'
              : 'bg-transparent'
          }`}
        >
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="flex items-center justify-between h-20">
              {/* Logo */}
              <Link to="/" className="flex flex-col leading-tight">
                <span className="text-white font-bold text-xl tracking-tight">
                  {isAr ? 'ركن الصروح' : 'Al-Sorouh'}
                </span>
                <span className="text-[#A98B5C] text-xs font-medium tracking-widest uppercase">
                  {isAr ? 'لخدمات المركبات' : 'Vehicle Services'}
                </span>
              </Link>

              {/* Desktop nav */}
              <nav className="hidden lg:flex items-center gap-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-sm font-medium transition-colors duration-200 relative group ${
                      isActive(link.path) ? 'text-[#A98B5C]' : 'text-white/80 hover:text-white'
                    }`}
                  >
                    {isAr ? link.ar : link.en}
                    <span
                      className={`absolute -bottom-1 left-0 right-0 h-px bg-[#A98B5C] transition-transform duration-300 ${
                        isAr ? 'origin-right' : 'origin-left'
                      } ${isActive(link.path) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}
                    />
                  </Link>
                ))}
              </nav>

              {/* Right actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-all text-sm"
                >
                  <Globe size={14} />
                  <span>{lang === 'ar' ? 'EN' : 'AR'}</span>
                </button>

                <a
                  href="https://wa.me/9647700000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:flex items-center justify-center w-9 h-9 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-all"
                >
                  <MessageCircle size={16} />
                </a>

                <Link
                  to="/contact"
                  className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#A98B5C] text-white text-sm font-semibold hover:bg-[#8f7248] transition-all duration-200 shadow-lg shadow-[#A98B5C]/20"
                >
                  {t('احجز موعدك', 'Book Appointment')}
                </Link>

                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg border border-white/20 text-white"
                >
                  {menuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile full-screen menu */}
      <div
        className={`fixed inset-0 z-40 bg-[#0B0D0F] transition-all duration-500 ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ paddingTop: '5rem' }}
      >
        <div className="max-w-[1280px] mx-auto px-6 py-12 flex flex-col gap-2">
          {navLinks.map((link, i) => (
            <Link
              key={link.path}
              to={link.path}
              className={`py-5 border-b border-white/10 flex items-center justify-between group transition-colors ${
                isActive(link.path) ? 'text-[#A98B5C]' : 'text-white/80 hover:text-white'
              }`}
              style={{ transitionDelay: `${i * 40}ms` }}
            >
              <span className="text-2xl font-semibold">{isAr ? link.ar : link.en}</span>
              <span className="text-[#A98B5C] opacity-0 group-hover:opacity-100 transition-opacity">
                {isAr ? '←' : '→'}
              </span>
            </Link>
          ))}

          <div className="mt-8 flex flex-col gap-4">
            <Link
              to="/contact"
              className="w-full py-4 rounded-xl bg-[#A98B5C] text-white text-center text-lg font-semibold"
            >
              {t('احجز موعدك', 'Book Appointment')}
            </Link>
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="w-full py-3 rounded-xl border border-white/20 text-white/70 text-center flex items-center justify-center gap-2"
            >
              <Globe size={16} />
              <span>{lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}</span>
            </button>
          </div>

          <div className="mt-8 text-[#6B7075] text-sm">
            <p>{t('بغداد – الكرادة، شارع 52', 'Baghdad, Al-Karrada, Street 52')}</p>
            <p dir="ltr" className="mt-1">+964 770 000 0000</p>
          </div>
        </div>
      </div>

      {/* Mobile sticky bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-[#0B0D0F]/95 backdrop-blur-md border-t border-white/10 px-4 py-3 flex gap-3">
        <Link
          to="/contact"
          className="flex-1 py-3 rounded-xl bg-[#A98B5C] text-white text-center text-sm font-semibold"
        >
          {t('احجز موعدك', 'Book Appointment')}
        </Link>
        <a
          href="https://wa.me/9647700000000"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-3 rounded-xl bg-green-500/20 text-green-400 text-center text-sm font-semibold flex items-center justify-center gap-2"
        >
          <MessageCircle size={16} />
          <span>WhatsApp</span>
        </a>
      </div>
    </>
  );
}
