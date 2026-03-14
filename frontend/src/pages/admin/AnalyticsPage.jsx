import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { analyticsAPI } from '../../lib/api'
import { formatPrice, formatNumber } from '../../lib/utils'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, PieChart, Pie, Cell
} from 'recharts'
import Card from '../../components/ui/Card'
import { PageSpinner } from '../../components/ui/Spinner'

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-dark rounded-xl p-3 text-sm">
      <p className="text-slate-400 mb-1 text-xs">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name === 'revenue' || p.name === 'Revenue' ? formatPrice(p.value) : `${p.value} ${p.name}`}
        </p>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState(30)

  const { data: dashboard } = useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => analyticsAPI.getDashboard().then(r => r.data.data),
  })

  const { data: chartData, isLoading } = useQuery({
    queryKey: ['analytics', 'chart', period],
    queryFn: () => analyticsAPI.getSalesChart(period).then(r => r.data.data),
  })

  const processedChart = chartData?.map(d => ({
    date: new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    sales: parseInt(d.sales || 0),
    revenue: parseFloat(d.revenue || 0),
  })) || []

  const genreData = dashboard?.revenueByGenre?.map((g, i) => ({
    name: g['book.genre'] || 'Other',
    value: parseFloat(g.revenue || 0),
  })).filter(g => g.value > 0) || []

  if (isLoading && !dashboard) return <PageSpinner />

  return (
    <div className="space-y-6 animate-fadeInUp">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">Detailed insights about your book store</p>
        </div>
        <div className="flex items-center gap-2">
          {[7, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setPeriod(d)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                period === d ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Sales & Revenue Chart */}
      <Card className="p-6">
        <h2 className="font-semibold text-white mb-6">Sales & Revenue Trend</h2>
        {processedChart.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={processedChart}>
              <defs>
                <linearGradient id="salesG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="revenueG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: '#6b6288', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fill: '#6b6288', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#6b6288', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={(v) => <span className="text-slate-400 text-xs capitalize">{v}</span>} />
              <Area yAxisId="left" type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={2} fill="url(#salesG)" name="sales" />
              <Area yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#revenueG)" name="revenue" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-slate-600 text-sm">
            No data for this period
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Books Bar Chart */}
        <Card className="p-6">
          <h2 className="font-semibold text-white mb-6">Top Books by Sales</h2>
          {dashboard?.topBooks?.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dashboard.topBooks.map(b => ({
                name: b.title.length > 15 ? b.title.substring(0, 15) + '...' : b.title,
                sales: b.salesCount,
                revenue: parseFloat(b.totalRevenue),
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fill: '#6b6288', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b6288', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="sales" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Sales" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-slate-600 text-sm">No data yet</div>
          )}
        </Card>

        {/* Revenue by Genre Pie Chart */}
        <Card className="p-6">
          <h2 className="font-semibold text-white mb-6">Revenue by Genre</h2>
          {genreData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="60%" height={250}>
                <PieChart>
                  <Pie
                    data={genreData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {genreData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatPrice(v)} contentStyle={{ background: '#130f2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {genreData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-xs text-slate-400 truncate">{d.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-white">{formatPrice(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-slate-600 text-sm">No genre data yet</div>
          )}
        </Card>
      </div>
    </div>
  )
}
