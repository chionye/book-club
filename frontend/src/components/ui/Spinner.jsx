import { cn } from '../../lib/utils'

export default function Spinner({ size = 'md', className }) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
    xl: 'h-16 w-16 border-4',
  }

  return (
    <div className={cn(
      'rounded-full border-white/10 border-t-purple-500 animate-spin',
      sizes[size],
      className
    )} />
  )
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="xl" />
        <p className="text-sm text-slate-400">Loading...</p>
      </div>
    </div>
  )
}
