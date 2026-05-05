export default function Loading() {
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
					<div className="panelPos" style={{ position: "relative", top: "52vh", transform: "translateY(-50%)" }}>
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
								<div className="sk skTitle" />
								<div className="sk skMeta" />

								<div style={{ padding: "18px 0", borderTop: "1px solid rgba(255,255,255,0.14)", marginTop: 14 }}>
									<div className="sk skLine" />
									<div className="sk skLine" />
									<div className="sk skLine" />
									<div className="sk skLine short" />
								</div>
							</div>
						</div>
					</div>

					<style>{`
						.pageEnter{
							animation: pageEnter 220ms cubic-bezier(.2,.8,.2,1) both;
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

						.sk{
							border-radius: 10px;
							border: 1px solid rgba(255,255,255,0.10);
							background: rgba(255,255,255,0.08);
							overflow: hidden;
							position: relative;
						}
						.sk::after{
							content: "";
							position: absolute;
							inset: 0;
							background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.10) 50%, transparent 70%);
							transform: translateX(-120%);
							animation: shimmer 1100ms ease-in-out infinite;
						}
						@keyframes shimmer{
							to { transform: translateX(120%); }
						}
						.skTitle{ height: 22px; width: 62%; }
						.skMeta{ height: 12px; width: 28%; margin-top: 10px; opacity: 0.9; }
						.skLine{ height: 14px; width: 100%; margin-top: 10px; opacity: 0.85; }
						.skLine.short{ width: 72%; }
					`}</style>
				</div>
			</div>
		</main>
	);
}
