import SwiftUI
import UniformTypeIdentifiers

// MARK: - 1. データモデル定義

enum Gender: String, Codable, CaseIterable, Hashable {
    case male = "男子"
    case female = "女子"
    case unknown = "未設定"
}

enum Mark: String, Codable, Hashable {
    case none = ""
    case hit = "○"
    case miss = "×"
    
    mutating func toggle() {
        switch self {
        case .none: self = .hit
        case .hit: self = .miss
        case .miss: self = .none
        }
    }
    
    var color: Color {
        switch self {
        case .none: return .clear
        case .hit: return .red
        case .miss: return .black
        }
    }
}

struct Member: Identifiable, Codable, Hashable {
    var id: UUID
    var name: String
    var gender: Gender
    var grade: Int

    enum CodingKeys: String, CodingKey { case id, name, gender, grade }
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = (try? container.decode(UUID.self, forKey: .id)) ?? UUID()
        name = (try? container.decode(String.self, forKey: .name)) ?? ""
        gender = (try? container.decode(Gender.self, forKey: .gender)) ?? .unknown
        grade = (try? container.decode(Int.self, forKey: .grade)) ?? 1
    }
    init(id: UUID = UUID(), name: String, gender: Gender, grade: Int) {
        self.id = id; self.name = name; self.gender = gender; self.grade = grade
    }
}

struct Alumni: Identifiable, Codable, Hashable {
    var id: UUID
    var name: String
    var gender: Gender
    var graduationYear: String

    enum CodingKeys: String, CodingKey { case id, name, gender, graduationYear }
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = (try? container.decode(UUID.self, forKey: .id)) ?? UUID()
        name = (try? container.decode(String.self, forKey: .name)) ?? ""
        gender = (try? container.decode(Gender.self, forKey: .gender)) ?? .unknown
        graduationYear = (try? container.decode(String.self, forKey: .graduationYear)) ?? ""
    }
    init(id: UUID = UUID(), name: String, gender: Gender, graduationYear: String) {
        self.id = id; self.name = name; self.gender = gender; self.graduationYear = graduationYear
    }
}

struct Archer: Identifiable, Codable, Equatable, Hashable {
    var id: UUID
    var name: String
    var gender: Gender
    var grade: Int
    var marks: [Mark]
    var isSeparator: Bool
    var isTotalCalculator: Bool
    var isGuest: Bool
    var lockedBlocks: [Int: Bool]
    var substitutions: [Int: String]? // [ShotIndex: SubstituteName]

    enum CodingKeys: String, CodingKey {
        case id, name, gender, grade, marks, isSeparator, isTotalCalculator, isGuest, lockedBlocks, substitutions
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decodeIfPresent(UUID.self, forKey: .id) ?? UUID()
        name = try container.decodeIfPresent(String.self, forKey: .name) ?? ""
        gender = try container.decodeIfPresent(Gender.self, forKey: .gender) ?? .unknown
        grade = try container.decodeIfPresent(Int.self, forKey: .grade) ?? 1
        marks = try container.decodeIfPresent([Mark].self, forKey: .marks) ?? []
        isSeparator = try container.decodeIfPresent(Bool.self, forKey: .isSeparator) ?? false
        isTotalCalculator = try container.decodeIfPresent(Bool.self, forKey: .isTotalCalculator) ?? false
        isGuest = try container.decodeIfPresent(Bool.self, forKey: .isGuest) ?? false
        lockedBlocks = try container.decodeIfPresent([Int: Bool].self, forKey: .lockedBlocks) ?? [:]
        substitutions = try container.decodeIfPresent([Int: String].self, forKey: .substitutions)
    }

    init(id: UUID = UUID(), name: String, gender: Gender, grade: Int, marks: [Mark], isSeparator: Bool = false, isTotalCalculator: Bool = false, isGuest: Bool = false, lockedBlocks: [Int: Bool] = [:], substitutions: [Int: String]? = nil) {
        self.id = id; self.name = name; self.gender = gender; self.grade = grade; self.marks = marks
        self.isSeparator = isSeparator; self.isTotalCalculator = isTotalCalculator; self.isGuest = isGuest; self.lockedBlocks = lockedBlocks
        self.substitutions = substitutions
    }
    
    static func new(count: Int) -> Archer {
        return Archer(name: "", gender: .unknown, grade: 1, marks: Array(repeating: .none, count: count), isSeparator: false, isTotalCalculator: false, isGuest: false, lockedBlocks: [:], substitutions: nil)
    }
    
    static func newSeparator() -> Archer {
        return Archer(name: "", gender: .unknown, grade: 0, marks: [], isSeparator: true, isTotalCalculator: false, isGuest: false, lockedBlocks: [:], substitutions: nil)
    }
    
    static func newTotalCalculator(count: Int) -> Archer {
        return Archer(name: "計", gender: .unknown, grade: 0, marks: Array(repeating: .none, count: count), isSeparator: false, isTotalCalculator: true, isGuest: false, lockedBlocks: [:], substitutions: nil)
    }
}

struct RecordEntry: Codable {
    var name: String
    var gender: Gender
    var grade: Int
    var totalShots: Int
    var hits: Int
    var isGuest: Bool

    enum CodingKeys: String, CodingKey { case name, gender, grade, totalShots, hits, isGuest }
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        name = (try? container.decode(String.self, forKey: .name)) ?? ""
        gender = (try? container.decode(Gender.self, forKey: .gender)) ?? .unknown
        grade = (try? container.decode(Int.self, forKey: .grade)) ?? 1
        totalShots = (try? container.decode(Int.self, forKey: .totalShots)) ?? 0
        hits = (try? container.decode(Int.self, forKey: .hits)) ?? 0
        isGuest = (try? container.decode(Bool.self, forKey: .isGuest)) ?? false
    }

    init(name: String, gender: Gender, grade: Int, totalShots: Int, hits: Int, isGuest: Bool) {
        self.name = name; self.gender = gender; self.grade = grade; self.totalShots = totalShots; self.hits = hits; self.isGuest = isGuest
    }
}

struct PracticeRecord: Identifiable, Codable {
    var id: UUID
    var date: Date
    var entries: [RecordEntry]
    var includeInStats: Bool
    var lastModified: Date

    enum CodingKeys: String, CodingKey { case id, date, entries, includeInStats, lastModified }
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = (try? container.decode(UUID.self, forKey: .id)) ?? UUID()
        date = (try? container.decode(Date.self, forKey: .date)) ?? Date()
        entries = (try? container.decode([RecordEntry].self, forKey: .entries)) ?? []
        includeInStats = (try? container.decode(Bool.self, forKey: .includeInStats)) ?? true
        lastModified = (try? container.decode(Date.self, forKey: .lastModified)) ?? date
    }

    init(id: UUID = UUID(), date: Date, entries: [RecordEntry], includeInStats: Bool = true, lastModified: Date = Date()) {
        self.id = id; self.date = date; self.entries = entries; self.includeInStats = includeInStats; self.lastModified = lastModified
    }
}

struct SessionRecord: Identifiable, Codable, Hashable {
    var id: UUID
    var date: Date
    var archers: [Archer]
    var shotCount: Int
    var note: String
    var syncStatus: String
    var includeInStats: Bool
    var lastModified: Date

    enum CodingKeys: String, CodingKey { case id, date, archers, shotCount, note, syncStatus, includeInStats, lastModified }
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = (try? container.decode(UUID.self, forKey: .id)) ?? UUID()
        date = (try? container.decode(Date.self, forKey: .date)) ?? Date()
        archers = (try? container.decode([Archer].self, forKey: .archers)) ?? []
        shotCount = (try? container.decode(Int.self, forKey: .shotCount)) ?? 0
        note = (try? container.decode(String.self, forKey: .note)) ?? ""
        syncStatus = (try? container.decode(String.self, forKey: .syncStatus)) ?? "pending"
        includeInStats = (try? container.decode(Bool.self, forKey: .includeInStats)) ?? true
        lastModified = (try? container.decode(Date.self, forKey: .lastModified)) ?? date
    }

    init(id: UUID = UUID(), date: Date, archers: [Archer], shotCount: Int, note: String = "", syncStatus: String = "pending", includeInStats: Bool = true, lastModified: Date = Date()) {
        self.id = id; self.date = date; self.archers = archers; self.shotCount = shotCount; self.note = note; self.syncStatus = syncStatus; self.includeInStats = includeInStats; self.lastModified = lastModified
    }
}

struct SavedData: Codable {
    var currentArchers: [Archer]?
    var members: [Member]?
    var alumni: [Alumni]?
    var history: [PracticeRecord]?
    var sessions: [SessionRecord]?
    var lastFiscalYearChecked: Int?
    var shotsPerRound: Int?
    var isFirstLaunch: Bool?
    var trash: [SessionRecord]?

    init(currentArchers: [Archer]? = nil, members: [Member]? = nil, alumni: [Alumni]? = nil, history: [PracticeRecord]? = nil, sessions: [SessionRecord]? = nil, lastFiscalYearChecked: Int? = nil, shotsPerRound: Int? = nil, isFirstLaunch: Bool? = nil, trash: [SessionRecord]? = nil) {
        self.currentArchers = currentArchers; self.members = members; self.alumni = alumni; self.history = history; self.sessions = sessions; self.lastFiscalYearChecked = lastFiscalYearChecked; self.shotsPerRound = shotsPerRound; self.isFirstLaunch = isFirstLaunch; self.trash = trash
    }
}

// MARK: - 1.1 UI共有用ヘルパー
struct ShareSheet: UIViewControllerRepresentable {
    var items: [Any]
    init(items: [Any]) { self.items = items }
    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: items, applicationActivities: nil)
    }
    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}

// MARK: - 2. データ管理クラス (ViewModel)

class ScoreModel: ObservableObject {
    @Published var archers: [Archer] = [] { didSet { saveData() } }
    @Published var members: [Member] = [] { didSet { saveData() } }
    @Published var alumni: [Alumni] = [] { didSet { saveData() } }
    @Published var history: [PracticeRecord] = [] { didSet { saveData() } }
    @Published var sessions: [SessionRecord] = [] { didSet { saveData() } }
    @Published var trash: [SessionRecord] = [] { didSet { saveData() } }
    @Published var shotsPerRound: Int = 12 { didSet { resizeArchers(); saveData() } }
    func setShotsPerRound(_ count: Int) {
        if shotsPerRound == count { return }
        pushUndo()
        shotsPerRound = count
    }
    @Published var isAdminMode: Bool = false
    @Published var isSyncing: Bool = false
    @Published var draggedArcher: Archer? = nil
    
    // Firebase Config (REST API)
    private let databaseURL = "https://nihondaigakukoukascore-default-rtdb.firebaseio.com"
    
    // Undo/Redo (Stores both archers and shotsPerRound)
    struct AppState: Codable {
        var archers: [Archer]
        var shotsPerRound: Int
    }
    private var undoStack: [AppState] = []
    private var redoStack: [AppState] = []
    
    var canUndo: Bool { !undoStack.isEmpty }
    var canRedo: Bool { !redoStack.isEmpty }

    @Published var lastRestoreError: String = ""
    private var lastFiscalYearChecked: Int = 2000
    private var isFirstLaunch: Bool = true
    var lastTapTimes: [String: Date] = [:] // タップ遅延解消用キャッシュ
    
    // Sorted Cache for History Performance
    var sortedSessions: [SessionRecord] {
        sessions.sorted(by: { $0.date > $1.date })
    }
    
    // Custom URLSession configured to wait for connectivity
    private lazy var syncSession: URLSession = {
        let config = URLSessionConfiguration.default
        config.waitsForConnectivity = true
        config.timeoutIntervalForResource = 60 // 1分間待機・再試行
        return URLSession(configuration: config)
    }()
    
    private let saveURL: URL = {
        let paths = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)
        return paths[0].appendingPathComponent("nihon_u_kyudo_app.json")
    }()
    
    init() {
        loadData()
        if isFirstLaunch {
            populateInitialMembers()
            updateLastFiscalYearToCurrent()
            isFirstLaunch = false
            saveData()
        }
        checkForPromotion()
        fetchAndMergeCloudData()
    }
    
    // Undo/Redo Logics
    func pushUndo() {
        undoStack.append(AppState(archers: archers, shotsPerRound: shotsPerRound))
        if undoStack.count > 30 { undoStack.removeFirst() }
        redoStack.removeAll()
    }
    func undo() {
        guard let last = undoStack.popLast() else { return }
        redoStack.append(AppState(archers: archers, shotsPerRound: shotsPerRound))
        self.archers = last.archers
        self.shotsPerRound = last.shotsPerRound
    }
    func redo() {
        guard let last = redoStack.popLast() else { return }
        undoStack.append(AppState(archers: archers, shotsPerRound: shotsPerRound))
        self.archers = last.archers
        self.shotsPerRound = last.shotsPerRound
    }

    // Fiscal Year & Promotion
    func getFiscalYear(date: Date) -> Int {
        let calendar = Calendar.current
        let year = calendar.component(.year, from: date)
        let month = calendar.component(.month, from: date)
        return month >= 4 ? year : year - 1
    }
    private func updateLastFiscalYearToCurrent() {
        self.lastFiscalYearChecked = getFiscalYear(date: Date())
    }
    func checkForPromotion() {
        let currentFiscalYear = getFiscalYear(date: Date())
        if currentFiscalYear > lastFiscalYearChecked {
            promoteMembers(fiscalYear: lastFiscalYearChecked)
            lastFiscalYearChecked = currentFiscalYear
            saveData()
        }
    }
    func promoteMembers() {
        let fiscalYear = getFiscalYear(date: Date())
        promoteMembers(fiscalYear: fiscalYear)
    }
    func promoteMembers(fiscalYear: Int) {
        var activeMembers: [Member] = []
        for var member in members {
            member.grade += 1
            if member.grade > 4 {
                let gradLabel = "\(fiscalYear)年度卒業"
                alumni.append(Alumni(name: member.name, gender: member.gender, graduationYear: gradLabel))
            } else { activeMembers.append(member) }
        }
        self.members = activeMembers
    }

    // Sorting
    var sortedMembers: [Member] {
        members.sorted { m1, m2 in
            if m1.grade != m2.grade { return m1.grade < m2.grade }
            if m1.gender != m2.gender { return m1.gender == .male } // 男子が先
            return m1.name.localizedStandardCompare(m2.name) == .orderedAscending
        }
    }

    // Initial Data
    private func populateInitialMembers() {
        guard members.isEmpty else { return }
        // ユーザーの要望により、初期データはファイルから復元するためここでは追加しない
    }

    // Archer Management
    func addArcher() { pushUndo(); archers.append(Archer.new(count: shotsPerRound)) }
    func addSeparator() { pushUndo(); archers.append(Archer.newSeparator()) }
    func addTotalCalculator() { pushUndo(); archers.append(Archer.newTotalCalculator(count: shotsPerRound)) }
    func deleteArcher(id: UUID) { pushUndo(); if let index = archers.firstIndex(where: { $0.id == id }) { archers.remove(at: index) } }
    func moveArcher(from source: IndexSet, to destination: Int) { pushUndo(); archers.move(fromOffsets: source, toOffset: destination) }

    private func resizeArchers() {
        for i in 0..<archers.count {
            if archers[i].isSeparator || archers[i].isTotalCalculator {
                if archers[i].isTotalCalculator {
                    let currentCount = archers[i].marks.count
                    if currentCount < shotsPerRound {
                        archers[i].marks.append(contentsOf: Array(repeating: .none, count: shotsPerRound - currentCount))
                    } else if currentCount > shotsPerRound {
                        archers[i].marks = Array(archers[i].marks.prefix(shotsPerRound))
                    }
                }
                continue
            }
            let currentCount = archers[i].marks.count
            if currentCount < shotsPerRound {
                archers[i].marks.append(contentsOf: Array(repeating: .none, count: shotsPerRound - currentCount))
            } else if currentCount > shotsPerRound {
                archers[i].marks = Array(archers[i].marks.prefix(shotsPerRound))
            }
        }
    }

    // Locking
    func toggleLock(controllerID: UUID, blockIndex: Int, sessionID: UUID? = nil) {
        if let sid = sessionID, let si = sessions.firstIndex(where: { $0.id == sid }) {
            // History Edit
            guard let index = sessions[si].archers.firstIndex(where: { $0.id == controllerID }) else { return }
            let newState = !(sessions[si].archers[index].lockedBlocks[blockIndex] ?? false)
            sessions[si].archers[index].lockedBlocks[blockIndex] = newState
            let group = getHistoryGroup(sessionArchers: sessions[si].archers, targetID: controllerID)
            for gArcher in group {
                if let aIndex = sessions[si].archers.firstIndex(where: { $0.id == gArcher.id }) {
                    sessions[si].archers[aIndex].lockedBlocks[blockIndex] = newState
                }
            }
            sessions[si].lastModified = Date()
            saveData()
            syncSessionToCloud(sessions[si])
            return
        }
        
        pushUndo()
        guard let index = archers.firstIndex(where: { $0.id == controllerID }) else { return }
        let newState = !(archers[index].lockedBlocks[blockIndex] ?? false)
        
        // Update the controller
        archers[index].lockedBlocks[blockIndex] = newState
        
        // Update the group to its "right" (lower indices)
        let group = getGroupArchers(for: controllerID)
        for gArcher in group {
            if let aIndex = archers.firstIndex(where: { $0.id == gArcher.id }) {
                archers[aIndex].lockedBlocks[blockIndex] = newState
            }
        }
        saveData()
    }
    func isLocked(archerID: UUID, blockIndex: Int, sessionID: UUID? = nil) -> Bool {
        if let sid = sessionID, let sIdx = sessions.firstIndex(where: { $0.id == sid }) {
            if let archer = sessions[sIdx].archers.first(where: { $0.id == archerID }) {
                return archer.lockedBlocks[blockIndex] ?? false
            }
        }
        if let archer = archers.first(where: { $0.id == archerID }) {
            return archer.lockedBlocks[blockIndex] ?? false
        }
        return false
    }
    func isGroupLocked(controllerID: UUID, blockIndex: Int, sessionID: UUID? = nil) -> Bool {
        if let sid = sessionID, let sIdx = sessions.firstIndex(where: { $0.id == sid }) {
            if let controller = sessions[sIdx].archers.first(where: { $0.id == controllerID }) {
                return controller.lockedBlocks[blockIndex] ?? false
            }
        }
        if let controller = archers.first(where: { $0.id == controllerID }) {
            return controller.lockedBlocks[blockIndex] ?? false
        }
        return false
    }

    // Session Operations
    func resetCurrentSession() {
        archers = [Archer.new(count: shotsPerRound), Archer.new(count: shotsPerRound), Archer.new(count: shotsPerRound)]
        undoStack.removeAll(); redoStack.removeAll()
        saveData()
    }
    func saveSessionAndReset(note: String, includeInStats: Bool = true) {
        var entries: [RecordEntry] = []
        for archer in archers {
            if archer.isSeparator || archer.isTotalCalculator || archer.name.isEmpty { continue }
            
            let subs = archer.substitutions ?? [:]
            if subs.isEmpty {
                let shots = archer.marks.filter { $0 != .none }.count
                if shots > 0 {
                    entries.append(RecordEntry(name: archer.name, gender: archer.gender, grade: archer.grade, totalShots: shots, hits: archer.marks.filter { $0 == .hit }.count, isGuest: archer.isGuest))
                }
            } else {
                let sortedShots = subs.keys.sorted()
                // 1 person
                let firstEnd = sortedShots.first!
                let firstMarks = archer.marks[0..<firstEnd]
                let fShots = firstMarks.filter({$0 != .none}).count
                if fShots > 0 {
                    entries.append(RecordEntry(name: archer.name, gender: archer.gender, grade: archer.grade, totalShots: fShots, hits: firstMarks.filter({$0 == .hit}).count, isGuest: archer.isGuest))
                }
                // substitutes
                for i in 0..<sortedShots.count {
                    let start = sortedShots[i]
                    let end = (i + 1 < sortedShots.count) ? sortedShots[i+1] : archer.marks.count
                    let name = subs[start] ?? ""
                    let activeMarks = archer.marks[start..<min(end, archer.marks.count)]
                    let sShots = activeMarks.filter({$0 != .none}).count
                    if sShots > 0 {
                        entries.append(RecordEntry(name: name, gender: archer.gender, grade: archer.grade, totalShots: sShots, hits: activeMarks.filter({$0 == .hit}).count, isGuest: archer.isGuest))
                    }
                }
            }
        }
        if !entries.isEmpty {
            let pRecord = PracticeRecord(date: Date(), entries: entries, includeInStats: includeInStats)
            history.append(pRecord)
            syncHistoryToCloud(pRecord)
        }
        if !archers.isEmpty {
            let session = SessionRecord(date: Date(), archers: archers, shotCount: shotsPerRound, note: note, includeInStats: includeInStats)
            sessions.insert(session, at: 0)
            syncSessionToCloud(session)
        }
        resetCurrentSession()
    }
    
    func deleteSession(session: SessionRecord) {
        if let index = sessions.firstIndex(where: { $0.id == session.id }) {
            trash.insert(sessions[index], at: 0)
            let idToDelete = sessions[index].id
            sessions.remove(at: index)
            saveData()
            deleteSessionFromCloud(sessionID: idToDelete)
        }
    }
    
    func restoreSession(at offsets: IndexSet) {
        offsets.forEach { index in
            let session = trash[index]
            sessions.insert(session, at: 0)
            syncSessionToCloud(session)
            trash.remove(at: index)
        }
        sessions.sort { $0.date > $1.date }
        saveData()
    }
    
    func permanentlyDeleteSession(at offsets: IndexSet) {
        trash.remove(atOffsets: offsets)
        saveData()
    }

    func updateSession(_ session: SessionRecord) {
        if let index = sessions.firstIndex(where: { $0.id == session.id }) {
            var updated = session
            updated.lastModified = Date()
            sessions[index] = updated
            saveData()
            syncSessionToCloud(updated)
        }
    }

    func updateSessionShotCount(sessionID: UUID, newCount: Int) {
        guard let index = sessions.firstIndex(where: { $0.id == sessionID }) else { return }
        sessions[index].shotCount = newCount
        sessions[index].lastModified = Date()
        for i in 0..<sessions[index].archers.count {
            let currentMarks = sessions[index].archers[i].marks
            if currentMarks.count < newCount {
                sessions[index].archers[i].marks.append(contentsOf: Array(repeating: .none, count: newCount - currentMarks.count))
            } else if currentMarks.count > newCount {
                sessions[index].archers[i].marks = Array(currentMarks.prefix(newCount))
            }
        }
        saveData()
        syncSessionToCloud(sessions[index])
    }
    
    func syncSessionToCloud(_ session: SessionRecord) {
        guard let url = URL(string: "\(databaseURL)/appData/sessions/\(session.id).json") else { return }
        var request = URLRequest(url: url)
        request.httpMethod = "PUT"
        request.httpBody = try? JSONEncoder().encode(session)
        syncSession.dataTask(with: request) { _, _, _ in }.resume()
    }
    
    func syncHistoryToCloud(_ record: PracticeRecord) {
        guard let url = URL(string: "\(databaseURL)/appData/history/\(record.id).json") else { return }
        var request = URLRequest(url: url)
        request.httpMethod = "PUT"
        request.httpBody = try? JSONEncoder().encode(record)
        syncSession.dataTask(with: request) { _, _, _ in }.resume()
    }

    func deleteSessionFromCloud(sessionID: UUID) {
        guard let url = URL(string: "\(databaseURL)/appData/sessions/\(sessionID).json") else { return }
        var request = URLRequest(url: url)
        request.httpMethod = "DELETE"
        syncSession.dataTask(with: request) { _, _, _ in }.resume()
    }

    func fetchAndMergeCloudData() {
        guard let url = URL(string: "\(databaseURL)/appData.json") else { return }
        URLSession.shared.dataTask(with: url) { data, _, _ in
            guard let data = data else { return }
            do {
                let decoder = JSONDecoder()
                // Custom date decoding for cross-platform compatibility
                decoder.dateDecodingStrategy = .custom { decoder in
                    let container = try decoder.singleValueContainer()
                    if let df = try? container.decode(Double.self) {
                        return df > 1e12 ? Date(timeIntervalSince1970: df/1000.0) : (df > 1e9 ? Date(timeIntervalSince1970: df) : Date(timeIntervalSinceReferenceDate: df))
                    }
                    if let s = try? container.decode(String.self) {
                        return ISO8601DateFormatter().date(from: s) ?? Date()
                    }
                    return Date()
                }
                
                let cloudData = try decoder.decode(SavedDataCloud.self, from: data)
                
                DispatchQueue.main.async {
                    // Merge Sessions
                    if let cloudSessions = cloudData.sessions {
                        for (idStr, cloudSession) in cloudSessions {
                            guard let id = UUID(uuidString: idStr) else { continue }
                            if let localIndex = self.sessions.firstIndex(where: { $0.id == id }) {
                                if cloudSession.lastModified > self.sessions[localIndex].lastModified {
                                    self.sessions[localIndex] = cloudSession
                                }
                            } else {
                                self.sessions.append(cloudSession)
                            }
                        }
                        self.sessions.sort { $0.date > $1.date }
                    }
                    
                    // Merge Members (Simple union by ID)
                    if let cloudMembers = cloudData.members {
                        for member in cloudMembers {
                            if !self.members.contains(where: { $0.id == member.id }) {
                                self.members.append(member)
                            }
                        }
                    }
                    self.saveData()
                }
            } catch { print("Merge Error: \(error)") }
        }.resume()
    }
    
    // Cloud parsing helper
    struct SavedDataCloud: Codable {
        var sessions: [String: SessionRecord]?
        var history: [String: PracticeRecord]?
        var members: [Member]?
    }

    func syncToCloud() {
        // Fallback or full sync
        guard let url = URL(string: "\(databaseURL)/appData.json") else { return }
        
        // シンク中状態に設定
        DispatchQueue.main.async {
            self.isSyncing = true
            for i in 0..<self.sessions.count {
                self.sessions[i].syncStatus = "syncing"
            }
        }
        
        // Convert sessions to dict for better Firebase structure
        var sessionDict: [String: SessionRecord] = [:]
        for s in sessions { sessionDict[s.id.uuidString] = s }
        
        var historyDict: [String: PracticeRecord] = [:]
        for h in history { historyDict[h.id.uuidString] = h }

        let dataToSync: [String: Any] = [
            "members": members.map { try? JSONSerialization.jsonObject(with: JSONEncoder().encode($0)) },
            "sessions": sessionDict.mapValues { try? JSONSerialization.jsonObject(with: JSONEncoder().encode($0)) },
            "trash": trash.map { try? JSONSerialization.jsonObject(with: JSONEncoder().encode($0)) },
            "alumni": alumni.map { try? JSONSerialization.jsonObject(with: JSONEncoder().encode($0)) },
            "history": historyDict.mapValues { try? JSONSerialization.jsonObject(with: JSONEncoder().encode($0)) }
        ]
        
        var request = URLRequest(url: url)
        request.httpMethod = "PUT"
        request.httpBody = try? JSONSerialization.data(withJSONObject: dataToSync)
        
        syncSession.dataTask(with: request) { data, response, error in
            DispatchQueue.main.async {
                self.isSyncing = false
                let httpResponse = response as? HTTPURLResponse
                if error == nil && (httpResponse?.statusCode == 200 || httpResponse?.statusCode == 201) {
                    for i in 0..<self.sessions.count {
                        self.sessions[i].syncStatus = "synced"
                    }
                    print("Cloud Sync Success (Status: \(httpResponse?.statusCode ?? 0))")
                } else {
                    for i in 0..<self.sessions.count {
                        self.sessions[i].syncStatus = "failed"
                    }
                    print("Cloud Sync Failed: \(error?.localizedDescription ?? "HTTP \(httpResponse?.statusCode ?? 0)")")
                }
            }
        }.resume()
    }

    // History Operations
    func moveArcher(from source: Archer, to destination: Archer, sessionID: UUID?) {
        guard source.id != destination.id else { return }
        if let sid = sessionID, let si = sessions.firstIndex(where: { $0.id == sid }) {
            let sArchers = sessions[si].archers
            guard let from = sArchers.firstIndex(where: { $0.id == source.id }),
                  let to = sArchers.firstIndex(where: { $0.id == destination.id }) else { return }
            sessions[si].archers.move(fromOffsets: IndexSet(integer: from), toOffset: to > from ? to + 1 : to)
            sessions[si].lastModified = Date()
            saveData()
            syncSessionToCloud(sessions[si])
        } else {
            guard let from = archers.firstIndex(where: { $0.id == source.id }),
                  let to = archers.firstIndex(where: { $0.id == destination.id }) else { return }
            archers.move(fromOffsets: IndexSet(integer: from), toOffset: to > from ? to + 1 : to)
        }
    }
    
    func toggleHistoryMark(sessionID: UUID, archerID: UUID, markIndex: Int) {
        guard let sIndex = sessions.firstIndex(where: { $0.id == sessionID }) else { return }
        guard let aIndex = sessions[sIndex].archers.firstIndex(where: { $0.id == archerID }) else { return }
        sessions[sIndex].archers[aIndex].marks[markIndex].toggle()
        sessions[sIndex].lastModified = Date()
        saveData(); syncSessionToCloud(sessions[sIndex])
    }
    func setHistoryMark(sessionID: UUID, archerID: UUID, markIndex: Int, mark: Mark) {
        guard let sIndex = sessions.firstIndex(where: { $0.id == sessionID }) else { return }
        guard let aIndex = sessions[sIndex].archers.firstIndex(where: { $0.id == archerID }) else { return }
        sessions[sIndex].archers[aIndex].marks[markIndex] = mark
        sessions[sIndex].lastModified = Date()
        saveData(); syncSessionToCloud(sessions[sIndex])
    }
    func deleteArcherFromSession(sessionID: UUID, archerID: UUID) {
        guard let sIndex = sessions.firstIndex(where: { $0.id == sessionID }) else { return }
        if let aIndex = sessions[sIndex].archers.firstIndex(where: { $0.id == archerID }) {
            sessions[sIndex].archers.remove(at: aIndex)
            sessions[sIndex].lastModified = Date()
            saveData(); syncSessionToCloud(sessions[sIndex])
        }
    }
    func addArcherToSession(sessionID: UUID, at index: Int? = nil) {
        guard let sIdx = sessions.firstIndex(where: { $0.id == sessionID }) else { return }
        let newArcher = Archer.new(count: sessions[sIdx].shotCount)
        if let i = index { sessions[sIdx].archers.insert(newArcher, at: i) }
        else { sessions[sIdx].archers.append(newArcher) }
        sessions[sIdx].lastModified = Date()
        saveData(); syncSessionToCloud(sessions[sIdx])
    }
    func addSeparatorToSession(sessionID: UUID, at index: Int? = nil) {
        guard let sIdx = sessions.firstIndex(where: { $0.id == sessionID }) else { return }
        let newSep = Archer.newSeparator()
        if let i = index { sessions[sIdx].archers.insert(newSep, at: i) }
        else { sessions[sIdx].archers.append(newSep) }
        sessions[sIdx].lastModified = Date()
        saveData(); syncSessionToCloud(sessions[sIdx])
    }
    func addTotalToSession(sessionID: UUID, at index: Int? = nil) {
        guard let sIdx = sessions.firstIndex(where: { $0.id == sessionID }) else { return }
        let newTotal = Archer.newTotalCalculator(count: sessions[sIdx].shotCount)
        if let i = index { sessions[sIdx].archers.insert(newTotal, at: i) }
        else { sessions[sIdx].archers.append(newTotal) }
        sessions[sIdx].lastModified = Date()
        saveData(); syncSessionToCloud(sessions[sIdx])
    }
    func setSubstitution(archerID: UUID, shotIndex: Int, name: String, sessionID: UUID?) {
        pushUndo()
        if let sid = sessionID, let si = sessions.firstIndex(where: { $0.id == sid }) {
            if let ai = sessions[si].archers.firstIndex(where: { $0.id == archerID }) {
                if sessions[si].archers[ai].substitutions == nil { sessions[si].archers[ai].substitutions = [:] }
                sessions[si].archers[ai].substitutions?[shotIndex] = name
                sessions[si].lastModified = Date()
                saveData(); syncSessionToCloud(sessions[si])
            }
        } else if let ai = archers.firstIndex(where: { $0.id == archerID }) {
            if archers[ai].substitutions == nil { archers[ai].substitutions = [:] }
            archers[ai].substitutions?[shotIndex] = name
            saveData()
        }
    }
    func removeSubstitutions(archerID: UUID, sessionID: UUID?) {
        pushUndo()
        if let sid = sessionID, let si = sessions.firstIndex(where: { $0.id == sid }) {
            if let ai = sessions[si].archers.firstIndex(where: { $0.id == archerID }) {
                sessions[si].archers[ai].substitutions = nil
                sessions[si].lastModified = Date()
                saveData(); syncSessionToCloud(sessions[si])
            }
        } else if let ai = archers.firstIndex(where: { $0.id == archerID }) {
            archers[ai].substitutions = nil
            saveData()
        }
    }

    // Calculation Groups
    func getGroupArchers(for calculatorID: UUID) -> [Archer] {
        guard let index = archers.firstIndex(where: { $0.id == calculatorID }) else { return [] }
        var group: [Archer] = []
        for i in (0..<index).reversed() {
            let target = archers[i]
            if target.isSeparator || target.isTotalCalculator { break }
            group.append(target)
        }
        return group
    }
    func getHistoryGroup(sessionArchers: [Archer], targetID: UUID) -> [Archer] {
        guard let index = sessionArchers.firstIndex(where: { $0.id == targetID }) else { return [] }
        var group: [Archer] = []
        for i in (0..<index).reversed() {
            let target = sessionArchers[i]
            if target.isSeparator || target.isTotalCalculator { break }
            group.append(target)
        }
        return group
    }

    // persistence
    func saveData() {
        do {
            let dataObj = SavedData(currentArchers: archers, members: members, alumni: alumni, history: history, sessions: sessions, lastFiscalYearChecked: lastFiscalYearChecked, shotsPerRound: shotsPerRound, isFirstLaunch: isFirstLaunch, trash: trash)
            let data = try JSONEncoder().encode(dataObj)
            try data.write(to: saveURL)
        } catch { print("保存失敗: \(error)") }
    }
    
    func clearAllData() {
        self.sessions = []
        self.members = []
        self.history = []
        self.alumni = []
        self.trash = []
        saveData()
    }
    
    private func loadData() {
        do {
            let data = try Data(contentsOf: saveURL)
            let decoded = try JSONDecoder().decode(SavedData.self, from: data)
            archers = decoded.currentArchers ?? []; members = decoded.members ?? []; alumni = decoded.alumni ?? []
            history = decoded.history ?? []; sessions = decoded.sessions ?? []
            trash = decoded.trash ?? []
            lastFiscalYearChecked = decoded.lastFiscalYearChecked ?? 2024; shotsPerRound = decoded.shotsPerRound ?? 12
            isFirstLaunch = decoded.isFirstLaunch ?? false
            resizeArchers()
        } catch {
            shotsPerRound = 12; archers = [Archer.new(count: 12), Archer.new(count: 12), Archer.new(count: 12)]; lastFiscalYearChecked = 2023
            isFirstLaunch = true
        }
    }
    
    // Restoration & Export helpers
    func exportDataToString() -> String? {
        do {
            let dataObj = SavedData(currentArchers: archers, members: members, alumni: alumni, history: history, sessions: sessions, lastFiscalYearChecked: lastFiscalYearChecked, shotsPerRound: shotsPerRound, isFirstLaunch: isFirstLaunch, trash: trash)
            let encoder = JSONEncoder(); encoder.outputFormatting = .prettyPrinted
            let data = try encoder.encode(dataObj)
            return String(data: data, encoding: .utf8)
        } catch { return nil }
    }

    func exportSessionsToCSV() -> String {
        var csvString = "\u{FEFF}Date,Archer,Grade,Gender,Hits,Total\n"
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "ja_JP")
        formatter.dateFormat = "yyyy/MM/dd HH:mm"
        for session in sessions {
            let dateStr = formatter.string(from: session.date)
            for archer in session.archers {
                if archer.isSeparator || archer.isTotalCalculator { continue }
                let hits = archer.marks.filter { $0 == .hit }.count
                let total = archer.marks.filter { $0 != .none }.count
                csvString += "\(dateStr),\(archer.name),\(archer.grade),\(archer.gender.rawValue),\(hits),\(total)\n"
            }
        }
        return csvString
    }

    func importDataFromString(_ jsonString: String) -> Bool {
        guard let data = jsonString.data(using: .utf8) else {
            self.lastRestoreError = "データの形式（UTF-8）が正しくありません。"; return false
        }
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .custom { decoder in
            let container = try decoder.singleValueContainer()
            if let df = try? container.decode(Double.self) {
                // 2001 (Reference Date) or 1970 (Unix) disambiguation
                if df > 1_000_000_000 { // Likely Unix timestamp (2001-09-09+)
                    return Date(timeIntervalSince1970: df)
                } else {
                    return Date(timeIntervalSinceReferenceDate: df)
                }
            }
            if let ios8601 = try? container.decode(String.self) {
                let formatter = ISO8601DateFormatter()
                if let date = formatter.date(from: ios8601) { return date }
            }
            throw DecodingError.dataCorruptedError(in: container, debugDescription: "Invalid date format")
        }

        do {
            // パターン1: 完全な SavedData
            let decoded = try decoder.decode(SavedData.self, from: data)
            applyRestore(decoded)
            return true
        } catch let error1 {
            do {
                // パターン2: Archer配列のみ
                let archersOnly = try decoder.decode([Archer].self, from: data)
                applyRestore(SavedData(currentArchers: archersOnly))
                return true
            } catch {
                self.lastRestoreError = "復元に失敗しました。形式を確認してください。\nエラー: \(error1.localizedDescription)"
                return false
            }
        }
    }

    private func applyRestore(_ decoded: SavedData) {
        DispatchQueue.main.async {
            if let v = decoded.currentArchers { self.archers = v }
            if let v = decoded.members { self.members = v }
            if let v = decoded.alumni { self.alumni = v }
            if let v = decoded.history { self.history = v }
            if let v = decoded.sessions { self.sessions = v }
            if let v = decoded.trash { self.trash = v }
            if let v = decoded.lastFiscalYearChecked { self.lastFiscalYearChecked = v }
            if let v = decoded.shotsPerRound { self.shotsPerRound = v }
            if let v = decoded.isFirstLaunch { self.isFirstLaunch = v }
            self.saveData()
            self.lastRestoreError = ""
        }
    }

    func restoreData(from url: URL) -> Bool {
        let hasAccess = url.startAccessingSecurityScopedResource()
        defer { if hasAccess { url.stopAccessingSecurityScopedResource() } }
        
        do {
            let data = try Data(contentsOf: url)
            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .custom { decoder in
                let container = try decoder.singleValueContainer()
                if let df = try? container.decode(Double.self) {
                    return Date(timeIntervalSinceReferenceDate: df)
                }
                return try Date(from: decoder)
            }
            let decoded = try decoder.decode(SavedData.self, from: data)
            DispatchQueue.main.async {
                if let v = decoded.currentArchers { self.archers = v }
                if let v = decoded.members { self.members = v }
                if let v = decoded.alumni { self.alumni = v }
                if let v = decoded.history { self.history = v }
                if let v = decoded.sessions { self.sessions = v }
                if let v = decoded.trash { self.trash = v }
                if let v = decoded.lastFiscalYearChecked { self.lastFiscalYearChecked = v }
                if let v = decoded.shotsPerRound { self.shotsPerRound = v }
                if let v = decoded.isFirstLaunch { self.isFirstLaunch = v }
                self.saveData()
                self.lastRestoreError = ""
            }
            return true
        } catch {
            self.lastRestoreError = "ファイルからの復元に失敗しました: \(error.localizedDescription)"
            return false
        }
    }

    func getDisplayName(for memberName: String) -> String {
        let separator = memberName.contains(" ") ? " " : (memberName.contains("　") ? "　" : "")
        var surname = memberName
        var firstName = ""
        if !separator.isEmpty {
            let components = memberName.components(separatedBy: separator)
            if components.count >= 1 { surname = components[0] }
            if components.count >= 2 { firstName = components[1] }
        }
        let sameSurnameCount = members.filter { m in
            let s = m.name.contains(" ") ? m.name.components(separatedBy: " ")[0] : (m.name.contains("　") ? m.name.components(separatedBy: "　")[0] : m.name)
            return s == surname
        }.count
        if sameSurnameCount > 1 && !firstName.isEmpty { return "\(surname) (\(String(firstName.prefix(1))))" } else { return surname }
    }

    func addMember(name: String, gender: Gender, grade: Int) { if !name.isEmpty { members.append(Member(name: name, gender: gender, grade: grade)) } }
    func updateMember(memberID: UUID, newName: String, newGender: Gender, newGrade: Int) {
        guard let index = members.firstIndex(where: { $0.id == memberID }) else { return }
        let oldName = members[index].name
        members[index].name = newName; members[index].gender = newGender; members[index].grade = newGrade
        if oldName != newName {
            for i in 0..<history.count { for j in 0..<history[i].entries.count { if history[i].entries[j].name == oldName { history[i].entries[j].name = newName } } }
            for i in 0..<sessions.count { for j in 0..<sessions[i].archers.count { if sessions[i].archers[j].name == oldName { sessions[i].archers[j].name = newName } } }
        }
        saveData()
    }
    func deleteMember(at offsets: IndexSet) { members.remove(atOffsets: offsets) }
    func deleteAlumni(at offsets: IndexSet) { alumni.remove(atOffsets: offsets) }

    // Session History helpers
    var availableFiscalYears: [Int] {
        let years = Set(sessions.map { getFiscalYear(date: $0.date) })
        return years.sorted(by: >)
    }
    func availableMonths(inFiscalYear year: Int) -> [Int] {
        let filtered = sessions.filter { getFiscalYear(date: $0.date) == year }
        let months = Set(filtered.map { Calendar.current.component(.month, from: $0.date) })
        return months.sorted { m1, m2 in
            let order1 = m1 < 4 ? m1 + 12 : m1
            let order2 = m2 < 4 ? m2 + 12 : m2
            return order1 > order2
        }
    }
    func sessions(fiscalYear: Int, month: Int) -> [SessionRecord] {
        return sessions.filter {
            let fYear = getFiscalYear(date: $0.date)
            let m = Calendar.current.component(.month, from: $0.date)
            return fYear == fiscalYear && m == month
        }.sorted(by: { $0.date > $1.date })
    }
    
    // Stats
    func getStats(for memberName: String) -> MemberStat {
        var stat = MemberStat()
        for session in sessions {
            if let archer = session.archers.first(where: { $0.name == memberName && !$0.isSeparator && !$0.isTotalCalculator }) {
                stat.totalShots += archer.marks.filter { $0 != .none }.count
                stat.totalHits += archer.marks.filter { $0 == .hit }.count
                stat.sessionCount += 1
            }
        }
        return stat
    }
    struct MemberStat: Identifiable {
        let id = UUID()
        var totalShots: Int = 0
        var totalHits: Int = 0
        var rate: Double { totalShots > 0 ? Double(totalHits) / Double(totalShots) : 0 }
        var sessionCount: Int = 0
    }

    struct MemberStats: Identifiable {
        let id = UUID()
        let name: String
        let gender: Gender
        let grade: Int
        var totalShots: Int
        var totalHits: Int
        var sessionCount: Int
        var rate: Double { totalShots > 0 ? Double(totalHits) / Double(totalShots) : 0 }
    }

    func calculateStats(sessions: [SessionRecord], gender: Gender?, grade: Int) -> [MemberStats] {
        var memberStats: [String: MemberStats] = [:]
        
        func updateStat(name: String, hits: Int, shots: Int, archer: Archer) {
            if name.isEmpty { return }
            let isMember = members.contains(where: { $0.name == name })
            let isAlumni = alumni.contains(where: { $0.name == name })
            if !isMember && !isAlumni { return } // ゲストなので除外
            var current = memberStats[name] ?? MemberStats(name: name, gender: archer.gender, grade: archer.grade, totalShots: 0, totalHits: 0, sessionCount: 0)
            current.totalShots += shots
            current.totalHits += hits
            current.sessionCount += 1
            memberStats[name] = current
        }

        for session in sessions {
            if !session.includeInStats { continue }
            for archer in session.archers {
                if archer.isSeparator || archer.isTotalCalculator || archer.isGuest || archer.name.isEmpty { continue }
                if let gender = gender, archer.gender != gender { continue }
                if grade != 0 && archer.grade != grade { continue }
                
                let subs = archer.substitutions ?? [:]
                if subs.isEmpty {
                    let shots = archer.marks.filter { $0 != .none }.count
                    let hits = archer.marks.filter { $0 == .hit }.count
                    updateStat(name: archer.name, hits: hits, shots: shots, archer: archer)
                } else {
                    let sortedShots = subs.keys.sorted()
                    // 1人目
                    let firstEnd = sortedShots.first!
                    let firstMarks = archer.marks[0..<firstEnd]
                    updateStat(name: archer.name, hits: firstMarks.filter({$0 == .hit}).count, shots: firstMarks.filter({$0 != .none}).count, archer: archer)
                    
                    // 交代者
                    for i in 0..<sortedShots.count {
                        let start = sortedShots[i]
                        let end = (i + 1 < sortedShots.count) ? sortedShots[i+1] : archer.marks.count
                        let name = subs[start] ?? ""
                        let activeMarks = archer.marks[start..<min(end, archer.marks.count)]
                        updateStat(name: name, hits: activeMarks.filter({$0 == .hit}).count, shots: activeMarks.filter({$0 != .none}).count, archer: archer)
                    }
                }
            }
        }
        return Array(memberStats.values).sorted { $0.rate > $1.rate }
    }

    func calculateBlockTotal(group: [Archer], startIndex: Int) -> Int {
        group.reduce(0) { sum, a in
            let hitsInBlock = (0..<4).reduce(0) { s, offset in
                let targetIndex = startIndex + offset
                return (targetIndex < a.marks.count && a.marks[targetIndex] == .hit) ? s + 1 : s
            }
            return sum + hitsInBlock
        }
    }
}

// MARK: - 3. UI ツール & 定数

struct UIConfig {
    static let cellWidth: CGFloat = 58
    static let cellHeight: CGFloat = 42
    static let separatorWidth: CGFloat = 35
    static let headerWidth: CGFloat = 35
    static let footerHeight: CGFloat = 95
}

struct GridCellBorder: ViewModifier {
    var width: CGFloat = 1
    var color: Color = Color.gray.opacity(0.3)
    var bottomWidth: CGFloat? = nil
    var bottomColor: Color? = nil
    func body(content: Content) -> some View {
        content.overlay(
            ZStack(alignment: .bottomTrailing) {
                Rectangle().fill(color).frame(width: width).frame(maxHeight: .infinity, alignment: .trailing)
                Rectangle().fill(bottomColor ?? color).frame(height: bottomWidth ?? width).frame(maxWidth: .infinity, alignment: .bottom)
            }
        )
    }
}
extension View {
    func gridBorder(width: CGFloat = 1, color: Color = .black, bottomWidth: CGFloat? = nil, bottomColor: Color? = nil) -> some View {
        self.modifier(GridCellBorder(width: width, color: color, bottomWidth: bottomWidth, bottomColor: bottomColor ?? color))
    }
}

struct ArcherColumnView: View {
    @ObservedObject var model: ScoreModel
    let archer: Archer
    let shots: Int
    var isReadOnly: Bool = false
    var sessionID: UUID? = nil
    var showFooter: Bool = true
    
    var body: some View {
        VStack(spacing: 0) {
            ArcherHeaderView(model: model, archer: archer, isReadOnly: isReadOnly, sessionID: sessionID)
            
            if archer.isSeparator { SeparatorGridView(model: model, archer: archer, shots: shots, isReadOnly: isReadOnly, sessionID: sessionID) }
            else if archer.isTotalCalculator { TotalCalculatorGridView(model: model, archer: archer, shots: shots, isReadOnly: isReadOnly, sessionID: sessionID) }
            else {
                VStack(spacing: 0) {
                    ForEach((0..<shots).reversed(), id: \.self) { index in
                        let locked = model.isLocked(archerID: archer.id, blockIndex: index / 4, sessionID: sessionID)
                        let isSep = index % 4 == 0 && index != 0
                        GridCellView(model: model, archer: archer, index: index, isReadOnly: isReadOnly, sessionID: sessionID, locked: locked)
                            .frame(width: UIConfig.cellWidth, height: UIConfig.cellHeight)
                            .gridBorder(color: .black, bottomWidth: index == 0 ? 1 : (isSep ? 2 : 1), bottomColor: .black)
                    }
                }
            }
            
            if showFooter {
                ArcherFooterView(model: model, archer: archer, isReadOnly: isReadOnly, sessionID: sessionID)
            }
        }
        .overlay(alignment: .trailing) {
            if !archer.isSeparator && !archer.isTotalCalculator {
                Rectangle().fill(Color.black).frame(width: 1)
            }
        }
    }
}

// MARK: - 3.1 Grid Components (Performance Optimization)

struct ArcherHeaderView: View {
    @ObservedObject var model: ScoreModel
    let archer: Archer
    var isReadOnly: Bool = false
    var sessionID: UUID? = nil
    
    var body: some View {
        if archer.isSeparator {
            Rectangle().fill(Color.gray.opacity(0.1)).frame(width: UIConfig.separatorWidth, height: UIConfig.cellHeight).gridBorder()
        } else {
            ZStack {
                Rectangle().fill(archer.isTotalCalculator ? Color.blue.opacity(0.05) : Color(.secondarySystemBackground))
                VStack(spacing: 2) {
                    if archer.isTotalCalculator {
                        // 計ボタンで追加した列の合計
                        let group = isReadOnly ? model.getHistoryGroup(sessionArchers: model.sessions.first(where: { $0.id == sessionID })?.archers ?? [], targetID: archer.id) : model.getGroupArchers(for: archer.id)
                        let totalHits = group.reduce(0) { sum, a in sum + a.marks.filter { $0 == .hit }.count }
                        Text("\(totalHits)").font(.title3).fontWeight(.bold).foregroundColor(.blue)
                    } else {
                        // 的中を表示
                        let stats = getSubstitutionStats()
                        if stats.isEmpty {
                            // 交代なし: 的中のみ表示
                            let hits = archer.marks.filter { $0 == .hit }.count
                            Text("\(hits)").font(.title3).fontWeight(.bold).foregroundColor(.primary)
                        } else {
                            // 交代あり: 各自の的中を表示
                            Text(stats)
                                .font(.system(size: 8))
                                .fontWeight(.bold)
                                .foregroundColor(.primary)
                                .lineLimit(2)
                                .multilineTextAlignment(.center)
                        }
                    }
                }
                .padding(.horizontal, 2)
            }
            .frame(width: UIConfig.cellWidth, height: UIConfig.cellHeight)
            .gridBorder()
        }
    }

    private func getSubstitutionStats() -> String {
        let subs = archer.substitutions ?? [:]
        if subs.isEmpty { return "" }
        let sortedShots = subs.keys.sorted()
        var statsStrings: [String] = []
        
        // 1人目
        let firstEnd = sortedShots.first!
        let firstHits = archer.marks[0..<firstEnd].filter { $0 == .hit }.count
        statsStrings.append("\(model.getDisplayName(for: archer.name)) \(firstHits)")
        
        // 交代した人たち
        for i in 0..<sortedShots.count {
            let start = sortedShots[i]
            let end = (i + 1 < sortedShots.count) ? sortedShots[i+1] : archer.marks.count
            let name = subs[start] ?? ""
            let hits = archer.marks[start..<min(end, archer.marks.count)].filter { $0 == .hit }.count
            statsStrings.append("\(model.getDisplayName(for: name)) \(hits)")
        }
        return statsStrings.joined(separator: ", ")
    }
}

// (ArcherDropDelegate removed)

struct ArcherFooterView: View {
    @ObservedObject var model: ScoreModel
    let archer: Archer
    let isReadOnly: Bool
    var sessionID: UUID? = nil
    
    @State private var showSubstitutionPicker = false
    @State private var subShotNum = 1
    @State private var showGuestAlert = false
    @State private var guestNameInput = ""
    @State private var showManualSubAlert = false
    @State private var manualSubShotInput = ""
    @State private var subGuestNameInput = ""
    @State private var showSubGuestAlert = false
    @State private var selectedSubShotIndex = 0
    
    var body: some View {
        Group {
            if archer.isSeparator {
                Rectangle().fill(Color.gray.opacity(0.1)).frame(width: UIConfig.separatorWidth, height: UIConfig.footerHeight)
                    .overlay(alignment: .bottom) {
                        if !isReadOnly {
                            Button(action: {
                                if let sid = sessionID {
                                    model.deleteArcherFromSession(sessionID: sid, archerID: archer.id)
                                } else {
                                    withAnimation { model.deleteArcher(id: archer.id) }
                                }
                            }) {
                                Image(systemName: "xmark.circle.fill")
                                    .font(.title2)
                                    .foregroundColor(.gray)
                                    .padding(.bottom, 10)
                            }.buttonStyle(.plain)
                        }
                    }
                    .gridBorder()
            } else {
                Menu {
                    if let sid = sessionID, !isReadOnly {
                        // 日本履歴ビューの管理者モード: セッションレベルの操作
                        if let sIdx = model.sessions.firstIndex(where: { $0.id == sid }) {
                            let sessions = model.sessions[sIdx]
                            let archers = sessions.archers
                            if let idx = archers.firstIndex(where: { $0.id == archer.id }) {
                                Button("左に射手を追加") { model.addArcherToSession(sessionID: sid, at: idx + 1); }
                                Button("左に間隔を追加") { model.addSeparatorToSession(sessionID: sid, at: idx + 1) }
                                Button("左に計を追加") { model.addTotalToSession(sessionID: sid, at: idx + 1) }
                                Divider()
                                Button("削除", role: .destructive) { model.deleteArcherFromSession(sessionID: sid, archerID: archer.id) }
                            }
                        }
                    } else if !isReadOnly {
                        // 通常の現在的中ビュー: モデルレベルの操作
                        if let idx = model.archers.firstIndex(where: { $0.id == archer.id }) {
                            Button("左に射手を追加") { model.pushUndo(); model.archers.insert(Archer.new(count: model.shotsPerRound), at: idx + 1) }
                            Button("左に間隔を追加") { model.pushUndo(); model.archers.insert(Archer.newSeparator(), at: idx + 1) }
                            Button("左に計を追加") { model.pushUndo(); model.archers.insert(Archer.newTotalCalculator(count: model.shotsPerRound), at: idx + 1) }
                            Divider()
                            Button("削除", role: .destructive) { withAnimation { model.deleteArcher(id: archer.id) } }
                        }
                    }
                    // 名前選択(管理モードまたは編集中のみ)
                    if (!isReadOnly || model.isAdminMode) && !archer.isTotalCalculator {
                        ForEach(model.sortedMembers) { m in
                            Button {
                                if let sid = sessionID {
                                    if let si = model.sessions.firstIndex(where: { $0.id == sid }),
                                       let ai = model.sessions[si].archers.firstIndex(where: { $0.id == archer.id }) {
                                        model.sessions[si].archers[ai].name = m.name
                                        model.sessions[si].archers[ai].gender = m.gender
                                        model.sessions[si].archers[ai].grade = m.grade
                                        model.sessions[si].archers[ai].isGuest = false
                                        model.saveData(); model.syncToCloud()
                                    }
                                } else if let idx = model.archers.firstIndex(where: { $0.id == archer.id }) {
                                    model.archers[idx].name = m.name; model.archers[idx].gender = m.gender; model.archers[idx].grade = m.grade; model.archers[idx].isGuest = false
                                }
                            } label: { Text(m.name) }
                        }
                        Divider()
                        Button("ゲスト") { guestNameInput = ""; showGuestAlert = true }
                        
                        Divider()
                        Menu("途中交代") {
                            let totalShots = (sessionID != nil ? (model.sessions.first(where: {$0.id == sessionID})?.shotCount ?? 20) : model.shotsPerRound)
                            ForEach(stride(from: 1, through: totalShots, by: 4).map { $0 }, id: \.self) { num in
                                Menu("\(num)射目から") {
                                    ForEach(model.members) { m in
                                        Button(m.name) { model.setSubstitution(archerID: archer.id, shotIndex: num-1, name: m.name, sessionID: sessionID) }
                                    }
                                    Divider()
                                    Button("ゲスト登録...") {
                                        selectedSubShotIndex = num - 1
                                        subGuestNameInput = ""
                                        showSubGuestAlert = true
                                    }
                                }
                            }
                            Button("その他...") {
                                manualSubShotInput = ""
                                showSubstitutionPicker = true
                            }
                            Divider()
                            Button("交代を解除", role: .destructive) { model.removeSubstitutions(archerID: archer.id, sessionID: sessionID) }
                        }
                    }
                } label: {
                    ZStack {
                        Rectangle().fill(Color(.secondarySystemBackground))
                        VStack(spacing: 4) {
                            let displayName = model.getDisplayName(for: archer.name)
                            Text(archer.name.isEmpty ? "選択" : displayName)
                                .font(.headline)
                                .fontWeight(.bold)
                                .multilineTextAlignment(.center)
                                .foregroundColor(archer.name.isEmpty ? .gray : .primary)
                            if archer.isGuest { 
                                Text("(ゲスト)").font(.caption).foregroundColor(.gray) 
                            } else if archer.gender != .unknown { 
                                Image(systemName: "person.fill").font(.footnote).foregroundColor(archer.gender == .male ? .blue : .red) 
                            }
                        }.padding(4)
                    }
                }
                .frame(width: UIConfig.cellWidth, height: UIConfig.footerHeight)
                .buttonStyle(.plain)
                .disabled(isReadOnly)
                .gridBorder(bottomWidth: 1, bottomColor: .black)
                .sheet(isPresented: $showSubstitutionPicker) {
                    ManualSubstitutionSheet(model: model, archerID: archer.id, sessionID: sessionID)
                }
                .alert("ゲスト名", isPresented: $showGuestAlert) {
                    TextField("名前", text: $guestNameInput)
                    Button("OK") {
                        let name = guestNameInput.isEmpty ? "ゲスト" : guestNameInput
                        if let sid = sessionID, let si = model.sessions.firstIndex(where: { $0.id == sid }),
                           let ai = model.sessions[si].archers.firstIndex(where: { $0.id == archer.id }) {
                            model.sessions[si].archers[ai].name = name
                            model.sessions[si].archers[ai].isGuest = true
                            model.saveData(); model.syncSessionToCloud(model.sessions[si])
                        } else if let idx = model.archers.firstIndex(where: { $0.id == archer.id }) {
                            model.archers[idx].name = name
                            model.archers[idx].isGuest = true
                        }
                    }
                    Button("キャンセル", role: .cancel) { }
                }
                .alert("交代ゲスト名", isPresented: $showSubGuestAlert) {
                    TextField("名前", text: $subGuestNameInput)
                    Button("OK") {
                        let name = subGuestNameInput.isEmpty ? "ゲスト" : subGuestNameInput
                        model.setSubstitution(archerID: archer.id, shotIndex: selectedSubShotIndex, name: name, sessionID: sessionID)
                    }
                    Button("キャンセル", role: .cancel) { }
                }
            }
        }
    }
    
    private func showManualGuestSubAlert() {
        // Since we can't easily trigger another alert from a Menu action that also opens a sheet, 
        // we use the same sheet but with a different mode or another alert.
        // For simplicity, we'll use showSubstitutionPicker and add a guest option there.
        showSubstitutionPicker = true
    }
}

// MARK: - 3.1 Grid Components (Performance Optimization)

struct ManualSubstitutionSheet: View {
    @ObservedObject var model: ScoreModel
    let archerID: UUID
    let sessionID: UUID?
    @State private var shotInput = ""
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationStack {
            Form {
                Section("交代するタイミング") {
                    HStack {
                        Text("射目番号")
                        TextField("番号", text: $shotInput)
                            .keyboardType(.numberPad)
                            .multilineTextAlignment(.trailing)
                    }
                }
                Section("交代相手（部員またはゲスト）") {
                    ForEach(model.sortedMembers) { m in
                        Button(m.name) {
                            if let num = Int(shotInput) {
                                let totalShots = (sessionID != nil ? (model.sessions.first(where: {$0.id == sessionID})?.shotCount ?? 20) : model.shotsPerRound)
                                if num > 0 && num <= totalShots {
                                    model.setSubstitution(archerID: archerID, shotIndex: num-1, name: m.name, sessionID: sessionID)
                                    dismiss()
                                }
                            }
                        }.foregroundColor(.primary)
                    }
                    
                    Divider().padding(.vertical, 5)
                    
                    HStack {
                        Image(systemName: "person.badge.plus").foregroundColor(.blue)
                        TextField("ゲスト名を入力", text: $guestName)
                        Button("確定") {
                            if let num = Int(shotInput), !guestName.isEmpty {
                                let totalShots = (sessionID != nil ? (model.sessions.first(where: {$0.id == sessionID})?.shotCount ?? 20) : model.shotsPerRound)
                                if num > 0 && num <= totalShots {
                                    model.setSubstitution(archerID: archerID, shotIndex: num-1, name: guestName, sessionID: sessionID)
                                    dismiss()
                                }
                            }
                        }.buttonStyle(.borderedProminent).disabled(guestName.isEmpty || Int(shotInput) == nil)
                    }
                }
            }
            .navigationTitle("途中交代の設定")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("閉じる") { dismiss() }
                }
            }
        }
    }
    @State private var guestName = ""
}

struct SeparatorGridView: View {
    @ObservedObject var model: ScoreModel
    let archer: Archer // Needs the separator archer itself
    let shots: Int
    let isReadOnly: Bool
    var sessionID: UUID? = nil
    
    var body: some View {
        VStack(spacing: 0) {
            ForEach((0..<shots).reversed(), id: \.self) { index in
                let isSep = index % 4 == 0 && index != 0
                let blockIndex = index / 4
                let locked = model.isGroupLocked(controllerID: archer.id, blockIndex: blockIndex, sessionID: sessionID)
                ZStack(alignment: .top) {
                    Rectangle().fill(Color.gray.opacity(0.1))
                    if (index % 4 == 3) && (!isReadOnly || model.isAdminMode) {
                        Button(action: { model.toggleLock(controllerID: archer.id, blockIndex: blockIndex, sessionID: sessionID) }) {
                            Image(systemName: locked ? "lock.fill" : "lock.open")
                                .font(.system(size: 20))
                                .frame(width: UIConfig.separatorWidth, height: 35)
                                .contentShape(Rectangle())
                                .foregroundColor(locked ? .red : .gray)
                                .padding(.top, 2)
                        }
                    }
                }
                .frame(width: UIConfig.separatorWidth, height: UIConfig.cellHeight)
                .gridBorder(color: .black, bottomWidth: index == 0 ? 1 : (isSep ? 2 : 1), bottomColor: .black)
            }
        }
    }
}

struct TotalCalculatorGridView: View {
    @ObservedObject var model: ScoreModel
    let archer: Archer
    let shots: Int
    let isReadOnly: Bool
    let sessionID: UUID?
    
    var body: some View {
        let group = isReadOnly ? model.getHistoryGroup(sessionArchers: model.sessions.first(where: { $0.id == sessionID })?.archers ?? [], targetID: archer.id) : model.getGroupArchers(for: archer.id)
        VStack(spacing: 0) {
            ForEach((0..<shots).reversed(), id: \.self) { index in
                let isSep = index % 4 == 0 && index != 0
                let isBlockBottom = index % 4 == 0
                let locked = model.isGroupLocked(controllerID: archer.id, blockIndex: index / 4)
                ZStack(alignment: .center) {
                    Color.blue.opacity(0.1)
                    if isBlockBottom {
                        BlockTotalView(model: model, group: group, startIndex: index)
                    }
                    ZStack(alignment: .top) {
                        Rectangle().fill(Color.blue.opacity(0.05))
                        if (index % 4 == 3) && (!isReadOnly || model.isAdminMode) {
                            VStack {
                                Button(action: { model.toggleLock(controllerID: archer.id, blockIndex: index / 4, sessionID: sessionID) }) {
                                    Image(systemName: locked ? "lock.fill" : "lock.open")
                                        .font(.system(size: 20))
                                        .frame(width: 40, height: 35)
                                        .contentShape(Rectangle())
                                        .foregroundColor(locked ? .red : .gray)
                                        .padding(.top, 2)
                                }
                                Spacer()
                            }
                        }
                    }
                }
                .frame(width: UIConfig.cellWidth, height: UIConfig.cellHeight)
                .gridBorder(color: .black, bottomWidth: index == 0 ? 1 : (isSep ? 2 : 1), bottomColor: .black)
            }
        }
    }
}

struct BlockTotalView: View {
    @ObservedObject var model: ScoreModel
    let group: [Archer]
    let startIndex: Int
    
    var body: some View {
        let blockTotal = model.calculateBlockTotal(group: group, startIndex: startIndex)
        Text("\(blockTotal)").font(.title).fontWeight(.heavy).foregroundColor(.blue)
    }
}

struct ArcherMarksGridView: View {
    @ObservedObject var model: ScoreModel
    let archer: Archer
    let shots: Int
    let isReadOnly: Bool
    let sessionID: UUID?
    
    var body: some View {
        VStack(spacing: 0) {
            ForEach((0..<shots).reversed(), id: \.self) { index in
                let isSep = index % 4 == 0 && index != 0
                let locked = model.isLocked(archerID: archer.id, blockIndex: index / 4, sessionID: sessionID)
                GridCellView(model: model, archer: archer, index: index, isReadOnly: isReadOnly, sessionID: sessionID, locked: locked)
                    .frame(width: UIConfig.cellWidth, height: UIConfig.cellHeight)
                    .gridBorder(color: .black, bottomWidth: index == 0 ? 1 : (isSep ? 2 : 1), bottomColor: .black)
            }
        }
    }
}

struct GridCellView: View {
    @ObservedObject var model: ScoreModel
    let archer: Archer
    let index: Int
    let isReadOnly: Bool
    let sessionID: UUID?
    let locked: Bool
    
    @State private var pressTask: Task<Void, Never>? = nil

    var body: some View {
        ZStack {
            let effectiveLocked = locked && !(isReadOnly && !model.isAdminMode)
            Rectangle().fill(effectiveLocked ? Color(.systemGray6) : Color.white)
            Text(archer.marks.indices.contains(index) ? archer.marks[index].rawValue : "")
                .font(.system(size: 28, weight: .bold))
                .foregroundColor(archer.marks.indices.contains(index) ? archer.marks[index].color : .clear)
            
            if let subName = archer.substitutions?[index] {
                VStack {
                    Spacer()
                    Text(subName)
                        .font(.system(size: 9))
                        .foregroundColor(.gray)
                        .lineLimit(1)
                        .padding(.bottom, 2)
                }
            }
        }
        .contentShape(Rectangle())
        .onTapGesture {
            handleTap()
        }
    }
    
    private func handleTap() {
        if isReadOnly && !model.isAdminMode { return }
        if !isReadOnly && locked { return }
        
        let key = "\(archer.id.uuidString)_\(index)"
        let now = Date()
        
        if let lastT = model.lastTapTimes[key], now.timeIntervalSince(lastT) < 0.3 {
            // ダブルタップ判定 (Missに強制上書き)
            model.lastTapTimes.removeValue(forKey: key)
            
            if let sid = sessionID {
                model.setHistoryMark(sessionID: sid, archerID: archer.id, markIndex: index, mark: .miss)
            } else {
                if let aIdx = model.archers.firstIndex(where: { $0.id == archer.id }) {
                    model.archers[aIdx].marks[index] = .miss
                }
            }
        } else {
            // シングルタップ判定 (即座にHit/Noneをトグル)
            model.lastTapTimes[key] = now
            
            if let sid = sessionID {
                model.toggleHistoryMark(sessionID: sid, archerID: archer.id, markIndex: index)
            } else {
                if let aIdx = model.archers.firstIndex(where: { $0.id == archer.id }) {
                    model.pushUndo()
                    model.archers[aIdx].marks[index].toggle()
                }
            }
        }
    }
}
// MARK: - 5. メインビュー

struct RecordView: View {
    @ObservedObject var model: ScoreModel
    @State private var showResetAlert = false
    @State private var showCustomArrowAlert = false
    @State private var customArrowInput = ""
    @State private var sessionNote: String = ""
    @State private var showConfirmResetAlert = false
    @State private var includeInStats = true
    @State private var showExcludeConfirmAlert = false
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                PracticeGridView(model: model, shots: model.shotsPerRound, isReadOnly: false)
                
                HStack(spacing: 0) {
                    HStack(spacing: 12) {
                        Button(action: { model.undo() }) {
                            Image(systemName: "arrow.uturn.backward").font(.title3).padding(8)
                        }.disabled(!model.canUndo)
                        Button(action: { model.redo() }) {
                            Image(systemName: "arrow.uturn.forward").font(.title3).padding(8)
                        }.disabled(!model.canRedo)
                    }
                    .padding(.leading, 10)
                    
                    Spacer()
                    
                    HStack(spacing: 15) {
                        Button(action: { withAnimation { model.addArcher() } }) {
                            VStack(spacing: 4) { Image(systemName: "person.badge.plus").font(.title3); Text("人").font(.caption).fontWeight(.bold) }
                                .frame(width: 70, height: 65)
                                .background(Color.blue.opacity(0.1))
                                .cornerRadius(10)
                        }
                        Button(action: { withAnimation { model.addSeparator() } }) {
                            VStack(spacing: 4) { Image(systemName: "pause.fill").font(.title3); Text("間隔").font(.caption).fontWeight(.bold) }
                                .frame(width: 70, height: 65)
                                .background(Color.orange.opacity(0.1))
                                .cornerRadius(10)
                        }
                        Button(action: { withAnimation { model.addTotalCalculator() } }) {
                            VStack(spacing: 4) { Image(systemName: "sum").font(.title3); Text("計").font(.caption).fontWeight(.bold) }
                                .frame(width: 70, height: 65)
                                .background(Color.green.opacity(0.1))
                                .cornerRadius(10)
                        }
                    }
                    .tint(.primary)
                    
                    Spacer()
                    
                    Button("終了・保存") { sessionNote = ""; showResetAlert = true }
                        .fontWeight(.bold)
                        .tint(.red)
                        .buttonStyle(.borderedProminent)
                        .padding(.trailing, 10)
                }
                .padding(.vertical, 8)
                .background(Color(.systemBackground))
                .shadow(radius: 2)
            }
            .navigationTitle("今日の練習")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: { showConfirmResetAlert = true }) {
                        Text("リセット").foregroundColor(.red)
                    }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Menu("\(model.shotsPerRound)本") {
                        ForEach([4, 8, 12, 16, 20], id: \.self) { n in Button("\(n)本") { model.setShotsPerRound(n) } }
                        Button("任意...") { customArrowInput = "\(model.shotsPerRound)"; showCustomArrowAlert = true }
                    }
                }
            }
        }
        .alert("練習記録の保存", isPresented: $showResetAlert) {
            TextField("練習メモ（例: 合宿1日目）", text: $sessionNote)
            Button("保存") {
                model.saveSessionAndReset(note: sessionNote, includeInStats: true)
            }
            Button("統計に含めないで保存") {
                showExcludeConfirmAlert = true
            }
            Button("キャンセル", role: .cancel) { }
        } message: {
            Text("保存方法を選択してください。")
        }
        .alert("統計の除外確認", isPresented: $showExcludeConfirmAlert) {
            Button("統計に含めず保存", role: .destructive) {
                model.saveSessionAndReset(note: sessionNote, includeInStats: false)
            }
            Button("戻る", role: .cancel) {
                showResetAlert = true
            }
        } message: {
            Text("この記録を統計（分析画面）に含めずに保存しますか？\n（試合や特定の練習などを除外したい場合に利用します）")
        }
            .alert("現在の記録をリセットしますか？", isPresented: $showConfirmResetAlert) {
                Button("キャンセル", role: .cancel) {}
                Button("リセット", role: .destructive) { model.resetCurrentSession() }
            } message: {
                Text("この操作は取り消せません。")
            }
            .alert("矢数の詳細設定", isPresented: $showCustomArrowAlert) {
                TextField("本数", text: $customArrowInput).keyboardType(.numberPad)
                Button("キャンセル", role: .cancel) {}
                Button("決定") { if let v = Int(customArrowInput), v > 0 { model.setShotsPerRound(v) } }
            }
        }
    }

struct PracticeGridView: View {
    @ObservedObject var model: ScoreModel
    let shots: Int
    let isReadOnly: Bool
    var sessionID: UUID? = nil
    
    var archers: [Archer] {
        if let sessionID = sessionID {
            return model.sessions.first(where: { $0.id == sessionID })?.archers ?? []
        }
        return model.archers
    }

    var isTall: Bool {
        shots >= 16 // 16射(4立)以上などでスクロール必要と判定
    }

    var body: some View {
        GeometryReader { geo in
            
            ScrollView(.horizontal, showsIndicators: true) {
                if isTall {
                    // スクロール可能なハイブリッド版（フッター固定用ZStack構造）
                    ZStack(alignment: .bottom) {
                        ScrollView(.vertical, showsIndicators: true) {
                            gridContent
                                .padding(.bottom, UIConfig.footerHeight) // 固定されるフッターの高さ分だけ下に余白
                        }
                        
                        // フッター部分だけを上から重ねて固定
                        HStack(alignment: .bottom, spacing: 0) {
                            Text("名").font(.caption).frame(width: UIConfig.headerWidth, height: UIConfig.footerHeight).background(Color(.systemGray6)).gridBorder(bottomWidth: 1, bottomColor: .black)
                            ForEach(archers, id: \.id) { a in
                                ArcherFooterView(model: model, archer: a, isReadOnly: isReadOnly, sessionID: sessionID)
                                    .background(Color(.systemGray6))
                            }
                        }
                        .background(Color.white)
                        .shadow(color: .black.opacity(0.1), radius: 2, y: -2)
                    }
                    .frame(minWidth: geo.size.width)
                } else {
                    // 少量時（全体をスクロールの中で中央揃え）
                    ScrollView(.vertical, showsIndicators: false) {
                        VStack(spacing: 0) {
                            Spacer()
                            gridContent
                            Spacer()
                        }
                        .frame(minHeight: geo.size.height)
                    }
                    .frame(minWidth: geo.size.width)
                }
            }
            .id(sessionID?.uuidString ?? "current")
            .environment(\.layoutDirection, .rightToLeft)
        }
    }
    
    private var gridContent: some View {
        HStack(alignment: .top, spacing: 0) {
            // Label Column (Leftmost/Rightmost logically)
            VStack(spacing: 0) {
                Text("計").font(.caption).fontWeight(.bold).frame(width: UIConfig.headerWidth, height: UIConfig.cellHeight).background(Color.clear).gridBorder(bottomWidth: 1, bottomColor: .black)
                ForEach((1...shots).reversed(), id: \.self) { i in
                    let isSep = (i - 1) % 4 == 0 && i != 1
                    Text("\(i)").font(.caption2).frame(width: UIConfig.headerWidth, height: UIConfig.cellHeight).background(Color.clear).gridBorder(color: .black, bottomWidth: isSep ? 2 : 1, bottomColor: .black)
                }
                if !isTall {
                    Text("名").font(.caption).frame(width: UIConfig.headerWidth, height: UIConfig.footerHeight).background(Color.clear).gridBorder(bottomWidth: 1, bottomColor: .black)
                }
            }

            // Archer Columns
            ForEach(archers, id: \.id) { a in
                ArcherColumnView(model: model, archer: a, shots: shots, isReadOnly: isReadOnly, sessionID: sessionID, showFooter: !isTall)
            }
        }
    }
}

// MARK: - 5.1 Grid Layout Components (Performance Optimization)
// (Removed GridHeaderRow, GridMainArea, GridFooterRow)

struct HistoryDetailView: View {
    @ObservedObject var model: ScoreModel
    @State var sessionID: UUID
    @State private var showingEdit = false
    
    var session: SessionRecord? {
        model.sessions.first(where: { $0.id == sessionID })
    }
    
    var body: some View {
        if let currentSession = session {
            VStack(spacing: 0) {
                PracticeGridView(model: model, shots: currentSession.shotCount, isReadOnly: !model.isAdminMode, sessionID: currentSession.id)
                    .id(currentSession.id)
                if !currentSession.note.isEmpty {
                    Text("メモ: \(currentSession.note)")
                        .padding()
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Color(.secondarySystemBackground))
                }
            }
            .navigationTitle(currentSession.date.formatted(date: .numeric, time: .omitted))
            .toolbar {
                ToolbarItemGroup(placement: .navigationBarTrailing) {
                    Button(action: { navigate(to: -1) }) { Image(systemName: "chevron.left") }.disabled(!canNavigate(to: -1))
                    Button(action: { navigate(to: 1) }) { Image(systemName: "chevron.right") }.disabled(!canNavigate(to: 1))
                    
                    if model.isAdminMode {
                        Menu {
                            Button("人を追加") { model.addArcherToSession(sessionID: currentSession.id) }
                            Button("間隔を追加") { model.addSeparatorToSession(sessionID: currentSession.id) }
                            Button("計を追加") { model.addTotalToSession(sessionID: currentSession.id) }
                            Divider()
                            Button("同期保存") { model.syncSessionToCloud(currentSession) }
                            Button("編集") { showingEdit = true }
                        } label: {
                            Image(systemName: "ellipsis.circle")
                        }
                    }
                }
            }
            .sheet(isPresented: $showingEdit) {
                if let index = model.sessions.firstIndex(where: { $0.id == currentSession.id }) {
                    SessionEditView(model: model, session: $model.sessions[index])
                }
            }
        } else {
            Text("記録が見つかりません。")
        }
    }
    
    private func canNavigate(to offset: Int) -> Bool {
        let sorted = model.sortedSessions
        guard let currentIndex = sorted.firstIndex(where: { $0.id == sessionID }) else { return false }
        let targetIndex = currentIndex + offset
        return targetIndex >= 0 && targetIndex < sorted.count
    }
    
    private func navigate(to offset: Int) {
        let sorted = model.sortedSessions
        guard let currentIndex = sorted.firstIndex(where: { $0.id == sessionID }) else { return }
        let targetIndex = currentIndex + offset
        if targetIndex >= 0 && targetIndex < sorted.count {
            self.sessionID = sorted[targetIndex].id
        }
    }
}

// SessionHistoryView removed as HistoryListView is used instead

struct TrashView: View {
    @ObservedObject var model: ScoreModel
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationView {
            List {
                ForEach(model.trash) { session in
                    HStack {
                        VStack(alignment: .leading) {
                            Text(session.date, style: .date)
                                .fontWeight(.bold)
                        }
                        Spacer()
                        Button("復元") {
                            if let index = model.trash.firstIndex(where: { $0.id == session.id }) {
                                model.restoreSession(at: IndexSet(integer: index))
                            }
                        }.foregroundColor(.blue)
                    }
                }
                .onDelete(perform: model.permanentlyDeleteSession)
            }
            .navigationTitle("ゴミ箱")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("閉じる") { dismiss() }
                }
                ToolbarItem(placement: .navigationBarLeading) {
                    EditButton()
                }
            }
        }
    }
}

// SessionDetailView removed as HistoryDetailView is used instead

struct SessionEditView: View {
    @ObservedObject var model: ScoreModel
    @Binding var session: SessionRecord
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationView {
            Form {
                Section("基本情報") {
                    DatePicker("日付", selection: $session.date, displayedComponents: .date)
                    TextField("メモ", text: $session.note)
                    Stepper("矢数: \(session.shotCount)本", value: $session.shotCount, in: 4...100, step: 4)
                }
                
                Section("分析（統計）設定") {
                    Toggle("統計に含める", isOn: $session.includeInStats)
                }
                
                Section("記録の同期") {
                    Button("保存") {
                        model.updateSession(session)
                        dismiss()
                    }.foregroundColor(.blue)
                }
            }
            .navigationTitle("記録の編集")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("キャンセル") { dismiss() }
                }
            }
        }
    }
}

struct HistoryListView: View {
    @ObservedObject var model: ScoreModel
    @State private var showTrash = false
    @State private var secretTapCount = 0
    @State private var trashButtonTimeWindowStart: Date?
    @State private var selectedYear: Int?
    @State private var selectedMonth: Int?
    
    var body: some View {
        NavigationStack {
            mainContent
            .navigationTitle("過去の記録表")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .principal) {
                    if model.isAdminMode {
                        Button(action: {
                            model.isAdminMode = false
                        }) {
                            Text("(管理者モード)")
                                .font(.caption)
                                .foregroundColor(.red)
                        }
                    }
                }
                ToolbarItemGroup(placement: .navigationBarTrailing) {
                    if model.isAdminMode { EditButton() }
                    Button(action: {
                        if secretTapCount >= 7, let start = trashButtonTimeWindowStart, Date().timeIntervalSince(start) <= 10 {
                            model.isAdminMode = true
                            secretTapCount = 0
                            trashButtonTimeWindowStart = nil
                        } else {
                            showTrash = true
                        }
                    }) { Image(systemName: "trash") }
                }
            }
            .sheet(isPresented: $showTrash) {
                TrashView(model: model)
            }
            .onAppear {
                if selectedYear == nil, let firstYear = model.availableFiscalYears.first {
                    selectedYear = firstYear
                    selectedMonth = model.availableMonths(inFiscalYear: firstYear).first
                }
            }
        }
    }
    
    @ViewBuilder
    private var mainContent: some View {
        VStack(spacing: 0) {
            if model.availableFiscalYears.isEmpty {
                VStack {
                    Spacer()
                    Text("記録がありません")
                        .foregroundColor(.gray)
                    Spacer()
                }
            } else {
                // 年度選択 (Picker)
                Picker("年度", selection: Binding(
                    get: { selectedYear ?? model.availableFiscalYears.first ?? 0 },
                    set: { newYear in
                        selectedYear = newYear
                        selectedMonth = model.availableMonths(inFiscalYear: newYear).first
                    }
                )) {
                    ForEach(model.availableFiscalYears, id: \.self) { year in
                        Text(String(format: "%d年度", year)).tag(year)
                    }
                }
                .pickerStyle(.menu)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(Color.blue.opacity(0.1))
                .cornerRadius(8)
                .padding(.top, 16)
                
                // 月選択タブ
                if let year = selectedYear ?? model.availableFiscalYears.first {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 12) {
                            ForEach(model.availableMonths(inFiscalYear: year), id: \.self) { month in
                                let isSelected = (selectedMonth ?? model.availableMonths(inFiscalYear: year).first) == month
                                Button(action: {
                                    if selectedMonth == month {
                                        secretTapCount += 1
                                        if secretTapCount == 7 {
                                            trashButtonTimeWindowStart = Date()
                                        }
                                    } else {
                                        selectedMonth = month
                                        secretTapCount = 0
                                        trashButtonTimeWindowStart = nil
                                    }
                                }) {
                                    Text("\(month)月")
                                        .fontWeight(isSelected ? .bold : .regular)
                                        .padding(.horizontal, 16)
                                        .padding(.vertical, 6)
                                        .background(isSelected ? Color.blue : Color(.systemGray5))
                                        .foregroundColor(isSelected ? .white : .primary)
                                        .cornerRadius(20)
                                }
                            }
                        }
                        .padding(.horizontal, 16)
                    }
                    .padding(.vertical, 16)
                    
                    Divider()
                    
                    // 記録リスト
                    if let month = selectedMonth ?? model.availableMonths(inFiscalYear: year).first {
                        List {
                            ForEach(model.sessions(fiscalYear: year, month: month)) { session in
                                sessionRow(session: session)
                            }
                            .onDelete { offsets in
                                let targets = model.sessions(fiscalYear: year, month: month)
                                offsets.forEach { i in
                                    if let sessionIndex = model.sessions.firstIndex(where: { $0.id == targets[i].id }) {
                                        model.deleteSession(session: model.sessions[sessionIndex])
                                    }
                                }
                            }
                        }
                        .listStyle(.plain)
                    }
                }
            }
        }
    }
    
    @ViewBuilder
    private func sessionRow(session: SessionRecord) -> some View {
        NavigationLink(destination: HistoryDetailView(model: model, sessionID: session.id)) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 6) {
                        Text(session.date.formatted(date: .numeric, time: .omitted))
                            .font(.headline)
                            .fontWeight(.bold)
                        // クラウド同期アイコン
                        syncIcon(status: session.syncStatus)
                    }
                    
                    HStack(spacing: 4) {
                        Text("矢数: \(session.shotCount)本")
                            .font(.caption)
                            .foregroundColor(.gray)
                        if !session.note.isEmpty {
                            Image(systemName: "note.text")
                                .font(.caption2)
                                .foregroundColor(.orange)
                            Text(session.note)
                                .font(.caption)
                                .foregroundColor(.secondary)
                                .lineLimit(1)
                                .truncationMode(.tail)
                        }
                    }
                }
                Spacer()
                
                // 参加人数バッジ
                VStack(alignment: .trailing, spacing: 4) {
                    let archerCount = session.archers.filter { !$0.isSeparator && !$0.isTotalCalculator }.count
                    Text("\(archerCount)人")
                        .font(.subheadline)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 4)
                        .background(Color.green.opacity(0.1))
                        .foregroundColor(.green)
                        .cornerRadius(8)
                    
                    if !session.includeInStats {
                        Text("統計除外")
                            .font(.system(size: 10))
                            .fontWeight(.bold)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Color.gray.opacity(0.1))
                            .foregroundColor(.gray)
                            .cornerRadius(4)
                    }
                }
            }
            .padding(.vertical, 4)
        }
    }
    
    @ViewBuilder
    private func syncIcon(status: String) -> some View {
        switch status {
        case "synced":
            // 同期済み
            Image(systemName: "checkmark.icloud")
                .font(.caption)
                .foregroundColor(.blue)
        case "syncing":
            // 同期中
            Image(systemName: "arrow.triangle.2.circlepath.icloud")
                .font(.caption)
                .foregroundColor(.orange)
        case "failed":
            // 同期失敗
            Image(systemName: "xmark.icloud")
                .font(.caption)
                .foregroundColor(.red)
        default:
            // 同期待ち（未同期）
            Image(systemName: "icloud.slash")
                .font(.caption)
                .foregroundColor(.gray)
        }
    }
}

struct AnalysisView: View {
    @ObservedObject var model: ScoreModel
    @State private var selectedPeriod = "すべて"
    @State private var selectedGender: Gender? = nil
    @State private var startDate = Date().addingTimeInterval(-30*24*60*60)
    @State private var endDate = Date()
    @State private var selectedGrade: Int = 0
    
    @State private var analysisDate = Date()
    
    var filteredSessions: [SessionRecord] {
        model.sessions.filter { session in
            switch selectedPeriod {
            case "月ごと":
                return Calendar.current.isDate(session.date, equalTo: analysisDate, toGranularity: .month)
            case "直近30日":
                return session.date >= Date().addingTimeInterval(-30*24*60*60)
            case "期間指定":
                let endOfEndDate = Calendar.current.date(byAdding: .day, value: 1, to: Calendar.current.startOfDay(for: endDate))!
                return session.date >= Calendar.current.startOfDay(for: startDate) && session.date < endOfEndDate
            default: // "すべて"
                return true
            }
        }
    }
    
    var stats: [ScoreModel.MemberStats] {
        model.calculateStats(sessions: filteredSessions, gender: selectedGender, grade: selectedGrade)
    }
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    VStack(spacing: 15) {
                        Picker("期間", selection: $selectedPeriod) {
                            Text("月ごと").tag("月ごと")
                            Text("直近30日").tag("直近30日")
                            Text("期間指定").tag("期間指定")
                            Text("すべて").tag("すべて")
                        }.pickerStyle(.segmented)
                        
                        if selectedPeriod == "月ごと" {
                            HStack {
                                Button(action: { changeMonth(by: -1) }) {
                                    Image(systemName: "chevron.left").font(.body).padding(8)
                                }
                                Spacer()
                                let yearMonthStr = "\(Calendar.current.component(.year, from: analysisDate))年 \(Calendar.current.component(.month, from: analysisDate))月"
                                Text(yearMonthStr)
                                    .font(.headline).fontWeight(.bold)
                                Spacer()
                                Button(action: { changeMonth(by: 1) }) {
                                    Image(systemName: "chevron.right").font(.body).padding(8)
                                }
                            }
                            .frame(maxWidth: 250)
                            .background(Color(.secondarySystemBackground))
                            .cornerRadius(8)
                        }
                        
                        if selectedPeriod == "期間指定" {
                            HStack {
                                DatePicker("", selection: $startDate, displayedComponents: .date).labelsHidden()
                                Image(systemName: "arrow.right").foregroundColor(.gray)
                                DatePicker("", selection: $endDate, displayedComponents: .date).labelsHidden()
                            }
                            .padding(8).background(Color(.secondarySystemBackground)).cornerRadius(10)
                        }
                        
                        VStack(spacing: 12) {
                            HStack {
                                Text("性別:").font(.caption).foregroundColor(.gray)
                                Picker("性別", selection: $selectedGender) {
                                    Text("全員").tag(nil as Gender?)
                                    Text("男子").tag(Gender.male as Gender?)
                                    Text("女子").tag(Gender.female as Gender?)
                                }.pickerStyle(.segmented)
                            }
                            
                            HStack {
                                Text("学年:").font(.caption).foregroundColor(.gray)
                                Picker("学年", selection: $selectedGrade) {
                                    Text("全学年").tag(0)
                                    ForEach(1...4, id: \.self) { g in
                                        Text("\(g)年").tag(g)
                                    }
                                }.pickerStyle(.segmented)
                            }
                        }
                    }
                    .padding().background(Color(.systemBackground)).cornerRadius(15).shadow(radius: 2)
                    
                    LazyVStack(spacing: 12) {
                        ForEach(Array(stats.enumerated()), id: \.element.id) { index, s in
                            AnalysisRowView(index: index, stats: s)
                        }
                    }
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("的中分析")
        }
    }
    
    private func changeMonth(by offset: Int) {
        if let newDate = Calendar.current.date(byAdding: .month, value: offset, to: analysisDate) {
            analysisDate = newDate
        }
    }
}


// MARK: - 6.1 Analysis Components

struct AnalysisRowView: View {
    let index: Int
    let stats: ScoreModel.MemberStats
    
    var body: some View {
        HStack(spacing: 10) {
            Text("\(index + 1)").font(.subheadline).foregroundColor(.gray).frame(width: 25)
            VStack(alignment: .leading, spacing: 2) {
                Text(stats.name).font(.system(size: 16, weight: .bold))
                Text("\(stats.grade)年 · \(stats.gender.rawValue)").font(.system(size: 11)).foregroundColor(.gray)
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 2) {
                Text(String(format: "%.1f%%", stats.rate * 100)).font(.system(size: 16, weight: .black)).foregroundColor(stats.rate >= 0.5 ? .red : .primary)
                Text("\(stats.totalHits)/\(stats.totalShots)").font(.system(size: 11)).foregroundColor(.gray)
            }
        }
        .padding(.vertical, 8).padding(.horizontal, 12).background(Color(.systemBackground)).cornerRadius(10).shadow(color: Color.black.opacity(0.05), radius: 2, x: 0, y: 1)
    }
}

struct MemberListView: View {
    @ObservedObject var model: ScoreModel
    @State private var showAdd = false
    @State private var name = ""; @State private var gender = Gender.male; @State private var grade = 1

    var body: some View {
        NavigationStack {
            List {
                Section {
                    ForEach(model.sortedMembers) { m in
                        NavigationLink {
                            MemberDetailView(model: model, memberID: m.id)
                        } label: {
                            HStack {
                                Text(m.name)
                                Spacer()
                                Text("\(m.grade)年").font(.caption).foregroundColor(.gray)
                            }
                        }
                    }.onDelete { idx in
                        let sorted = model.sortedMembers
                        for i in idx {
                            let memberToDelete = sorted[i]
                            if let realIndex = model.members.firstIndex(where: { $0.id == memberToDelete.id }) {
                                model.members.remove(at: realIndex)
                            }
                        }
                    }
                } header: { Text("部員一覧") }
                
                Section {
                    ForEach(model.alumni) { a in
                        HStack {
                            Text(a.name)
                            Spacer()
                            Text("\(a.graduationYear)卒").font(.caption).foregroundColor(.gray)
                        }
                    }
                } header: { Text("OB・OG") }
            }
            .navigationTitle("部員管理")
            .toolbar { ToolbarItem(placement: .navigationBarTrailing) { Button(action: { showAdd = true }) { Image(systemName: "person.badge.plus") } } }
            .sheet(isPresented: $showAdd) {
                NavigationStack {
                    Form {
                        TextField("名前 (フルネーム)", text: $name)
                        Picker("性別", selection: $gender) { ForEach(Gender.allCases, id: \.self) { Text($0.rawValue).tag($0) } }
                        Stepper("\(grade)年生", value: $grade, in: 1...4)
                    }
                    .navigationTitle("新しい部員")
                    .toolbar {
                        ToolbarItem(placement: .cancellationAction) { Button("キャンセル") { showAdd = false } }
                        ToolbarItem(placement: .confirmationAction) { Button("追加") { model.addMember(name: name, gender: gender, grade: grade); showAdd = false; name = "" } }
                    }
                }
            }
        }
    }
}

struct MemberDetailView: View {
    @ObservedObject var model: ScoreModel
    let memberID: UUID
    
    var body: some View {
        if let idx = model.members.firstIndex(where: { $0.id == memberID }) {
            Form {
                TextField("名前", text: $model.members[idx].name)
                Picker("性別", selection: $model.members[idx].gender) { ForEach(Gender.allCases, id: \.self) { Text($0.rawValue).tag($0) } }
                Stepper("\(model.members[idx].grade)年生", value: $model.members[idx].grade, in: 1...4)
            }
            .navigationTitle("部員編集")
        }
    }
}

struct SettingsView: View {
    @ObservedObject var model: ScoreModel
    @State private var showingExportSheet = false
    @State private var exportItems: [Any] = []
    @State private var isExportingIPA = false
    @State private var showRestoreStringAlert = false
    @State private var restoreString = ""
    @State private var showFileImporter = false
    @State private var showRestoreSuccess = false
    @State private var showRestoreError = false
    
    var body: some View {
        NavigationStack {
            List {
                DataManagementSection(model: model, exportItems: $exportItems, showingExportSheet: $showingExportSheet, showRestoreStringAlert: $showRestoreStringAlert, showFileImporter: $showFileImporter, showRestoreSuccess: $showRestoreSuccess, showRestoreError: $showRestoreError)
                if model.isAdminMode {
                    AppDistributionSection(isExportingIPA: isExportingIPA, exportIPA: exportIPA)
                }
            }
            .navigationTitle("設定")
            .settingsModifiers(showingExportSheet: $showingExportSheet, exportItems: $exportItems, showFileImporter: $showFileImporter, showRestoreStringAlert: $showRestoreStringAlert, restoreString: $restoreString, showRestoreSuccess: $showRestoreSuccess, showRestoreError: $showRestoreError, model: model)
        }
    }
    
    private func exportIPA() {
        isExportingIPA = true
        Task {
            do {
                let url = try await IPAExporter.export()
                DispatchQueue.main.async { exportItems = [url]; showingExportSheet = true; isExportingIPA = false }
            } catch {
                print("Export Error: \(error)"); isExportingIPA = false
            }
        }
    }
}

// MARK: - 6.1 Settings Components (Performance Optimization)

struct DataManagementSection: View {
    @ObservedObject var model: ScoreModel
    @Binding var exportItems: [Any]
    @Binding var showingExportSheet: Bool
    @Binding var showRestoreStringAlert: Bool
    @Binding var showFileImporter: Bool
    @Binding var showRestoreSuccess: Bool
    @Binding var showRestoreError: Bool
    
    var body: some View {
        Section {
            Button(action: {
                if let json = model.exportDataToString() {
                    let tempURL = FileManager.default.temporaryDirectory.appendingPathComponent("KyudoBackup_\(Date().formatted(.dateTime.year().month().day())).json")
                    try? json.write(to: tempURL, atomically: true, encoding: .utf8)
                    self.exportItems = [tempURL]
                    self.showingExportSheet = true
                }
            }) {
                Label("バックアップ (JSON)", systemImage: "square.and.arrow.up")
            }
            
            Button(action: {
                let csv = model.exportSessionsToCSV()
                let tempURL = FileManager.default.temporaryDirectory.appendingPathComponent("KyudoStats_\(Date().formatted(.dateTime.year().month().day())).csv")
                try? csv.write(to: tempURL, atomically: true, encoding: .utf8)
                self.exportItems = [tempURL]
                self.showingExportSheet = true
            }) {
                Label("CSV書き出し", systemImage: "tablecells")
            }
            
            Button(action: { showRestoreStringAlert = true }) {
                Label("JSONコードから復元", systemImage: "text.quote")
            }
            
            Button(action: { showFileImporter = true }) {
                Label("JSONファイルから復元", systemImage: "doc.text")
            }
            
            Button(action: {
                model.syncToCloud()
            }) {
                HStack {
                    if model.isSyncing {
                        ProgressView().padding(.trailing, 5)
                    }
                    Label(model.isSyncing ? "同期中..." : "手動クラウド同期", systemImage: "arrow.triangle.2.circlepath.cloud")
                }
            }
            .disabled(model.isSyncing)
            
            if model.isAdminMode {
                Button(role: .destructive, action: {
                    model.clearAllData()
                }) {
                    Label("全データを消去", systemImage: "trash")
                }
            }
        } header: {
            Text("データ管理")
        }
    }
}

struct AppDistributionSection: View {
    let isExportingIPA: Bool
    let exportIPA: () -> Void
    var body: some View {
        Section {
            Button {
                exportIPA()
            } label: {
                HStack {
                    if isExportingIPA { ProgressView().padding(.trailing, 5) }
                    Label("IPAファイルの作成", systemImage: "shippingbox")
                }
            }
            .disabled(isExportingIPA)
        } header: {
            Text("アプリ配布")
        }
    }
}

extension View {
    func settingsModifiers(showingExportSheet: Binding<Bool>, exportItems: Binding<[Any]>, showFileImporter: Binding<Bool>, showRestoreStringAlert: Binding<Bool>, restoreString: Binding<String>, showRestoreSuccess: Binding<Bool>, showRestoreError: Binding<Bool>, model: ScoreModel) -> some View {
        self
            .sheet(isPresented: showingExportSheet) { ShareSheet(items: exportItems.wrappedValue) }
            .fileImporter(isPresented: showFileImporter, allowedContentTypes: [.json]) { result in
                if case .success(let url) = result, model.restoreData(from: url) { showRestoreSuccess.wrappedValue = true } else { showRestoreError.wrappedValue = true }
            }
            .sheet(isPresented: showRestoreStringAlert) { JSONRestoreView(model: model, isPresented: showRestoreStringAlert, showSuccess: showRestoreSuccess, showError: showRestoreError) }
            .alert("復元完了", isPresented: showRestoreSuccess) { Button("OK") {} }
            .alert("復元失敗", isPresented: showRestoreError) {
                Button("閉じる") {}
            } message: { Text(model.lastRestoreError) }
    }
}

struct ContentView: View {
    @StateObject var model = ScoreModel()
    var body: some View {
        TabView {
            RecordView(model: model).tabItem { Label("記録", systemImage: "pencil.line") }
            HistoryListView(model: model).tabItem { Label("履歴", systemImage: "list.bullet.indent") }
            AnalysisView(model: model).tabItem { Label("分析", systemImage: "chart.bar.xaxis") }
            MemberListView(model: model).tabItem { Label("部員", systemImage: "person.2.fill") }
            SettingsView(model: model).tabItem { Label("設定", systemImage: "gearshape.fill") }
        }
        .environment(\.locale, Locale(identifier: "ja_JP"))
    }
}

struct JSONRestoreView: View {
    @ObservedObject var model: ScoreModel
    @Binding var isPresented: Bool
    @Binding var showSuccess: Bool
    @Binding var showError: Bool
    @State private var jsonText: String = ""
    
    var body: some View {
        NavigationView {
            VStack(alignment: .leading) {
                Text("バックアップJSONコードを以下に貼り付けてください。大量のデータでも貼り付け可能です。").font(.caption).padding()
                TextEditor(text: $jsonText)
                    .padding(4)
                    .overlay(RoundedRectangle(cornerRadius: 8).stroke(Color.gray.opacity(0.2)))
                    .padding()
                
                Button(action: {
                    if model.importDataFromString(jsonText) {
                        isPresented = false
                        showSuccess = true
                    } else {
                        showError = true
                    }
                }) {
                    Text("この内容で復元を実行").bold().frame(maxWidth: .infinity).padding().background(jsonText.isEmpty ? Color.gray : Color.blue).foregroundColor(.white).cornerRadius(10)
                }
                .disabled(jsonText.isEmpty)
                .padding()
            }
            .navigationTitle("JSONから復元")
            .navigationBarItems(trailing: Button("閉じる") { isPresented = false })
        }
    }
}
