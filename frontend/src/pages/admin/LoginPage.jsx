import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react'
import { useState } from 'react'
import { useLogin } from '../../hooks/useAuth'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { mutate: login, isPending } = useLogin()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (token) window.location.href = '/admin/dashboard'
  }, [])

  const onSubmit = (data) => login(data)

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0718] via-[#130f2e] to-[#0a0718]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-purple-900/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-violet-900/15 blur-3xl" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(139,92,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.5) 1px, transparent 1px)', backgroundSize: '50px 50px' }}
        />
      </div>

      <div className="relative w-full max-w-md animate-fadeInUp">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center shadow-xl shadow-purple-900/40">
              <BookOpen size={24} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-black">
            <span className="gradient-text">Matty</span>
            <span className="text-white">bokks</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Admin Dashboard</p>
        </div>

        {/* Card */}
        <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-8">
          {/* Subtle gradient border */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/10 to-transparent pointer-events-none" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-6">
              <Shield size={16} className="text-purple-400" />
              <h2 className="text-sm font-medium text-slate-400">Sign in to continue</h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                placeholder="admin@mattybokks.com"
                leftIcon={<Mail size={16} />}
                error={errors.email?.message}
                autoComplete="email"
                {...register('email')}
              />

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                leftIcon={<Lock size={16} />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                error={errors.password?.message}
                autoComplete="current-password"
                {...register('password')}
              />

              <Button
                type="submit"
                size="lg"
                className="w-full mt-2"
                loading={isPending}
              >
                Sign In
              </Button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Protected admin area · Mattybokks.com
        </p>
      </div>
    </div>
  )
}
