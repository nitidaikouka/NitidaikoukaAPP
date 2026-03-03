import { Member, Gender, SessionRecord, Mark } from './types';

export const sortMembers = (members: Member[]): Member[] => {
  return [...members].sort((a, b) => {
    // 1. Grade (Ascending: 1 -> 4)
    if (a.grade !== b.grade) return a.grade - b.grade;

    // 2. Gender (Male first)
    if (a.gender !== b.gender) {
      if (a.gender === Gender.male) return -1;
      if (b.gender === Gender.male) return 1;
      return 0;
    }

    // 3. Name (Japanese locale)
    return a.name.localeCompare(b.name, 'ja');
  });
};

export const getMemberPerformancePattern = (name: string, sessions: SessionRecord[]) => {
  const patterns = [0, 0, 0, 0]; // Hits at index 0, 1, 2, 3
  const counts = [0, 0, 0, 0];   // Total shots at index 0, 1, 2, 3

  sessions.forEach(s => {
    s.archers.forEach(a => {
      if (a.name !== name) return;
      a.marks.forEach((m, i) => {
        if (i < 4) {
          if (m === Mark.hit) patterns[i]++;
          if (m !== Mark.none) counts[i]++;
        }
      });
    });
  });

  return patterns.map((hits, i) => counts[i] > 0 ? hits / counts[i] : 1.0);
};

export const getNextShotAdvice = (name: string, currentIndex: number, sessions: SessionRecord[]): string | null => {
  if (currentIndex < 0 || currentIndex >= 4) return null;
  const patternsForIndex = getMemberPerformancePattern(name, sessions);
  const rate = patternsForIndex[currentIndex];

  if (rate < 0.4) {
    const labels = ["1本目", "2本目", "3本目", "4本目"];
    return `⚠️ ${labels[currentIndex]}の的中率が低めです！集中力を高めましょう。`;
  }
  return null;
};
