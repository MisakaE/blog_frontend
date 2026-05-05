import type { Metadata } from "next";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

export const metadata: Metadata = {
	title: "日常/杂谈",
	description: "日常、杂谈与随手记录。",
};

type DiaryItem = {
	id: string; // NEW
	title: string;
	date: string; // "YYYY-MM-DD"
	desc: string;
	href: string;
};

// 后端接口：GET /dailies?page=1&page_size=10 → DailyList { page, page_size, dailies: [...] }
const ENTRIES_API_URL =
	process.env.DIARY_ENTRIES_URL ?? "http://127.0.0.1:8000/dailies";

/** Unix 时间戳（秒）→ "YYYY-MM-DD" */
function unixToDate(ts: unknown): string {
	const n = Number(ts);
	if (!Number.isFinite(n) || n <= 0) return "";
	return new Date(n * 1000).toISOString().slice(0, 10);
}

async function fetchEntries(): Promise<DiaryItem[]> {
	noStore();

	try {
		const res = await fetch(`${ENTRIES_API_URL}?page=1&page_size=9999`, {
			method: "GET",
			headers: { accept: "application/json" },
			cache: "no-store",
		});

		if (!res.ok) return [];

		const data: any = await res.json();
		// 新接口返回 DailyList 包装：{ page, page_size, dailies: [...] }
		const list = Array.isArray(data?.dailies) ? data.dailies : Array.isArray(data) ? data : [];
		if (!Array.isArray(list)) return [];

		return list
			.map((x: any) => ({
				id: String(x?.id ?? ""),
				title: String(x?.title ?? ""),
				date: x?.date != null ? String(x.date) : unixToDate(x?.time),
				desc: String(x?.desc ?? ""),
				href: `/diary/entry?id=${encodeURIComponent(String(x?.id ?? ""))}`,
			}))
			.filter((e) => e.id && e.title && e.date);
	} catch {
		return [];
	}
}

function Section({ children }: { children: React.ReactNode }) {
	return (
		<section style={{ padding: "18px 0", borderTop: "1px solid rgba(255,255,255,0.14)" }}>
			<div style={{ color: "rgba(255,255,255,0.86)", lineHeight: 1.7 }}>{children}</div>
		</section>
	);
}

export default async function Page() {
	const entries = await fetchEntries();

	// 按日期(新->旧)排序，并按 YYYY-MM 分组
	const entriesSorted = [...entries].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
	const grouped = entriesSorted.reduce((acc, e) => {
		const month = (e.date ?? "").slice(0, 7) || "Unknown";
		(acc[month] ??= []).push(e);
		return acc;
	}, {} as Record<string, DiaryItem[]>);
	const months = Object.keys(grouped).sort().reverse();

	// 新增：按年份快速跳转
	const years = Array.from(
		new Set(months.map((m) => m.slice(0, 4)).filter(Boolean)),
	).sort().reverse();

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
							top: "52vh", // was "48vh"：再下移一点，更贴近其它页面的视觉位置
							transform: "translateY(-50%)",
						}}
					>
						{/* 动效放内部，避免覆盖 panelPos 的 transform */}
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
									<h1 style={{ margin: 0, fontSize: 22, fontWeight: 750, letterSpacing: 0.2 }}>
										日常/杂谈
									</h1>
									<p style={{ margin: "10px 0 0", color: "rgba(255,255,255,0.86)", lineHeight: 1.8 }}>
										随手记录：日常、杂谈与发牢骚。
									</p>
								</header>

								<Section>
									<div className="entryList" aria-label="日常/杂谈条目列表">
										{months.map((m, idx) => {
											const year = m.slice(0, 4);
											const prevYear = idx > 0 ? months[idx - 1].slice(0, 4) : "";
											const showYear = idx === 0 || year !== prevYear;

											return (
												<div key={m} className="monthGroup">
													{showYear ? (
														<div id={`y-${year}`} className="yearDivider">
															{year}
														</div>
													) : null}

													<div className="monthDivider">{m}</div>

													{grouped[m].map((e) => {
														// 只用 id 作为参数查询
														const href = `/diary/entry?id=${encodeURIComponent(e.id)}`;

														return (
															<Link
																key={e.id}
																className="entryBtn"
																href={href}
																prefetch={false}
																aria-label={`${e.title}（${e.date}）`}
																title={e.desc}
															>
																<span className="entryTitle">{e.title}</span>
																<span className="entryMeta">{e.date}</span>
																<span className="entryDesc">{e.desc}</span>
															</Link>
														);
													})}
												</div>
											);
										})}
									</div>

									{/* 新增：按年份快速跳转（放在列表下方） */}
									{years.length > 1 ? (
										<div className="yearNav" aria-label="按年份快速跳转">
											{years.map((y) => (
												<a key={y} className="yearLink" href={`#y-${y}`}>
													{y}
												</a>
											))}
										</div>
									) : null}
								</Section>

								{/* 右下角：返回主页 */}
								<Link href="/" className="backHome" aria-label="返回主页">
									<span className="backHomeIcon" aria-hidden="true">
										←
									</span>
									返回主页
								</Link>
							</div>
						</div>
					</div>

					{/* 底部版权（与主页一致） */}
					<footer className="footer">© 2026 MisakaE</footer>

					<style>{`
						.entryList{
							margin-top: 10px;
							display: flex;
							flex-direction: column;
							gap: 10px;

							/* 固定高度 + 滑动条 */
							max-height: 62vh;           /* 可按喜好改大/改小 */
							overflow-y: auto;
							scrollbar-gutter: stable;   /* 避免滚动条出现导致宽度抖动 */
							padding-right: 4px;         /* 给滚动条一点空间 */
							overscroll-behavior: contain;
						}

						/* 滚动条细化（可选） */
						.entryList{
							scrollbar-width: thin; /* Firefox */
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
								"desc  desc";
							gap: 4px 10px;

							padding: 12px 12px;
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
						.entryDesc{
							grid-area: desc;
							font-size: 12.5px;
							color: rgba(255,255,255,0.72);
							white-space: nowrap;
							overflow: hidden;
							text-overflow: ellipsis;
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

						/* 丝滑衔接：页面进入动效（挂在 panelPos 内部） */
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

						/* 按月分割：不再 sticky，避免左上角显示“当前年月” */
						.monthGroup{ display: contents; }
						.monthDivider{
							position: static; /* was sticky */
							top: auto;
							z-index: auto;

							/* 左对齐小标题 */
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
						/* 删除分割线伪元素 */
						.monthDivider::before,
						.monthDivider::after{
							content: none;
						}

						/* 年份标题（作为锚点） */
						.yearDivider{
							margin: 12px 0 6px;
							font-size: 12px;
							font-weight: 750;
							letter-spacing: 0.3px;
							color: rgba(255,255,255,0.78);
							text-shadow: 0 1px 10px rgba(0,0,0,0.55);
						}

						/* 年份快速跳转 */
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
					`}</style>
				</div>
			</div>
		</main>
	);
}
