
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/dashboard/sidebar';
import Navigation from '@/components/dashboard/navigation';
import Header from '@/components/dashboard/header';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, Package } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession() || {};
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session || session.user?.role !== 'admin') {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-[280px] sm:w-[300px]">
          <div className="flex h-full flex-col gap-y-5 overflow-y-auto bg-gray-900 px-4 sm:px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg">
                  <Package className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-white">IceBoxT</h1>
                  <p className="text-xs text-gray-400">Admin Dashboard</p>
                </div>
              </div>
            </div>
            <Navigation onNavigate={() => setSidebarOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-72">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="px-3 py-4 sm:px-4 sm:py-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
