import 'nextra-theme-docs/style.css'

import './globals.css'

export const metadata = {
  // Define your metadata here
  // For more information on metadata API, see: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-cn" dir="ltr" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
