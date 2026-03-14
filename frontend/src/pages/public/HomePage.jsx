import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BookOpen, TrendingUp, Sparkles, ChevronLeft, ChevronRight, Filter, SlidersHorizontal } from 'lucide-react'
import { useBooks, useGenres } from '../../hooks/useBooks'
import BookCard from '../../components/public/BookCard'
import { PageSpinner } from '../../components/ui/Spinner'

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Latest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'sales', label: 'Best Selling' },
  { value: 'price', label: 'Price' },
]

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const search = searchParams.get('search') || ''
  const genre = searchParams.get('genre') || ''
  const sort = searchParams.get('sort') || 'createdAt'

  const { data, isLoading } = useBooks({ page, limit: 12, search, genre, sort })
  const { data: genres } = useGenres()

  useEffect(() => { setPage(1) }, [search, genre, sort])

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    setSearchParams(params)
  }

  const books = data?.books || []
  const pagination = data?.pagination || {}

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-28 pb-16 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl" />
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-violet-800/15 blur-3xl" />
          <div className="absolute top-40 left-1/2 w-px h-40 bg-gradient-to-b from-purple-500/50 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium mb-6">
            <Sparkles size={14} />
            Premium Digital Bookstore
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-none mb-6">
            <span className="text-white">Discover Your</span><br />
            <span className="gradient-text">Next Great Read</span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            Explore our curated collection of premium digital books. Purchase instantly and download your favorites anytime, anywhere.
          </p>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-8 md:gap-16">
            {[
              { label: 'Books Available', value: pagination.total || '100+' },
              { label: 'Downloads', value: '10K+' },
              { label: 'Happy Readers', value: '5K+' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-black gradient-text">{stat.value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Books Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {search ? (
                <>Search: <span className="text-purple-400">"{search}"</span></>
              ) : genre ? (
                <><TrendingUp size={20} className="text-purple-400" /> {genre} Books</>
              ) : (
                <><BookOpen size={20} className="text-purple-400" /> All Books</>
              )}
            </h2>
            {pagination.total && (
              <p className="text-sm text-slate-500 mt-0.5">{pagination.total} books found</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Sort */}
            <select
              value={sort}
              onChange={e => updateParam('sort', e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-purple-500/50 cursor-pointer"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-[#130f2e]">{opt.label}</option>
              ))}
            </select>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm border transition-all ${
                showFilters || genre
                  ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <SlidersHorizontal size={14} />
              Filters
              {genre && <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />}
            </button>
          </div>
        </div>

        {/* Genre Filter Pills */}
        {showFilters && (
          <div className="mb-8 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] animate-fadeInUp">
            <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider">Filter by Genre</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateParam('genre', '')}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                  !genre ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white border border-white/10 hover:border-purple-500/30'
                }`}
              >
                All
              </button>
              {genres?.map(g => (
                <button
                  key={g}
                  onClick={() => updateParam('genre', g)}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                    genre === g ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white border border-white/10 hover:border-purple-500/30'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Books Grid */}
        {isLoading ? (
          <PageSpinner />
        ) : books.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen size={64} className="text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">No books found</h3>
            <p className="text-slate-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {books.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-12">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-purple-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm"
            >
              <ChevronLeft size={16} /> Prev
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const p = i + Math.max(1, page - 2)
                if (p > pagination.pages) return null
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                      page === p ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {p}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-purple-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
