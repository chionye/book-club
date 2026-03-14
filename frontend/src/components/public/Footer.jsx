import { Link } from 'react-router-dom'
import { BookOpen, Heart, Mail, Twitter, Instagram } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#080618]/80 backdrop-blur-xl mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center">
                <BookOpen size={18} className="text-white" />
              </div>
              <span className="text-xl font-black">
                <span className="gradient-text">Matty</span>
                <span className="text-white">bokks</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
              Your premier destination for premium digital books. Discover, purchase, and download exceptional titles instantly.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="#" className="w-9 h-9 rounded-xl bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/30 flex items-center justify-center text-slate-400 hover:text-purple-400 transition-all">
                <Twitter size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/30 flex items-center justify-center text-slate-400 hover:text-purple-400 transition-all">
                <Instagram size={16} />
              </a>
              <a href="mailto:hello@mattybokks.com" className="w-9 h-9 rounded-xl bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/30 flex items-center justify-center text-slate-400 hover:text-purple-400 transition-all">
                <Mail size={16} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Explore</h4>
            <ul className="space-y-2.5">
              {['Browse All Books', 'Fiction', 'Non-Fiction', 'Business', 'Self-Help'].map(item => (
                <li key={item}>
                  <Link to={`/?genre=${item.replace('Browse All Books', '')}`} className="text-sm text-slate-500 hover:text-purple-400 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'About Us', href: '#' },
                { label: 'Privacy Policy', href: '#' },
                { label: 'Terms of Service', href: '#' },
                { label: 'Contact', href: 'mailto:hello@mattybokks.com' },
                { label: 'Admin', href: '/admin/login' },
              ].map(item => (
                <li key={item.label}>
                  <a href={item.href} className="text-sm text-slate-500 hover:text-purple-400 transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-600">
            © {new Date().getFullYear()} Mattybokks. All rights reserved.
          </p>
          <p className="text-sm text-slate-600 flex items-center gap-1">
            Made with <Heart size={12} className="text-red-500 fill-red-500" /> in Nigeria
          </p>
        </div>
      </div>
    </footer>
  )
}
