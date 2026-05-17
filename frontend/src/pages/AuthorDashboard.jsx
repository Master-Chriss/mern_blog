import { useContext, useEffect, useMemo, useState } from 'react';
import { Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
	ArrowLeft,
	Bell,
	CalendarDays,
	ChartColumn,
	FileText,
	Home,
	LogOut,
	Menu,
	PenSquare,
	PenTool,
	Settings,
	Sparkles,
	Tag,
	Trash2,
	X,
} from 'lucide-react';
import { UserContext } from '../UserContext';
import ConfirmationDialog from '../components/ConfirmationDialog';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const POSTS_PER_PAGE = 5;

const formatDisplayDate = (value) => {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return 'No date';
	}

	return date.toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
};

const formatMonthLabel = (value) =>
	new Intl.DateTimeFormat(undefined, {
		month: 'short',
	}).format(value);

const readJsonResponse = async (response, fallbackMessage) => {
	const payload = await response.json().catch(() => null);

	if (!response.ok) {
		throw new Error(payload?.message || fallbackMessage);
	}

	return payload;
};

const formatRelativeTime = (value) => {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return 'Recently';

	const seconds = Math.round((date.getTime() - Date.now()) / 1000);
	const thresholds = [
		{ amount: 60, unit: 'second' },
		{ amount: 60, unit: 'minute' },
		{ amount: 24, unit: 'hour' },
		{ amount: 7, unit: 'day' },
		{ amount: 4.34524, unit: 'week' },
		{ amount: 12, unit: 'month' },
		{ amount: Number.POSITIVE_INFINITY, unit: 'year' },
	];
	const formatter = new Intl.RelativeTimeFormat(undefined, {
		numeric: 'auto',
	});
	let duration = seconds;

	for (const threshold of thresholds) {
		if (Math.abs(duration) < threshold.amount) {
			return formatter.format(Math.round(duration), threshold.unit);
		}
		duration /= threshold.amount;
	}

	return 'Recently';
};

const AuthorDashboard = () => {
	const { userInfo } = useContext(UserContext);
	const location = useLocation();
	const navigate = useNavigate();

	const [posts, setPosts] = useState([]);
	const [inboxData, setInboxData] = useState({
		activities: [],
		summary: {
			totalReaderMessages: 0,
			recentReaderMessages: 0,
			activePosts: 0,
			uniqueReaders: 0,
		},
	});
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [search, setSearch] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [pendingAction, setPendingAction] = useState(null);
	const [isConfirmingAction, setIsConfirmingAction] = useState(false);

	useEffect(() => {
		setIsSidebarOpen(false);
	}, [location.pathname, location.hash]);

	useEffect(() => {
		const loadDashboardData = async () => {
			try {
				const postsResponse = await fetch(`${API_URL}/post/mine`, {
					credentials: 'include',
				});
				const postsData = await readJsonResponse(
					postsResponse,
					'Could not load your posts',
				);
				setPosts(Array.isArray(postsData) ? postsData : []);
			} catch (error) {
				console.error('Author posts load error:', error);
				toast.error(error.message || 'Could not load your posts', {
					id: 'author-posts-load-error',
				});
				setPosts([]);
			}

			try {
				const inboxResponse = await fetch(`${API_URL}/comments/inbox/author`, {
					credentials: 'include',
				});
				const inboxDataResponse = await readJsonResponse(
					inboxResponse,
					'Could not load your inbox activity',
				);
				setInboxData({
					activities: Array.isArray(inboxDataResponse?.activities)
						? inboxDataResponse.activities
						: [],
					summary: {
						totalReaderMessages:
							inboxDataResponse?.summary?.totalReaderMessages || 0,
						recentReaderMessages:
							inboxDataResponse?.summary?.recentReaderMessages || 0,
						activePosts: inboxDataResponse?.summary?.activePosts || 0,
						uniqueReaders: inboxDataResponse?.summary?.uniqueReaders || 0,
					},
				});
			} catch (error) {
				console.error('Author inbox load error:', error);
				toast.error(error.message || 'Could not load your inbox activity', {
					id: 'author-inbox-load-error',
				});
				setInboxData({
					activities: [],
					summary: {
						totalReaderMessages: 0,
						recentReaderMessages: 0,
						activePosts: 0,
						uniqueReaders: 0,
					},
				});
			}
		};

		loadDashboardData();
	}, []);

	const myPosts = useMemo(() => posts, [posts]);

	const filteredPosts = useMemo(
		() =>
			myPosts.filter((post) => {
				const query = search.toLowerCase();
				const titleMatch = post.title?.toLowerCase().includes(query);
				const summaryMatch = post.summary?.toLowerCase().includes(query);
				const categoryMatch = (post.category || '')
					.toLowerCase()
					.includes(query);
				const tagMatch = (post.tags || []).some((tag) =>
					tag.toLowerCase().includes(query),
				);

				return titleMatch || summaryMatch || categoryMatch || tagMatch;
			}),
		[myPosts, search],
	);

	const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);

	useEffect(() => {
		if (currentPage > totalPages && totalPages > 0) {
			setCurrentPage(totalPages);
		}
	}, [currentPage, totalPages]);

	const paginatedPosts = filteredPosts.slice(
		(currentPage - 1) * POSTS_PER_PAGE,
		currentPage * POSTS_PER_PAGE,
	);

	const now = new Date();
	const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
	const weekStart = new Date(now);
	weekStart.setDate(now.getDate() - 7);

	const categoriesUsed = new Set(
		myPosts.map((post) => post.category).filter(Boolean),
	).size;

	const tagsUsed = new Set(myPosts.flatMap((post) => post.tags || [])).size;
	const taggedPostsCount = myPosts.filter(
		(post) => (post.tags || []).length > 0,
	).length;
	const thisMonthCount = myPosts.filter(
		(post) => new Date(post.createdAt) >= monthStart,
	).length;
	const thisWeekCount = myPosts.filter(
		(post) => new Date(post.createdAt) >= weekStart,
	).length;
	const untaggedPostsCount = myPosts.filter(
		(post) => (post.tags || []).length === 0,
	).length;
	const olderPostsCount = myPosts.filter((post) => {
		const ageInDays =
			(now.getTime() - new Date(post.createdAt).getTime()) / 86400000;
		return ageInDays > 21;
	}).length;
	const postsWithoutCategoryCount = myPosts.filter(
		(post) => !post.category,
	).length;

	const recentPosts = [...myPosts]
		.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
		.slice(0, 4);

	const categoryBreakdown = Object.entries(
		myPosts.reduce((accumulator, post) => {
			const key = post.category || 'General';
			accumulator[key] = (accumulator[key] || 0) + 1;
			return accumulator;
		}, {}),
	)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 4);

	const topTags = Object.entries(
		myPosts.reduce((accumulator, post) => {
			(post.tags || []).forEach((tag) => {
				accumulator[tag] = (accumulator[tag] || 0) + 1;
			});
			return accumulator;
		}, {}),
	)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 5);

	const monthlyBreakdown = Array.from({ length: 4 }, (_, index) => {
		const date = new Date(now.getFullYear(), now.getMonth() - (3 - index), 1);
		const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
		const count = myPosts.filter((post) => {
			const postDate = new Date(post.createdAt);
			return postDate >= date && postDate < nextMonth;
		}).length;

		return {
			label: formatMonthLabel(date),
			count,
		};
	});

	const busiestMonthCount = Math.max(
		...monthlyBreakdown.map((item) => item.count),
		1,
	);
	const dominantCategory = categoryBreakdown[0] || null;
	const dominantCategoryShare = dominantCategory
		? Math.round((dominantCategory[1] / Math.max(myPosts.length, 1)) * 100)
		: 0;

	const editorialReminders = [
		{
			title: 'Refresh older stories',
			description:
				olderPostsCount > 0
					? `${olderPostsCount} posts are older than three weeks and could use a refresh, repost, or follow-up article.`
					: 'No older-story refreshes are pressing right now. Your library is still relatively fresh.',
		},
		{
			title: 'Strengthen discoverability',
			description:
				untaggedPostsCount > 0
					? `${untaggedPostsCount} posts have no tags yet, so they are harder to surface through related content and search.`
					: 'Every published post currently has at least one tag, which is good for discovery.',
		},
		{
			title: 'Check category balance',
			description:
				dominantCategory && dominantCategoryShare >= 60
					? `${dominantCategory[0]} accounts for ${dominantCategoryShare}% of your posts. A new category could broaden your feed.`
					: 'Your current category mix looks reasonably balanced for the posts available.',
		},
	];

	const planItems = [
		{
			label: 'Next focus',
			value:
				untaggedPostsCount > 0
					? 'Tighten tags on your existing posts before publishing another one.'
					: 'You are clear to publish a new story with a fresh category angle.',
		},
		{
			label: 'Content rhythm',
			value: `${thisMonthCount} posts this month across ${categoriesUsed} categories.`,
		},
		{
			label: 'Category gap',
			value:
				categoryBreakdown.length <= 1
					? 'Most of your writing sits in one area. A second strong category would improve variety.'
					: `Your top category is ${dominantCategory?.[0] || 'General'}, so consider a complementary follow-up topic next.`,
		},
		{
			label: 'Metadata health',
			value:
				postsWithoutCategoryCount > 0
					? `${postsWithoutCategoryCount} posts need a clearer category assignment.`
					: 'Category assignment is clean across your current posts.',
		},
	];

	const statCards = [
		{
			label: 'Posts',
			value: myPosts.length,
			icon: <PenTool size={20} />,
			valueClassName: 'text-cyan-400',
			iconClassName: 'text-cyan-300',
			panelClassName: 'bg-cyan-500/8',
		},
		{
			label: 'Categories',
			value: categoriesUsed,
			icon: <FileText size={20} />,
			valueClassName: 'text-emerald-400',
			iconClassName: 'text-emerald-300',
			panelClassName: 'bg-emerald-500/8',
		},
		{
			label: 'Tags',
			value: tagsUsed,
			icon: <Tag size={20} />,
			valueClassName: 'text-violet-400',
			iconClassName: 'text-violet-300',
			panelClassName: 'bg-violet-500/8',
		},
		{
			label: 'This Month',
			value: thisMonthCount,
			icon: <CalendarDays size={20} />,
			valueClassName: 'text-amber-400',
			iconClassName: 'text-amber-300',
			panelClassName: 'bg-amber-500/8',
		},
		{
			label: 'This Week',
			value: thisWeekCount,
			icon: <Sparkles size={20} />,
			valueClassName: 'text-sky-400',
			iconClassName: 'text-sky-300',
			panelClassName: 'bg-sky-500/8',
		},
		{
			label: 'Tagged Posts',
			value: taggedPostsCount,
			icon: <Tag size={20} />,
			valueClassName: 'text-rose-400',
			iconClassName: 'text-rose-300',
			panelClassName: 'bg-rose-500/8',
		},
	];

	const menuItems = [
		{ icon: <Home size={18} />, label: 'Dashboard', path: '/author' },
		{
			icon: <FileText size={18} />,
			label: 'My Articles',
			path: '/author#articles',
		},
		{ icon: <Bell size={18} />, label: 'Inbox', path: '/author#inbox' },
		{
			icon: <ChartColumn size={18} />,
			label: 'Analytics',
			path: '/author#analytics',
		},
		{
			icon: <CalendarDays size={18} />,
			label: 'Post Plan',
			path: '/author#plan',
		},
		{
			icon: <Settings size={18} />,
			label: 'Settings',
			path: '/author#settings',
		},
	];

	const deletePost = async (postId) => {
		const res = await fetch(`${API_URL}/post/${postId}`, {
			method: 'DELETE',
			credentials: 'include',
		});

		if (res.ok) {
			setPosts((currentPosts) =>
				currentPosts.filter((post) => post._id !== postId),
			);
			toast.success('Post deleted successfully');
			return;
		}

		toast.error('Failed to delete post');
	};

	const openDeletePostConfirm = (post) => {
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

	if (!userInfo || userInfo.role !== 'author') {
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
				eyebrow="Author Confirmation"
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

			<aside
				className={`fixed left-0 top-[72px] z-50 flex h-[calc(100vh-72px)] w-[84vw] max-w-[18rem] flex-col bg-slate-900/95 px-5 py-6 shadow-2xl shadow-black/30 backdrop-blur-xl transition-transform duration-300 ${
					isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
				} md:sticky md:top-[76px] md:z-10 md:h-[calc(100vh-76px)] md:w-64 md:max-w-none md:translate-x-0 md:self-start`}>
				<button
					onClick={() => setIsSidebarOpen(false)}
					className="mb-5 inline-flex items-center gap-2 self-start rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-200 md:hidden">
					<X size={16} />
					Close
				</button>

				<nav className="mt-2 flex-1 space-y-2 overflow-y-auto">
					<p className="px-3 text-xs uppercase tracking-wider text-slate-500">
						Navigation
					</p>
					{menuItems.map((item) => {
						const itemUrl = new URL(item.path, 'http://localhost');
						const isActive =
							location.pathname === itemUrl.pathname &&
							(location.hash || '') === (itemUrl.hash || '');

						return (
							<Link
								key={item.path}
								to={item.path}
								onClick={() => setIsSidebarOpen(false)}
								className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition-all ${
									isActive
										? 'bg-cyan-500/20 text-cyan-300'
										: 'text-slate-300 hover:bg-white/5 hover:text-white'
								}`}>
								{item.icon}
								<span className="text-sm font-medium">{item.label}</span>
							</Link>
						);
					})}
				</nav>

				<button className="mt-6 flex items-center gap-3 rounded-2xl px-4 py-3 text-slate-300 transition hover:bg-white/5 hover:text-red-400">
					<LogOut size={18} /> Logout
				</button>
			</aside>

			<main className="min-w-0 flex-1">
				<div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.12),_transparent_30%)]">
					<div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
						<section className="rounded-[2rem] bg-white/5 p-4 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-6 lg:p-8">
							<div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
								<div className="flex items-start gap-3 sm:gap-4">
									<div className="flex h-11 w-11 flex-shrink-0 items-center justify-center">
										<button
											onClick={() => setIsSidebarOpen(true)}
											className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-white/5 text-xl text-white md:hidden">
											<Menu size={20} />
										</button>
										{location.hash && (
											<button
												onClick={() => navigate('/author')}
												className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-white transition hover:bg-white/10">
												<ArrowLeft size={20} />
											</button>
										)}
									</div>
									<div>
										<p className="text-xs uppercase tracking-[0.28em] text-cyan-300/80">
											Author Dashboard
										</p>
										<h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
											Hello {userInfo.username}!
										</h1>
										<p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
											Track your publishing rhythm, refine your article mix, and
											manage your stories from one focused workspace.
										</p>
									</div>
								</div>

								<div className="flex flex-col gap-3 sm:flex-row">
									<div className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-300">
										<span className="font-semibold text-white">
											{myPosts.length}
										</span>{' '}
										total stories
									</div>
									<Link
										to="/create"
										className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 px-5 py-3 font-bold text-white transition-transform hover:scale-[1.02]">
										<PenTool size={18} />
										Write new post
									</Link>
								</div>
							</div>
						</section>

						<section className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-6">
							{statCards.map((card) => (
								<div
									key={card.label}
									className={`rounded-[1.75rem] ${card.panelClassName} p-5 shadow-lg shadow-black/5`}>
									<div className="flex items-center gap-3 text-sm font-medium text-slate-300">
										<span
											className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-lg ${card.iconClassName}`}>
											{card.icon}
										</span>
										<p>{card.label}</p>
									</div>
									<p
										className={`mt-5 text-3xl font-bold sm:text-4xl ${card.valueClassName}`}>
										{card.value}
									</p>
								</div>
							))}
						</section>

						<section className="mt-6 space-y-6">
							<div className="rounded-[2rem] bg-white/5 p-4 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-6">
								<div className="mb-6 flex items-end justify-between gap-4">
									<div>
										<h2 className="text-2xl font-bold text-white">
											Latest Articles
										</h2>
										<p className="mt-2 text-sm text-slate-400">
											Your freshest stories and their quick actions.
										</p>
									</div>
									<p className="text-sm text-slate-500">
										{recentPosts.length} shown
									</p>
								</div>

								<div className="space-y-3">
									{recentPosts.map((post, index) => (
										<div
											key={post._id}
											className="rounded-[1.35rem] bg-slate-900/40 px-4 py-3 transition hover:bg-slate-900/70 sm:px-5">
											<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
												<div className="flex min-w-0 flex-1 items-start gap-3">
													<span className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-white/5 text-base font-bold text-slate-500">
														{(index + 1).toString().padStart(2, '0')}
													</span>
													<div className="min-w-0">
														<h3 className="break-words text-sm font-semibold leading-6 text-white sm:text-base">
															{post.title}
														</h3>
														<p className="mt-1 text-sm text-slate-400">
															{post.category || 'General'} •{' '}
															{formatDisplayDate(post.createdAt)}
														</p>
													</div>
												</div>

												<div className="flex w-full gap-2 sm:w-auto sm:flex-shrink-0">
													<Link
														to={`/edit/${post._id}`}
														className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10 sm:flex-none">
														<PenSquare size={16} />
														Edit
													</Link>
													<Link
														to={`/post/${post._id}`}
														className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-cyan-500/15 px-4 py-2 text-sm text-cyan-200 transition hover:bg-cyan-500/25 sm:flex-none">
														<FileText size={16} />
														View
													</Link>
												</div>
											</div>
										</div>
									))}
									{myPosts.length === 0 && (
										<div className="rounded-[1.35rem] bg-slate-900/40 px-4 py-6 text-sm text-slate-400">
											No posts yet. Your first article will appear here as soon
											as you publish it.
										</div>
									)}
								</div>
							</div>

							<div
								id="articles"
								className="rounded-[2rem] bg-white/5 shadow-xl shadow-black/10 backdrop-blur-xl">
								<div className="flex flex-col gap-4 p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
									<div>
										<h2 className="flex items-center gap-2 text-2xl font-bold text-white">
											<FileText size={24} /> My Articles
										</h2>
										<p className="mt-2 text-sm text-slate-400">
											Search, review, edit, and remove your published stories.
										</p>
									</div>

									<input
										type="search"
										value={search}
										onChange={(e) => {
											setSearch(e.target.value);
											setCurrentPage(1);
										}}
										placeholder="Search title, category, summary, or tag"
										className="w-full rounded-2xl bg-slate-950/50 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none lg:max-w-sm"
									/>
								</div>

								<div className="space-y-3 px-4 pb-4 sm:px-6 sm:pb-6 md:hidden">
									{paginatedPosts.map((post) => (
										<div
											key={post._id}
											className="rounded-[1.35rem] bg-slate-900/40 p-4">
											<div className="flex items-start justify-between gap-3">
												<div className="min-w-0">
													<p className="text-base font-semibold text-white">
														{post.title}
													</p>
													<p className="mt-1 text-sm text-slate-400">
														{post.category || 'General'} •{' '}
														{formatDisplayDate(post.createdAt)}
													</p>
												</div>
												<button
													onClick={() => openDeletePostConfirm(post)}
													className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-red-500/15 text-red-300">
													<Trash2 size={16} />
												</button>
											</div>

											<p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-300">
												{post.summary}
											</p>

											<div className="mt-4 flex flex-wrap gap-2">
												{(post.tags || []).slice(0, 3).map((tag) => (
													<span
														key={tag}
														className="rounded-full bg-white/5 px-3 py-1 text-xs text-cyan-200">
														#{tag}
													</span>
												))}
											</div>

											<div className="mt-4 flex gap-2">
												<Link
													to={`/edit/${post._id}`}
													className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10">
													<PenSquare size={16} />
													Edit
												</Link>
												<Link
													to={`/post/${post._id}`}
													className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-cyan-500/15 px-4 py-2 text-sm text-cyan-200 transition hover:bg-cyan-500/25">
													<FileText size={16} />
													View
												</Link>
											</div>
										</div>
									))}
								</div>

								<div className="hidden overflow-x-auto md:block">
									<table className="w-full min-w-[860px]">
										<thead>
											<tr className="text-left text-sm text-slate-400">
												<th className="px-6 py-4">Title</th>
												<th className="px-6 py-4">Category</th>
												<th className="px-6 py-4">Tags</th>
												<th className="px-6 py-4">Published</th>
												<th className="px-6 py-4">Actions</th>
											</tr>
										</thead>
										<tbody>
											{paginatedPosts.map((post) => (
												<tr
													key={post._id}
													className="text-sm text-slate-300 transition hover:bg-white/5">
													<td className="px-6 py-4">
														<p className="font-medium text-white">
															{post.title}
														</p>
														<p className="mt-1 line-clamp-2 text-xs text-slate-500">
															{post.summary}
														</p>
													</td>
													<td className="px-6 py-4">
														{post.category || 'General'}
													</td>
													<td className="px-6 py-4">
														<div className="flex flex-wrap gap-2">
															{(post.tags || []).length > 0 ? (
																(post.tags || []).slice(0, 3).map((tag) => (
																	<span
																		key={tag}
																		className="rounded-full bg-white/5 px-3 py-1 text-xs text-cyan-200">
																		#{tag}
																	</span>
																))
															) : (
																<span className="text-slate-500">No tags</span>
															)}
														</div>
													</td>
													<td className="px-6 py-4 text-slate-400">
														{formatDisplayDate(post.createdAt)}
													</td>
													<td className="px-6 py-4">
														<div className="flex gap-2">
															<Link
																to={`/edit/${post._id}`}
																className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-slate-200 transition hover:bg-white/10">
																<PenSquare size={16} />
															</Link>
															<Link
																to={`/post/${post._id}`}
																className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-200 transition hover:bg-cyan-500/25">
																<FileText size={16} />
															</Link>
															<button
																onClick={() => openDeletePostConfirm(post)}
																className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/15 text-red-300 transition hover:bg-red-500/25">
																<Trash2 size={16} />
															</button>
														</div>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>

								<div className="flex flex-col gap-4 px-4 pb-4 pt-2 text-sm text-slate-400 sm:px-6 sm:pb-6 lg:flex-row lg:items-center lg:justify-between">
									<p>
										Showing {paginatedPosts.length} of {filteredPosts.length}{' '}
										posts
									</p>

									<div className="flex flex-wrap gap-2">
										<button
											type="button"
											onClick={() =>
												setCurrentPage((prev) => Math.max(prev - 1, 1))
											}
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
												setCurrentPage((prev) =>
													Math.min(prev + 1, totalPages || 1),
												)
											}
											disabled={currentPage === totalPages || totalPages === 0}
											className="rounded-xl bg-white/5 px-3 py-2 text-slate-200 transition disabled:cursor-not-allowed disabled:opacity-40">
											Next
										</button>
									</div>
								</div>
							</div>

							<div
								id="analytics"
								className="rounded-[2rem] bg-white/5 p-5 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-6">
								<h2 className="flex items-center gap-2 text-2xl font-bold text-white">
									<ChartColumn size={24} /> Analytics
								</h2>
								<p className="mt-2 text-sm text-slate-400">
									Real publishing signals from your current stories.
								</p>
								<div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
									<div className="space-y-3">
										<div className="grid gap-3 sm:grid-cols-3">
											<div className="rounded-[1.35rem] bg-slate-900/40 p-4">
												<p className="text-xs uppercase tracking-[0.22em] text-slate-500">
													Dominant Category
												</p>
												<p className="mt-3 text-lg font-semibold text-white">
													{dominantCategory?.[0] || 'No data'}
												</p>
												<p className="mt-1 text-sm text-slate-400">
													{dominantCategory
														? `${dominantCategoryShare}% of posts`
														: 'Publish to unlock'}
												</p>
											</div>
											<div className="rounded-[1.35rem] bg-slate-900/40 p-4">
												<p className="text-xs uppercase tracking-[0.22em] text-slate-500">
													Top Tag
												</p>
												<p className="mt-3 text-lg font-semibold text-white">
													{topTags[0]?.[0]
														? `#${topTags[0][0]}`
														: 'No tags yet'}
												</p>
												<p className="mt-1 text-sm text-slate-400">
													{topTags[0]
														? `${topTags[0][1]} uses`
														: 'Tag your stories'}
												</p>
											</div>
											<div className="rounded-[1.35rem] bg-slate-900/40 p-4">
												<p className="text-xs uppercase tracking-[0.22em] text-slate-500">
													Publishing Pace
												</p>
												<p className="mt-3 text-lg font-semibold text-white">
													{thisMonthCount} this month
												</p>
												<p className="mt-1 text-sm text-slate-400">
													{thisWeekCount} in the last 7 days
												</p>
											</div>
										</div>

										<div className="rounded-[1.35rem] bg-slate-900/40 p-4">
											<div className="flex items-center justify-between gap-4">
												<p className="text-sm font-semibold text-white">
													Category Breakdown
												</p>
												<p className="text-sm text-slate-500">
													{myPosts.length} total posts
												</p>
											</div>
											<div className="mt-4 space-y-3">
												{categoryBreakdown.length > 0 ? (
													categoryBreakdown.map(([category, count]) => (
														<div key={category}>
															<div className="flex items-center justify-between gap-4">
																<p className="text-sm text-white">{category}</p>
																<p className="text-sm text-cyan-300">{count}</p>
															</div>
															<div className="mt-2 h-2 rounded-full bg-white/5">
																<div
																	className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
																	style={{
																		width: `${Math.max(
																			16,
																			(count / Math.max(myPosts.length, 1)) *
																				100,
																		)}%`,
																	}}
																/>
															</div>
														</div>
													))
												) : (
													<p className="text-sm text-slate-400">
														Your category mix will appear once you publish a few
														stories.
													</p>
												)}
											</div>
										</div>
									</div>

									<div className="space-y-3">
										<div className="rounded-[1.35rem] bg-slate-900/40 p-4">
											<p className="text-sm font-semibold text-white">
												Publishing Rhythm
											</p>
											<div className="mt-4 grid grid-cols-4 gap-3">
												{monthlyBreakdown.map((item) => (
													<div key={item.label} className="text-center">
														<div className="flex h-28 items-end justify-center rounded-2xl bg-white/5 px-2 pb-3">
															<div
																className="w-full rounded-xl bg-gradient-to-t from-cyan-500 to-purple-500"
																style={{
																	height: `${Math.max(
																		14,
																		(item.count / busiestMonthCount) * 88,
																	)}px`,
																}}
															/>
														</div>
														<p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
															{item.label}
														</p>
														<p className="mt-1 text-sm text-white">
															{item.count}
														</p>
													</div>
												))}
											</div>
										</div>

										<div className="rounded-[1.35rem] bg-slate-900/40 p-4">
											<p className="text-sm font-semibold text-white">
												Top Tags
											</p>
											<div className="mt-4 flex flex-wrap gap-2">
												{topTags.length > 0 ? (
													topTags.map(([tag, count]) => (
														<span
															key={tag}
															className="rounded-full bg-white/5 px-3 py-2 text-sm text-cyan-200">
															#{tag}{' '}
															<span className="text-slate-400">{count}</span>
														</span>
													))
												) : (
													<p className="text-sm text-slate-400">
														No tag trends yet. Add tags to your posts to build a
														stronger discovery map.
													</p>
												)}
											</div>
										</div>
									</div>
								</div>
							</div>

							<div className="grid gap-6 xl:grid-cols-2">
								<div
									id="plan"
									className="rounded-[2rem] bg-white/5 p-5 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-6">
									<h2 className="flex items-center gap-2 text-2xl font-bold text-white">
										<CalendarDays size={24} /> Post Plan
									</h2>
									<p className="mt-2 text-sm text-slate-400">
										Use your current content patterns to choose the next best
										move.
									</p>
									<div className="mt-6 grid gap-3 sm:grid-cols-2">
										{planItems.map((item) => (
											<div
												key={item.label}
												className="rounded-[1.35rem] bg-slate-900/40 p-4">
												<p className="text-xs uppercase tracking-[0.25em] text-slate-500">
													{item.label}
												</p>
												<p className="mt-3 text-sm leading-6 text-white">
													{item.value}
												</p>
											</div>
										))}
									</div>
								</div>

								<div
									id="inbox"
									className="rounded-[2rem] bg-white/5 p-5 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-6">
									<h2 className="flex items-center gap-2 text-2xl font-bold text-white">
										<Bell size={24} /> Inbox
									</h2>
									<p className="mt-2 text-sm text-slate-400">
										Reader activity on your posts, plus a smaller editorial
										reminder stream for follow-up work.
									</p>
									<div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
										<div>
											<div className="grid gap-3 sm:grid-cols-3">
												<div className="rounded-[1.35rem] bg-slate-900/40 p-4">
													<p className="text-xs uppercase tracking-[0.22em] text-slate-500">
														Reader Messages
													</p>
													<p className="mt-3 text-2xl font-bold text-cyan-300">
														{inboxData.summary.totalReaderMessages}
													</p>
													<p className="mt-1 text-sm text-slate-400">
														Across your published posts
													</p>
												</div>
												<div className="rounded-[1.35rem] bg-slate-900/40 p-4">
													<p className="text-xs uppercase tracking-[0.22em] text-slate-500">
														Last 7 Days
													</p>
													<p className="mt-3 text-2xl font-bold text-emerald-300">
														{inboxData.summary.recentReaderMessages}
													</p>
													<p className="mt-1 text-sm text-slate-400">
														New comments and replies
													</p>
												</div>
												<div className="rounded-[1.35rem] bg-slate-900/40 p-4">
													<p className="text-xs uppercase tracking-[0.22em] text-slate-500">
														Unique Readers
													</p>
													<p className="mt-3 text-2xl font-bold text-violet-300">
														{inboxData.summary.uniqueReaders}
													</p>
													<p className="mt-1 text-sm text-slate-400">
														Across {inboxData.summary.activePosts} active posts
													</p>
												</div>
											</div>

											<div className="mt-4 space-y-3">
												{inboxData.activities.length > 0 ? (
													inboxData.activities.map((activity) => (
														<div
															key={activity._id}
															className="rounded-[1.35rem] bg-slate-900/40 p-4">
															<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
																<div className="min-w-0">
																	<p className="text-sm font-semibold text-white">
																		{activity.author?.username || 'A reader'}{' '}
																		<span className="text-slate-400">
																			left a {activity.type}
																		</span>
																	</p>
																	<p className="mt-1 text-sm text-cyan-200">
																		on{' '}
																		<Link
																			to={`/post/${activity.post?._id}`}
																			className="hover:underline">
																			{activity.post?.title || 'your post'}
																		</Link>
																	</p>
																</div>
																<p className="text-xs uppercase tracking-[0.18em] text-slate-500">
																	{formatRelativeTime(activity.createdAt)}
																</p>
															</div>
															<p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">
																{activity.content}
															</p>
														</div>
													))
												) : (
													<div className="rounded-[1.35rem] bg-slate-900/40 p-4 text-sm leading-6 text-slate-400">
														No reader activity yet. New comments on your posts
														will start appearing here.
													</div>
												)}
											</div>
										</div>

										<div className="space-y-3">
											<div className="rounded-[1.35rem] bg-slate-900/40 p-4">
												<p className="text-sm font-semibold text-white">
													Editorial Reminders
												</p>
												<p className="mt-2 text-sm leading-6 text-slate-400">
													Content follow-up notes based on your current library.
												</p>
											</div>
											{editorialReminders.map((alert) => (
												<div
													key={alert.title}
													className="rounded-[1.35rem] bg-slate-900/40 p-4">
													<p className="text-sm font-semibold text-white">
														{alert.title}
													</p>
													<p className="mt-2 text-sm leading-6 text-slate-400">
														{alert.description}
													</p>
												</div>
											))}
										</div>
									</div>
								</div>
							</div>

							<div
								id="settings"
								className="rounded-[2rem] bg-white/5 p-5 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-6">
								<h2 className="flex items-center gap-2 text-2xl font-bold text-white">
									<Settings size={24} /> Settings
								</h2>
								<p className="mt-2 text-sm text-slate-400">
									Quick account reminders for keeping your author presence tidy.
								</p>
								<div className="mt-6 grid gap-3 sm:grid-cols-3">
									<div className="rounded-[1.35rem] bg-slate-900/40 p-4">
										<p className="text-sm font-semibold text-white">Profile</p>
										<p className="mt-2 text-sm leading-6 text-slate-400">
											Keep your author identity clear so readers recognize your
											work instantly.
										</p>
									</div>
									<div className="rounded-[1.35rem] bg-slate-900/40 p-4">
										<p className="text-sm font-semibold text-white">
											Content Quality
										</p>
										<p className="mt-2 text-sm leading-6 text-slate-400">
											Add tags consistently and keep category choices
											intentional.
										</p>
									</div>
									<div className="rounded-[1.35rem] bg-slate-900/40 p-4">
										<p className="text-sm font-semibold text-white">Workflow</p>
										<p className="mt-2 text-sm leading-6 text-slate-400">
											Use the dashboard to review, refine, and publish from a
											single place.
										</p>
									</div>
								</div>
							</div>
						</section>
					</div>
				</div>
			</main>
		</div>
	);
};

export default AuthorDashboard;
