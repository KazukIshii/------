(() => {
  /**@param {*} 共通config*/
  const config = window.employeeProfile.getEnvironment();
  //設定が取得できなかった場合は以降の処理中断
  if (!config) return;

  /** 機能概要 *********************
   *
   *  【詳細画面表示時】
   *  ・ページ移動ボタンの非表示
   *  ・レコード追加ボタンの非表示
   *
   ********************************/
  kintone.events.on(["app.record.detail.show"], (event) => {
    /*~~~ ボタンの非表示 ~~~*/
    //ページ移動ボタンの非表示
    document.getElementsByClassName(config.kintoneDOM.movePage)[0].remove();
    //レコード追加ボタンの非表示
    document.getElementsByClassName(config.kintoneDOM.addRecord)[0].remove();

    return event;
  });
})();
