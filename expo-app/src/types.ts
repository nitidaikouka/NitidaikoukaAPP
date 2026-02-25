export enum Gender {
    male = "男子",
    female = "女子",
    unknown = "未設定"
}

export enum Mark {
    none = "",
    hit = "○",
    miss = "×"
}

export interface Member {
    id: string;
    name: string;
    gender: Gender;
    grade: number;
}

export interface Alumni {
    id: string;
    name: string;
    gender: Gender;
    graduationYear: string;
}

export interface Archer {
    id: string;
    name: string;
    gender: Gender;
    grade: number;
    marks: Mark[];
    isSeparator: boolean;
    isTotalCalculator: boolean;
    isGuest: boolean;
}

export interface RecordEntry {
    name: string;
    gender: Gender;
    grade: number;
    totalShots: number;
    hits: number;
    isGuest: boolean;
}

export interface PracticeRecord {
    id: string;
    date: number;
    entries: RecordEntry[];
}

export interface SessionRecord {
    id: string;
    date: number;
    archers: Archer[];
    shotCount: number;
    note?: string;
    syncStatus?: 'synced' | 'pending' | 'error';
}

export interface SavedData {
    currentArchers: Archer[];
    members: Member[];
    alumni: Alumni[];
    history: PracticeRecord[];
    sessions: SessionRecord[];
    trash?: SessionRecord[];
    lastFiscalYearChecked: number;
    shotsPerRound: number;
    isFirstLaunch?: boolean;
    lockedBlocks?: Record<string, boolean>;
}
