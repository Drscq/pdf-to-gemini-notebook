# PDF to Gemini Notebook

**[English](#english)** · **[简体中文](#简体中文)**

Import any PDF Chrome can open into Gemini Notebook (formerly NotebookLM) in one click.

| Import view | Settings |
|---|---|
| ![Import view](./screenshot1.png) | ![Settings](./screenshot2.png) |

---

## English

### What it does

Open a PDF (direct link, arXiv, eprint, ACM DL, or a local file), click the extension, pick a notebook — done. Sources are auto-named with the paper's real title. By default it only imports; artifact generation (audio overview, infographic, quiz, etc.) can be enabled in settings.

- **Import to any notebook** — an existing one or a new one, from the dropdown
- **Real titles** — from PDF metadata, or NotebookLM's own content analysis
- **Detects PDFs without a `.pdf` URL** — publisher viewers like `dl.acm.org/doi/pdf/…` and IEEE Xplore are recognised from what the tab is actually rendering
- **Detects PDFs embedded in a page** — a Springer chapter's "Chapter PDF" preview imports that chapter, not the whole proceedings volume
- **Blocked-site fallback** — sites that reject NotebookLM's fetcher (eprint, ACM DL and other Cloudflare-protected publishers) are downloaded in your browser, using your existing session, and uploaded automatically
- **Multi-account** — pick which signed-in Google account to use (gear → Google Account)
- **Fast** — typical imports finish in ~10 seconds

### Install

1. Download and unzip the latest zip from [Releases](https://github.com/Drscq/pdf-to-gemini-notebook/releases/latest) (or clone this repo).
2. Open `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and select the folder containing `manifest.json`.

### Use

1. Sign in at [notebook.google.com](https://notebook.google.com/).
2. Open a PDF, click the extension icon, choose the target notebook, click the import button.
3. For local `file://` PDFs, enable **Allow access to file URLs** in the extension's details first.

### Privacy

The extension talks only to Google (your session) and the site hosting the PDF — no third-party servers, no tracking, nothing stored locally. Anything you import ends up in your own Gemini Notebook account, so mind sensitive documents. It uses NotebookLM's private web API and may break when Google changes it.

---

## 简体中文

### 功能

打开一个 PDF（直链、arXiv、eprint、ACM DL 或本地文件），点插件图标，选一个笔记本——完成。来源会自动命名为论文的真实标题。默认只导入；音频概览、信息图、测验等内容生成可在设置中开启。

- **导入到任意笔记本** — 下拉框选择已有笔记本或新建
- **真实标题** — 来自 PDF 元数据或 NotebookLM 自己的内容分析
- **识别无 `.pdf` 后缀的 PDF** — `dl.acm.org/doi/pdf/…`、IEEE Xplore 等出版社链接按标签页实际渲染的内容判断
- **识别页面内嵌的 PDF** — Springer 章节页的 "Chapter PDF" 预览会导入该章节本身，而不是整本论文集
- **拦截站点兜底** — 拒绝 NotebookLM 抓取的网站（eprint、ACM DL 等 Cloudflare 保护的出版社）会自动改为用你已登录的会话在浏览器中下载后上传
- **多账号** — 可选择使用哪个已登录的 Google 账号（齿轮 → Google Account）
- **快** — 一般导入约 10 秒完成

### 安装

1. 从 [Releases](https://github.com/Drscq/pdf-to-gemini-notebook/releases/latest) 下载最新 zip 并解压（或克隆本仓库）。
2. 打开 `chrome://extensions`，开启**开发者模式**，点击**加载已解压的扩展程序**，选择含 `manifest.json` 的文件夹。

### 使用

1. 登录 [notebook.google.com](https://notebook.google.com/)。
2. 打开 PDF，点插件图标，选目标笔记本，点导入按钮。
3. 本地 `file://` PDF 需先在扩展详情页开启**允许访问文件网址**。

### 隐私

插件只与 Google（你的会话）和 PDF 所在网站通信——无第三方服务器、无跟踪、本地不存储任何内容。导入的文件会进入你自己的 Gemini Notebook 账户，敏感文档请留意。本插件使用 NotebookLM 非公开 API，Google 改版时可能失效。

---

Formerly *Chrome PDF to NotebookLM* (renamed after Google's rebrand). Forked from [`mahlernim/chrome-pdf-to-notebooklm`](https://github.com/mahlernim/chrome-pdf-to-notebooklm); protocol informed by [`teng-lin/notebooklm-py`](https://github.com/teng-lin/notebooklm-py). MIT licensed — see [LICENSE](./LICENSE).
