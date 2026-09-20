import type { Metadata } from 'next'
import '@/index.css'
import '@/styles/base.scss'

export const metadata: Metadata = {
  title: '木犀团队官网',
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="App">
      {children}
      <div className="beian">
        <a href="http://www.beian.miit.gov.cn/">鄂ICP备19024133号</a>
      </div>
    </div>
  )
}
