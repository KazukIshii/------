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
                    //確認ボタンの位置変更
                    didOpen: () => {
                        document.getElementsByClassName("swal2-confirm swal2-styled")[0].classList.add("login-btn-right");
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

        const indexSpace = kintone.app.getHeaderMenuSpaceElement();

        /*** 表示項目制御・ログイン情報表示（未作成） ***/
        //ログイン者情報の表示（一覧）
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
                /*** ログアウト処理 ***/
                document.getElementById("logout").onclick = async () => {
                    await logout();
                };
            }
        };

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
     * @param {*} appId 対象のアプリID
     * @param {*} recordId  前回の最後の取得レコードのレコードID
     * @param {*} records  現段階の取得レコード全量
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
