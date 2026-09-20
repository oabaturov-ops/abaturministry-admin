import React from 'react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-[#0a0a0a]">
        {children}
      </body>
    </html>
  )
}
