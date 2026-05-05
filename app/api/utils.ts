const BACKEND = process.env.BACKEND_URL!;

export interface Post {
	id: number;
	title: string;
	time: number;
	tags: string[];
	desc: string;
	md: string;
}

export interface Diary {
	id: number;
	title: string;
	time: number;
	desc: string;
	md: string;
}

export async function getPost(id: number): Promise<Post> {
	const res = await fetch(`${BACKEND}/post/${id}`);
	if (!res.ok) {
		throw new Error(`Failed to fetch post: ${res.statusText}`);
	}
	const data = await res.json();
	return data.data;
}

export async function getDiary(id: number): Promise<Diary> {
	const res = await fetch(`${BACKEND}/daily/${id}`);
	if (!res.ok) {
		throw new Error(`Failed to fetch diary: ${res.statusText}`);
	}
	const data = await res.json();
	return data.data;
}
