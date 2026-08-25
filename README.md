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

### 4. RSVP 登记收集（腾讯问卷）

`index.html` 支持两种登记模式，由脚本开头的 `SURVEY_URL` 变量切换：

**模式 A：腾讯问卷（国内推荐）— 设置步骤：**

1. 打开 [wj.qq.com](https://wj.qq.com)，微信扫码登录（免费）
2. 创建问卷 → 类型选「登记」或「活动报名」，加三个题：
   - 您的姓名（单行填空，必答）
   - 是否需要住宿（单选：需要 / 不需要 / 待定，必答）
   - 联系电话（单行填空，选答）
3. 发布后复制链接（形如 `https://wj.qq.com/s2/xxxxxxxx/xxxx/`）
4. 打开 `index.html`，找到开头的 `const SURVEY_URL = '';`，把链接填进引号里，push

之后页面上的登记表单会自动替换成一个「前往登记」按钮，点击跳转问卷。
所有回复在腾讯问卷后台实时可见，可导出 Excel 统计住宿人数。

优点：免费、国内访问快、微信内直接打开不被拦、长辈扫码就能填、后台实时统计可导出。

**模式 B：页面内本地登记（`SURVEY_URL` 留空时）**

登记信息保存在访客自己浏览器的 localStorage 中（无需后端，纯静态站）。
**注意：数据只存在访客手机上，你们收不到**，仅适合演示或临时使用。

**其他备选：**

| 方案 | 说明 |
|------|------|
| [问卷星](https://www.wjx.cn) | 与腾讯问卷同类，免费版够用 |
| Google Forms | 国内打不开，仅海外宾客适用 |
| [Formspree](https://formspree.io) | 表单原样保留，提交结果发到邮箱，免费 50 条/月，海外服务 |
| 微信群接龙 | 完全零代码，适合长辈场景，但统计要手动数 |

## 本地预览

```bash
# 任选其一
python3 -m http.server 8000
# 或
npx serve .
```

浏览器打开 `http://localhost:8000` 即可。
