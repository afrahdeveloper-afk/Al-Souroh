import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router';
import { Locale, translate } from '../lib/i18n/translations';

export type Lang = Locale;

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (ar: string, en: string) => string;
  isAr: boolean;
  dir: 'rtl' | 'ltr';
}

const Ctx = createContext<LangCtx>(null!);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const isDashboard = pathname.startsWith('/dashboard');

  const [lang, setLangState] = useState<Lang>(() => {
    try { return (localStorage.getItem('sorouh-lang') as Lang) || 'ar'; } catch { return 'ar'; }
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem('sorouh-lang', l); } catch {}
  };

  const effectiveLang: Lang = isDashboard ? 'ar' : lang;

  useEffect(() => {
    const html = document.documentElement;
    html.dir = effectiveLang === 'ar' ? 'rtl' : 'ltr';
    html.lang = effectiveLang;
    html.style.fontFamily = '';

    const localize = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const parent = node.parentElement;
        if (!parent || ['SCRIPT', 'STYLE'].includes(parent.tagName)) return;
        if (parent.closest('[data-app="dashboard"]')) return;
        const text = node.textContent ?? '';
        const translated = translate(text, lang);
        if (translated !== text) node.textContent = text.replace(text.trim(), translated);
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const element = node as Element;
      if (element.closest('[data-app="dashboard"]')) return;
      ['alt', 'placeholder', 'aria-label', 'title'].forEach((name) => {
        const value = element.getAttribute(name);
        if (!value) return;
        const translated = translate(value, lang);
        if (translated !== value) element.setAttribute(name, translated);
      });
      element.childNodes.forEach(localize);
    };

    localize(document.body);
    const observer = new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach(localize));
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [effectiveLang]);

  const t = (ar: string, en: string) => effectiveLang === 'ar' ? ar : en;
  const isAr = effectiveLang === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';

  return <Ctx.Provider value={{ lang: effectiveLang, setLang, t, isAr, dir }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);
