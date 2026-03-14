import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Lock, Shield, CreditCard, CheckCircle, Download, ExternalLink } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { paymentsAPI, downloadURL } from '../../lib/api'
import { formatPrice } from '../../lib/utils'
import Button from '../ui/Button'
import Input from '../ui/Input'
import toast from 'react-hot-toast'

const schema = z.object({
  buyerName: z.string().min(2, 'Name must be at least 2 characters'),
  buyerEmail: z.string().email('Please enter a valid email'),
})

export default function PaymentModal({ book, onClose }) {
  const [step, setStep] = useState('form') // form | processing | success
  const [downloadToken, setDownloadToken] = useState(null)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const initPayment = useMutation({
    mutationFn: (data) => paymentsAPI.initialize({ ...data, bookId: book.id }),
    onSuccess: (res) => {
      // Redirect to Paystack
      window.location.href = res.data.data.authorizationUrl
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Payment initialization failed')
    },
  })

  const onSubmit = (data) => {
    initPayment.mutate(data)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-[#130f2e] border border-white/10 rounded-2xl shadow-2xl animate-scaleIn overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-purple-400 mb-1">
                <Lock size={13} />
                Secure Checkout
              </div>
              <h2 className="text-lg font-bold text-white line-clamp-1">{book.title}</h2>
              <p className="text-sm text-slate-500">by {book.author}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all">
              <X size={18} />
            </button>
          </div>
        </div>

        {step === 'form' && (
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            {/* Price summary */}
            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 flex items-center justify-between">
              <span className="text-sm text-slate-400">Total amount</span>
              <span className="text-2xl font-black gradient-text">{formatPrice(book.price)}</span>
            </div>

            <Input
              label="Full Name"
              placeholder="John Doe"
              error={errors.buyerName?.message}
              {...register('buyerName')}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="john@example.com"
              error={errors.buyerEmail?.message}
              {...register('buyerEmail')}
            />

            <p className="text-xs text-slate-500 leading-relaxed">
              Your download link will be sent to this email and shown on the next page after payment.
            </p>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={initPayment.isPending}
              leftIcon={<CreditCard size={16} />}
            >
              Pay {formatPrice(book.price)} with Paystack
            </Button>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Shield size={12} className="text-emerald-500" />
                256-bit SSL
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <CheckCircle size={12} className="text-emerald-500" />
                Instant Download
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Lock size={12} className="text-emerald-500" />
                Secure
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
