import 'nextra-theme-docs/style.css'

import './globals.css'
import '../styles/home.scss'
import '../components/first/first.scss'
import '../components/first/studio-mark.scss'

export const metadata = {
  title: '木犀团队官网',
  description: '木犀团队产品、组别与技术博客。',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-cn" dir="ltr" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
