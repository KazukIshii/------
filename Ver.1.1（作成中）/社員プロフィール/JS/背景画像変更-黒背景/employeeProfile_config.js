(() => {
  "use strct";

  window.training_No9 = window.training_No9 || {};

  /**
   * 石井検証環境の情報
   */
  const devConfig = {
    /** アプリID */
    appId: {
      // パスワード管理
      passManager: 994,
      // 社員プロフィール
      profile: 995,
    },

    /** 一覧のID */
    viewId: {
      // プロフィール管理（ログイン時用の画面）
      top: 8324672,
      // プロフィール一覧（メインのプロフィール一覧画面）
      profileList: 8324577,
      // 承認待ち（人事管理部用）
      approvalPending: 8324675,
    },

    /** スぺースのID */
    spaceId: 65,

    /** スレッドのID */
    threadId: 70,

    /** 組織コード */
    orgCode: {
      // 人事管理部
      HRManagement: "人事管理部_YbYnD0",
    },
  };

  /**
   * SR環境の情報
   */
  const srConfig = {
    /** アプリID */
    appId: {
      // パスワード管理
      passManager: 1336,
      // 社員プロフィール
      profile: 1335,
    },

    /** 一覧のID */
    viewId: {
      // プロフィール管理（ログイン時用の画面）
      top: 8324672,
      // プロフィール一覧（メインのプロフィール一覧画面）
      profileList: 8324577,
      // 承認待ち（人事管理部用）
      approvalPending: 8324675,
    },

    /** 組織コード */
    orgCode: {
      // 人事管理部
      HRManagement: "人事管理部_YbYnD0",
    },
  };

  /**
   * 環境設定取得処理
   */
  window.training_No9.GetEnvironment = () => {
    const myselfId = kintone.app.getId();
    const configAry = [devConfig, srConfig];

    //環境に適した設定情報の取得
    let currentConfig = null;
    endLoop: for (const config of configAry) {
      const appIdKeys = Object.keys(config.appId);
      for (const key of appIdKeys) {
        //自アプリのIDが存在する設定情報を取得
        if (config.appId[key] === myselfId) {
          currentConfig = config;
          break endLoop;
        }
      }
    }

    //設定情報の取得確認
    if (currentConfig) {
      return currentConfig;
    } else {
      window.alert("設定の取得に失敗しました。configファイルもしくは環境の確認を行ってください。");
      return false;
    }
  };
})();
