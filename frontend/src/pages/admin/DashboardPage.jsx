import { TrendingUp, TrendingDown, BookOpen, ShoppingCart, Download, DollarSign, Users, ArrowUpRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { analyticsAPI } from '../../lib/api'
import { formatPrice, formatNumber, formatDateTime, getPercentChange } from '../../lib/utils'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { PageSpinner } from '../../components/ui/Spinner'
import { Link } from 'react-router-dom'

function StatCard({ title, value, subtitle, icon: Icon, change, color = 'purple' }) {
  const isPositive = change >= 0
  const colors = {
    purple: 'from-violet-600/20 to-purple-600/10 border-purple-500/20 text-purple-400',
    emerald: 'from-emerald-600/20 to-teal-600/10 border-emerald-500/20 text-emerald-400',
    amber: 'from-amber-600/20 to-yellow-600/10 border-amber-500/20 text-amber-400',
    blue: 'from-blue-600/20 to-indigo-600/10 border-blue-500/20 text-blue-400',
  }

  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-6 ${colors[color]}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{title}</p>
          <p className="text-3xl font-black text-white">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl bg-current/20 flex items-center justify-center`}>
          <Icon size={22} className="text-current" />
        </div>
      </div>
      {change !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(change)}% vs last month
        </div>
      )}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-dark rounded-xl p-3 text-sm">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="font-semibold text-white">
          {p.name === 'revenue' ? formatPrice(p.value) : p.value + ' sales'}
        </p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => analyticsAPI.getDashboard().then(r => r.data.data),
    refetchInterval: 1000 * 60 * 5,
  })

  if (isLoading) return <PageSpinner />

  const { overview, salesTrend, topBooks, recentPurchases } = data || {}

  const salesChange = getPercentChange(overview?.monthSales, overview?.lastMonthSales)
  const revenueChange = getPercentChange(parseFloat(overview?.monthRevenue), parseFloat(overview?.lastMonthRevenue))

  const chartData = salesTrend?.map(d => ({
    date: new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    sales: parseInt(d.sales),
    revenue: parseFloat(d.revenue),
  })) || []

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatPrice(overview?.totalRevenue || 0)}
          subtitle={`${formatPrice(overview?.monthRevenue || 0)} this month`}
          icon={DollarSign}
          change={revenueChange}
          color="emerald"
        />
        <StatCard
          title="Total Sales"
          value={formatNumber(overview?.totalSales || 0)}
          subtitle={`${overview?.monthSales || 0} this month`}
          icon={ShoppingCart}
          change={salesChange}
          color="purple"
        />
        <StatCard
          title="Books Published"
          value={formatNumber(overview?.totalBooks || 0)}
          subtitle="Active in store"
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          title="Total Downloads"
          value={formatNumber(overview?.totalDownloads || 0)}
          subtitle="All time"
          icon={Download}
          color="amber"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <Card className="xl:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-white">Sales Overview</h2>
              <p className="text-xs text-slate-500 mt-0.5">Last 7 days</p>
            </div>
            <Link to="/admin/analytics" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
              View all <ArrowUpRight size={12} />
            </Link>
          </div>

          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: '#6b6288', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b6288', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={2} fill="url(#salesGrad)" name="sales" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-slate-600 text-sm">
              No sales data yet
            </div>
          )}
        </Card>

        {/* Top Books */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Top Books</h2>
            <Link to="/admin/books" className="text-xs text-purple-400 hover:text-purple-300">View all</Link>
          </div>

          <div className="space-y-3">
            {topBooks?.length ? topBooks.map((book, i) => (
              <div key={book.id} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-xs font-bold text-purple-400">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{book.title}</p>
                  <p className="text-xs text-slate-500">{book.salesCount} sales</p>
                </div>
                <span className="text-xs font-semibold text-emerald-400">{formatPrice(book.totalRevenue)}</span>
              </div>
            )) : (
              <p className="text-sm text-slate-600 text-center py-8">No sales yet</p>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Recent Transactions</h2>
          <Link to="/admin/transactions" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
            View all <ArrowUpRight size={12} />
          </Link>
        </div>

        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="px-2 pb-3 text-xs text-slate-500 font-medium">Customer</th>
                <th className="px-2 pb-3 text-xs text-slate-500 font-medium">Book</th>
                <th className="px-2 pb-3 text-xs text-slate-500 font-medium">Amount</th>
                <th className="px-2 pb-3 text-xs text-slate-500 font-medium">Status</th>
                <th className="px-2 pb-3 text-xs text-slate-500 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {recentPurchases?.length ? recentPurchases.map(txn => (
                <tr key={txn.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-2 py-3">
                    <div className="font-medium text-white">{txn.buyerName}</div>
                    <div className="text-xs text-slate-500">{txn.buyerEmail}</div>
                  </td>
                  <td className="px-2 py-3 text-slate-300 max-w-[180px] truncate">
                    {txn.book?.title}
                  </td>
                  <td className="px-2 py-3">
                    <span className="font-semibold text-emerald-400">{formatPrice(txn.amount)}</span>
                  </td>
                  <td className="px-2 py-3">
                    <Badge variant={txn.status === 'success' ? 'success' : txn.status === 'failed' ? 'danger' : 'warning'}>
                      {txn.status}
                    </Badge>
                  </td>
                  <td className="px-2 py-3 text-slate-500 text-xs">
                    {formatDateTime(txn.createdAt)}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-2 py-8 text-center text-slate-600">No transactions yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
