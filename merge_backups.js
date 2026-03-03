const fs = require('fs');
const crypto = require('crypto');

try {
    // 1. Read files
    const oldContent = fs.readFileSync('old_backup.txt', 'utf16le').replace(/^\uFEFF/, '');
    const oldJ = JSON.parse(oldContent);

    let newPath = 'C:/Users/yutoi/Downloads/drive-download-20260228T160054Z-1-001/KyudoBackup_Mar 1, 2026.json';
    const newJ = JSON.parse(fs.readFileSync(newPath, 'utf8'));

    // 2. Map old 'history' to new 'sessions'
    const oldHistory = oldJ.history || [];
    const convertedSessions = oldHistory.map(h => {
        const archers = h.archers || [];
        const shotCount = archers.length > 0 ? (archers[0].totalShots || 20) : 20;

        return {
            id: h.id || crypto.randomUUID().toUpperCase(),
            date: h.date,
            note: h.note || "旧アプリからの移行データ",
            syncStatus: "pending",
            shotCount: shotCount,
            archers: archers.map(a => {
                const hits = a.hits || 0;
                const total = a.totalShots || shotCount;
                const marks = [];
                for (let i = 0; i < hits; i++) marks.push('○');
                for (let i = hits; i < total; i++) marks.push('×');

                return {
                    id: a.id || crypto.randomUUID().toUpperCase(),
                    name: a.name || "",
                    grade: a.grade || 0,
                    gender: a.gender || "未設定",
                    isGuest: a.isGuest || false,
                    isSeparator: false,
                    isTotalCalculator: false,
                    marks: marks,
                    lockedBlocks: { "0": true, "1": true, "2": true, "3": true, "4": true }
                };
            })
        };
    });

    // 3. Merge members and alumni to avoid duplicates
    const membersMap = new Map();
    const alumniMap = new Map();

    (newJ.members || []).forEach(m => membersMap.set(m.id, m));
    (oldJ.members || []).forEach(m => membersMap.set(m.id, m));

    (newJ.alumni || []).forEach(m => alumniMap.set(m.id, m));
    (oldJ.alumni || []).forEach(m => alumniMap.set(m.id, m));

    // 4. Merge sessions
    const sessionsMap = new Map();
    (newJ.sessions || []).forEach(s => sessionsMap.set(s.id, s));
    convertedSessions.forEach(s => sessionsMap.set(s.id, s));

    const mergedJ = {
        shotsPerRound: newJ.shotsPerRound || 20,
        members: Array.from(membersMap.values()),
        alumni: Array.from(alumniMap.values()),
        sessions: Array.from(sessionsMap.values()).sort((a, b) => b.date - a.date)
    };

    // 5. Output
    const outputPath = 'C:/Users/yutoi/Downloads/drive-download-20260228T160054Z-1-001/MergedBackup_KyudoApp.json';
    fs.writeFileSync(outputPath, JSON.stringify(mergedJ, null, 2), 'utf8');

    console.log(`Success! Merged ${convertedSessions.length} old history records with ${(newJ.sessions || []).length} new sessions.`);
    console.log(`Output saved to: ${outputPath}`);

} catch (error) {
    console.error("Error during merge:", error);
}
