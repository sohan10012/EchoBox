import React from 'react';
import { HeroSection } from '@/components/landing/HeroSection';
import { ShowcaseCards } from '@/components/landing/ShowcaseCards';
import { HowItWorks } from '@/components/landing/HowItWorks';

export const LandingPage: React.FC = () => {
  return (
    <div className="w-full">
      <HeroSection />
      <ShowcaseCards />
      <HowItWorks />
    </div>
  );
};

