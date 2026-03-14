import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { booksAPI } from '../lib/api'
import toast from 'react-hot-toast'

export function useBooks(params) {
  return useQuery({
    queryKey: ['books', params],
    queryFn: () => booksAPI.getAll(params).then(r => r.data.data),
    keepPreviousData: true,
  })
}

export function useBook(id) {
  return useQuery({
    queryKey: ['book', id],
    queryFn: () => booksAPI.getById(id).then(r => r.data.data),
    enabled: !!id,
  })
}

export function useGenres() {
  return useQuery({
    queryKey: ['genres'],
    queryFn: () => booksAPI.getGenres().then(r => r.data.data),
    staleTime: 1000 * 60 * 30,
  })
}

export function useAdminBooks(params) {
  return useQuery({
    queryKey: ['admin', 'books', params],
    queryFn: () => booksAPI.adminGetAll(params).then(r => r.data.data),
    keepPreviousData: true,
  })
}

export function useAdminBook(id) {
  return useQuery({
    queryKey: ['admin', 'book', id],
    queryFn: () => booksAPI.adminGetById(id).then(r => r.data.data),
    enabled: !!id,
  })
}

export function useCreateBook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData) => booksAPI.adminCreate(formData),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'books'])
      queryClient.invalidateQueries(['books'])
      toast.success('Book uploaded successfully!')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to upload book'),
  })
}

export function useUpdateBook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, formData }) => booksAPI.adminUpdate(id, formData),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries(['admin', 'books'])
      queryClient.invalidateQueries(['admin', 'book', vars.id])
      queryClient.invalidateQueries(['books'])
      toast.success('Book updated successfully!')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update book'),
  })
}

export function useDeleteBook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => booksAPI.adminDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'books'])
      queryClient.invalidateQueries(['books'])
      toast.success('Book deleted successfully')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete book'),
  })
}
