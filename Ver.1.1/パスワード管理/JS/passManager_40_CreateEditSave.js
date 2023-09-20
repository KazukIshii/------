(() => {
  /**
   * 追加・編集画面保存時
   */
  kintone.events.on(["app.record.create.submit", "app.record.edit.submit"], function (event) {
    const record = event.record;

    const pass = record.パスワード.value;

    // 必須チェック
    if (!pass) {
      event.error = "パスワードを入力してください";
      return event;
    }

    // 文字数チェック（4-16字）
    if (pass.length < 4 || pass.length > 16) {
      event.error = "パスワードは「4文字以上16字以内」で入力してください";
      return event;
    }

    // 文字タイプチェック（半角英数字）
    if (!pass.match(/^[0-9a-zA-Z]*$/)) {
      event.error = "パスワードは「半角英数字」で入力してください。";
      return event;
    }

    return event;
  });

  /**
   * 追加画面保存成功時
   */
  kintone.events.on(["app.record.create.submit.success"], async function (event) {
    // 既存最終発番レコードの取得
    const resp = await kintone.api(kintone.api.url("/k/v1/records", true), "GET", {
      app: kintone.app.getId(),
      query: `発番番号 != "" order by 発番番号 desc limit 1`,
    });
    const getRecord = resp.records.length ? resp.records[0] : null;

    let numberingNum = null;
    let employeeNum = null;
    /*=== レコードの存在チェック ===*/
    if (!getRecord) {
      /* レコードが存在しない場合 */
      numberingNum = 1;
      employeeNum = "0001";
    } else {
      /* レコードが存在する場合 */
      numberingNum = Number(getRecord.発番番号.value) + 1;

      /*=== 桁数が4桁以上かどうか ===*/
      if (getRecord.発番番号.value.length >= 4) {
        /* 4桁以上の場合 */
        employeeNum = numberingNum;
      } else {
        /* 4桁未満の場合 */
        // 0埋め処理込みで連番
        employeeNum = String(numberingNum).padStart(4, "0");
      }
    }

    // 値のセット
    await kintone.api(kintone.api.url("/k/v1/record", true), "PUT", {
      app: kintone.app.getId(),
      id: event.recordId,
      record: {
        発番番号: {
          value: numberingNum,
        },
        社員番号: {
          value: employeeNum,
        },
      },
    });

    return event;
  });
})();
