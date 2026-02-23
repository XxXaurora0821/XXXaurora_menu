# xxxaurora.com 导航页

这个目录是一个纯静态导航页项目：
- `index.html`：页面结构和文案
- `styles.css`：视觉样式

## 你需要先改的内容
1. 名字与介绍：`index.html` 中 `XXX Aurora` 和自我介绍文案。
2. 导航链接：`#links` 区域里每个卡片的 `href="#"` 改成你的真实链接。
3. 联系方式：`hello@xxxaurora.com` 改成你的邮箱。
4. 最近更新：`#updates` 区域的日期和内容。

## 本地预览
在当前目录运行：

```bash
python3 -m http.server 8000
```

然后打开 `http://localhost:8000`。

## 上线
这是纯静态站点，可直接部署到 Cloudflare Pages / Netlify / Vercel / GitHub Pages。

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
