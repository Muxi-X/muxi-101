"use client";

// 右栏装饰：两行竖排英文（CREATIVE / POWER）
//
// 设计稿里每行字由「实心黑字」+「空心描边字」两层同心同位叠成：
//   · 实心层 z-index 1 —— 压在人物之下，白底处为纯黑实心字；
//   · 描边层 z-index 3 —— 压在人物之上，与人重叠处只剩 2px 空心描边。
// 用「套壳 + rotate」而不是 writing-mode —— 后者会把拉丁字母整体躺倒。
//
// ⚠️ 这两行字是版式装饰，各组共用同一套（跟设计稿一致），不随组别换词。
//    位置见 intro.scss 的 .word--creative / .word--power，照设计稿量取。
//    这一页不放任何图片，右栏只有色条、竖排字、品牌色块三样装饰。
import React from "react";
import "./intro.scss";

const WORDS: [string, string] = ["CREATIVE", "POWER"];

function PanelWords() {
	const wordNode = (word: string, cls: string) => (
		<div className={`word ${cls}`} key={cls}>
			<span className="word__fill">{word}</span>
			<span className="word__stroke" aria-hidden="true">
				{word}
			</span>
		</div>
	);

	return (
		<>
			{wordNode(WORDS[0], "word--creative")}
			{wordNode(WORDS[1], "word--power")}
		</>
	);
}

export default PanelWords;
