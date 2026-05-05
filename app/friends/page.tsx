import type { Metadata } from "next";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

export const metadata: Metadata = {
	title: "友情链接",
	description: "友情链接与推荐站点。",
};

type FriendItem = {
	name: string;
	href: string;
	desc: string;
	icon?: string;    // emoji 图标（新接口）
	personalize?: string; // 个性化描述（新接口）
};

/** 本地兜底（后端不可用/为空时使用）；可先留空 */
const FRIENDS: FriendItem[] = [];

// 后端接口：GET /myfriends?page=1&page_size=10 → FriendList { page, page_size, friends: [...] }
const FRIENDS_API_URL = process.env.FRIENDS_API_URL ?? "http://127.0.0.1:8000/myfriends";

/** 补全协议头：仅对域名类字符串自动加 https:// */
function normalizeUrl(raw: string): string {
	const s = raw.trim();
	if (!s) return "";
	if (/^https?:\/\//i.test(s)) return s;
	// 包含 "." 或 ":" 的视为域名/URL，否则保持原样
	if (!/[.:]/.test(s)) return s;
	return `https://${s}`;
}

async function fetchFriends(): Promise<FriendItem[]> {
	noStore();
	try {
		const res = await fetch(`${FRIENDS_API_URL}?page=1&page_size=9999`, {
			method: "GET",
			headers: { accept: "application/json" },
			cache: "no-store",
		});
		if (!res.ok) return [];
		const data: any = await res.json();
		const list = Array.isArray(data?.friends) ? data.friends : Array.isArray(data) ? data : [];
		if (!Array.isArray(list)) return [];

		return list
			.map((x: any) => ({
				name: String(x?.name ?? "").trim(),
				href: normalizeUrl(String(x?.href ?? "")),
				desc: String(x?.desc ?? "").trim(),
				icon: normalizeUrl(String(x?.icon ?? "")),
				personalize: String(x?.personalize ?? "").trim() || undefined,
			}))
			.filter((f) => f.name && f.href);
	} catch {
		return [];
	}
}

function shuffleInPlace<T>(arr: T[]) {
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

function Section({
	title,
	children,
}: {
	title?: string;
	children: React.ReactNode;
}) {
	return (
		<section style={{ padding: "18px 0", borderTop: "1px solid rgba(255,255,255,0.14)" }}>
			{title ? <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{title}</h2> : null}
			<div style={{ color: "rgba(255,255,255,0.86)", lineHeight: 1.7 }}>{children}</div>
		</section>
	);
}

export default async function Page() {
	noStore(); // 关键：避免缓存导致顺序固定

	const remote = await fetchFriends();
	const friends = shuffleInPlace([...(remote.length ? remote : FRIENDS)]);

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
							top: "38.2vh",
							transform: "translateY(-50%)",
						}}
					>
						{/* FIX: 动画包裹层，避免覆盖 panelPos 的 transform */}
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
									<h1 style={{ margin: 0, fontSize: 22, fontWeight: 750, letterSpacing: 0.2 }}>友情链接</h1>
									<p style={{ margin: "10px 0 0", color: "rgba(255,255,255,0.86)", lineHeight: 1.8 }}>
										一些我喜欢的站点与朋友们的主页。
									</p>
								</header>

								{/* 删除“链接”小标题：不传 title */}
								<Section>
									<div className="codeBlocks" aria-label="友情链接按钮组">
										{friends.length ? (
											friends.map((f) => {
													const iconIsUrl = f.icon && /^https?:\/\//i.test(f.icon);
													return (
												<a
													key={f.href}
													className="codeBlock"
													href={f.href}
													target="_blank"
													rel="noreferrer"
													aria-label={`${f.name}：${f.desc}`}
													title={f.personalize || f.desc}
												>
													{iconIsUrl ? (
														<img
															className="friendIcon"
															src={f.icon}
															alt={f.name}
														/>
													) : (
														<span className="friendAvatar friendAvatarFallback">
															{f.name.charAt(0)}
														</span>
													)}
													<span className="friendText">
														<span className="friendName">{f.name}</span>
														<span className="friendDesc">{f.desc}</span>
													</span>
												</a>
											)})
										) : (
											<div style={{ color: "rgba(255,255,255,0.66)", fontSize: 13, padding: "6px 0" }}>
												暂无友情链接（后端未返回数据）。
											</div>
										)}
									</div>
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
						.codeBlocks{
							margin-top: 10px;

							/* was flex-wrap：改为两列网格 */
							display: grid;
							grid-template-columns: repeat(2, minmax(0, 1fr));
							gap: 12px;
						}
						.codeBlock{
							display: inline-flex;
							align-items: center;
							gap: 10px;
							padding: 14px 16px;
							border-radius: 12px;
							border: 1px solid rgba(255,255,255,0.14);
							background: rgba(0,0,0,0.18);

							text-decoration: none;
							cursor: pointer;
							transition:
								background 140ms ease,
								border-color 140ms ease,
								transform 140ms ease,
								color 140ms ease,
								box-shadow 180ms ease;
							max-width: 100%;
						}
						.codeBlock:hover{
							background: rgba(255,255,255,0.08);
							border-color: rgba(255,255,255,0.35);
							color: #fff;
							box-shadow:
								0 0 0 5px rgba(255,255,255,0.08),
								0 16px 44px rgba(0,0,0,0.40);
							transform: translateY(-2px) scale(1.01);
						}

						.friendIcon{
							width: 42px;
							height: 42px;
							border-radius: 999px;
							object-fit: cover;
							flex: 0 0 auto;
							border: 1px solid rgba(255,255,255,0.16);
						}

						.friendAvatar{
							width: 42px;
							height: 42px;
							border-radius: 999px;
							display: inline-flex;
							align-items: center;
							justify-content: center;
							flex: 0 0 auto;

							border: 1px solid rgba(255,255,255,0.16);

							/* FIX: 不要用 background 简写（会覆盖 inline 的 background-image） */
							background-color: rgba(255,255,255,0.06);

							/* 头图适配 */
							background-size: cover;
							background-position: center;
							background-repeat: no-repeat;

							/* 不要头图上的字（兜底） */
							font-size: 0;
							color: transparent;
						}
						.friendAvatarFallback{
							font-size: 16px;
							color: rgba(255,255,255,0.70);
							font-weight: 600;
						}
						.friendText{
							display: inline-flex;
							flex-direction: column;
							gap: 2px;
							min-width: 0;
						}
						.friendName{
							color: rgba(255,255,255,0.92);
							font-size: 14px;       /* was 13px */
							line-height: 1.2;
							font-weight: 600;
						}
						.friendDesc{
							color: rgba(255,255,255,0.70);
							font-size: 13px;       /* was 12px */
							line-height: 1.2;
							white-space: nowrap;
							overflow: hidden;
							text-overflow: ellipsis;
							max-width: none;       /* NEW：两列下不必再限制 42ch */
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
							padding: 14px 18px;
							text-align: center;
							font-size: 12px;
							letter-spacing: 0.2px;
							color: rgba(255,255,255,0.55);
							pointer-events: none;
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
							.codeVal{ max-width: 24ch; }
						}
						@media (max-height: 720px) {
							.panelPos { top: 0 !important; transform: none !important; padding-top: 24px; }
						}
					`}</style>
				</div>
			</div>
		</main>
	);
}
