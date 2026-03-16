import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, BookOpen, Download, Lock, Star, Globe, Hash, FileText, User, ChevronRight, Sparkles, Crown } from 'lucide-react'
import { useBook } from '../../hooks/useBooks'
import { formatPrice, formatNumber, formatFileSize, formatDate } from '../../lib/utils'
import { PageSpinner } from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import PaymentModal from '../../components/public/PaymentModal'
import { freeDownloadURL, assetURL } from '../../lib/api'

export default function BookDetailPage() {
  const { id } = useParams()
  const { data: book, isLoading } = useBook(id)
  const [showPayment, setShowPayment] = useState(false)

  if (isLoading) return <PageSpinner />

  // tags may arrive as a JSON string from MySQL
  const tags = Array.isArray(book?.tags)
    ? book.tags
    : (() => { try { return JSON.parse(book?.tags || '[]') } catch { return [] } })()

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen size={64} className="text-slate-700 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Book not found</h2>
          <Link to="/" className="text-purple-400 hover:text-purple-300">Back to store</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-purple-900/10 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-purple-400 transition-colors mb-8">
          <ArrowLeft size={16} />
          Back to Store
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Cover + Buy Card */}
          <div className="lg:col-span-2">
            {/* Cover */}
            <div className={`relative rounded-2xl overflow-hidden aspect-[3/4] bg-gradient-to-br from-violet-900/40 to-purple-900/20 border mb-6 shadow-2xl ${
              book.isPremium
                ? 'border-amber-500/40 shadow-amber-900/30'
                : 'border-white/10 shadow-purple-900/30'
            }`}>
              {book.coverImage ? (
                <img src={assetURL(book.coverImage)} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen size={80} className="text-purple-500/30" />
                </div>
              )}
            </div>

            {/* Buy Card */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-6">
              <div className="text-center mb-6">
                {book.isPaid ? (
                  <>
                    <div className="text-4xl font-black gradient-text mb-1">{formatPrice(book.price)}</div>
                    <p className="text-xs text-slate-500">One-time purchase · Instant download</p>
                  </>
                ) : (
                  <>
                    <div className="text-4xl font-black text-emerald-400 mb-1">FREE</div>
                    <p className="text-xs text-slate-500">Download instantly, no payment needed</p>
                  </>
                )}
              </div>

              {book.isPaid ? (
                <Button
                  size="lg"
                  className="w-full mb-3"
                  leftIcon={<Lock size={16} />}
                  onClick={() => setShowPayment(true)}
                >
                  Buy & Download
                </Button>
              ) : (
                <a
                  href={freeDownloadURL(book.id)}
                  className="flex items-center justify-center gap-2 w-full py-3.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-emerald-900/30 mb-3"
                >
                  <Download size={18} />
                  Download Free
                </a>
              )}

              <div className="flex items-center gap-3 text-xs text-slate-600">
                <span className="flex items-center gap-1">✓ Instant delivery</span>
                <span className="flex items-center gap-1">✓ Secure payment</span>
              </div>

              {/* Book Meta */}
              <div className="mt-6 pt-6 border-t border-white/[0.06] space-y-3">
                {[
                  { icon: FileText, label: 'Format', value: book.fileType || 'PDF' },
                  { icon: Globe, label: 'Language', value: book.language || 'English' },
                  book.pages && { icon: BookOpen, label: 'Pages', value: `${book.pages} pages` },
                  book.fileSize && { icon: Hash, label: 'File Size', value: formatFileSize(book.fileSize) },
                ].filter(Boolean).map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-500">
                      <Icon size={13} />
                      {label}
                    </span>
                    <span className="text-slate-300 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-3">
            {/* Tags */}
            <div className="flex items-center flex-wrap gap-2 mb-4">
              {book.isPremium && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold shadow-sm shadow-amber-900/20">
                  <Crown size={11} />
                  Premium
                </span>
              )}
              {book.genre && <Badge variant="default">{book.genre}</Badge>}
              {!book.isPaid && <Badge variant="free">FREE</Badge>}
              {book.isbn && <Badge variant="info">ISBN: {book.isbn}</Badge>}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-3">
              {book.title}
            </h1>

            {/* Author */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                <User size={14} className="text-purple-400" />
              </div>
              <span className="text-slate-300 font-medium">{book.author}</span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={16} className={i <= 4 ? 'text-amber-400 fill-amber-400' : 'text-slate-600'} />
                ))}
              </div>
              <span className="text-sm text-slate-400">4.0 · {formatNumber(book.downloadCount)} downloads</span>
            </div>

            {/* Description */}
            {book.description && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Sparkles size={16} className="text-purple-400" />
                  About this book
                </h2>
                <p className="text-slate-400 leading-relaxed whitespace-pre-line">{book.description}</p>
              </div>
            )}

            {/* Preview Text */}
            {book.previewText && (
              <div className="mb-8 p-5 rounded-2xl bg-purple-500/5 border border-purple-500/10">
                <h3 className="text-sm font-semibold text-purple-400 mb-3 uppercase tracking-wider">Preview</h3>
                <p className="text-sm text-slate-400 leading-relaxed line-clamp-6">{book.previewText}</p>
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-slate-400">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              {[
                { label: 'Downloads', value: formatNumber(book.downloadCount) },
                { label: 'Sales', value: formatNumber(book.salesCount) },
                { label: 'Added', value: formatDate(book.createdAt) },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <div className="text-xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal book={book} onClose={() => setShowPayment(false)} />
      )}
    </div>
  )
}
