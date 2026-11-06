import SplitText from './rb/SplitText/SplitText'

/** Section heading: eyebrow index + display title revealed letter by letter from a mask */
export default function Heading({ index, eyebrow, title, className = '', align = 'left' }: { index: string; eyebrow: string; title: string; className?: string; align?: 'left' | 'center' }) {
  return (
    <div className={className}>
      <p className={`eyebrow mb-5 flex items-center gap-3 ${align === 'center' ? 'justify-center' : ''}`}>
        <span className="text-bone/80">{index}</span><span className="h-px w-8 bg-white/20" />{eyebrow}
      </p>
      <SplitText
        text={title}
        tag="h2"
        className="display text-[clamp(38px,6.4vw,92px)] text-bone"
        splitType="words, chars"
        effect="rise"
        mask
        delay={28}
        duration={1.3}
        ease="expo.out"
        textAlign={align}
        threshold={0.2}
        rootMargin="-60px"
      />
    </div>
  )
}
