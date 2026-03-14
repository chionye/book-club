import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Lock, Shield, Eye, EyeOff, Save, CheckCircle } from 'lucide-react'
import { useAdmin, useChangePassword, useUpdateProfile } from '../../hooks/useAuth'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/(?=.*[a-z])/, 'Must contain lowercase letter')
    .regex(/(?=.*[A-Z])/, 'Must contain uppercase letter')
    .regex(/(?=.*\d)/, 'Must contain a number'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

function ProfileSection() {
  const { data: admin } = useAdmin()
  const updateProfile = useUpdateProfile()
  const [showPw, setShowPw] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: admin?.name || '', email: admin?.email || '' },
  })

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
          <User size={18} className="text-purple-400" />
        </div>
        <div>
          <h2 className="font-semibold text-white">Profile Information</h2>
          <p className="text-xs text-slate-500">Update your admin profile details</p>
        </div>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center text-xl font-black text-white">
          {admin?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-white">{admin?.name}</p>
          <p className="text-sm text-slate-500">{admin?.email}</p>
          <p className="text-xs text-purple-400 mt-1 capitalize">{admin?.role?.replace('_', ' ')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(d => updateProfile.mutate(d))} className="space-y-4">
        <Input label="Full Name" placeholder="Your name" error={errors.name?.message} {...register('name')} />
        <Input label="Email Address" type="email" placeholder="admin@mattybokks.com" error={errors.email?.message} {...register('email')} />
        <Button type="submit" leftIcon={<Save size={15} />} loading={updateProfile.isPending}>
          Save Profile
        </Button>
      </form>
    </Card>
  )
}

function SecuritySection() {
  const changePassword = useChangePassword()
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(passwordSchema),
  })

  const onSubmit = async (data) => {
    await changePassword.mutateAsync({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    })
    reset()
  }

  const requirements = [
    { text: 'At least 8 characters', regex: /.{8,}/ },
    { text: 'One uppercase letter', regex: /[A-Z]/ },
    { text: 'One lowercase letter', regex: /[a-z]/ },
    { text: 'One number', regex: /\d/ },
  ]

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
          <Lock size={18} className="text-amber-400" />
        </div>
        <div>
          <h2 className="font-semibold text-white">Security</h2>
          <p className="text-xs text-slate-500">Change your admin password</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Current Password"
          type={showCurrent ? 'text' : 'password'}
          placeholder="Current password"
          error={errors.currentPassword?.message}
          rightIcon={
            <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="hover:text-white transition-colors">
              {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          {...register('currentPassword')}
        />

        <Input
          label="New Password"
          type={showNew ? 'text' : 'password'}
          placeholder="New password"
          error={errors.newPassword?.message}
          rightIcon={
            <button type="button" onClick={() => setShowNew(!showNew)} className="hover:text-white transition-colors">
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          {...register('newPassword')}
        />

        <Input
          label="Confirm New Password"
          type={showConfirm ? 'text' : 'password'}
          placeholder="Confirm new password"
          error={errors.confirmPassword?.message}
          rightIcon={
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="hover:text-white transition-colors">
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          {...register('confirmPassword')}
        />

        {/* Password requirements */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <p className="text-xs text-slate-500 mb-2">Password requirements:</p>
          <div className="grid grid-cols-2 gap-1.5">
            {requirements.map(req => (
              <div key={req.text} className="flex items-center gap-1.5 text-xs text-slate-600">
                <CheckCircle size={11} className="text-slate-700 flex-shrink-0" />
                {req.text}
              </div>
            ))}
          </div>
        </div>

        <Button type="submit" leftIcon={<Shield size={15} />} loading={changePassword.isPending}>
          Change Password
        </Button>
      </form>
    </Card>
  )
}

function StoreInfoSection() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
          <CheckCircle size={18} className="text-emerald-400" />
        </div>
        <div>
          <h2 className="font-semibold text-white">Store Information</h2>
          <p className="text-xs text-slate-500">Your store configuration details</p>
        </div>
      </div>

      <div className="space-y-3">
        {[
          { label: 'Store Name', value: 'Mattybokks' },
          { label: 'Domain', value: 'mattybokks.com' },
          { label: 'Payment Provider', value: 'Paystack' },
          { label: 'Currency', value: 'NGN (₦)' },
          { label: 'Max Downloads per Purchase', value: '5 downloads' },
          { label: 'Download Link Expiry', value: '7 days' },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
            <span className="text-sm text-slate-500">{label}</span>
            <span className="text-sm font-medium text-white">{value}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-fadeInUp max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-white">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your admin account and store configuration</p>
      </div>

      <ProfileSection />
      <SecuritySection />
      <StoreInfoSection />
    </div>
  )
}
