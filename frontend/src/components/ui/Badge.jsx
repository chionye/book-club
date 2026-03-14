import { cn } from '../../lib/utils'

const variants = {
  default: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  warning: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  danger: 'bg-red-500/20 text-red-300 border-red-500/30',
  info: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  gold: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  free: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
}

export default function Badge({ children, variant = 'default', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
