'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import studyOutline from '@/image/product/圆形 230.svg'

type BlogPost = {
  id: string
  title: string
  excerpt: string
}

type GroupBlogPost = {
  id: string
  group: string
  groupName: string
  title: string
  description: string
}

export default function BlogSection({
  posts,
  groupPosts,
}: {
  posts: BlogPost[]
  groupPosts: GroupBlogPost[]
}) {
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isStudyMaterialsOpen, setIsStudyMaterialsOpen] = useState(false)
  const [activeGroup, setActiveGroup] = useState<string | null>(null)
  const groupHoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), {
      root: section.closest('.home'),
      threshold: 0.25,
    })
    observer.observe(section)
    return () => {
      observer.disconnect()
      if (groupHoverTimeout.current) clearTimeout(groupHoverTimeout.current)
    }
  }, [])

  const handleGroupMouseEnter = (group: string) => {
    if (groupHoverTimeout.current) clearTimeout(groupHoverTimeout.current)
    setActiveGroup(group)
  }

  const handleGroupMouseLeave = () => {
    groupHoverTimeout.current = setTimeout(() => setActiveGroup(null), 180)
  }

  return (
    <section
      id="blogs"
      className={`home-section home-blog-page${isVisible ? ' is-visible' : ''}${isStudyMaterialsOpen ? ' is-study-materials-open' : ''}`}
      ref={sectionRef}
    >
      <h1 className="home-blog-title">BLOG</h1>
      <p className="home-blog-subtitle">
        Find the articles
        <br />
        that interest you
      </p>
      <h2 className="home-blog-popular">热门文章</h2>
      <Link className="home-blog-link" href="/blog">
        进入博客
      </Link>
      <div className="home-blog-posts" aria-label="最新博客">
        {posts.slice(0, 4).map((post) => (
          <Link
            className="home-blog-post"
            href="/blog"
            key={post.id}
            aria-label={`阅读博客：${post.title}`}
          >
            <div className="home-blog-post-cover" aria-hidden="true" />
            <div className="home-blog-post-copy">
              <h3 className="home-blog-post-title">{post.title}</h3>
              <p className="home-blog-post-excerpt">{post.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
      <div className="home-blog-study-glow" aria-hidden="true" />
      <Image
        alt=""
        aria-hidden="true"
        className="home-blog-study-outline"
        height={studyOutline.height}
        src={studyOutline}
        width={studyOutline.width}
      />
      <div className="home-blog-study-zhexian-container">
        <svg
          aria-hidden="true"
          className="home-blog-study-zhexian"
          preserveAspectRatio="none"
          viewBox="0 0 824.84 522.84"
        >
          <path
            className="home-blog-study-trace"
            d="M8.16 8.15 L172.99 83.2 L253.29 220.5 L390.73 276.48 L362.15 386.73 L661.54 522.84 L824.84 439.81"
            pathLength="1"
          />
        </svg>
        <div className="home-blog-study-dot" />
        {groupPosts.map((post, index) => (
          <div
            className={`home-blog-study-group home-blog-study-group--${post.group}${activeGroup === post.group ? ' is-active' : ''}`}
            key={post.id}
            onMouseEnter={() => handleGroupMouseEnter(post.group)}
            onMouseLeave={handleGroupMouseLeave}
          >
            <button
              aria-label={`${post.groupName}最新博客：${post.title}`}
              aria-describedby={`home-blog-study-card-${post.id}`}
              className={`home-blog-study-circle home-blog-study-circle${index + 1}`}
              disabled={!isStudyMaterialsOpen}
              type="button"
            />
            <article
              aria-label={`${post.groupName}最新博客`}
              className="home-blog-study-card"
              id={`home-blog-study-card-${post.id}`}
            >
              <span className="home-blog-study-card-kicker">
                {post.groupName} <span>· LATEST STORY</span>
              </span>
              <h3>{post.title}</h3>
              <p>{post.description}</p>
              <Link href="/blog" className="home-blog-study-card-link">
                阅读更多 <span aria-hidden="true">↗</span>
              </Link>
            </article>
          </div>
        ))}
        <div className="home-blog-study-circle6" />
        <div className="home-blog-study-design-label">设计组</div>
        <div className="home-blog-study-design-en">Design</div>
        <div className="home-blog-study-frontend-label">前端组</div>
        <div className="home-blog-study-frontend-en">Frontend</div>
        <div className="home-blog-study-backend-label">后端组</div>
        <div className="home-blog-study-backend-en">Backend</div>
        <div className="home-blog-study-product-label">产品组</div>
        <div className="home-blog-study-product-en">Product</div>
        <div className="home-blog-study-operation-label">运营组</div>
        <div className="home-blog-study-operation-en">Operation</div>
      </div>
      <button
        aria-expanded={isStudyMaterialsOpen}
        className="home-blog-materials"
        onClick={() => setIsStudyMaterialsOpen((isOpen) => !isOpen)}
        type="button"
      >
        <span className="home-blog-materials-study">Study</span>{' '}
        <span className="home-blog-materials-label">Materials</span>
      </button>
    </section>
  )
}
