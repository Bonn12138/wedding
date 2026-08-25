# 💍 许博仁 & 蔡银坤 · 婚礼邀请

基于 GitHub Pages 的婚礼电子请柬网站。

- **婚期**：2026 年 10 月 3 日（星期六，农历丙午年八月廿三）
- **地点**：河北省保定市易县好年景大酒店

## 在线访问

GitHub Pages 部署完成后，访问：

```
https://bonn12138.github.io/wedding/
```

## 目录结构

```
wedding/
├── index.html          # 站点首页（GitHub Pages 入口，即婚礼请柬页面）
├── wedding.html        # 原始请柬页面（与 index.html 内容一致，保留作备份）
├── .nojekyll           # 告诉 GitHub Pages 跳过 Jekyll 构建，直接发布静态文件
├── README.md           # 本文件
└── assets/
    ├── images/         # 照片（放入后页面自动显示）
    │   ├── main.jpg    # 主婚纱照，建议 1200×800
    │   ├── photo1.jpg  # 副照片 1（1:1 方图最佳）
    │   ├── photo2.jpg
    │   ├── photo3.jpg
    │   └── photo4.jpg
    └── music/
        └── bgm.mp3     # 背景音乐（放入后音乐按钮自动启用）
```

## 如何更新网站

### 1. 换照片

把婚纱照按上面的文件名放进 `assets/images/`，提交并推送即可：

```bash
git add assets/images/
git commit -m "更新婚纱照"
git push
```

照片未放置时，页面会显示优雅的占位样式，不影响访问。

> 建议先用图片工具把照片压缩到 300KB 以内再上传，加载更快。

### 2. 换背景音乐

把音乐文件命名为 `bgm.mp3` 放进 `assets/music/`，提交推送即可。
未放置时音乐区域自动隐藏。

### 3. 开启 GitHub Pages（只需一次）

1. 打开仓库页面 `https://github.com/Bonn12138/wedding`
2. 进入 **Settings → Pages**
3. **Source** 选择 `Deploy from a branch`
4. 分支选 `master`，目录选 `/ (root)`，点 **Save**
5. 等待 1–2 分钟，即可通过上面的地址访问

### 4. 查看 RSVP 登记结果

目前登记信息保存在访客自己浏览器的 localStorage 中（无需后端、无需数据库，纯静态站）。

如果希望收集到统一的后台，推荐以下免费方案（任选其一，改 `index.html` 中 `handleSubmit` 的存储逻辑即可）：

| 方案 | 说明 |
|------|------|
| [腾讯问卷](https://wj.qq.com) / 问卷星 | 建一个问卷，把「提交登记」按钮改成跳转问卷链接，最简单 |
| Google Forms | 同上，海外访问友好 |
| [Formspree](https://formspree.io) | 免费额度 50 条/月，表单原样保留，提交结果发到邮箱 |
| 微信收藏 / 群接龙 | 完全零代码，适合长辈场景 |

## 本地预览

```bash
# 任选其一
python3 -m http.server 8000
# 或
npx serve .
```

浏览器打开 `http://localhost:8000` 即可。
