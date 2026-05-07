import { useEffect, useState, useContext } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import QuillEditor from '../QuillEditor';
import DataSpinner from '../assets/dataSpinner/DataSpinner';
import SmallSpinner from '../assets/smallSpinner/SmallSpinner';
import { UserContext } from '../UserContext';
import {
	DEFAULT_POST_CATEGORY,
	POST_CATEGORIES,
} from '../constants/postCategories';
import { parseTagInput, tagsToInputValue } from '../utils/postTags';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const resolveCoverUrl = (cover) =>
	cover
		? cover.startsWith('http')
			? cover
			: `${API_URL}/${cover.replace(/\\/g, '/')}`
		: '';

const EditPage = () => {
	const { id } = useParams();
	const { userInfo, ready } = useContext(UserContext);
	const [title, setTitle] = useState('');
	const [summary, setSummary] = useState('');
	const [content, setContent] = useState('');
	const [category, setCategory] = useState(DEFAULT_POST_CATEGORY);
	const [tagInput, setTagInput] = useState('');
	const [files, setFiles] = useState('');
	const [coverUrl, setCoverUrl] = useState('');
	const [redirect, setRedirect] = useState(false);
	const [loading, setLoading] = useState(true);
	const [isUpdating, setIsUpdating] = useState(false);
	const [error, setError] = useState(null);
	const [unauthorizedError, setUnauthorizedError] = useState(null);

	useEffect(() => {
		// Wait for user context to load
		if (!ready) return;

		// Redirect if user is not logged in
		if (!userInfo) {
			setUnauthorizedError('You must be logged in to edit posts');
			setLoading(false);
			return;
		}

		setLoading(true);
		fetch(`${API_URL}/post/${id}`)
			.then((response) => {
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				return response.json();
			})
			.then((postInfo) => {
				// Check if author exists
				if (!postInfo.author || !postInfo.author._id) {
					setError(
						'Post author no longer exists in the system. This post cannot be edited.',
					);
					setLoading(false);
					return;
				}

				// Check permissions
				const userIsAdmin = userInfo?.role === 'admin';
				const userIsAuthor = String(userInfo?.id) === String(postInfo.author._id);

				if (!userIsAdmin && !userIsAuthor) {
					setUnauthorizedError('You are not authorized to edit this post');
					setLoading(false);
					return;
				}

				setTitle(postInfo.title);
				setSummary(postInfo.summary);
				setContent(postInfo.content);
				setCategory(postInfo.category || DEFAULT_POST_CATEGORY);
				setTagInput(tagsToInputValue(postInfo.tags || []));
				setCoverUrl(resolveCoverUrl(postInfo.cover));
				setError(null);
				setUnauthorizedError(null);
				setLoading(false);
			})
			.catch((err) => {
				console.error('Fetch error:', err);
				setError('Failed to load post. Make sure the backend is running.');
				setLoading(false);
			});
	}, [id, userInfo, ready]);

	useEffect(() => {
		if (!files?.[0]) return undefined;

		const previewUrl = URL.createObjectURL(files[0]);
		setCoverUrl(previewUrl);

		return () => {
			URL.revokeObjectURL(previewUrl);
		};
	}, [files]);

	async function updatePost(ev) {
		ev.preventDefault();
		if (isUpdating) return; // Prevent double clicks

		const data = new FormData();
		const parsedTags = parseTagInput(tagInput);
		data.set('title', title);
		data.set('summary', summary);
		data.set('content', content);
		data.set('category', category);
		data.set('tags', parsedTags.join(','));
		data.set('id', id);
		if (files?.[0]) data.set('file', files?.[0]);

		setIsUpdating(true);

		try {
			const response = await fetch(`${API_URL}/post/${id}`, {
				method: 'PUT',
				body: data,
				credentials: 'include',
			});
			if (response.ok) {
				toast.success('Article updated successfully! 🎉');
				setTimeout(() => setRedirect(true), 500);
			} else {
				const errorData = await response.json();
				console.error('Update failed:', errorData);
				const errorMsg = errorData.message || 'Unknown error';
				toast.error('Failed to update post: ' + errorMsg);
				setIsUpdating(false);
			}
		} catch (error) {
			console.error('Network error:', error);
			toast.error('Network error - could not update post');
			setIsUpdating(false);
		}
	}

	if (redirect) return <Navigate to={`/post/${id}`} />;

	// Wait for user context to load
	if (!ready)
		return (
			<div
				className="min-h-screen bg-[#0d0e2b] flex items-center justify-center"
				role="alert"
				aria-label="Loading user session">
				<DataSpinner />
			</div>
		);

	// Check authorization before loading
	if (unauthorizedError)
		return (
			<div className="min-h-screen bg-[#0d0e2b] flex items-center justify-center p-6">
				<div className="text-red-400 text-xl text-center max-w-lg p-8 border border-red-400/30 rounded-2xl">
					<p className="mb-4">❌ {unauthorizedError}</p>
					<p className="text-sm text-gray-400">
						Only the post author or an admin can edit this post
					</p>
				</div>
			</div>
		);

	if (loading)
		return (
			<div
				className="min-h-screen bg-[#0d0e2b] flex items-center justify-center"
				role="alert"
				aria-label="Loading post for editing">
				<DataSpinner />
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
		<div className="min-h-screen bg-[#0d0e2b] p-6 md:p-10 lg:p-12">
			<form onSubmit={updatePost} className="max-w-6xl mx-auto space-y-8">
				{/* Large Header Title Input */}
				<input
					type="text"
					value={title}
					onChange={(ev) => setTitle(ev.target.value)}
					placeholder="New Post Title..."
					className="w-full bg-transparent text-5xl md:text-7xl font-black text-white placeholder:text-white/30 outline-none border-none mb-4 focus:text-white transition-all"
				/>

				<div className="grid grid-cols-1 items-stretch gap-6 md:min-h-[27rem] md:grid-cols-3">
					<div className="space-y-6 md:col-span-2 md:grid md:h-full md:grid-rows-[minmax(180px,1fr)_auto] md:space-y-0">
						<textarea
							value={summary}
							onChange={(ev) => setSummary(ev.target.value)}
							placeholder="What's this story about?"
							className="w-full min-h-[150px] rounded-[2rem] border border-white/10 bg-[#1a1b4b]/40 p-6 text-lg text-gray-300 placeholder:text-gray-600 outline-none transition focus:bg-[#1a1b4b]/60 resize-none md:h-full"
						/>

						<div className="grid grid-cols-1 gap-4 md:mt-6 md:grid-cols-2">
							<div className="rounded-[2rem] border border-white/10 bg-[#1a1b4b]/30 p-5">
								<label className="mb-2 block text-xs uppercase tracking-[0.25em] text-slate-500">
									Category
								</label>
								<select
									value={category}
									onChange={(ev) => setCategory(ev.target.value)}
									className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400">
									{POST_CATEGORIES.filter((item) => item !== 'All').map(
										(item) => (
											<option key={item} value={item}>
												{item}
											</option>
										),
									)}
								</select>
							</div>

							<div className="rounded-[2rem] border border-white/10 bg-[#1a1b4b]/30 p-5">
								<label className="mb-2 block text-xs uppercase tracking-[0.25em] text-slate-500">
									Tags
								</label>
								<input
									type="text"
									value={tagInput}
									onChange={(ev) => setTagInput(ev.target.value)}
									placeholder="React, Node.js, Premier League"
									className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
								/>
								<p className="mt-2 text-xs text-slate-500">
									Use commas between tags. Up to 8 tags.
								</p>
							</div>
						</div>
					</div>

					<label className="group flex min-h-[220px] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#1a1b4b]/20 transition-all hover:bg-white/5 md:h-full md:min-h-0">
						<div className="relative flex-1 overflow-hidden border-b border-white/10 bg-slate-950/40">
							{coverUrl ? (
								<img
									src={coverUrl}
									alt="Current cover preview"
									className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
								/>
							) : (
								<div className="flex h-full items-center justify-center text-sm text-slate-500">
									No cover preview
								</div>
							)}
							<div className="absolute inset-0 bg-gradient-to-t from-[#0d0e2b]/70 to-transparent" />
						</div>
						<div className="flex flex-col items-center justify-center gap-3 p-5 text-gray-500">
							<div className="text-4xl font-light transition-transform group-hover:scale-110">
								+
							</div>
							<span className="text-[10px] font-bold uppercase tracking-[0.2em]">
								Replace Cover
							</span>
							<p className="max-w-[12rem] text-center text-xs text-slate-400">
								{files?.[0]
									? files[0].name
									: 'Choose a new image to replace the current cover'}
							</p>
						</div>
						<input
							type="file"
							className="hidden"
							accept="image/*"
							onChange={(ev) => setFiles(ev.target.files)}
						/>
					</label>
				</div>

				{/* Editor Container */}
				<div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#1a1b4b]/40 shadow-2xl shadow-black/10 backdrop-blur-sm">
					<QuillEditor
						theme="snow"
						value={content}
						onChange={(newValue) => setContent(newValue)}
					/>
				</div>

				{/* Footer Button */}
				<div className="flex justify-end pt-4">
					<button
						disabled={isUpdating}
						aria-label={
							isUpdating ? 'Updating article' : 'Update article button'
						}
						className={`bg-gradient-to-r from-[#00c6ff] to-[#0072ff] text-white font-bold py-4 px-14 rounded-2xl transition-all shadow-[0_10px_30px_rgba(0,114,255,0.3)] active:scale-95 flex items-center gap-2 justify-center ${
							isUpdating
								? 'opacity-75 cursor-not-allowed'
								: 'hover:brightness-110'
						}`}>
						{isUpdating ? (
							<>
								<SmallSpinner /> Updating...
							</>
						) : (
							'Update Article'
						)}
					</button>
				</div>
			</form>
		</div>
	);
};

export default EditPage;
