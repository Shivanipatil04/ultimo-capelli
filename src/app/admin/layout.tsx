"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const navItems = [
    { name: 'Dashboard', href: '/admin' },
    { name: 'Instagram Gallery', href: '/admin/instagram' },
    { name: 'Transformations', href: '/admin/transformations' },
    { name: 'Services', href: '/admin/services' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row text-gray-800 font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white shadow-md flex-shrink-0 z-10">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">ULTIMO ADMIN</h1>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={`block px-4 py-2 rounded-md transition-colors ${pathname === item.href ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {item.name}
            </Link>
          ))}
          <button 
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 rounded-md text-red-600 hover:bg-red-50 transition-colors mt-8"
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
