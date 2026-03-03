const fs = require('fs');
const crypto = require('crypto');

try {
    // 1. Read Old Backup (Parsed from DOCX)
    const oldContent = fs.readFileSync('old_backup.txt', 'utf16le').replace(/^\uFEFF/, '');
    const oldJ = JSON.parse(oldContent);

    // 2. Read New Backup JSON (Feb 28th data)
    const newPath = 'C:/Users/yutoi/Downloads/drive-download-20260228T160054Z-1-001/KyudoBackup_Mar 1, 2026.json';
    const newJ = JSON.parse(fs.readFileSync(newPath, 'utf8'));

    // 3. Start building merged sessions
    let mergedSessions = [];

    // (A) Existing Sessions from Old Backup (13 records)
    // These already have the correct format and notes.
    if (oldJ.sessions) {
        mergedSessions.push(...oldJ.sessions);
    }

    // (B) Historical Records from Old Backup (14 records)
    // These are in 'history' format (entries) and need conversion.
    if (oldJ.history) {
        oldJ.history.forEach(h => {
            const shotCount = h.entries.length > 0 ? (h.entries[0].totalShots || 20) : 20;

            const converted = {
                id: h.id || crypto.randomUUID().toUpperCase(),
                date: h.date,
                note: "", // Original history format didn't have notes
                syncStatus: "pending",
                shotCount: shotCount,
                archers: h.entries.map(e => {
                    const hits = e.hits || 0;
                    const total = e.totalShots || shotCount;
                    const marks = [];
                    for (let i = 0; i < hits; i++) marks.push('○');
                    for (let i = hits; i < total; i++) marks.push('×');

                    return {
                        id: crypto.randomUUID().toUpperCase(),
                        name: e.name || "",
                        grade: e.grade || 0,
                        gender: e.gender || "未設定",
                        isGuest: e.isGuest || false,
                        isSeparator: false,
                        isTotalCalculator: false,
                        marks: marks,
                        lockedBlocks: { "0": true, "1": true, "2": true, "3": true, "4": true }
                    };
                })
            };
            mergedSessions.push(converted);
        });
    }

    // (C) New Sessions from New Backup (1 record - Feb 28th)
    if (newJ.sessions) {
        newJ.sessions.forEach(ns => {
            // Avoid duplicate just in case
            if (!mergedSessions.some(s => s.id === ns.id)) {
                mergedSessions.push(ns);
            }
        });
    }

    // 4. Construct Final JSON
    // Base is OLD backup (members, alumni, etc.)
    const finalJ = {
        shotsPerRound: oldJ.shotsPerRound || 20,
        members: oldJ.members || [],
        alumni: oldJ.alumni || [],
        sessions: mergedSessions.sort((a, b) => b.date - a.date)
    };

    // 5. Output
    const outputPath = 'C:/Users/yutoi/Downloads/drive-download-20260228T160054Z-1-001/MergedBackup_KyudoApp_Final.json';
    fs.writeFileSync(outputPath, JSON.stringify(finalJ, null, 2), 'utf8');

    console.log(`Success! Final Merge Complete.`);
    console.log(`Merged Sessions: ${mergedSessions.length} (Old Sessions: 13, Old History: 14, New sessions: ${newJ.sessions.length})`);
    console.log(`Output: ${outputPath}`);

} catch (error) {
    console.error("Merge error:", error);
}
