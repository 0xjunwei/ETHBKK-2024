import { create } from 'zustand'

interface VerificationState {
  isVerified: boolean
  setIsVerified: (status: boolean) => void
}

export const useVerificationStore = create<VerificationState>((set) => ({
  isVerified: false,
  setIsVerified: (status) => set({ isVerified: status }),
})) 