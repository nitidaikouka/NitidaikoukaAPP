import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Gender, Mark, Member, Alumni, Archer, PracticeRecord, SessionRecord, SavedData } from './types';
import { db, auth } from './firebase';
import { ref, set, onValue } from 'firebase/database';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

export const createArcher = (count: number): Archer => ({
    id: Math.random().toString(36).slice(2),
    name: "",
    gender: Gender.unknown,
    grade: 1,
    marks: Array(count).fill(Mark.none),
    isSeparator: false,
    isTotalCalculator: false,
    isGuest: false
});

export const createSeparator = (): Archer => ({
    id: Math.random().toString(36).slice(2),
    name: "",
    gender: Gender.unknown,
    grade: 0,
    marks: [],
    isSeparator: true,
    isTotalCalculator: false,
    isGuest: false
});

export const createTotalCalculator = (count: number): Archer => ({
    id: Math.random().toString(36).slice(2),
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
    exportDataToFile: () => Promise<void>;
    importDataFromPicker: () => Promise<boolean>;
    importDataFromCode: (json: string) => boolean;

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
    updateSessionDate: (sessionId: string, date: number) => void;

    getDisplayName: (name: string) => string;
    getGroupArchers: (calculatorId: string) => Archer[];
    getHistoryGroupArchers: (sessionId: string, calculatorId: string) => Archer[];
    getCalculatorForArcher: (archerId: string) => string | null;

    exportDataToString: () => string;
    importDataFromString: (json: string) => boolean;
    resetCurrentSession: () => void;
}

export const ScoreContext = createContext<ScoreContextType | null>(null);

export const useScoreModel = () => {
    const context = useContext(ScoreContext);
    if (!context) throw new Error("useScoreModel must be used within ScoreProvider");
    return context;
};

const STORAGE_KEY = 'nihon_u_kyudo_app';

export const ScoreProvider = ({ children }: { children: ReactNode }) => {
    const [archers, setArchers] = useState<Archer[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [alumni, setAlumni] = useState<Alumni[]>([]);
    const [history, setHistory] = useState<PracticeRecord[]>([]);
    const [isAdminMode, setIsAdminMode] = useState<boolean>(true);
    const [lastFiscalYearChecked, setLastFiscalYearChecked] = useState<number>(2000);
    const [isLoaded, setIsLoaded] = useState(false);
    const [undoStack, setUndoStack] = useState<{ archers: Archer[], lockedBlocks: Record<string, boolean> }[]>([]);
    const [redoStack, setRedoStack] = useState<{ archers: Archer[], lockedBlocks: Record<string, boolean> }[]>([]);
    const [lockedBlocks, setLockedBlocks] = useState<Record<string, boolean>>({});
    const [sessions, setSessions] = useState<SessionRecord[]>([]);
    const [trash, setTrash] = useState<SessionRecord[]>([]);
    const [shotsPerRound, setShotsPerRound] = useState<number>(12);
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
    const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
    const activeSyncs = useRef(0);

    const getFiscalYear = (date: number | string | Date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = d.getMonth() + 1;
        return month >= 4 ? year : year - 1;
    };

    useEffect(() => {
        setIsAdminMode(true);
    }, []);

    // AsyncStorage & Firebase 監視
    useEffect(() => {
        const loadAndListen = async () => {
            try {
                // 1. まずローカルからロード
                const dataStr = await AsyncStorage.getItem(STORAGE_KEY);
                if (dataStr) {
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
                } else {
                    const initialMembers = initialMembersData.map(m => ({ ...m, id: Math.random().toString(36).slice(2) }));
                    setMembers(initialMembers);
                    setArchers([createArcher(12), createArcher(12), createArcher(12)]);
                    setLastFiscalYearChecked(getFiscalYear(new Date()));
                }

                // 2. クラウドからの更新を待機
                const appDataRef = ref(db, 'appData');
                onValue(appDataRef, (snapshot) => {
                    const cloudData: SavedData = snapshot.val();
                    if (cloudData) {
                        // クラウドのデータがあれば更新（マージロジックは簡易的に後から来たものを優先）
                        if (cloudData.members) setMembers(cloudData.members);
                        if (cloudData.alumni) setAlumni(cloudData.alumni);
                        if (cloudData.history) setHistory(cloudData.history);
                        if (cloudData.sessions) setSessions(cloudData.sessions);
                        if (cloudData.trash) setTrash(cloudData.trash);
                    }
                });
            } catch (e) {
                console.error("Failed to sync data", e);
            }
            setIsLoaded(true);
        };
        loadAndListen();
    }, []);

    // データが変わるたびにAsyncStorageへ保存
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
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(e =>
            console.error("Failed to save data to AsyncStorage", e)
        );
    }, [archers, members, alumni, history, sessions, trash, lastFiscalYearChecked, shotsPerRound, lockedBlocks, isLoaded]);

    // 年度更新
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
                        id: Math.random().toString(36).slice(2),
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
    }, [isLoaded]);

    // 矢数変更時のアーチャー調整
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
                const { syncStatus: _ss, ...rest } = s;
                return rest;
            }),
            trash: data.trash?.map(s => {
                const { syncStatus: _ss, ...rest } = s;
                return rest;
            })
        };

        try {
            await set(ref(db, 'appData'), dataToSave);
            success = true;
            setSessions(prev => prev.map(s => sessionIds.has(s.id) ? { ...s, syncStatus: 'synced' } : s));
            setTrash(prev => prev.map(s => trashIds.has(s.id) ? { ...s, syncStatus: 'synced' } : s));
            setLastSyncTime(new Date());
        } catch (e) {
            console.error("Firebase sync failed", e);
            setSessions(prev => prev.map(s => sessionIds.has(s.id) && s.syncStatus === 'pending' ? { ...s, syncStatus: 'error' } : s));
            setTrash(prev => prev.map(s => trashIds.has(s.id) && s.syncStatus === 'pending' ? { ...s, syncStatus: 'error' } : s));
        } finally {
            activeSyncs.current -= 1;
            if (activeSyncs.current === 0 && success) setSyncStatus('synced');
            else if (!success) setSyncStatus('error');
        }
    };

    const addArcher = () => setArchers(prev => [...prev, createArcher(shotsPerRound)]);
    const addSeparator = () => setArchers(prev => [...prev, createSeparator()]);
    const addTotalCalculator = () => setArchers(prev => [...prev, createTotalCalculator(shotsPerRound)]);

    const insertArcher = (index: number) => setArchers(prev => {
        const n = [...prev]; n.splice(index, 0, createArcher(shotsPerRound)); return n;
    });
    const insertSeparator = (index: number) => setArchers(prev => {
        const n = [...prev]; n.splice(index, 0, createSeparator()); return n;
    });
    const insertTotalCalculator = (index: number) => setArchers(prev => {
        const n = [...prev]; n.splice(index, 0, createTotalCalculator(shotsPerRound)); return n;
    });

    const deleteArcher = (id: string) => setArchers(prev => prev.filter(a => a.id !== id));

    const pushUndo = () => {
        setUndoStack(prev => {
            const newStack = [...prev, { archers, lockedBlocks }];
            return newStack.length > 10 ? newStack.slice(-10) : newStack;
        });
        setRedoStack([]);
    };

    const undo = () => {
        if (undoStack.length === 0) return;
        const prev = undoStack[undoStack.length - 1];
        setUndoStack(s => s.slice(0, -1));
        setRedoStack(s => [...s, { archers, lockedBlocks }]);
        setArchers(prev.archers);
        setLockedBlocks(prev.lockedBlocks);
    };

    const redo = () => {
        if (redoStack.length === 0) return;
        const next = redoStack[redoStack.length - 1];
        setRedoStack(s => s.slice(0, -1));
        setUndoStack(s => [...s, { archers, lockedBlocks }]);
        setArchers(next.archers);
        setLockedBlocks(next.lockedBlocks);
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

    const makeData = (overrides: Partial<SavedData> = {}): SavedData => ({
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
        ...overrides
    });

    const exportDataToString = () => {
        return JSON.stringify(makeData());
    };

    const saveSessionAndReset = (note: string) => {
        const entries = archers
            .filter(a => !a.isSeparator && !a.isTotalCalculator && a.name && a.marks.some(m => m !== Mark.none))
            .map(a => ({
                name: a.name, gender: a.gender, grade: a.grade,
                totalShots: a.marks.filter(m => m !== Mark.none).length,
                hits: a.marks.filter(m => m === Mark.hit).length,
                isGuest: a.isGuest
            }));

        let newHistory = history;
        if (entries.length > 0) {
            newHistory = [...history, { id: Math.random().toString(36).slice(2), date: Date.now(), entries }];
            setHistory(newHistory);
        }

        let newSessions = sessions;
        if (archers.length > 0) {
            newSessions = [{
                id: Math.random().toString(36).slice(2),
                date: Date.now(),
                archers, shotCount: shotsPerRound, note,
                syncStatus: 'pending'
            }, ...sessions];
            setSessions(newSessions);
        }

        const newArchers = [createArcher(shotsPerRound), createArcher(shotsPerRound), createArcher(shotsPerRound)];
        setArchers(newArchers);
        setLockedBlocks({});
        setUndoStack([]);
        setRedoStack([]);

        syncToCloud(makeData({ currentArchers: newArchers, history: newHistory, sessions: newSessions, lockedBlocks: {} }));
    };

    const resetCurrentSession = () => {
        const newArchers = [createArcher(shotsPerRound), createArcher(shotsPerRound), createArcher(shotsPerRound)];
        setArchers(newArchers);
        setLockedBlocks({});
        setUndoStack([]);
        setRedoStack([]);
    };

    const addMember = (name: string, gender: Gender, grade: number) => {
        if (name) setMembers(prev => [...prev, { id: Math.random().toString(36).slice(2), name, gender, grade }]);
    };

    const updateMember = (id: string, name: string, gender: Gender, grade: number) => {
        const oldMember = members.find(m => m.id === id);
        if (!oldMember) return;
        const oldName = oldMember.name;
        setMembers(prev => prev.map(m => m.id === id ? { ...m, name, gender, grade } : m));
        if (oldName !== name) {
            setHistory(prev => prev.map(h => ({ ...h, entries: h.entries.map(e => e.name === oldName ? { ...e, name } : e) })));
            setSessions(prev => prev.map(s => ({ ...s, archers: s.archers.map(a => a.name === oldName ? { ...a, name } : a) })));
        }
    };

    const deleteMember = (id: string) => setMembers(prev => prev.filter(m => m.id !== id));
    const deleteAlumni = (id: string) => setAlumni(prev => prev.filter(a => a.id !== id));

    const startNewSession = (shotCount: number) => {
        const newSession: SessionRecord = {
            id: Date.now().toString(),
            date: Date.now(),
            archers: archers.map(a => ({ ...a, marks: Array(shotCount).fill(Mark.none) })),
            shotCount
        };
        const newSessions = [newSession, ...sessions];
        setSessions(newSessions);
        setShotsPerRound(shotCount);
        syncToCloud(makeData({ sessions: newSessions, shotsPerRound: shotCount }));
    };

    const deleteSession = (id: string) => {
        const sessionToDelete = sessions.find(s => s.id === id);
        if (!sessionToDelete) return;
        const newSessions = sessions.filter(s => s.id !== id);
        const newTrash = [sessionToDelete, ...trash];
        setSessions(newSessions);
        setTrash(newTrash);
        syncToCloud(makeData({ sessions: newSessions, trash: newTrash }));
    };

    const restoreSession = (id: string) => {
        const sessionToRestore = trash.find(s => s.id === id);
        if (!sessionToRestore) return;
        const newTrash = trash.filter(s => s.id !== id);
        const newSessions = [...sessions, { ...sessionToRestore, syncStatus: 'pending' as const }];
        setTrash(newTrash);
        setSessions(newSessions);
        syncToCloud(makeData({ sessions: newSessions, trash: newTrash }));
    };

    const permanentlyDeleteSession = (id: string) => {
        const newTrash = trash.filter(s => s.id !== id);
        setTrash(newTrash);
        syncToCloud(makeData({ trash: newTrash }));
    };

    const updateSessionShotCount = (id: string, count: number) => {
        const newSessions = sessions.map(s => {
            if (s.id !== id) return s;
            return {
                ...s, shotCount: count, syncStatus: 'pending' as const,
                archers: s.archers.map(a => {
                    if (a.isSeparator) return a;
                    const currentMarks = [...a.marks];
                    if (currentMarks.length < count) return { ...a, marks: [...currentMarks, ...Array(count - currentMarks.length).fill(Mark.none)] };
                    if (currentMarks.length > count) return { ...a, marks: currentMarks.slice(0, count) };
                    return a;
                })
            };
        });
        setSessions(newSessions);
        syncToCloud(makeData({ sessions: newSessions }));
    };

    const deleteArcherFromSession = (sessionId: string, archerId: string) => {
        const newSessions = sessions.map(s => s.id === sessionId ? { ...s, syncStatus: 'pending' as const, archers: s.archers.filter(a => a.id !== archerId) } : s);
        setSessions(newSessions);
        syncToCloud(makeData({ sessions: newSessions }));
    };

    const addArcherToSession = (sessionId: string) => {
        const newSessions = sessions.map(s => s.id === sessionId ? { ...s, syncStatus: 'pending' as const, archers: [...s.archers, createArcher(s.shotCount)] } : s);
        setSessions(newSessions);
        syncToCloud(makeData({ sessions: newSessions }));
    };

    const addSeparatorToSession = (sessionId: string) => {
        const newSessions = sessions.map(s => s.id === sessionId ? { ...s, syncStatus: 'pending' as const, archers: [...s.archers, createSeparator()] } : s);
        setSessions(newSessions);
        syncToCloud(makeData({ sessions: newSessions }));
    };

    const addTotalToSession = (sessionId: string) => {
        const newSessions = sessions.map(s => s.id === sessionId ? { ...s, syncStatus: 'pending' as const, archers: [...s.archers, createTotalCalculator(s.shotCount)] } : s);
        setSessions(newSessions);
        syncToCloud(makeData({ sessions: newSessions }));
    };

    const toggleHistoryMark = (sessionId: string, archerId: string, markIndex: number) => {
        if (!isAdminMode) return;
        const newSessions = sessions.map(s => {
            if (s.id !== sessionId) return s;
            return {
                ...s, syncStatus: 'pending' as const,
                archers: s.archers.map(a => {
                    if (a.id !== archerId) return a;
                    const newMarks = [...a.marks];
                    const current = newMarks[markIndex];
                    newMarks[markIndex] = current === Mark.none ? Mark.hit : current === Mark.hit ? Mark.miss : Mark.none;
                    return { ...a, marks: newMarks };
                })
            };
        });
        setSessions(newSessions);
        syncToCloud(makeData({ sessions: newSessions }));
    };

    const updateHistoryArcherInfo = (sessionId: string, archerId: string, name: string, gender: Gender, grade: number, isGuest: boolean) => {
        const newSessions = sessions.map(s => s.id !== sessionId ? s : {
            ...s, syncStatus: 'pending' as const,
            archers: s.archers.map(a => a.id === archerId ? { ...a, name, gender, grade, isGuest } : a)
        });
        setSessions(newSessions);
        syncToCloud(makeData({ sessions: newSessions }));
    };

    const moveHistoryArcher = (sessionId: string, sourceId: string, targetId: string) => {
        const newSessions = sessions.map(s => {
            if (s.id !== sessionId) return s;
            const sIdx = s.archers.findIndex(a => a.id === sourceId);
            const tIdx = s.archers.findIndex(a => a.id === targetId);
            if (sIdx === -1 || tIdx === -1 || sIdx === tIdx) return s;
            const newArchers = [...s.archers];
            const [moved] = newArchers.splice(sIdx, 1);
            newArchers.splice(tIdx, 0, moved);
            return { ...s, syncStatus: 'pending' as const, archers: newArchers };
        });
        setSessions(newSessions);
        syncToCloud(makeData({ sessions: newSessions }));
    };

    const updateSessionNote = (sessionId: string, note: string) => {
        const newSessions = sessions.map(s => s.id === sessionId ? { ...s, syncStatus: 'pending' as const, note } : s);
        setSessions(newSessions);
        syncToCloud(makeData({ sessions: newSessions }));
    };

    const updateSessionDate = (sessionId: string, date: number) => {
        const newSessions = sessions.map(s => s.id === sessionId ? { ...s, syncStatus: 'pending' as const, date } : s);
        setSessions(newSessions);
        syncToCloud(makeData({ sessions: newSessions }));
    };

    const getDisplayName = (name: string) => {
        if (!name) return "";
        const parts = name.split(/[\s　]+/);
        return parts[0]; // 苗字のみを表示
    };

    const getGroupArchers = (calculatorId: string): Archer[] => {
        const calcIndex = archers.findIndex(a => a.id === calculatorId);
        if (calcIndex === -1) return [];
        const group: Archer[] = [];
        for (let i = calcIndex - 1; i >= 0; i--) {
            if (archers[i].isTotalCalculator) break;
            if (!archers[i].isSeparator) group.push(archers[i]);
        }
        return group;
    };

    const getHistoryGroupArchers = (sessionId: string, calculatorId: string): Archer[] => {
        const session = sessions.find(s => s.id === sessionId);
        if (!session) return [];
        const calcIndex = session.archers.findIndex(a => a.id === calculatorId);
        if (calcIndex === -1) return [];
        const group: Archer[] = [];
        for (let i = calcIndex - 1; i >= 0; i--) {
            if (session.archers[i].isTotalCalculator) break;
            if (!session.archers[i].isSeparator) group.push(session.archers[i]);
        }
        return group;
    };

    const getCalculatorForArcher = (archerId: string): string | null => {
        const archerIndex = archers.findIndex(a => a.id === archerId);
        if (archerIndex === -1) return null;
        for (let i = archerIndex + 1; i < archers.length; i++) {
            if (archers[i].isTotalCalculator) return archers[i].id;
            if (archers[i].isSeparator) break;
        }
        return null;
    };

    const exportDataToFile = async () => {
        try {
            const dataStr = exportDataToString();
            const fileName = `kyudo_backup_${new Date().toISOString().split('T')[0]}.json`;
            const fileUri = FileSystem.cacheDirectory + fileName;
            await FileSystem.writeAsStringAsync(fileUri, dataStr);
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri);
            } else {
                Alert.alert('エラー', 'このデバイスはファイル共有をサポートしていません。');
            }
        } catch (error) {
            console.error('Export failed:', error);
            Alert.alert('エラー', 'バックアップの作成に失敗しました。');
        }
    };

    const importDataFromPicker = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true
            });
            if (result.canceled) return false;

            const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
            return importDataFromCode(fileContent);
        } catch (error) {
            console.error('Import failed:', error);
            Alert.alert('エラー', 'ファイルの読み込みに失敗しました。');
            return false;
        }
    };

    const importDataFromCode = (json: string) => {
        try {
            const data: SavedData = JSON.parse(json);
            if (!data.sessions || !data.members) throw new Error('Invalid format');

            setArchers(data.currentArchers || []);
            setMembers(data.members || []);
            setAlumni(data.alumni || []);
            setHistory(data.history || []);
            setSessions(data.sessions || []);
            setTrash(data.trash || []);
            setShotsPerRound(data.shotsPerRound || 12);
            setLockedBlocks(data.lockedBlocks || {});

            syncToCloud(data);
            return true;
        } catch (error) {
            console.error('Import failed:', error);
            return false;
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
            setShotsPerRound(data.shotsPerRound || 12);
            setLockedBlocks(data.lockedBlocks || {});
            return true;
        } catch {
            return false;
        }
    };


    return (
        <ScoreContext.Provider value={{
            archers, setArchers, members, setMembers, alumni, setAlumni,
            history, setHistory,
            sessions,
            setSessions, trash, setTrash,
            shotsPerRound, setShotsPerRound, isAdminMode, setIsAdminMode,
            lockedBlocks, syncStatus, lastSyncTime,
            addArcher, addSeparator, addTotalCalculator,
            insertArcher, insertSeparator, insertTotalCalculator,
            deleteArcher, toggleMark, setMark,
            canUndo: undoStack.length > 0, canRedo: redoStack.length > 0,
            undo, redo, toggleLock,
            updateArcherInfo, moveArcher, saveSessionAndReset,
            addMember, updateMember, deleteMember, deleteAlumni,
            deleteSession, restoreSession, permanentlyDeleteSession,
            updateSessionShotCount, deleteArcherFromSession,
            addArcherToSession, addSeparatorToSession, addTotalToSession,
            toggleHistoryMark, updateHistoryArcherInfo, moveHistoryArcher,
            updateSessionNote, updateSessionDate,
            getDisplayName, getGroupArchers, getHistoryGroupArchers,
            getCalculatorForArcher, resetCurrentSession,
            exportDataToString, exportDataToFile, importDataFromPicker, importDataFromCode, importDataFromString
        }}>
            {children}
        </ScoreContext.Provider >
    );
};
