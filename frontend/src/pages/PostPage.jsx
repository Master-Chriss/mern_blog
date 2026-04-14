import { useContext, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { formatISO9075 } from 'date-fns';
import {
	FaChevronLeft,
	FaEdit,
	FaLink,
	FaRegComments,
	FaShareAlt,
	FaTrashAlt,
	FaTwitter,
	FaWhatsapp,
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import DOMPurify from 'dompurify';
import { UserContext } from '../UserContext';
import DataSpinner from '../assets/dataSpinner/DataSpinner';
import SmallSpinner from '../assets/smallSpinner/SmallSpinner';
import { DEFAULT_POST_CATEGORY } from '../constants/postCategories';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const PostPage = () => {
	const [postInfo, setPostInfo] = useState(null);
	const [showModal, setShowModal] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [relatedPosts, setRelatedPosts] = useState([]);
	const [comments, setComments] = useState([]);
	const [commentText, setCommentText] = useState('');
	const [isSubmittingComment, setIsSubmittingComment] = useState(false);
	const [deletingCommentId, setDeletingCommentId] = useState(null);
	const [postUrl, setPostUrl] = useState('');

	const { userInfo } = useContext(UserContext);
	const { id } = useParams();
	const navigate = useNavigate();

	const isAdmin = userInfo?.role === 'admin';
	const isActualAuthor = userInfo?.id === postInfo?.author?._id;
	const canEdit = (isActualAuthor || isAdmin) && postInfo?.author?._id;
	const canDelete = isAdmin;

	useEffect(() => {
		fetch(`${API_URL}/post/${id}`)
			.then((response) => response.json())
			.then((info) => setPostInfo(info));
	}, [id]);

	useEffect(() => {
		fetch(`${API_URL}/comments/post/${id}`)
			.then((response) => response.json())
			.then((data) => setComments(Array.isArray(data) ? data : []))
			.catch((error) => {
				console.error('Failed to load comments:', error);
				setComments([]);
			});
	}, [id]);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			setPostUrl(window.location.href);
		}
	}, [id]);

	useEffect(() => {
		if (!postInfo?._id) return;

		fetch(`${API_URL}/post`)
			.then((response) => response.json())
			.then((posts) => {
				const currentTags = new Set(postInfo.tags || []);
				const related = posts
					.filter((post) => post._id !== postInfo._id)
					.map((post) => {
						const postTags = post.tags || [];
						const sharedTagCount = postTags.filter((tag) =>
							currentTags.has(tag),
						).length;
						const sameCategory = post.category === postInfo.category ? 1 : 0;

						return {
							...post,
							relevanceScore: sharedTagCount * 3 + sameCategory,
						};
					})
					.filter((post) => post.relevanceScore > 0)
					.sort((a, b) => b.relevanceScore - a.relevanceScore)
					.slice(0, 3);

				setRelatedPosts(related);
			})
			.catch((error) => {
				console.error('Failed to load related posts:', error);
				setRelatedPosts([]);
			});
	}, [postInfo]);

	const confirmDelete = async () => {
		setIsDeleting(true);

		try {
			const response = await fetch(`${API_URL}/post/${id}`, {
				method: 'DELETE',
				credentials: 'include',
			});

			if (response.ok) {
				setIsSuccess(true);
				toast.success('Story deleted');
				setTimeout(() => navigate('/'), 1500);
			} else {
				toast.error('Delete failed');
				setIsDeleting(false);
			}
		} catch (error) {
			toast.error('Server error');
			setIsDeleting(false);
		}
	};

	const handleShare = async () => {
		if (!postInfo) return;

		if (navigator.share) {
			try {
				await navigator.share({
					title: postInfo.title,
					text: postInfo.summary,
					url: postUrl,
				});
				return;
			} catch (error) {
				if (error?.name === 'AbortError') return;
			}
		}

		try {
			await navigator.clipboard.writeText(postUrl);
			toast.success('Post link copied to clipboard');
		} catch (error) {
			toast.error('Could not copy the post link');
		}
	};

	const copyLink = async () => {
		try {
			await navigator.clipboard.writeText(postUrl);
			toast.success('Post link copied to clipboard');
		} catch (error) {
			toast.error('Could not copy the post link');
		}
	};

	const submitComment = async (event) => {
		event.preventDefault();

		if (!commentText.trim()) {
			toast.error('Write a comment before posting');
			return;
		}

		setIsSubmittingComment(true);

		try {
			const response = await fetch(`${API_URL}/comments/post/${id}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ content: commentText }),
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => null);
				throw new Error(errorData?.message || 'Failed to post comment');
			}

			const newComment = await response.json();
			setComments((currentComments) => [newComment, ...currentComments]);
			setCommentText('');
			toast.success('Comment posted');
		} catch (error) {
			toast.error(error.message || 'Could not post comment');
		} finally {
			setIsSubmittingComment(false);
		}
	};

	const removeComment = async (commentId) => {
		setDeletingCommentId(commentId);

		try {
			const response = await fetch(`${API_URL}/comments/${commentId}`, {
				method: 'DELETE',
				credentials: 'include',
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => null);
				throw new Error(errorData?.message || 'Failed to delete comment');
			}

			setComments((currentComments) =>
				currentComments.filter((comment) => comment._id !== commentId),
			);
			toast.success('Comment deleted');
		} catch (error) {
			toast.error(error.message || 'Could not delete comment');
		} finally {
			setDeletingCommentId(null);
		}
	};

	if (!postInfo) {
		return (
			<div
				className="flex min-h-screen items-center justify-center bg-slate-900"
				role="alert"
				aria-label="Loading post">
				<DataSpinner />
			</div>
		);
	}

	const cleanHTML = postInfo.content ? DOMPurify.sanitize(postInfo.content) : '';
	const coverUrl = postInfo?.cover
		? postInfo.cover.startsWith('http')
			? postInfo.cover
			: `${API_URL}/${postInfo.cover.replace(/\\/g, '/')}`
		: '';
	const displayCategory = postInfo.category || DEFAULT_POST_CATEGORY;
	const displayTags = postInfo.tags || [];
	const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
		postInfo.title,
	)}&url=${encodeURIComponent(postUrl)}`;
	const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(
		`${postInfo.title} ${postUrl}`,
	)}`;

	return (
		<article className="mx-auto max-w-6xl animate-in fade-in px-4 py-8 duration-1000">
			{showModal && (
				<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
					<div className="relative w-full max-w-sm overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#1a1b4b] p-8 shadow-2xl">
						{isSuccess && (
							<div className="absolute inset-0 z-10 flex animate-in fade-in flex-col items-center justify-center bg-cyan-500 duration-300">
								<div className="flex h-16 w-16 animate-bounce items-center justify-center rounded-full bg-white">
									<svg
										className="h-8 w-8 text-cyan-500"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										strokeWidth={3}>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="m4.5 12.75 6 6 9-13.5"
										/>
									</svg>
								</div>
								<p className="mt-4 text-white">Deleted</p>
							</div>
						)}

						<h2 className="mb-6 text-center text-2xl font-black text-white">
							Are you sure?
						</h2>
						<div className="flex gap-3">
							<button
								disabled={isDeleting}
								onClick={() => setShowModal(false)}
								className="flex-1 rounded-xl bg-white/5 py-3 font-bold text-white transition-all hover:bg-white/10">
								Cancel
							</button>
							<button
								disabled={isDeleting}
								onClick={confirmDelete}
								aria-label={isDeleting ? 'Deleting post' : 'Delete post button'}
								className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-3 font-bold text-white transition-all hover:bg-red-700">
								{isDeleting ? (
									<>
										<SmallSpinner /> Deleting...
									</>
								) : (
									'Delete'
								)}
							</button>
						</div>
					</div>
				</div>
			)}

			<Link
				to="/"
				className="mb-8 flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-cyan-400">
				<FaChevronLeft size={12} /> Back to stories
			</Link>

			<header className="mb-10">
				<Link
					to={`/?category=${encodeURIComponent(displayCategory)}`}
					className="mb-5 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-xs font-semibold text-cyan-300 transition hover:border-cyan-300/40 hover:bg-cyan-400/15">
					{displayCategory}
				</Link>
				<h1 className="mb-8 break-words text-4xl font-black leading-tight tracking-tight text-white md:text-6xl">
					{postInfo.title}
				</h1>

				<div className="flex flex-wrap items-center justify-between gap-4 border-y border-white/10 py-6">
					<div className="flex items-center gap-3">
						<div className="h-10 w-10 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 shadow-lg" />
						<div>
							<p className="font-bold leading-none text-white">
								@{postInfo?.author?.username || 'Anonymous'} - The Blogger
							</p>
							<time className="text-xs text-slate-500">
								{formatISO9075(new Date(postInfo.createdAt))}
							</time>
						</div>
					</div>

					<div className="flex items-center gap-6">
						{canEdit && (
							<Link
								to={`/edit/${postInfo._id}`}
								className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-2.5 text-white shadow-lg transition-all hover:border-cyan-400 hover:bg-cyan-500">
								<FaEdit size={16} />
								<span className="text-sm font-semibold">Edit Story</span>
							</Link>
						)}

						{canDelete && (
							<button
								onClick={() => setShowModal(true)}
								className="flex items-center gap-2 py-2 text-red-500 transition-colors hover:text-red-400">
								<FaTrashAlt size={14} />
								<span className="text-sm font-semibold tracking-wider">
									Delete Story
								</span>
							</button>
						)}
					</div>
				</div>

				{displayTags.length > 0 && (
					<div className="mt-6 flex flex-wrap gap-3">
						{displayTags.map((tag) => (
							<span
								key={tag}
								className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300">
								#{tag}
							</span>
						))}
					</div>
				)}

				<div className="mt-8 flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-5 md:flex-row md:items-center md:justify-between">
					<div>
						<p className="text-xs uppercase tracking-[0.3em] text-slate-500">
							Share This Story
						</p>
						<p className="mt-2 text-sm text-slate-300">
							Help more readers discover this post.
						</p>
					</div>
					<div className="flex flex-wrap gap-3">
						<button
							type="button"
							onClick={handleShare}
							className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-400/40 hover:bg-white/10">
							<FaShareAlt />
							Share
						</button>
						<button
							type="button"
							onClick={copyLink}
							className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-400/40 hover:bg-white/10">
							<FaLink />
							Copy Link
						</button>
						<a
							href={twitterShareUrl}
							target="_blank"
							rel="noreferrer"
							className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-400/40 hover:bg-white/10">
							<FaTwitter />
							X
						</a>
						<a
							href={whatsappShareUrl}
							target="_blank"
							rel="noreferrer"
							className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-400/40 hover:bg-white/10">
							<FaWhatsapp />
							WhatsApp
						</a>
					</div>
				</div>
			</header>

			<div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-2xl">
				<div className="relative h-[500px] w-full bg-slate-900/60 md:aspect-auto sm:aspect-[16/10] aspect-[4/3]">
					{coverUrl ? (
						<img
							src={coverUrl}
							className="h-full w-full object-contain md:object-cover"
							alt={postInfo.title}
						/>
					) : (
						<div className="h-full w-full bg-slate-800/60" />
					)}
					<div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] to-transparent" />
				</div>

				<div className="p-6 md:p-12 lg:p-16">
					<div
						className="post-content prose prose-invert prose-cyan max-w-none break-words overflow-x-auto text-base leading-relaxed text-slate-300 md:text-lg
						prose-p:mb-4 prose-p:mt-0 prose-p:break-words
						prose-headings:mt-6 prose-headings:mb-4 prose-headings:font-bold prose-headings:text-white
						prose-h1:mb-6 prose-h1:text-3xl md:prose-h1:text-4xl
						prose-h2:mb-4 prose-h2:text-2xl md:prose-h2:text-3xl
						prose-h3:text-xl md:prose-h3:text-2xl
						prose-a:break-words prose-a:text-cyan-400
						prose-ul:my-4 prose-ol:my-4 prose-li:my-1
						prose-img:my-6 prose-img:max-w-full prose-img:rounded-2xl
						prose-blockquote:border-l-cyan-500 prose-blockquote:pl-4 prose-blockquote:italic"
						dangerouslySetInnerHTML={{ __html: cleanHTML }}
					/>
				</div>
			</div>

			{relatedPosts.length > 0 && (
				<section className="mt-14">
					<div className="mb-6 flex items-end justify-between gap-4">
						<div>
							<p className="text-xs uppercase tracking-[0.3em] text-slate-500">
								Keep Reading
							</p>
							<h2 className="mt-2 text-2xl font-bold text-white">
								Related Posts
							</h2>
						</div>
						<Link
							to={`/?category=${encodeURIComponent(displayCategory)}`}
							className="text-sm font-semibold text-cyan-300 transition hover:text-cyan-200">
							More in {displayCategory}
						</Link>
					</div>

					<div className="grid gap-6 md:grid-cols-3">
						{relatedPosts.map((post) => {
							const relatedCoverUrl = post.cover
								? post.cover.startsWith('http')
									? post.cover
									: `${API_URL}/${post.cover.replace(/\\/g, '/')}`
								: '';

							return (
								<Link
									key={post._id}
									to={`/post/${post._id}`}
									className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 transition hover:border-cyan-400/30 hover:bg-white/10">
									<div className="h-44 overflow-hidden bg-slate-900/60">
										{relatedCoverUrl ? (
											<img
												src={relatedCoverUrl}
												alt={post.title}
												className="h-full w-full object-cover transition duration-500 hover:scale-105"
											/>
										) : (
											<div className="h-full w-full bg-slate-800/60" />
										)}
									</div>
									<div className="p-5">
										<p className="mb-3 text-xs font-semibold text-cyan-300">
											{post.category || DEFAULT_POST_CATEGORY}
										</p>
										<h3 className="line-clamp-2 text-lg font-bold text-white">
											{post.title}
										</h3>
										<p className="mt-2 line-clamp-3 text-sm text-slate-400">
											{post.summary}
										</p>
									</div>
								</Link>
							);
						})}
					</div>
				</section>
			)}

			<section className="mt-14 rounded-[2.5rem] border border-white/10 bg-white/5 p-6 md:p-8">
				<div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
					<div>
						<p className="text-xs uppercase tracking-[0.3em] text-slate-500">
							Discussion
						</p>
						<h2 className="mt-2 flex items-center gap-3 text-2xl font-bold text-white">
							<FaRegComments className="text-cyan-400" />
							Comments
						</h2>
					</div>
					<p className="text-sm text-slate-400">
						{comments.length} {comments.length === 1 ? 'comment' : 'comments'}
					</p>
				</div>

				<div className="mt-6">
					{userInfo ? (
						<form onSubmit={submitComment} className="space-y-4">
							<textarea
								value={commentText}
								onChange={(event) => setCommentText(event.target.value)}
								placeholder="Share your thoughts about this post..."
								className="min-h-[140px] w-full rounded-[1.75rem] border border-white/10 bg-slate-950/40 px-5 py-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
							/>
							<div className="flex items-center justify-between gap-4">
								<p className="text-sm text-slate-500">
									Commenting as @{userInfo.username}
								</p>
								<button
									type="submit"
									disabled={isSubmittingComment}
									className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60">
									{isSubmittingComment ? (
										<>
											<SmallSpinner /> Posting...
										</>
									) : (
										'Post Comment'
									)}
								</button>
							</div>
						</form>
					) : (
						<div className="rounded-[1.75rem] border border-white/10 bg-slate-950/30 p-5 text-sm text-slate-300">
							<Link
								to="/login"
								className="font-semibold text-cyan-300 transition hover:text-cyan-200">
								Log in
							</Link>{' '}
							to join the conversation.
						</div>
					)}
				</div>

				<div className="mt-8 space-y-4">
					{comments.length > 0 ? (
						comments.map((comment) => {
							const canDeleteComment =
								userInfo &&
								(userInfo.role === 'admin' ||
									userInfo.id === comment.author?._id);

							return (
								<div
									key={comment._id}
									className="rounded-[1.75rem] border border-white/10 bg-slate-950/30 p-5">
									<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
										<div>
											<p className="font-semibold text-white">
												@{comment.author?.username || 'Anonymous'}
											</p>
											<p className="mt-1 text-xs text-slate-500">
												{formatISO9075(new Date(comment.createdAt))}
											</p>
										</div>
										{canDeleteComment && (
											<button
												type="button"
												onClick={() => removeComment(comment._id)}
												disabled={deletingCommentId === comment._id}
												className="text-sm font-semibold text-red-400 transition hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50">
												{deletingCommentId === comment._id
													? 'Deleting...'
													: 'Delete'}
											</button>
										)}
									</div>
									<p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-300">
										{comment.content}
									</p>
								</div>
							);
						})
					) : (
						<div className="rounded-[1.75rem] border border-dashed border-white/10 bg-slate-950/20 p-6 text-center text-slate-500">
							No comments yet. Be the first to start the conversation.
						</div>
					)}
				</div>
			</section>
		</article>
	);
};

export default PostPage;
