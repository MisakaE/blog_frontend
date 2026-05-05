"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import MarkdownRenderer from "../components/MarkdownRenderer";

// ==================== 操作定义 ====================
type OpKey = "add_post" | "del_post" | "add_diary" | "del_diary" | "add_friend" | "del_friend" | "edit_aboutme";

interface OpDef {
	key: OpKey;
	label: string;
	proxyPath: string;
	backendPath: string;
	fields: { name: string; label: string; type: "text" | "password" | "textarea"; placeholder?: string; required?: boolean }[];
	buildBody: (token: string, values: Record<string, string>) => Record<string, unknown>;
}

const OPS: OpDef[] = [
	{
		key: "add_post",
		label: "新增文章",
		proxyPath: "/api/admin/add_post",
		backendPath: "/addpost",
		fields: [
			{ name: "title", label: "title *", type: "text", required: true },
			{ name: "date", label: "date（YYYY-MM-DD，默认今天）", type: "text", placeholder: "2026-05-01" },
			{ name: "tags", label: "tags（逗号分隔）", type: "text", placeholder: "rust,rocket" },
			{ name: "desc", label: "desc", type: "textarea" },
			{ name: "md", label: "md（Markdown）", type: "textarea" },
		],
		buildBody: (token, v) => ({
			title: (v.title ?? "").trim(),
			time: Math.floor(new Date((v.date ?? "").trim() || todayLocalISO()).getTime() / 1000),
			tags: (v.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean),
			desc: v.desc ?? "",
			md: v.md ?? "",
		}),
	},
	{
		key: "del_post",
		label: "删除文章",
		proxyPath: "/api/admin/del_post",
		backendPath: "/delpost",
		fields: [
			{ name: "id", label: "id *", type: "text", required: true, placeholder: "1" },
		],
		buildBody: (_token, v) => ({ id: Number((v.id ?? "").trim()) }),
	},
	{
		key: "add_diary",
		label: "新增日记",
		proxyPath: "/api/admin/add_diary",
		backendPath: "/adddaily",
		fields: [
			{ name: "title", label: "title *", type: "text", required: true },
			{ name: "date", label: "date（YYYY-MM-DD，默认今天）", type: "text", placeholder: "2026-05-01" },
			{ name: "desc", label: "desc", type: "textarea" },
			{ name: "md", label: "md（Markdown）", type: "textarea" },
		],
		buildBody: (_token, v) => ({
			title: (v.title ?? "").trim(),
			time: Math.floor(new Date((v.date ?? "").trim() || todayLocalISO()).getTime() / 1000),
			desc: v.desc ?? "",
			md: v.md ?? "",
		}),
	},
	{
		key: "del_diary",
		label: "删除日记",
		proxyPath: "/api/admin/del_diary",
		backendPath: "/deldaily",
		fields: [
			{ name: "id", label: "id *", type: "text", required: true, placeholder: "1" },
		],
		buildBody: (_token, v) => ({ id: Number((v.id ?? "").trim()) }),
	},
	{
		key: "add_friend",
		label: "新增友链",
		proxyPath: "/api/admin/add_friend",
		backendPath: "/addfriend",
		fields: [
			{ name: "name", label: "name *", type: "text", required: true, placeholder: "Rust" },
			{ name: "href", label: "href *", type: "text", required: true, placeholder: "https://..." },
			{ name: "desc", label: "desc", type: "textarea" },
			{ name: "icon", label: "icon（图片链接）", type: "text", placeholder: "https://.../avatar.png" },
			{ name: "personalize", label: "personalize", type: "textarea" },
		],
		buildBody: (_token, v) => ({
			name: (v.name ?? "").trim(),
			href: /^https?:\/\//i.test((v.href ?? "").trim()) ? (v.href ?? "").trim() : `https://${((v.href ?? "").trim())}`,
			desc: v.desc ?? "",
			icon: /^https?:\/\//i.test((v.icon ?? "").trim()) ? (v.icon ?? "").trim() : ((v.icon ?? "").trim() ? `https://${(v.icon ?? "").trim()}` : undefined),
			personalize: (v.personalize ?? "").trim() || undefined,
		}),
	},
	{
		key: "del_friend",
		label: "删除友链",
		proxyPath: "/api/admin/del_friend",
		backendPath: "/delfriend",
		fields: [
			{ name: "name", label: "name *", type: "text", required: true, placeholder: "Rust" },
		],
		buildBody: (_token, v) => ({ name: (v.name ?? "").trim() }),
	},
	{
		key: "edit_aboutme",
		label: "编辑关于我",
		proxyPath: "/api/admin/edit_aboutme",
		backendPath: "/editaboutme",
		fields: [
			{ name: "name", label: "name", type: "text", placeholder: "Blog Author" },
			{ name: "bio", label: "bio", type: "textarea" },
			{ name: "piclink", label: "piclink（头像URL）", type: "text", placeholder: "https://..." },
			{ name: "md", label: "md（Markdown 自我介绍）", type: "textarea" },
		],
		buildBody: (_token, v) => ({
			name: (v.name ?? "").trim(),
			bio: v.bio ?? "",
			piclink: (v.piclink ?? "").trim(),
			md: v.md ?? "",
		}),
	},
];

// ==================== 工具 ====================
function todayLocalISO() {
	const d = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
	return d.toISOString().slice(0, 10);
}

// ==================== 组件 ====================
export default function AdminPage() {
	const [opKey, setOpKey] = useState<OpKey>("add_post");
	const [token, setToken] = useState("");
	const [values, setValues] = useState<Record<string, string>>({});
	const [submitting, setSubmitting] = useState(false);
	const [result, setResult] = useState("");

	// 删除预览：输入 ID 后自动查询标题
	const [previewLoading, setPreviewLoading] = useState(false);
	const [previewData, setPreviewData] = useState<{ title?: string; date?: string; desc?: string; error?: string } | null>(null);
	const previewTimer = useRef<ReturnType<typeof setTimeout>>(null);

	const op = OPS.find((o) => o.key === opKey)!;
	const isDelOp = opKey === "del_post" || opKey === "del_diary";
	const previewProxyPath = opKey === "del_post" ? "/api/admin/get_post" : "/api/admin/get_diary";

	// ID 变化时防抖查询标题
	const idValue = (values.id ?? "").trim();
	useEffect(() => {
		if (!isDelOp || !idValue || !/^\d+$/.test(idValue)) {
			setPreviewData(null);
			return;
		}

		if (previewTimer.current) clearTimeout(previewTimer.current);
		previewTimer.current = setTimeout(async () => {
			setPreviewLoading(true);
			try {
				const res = await fetch(`${previewProxyPath}?id=${encodeURIComponent(idValue)}`);
				if (!res.ok) {
					setPreviewData({ error: `未找到 (${res.status})` });
					return;
				}
				const data = await res.json();
				setPreviewData({
					title: data?.title,
					date: data?.date ?? (data?.time != null ? new Date(Number(data.time) * 1000).toISOString().slice(0, 10) : undefined),
					desc: data?.desc,
				});
			} catch {
				setPreviewData({ error: "查询失败" });
			} finally {
				setPreviewLoading(false);
			}
		}, 400); // 400ms 防抖

		return () => {
			if (previewTimer.current) clearTimeout(previewTimer.current);
		};
	}, [idValue, isDelOp, previewProxyPath]);

	// 切换操作时清空表单值（保留 token）
	function switchOp(key: OpKey) {
		setOpKey(key);
		setValues({});
		setResult("");
	}

	function setField(name: string, value: string) {
		setValues((prev) => ({ ...prev, [name]: value }));
	}

	const canSubmit = useMemo(() => {
		if (!token.trim()) return false;
		for (const f of op.fields) {
			if (f.required && !(values[f.name] ?? "").trim()) return false;
		}
		return true;
	}, [token, op, values]);

	async function onSubmit() {
		if (!canSubmit || submitting) return;
		setSubmitting(true);
		setResult("");

		try {
			const body = op.buildBody(token, values);
			const res = await fetch(op.proxyPath, {
				method: "POST",
				headers: {
					"content-type": "application/json",
					"Authorization": `Bearer ${token.trim()}`,
				},
				body: JSON.stringify(body),
			});

			const text = await res.text();
			if (!res.ok) {
				let msg = text;
				try { const j = JSON.parse(text); msg = JSON.stringify(j, null, 2); } catch { /* use raw */ }
				setResult(`❌ HTTP ${res.status}\n${msg}`);
				return;
			}
			// 尝试格式化 JSON
			let display = text;
			try { display = JSON.stringify(JSON.parse(text), null, 2); } catch { /* use raw */ }
			setResult(`✅ 成功\n${display}`);

			// 提交成功后清空表单值（保留 token 和操作类型）
			setValues({});
		} catch (e: any) {
			setResult(`❌ 网络错误：${e?.message ?? String(e)}`);
		} finally {
			setSubmitting(false);
		}
	}

	// 是否有 md 字段（用于实时预览）
	const hasMd = op.fields.some((f) => f.name === "md");
	const mdContent = values.md ?? "";

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
					background: "linear-gradient(180deg, rgba(10,12,20,0.78), rgba(10,12,20,0.72) 35%, rgba(10,12,20,0.80))",
				}}
			>
				<div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 18px 54px" }}>
					<div className="panelPos" style={{ position: "relative", top: "38.2vh", transform: "translateY(-50%)" }}>
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
								{/* 头部 */}
								<header style={{ paddingBottom: 14 }}>
									<h1 style={{ margin: 0, fontSize: 22, fontWeight: 750, letterSpacing: 0.2 }}>Admin</h1>
									<p style={{ margin: "10px 0 0", color: "rgba(255,255,255,0.86)", lineHeight: 1.8 }}>
										POST → <code className="mono">{op.proxyPath}</code>
										<span style={{ color: "rgba(255,255,255,0.45)" }}>（后端 <code className="mono">{op.backendPath}</code>）</span>
									</p>
								</header>

								<section style={{ padding: "18px 0", borderTop: "1px solid rgba(255,255,255,0.14)" }}>
									{/* 操作选择下拉 + token */}
									<div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
										<label className="field" style={{ minWidth: 160 }}>
											<span className="label">操作类型</span>
											<select
												className="input select"
												value={opKey}
												onChange={(e) => switchOp(e.target.value as OpKey)}
											>
												{OPS.map((o) => (
													<option key={o.key} value={o.key}>{o.label}</option>
												))}
											</select>
										</label>

										<label className="field" style={{ flex: 1, minWidth: 140 }}>
											<span className="label">token *</span>
											<input className="input" type="password" value={token} onChange={(e) => setToken(e.target.value)} />
										</label>
									</div>

									{/* 表单 + 预览网格 */}
									<div className={hasMd ? "grid" : ""}>
										<div className="form">
											{op.fields.map((f) =>
												f.type === "textarea" ? (
													<label key={f.name} className="field">
														<span className="label">{f.label}</span>
														<textarea
															className="textarea"
															value={values[f.name] ?? ""}
															onChange={(e) => setField(f.name, e.target.value)}
															rows={f.name === "md" ? 12 : 3}
															placeholder={f.placeholder}
														/>
													</label>
												) : (
													<label key={f.name} className="field">
														<span className="label">{f.label}</span>
														<input
															className="input"
															type={f.type}
															value={values[f.name] ?? ""}
															onChange={(e) => setField(f.name, e.target.value)}
															placeholder={f.placeholder}
														/>
													</label>
												)
											)}

											{/* 删除预览：输入 ID 后显示对应标题 */}
											{isDelOp && idValue && (
												<div
													style={{
														marginTop: 2,
														padding: "10px 14px",
														borderRadius: 10,
														border: "1px solid rgba(255,255,255,0.10)",
														background: "rgba(255,255,255,0.04)",
														fontSize: 13,
														lineHeight: 1.6,
													}}
												>
													{previewLoading ? (
														<span style={{ color: "rgba(255,255,255,0.45)" }}>查询中…</span>
													) : previewData?.error ? (
														<span style={{ color: "rgba(255,100,100,0.80)" }}>⚠ {previewData.error}</span>
													) : previewData?.title ? (
														<>
															<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
																<span style={{ color: "rgba(255,255,255,0.55)" }}>📄</span>
																<strong style={{ color: "rgba(255,255,255,0.90)" }}>{previewData.title}</strong>
																{previewData.date ? (
																	<span style={{
																		fontSize: 11,
																		color: "rgba(255,255,255,0.45)",
																		border: "1px solid rgba(255,255,255,0.10)",
																		borderRadius: 6,
																		padding: "1px 6px",
																	}}>
																		{previewData.date}
																	</span>
																) : null}
															</div>
															{previewData.desc ? (
																<div style={{ marginTop: 4, color: "rgba(255,255,255,0.55)", fontSize: 12 }}>
																	{previewData.desc}
																</div>
															) : null}
														</>
													) : null}
												</div>
											)}

											<div className="actions">
												<button className="btn" type="button" disabled={!canSubmit || submitting} onClick={onSubmit}>
													{submitting ? "提交中..." : "提交"}
												</button>
												<span className="hint">
													* 必填：token{op.fields.filter((f) => f.required).map((f) => ` / ${f.name.replace(/_/g, " ")}`)}
												</span>
											</div>

											{result ? (
												<pre className="result" aria-label="提交结果">{result}</pre>
											) : null}
										</div>

										{hasMd ? (
											<aside className="previewPane" aria-label="实时预览">
												<div className="previewHead">
													<div className="previewTitle">实时预览</div>
													<div className="previewMeta">
														<span className="pill">{values.date?.trim() || todayLocalISO()}</span>
														<span className="pill">{values.title?.trim() || "Untitled"}</span>
													</div>
												</div>
												<div className="previewBody">
													{values.tags?.trim() ? <p className="previewDesc">tags: {values.tags}</p> : null}
													{mdContent.trim() ? (
														<MarkdownRenderer>
															{mdContent}
														</MarkdownRenderer>
													) : (
														<p style={{ color: "rgba(255,255,255,0.45)" }}>输入 Markdown 后实时预览…</p>
													)}
												</div>
											</aside>
										) : null}
									</div>
								</section>
							</div>
						</div>
					</div>

					<footer className="footer">© 2026 MisakaE</footer>

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

						.grid{ display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
						@media (max-width: 740px) { .grid{ grid-template-columns: 1fr; } }

						.form{ display: flex; flex-direction: column; gap: 10px; }
						.field{ display: flex; flex-direction: column; gap: 5px; }
						.label{ font-size: 12px; color: rgba(255,255,255,0.72); }
						.input, .textarea, .select{
							padding: 10px 12px;
							border-radius: 12px;
							border: 1px solid rgba(255,255,255,0.14);
							background: rgba(0,0,0,0.14);
							color: rgba(255,255,255,0.90);
							font-size: 13px;
						}
						.select{ cursor: pointer; appearance: auto; }
						.select option{ background: #1a1a2e; color: #fff; }
						.textarea{ resize: vertical; }
						.input:focus-visible, .textarea:focus-visible, .select:focus-visible{
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
							padding: 10px 18px;
							border-radius: 12px;
							border: 1px solid rgba(255,255,255,0.16);
							background: rgba(255,255,255,0.06);
							color: rgba(255,255,255,0.90);
							font-size: 13px;
							cursor: pointer;
							transition: background 140ms ease, border-color 140ms ease;
						}
						.btn:hover:not(:disabled){
							background: rgba(255,255,255,0.12);
							border-color: rgba(255,255,255,0.25);
						}
						.btn:disabled{ opacity: 0.4; cursor: not-allowed; }
						.hint{ font-size: 11px; color: rgba(255,255,255,0.45); }
						.result{
							margin-top: 8px;
							padding: 10px 12px;
							border-radius: 12px;
							border: 1px solid rgba(255,255,255,0.12);
							background: rgba(0,0,0,0.18);
							color: rgba(255,255,255,0.82);
							font-size: 12px;
							white-space: pre-wrap;
							word-break: break-all;
							max-height: 180px;
							overflow-y: auto;
						}

						/* 预览窗格 */
						.previewPane{
							border: 1px solid rgba(255,255,255,0.12);
							border-radius: 14px;
							background: rgba(0,0,0,0.15);
							overflow: hidden;
							display: flex;
							flex-direction: column;
							max-height: 56vh;
						}
						.previewHead{
							padding: 12px 14px;
							border-bottom: 1px solid rgba(255,255,255,0.10);
							display: flex;
							align-items: center;
							justify-content: space-between;
							gap: 10px;
						}
						.previewTitle{ font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.72); }
						.previewMeta{ display: flex; gap: 6px; }
						.pill{
							padding: 3px 8px;
							border-radius: 8px;
							border: 1px solid rgba(255,255,255,0.12);
							font-size: 11px;
							color: rgba(255,255,255,0.66);
						}
						.previewBody{
							padding: 14px;
							overflow-y: auto;
							overflow-x: hidden;
							flex: 1;
							color: rgba(255,255,255,0.82);
							font-size: 13px;
							line-height: 1.7;
							overflow-wrap: break-word;
							word-break: break-word;
							min-width: 0;
						}
						.previewBody :where(img, video, svg){
							max-width: 100%;
							height: auto;
						}
						.previewBody h1,.previewBody h2,.previewBody h3{ color: rgba(255,255,255,0.92); }
						.previewBody code{ font-family: ui-monospace, monospace; font-size: 12px; }
						.previewBody pre{
							padding: 10px;
							border-radius: 10px;
							background: rgba(0,0,0,0.25);
							overflow-x: auto;
						}
						.previewDesc{ font-size: 11px; color: rgba(255,255,255,0.50); margin-bottom: 8px; }

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
					`}</style>
				</div>
			</div>
		</main>
	);
}
