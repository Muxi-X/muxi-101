import Link from 'next/link'

export default function Home() {
	return (
		<main className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-6 py-16">
			<section className="w-full rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
				<p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">Muxi 101</p>
				<h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 md:text-5xl">
					快速在几个页面之间跳转
				</h1>
				<p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600 md:text-lg">
					从这里进入博客页或指南页，页面之间都能直接互相返回，适合做一个最简单的站内导航入口。
				</p>

				<div className="mt-8 flex flex-wrap gap-3">
					<Link
						href="/blog"
						className="inline-flex items-center rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
					>
						去博客页
					</Link>
					<Link
						href="/guide"
						className="inline-flex items-center rounded-full border border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
					>
						去指南页
					</Link>
				</div>
			</section>
		</main>
	)
}