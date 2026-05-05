import type { Metadata } from "next";

export const metadata: Metadata = {
	title: {
		default: "MiskaE",
		template: "%s | MiskaE",
	},
	description: "个人站点：简介、项目与文章。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="zh-CN">
			<body>
				<a
					href="#content"
					className="skipLink"
					style={{
						position: "absolute",
						left: 12,
						top: 12,
						padding: "8px 10px",
						borderRadius: 10,
						border: "1px solid rgba(0,0,0,0.15)",
						background: "white",
						color: "#111",
						transform: "translateY(-200%)",
						transition: "transform 120ms ease",
						zIndex: 9999,
					}}
				>
					跳到主要内容
				</a>

				<div id="content">{children}</div>

				<style>{`
					:root { color-scheme: dark; }
					* { box-sizing: border-box; }
					html, body { height: 100%; }
					body {
						margin: 0;
						font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
					}
					a { text-decoration: none; }
					a:focus-visible { outline: 2px solid rgba(99,102,241,0.9); outline-offset: 2px; }

					/* 关键：用 CSS 处理显示/隐藏，避免事件处理器 */
					.skipLink:focus,
					.skipLink:focus-visible {
						transform: translateY(0) !important;
					}
				`}</style>
			</body>
		</html>
	);
}
