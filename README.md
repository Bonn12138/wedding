# 💍 许博仁 & 蔡银坤 · 婚礼邀请

婚礼电子请柬网站：**EdgeOne Pages 托管（主，国内访问快）+ GitHub Pages（备，海外宾客）**，
宾客登记（RSVP）数据通过边缘函数存入 KV 存储，新人用管理页查看与导出。

- **婚期**：2026 年 10 月 3 日（星期六，农历丙午年八月廿三）
- **地点**：河北省保定市易县好年景大酒店

## 在线访问

| 渠道 | 地址 | 用途 |
|------|------|------|
| EdgeOne Pages（主） | `https://<项目名>.edgeone.app`（部署后以控制台为准） | 国内宾客，微信内可直接打开 |
| GitHub Pages（备） | https://bonn12138.github.io/wedding/ | 海外宾客备用；注意此地址国内不稳定 |

> 发请柬请用 EdgeOne 地址。`github.io` 在国内受 DNS 污染影响，部分地区打不开。

## 目录结构

```
wedding/
├── index.html                      # 请柬页面（宾客填表 → 提交到 /api/rsvp）
├── admin.html                      # 新人管理页（口令登录 → 查看/导出名单）
├── wedding.html                    # 原始请柬页面（历史备份，未接后端）
├── .nojekyll                       # GitHub Pages 跳过 Jekyll 构建
├── edge-functions/
│   └── api/
│       ├── rsvp.js                 # POST 提交登记 / GET 口令查询名单
│       └── rsvp-export.js          # GET 导出 CSV（带 BOM，Excel 直开不乱码）
├── README.md                       # 本文件
└── assets/
    ├── images/                     # 照片（放入后页面自动显示）
    │   ├── main.jpg                # 主婚纱照，建议 1200×800
    │   └── photo1~4.jpg            # 副照片（1:1 方图最佳）
    └── music/
        └── bgm.mp3                 # 背景音乐（放入后按钮自动启用）
```

## EdgeOne Pages 部署（主站，只需一次）

1. 微信扫码登录腾讯云，进入 **EdgeOne Pages**（控制台搜 "EdgeOne"，产品已升级名为 EdgeOne Makers，功能一致）
2. **创建项目 → 导入 Git 仓库**，选 GitHub 授权并选中 `Bonn12138/wedding`；构建配置留空（纯静态 + 边缘函数，无构建命令）
3. **开通 KV 存储**：项目侧边栏「KV 存储」→ 按提示开通（需填写申请理由，如"婚礼请柬 RSVP 数据存储"，人工审批，一般很快）→ 创建命名空间（如 `wedding`）
4. **绑定 KV**：项目详情 → KV 存储 → 绑定命名空间，**变量名必须填 `rsvp_kv`**（代码按此全局变量名读写）
5. **设置管理口令**：项目设置 → 环境变量 → 添加 `ADMIN_TOKEN`，值为自选口令（建议 8 位以上随机字符串，新人两人知晓即可）
6. 部署完成后记下 `https://<项目名>.edgeone.app` 地址——这就是发出去的请柬链接；管理页为同地址下的 `/admin.html`

之后往 GitHub `master` push 任何改动（照片、音乐、文案），EdgeOne 自动重新部署，无需手动操作。

## RSVP 登记流程

**宾客视角**：打开请柬 → 填姓名/是否住宿/电话 → 点「提交登记」→ 页面直接提示感谢，完成。
（网络异常时信息自动存在手机本地并提示重试，宾客不会看到报错）

**新人视角**：打开 `/admin.html` → 输入 `ADMIN_TOKEN` 口令 → 看到名单表格与分类统计
（需要/不需要/待定人数）→ 点「导出 CSV」下载 Excel 可直接打开的名单（中文无乱码）。

规则：同名再次提交视为**修改**自己的登记，不会产生重复记录。
数据略有延迟（KV 最终一致性，约 1 分钟内同步）属正常。

## 如何更新网站

### 换照片 / 换音乐

照片按命名放进 `assets/images/`（`main.jpg`、`photo1.jpg` ~ `photo4.jpg`），
音乐命名 `bgm.mp3` 放进 `assets/music/`，然后：

```bash
git add assets/
git commit -m "更新照片"
git push
```

未放置时页面显示优雅占位样式，不影响访问。
建议照片先压缩到 300KB 以内再上传（手机原图动辄 5MB，影响加载）。

### 修改婚礼信息 / 姓名 / 日期

直接编辑 `index.html` 对应文字，push 即可。

## 本地预览

```bash
npm i -g edgeone   # 一次性安装 CLI
edgeone pages dev  # 本地调试，边缘函数与 KV 均可用
```

或纯静态预览（`python3 -m http.server 8000`）——注意此方式下提交接口不存在，
点提交会走"本地保存 + 提示重试"的降级路径，属预期行为。

## 安全说明

- 管理口令存在 EdgeOne 环境变量中，不在代码仓库里；`admin.html` 本身无敏感数据
- API 仅接受三类字段（姓名/住宿/电话）并做服务端校验，提交频率极低的场景下无需额外防刷
- 若口令泄露，在控制台改 `ADMIN_TOKEN` 即刻生效

## 历史：腾讯问卷方案（已弃用）

曾用腾讯问卷跳转收集，但其"链接传参预填"为会员功能，宾客需重复填写，已改为自建后端。
若需回退：把 `index.html` 的 `handleSubmit` 恢复为 `window.open('问卷链接')` 即可。
