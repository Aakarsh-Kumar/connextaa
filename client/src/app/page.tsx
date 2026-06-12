import Navbar from '../components/utils/Navbar';
import HeroSection from '../components/landing/HeroSection';
import CategoriesSection from '../components/landing/CategoriesSection';
import CollaborationStepSection from '../components/landing/CollaborationStepSection';
import SafetySection from '@/components/landing/SafetySection';
import CtaSection from '@/components/landing/CtaSection';
import Footer from '@/components/utils/Footer';
import TrendingSection from '@/components/landing/TrendingSection';

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <CategoriesSection />
      <CollaborationStepSection />
      <TrendingSection />
      <SafetySection />
      <CtaSection />
      <Footer />
    </>
  );
}
