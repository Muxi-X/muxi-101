export const metadata = {
  title: '木犀团队官网',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cn" dir="ltr" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
