# Firebase Database Structure (Archery Record App)

このアプリは Firebase Realtime Database を使用して、Web版とNative版（Expo）の間でデータを共有します。

## データの保存場所
すべてのデータは、ルートの `appData` キーの下に保存されます。

```json
{
  "appData": {
    "archers": [...],        // 現在の記録表に表示されている人
    "members": [...],        // 登録されている部員リスト
    "alumni": [...],         // 卒業生リスト
    "sessions": [...],       // 保存された過去の記録
    "trash": [...],          // ゴミ箱に入っている記録
    "shotCount": 20          // 現在の矢数設定
  }
}
```

## 各データの詳細な形式

### 1. セッション (Session)
記録表 1 枚分に相当します。

```json
{
  "id": "string",            // ユニークID
  "date": "ISO8601 string",  // 記録日時
  "shotCount": number,       // 矢数 (4, 8, 12, 16, 20)
  "note": "string",          // メモ
  "archers": [Archer]        // その記録会に参加した全員のデータ
}
```

### 2. アーチャー記録 (Archer Record)
各人の的中結果（〇✕）を保持します。

```json
{
  "id": "string",
  "name": "string",
  "gender": "男子" | "女子",
  "grade": number,           // 1〜4
  "marks": ["〇", "✕", "", ...], // 的中記録 (shotCount 分の長さ)
  "isSeparator": boolean,    // 区切り線（計算用）
  "isTotalCalculator": boolean, // 合計計算用
  "isGuest": boolean         // ゲスト参加
}
```

### 3. 部員情報 (Member)
設定画面で管理される名簿です。

```json
{
  "id": "string",
  "name": "string",
  "gender": "男子" | "女子",
  "grade": number
}
```

## 他のアプリから参照する方法
別のアプリ（表示専用アプリや分析ツールなど）から、同じ Firebase プロジェクトの `appData/sessions` を読み取ることで、すべての的中履歴を一覧表示できます。

> [!NOTE]
> 現在の仕様では `appData` 直下に全員のデータがまとめられています。将来的にユーザーごとにデータを分けたい場合は、`appData/${userId}/...` という階層構造に変更することをお勧めします。
