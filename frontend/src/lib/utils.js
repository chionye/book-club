import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount, currency = 'NGN') {
  if (amount === 0 || amount === '0.00') return 'Free'
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(num) {
  if (!num) return '0'
  return new Intl.NumberFormat('en-NG').format(num)
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date) {
  return new Intl.DateTimeFormat('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatFileSize(bytes) {
  if (!bytes) return 'Unknown'
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${Math.round(bytes / Math.pow(1024, i))} ${sizes[i]}`
}

export function truncate(str, length = 100) {
  if (!str) return ''
  return str.length > length ? str.substring(0, length) + '...' : str
}

export function getPercentChange(current, previous) {
  if (!previous) return 100
  return Math.round(((current - previous) / previous) * 100)
}

export function coverImageUrl(path) {
  if (!path) return null
  if (path.startsWith('http')) return path
  return path
}

export const GENRES = [
  'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Sci-Fi',
  'Fantasy', 'Biography', 'History', 'Self-Help', 'Business',
  'Technology', 'Health', 'Travel', 'Children', 'Poetry',
  'Philosophy', 'Religion', 'Education', 'Art', 'Other',
]
