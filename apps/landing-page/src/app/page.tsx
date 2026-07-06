import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Ecosystem from '@/components/Ecosystem';
import TechnologyGraph from '@/components/TechnologyGraph';
import LiveMap from '@/components/LiveMap';
import Pricing from '@/components/Pricing';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="flex flex-col w-full bg-parchment min-h-screen relative">
      <div className="fixed inset-0 w-full h-full bg-animated-pattern z-0" />
      <div className="relative z-10 flex flex-col w-full">
        <Header />
        <Hero />
        <About />
        <TechnologyGraph />
        <Ecosystem />
        <Pricing />
        <LiveMap />
        <FAQ />
        <Footer />
      </div>
    </main>
  );
}
