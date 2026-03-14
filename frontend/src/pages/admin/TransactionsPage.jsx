import { useState } from 'react'
import { Search, Download, CreditCard, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { paymentsAPI } from '../../lib/api'
import { formatPrice, formatDateTime, formatNumber } from '../../lib/utils'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { PageSpinner } from '../../components/ui/Spinner'

export default function TransactionsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', { page, search, status }],
    queryFn: () => paymentsAPI.getTransactions({ page, limit: 20, search, status }).then(r => r.data.data),
    keepPreviousData: true,
  })

  const transactions = data?.transactions || []
  const pagination = data?.pagination || {}

  const StatusIcon = ({ status }) => {
    if (status === 'success') return <CheckCircle size={14} className="text-emerald-400" />
    if (status === 'failed') return <XCircle size={14} className="text-red-400" />
    return <Clock size={14} className="text-amber-400" />
  }

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">Transactions</h1>
        <p className="text-sm text-slate-500 mt-0.5">{pagination.total || 0} total transactions</p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              placeholder="Search by name, email or reference..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="form-input pl-10 text-sm"
            />
          </div>
          <select
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1) }}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-purple-500/50 cursor-pointer"
          >
            <option value="" className="bg-[#130f2e]">All Status</option>
            <option value="success" className="bg-[#130f2e]">Successful</option>
            <option value="pending" className="bg-[#130f2e]">Pending</option>
            <option value="failed" className="bg-[#130f2e]">Failed</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      {isLoading ? (
        <PageSpinner />
      ) : transactions.length === 0 ? (
        <Card className="p-12 text-center">
          <CreditCard size={48} className="text-slate-700 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-400 mb-1">No transactions found</h3>
          <p className="text-sm text-slate-600">Transactions will appear here after customers make purchases</p>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="px-6 py-4 text-left text-xs text-slate-500 font-medium uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs text-slate-500 font-medium uppercase tracking-wider">Book</th>
                  <th className="px-6 py-4 text-left text-xs text-slate-500 font-medium uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs text-slate-500 font-medium uppercase tracking-wider">Reference</th>
                  <th className="px-6 py-4 text-left text-xs text-slate-500 font-medium uppercase tracking-wider">Downloads</th>
                  <th className="px-6 py-4 text-left text-xs text-slate-500 font-medium uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs text-slate-500 font-medium uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {transactions.map(txn => (
                  <tr key={txn.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{txn.buyerName}</div>
                      <div className="text-xs text-slate-500">{txn.buyerEmail}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-300 max-w-[180px]">
                      <span className="truncate block">{txn.book?.title || '—'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${txn.status === 'success' ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {formatPrice(txn.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-slate-500 bg-white/5 px-2 py-1 rounded-lg">
                        {txn.paystackReference?.substring(0, 20) || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {txn.status === 'success' ? (
                        <div className="flex items-center gap-1 text-slate-400 text-xs">
                          <Download size={12} />
                          {txn.downloadCount}/{txn.maxDownloads}
                        </div>
                      ) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <StatusIcon status={txn.status} />
                        <Badge variant={txn.status === 'success' ? 'success' : txn.status === 'failed' ? 'danger' : 'warning'}>
                          {txn.status}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {formatDateTime(txn.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.06]">
              <p className="text-xs text-slate-500">Page {pagination.page} of {pagination.pages}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-xs rounded-lg bg-white/5 text-slate-400 hover:text-white border border-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="px-3 py-1.5 text-xs rounded-lg bg-white/5 text-slate-400 hover:text-white border border-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
