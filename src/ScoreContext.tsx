import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Gender, Mark, Member, Alumni, Archer, PracticeRecord, SessionRecord, SavedData } from './types';
import { db } from './firebase';
import { ref, set } from 'firebase/database';

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
  updateArcherInfo: (archerId: string, name: string, gender: Gender, grade: number, isGuest: boolean) => void;
  moveArcher: (sourceId: string, targetId: string) => void;
  saveSessionAndReset: (note: string) => void;
  
  addMember: (name: string, gender: Gender, grade: number) => void;
  updateMember: (id: string, name: string, gender: Gender, grade: number) => void;
  deleteMember: (id: string) => void;
  deleteAlumni: (id: string) => void;
  
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
  
  getDisplayName: (name: string) => string;
  getGroupArchers: (calculatorId: string) => Archer[];
  getHistoryGroupArchers: (sessionId: string, calculatorId: string) => Archer[];
  getCalculatorForArcher: (archerId: string) => string | null;
  
  exportDataToString: () => string;
  importDataFromString: (json: string) => boolean;
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
  const [undoStack, setUndoStack] = useState<{archers: Archer[], lockedBlocks: Record<string, boolean>}[]>([]);
  const [redoStack, setRedoStack] = useState<{archers: Archer[], lockedBlocks: Record<string, boolean>}[]>([]);
  const [lockedBlocks, setLockedBlocks] = useState<Record<string, boolean>>({});
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [pendingSync, setPendingSync] = useState<NodeJS.Timeout | null>(null);
  const activeSyncs = useRef(0);

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
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    } else {
      const initialMembers = initialMembersData.map(m => ({ ...m, id: crypto.randomUUID() }));
      setMembers(initialMembers);
      setArchers([createArcher(12), createArcher(12), createArcher(12)]);
      setLastFiscalYearChecked(getFiscalYear(new Date()));
    }
    setIsLoaded(true);
  }, []);

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
      lockedBlocks
    };
    localStorage.setItem('nihon_u_kyudo_app', JSON.stringify(data));
  }, [archers, members, alumni, history, sessions, trash, lastFiscalYearChecked, shotsPerRound, lockedBlocks, isLoaded]);

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

  const syncToCloud = async (data: SavedData) => {
    activeSyncs.current += 1;
    setSyncStatus('syncing');
    let success = false;
    
    const sessionIds = new Set(data.sessions.map(s => s.id));
    const trashIds = new Set(data.trash?.map(s => s.id) || []);

    const dataToSave = {
      ...data,
      sessions: data.sessions.map(s => {
        const { syncStatus, ...rest } = s;
        return rest;
      }),
      trash: data.trash?.map(s => {
        const { syncStatus, ...rest } = s;
        return rest;
      })
    };

    try {
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
  };

  const addArcher = () => setArchers(prev => [...prev, createArcher(shotsPerRound)]);
  const addSeparator = () => setArchers(prev => [...prev, createSeparator()]);
  const addTotalCalculator = () => setArchers(prev => [...prev, createTotalCalculator(shotsPerRound)]);
  
  const insertArcher = (index: number) => setArchers(prev => {
    const newArchers = [...prev];
    newArchers.splice(index, 0, createArcher(shotsPerRound));
    return newArchers;
  });
  
  const insertSeparator = (index: number) => setArchers(prev => {
    const newArchers = [...prev];
    newArchers.splice(index, 0, createSeparator());
    return newArchers;
  });
  
  const insertTotalCalculator = (index: number) => setArchers(prev => {
    const newArchers = [...prev];
    newArchers.splice(index, 0, createTotalCalculator(shotsPerRound));
    return newArchers;
  });

  const deleteArcher = (id: string) => setArchers(prev => prev.filter(a => a.id !== id));

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
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, { archers, lockedBlocks }]);
    setArchers(nextState.archers);
    setLockedBlocks(nextState.lockedBlocks);
  };

  const toggleLock = (calculatorId: string, blockIndex: number) => {
    pushUndo();
    setLockedBlocks(prev => ({
      ...prev,
      [`${calculatorId}-${blockIndex}`]: !prev[`${calculatorId}-${blockIndex}`]
    }));
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

  const updateArcherInfo = (archerId: string, name: string, gender: Gender, grade: number, isGuest: boolean) => {
    setArchers(prev => prev.map(a => a.id === archerId ? { ...a, name, gender, grade, isGuest } : a));
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

  const saveSessionAndReset = (note: string) => {
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
        syncStatus: 'pending'
      }, ...sessions];
      setSessions(newSessions);
    }
    
    const newArchers = [createArcher(shotsPerRound), createArcher(shotsPerRound), createArcher(shotsPerRound)];
    setArchers(newArchers);

    // Sync to cloud
    const data: SavedData = {
      currentArchers: newArchers,
      members,
      alumni,
      history: newHistory,
      sessions: newSessions,
      trash,
      lastFiscalYearChecked,
      shotsPerRound,
      isFirstLaunch: false,
      lockedBlocks
    };
    syncToCloud(data);
  };

  const addMember = (name: string, gender: Gender, grade: number) => {
    if (name) setMembers(prev => [...prev, { id: crypto.randomUUID(), name, gender, grade }]);
  };

  const updateMember = (id: string, name: string, gender: Gender, grade: number) => {
    const oldMember = members.find(m => m.id === id);
    if (!oldMember) return;
    const oldName = oldMember.name;
    
    setMembers(prev => prev.map(m => m.id === id ? { ...m, name, gender, grade } : m));
    
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
  };

  const deleteMember = (id: string) => setMembers(prev => prev.filter(m => m.id !== id));
  const deleteAlumni = (id: string) => setAlumni(prev => prev.filter(a => a.id !== id));

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
      setLastFiscalYearChecked(data.lastFiscalYearChecked || 2000);
      setShotsPerRound(data.shotsPerRound || 12);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <ScoreContext.Provider value={{
      archers, setArchers, members, setMembers, alumni, setAlumni, history, setHistory,
      sessions, setSessions, trash, setTrash, shotsPerRound, setShotsPerRound, isAdminMode, setIsAdminMode, lockedBlocks,
      syncStatus, lastSyncTime,
      addArcher, addSeparator, addTotalCalculator, insertArcher, insertSeparator, insertTotalCalculator, deleteArcher, toggleMark, setMark, canUndo: undoStack.length > 0, canRedo: redoStack.length > 0, undo, redo, toggleLock, updateArcherInfo, moveArcher,
      saveSessionAndReset, addMember, updateMember, deleteMember, deleteAlumni, deleteSession, restoreSession, permanentlyDeleteSession,
      updateSessionShotCount, deleteArcherFromSession, addArcherToSession, addSeparatorToSession,
      addTotalToSession, toggleHistoryMark, updateHistoryArcherInfo, moveHistoryArcher, updateSessionNote, updateSessionDate,
      getDisplayName, getGroupArchers, getHistoryGroupArchers, getCalculatorForArcher, exportDataToString, importDataFromString
    }}>
      {children}
    </ScoreContext.Provider>
  );
};
