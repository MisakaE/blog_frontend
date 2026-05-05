"use client";

import Link from "next/link"; // NEW
import { useEffect, useMemo, useState } from "react";

type PostItem = {
	id: string;
	title: string;
	date: string;
	desc: string;
	href: string;
	tags: string[];
};

export default function PostsClient({
	posts,
	initialTag,
	initialQuery,
}: {
	posts: PostItem[];
	initialTag?: string;
	initialQuery?: string;
}) {
	const [selectedTag, setSelectedTag] = useState((initialTag ?? "").trim());
	const [query, setQuery] = useState((initialQuery ?? "").trim());

	// 仅同步地址栏（不触发 Next 导航/不触发重新请求）
	useEffect(() => {
		try {
			const url = new URL(window.location.href);

			if (selectedTag) url.searchParams.set("tag", selectedTag);
			else url.searchParams.delete("tag");

			const q = query.trim();
			if (q) url.searchParams.set("q", q);
			else url.searchParams.delete("q");

			window.history.replaceState(null, "", url.toString());
		} catch {
			// ignore
		}
	}, [selectedTag, query]);

	const tagCounts = useMemo(() => {
		const acc: Record<string, number> = {};
		for (const p of posts) {
			for (const t of p.tags ?? []) {
				const key = String(t ?? "").trim();
				if (!key) continue;
				acc[key] = (acc[key] ?? 0) + 1;
			}
		}
		return acc;
	}, [posts]);

	const allTags = useMemo(() => {
		return Object.keys(tagCounts).sort((a, b) => (tagCounts[b] - tagCounts[a]) || a.localeCompare(b));
	}, [tagCounts]);

	const visiblePosts = useMemo(() => {
		const q = query.trim().toLowerCase();

		return posts.filter((p) => {
			// 1) tag 筛选：只看 tags
			if (selectedTag && !(p.tags ?? []).includes(selectedTag)) return false;

			// 2) 搜索：只搜 标题/摘要（不搜 tags，保证两者独立）
			if (!q) return true;
			const hay = `${p.title ?? ""}\n${p.desc ?? ""}`.toLowerCase();
			return hay.includes(q);
		});
	}, [posts, selectedTag, query]);

	const { grouped, months, years } = useMemo(() => {
		const sorted = [...visiblePosts].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
		const g = sorted.reduce((acc, p) => {
			const month = (p.date ?? "").slice(0, 7) || "Unknown";
			(acc[month] ??= []).push(p);
			return acc;
		}, {} as Record<string, PostItem[]>);
		const m = Object.keys(g).sort().reverse();
		const y = Array.from(new Set(m.map((x) => x.slice(0, 4)).filter(Boolean))).sort().reverse();
		return { grouped: g, months: m, years: y };
	}, [visiblePosts]);

	return (
		<div className="contentGrid">
			<div className="leftCol">
				<div className="entryList" aria-label="博客文章列表">
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

								{grouped[m].map((p) => (
									<Link
										key={`${p.date}-${p.title}`}
										className="entryBtn"
										href={p.href}
										prefetch={false}
										aria-label={`${p.title}（${p.date}）`}
										title={p.desc || p.title}
									>
										<span className="entryTitle">{p.title}</span>
										<span className="entryMeta">{p.date}</span>

										{p.tags?.length ? (
											<span className="entryTags" aria-label="标签">
												{p.tags.slice(0, 6).map((t) => (
													<span key={t} className="tagPill">
														{t}
													</span>
												))}
											</span>
										) : null}

										<span className="entryDesc">{p.desc || ""}</span>
									</Link>
								))}
							</div>
						);
					})}
				</div>

				{years.length > 1 ? (
					<div className="yearNav" aria-label="按年份快速跳转">
						{years.map((y) => (
							<a key={y} className="yearLink" href={`#y-${y}`}>
								{y}
							</a>
						))}
					</div>
				) : null}
			</div>

			<aside className="rightCol" aria-label="筛选与搜索">
				{/* 搜索：独立卡片（在“用tag筛选”上方） */}
				<div className="tagBox" aria-label="搜索">
					<div className="tagTitle">搜索</div>
					<div className="tagSearch" aria-label="搜索文章">
						<input
							className="tagSearchInput"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="搜索 标题 / 摘要"
						/>
						{query.trim() ? (
							<button type="button" className="tagSearchClear" onClick={() => setQuery("")}>
								清空
							</button>
						) : null}
					</div>
				</div>

				<div style={{ height: 12 }} />

				{/* 用 tag 筛选：独立卡片 */}
				<div className="tagBox" aria-label="用标签筛选">
					<div className="tagTitle">用 tag 筛选</div>

					<div className="tagList">
						<button
							type="button"
							className={`tagLink ${selectedTag ? "" : "active"}`}
							onClick={() => setSelectedTag("")}
						>
							<span>全部</span>
							<span className="tagCount">{posts.length}</span>
						</button>

						{allTags.map((t) => (
							<button
								key={t}
								type="button"
								className={`tagLink ${t === selectedTag ? "active" : ""}`}
								onClick={() => setSelectedTag(t)}
								title={`筛选：${t}`}
							>
								<span>{t}</span>
								<span className="tagCount">{tagCounts[t]}</span>
							</button>
						))}
					</div>
				</div>
			</aside>
		</div>
	);
}
