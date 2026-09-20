'use client'

import StudioMark from './studio-mark'

const assetBase = '/mengbanzu/'

const characters = [
  { className: 'character-1', file: '蒙版组 1.svg', alt: '人物素材 1' },
  { className: 'character-2', file: '蒙版组 2.svg', alt: '人物素材 2' },
  { className: 'character-3', file: '蒙版组 3.svg', alt: '人物素材 3' },
  { className: 'character-4', file: '蒙版组 4.svg', alt: '人物素材 4' },
  { className: 'character-5', file: '蒙版组 5 (1).svg', alt: '人物素材 5' },
]

export default function First() {
  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
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
      <img className="first-container-icon" src="/nav/容器.svg" alt="" aria-hidden="true" />
      {characters.map(({ className, file, alt }) => (
        <img key={className} className={className} src={`${assetBase}${encodeURI(file)}`} alt={alt} />
      ))}
      <StudioMark />
    </div>
  )
}