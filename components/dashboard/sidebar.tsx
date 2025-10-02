
'use client';

import { Package } from 'lucide-react';
import Navigation from './navigation';

export default function Sidebar() {
  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">IceBoxT</h1>
              <p className="text-xs text-gray-400">Admin Dashboard</p>
            </div>
          </div>
        </div>
        <Navigation />
      </div>
    </div>
  );
}
