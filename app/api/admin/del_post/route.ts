// 代理 POST /delpost 到后端，绕过浏览器 CORS
const BACKEND = process.env.BACKEND_API_URL ?? "http://127.0.0.1:8000";

export async function POST(req: Request) {
	try {
		const body = await req.text();
		const auth = req.headers.get("authorization") || req.headers.get("x-token") || "";

		const res = await fetch(`${BACKEND}/delpost`, {
			method: "POST",
			headers: {
				"content-type": "application/json",
				...(auth ? { authorization: auth } : {}),
			},
			body,
		});

		const text = await res.text();
		return new Response(text, {
			status: res.status,
			headers: { "content-type": res.headers.get("content-type") ?? "text/plain" },
		});
	} catch (e: any) {
		return new Response(e?.message ?? "Proxy error", { status: 502 });
	}
}
