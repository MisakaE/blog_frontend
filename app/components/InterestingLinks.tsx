"use client";

import { useEffect, useRef, useState } from "react";

interface LinkItem {
	name: string;
	url: string;
	desc?: string;
}

const ACCENTS = [
	"99 102 241",   // 靛蓝
	"34 197 94",    // 翠绿
	"168 85 247",   // 紫
	"245 158 11",   // 橙
	"236 72 153",   // 粉
	"59 130 246",   // 蓝
	"20 184 166",   // 青
	"251 113 133",  // 红
];

export default function InterestingLinks() {
	const [open, setOpen] = useState(false);
	const [links, setLinks] = useState<LinkItem[]>([]);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		fetch("/link.json")
			.then((res) => res.json())
			.then((data) => setLinks(Array.isArray(data) ? data : []))
			.catch(() => setLinks([]));
	}, []);

	// 点击外部关闭
	useEffect(() => {
		if (!open) return;
		const handler = (e: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, [open]);

	// 扇形角度范围：从 -75° 到 +75°（总 150°）
	const totalAngle = 150;
	const n = links.length;
	const startAngle = -(totalAngle / 2);
	const radius = 180;

	return (
		<div ref={containerRef} style={{ position: "relative", display: "inline-flex" }}>
			{/* 触发按钮 */}
			<button
				className="navBtn funBtn"
				style={{ ["--accent" as any]: "236 72 153", position: "relative", zIndex: 2 }}
				onClick={() => setOpen((v) => !v)}
			>
				有意思的页面
			</button>

			{/* 扇形展开的链接按钮 */}
			{links.map((link, i) => {
				const angle = n > 1
					? startAngle + (totalAngle / (n - 1)) * i
					: 0;
				const rad = (angle * Math.PI) / 180;
				const tx = Math.cos(rad) * radius;
				const ty = Math.sin(rad) * radius;

				return (
					<a
						key={link.url}
						href={link.url}
						target="_blank"
						rel="noopener noreferrer"
						className="linkTag fanItem"
						title={link.desc || link.name}
						style={{
							["--accent" as any]: ACCENTS[i % ACCENTS.length],
							["--tx" as any]: `${tx}px`,
							["--ty" as any]: `${ty}px`,
							["--delay" as any]: open ? `${i * 40}ms` : `${(n - 1 - i) * 30}ms`,
						}}
						data-open={open ? "1" : "0"}
					>
						<span className="linkTagName">{link.name}</span>
						{link.desc && (
							<span className="linkTagDesc">{link.desc}</span>
						)}
					</a>
				);
			})}

			<style>{`
				.linkTag{
					position: absolute;
					left: 50%;
					top: 50%;
					z-index: 1;
					white-space: nowrap;

					display: inline-flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					gap: 2px;

					padding: 14px 22px;
					border-radius: 999px;
					border: 1px solid rgba(255,255,255,0.16);
					background: rgba(0,0,0,0.18);

					color: rgba(255,255,255,0.90);
					font-size: 14px;
					font-weight: 600;
					letter-spacing: 0.2px;
					text-decoration: none;

					--accent: 255 255 255;
					transform: translate(-50%, -50%) scale(0.4);
					opacity: 0;
					pointer-events: none;
					transition:
						transform 320ms cubic-bezier(.2,.8,.2,1) var(--delay, 0ms),
						opacity 260ms ease var(--delay, 0ms),
						background 180ms ease,
						border-color 180ms ease,
						color 180ms ease,
						box-shadow 180ms ease;
				}
				.linkTag[data-open="1"]{
					transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1);
					opacity: 1;
					pointer-events: auto;
				}
				.linkTag:hover{
					background: rgba(255,255,255,0.10) !important;
					border-color: rgb(var(--accent) / 0.55) !important;
					color: #fff !important;
					box-shadow:
						0 0 0 5px rgb(var(--accent) / 0.10),
						0 12px 34px rgba(0,0,0,0.35) !important;
				}
				.linkTag:active{
					transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty) + 1px)) scale(0.97) !important;
				}
				.linkTagName{
					font-size: 14px;
					font-weight: 600;
					letter-spacing: 0.2px;
				}
				.linkTagDesc{
					font-size: 10px;
					font-weight: 400;
					color: rgba(255,255,255,0.50);
					letter-spacing: 0.1px;
					transition: color 180ms ease;
				}
				.linkTag:hover .linkTagDesc{
					color: rgba(255,255,255,0.70);
				}
				.funBtn{
					cursor: pointer;
					font-family: inherit;
					position: relative;
					z-index: 2;
				}
			`}</style>
		</div>
	);
}
