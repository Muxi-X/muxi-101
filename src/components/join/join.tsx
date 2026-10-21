'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import arrow from '@/image/join/arrow.svg'
import './join.scss'

export default function Join() {
  const joinRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = joinRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { root: element.closest('.home'), threshold: 0.2 },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={joinRef} className={`join-web${isVisible ? ' is-visible' : ''}`}>
      <div className="join-container">
        <a className="join-signup" href="https://fresh.muxixyz.com/join">
          <span>立即报名</span>
          <Image className="join-signup-arrow" src={arrow} alt="" aria-hidden="true" />
        </a>
      </div>
      <div className="join-accent" aria-hidden="true" />
      <div className="join-accent join-accent-dark" aria-hidden="true" />
      <div className="join-accent join-accent-blue" aria-hidden="true" />
      <div className="join-accent join-accent-orange" aria-hidden="true" />
      <div className="join-word join-word-join">
        <span>JOIN</span>
      </div>
      <div className="join-word join-word-us">US</div>
    </div>
  )
}
