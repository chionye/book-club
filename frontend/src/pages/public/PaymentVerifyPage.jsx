import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, XCircle, Download, Loader, BookOpen, Mail, ArrowLeft } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { paymentsAPI, downloadURL } from '../../lib/api'
import Button from '../../components/ui/Button'

export default function PaymentVerifyPage() {
  const [searchParams] = useSearchParams()
  const reference = searchParams.get('ref') || searchParams.get('reference') || searchParams.get('trxref')

  const { data, isLoading, error } = useQuery({
    queryKey: ['verify-payment', reference],
    queryFn: () => paymentsAPI.verify(reference).then(r => r.data.data),
    enabled: !!reference,
    retry: 2,
    staleTime: Infinity,
  })

  if (!reference) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <XCircle size={64} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Invalid Link</h2>
          <p className="text-slate-400 mb-6">No payment reference found.</p>
          <Link to="/">
            <Button>Back to Store</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-purple-500 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Verifying Payment</h2>
          <p className="text-slate-400 text-sm">Please wait while we confirm your payment...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <XCircle size={64} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
          <p className="text-slate-400 mb-6">Could not verify your payment. Please contact support.</p>
          <Link to="/">
            <Button>Back to Store</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (data.status === 'success' && data.downloadToken) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-emerald-900/10 blur-3xl" />
        </div>

        <div className="relative w-full max-w-lg text-center">
          {/* Success icon */}
          <div className="relative inline-flex mb-6">
            <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center animate-scaleIn">
              <CheckCircle size={48} className="text-emerald-400" />
            </div>
            <div className="absolute inset-0 w-24 h-24 rounded-full bg-emerald-500/10 animate-ping" />
          </div>

          <h1 className="text-3xl font-black text-white mb-2">Payment Successful! 🎉</h1>
          <p className="text-slate-400 mb-2">
            Thank you for your purchase of <strong className="text-white">{data.book?.title}</strong>
          </p>
          <p className="text-sm text-slate-500 mb-8">
            Your download link is ready. Download now or check your email.
          </p>

          {/* Download card */}
          <div className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <BookOpen size={24} className="text-emerald-400" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-white">{data.book?.title}</div>
                <div className="text-sm text-slate-500">Ready to download</div>
              </div>
            </div>

            <a
              href={downloadURL(data.downloadToken)}
              className="flex items-center justify-center gap-2 w-full py-3.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/30 text-sm"
            >
              <Download size={18} />
              Download Your Book
            </a>

            <p className="text-xs text-slate-600 mt-3">
              Link valid for 7 days · Up to 5 downloads · Check email for backup link
            </p>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-sm text-slate-400 hover:text-purple-400 transition-colors">
              <ArrowLeft size={14} />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Payment pending/failed
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <XCircle size={64} className="text-amber-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Payment {data.status}</h2>
        <p className="text-slate-400 mb-6">
          {data.status === 'failed'
            ? 'Your payment was not successful. Please try again.'
            : 'Payment is still pending. Please complete the payment.'}
        </p>
        <Link to="/">
          <Button>Back to Store</Button>
        </Link>
      </div>
    </div>
  )
}
