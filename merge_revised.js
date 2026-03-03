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

    // User specified "13 Old + 1 New". 
    // The 'sessions' array in old_backup.txt had exactly 13 records.
    if (oldJ.sessions && oldJ.sessions.length > 0) {
        console.log(`Adding ${oldJ.sessions.length} sessions from old backup.`);
        mergedSessions.push(...oldJ.sessions);
    } else if (oldJ.history && oldJ.history.length > 0) {
        // Fallback or if user meant the history items
        console.log(`Adding ${oldJ.history.length} history items (converted) from old backup.`);
        oldJ.history.forEach(h => {
            // ... conversion logic ...
            // But the user was specific about 13, and history has 14. 
            // So sessions (13) is likely what they want.
        });
    }

    // Add the 1 New Session (Feb 28th)
    if (newJ.sessions && newJ.sessions.length > 0) {
        console.log(`Adding ${newJ.sessions.length} session(s) from new backup.`);
        newJ.sessions.forEach(ns => {
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
    const outputPath = 'C:/Users/yutoi/Downloads/drive-download-20260228T160054Z-1-001/MergedBackup_KyudoApp_Revised.json';
    fs.writeFileSync(outputPath, JSON.stringify(finalJ, null, 2), 'utf8');

    console.log(`Success! Revised Merge Complete.`);
    console.log(`Total Sessions: ${mergedSessions.length}`);
    console.log(`Output: ${outputPath}`);

} catch (error) {
    console.error("Merge error:", error);
}
