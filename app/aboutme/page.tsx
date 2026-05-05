import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import MarkdownRenderer from "../components/MarkdownRenderer";

export const metadata: Metadata = {
	title: "关于我",
	description: "关于我",
};

// 后端接口：GET /aboutme → AboutMe { name, bio, md, piclink }
const ABOUTME_API_URL = process.env.ABOUTME_API_URL ?? "http://127.0.0.1:8000/aboutme";

// 静态兜底
const STATIC = {
	name: "MisakaE",
	title: "XCPC / CTF / NUEDC",
	location: "SWJTU, Chengdu, China",
	bio: "电气工程及其自动化，大二。",
	email: "misakae@qq.com",
	qq: "2037477466",
	bilibili: "https://space.bilibili.com/375532743",
	github: "https://github.com/MisakaE",
	learning: ["Arch Linux", "Next.js", "Rust", "Rocket", "PostgreSQL"],
	selfIntro: "西南交通大学大二学生，电气工程及其自动化专业，喜欢折腾计算机和一些电子小玩意。\n目前主要兴趣在XCPC和CTF以及随便搞一些开发上面。\n本打算转专业，因为一些原因困在了电气，（呜呜不想爬电线杆子QAQ）。\n学习 Rust 中，三战英语四级中……",
	avatar: "/head.jpg",
};

async function fetchAboutMe(): Promise<{ name?: string; bio?: string; md?: string; piclink?: string } | null> {
	noStore();
	try {
		const res = await fetch(ABOUTME_API_URL, {
			headers: { accept: "application/json" },
			cache: "no-store",
		});
		if (!res.ok) return null;
		return await res.json();
	} catch {
		return null;
	}
}

function Section({
	id,
	title,
	children,
}: {
	id: string;
	title: string;
	children: React.ReactNode;
}) {
	return (
		<section
			id={id}
			style={{ padding: "18px 0", borderTop: "1px solid rgba(255,255,255,0.14)" }}
		>
			<h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{title}</h2>
			<div style={{ color: "rgba(255,255,255,0.86)", lineHeight: 1.7 }}>{children}</div>
		</section>
	);
}

function Pill({ children }: { children: React.ReactNode }) {
	return (
		<span
			style={{
				display: "inline-block",
				padding: "4px 8px",
				borderRadius: 8,
				border: "1px solid rgba(255,255,255,0.14)",
				background: "rgba(0,0,0,0.18)",
				color: "rgba(255,255,255,0.88)",
				fontSize: 12,
			}}
		>
			{children}
		</span>
	);
}

export default async function Page() {
	const remote = await fetchAboutMe();

	const name = remote?.name || STATIC.name;
	const bio = remote?.bio || STATIC.bio;
	const selfIntroMd = remote?.md || STATIC.selfIntro;
	const avatarUrl = remote?.piclink || STATIC.avatar;

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
									<div
										style={{
											display: "flex",
											flexWrap: "wrap",
											alignItems: "center",
											justifyContent: "space-between",
											gap: 14,
										}}
									>
										<div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 260 }}>
											<div
												style={{
													width: 56,
													height: 56,
													borderRadius: 999,
													overflow: "hidden",
													border: "1px solid rgba(255,255,255,0.18)",
													background: "rgba(255,255,255,0.06)",
													flex: "0 0 auto",
												}}
											>
												<Image
													src={avatarUrl}
													alt={`${name} 的头像`}
													width={56}
													height={56}
													priority
													style={{ width: "100%", height: "100%", objectFit: "cover" }}
												/>
											</div>

											<div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
												<h1 style={{ margin: 0, fontSize: 22, fontWeight: 750, letterSpacing: 0.2 }}>
													{name}
												</h1>
												<div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "baseline" }}>
													<span style={{ color: "rgba(255,255,255,0.78)", fontSize: 13 }}>
														{STATIC.title}
													</span>
													<span style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>
														{STATIC.location}
													</span>
												</div>
											</div>
										</div>
									</div>

									<p style={{ margin: "12px 0 0", color: "rgba(255,255,255,0.86)", lineHeight: 1.8 }}>
										{bio}
									</p>
								</header>

								<Section id="learning" title="正在学习">
									<div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
										{STATIC.learning.map((s) => (
											<Pill key={s}>{s}</Pill>
										))}
									</div>
								</Section>

								<Section id="selfIntro" title="自我介绍">
									{remote?.md ? (
										<div className="mdContent" style={{ marginTop: 8 }}>
											<MarkdownRenderer>{selfIntroMd}</MarkdownRenderer>
										</div>
									) : (
										<p style={{ margin: "8px 0 0", whiteSpace: "pre-line" }}>{selfIntroMd}</p>
									)}
								</Section>

								<Section id="contact" title="联系方式">
									<div className="codeBlocks" aria-label="联系方式按钮组">
										<a
											className="codeBlock"
											href={`tencent://message/?uin=${STATIC.qq}&Site=&Menu=yes`}
											aria-label={`QQ：${STATIC.qq}`}
										>
											<span className="codeKey">QQ</span>
											<span className="codePunc">: </span>
											<span className="codeVal">{STATIC.qq}</span>
										</a>

										<a
											className="codeBlock"
											href={`mailto:${STATIC.email}`}
											aria-label={`Email：${STATIC.email}`}
										>
											<span className="codeKey">Email</span>
											<span className="codePunc">: </span>
											<span className="codeVal">{STATIC.email}</span>
										</a>

										<a
											className="codeBlock"
											href={STATIC.bilibili}
											target="_blank"
											rel="noreferrer"
											aria-label="Bilibili"
										>
											<span className="codeKey">Bilibili</span>
										</a>

										<a
											className="codeBlock"
											href={STATIC.github}
											target="_blank"
											rel="noreferrer"
											aria-label="GitHub"
										>
											<span className="codeKey">GitHub</span>
										</a>
									</div>
								</Section>

								{/* 右下角：返回主页（卡片内定位） */}
								<Link href="/" className="backHome" aria-label="返回主页">
									<span className="backHomeIcon" aria-hidden="true">
										←
									</span>
									返回主页
								</Link>
							</div>
						</div>
					</div>

					{/* 新增：底部版权（与主页一致） */}
					<footer className="footer">© 2026 {STATIC.name}</footer>

					<style>{`
						.navLink{
							color: rgba(255,255,255,0.9);
							font-size: 13px;
							padding: 8px 10px;
							border-radius: 10px;
							border: 1px solid rgba(255,255,255,0.12);
							background: rgba(255,255,255,0.04);
							text-decoration: none;
						}
						.navLink:hover{
							background: rgba(255,255,255,0.07);
							border-color: rgba(255,255,255,0.18);
							color: white;
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

							backdrop-filter: none;
							-webkit-backdrop-filter: none;
							box-shadow: none;

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
						.backHome:active{
							background: rgba(255,255,255,0.08);
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

						.codeBlocks{
							margin-top: 10px;
							display: flex;
							flex-wrap: wrap;
							gap: 8px;
						}
						.codeBlock{
							display: inline-flex;
							align-items: center;
							gap: 0;
							padding: 8px 10px;
							border-radius: 10px;
							border: 1px solid rgba(255,255,255,0.14);
							background: rgba(0,0,0,0.18);

							font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
							font-size: 12.5px;
							line-height: 1.6;
							color: rgba(255,255,255,0.88);

							text-decoration: none;
							cursor: pointer;
							transition: background 140ms ease, border-color 140ms ease, transform 140ms ease, color 140ms ease;
						}
						.codeBlock:hover{
							background: rgba(255,255,255,0.08);
							border-color: rgba(255,255,255,0.22);
							color: #fff;
						}
						.codeBlock:active{ transform: translateY(1px); }
						.codeBlock:focus-visible{
							outline: 2px solid rgba(99,102,241,0.9);
							outline-offset: 2px;
						}
						.codeKey{ color: rgba(255,255,255,0.92); }
						.codePunc{ color: rgba(255,255,255,0.65); }
						.codeVal{ color: rgba(255,255,255,0.92); }

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

						/* 丝滑衔接：页面进入动效（保持挂在 panelPos 内部） */
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
							.panel{ padding: 14px !important; }
							.backHome{ right: 12px; bottom: 12px; }
						}

						@media (max-height: 720px) {
							.panelPos { top: 0 !important; transform: none !important; padding-top: 24px; }
						}

						/* NEW: 关于我页正文段落字号略微放大（与其它 MD 页一致） */
						.md{
							--md-p-size: 15px;
						}
						.md :where(p){
							font-size: var(--md-p-size);
						}

						.mdContent{
							max-width: 100%;
							overflow-wrap: break-word;
							word-break: break-word;
							min-width: 0;
						}
						.mdContent :where(img, video, svg){
							max-width: 100%;
							height: auto;
						}
						.mdContent :where(table){
							display: block;
							max-width: 100%;
							overflow-x: auto;
						}
					`}</style>
				</div>
			</div>
		</main>
	);
}
