import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface VerificationState {
  isVerified: boolean
  setIsVerified: (status: boolean) => void
}

export const useVerificationStore = create<VerificationState>()(
  persist(
    (set, get) => ({
      isVerified: false,
      setIsVerified: (status) => {
        console.log('Setting verification status:', status)
        console.log('Previous state:', get().isVerified)
        set({ isVerified: status })
        console.log('New state:', get().isVerified)
      },
    }),
    {
      name: 'verification-storage',
    }
  )
) 