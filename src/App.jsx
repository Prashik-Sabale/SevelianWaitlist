import AnnouncementBar from './components/AnnouncementBar.jsx'
import BrandFooter from './components/BrandFooter.jsx'
import BrandPhilosophy from './components/BrandPhilosophy.jsx'
import BrandStatement from './components/BrandStatement.jsx'
import CollectionPreview from './components/CollectionPreview.jsx'
import EarlyAccessForm from './components/EarlyAccessForm.jsx'
import HeroSection from './components/HeroSection.jsx'
import InstagramGallery from './components/InstagramGallery.jsx'
import LaunchCountdown from './components/LaunchCountdown.jsx'
import MaterialStory from './components/MaterialStory.jsx'
import Navbar from './components/Navbar.jsx'
import { useEffect } from 'react'
import useReveal from './hooks/useReveal.js'

export default function App() {
  useReveal()

  // Content renders client-side, so honour deep links like /#early-access
  // once the sections exist.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    if (id) document.getElementById(id)?.scrollIntoView()
  }, [])

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <AnnouncementBar />
      <Navbar />
      <main id="main">
        <HeroSection />
        <BrandPhilosophy />
        <CollectionPreview />
        <MaterialStory />
        <LaunchCountdown />
        <EarlyAccessForm />
        <InstagramGallery />
        <BrandStatement />
      </main>
      <BrandFooter />
    </>
  )
}
