"use client";

import { useMemo, useState } from "react";

const ADMIN_ADD_DIARY_URL =
	process.env.NEXT_PUBLIC_ADMIN_ADD_DIARY_URL ??
	process.env.ADMIN_ADD_DIARY_URL ??
	"/api/admin/add_diary";

// 轻量 Markdown 预览：不引依赖，覆盖常用语法（标题/粗体/斜体/行内代码/链接/段落/代码块）
function escapeHtml(s: string) {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function renderMarkdownLite(src: string) {
	const input = src ?? "";
	// code fences
	const parts = input.split(/```/g);
	let out = "";
	for (let i = 0; i < parts.length; i++) {
		const chunk = parts[i];
		if (i % 2 === 1) {
			// ```lang?\ncode...
			const code = chunk.replace(/^\w*\n?/, "");
			out += `<pre class="md-pre"><code>${escapeHtml(code)}</code></pre>`;
		} else {
			let t = escapeHtml(chunk);

			// headings
			t = t.replace(/^###### (.*)$/gm, "<h6>$1</h6>");
			t = t.replace(/^##### (.*)$/gm, "<h5>$1</h5>");
			t = t.replace(/^#### (.*)$/gm, "<h4>$1</h4>");
			t = t.replace(/^### (.*)$/gm, "<h3>$1</h3>");
			t = t.replace(/^## (.*)$/gm, "<h2>$1</h2>");
			t = t.replace(/^# (.*)$/gm, "<h1>$1</h1>");

			// inline code
			t = t.replace(/`([^`\n]+)`/g, "<code class=\"md-code\">$1</code>");
			// bold / italic（简单版，避免过度复杂）
			t = t.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");
			t = t.replace(/\*([^*\n]+)\*/g, "<em>$1</em>");
			// links
			t = t.replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g, `<a href="$2" target="_blank" rel="noreferrer">$1</a>`);

			// NEW: images (支持 https://... 或站内 /xxx.jpg)
			// 先做图片，再做 links，避免 ![alt](url) 被 link 规则吃掉一半
			t = t.replace(
				/!\[([^\]\n]*)\]\(((?:https?:\/\/|\/)[^\s)]+)\)/g,
				`<img class="md-img" src="$2" alt="$1" loading="lazy" />`,
			);

			// paragraphs: split by blank lines
			t = t
				.split(/\n{2,}/g)
				.map((p) => p.trim())
				.filter(Boolean)
				.map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
				.join("");

			out += t;
		}
	}
	return out;
}

// 注：右侧预览为轻量 Markdown（不引依赖），仅覆盖常用语法；以最终后端/前端实际渲染为准

function todayLocalISO() {
	const d = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
	return d.toISOString().slice(0, 10);
}

export default function Page() {
	const [token, setToken] = useState("");
	const [title, setTitle] = useState("");
	const [desc, setDesc] = useState("");
	const [md, setMd] = useState("");
	const [date, setDate] = useState(() => todayLocalISO()); // was ""

	const [submitting, setSubmitting] = useState(false);
	const [result, setResult] = useState<string>("");

	const canSubmit = useMemo(() => {
		return token.trim() && title.trim(); // was token/title/date
	}, [token, title]);

	const previewHtml = useMemo(() => renderMarkdownLite(md), [md]);

	async function onSubmit() {
		if (!canSubmit || submitting) return;
		setSubmitting(true);
		setResult("");

		try {
			const res = await fetch(ADMIN_ADD_DIARY_URL, {
				method: "POST",
				headers: {
					"content-type": "application/json",
					accept: "application/json",
					"Authorization": `Bearer ${token.trim()}`,
				},
				body: JSON.stringify({
					title: title.trim(),
					desc,
					md,
					time: Math.floor(new Date(date.trim() || todayLocalISO()).getTime() / 1000),
				}),
			});

			const text = await res.text().catch(() => "");
			if (!res.ok) {
				setResult(`失败：HTTP ${res.status}\n${text}`);
				return;
			}
			setResult(`成功\n${text}`);

			// 可选：提交成功后清空内容（保留 token/date 方便连发）
			setTitle("");
			setDesc("");
			setMd("");
		} catch (e: any) {
			setResult(`失败：${e?.message ?? String(e)}`);
		} finally {
			setSubmitting(false);
		}
	}

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
				<div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 18px 54px" }}>
					<div className="panelPos" style={{ position: "relative", top: "44vh", transform: "translateY(-50%)" }}>
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
									paddingBottom: 18,
								}}
							>
								<header style={{ paddingBottom: 14 }}>
									<h1 style={{ margin: 0, fontSize: 22, fontWeight: 750, letterSpacing: 0.2 }}>Admin · Add Diary</h1>
									<p style={{ margin: "10px 0 0", color: "rgba(255,255,255,0.86)", lineHeight: 1.8 }}>
										POST → <code className="mono">{ADMIN_ADD_DIARY_URL}</code>
									</p>
								</header>

								<section style={{ padding: "18px 0", borderTop: "1px solid rgba(255,255,255,0.14)" }}>
									<div className="grid">
										{/* 左：表单 */}
										<div className="form">
											<label className="field">
												<span className="label">token *</span>
												<input className="input" type="password" value={token} onChange={(e) => setToken(e.target.value)} />
											</label>

											<label className="field">
												<span className="label">title *</span>
												<input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
											</label>

											<label className="field">
												<span className="label">date（YYYY-MM-DD，不填默认今天）</span>
												<input className="input" value={date} onChange={(e) => setDate(e.target.value)} placeholder={todayLocalISO()} />
											</label>

											<label className="field">
												<span className="label">desc</span>
												<textarea className="textarea" value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} />
											</label>

											<label className="field">
												<span className="label">md</span>
												<textarea className="textarea" value={md} onChange={(e) => setMd(e.target.value)} rows={14} />
											</label>

											<div className="actions">
												<button className="btn" type="button" disabled={!canSubmit || submitting} onClick={onSubmit}>
													{submitting ? "提交中..." : "提交"}
												</button>
												<span className="hint">* 必填：token/title/date</span>
											</div>

											{result ? (
												<pre className="result" aria-label="提交结果">
													{result}
												</pre>
											) : null}
										</div>

										{/* 右：实时预览 */}
										<aside className="previewPane" aria-label="实时预览">
											<div className="previewHead">
												<div className="previewTitle">实时预览</div>
												<div className="previewMeta">
													<span className="pill">{date.trim() || todayLocalISO()}</span>
													<span className="pill">{title.trim() || "Untitled"}</span>
												</div>
											</div>
											<div className="previewBody">
												{desc.trim() ? <p className="previewDesc">{desc}</p> : null}
												<div className="md" dangerouslySetInnerHTML={{ __html: previewHtml }} />
											</div>
										</aside>
									</div>
								</section>
							</div>
						</div>
					</div>

					<style>{`
						.pageEnter{
							animation: pageEnter 260ms cubic-bezier(.2,.8,.2,1) both;
							will-change: transform, opacity;
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
						@media (max-height: 720px) {
							.panelPos { top: 0 !important; transform: none !important; padding-top: 24px; }
						}

						.mono{
							font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
							font-size: 12.5px;
						}

						.form{ display: flex; flex-direction: column; gap: 12px; }
						.field{ display: flex; flex-direction: column; gap: 6px; }
						.label{ font-size: 12px; color: rgba(255,255,255,0.72); }
						.input, .textarea{
							padding: 10px 12px;
							border-radius: 12px;
							border: 1px solid rgba(255,255,255,0.14);
							background: rgba(0,0,0,0.14);
							color: rgba(255,255,255,0.90);
							font-size: 13px;
						}
						.textarea{ resize: vertical; }
						.input:focus-visible, .textarea:focus-visible{
							outline: 2px solid rgba(99,102,241,0.9);
							outline-offset: 2px;
						}
						.actions{
							display: flex;
							align-items: center;
							gap: 12px;
							margin-top: 4px;
						}
						.btn{
							padding: 10px 14px;
							border-radius: 12px;
							border: 1px solid rgba(255,255,255,0.16);
							background: rgba(255,255,255,0.06);
							color: rgba(255,255,255,0.92);
							font-size: 13px;
							cursor: pointer;
							transition: background 140ms ease, border-color 140ms ease, color 140ms ease;
						}
						.btn:hover{ background: rgba(255,255,255,0.10); border-color: rgba(255,255,255,0.22); color: #fff; }
						.btn:disabled{ opacity: 0.55; cursor: not-allowed; }
						.hint{ font-size: 12px; color: rgba(255,255,255,0.55); }

						.result{
							margin: 10px 0 0;
							white-space: pre-wrap;
							word-break: break-word;
							overflow: auto;
							padding: 10px 12px;
							border-radius: 12px;
							border: 1px solid rgba(255,255,255,0.14);
							background: rgba(0,0,0,0.18);
							color: rgba(255,255,255,0.86);
							font-size: 12.5px;
						}

						.grid{
							display: grid;
							grid-template-columns: 1fr 1fr;
							gap: 14px;
							align-items: start;
						}
						@media (max-width: 980px){
							.grid{ grid-template-columns: 1fr; }
						}

						.previewPane{
							border-radius: 14px;
							border: 1px solid rgba(255,255,255,0.14);
							background: rgba(0,0,0,0.14);
							padding: 12px;
							min-height: 520px;
						}
						.previewHead{
							display: flex;
							align-items: baseline;
							justify-content: space-between;
							gap: 10px;
							padding-bottom: 10px;
							border-bottom: 1px solid rgba(255,255,255,0.12);
						}
						.previewTitle{
							font-size: 13px;
							font-weight: 700;
							letter-spacing: .2px;
							color: rgba(255,255,255,0.92);
						}
						.previewMeta{
							display: inline-flex;
							flex-wrap: wrap;
							gap: 8px;
							justify-content: flex-end;
						}
						.pill{
							font-size: 12px;
							color: rgba(255,255,255,0.72);
							border: 1px solid rgba(255,255,255,0.14);
							border-radius: 999px;
							padding: 4px 8px;
							background: rgba(255,255,255,0.04);
							max-width: 36ch;
							overflow: hidden;
							text-overflow: ellipsis;
							white-space: nowrap;
						}

						.previewBody{
							padding-top: 10px;
							max-height: 62vh;
							overflow: auto;
						}
						.previewDesc{
							margin: 0 0 10px;
							color: rgba(255,255,255,0.78);
							line-height: 1.7;
							font-size: 13px;
						}

						.md{ color: rgba(255,255,255,0.88); line-height: 1.75; font-size: 13px; }
						.md h1{ font-size: 20px; margin: 12px 0 8px; }
						.md h2{ font-size: 18px; margin: 12px 0 8px; }
						.md h3{ font-size: 16px; margin: 12px 0 8px; }
						.md h4,.md h5,.md h6{ font-size: 14px; margin: 12px 0 8px; }
						.md p{ margin: 0 0 10px; }
						.md a{ color: rgba(99,102,241,0.95); text-decoration: underline; }
						.md-code{
							font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono","Courier New", monospace;
							font-size: 12.5px;
							padding: 0 6px;
							border-radius: 8px;
							border: 1px solid rgba(255,255,255,0.14);
							background: rgba(0,0,0,0.20);
						}
						.md-pre{
							margin: 0 0 10px;
							overflow: auto;
							padding: 10px 12px;
							border-radius: 12px;
							border: 1px solid rgba(255,255,255,0.14);
							background: rgba(0,0,0,0.22);
						}
						.md-pre code{
							font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono","Courier New", monospace;
							font-size: 12.5px;
							white-space: pre;
						}

						/* NEW: 图片样式（自适应、圆角、不撑破容器） */
						.md-img{
							max-width: 100%;
							height: auto;
							display: block;
							margin: 8px 0 10px;
							border-radius: 12px;
							border: 1px solid rgba(255,255,255,0.12);
							background: rgba(0,0,0,0.12);
						}
					`}</style>
				</div>
			</div>
		</main>
	);
}
