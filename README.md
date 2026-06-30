# 摄影工作台 (Photographer Workspace)

独立摄影师手机端工作台，支持添加到手机桌面作为 PWA 使用。

## 项目结构

```
摄影工作台/
├── index.html              # 入口页面
├── manifest.json           # PWA 清单
├── sw.js                   # Service Worker（离线缓存）
├── README.md               # 本文件
│
├── css/
│   ├── variables.css       # 全局设计变量（颜色、圆角、阴影）
│   ├── base.css            # 全局重置 & 基础样式
│   ├── layout.css          # 布局（头部、页面容器、底部导航）
│   ├── components.css      # 公共组件（卡片、按钮、表单、弹窗等）
│   └── pages.css           # 页面级样式（日历、今日卡片、图片查看器）
│
├── js/
│   ├── utils.js            # 公共工具函数（UID、日期格式化、Toast、图片压缩）
│   ├── database.js         # IndexedDB 封装层（IDB 全局对象）
│   ├── seed.js             # 首次使用预置数据
│   ├── app.js              # 应用入口、初始化、导航、资料库路由
│   ├── income.js           # 首页渲染（经营统计、清单、今日拍摄）
│   ├── project.js          # Project CRUD、进度条、收款卡片
│   ├── customer.js         # 客户管理
│   ├── calendar.js         # 摄影日历
│   ├── resource.js         # 资源库（发给客户的资料）
│   ├── gallery.js          # 参考图库（灵感收集）
│   ├── replies.js          # 话术库
│   └── backup.js           # 设置、数据导出导入、套餐/附加项管理
│
└── assets/
    ├── icons/              # 图标（预留）
    ├── images/             # 图片（预留）
    └── fonts/              # 字体（预留）
```

## 技术栈

- 纯静态 HTML + CSS + JavaScript
- IndexedDB 本地存储
- PWA（Service Worker + Manifest）
- 无框架、无构建工具

## 数据存储

所有数据存储在浏览器 IndexedDB（数据库名 `PW2`，版本 2）。

对象存储（Object Stores）：
- `proj` — 项目
- `cust` — 客户
- `res` / `rcat` — 资源库 / 分类
- `ref` / `rfcat` — 参考图 / 分类
- `rep` / `repcat` — 话术 / 分类
- `pkg` — 套餐
- `addon` — 附加项
- `set` — 设置 / 清单

## 运行方式

1. 本地文件：浏览器直接打开 `index.html`
2. 移动端：通过本地服务器访问 → Safari「添加到主屏幕」→ PWA 模式

## 开发原则

- 记录，而不是管理
- 辅助，而不是增加工作
- 每日维护时间不超过 3 分钟
- 所有收入数据为实时计算，不存入数据库
