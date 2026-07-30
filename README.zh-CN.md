# Chrome PDF to NotebookLM

[English](./README.md) | **简体中文**

一键把 PDF、arXiv 页面或普通网页导入 NotebookLM 笔记本，并自动生成音频概览、信息图等内容。

## 截图

![流水线进度](./screenshot1.png)
![生成内容设置](./screenshot2.png)

## 主要功能

- **智能 PDF 检测** — 支持直接 PDF 链接、arXiv 摘要页/HTML 页/PDF 页，以及普通网页中的 PDF 链接
- **一键流水线** — 创建笔记本、添加来源、启动内容生成，一次点击全部完成
- **后台运行** — 关闭弹窗后流水线继续执行，完成时发送系统通知和提示音（均默认开启，可在设置中关闭）
- **本地 PDF 上传** — 可直接读取当前标签页中的 PDF，读取失败时自动回退到文件选择器
- **丰富的生成设置** — 在齿轮面板中开关并配置音频概览、视频、报告、测验、闪卡、信息图、幻灯片、思维导图、数据表格

## 安装

### 方式 A：从 Release 安装（推荐）

1. 在 [Releases 页面](https://github.com/Drscq/chrome-pdf-to-notebooklm/releases/latest)下载最新的 `chrome-pdf-to-notebooklm-vX.Y.Z.zip` 并解压。
2. 在 Chrome 中打开 `chrome://extensions`。
3. 打开右上角的**开发者模式**。
4. 点击**加载已解压的扩展程序**，选择解压后的文件夹（包含 `manifest.json` 的那一层）。
5. 确认扩展列表中出现 **Chrome PDF to NotebookLM** 即安装成功。

> 注意：Chrome 不允许直接安装来自 Chrome Web Store 之外的 zip/crx 文件，因此“解压后加载文件夹”就是正确的安装方式。安装后请不要删除或移动该文件夹——Chrome 每次启动都会从该路径加载扩展。

### 方式 B：从源码安装

1. 克隆或下载本仓库。
2. 按照上面第 2–5 步操作，选择仓库根目录即可。

## 使用方法

1. 用 Google 账号登录 NotebookLM（`https://notebooklm.google.com`）。
2. 打开一个 PDF、arXiv 页面或任意网页，点击扩展图标。
3. 根据当前情况点击对应按钮：
   - **🎧 Generate Artifacts** — 页面上检测到了 PDF
   - **Use Current Webpage URL** — 未检测到 PDF，把当前网页本身作为来源导入
   - **Use Current PDF and Generate** — 当前标签页是本地 PDF 文件
   - **Upload Local PDF** — 手动从电脑中选择一个 PDF
4. （可选）点击齿轮图标选择要生成的内容类型并调整详细设置。
5. 在弹窗中跟踪进度，完成后点击 **Open Notebook in NotebookLM** 打开结果。

## 权限与隐私

- 扩展只与 `notebooklm.google.com`（使用你已登录的 Google 会话）以及你要导入的 PDF 所在网站通信。没有第三方服务器，没有统计分析，没有任何跟踪。
- 申请全站点访问权限（`*://*/*`）是为了实现兜底逻辑：当 NotebookLM 拒绝 URL 导入时，直接下载 PDF 再重新上传。
- 若要直接读取当前标签页中的本地 `file://` PDF，需要在扩展详情页中开启**允许访问文件网址**。
- 你导入的任何内容——包括你的浏览器会话能访问的付费或私有 PDF——都会上传到你自己的 Google NotebookLM 账户。处理敏感文档时请留意这一点。
- 本扩展使用的是 NotebookLM 的非公开 Web API，Google 改版时功能可能失效。

## 常见问题

- **点击按钮后没有反应** — 请先确认已登录 NotebookLM。
- **本地 PDF 读取失败** — 开启**允许访问文件网址**后重新加载扩展再试。
- **URL 导入失败** — 来源网站可能拦截了自动下载；请手动下载 PDF 后改用 **Upload Local PDF**。

## 致谢

- Fork 自 [`mahlernim/chrome-pdf-to-notebooklm`](https://github.com/mahlernim/chrome-pdf-to-notebooklm)。
- NotebookLM 协议实现大量参考了 [`teng-lin/notebooklm-py`](https://github.com/teng-lin/notebooklm-py)。

## 许可证

MIT，详见 [LICENSE](./LICENSE)。
