import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/public/Navbar'
import Footer from './components/public/Footer'
import HomePage from './pages/public/HomePage'
import BookDetailPage from './pages/public/BookDetailPage'
import PaymentVerifyPage from './pages/public/PaymentVerifyPage'
import LoginPage from './pages/admin/LoginPage'
import AdminLayout from './components/admin/AdminLayout'
import DashboardPage from './pages/admin/DashboardPage'
import BooksPage from './pages/admin/BooksPage'
import TransactionsPage from './pages/admin/TransactionsPage'
import AnalyticsPage from './pages/admin/AnalyticsPage'
import SettingsPage from './pages/admin/SettingsPage'

// Public Layout
function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={
        <PublicLayout><HomePage /></PublicLayout>
      } />
      <Route path="/books/:id" element={
        <PublicLayout><BookDetailPage /></PublicLayout>
      } />
      <Route path="/payment/verify" element={
        <PublicLayout><PaymentVerifyPage /></PublicLayout>
      } />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/dashboard" element={
        <AdminLayout><DashboardPage /></AdminLayout>
      } />
      <Route path="/admin/books" element={
        <AdminLayout><BooksPage /></AdminLayout>
      } />
      <Route path="/admin/transactions" element={
        <AdminLayout><TransactionsPage /></AdminLayout>
      } />
      <Route path="/admin/analytics" element={
        <AdminLayout><AnalyticsPage /></AdminLayout>
      } />
      <Route path="/admin/settings" element={
        <AdminLayout><SettingsPage /></AdminLayout>
      } />

      {/* 404 */}
      <Route path="*" element={
        <PublicLayout>
          <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
            <div>
              <h1 className="text-8xl font-black gradient-text mb-4">404</h1>
              <h2 className="text-2xl font-bold text-white mb-2">Page not found</h2>
              <p className="text-slate-400 mb-6">The page you're looking for doesn't exist.</p>
              <a href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-all">
                Go Home
              </a>
            </div>
          </div>
        </PublicLayout>
      } />
    </Routes>
  )
}
