/**
 * 最初の管理者アカウントを作成するためのNode.js用スクリプトです。
 * React Nativeのライブラリに依存せず、標準的なAPIのみを使用します。
 */

// -------------------------------------------------------------
// 設定（必要に応じて書き換えてください）
const ADMIN_ID = "5764";      // 管理者ID (4桁推奨)
const ADMIN_PASS = "0206";    // パスワード (4桁推奨)
// -------------------------------------------------------------

const apiKey = "AIzaSyB5Hv66bWUSqYidR5Dd7_ECMmQYklrT8x4";
const projectId = "nihondaigakukoukascore";
const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`;
const dbUrl = `https://${projectId}-default-rtdb.firebaseio.com/users`;

async function setupAdmin() {
    console.log(`管理者アカウントを作成中: ID ${ADMIN_ID}...`);

    const virtualEmail = `${ADMIN_ID}@nitidai.app`;
    // Firebase Authのパスワードは最低6文字必要なため、内部処理と同様に "00" を付加
    const securePassword = `${ADMIN_PASS}00`;

    try {
        // 1. Firebase Auth アカウント作成 (REST API)
        const authResponse = await fetch(authUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: virtualEmail,
                password: securePassword,
                returnSecureToken: true
            })
        });

        const authData = await authResponse.json();

        if (authData.error) {
            throw new Error(`Auth Error: ${authData.error.message}`);
        }

        const uid = authData.localId;
        console.log(`Authアカウント作成成功 (UID: ${uid})`);

        // 2. Realtime Database に管理者ロールを設定 (REST API)
        const dbResponse = await fetch(`${dbUrl}/${uid}.json?auth=${authData.idToken}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                memberId: ADMIN_ID,
                role: 'admin',
                createdAt: new Date().toISOString()
            })
        });

        if (!dbResponse.ok) {
            const dbError = await dbResponse.json();
            throw new Error(`DB Error: ${JSON.stringify(dbError)}`);
        }

        console.log("------------------------------------------");
        console.log("★ 成功しました！ ★");
        console.log(`部員ID  : ${ADMIN_ID}`);
        console.log(`パスワード: ${ADMIN_PASS}`);
        console.log("\nこの情報でアプリにログインし、画面下の「設定」＞「ユーザー管理」から");
        console.log("他の部員を登録できるようになります。");
        console.log("------------------------------------------");

    } catch (error) {
        console.error("\n❌ エラーが発生しました:");
        console.error(error.message);
        if (error.message.includes("EMAIL_EXISTS")) {
            console.log("\nヒント: このIDは既に登録されています。アプリでログインを試してください。");
        }
    }
}

setupAdmin();
