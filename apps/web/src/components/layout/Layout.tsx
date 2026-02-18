/**
 * Layout — page wrapper that renders Header + content + Footer.
 * Every route is wrapped in this component via the router.
 */

import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      {/* Main content area — flex-1 pushes footer to the bottom */}
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

