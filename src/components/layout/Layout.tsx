import { Outlet } from 'react-router-dom';
import { TopNav } from './TopNav';
import { Footer } from './Footer';

export function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <TopNav />
      <main className="flex-grow pt-28 pb-12 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
