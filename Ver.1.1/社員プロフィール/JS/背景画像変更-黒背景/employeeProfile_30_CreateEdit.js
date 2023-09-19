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

  kintone.events.on(["app.record.create.show", "app.record.edit.show"], async (event) => {
    try {
      // 郵便番号検索ボタンの生成
      await FUNCTION.setting_PostcodeButton(COMMON.button.searchForPostcode);
    } catch (e) {
      // エラー時
      console.log(e);
      window.alert(`${COMMON.error.message.common}\n\n【エラー内容】\n${e.message}`);
      return event;
    }

    return event;
  });
})();
