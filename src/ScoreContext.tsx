import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import {
  Gender, Mark, Member, Alumni, Archer, PracticeRecord, SessionRecord, SavedData, UserAccount, UserRole, Theme, Announcement,
  Notification, NotificationType,
  AuditLog
} from './types';
import { db } from './firebase';
import { ref, set, onValue, get } from 'firebase/database';

export const createArcher = (count: number): Archer => ({
  id: crypto.randomUUID(),
  name: "",
  gender: Gender.unknown,
  grade: 1,
  marks: Array(count).fill(Mark.none),
  isSeparator: false,
  isTotalCalculator: false,
  isGuest: false
});

export const hashPassword = async (password: string): Promise<string> => {
  if (!password) return "";
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const createSeparator = (): Archer => ({
  id: crypto.randomUUID(),
  name: "",
  gender: Gender.unknown,
  grade: 0,
  marks: [],
  isSeparator: true,
  isTotalCalculator: false,
  isGuest: false
});

export const createTotalCalculator = (count: number): Archer => ({
  id: crypto.randomUUID(),
  name: "計",
  gender: Gender.unknown,
  grade: 0,
  marks: Array(count).fill(Mark.none),
  isSeparator: false,
  isTotalCalculator: true,
  isGuest: false
});

const initialMembersData: Omit<Member, 'id'>[] = [
  { name: "白鳥 聡也", gender: Gender.male, grade: 3 },
  { name: "鶴野 悠斗", gender: Gender.male, grade: 3 },
  { name: "川嶋 孝太朗", gender: Gender.male, grade: 3 },
  { name: "本間 未夏", gender: Gender.female, grade: 3 },
  { name: "河原 脩平", gender: Gender.male, grade: 3 },
  { name: "石上 裕人", gender: Gender.male, grade: 2 },
  { name: "田端 航大", gender: Gender.male, grade: 2 },
  { name: "梶原 啓司", gender: Gender.male, grade: 2 },
  { name: "張 星児", gender: Gender.male, grade: 2 },
  { name: "小堀 蓮", gender: Gender.male, grade: 2 },
  { name: "桐谷 直記", gender: Gender.male, grade: 2 },
  { name: "渡辺 成美", gender: Gender.female, grade: 2 },
  { name: "笹原 健太郎", gender: Gender.male, grade: 2 },
  { name: "石川 紗羽", gender: Gender.female, grade: 1 },
  { name: "小野里 翔", gender: Gender.male, grade: 1 },
  { name: "永井 優郷", gender: Gender.male, grade: 1 },
  { name: "林 飛雄", gender: Gender.male, grade: 1 },
  { name: "篠原 駿太朗", gender: Gender.male, grade: 1 },
  { name: "澁川 侑弥", gender: Gender.male, grade: 1 },
  { name: "津高 大輔", gender: Gender.male, grade: 1 },
  { name: "神原 乙葉", gender: Gender.female, grade: 1 },
  { name: "山口 萌", gender: Gender.female, grade: 1 },
  { name: "槇 康滉", gender: Gender.male, grade: 1 },
  { name: "林 真輝", gender: Gender.male, grade: 1 },
  { name: "工藤 和哲", gender: Gender.male, grade: 1 },
  { name: "中村 椛蓮", gender: Gender.female, grade: 1 },
  { name: "池田 葵", gender: Gender.female, grade: 1 }
];

export type SyncStatus = 'synced' | 'syncing' | 'error' | 'pending';

export interface ScoreContextType {
  archers: Archer[];
  setArchers: React.Dispatch<React.SetStateAction<Archer[]>>;
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  alumni: Alumni[];
  setAlumni: React.Dispatch<React.SetStateAction<Alumni[]>>;
  history: PracticeRecord[];
  setHistory: React.Dispatch<React.SetStateAction<PracticeRecord[]>>;
  sessions: SessionRecord[];
  setSessions: React.Dispatch<React.SetStateAction<SessionRecord[]>>;
  trash: SessionRecord[];
  setTrash: React.Dispatch<React.SetStateAction<SessionRecord[]>>;
  shotsPerRound: number;
  setShotsPerRound: React.Dispatch<React.SetStateAction<number>>;
  isAdminMode: boolean;
  setIsAdminMode: React.Dispatch<React.SetStateAction<boolean>>;
  lockedBlocks: Record<string, boolean>;
  syncStatus: SyncStatus;
  lastSyncTime: Date | null;
  accounts: UserAccount[];
  setAccounts: React.Dispatch<React.SetStateAction<UserAccount[]>>;
  currentUser: UserAccount | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserAccount | null>>;
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
  toggleTheme: () => void;
  hasSeenTutorial: boolean;
  markTutorialAsSeen: () => void;
  announcements: Announcement[];
  addAnnouncement: (title: string, content: string, isImportant: boolean) => void;
  deleteAnnouncement: (id: string) => void;
  notifications: Notification[];
  addNotification: (message: string, type?: NotificationType, title?: string) => void;
  removeNotification: (id: string) => void;
  auditLogs: AuditLog[];

  // Methods
  addArcher: () => void;
  addSeparator: () => void;
  addTotalCalculator: () => void;
  insertArcher: (index: number) => void;
  insertSeparator: (index: number) => void;
  insertTotalCalculator: (index: number) => void;
  deleteArcher: (id: string) => void;
  toggleMark: (archerId: string, markIndex: number) => void;
  setMark: (archerId: string, markIndex: number, mark: Mark) => void;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  toggleLock: (calculatorId: string, blockIndex: number) => void;
  updateArcherInfo: (archerId: string, name: string, gender: Gender, grade: number, isGuest: boolean, color?: string, avatarUrl?: string) => void;
  moveArcher: (sourceId: string, targetId: string) => void;
  saveSessionAndReset: (note: string) => void;

  addAccount: (account: UserAccount) => void;
  deleteAccount: (id: string) => void;
  addMember: (name: string, gender: Gender, grade: number) => void;
  updateMember: (id: string, name: string, gender: Gender, grade: number, color?: string, avatarUrl?: string) => void;
  deleteMember: (id: string) => void;
  promoteToAlumni: (id: string) => void;
  deleteAlumni: (id: string) => void;
  bulkPromoteToAlumni: (ids: string[]) => void;
  bulkDeleteMembers: (ids: string[]) => void;
  bulkPromoteGrades: (ids: string[]) => void;

  deleteSession: (id: string) => void;
  restoreSession: (id: string) => void;
  permanentlyDeleteSession: (id: string) => void;
  updateSessionShotCount: (id: string, count: number) => void;
  deleteArcherFromSession: (sessionId: string, archerId: string) => void;
  addArcherToSession: (sessionId: string) => void;
  addSeparatorToSession: (sessionId: string) => void;
  addTotalToSession: (sessionId: string) => void;
  toggleHistoryMark: (sessionId: string, archerId: string, markIndex: number) => void;
  updateHistoryArcherInfo: (sessionId: string, archerId: string, name: string, gender: Gender, grade: number, isGuest: boolean) => void;
  moveHistoryArcher: (sessionId: string, sourceId: string, targetId: string) => void;
  updateSessionNote: (sessionId: string, note: string) => void;
  updateSessionDate: (sessionId: string, date: string) => void;
  archiveSession: (id: string) => void;
  unarchiveSession: (id: string) => void;
  updateSessionTags: (id: string, tags: string[]) => void;

  getDisplayName: (name: string) => string;
  getGroupArchers: (calculatorId: string) => Archer[];
  getHistoryGroupArchers: (sessionId: string, calculatorId: string) => Archer[];
  getCalculatorForArcher: (archerId: string) => string | null;

  exportDataToString: () => string;
  importDataFromString: (json: string) => boolean;

  login: (id: string, plainPassword: string) => Promise<boolean>;
  logout: () => void;
}

export const ScoreContext = createContext<ScoreContextType | null>(null);

export const useScoreModel = () => {
  const context = useContext(ScoreContext);
  if (!context) throw new Error("useScoreModel must be used within ScoreProvider");
  return context;
};

export const ScoreProvider = ({ children }: { children: ReactNode }) => {
  const [archers, setArchers] = useState<Archer[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [history, setHistory] = useState<PracticeRecord[]>([]);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [trash, setTrash] = useState<SessionRecord[]>([]);
  const [shotsPerRound, setShotsPerRound] = useState<number>(12);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [lastFiscalYearChecked, setLastFiscalYearChecked] = useState<number>(2000);
  const [isLoaded, setIsLoaded] = useState(false);
  const [undoStack, setUndoStack] = useState<{ archers: Archer[], lockedBlocks: Record<string, boolean> }[]>([]);
  const [redoStack, setRedoStack] = useState<{ archers: Archer[], lockedBlocks: Record<string, boolean> }[]>([]);
  const [lockedBlocks, setLockedBlocks] = useState<Record<string, boolean>>({});
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [pendingSync, setPendingSync] = useState<NodeJS.Timeout | null>(null);
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [theme, setTheme] = useState<Theme>('light');
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [lastUpdated, setLastUpdated] = useState<number>(0);
  const activeSyncs = useRef(0);

  function getLatestData(): SavedData {
    return {
      currentArchers: archers,
      members,
      alumni,
      history,
      sessions,
      trash,
      lastFiscalYearChecked,
      shotsPerRound,
      isFirstLaunch: false,
      lockedBlocks,
      accounts,
      theme,
      announcements,
      hasSeenTutorial,
      auditLogs,
      lastUpdated: lastUpdated || Date.now()
    };
  }

  async function syncToCloud(data: SavedData) {
    if (!navigator.onLine) {
      setSyncStatus('offline');
      return;
    }
    activeSyncs.current += 1;
    setSyncStatus('syncing');
    let success = false;

    const sessionIds = new Set(data.sessions.map(s => s.id));
    const trashIds = new Set(data.trash?.map(s => s.id) || []);

    const now = Date.now();
    const dataToSave: SavedData = {
      ...data,
      lastUpdated: now,
      sessions: data.sessions.map(s => {
        const { syncStatus, ...rest } = s as any;
        return rest;
      }),
      trash: data.trash?.map(s => {
        const { syncStatus, ...rest } = s as any;
        return rest;
      })
    };

    try {
      // Re-check remote before final write to prevent race conditions
      const remoteSnapshot = await get(ref(db, 'appData/lastUpdated'));
      const remoteUpdateAt = remoteSnapshot.val() || 0;
      if (remoteUpdateAt > (data.lastUpdated || 0)) {
        console.warn("Sync blocked: Remote data is newer. Retrying pull.");
        return; // Let onValue handle the update
      }

      await set(ref(db, 'appData'), dataToSave);
      success = true;

      setTimeout(() => {
        setSessions(prev => prev.map(s => {
          if (sessionIds.has(s.id)) {
            return { ...s, syncStatus: 'synced' };
          }
          return s;
        }));

        setTrash(prev => prev.map(s => {
          if (trashIds.has(s.id)) {
            return { ...s, syncStatus: 'synced' };
          }
          return s;
        }));

        setLastSyncTime(new Date());
        addNotification("クラウドとの同期が完了しました", "success", "同期完了");
      }, 0);
    } catch (e) {
      console.error("Firebase sync failed", e);
      setSyncStatus('error');

      setTimeout(() => {
        setSessions(prev => prev.map(s => {
          if (sessionIds.has(s.id) && s.syncStatus === 'pending') {
            return { ...s, syncStatus: 'error' };
          }
          return s;
        }));

        setTrash(prev => prev.map(s => {
          if (trashIds.has(s.id) && s.syncStatus === 'pending') {
            return { ...s, syncStatus: 'error' };
          }
          return s;
        }));
      }, 0);
    } finally {
      activeSyncs.current -= 1;
      if (activeSyncs.current === 0 && success) {
        setSyncStatus('synced');
      }
    }
  }

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
    setLastUpdated(Date.now());
  };

  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus('pending');
      const dataStr = localStorage.getItem('nihon_u_kyudo_app');
      if (dataStr) {
        try {
          syncToCloud(JSON.parse(dataStr));
        } catch (e) { }
      }
    };
    const handleOffline = () => setSyncStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    if (!navigator.onLine) setSyncStatus('offline');

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isLoaded]);

  // Remote Sync Listener (Conflict Resolution)
  useEffect(() => {
    if (!isLoaded) return;

    const unsubscribe = onValue(ref(db, 'appData'), (snapshot) => {
      const remoteData: SavedData = snapshot.val();
      if (!remoteData) return;

      const remoteLastUpdated = remoteData.lastUpdated || 0;
      if (remoteLastUpdated <= lastUpdated) {
        // Our local state is already ahead of or equal to remote. No need to merge.
        return;
      }

      setLastUpdated(remoteLastUpdated);

      // Merge Logic: Prioritize local 'pending' items
      setSessions(prevLocal => {
        const pendingLocal = prevLocal.filter(s => s.syncStatus === 'pending');
        const pendingIds = new Set(pendingLocal.map(s => s.id));

        // Merge remote sessions that aren't pending locally
        const merged = [
          ...pendingLocal,
          ...(remoteData.sessions || []).filter(s => !pendingIds.has(s.id))
        ];

        // Sort by date or id to keep consistent
        return merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      });

      setTrash(prevLocal => {
        const pendingLocal = prevLocal.filter(s => s.syncStatus === 'pending');
        const pendingIds = new Set(pendingLocal.map(s => s.id));
        return [
          ...pendingLocal,
          ...(remoteData.trash || []).filter((s: any) => !pendingIds.has(s.id))
        ];
      });

      // Merge members: Use remote as base, but keep local IDs consistency
      setMembers(prev => {
        const remoteMembers = remoteData.members || [];
        if (remoteMembers.length === 0) return prev;
        return remoteMembers;
      });

      setAlumni(remoteData.alumni || []);
      if (remoteData.accounts && remoteData.accounts.length > 0) {
        setAccounts(remoteData.accounts);
      }
      setHistory(remoteData.history || []);
      setShotsPerRound(remoteData.shotsPerRound || 12);
      setLockedBlocks(remoteData.lockedBlocks || {});
      if (remoteData.theme) setTheme(remoteData.theme);
      if (remoteData.announcements) setAnnouncements(remoteData.announcements);
      if (remoteData.auditLogs) setAuditLogs(remoteData.auditLogs);
      if (remoteData.hasSeenTutorial !== undefined) setHasSeenTutorial(remoteData.hasSeenTutorial);

      setLastSyncTime(new Date());
      setSyncStatus('synced');
    });

    return () => unsubscribe();
  }, [isLoaded, isAdminMode]); // Refetch if mode changes just in case

  const getFiscalYear = (date: Date | string) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    return month >= 4 ? year : year - 1;
  };

  useEffect(() => {
    const dataStr = localStorage.getItem('nihon_u_kyudo_app');
    if (dataStr) {
      try {
        const data: SavedData = JSON.parse(dataStr);
        setArchers(data.currentArchers || []);
        setMembers(data.members || []);
        setAlumni(data.alumni || []);
        setHistory(data.history || []);
        setSessions(data.sessions || []);
        setTrash(data.trash || []);
        setShotsPerRound(data.shotsPerRound || 12);
        setLastFiscalYearChecked(data.lastFiscalYearChecked || 2000);
        setLockedBlocks(data.lockedBlocks || {});
        if (data.theme) setTheme(data.theme);
        if (data.lastUpdated) setLastUpdated(data.lastUpdated);

        // Setup initial accounts if not exists
        let loadedAccounts = data.accounts || [];
        if (loadedAccounts.length === 0) {
          // Default admin: admin / 1234
          loadedAccounts = [
            { id: "admin", passwordHash: "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4", role: UserRole.admin, name: "管理者" }
          ];
        }
        setAccounts(loadedAccounts);
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    } else {
      const initialMembers = initialMembersData.map(m => ({ ...m, id: crypto.randomUUID() }));
      setMembers(initialMembers);
      setArchers([createArcher(12), createArcher(12), createArcher(12)]);
      setLastFiscalYearChecked(getFiscalYear(new Date()));
      // Default admin: admin / 1234
      setAccounts([{ id: "admin", passwordHash: "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4", role: UserRole.admin, name: "管理者" }]);
    }
    setIsLoaded(true);
  }, []);


  // Password Migration: Migrate plain-text passwords to SHA-256 hashes
  useEffect(() => {
    if (isLoaded) {
      const migratePasswords = async () => {
        let changed = false;
        const migrated = await Promise.all(accounts.map(async (acc) => {
          let updated = { ...acc };
          // SHA-256 hex is 64 chars. If significantly shorter, treat as plain text.
          if (acc.passwordHash && acc.passwordHash.length < 32) {
            updated.passwordHash = await hashPassword(acc.passwordHash);
            changed = true;
          }
          // Migration: Ensure admin has a name if missing
          if (acc.id === "admin" && !acc.name) {
            updated.name = "管理者";
            changed = true;
          }
          return updated;
        }));

        if (changed) {
          setAccounts(migrated);
        }
      };
      migratePasswords();
    }
  }, [isLoaded, accounts]);

  useEffect(() => {
    if (!isLoaded) return;
    const data: SavedData = {
      currentArchers: archers,
      members,
      alumni,
      history,
      sessions,
      trash,
      lastFiscalYearChecked,
      shotsPerRound,
      isFirstLaunch: false,
      lockedBlocks,
      accounts,
      theme,
      announcements,
      hasSeenTutorial,
      auditLogs,
      lastUpdated
    };
    localStorage.setItem('nihon_u_kyudo_app', JSON.stringify(data));
  }, [archers, members, alumni, history, sessions, trash, lastFiscalYearChecked, shotsPerRound, lockedBlocks, accounts, theme, isLoaded, announcements, hasSeenTutorial, auditLogs, lastUpdated]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    if (!isLoaded) return;
    const currentFiscalYear = getFiscalYear(new Date());
    if (currentFiscalYear > lastFiscalYearChecked) {
      const activeMembers: Member[] = [];
      const newAlumni: Alumni[] = [...alumni];
      members.forEach(m => {
        const newGrade = m.grade + 1;
        if (newGrade > 4) {
          newAlumni.push({
            id: crypto.randomUUID(),
            name: m.name,
            gender: m.gender,
            graduationYear: `${lastFiscalYearChecked}年度卒業`
          });
        } else {
          activeMembers.push({ ...m, grade: newGrade });
        }
      });
      setMembers(activeMembers);
      setAlumni(newAlumni);
      setLastFiscalYearChecked(currentFiscalYear);
    }
  }, [isLoaded, lastFiscalYearChecked, members, alumni]);

  useEffect(() => {
    if (!isLoaded) return;
    setArchers(prev => prev.map(a => {
      if (a.isSeparator) return a;
      const currentMarks = [...a.marks];
      if (currentMarks.length < shotsPerRound) {
        return { ...a, marks: [...currentMarks, ...Array(shotsPerRound - currentMarks.length).fill(Mark.none)] };
      } else if (currentMarks.length > shotsPerRound) {
        return { ...a, marks: currentMarks.slice(0, shotsPerRound) };
      }
      return a;
    }));
  }, [shotsPerRound, isLoaded]);

  const addNotification = (message: string, type: NotificationType = 'info', title?: string) => {
    const defaultTitles: Record<NotificationType, string> = {
      info: 'お知らせ',
      success: '完了',
      warning: '注意',
      error: 'エラー'
    };
    const newNotif: Notification = {
      id: crypto.randomUUID(),
      title: title || defaultTitles[type],
      message,
      type,
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev.slice(0, 4)]); // Keep last 5
    setTimeout(() => removeNotification(newNotif.id), 5000); // Auto remove after 5s
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const addAuditLog = (action: string, details: string, severity: 'low' | 'medium' | 'high' = 'low', overrideUser?: { id: string, name: string }) => {
    const newLog: AuditLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      userId: overrideUser?.id || currentUser?.id || 'guest',
      userName: overrideUser?.name || currentUser?.name || 'ゲスト',
      action,
      details,
      severity
    };
    setAuditLogs(prev => [newLog, ...prev.slice(0, 99)]); // Keep last 100
    setLastUpdated(Date.now());
  };


  const addArcher = () => {
    setArchers(prev => [...prev, createArcher(shotsPerRound)]);
    setLastUpdated(Date.now());
  };
  const addSeparator = () => {
    setArchers(prev => [...prev, createSeparator()]);
    setLastUpdated(Date.now());
  };
  const addTotalCalculator = () => {
    setArchers(prev => [...prev, createTotalCalculator(shotsPerRound)]);
    setLastUpdated(Date.now());
  };

  const insertArcher = (index: number) => {
    setArchers(prev => {
      const newArchers = [...prev];
      newArchers.splice(index, 0, createArcher(shotsPerRound));
      return newArchers;
    });
    setLastUpdated(Date.now());
  };

  const insertSeparator = (index: number) => {
    setArchers(prev => {
      const newArchers = [...prev];
      newArchers.splice(index, 0, createSeparator());
      return newArchers;
    });
    setLastUpdated(Date.now());
  };

  const insertTotalCalculator = (index: number) => {
    setArchers(prev => {
      const newArchers = [...prev];
      newArchers.splice(index, 0, createTotalCalculator(shotsPerRound));
      return newArchers;
    });
    setLastUpdated(Date.now());
  };

  const deleteArcher = (id: string) => {
    setArchers(prev => prev.filter(a => a.id !== id));
    setLastUpdated(Date.now());
  };

  const pushUndo = () => {
    setUndoStack(prev => {
      const newStack = [...prev, { archers, lockedBlocks }];
      if (newStack.length > 10) return newStack.slice(newStack.length - 10);
      return newStack;
    });
    setRedoStack([]);
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    const previousState = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, { archers, lockedBlocks }]);
    setArchers(previousState.archers);
    setLockedBlocks(previousState.lockedBlocks);
    setLastUpdated(Date.now());
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, { archers, lockedBlocks }]);
    setArchers(nextState.archers);
    setLockedBlocks(nextState.lockedBlocks);
    setLastUpdated(Date.now());
  };

  const toggleLock = (calculatorId: string, blockIndex: number) => {
    pushUndo();
    setLockedBlocks(prev => ({
      ...prev,
      [`${calculatorId}-${blockIndex}`]: !prev[`${calculatorId}-${blockIndex}`]
    }));
    setLastUpdated(Date.now());
  };

  const toggleMark = (archerId: string, markIndex: number) => {
    pushUndo();
    setArchers(prev => prev.map(a => {
      if (a.id === archerId) {
        const newMarks = [...a.marks];
        const current = newMarks[markIndex];
        newMarks[markIndex] = current === Mark.none ? Mark.hit : current === Mark.hit ? Mark.miss : Mark.none;
        return { ...a, marks: newMarks };
      }
      return a;
    }));
  };

  const setMark = (archerId: string, markIndex: number, mark: Mark) => {
    pushUndo();
    setArchers(prev => prev.map(a => {
      if (a.id === archerId) {
        const newMarks = [...a.marks];
        newMarks[markIndex] = mark;
        return { ...a, marks: newMarks };
      }
      return a;
    }));
  };

  const updateArcherInfo = (archerId: string, name: string, gender: Gender, grade: number, isGuest: boolean, color?: string, avatarUrl?: string) => {
    setArchers(prev => prev.map(a => a.id === archerId ? { ...a, name, gender, grade, isGuest, color, avatarUrl } : a));
  };

  const moveArcher = (sourceId: string, targetId: string) => {
    const sourceIndex = archers.findIndex(a => a.id === sourceId);
    const targetIndex = archers.findIndex(a => a.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) return;

    pushUndo();
    setArchers(prev => {
      const sIdx = prev.findIndex(a => a.id === sourceId);
      const tIdx = prev.findIndex(a => a.id === targetId);
      if (sIdx === -1 || tIdx === -1 || sIdx === tIdx) return prev;

      const newArchers = [...prev];
      const [moved] = newArchers.splice(sIdx, 1);
      newArchers.splice(tIdx, 0, moved);
      return newArchers;
    });
  };

  const saveSessionAndReset = (note: string, tags: string[] = []) => {
    const entries = archers.filter(a => !a.isSeparator && !a.isTotalCalculator && a.name && a.marks.some(m => m !== Mark.none)).map(a => ({
      name: a.name,
      gender: a.gender,
      grade: a.grade,
      totalShots: a.marks.filter(m => m !== Mark.none).length,
      hits: a.marks.filter(m => m === Mark.hit).length,
      isGuest: a.isGuest
    }));

    let newHistory = history;
    if (entries.length > 0) {
      newHistory = [...history, { id: crypto.randomUUID(), date: new Date().toISOString(), entries }];
      setHistory(newHistory);
    }

    let newSessions = sessions;
    if (archers.length > 0) {
      newSessions = [{
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        archers,
        shotCount: shotsPerRound,
        note,
        tags,
        syncStatus: 'pending'
      }, ...sessions];
      setSessions(newSessions);
    }

    const newArchers = [createArcher(shotsPerRound), createArcher(shotsPerRound), createArcher(shotsPerRound)];
    setArchers(newArchers);

    // Sync to cloud
    const now = Date.now();
    setLastUpdated(now);
    const data: SavedData = {
      ...getLatestData(),
      currentArchers: newArchers,
      history: newHistory,
      sessions: newSessions,
      lastUpdated: now
    };
    syncToCloud(data);
    addAuditLog("練習記録保存", `ノート: ${note || "なし"}`, "low");
    addNotification("練習記録を保存しました", "success", "記録完了");
  };

  const addMember = (name: string, gender: Gender, grade: number) => {
    if (name) {
      const newMember = { id: crypto.randomUUID(), name, gender, grade };
      setMembers(prev => [...prev, newMember]);
      setLastUpdated(Date.now());
      addAuditLog("部員追加", `${name} を追加しました`, "medium");
    }
  };

  const updateMember = (id: string, name: string, gender: Gender, grade: number, color?: string, avatarUrl?: string) => {
    const oldMember = members.find(m => m.id === id);
    if (!oldMember) return;
    const oldName = oldMember.name;

    setMembers(prev => prev.map(m => m.id === id ? { ...m, name, gender, grade, color, avatarUrl } : m));

    if (oldName !== name) {
      setHistory(prev => prev.map(h => ({
        ...h,
        entries: h.entries.map(e => e.name === oldName ? { ...e, name } : e)
      })));
      setSessions(prev => prev.map(s => ({
        ...s,
        archers: s.archers.map(a => a.name === oldName ? { ...a, name } : a)
      })));
    }
    setLastUpdated(Date.now());
  };

  const deleteMember = (id: string) => {
    const target = members.find(m => m.id === id);
    const newMembers = members.filter(m => m.id !== id);
    setMembers(newMembers);
    const now = Date.now();
    setLastUpdated(now);
    syncToCloud({ ...getLatestData(), members: newMembers, lastUpdated: now });
    addAuditLog("部員削除", `${target?.name || id} を削除しました`, "high");
  };

  const deleteAlumni = (id: string) => {
    const newAlumni = alumni.filter(a => a.id !== id);
    setAlumni(newAlumni);
    syncToCloud({ ...getLatestData(), alumni: newAlumni });
  };

  const promoteToAlumni = (id: string) => {
    const member = members.find(m => m.id === id);
    if (!member) return;

    const fiscalYear = getFiscalYear(new Date());
    const newAlumniItem: Alumni = {
      id: member.id,
      name: member.name,
      gender: member.gender,
      graduationYear: `${fiscalYear} 年度`
    };

    const newMembers = members.filter(m => m.id !== id);
    const newAlumni = [newAlumniItem, ...alumni];

    setMembers(newMembers);
    setAlumni(newAlumni);
    syncToCloud({ ...getLatestData(), members: newMembers, alumni: newAlumni });
  };

  const bulkPromoteToAlumni = (ids: string[]) => {
    const fiscalYear = getFiscalYear(new Date());
    const targets = members.filter(m => ids.includes(m.id));
    if (targets.length === 0) return;

    const newAlumniItems: Alumni[] = targets.map(m => ({
      id: m.id,
      name: m.name,
      gender: m.gender,
      graduationYear: `${fiscalYear} 年度`
    }));

    const newMembers = members.filter(m => !ids.includes(m.id));
    const newAlumni = [...newAlumniItems, ...alumni];

    setMembers(newMembers);
    setAlumni(newAlumni);
    syncToCloud({ ...getLatestData(), members: newMembers, alumni: newAlumni });
  };

  const bulkDeleteMembers = (ids: string[]) => {
    const newMembers = members.filter(m => !ids.includes(m.id));
    setMembers(newMembers);
    syncToCloud({ ...getLatestData(), members: newMembers });
  };

  const bulkPromoteGrades = (ids: string[]) => {
    const fiscalYear = getFiscalYear(new Date());
    const newAlumniItems: Alumni[] = [];
    const updatedMembers: Member[] = [];

    members.forEach(m => {
      if (ids.includes(m.id)) {
        if (m.grade >= 4) {
          newAlumniItems.push({
            id: m.id,
            name: m.name,
            gender: m.gender,
            graduationYear: `${fiscalYear} 年度`
          });
        } else {
          updatedMembers.push({ ...m, grade: m.grade + 1 });
        }
      } else {
        updatedMembers.push(m);
      }
    });

    const newAlumni = [...newAlumniItems, ...alumni];
    setMembers(updatedMembers);
    setAlumni(newAlumni);
    syncToCloud({ ...getLatestData(), members: updatedMembers, alumni: newAlumni });
  };


  const markTutorialAsSeen = () => {
    setHasSeenTutorial(true);
    setLastUpdated(Date.now());
    syncToCloud({ ...getLatestData(), hasSeenTutorial: true });
  };

  const addAnnouncement = (title: string, content: string, isImportant: boolean) => {
    const newAnnouncement: Announcement = {
      id: crypto.randomUUID(),
      title,
      content,
      date: new Date().toISOString(),
      author: currentUser?.id || 'admin',
      isImportant
    };
    const newAnnouncements = [newAnnouncement, ...announcements];
    setAnnouncements(newAnnouncements);
    setLastUpdated(Date.now());
    addAuditLog("お知らせ追加", `タイトル: ${title}`, "medium");
    syncToCloud({ ...getLatestData(), announcements: newAnnouncements });
  };

  const deleteAnnouncement = (id: string) => {
    const newAnnouncements = announcements.filter(a => a.id !== id);
    setAnnouncements(newAnnouncements);
    setLastUpdated(Date.now());
    addAuditLog("お知らせ削除", `ID: ${id}`, "medium");
    syncToCloud({ ...getLatestData(), announcements: newAnnouncements });
  };

  const archiveSession = (id: string) => {
    const newSessions = sessions.map(s => s.id === id ? { ...s, isArchived: true, syncStatus: 'pending' as SyncStatus } : s);
    setSessions(newSessions);
    const data: SavedData = {
      currentArchers: archers,
      members,
      alumni,
      history,
      sessions: newSessions,
      trash,
      lastFiscalYearChecked,
      shotsPerRound,
      isFirstLaunch: false,
      lockedBlocks,
      accounts,
      theme
    };
    syncToCloud(data);
  };

  const unarchiveSession = (id: string) => {
    const newSessions = sessions.map(s => s.id === id ? { ...s, isArchived: false, syncStatus: 'pending' as SyncStatus } : s);
    setSessions(newSessions);
    const data: SavedData = {
      currentArchers: archers,
      members,
      alumni,
      history,
      sessions: newSessions,
      trash,
      lastFiscalYearChecked,
      shotsPerRound,
      isFirstLaunch: false,
      lockedBlocks,
      accounts,
      theme
    };
    syncToCloud(data);
  };

  const updateSessionTags = (id: string, tags: string[]) => {
    const newSessions = sessions.map(s => s.id === id ? { ...s, tags, syncStatus: 'pending' as SyncStatus } : s);
    setSessions(newSessions);
    const data: SavedData = {
      currentArchers: archers,
      members,
      alumni,
      history,
      sessions: newSessions,
      trash,
      lastFiscalYearChecked,
      shotsPerRound,
      isFirstLaunch: false,
      lockedBlocks,
      accounts,
      theme
    };
    syncToCloud(data);
  };

  const deleteSession = (id: string) => {
    const sessionToDelete = sessions.find(s => s.id === id);
    if (!sessionToDelete) return;

    const newSessions = sessions.filter(s => s.id !== id);
    const newTrash = [sessionToDelete, ...trash];

    setSessions(newSessions);
    setTrash(newTrash);

    const data: SavedData = {
      currentArchers: archers,
      members,
      alumni,
      history,
      sessions: newSessions,
      trash: newTrash,
      lastFiscalYearChecked,
      shotsPerRound,
      isFirstLaunch: false,
      lockedBlocks
    };
    syncToCloud(data);
  };

  const restoreSession = (id: string) => {
    const sessionToRestore = trash.find(s => s.id === id);
    if (!sessionToRestore) return;

    const newTrash = trash.filter(s => s.id !== id);
    const newSessions = [...sessions, { ...sessionToRestore, syncStatus: 'pending' }];

    setTrash(newTrash);
    setSessions(newSessions);

    const data: SavedData = {
      currentArchers: archers,
      members,
      alumni,
      history,
      sessions: newSessions,
      trash: newTrash,
      lastFiscalYearChecked,
      shotsPerRound,
      isFirstLaunch: false,
      lockedBlocks
    };
    syncToCloud(data);
  };

  const permanentlyDeleteSession = (id: string) => {
    const newTrash = trash.filter(s => s.id !== id);
    setTrash(newTrash);

    const data: SavedData = {
      currentArchers: archers,
      members,
      alumni,
      history,
      sessions,
      trash: newTrash,
      lastFiscalYearChecked,
      shotsPerRound,
      isFirstLaunch: false,
      lockedBlocks
    };
    syncToCloud(data);
  };

  const updateSessionShotCount = (id: string, count: number) => {
    const newSessions = sessions.map(s => {
      if (s.id === id) {
        return {
          ...s,
          shotCount: count,
          syncStatus: 'pending',
          archers: s.archers.map(a => {
            if (a.isSeparator) return a;
            const currentMarks = [...a.marks];
            if (currentMarks.length < count) {
              return { ...a, marks: [...currentMarks, ...Array(count - currentMarks.length).fill(Mark.none)] };
            } else if (currentMarks.length > count) {
              return { ...a, marks: currentMarks.slice(0, count) };
            }
            return a;
          })
        };
      }
      return s;
    });
    setSessions(newSessions);
    const data: SavedData = {
      currentArchers: archers,
      members,
      alumni,
      history,
      sessions: newSessions,
      trash,
      lastFiscalYearChecked,
      shotsPerRound,
      isFirstLaunch: false,
      lockedBlocks
    };
    syncToCloud(data);
  };

  const deleteArcherFromSession = (sessionId: string, archerId: string) => {
    const newSessions = sessions.map(s => s.id === sessionId ? { ...s, syncStatus: 'pending', archers: s.archers.filter(a => a.id !== archerId) } : s);
    setSessions(newSessions);
    const data: SavedData = {
      currentArchers: archers,
      members,
      alumni,
      history,
      sessions: newSessions,
      trash,
      lastFiscalYearChecked,
      shotsPerRound,
      isFirstLaunch: false,
      lockedBlocks
    };
    syncToCloud(data);
  };

  const addArcherToSession = (sessionId: string) => {
    const newSessions = sessions.map(s => s.id === sessionId ? { ...s, syncStatus: 'pending', archers: [...s.archers, createArcher(s.shotCount)] } : s);
    setSessions(newSessions);
    const data: SavedData = {
      currentArchers: archers,
      members,
      alumni,
      history,
      sessions: newSessions,
      trash,
      lastFiscalYearChecked,
      shotsPerRound,
      isFirstLaunch: false,
      lockedBlocks
    };
    syncToCloud(data);
  };

  const addSeparatorToSession = (sessionId: string) => {
    const newSessions = sessions.map(s => s.id === sessionId ? { ...s, syncStatus: 'pending', archers: [...s.archers, createSeparator()] } : s);
    setSessions(newSessions);
    const data: SavedData = {
      currentArchers: archers,
      members,
      alumni,
      history,
      sessions: newSessions,
      trash,
      lastFiscalYearChecked,
      shotsPerRound,
      isFirstLaunch: false,
      lockedBlocks
    };
    syncToCloud(data);
  };

  const addTotalToSession = (sessionId: string) => {
    const newSessions = sessions.map(s => s.id === sessionId ? { ...s, syncStatus: 'pending', archers: [...s.archers, createTotalCalculator(s.shotCount)] } : s);
    setSessions(newSessions);
    const data: SavedData = {
      currentArchers: archers,
      members,
      alumni,
      history,
      sessions: newSessions,
      trash,
      lastFiscalYearChecked,
      shotsPerRound,
      isFirstLaunch: false,
      lockedBlocks
    };
    syncToCloud(data);
  };

  const toggleHistoryMark = (sessionId: string, archerId: string, markIndex: number) => {
    if (!isAdminMode) return;
    const newSessions = sessions.map(s => {
      if (s.id === sessionId) {
        return {
          ...s,
          syncStatus: 'pending',
          archers: s.archers.map(a => {
            if (a.id === archerId) {
              const newMarks = [...a.marks];
              const current = newMarks[markIndex];
              newMarks[markIndex] = current === Mark.none ? Mark.hit : current === Mark.hit ? Mark.miss : Mark.none;
              return { ...a, marks: newMarks };
            }
            return a;
          })
        };
      }
      return s;
    });
    setSessions(newSessions);
    const data: SavedData = {
      currentArchers: archers,
      members,
      alumni,
      history,
      sessions: newSessions,
      trash,
      lastFiscalYearChecked,
      shotsPerRound,
      isFirstLaunch: false,
      lockedBlocks
    };
    syncToCloud(data);
  };

  const updateHistoryArcherInfo = (sessionId: string, archerId: string, name: string, gender: Gender, grade: number, isGuest: boolean) => {
    const newSessions = sessions.map(s => {
      if (s.id === sessionId) {
        return {
          ...s,
          syncStatus: 'pending',
          archers: s.archers.map(a => a.id === archerId ? { ...a, name, gender, grade, isGuest } : a)
        };
      }
      return s;
    });
    setSessions(newSessions);
    const data: SavedData = {
      currentArchers: archers,
      members,
      alumni,
      history,
      sessions: newSessions,
      trash,
      lastFiscalYearChecked,
      shotsPerRound,
      isFirstLaunch: false,
      lockedBlocks
    };
    syncToCloud(data);
  };

  const moveHistoryArcher = (sessionId: string, sourceId: string, targetId: string) => {
    const newSessions = sessions.map(s => {
      if (s.id === sessionId) {
        const sourceIndex = s.archers.findIndex(a => a.id === sourceId);
        const targetIndex = s.archers.findIndex(a => a.id === targetId);
        if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) return s;

        const newArchers = [...s.archers];
        const [moved] = newArchers.splice(sourceIndex, 1);
        newArchers.splice(targetIndex, 0, moved);
        return { ...s, syncStatus: 'pending', archers: newArchers };
      }
      return s;
    });
    setSessions(newSessions);
    const data: SavedData = {
      currentArchers: archers,
      members,
      alumni,
      history,
      sessions: newSessions,
      trash,
      lastFiscalYearChecked,
      shotsPerRound,
      isFirstLaunch: false,
      lockedBlocks
    };
    syncToCloud(data);
  };

  const updateSessionNote = (sessionId: string, note: string) => {
    const newSessions = sessions.map(s => s.id === sessionId ? { ...s, syncStatus: 'pending', note } : s);
    setSessions(newSessions);
    const data: SavedData = {
      currentArchers: archers,
      members,
      alumni,
      history,
      sessions: newSessions,
      trash,
      lastFiscalYearChecked,
      shotsPerRound,
      isFirstLaunch: false,
      lockedBlocks
    };
    syncToCloud(data);
  };

  const updateSessionDate = (sessionId: string, date: string) => {
    const newSessions = sessions.map(s => s.id === sessionId ? { ...s, syncStatus: 'pending', date } : s);
    setSessions(newSessions);
    const data: SavedData = {
      currentArchers: archers,
      members,
      alumni,
      history,
      sessions: newSessions,
      trash,
      lastFiscalYearChecked,
      shotsPerRound,
      isFirstLaunch: false,
      lockedBlocks
    };
    syncToCloud(data);
  };

  const getDisplayName = (name: string) => {
    const separator = name.includes(" ") ? " " : (name.includes("　") ? "　" : "");
    let surname = name;
    let firstName = "";
    if (separator) {
      const parts = name.split(separator);
      if (parts.length >= 1) surname = parts[0];
      if (parts.length >= 2) firstName = parts[1];
    }
    const sameSurnameCount = members.filter(m => {
      const s = m.name.includes(" ") ? m.name.split(" ")[0] : (m.name.includes("　") ? m.name.split("　")[0] : m.name);
      return s === surname;
    }).length;

    if (sameSurnameCount > 1 && firstName) {
      return `${surname}（${firstName.charAt(0)}）`;
    }
    return surname;
  };

  const getGroupArchers = (calculatorId: string) => {
    const index = archers.findIndex(a => a.id === calculatorId);
    if (index === -1) return [];
    const group: Archer[] = [];
    for (let i = index - 1; i >= 0; i--) {
      const target = archers[i];
      if (target.isSeparator || target.isTotalCalculator) break;
      group.push(target);
    }
    return group;
  };

  const getHistoryGroupArchers = (sessionId: string, calculatorId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return [];
    const index = session.archers.findIndex(a => a.id === calculatorId);
    if (index === -1) return [];
    const group: Archer[] = [];
    for (let i = index - 1; i >= 0; i--) {
      const target = session.archers[i];
      if (target.isSeparator || target.isTotalCalculator) break;
      group.push(target);
    }
    return group;
  };

  const getCalculatorForArcher = (archerId: string) => {
    const index = archers.findIndex(a => a.id === archerId);
    if (index === -1) return null;
    for (let i = index + 1; i < archers.length; i++) {
      if (archers[i].isTotalCalculator || archers[i].isSeparator) return archers[i].id;
    }
    return null;
  };

  const exportDataToString = () => {
    try {
      const data: SavedData = {
        currentArchers: archers,
        members,
        alumni,
        history,
        sessions,
        trash,
        lastFiscalYearChecked,
        shotsPerRound,
        isFirstLaunch: false
      };
      return JSON.stringify(data, null, 2);
    } catch {
      return "";
    }
  };

  const importDataFromString = (json: string) => {
    try {
      const data: SavedData = JSON.parse(json);
      setArchers(data.currentArchers || []);
      setMembers(data.members || []);
      setAlumni(data.alumni || []);
      setHistory(data.history || []);
      setSessions(data.sessions || []);
      setTrash(data.trash || []);
      setTheme(data.theme || 'light');
      setHasSeenTutorial(data.hasSeenTutorial || false);
      setAnnouncements(data.announcements || []);
      setLastFiscalYearChecked(data.lastFiscalYearChecked || 2024);
      setShotsPerRound(data.shotsPerRound || 12);
      addNotification("最新データを読み込みました", "info", "復旧");
      return true;
    } catch {
      return false;
    }
  };

  const login = async (id: string, plainPassword: string) => {
    const hashedInput = await hashPassword(plainPassword);
    const account = accounts.find(a => a.id === id && a.passwordHash === hashedInput);
    if (account) {
      setCurrentUser(account);
      setIsAdminMode(account.role === UserRole.admin);
      addAuditLog("ログイン", `${account.name || account.id} がログインしました`, "low", { id: account.id, name: account.name || account.id });
      return true;
    }
    addAuditLog("ログイン失敗", `${id} のログインに失敗しました`, "medium", { id: id, name: "不明" });
    return false;
  };

  const logout = () => {
    if (currentUser) {
      addAuditLog("ログアウト", `${currentUser.name || currentUser.id} がログアウトしました`, "low", { id: currentUser.id, name: currentUser.name || currentUser.id });
    }
    setCurrentUser(null);
    setIsAdminMode(false);
  };

  const addAccount = (account: UserAccount) => {
    const newAccounts = [...accounts, account];
    setAccounts(newAccounts);
    addAuditLog("アカウント作成", `ID: ${account.id} (${account.role}) を作成しました`, "medium");
  };

  const deleteAccount = (id: string) => {
    const newAccounts = accounts.filter(a => a.id !== id);
    setAccounts(newAccounts);
    addAuditLog("アカウント削除", `ID: ${id} を削除しました`, "high");
  };

  return (
    <ScoreContext.Provider value={{
      archers, setArchers, members, setMembers, alumni, setAlumni, history, setHistory,
      sessions, setSessions, trash, setTrash, shotsPerRound, setShotsPerRound, isAdminMode, setIsAdminMode, lockedBlocks,
      syncStatus, lastSyncTime, accounts, setAccounts, currentUser, setCurrentUser,
      addArcher, addSeparator, addTotalCalculator, insertArcher, insertSeparator, insertTotalCalculator, deleteArcher, toggleMark, setMark, canUndo: undoStack.length > 0, canRedo: redoStack.length > 0, undo, redo, toggleLock, updateArcherInfo, moveArcher,
      saveSessionAndReset, addMember, updateMember, deleteMember, deleteAlumni, promoteToAlumni, bulkPromoteToAlumni, bulkDeleteMembers, bulkPromoteGrades, deleteSession, restoreSession, permanentlyDeleteSession,
      addAccount, deleteAccount,
      updateSessionShotCount, deleteArcherFromSession, addArcherToSession, addSeparatorToSession,
      addTotalToSession, toggleHistoryMark, updateHistoryArcherInfo, moveHistoryArcher, updateSessionNote,
      updateSessionDate,
      archiveSession,
      unarchiveSession,
      updateSessionTags,
      hasSeenTutorial, markTutorialAsSeen,
      announcements, addAnnouncement, deleteAnnouncement,
      notifications, addNotification, removeNotification,
      auditLogs,

      getDisplayName,
      getGroupArchers, getHistoryGroupArchers, getCalculatorForArcher, exportDataToString, importDataFromString,
      login, logout
    }}>
      {children}
    </ScoreContext.Provider>
  );
};
