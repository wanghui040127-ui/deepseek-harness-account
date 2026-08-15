/**
 * Host face of the dsh-account plugin.
 *
 * The account features (balance, local token usage, top-up link) are entirely
 * client-side: they ride the core `balance.get` Remote and the `sessions.list`
 * projection that the host api-proxy already exposes. The host face exists so
 * the package is a loadable Cordis entry (the client-modules scanner only picks
 * up packages that are live loader entries declaring `dsh.client`).
 */
function apply() {}

export { apply };
export default { apply };