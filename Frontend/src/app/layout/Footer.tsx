import { Link } from 'react-router';
import { useLang } from '../providers/LanguageProvider';
import { Phone, MessageCircle, MapPin, Clock, Instagram, Facebook, Youtube } from 'lucide-react';

const navLinks = [
  { ar: 'الرئيسية', en: 'Home', path: '/' },
  { ar: 'من نحن', en: 'About Us', path: '/about' },
  { ar: 'خدماتنا', en: 'Services', path: '/services' },
  { ar: 'أعمالنا', en: 'Projects', path: '/projects' },
  { ar: 'الأخبار والمقالات', en: 'News & Articles', path: '/news' },
  { ar: 'تواصل معنا', en: 'Contact Us', path: '/contact' },
];

const services = [
  { ar: 'الفحص والتشخيص', en: 'Diagnostics' },
  { ar: 'الصيانة الميكانيكية', en: 'Mechanical Service' },
  { ar: 'إصلاح الهيكل', en: 'Body Repair' },
  { ar: 'العناية وPPF', en: 'Care & PPF' },
  { ar: 'الإطارات والتعليق', en: 'Tires & Suspension' },
  { ar: 'التحديث والتخصيص', en: 'Upgrades' },
];

export function Footer() {
  const { t, isAr } = useLang();

  return (
    <footer className="bg-[#0B0D0F] border-t border-white/10">
      <div className="max-w-[1280px] mx-auto px-6 pt-16 pb-24 lg:pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <div className="text-white font-bold text-2xl mb-1">
                {t('ركن الصروح', 'Al-Sorouh')}
              </div>
              <div className="text-[#A98B5C] text-sm tracking-widest uppercase">
                {t('لخدمات المركبات', 'Vehicle Services')}
              </div>
            </div>
            <p className="text-[#6B7075] text-sm leading-relaxed mb-6">
              {t(
                'ركن الصروح مؤسسة عراقية متخصصة تقدم حلولاً متكاملة لصيانة المركبات، فحصها، حمايتها وتحديثها ضمن نظام عمل واضح وموثوق.',
                'Al-Sorouh is a specialized Iraqi institution providing complete vehicle maintenance, inspection, protection, and upgrade solutions within a clear and reliable system.'
              )}
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#A98B5C]/20 flex items-center justify-center text-[#A7ADB2] hover:text-[#A98B5C] transition-all">
                <Instagram size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#A98B5C]/20 flex items-center justify-center text-[#A7ADB2] hover:text-[#A98B5C] transition-all">
                <Facebook size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#A98B5C]/20 flex items-center justify-center text-[#A7ADB2] hover:text-[#A98B5C] transition-all">
                <Youtube size={16} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">
              {t('صفحات الموقع', 'Pages')}
            </h3>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-[#6B7075] hover:text-[#A98B5C] transition-colors text-sm"
                  >
                    {isAr ? link.ar : link.en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">
              {t('خدماتنا', 'Services')}
            </h3>
            <ul className="space-y-3">
              {services.map((s) => (
                <li key={s.en}>
                  <Link
                    to="/services"
                    className="text-[#6B7075] hover:text-[#A98B5C] transition-colors text-sm"
                  >
                    {isAr ? s.ar : s.en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">
              {t('تواصل معنا', 'Contact')}
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-[#A98B5C] mt-0.5 shrink-0" />
                <span className="text-[#6B7075] text-sm">
                  {t('بغداد – الكرادة، شارع 52', 'Baghdad, Al-Karrada, Street 52')}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-[#A98B5C] shrink-0" />
                <a href="tel:+9647700000000" className="text-[#6B7075] hover:text-white text-sm transition-colors" dir="ltr">
                  +964 770 000 0000
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle size={16} className="text-green-400 shrink-0" />
                <a href="https://wa.me/9647700000000" target="_blank" rel="noopener noreferrer" className="text-[#6B7075] hover:text-green-400 text-sm transition-colors">
                  WhatsApp
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock size={16} className="text-[#A98B5C] mt-0.5 shrink-0" />
                <div className="text-[#6B7075] text-sm">
                  <p>{t('السبت – الخميس', 'Saturday – Thursday')}</p>
                  <p dir="ltr">8:00 AM – 6:00 PM</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#6B7075] text-sm">
            {t(
              `© ${new Date().getFullYear()} ركن الصروح لخدمات المركبات. جميع الحقوق محفوظة.`,
              `© ${new Date().getFullYear()} Al-Sorouh Vehicle Services. All rights reserved.`
            )}
          </p>
          <div className="flex items-center gap-2 text-[#A98B5C] text-xs">
            <span className="w-6 h-px bg-[#A98B5C]" />
            <span>{t('منذ عام 1989', 'Since 1989')}</span>
            <span className="w-6 h-px bg-[#A98B5C]" />
          </div>
        </div>
      </div>
    </footer>
  );
}
