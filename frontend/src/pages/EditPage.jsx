import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export default function EditPage() {
	const { id } = useParams();
	const [title, setTitle] = useState('');
	const [summary, setSummary] = useState('');
	const [content, setContent] = useState('');
	const [files, setFiles] = useState('');
	const [redirect, setRedirect] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		setLoading(true);
		fetch(`http://localhost:4000/post/${id}`)
			.then((response) => {
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				return response.json();
			})
			.then((postInfo) => {
				setTitle(postInfo.title);
				setSummary(postInfo.summary);
				setContent(postInfo.content);
				setError(null);
			})
			.catch((err) => {
				console.error('Fetch error:', err);
				setError('Failed to load post. Make sure the backend is running.');
			})
			.finally(() => {
				setLoading(false);
			});
	}, [id]);

	async function updatePost(ev) {
		ev.preventDefault();
		const data = new FormData();
		data.set('title', title);
		data.set('summary', summary);
		data.set('content', content);
		data.set('id', id);
		if (files?.[0]) data.set('file', files?.[0]);

		try {
			const response = await fetch(`http://localhost:4000/post/${id}`, {
				method: 'PUT',
				body: data,
				credentials: 'include',
			});
			if (response.ok) {
				setRedirect(true);
			} else {
				const errorData = await response.json();
				console.error('Update failed:', errorData);
				alert(
					'Failed to update post: ' + (errorData.message || 'Unknown error'),
				);
			}
		} catch (error) {
			console.error('Network error:', error);
			alert('Network error - could not update post');
		}
	}

	if (redirect) return <Navigate to={`/post/${id}`} />;

	if (loading)
		return (
			<div className="min-h-screen bg-[#0d0e2b] flex items-center justify-center">
				<div className="text-white text-xl">Loading post...</div>
			</div>
		);

	if (error)
		return (
			<div className="min-h-screen bg-[#0d0e2b] flex items-center justify-center">
				<div className="text-red-400 text-xl text-center max-w-lg p-8 border border-red-400/30 rounded-2xl">
					<p className="mb-4">❌ {error}</p>
					<p className="text-sm text-gray-400">
						Make sure your backend is running on port 4000
					</p>
				</div>
			</div>
		);

	return (
		<div className="min-h-screen bg-[#0d0e2b] p-6 md:p-12">
			<form onSubmit={updatePost} className="max-w-6xl mx-auto space-y-8">
				{/* Large Header Title Input */}
				<input
					type="text"
					value={title}
					onChange={(ev) => setTitle(ev.target.value)}
					placeholder="New Post Title..."
					className="w-full bg-transparent text-5xl md:text-7xl font-black text-white/20 placeholder:text-white/10 outline-none border-none mb-4 focus:text-white/40 transition-all"
				/>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{/* Summary Box */}
					<div className="md:col-span-2">
						<textarea
							value={summary}
							onChange={(ev) => setSummary(ev.target.value)}
							placeholder="What's this story about?"
							className="w-full h-full min-h-[160px] bg-[#1a1b4b]/40 border border-white/5 rounded-[2rem] p-6 text-gray-300 placeholder:text-gray-600 focus:outline-none focus:bg-[#1a1b4b]/60 transition-all resize-none text-lg"
						/>
					</div>

					{/* Upload Box */}
					<label className="border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white/5 transition-all text-gray-500 bg-[#1a1b4b]/20 group">
						<div className="text-4xl font-light group-hover:scale-110 transition-transform">
							+
						</div>
						<span className="text-[10px] uppercase tracking-[0.2em] font-bold">
							Upload Cover
						</span>
						<input
							type="file"
							className="hidden"
							onChange={(ev) => setFiles(ev.target.files)}
						/>
					</label>
				</div>

				{/* Editor Container */}
				<div className="bg-[#1a1b4b]/40 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-sm">
					<ReactQuill
						theme="snow"
						value={content}
						onChange={(newValue) => setContent(newValue)}
					/>
				</div>

				{/* Footer Button */}
				<div className="flex justify-end pt-4">
					<button className="bg-gradient-to-r from-[#00c6ff] to-[#0072ff] hover:brightness-110 text-white font-bold py-4 px-14 rounded-2xl transition-all shadow-[0_10px_30px_rgba(0,114,255,0.3)] active:scale-95">
						Update Article
					</button>
				</div>
			</form>
		</div>
	);
}
