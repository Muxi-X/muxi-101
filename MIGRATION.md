# 迁移说明：muxi_official_website → muxi-101

本目录下的官网代码迁移自 [`Muxi-X/muxi_official_website`](https://github.com/Muxi-X/muxi_official_website) 的 `main` 分支
（迁移基线 commit：`b71d667ddd42d9b5b2e5dabf4d9ab1bc761d9430`，2026-08-17）。

原项目是 **Vite 3 + React 18 + react-router-dom v6** 的纯客户端 SPA；
迁移目标是把它的页面**原封不动**地跑在 muxi-101 的 **Next.js 15 App Router** 上。

---

## 一、路由映射

官网 5 个 react-router 路由，等值映射为 5 个 Next 路由：

| 官网路由 | 官网组件 | muxi-101 路由文件 | URL |
|---|---|---|---|
| `/` | `components/first/first.tsx` | `src/app/(site)/page.tsx` | `/` |
| `/intro` | `pages/group.tsx` | `src/app/(site)/intro/page.tsx` | `/intro` |
| `/product` | `pages/product.tsx` | `src/app/(site)/product/page.tsx` | `/product` |
| `/member` | `pages/member.tsx` | `src/app/(site)/member/page.tsx` | `/member` |
| `/join` | `pages/join.tsx` | `src/app/(site)/join/page.tsx` | `/join` |

- 原 `src/pages/*.tsx`（每个 11 行的页面拼装层）**内容逐字节保留**，只把目录从
  `src/pages/` 改名为 `src/views/`。原因是 Next 会把任何 `src/pages/` 当成
  **Pages Router** 目录（见 `next/dist/lib/find-pages-dir.js` 的 `findDir`：先找 `./pages`，
  再找 `./src/pages`），与 App Router 的同名路由冲突并直接导致构建失败。
  改名后 `src/app/(site)/*/page.tsx` 只是薄壳，真正的页面组合仍在 `src/views/` 里。
- `src/app/(site)/layout.tsx` 承接了原 `App.tsx` 的职责：`.App` 容器 + `鄂ICP备19024133号` 备案号，
  并在全局注入 `src/index.css` 与 `src/styles/base.scss`。

---

## 二、保真度

对 32 个迁移文件做了 SHA-256 逐字节比对：

- **19 个文件完全一致**，包括 `info.ts`（250 位成员数据）、`const.js`（4 款产品）、
  `const.tsx`（6 个组别）、全部 `.scss` 样式表、`src/views/*.tsx` 页面层。
- **10 个图片资源全部一致**（`src/image/` 与 `static/image/` 两处，与官网同样重复存放）。
- **13 个文件有差异**，全部是下面第三节列出的必要改动，无一处涉及视觉或业务逻辑。

---

## 三、对官网源码的全部改动（13 个文件）

### 1) 加 `"use client"`（10 个文件）

App Router 默认是 React Server Component，组件里的事件处理器、`useState`、`useEffect`
都不允许。以下文件仅在**首行**新增 `"use client";`，其余内容一字未动：

```
components/banner/banner.tsx
components/banner/banner-controller.tsx
components/banner/banner-item.tsx
components/group/group.tsx
components/group/group-controller.tsx
components/intro/intro.tsx
components/intro/intro_card.tsx
components/intro/intro-controller.tsx
components/join/join.tsx
```

（`flower.tsx` / `first.tsx` / `header.tsx` 也需要，但它们在下面另有改动。）

### 2) 路由原语替换（2 个文件）

App Router 中没有 react-router 的 Router context，直接用会抛错。只替换导航原语，DOM 结构与类名不变：

**`components/header/header.tsx`**

```diff
- import { Link } from "react-router-dom";
+ import Link from "next/link";
+ import { usePathname } from "next/navigation";
...
+ const pathname = usePathname();
  useEffect(() => {
-   let route = window.location.pathname;
+   let route = pathname;
...
-   to={item.route === "/" ? "" : item.route}
+   href={item.route === "/" ? "" : item.route}
```

> `href=""` 被保留，与官网行为一致（点击"木犀团队"时 react-router 解析为当前路由，
> Next 解析为当前页面）。如需更规范可改为 `"/"`。

**`components/first/first.tsx`**

```diff
- import { Link } from "react-router-dom";
+ import Link from "next/link";
...
- <Link to="intro">
+ <Link href="/intro">
```

### 3) 修正官网自身的 SCSS 资源路径 bug（1 个文件）

**`components/flower/flower.scss`**

```diff
- background:url("../../static/image/logo.png");
+ background:url("../../../static/image/logo.png");
```

原路径从 `src/components/flower/` 上溯 2 级只到 `src/`，指向不存在的 `src/static/image/logo.png`。
同仓库的 `group.scss`、`petal.scss`、`banner.scss` 用的都是正确的 3 级上溯
（`../../../static/image/...`）。官网用 Vite 未开启 `base` 时该 url() 不参与构建解析，
所以这个坏路径被掩盖了；在 Next/webpack 下它是**构建期硬错误**。

### 4) 类型标注（1 个文件）

**`components/banner/banner-controller.tsx`**

```diff
- const [items, setItems] = useState(null);
+ const [items, setItems] = useState<string[] | null>(null);
```

`useState(null)` 被 TS 5 推断为 `never`，`items?.map(...)` 报 TS2339。
泛型是显式注解，不改变任何运行时行为（值仍由 `useEffect` 设为字符串数组）。

### 5) 修复 SSR hydration 不一致（1 个文件）

**`components/flower/flower.tsx`**

```diff
- import React from "react";
+ import React, { useEffect, useState } from "react";
...
+ // 首屏（服务端 HTML + hydration）不施加随机 transform，挂载后再补上
+ const [mounted, setMounted] = useState(false);
+ useEffect(() => setMounted(true), []);
...
- transform: `rotate(${rotateRandom()}deg)`,
+ ...(mounted ? { transform: `rotate(${rotateRandom()}deg)` } : {}),
```

`rotateRandom()` 是在**渲染期**调用 `Math.random()`。官网是纯客户端 SPA 所以没问题；
SSR 下服务端和客户端必然得到不同角度，React 会报
`A tree hydrated but some attributes of the server rendered HTML didn't match`。
改为挂载后再施加随机角度：**随机效果完整保留**（每次加载都不同），首屏无 hydration 警告。

> 注意：用 `useState(() => leaves.map(rotateRandom))` 是**无效**的——惰性初始化函数在服务端也会执行，
> 依旧两边不一致。

---

## 四、工程改动（不在官网文件内）

- `next.config.ts`：移除 Nextra 包装与 `eslint.ignoreDuringBuilds`。现在构建会跑 lint 与类型检查。
- `package.json`：移除 Nextra 三件套与 Tailwind（迁移后无任何引用）；新增 `react-transition-group`
  （`group.tsx` 用到 `CSSTransition`）；**未引入 react-router-dom**（路由已由 Next 承担）。
- 删除 `postcss.config.mjs`、`tailwind.config.ts`、`src/app/globals.css`、`src/app/blog/`、
  `src/app/guide/`、`src/content/`、`src/mdx-components.tsx`、`src/App.tsx`、`src/main.tsx`、
  `src/routes/` 以及 5 个 Next.js 默认 SVG。
- `declares.d.ts` 随迁移保留，提供 `declare module "react-transition-group";`。
- `tsconfig.json`：移除指向已删除文件 `src/app/guide/page.mdx` 的 `include` 条目。
- `tsconfig.tsbuildinfo` 已生成在仓库根目录，清理即可（`.gitignore` 已含 `*.tsbuildinfo`）。

---

## 五、与官网一致、未做改动的已知问题

以下都是官网既有状况，为遵守"原封不动"**刻意保留**：

1. **明文 HTTP 外链资源**：全部视觉素材走 `http://static.muxixyz.com`（约 30 处背景图/产品图）。
   HTTPS 部署会触发混合内容拦截。
2. **头像来源四个域名混用**：`muxi-avatar.muxixyz.com`（156）、`static.muxixyz.com`（116）、
   `workbench-static.muxixyz.com`（60）、`github.com/*.png`（8）；且存在
   `//backend/...` 双斜杠与 `backend%3Achencheng.png`（冒号当路径分隔符）等脏 URL。
3. **头部高亮只在首次挂载生效**：`header.tsx` 的 `useEffect(..., [])` 依赖数组为空，
   客户端路由切换到别的页面后不会重新计算高亮（官网用整页刷新掩盖了这点）。
   首次进入各路由时高亮是**正确**的。
4. **`key1` 属性**：`banner.tsx` 把 `<BannerItem key1={item} .../>` 作为普通 prop 传递，
   并非 React 的 `key`；`key1` 最终不会落到 DOM 上。官网原样如此。
5. **`group.tsx` 未使用 `CSSTransition`**、`banner-con-item.tsx` 无任何引用（死代码）。
6. **Sass `@import` 弃用警告**：官网样式表用 `@import`，Dart Sass 3.0 将移除。
   构建时会输出大量 Deprecation Warning，不影响产物。
7. **组别/产品数据含 `todo` 占位**：`group/const.tsx` 的运营组 `intro`/`learn` 为 `"todo"`；
   `banner/const.js` 顶部注释 `//todo：添加新产品`。
8. **响应式未完成**：`App.tsx` 原有注释「写了移动端都没人说，后端完全没部署，找个人修一修」，
   移动端重定向已注释禁用；布局仍以 1280×700 设计稿换算为主。

---

## 六、本地运行

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build        # 5 个路由全部静态预渲染（○ Static）
```

已验证：5 个路由 SSR 正常、控制台零报错、图片零破图、
首页 gooey 按钮跳转、导航栏跳转与高亮、组别圆形菜单切换、成员页组别切换（后端 56 人 / 设计 58 人）、
产品轮播（箭头 + 标题跳转）、加入页图片与花瓣动画均正常。
