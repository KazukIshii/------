(() => {
    /** 機能概要 *********************
     *
     *  【詳細画面表示時】
     *  ・表示制御処理
     *
     ********************************/

    //===== 画面表示時（詳細） =====
    kintone.events.on(["app.record.detail.show"], function (event) {
        const record = event.record;

        /*** 表示制御 ***/
        kintone.app.record.setFieldShown("システム利用", false); //システム利用

        return event;
    });
})();
