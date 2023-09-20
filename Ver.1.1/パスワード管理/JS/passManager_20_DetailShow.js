(() => {
  /**
   * 詳細画面表示時
   */
  kintone.events.on(["app.record.detail.show"], function (event) {
    // 表示制御
    kintone.app.record.setFieldShown("システム利用", false); // システム利用

    return event;
  });
})();
