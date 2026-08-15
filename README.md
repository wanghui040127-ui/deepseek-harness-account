# dsh-account

一个独立的 DeepSeek Harness 插件：在「设置」页新增 **账户** 标签，显示 DeepSeek 官方账户余额、本机累计 Token 用量，并提供跳转到官方平台的「充值 / 登录」入口。

## 功能

- **余额显示**：调用 DeepSeek 官方 `GET https://api.deepseek.com/user/balance` 接口（走应用内置的 `balance.get` Remote），按币种展示 `total_balance`。
- **用量显示**：汇总本机所有会话的 Token 用量（输入 / 输出 / 缓存读取 / 缓存写入 / 合计）。
- **充值 / 登录**：一键打开 `https://platform.deepseek.com/top_up` 官方充值/登录页（系统浏览器打开）。
- **刷新**：手动重新拉取余额与用量。

## 装完就能用

安装本插件并重启应用后，「设置 → 账户」标签即会出现，无需任何额外配置，直接获得以下效果：

- **本机 Token 用量**：自动汇总本机所有会话的输入 / 输出 / 缓存 / 合计用量。
- **充值 / 登录**：一键打开 DeepSeek 官方充值 / 登录页。
- **余额显示**：需要你在应用的「模型设置」里正常配置 DeepSeek API Key。这不是本插件的额外步骤——DeepSeek Harness 本来就要填 API Key 才能使用，插件只是复用它来查询官方余额；未配置时余额区域会提示你去填写，其余功能不受影响。

## 安装

### 复制安装（推荐，无需改写入 app 包）

把本插件放到目标 profile 的 `node_modules`，并在 `cordis.patch.yml` 注册即可。由于标准版内置了同款「账户」区段，安装脚本还会往 profile 里放一份**去掉了内置 account 区段的 `dsh-client-ui-settings-general` 覆盖包**，用它遮蔽宿主内置的那份，从而只保留本插件的账户区段，避免重复。应用重启后生效。

一键脚本（在插件目录内执行）：

```bash
./install.sh
# 或指定 DSH_HOME 与 profile：
./install.sh "$HOME/Library/Application Support/com.dsh.studio" web
```

脚本会：
1. 把插件包复制到 `<DSH_HOME>/profiles/<profile>/node_modules/@deepseek-ai/dsh-account/`；
2. 把去除内置 account 区段的覆盖包复制到 `<DSH_HOME>/profiles/<profile>/node_modules/@deepseek-ai/dsh-client-ui-settings-general/`（遮蔽宿主内置版本，仅禁用账户区段，其余设置区段不受影响）；
3. 向 `<DSH_HOME>/profiles/<profile>/cordis.patch.yml` 追加 loader 条目（已存在则跳过）。

### 手动安装

```bash
# 1. 复制插件包
mkdir -p "$DSH_HOME/profiles/web/node_modules/@deepseek-ai/dsh-account"
cp -R packages/dsh-account/package.json packages/dsh-account/lib "$DSH_HOME/profiles/web/node_modules/@deepseek-ai/dsh-account/"

# 2. 复制去除内置 account 区段的覆盖包（遮蔽宿主内置版本）
cp -R packages/dsh-client-ui-settings-general "$DSH_HOME/profiles/web/node_modules/@deepseek-ai/dsh-client-ui-settings-general"

# 3. 在 cordis.patch.yml 追加（若没有 dsh-account 条目）
cat >> "$DSH_HOME/profiles/web/cordis.patch.yml" <<'EOF'

- insert:
    - id: dsh-account
      name: '@deepseek-ai/dsh-account'
EOF
```

### 生效

重启 DeepSeek Harness 应用，打开「设置」→ 左侧浮出面板中的 **账户 / Account** 标签。

## 使用

1. 打开设置面板，点击「账户」。
2. 余额区域显示每一币种（如 CNY / USD）的可用余额；右上角有「充值 / 登录」和「刷新」按钮。
3. 下方显示本机累计 Token 用量。

## 卸载

```bash
rm -rf "$DSH_HOME/profiles/web/node_modules/@deepseek-ai/dsh-account" \
       "$DSH_HOME/profiles/web/node_modules/@deepseek-ai/dsh-client-ui-settings-general"
# 并从 cordis.patch.yml 删除 dsh-account 的 insert 条目
```

卸载后重启应用，内置的「账户」区段会恢复。

## 技术说明

- 纯客户端插件：余额与用量均复用 DSH 核心已提供的 `connection.api.balance.get` 与 `connection.api.sessions.list`，无需新增宿主端 Remote 方法。
- 通过 `dsh.client` 声明 + 注册 `settings.section` 插槽提供服务。
- 区段 id 使用 `dsh-account`，不占用内置 `account` 区段 id。
- 内置账户区段通过 profile 内的 `dsh-client-ui-settings-general` 覆盖包移除（仅删除 `id: "account"` 的注册，其余设置区段原样保留）。覆盖包完全来自宿主同版本，仅做这一处修改，避免遮蔽带来的版本漂移。

## License

MIT