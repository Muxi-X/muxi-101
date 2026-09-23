"use client";

// 右栏装饰：两行竖排英文
//
// 设计稿里每行字由「实心黑字」+「空心描边字」两层同心同位叠成：
//   · 实心层 z-index 1 —— 压在人物之下，白底处为纯黑实心字；
//   · 描边层 z-index 3 —— 压在人物之上，与人重叠处只剩 2px 空心描边。
// 用「套壳 + rotate」而不是 writing-mode —— 后者会把拉丁字母整体躺倒。
//
// 词随组别走（见 member.ts 的 WORDS），位置规则：
//   · 第一行（.word--creative）落在左上，位置写死在 CSS 里；
//   · 第二行（.word--power）末字母下缘贴画布底边 —— 旋转后「横向长度」就是
//     「纵向高度」，不同词长度差得远（SWIFT 276 / INTUITIVE 446），
//     所以 top 必须按词量出来算，不能写死。这里用 canvas 按同一个字体量宽。
import React, { useMemo } from "react";
import "./intro.scss";

/** 竖排字的字号 / 字距，与 intro.scss 的 .word__fill 保持一致 */
const FONT_SIZE = 94;
const LETTER_SPACING = 1.2;
/** 画板高度（.stage 的 900）与实测基线余量 */
const CANVAS_HEIGHT = 900;
/** 实测：墨迹下缘会落在 top + 量宽 + 2 处，这里把这 2px 扣掉，正好贴底 */
const BASELINE_SLACK = -2;

let context: CanvasRenderingContext2D | null | undefined;

/** 量一行英文的墨迹宽度（= 竖排后的纵向长度） */
function measureWord(word: string): number | null {
	if (context === undefined) {
		context = document.createElement("canvas").getContext("2d");
	}
	if (!context) return null;
	context.font = `700 ${FONT_SIZE}px "Microsoft YaHei", "Microsoft YaHei UI", "MSYH", Arial, sans-serif`;
	// letter-spacing 由 CSS 逐字加上，canvas 的 measureText 不含它，自己补
	return context.measureText(word).width + LETTER_SPACING * Math.max(0, word.length - 1);
}

interface PanelWordsProps {
	/** [左上那行, 右下那行] */
	words: [string, string];
}

function PanelWords({ words }: PanelWordsProps) {
	const endAnchoredStyle = useMemo(() => {
		const length = measureWord(words[1]);
		if (length === null || !Number.isFinite(length)) return undefined;
		return { "--word-top": `${CANVAS_HEIGHT - length + BASELINE_SLACK}px` } as React.CSSProperties;
	}, [words]);

	const wordNode = (word: string, cls: string, style?: React.CSSProperties) => (
		<div className={`word ${cls}`} key={cls} style={style}>
			<span className="word__fill">{word}</span>
			<span className="word__stroke" aria-hidden="true">
				{word}
			</span>
		</div>
	);

	return (
		<>
			{wordNode(words[0], "word--creative")}
			{wordNode(words[1], "word--power", endAnchoredStyle)}
		</>
	);
}

export default PanelWords;
