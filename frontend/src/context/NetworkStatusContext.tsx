import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { draftStorage } from '../services/draftStorage';
import { API_URL } from '../services/api';

export type NetworkStatusType = 
  | 'ONLINE'
  | 'OFFLINE'
  | 'SYNCING_DRAFTS'
  | 'DRAFT_SAVED'
  | 'SUBMISSION_FAILED'
  | 'SUBMISSION_SUCCESS';

interface NetworkStatusContextType {
  status: NetworkStatusType;
  isOnline: boolean;
  isBackendReachable: boolean;
  draftsCount: number;
  setStatus: (status: NetworkStatusType) => void;
  refreshDraftsCount: () => Promise<number>;
  checkReachability: () => Promise<boolean>;
}

const NetworkStatusContext = createContext<NetworkStatusContextType | undefined>(undefined);

export function NetworkStatusProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatusState] = useState<NetworkStatusType>(navigator.onLine ? 'ONLINE' : 'OFFLINE');
  const [isBackendReachable, setIsBackendReachable] = useState<boolean>(navigator.onLine);
  const [draftsCount, setDraftsCount] = useState<number>(0);

  const refreshDraftsCount = useCallback(async () => {
    try {
      const drafts = await draftStorage.getDrafts();
      setDraftsCount(drafts.length);
      return drafts.length;
    } catch {
      return 0;
    }
  }, []);

  const checkReachability = useCallback(async (): Promise<boolean> => {
    if (!navigator.onLine) {
      setIsBackendReachable(false);
      setStatusState('OFFLINE');
      return false;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`${API_URL}/health`, {
        method: 'GET',
        signal: controller.signal,
        cache: 'no-store'
      });
      clearTimeout(timeoutId);

      const reachable = res.ok;
      setIsBackendReachable(reachable);
      setStatusState(reachable ? 'ONLINE' : 'OFFLINE');
      return reachable;
    } catch {
      setIsBackendReachable(false);
      setStatusState('OFFLINE');
      return false;
    }
  }, []);

  // Custom setter that auto-reverts transient states (e.g. DRAFT_SAVED, SUBMISSION_SUCCESS)
  const setStatus = useCallback((newStatus: NetworkStatusType) => {
    setStatusState(newStatus);

    if (newStatus === 'DRAFT_SAVED' || newStatus === 'SUBMISSION_SUCCESS' || newStatus === 'SUBMISSION_FAILED') {
      setTimeout(() => {
        checkReachability();
      }, 4000);
    }
  }, [checkReachability]);

  useEffect(() => {
    refreshDraftsCount();
    checkReachability();

    const handleOnline = () => {
      checkReachability();
    };

    const handleOffline = () => {
      setIsBackendReachable(false);
      setStatusState('OFFLINE');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic reachability verification every 25 seconds
    const intervalId = setInterval(() => {
      checkReachability();
      refreshDraftsCount();
    }, 25000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [checkReachability, refreshDraftsCount]);

  const isOnline = status === 'ONLINE' || (status !== 'OFFLINE' && isBackendReachable);

  return (
    <NetworkStatusContext.Provider 
      value={{ 
        status, 
        isOnline, 
        isBackendReachable, 
        draftsCount, 
        setStatus, 
        refreshDraftsCount, 
        checkReachability 
      }}
    >
      {children}
    </NetworkStatusContext.Provider>
  );
}

export function useNetworkStatus() {
  const context = useContext(NetworkStatusContext);
  if (!context) {
    throw new Error('useNetworkStatus must be used within a NetworkStatusProvider');
  }
  return context;
}
