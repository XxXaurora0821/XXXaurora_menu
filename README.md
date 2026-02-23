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
