window.__ModuleLoader__.load({
  id: "@deepseek-ai/dsh-account",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    let react_jsx_runtime = require("react/jsx-runtime");
    let react = require("react");
    let _primitives = require("@deepseek-ai/dsh-client-ui-primitives");

    const NS = "dsh-account";
    // Distinct from the baked-in ui-settings-general "account" section: the slots
    // registry rejects a duplicate list-slot id, and this plugin must coexist
    // (or stand alone) without clashing.
    const SECTION_ID = "dsh-account";

    const zh = {
      "account.nav": "账户",
      "account.balanceTitle": "DeepSeek 账户余额",
      "account.balanceLoading": "加载中…",
      "account.balanceError": "余额查询失败",
      "account.notConfigured": "尚未配置 API Key，请先在模型设置中填写",
      "account.refresh": "刷新",
      "account.recharge": "充值 / 登录",
      "account.tokenTitle": "本机累计 Token 用量（全部会话）",
      "account.tokenInput": "输入",
      "account.tokenOutput": "输出",
      "account.tokenCacheRead": "缓存读取",
      "account.tokenCacheWrite": "缓存写入",
      "account.tokenTotal": "合计"
    };

    const en = {
      "account.nav": "Account",
      "account.balanceTitle": "DeepSeek Account Balance",
      "account.balanceLoading": "Loading…",
      "account.balanceError": "Failed to query balance",
      "account.notConfigured": "No API key configured; set it in Model settings first",
      "account.refresh": "Refresh",
      "account.recharge": "Top up / Sign in",
      "account.tokenTitle": "Local cumulative token usage (all sessions)",
      "account.tokenInput": "Input",
      "account.tokenOutput": "Output",
      "account.tokenCacheRead": "Cache read",
      "account.tokenCacheWrite": "Cache write",
      "account.tokenTotal": "Total"
    };

    const sectionStyle = { display: "flex", flexDirection: "column", gap: "20px" };
    const blockStyle = { display: "flex", flexDirection: "column", gap: "8px" };
    const titleStyle = { color: "var(--dsw-alias-label-primary)", fontSize: "15px", fontWeight: "500", lineHeight: "22px" };
    const valueStyle = { color: "var(--dsw-alias-label-primary)", fontSize: "20px", fontWeight: "600", lineHeight: "28px" };
    const rowStyle = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "10px 0", borderBottom: "1px solid var(--dsw-alias-divider-strong)", fontSize: "14px", lineHeight: "22px" };
    const mutedStyle = { color: "var(--dsw-alias-label-tertiary)", fontSize: "13px", lineHeight: "20px" };
    const errorStyle = { color: "var(--dsw-alias-state-error-primary)", fontSize: "13px", lineHeight: "20px" };
    const linkStyle = { color: "var(--dsw-alias-interactive-primary)", textDecoration: "none", fontSize: "14px", lineHeight: "22px" };
    const TOP_UP_URL = "https://platform.deepseek.com/top_up";

    function AccountSection({ connection, t }) {
      const [snapshot, setSnapshot] = react.useState({ status: "loading", error: null, errorCode: null, balance: null, tokens: null });
      const load = react.useCallback(async () => {
        setSnapshot({ status: "loading", error: null, errorCode: null, balance: null, tokens: null });
        try {
          const [balanceRes, sessionRes] = await Promise.all([
            connection.api.balance.get({}),
            connection.api.sessions.list({})
          ]);
          const tokens = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
          if (sessionRes.result.ok) {
            for (const item of sessionRes.result.value.items) {
              const usage = item.projections?.values?.tokenUsage;
              if (usage) {
                tokens.input += usage.uncachedInputTokens ?? 0;
                tokens.output += usage.outputTokens ?? 0;
                tokens.cacheRead += usage.cacheReadTokens ?? 0;
                tokens.cacheWrite += usage.cacheWriteTokens ?? 0;
              }
            }
          }
          if (!balanceRes.result.ok) {
            setSnapshot({ status: "error", error: balanceRes.result.error.message, errorCode: balanceRes.result.error.code, balance: null, tokens });
          } else {
            setSnapshot({ status: "ready", error: null, errorCode: null, balance: balanceRes.result.value, tokens });
          }
        } catch (error) {
          setSnapshot({ status: "error", error: error instanceof Error ? error.message : String(error), errorCode: null, balance: null, tokens: null });
        }
      }, [connection]);
      react.useEffect(() => { load(); }, [load]);
      const tokensTotal = snapshot.tokens === null ? 0 : snapshot.tokens.input + snapshot.tokens.output + snapshot.tokens.cacheRead + snapshot.tokens.cacheWrite;
      return react_jsx_runtime.jsxs("div", {
        style: sectionStyle,
        children: [
          react_jsx_runtime.jsxs("div", {
            style: blockStyle,
            children: [
              react_jsx_runtime.jsxs("div", {
                style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" },
                children: [
                  react_jsx_runtime.jsx("span", { style: titleStyle, children: t("account.balanceTitle") }),
                  react_jsx_runtime.jsxs("div", {
                    style: { display: "flex", alignItems: "center", gap: "12px" },
                    children: [
                      react_jsx_runtime.jsx(_primitives.Button, {
                        variant: "outline",
                        size: "sm",
                        style: linkStyle,
                        onClick: () => { connection.api.host.openExternal({ url: TOP_UP_URL }).catch(() => void 0); },
                        children: t("account.recharge")
                      }),
                      react_jsx_runtime.jsx(_primitives.Button, {
                        variant: "outline",
                        size: "sm",
                        onClick: () => load(),
                        children: t("account.refresh")
                      })
                    ]
                  })
                ]
              }),
              snapshot.status === "loading" ? react_jsx_runtime.jsx("div", { style: mutedStyle, children: t("account.balanceLoading") })
                : snapshot.status === "error" ? react_jsx_runtime.jsxs("div", {
                    style: blockStyle,
                    children: [
                      react_jsx_runtime.jsx("div", { style: errorStyle, children: t("account.balanceError") }),
                      snapshot.error === null ? null : react_jsx_runtime.jsx("div", { style: mutedStyle, children: snapshot.error }),
                      snapshot.errorCode === "missing-credential" ? react_jsx_runtime.jsx("div", { style: mutedStyle, children: t("account.notConfigured") }) : null
                    ]
                  })
                : react_jsx_runtime.jsx("div", {
                    style: blockStyle,
                    children: snapshot.balance === null || snapshot.balance.balance_infos.length === 0
                      ? react_jsx_runtime.jsx("div", { style: mutedStyle, children: t("account.balanceLoading") })
                      : snapshot.balance.balance_infos.map((info) => react_jsx_runtime.jsxs("div", {
                          key: info.currency,
                          style: rowStyle,
                          children: [
                            react_jsx_runtime.jsx("span", { children: info.currency }),
                            react_jsx_runtime.jsx("span", { style: valueStyle, children: info.total_balance })
                          ]
                        }))
                  })
            ]
          }),
          react_jsx_runtime.jsxs("div", {
            style: blockStyle,
            children: [
              react_jsx_runtime.jsx("span", { style: titleStyle, children: t("account.tokenTitle") }),
              snapshot.tokens === null ? react_jsx_runtime.jsx("div", { style: mutedStyle, children: t("account.balanceLoading") })
                : react_jsx_runtime.jsxs(react.Fragment, {
                    children: [
                      react_jsx_runtime.jsxs("div", { style: rowStyle, children: [react_jsx_runtime.jsx("span", { children: t("account.tokenInput") }), react_jsx_runtime.jsx("span", { children: snapshot.tokens.input.toLocaleString() })] }),
                      react_jsx_runtime.jsxs("div", { style: rowStyle, children: [react_jsx_runtime.jsx("span", { children: t("account.tokenOutput") }), react_jsx_runtime.jsx("span", { children: snapshot.tokens.output.toLocaleString() })] }),
                      react_jsx_runtime.jsxs("div", { style: rowStyle, children: [react_jsx_runtime.jsx("span", { children: t("account.tokenCacheRead") }), react_jsx_runtime.jsx("span", { children: snapshot.tokens.cacheRead.toLocaleString() })] }),
                      react_jsx_runtime.jsxs("div", { style: rowStyle, children: [react_jsx_runtime.jsx("span", { children: t("account.tokenCacheWrite") }), react_jsx_runtime.jsx("span", { children: snapshot.tokens.cacheWrite.toLocaleString() })] }),
                      react_jsx_runtime.jsxs("div", { style: Object.assign({}, rowStyle, { borderBottom: "none", fontWeight: "600" }), children: [react_jsx_runtime.jsx("span", { children: t("account.tokenTotal") }), react_jsx_runtime.jsx("span", { children: tokensTotal.toLocaleString() })] })
                    ]
                  })
            ]
          })
        ]
      });
    }

    const inject = ["slots", "locale", "connection"];

    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, { zh, en }), "dsh-account: dictionaries");
      const t = ctx.locale.bind(NS);
      const connection = ctx.get("connection");
      ctx.slots.inject("settings.section", () => ctx.slots.register({
        name: "settings.section",
        id: SECTION_ID,
        order: 1,
        label: () => t("account.nav"),
        locale: NS,
        inject: () => ({ connection, t })
      }, AccountSection));
    }

    exports.apply = apply;
    exports.inject = inject;
    exports.AccountSection = AccountSection;
    return module.exports;
  }
});