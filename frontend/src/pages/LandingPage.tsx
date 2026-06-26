import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LandingNavbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { Stats } from '@/components/landing/Stats';
import { Features } from '@/components/landing/Features';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Technology } from '@/components/landing/Technology';
import { CTA } from '@/components/landing/CTA';
import { Footer } from '@/components/landing/Footer';

export const LandingPage: React.FC = () => {
  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-canvas-black"
      >
        <LandingNavbar />
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <Technology />
        <CTA />
        <Footer />
      </motion.div>
    </AnimatePresence>
  );
};