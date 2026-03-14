import { useState, useEffect, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  BookOpen, Sparkles, ChevronLeft, ChevronRight, SlidersHorizontal,
  TrendingUp, Download, Shield, Zap, Star, ArrowRight, Lock,
  CheckCircle, Globe, Users, Award, Search
} from 'lucide-react'
import { useBooks, useGenres } from '../../hooks/useBooks'
import BookCard from '../../components/public/BookCard'
import { PageSpinner } from '../../components/ui/Spinner'
import { formatNumber } from '../../lib/utils'

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Latest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'sales', label: 'Best Selling' },
  { value: 'price', label: 'Price' },
]

const GENRE_ICONS = {
  Fiction: '📖', 'Non-Fiction': '📚', Mystery: '🔍', Romance: '💕',
  'Sci-Fi': '🚀', Fantasy: '🧙', Biography: '👤', History: '🏛️',
  'Self-Help': '💡', Business: '💼', Technology: '💻', Health: '🌿',
  Travel: '✈️', Children: '🧒', Poetry: '✍️', Philosophy: '🤔',
}

// ─── Floating book cover placeholder ───────────────────────────────────────
function FloatingBook({ style, colorFrom, colorTo, tilt = 0, delay = 0 }) {
  return (
    <div
      className="absolute rounded-xl shadow-2xl overflow-hidden border border-white/10"
      style={{
        ...style,
        transform: `rotate(${tilt}deg)`,
        animation: `float ${3.5 + delay * 0.5}s ease-in-out ${delay * 0.4}s infinite`,
      }}
    >
      <div className={`w-full h-full bg-gradient-to-br ${colorFrom} ${colorTo} flex items-center justify-center`}>
        <BookOpen className="text-white/30" size={28} />
      </div>
    </div>
  )
}

// ─── Hero ───────────────────────────────────────────────────────────────────
function HeroSection({ total, onBrowse }) {
  const [search, setSearch] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) onBrowse(`?search=${encodeURIComponent(search.trim())}`)
  }

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden pt-16">
      {/* Background layers */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0718] via-[#110d28] to-[#0a0718]" />
        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full bg-purple-900/25 blur-3xl" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-violet-800/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-indigo-900/20 blur-3xl" />
        {/* Mesh grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(139,92,246,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.8) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        {/* Noise texture */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'1\'/%3E%3C/svg%3E")' }}
        />
      </div>

      {/* Floating decorative books */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden lg:block pointer-events-none">
        <FloatingBook style={{ width: 110, height: 155, top: '12%', right: '18%' }} colorFrom="from-violet-700" colorTo="to-purple-500" tilt={-8} delay={0} />
        <FloatingBook style={{ width: 90, height: 128, top: '35%', right: '8%' }} colorFrom="from-pink-700" colorTo="to-rose-500" tilt={5} delay={1} />
        <FloatingBook style={{ width: 100, height: 140, top: '55%', right: '25%' }} colorFrom="from-amber-700" colorTo="to-orange-500" tilt={-4} delay={2} />
        <FloatingBook style={{ width: 80, height: 112, top: '20%', right: '38%' }} colorFrom="from-teal-700" colorTo="to-emerald-500" tilt={10} delay={3} />
        <FloatingBook style={{ width: 95, height: 135, top: '70%', right: '12%' }} colorFrom="from-blue-700" colorTo="to-indigo-500" tilt={-6} delay={4} />
        {/* Connecting lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <line x1="55%" y1="20%" x2="65%" y2="45%" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="4 6" />
          <line x1="65%" y1="45%" x2="80%" y2="65%" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="4 6" />
          <line x1="72%" y1="28%" x2="65%" y2="45%" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="4 6" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium mb-8 animate-fadeInUp">
            <Sparkles size={14} className="text-amber-400" />
            Nigeria's Premier Digital Bookstore
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] mb-6 animate-fadeInUp" style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
            <span className="text-white">Your Next</span>
            <br />
            <span className="gradient-text">Favourite Book</span>
            <br />
            <span className="text-white">Awaits You</span>
          </h1>

          <p className="text-lg text-slate-400 leading-relaxed mb-8 max-w-xl animate-fadeInUp" style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
            Discover, purchase, and instantly download premium digital books. From bestsellers to hidden gems — all in one beautiful place.
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            className="flex gap-3 mb-8 animate-fadeInUp"
            style={{ animationDelay: '0.3s', opacity: 0, animationFillMode: 'forwards' }}
          >
            <div className="relative flex-1">
              <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="search"
                placeholder="Search by title, author or genre..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white/[0.06] border border-white/10 rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/60 focus:bg-white/[0.08] transition-all text-sm"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 bg-gradient-to-r from-violet-700 to-purple-600 hover:from-violet-800 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-purple-900/30 hover:shadow-purple-900/50 text-sm whitespace-nowrap"
            >
              Search
            </button>
          </form>

          {/* CTAs */}
          <div className="flex items-center gap-4 animate-fadeInUp" style={{ animationDelay: '0.4s', opacity: 0, animationFillMode: 'forwards' }}>
            <button
              onClick={() => onBrowse()}
              className="flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-violet-700 to-purple-600 hover:from-violet-800 hover:to-purple-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-purple-900/30 hover:shadow-purple-900/50 group"
            >
              Browse Books
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 px-7 py-3.5 border border-white/10 hover:border-purple-500/40 text-slate-300 hover:text-white font-semibold rounded-2xl transition-all hover:bg-white/[0.04] text-sm"
            >
              How it works
            </a>
          </div>

          {/* Trust pills */}
          <div className="flex flex-wrap items-center gap-4 mt-10 animate-fadeInUp" style={{ animationDelay: '0.5s', opacity: 0, animationFillMode: 'forwards' }}>
            {[
              { icon: Shield, label: 'Secure Payments' },
              { icon: Zap, label: 'Instant Download' },
              { icon: Globe, label: 'Access Anywhere' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-xs text-slate-500">
                <Icon size={13} className="text-purple-400" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-white/[0.06] bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center sm:justify-between gap-8 flex-wrap">
            {[
              { value: total ? formatNumber(total) + '+' : '100+', label: 'Books Available' },
              { value: '10K+', label: 'Happy Readers' },
              { value: '50K+', label: 'Downloads' },
              { value: '4.9★', label: 'Average Rating' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <span className="text-xl font-black gradient-text-purple">{stat.value}</span>
                <span className="text-xs text-slate-600 ml-2">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── How It Works ───────────────────────────────────────────────────────────
function HowItWorksSection() {
  const steps = [
    {
      step: '01',
      icon: Search,
      title: 'Find Your Book',
      desc: 'Browse our curated collection. Search by title, author, or genre. Read descriptions and previews to find your perfect read.',
      color: 'from-violet-600 to-purple-500',
    },
    {
      step: '02',
      icon: Lock,
      title: 'Secure Checkout',
      desc: 'Pay safely with Paystack — Nigeria\'s most trusted payment gateway. Cards, bank transfers, and USSD accepted.',
      color: 'from-pink-600 to-rose-500',
    },
    {
      step: '03',
      icon: Download,
      title: 'Instant Download',
      desc: 'Get your download link immediately after payment. Download up to 5 times within 7 days, on any device.',
      color: 'from-amber-600 to-orange-500',
    },
  ]

  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-purple-900/10 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-400 text-sm mb-4">
            <Zap size={13} className="text-amber-400" />
            Simple & Fast
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Get Your Book in <span className="gradient-text">3 Easy Steps</span>
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            From discovery to download in under 2 minutes. No account needed, no complicated process.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />

          {steps.map(({ step, icon: Icon, title, desc, color }, i) => (
            <div key={step} className="relative group">
              <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent p-8 hover:border-purple-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-purple-900/20 hover:-translate-y-1 h-full">
                {/* Step number */}
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <span className="text-5xl font-black text-white/[0.06]">{step}</span>
                </div>

                <h3 className="text-lg font-bold text-white mb-3">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Genre Showcase ──────────────────────────────────────────────────────────
function GenreSection({ genres, onGenreClick }) {
  const displayGenres = genres?.slice(0, 12) || []

  const gradients = [
    'from-violet-900/60 to-purple-800/40 border-violet-500/20 hover:border-violet-500/50',
    'from-pink-900/60 to-rose-800/40 border-pink-500/20 hover:border-pink-500/50',
    'from-amber-900/60 to-orange-800/40 border-amber-500/20 hover:border-amber-500/50',
    'from-teal-900/60 to-emerald-800/40 border-teal-500/20 hover:border-teal-500/50',
    'from-blue-900/60 to-indigo-800/40 border-blue-500/20 hover:border-blue-500/50',
    'from-red-900/60 to-rose-800/40 border-red-500/20 hover:border-red-500/50',
  ]

  if (!displayGenres.length) return null

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Browse by <span className="gradient-text">Genre</span>
            </h2>
            <p className="text-slate-500 mt-2">Find exactly what you're looking for</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {displayGenres.map((genre, i) => (
            <button
              key={genre}
              onClick={() => onGenreClick(genre)}
              className={`group p-4 rounded-2xl border bg-gradient-to-br transition-all duration-300 hover:-translate-y-1 hover:shadow-lg text-left ${gradients[i % gradients.length]}`}
            >
              <div className="text-2xl mb-2">{GENRE_ICONS[genre] || '📗'}</div>
              <p className="text-sm font-semibold text-white group-hover:text-white">{genre}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Features Section ────────────────────────────────────────────────────────
function FeaturesSection() {
  const features = [
    {
      icon: Shield,
      title: 'Secure & Trusted',
      desc: 'Payments powered by Paystack with 256-bit SSL encryption. Your transaction is 100% secure.',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      icon: Zap,
      title: 'Instant Delivery',
      desc: 'Download link delivered immediately after payment. No waiting, no delays.',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      icon: Globe,
      title: 'Read Anywhere',
      desc: 'Download to your phone, tablet, or computer. Read offline in your favourite app.',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      icon: Award,
      title: 'Premium Quality',
      desc: 'Every book is hand-curated for quality. We only sell the best digital editions.',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
    },
    {
      icon: Users,
      title: 'No Account Needed',
      desc: 'Buy with just your name and email. No sign-up, no passwords to remember.',
      color: 'text-pink-400',
      bg: 'bg-pink-500/10 border-pink-500/20',
    },
    {
      icon: Download,
      title: 'Multiple Downloads',
      desc: 'Download your purchase up to 5 times within 7 days. Lose a file? No problem.',
      color: 'text-teal-400',
      bg: 'bg-teal-500/10 border-teal-500/20',
    },
  ]

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-violet-900/10 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-400 text-sm mb-4">
            <Star size={13} className="text-amber-400 fill-amber-400" />
            Why Mattybokks
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Everything You Need,<br />
            <span className="gradient-text">Nothing You Don't</span>
          </h2>
          <p className="text-slate-500 max-w-lg mx-auto">
            A clean, fast, and beautiful way to discover and own great digital books.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, desc, color, bg }) => (
            <div
              key={title}
              className="group p-6 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent hover:border-purple-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-purple-900/10"
            >
              <div className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-4 ${bg} transition-all group-hover:scale-110`}>
                <Icon size={20} className={color} />
              </div>
              <h3 className="font-bold text-white mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Testimonials ────────────────────────────────────────────────────────────
function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Adaeze Okonkwo',
      role: 'Student, UNILAG',
      text: 'I bought three books in one sitting! The download was instant and the PDFs are high quality. Mattybokks is my go-to now.',
      rating: 5,
      avatar: 'AO',
      color: 'from-violet-600 to-purple-500',
    },
    {
      name: 'Emeka Nwosu',
      role: 'Software Engineer',
      text: 'Super smooth experience. Paid with my card, got the download link immediately, and the book was exactly what I needed. 10/10.',
      rating: 5,
      avatar: 'EN',
      color: 'from-pink-600 to-rose-500',
    },
    {
      name: 'Fatima Al-Hassan',
      role: 'Entrepreneur',
      text: 'The business books collection is incredible. Love that I can download to my phone and read offline during my commute.',
      rating: 5,
      avatar: 'FA',
      color: 'from-amber-600 to-orange-500',
    },
  ]

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Loved by <span className="gradient-text">Readers</span>
          </h2>
          <p className="text-slate-500">Join thousands of happy readers across Nigeria</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map(({ name, role, text, rating, avatar, color }) => (
            <div
              key={name}
              className="p-6 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent hover:border-purple-500/20 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: rating }).map((_, i) => (
                  <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                ))}
              </div>

              <p className="text-slate-300 text-sm leading-relaxed mb-6">"{text}"</p>

              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-xs font-bold text-white`}>
                  {avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{name}</p>
                  <p className="text-xs text-slate-500">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────
function CTASection({ onBrowse }) {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden border border-purple-500/20">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900/60 via-purple-900/40 to-indigo-900/60" />
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-violet-600/20 blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl translate-x-1/2 translate-y-1/2" />
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'linear-gradient(rgba(139,92,246,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.8) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
          />

          <div className="relative px-8 py-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/70 text-sm mb-6">
              <BookOpen size={13} />
              Over {'{'}100+{'}'} books available now
            </div>

            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
              Start Reading Today
            </h2>
            <p className="text-white/60 max-w-lg mx-auto mb-8 leading-relaxed">
              Don't let another day pass without the book you've been meaning to read. Browse our collection and find your next favourite.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => onBrowse()}
                className="flex items-center gap-2 px-8 py-4 bg-white text-purple-900 font-bold rounded-2xl hover:bg-white/90 transition-all shadow-xl group"
              >
                Browse All Books
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="flex items-center gap-2 text-white/50 text-sm">
                <CheckCircle size={14} className="text-emerald-400" />
                No account required
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Books Store Section ──────────────────────────────────────────────────────
function BooksSection({ searchParams, setSearchParams }) {
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const sectionRef = useRef(null)

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
    <section id="books" ref={sectionRef} className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium mb-3">
              <Sparkles size={11} />
              Our Collection
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              {search ? (
                <>Results for <span className="gradient-text">"{search}"</span></>
              ) : genre ? (
                <><span className="gradient-text">{genre}</span> Books</>
              ) : (
                <>All <span className="gradient-text">Books</span></>
              )}
            </h2>
            {pagination.total !== undefined && (
              <p className="text-sm text-slate-500 mt-1">{formatNumber(pagination.total)} books found</p>
            )}
          </div>

          {/* Sort + Filter controls */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <select
              value={sort}
              onChange={e => updateParam('sort', e.target.value)}
              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-purple-500/50 cursor-pointer"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-[#130f2e]">{opt.label}</option>
              ))}
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border transition-all ${
                showFilters || genre
                  ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <SlidersHorizontal size={14} />
              Genre
              {genre && <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />}
            </button>
          </div>
        </div>

        {/* Genre pills */}
        {showFilters && (
          <div className="mb-8 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] animate-fadeInUp">
            <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider font-medium">Filter by Genre</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateParam('genre', '')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  !genre ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30' : 'bg-white/5 text-slate-400 hover:text-white border border-white/10 hover:border-purple-500/30'
                }`}
              >
                All
              </button>
              {genres?.map(g => (
                <button
                  key={g}
                  onClick={() => updateParam('genre', g)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    genre === g ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30' : 'bg-white/5 text-slate-400 hover:text-white border border-white/10 hover:border-purple-500/30'
                  }`}
                >
                  {GENRE_ICONS[g] && <span className="mr-1">{GENRE_ICONS[g]}</span>}{g}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Books grid */}
        {isLoading ? (
          <PageSpinner />
        ) : books.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
              <BookOpen size={36} className="text-purple-500/50" />
            </div>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">No books found</h3>
            <p className="text-slate-600 mb-4">Try adjusting your search or filters</p>
            <button
              onClick={() => { updateParam('search', ''); updateParam('genre', '') }}
              className="text-sm text-purple-400 hover:text-purple-300 underline underline-offset-4"
            >
              Clear filters
            </button>
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
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-purple-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm"
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
                      page === p ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
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
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-purple-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

// ─── Page Root ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: genreData } = useGenres()
  const { data: booksData } = useBooks({ page: 1, limit: 1 })

  const hasFilter = searchParams.get('search') || searchParams.get('genre')

  const scrollToBooks = (queryString) => {
    if (queryString) {
      const params = new URLSearchParams(queryString.replace('?', ''))
      setSearchParams(params)
    }
    setTimeout(() => {
      document.getElementById('books')?.scrollIntoView({ behavior: 'smooth' })
    }, 50)
  }

  const handleGenreClick = (genre) => {
    setSearchParams({ genre })
    setTimeout(() => {
      document.getElementById('books')?.scrollIntoView({ behavior: 'smooth' })
    }, 50)
  }

  return (
    <div className="min-h-screen">
      {/* Hero — always shown */}
      <HeroSection
        total={booksData?.pagination?.total}
        onBrowse={scrollToBooks}
      />

      {/* Landing sections — hide when filtering */}
      {!hasFilter && (
        <>
          <HowItWorksSection />
          <GenreSection genres={genreData} onGenreClick={handleGenreClick} />
          <FeaturesSection />
          <TestimonialsSection />
          <CTASection onBrowse={scrollToBooks} />
        </>
      )}

      {/* Book store grid */}
      <BooksSection searchParams={searchParams} setSearchParams={setSearchParams} />
    </div>
  )
}
