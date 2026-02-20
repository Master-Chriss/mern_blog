import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import QuillEditor from '../QuillEditor'

export default function CreatePost() {
	const [title, setTitle] = useState('');
	const [summary, setSummary] = useState('');
	const [content, setContent] = useState('');
	const [files, setFiles] = useState('');
	const [redirect, setRedirect] = useState(false);

	const modules = {
  toolbar: [
    [{ 'header': [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
    ['link', 'image', 'video'], // Added media features
    ['clean'] // The 'Tx' button to remove formatting
  ],
};

	const createPost = async (e) => {
		e.preventDefault();
		const data = new FormData();
		data.set('title', title);
		data.set('summary', summary);
		data.set('content', content);
		if (files?.[0]) {
			data.set('file', files[0]);
		}

		const response = await fetch('http://localhost:4000/post', {
			method: 'POST',
			body: data,
			credentials: 'include',
		});

		if (response.ok) {
			setRedirect(true);
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
									Upload Cover
								</p>
							</div>
							<input
								type="file"
								className="hidden"
								onChange={(ev) => setFiles(ev.target.files)}
							/>
						</label>
					</div>
				</div>

				{/* The Editor Panel */}
				<div className="glass-editor rounded-3xl overflow-hidden border border-white/10 bg-grey-200 backdrop-blur-md">
					<QuillEditor
						value={content}
						onChange={(newValue) => setContent(newValue)}
						theme="snow"
						modules={modules}
						className="text-white min-h-[400px]"
					/>
				</div>

				<button className="self-end px-12 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(6,182,212,0.3)]">
					Publish Article
				</button>
			</form>
		</div>
	);
}
