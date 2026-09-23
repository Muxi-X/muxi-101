// 成员介绍页的数据整理层
//
// 数据来源：./info —— 历届成员（照片 / 姓名 / 职务 / 简介），不改动任何原始内容。
//
// 只做「取用 + 换算」：
//   · 照片：直接沿用 info.ts 里的外链，不下载、不转存
//   · 徽章：把原始 position 当作徽章文案（「组长 / 主管」用主笔色，其余用组员色）
//   · 简介：原始 intro 原样展示，卡片里最多显示两行
//
// ⚠️ 两处整理：
//   1. 安卓组不单独成组，全部并入前端组，并在姓名后缀「（安卓）」；
//   2. 组别介绍语与引言（quote）按设计稿补上，见下方 COPY。
import info from "./info";

export interface MemberCard {
	/** 姓名（安卓组会带「（安卓）」后缀） */
	name: string;
	/** 徽章文案 */
	badge: string;
	/** 徽章是否用主笔色（组长 / 主管） */
	lead: boolean;
	/** 一句话简介 */
	intro: string;
	/** 头像外链 */
	photo: string;
}

export interface MemberGroup {
	/** 中文组名，与底部导航一致 */
	tag: string;
	/** 组名英文（左栏大字） */
	en: string;
	/** 组别简介 */
	intro: string;
	/** 组别引言（收尾引号单独一行，见 .quote-end） */
	quote: string;
	/** 成员列表 */
	members: MemberCard[];
}

/** 安卓组并入的组名与姓名后缀 */
const MERGE_INTO = "前端";
const MERGE_TAG = "安卓";
const MERGE_SUFFIX = "（安卓）";

/** 组名 → 英文名 + 组别简介 / 引言 */
const COPY: Record<string, { en: string; intro: string; quote: string }> = {
	设计: {
		en: "Design",
		intro:
			"负责团队内部的 UI 设计与平面设计，追求优秀的审美与精巧且以用户为中心的设计作品。",
		quote:
			"“从像素到产品，从界面到体验——用设计连接技术与人文。在这里，每个创意都被认真对待，每次协作都在拓宽设计的边界。\n”",
	},
	前端: {
		en: "Frontend",
		intro:
			"负责团队内部的 Web 与小程序界面实现，追求丝滑的交互手感与长期可维护的工程结构。",
		quote:
			"“从设计稿到可交互的界面——用代码还原每一处细节。在这里，性能与体验同等重要，每次重构都让代码更接近它该有的样子。\n”",
	},
	后端: {
		en: "Backend",
		intro: "负责团队内部的服务端与数据层建设，追求稳定、清晰且经得起迭代的系统架构。",
		quote:
			"“接口要稳，数据要准，日志要说得清。在这里，稳定不是保守，而是让每一次上线都不必提心吊胆。\n”",
	},
	产品: {
		en: "Product",
		intro: "负责团队内部的产品规划与需求梳理，追求真正解决用户问题的产品设计。",
		quote:
			"“先问为什么，再想怎么做。在这里，需求不是被转述的，而是被理解、被拆解、被验证的。\n”",
	},
	运营: {
		en: "Operations",
		intro: "负责团队内部的内容运营与品牌传播，追求有温度、可持续的社区氛围与影响力。",
		quote:
			"“让好产品被更多人看见，让每一次发声都值得被记住。在这里，运营不是吆喝，而是把对的事讲给对的人听。\n”",
	},
};

type RawPerson = (typeof info)[number]["people"][number];

/** 原始成员 → 页面用的卡片数据 */
function toCard(person: RawPerson, suffix = ""): MemberCard {
	return {
		// 原始数据里有个别姓名带尾随空格，统一去掉再拼后缀
		name: person.name.trim() + suffix,
		badge: person.position || "组员",
		lead: /组长|主管/.test(person.position),
		intro: person.intro,
		photo: person.photo,
	};
}

/**
 * 把 info.ts 的原始数据整理成页面需要的结构。
 * ⚠️ 安卓组被并进前端组、并从导航里去掉：安卓成员排在原前端成员之后，
 *    姓名统一加「（安卓）」，其余字段（职务 / 简介 / 头像）原样保留。
 */
export function buildGroups(): MemberGroup[] {
	const source = info.map((group) => ({
		tag: group.tag,
		people: group.people.map((person) => toCard(person)),
	}));

	const androidCards = (source.find((group) => group.tag === MERGE_TAG)?.people ?? []).map(
		(card) => ({ ...card, name: card.name + MERGE_SUFFIX }),
	);

	return source
		.filter((group) => group.tag !== MERGE_TAG)
		.map((group) => {
			const copy = COPY[group.tag];
			return {
				tag: group.tag,
				en: copy?.en ?? group.tag,
				intro: copy?.intro ?? "",
				quote: copy?.quote ?? "",
				members:
					group.tag === MERGE_INTO ? [...group.people, ...androidCards] : group.people,
			};
		});
}

export default buildGroups();
