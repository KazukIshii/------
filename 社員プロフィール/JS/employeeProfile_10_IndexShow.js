(() => {
    /** 機能概要 *********************
     *
     *  【一覧画面表示時】
     *  ・ログイン処理（ログインのモーダル部分要変更）
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

        //ログイン状態の確認
        let logInObj;
        if (!sessionStorage.getItem("logIn")) {
            //未ログイン時
            /*** ログイン処理 ***/
            const result = await Swal.fire({
                html: `
                <input type="text" id="logIn-Id" placeholder="社員番号" value="">
                <input type="password" id="logIn-pass" placeholder="パスワード" value="">
                `,
                allowOutsideClick: false,
                showConfirmButton: true,
                confirmButtonText: "ログイン",
                showCloseButton: true,
                //パスワード認証
                preConfirm: async () => {
                    //入力社員番号
                    const inputId = document.getElementById("logIn-Id").value;
                    //入力パスワード
                    const inputPass = document.getElementById("logIn-pass").value;

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

                    //{ 社員番号: パスワード } のオブジェクト作成
                    const authObj = {};
                    for (const record of records) {
                        authObj[record.社員番号.value] = record.パスワード.value;
                    }

                    //社員番号の存在チェック・パスワードチェック
                    if (!authObj[inputId] || authObj[inputId] !== inputPass) {
                        return Swal.showValidationMessage(`"社員番号"もしくは"パスワード"に誤りがあります`);
                    }

                    //認証成功時
                    sessionStorage.removeItem("auth");
                    const logInObj = {
                        id: inputId,
                        pass: inputPass,
                    };
                    return logInObj;
                },
            });

            //ログイン中断時・エラー発生時にポータルへ遷移させる
            if (result.dismiss === "close" || !result.value) {
                sessionStorage.removeItem("auth");
                location.href = config.url.portal;
                return;
            }

            //ログイン情報をsessionStorageに保存
            logInObj = result.value;
            sessionStorage.setItem("logIn", JSON.stringify(logInObj));
        } else {
            //ログイン時
            logInObj = JSON.parse(sessionStorage.getItem("logIn"));
        }

        /*** ログイン時の画面遷移分岐 ***/
        try {
            const plofileResp = await kintone.api(kintone.api.url("/k/v1/records", true), "GET", {
                app: kintone.app.getId(),
                query: `社員番号 = "${logInObj.id}"`,
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

        /*** 表示項目制御・ログイン情報表示（未作成） ***/

        /*** ログアウト処理 ***/
        //ボタン生成
        const logOutBtn = document.createElement("button");
        logOutBtn.innerText = "ログアウト";
        logOutBtn.id = "logOut-button";
        logOutBtn.onclick = async () => {
            await logOut();
        };
        kintone.app.getHeaderMenuSpaceElement().appendChild(logOutBtn);

        return event;
    });

    /**
     * ログアウト処理
     * @returns
     */
    async function logOut() {
        //画面の遷移
        const movePortal = await Swal.fire({
            title: "ポータルに移動しますか？",
            allowOutsideClick: false,
            showConfirmButton: true,
            confirmButtonText: "ポータルに移動",
            showCancelButton: true,
            cancelButtonText: "ログイン画面に移動",
            showCloseButton: true,
        });

        //ログイン情報の削除
        sessionStorage.removeItem("logIn");

        //遷移先を確認（閉じるボタンの場合は遷移しない）
        if (movePortal.isConfirmed) {
            //"ポータル"に遷移
            sessionStorage.removeItem("logIn"); //ログイン情報の削除
            location.href = config.url.portal;
            return;
        } else if (movePortal.dismiss === "cancel") {
            //"ログイン画面"に遷移（画面をリロード）
            sessionStorage.removeItem("logIn"); //ログイン情報の削除
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
            if (getRecords.length >= 500) {
                //500件以上の場合
                //取得したレコードの最後のレコードIDを取得
                const lastRecordId = getRecords[getRecords.length - 1].$id.value;
                //再帰処理（アプリID, 最後のレコードID, 現段階での取得レコード情報全量）
                await recursiveGetProcess(appId, lastRecordId, records.concat(getRecords));
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
