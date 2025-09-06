"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutGrid, PlusSquare, LogOut, BarChart3, Users, Settings, HelpCircle, Mail, FileText, Calendar, Bell, Shield, Globe, Phone, MessageSquare, BookOpen, Download, Upload, Search, Filter } from 'lucide-react';

export default function Sidebar({ onLogout }) {
  const pathname = usePathname();
  const nav = [
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/add-data', label: 'Add Data', icon: PlusSquare },
    { href: '/projects', label: 'Projects', icon: LayoutGrid },
    { href: '/reports', label: 'Reports', icon: FileText },
    { href: '/calendar', label: 'Calendar', icon: Calendar },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/search', label: 'Search', icon: Search },
    { href: '/filters', label: 'Filters', icon: Filter },
  ];

  const secondaryNav = [
    { href: '/users', label: 'Users', icon: Users },
    { href: '/settings', label: 'Settings', icon: Settings },
    { href: '/help', label: 'Help Center', icon: HelpCircle },
    { href: '/documentation', label: 'Documentation', icon: BookOpen },
  ];

  const contactNav = [
    { href: '/contact', label: 'Contact Us', icon: Mail },
    { href: '/support', label: 'Support', icon: MessageSquare },
    { href: '/phone', label: 'Phone', icon: Phone },
    { href: '/website', label: 'Website', icon: Globe },
  ];

  const toolsNav = [
    { href: '/download', label: 'Download', icon: Download },
    { href: '/upload', label: 'Upload', icon: Upload },
    { href: '/security', label: 'Security', icon: Shield },
  ];

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 border-r bg-white min-h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3 border-b">
        <div className="relative h-8 w-28">
          <Image src="/orcaframe-logo.png" alt="OrcaFrame" fill className="object-contain" />
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-6 overflow-y-auto">
        {/* Main Navigation */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">Main</h3>
          <div className="space-y-1">
            {nav.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    active ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Management */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">Management</h3>
          <div className="space-y-1">
            {secondaryNav.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    active ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Contact & Support */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">Contact & Support</h3>
          <div className="space-y-1">
            {contactNav.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    active ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Tools */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">Tools</h3>
          <div className="space-y-1">
            {toolsNav.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    active ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
      <div className="p-3 border-t bg-gray-50">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </aside>
  );
}
