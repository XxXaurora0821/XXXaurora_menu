# xxxaurora.com 导航页

这个目录是一个纯静态导航页项目：
- `index.html`：页面结构和文案
- `styles.css`：视觉样式

## 自动部署（GitHub Actions -> Cloudflare Pages）
项目已新增工作流文件：
- `.github/workflows/deploy-cloudflare-pages.yml`

触发规则：
- 推送到 `main` 分支时自动部署
- 也可在 GitHub Actions 页面手动触发

你需要在 GitHub 仓库里配置 2 个 Secrets：
1. `CLOUDFLARE_API_TOKEN`（需要 `Pages:Edit` 权限）
2. `CLOUDFLARE_ACCOUNT_ID`（你的 Cloudflare Account ID）

当前工作流默认部署到 Cloudflare Pages 项目：
- `xxxaurora-nav`

如果你改了 Pages 项目名，请同步修改：
- `.github/workflows/deploy-cloudflare-pages.yml` 里的 `CF_PAGES_PROJECT`

## 视觉重设计说明（2026-03）
本次更新仅重构展示层，保留了原有页面内容、项目文案、链接与分区语义。

主要改动：
- 统一 `styles.css` 设计系统（赛博 HUD 面板、霓虹描边、分层背景、扫描线与噪点氛围）
- 强化首页层级（Hero 首屏、分区标题、项目卡片、导航状态与按钮交互）
- 优化动效（GSAP 首屏入场、滚动 reveal、标题轻微 glitch、卡片与链接微交互）
- 保持纯前端静态站点结构，未引入后端依赖

后续可调入口：
- 主题颜色与发光强度：`styles.css` 顶部 `:root` 变量
- 面板与按钮视觉：`styles.css` 中 `.sidebar/.panel/.card/.quick-jump` 与 `.button/.ghost`
- 动画节奏：`index.html` 内 `initGsapFx`、`initModuleMotion`、`initHeadingGlitch`

## Welcome Intro（含预加载）
- 结构位置：`index.html` 顶部 `#welcome-overlay`（三态：`loading -> intro -> entered`）
- 逻辑位置：`welcome-intro.js`
  - 预加载：等待文档完成、关键字体、首屏关键图片（带超时保护）
  - 进度：`.welcome-progress-bar` 与 `.welcome-progress-value`
  - 交互：点击任意位置/回车进入主站
  - 过渡：GSAP 退出欢迎层后再启动主页动效
- 样式位置：`styles.css` 中 `.welcome-*`、`body.welcome-*`
- 快速关闭：在 `index.html` 的 `<body>` 上加 `data-welcome-intro="off"`
