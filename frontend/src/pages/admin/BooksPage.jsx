import { useState } from 'react'
import { Plus, Search, Edit2, Trash2, BookOpen, Eye, EyeOff, Filter, Download, DollarSign } from 'lucide-react'
import { useAdminBooks, useDeleteBook } from '../../hooks/useBooks'
import { formatPrice, formatNumber, formatDate, formatFileSize } from '../../lib/utils'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import { PageSpinner } from '../../components/ui/Spinner'
import BookFormModal from '../../components/admin/BookFormModal'
import { assetURL } from '../../lib/api'

export default function BooksPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editBook, setEditBook] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const { data, isLoading, refetch } = useAdminBooks({ page, limit: 15, search, status })
  const deleteBook = useDeleteBook()

  const books = data?.books || []
  const pagination = data?.pagination || {}

  const handleEdit = (book) => {
    setEditBook(book)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    await deleteBook.mutateAsync(id)
    setDeleteConfirm(null)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setEditBook(null)
  }

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Books</h1>
          <p className="text-sm text-slate-500 mt-0.5">{pagination.total || 0} total books</p>
        </div>
        <Button
          onClick={() => { setEditBook(null); setShowModal(true) }}
          leftIcon={<Plus size={16} />}
        >
          Upload Book
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              placeholder="Search books or authors..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="form-input pl-10 text-sm"
            />
          </div>
          <select
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1) }}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-purple-500/50 cursor-pointer"
          >
            <option value="" className="bg-[#130f2e]">All Status</option>
            <option value="published" className="bg-[#130f2e]">Published</option>
            <option value="unpublished" className="bg-[#130f2e]">Unpublished</option>
          </select>
        </div>
      </Card>

      {/* Books Table */}
      {isLoading ? (
        <PageSpinner />
      ) : books.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen size={48} className="text-slate-700 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-400 mb-1">No books found</h3>
          <p className="text-sm text-slate-600 mb-4">Upload your first book to get started</p>
          <Button onClick={() => setShowModal(true)} leftIcon={<Plus size={16} />}>
            Upload Book
          </Button>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="px-6 py-4 text-left text-xs text-slate-500 font-medium uppercase tracking-wider">Book</th>
                  <th className="px-6 py-4 text-left text-xs text-slate-500 font-medium uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-left text-xs text-slate-500 font-medium uppercase tracking-wider">Sales</th>
                  <th className="px-6 py-4 text-left text-xs text-slate-500 font-medium uppercase tracking-wider">Downloads</th>
                  <th className="px-6 py-4 text-left text-xs text-slate-500 font-medium uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-4 text-left text-xs text-slate-500 font-medium uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs text-slate-500 font-medium uppercase tracking-wider">Added</th>
                  <th className="px-6 py-4 text-right text-xs text-slate-500 font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {books.map(book => (
                  <tr key={book.id} className="hover:bg-white/[0.02] transition-colors group">
                    {/* Book Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-14 rounded-lg overflow-hidden bg-purple-900/20 flex-shrink-0 border border-white/10">
                          {book.coverImage ? (
                            <img src={assetURL(book.coverImage)} alt={book.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen size={16} className="text-purple-500/40" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-white truncate max-w-[200px]">{book.title}</p>
                          <p className="text-xs text-slate-500 truncate">{book.author}</p>
                          {book.genre && (
                            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20">
                              {book.genre}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <span className={`font-semibold ${book.isPaid ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {book.isPaid ? formatPrice(book.price) : 'Free'}
                        </span>
                        <p className="text-xs text-slate-600 mt-0.5">{book.fileType}</p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-medium text-white">{formatNumber(book.salesCount)}</span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-medium text-white">{formatNumber(book.downloadCount)}</span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-semibold text-emerald-400">{formatPrice(book.totalRevenue)}</span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <Badge variant={book.isPublished ? 'success' : 'warning'}>
                          {book.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-500 text-xs">{formatDate(book.createdAt)}</td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(book)}
                          className="p-2 rounded-xl text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(book)}
                          className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.06]">
              <p className="text-xs text-slate-500">
                Page {pagination.page} of {pagination.pages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-xs rounded-lg bg-white/5 text-slate-400 hover:text-white border border-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="px-3 py-1.5 text-xs rounded-lg bg-white/5 text-slate-400 hover:text-white border border-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Book Form Modal */}
      {showModal && (
        <BookFormModal book={editBook} onClose={handleModalClose} />
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-[#130f2e] border border-red-500/20 rounded-2xl p-6 max-w-sm w-full animate-scaleIn">
            <h3 className="text-lg font-bold text-white mb-2">Delete Book?</h3>
            <p className="text-sm text-slate-400 mb-6">
              Are you sure you want to delete <strong className="text-white">"{deleteConfirm.title}"</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => handleDelete(deleteConfirm.id)}
                loading={deleteBook.isPending}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
