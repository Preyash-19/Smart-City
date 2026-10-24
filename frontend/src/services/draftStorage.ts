/**
 * IndexedDB Storage Service for Offline Complaint Drafts
 * Enables citizens to safely capture, save, review, and synchronize
 * complaint drafts when internet connectivity is intermittent or offline.
 */

export interface OfflineDraft {
  id: string;
  idempotencyKey: string;
  citizenId?: string;
  department: string;
  title?: string;
  description?: string;
  imageDataUrl?: string; // Stored as base64 data URL in IndexedDB (isolated from SW CacheStorage)
  imageFileName?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  hasLocationPermission: boolean;
  consentGiven: boolean; // Explicit consent to store photo & GPS coordinates in browser storage
  createdAt: string;
  updatedAt: string;
  syncStatus: 'DRAFT' | 'SYNCING' | 'FAILED' | 'SYNCED';
  syncError?: string;
}

const DB_NAME = 'SmartCityCivicDB';
const DB_VERSION = 1;
const STORE_NAME = 'offline_complaint_drafts';

class DraftStorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private openDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB is not supported in this environment.'));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('syncStatus', 'syncStatus', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('citizenId', 'citizenId', { unique: false });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error || new Error('Failed to open IndexedDB.'));
      };
    });

    return this.dbPromise;
  }

  /**
   * Save a new or updated offline draft
   */
  async saveDraft(draft: Omit<OfflineDraft, 'id' | 'createdAt' | 'updatedAt' | 'idempotencyKey'> & { id?: string; idempotencyKey?: string }): Promise<OfflineDraft> {
    const db = await this.openDB();
    const now = new Date().toISOString();
    const id = draft.id || `draft_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const idempotencyKey = draft.idempotencyKey || `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

    const fullDraft: OfflineDraft = {
      ...draft,
      id,
      idempotencyKey,
      createdAt: (draft as any).createdAt || now,
      updatedAt: now,
      syncStatus: draft.syncStatus || 'DRAFT'
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(fullDraft);

      req.onsuccess = () => resolve(fullDraft);
      req.onerror = () => reject(req.error || new Error('Failed to save draft to IndexedDB.'));
    });
  }

  /**
   * Retrieve all drafts, optionally filtered by citizenId
   */
  async getDrafts(citizenId?: string): Promise<OfflineDraft[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const drafts = (req.result as OfflineDraft[]) || [];
        // Filter out synced drafts if any remain, and match citizen if supplied
        const filtered = drafts.filter(d => {
          if (d.syncStatus === 'SYNCED') return false;
          if (citizenId && d.citizenId && d.citizenId !== citizenId) return false;
          return true;
        });
        // Sort newest first
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        resolve(filtered);
      };

      req.onerror = () => reject(req.error || new Error('Failed to fetch drafts from IndexedDB.'));
    });
  }

  /**
   * Get draft by ID
   */
  async getDraft(id: string): Promise<OfflineDraft | undefined> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);

      req.onsuccess = () => resolve(req.result as OfflineDraft | undefined);
      req.onerror = () => reject(req.error || new Error(`Failed to get draft ${id}.`));
    });
  }

  /**
   * Update draft status
   */
  async updateStatus(id: string, status: OfflineDraft['syncStatus'], syncError?: string): Promise<void> {
    const draft = await this.getDraft(id);
    if (!draft) return;
    draft.syncStatus = status;
    draft.updatedAt = new Date().toISOString();
    if (syncError !== undefined) draft.syncError = syncError;

    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(draft);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error || new Error('Failed to update draft status.'));
    });
  }

  /**
   * Delete draft permanently by ID
   */
  async deleteDraft(id: string): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error || new Error(`Failed to delete draft ${id}.`));
    });
  }

  /**
   * Clear all synced drafts
   */
  async clearSyncedDrafts(): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.openCursor();

      req.onsuccess = (e: any) => {
        const cursor = e.target.result;
        if (cursor) {
          if (cursor.value.syncStatus === 'SYNCED') {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };

      req.onerror = () => reject(req.error || new Error('Failed to purge synced drafts.'));
    });
  }
}

export const draftStorage = new DraftStorageService();
