import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import QuillEditor from '../QuillEditor';
import SmallSpinner from '../assets/smallSpinner/SmallSpinner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function CreatePost() {
	const [title, setTitle] = useState('');
	const [summary, setSummary] = useState('');
	const [content, setContent] = useState('');
	const [files, setFiles] = useState('');
	const [redirect, setRedirect] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState('');

	const modules = {
		toolbar: [
			[{ header: [1, 2, false] }],
			['bold', 'italic', 'underline', 'strike', 'blockquote'],
			[
				{ list: 'ordered' },
				{ list: 'bullet' },
				{ indent: '-1' },
				{ indent: '+1' },
			],
			['link', 'image', 'video'], // Added media features
			['clean'], // The 'Tx' button to remove formatting
		],
	};

	const createPost = async (e) => {
		e.preventDefault();
		if (isSubmitting) return;

		if (!title.trim() || !summary.trim() || !content.trim()) {
			const errorMsg =
				'Please fill in the title, summary, and article content before publishing.';
			setError(errorMsg);
			toast.error(errorMsg);
			return;
		}

		if (!files?.[0]) {
			const errorMsg = 'Please upload a cover image before publishing.';
			setError(errorMsg);
			toast.error(errorMsg);
			return;
		}

		setIsSubmitting(true);
		setError('');
		const data = new FormData();
		data.set('title', title);
		data.set('summary', summary);
		data.set('content', content);
		if (files?.[0]) {
			data.set('file', files[0]);
		}

		try {
			const response = await fetch(`${API_URL}/post`, {
				method: 'POST',
				body: data,
				credentials: 'include',
			});

			if (response.ok) {
				toast.success('Article published successfully! 🎉');
				setTimeout(() => setRedirect(true), 500);
				return;
			}

			const errorData = await response.json().catch(() => null);
			const errorMsg =
				errorData?.message || 'Publishing failed. Please try again.';
			setError(errorMsg);
			toast.error(errorMsg);
		} catch (error) {
			console.error('Publish failed:', error);
			const errorMsg = 'Network error while publishing. Please try again.';
			setError(errorMsg);
			toast.error(errorMsg);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (redirect) return <Navigate to={'/'} />;

	return (
		<div className="max-w-5xl mx-auto py-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
			<form onSubmit={createPost} className="flex flex-col gap-6">
				{/* Title Input - Oversized & Minimalist */}
				<input
					type="text"
					placeholder="New Post Title..."
					className="bg-transparent text-5xl md:text-6xl font-black text-white placeholder-white/10 outline-none border-none focus:ring-0 px-0"
					value={title}
					onChange={(ev) => setTitle(ev.target.value)}
				/>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{/* Summary - Glass Card */}
					<div className="md:col-span-2 space-y-4">
						<textarea
							placeholder="What's this story about?"
							className="w-full h-32 p-6 rounded-3xl bg-white/5 border border-white/10 text-slate-300 placeholder-slate-500 outline-none focus:bg-white/10 transition-all resize-none"
							value={summary}
							onChange={(ev) => setSummary(ev.target.value)}
						/>
					</div>

					{/* File Upload - Styled as a Dropzone */}
					<div className="relative group h-32 md:h-full">
						<label className="flex flex-col items-center justify-center w-full h-full rounded-3xl border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 hover:border-cyan-500/50 transition-all cursor-pointer">
							<div className="text-center">
								<svg
									className="w-8 h-8 mx-auto text-slate-500 group-hover:text-cyan-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M12 4v16m8-8H4"
									/>
								</svg>
								<p className="mt-2 text-xs text-slate-500 uppercase tracking-widest group-hover:text-white">
									{files?.[0] ? files[0].name : 'Upload Cover'}
								</p>
							</div>
							<input
								type="file"
								className="hidden"
								accept="image/*"
								onChange={(ev) => {
									setFiles(ev.target.files);
									setError('');
								}}
							/>
						</label>
					</div>
				</div>

				{/* The Editor Panel */}
				<div className="glass-editor rounded-3xl overflow-hidden border border-white/10 bg-grey-200 backdrop-blur-md">
					<QuillEditor
						value={content}
						onChange={(newValue) => {
							setContent(newValue);
							if (error) setError('');
						}}
						theme="snow"
						modules={modules}
						className="text-white min-h-[400px]"
					/>
				</div>

				{error && (
					<p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
						{error}
					</p>
				)}

				<button
					type="submit"
					disabled={isSubmitting}
					aria-label={
						isSubmitting ? 'Publishing article' : 'Publish article button'
					}
					className="self-end px-12 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(6,182,212,0.3)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 flex items-center gap-2">
					{isSubmitting ? (
						<>
							<SmallSpinner /> Publishing...
						</>
					) : (
						'Publish Article'
					)}
				</button>
			</form>
		</div>
	);
}
