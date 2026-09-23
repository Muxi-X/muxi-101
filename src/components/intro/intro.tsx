"use client";

// 成员介绍页
//
// 版式基准 1440 × 900：左栏组别信息 + 右栏立绘，点「查看成员」后左栏收窄、
// 立绘左移，右侧滑入成员面板（每页 12 人，4 列 × 3 行，左右箭头 + 分页圆点）。
//
// 数据全部来自 ./member：姓名 / 简介 / 头像外链沿用 info.ts 原样，
// 其中安卓组已并入前端组（姓名带「（安卓）」后缀）。
//
// 首页第三 section 接入：画板用 transform: scale 等比缩放到 section 内（见下方
// 缩放 effect），滚轮由本组件接管（组别展示态切组、成员面板态翻页），
// 并通过 preventDefault 阻止其继续触发首页的分页滚动。
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import groups from "./member";
import type { MemberCard as MemberCardData } from "./member";
import MemberCard from "./member-card";
import PanelWords from "./panel-words";
import "./intro.scss";

const PER_PAGE = 12;
	const MIN_PAGES = 4; // 至少 4 个分页点，与设计稿一致
	const GROUP_COUNT = groups.length; // 组别数（含安卓并入前端后）—— 模块常量，不随渲染变化

/**
 * 读回「这批动画整体结束」的时刻 = max(延迟 + 时长)，单位毫秒。
 *
 * ⚠️ 不能用 element.getAnimations()：CSS 过渡是「样式变化时」才被创建的，而这里
 *    刚挂上 .is-out / .is-in，过渡还没被创建（且当前帧尚未重新计算样式），
 *    getAnimations() 会返回空数组 → 时长算成 0 → 出场/入场被压成一帧闪过。
 *    实测：挂类后立刻读 getAnimations() 拿到 0 个动画，而 computed 的过渡时长是 0.2s。
 *
 * 所以直接读 computed 的时长与延迟：
 *   · 出场用 transition-duration / transition-delay（元素上就有，与是否已开始无关）；
 *   · 入场用 animation-duration / animation-delay。
 * 两者都按「CSS 里怎么写就怎么算」，prefers-reduced-motion 改了时长这边也自动跟上。
 * transitionDelay 会返回每个属性一个值（transform 与 opacity 同值），取最大值即可。
 */
/** 把 CSS 时间列表（"0.2s, 0.2s" / "40ms"）换算成毫秒数组 */
function toMsList(value: string): number[] {
	return value
		.split(",")
		.map((item) => {
			const text = item.trim();
			return text.endsWith("ms") ? Number.parseFloat(text) : Number.parseFloat(text) * 1000;
		})
		.filter((item) => Number.isFinite(item));
}

function longestMs(durations: string, delays: string): number {
	const list = toMsList(durations);
	if (!list.length) return 0;
	const delayList = toMsList(delays);
	return Math.max(...list) + Math.max(0, ...(delayList.length ? delayList : [0]));
}

/** 出场（过渡）整体时长 */
function outPhaseMs(elements: HTMLElement[]): number {
	return Math.max(
		0,
		...elements.map((element) => {
			const style = getComputedStyle(element);
			return longestMs(style.transitionDuration, style.transitionDelay);
		}),
	);
}

/** 入场（关键帧动画）整体时长 */
function inPhaseMs(elements: HTMLElement[]): number {
	return Math.max(
		0,
		...elements.map((element) => {
			const style = getComputedStyle(element);
			return longestMs(style.animationDuration, style.animationDelay);
		}),
	);
}

/**
 * 取第 pageIndex 页的 12 格：从左到右、从上到下依次摆放。
 * ⚠️ 不循环补位 —— 人数不足一页时空位就空着，不许拿前面出现过的人重复填。
 *    空位用 null 占住格子，网格的行列位置才不会串。
 */
function slicePage(list: MemberCardData[], pageIndex: number): (MemberCardData | null)[] {
	return Array.from(
		{ length: PER_PAGE },
		(_, slot) => list[pageIndex * PER_PAGE + slot] ?? null,
	);
}

function Intro() {
	const [groupIndex, setGroupIndex] = useState(0);
	const [isMembers, setIsMembers] = useState(false);
	const [page, setPage] = useState(0);
	const [swapping, setSwapping] = useState(false);
	const [scale, setScale] = useState(1);
	/* 标题的显示状态由 React 持有 —— 这让「谁能改标题」只有一个主人。
	   ⚠️ 踩过的坑：原来由 layout effect 直接写 title.textContent / 拆字母，
	   而 React 那边还认为标题里是旧词。于是每次重新渲染（换组会顺带 setPage、setSwapping），
	   React 都会把字母清掉 —— 入场动画刚跑起来就被自己的渲染打断，
	   表现就是「滑过去先空一块再出现」，而且是竞态、时好时坏。
	   现在 React 负责**结构**（纯文本还是逐字母），effect 只负责**时机与类名**，
	   两边不再争同一个 DOM。 */
	const [titleLetters, setTitleLetters] = useState<string[]>(() => [...groups[0].en]);
	const group = groups[groupIndex];
	// 页数只按实际人数算；空位留在最后一页，不循环补人
	const pageCount = Math.max(1, Math.ceil(group.members.length / PER_PAGE));
	// 分页点至少 MIN_PAGES 个（与设计稿的 4 个点一致）
	const dotCount = Math.max(MIN_PAGES, pageCount);
	const pagePos = Math.min(page, pageCount - 1);
	// 引言：收尾的引号要单独占一行 —— 拆出正文（并削掉尾随换行，否则引号前会多一整个空行）
	const quoteBody = group.quote.replace(/\n?”$/, "").replace(/\s+$/, "");
	const quoteEnd = group.quote.endsWith("”");
	const pagesOfCards = useMemo(
		() => Array.from({ length: pageCount }, (_, i) => slicePage(group.members, i)),
		[group.members, pageCount],
	);

	// 换组时把分页收回到第一页
	useEffect(() => {
		setPage(0);
	}, [groupIndex]);

	// 成员页内换组：卡片区先淡出 180ms 再换内容，避免 12 张卡生硬跳变
	useEffect(() => {
		if (!isMembers) return;
		setSwapping(true);
		const timer = setTimeout(() => setSwapping(false), 180);
		return () => clearTimeout(timer);
	}, [groupIndex, isMembers]);

	const closeMembers = useCallback(() => setIsMembers(false), []);
	const goPage = useCallback(
		(step: number) => setPage((current) => (current + step + pageCount) % pageCount),
		[pageCount],
	);

	/* --------------------------------------------------------------------------
	   换组别：把「从哪来、往哪去」一起记下来，供文字动效定方向（见下面的文字切换 effect）。

	   方向规则（跟设计稿一致）：
	     · 滚轮 / 键盘是确定的单步：dir 取步进方向，只有从首 / 末组越界那一步才算环绕；
	     · 点击导航是任意跳转：取最短路径方向，不算环绕；
	     · 环绕那一步没有有意义的线性方向 → 记 0，退化为纯淡入淡出。
	   ⚠️ 不能用「环形距离 raw === n - 1」判环绕 —— 后退一步的 raw 也正好是 n - 1，
	      那样每一次后退都会被误判成环绕，方向感会整个消失。
	   -------------------------------------------------------------------------- */
	const groupIndexRef = useRef(0);
	const dirRef = useRef(0);
	const changeGroup = useCallback((target: number, dirHint: number) => {
		const from = groupIndexRef.current;
		const n = GROUP_COUNT;
		const next = ((target % n) + n) % n;
		const stepDir = dirHint > 0 ? 1 : dirHint < 0 ? -1 : 0;

		let dir: number;
		let wrap: boolean;
		if (stepDir) {
			dir = stepDir;
			wrap = (stepDir === 1 && from === n - 1) || (stepDir === -1 && from === 0);
		} else {
			// 最短路径（负数取模要补回正区间）
			const raw = (((next - from) % n) + n) % n;
			dir = raw > n / 2 ? -1 : 1;
			wrap = false;
		}
		// ref 是同步写的：一轮里连点两次也不会读到过期值
		groupIndexRef.current = next;
		dirRef.current = wrap ? 0 : dir;
		setGroupIndex(next);
	}, []);

	/* --------------------------------------------------------------------------
	   组别文字切换动效：标题逐字母级联 + 正文方向性淡入淡出
	   · 逐字母而非整块：组名墨迹宽 Design 334 ↔ Operations 535，差 202。整块淡入淡出时
	     眼睛会去比较两个宽度不同的色块；拆成字母各自进出，长度差就消失了。
	   · 一个节点只能装一段文字，所以必须是两段接力：
	       .is-out（送走旧词）→ 换字 → .is-in（起始帧 + 入场）
	   · 两段的时长不写死常量，而是从 DOM 读回（见 outPhaseMs）——
	     prefers-reduced-motion 一改 CSS，这边的节奏自动跟上，不会失配。
	   · 首帧不播：初始渲染本来就是终态，重播一遍等于凭空闪一下。

	   ⚠️ 必须用 useLayoutEffect，不能用 useEffect（实测踩过）：
	   React 提交新组名是「画完才轮到 useEffect」，于是浏览器会先画出一帧**静态的新组名**，
	   动效才开始 —— 肉眼就是「先静态 B → 再动态 B → 再静态 B」。
	   实测帧序：t=90ms 时 DOM 已是 <span class="group-title__text">Frontend</span> 且
	   没有任何 is-out / is-in，t=111ms 才拆成字母开始出场。
	   useLayoutEffect 在提交后、绘制前同步跑，先把字母拆好并挂上 .is-out，
	   这一帧就已经是出场起始态，静态的新组名一帧都不会露出来。
	   -------------------------------------------------------------------------- */
	const titleRef = useRef<HTMLSpanElement>(null);
	const titleBoxRef = useRef<HTMLHeadingElement>(null);
	const descRef = useRef<HTMLParagraphElement>(null);
	const quoteRef = useRef<HTMLParagraphElement>(null);
	/* 已经播报过的那一组（用于跳过重复触发、以及取「出场要送走的旧词」）。
	   null = 还没播过任何一次（首帧只登记，不播）。 */
	const shownGroupRef = useRef<number | null>(null);
	const textTokenRef = useRef(0); // 连滚时「最后一次目标获胜」，不排队
	const swapTimerRef = useRef(0);
	const unwrapTimerRef = useRef(0);
	const outFrameRef = useRef(0);

	useLayoutEffect(() => {
		const stage = stageRef.current;
		const title = titleRef.current;
		// 状态类挂在 h1.group-title 上（与设计稿一致）——
		// 出场/入场的 CSS 选择器都是 .group-title.is-out / .is-in，挂在里面那层 span
		// 上就一条也匹配不到，动效会静默失效。
		const titleBox = titleBoxRef.current;
		const desc = descRef.current;
		const quote = quoteRef.current;
		if (!stage || !title || !titleBox || !desc || !quote) return;

		// 首帧只登记，不播
		if (shownGroupRef.current === null) {
			shownGroupRef.current = groupIndex;
			return;
		}
		if (shownGroupRef.current === groupIndex) return;
		// 出场要送走的是**旧词**，先把上一组记下来再更新指针
		const prevTitle = groups[shownGroupRef.current].en;
		shownGroupRef.current = groupIndex;

		const token = ++textTokenRef.current;
		const blocks: HTMLElement[] = [desc, quote];
		const copy = groups[groupIndex];

		// 方向由 .stage 上的一个变量统一驱动，字母与正文块一起继承
		stage.style.setProperty("--txt-dir", String(dirRef.current));

		/* 1) 出场 —— 送走的是**旧词**。
		   ⚠️ 字母 span 是**常驻**结构（React 一直按 titleLetters 渲染逐字母），
		   换组只换文字内容、不重建元素。这一点是出场过渡能成立的关键：
		   transition 需要「元素先以基础态存在过一帧，再发生样式变化」，
		   若是在挂 .is-out 的同一帧才把字母建出来，它们会**以 opacity: 0 出生**，
		   根本没有可过渡的前值 —— 实测就是这样：标题一刀切、旧词直接消失，
		   看起来正是「A 没了，然后才出现 B」（空白一小会）。
		   常驻 + 只换内容后，出场从 opacity: 1 平滑降到 0，再接力入场。 */
		setTitleLetters([...prevTitle]);

		/* 让「基础态」先落定一帧，再挂 .is-out。
		   本函数在 commit 之后、绘制之前同步跑；如果在这里立刻加类，
		   transition 的起始值就是新算出来的目标值，过渡会被跳过。 */
		void title.offsetWidth;
		outFrameRef.current = window.requestAnimationFrame(() => {
			if (token !== textTokenRef.current) return;
			titleBox.classList.remove("is-in");
			titleBox.classList.add("is-out");
			for (const block of blocks) {
				block.classList.remove("is-in");
				block.classList.add("is-out");
			}
		});

		/* 出场整体时长：跟设计稿一样「从 DOM 读回」，不写死常量。
		   读的是 computed 的 transition-duration / transition-delay（见 outPhaseMs），
		   prefers-reduced-motion 一改 CSS 这里的节奏自动跟上。
		   不要人为提前触发：提前换字会在出场没铺完时就把旧字换掉，
		   露出的空档正是「A → 空白 → B」。 */
		const outMs = outPhaseMs([...title.children, ...blocks] as HTMLElement[]);
		swapTimerRef.current = window.setTimeout(() => {
			if (token !== textTokenRef.current) return; // 期间又换了目标，交给后来者接管

			/* 2) 换字（此刻文字已完全不可见，换内容不会被看见）。
			   结构和文本都交给 React：它把字母换成新词的逐字母，不存在
			   「React 认为里面是旧词、于是下帧把字母清掉」的打架。 */
			setTitleLetters([...copy.en]);
			desc.textContent = copy.intro;
			// 收尾的引号单独占一行；前面的换行要一并削掉，否则会在引号前多留一整个空行
			quote.textContent = copy.quote.replace(/\n?”$/, "").replace(/\s+$/, "");
			if (copy.quote.endsWith("”")) {
				const end = document.createElement("span");
				end.className = "quote-end";
				end.textContent = "”";
				quote.appendChild(end);
			}

			/* 3) 入场 */

			titleBox.classList.remove("is-out");
			titleBox.classList.add("is-in");
			for (const block of blocks) {
				block.classList.remove("is-out");
				block.classList.add("is-in");
			}

			/* 入场结束后摘掉 is-in，标题留在基础态。
			   ⚠️ 字母是常驻结构，这里**不要**再把标题换成纯文本 ——
			   一换就会重建元素，下一次出场的过渡又会因为「新元素没有前值」而失效。 */
			const inMs = inPhaseMs([...title.children, ...blocks] as HTMLElement[]);
			unwrapTimerRef.current = window.setTimeout(
				() => {
					if (token !== textTokenRef.current) return;
					titleBox.classList.remove("is-in");
					for (const block of blocks) block.classList.remove("is-in");
				},
				inMs + 40,
			);
		}, outMs);

		/* 卸载 / 再次换组：停掉在途的定时器与帧回调，别让旧节奏接着跑。
		   ⚠️ 清理必须把 .is-in 摘掉再走人：
		   入场动画用的是 animation-fill-mode: backwards，只要 .is-in 还挂着、
		   动画又没跑完（被打断），元素就停在第 0 帧（opacity: 0）。
		   定时器被 clearTimeout 掉之后没人再摘这个类 —— 旧词就永久留在全透明状态，
		   视觉上正是「滑过去先空一块，然后才出现新字」。 */
		return () => {
			window.clearTimeout(swapTimerRef.current);
			window.clearTimeout(unwrapTimerRef.current);
			cancelAnimationFrame(outFrameRef.current);
			titleBox.classList.remove("is-in");
			for (const block of blocks) block.classList.remove("is-in");
		};
	}, [groupIndex]);

	// Esc 关闭成员面板
	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") closeMembers();
		};
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [closeMembers]);

	// 左下角导航的 ↑↓ / ←→ 换组（跟设计稿一样只挂在导航上，不抢整页的方向键）
	const onNavKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
		const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
		if (!step) return;
		event.preventDefault();
		changeGroup(groupIndexRef.current + step, step);
	};

	/* --------------------------------------------------------------------------
	   画板等比缩放：1440×900 画板自适应铺满第三 section，余白由 section 的 flex 居中兜住。
	   用 JS 算 scale —— CSS 不能把两个长度相除成无单位的缩放系数；监听 section 尺寸变化。
	   -------------------------------------------------------------------------- */
	const stageRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = stageRef.current;
		if (!el) return;
		const host = el.parentElement;
		if (!host) return;
		const update = () => {
			setScale(Math.min(host.clientWidth / 1440, host.clientHeight / 900));
		};
		update();
		const observer = new ResizeObserver(update);
		observer.observe(host);
		window.addEventListener("resize", update);
		return () => {
			observer.disconnect();
			window.removeEventListener("resize", update);
		};
	}, []);

	/* --------------------------------------------------------------------------
	   分隔线交点圆点的纵向基准：圆心必须**时刻**落在横线（.group-nav 的 border-top）
	   中点上。横线的位置由上方文案占几行决定，而文案会在这些时候变：
	     · 换组（简介 / 引言长短不同）
	     · 成员面板开合（`.is-members` 把简介、引言压成 opacity: 0，但换组时它们的
	       内容长度仍会变）
	     · 字体加载完成（中文字体度量一换，行高就变）

	   ⚠️ 曾经的坑：原来只在 effect 里量一次 + 挂 ResizeObserver。
	   ResizeObserver 只在**尺寸**变化时触发，而这里横线是**整体位移**、自身尺寸没变，
	   所以它一次都不响 —— 实测换组后圆点会停在上一次的位置，纵向偏 26px 才被发现。
	   这类「量一次」的做法只要漏掉任何一个触发源就会留下固定偏差，不如每帧对齐。

	   ⚠️ 也不要再用 getBoundingClientRect 再除以 scale：画板整体挂了 transform: scale，
	   rect 是缩放后的坐标，除以 scale 会引入浮点误差（实测残留 0.26px）。
	   .stage 与 .group-nav 之间没有别的 transform，所以直接用布局坐标系的
	   offsetTop / offsetHeight 就是**精确无缩放**的画板坐标（1rem = 1 画板像素）。
	   半径 15px = 0.9375rem 由 CSS 减掉，这里只给横线中点。
	   -------------------------------------------------------------------------- */
	useLayoutEffect(() => {
		const stage = stageRef.current;
		if (!stage) return;
		const nav = stage.querySelector<HTMLElement>(".group-nav");
		if (!nav) return;

		let last = -1;
		let frame = 0;
		const tick = () => {
			// 横线中点：border-top 5px 在 offsetTop 之上，故取 offsetTop + 2.5
			const centerY = nav.offsetTop + 2.5;
			if (centerY !== last) {
				last = centerY;
				stage.style.setProperty("--divider-y", `${centerY}px`);
			}
			frame = requestAnimationFrame(tick);
		};
		tick();

		return () => cancelAnimationFrame(frame);
	}, []);

	/* --------------------------------------------------------------------------
	   滚轮控制权：进入第三页后由 Member 接管，阻止滚轮继续触发首页 section 分页滚动。
	   用原生非 passive 监听器 —— React 的 onWheel 是 passive 的，preventDefault 不生效。
	   监听挂在 section（stage 的父级）上，连左右留白也一并接管。

	   命中区域（决定这一滚是"翻成员页"还是"切组别"）：
	     · 成员面板打开时，只有落在「成员展示区域」里才翻页 ——
	       左边界 = 左箭头，右边界 = 右箭头，上界 = Our Group Member，
	       下界 = 分页圆点再往下一点。
	     · 其余任何位置（包括成员态下左栏蓝点为原点的第三象限那块）都只切组别。
	     · 成员面板没打开时：不管在哪滚都只切组别。

	   边界放行：组别切到首/末组、或成员页翻到首/末页后，继续朝那个方向滚就 return，
	   把滚轮交还给首页，自然滑到上一个 / 下一个 section —— 否则会卡死在第三页出不去。
	   -------------------------------------------------------------------------- */
	const wheelLock = useRef(0);
	// 成员展示区域的包围盒（画板坐标，不含 scale）。null = 还没量到。
	const memberZone = useRef<{ l: number; t: number; r: number; b: number } | null>(null);

	useLayoutEffect(() => {
		const el = stageRef.current;
		if (!el) return;

		const measure = () => {
			const stageBox = el.getBoundingClientRect();
			// 除以 scale 换算回画板自身的坐标系
			const s = stageBox.width / el.offsetWidth || 1;
			const pick = (sel: string) => el.querySelector<HTMLElement>(sel);
			const title = pick(".members-title");
			const prev = pick(".members-arrow--prev");
			const next = pick(".members-arrow--next");
			const dots = pick(".members-dots");
			if (!title || !prev || !next || !dots) return;

			const rel = (node: HTMLElement) => {
				const r = node.getBoundingClientRect();
				return {
					l: (r.left - stageBox.left) / s,
					t: (r.top - stageBox.top) / s,
					r: (r.right - stageBox.left) / s,
					b: (r.bottom - stageBox.top) / s,
				};
			};

			const tb = rel(title);
			const pb = rel(prev);
			const nb = rel(next);
			const db = rel(dots);
			// 下界：圆点再往下一点（4.5rem ≈ 72px，够松，不会让"下方一点点"掉出去）
			memberZone.current = {
				l: Math.min(pb.l, db.l),
				t: tb.t,
				r: Math.max(nb.r, db.r),
				b: db.b + 4.5 * 16 * (el.offsetWidth / 1440),
			};
		};

		// ⚠️ 面板在未展开时被 translateX(7.5rem) 推到画板外，此时量到的包围盒是偏的；
		//    展开 / 收起各有 0.78s 过渡，所以要等过渡走完再量，否则命中区会整体右移 120px。
		measure();
		const settle = setTimeout(measure, 900);
		const observer = new ResizeObserver(measure);
		observer.observe(el);
		return () => {
			clearTimeout(settle);
			observer.disconnect();
		};
	}, [isMembers, scale]);

	useEffect(() => {
		const el = stageRef.current;
		if (!el) return;
		const host = el.parentElement;
		if (!host) return;

		/** 鼠标是否落在「成员展示区域」里 */
		const inMemberZone = (clientX: number, clientY: number) => {
			const zone = memberZone.current;
			if (!zone) return false;
			const stageBox = el.getBoundingClientRect();
			const s = stageBox.width / el.offsetWidth || 1;
			const x = (clientX - stageBox.left) / s;
			const y = (clientY - stageBox.top) / s;
			return x >= zone.l && x <= zone.r && y >= zone.t && y <= zone.b;
		};

		// 放行：把这一滚交给首页 —— 换到上一 / 下一个 section。
		// ⚠️ 不能只 return：拦截 wheel 时调了 preventDefault，浏览器不会再去滚容器，
		//    页面就"卡住不动"了（实测 scrollTop 纹丝不动）。
		// ⚠️ 也不能 scrollBy 一小段：.home 是 scroll-snap-type: y proximity，
		//    滚出去一点点会被 snap 吸回原处、等于没动（实测也是纹丝不动）。
		//    所以直接定位到相邻的 .home-section —— snap 的吸附点就是它，必然生效。
		const pageScroll = (deltaY: number) => {
			const sections = Array.from(
				document.querySelectorAll<HTMLElement>(".home > .home-section"),
			);
			if (sections.length < 2) return;
			// 当前所在 section：取最后一个「顶边在视口上半部」的
			let current = 0;
			sections.forEach((node, i) => {
				if (node.getBoundingClientRect().top <= window.innerHeight / 2) current = i;
			});
			const target = current + (deltaY > 0 ? 1 : -1);
			if (target < 0 || target > sections.length - 1) return;
			sections[target].scrollIntoView({
				behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
					? "auto"
					: "smooth",
				block: "start",
			});
		};

		const onWheel = (event: WheelEvent) => {
			if (Math.abs(event.deltaY) < 2) return; // 微小抖动：不处理，也不拦默认
			const step = event.deltaY > 0 ? 1 : -1;
			const now = Date.now();

			// 放行时也走同一个节流：否则快速滚轮会在边界处连跳好几个 section
			const passThrough = () => {
				event.preventDefault();
				if (now - wheelLock.current < 320) return;
				wheelLock.current = now;
				pageScroll(event.deltaY);
			};

			// 成员面板打开 + 鼠标在成员展示区域内 → 翻成员页；其余一律切组别
			const flipping = isMembers && inMemberZone(event.clientX, event.clientY);

			if (flipping) {
				const nextPage = page + step;
				if (nextPage < 0 || nextPage > pageCount - 1) {
					// 到成员首页/末页：放行给首页，滑到上一个 / 下一个 section
					passThrough();
					return;
				}
				event.preventDefault();
				if (now - wheelLock.current < 320) return;
				wheelLock.current = now;
				setPage(nextPage);
				return;
			}

			const nextGroup = groupIndex + step;
			if (nextGroup < 0 || nextGroup > GROUP_COUNT - 1) {
				// 到首/末组：放行给首页
				passThrough();
				return;
			}
			event.preventDefault();
			if (now - wheelLock.current < 320) return;
			wheelLock.current = now;
			changeGroup(nextGroup, step);
		};

		host.addEventListener("wheel", onWheel, { passive: false });
		return () => host.removeEventListener("wheel", onWheel);
	}, [isMembers, pageCount, groupIndex, page, changeGroup]);

	return (
		<div
			className={`stage${isMembers ? " is-members" : ""}`}
			ref={stageRef}
			style={{ transform: `scale(${scale})` }}
		>
			{/* ============ 左：组别信息 ============ */}
			<section className="panel-info">
				{/* ⚠️ 标题的**结构**由 React 持有，effect 只负责时机与类名。
				    切组时 React 先渲染逐字母的 <span class="lt">（--i 供 CSS 算阶梯延迟），
				    入场播完再还原成纯文本（逐字母 inline-block 会丢跨元素的字偶距）。
				    若让 effect 直接改这里的孩子，React 下一次渲染就会把字母清掉 ——
				    入场动画会被自己的渲染打断，表现为「滑过去先空一块」。
				    is-out / is-in 状态类挂在 h1 上，与设计稿的选择器一致。 */}
				<h1 className="group-title" ref={titleBoxRef}>
					<span className="group-title__text" ref={titleRef}>
						{titleLetters.map((character, index) => (
							// 逐字母渲染：--i 给 CSS 算阶梯延迟，故需要下标
							<span className="lt" style={{ "--i": index } as React.CSSProperties} key={index}>
								{character}
							</span>
						))}
					</span>
				</h1>

				<p className="group-desc" ref={descRef}>
					{group.intro}
				</p>

				<p className="group-quote" ref={quoteRef}>
					{quoteBody}
					{quoteEnd && <span className="quote-end">”</span>}
				</p>

				<button
					className="group-link"
					type="button"
					aria-controls="memberPanel"
					aria-expanded={isMembers}
					onClick={() => setIsMembers(true)}
				>
					查看成员
				</button>

				<nav className="group-nav" aria-label="组别导航" onKeyDown={onNavKeyDown}>
					<ul>
						{groups.map((item, index) => (
							<li key={item.tag} className={index === groupIndex ? "is-active" : ""}>
								<a
									href="#"
									aria-current={index === groupIndex ? "page" : undefined}
									onClick={(event) => {
										event.preventDefault();
										// 点已选中的组＝回到组别介绍
										if (index === groupIndex) closeMembers();
										else changeGroup(index, 0); // 0 = 任意跳转，方向取最短路径
									}}
								>
									{item.tag}组
								</a>
							</li>
						))}
					</ul>
				</nav>

				{/* 分隔线交点圆点：点击在「组别介绍 ⇄ 成员介绍」之间切换。
				    ⚠️ 必须放在 .panel-info 里面：圆心靠 CSS 钉在左栏右缘，
				    左栏宽度的过渡就自然带着它一起走（同一帧、同一曲线），
				    不会出现「交点先动、圆点再追上去」。 */}
				<button
					className="divider-dot"
					type="button"
					aria-label={isMembers ? "返回组别介绍" : "查看成员"}
					aria-controls="memberPanel"
					aria-expanded={isMembers}
					onClick={() => setIsMembers((open) => !open)}
				/>
			</section>

			{/* ============ 右：竖排英文装饰 ============ */}
			<section className="panel-art">
				<div className="art-bar">
					<i className="bar-yellow" />
					<i className="bar-black" />
				</div>

				<PanelWords />

				{/* 组别角色立绘：与组名一一对应，摆在 CREATIVE / POWER 下方。
				    ⚠️ 图上不带任何文字 —— index-1 的立绘本身就是纯画面，
				    不要再往上面叠组名之类的字。 */}
				{group.art ? (
					<img
						className="panel-char"
						key={group.tag}
						src={group.art}
						alt={`${group.tag}组角色形象`}
						draggable={false}
					/>
				) : null}

				<div className="art-swatches">
					<i className="sw-purple" />
					<i className="sw-black" />
					<i className="sw-yellow" />
				</div>
			</section>

			{/* ============ 成员介绍：点「查看成员」后滑入 ============ */}
			<section
				id="memberPanel"
				className="panel-members"
				aria-label={`${group.tag}组成员介绍`}
				aria-hidden={!isMembers}
			>
				<h2 className="members-title">Our Group Member</h2>

				<div className={`members-viewport${swapping ? " is-swapping" : ""}`}>
					<div
						className="members-track"
						style={{
							["--pages" as string]: pageCount,
							// 整条轨道宽 = 页数 × 100%，所以翻一页 = 左移 100 / 页数 %
							transform: `translateX(${(-100 * pagePos) / pageCount}%)`,
						}}
					>
						{pagesOfCards.map((pageCards, pageIndex) => (
							<div className="members-page" key={pageIndex}>
								{pageCards.map((member, slot) =>
									member ? (
										<MemberCard
											member={member}
											key={`${pageIndex}-${slot}-${member.name}`}
										/>
									) : (
										// 空位：占住格子，保持从左到右 / 从上到下的顺序
										<span
											className="member-slot"
											key={`${pageIndex}-${slot}-empty`}
											aria-hidden="true"
										/>
									),
								)}
							</div>
						))}
					</div>
				</div>

				<button
					className="members-arrow members-arrow--prev"
					type="button"
					aria-label="上一页成员"
					onClick={() => goPage(-1)}
				>
					<svg viewBox="0 0 8 17" fill="none" aria-hidden="true">
						<path d="M7.5-.5 1 8.5l6.5 9" stroke="currentColor" strokeWidth="1.1" />
					</svg>
				</button>
				<button
					className="members-arrow members-arrow--next"
					type="button"
					aria-label="下一页成员"
					onClick={() => goPage(1)}
				>
					<svg viewBox="0 0 8 17" fill="none" aria-hidden="true">
						<path d="M.5-.5 7 8.5.5 17.5" stroke="currentColor" strokeWidth="1.1" />
					</svg>
				</button>

				<div className="members-dots">
					{Array.from({ length: dotCount }, (_, index) => (
						<button
							key={index}
							type="button"
							// 点满 MIN_PAGES 个点；内容不够时多出来的点禁用（没有那一页）
							disabled={index >= pageCount}
							className={index === pagePos ? "is-active" : ""}
							aria-label={`第 ${index + 1} 页成员`}
							aria-current={index === pagePos}
							onClick={() => setPage(index)}
						>
							<i />
						</button>
					))}
				</div>
			</section>
		</div>
	);
}

export default Intro;
