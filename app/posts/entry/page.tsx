import type { Metadata } from "next";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import MarkdownRenderer from "../../components/MarkdownRenderer";
import "katex/dist/katex.min.css";

export const metadata: Metadata = {
	title: "博客 - 条目",
	description: "博客条目展示。",
};

type PostDetail = {
	id?: string;
	title?: string;
	date?: string;
	desc?: string;
	content?: string; // markdown
	md?: string;      // 兼容字段
};

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(v: string | string[] | undefined) {
	return Array.isArray(v) ? v[0] : v;
}

// 后端接口：GET /post?id=1 → PostItem
const POSTS_ENTRY_URL = process.env.POSTS_ENTRY_URL ?? "http://127.0.0.1:8000/post";

async function fetchPostDetail(id?: string): Promise<PostDetail | null> {
	noStore();
	if (!id) return null;

	const url = `${POSTS_ENTRY_URL}?id=${encodeURIComponent(id)}`;
	try {
		const res = await fetch(url, {
			method: "GET",
			headers: { accept: "application/json" },
			cache: "no-store",
		});
		if (!res.ok) return null;

		const data: any = await res.json();
		if (!data || typeof data !== "object") return null;

		return {
			id: data.id != null ? String(data.id) : undefined,
			title: data.title != null ? String(data.title) : undefined,
			date: data.date != null ? String(data.date) : undefined,
			desc: data.desc != null ? String(data.desc) : undefined,
			content: data.content != null ? String(data.content) : undefined,
			md: data.md != null ? String(data.md) : undefined,
		};
	} catch {
		return null;
	}
}

export default async function Page({
	searchParams,
}: {
	searchParams?: SearchParams | Promise<SearchParams>;
}) {
	const sp = await Promise.resolve(searchParams ?? ({} as SearchParams));
	const id = firstParam(sp.id);
	const fallbackTitle = firstParam(sp.title) ?? "未命名";
	const fallbackDate = firstParam(sp.date) ?? "";
	const fallbackDesc = firstParam(sp.desc) ?? "";

	const detail = await fetchPostDetail(id);

	const title = detail?.title ?? fallbackTitle;
	const date = detail?.date ?? fallbackDate;
	const markdown = (detail?.content ?? detail?.md ?? detail?.desc ?? fallbackDesc).trim();

	return (
		<main
			style={{
				minHeight: "100vh",
				backgroundImage: "url('/99605266_p0_low.jpg')",
				backgroundSize: "cover",
				backgroundPosition: "center",
				backgroundRepeat: "no-repeat",
				color: "white",
			}}
		>
			<div
				style={{
					minHeight: "100vh",
					background:
						"linear-gradient(180deg, rgba(10,12,20,0.78), rgba(10,12,20,0.72) 35%, rgba(10,12,20,0.80))",
				}}
			>
				<div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 18px 54px" }}>
					<div className="panelPos" style={{ position: "relative", top: "52vh", transform: "translateY(-50%)" }}>
						<div className="pageEnter">
							<div
								className="panel"
								style={{
									borderRadius: 18,
									border: "1px solid rgba(255,255,255,0.14)",
									background: "rgba(0,0,0,0.22)",
									backdropFilter: "blur(10px)",
									WebkitBackdropFilter: "blur(10px)",
									padding: 18,
									position: "relative",
									paddingBottom: 66,
								}}
							>
								<header style={{ paddingBottom: 14 }}>
									<h1 style={{ margin: 0, fontSize: 22, fontWeight: 750, letterSpacing: 0.2 }}>{title}</h1>
									<div style={{ marginTop: 8, color: "rgba(255,255,255,0.65)", fontSize: 12 }}>{date}</div>
								</header>

								<section style={{ padding: "18px 0", borderTop: "1px solid rgba(255,255,255,0.14)" }}>
									<div className="mdScroll">
										<div className="md">
											<MarkdownRenderer>
												{markdown || "（暂无内容）"}
											</MarkdownRenderer>
										</div>
									</div>
								</section>

								<Link href="/posts" className="backHome" aria-label="返回博客列表">
									<span className="backHomeIcon" aria-hidden="true">
										←
									</span>
									返回列表
								</Link>
							</div>
						</div>
					</div>

					<footer className="footer">© 2026 MisakaE</footer>

					<style>{`
						.backHome{
							position: absolute;
							right: 14px;
							bottom: 14px;
							z-index: 2;
							display: inline-flex;
							align-items: center;
							gap: 8px;

							padding: 10px 12px;
							border-radius: 12px;
							border: 1px solid rgba(255,255,255,0.16);
							background: rgba(255,255,255,0.06);

							color: rgba(255,255,255,0.92);
							font-size: 13px;
							letter-spacing: 0.2px;
							text-decoration: none;
							transition: background 140ms ease, border-color 140ms ease, color 140ms ease;
						}
						.backHome:hover{
							background: rgba(255,255,255,0.10);
							border-color: rgba(255,255,255,0.22);
							color: white;
						}
						.backHomeIcon{
							width: 22px;
							height: 22px;
							display: inline-flex;
							align-items: center;
							justify-content: center;
							border-radius: 999px;
							background: transparent;
							border: 1px solid rgba(255,255,255,0.18);
							line-height: 1;
						}

						.footer{
							position: fixed;
							left: 0;
							right: 0;
							bottom: 0;
							padding: 14px 18px calc(14px + env(safe-area-inset-bottom));
							text-align: center;
							font-size: 12px;
							letter-spacing: 0.2px;
							color: rgba(255,255,255,0.55);
							pointer-events: none;
							z-index: 5;
						}

						.pageEnter{
							animation: pageEnter 260ms cubic-bezier(.2,.8,.2,1) both;
							will-change: transform, opacity;

							/* NEW: 确保内容层级稳定（更像你主页/日记的处理方式） */
							position: relative;
							z-index: 1;
						}
						@keyframes pageEnter{
							from { opacity: 0; transform: translate3d(0, 8px, 0); }
							to   { opacity: 1; transform: translate3d(0, 0, 0); }
						}
						@media (prefers-reduced-motion: reduce){
							.pageEnter{ animation: none !important; }
						}

						@media (max-width: 520px){
							.backHome{ right: 12px; bottom: 12px; }
						}
						@media (max-height: 720px) {
							.panelPos { top: 0 !important; transform: none !important; padding-top: 24px; }
						}

						.md{
							color: rgba(255,255,255,0.86);
							line-height: 1.9;
							font-size: 14px;
							max-width: 100%;
							overflow-wrap: break-word;
							word-break: break-word;
							min-width: 0;
						}
						.md :where(img, video, svg){
							max-width: 100%;
							height: auto;
						}
						.md :where(table){
							display: block;
							max-width: 100%;
							overflow-x: auto;
						}
						.md :where(p){
							margin: 0 0 12px;
							font-size: 15px; /* NEW */
						}
						.md :where(h1,h2,h3){ margin: 14px 0 10px; line-height: 1.35; }
						.md :where(a){
							color: rgba(255,255,255,0.92);
							text-decoration: underline;
							text-decoration-color: rgba(255,255,255,0.35);
						}
						.md :where(code){
							font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
							font-size: 12.5px;
						}
						.md :where(pre){
							overflow: auto;
							padding: 10px 12px;
							border-radius: 12px;
							border: 1px solid rgba(255,255,255,0.14);
							background: rgba(0,0,0,0.18);
						}

						/* NEW: Markdown 固定最大高度，剩余用滚动条 */
						.mdScroll{
							max-height: 78vh; /* was 52vh */
							overflow: auto;
							scrollbar-gutter: stable;
							padding-right: 4px;
							overscroll-behavior: contain;

							scrollbar-width: thin;
							scrollbar-color: rgba(255,255,255,0.22) transparent;
						}
						.mdScroll::-webkit-scrollbar{ width: 8px; }
						.mdScroll::-webkit-scrollbar-thumb{
							background: rgba(255,255,255,0.18);
							border-radius: 999px;
							border: 2px solid transparent;
							background-clip: content-box;
						}
						.mdScroll::-webkit-scrollbar-thumb:hover{
							background: rgba(255,255,255,0.26);
							background-clip: content-box;
						}
						.mdScroll::-webkit-scrollbar-track{ background: transparent; }
					`}</style>
				</div>
			</div>
		</main>
	);
}
