import Navbar from '../components/utils/Navbar';
import HeroSection from '../components/landing/HeroSection';
import CategoriesSection from '../components/landing/CategoriesSection';
import CollaborationStepSection from '../components/landing/CollaborationStepSection';

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <CategoriesSection />
      <CollaborationStepSection />
    </>
  );
}
