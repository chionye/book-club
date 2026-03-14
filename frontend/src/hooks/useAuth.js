import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../lib/api'
import toast from 'react-hot-toast'

export function useAdmin() {
  return useQuery({
    queryKey: ['admin', 'me'],
    queryFn: async () => {
      const token = localStorage.getItem('admin_token')
      if (!token) throw new Error('No token')
      const res = await authAPI.me()
      return res.data.data
    },
    retry: false,
    staleTime: 1000 * 60 * 10,
  })
}

export function useLogin() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => authAPI.login(data),
    onSuccess: (res) => {
      localStorage.setItem('admin_token', res.data.data.token)
      queryClient.setQueryData(['admin', 'me'], res.data.data.admin)
      toast.success('Welcome back!')
      navigate('/admin/dashboard')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Login failed')
    },
  })
}

export function useLogout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return () => {
    localStorage.removeItem('admin_token')
    queryClient.clear()
    navigate('/admin/login')
    toast.success('Logged out successfully')
  }
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data) => authAPI.changePassword(data),
    onSuccess: () => toast.success('Password changed successfully'),
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to change password'),
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => authAPI.updateProfile(data),
    onSuccess: (res) => {
      queryClient.setQueryData(['admin', 'me'], res.data.data)
      toast.success('Profile updated')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update profile'),
  })
}
