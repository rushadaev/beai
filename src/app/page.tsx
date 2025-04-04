'use client';

import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import VisualBuilder from '@/components/landing/VisualBuilder';
import Faq from '@/components/landing/Faq';
import Cta from '@/components/landing/Cta';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-dark text-primary">
      <Header />
      <Hero />
      <Faq />
      <VisualBuilder />
      <Features />
      <HowItWorks />
      
      <Cta />
      <Footer />
    </div>
  );
}
