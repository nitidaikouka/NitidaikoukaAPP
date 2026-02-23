import { Member, Gender } from './types';

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
