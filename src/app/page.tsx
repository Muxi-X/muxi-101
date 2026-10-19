import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import BlogSection from '@/components/blog/blog-section'
import First from '@/components/first/first'
import Intro from '@/components/intro/intro'
import Join from '@/components/join/join'
import ProductIntro from '@/views/product'

type MockBlog = {
  id: string
  title: string
  excerpt: string
}

type GroupMockBlog = {
  id: string
  group: string
  groupName: string
  title: string
  description: string
}

async function getMockBlogs(): Promise<MockBlog[]> {
  const mockBlogDirectory = path.join(process.cwd(), 'src', 'app', 'blog', 'MockBlog')
  const filenames = (await readdir(mockBlogDirectory))
    .filter((filename) => filename.endsWith('.md') && !filename.startsWith('group-'))
    .toSorted()

  return Promise.all(
    filenames.map(async (filename) => {
      const markdown = await readFile(path.join(mockBlogDirectory, filename), 'utf8')
      const frontmatter = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
      const title = frontmatter?.[1].match(/^title:\s*(.+)$/m)?.[1].trim()

      if (!title || !frontmatter) {
        throw new Error(`Invalid mock blog frontmatter: ${filename}`)
      }

      const content = markdown
        .slice(frontmatter[0].length)
        .replace(/^\s*#.+(?:\r?\n|$)/m, '')
        .replace(/\s+/g, '')
        .trim()

      return {
        id: filename.replace(/\.md$/, ''),
        title,
        excerpt: Array.from(content).slice(0, 10).join(''),
      }
    }),
  )
}

async function getGroupMockBlogs(): Promise<GroupMockBlog[]> {
  const mockBlogDirectory = path.join(process.cwd(), 'src', 'app', 'blog', 'MockBlog')
  const groups = [
    { id: 'design', name: '设计组', filename: 'group-design.md' },
    { id: 'frontend', name: '前端组', filename: 'group-frontend.md' },
    { id: 'backend', name: '后端组', filename: 'group-backend.md' },
    { id: 'product', name: '产品组', filename: 'group-product.md' },
    { id: 'operation', name: '运营组', filename: 'group-operation.md' },
  ]

  return Promise.all(
    groups.map(async (group) => {
      const markdown = await readFile(path.join(mockBlogDirectory, group.filename), 'utf8')
      const frontmatter = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
      const title = frontmatter?.[1].match(/^title:\s*(.+)$/m)?.[1].trim()
      const description = frontmatter?.[1].match(/^description:\s*(.+)$/m)?.[1].trim()

      if (!title || !description || !frontmatter) {
        throw new Error(`Invalid group mock blog frontmatter: ${group.filename}`)
      }

      return {
        id: group.id,
        group: group.id,
        groupName: group.name,
        title,
        description,
      }
    }),
  )
}

const sections = [
  { id: 'home', label: '首页' },
  { id: 'products', label: '产品', title: '产品展示', description: '了解木犀团队正在做的产品。' },
  { id: 'groups', label: '组别', title: '组别介绍', description: '认识团队里的不同组别。' },
  {
    id: 'blogs',
    label: '博客',
  },
  { id: 'join', label: '加入', title: '加入我们', description: '和我们一起做点有意思的事。' },
]

export default async function Home() {
  const [mockBlogs, groupMockBlogs] = await Promise.all([getMockBlogs(), getGroupMockBlogs()])

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
        section.id === 'products' ? (
          <section id={section.id} className="home-section home-products" key={section.id}>
            <ProductIntro />
          </section>
        ) : section.id === 'groups' ? (
          <section id={section.id} className="home-section home-member" key={section.id}>
            <Intro />
          </section>
        ) : section.id === 'blogs' ? (
          <BlogSection key={section.id} posts={mockBlogs} groupPosts={groupMockBlogs} />
          ) : section.id === 'join' ? (
            <section id={section.id} className="home-section home-join" key={section.id}>
              <Join />
            </section>
          ) : (
          <section id={section.id} className="home-section home-preview" key={section.id}>
            <div className="home-preview-content">
              <p className="home-section-label">{section.label}</p>
              <h2>{section.title}</h2>
              <p>{section.description}</p>
              <span className="home-preview-coming-soon">页面迁移中</span>
            </div>
          </section>
        ),
      )}
    </main>
  )
}
