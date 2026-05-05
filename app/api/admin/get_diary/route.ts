// 代理 GET /daily?id= 到后端，用于 admin 删除预览
const BACKEND = process.env.BACKEND_API_URL ?? "http://127.0.0.1:8000";

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const id = searchParams.get("id");
	if (!id) return new Response('{"error":"missing id"}', { status: 400, headers: { "content-type": "application/json" } });

	try {
		const res = await fetch(`${BACKEND}/daily?id=${encodeURIComponent(id)}`, {
			headers: { accept: "application/json" },
		});
		const text = await res.text();
		return new Response(text, {
			status: res.status,
			headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
		});
	} catch (e: any) {
		return new Response(JSON.stringify({ error: e?.message ?? "Proxy error" }), {
			status: 502,
			headers: { "content-type": "application/json" },
		});
	}
}
