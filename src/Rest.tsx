import { useEffect } from 'react'
import About from './sections/About'
import Transform from './sections/Transform'
import Services from './sections/Services'
import Build from './sections/Build'
import Marquee from './sections/Marquee'
import Works from './sections/Works'
import Statement from './sections/Statement'
import Reviews from './sections/Reviews'
import Contact from './sections/Contact'
import { ScrollTrigger } from './lib/smooth'

/** Everything below the hero, split out so the first screen paints with less JavaScript. */
export default function Rest() {
  // children's pins are created by now; measure the whole page once
  useEffect(() => { ScrollTrigger.refresh() }, [])
  return (
    <>
        <About />
        <Transform />
        <Services />
        <Build />
        <Marquee />
        <Works />
        <Statement />
        <Reviews />
        <Contact />
    </>
  )
}
