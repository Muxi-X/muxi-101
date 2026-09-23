import Link from 'next/link'
import First from '@/components/first/first'
import Intro from '@/components/intro/intro'

const sections = [
  { id: 'home', label: '首页' },
  { id: 'products', label: '产品', title: '产品展示', description: '了解木犀团队正在做的产品。' },
  { id: 'groups', label: '组别', title: '组别介绍', description: '认识团队里的不同组别。' },
  {
    id: 'blogs',
    label: '博客',
    title: '优质博客',
    description: '阅读木犀团队的技术分享与思考。',
    route: '/blog',
  },
  { id: 'join', label: '加入', title: '加入我们', description: '和我们一起做点有意思的事。' },
]

export default function Home() {
  return (
    <main className="home">
      <nav className="home-pagination" aria-label="首页分页">
        {sections.map((section) => (
          <a key={section.id} href={`#${section.id}`} aria-label={`跳转到${section.label}`}>
            <span />
          </a>
        ))}
      </nav>

      <section id="home" className="home-section home-hero">
        <First />
      </section>

      {sections.slice(1).map((section) =>
        section.id === 'groups' ? (
          <section id={section.id} className="home-section home-member" key={section.id}>
            <Intro />
          </section>
        ) : (
          <section id={section.id} className="home-section home-preview" key={section.id}>
            <div className="home-preview-content">
              <p className="home-section-label">{section.label}</p>
              <h2>{section.title}</h2>
              <p>{section.description}</p>
              {section.route ? (
                <Link href={section.route}>查看博客</Link>
              ) : (
                <span className="home-preview-coming-soon">页面迁移中</span>
              )}
            </div>
          </section>
        ),
      )}
    </main>
  )
}
