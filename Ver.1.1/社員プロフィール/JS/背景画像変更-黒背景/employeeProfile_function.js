(() => {
  "use strict";

  /** 共通設定 */
  const COMMON = window.training_No9.Common;
  /** 環境設定 */
  const CONFIG = window.training_No9.GetEnvironment();
  /** 共通関数 */
  const COMMON_FUNCTION = window.training_No9.CommonFunction;

  window.training_No9 = window.training_No9 || {};

  window.training_No9.Function = {
    /**
     * ログイン処理
     * @returns ログイン情報
     */
    login: async () => {
      /**
       * ログイン情報
       * @type {{id: string, name: string}}
       */
      let loginInfo = null;

      /*=== ログイン状態の確認 ===*/
      if (!sessionStorage.getItem(COMMON.sessionKey.login)) {
        /* 未ログイン時 */
        // ログインユーザーの所属組織取得
        const loginUser = kintone.getLoginUser();
        const orgResp = await kintone.api(
          kintone.api.url("/v1/user/organizations.json", true),
          "GET",
          { code: loginUser.code }
        );
        // 組織情報の配列生成
        const userOrgAry = [];
        for (const org of orgResp.organizationTitles) {
          userOrgAry.push(org.organization.code);
        }

        /*=== 人事部確認 ===*/
        if (userOrgAry.includes(CONFIG.orgCode.HRManagement)) {
          /* 人事部の場合 */
          // ログイン認証スキップ
          loginInfo = {
            id: COMMON.others.HRId,
            name: COMMON.others.name,
          };
          sessionStorage.setItem(COMMON.sessionKey.login, JSON.stringify(loginInfo));
        } else {
          /* 人事部ユーザー以外の場合 */
          /*=== ログイン処理 ===*/
          const result = await Swal.fire({
            // ログイン認証モーダルの生成
            title: COMMON.loginModal.title,
            html: `
                <div class="${COMMON.loginModal.class.modal}">
                    <input type="text" id="${COMMON.loginModal.id.employeeNum}" class="${COMMON.loginModal.class.input}" placeholder="${COMMON.loginModal.placeholder.employeeNum}">
                    <input type="password" id="${COMMON.loginModal.id.password}" class="${COMMON.loginModal.class.input}" placeholder="${COMMON.loginModal.placeholder.password}">
                </div>
                `,
            allowOutsideClick: false,
            showConfirmButton: true,
            confirmButtonText: COMMON.loginModal.loginButton,
            showCloseButton: true,
            didOpen: () => {
              // モーダル枠外の背景色の設定
              const sweerAlertBk = document.getElementsByClassName(
                COMMON.sweetAlert2.outsideFrame
              )[0];
              sweerAlertBk.style.background = COMMON.loginModal.backgroundColor;
              // ログインボタンの位置調整
              document
                .getElementsByClassName(COMMON.sweetAlert2.confirmButton)[0]
                .classList.add(COMMON.loginModal.class.loginButtonPositon);
            },

            /*=== パスワード認証 ===*/
            preConfirm: async () => {
              // 入力社員番号
              const inputId = document.getElementById(COMMON.loginModal.id.employeeNum).value;
              // 入力パスワード
              const inputPass = document.getElementById(COMMON.loginModal.id.password).value;

              // パスワード管理のレコード全量（社員情報）を取得
              let records = null;
              /*=== ログイン認証失敗時はsesssionから社員情報を取得（リクエスト数の抑制） ===*/
              if (sessionStorage.getItem(COMMON.sessionKey.employeeInfo)) {
                /* ログイン認証失敗時 */
                records = JSON.parse(sessionStorage.getItem(COMMON.sessionKey.employeeInfo));
              } else {
                /* 初回ログイン認証時 */
                records = await COMMON_FUNCTION.recursiveGetProcess(CONFIG.appId.passManager);

                // パスワード管理にレコードが存在しない場合、処理終了
                if (!records)
                  throw new Error(
                    "パスワード管理アプリに社員情報が存在しません。\nパスワード管理アプリに社員情報を追加して下さい。"
                  );

                // 社員情報をセッションに保存
                sessionStorage.setItem(COMMON.sessionKey.employeeInfo, JSON.stringify(records));
              }

              // 取得した社員情報を扱いやすい形式に変換 {社員番号: {pass: パスワード, name: 氏名}}
              /**
               * 認証情報
               * @type {{
               * pass: string,
               * name: string
               * }}
               */
              const employeeInfo = {};
              for (const record of records) {
                employeeInfo[record[COMMON.appField.passwordManagement.employeeNum.code].value] = {
                  pass: record[COMMON.appField.passwordManagement.password.code].value,
                  name: record[COMMON.appField.passwordManagement.name.code].value,
                };
              }

              // 社員番号の存在チェック・パスワードチェック
              if (!employeeInfo[inputId] || employeeInfo[inputId].pass !== inputPass) {
                return Swal.showValidationMessage(
                  "「社員番号」もしくは「パスワード」に誤りがあります。"
                );
              }

              // 認証成功時
              sessionStorage.removeItem(COMMON.sessionKey.employeeInfo);
              // ログイン情報の生成
              const loginInfo = {
                id: inputId,
                name: employeeInfo[inputId].name,
              };
              return loginInfo;
            },
          });

          // ログイン中断時・エラー発生時にポータル（スペース）へ遷移させる
          if (result.dismiss === "close" || !result.value) {
            sessionStorage.removeItem(COMMON.sessionKey.employeeInfo);

            // 遷移先URLの生成
            location.href = COMMON_FUNCTION.createURL(
              "SPACE_PORTAL",
              CONFIG.spaceId,
              false,
              CONFIG.threadId,
              undefined,
              undefined,
              undefined
            );
            return;
          }

          loginInfo = result.value;
          // ログイン情報をsessionに保存
          sessionStorage.setItem(COMMON.sessionKey.login, JSON.stringify(loginInfo));
        }
      } else {
        /* ログイン時 */
        // sessionからログイン情報を取得
        loginInfo = JSON.parse(sessionStorage.getItem(COMMON.sessionKey.login));
      }

      return loginInfo;
    },

    /**
     * ログイン後画面遷移処理
     * @param {*} event kintoneイベントオブジェクト
     * @param {{id: string, name: string}} loginInfo ログイン情報
     */
    screenTransition: async (event, loginInfo) => {
      /*=== トップ画面（プロフィール管理）の時のみ実行 ===*/
      if (Number(event.viewId) === Number(CONFIG.viewId.top)) {
        /* トップ画面（プロフィール管理）時 */
        /*=== 人事部以外の場合に画面遷移分岐処理実行（人事部はプロフィール作成がないため） ===*/
        if (loginInfo.id !== COMMON.others.HRId) {
          /* 人事部以外の時 */
          /*=== ログイン時の画面遷移分岐 ===*/
          const plofileResp = await kintone.api(kintone.api.url("/k/v1/records", true), "GET", {
            app: kintone.app.getId(),
            query: `${COMMON.appField.employeePlofile.employeeNum.code} = "${loginInfo.id}"`,
          });

          /*=== プロフィール作成チェック ===*/
          if (!plofileResp.records.length) {
            /* プロフィール未作成時 */
            // 新規作成画面に遷移
            location.href = COMMON_FUNCTION.createURL(
              "CREATE_RECORD",
              undefined,
              undefined,
              undefined,
              CONFIG.appId.profile,
              undefined,
              undefined
            );
            return;
          }
        }
        /* 人事部もしくはプロフィール作成済の時 */
        // プロフィール一覧に遷移
        location.href = COMMON_FUNCTION.createURL(
          "VIEW",
          undefined,
          undefined,
          undefined,
          CONFIG.appId.profile,
          undefined,
          CONFIG.viewId.profileList
        );
      }
      return;
    },

    /**
     * ログイン後（中）の画面生成処理
     * @param {{id: string, name: string}} loginInfo ログイン情報
     */
    createAfterLoginScreen: async (loginInfo) => {
      // 生成要素表示領域
      const indexSpace = kintone.app.getHeaderMenuSpaceElement();

      // 既に要素が生成されている場合、処理終了
      if (document.getElementsByClassName(COMMON.afterLoginScreen.class.indexSpace).length) return;

      // ログインユーザー情報表示・ログイン中メニューの生成
      const loggingInElm = document.createElement("div");
      loggingInElm.classList.add(COMMON.afterLoginScreen.class.indexSpace);
      loggingInElm.innerHTML = `
                  <image class="${COMMON.afterLoginScreen.class.loggingInImage}" src="${COMMON.image.loggingInUser}"></image>
                  <p class="${COMMON.afterLoginScreen.class.loginUserName}"><span class="${COMMON.generalClass.fontBold}">${loginInfo.name}</span>でログイン中</p>
                  <image class="${COMMON.afterLoginScreen.class.loggingInMenu}" src="${COMMON.image.loggingInMenu}"></image>
              `;
      indexSpace.appendChild(loggingInElm);

      // ログイン中メニューの要素取得
      const loggingInMenu = document.getElementsByClassName(
        COMMON.afterLoginScreen.class.loggingInMenu
      )[0];
      // ログイン中メニューのクリック時動作
      loggingInMenu.onclick = () => {
        /*=== メニューリストの表示確認 ===*/
        const loggingInMenuList = document.getElementsByClassName(
          COMMON.afterLoginScreen.class.loggingInMenuList
        )[0];
        if (loggingInMenuList) {
          /* 表示時 */
          // リストを折りたたむ
          loggingInMenuList.remove();
        } else {
          /* 非表示時 */
          // リストの展開
          const addLoggingInMenuList = document.createElement("ul");
          addLoggingInMenuList.classList.add(
            COMMON.afterLoginScreen.class.loggingInMenuList,
            COMMON.generalClass.fadeIn
          );
          // ログアウト項目の追加
          addLoggingInMenuList.innerHTML = `
                          <li class="${COMMON.afterLoginScreen.class.loggingInMenuListItem}" id="${COMMON.afterLoginScreen.id.logout}">
                            ${COMMON.afterLoginScreen.text.logout}
                          </li>
                      `;
          // ログイン中メニューの右側に表示
          document
            .getElementsByClassName(COMMON.afterLoginScreen.class.loggingInMenu)[0]
            .after(addLoggingInMenuList);

          // ログアウト処理
          document.getElementById(COMMON.afterLoginScreen.id.logout).onclick = async () => {
            //画面の遷移
            const movePortal = await Swal.fire({
              title: COMMON.logoutModal.title,
              allowOutsideClick: false,
              showConfirmButton: true,
              confirmButtonText: COMMON.logoutModal.confirmButton,
              showCancelButton: true,
              cancelButtonText: COMMON.logoutModal.cancelButton,
              showCloseButton: true,
            });

            /*=== 遷移先を確認（閉じるボタンの場合は遷移しない） ===*/
            if (movePortal.isConfirmed) {
              // ポータルに遷移
              sessionStorage.removeItem(COMMON.sessionKey.login);
              location.href = COMMON_FUNCTION.createURL(
                "SPACE_PORTAL",
                CONFIG.spaceId,
                false,
                CONFIG.threadId,
                undefined,
                undefined,
                undefined
              );
              return;
            } else if (movePortal.dismiss === "cancel") {
              // ログイン画面に遷移（初期表示一覧に移動）
              sessionStorage.removeItem(COMMON.sessionKey.login);
              location.href = COMMON_FUNCTION.createURL(
                "VIEW",
                undefined,
                undefined,
                undefined,
                CONFIG.appId.profile,
                undefined,
                CONFIG.viewId.top
              );
              return;
            } else if (movePortal.dismiss === "close") {
              // ログアウト処理中止
              return;
            }
          };

          /*=== 人事管理部かどうかでメニュー内項目を変更 ===*/
          if (loginInfo.id === COMMON.others.HRId) {
            /* 人事部の場合 */
            // 承認待ち一覧へと遷移する項目の追加
            const addItem = document.createElement("li");
            addItem.classList.add(COMMON.afterLoginScreen.class.loggingInMenuListItem);
            addItem.id = COMMON.afterLoginScreen.id.approvalPending;
            addItem.innerText = COMMON.afterLoginScreen.text.approvalPending;
            // ログアウトの上に追加
            document
              .getElementsByClassName(COMMON.afterLoginScreen.class.loggingInMenuList)[0]
              .insertBefore(addItem, document.getElementById(COMMON.afterLoginScreen.id.logout));

            // 承認待ち一覧への遷移処理
            document.getElementById(COMMON.afterLoginScreen.id.approvalPending).onclick = () => {
              // 承認待ち一覧への画面遷移
              location.href = COMMON_FUNCTION.createURL(
                "VIEW",
                undefined,
                undefined,
                undefined,
                CONFIG.appId.profile,
                undefined,
                CONFIG.viewId.approvalPending
              );
              return;
            };
          } else {
            /* 人事部以外の場合 */
            // 自身のプロフィール（詳細画面）に遷移する項目の追加
            const addItem = document.createElement("li");
            addItem.classList.add(COMMON.afterLoginScreen.class.loggingInMenuListItem);
            addItem.id = COMMON.afterLoginScreen.id.myProfile;
            addItem.innerText = COMMON.afterLoginScreen.text.myProfile;
            // ログアウトの上に追加
            document
              .getElementsByClassName(COMMON.afterLoginScreen.class.loggingInMenuList)[0]
              .insertBefore(addItem, document.getElementById(COMMON.afterLoginScreen.id.logout));

            // マイプロフィールへの遷移処理
            document.getElementById(COMMON.afterLoginScreen.id.myProfile).onclick = async () => {
              // 自身の社員番号のレコードを取得
              const resp = await kintone.api(kintone.api.url("/k/v1/records", true), "GET", {
                app: kintone.app.getId(),
                query: `${COMMON.appField.employeePlofile.employeeNum.code} = "${loginInfo.id}"`,
              });
              // 自身の社員番号レコードへの画面遷移
              location.href = COMMON_FUNCTION.createURL(
                "DETAIL_RECORD",
                undefined,
                undefined,
                undefined,
                CONFIG.appId.profile,
                resp.records[0].$id.value,
                undefined
              );
              return;
            };
          }
        }
      };

      // ログイン中メニューリスト外をクリックした時の処理
      document.onclick = (e) => {
        // クリックした要素がログイン中メニューだった場合は処理終了
        if (e.target.className === COMMON.afterLoginScreen.class.loggingInMenu) return;

        /*=== クリックした要素の祖先要素内にログイン中メニューリストもしくはsweetAlert2の要素があるかを確認 ===*/
        if (
          !e.target.closest(`.${COMMON.afterLoginScreen.class.loggingInMenuList}`) &&
          !e.target.closest(`.${COMMON.sweetAlert2.swal2Container}`)
        ) {
          /* ない場合 */
          /*=== ログイン中メニューリストが存在するか確認 ===*/
          const loggingInMenuList = document.getElementsByClassName(
            COMMON.afterLoginScreen.class.loggingInMenuList
          )[0];
          if (loggingInMenuList) {
            /* 存在する場合 */
            // ログイン中メニューを非表示
            loggingInMenuList.remove();
          }
        }
        return;
      };
    },

    /**
     * 一覧画面表示項目制御処理
     * @param {*} event kintoneイベントオブジェクト
     * @param {{id: string, name: string}} loginInfo ログイン情報
     */
    viewDisplayControl(event, loginInfo) {
      /*=== プロフィール一覧画面かつ人事部以外か確認 ===*/
      if (event.viewId === CONFIG.viewId.profileList && loginInfo.id !== COMMON.others.HRId) {
        /* 条件に一致する時 */
        // 社員番号の情報を取得
        const employeeElm = kintone.app.getFieldElements(
          COMMON.appField.employeePlofile.employeeNum.code
        );

        // 社員番号が一致する行（レコード）を取得
        let targetRow = null;
        for (const row of Array.from(employeeElm)) {
          if (row.children[0].children[0].innerText === loginInfo.id) {
            targetRow = row.parentElement;
            // 自レコードを表すクラス付与
            targetRow.classList.add(COMMON.generalClass.myself);
            break;
          }
        }

        /*=== 一致行の存在確認 ===*/
        if (targetRow) {
          /* 存在する場合 */
          const icon = targetRow.children[0].children[0].children[0];
          //詳細アイコンの変更
          icon.style.background = `url(${COMMON.image.star})`; // アイコンの変更
          icon.style.backgroundRepeat = "no-repeat"; // アイコンの繰り返し設定
          icon.style.backgroundSize = "20px"; // アイコンのサイズ
          icon.classList.add(COMMON.generalClass.myselfIcon); // その他スタイルはCSSで当てる
          targetRow.children[0].children[0].style.padding = "9px 10px"; // aタグの余白変更
        }

        const statusElm = kintone.app.getFieldElements(COMMON.appField.general.status.code);
        for (const row of Array.from(statusElm)) {
          /*=== ステータスが承認済か確認 ===*/
          if (row.children[0].children[0].innerText !== COMMON.appField.general.status.status[2]) {
            /* 承認以外の場合 */
            /*=== 自レコードか確認 ===*/
            if (!row.parentElement.classList.contains(COMMON.generalClass.myself)) {
              /* 自レコード以外の場合 */
              // レコードの非表示
              row.parentElement.remove();
            }
          }
        }
      }
    },

    /**
     * 郵便番号検索ボタンの生成処理
     * @param {Object.<string, string>} buttonInfo ボタン情報オブジェクト
     */
    setting_PostcodeButton: (buttonInfo) => {
      // ボタンの生成
      COMMON_FUNCTION.createButton(buttonInfo);

      // ボタンが生成されるまで待機
      const intervalId = setInterval(() => {
        /*=== ボタンの生成確認 ===*/
        if (document.getElementById(buttonInfo.id)) {
          // 郵便番号検索機能の付与
          document.getElementById(buttonInfo.id).addEventListener("click", async () => {
            try {
              const recordObj = kintone.app.record.get();
              // 郵便番号検索処理
              const address = await COMMON_FUNCTION.searchPostcode(
                recordObj.record[COMMON.appField.employeePlofile.postcode.code].value
              );
              /*=== 住所に値があるかを確認 ===*/
              if (address) {
                recordObj.record[COMMON.appField.employeePlofile.address.code].value = address;
              }
              // 値のセット
              kintone.app.record.set(recordObj);
            } catch (e) {
              console.log(e);
              window.alert(`${COMMON.error.message.common}\n\n【エラー内容】\n${e.message}`);
              return event;
            }
          });
          clearInterval(intervalId);
        }
      }, 100);
    },
  };
})();
