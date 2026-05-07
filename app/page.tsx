import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import InterestingLinks from "./components/InterestingLinks";

// 后端地址/端口在哪定义？
// 不是全局配置：各页面/组件各自用 `process.env.XXX ?? "http://127.0.0.1:9090/..."` 定义默认值。
// 统一改法：在项目根目录 `.env.local`（或部署环境变量）里设置这些变量覆盖默认：
// - POSTS_API_URL / POSTS_ENTRY_URL
// - DIARY_ENTRIES_URL / DIARY_ENTRY_URL
// - FRIENDS_API_URL
// - ADMIN_ADD_* / ADMIN_DEL_*（若在 Client Component 用到，建议配 NEXT_PUBLIC_ADMIN_*）
// 默认端口 9090 来自这些 fallback 字符串里的 `http://127.0.0.1:9090/...`。
const SITE_NAME = "MisakaE";

export const metadata: Metadata = {
	title: `主页 | ${SITE_NAME}`, // was "主页"
	description: "主页入口：关于我、博客、游记/杂谈、友情链接。",
};

const HOME = {
	name: "MisakaE",
	tagline: "「在0和1之间构建世界」",
	subtitle: "XCPC / CTF / NUEDC",
	avatar: "/head.jpg",
	bg: "/99605266_p0_low.jpg",
};

// 注：所有渲染 Markdown 的页面，正文容器采用固定 max-height（例如 56vh）+ overflow 滚动条（避免内容多少导致布局抖动）
// 注：/diary/entry 与 /posts/entry 的参数来自 URL 查询参数；/diary 现在仅用 id 查询（列表跳转为 /diary/entry?id=...）
// 注：/posts 的 tag 现在前端筛选（?tag=xxx 仅作默认选中）
// 注：/posts 的 tag 筛选由前端组件 PostsClient 实现（不会按 tag 额外请求后端）
// 注：/posts 支持 ?tag=xxx 与 ?q=xxx 作为默认筛选/搜索（均为前端实现）
// 注：已新增管理页：/admin/add_diary /admin/add_post /admin/del_diary /admin/del_post /admin/add_friend /admin/del_friend（表单前端直连后端 POST 接口；后端已处理 CORS）
// 注：友链支持自定义颜色字段（后端下发 accent/color；/admin/add_friend 也可提交）
// 注：友链头像/头图：按 public/$友链name$.jpg 读取（页面端通过 /${encodeURIComponent(name)}.jpg 使用）
// 注：友链头图（public/$友链name$.jpg）在头像圆形容器内使用 background-size: cover + center；不叠加首字母文字
// 注：Windows 生产构建请用项目根目录 build-prod.cmd（会在 build 前注入所需环境变量，避免 fallback 到 127.0.0.1）

// 注：友链的 accent/color 支持原始格式 "#RRGGBB||https://.../head.jpg"：前端用同一个字段同时解析主题色与头像背景图

export default function Page() {
	return (
		<main
			style={{
				minHeight: "100vh",
				backgroundImage: `url('${HOME.bg}')`,
				backgroundSize: "cover",
				backgroundPosition: "center",
				backgroundRepeat: "no-repeat",
				color: "white",
			}}
		>
			{/* 背景参数与 aboutme 保持一致 */}
			<div
				style={{
					minHeight: "100vh",
					background:
						"linear-gradient(180deg, rgba(10,12,20,0.78), rgba(10,12,20,0.72) 35%, rgba(10,12,20,0.80))",
				}}
			>
				{/* 仅入场一次的丝滑特效（不浮夸，不影响交互） */}
				<div className="fxIntro" aria-hidden="true" />

				<div style={{ maxWidth: 920, margin: "0 auto", padding: "0 18px" }}>
					{/* 无卡片：仅内容块，位置沿用 0.382 视觉锚点 */}
					<div style={{ position: "relative", top: "38.2vh", transform: "translateY(-50%)" }}>
						{/* FIX: 动画挂在内部，避免覆盖定位 transform */}
						<div className="pageEnter">
							<div className="hero">
								<div className="heroTop">
									<div className="avatarWrap" aria-hidden="true">
										<Image
											src={HOME.avatar}
											alt={`${HOME.name} 的头像`}
											width={148}  // was 132
											height={148} // was 132
											priority
											style={{ width: "100%", height: "100%", objectFit: "cover" }}
										/>
									</div>

									<div className="text">
										<h1 className="name">{HOME.name}</h1>
										<div className="subtitle">{HOME.subtitle}</div>
									</div>
								</div>

								{/* 签名放在“头像 + 姓名”下方 */}
								<div className="tagline">{HOME.tagline}</div>

								{/* 新增：下方四个按钮 */}
								<div className="navButtons" aria-label="主页导航">
									<Link className="navBtn" href="/aboutme" style={{ ["--accent" as any]: "99 102 241" }}>
										关于我
									</Link>
									<Link className="navBtn" href="/posts" prefetch={false} style={{ ["--accent" as any]: "34 197 94" }}>
										博客/游记
									</Link>
									<Link className="navBtn" href="/diary" prefetch={false} style={{ ["--accent" as any]: "168 85 247" }}>
										日常/杂谈
									</Link>
									<Link className="navBtn" href="/friends" prefetch={false} style={{ ["--accent" as any]: "245 158 11" }}>
										友情链接
									</Link>
									<InterestingLinks />
								</div>
							</div>
						</div>

						<style>{`
							.hero{
								display: flex;
								flex-direction: column;
								align-items: center;
								gap: 22px; /* was 18px */
								width: 100%;
							}
							.heroTop{
								display: flex;
								align-items: center;
								justify-content: center;
								gap: 26px; /* was 22px */
								width: 100%;
							}
							.avatarWrap{
								width: 148px;  /* was 132px */
								height: 148px; /* was 132px */
								border-radius: 999px;
								overflow: hidden;

								/* hover 基础 */
								position: relative;
								border: 1px solid rgba(255,255,255,0.18);
								background: rgba(255,255,255,0.06);
								flex: 0 0 auto;

								transform: translateY(0) scale(1);
								transition:
									transform 220ms cubic-bezier(.2,.8,.2,1),
									border-color 220ms ease,
									box-shadow 220ms ease,
									filter 220ms ease;
								will-change: transform;
							}

							/* 扫光层 */
							.avatarWrap::after{
								content: "";
								position: absolute;
								inset: -40%;
								pointer-events: none;

								background: linear-gradient(
									115deg,
									transparent 40%,
									rgba(255,255,255,0.16) 50%,
									transparent 60%
								);
								transform: translateX(-120%) rotate(20deg);
								opacity: 0;
								transition:
									transform 520ms cubic-bezier(.2,.8,.2,1),
									opacity 220ms ease;
							}

							.avatarWrap:hover{
								transform: translateY(-3px) scale(1.03);
								border-color: rgba(255,255,255,0.30);
								box-shadow:
									0 18px 45px rgba(0,0,0,0.45),
									0 0 0 6px rgba(255,255,255,0.05);
								filter: saturate(1.05);
							}
							.avatarWrap:hover::after{
								opacity: 1;
								transform: translateX(120%) rotate(20deg);
							}

							.name{
								margin: 0;
								font-size: 46px; /* was 42px */
								font-weight: 800;
								letter-spacing: 0.4px;
								line-height: 1.1;
							}
							.subtitle{
								margin-top: 8px;
								font-size: 14px; /* was 13px */
								line-height: 1.7;
								letter-spacing: 0.2px;
								color: rgba(255,255,255,0.72);
								max-width: 520px;
							}
							.tagline{
								margin-top: 0;
								font-size: 24px; /* was 18px */
								font-style: italic;
								color: rgba(255,255,255,0.70);
								letter-spacing: 0.2px;
								text-align: center;
							}
							.navButtons{
								display: flex;
								flex-wrap: wrap;
								justify-content: center;
								gap: 14px;
								margin-top: 40px; /* was 18px：与上方间距再大一些 */
							}
							.navBtn{
								display: inline-flex;
								align-items: center;
								justify-content: center;

								padding: 14px 22px; /* was 13px 20px */
								border-radius: 999px;
								border: 1px solid rgba(255,255,255,0.16);
								background: rgba(0,0,0,0.18);

								color: rgba(255,255,255,0.90);
								font-size: 14px;    /* was 13px */
								font-weight: 600;   /* new */
								letter-spacing: 0.2px;
								text-decoration: none;

								--accent: 255 255 255;
								transform: translateY(0);
								transition:
									background 180ms ease,
									border-color 180ms ease,
									color 180ms ease,
									transform 180ms cubic-bezier(.2,.8,.2,1);
							}
							.navBtn:hover{
								background: rgba(255,255,255,0.08);
								border-color: rgb(var(--accent) / 0.55);
								color: #fff;
								transform: translateY(-1px);
								box-shadow:
									0 0 0 5px rgb(var(--accent) / 0.10),
									0 12px 34px rgba(0,0,0,0.35);
							}
							.navBtn:active{
								transform: translateY(0);
							}
							.navBtn:focus-visible{
								outline: 2px solid rgba(99,102,241,0.9);
								outline-offset: 2px;
							}
							.footer{
								position: fixed;
								left: 0;
								right: 0;
								bottom: 0;
								z-index: 5;

								/* 适配全面屏安全区 */
								padding: 14px 18px calc(14px + env(safe-area-inset-bottom));

								text-align: center;
								font-size: 12px;
								letter-spacing: 0.2px;
								color: rgba(255,255,255,0.55);
								pointer-events: none;
							}

							/* 丝滑衔接：页面进入动效（注意：不要挂在带 translateY(-50%) 的定位层上） */
							.pageEnter{
								animation: pageEnter 260ms cubic-bezier(.2,.8,.2,1) both;
								will-change: transform, opacity;

								/* 确保内容在特效之上 */
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
								.hero{ gap: 16px; }            /* was 14px */
								.avatarWrap{ width: 116px; height: 116px; } /* was 104px */
								.name{ font-size: 38px; }                  /* was 34px */
								.tagline{ font-size: 20px; }               /* was 18px */
								.navButtons{ gap: 12px; margin-top: 18px; } /* was margin-top: 10px */
								.navBtn{
									padding: 13px 20px; /* was 12px 18px */
									font-size: 13px;    /* new */
								}
								.subtitle{ font-size: 12.5px; max-width: 320px; }            /* was 12px */
							}
							@media (max-height: 720px){
								/* 兜底：低高度视口避免内容上移过多 */
								.hero{ padding-top: 24px; }
							}

							/* 尊重系统减少动效设置 */
							@media (prefers-reduced-motion: reduce){
								.avatarWrap,
								.avatarWrap::after{
									transition: none !important;
								}
								.avatarWrap:hover{
									transform: none;
								}
								.avatarWrap:hover::after{
									opacity: 0;
									transform: none;
								}
							}

							/* 入场一次性特效：柔光 + 轻微高光扫过 */
							.fxIntro{
								position: fixed;
								inset: 0;
								pointer-events: none;
								z-index: 0;
							}
							.fxIntro::before{
								content: "";
								position: absolute;
								inset: -20%;
								opacity: 0;

								/* 柔光（很淡） */
								background:
									radial-gradient(circle at 22% 18%, rgba(255,255,255,0.10), transparent 55%),
									radial-gradient(circle at 78% 26%, rgba(99,102,241,0.12), transparent 60%),
									radial-gradient(circle at 48% 10%, rgba(168,85,247,0.10), transparent 58%);
								mix-blend-mode: screen;

								transform: translate3d(-4%, -2%, 0) scale(1.02);
								animation: introGlow 1200ms cubic-bezier(.2,.8,.2,1) 120ms both;
							}
							.fxIntro::after{
								content: "";
								position: absolute;
								inset: 0;
								opacity: 0;

								/* 斜向高光（极淡） */
								background: linear-gradient(
									110deg,
									transparent 35%,
									rgba(255,255,255,0.08) 48%,
									transparent 62%
								);
								mix-blend-mode: screen;

								transform: translate3d(-20%, 0, 0);
								animation: introSheen 900ms cubic-bezier(.2,.8,.2,1) 220ms both;
							}

							@keyframes introGlow{
								0%   { opacity: 0;   filter: blur(0px); }
								35%  { opacity: 0.55; filter: blur(0px); }
								100% { opacity: 0;   transform: translate3d(3%, 1%, 0) scale(1.05); filter: blur(2px); }
							}
							@keyframes introSheen{
								0%   { opacity: 0; transform: translate3d(-22%, 0, 0); }
								25%  { opacity: 0.55; }
								100% { opacity: 0; transform: translate3d(22%, 0, 0); }
							}

							@media (prefers-reduced-motion: reduce){
								.fxIntro::before,
								.fxIntro::after{
									animation: none !important;
									opacity: 0 !important;
								}
							}
						`}</style>
					</div>
				</div>

				{/* 新增：底部版权（放到外层，位置更稳定） */}
				<footer className="footer">© 2026 {HOME.name}</footer>
			</div>
		</main>
	);
}
