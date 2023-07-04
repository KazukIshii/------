(() => {
    window.employeeProfile = window.employeeProfile || {};

    const config = {
        /*** アプリID ***/
        appId: {
            passManager: 994, //パスワード管理
        },

        /*** 遷移先URL ***/
        url: {
            portal: "https://kishii.cybozu.com/k/#/space/65/thread/70", //ポータル画面
            addPlofilePage: "https://kishii.cybozu.com/k/995/edit", //プロフィール新規作成画面
        },

        /*** 画像ファイル（エンコード） ***/
        image: {},
    };

    /**
     * 環境設定取得処理
     */
    window.employeeProfile.getEnvironment = () => {
        return config;
    };
})();
