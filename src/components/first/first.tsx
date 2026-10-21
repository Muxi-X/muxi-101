'use client'

import Image from 'next/image'
import StudioMark from './studio-mark'
import lightbulbIcon from '@/assets/svgs/nav/lightbulb.svg'
import heroDesign from '@/assets/svgs/hero/design.svg'
import heroOperations from '@/assets/svgs/hero/operations.svg'
import heroFrontend from '@/assets/svgs/hero/frontend.svg'
import heroBackend from '@/assets/svgs/hero/backend.svg'
import heroProduct from '@/assets/svgs/hero/product.svg'

const characters = [
  { className: 'character-1', src: heroDesign, alt: '设计组角色立绘' },
  { className: 'character-2', src: heroOperations, alt: '运营组角色立绘' },
  { className: 'character-3', src: heroFrontend, alt: '前端组角色立绘' },
  { className: 'character-4', src: heroBackend, alt: '后端组角色立绘' },
  { className: 'character-5', src: heroProduct, alt: '产品组角色立绘' },
]

export default function First() {
  const scrollToSection = (sectionId: string) => {
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    window.history.pushState(null, '', `#${sectionId}`)
    document.getElementById(sectionId)?.scrollIntoView({ behavior })
  }

  return (
    <div className="first">
      <div className="first-top-nav-wrap">
        <nav className="first-top-nav" aria-label="首页导航">
          <button type="button" onClick={() => scrollToSection('products')}>
            产品展示
          </button>
          <button type="button" onClick={() => scrollToSection('groups')}>
            组别介绍
          </button>
          <button type="button" onClick={() => scrollToSection('blogs')}>
            优质博客
          </button>
          <button type="button" onClick={() => scrollToSection('join')}>
            加入我们
          </button>
        </nav>
      </div>
      <div className="first-logo" role="img" aria-label="木犀 Logo" />
      <div className="first-brand-name">MUXI STUDIO</div>
      <Image className="first-container-icon" src={lightbulbIcon} alt="" aria-hidden="true" priority />
      {characters.map(({ className, src, alt }) => (
        <Image key={className} className={className} src={src} alt={alt} priority />
      ))}
      <StudioMark />
    </div>
  )
}