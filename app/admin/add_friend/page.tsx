"use client";

import { useMemo, useState } from "react";

const ADMIN_ADD_FRIEND_URL =
	process.env.NEXT_PUBLIC_ADMIN_ADD_FRIEND_URL ??
	process.env.ADMIN_ADD_FRIEND_URL ??
	"/api/admin/add_friend";

export default function Page() {
	const [token, setToken] = useState("");
	const [name, setName] = useState("");
	const [href, setHref] = useState("");
	const [desc, setDesc] = useState("");
	const [icon, setIcon] = useState("");          // 图片链接
	const [personalize, setPersonalize] = useState(""); // 个性化描述

	const [submitting, setSubmitting] = useState(false);
	const [result, setResult] = useState<string>("");

	const canSubmit = useMemo(() => token.trim() && name.trim() && href.trim(), [token, name, href]);

	async function onSubmit() {
		if (!canSubmit || submitting) return;
		setSubmitting(true);
		setResult("");

		try {
			const rawHref = href.trim();
			const fullHref = /^https?:\/\//i.test(rawHref) ? rawHref : `https://${rawHref}`;
			const rawIcon = icon.trim();
			const fullIcon = /^https?:\/\//i.test(rawIcon) ? rawIcon : rawIcon ? `https://${rawIcon}` : undefined;
			const res = await fetch(ADMIN_ADD_FRIEND_URL, {
				method: "POST",
				headers: {
					"content-type": "application/json",
					accept: "application/json",
					"Authorization": `Bearer ${token.trim()}`,
				},
				body: JSON.stringify({
					name: name.trim(),
					href: fullHref,
					desc,
					icon: fullIcon,
					personalize: personalize.trim() || undefined,
				}),
			});

			const text = await res.text().catch(() => "");
			if (!res.ok) {
				setResult(`失败：HTTP ${res.status}\n${text}`);
				return;
			}
			setResult(`成功\n${text}`);

			// 清空内容（保留 token 方便连发）
			setName("");
			setHref("");
			setDesc("");
			setIcon("");
			setPersonalize("");
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
				<div style={{ maxWidth: 920, margin: "0 auto", padding: "0 18px 54px" }}>
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
									<h1 style={{ margin: 0, fontSize: 22, fontWeight: 750, letterSpacing: 0.2 }}>Admin · Add Friend</h1>
									<p style={{ margin: "10px 0 0", color: "rgba(255,255,255,0.86)", lineHeight: 1.8 }}>
										POST → <code className="mono">{ADMIN_ADD_FRIEND_URL}</code>
									</p>
								</header>

								<section style={{ padding: "18px 0", borderTop: "1px solid rgba(255,255,255,0.14)" }}>
									<div className="form">
										<label className="field">
											<span className="label">token *</span>
											<input className="input" type="password" value={token} onChange={(e) => setToken(e.target.value)} />
										</label>

										<label className="field">
											<span className="label">name *</span>
											<input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="朋友昵称" />
										</label>

										<label className="field">
											<span className="label">href *</span>
											<input className="input" value={href} onChange={(e) => setHref(e.target.value)} placeholder="https://example.com" />
										</label>

										<label className="field">
											<span className="label">desc</span>
											<textarea className="textarea" value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} />
										</label>

										<label className="field">
						<span className="label">icon（可选 图片链接）</span>
										<input
											className="input"
											value={icon}
											onChange={(e) => setIcon(e.target.value)}
											placeholder="https://.../avatar.png"
											/>
										</label>

										<label className="field">
											<span className="label">personalize（可选个性化描述）</span>
											<textarea className="textarea" value={personalize} onChange={(e) => setPersonalize(e.target.value)} rows={2} />
										</label>

										<div className="actions">
											<button className="btn" type="button" disabled={!canSubmit || submitting} onClick={onSubmit}>
												{submitting ? "提交中..." : "提交"}
											</button>
											<span className="hint">* 必填：token/name/href</span>
										</div>

										{result ? (
											<pre className="result" aria-label="提交结果">
												{result}
											</pre>
										) : null}
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
					`}</style>
				</div>
			</div>
		</main>
	);
}
