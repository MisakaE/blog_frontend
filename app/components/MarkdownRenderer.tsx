"use client";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Components } from "react-markdown";

interface MarkdownRendererProps {
	children: string;
}

export default function MarkdownRenderer({ children }: MarkdownRendererProps) {
	const components: Components = {
		code({ className, children, ...props }) {
			const match = /language-(\w+)/.exec(className || "");
			const codeString = String(children).replace(/\n$/, "");

			// 代码块（有语言标识）
			if (match) {
				return (
					<SyntaxHighlighter
						style={oneDark}
						language={match[1]}
						PreTag="div"
						customStyle={{
							borderRadius: 12,
							border: "1px solid rgba(255,255,255,0.10)",
							background: "rgba(0,0,0,0.30)",
							fontSize: 13,
							lineHeight: 1.6,
							maxWidth: "100%",
							overflowX: "auto",
						}}
						codeTagProps={{
							style: {
								wordBreak: "break-word",
								overflowWrap: "break-word",
								whiteSpace: "pre-wrap",
							},
						}}
					>
						{codeString}
					</SyntaxHighlighter>
				);
			}

			// 行内代码
			return (
				<code
					className={className}
					{...props}
					style={{
						fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
						fontSize: "0.88em",
						padding: "2px 6px",
						borderRadius: 6,
						background: "rgba(255,255,255,0.08)",
						color: "rgba(255,255,255,0.90)",
						wordBreak: "break-word",
						overflowWrap: "break-word",
					}}
				>
					{children}
				</code>
			);
		},

		// 图片自适应
		img({ src, alt, ...props }) {
			return (
				<img
					src={src}
					alt={alt}
					{...props}
					style={{
						maxWidth: "100%",
						height: "auto",
						borderRadius: 8,
					}}
				/>
			);
		},

		// 表格自适应
		table({ children, ...props }) {
			return (
				<div style={{ maxWidth: "100%", overflowX: "auto" }}>
					<table
						{...props}
						style={{
							borderCollapse: "collapse",
							fontSize: 13,
							lineHeight: 1.7,
							width: "auto",
							maxWidth: "100%",
						}}
					>
						{children}
					</table>
				</div>
			);
		},

		th({ children, ...props }) {
			return (
				<th
					{...props}
					style={{
						border: "1px solid rgba(255,255,255,0.16)",
						padding: "8px 12px",
						background: "rgba(255,255,255,0.06)",
						fontWeight: 600,
					}}
				>
					{children}
				</th>
			);
		},

		td({ children, ...props }) {
			return (
				<td
					{...props}
					style={{
						border: "1px solid rgba(255,255,255,0.12)",
						padding: "6px 12px",
					}}
				>
					{children}
				</td>
			);
		},

		// 普通 pre 也做溢出处理（无语言标识的代码块）
		pre({ children, ...props }) {
			return (
				<pre
					{...props}
					style={{
						overflowX: "auto",
						maxWidth: "100%",
						padding: "10px 12px",
						borderRadius: 12,
						border: "1px solid rgba(255,255,255,0.14)",
						background: "rgba(0,0,0,0.18)",
						fontSize: 13,
						lineHeight: 1.6,
						whiteSpace: "pre-wrap",
						wordBreak: "break-word",
						overflowWrap: "break-word",
					}}
				>
					{children}
				</pre>
			);
		},

		// 链接自动换行
		a({ children, ...props }) {
			return (
				<a
					{...props}
					style={{
						wordBreak: "break-all",
						overflowWrap: "break-word",
					}}
				>
					{children}
				</a>
			);
		},
	};

	return (
		<div
			style={{
				maxWidth: "100%",
				overflowWrap: "break-word",
				wordBreak: "break-word",
				minWidth: 0,
			}}
		>
			<ReactMarkdown
				remarkPlugins={[remarkMath]}
				rehypePlugins={[rehypeKatex]}
				components={components}
			>
				{children}
			</ReactMarkdown>
		</div>
	);
}
