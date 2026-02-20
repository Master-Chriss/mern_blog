import { formatISO9075 } from 'date-fns';
import { Link } from 'react-router-dom';

// Make sure 'content' is included in the props here!
export default function Post({
	_id,
	title,
	summary,
	cover,
	createdAt,
	author,
	content,
}) {
	const calculateReadTime = (htmlContent) => {
		if (!htmlContent) return 0;
		const text = htmlContent.replace(/<[^>]*>?/gm, '');
		const wordCount = text.trim().split(/\s+/).length;
		const minutes = Math.ceil(wordCount / 225);
		return minutes;
	};

	// 1. PLACE LOGIC HERE
	const readTime = calculateReadTime(content);
	const coverUrl = cover
		? cover.startsWith('http')
			? cover
			: `http://localhost:4000/${cover.replace(/\\/g, '/')}`
		: '';

	return (
		<div className="group relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-500/10">
			<Link to={`/post/${_id}`} className="block overflow-hidden h-48">
				{coverUrl ? (
					<img
						src={coverUrl}
						alt={title}
						className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
					/>
				) : (
					<div className="w-full h-full bg-slate-800/60" />
				)}
			</Link>

			<div className="p-6">
				<div className="flex items-center justify-between mb-3">
					{/* 2. PLACE UI HERE (Next to Author) */}
					<div className="flex flex-col">
						<span className="text-xs font-medium text-cyan-400 tracking-tighter">
							@{author?.username}_The_Blogger
						</span>
						{/* Added Read Time here for a professional look */}
						<div className="flex items-center gap-1 text-[10px] font-mono text-cyan-500/60 tracking-widest mt-1">
							<svg
								className="w-3 h-3"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<span className="text-[13px]">{readTime} Minutes(s) Read</span>
						</div>
					</div>

					<time className="text-xs text-slate-500">
						{formatISO9075(new Date(createdAt))}
					</time>
				</div>

				<Link to={`/post/${_id}`}>
					<h2 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-cyan-300 transition-colors">
						{title}
					</h2>
				</Link>

				<p className="text-slate-400 text-sm line-clamp-3 leading-relaxed">
					{summary}
				</p>

				<div className="mt-6 flex items-center justify-between">
					<span className="text-[12px] font-mono text-slate-300">
						Posted By @{author?.username}
					</span>
					<Link
						to={`/post/${_id}`}
						className="text-sm font-semibold text-white group-hover:text-cyan-400 flex items-center gap-1">
						Read Article <span>→</span>
					</Link>
				</div>
			</div>
		</div>
	);
}
