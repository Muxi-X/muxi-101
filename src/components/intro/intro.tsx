"use client";

// 成员介绍页
//
// 版式基准 1440 × 900：左栏组别信息 + 右栏立绘，点「查看成员」后左栏收窄、
// 立绘左移，右侧滑入成员面板（每页 12 人，4 列 × 3 行，左右箭头 + 分页圆点）。
//
// 数据全部来自 ./member：姓名 / 简介 / 头像外链沿用 info.ts 原样，
// 其中安卓组已并入前端组（姓名带「（安卓）」后缀）。
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import groups from "./member";
import type { MemberCard as MemberCardData } from "./member";
import MemberCard from "./member-card";
import PanelWords from "./panel-words";
import "./intro.scss";

const PER_PAGE = 12;
const MIN_PAGES = 4; // 至少 4 个分页点，与设计稿一致

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

	const group = groups[groupIndex];
	// 页数只按实际人数算；空位留在最后一页，不循环补人
	const pageCount = Math.max(1, Math.ceil(group.members.length / PER_PAGE));
	// 分页点至少 MIN_PAGES 个（与设计稿的 4 个点一致）
	const dotCount = Math.max(MIN_PAGES, pageCount);
	const pagePos = Math.min(page, pageCount - 1);
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

	useEffect(() => {
		document.title = `${group.tag}组｜木犀工作室`;
	}, [group.tag]);

	const closeMembers = useCallback(() => setIsMembers(false), []);
	const goPage = useCallback(
		(step: number) => setPage((current) => (current + step + pageCount) % pageCount),
		[pageCount],
	);

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
		setGroupIndex((current) => (current + step + groups.length) % groups.length);
	};

	/* --------------------------------------------------------------------------
	   滚轮切换组别：320ms 内只响应一次，避免触控板一次滑动连跳多组
	   · 组别介绍页：只在左下角组别导航上响应（保留已验收的版式手感）
	   · 成员展示页：整页可滚 —— 换组后保持成员页展开，直接看到另一组的成员介绍
	   -------------------------------------------------------------------------- */
	const wheelLock = useRef(0);
	const onWheel = (event: React.WheelEvent<HTMLDivElement>) => {
		const el = event.target as HTMLElement | null;
		const onNav = !!el?.closest?.(".group-nav");
		if (!isMembers && !onNav) return;
		if (Math.abs(event.deltaY) < 2) return;
		const now = Date.now();
		if (now - wheelLock.current < 320) return;
		wheelLock.current = now;
		const step = event.deltaY > 0 ? 1 : -1; // 向下滚 = 看下一组 = 立绘向上走
		setGroupIndex((current) => (current + step + groups.length) % groups.length);
	};

	// 分隔线交点圆点：圆心要正好落在横竖两条线的交点上，并且要「随时跟着交点动」。
	//   横线 = .group-nav 的 border-top（位置随上方文案占几行走）
	//   竖线 = .panel-info 的 border-right（位置随左栏收窄而变）
	//
	// ⚠️ 横向不再"量了再摆"，改成把圆点挂进 .panel-info（见 intro.scss）：
	//   圆心永远贴着左栏右缘，左栏宽度的过渡自然带着它一起走，同一帧、同一曲线，
	//   结构上就不可能出现「交点先跑完、圆点再追上来」。
	//   之前试过 ResizeObserver（时机在绘制之后，慢一帧，偏差涨到 49px）、
	//   rAF 里写 CSS 变量（自定义属性要走一遍属性求值，仍差一帧）、
	//   rAF 里直接写 left（仍差一帧）—— 都不如让它跟交点共用同一个过渡。
	//
	// 纵向仍是量出来的：横线的 y 只跟文案占几行有关，很少变，所以量一次就够，
	// 另挂一个 ResizeObserver 兜住字体加载 / 换组导致的高度变化。
	const stageRef = useRef<HTMLDivElement>(null);
	useLayoutEffect(() => {
		const el = stageRef.current;
		if (!el) return;
		const nav = el.querySelector(".group-nav");
		if (!nav) return;

		const measure = () => {
			const stageBox = el.getBoundingClientRect();
			const navBox = nav.getBoundingClientRect();
			const borderTop = parseFloat(getComputedStyle(nav).borderTopWidth) || 0;
			// 横线中点（相对画板顶边）
			el.style.setProperty(
				"--divider-y",
				`${navBox.top - stageBox.top + borderTop / 2}px`,
			);
		};

		measure(); // useLayoutEffect 在绘制前跑，首帧就在交点上
		const observer = new ResizeObserver(measure);
		observer.observe(nav);
		observer.observe(el);
		return () => observer.disconnect();
	}, [groupIndex, isMembers]);

	return (
		<div
			className={`stage${isMembers ? " is-members" : ""}`}
			ref={stageRef}
			onWheel={onWheel}
		>
			{/* ============ 左：组别信息 ============ */}
			<section className="panel-info">
				<h1 className="group-title">{group.en}</h1>

				<p className="group-desc">{group.intro}</p>

				<p className="group-quote">{group.quote}</p>

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
										else setGroupIndex(index);
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
				    左栏宽度的过渡就自然带着它一起走（同一帧、同一曲线）。 */}
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
