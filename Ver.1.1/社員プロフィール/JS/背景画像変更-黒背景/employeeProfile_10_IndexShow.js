(() => {
  "use strict";

  /** 共通設定 */
  const COMMON = window.training_No9.Common;
  /** 環境設定 */
  const CONFIG = window.training_No9.GetEnvironment();
  /** 共通関数 */
  const COMMON_FUNCTION = window.training_No9.CommonFunction;
  /** 関数 */
  const FUNCTION = window.training_No9.Function;

  kintone.events.on(["app.record.index.show"], async function (event) {
    try {
      // ログイン処理（戻り値はログイン情報）
      const loginInfo = await FUNCTION.login();
      // 画面遷移処理
      FUNCTION.screenTransition(event, loginInfo);
      // ログイン後（中）の画面生成処理
      FUNCTION.createAfterLoginScreen(loginInfo);
      // 一覧表示項目制御処理
      FUNCTION.viewDisplayControl(event, loginInfo);
      // kintone標準ボタンの非表示（クラス）
      COMMON_FUNCTION.removeWindowElement(COMMON.removeElm_view);
    } catch (e) {
      // エラー時
      console.log(e);
      window.alert(`${COMMON.error.message.common}\n\n【エラー内容】\n${e.message}`);
      return event;
    }
    return event;
  });
})();
