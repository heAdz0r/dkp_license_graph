import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'Выбор лицензии Deckhouse Kubernetes Platform',
  description: 'Интерактивный инструмент для выбора оптимальной лицензии DKP на основе ваших требований',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={`${inter.className} bg-gray-100 min-h-screen`}>
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Выбор лицензии Deckhouse Kubernetes Platform
              </h1>
              <nav className="flex space-x-4">
                <Link href="/" className="text-gray-600 hover:text-gray-900 font-medium">
                  Главная
                </Link>
                <Link href="/compare" className="text-gray-600 hover:text-gray-900 font-medium">
                  Сравнение редакций
                </Link>
              </nav>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
        <footer className="bg-white shadow mt-10">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Граф принятия решений для выбора лицензии DKP. 
            <a href="https://deckhouse.ru/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 ml-1">
              Deckhouse.ru
            </a>
          </div>
        </footer>
      </body>
    </html>
  )
}
