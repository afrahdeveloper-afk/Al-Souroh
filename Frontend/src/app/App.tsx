import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router';
import { LanguageProvider } from './providers/LanguageProvider';
import { PortfolioLayout } from './layout/PortfolioLayout';
import { HomeExperience } from './features/home/HomeExperience';
import { AboutPage } from './pages/AboutPage';
import { ServicesPage } from './pages/ServicesPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ContactPage } from './pages/ContactPage';
import { NewsPage } from './pages/NewsPage';
import { ArticlePage } from './pages/ArticlePage';
import { DashboardLayout } from './dashboard/layouts/DashboardLayout';
import { DashboardHome } from './dashboard/pages/DashboardHome';
import { LoginPage } from './dashboard/pages/auth/LoginPage';
import { RequireAuth } from './dashboard/components/RequireAuth';
import { ServicesListPage } from './dashboard/pages/services/ServicesListPage';
import { ServiceAddPage } from './dashboard/pages/services/ServiceAddPage';
import { ServiceEditPage } from './dashboard/pages/services/ServiceEditPage';
import { ProjectsListPage } from './dashboard/pages/projects/ProjectsListPage';
import { ProjectCategoriesPage } from './dashboard/pages/projects/ProjectCategoriesPage';
import { NewsListPage } from './dashboard/pages/news/NewsListPage';
import { HomepageEditorPage } from './dashboard/pages/homepage/HomepageEditorPage';
import { ContactEditorPage } from './dashboard/pages/contact/ContactEditorPage';
import { StaticImagesPage } from './dashboard/pages/staticImages/StaticImagesPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }); }, [pathname]);
  return null;
}

function SiteRoutes() {
  return <>
    <ScrollToTop />
    <Routes>
      <Route element={<PortfolioLayout />}>
        <Route path="/" element={<HomeExperience />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/news/:id" element={<ArticlePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<HomeExperience />} />
      </Route>
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route index element={<DashboardHome />} />
          <Route path="services" element={<ServicesListPage />} />
          <Route path="services/new" element={<ServiceAddPage />} />
          <Route path="services/:id/edit" element={<ServiceEditPage />} />
          <Route path="projects" element={<ProjectsListPage />} />
          <Route path="projects/categories" element={<ProjectCategoriesPage />} />
          <Route path="news" element={<NewsListPage />} />
          <Route path="homepage" element={<HomepageEditorPage />} />
          <Route path="contact" element={<ContactEditorPage />} />
          <Route path="static-images" element={<StaticImagesPage />} />
        </Route>
      </Route>
    </Routes>
  </>;
}

export default function App() {
  return <BrowserRouter><LanguageProvider><SiteRoutes /></LanguageProvider></BrowserRouter>;
}
