'use client'

import { useEffect, useRef, useState } from 'react'

type StudioKey = 'U' | 'I' | 'T' | 'O'

const order: StudioKey[] = ['U', 'I', 'T', 'O']

const blocks: Record<StudioKey, { left: number; top: number; width: number; height: number; color: string }> = {
  U: { left: 283, top: 699, width: 57, height: 131, color: '#7322ff' },
  I: { left: 534, top: 728, width: 19, height: 143, color: '#ffea00' },
  T: { left: 783, top: 729, width: 120, height: 31, color: '#ff9000' },
  O: { left: 1266, top: 729, width: 96, height: 101, color: '#0076ff' },
}

const letters = [
  { transform: 'translate(72 712)' },
  { transform: 'translate(256 712)', key: 'U', path: 'M111.15 77.53Q111.15 138.37 54.61 138.37Q0 138.37 0 79.11L0 0L29.06 0L29.06 79.28Q29.06 113.26 55.84 113.26Q82.18 113.26 82.18 80.51L82.18 0L111.15 0Z' },
  { transform: 'translate(382 712)', path: 'M124.23 136L89.82 136L65.41 90.87Q64.09 88.41 62.69 82L62.34 82Q61.63 85.16 59.18 91.13L34.68 136L0 136L43.64 67.96L3.78 0L39.07 0L59.35 41.62Q61.81 46.71 63.57 52.85L63.92 52.85Q65.76 47.32 68.4 41.18L90.78 0L123.18 0L82.09 67.43Z' },
  { transform: 'translate(523 712)', key: 'I', path: 'M28.97 0L28.97 136L0 136L0 0Z' },
  { transform: 'translate(684 710)', path: 'M0.53 104.04Q16.95 117.65 37.84 117.65Q49.69 117.65 55.66 113.57Q61.63 109.48 61.63 103.08Q61.63 97.54 56.89 92.63Q52.15 87.71 31.87 79.28Q0 65.76 0 39.95Q0 20.98 14.44 10.49Q28.89 0 52.68 0Q72.61 0 86.13 5.18L86.13 32.4Q72.43 23.09 54.08 23.09Q43.37 23.09 36.96 27Q30.55 30.91 30.55 37.49Q30.55 42.76 34.94 47.19Q39.33 51.63 56.63 59.18Q76.91 67.87 84.51 77.53Q92.1 87.18 92.1 100.53Q92.1 120.11 78.23 130.38Q64.36 140.65 38.81 140.65Q15.45 140.65 0.53 133.1Z' },
  { transform: 'translate(786 712)', key: 'T', path: 'M106.59 23.71L67.78 23.71L67.78 136L38.72 136L38.72 23.71L0 23.71L0 0L106.59 0Z' },
  { transform: 'translate(910 712)', path: 'M111.15 77.53Q111.15 138.37 54.61 138.37Q0 138.37 0 79.11L0 0L29.06 0L29.06 79.28Q29.06 113.26 55.84 113.26Q82.18 113.26 82.18 80.51L82.18 0L111.15 0Z' },
  { transform: 'translate(1051 712)', path: 'M0 136L0 0L46.97 0Q119.41 0 119.41 66.29Q119.41 97.81 99.12 116.9Q78.84 136 46.8 136ZM28.97 23.71L28.97 112.29L44.78 112.29Q65.41 112.29 77.17 100Q88.94 87.71 88.94 66.73Q88.94 46.45 76.65 35.08Q64.36 23.71 44.69 23.71Z' },
  { transform: 'translate(1193 712)', path: 'M28.97 0L28.97 136L0 136L0 0Z' },
  { transform: 'translate(1245 710)', key: 'O', path: 'M0 72.08Q0 40.12 18.66 20.06Q37.31 0 67.96 0Q97.11 0 114.88 19.4Q132.66 38.81 132.66 69.27Q132.66 101.06 114.18 120.85Q95.7 140.65 65.76 140.65Q36.52 140.65 18.26 121.47Q0 102.29 0 72.08ZM30.47 70.5Q30.47 90.34 40.04 102.94Q49.61 115.54 66.29 115.54Q83.32 115.54 92.8 103.47Q102.29 91.4 102.29 71.03Q102.29 49.78 93.07 37.45Q83.85 25.11 67.08 25.11Q50.05 25.11 40.26 37.75Q30.47 50.4 30.47 70.5Z' },
]

export default function StudioMark() {
  const [active, setActive] = useState<StudioKey[]>([])
  const [bloom, setBloom] = useState(false)
  const [scale, setScale] = useState(1)
  const finaleTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / 1442, window.innerHeight / 906))
    fit()
    window.addEventListener('resize', fit)
    window.addEventListener('orientationchange', fit)
    return () => {
      window.removeEventListener('resize', fit)
      window.removeEventListener('orientationchange', fit)
      window.clearTimeout(finaleTimer.current)
    }
  }, [])

  const reveal = (key: StudioKey) => {
    if (active.includes(key)) return
    const next = [...active, key]
    setActive(next)
    if (next.length === order.length) {
      finaleTimer.current = window.setTimeout(() => {
        setBloom(true)
        window.setTimeout(() => setBloom(false), 1200)
      }, 520)
    }
  }

  return (
    <div className="studio-stage" style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
      <svg className="studio-wordmark" viewBox="0 0 1442 906" aria-hidden="true">
        <g fill="#010101">
          {letters.map((letter, index) => (
            <g key={index} transform={letter.transform}>
              <g className={letter.key && active.includes(letter.key as StudioKey) ? 'studio-letter is-press' : 'studio-letter'}>
                {letter.path ? <path d={letter.path} /> : <path d="M124.5 136L124.5 53.47Q124.5 42.06 125.64 24.76L124.94 24.76Q122.3 37.84 120.72 42.23L87.18 136L64.09 136L30.11 43.11Q28.97 39.77 25.81 24.76L25.02 24.76Q26.16 41.88 26.16 59.09L26.16 136L0 136L0 0L42.14 0L71.47 82.18Q75.16 92.36 76.47 101.32L77.09 101.32Q79.81 90.17 82.71 82L112.12 0L153.12 0L153.12 136Z" />}
              </g>
            </g>
          ))}
        </g>
      </svg>
      <div className="studio-blooms" aria-hidden="true">
        {order.map((key, index) => (
          <span key={key} className={`studio-bloom studio-${key} ${bloom ? 'is-on' : ''}`} style={{ backgroundColor: blocks[key].color, animationDelay: `${index * 90}ms` }} />
        ))}
      </div>
      <div className="studio-blocks" aria-hidden="true">
        {order.map((key) => {
          const block = blocks[key]
          return <span key={key} className={`studio-block studio-${key} ${active.includes(key) ? 'is-on' : ''}`} style={{ left: block.left, top: block.top, width: block.width, height: block.height, backgroundColor: block.color }} />
        })}
      </div>
      <div className="studio-hits">
        {order.map((key) => (
          <button key={key} type="button" className={`studio-hit studio-hit-${key}`} aria-label={`激活 ${key} 色块`} onPointerEnter={() => reveal(key)} onFocus={() => reveal(key)} />
        ))}
      </div>
    </div>
  )
}