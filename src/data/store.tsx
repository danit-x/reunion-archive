import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { DATA_VERSION, seedData } from './seed';
import type { AppData, Registration, UserAccount } from './types';
import { hashPassword, randomCode } from '../lib/utils';

// ─────────────────────────────────────────────────────────────
//  Shared data layer. A single AppData document is persisted to
//  localStorage; every page (public and admin) reads from here,
//  so changes in one place are reflected everywhere instantly.
//  This is a FRONTEND SIMULATION — no server, no real security.
// ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'reunion-archive:data';
const SESSION_KEY = 'reunion-archive:session';
const ADMIN_KEY = 'reunion-archive:admin';

function load(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppData;
      if (parsed.version === DATA_VERSION) return parsed;
    }
  } catch {
    /* fall through to seed */
  }
  return seedData();
}

type Updater = (draft: AppData) => AppData;

interface StoreValue {
  data: AppData;
  update: (fn: Updater) => void;
  resetDemo: () => void;
  persistError: string | null;
  // Auth (simulated)
  user: UserAccount | null;
  signUp: (input: Omit<UserAccount, 'id' | 'passwordHash' | 'createdAt'> & { password: string }) => Promise<UserAccount>;
  logIn: (email: string, password: string) => Promise<UserAccount>;
  logOut: () => void;
  updateProfile: (patch: Partial<UserAccount>) => void;
  // Admin (simulated)
  isAdmin: boolean;
  adminLogIn: (passcode: string) => boolean;
  adminLogOut: () => void;
  // Registration helpers
  createRegistration: (input: Omit<Registration, 'id' | 'createdAt' | 'status' | 'attendance'>) => Registration;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(load);
  const [persistError, setPersistError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(() => safeGet(SESSION_KEY));
  const [isAdmin, setIsAdmin] = useState<boolean>(() => safeGet(ADMIN_KEY) === '1');
  const dataRef = useRef(data);
  dataRef.current = data;

  // Persist on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setPersistError(null);
    } catch {
      setPersistError('Browser storage is full — recent changes may not survive a reload. Try removing uploaded images.');
    }
  }, [data]);

  // Keep multiple tabs in sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try { setData(JSON.parse(e.newValue)); } catch { /* ignore */ }
      }
      if (e.key === SESSION_KEY) setSessionId(e.newValue);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const update = useCallback((fn: Updater) => setData((d) => fn(structuredClone(d))), []);

  const resetDemo = useCallback(() => {
    setData(seedData());
    safeRemove(SESSION_KEY);
    setSessionId(null);
  }, []);

  const user = useMemo(() => data.users.find((u) => u.id === sessionId) ?? null, [data.users, sessionId]);

  const signUp: StoreValue['signUp'] = useCallback(async ({ password, ...rest }) => {
    const email = rest.email.trim().toLowerCase();
    if (dataRef.current.users.some((u) => u.email === email)) throw new Error('An account with this email already exists. Try logging in.');
    const account: UserAccount = { ...rest, email, id: `u_${randomCode(8)}`, passwordHash: await hashPassword(password), createdAt: new Date().toISOString() };
    setData((d) => ({ ...d, users: [...d.users, account] }));
    safeSet(SESSION_KEY, account.id);
    setSessionId(account.id);
    return account;
  }, []);

  const logIn: StoreValue['logIn'] = useCallback(async (email, password) => {
    const found = dataRef.current.users.find((u) => u.email === email.trim().toLowerCase());
    if (!found || found.passwordHash !== (await hashPassword(password))) throw new Error('That email and password combination was not recognised.');
    safeSet(SESSION_KEY, found.id);
    setSessionId(found.id);
    return found;
  }, []);

  const logOut = useCallback(() => { safeRemove(SESSION_KEY); setSessionId(null); }, []);

  const updateProfile = useCallback((patch: Partial<UserAccount>) => {
    setData((d) => ({ ...d, users: d.users.map((u) => (u.id === sessionId ? { ...u, ...patch, id: u.id, email: u.email, passwordHash: u.passwordHash } : u)) }));
  }, [sessionId]);

  const adminLogIn = useCallback((passcode: string) => {
    if (passcode.trim().toLowerCase() !== 'reunion2026') return false;
    safeSet(ADMIN_KEY, '1');
    setIsAdmin(true);
    return true;
  }, []);
  const adminLogOut = useCallback(() => { safeRemove(ADMIN_KEY); setIsAdmin(false); }, []);

  const createRegistration: StoreValue['createRegistration'] = useCallback((input) => {
    const existing = new Set(dataRef.current.registrations.map((r) => r.id));
    let id = `TRA-26-${randomCode(4)}`;
    while (existing.has(id)) id = `TRA-26-${randomCode(4)}`;
    const reg: Registration = {
      ...input,
      id,
      createdAt: new Date().toISOString(),
      status: dataRef.current.registration.autoConfirm ? 'confirmed' : 'pending',
      attendance: 'unmarked',
    };
    setData((d) => ({ ...d, registrations: [reg, ...d.registrations] }));
    return reg;
  }, []);

  const value = useMemo<StoreValue>(() => ({
    data, update, resetDemo, persistError, user, signUp, logIn, logOut, updateProfile, isAdmin, adminLogIn, adminLogOut, createRegistration,
  }), [data, update, resetDemo, persistError, user, signUp, logIn, logOut, updateProfile, isAdmin, adminLogIn, adminLogOut, createRegistration]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}

function safeGet(k: string) { try { return localStorage.getItem(k); } catch { return null; } }
function safeSet(k: string, v: string) { try { localStorage.setItem(k, v); } catch { /* ignore */ } }
function safeRemove(k: string) { try { localStorage.removeItem(k); } catch { /* ignore */ } }
