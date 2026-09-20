'use client'

import dynamic from 'next/dynamic'

// Загружаем админку динамически и полностью отключаем серверный рендеринг (ssr: false)
const AdminContent = dynamic(() => import('./AdminContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-gray-400">
      Загрузка интерфейса панели...
    </div>
  ),
})

export default function AdminPage() {
  return <AdminContent />
}
