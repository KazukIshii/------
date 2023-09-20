(() => {
  "use strict";

  /** 共通設定 */
  const COMMON = window.training_No9.Common;
  /** 環境設定 */
  const CONFIG = window.training_No9.GetEnvironment();

  window.training_No9 = window.training_No9 || {};

  window.training_No9.CommonFunction = {
    /**
     * レコードを再帰処理で全量取得する処理
     * @param {string | number} appId 対象のアプリID [必須]
     * @param {number} recordId  前回の最後の取得レコードのレコードID [指定不可]
     * @param {[*]} records  現段階の取得レコード全量 [指定不可]
     * @returns 取得レコード全量
     */
    recursiveGetProcess: async (appId, recordId = 0, records = []) => {
      // 指定のレコードIDより大きいレコードIDのレコードを取得
      const resp = await kintone.api(kintone.api.url("/k/v1/records", true), "GET", {
        app: appId,
        query: `$id > ${recordId} order by $id asc limit 500`,
      });
      const getRecords = resp.records;

      /*=== 取得件数チェック ===*/
      if (getRecords.length === 500) {
        /* 500件の場合 */
        // 取得したレコードの最後のレコードIDを取得
        const lastRecordId = getRecords[getRecords.length - 1].$id.value;
        // 再帰処理（アプリID, 最後のレコードID, 現段階での取得レコード情報全量）
        return await recursiveGetProcess(appId, lastRecordId, records.concat(getRecords));
      } else {
        /* 500件未満の場合 */
        // レコード情報を返し処理終了
        return records.concat(getRecords);
      }
    },

    /**
     * 画面内の要素を削除する処理
     * @param {{
     * id: {type: string, list: [string]},
     * class: {type: string, list: [string]},
     * name: {type: string, list: [string]},
     * }} removeElms 削除対象の要素情報 [必須]
     */
    removeWindowElement: (removeElms) => {
      // 各要素タイプ数分ループ処理
      for (const removeElm of Object.values(removeElms)) {
        // 要素名タイプ
        const type = removeElm.type;
        // 対象要素名群
        const elmNames = removeElm.list;

        // 要素数だけ処理実行
        for (const elmName of elmNames) {
          switch (type) {
            /** IDの場合 */
            case "ID":
              document.getElementById(elmName).remove();
              break;
            /** クラスの場合 */
            case "CLASS":
              const classElms = Array.from(document.getElementsByClassName(elmName));
              for (const elm of classElms) {
                elm.remove();
              }
              break;
            /** ネームの場合 */
            case "NAME":
              const nameElms = Array.from(document.getElementsByName(elmName));
              for (const elm of nameElms) {
                elm.remove();
              }
              break;
            /** いずれにも一致しなかった場合 */
            default:
              throw new Error(
                `要素名タイプの指定に誤りがあります。指定値の確認を行ってください。\n現在の指定値「${type}」`
              );
          }
        }
      }
    },

    /**
     * 遷移用のURLを作成する処理（kintone専用）
     * @param {string} type URLタイプ [必須]
     * [ポータル → PORTAL]
     * [スペースポータル → SPACE_PORTAL]
     * [レコード作成画面 → CREATE_RECORD]
     * [レコード詳細画面 → DETAIL_RECORD]
     * [ビュー画面 → VIEW]
     * @param {string | number} spaceId スぺースID
     * @param {boolean | undefined} multipleThread 複数スレッドの使用があるか
     * @param {string | number} threadId スレッドID
     * @param {string | number} appId アプリID
     * @param {string | number} recordId レコードID
     * @param {string | number} viewId ビューID
     * @returns {string} 生成されたURL
     */
    createURL: (type, spaceId, multipleThread, threadId, appId, recordId, viewId) => {
      let URL = null;
      const baseURL = `${location.origin}/k`;

      /*=== URLタイプによる分岐 ===*/
      switch (type) {
        /** ポータル */
        case "PORTAL":
          URL = `${baseURL}/#/portal`;
          break;
        /** スペースポータル */
        case "SPACE_PORTAL":
          // スペースIDの入力チェック
          if (!spaceId) throw new Error("スペースIDの指定がありません。");

          /*=== 複数スレッドの利用があるか ===*/
          if (multipleThread) {
            /* 利用あり */
            URL = `${baseURL}/#/space/${spaceId}`;
          } else {
            /* 利用なし */
            // スレッドIDの入力チェック
            if (!threadId) throw new Error("スレッドIDの指定がありません。");
            URL = `${baseURL}/#/space/${spaceId}/thread/${threadId}`;
          }
          break;
        /** レコード作成画面 */
        case "CREATE_RECORD":
          // アプリIDの入力チェック
          if (!appId) throw new Error("アプリIDの指定がありません。");
          URL = `${baseURL}/${appId}/edit`;
          break;
        /** レコード詳細画面 */
        case "DETAIL_RECORD":
          // アプリID・レコードIDの入力チェック
          if (!appId || !recordId)
            throw new Error("アプリID・レコードIDの一方もしくは両方の指定がありません。");
          URL = `${baseURL}/${appId}/show#record=${recordId}`;
          break;
        /** 一覧画面 */
        case "VIEW":
          // アプリIDの入力チェック
          if (!viewId) throw new Error("ビューIDの指定がありません。");
          URL = `${baseURL}/${appId}/?view=${viewId}`;
          break;
        /** いずれにも一致しなかった場合 */
        default:
          throw new Error(
            `URLタイプの指定に誤りがあります。指定値の確認を行ってください。\n現在の指定値「${type}」`
          );
      }

      return URL;
    },

    /**
     * 郵便番号検索機能
     * @param {string} postcode 郵便番号
     * @returns {string} 住所
     */
    searchPostcode: async (postcode) => {
      // ハイフンなしの正規表現
      const noHyphenReg = /^[0-9]{7}$/;
      // ハイフンありの正規表現
      const hyphenReg = /^[0-9]{3}-[0-9]{4}$/;

      /*=== 郵便番号の形式チェック ===*/
      if (noHyphenReg.test(postcode) || hyphenReg.test(postcode)) {
        /* 正常 */
        // 住所情報の取得
        const url = `${COMMON.externalAPI.searchForPostcode.baseURL}?${COMMON.externalAPI.searchForPostcode.param[0]}=${postcode}`;
        const resp = await kintone.proxy(url, "GET", {}, {});
        const respBody = JSON.parse(resp[0]);

        /*=== リクエスト結果確認 ===*/
        if (respBody.status === 200) {
          /* 成功 */
          const addressInfoAry = respBody.results;

          /*=== 入力された郵便番号に住所が存在するか確認 ===*/
          /* 住所が存在しない場合 */
          if (!addressInfoAry)
            throw new Error(
              `入力された郵便番号には住所が存在しません。\n郵便番号に誤りがないか確認をしてください。`
            );

          // モーダル用選択肢の作成
          let inputOptions = {};
          for (const addressInfo of addressInfoAry) {
            const address = `${addressInfo.address1} ${addressInfo.address2} ${addressInfo.address3} `;
            inputOptions[address] = address;
          }
          // 住所情報の選択モーダル表示
          const { value: address } = await Swal.fire({
            title: "以下から住所を選択して下さい。",
            input: "select",
            inputOptions: inputOptions,
            showCloseButton: true,
            allowOutsideClick: false,
          });

          return address;
        } else {
          /* 失敗 */
          throw new Error(`リクエスト時にエラーが発生しました。\n${respBody.message}`);
        }
      } else {
        /* 異常 */
        throw new Error(
          "郵便番号の形式に誤りがあります。\n7桁の数字（ハイフンの有無は問いません）で入力してください。"
        );
      }
    },

    /**
     * ボタンの生成処理
     * @param {Object.<string, string>} buttonInfo ボタン情報オブジェクト
     */
    createButton: (buttonInfo) => {
      // ボタンの生成
      const button = new Kuc.Button({
        text: buttonInfo.text,
        id: buttonInfo.id,
        className: buttonInfo.class,
        type: buttonInfo.type,
        visible: true,
        disabled: false,
      });

      /*=== 追加先がIDかエレメントかを判断 ===*/
      if (typeof buttonInfo.space === "string") {
        /* IDの場合 */
        kintone.app.record.getSpaceElement(buttonInfo.space).appendChild(button);
      } else {
        /* エレメントの場合 */
        type.space.appendChild(button);
      }
    },
  };
})();
