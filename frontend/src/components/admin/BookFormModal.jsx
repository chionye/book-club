import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDropzone } from 'react-dropzone'
import { X, Upload, FileText, Image, BookOpen, Lock, Globe, DollarSign, Tag, AlignLeft, Info, Crown } from 'lucide-react'
import { useCreateBook, useUpdateBook } from '../../hooks/useBooks'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { GENRES } from '../../lib/utils'
import toast from 'react-hot-toast'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  description: z.string().optional(),
  genre: z.string().optional(),
  price: z.string().optional(),
  isPaid: z.boolean(),
  isPublished: z.boolean(),
  isPremium: z.boolean(),
  pages: z.string().optional(),
  language: z.string().optional(),
  isbn: z.string().optional(),
  previewText: z.string().optional(),
  tagsInput: z.string().optional(),
})

export default function BookFormModal({ book, onClose }) {
  const isEdit = !!book
  const createBook = useCreateBook()
  const updateBook = useUpdateBook()

  const [bookFile, setBookFile] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(book?.coverImage || null)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: book?.title || '',
      author: book?.author || '',
      description: book?.description || '',
      genre: book?.genre || '',
      price: book?.price?.toString() || '',
      isPaid: book?.isPaid ?? true,
      isPublished: book?.isPublished ?? true,
      isPremium: book?.isPremium ?? false,
      pages: book?.pages?.toString() || '',
      language: book?.language || 'English',
      isbn: book?.isbn || '',
      previewText: book?.previewText || '',
      tagsInput: (() => {
        const t = book?.tags
        if (!t) return ''
        const arr = Array.isArray(t) ? t : (() => { try { return JSON.parse(t) } catch { return [] } })()
        return arr.join(', ')
      })(),
    },
  })

  const isPaid = watch('isPaid')

  const onBookDrop = useCallback((files) => {
    if (files[0]) setBookFile(files[0])
  }, [])

  const onCoverDrop = useCallback((files) => {
    if (files[0]) {
      setCoverFile(files[0])
      setCoverPreview(URL.createObjectURL(files[0]))
    }
  }, [])

  const bookDropzone = useDropzone({
    onDrop: onBookDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/epub+zip': ['.epub'] },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024,
  })

  const coverDropzone = useDropzone({
    onDrop: onCoverDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  })

  const onSubmit = async (data) => {
    if (!isEdit && !bookFile) {
      toast.error('Please upload a book file')
      return
    }

    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'tagsInput') {
        const tags = value.split(',').map(t => t.trim()).filter(Boolean)
        formData.append('tags', JSON.stringify(tags))
      } else {
        formData.append(key, value?.toString() ?? '')
      }
    })

    if (bookFile) formData.append('bookFile', bookFile)
    if (coverFile) formData.append('coverImage', coverFile)

    if (isEdit) {
      await updateBook.mutateAsync({ id: book.id, formData })
    } else {
      await createBook.mutateAsync(formData)
    }

    onClose()
  }

  const isLoading = createBook.isPending || updateBook.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-[#130f2e] border border-white/10 rounded-2xl shadow-2xl animate-scaleIn max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">{isEdit ? 'Edit Book' : 'Upload New Book'}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{isEdit ? 'Update book details' : 'Add a new book to your store'}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Row: Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Book Title *" placeholder="Enter book title" error={errors.title?.message} {...register('title')} />
            <Input label="Author *" placeholder="Author name" error={errors.author?.message} {...register('author')} />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <textarea
              rows={4}
              placeholder="Write a compelling book description..."
              className="form-input resize-none"
              {...register('description')}
            />
          </div>

          {/* Row: Genre, Language, Pages */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Genre</label>
              <select className="form-input cursor-pointer" {...register('genre')}>
                <option value="" className="bg-[#130f2e]">Select genre</option>
                {GENRES.map(g => <option key={g} value={g} className="bg-[#130f2e]">{g}</option>)}
              </select>
            </div>
            <Input label="Language" placeholder="English" {...register('language')} />
            <Input label="Pages" type="number" placeholder="0" {...register('pages')} />
          </div>

          {/* Pricing */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign size={16} className="text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Pricing & Access</h3>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <div
                  className={`w-11 h-6 rounded-full transition-all relative cursor-pointer ${isPaid ? 'bg-purple-600' : 'bg-white/10'}`}
                  onClick={() => setValue('isPaid', !isPaid)}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${isPaid ? 'left-6' : 'left-1'}`} />
                </div>
                <span className="text-sm text-slate-300">
                  {isPaid ? <span className="flex items-center gap-1"><Lock size={13} className="text-amber-400" /> Paid Book</span> : <span className="flex items-center gap-1 text-emerald-400">Free Book</span>}
                </span>
              </label>
            </div>

            {isPaid && (
              <Input
                label="Price (NGN)"
                type="number"
                step="0.01"
                placeholder="2500.00"
                leftIcon={<span className="text-xs">₦</span>}
                {...register('price')}
              />
            )}
          </div>

          {/* Published + Premium toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div>
                <p className="text-sm font-medium text-white">Published</p>
                <p className="text-xs text-slate-500">Visible in store</p>
              </div>
              <div
                className={`w-11 h-6 rounded-full transition-all relative cursor-pointer ${watch('isPublished') ? 'bg-emerald-600' : 'bg-white/10'}`}
                onClick={() => setValue('isPublished', !watch('isPublished'))}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${watch('isPublished') ? 'left-6' : 'left-1'}`} />
              </div>
            </div>

            <div
              className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                watch('isPremium')
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-white/[0.02] border-white/[0.06]'
              }`}
              onClick={() => setValue('isPremium', !watch('isPremium'))}
            >
              <div>
                <p className={`text-sm font-medium flex items-center gap-1.5 ${watch('isPremium') ? 'text-amber-400' : 'text-white'}`}>
                  <Crown size={14} className={watch('isPremium') ? 'text-amber-400' : 'text-slate-500'} />
                  Premium
                </p>
                <p className="text-xs text-slate-500">Shows premium badge</p>
              </div>
              <div
                className={`w-11 h-6 rounded-full transition-all relative ${watch('isPremium') ? 'bg-amber-500' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${watch('isPremium') ? 'left-6' : 'left-1'}`} />
              </div>
            </div>
          </div>

          {/* Row: ISBN, Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="ISBN (optional)" placeholder="978-0-00-000000-0" {...register('isbn')} />
            <Input label="Tags (comma separated)" placeholder="fiction, adventure, classic" {...register('tagsInput')} />
          </div>

          {/* Preview Text */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Preview Text (optional)</label>
            <textarea
              rows={3}
              placeholder="A short excerpt to preview the book..."
              className="form-input resize-none"
              {...register('previewText')}
            />
          </div>

          {/* File Uploads */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Book File */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Book File {!isEdit && <span className="text-red-400">*</span>}
              </label>
              <div
                {...bookDropzone.getRootProps()}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                  bookDropzone.isDragActive ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 hover:border-purple-500/50 hover:bg-white/[0.02]'
                }`}
              >
                <input {...bookDropzone.getInputProps()} />
                {bookFile ? (
                  <div className="flex items-center gap-2 justify-center text-purple-400">
                    <FileText size={20} />
                    <span className="text-sm font-medium truncate">{bookFile.name}</span>
                  </div>
                ) : book?.fileName ? (
                  <div>
                    <FileText size={24} className="text-slate-600 mx-auto mb-1" />
                    <p className="text-xs text-slate-500 truncate">{book.fileName}</p>
                    <p className="text-xs text-slate-600 mt-1">Drop new file to replace</p>
                  </div>
                ) : (
                  <div>
                    <Upload size={24} className="text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Drop PDF/EPUB here</p>
                    <p className="text-xs text-slate-600 mt-1">Max 100MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Cover Image</label>
              <div
                {...coverDropzone.getRootProps()}
                className={`border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-all relative ${
                  coverDropzone.isDragActive ? 'border-purple-500' : 'border-white/10 hover:border-purple-500/50'
                }`}
                style={{ minHeight: '120px' }}
              >
                <input {...coverDropzone.getInputProps()} />
                {coverPreview ? (
                  <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" style={{ minHeight: '120px', maxHeight: '160px' }} />
                ) : (
                  <div className="p-4 text-center flex flex-col items-center justify-center h-[120px]">
                    <Image size={24} className="text-slate-600 mb-2" />
                    <p className="text-sm text-slate-400">Drop cover image</p>
                    <p className="text-xs text-slate-600 mt-1">JPG, PNG, WEBP · Max 5MB</p>
                  </div>
                )}
                {coverPreview && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-sm text-white">Click to change</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-5 border-t border-white/10 flex-shrink-0">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" loading={isLoading} onClick={handleSubmit(onSubmit)}>
            {isEdit ? 'Update Book' : 'Upload Book'}
          </Button>
        </div>
      </div>
    </div>
  )
}
