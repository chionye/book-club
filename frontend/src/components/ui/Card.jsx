import { cn } from '../../lib/utils'

export default function Card({ children, className, hover = false, glow = false, ...props }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.02] backdrop-blur-sm',
        hover && 'hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-900/20 transition-all duration-300',
        glow && 'shadow-lg shadow-purple-900/10',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
