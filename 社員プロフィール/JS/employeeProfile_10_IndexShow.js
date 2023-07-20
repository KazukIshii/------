(() => {
    /** 機能概要 *********************
     *
     *  【一覧画面表示時】
     *  ・人事部分岐
     *  ・ログイン処理
     *  ・ログイン時の画面遷移分岐
     *  ・ログアウト処理
     *  ・表示項目制御（未作成）
     *
     ********************************/

    /**@param {*} 共通config*/
    const config = window.employeeProfile.getEnvironment();

    //===== 画面表示時（一覧） =====
    kintone.events.on(["app.record.index.show"], async function (event) {
        debugger;

        let loginObj;
        //ログイン状態の確認
        if (!sessionStorage.getItem("login")) {
            //未ログイン時

            /*** 人事部分岐処理 ***/
            //ログインユーザーの所属組織取得
            const loginUser = kintone.getLoginUser();
            const orgResp = await kintone.api(kintone.api.url("/v1/user/organizations.json", true), "GET", { code: loginUser.code });
            //組織情報の配列生成
            const userOrgAry = [];
            for (const org of orgResp.organizationTitles) {
                userOrgAry.push(org.organization.code);
            }
            //人事部ユーザーの場合、認証処理,画面遷移分岐スキップ
            if (userOrgAry.includes(config.orgCode.HRManagement)) {
                loginObj = {
                    id: config.others.HRId,
                    name: "人事管理部",
                };
                sessionStorage.setItem("login", JSON.stringify(loginObj));
            } else {
                //人事部ユーザー以外の場合

                /*** ログイン処理 ***/
                const result = await Swal.fire({
                    title: `社員プロフィール`,
                    html: `
                <div class="input-login-info">
                    <input type="text" id="login-Id" class="input-box" placeholder="社員番号">
                    <input type="password" id="login-pass" class="input-box" placeholder="パスワード">
                </div>
                `,
                    allowOutsideClick: false,
                    showConfirmButton: true,
                    confirmButtonText: "ログイン",
                    showCloseButton: true,
                    didOpen: () => {
                        //確認ボタンの位置変更
                        document.getElementsByClassName("swal2-confirm swal2-styled")[0].classList.add("login-btn-right");
                        //背景画像の変更
                        const bkList = config.image.background;
                        //ランダムで一枚の画像を選ぶ
                        const bk = ((bkList) => {
                            const keyList = Object.keys(bkList); //設定されているキーの配列
                            const max = Object.keys(bkList).length; //キーの数
                            const randomNum = Math.floor(Math.random() * max); //キーの数を最大にしたランダムの1~X
                            const targetKey = keyList[randomNum]; //対象のキー取得
                            return bkList[targetKey]; //対象の背景画像のデータ
                        })(bkList);
                        const sweerAlertBk = document.getElementsByClassName("swal2-container swal2-center swal2-backdrop-show")[0];
                        sweerAlertBk.style.background = `url(${bk})`; //背景
                    },
                    //パスワード認証
                    preConfirm: async () => {
                        //入力社員番号
                        const inputId = document.getElementById("login-Id").value;
                        //入力パスワード
                        const inputPass = document.getElementById("login-pass").value;

                        //パスワード管理のレコード全量（社員情報）を取得
                        let records;
                        //リクエスト数抑制
                        if (sessionStorage.getItem("auth")) {
                            records = JSON.parse(sessionStorage.getItem("auth"));
                        } else {
                            records = await recursiveGetProcess(config.appId.passManager);
                            if (!records) return false;
                            sessionStorage.setItem("auth", JSON.stringify(records));
                        }

                        //{ 社員番号: {pass: パスワード, name: 氏名} } のオブジェクト作成
                        const authObj = {};
                        for (const record of records) {
                            authObj[record.社員番号.value] = { pass: record.パスワード.value, name: record.氏名.value };
                        }

                        //社員番号の存在チェック・パスワードチェック
                        if (!authObj[inputId] || authObj[inputId].pass !== inputPass) {
                            return Swal.showValidationMessage(`"社員番号"もしくは"パスワード"に誤りがあります`);
                        }

                        //認証成功時
                        sessionStorage.removeItem("auth");
                        const loginObj = {
                            id: inputId,
                            name: authObj[inputId].name,
                        };
                        return loginObj;
                    },
                });

                //ログイン中断時・エラー発生時にポータルへ遷移させる
                if (result.dismiss === "close" || !result.value) {
                    sessionStorage.removeItem("auth");
                    location.href = config.url.portal;
                    return;
                }

                //ログイン情報をsessionStorageに保存
                loginObj = result.value;
                sessionStorage.setItem("login", JSON.stringify(loginObj));
            }
        } else {
            //ログイン時
            loginObj = JSON.parse(sessionStorage.getItem("login"));
        }

        //人事部でのログイン時以外は画面遷移先分岐
        //トップ画面（プロフィール管理）の時のみ実行
        if (Number(event.viewId) === Number(config.viewId.top)) {
            if (!loginObj.id === config.others.HRId) {
                /*** ログイン時の画面遷移分岐 ***/
                try {
                    const plofileResp = await kintone.api(kintone.api.url("/k/v1/records", true), "GET", {
                        app: kintone.app.getId(),
                        query: `社員番号 = "${loginObj.id}"`,
                    });

                    if (!plofileResp.records.length) {
                        //プロフィール未作成時 → 新規作成画面に遷移
                        location.href = config.url.addPlofilePage;
                        return;
                    }
                } catch (e) {
                    window.alert("エラーが発生しました。開発者に問い合わせてください。");
                    console.log(e);
                    return;
                }
            }
            //それ以外 → プロフィール一覧に遷移
            location.href = `${config.url.base}/${kintone.app.getId()}/?view=${config.viewId.profileList}`;
            return;
        }

        const indexSpace = kintone.app.getHeaderMenuSpaceElement();

        /*** 表示項目制御・ログイン情報表示（作成中） ***/
        //ログイン者情報の表示（一覧）
        if (!document.getElementsByClassName("login-info").length) {
            const loginUserText = document.createElement("div");
            loginUserText.classList.add("login-info");
            loginUserText.innerHTML = `
                <image class="logging-in-image" src="${config.image.loggingInUser}"></image>
                <p class="login-user"><span class="font-bold">${loginObj.name}</span>でログイン中</p>
                <image class="logging-in-menu" src="${config.image.loggingInMenu}"></image>
            `;
            indexSpace.appendChild(loginUserText);

            //ログイン中メニューのクリック時動作
            const loggingInMenu = document.getElementsByClassName("logging-in-menu")[0];
            loggingInMenu.onclick = () => {
                //メニューリストの表示確認
                const loggingInMenuList = document.getElementsByClassName("logging-in-menu-list")[0];
                if (loggingInMenuList) {
                    //表示時
                    //リストを折りたたむ
                    loggingInMenuList.remove();
                } else {
                    //非表示時
                    //リストの展開
                    const addLoggingInMenuList = document.createElement("ul");
                    addLoggingInMenuList.classList.add("logging-in-menu-list", "fade-in");
                    addLoggingInMenuList.innerHTML = `
                        <li class="logging-in-menu-list-item" id="logout">ログアウト</li>
                    `;
                    document.getElementsByClassName("logging-in-menu")[0].after(addLoggingInMenuList);

                    //人事管理部かどうかでメニュー内項目を変更
                    if (loginObj.id === config.others.HRId) {
                        //人事部の場合
                        //承認待ち一覧へと遷移する項目を追加
                        const addItem = document.createElement("li");
                        addItem.classList.add("logging-in-menu-list-item");
                        addItem.id = "approval-pending";
                        addItem.innerText = "承認待ち一覧へ移動";
                        document.getElementsByClassName("logging-in-menu-list")[0].insertBefore(addItem, document.getElementById("logout"));
                        document.getElementById("approval-pending").onclick = () => {
                            //画面遷移
                            location.href = `${config.url.base}/${kintone.app.getId()}/?view=${config.viewId.approvalPending}`;
                            return;
                        };
                    } else {
                        //それ以外の場合
                        //自身のプロフィール（詳細画面）に遷移する項目を追加
                        const addItem = document.createElement("li");
                        addItem.classList.add("logging-in-menu-list-item");
                        addItem.id = "my-profile";
                        addItem.innerText = "マイプロフィールを確認";
                        document.getElementsByClassName("logging-in-menu-list")[0].insertBefore(addItem, document.getElementById("logout"));
                        document.getElementById("my-profile").onclick = async () => {
                            //自身の社員番号のレコードを取得
                            const resp = await kintone.api(kintone.api.url("/k/v1/records", true), "GET", {
                                app: kintone.app.getId(),
                                query: `社員番号 = "${loginObj.id}"`,
                            });
                            //画面遷移
                            location.href = `${config.url.base}/${kintone.app.getId()}/show#record=${resp.records[0].$id.value}`;
                            return;
                        };
                    }

                    /*** ログアウト処理 ***/
                    document.getElementById("logout").onclick = async () => {
                        await logout();
                    };
                }
            };
        }

        //一覧内自レコードの詳細アイコン変更
        if (event.viewId === config.viewId.profileList) {
            const employeeElm = kintone.app.getFieldElements("社員番号");
            //社員番号が一致する行（レコード）を取得
            let targetRow = null;
            for (const row of Array.from(employeeElm)) {
                if (row.children[0].children[0].innerText === loginObj.id) {
                    targetRow = row.parentElement;
                }
            }
            //一致行が存在するかの確認
            if (targetRow) {
                //存在する場合
                //詳細アイコンの変更
                targetRow.children[0].children[0].children[0].style.background = `url(${config.image.star})`; //アイコンの変更
                targetRow.children[0].children[0].children[0].style.backgroundRepeat = "no-repeat"; //アイコンの繰り返し設定
                targetRow.children[0].children[0].children[0].style.backgroundSize = "20px"; //アイコンのサイズ
                targetRow.children[0].children[0].children[0].classList.add("myself-index-icon"); //その他スタイルはCSSで当てる
                targetRow.children[0].children[0].style.padding = "9px 10px"; //aタグの余白変更
            }
        }

        return event;
    });

    /**
     * ログアウト処理
     * @returns
     */
    async function logout() {
        //画面の遷移
        const movePortal = await Swal.fire({
            title: "ログアウトします",
            allowOutsideClick: false,
            showConfirmButton: true,
            confirmButtonText: "ポータルに移動",
            showCancelButton: true,
            cancelButtonText: "ログイン画面に移動",
            showCloseButton: true,
        });

        //遷移先を確認（閉じるボタンの場合は遷移しない）
        if (movePortal.isConfirmed) {
            //"ポータル"に遷移
            sessionStorage.removeItem("login"); //ログイン情報の削除
            location.href = config.url.portal;
            return;
        } else if (movePortal.dismiss === "cancel") {
            //"ログイン画面"に遷移（画面をリロード）
            sessionStorage.removeItem("login"); //ログイン情報の削除
            location.reload();
            return;
        } else if (movePortal.dismiss === "close") {
            //ログアウト処理中止
            return;
        }
    }

    /**
     * レコードを再帰処理で全量取得する処理
     * @param {*} appId 対象のアプリID（必須）
     * @param {*} recordId  前回の最後の取得レコードのレコードID（指定不可）
     * @param {*} records  現段階の取得レコード全量（指定不可）
     * @returns 取得レコード全量
     */
    async function recursiveGetProcess(appId, recordId = 0, records = []) {
        try {
            //指定のレコードIDより大きいレコードIDのレコードを取得
            const resp = await kintone.api(kintone.api.url("/k/v1/records", true), "GET", {
                app: appId,
                query: `$id > ${recordId} order by $id asc limit 500`,
            });
            const getRecords = resp.records;

            //取得件数チェック
            if (getRecords.length === 500) {
                //500件の場合
                //取得したレコードの最後のレコードIDを取得
                const lastRecordId = getRecords[getRecords.length - 1].$id.value;
                //再帰処理（アプリID, 最後のレコードID, 現段階での取得レコード情報全量）
                return await recursiveGetProcess(appId, lastRecordId, records.concat(getRecords));
            } else {
                //レコード情報を返し処理終了
                return records.concat(getRecords);
            }
        } catch (e) {
            window.alert("エラーが発生しました。開発者に問い合わせてください。");
            console.log(e);
            return false;
        }
    }
})();
