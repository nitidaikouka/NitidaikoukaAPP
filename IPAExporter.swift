import Foundation
import UniformTypeIdentifiers
import UIKit

struct IPAExporter {
    /// 出力時のアプリ情報を設定します。
    /// 別のアプリとしてインストールしたい場合は、bundleIdentifier を変更してください。
    struct Config {
        static let bundleIdentifier = "com.nihondaigakukouka"
        static let displayName = "日本大学工科記録アプリ"
    }

    static func export() async throws -> URL {
        // iPadOS 26 / Swift 6 の制限を回避する書き方
        let bundleURL = Bundle.main.bundleURL
        let uuid = UUID().uuidString
        let tempDir = FileManager.default.temporaryDirectory.appendingPathComponent(uuid)
        let payloadDir = tempDir.appendingPathComponent("Payload")
        
        // 1. フォルダ作成
        try FileManager.default.createDirectory(at: payloadDir, withIntermediateDirectories: true)
        
        // 2. アプリ名の取得（安全な方法）
        let appName = (Bundle.main.object(forInfoDictionaryKey: "CFBundleName") as? String) ?? "App"
        let appDestination = payloadDir.appendingPathComponent("\(appName).app")
        let ipaURL = FileManager.default.temporaryDirectory.appendingPathComponent("\(appName).ipa")

        // 3. アプリ本体のコピー
        if FileManager.default.fileExists(atPath: ipaURL.path) {
            try? FileManager.default.removeItem(at: ipaURL)
        }
        try FileManager.default.copyItem(at: bundleURL, to: appDestination)
        
        // 4. Info.plist の書き換え（バンドルID・表示名を強制設定）
        let plistURL = appDestination.appendingPathComponent("Info.plist")
        if var plist = try? PropertyListSerialization.propertyList(from: Data(contentsOf: plistURL), options: [], format: nil) as? [String: Any] {
            plist["CFBundleIdentifier"] = Config.bundleIdentifier
            plist["CFBundleDisplayName"] = Config.displayName
            plist["CFBundleName"] = Config.displayName
            
            let updatedData = try PropertyListSerialization.data(fromPropertyList: plist, format: .xml, options: 0)
            try updatedData.write(to: plistURL)
        }

        // 4..ipa形式への圧縮（IPA化）を実行
        return try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<URL, Error>) in
            let intent = NSFileAccessIntent.readingIntent(with: payloadDir, options:.forUploading)
            NSFileCoordinator().coordinate(with: [intent], queue:.main) { error in
                if let error = error {
                    continuation.resume(throwing: error)
                    return
                }
                do {
                    try FileManager.default.moveItem(at: intent.url, to: ipaURL)
                    continuation.resume(returning: ipaURL)
                } catch {
                    continuation.resume(throwing: error)
                }
            }
        }
    }
}
