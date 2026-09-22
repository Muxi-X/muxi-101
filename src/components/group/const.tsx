// 组别介绍文字
interface Group {
	name: string;
	intro: string;
	learn: string;
	img: string;
}
const group: Array<Group> = [
	{
		name: "后端",
		intro:
			"实现 Web 应用的后端服务，负责后端开发，服务器运维，保证木犀产品的长治久安。",
		learn: "Go, SQL, Docker, Kubernetes…",
		img: "http://static.muxixyz.com/index_site/backend.png",
	},
	{
		name: "前端",
		intro: "基于浏览器内核开发跨平台、跨终端的应用软件",
		learn: "HTML, CSS, JavaScript, React…",
		img: "http://static.muxixyz.com/index_site/frontend.png",
	},
	{
		name: "设计",
		intro: "梦想是成为美术设计大师,踏上UI设计封神之旅",
		learn: "PS, AI, XD, Sketch…",
		img: "http://static.muxixyz.com/index_site/design.png",
	},
	{
		name: "安卓",
		intro: "开发 Android 应用，维护团队的 APP。",
		learn: "Java, Kotlin, Groovy, C++…",
		img: "http://static.muxixyz.com/index_site/android.png",
	},
	{
		name: "产品",
		intro: "头脑风暴 get 点子，协调开发与设计。从 0 到 1 制作产品。",
		learn: "需求分析, 用户调研, 制作产品原型图…",
		img: "http://static.muxixyz.com/index_site/product.png",
	},
	{
		name: "运营",
		intro: "todo",
		learn: "todo",
		img: "http://static.muxixyz.com/index_site/product.png",
	},
];

export default group;
