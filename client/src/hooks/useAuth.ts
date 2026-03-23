import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'

export const useAuth = () => {
  const { isAuthenticated, fetchUser } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      await fetchUser()
      setIsChecking(false)
    }
    checkAuth()
  }, [fetchUser])

  return { isAuthenticated, isChecking }
}
