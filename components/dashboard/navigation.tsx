'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    BarChart3,
    Package,
    Users,
    ShoppingCart,
    Truck,
    Home,
} from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Products', href: '/dashboard/products', icon: Package },
    { name: 'Categories', href: '/dashboard/categories', icon: BarChart3 },
    { name: 'Customers', href: '/dashboard/customers', icon: Users },
    { name: 'Orders', href: '/dashboard/orders', icon: ShoppingCart },
    { name: 'Delivery Staff', href: '/dashboard/delivery', icon: Truck },
];

interface NavigationProps {
    onNavigate?: () => void;
}

export default function Navigation({ onNavigate }: NavigationProps) {
    const pathname = usePathname();

    return (
        <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                    <ul role="list" className="-mx-2 space-y-1">
                        {navigation.map((item) => (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    onClick={onNavigate}
                                    className={cn(
                                        pathname === item.href
                                            ? 'bg-gray-800 text-white'
                                            : 'text-gray-400 hover:text-white hover:bg-gray-800',
                                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors'
                                    )}
                                >
                                    <item.icon className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
                                    <span className="truncate">{item.name}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </li>
            </ul>
        </nav>
    );
}