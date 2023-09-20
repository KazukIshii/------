(() => {
  /**
   * 追加・編集画面表示時
   */
  kintone.events.on(["app.record.create.show", "app.record.edit.show"], function (event) {
    const record = event.record;

    // 表示制御
    kintone.app.record.setFieldShown("システム利用", false); // システム利用

    // 入力制御
    record.社員番号.disabled = true; // 社員番号

    return event;
  });

  /**
   * 一覧画面レコード編集時
   */
  kintone.events.on(["app.record.index.edit.show"], function (event) {
    const record = event.record;

    // 入力制御
    record.社員番号.disabled = true; // 社員番号
    record.氏名.disabled = true; // 氏名
    record.パスワード.disabled = true; // パスワード
    record.発番番号.disabled = true; // 発番番号

    return event;
  });
})();
