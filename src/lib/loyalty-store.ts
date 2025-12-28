import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LoyaltyState {
  points: number;
  tier: string;
  tierColor: string;
  tierIcon: string;
  multiplier: number;
  email: string | null;
  phone: string | null;
  setPoints: (points: number) => void;
  setTier: (tier: string, color: string, icon: string, multiplier: number) => void;
  setCustomer: (email: string | null, phone: string | null) => void;
  addPoints: (amount: number) => void;
  redeemPoints: (amount: number) => boolean;
  calculateTier: (points: number) => { name: string; color: string; icon: string; multiplier: number };
}

const TIERS = [
  { name: 'Bronze', min: 0, multiplier: 1.0, icon: '🥉', color: '#CD7F32' },
  { name: 'Silver', min: 500, multiplier: 1.25, icon: '🥈', color: '#C0C0C0' },
  { name: 'Gold', min: 2000, multiplier: 1.5, icon: '🥇', color: '#FFD700' },
  { name: 'Platinum', min: 5000, multiplier: 2.0, icon: '💎', color: '#E5E4E2' },
];

export const useLoyaltyStore = create<LoyaltyState>()(
  persist(
    (set, get) => ({
      points: 0,
      tier: 'Bronze',
      tierColor: '#CD7F32',
      tierIcon: '🥉',
      multiplier: 1.0,
      email: null,
      phone: null,

      setPoints: (points) => {
        const tierInfo = get().calculateTier(points);
        set({ points, ...tierInfo });
      },

      setTier: (tier, color, icon, multiplier) => set({ tier, tierColor: color, tierIcon: icon, multiplier }),

      setCustomer: (email, phone) => set({ email, phone }),

      addPoints: (amount) => {
        const newPoints = get().points + amount;
        const tierInfo = get().calculateTier(newPoints);
        set({ points: newPoints, ...tierInfo });
      },

      redeemPoints: (amount) => {
        const current = get().points;
        if (current >= amount) {
          const newPoints = current - amount;
          const tierInfo = get().calculateTier(newPoints);
          set({ points: newPoints, ...tierInfo });
          return true;
        }
        return false;
      },

      calculateTier: (points) => {
        let currentTier = TIERS[0];
        for (const tier of TIERS) {
          if (points >= tier.min) {
            currentTier = tier;
          }
        }
        return {
          name: currentTier.name,
          color: currentTier.color,
          icon: currentTier.icon,
          multiplier: currentTier.multiplier,
        };
      },
    }),
    { name: 'jeffy-loyalty' }
  )
);
