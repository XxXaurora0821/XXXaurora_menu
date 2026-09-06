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

## 本地视觉改版（2026-09）

当前主页使用独立的 `home.css`、`home-i18n.js` 和 `home-motion.js`，详情页共用 `home.css` 并由 `detail.css` 补充布局。旧版动画文件不再由页面加载。

- 深色编辑式排版、动态曲面光带、渐进滚动入场、图片悬停与原生跨页面过渡。
- 动效无第三方脚本依赖；后台或离开首屏时暂停画布，系统减少动态效果时展示静态画面。
- 五张项目预览使用 WebP，保留原始 PNG；保留中英文切换与项目链接。
- 仅本地修改，未推送或部署。需本人验证视觉后再授权推送。

本地预览：`python3 -m http.server 8080 --bind 127.0.0.1`，打开 `http://127.0.0.1:8080`。
建议体验：首屏等待光带流动、移动鼠标、滚动浏览项目、悬停封面、切换中英、进入详情并返回，以及手机窄屏与系统减少动态效果。

开场动画已恢复：`home-intro.js` 使用原生对话框呈现光环和品牌入场，选择语言后衔接主页。刷新可重看，页脚也有重播入口；从详情返回时不会重复打断。支持键盘、跳过和减少动态效果。

作品集视觉第二版：`portfolio.css` 管理编辑式排版与五套项目图形封面。主页与详情页均不再引用 AI 生成的预览图片。封面依据现有项目功能制作（记忆结构、决策流程、路径因素、口味选项、卦象），属于图形化项目表达，不是真实产品截图。保留原图文件以便回退。

最终配色方向：冷白（#f7f8fa）、炭黑（#202124）、电光蓝（#2341f0）。`gallery.css` 为全站主题入口，覆盖首页、五个详情页、开场揭幕和响应式状态。项目原有结构和双语功能保持，画布同步改为蓝色线条。仍仅供本地视觉验证，未推送或部署。
