'use client';

import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import {Button} from '@/components/ui/button';
import {
  Home,
  User,
  FileText,
  Camera,
  Download,
  LogOut,
  Menu,
  X,
  Shield
} from 'lucide-react';

const DashboardNav = ({ activeTab, onTabChange, userEmail }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Home, href: '/dashboard' },
    { id: 'profile', label: 'Profile', icon: User, href: '/dashboard/profile' },
    { id: 'credentials', label: 'Credentials', icon: Shield, href: '/dashboard/credentials' },
    { id: 'capture', label: 'Capture Info', icon: Camera, href: '/dashboard/capture' },
    { id: 'generate', label: 'Generate Files', icon: Download, href: '/dashboard/generate' },
    { id: 'documents', label: 'Documents', icon: FileText, href: '/dashboard' },
  ];

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard">
              <h1 className="text-xl font-semibold text-foreground cursor-pointer">
                Tourist DID Dashboard
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map(({ id, label, icon: Icon, href }) => (
              <Link key={id} href={href}>
                <Button
                  variant={activeTab === id ? "default" : "outline"}
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Button>
              </Link>
            ))}
            
            <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-border">
              <span className="text-sm text-muted-foreground">{userEmail}</span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map(({ id, label, icon: Icon, href }) => (
                <Link key={id} href={href}>
                  <Button
                    variant={activeTab === id ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {label}
                  </Button>
                </Link>
              ))}
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground px-3 py-2">{userEmail}</p>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default DashboardNav;