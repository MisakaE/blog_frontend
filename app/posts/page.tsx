import type { Metadata } from "next";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import type { ReactNode } from "react";
// PostsClient 位于同目录：app/posts/PostsClient.tsx（前端筛选：tag 仅按 tags；搜索仅按 标题/摘要）
import PostsClient from "./PostsClient";

export const metadata: Metadata = {
	title: "博客/游记",
	description: "博客文章列表。",
};

type PostItem = {
	id: string;
	title: string;
	date: string;
	desc: string;
	href: string;
	tags: string[];
};

// 后端接口：GET /posts?page=1&page_size=10 → PostList { page, page_size, posts: [...] }
const POSTS_API_URL = process.env.POSTS_API_URL ?? "http://127.0.0.1:8000/posts";

/** Unix 时间戳（秒）→ "YYYY-MM-DD" */
function unixToDate(ts: unknown): string {
	const n = Number(ts);
	if (!Number.isFinite(n) || n <= 0) return "";
	return new Date(n * 1000).toISOString().slice(0, 10);
}

// 前端筛选：只拉一次全量（page_size 设大一些），不再向后端传 tag 参数
async function fetchPosts(): Promise<PostItem[]> {
	noStore();
	try {
		const res = await fetch(`${POSTS_API_URL}?page=1&page_size=9999`, {
			method: "GET",
			headers: { accept: "application/json" },
			cache: "no-store",
		});
		if (!res.ok) return [];
		const data: any = await res.json();
		// 新接口返回 PostList 包装：{ page, page_size, posts: [...] }
		const list = Array.isArray(data?.posts) ? data.posts : Array.isArray(data) ? data : [];
		if (!Array.isArray(list)) return [];
		return list
			.map((x: any) => {
				const id = String(x?.id ?? "");
				const rawDesc = x?.desc != null ? String(x.desc) : x?.excerpt != null ? String(x.excerpt) : "";
				const href = id ? `/posts/entry?id=${encodeURIComponent(id)}` : "";

				const rawTags = x?.tags;
				const tags: string[] = Array.isArray(rawTags)
					? rawTags.map((t: any) => String(t ?? "").trim()).filter(Boolean)
					: typeof rawTags === "string"
						? rawTags.split(",").map((t) => t.trim()).filter(Boolean)
						: [];

				// time 为 Unix 时间戳（秒），转为 YYYY-MM-DD
				const date = x?.date != null ? String(x.date) : unixToDate(x?.time);

				return { id, title: String(x?.title ?? ""), date, desc: rawDesc, href, tags };
			})
			.filter((p) => p.id && p.title && p.date && p.href);
	} catch {
		return [];
	}
}

function Section({ children }: { children: ReactNode }) {
	return (
		<section style={{ padding: "18px 0", borderTop: "1px solid rgba(255,255,255,0.14)" }}>
			<div style={{ color: "rgba(255,255,255,0.86)", lineHeight: 1.7 }}>{children}</div>
		</section>
	);
}

type SearchParams = Record<string, string | string[] | undefined>;
function firstParam(v: string | string[] | undefined) {
	return Array.isArray(v) ? v[0] : v;
}

export default async function Page({
	searchParams,
}: {
	searchParams?: SearchParams | Promise<SearchParams>;
}) {
	const sp = await Promise.resolve(searchParams ?? ({} as SearchParams));
	const initialTag = (firstParam(sp.tag) ?? "").trim(); // 仅用于首屏默认选中（不用于后端请求）
	const initialQuery = (firstParam(sp.q) ?? "").trim(); // NEW: 首屏默认搜索词

	const posts = await fetchPosts();

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
				<div style={{ maxWidth: 920, margin: "0 auto", padding: "0 18px 54px" }}>
					<div
						className="panelPos"
						style={{
							position: "relative",
							top: "52vh",
							transform: "translateY(-50%)",
						}}
					>
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
									<h1 style={{ margin: 0, fontSize: 22, fontWeight: 750, letterSpacing: 0.2 }}>博客</h1>
									<p style={{ margin: "10px 0 0", color: "rgba(255,255,255,0.86)", lineHeight: 1.8 }}>
										文章列表（按月份归档）。
									</p>
								</header>

								<Section>
									<PostsClient posts={posts} initialTag={initialTag} initialQuery={initialQuery} />
								</Section>

								<Link href="/" className="backHome" aria-label="返回主页">
									<span className="backHomeIcon" aria-hidden="true">
										←
									</span>
									返回主页
								</Link>
							</div>
						</div>
					</div>

					<footer className="footer">© 2026 MisakaE</footer>

					<style>{`
						.entryList{
							margin-top: 10px;
							display: flex;
							flex-direction: column;
							gap: 10px;

							height: 62vh;     /* was 68vh */
							max-height: 62vh; /* was 68vh */
							overflow-y: auto;
							scrollbar-gutter: stable;
							padding-right: 4px;
							overscroll-behavior: contain;

							scrollbar-width: thin;
							scrollbar-color: rgba(255,255,255,0.22) transparent;
						}
						.entryList::-webkit-scrollbar{ width: 8px; }
						.entryList::-webkit-scrollbar-thumb{
							background: rgba(255,255,255,0.18);
							border-radius: 999px;
							border: 2px solid transparent;
							background-clip: content-box;
						}
						.entryList::-webkit-scrollbar-thumb:hover{
							background: rgba(255,255,255,0.26);
							background-clip: content-box;
						}
						.entryList::-webkit-scrollbar-track{ background: transparent; }

						.entryBtn{
							display: grid;
							grid-template-columns: 1fr auto;
							grid-template-rows: auto auto;
							grid-template-areas:
								"title meta"
								"tags  tags"
								"desc  desc";
							gap: 4px 10px;

							padding: 18px 14px;     /* was 16px 14px：更高一些 */
							min-height: 108px;       /* was 76px：给 title/meta/tags/desc 足够空间 */
							align-items: start;     /* NEW：内容从上对齐，更自然 */
							border-radius: 12px;
							border: 1px solid rgba(255,255,255,0.14);
							background: rgba(0,0,0,0.18);

							text-decoration: none;
							color: rgba(255,255,255,0.88);
							transition: background 140ms ease, border-color 140ms ease, transform 140ms ease, color 140ms ease;
						}
						.entryBtn:hover{
							background: rgba(255,255,255,0.08);
							border-color: rgba(255,255,255,0.22);
							color: #fff;
						}
						.entryBtn:active{ transform: translateY(1px); }
						.entryBtn:focus-visible{
							outline: 2px solid rgba(99,102,241,0.9);
							outline-offset: 2px;
						}
						.entryTitle{
							grid-area: title;
							font-weight: 650;
							font-size: 13.5px;
							color: rgba(255,255,255,0.92);
							white-space: nowrap;
							overflow: hidden;
							text-overflow: ellipsis;
						}
						.entryMeta{
							grid-area: meta;
							font-size: 12px;
							color: rgba(255,255,255,0.60);
							white-space: nowrap;
						}
						.entryTags{
							grid-area: tags;
							display: flex;
							flex-wrap: wrap;
							gap: 6px;
							margin-top: 2px;
							min-width: 0;
						}
						.tagPill{
							display: inline-flex;
							align-items: center;
							justify-content: center;
							padding: 2px 8px;
							border-radius: 999px;
							border: 1px solid rgba(255,255,255,0.12);
							background: rgba(255,255,255,0.06);
							color: rgba(255,255,255,0.78);
							font-size: 11px;
							line-height: 1.4;
							white-space: nowrap;
						}
						.entryDesc{
							grid-area: desc;
							font-size: 12.5px;
							color: rgba(255,255,255,0.72);
							white-space: normal;          /* was nowrap */
							overflow: hidden;
							text-overflow: ellipsis;

							line-height: 1.55; /* NEW：配合 max-height 计算 */

							display: -webkit-box;
							-webkit-line-clamp: 4;          /* was 2：显示更多摘要 */
							-webkit-box-orient: vertical;

							/* Firefox 兜底：即使不支持 line-clamp 也不会“超出范围” */
							max-height: calc(1.55em * 4);
						}

						.monthGroup{ display: contents; }
						.monthDivider{
							position: static;
							display: block;
							margin: 10px 0 6px;
							padding: 6px 0 4px;
							border: none;
							background: transparent;

							font-size: 12px;
							font-weight: 650;
							letter-spacing: 0.2px;
							color: rgba(255,255,255,0.66);
							text-shadow: 0 1px 10px rgba(0,0,0,0.55);
						}

						.yearDivider{
							margin: 12px 0 6px;
							font-size: 12px;
							font-weight: 750;
							letter-spacing: 0.3px;
							color: rgba(255,255,255,0.78);
							text-shadow: 0 1px 10px rgba(0,0,0,0.55);
						}

						.yearNav{
							margin-top: 12px;
							display: flex;
							flex-wrap: wrap;
							gap: 8px;
							justify-content: flex-start;
						}
						.yearLink{
							display: inline-flex;
							align-items: center;
							justify-content: center;

							padding: 6px 10px;
							border-radius: 999px;
							border: 1px solid rgba(255,255,255,0.14);
							background: rgba(0,0,0,0.12);

							color: rgba(255,255,255,0.80);
							font-size: 12px;
							letter-spacing: 0.2px;
							text-decoration: none;

							transition: background 140ms ease, border-color 140ms ease, color 140ms ease, transform 140ms ease;
						}
						.yearLink:hover{
							background: rgba(255,255,255,0.08);
							border-color: rgba(255,255,255,0.22);
							color: #fff;
							transform: translateY(-1px);
						}
						.yearLink:active{ transform: translateY(0); }
						.yearLink:focus-visible{
							outline: 2px solid rgba(99,102,241,0.9);
							outline-offset: 2px;
						}

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

						/* 新增：内容两栏（右侧 tag 筛选） */
						.contentGrid{
							display: grid;
							grid-template-columns: 1fr 220px;
							gap: 14px;
							align-items: start;
						}
						@media (max-width: 820px){
							.contentGrid{ grid-template-columns: 1fr; }
						}

						/* 左侧保持原滚动高度 */
						.leftCol{ min-width: 0; }

						/* 右侧 tag 筛选 */
						.rightCol{ min-width: 0; }
						.tagBox{
							border-radius: 14px;
							border: 1px solid rgba(255,255,255,0.14);
							background: rgba(0,0,0,0.14);
							padding: 12px;
						}
						.tagTitle{
							font-size: 12px;
							font-weight: 750;
							letter-spacing: 0.2px;
							color: rgba(255,255,255,0.78);
							margin-bottom: 10px;
						}
						.tagList{
							display: flex;
							flex-direction: column;
							gap: 8px;

							height: 62vh;     /* was 68vh */
							max-height: 62vh; /* was 68vh */
							overflow: auto;
							padding-right: 4px;
						}
						.tagLink{
							display: inline-flex;
							align-items: center;
							justify-content: space-between;
							gap: 10px;

							padding: 8px 10px;
							border-radius: 12px;
							border: 1px solid rgba(255,255,255,0.14);
							background: rgba(0,0,0,0.12);

							color: rgba(255,255,255,0.84);
							font-size: 12px;
							text-decoration: none;

							transition: background 140ms ease, border-color 140ms ease, color 140ms ease, transform 140ms ease;
						}
						.tagLink:hover{
							background: rgba(255,255,255,0.08);
							border-color: rgba(255,255,255,0.22);
							color: #fff;
							transform: translateY(-1px);
						}
						.tagLink.active{
							border-color: rgba(99,102,241,0.55);
							background: rgba(99,102,241,0.10);
						}
						.tagCount{
							color: rgba(255,255,255,0.60);
							font-variant-numeric: tabular-nums;
							flex: 0 0 auto;
						}

						/* NEW: 右侧“用 tag 筛选”上方的搜索框 */
						.tagSearch{
							display: flex;
							gap: 8px;
							margin-bottom: 10px;
						}
						.tagSearchInput{
							flex: 1 1 auto;
							min-width: 0;

							padding: 8px 10px;
							border-radius: 12px;
							border: 1px solid rgba(255,255,255,0.14);
							background: rgba(0,0,0,0.12);

							color: rgba(255,255,255,0.88);
							font-size: 12px;
						}
						.tagSearchInput::placeholder{
							color: rgba(255,255,255,0.52);
						}
						.tagSearchInput:focus-visible{
							outline: 2px solid rgba(99,102,241,0.9);
							outline-offset: 2px;
						}
						.tagSearchClear{
							flex: 0 0 auto;
							padding: 8px 10px;
							border-radius: 12px;
							border: 1px solid rgba(255,255,255,0.14);
							background: rgba(0,0,0,0.12);
							color: rgba(255,255,255,0.84);
							font-size: 12px;
							cursor: pointer;
						}
						.tagSearchClear:hover{
							background: rgba(255,255,255,0.08);
							border-color: rgba(255,255,255,0.22);
							color: #fff;
						}
					`}</style>
				</div>
			</div>
		</main>
	);
}
