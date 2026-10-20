'use client'

import StudioMark from './studio-mark'

const assetBase = '/hero/'

const characters = [
  { className: 'character-1', file: 'design.svg', alt: '设计组角色立绘' },
  { className: 'character-2', file: 'operations.svg', alt: '运营组角色立绘' },
  { className: 'character-3', file: 'frontend.svg', alt: '前端组角色立绘' },
  { className: 'character-4', file: 'backend.svg', alt: '后端组角色立绘' },
  { className: 'character-5', file: 'product.svg', alt: '产品组角色立绘' },
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
      <img className="first-container-icon" src="/nav/lightbulb.svg" alt="" aria-hidden="true" />
      {characters.map(({ className, file, alt }) => (
        <img key={className} className={className} src={`${assetBase}${file}`} alt={alt} />
      ))}
      <StudioMark />
    </div>
  )
}