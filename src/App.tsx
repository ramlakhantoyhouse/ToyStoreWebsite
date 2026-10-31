import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { Toaster } from 'sonner'
import { LangProvider } from './i18n'
import { CatalogProvider } from './data/catalog'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { FloatingWhatsApp } from './components/FloatingWhatsApp'
import { SiteNotices } from './components/SiteNotices'
import { Home } from './pages/Home'
import { Products } from './pages/Products'
import { ProductDetail } from './pages/ProductDetail'
import { Seasons, SeasonDetail } from './pages/Seasons'
import { Wholesale } from './pages/Wholesale'
import { Visit } from './pages/Visit'
import { Credits } from './pages/Credits'
import { NotFound } from './pages/NotFound'

// The owner's control centre is a separate bundle; customers never download it.
const AdminApp = lazy(() => import('./admin/AdminApp'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

function Site() {
  return (
    <>
      <div className="flex min-h-dvh flex-col">
        <SiteNotices />
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path="/seasons" element={<Seasons />} />
            <Route path="/seasons/:id" element={<SeasonDetail />} />
            <Route path="/wholesale" element={<Wholesale />} />
            <Route path="/visit" element={<Visit />} />
            <Route path="/credits" element={<Credits />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <FloatingWhatsApp />
      <Toaster position="top-center" closeButton toastOptions={{ style: { fontFamily: 'Poppins, sans-serif' } }} />
    </>
  )
}

export default function App() {
  return (
    <LangProvider>
      <CatalogProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route
              path="/admin/*"
              element={
                <Suspense fallback={null}>
                  <AdminApp />
                </Suspense>
              }
            />
            <Route path="/*" element={<Site />} />
          </Routes>
        </BrowserRouter>
      </CatalogProvider>
    </LangProvider>
  )
}
