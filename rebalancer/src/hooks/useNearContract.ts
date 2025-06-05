'use client';

import { useMemo } from 'react';
import { useNearWallet } from '@/contexts/NearWalletContext';
import { createNearContract, NearContract } from '@/utils/nearContract';

export const useNearContract = (contractId?: string): NearContract | null => {
  const { selector } = useNearWallet();

  const contract = useMemo(() => {
    if (!selector) return null;
    return createNearContract(selector, contractId);
  }, [selector, contractId]);

  return contract;
}; 