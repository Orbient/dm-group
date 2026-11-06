import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import Preloader from './sections/Preloader'
import Header from './sections/Header'
import Hero from './sections/Hero'
import { startSmoothScroll, ScrollTrigger } from './lib/smooth'
import { startFpsGuard } from './lib/perf'

const Rest = lazy(() => import('./Rest'))
const Footer = lazy(() => import('./sections/Footer'))

export default function App() {
  const [ready, setReady] = useState(false)
  const done = useCallback(() => setReady(true), [])

  useEffect(() => {
    startSmoothScroll()
    startFpsGuard()
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    document.fonts.ready.then(refresh)
    return () => window.removeEventListener('load', refresh)
  }, [])

  return (
    <>
      <Preloader onDone={done} />
      <Header ready={ready} />
      <main>
        <Hero ready={ready} />
        <Suspense fallback={<div className="h-svh" />}>
          <Rest />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      <div className="grain" aria-hidden style={{ backgroundImage: `url(${import.meta.env.BASE_URL}img/grain.webp)` }} />
    </>
  )
}
