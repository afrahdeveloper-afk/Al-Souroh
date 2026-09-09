import { Outlet } from 'react-router';
import { Header } from './Header';
import { Footer } from './Footer';

export function Layout() {
  return (
    <div className="min-h-screen bg-[#F3F1EC]">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
