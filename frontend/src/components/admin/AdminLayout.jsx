import { useState } from 'react'
import { Link, useLocation, Navigate } from 'react-router-dom'
import {
  BookOpen, LayoutDashboard, Library, CreditCard, Settings,
  LogOut, Menu, X, TrendingUp, Bell, ChevronRight, User
} from 'lucide-react'
import { useAdmin, useLogout } from '../../hooks/useAuth'
import { PageSpinner } from '../ui/Spinner'

const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/books', label: 'Books', icon: Library },
  { path: '/admin/transactions', label: 'Transactions', icon: CreditCard },
  { path: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { data: admin, isLoading, error } = useAdmin()
  const logout = useLogout()

  if (isLoading) return <PageSpinner />
  if (error || !admin) return <Navigate to="/admin/login" replace />

  return (
    <div className="min-h-screen bg-[#080618] flex">
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 bottom-0 z-50 w-64 flex flex-col
        bg-[#0d0a1f] border-r border-white/[0.06] shadow-2xl
        transition-transform duration-300 lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-white/[0.06]">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center">
            <BookOpen size={16} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-black">
              <span className="gradient-text">Matty</span>
              <span className="text-white">bokks</span>
            </div>
            <div className="text-[10px] text-slate-600 -mt-0.5">Admin Panel</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="space-y-1">
            {navItems.map(({ path, label, icon: Icon }) => {
              const active = location.pathname === path
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    active
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/20'
                      : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Icon size={17} className={active ? 'text-purple-400' : 'text-slate-500 group-hover:text-slate-300'} />
                  {label}
                  {active && <ChevronRight size={14} className="ml-auto text-purple-500" />}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* User Profile */}
        <div className="px-3 py-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
              {admin?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{admin?.name}</div>
              <div className="text-xs text-slate-600 truncate">{admin?.email}</div>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-[#080618]/80 backdrop-blur-xl border-b border-white/[0.06]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <Menu size={20} />
          </button>

          <div className="hidden lg:block">
            <h1 className="text-sm font-medium text-slate-400">
              {navItems.find(n => n.path === location.pathname)?.label || 'Admin'}
            </h1>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Link
              to="/"
              target="_blank"
              className="text-xs text-slate-500 hover:text-purple-400 transition-colors flex items-center gap-1.5"
            >
              View Store
              <ChevronRight size={12} />
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
