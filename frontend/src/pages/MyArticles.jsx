import { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
	ChevronDown,
	Menu,
	PenSquare,
	Search,
	Trash2,
	X,
} from 'lucide-react';
import { UserContext } from '../UserContext';
import ConfirmationDialog from '../components/ConfirmationDialog';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const ARTICLES_PER_PAGE = 10;

const formatDisplayDate = (value) => {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return 'No date';
	return date.toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
};

const MyArticles = () => {
	const { userInfo } = useContext(UserContext);
	const [posts, setPosts] = useState([]);
	const [search, setSearch] = useState('');
	const [sortBy, setSortBy] = useState('newest');
	const [currentPage, setCurrentPage] = useState(1);
	const [pendingAction, setPendingAction] = useState(null);
	const [isConfirmingAction, setIsConfirmingAction] = useState(false);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const loadArticles = async () => {
			try {
				setIsLoading(true);
				const response = await fetch(`${API_URL}/post/admin/all`, {
					credentials: 'include',
				});

				if (!response.ok) throw new Error('Failed to load articles');

				const data = await response.json();
				setPosts(Array.isArray(data) ? data : []);
			} catch (error) {
				console.error('Load articles error:', error);
				toast.error(error.message || 'Could not load articles');
				setPosts([]);
			} finally {
				setIsLoading(false);
			}
		};

		loadArticles();
	}, []);

	const filteredPosts = posts
		.filter(
			(post) =>
				post.title.toLowerCase().includes(search.toLowerCase()) ||
				post.summary?.toLowerCase().includes(search.toLowerCase()) ||
				post.author?.username.toLowerCase().includes(search.toLowerCase()),
		)
		.sort((a, b) => {
			if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
			if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
			if (sortBy === 'title') return a.title.localeCompare(b.title);
			return 0;
		});

	const totalPages = Math.ceil(filteredPosts.length / ARTICLES_PER_PAGE);

	useEffect(() => {
		if (currentPage > totalPages && totalPages > 0) {
			setCurrentPage(totalPages);
		}
	}, [currentPage, totalPages]);

	const paginatedPosts = filteredPosts.slice(
		(currentPage - 1) * ARTICLES_PER_PAGE,
		currentPage * ARTICLES_PER_PAGE,
	);

	const deletePost = async (postId) => {
		try {
			const res = await fetch(`${API_URL}/post/${postId}`, {
				method: 'DELETE',
				credentials: 'include',
			});

			if (!res.ok) throw new Error('Failed to delete post');

			setPosts((currentPosts) =>
				currentPosts.filter((post) => post._id !== postId),
			);
			toast.success('Post deleted successfully');
		} catch (error) {
			console.error('Delete post error:', error);
			toast.error(error.message || 'Failed to delete post');
		}
	};

	const openDeleteConfirm = (post) => {
		setPendingAction({
			title: 'Delete this post permanently?',
			message: `"${post.title}" will be removed from the blog for everyone. This action cannot be undone.`,
			confirmLabel: 'Delete Post',
			tone: 'danger',
			action: () => deletePost(post._id),
		});
	};

	const handleConfirmAction = async () => {
		if (!pendingAction?.action) return;
		setIsConfirmingAction(true);
		try {
			await pendingAction.action();
		} finally {
			setIsConfirmingAction(false);
			setPendingAction(null);
		}
	};

	if (!userInfo || userInfo.role !== 'admin') {
		return <Navigate to="/" />;
	}

	return (
		<div className="min-h-screen bg-slate-950 text-white md:flex">
			<ConfirmationDialog
				open={Boolean(pendingAction)}
				title={pendingAction?.title}
				message={pendingAction?.message}
				confirmLabel={pendingAction?.confirmLabel}
				tone={pendingAction?.tone}
				eyebrow="Admin Confirmation"
				isSubmitting={isConfirmingAction}
				onCancel={() => setPendingAction(null)}
				onConfirm={handleConfirmAction}
			/>

			{isSidebarOpen && (
				<div
					onClick={() => setIsSidebarOpen(false)}
					className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm md:hidden"
				/>
			)}

			<main className="min-w-0 flex-1">
				<div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.12),_transparent_30%)]">
					<div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
						<section className="rounded-[2rem] bg-white/5 p-4 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-6 lg:p-8">
							<div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
								<div className="flex items-start gap-3 sm:gap-4">
									<button
										onClick={() => setIsSidebarOpen(true)}
										className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-white/5 text-xl text-white md:hidden">
										<Menu size={20} />
									</button>
									<div>
										<p className="text-xs uppercase tracking-[0.28em] text-cyan-300/80">
											Article Management
										</p>
										<h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
											My Articles
										</h1>
										<p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
											Create, edit, and manage all your published posts in one place.
										</p>
									</div>
								</div>

								<a
									href="/create"
									className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 px-5 py-3 font-bold text-white transition-transform hover:scale-[1.02]">
									<PenSquare size={18} />
									New Article
								</a>
							</div>
						</section>

						<section className="mt-6 rounded-[2rem] bg-white/5 p-4 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-6">
							<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
								<div>
									<h2 className="text-2xl font-bold text-white">All Articles</h2>
									<p className="mt-2 text-sm text-slate-400">
										{filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''}
									</p>
								</div>

								<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
									<div className="relative">
										<Search
											size={18}
											className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
										/>
										<input
											type="search"
											value={search}
											onChange={(e) => {
												setSearch(e.target.value);
												setCurrentPage(1);
											}}
											placeholder="Search articles..."
											className="w-full rounded-2xl bg-slate-950/50 pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none sm:w-64"
										/>
									</div>

									<div className="relative">
										<select
											value={sortBy}
											onChange={(e) => {
												setSortBy(e.target.value);
												setCurrentPage(1);
											}}
											className="w-full appearance-none rounded-2xl bg-slate-950/50 px-4 py-3 pr-10 text-sm text-white focus:outline-none sm:w-auto">
											<option value="newest">Newest First</option>
											<option value="oldest">Oldest First</option>
											<option value="title">Title (A-Z)</option>
										</select>
										<ChevronDown
											size={16}
											className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
										/>
									</div>
								</div>
							</div>

							{isLoading ? (
								<div className="rounded-[1.35rem] bg-slate-900/40 px-4 py-8 text-center text-slate-400">
									Loading articles...
								</div>
							) : paginatedPosts.length > 0 ? (
								<div className="space-y-3">
									{paginatedPosts.map((post, index) => (
										<div
											key={post._id}
											className="rounded-[1.35rem] bg-slate-900/40 px-4 py-4 transition hover:bg-slate-900/70 sm:px-5">
											<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
												<div className="flex min-w-0 flex-1 items-start gap-3">
													<span className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-white/5 text-base font-bold text-slate-500">
														{(
															(currentPage - 1) * ARTICLES_PER_PAGE +
															index +
															1
														)
															.toString()
															.padStart(2, '0')}
													</span>
													<div className="min-w-0">
														<h3 className="break-words text-sm font-semibold leading-6 text-white sm:text-base">
															{post.title}
														</h3>
														<p className="mt-1 text-sm text-slate-400">
															@{post.author?.username || 'unknown'} •{' '}
															{formatDisplayDate(post.createdAt)}
														</p>
														{post.summary && (
															<p className="mt-2 line-clamp-2 text-sm text-slate-300">
																{post.summary}
															</p>
														)}
													</div>
												</div>

												<div className="flex w-full gap-2 sm:w-auto sm:flex-shrink-0">
													<a
														href={`/edit/${post._id}`}
														className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10 sm:flex-none">
														<PenSquare size={16} />
														Edit
													</a>
													<button
														onClick={() => openDeleteConfirm(post)}
														className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-500/15 px-4 py-2 text-sm text-red-300 transition hover:bg-red-500/25 sm:flex-none">
														<Trash2 size={16} />
														Delete
													</button>
												</div>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="rounded-[1.35rem] bg-slate-900/40 px-4 py-8 text-center text-slate-400">
									{search ? 'No articles match your search.' : 'No articles yet. Create your first one!'}
								</div>
							)}

							{totalPages > 1 && (
								<div className="mt-6 flex flex-wrap gap-2">
									<button
										type="button"
										onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
										disabled={currentPage === 1}
										className="rounded-xl bg-white/5 px-3 py-2 text-slate-200 transition disabled:cursor-not-allowed disabled:opacity-40">
										Previous
									</button>
									{Array.from({ length: totalPages }, (_, index) => {
										const page = index + 1;
										return (
											<button
												key={page}
												type="button"
												onClick={() => setCurrentPage(page)}
												className={`rounded-xl px-3 py-2 transition ${
													currentPage === page
														? 'bg-cyan-500/20 text-cyan-300'
														: 'bg-white/5 text-slate-200'
												}`}>
												{page}
											</button>
										);
									})}
									<button
										type="button"
										onClick={() =>
											setCurrentPage((prev) => Math.min(prev + 1, totalPages || 1))
										}
										disabled={currentPage === totalPages || totalPages === 0}
										className="rounded-xl bg-white/5 px-3 py-2 text-slate-200 transition disabled:cursor-not-allowed disabled:opacity-40">
										Next
									</button>
								</div>
							)}
						</section>
					</div>
				</div>
			</main>
		</div>
	);
};

export default MyArticles;
