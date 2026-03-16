import { Link } from 'react-router-dom'
import { Download, Star, BookOpen, Lock } from 'lucide-react'
import { formatPrice, formatNumber } from '../../lib/utils'
import { assetURL } from '../../lib/api'

export default function BookCard({ book, featured = false }) {
  const hasImage = book.coverImage

  return (
    <Link
      to={`/books/${book.id}`}
      className={`group block book-card ${featured ? 'col-span-2' : ''}`}
    >
      <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent hover:border-purple-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-purple-900/20">
        {/* Cover Image */}
        <div className={`relative ${featured ? 'aspect-[2/1]' : 'aspect-[3/4]'} overflow-hidden bg-gradient-to-br from-violet-900/40 to-purple-900/20`}>
          {hasImage ? (
            <img
              src={assetURL(book.coverImage)}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen size={48} className="text-purple-500/40" />
            </div>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {/* Price badge */}
          <div className="absolute top-3 right-3">
            {book.isPaid ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10">
                <Lock size={11} className="text-amber-400" />
                <span className="text-xs font-bold text-amber-400">{formatPrice(book.price)}</span>
              </div>
            ) : (
              <div className="px-3 py-1.5 rounded-full bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30">
                <span className="text-xs font-bold text-emerald-400">FREE</span>
              </div>
            )}
          </div>

          {/* Genre tag */}
          {book.genre && (
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 text-purple-300">
                {book.genre}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-semibold text-white text-sm leading-snug mb-1 line-clamp-2 group-hover:text-purple-300 transition-colors">
            {book.title}
          </h3>
          <p className="text-xs text-slate-500 mb-3">by {book.author}</p>

          {/* Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Download size={11} />
                {formatNumber(book.downloadCount)}
              </span>
              {book.pages && (
                <span className="flex items-center gap-1">
                  <BookOpen size={11} />
                  {book.pages}p
                </span>
              )}
            </div>

            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={10} className={i <= 4 ? 'text-amber-400 fill-amber-400' : 'text-slate-600'} />
              ))}
            </div>
          </div>
        </div>

        {/* Hover CTA */}
        <div className="absolute inset-x-0 bottom-0 p-4 pt-12 bg-gradient-to-t from-purple-900/90 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 text-white text-sm font-medium">
            {book.isPaid ? (
              <>
                <Lock size={14} />
                Buy for {formatPrice(book.price)}
              </>
            ) : (
              <>
                <Download size={14} />
                Download Free
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
