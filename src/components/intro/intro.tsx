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
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import groups from "./member";
import type { MemberCard as MemberCardData } from "./member";
import MemberCard from "./member-card";
import PanelWords from "./panel-words";
import "./intro.scss";

const PER_PAGE = 12;
const MIN_PAGES = 4; // 至少 4 个分页点，与设计稿一致
const GROUP_COUNT = groups.length; // 组别数（含安卓并入前端后）—— 模块常量，不随渲染变化

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
	   滚轮控制权：进入第三页后由 Member 接管，阻止滚轮继续触发首页 section 分页滚动。
	   · 组别展示态：滚轮切换组别；
	   · 成员面板打开：滚轮翻成员页。
	   · 边界放行：切到首组/末组（或成员首页/末页）后，继续朝那个方向滚就放行给首页，
	     自然滑到上一个 / 下一个 section —— 否则会卡死在第三页出不去。
	   监听挂在 section（stage 的父级）上，连左右留白也一并接管。
	   用原生非 passive 监听器 —— React 的 onWheel 是 passive 的，preventDefault 不生效。
	   -------------------------------------------------------------------------- */
	const wheelLock = useRef(0);

	useEffect(() => {
		const el = stageRef.current;
		if (!el) return;
		const host = el.parentElement;
		if (!host) return;
		const onWheel = (event: WheelEvent) => {
			if (Math.abs(event.deltaY) < 2) return; // 微小抖动：不处理，也不拦默认
			const step = event.deltaY > 0 ? 1 : -1;

			// 滚动方向上的边界：放行给首页，让滚轮切到上一个 / 下一个 section
			const atBoundary = isMembers
				? (step < 0 && page === 0) || (step > 0 && page === pageCount - 1)
				: (step < 0 && groupIndex === 0) || (step > 0 && groupIndex === GROUP_COUNT - 1);
			if (atBoundary) return;

			event.preventDefault(); // 非边界：接管滚轮，别让首页跟着翻页
			const now = Date.now();
			if (now - wheelLock.current < 320) return; // 320ms 内只响应一次，防触控板连跳
			wheelLock.current = now;

			if (isMembers) {
				setPage((current) => (current + step + pageCount) % pageCount);
			} else {
				setGroupIndex((current) => (current + step + GROUP_COUNT) % GROUP_COUNT);
			}
		};
		host.addEventListener("wheel", onWheel, { passive: false });
		return () => host.removeEventListener("wheel", onWheel);
	}, [isMembers, pageCount, groupIndex, page]);

	return (
		<div
			className={`stage${isMembers ? " is-members" : ""}`}
			ref={stageRef}
			style={{ transform: `scale(${scale})` }}
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
			</section>

			{/* ============ 右：竖排英文装饰 ============ */}
			<section className="panel-art">
				<div className="art-bar">
					<i className="bar-yellow" />
					<i className="bar-black" />
				</div>

				<PanelWords />

				<div className="art-swatches">
					<i className="sw-purple" />
					<i className="sw-black" />
					<i className="sw-yellow" />
				</div>
			</section>

			{/* 分隔线交点圆点：点击在「组别介绍 ⇄ 成员介绍」之间切换 */}
			<button
				className="divider-dot"
				type="button"
				aria-label={isMembers ? "返回组别介绍" : "查看成员"}
				aria-controls="memberPanel"
				aria-expanded={isMembers}
				onClick={() => setIsMembers((open) => !open)}
			/>

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
