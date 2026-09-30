import { useDeviceProfile } from './hooks/useDeviceProfile'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { CategoryMarquee } from './components/CategoryMarquee'
import { Showroom } from './components/Showroom'
import { Benefits } from './components/Benefits'
import { Testimonials } from './components/Testimonials'
import { LeadSection } from './components/LeadSection'
import { FAQ } from './components/FAQ'
import { Footer } from './components/Footer'
import { WhatsAppFloat } from './components/WhatsAppFloat'

export default function App() {
  const profile = useDeviceProfile()
  return (
    <>
      <Navbar />
      <main id="conteudo">
        <Hero profile={profile} />
        <CategoryMarquee />
        <Showroom profile={profile} />
        <Benefits />
        <Testimonials />
        <LeadSection />
        <FAQ />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  )
}
