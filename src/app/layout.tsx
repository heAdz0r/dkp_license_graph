import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'Выбор редакции Deckhouse Kubernetes Platform',
  description: 'Интерактивный инструмент для выбора оптимальной редакции DKP на основе ваших требований',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const currentYear = new Date().getFullYear();
  
  return (
    <html lang="ru">
      <body className={`${inter.className} bg-gray-50 min-h-screen flex flex-col`}>
        {/* Верхняя панель навигации */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto p-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              {/* Логотип и название */}
              <div className="flex items-center">
                <svg 
                  className="w-10 h-10 text-indigo-600" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M21 7.5l-9-4.5L3 7.5m18 0l-9 4.5m9-4.5v9l-9 4.5m0-13.5l-9 4.5m9-4.5v13.5m-9-9l9 4.5m-9-4.5v9l9 4.5" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
                <h1 className="ml-3 text-xl font-bold text-gray-900">
                  Лицензия Deckhouse K8s Platform
                </h1>
              </div>
              
              {/* Навигация */}
              <nav className="flex space-x-1">
                <NavLink href="/" label="Главная" />
                <NavLink href="/compare" label="Сравнение редакций" />
                <a 
                  href="https://deckhouse.ru/products/kubernetes-platform/pricing/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <svg className="w-4 h-4 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Официальный сайт
                </a>
              </nav>
            </div>
          </div>
        </header>
        
        {/* Основной контент страницы */}
        <main className="flex-grow max-w-7xl w-full mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
        
        {/* Подвал сайта */}
        <footer className="bg-gray-800 text-white py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Блок информации о проекте */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  О проекте
                </h3>
                <p className="text-gray-300 text-sm">
                  Интерактивный инструмент для выбора оптимальной редакции 
                  Deckhouse Kubernetes Platform на основе требований пользователя.
                </p>
              </div>
              
              {/* Блок полезных ссылок */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Полезные ссылки
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a 
                      href="https://deckhouse.ru/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      Официальный сайт Deckhouse
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://deckhouse.ru/products/kubernetes-platform/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      Deckhouse Kubernetes Platform
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://deckhouse.ru/products/kubernetes-platform/pricing/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      Цены и лицензирование
                    </a>
                  </li>
                </ul>
              </div>
              
              {/* Блок навигации */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Навигация
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link 
                      href="/"
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      Главная страница
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/compare"
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      Сравнение редакций
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Копирайт */}
            <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <p className="text-gray-400 text-sm">
                © {currentYear} Интерактивный инструмент для выбора лицензии DKP.
              </p>
              <div className="mt-4 sm:mt-0">
                <a 
                  href="https://github.com/heAdz0r/dkp_license_graph" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors text-sm inline-flex items-center"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
                  </svg>
                  Исходный код на GitHub
                </a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}

// Компонент для навигационных ссылок с активным состоянием
function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link 
      href={href} 
      className={`group flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100`}
    >
      {label}
      <span className="absolute h-0.5 w-0 bg-indigo-600 bottom-0.5 left-0 transition-all duration-200 group-hover:w-full"></span>
    </Link>
  );
}
