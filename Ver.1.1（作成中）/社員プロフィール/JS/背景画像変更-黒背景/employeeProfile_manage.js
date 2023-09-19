(() => {
  "use strict";

  window.training_No9 = window.training_No9 || {};

  /**
   * 汎用クラス
   */
  const generalClass = {
    // テキストの太字
    fontBold: "font-bold",
    // フェードインアニメーション
    fadeIn: "fade-in",
    // 自レコードを表すクラス
    myself: "myself-profile",
    // 自レコードの詳細アイコンを表すクラス
    myselfIcon: "myself-index-icon",
  };

  /**
   * kintoneDOM
   */
  const kintoneDOM = {
    // ページ移動ボタン（class）
    movePage: "gaia-argoui-app-pager",
    // レコード追加ボタン（class）
    addRecord: "gaia-argoui-app-menu-add",
  };

  window.training_No9.Common = {
    /**
     * アプリフィールド情報
     */
    appField: {
      /* 汎用 */
      general: {
        // レコード番号
        recordNum: {
          code: "レコード番号", // フィールドコード
          name: "レコード番号", //フィールド名
          type: "RECORD_NUMBER", // フィールドタイプ
        },
        // レコードID
        recordId: {
          code: "$id",
          name: "レコードID",
          type: "__ID__",
        },
        // リビジョン
        revision: {
          code: "$revision",
          name: "リビジョン",
          type: "__REVISION__",
        },
        // 作成者
        creator: {
          code: "作成者",
          name: "作成者",
          type: "CREATOR",
        },
        // 作成日時
        createdTime: {
          code: "作成日時",
          name: "作成日時",
          type: "CREATED_TIME",
        },
        // 更新者
        modifier: {
          code: "更新者",
          name: "更新者",
          type: "MODIFIER",
        },
        // 更新日時
        updatedTime: {
          code: "更新日時",
          name: "更新日時",
          type: "UPDATED_TIME",
        },
        // カテゴリー
        category: {
          code: "カテゴリー",
          name: "カテゴリー",
          type: "CATEGORY",
        },
        // ステータス
        status: {
          code: "ステータス",
          name: "ステータス",
          type: "STATUS",
          status: ["作成中", "承認待ち", "承認済"],
        },
        // 作業者
        statusAssignee: {
          code: "作業者",
          name: "作業者",
          type: "STATUS_ASSIGNEE",
        },
      },
      /* 社員プロフィール */
      employeePlofile: {
        // 社員番号
        employeeNum: {
          code: "社員番号",
          name: "社員番号",
          type: "LOOKUP-SINGLE_LINE_TEXT",
        },
        // 氏名
        name: {
          code: "氏名",
          name: "氏名",
          type: "SINGLE_LINE_TEXT",
        },
        // ヨミガナ
        kana: {
          code: "ヨミガナ",
          name: "ヨミガナ",
          type: "SINGLE_LINE_TEXT",
        },
        // 性別
        gender: {
          code: "性別",
          name: "性別",
          type: "RADIO_BUTTON",
          options: ["男性", "女性", "その他"], // 選択肢
        },
        // 生年月日
        birthdate: {
          code: "生年月日",
          name: "生年月日",
          type: "DATE",
        },
        // 年齢
        age: {
          code: "年齢",
          name: "年齢",
          type: "NUMBER",
        },
        // 郵便番号
        postcode: {
          code: "郵便番号",
          name: "郵便番号",
          type: "SINGLE_LINE_TEXT",
        },
        // 郵便番号検索ボタン（スぺース）
        postcodeSearchButton: {
          code: "post_code_search_button",
          type: "SPACER",
        },
        // 住所
        address: {
          code: "住所",
          name: "住所",
          type: "SINGLE_LINE_TEXT",
        },
        // 家族構成（テーブル）
        familyStructure: {
          // 続柄
          gender: {
            code: "続柄_家族",
            name: "続柄",
            type: "DROP_DOWN",
            options: [
              "配偶者",
              "父",
              "母",
              "兄",
              "姉",
              "弟",
              "妹",
              "祖父",
              "祖母",
              "ペット",
              "その他",
            ],
          },
          // 氏名
          name: {
            code: "氏名_家族",
            name: "氏名",
            type: "SINGLE_LINE_TEXT",
          },
          // ヨミガナ
          kana: {
            code: "ヨミガナ_家族",
            name: "ヨミガナ",
            type: "SINGLE_LINE_TEXT",
          },
          // 同居/別居
          livingDivision: {
            code: "同居_別居_家族",
            name: "同居/別居",
            type: "DROP_DOWN",
            options: ["同居", "別居"],
          },
          // 自分から見た印象
          impression: {
            code: "自分から見た印象_家族",
            name: "自分から見た印象",
            type: "RICH_TEXT",
          },
        },
        // 座右の銘
        motto: {
          code: "座右の銘",
          name: "座右の銘",
          type: "SINGLE_LINE_TEXT",
        },
        // 自由記入欄
        freeText: {
          code: "自由記入欄",
          name: "自由記入欄",
          type: "RICH_TEXT",
        },
        // 人事部コメント
        freeText: {
          code: "人事部コメント",
          name: "人事部コメント",
          type: "MULTI_LINE_TEXT",
        },
      },

      /* パスワード管理 */
      passwordManagement: {
        // 無効フラグ
        disabled: {
          code: "無効",
          name: "無効",
          type: "CHECK_BOX",
          options: ["無効"],
        },
        // 社員番号
        employeeNum: {
          code: "社員番号",
          name: "社員番号",
          type: "SINGLE_LINE_TEXT",
        },
        // 氏名
        name: {
          code: "氏名",
          name: "氏名",
          type: "SINGLE_LINE_TEXT",
        },
        // パスワード
        password: {
          code: "パスワード",
          name: "パスワード",
          type: "SINGLE_LINE_TEXT",
        },
        // システム利用（グループ）
        systemUse: {
          code: "システム利用",
          name: "システム利用",
          type: "GROUP",
        },
        // 発番番号
        numberingNum: {
          code: "発番番号",
          name: "発番番号",
          type: "NUMBER",
        },
      },
    },

    /** 汎用クラス */
    generalClass: generalClass,

    /** kintone DOM */
    kintoneDOM: kintoneDOM,

    /**
     * ログインモーダル情報
     */
    loginModal: {
      // タイトル
      title: "社員プロフィール",
      /** 要素クラス */
      class: {
        // モーダル
        modal: "input-login-info",
        // 入力項目
        input: "input-box",
        // ログインボタン位置変更
        loginButtonPositon: "login-btn-right",
      },
      /** 要素ID */
      id: {
        // 社員番号
        employeeNum: "login-Id",
        // パスワード
        password: "login-pass",
      },
      /** プレースホルダー */
      placeholder: {
        // 社員番号
        employeeNum: "社員番号",
        // パスワード:
        password: "パスワード",
      },
      // ログインボタンテキスト
      loginButton: "ログイン",
      //背景色
      backgroundColor: "#000000",
    },

    /**
     * ログイン後画面生成要素情報
     */
    afterLoginScreen: {
      /* 要素クラス */
      class: {
        // 生成要素表示領域
        indexSpace: "login-info",
        // ログインユーザーイメージ
        loggingInImage: "logging-in-image",
        // ログインユーザー名
        loginUserName: "login-user",
        // ログイン中メニュー
        loggingInMenu: "logging-in-menu",
        // ログイン中メニューリスト
        loggingInMenuList: "logging-in-menu-list",
        // ログイン中メニューリスト内項目
        loggingInMenuListItem: "logging-in-menu-list-item",
      },
      /* 要素ID */
      id: {
        // ログアウト
        logout: "logout",
        // 承認待ち一覧へ遷移
        approvalPending: "approval-pending",
        // マイプロフィール
        myProfile: "my-profile",
      },
      /* 要素テキスト */
      text: {
        // ログアウト
        logout: "ログアウト",
        // 承認待ち一覧へ遷移
        approvalPending: "承認待ち一覧へ移動",
        // マイプロフィール
        myProfile: "マイプロフィールを確認",
      },
    },

    /**
     * ログアウトモーダル情報
     */
    logoutModal: {
      // タイトル
      title: "ログアウトします",
      // 確認ボタンテキスト
      confirmButton: "ポータルに移動",
      // キャンセルボタンテキスト
      cancelButton: "ログイン画面に移動",
    },

    /**
     * ボタン情報
     */
    button: {
      // 郵便番号検索ボタン
      searchForPostcode: {
        text: "郵便番号検索", // ボタンに表示するテキスト
        id: "search-for-postcode", // ID
        class: "", // クラス
        type: "submit", // kintone UI Component のボタンのデザインタイプ
        space: "post_code_search_button", // 表示するスペースのIDもしくはスペース要素
      },
    },

    /**
     * 詳細画面内から削除する要素群
     */
    removeElm_detail: {
      id: {
        type: "ID",
        list: [],
      },
      class: {
        type: "CLASS",
        list: [kintoneDOM.movePage, kintoneDOM.addRecord],
      },
      name: {
        type: "NAME",
        list: [],
      },
    },

    /**
     * 一覧画面内から削除する要素群
     */
    removeElm_view: {
      id: {
        type: "ID",
        list: [],
      },
      class: {
        type: "CLASS",
        list: [kintoneDOM.addRecord],
      },
      name: {
        type: "NAME",
        list: [],
      },
    },

    /**
     * セッションストレージのキー
     */
    sessionKey: {
      // ログイン情報
      login: "login_trainingNo9",
      // 社員情報
      employeeInfo: "employeeInfo_trainingNo9",
    },

    /**
     * sweetAlert2 DOM
     */
    sweetAlert2: {
      // sweetAlert2全体
      swal2Container: "swal2-container",
      // 枠外
      outsideFrame: "swal2-container swal2-center swal2-backdrop-show",
      // 確認（OK）ボタン
      confirmButton: "swal2-confirm swal2-styled",
    },

    /**
     * 外部API情報
     */
    externalAPI: {
      /* 郵便番号検索 */
      searchForPostcode: {
        // ベースURL
        baseURL: "https://zipcloud.ibsnet.co.jp/api/search",
        // パラメータ
        param: ["zipcode"],
      },
    },

    /**
     * エンコード済画像データ
     */
    image: {
      // ログイン中のユーザーアイコン
      loggingInUser:
        "data:image/png;base64,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",
      // ログイン中メニューのアイコン
      loggingInMenu:
        "data:image/png;base64,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",
      // 星のアイコン
      star: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAt5JREFUWEe9ljtoFGEQx/+z7G4e952gKCIEtRLFwiJ4u0e0EEXxAYmoiQ8sFI1YpLAQ0UKTNqCdEbVQYkAloBBURNFGw92eEVRUsNBCbIQUifdd9G73diRHIpdzH/dIbsvdmfn/vpn5ZpZQw8NWdE3WUfKNbZNfqw1D1To6VnQvgx8U/Jm3a2bmeTWxagEYZPDRgj5wVzfk4boB8PvlEedP5juAJTOiaTmlrly8ZWKiUoiqMuBY0Q4GPywWI6JuNZa+WReAnCUGCDg9FwAjaky21wXAtkQegFIixpohS9+F8lRcAjsR2QaFPDueiI6psfTtUNUig4oBcpYYIuCIj8hLzZBbFxTAtgQHCWiGrOhQFRk71qLdDPdREAAp1K5uTI+UmwVyLHEA4H4GrS7XaZ7sPhHQR2EpnScx3zDTAGMAWhdayCf+cKEHbEu8A7ChnhAMfNENufZfE+atyBkXdKU+ENyvGZlz01pzbgG/FescB88AtCwQyDhc6tDi6dHZ+J7X0LYi/QCdnU8IZtzXTXmwNKbvHMgmxT6FcAdAU00ghCznqUePe2/KwEE0lWxq0Ui5BtCe6iDoST6n9DRunvzm5x86CWu8pknNkPHAyRl2sloHVdhuCMxALim6iXA9DDLou8s41GDKe1WVwE6KVyBsqgUAoKeakd5ZHUDI6i0XLKgMviXIJaInSeEbwQ1EgwDnGDgR0midqiGHvWx8AWwr+hjgXX6BmXFKN2UBMJsU+xWCp8CM/7BmyM4KAXz/fD6qjC4y5efigL9HG1epqjoEePeMXxk8M+CkRBcz/utcIr6lxjLHg9Jtp0QfGBc9Rq5nGTwBsgnRqyi4VLQwJl3GBd2UA+U0npMSncy4CmDprL3roq8hLnvL2gV2ItoGhV/PGL9gcs/rsak35YjP2mRTYr3CuAxgx/Q7dhVTj/+yygIoOIw1rwDRMmrNfKhEuNQ2l2xu1UA/yMz89IrzF4J59pC5HWytAAAAAElFTkSuQmCC",
    },

    /**
     * エラー
     */
    error: {
      /** メッセージ */
      message: {
        // 汎用
        common: "エラーが発生しました。\n内容を確認し、必要に応じて開発元に問い合わせてください。",
      },
    },

    /**
     * その他共通設定
     */
    others: {
      // 人事部用ログインID
      HRId: "HR",
      // 人事部用表示名
      name: "人事管理部",
    },
  };
})();
