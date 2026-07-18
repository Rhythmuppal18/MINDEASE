import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import AnimatedBackground from '../ui/AnimatedBackground';

interface LayoutProps {
  children: React.ReactNode;
  backgroundVariant?: 'default' | 'fog' | 'grey' | 'storm' | 'ocean' | 'time';
}

export default function Layout({ children, backgroundVariant = 'default' }: LayoutProps) {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AnimatedBackground variant={backgroundVariant} />
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-4 pt-8 sm:px-6 lg:px-8">{children}</main>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Footer />
      </div>
    </div>
  );
}
