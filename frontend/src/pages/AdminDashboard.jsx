import { useContext, useEffect, useMemo, useState } from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
	CalendarDays,
	ChartColumn,
	FileText,
	Home,
	LogOut,
	Mail,
	Menu,
	PenSquare,
	PenTool,
	Settings,
	Trash2,
	UserCog,
	UserPen,
	Users,
	UsersRound,
	Wallet,
	X,
} from 'lucide-react';
import { UserContext } from '../UserContext';
import ConfirmationDialog from '../components/ConfirmationDialog';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const USERS_PER_PAGE = 4;

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

const readJsonResponse = async (response, fallbackMessage) => {
	const payload = await response.json().catch(() => null);

	if (!response.ok) {
		throw new Error(payload?.message || fallbackMessage);
	}

	return payload;
};

const AdminDashboard = () => {
	const { userInfo, setUserInfo } = useContext(UserContext);
	const location = useLocation();

	const [users, setUsers] = useState([]);
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
	const [newsletterStats, setNewsletterStats] = useState({
		activeSubscribers: 0,
		totalEmails: 0,
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
				const postsResponse = await fetch(`${API_URL}/post/admin/all`, {
					credentials: 'include',
				});
				const postsData = await readJsonResponse(
					postsResponse,
					'Could not load posts',
				);
				setPosts(Array.isArray(postsData) ? postsData : []);
			} catch (error) {
				console.error('Admin posts load error:', error);
				toast.error(error.message || 'Could not load posts', {
					id: 'admin-posts-load-error',
				});
				setPosts([]);
			}

			try {
				const usersResponse = await fetch(`${API_URL}/auth/users`, {
					credentials: 'include',
				});
				const usersData = await readJsonResponse(
					usersResponse,
					'Could not load users',
				);
				setUsers(Array.isArray(usersData) ? usersData : []);
			} catch (error) {
				console.error('Admin users load error:', error);
				toast.error(error.message || 'Could not load users', {
					id: 'admin-users-load-error',
				});
				setUsers([]);
			}

			try {
				const inboxResponse = await fetch(`${API_URL}/comments/inbox/admin`, {
					credentials: 'include',
				});
				const inboxResponseData = await readJsonResponse(
					inboxResponse,
					'Could not load inbox activity',
				);
				setInboxData({
					activities: Array.isArray(inboxResponseData?.activities)
						? inboxResponseData.activities
						: [],
					summary: {
						totalReaderMessages:
							inboxResponseData?.summary?.totalReaderMessages || 0,
						recentReaderMessages:
							inboxResponseData?.summary?.recentReaderMessages || 0,
						activePosts: inboxResponseData?.summary?.activePosts || 0,
						uniqueReaders: inboxResponseData?.summary?.uniqueReaders || 0,
					},
				});
			} catch (error) {
				console.error('Admin inbox load error:', error);
				toast.error(error.message || 'Could not load inbox activity', {
					id: 'admin-inbox-load-error',
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

			try {
				const newsletterResponse = await fetch(`${API_URL}/newsletter/stats`);
				const newsletterData = await readJsonResponse(
					newsletterResponse,
					'Could not load subscriber stats',
				);
				setNewsletterStats({
					activeSubscribers: newsletterData?.activeSubscribers || 0,
					totalEmails: newsletterData?.totalEmails || 0,
				});
			} catch (error) {
				console.error('Newsletter stats load error:', error);
				toast.error(error.message || 'Could not load subscriber stats', {
					id: 'admin-newsletter-load-error',
				});
				setNewsletterStats({
					activeSubscribers: 0,
					totalEmails: 0,
				});
			}
		};

		loadDashboardData();
	}, []);

	const totalUsers = users.length;
	const totalAuthors = users.filter((user) => user.role === 'author').length;
	const totalAdmins = users.filter((user) => user.role === 'admin').length;
	const totalReaders = users.filter((user) => user.role === 'reader').length;
	const totalSubscribers = newsletterStats.activeSubscribers;

	const filteredUsers = useMemo(
		() =>
			users.filter(
				(user) =>
					user.username.toLowerCase().includes(search.toLowerCase()) ||
					user.email.toLowerCase().includes(search.toLowerCase()),
			),
		[users, search],
	);

	const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);

	useEffect(() => {
		if (currentPage > totalPages && totalPages > 0) {
			setCurrentPage(totalPages);
		}
	}, [currentPage, totalPages]);

	const paginatedUsers = filteredUsers.slice(
		(currentPage - 1) * USERS_PER_PAGE,
		currentPage * USERS_PER_PAGE,
	);

	const now = new Date();
	const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
	const weekStart = new Date(now);
	weekStart.setDate(now.getDate() - 7);

	const recentPosts = posts.slice(0, 4);
	const thisMonthPosts = posts.filter(
		(post) => new Date(post.createdAt) >= monthStart,
	).length;
	const thisWeekPosts = posts.filter(
		(post) => new Date(post.createdAt) >= weekStart,
	).length;
	const postsWithoutTags = posts.filter((post) => (post.tags || []).length === 0).length;
	const postsWithoutCategory = posts.filter((post) => !post.category).length;

	const categoryBreakdown = Object.entries(
		posts.reduce((accumulator, post) => {
			const key = post.category || 'General';
			accumulator[key] = (accumulator[key] || 0) + 1;
			return accumulator;
		}, {}),
	).sort((a, b) => b[1] - a[1]);

	const dominantCategory = categoryBreakdown[0] || null;
	const dominantCategoryShare = dominantCategory
		? Math.round((dominantCategory[1] / Math.max(posts.length, 1)) * 100)
		: 0;

	const monthlyBreakdown = Array.from({ length: 4 }, (_, index) => {
		const date = new Date(now.getFullYear(), now.getMonth() - (3 - index), 1);
		const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
		const count = posts.filter((post) => {
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

	const authorBreakdown = Object.entries(
		posts.reduce((accumulator, post) => {
			const key = post.author?.username || 'Unknown';
			accumulator[key] = (accumulator[key] || 0) + 1;
			return accumulator;
		}, {}),
	)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 5);

	const authorsWithoutPosts = users.filter(
		(user) =>
			user.role === 'author' &&
			!posts.some((post) => String(post.author?._id) === String(user._id)),
	).length;

	const inactiveAuthors = users.filter((user) => {
		if (user.role !== 'author') return false;
		const authoredPosts = posts.filter(
			(post) => String(post.author?._id) === String(user._id),
		);
		if (authoredPosts.length === 0) return false;

		const latestPostDate = authoredPosts.reduce((latest, post) => {
			const createdAt = new Date(post.createdAt);
			return createdAt > latest ? createdAt : latest;
		}, new Date(0));

		return (now.getTime() - latestPostDate.getTime()) / 86400000 > 21;
	}).length;

	const subscriberConversion =
		totalUsers > 0 ? Math.round((totalSubscribers / totalUsers) * 100) : 0;
	const readersPerAuthor =
		totalAuthors > 0 ? Math.round((totalReaders / totalAuthors) * 10) / 10 : 0;
	const postsPerAuthor =
		totalAuthors > 0 ? Math.round((posts.length / totalAuthors) * 10) / 10 : 0;

	const inboxReminders = [
		{
			title: 'Inactive author watch',
			description:
				inactiveAuthors > 0
					? `${inactiveAuthors} authors have published before but have been quiet for more than three weeks.`
					: 'No previously active authors are currently slipping out of rhythm.',
		},
		{
			title: 'Metadata cleanup',
			description:
				postsWithoutTags > 0 || postsWithoutCategory > 0
					? `${postsWithoutTags} posts need tags and ${postsWithoutCategory} posts need clearer category assignment.`
					: 'Your latest content metadata looks clean across categories and tags.',
		},
		{
			title: 'Subscriber pulse',
			description:
				totalSubscribers > 0
					? `${totalSubscribers} active subscribers are in your newsletter funnel right now.`
					: 'No active subscribers yet, so audience capture needs more attention.',
		},
	];

	const planItems = [
		{
			label: 'Publishing cadence',
			value: `${thisWeekPosts} posts in the last 7 days and ${thisMonthPosts} this month.`,
		},
		{
			label: 'Author coverage',
			value:
				authorsWithoutPosts > 0
					? `${authorsWithoutPosts} authors have no published stories yet and may need onboarding or assignments.`
					: 'Every current author has at least one published story.',
		},
		{
			label: 'Category balance',
			value:
				dominantCategory && dominantCategoryShare >= 55
					? `${dominantCategory[0]} currently makes up ${dominantCategoryShare}% of recent publishing.`
					: 'Your current category mix is reasonably balanced.',
		},
		{
			label: 'Audience capture',
			value:
				subscriberConversion > 0
					? `${subscriberConversion}% of registered users are also active newsletter subscribers.`
					: 'There is no visible newsletter conversion yet from registered users.',
		},
	];

	const settingsCards = [
		{
			title: 'Access Control',
			description: `${totalAdmins} admins, ${totalAuthors} authors, and ${totalReaders} readers are currently active in role distribution.`,
		},
		{
			title: 'Content Taxonomy',
			description:
				postsWithoutCategory > 0 || postsWithoutTags > 0
					? `${postsWithoutCategory} posts lack category clarity and ${postsWithoutTags} still need tags.`
					: 'Posts are currently categorized and tagged with good consistency.',
		},
		{
			title: 'Moderation Surface',
			description: `${inboxData.summary.totalReaderMessages} reader messages exist across ${inboxData.summary.activePosts} active discussion posts.`,
		},
	];

	const statCards = [
		{
			label: 'Posts',
			value: posts.length,
			icon: <PenTool size={20} />,
			valueClassName: 'text-cyan-400',
			iconClassName: 'text-cyan-300',
			panelClassName: 'bg-cyan-500/8',
		},
		{
			label: 'Users',
			value: totalUsers,
			icon: <Users size={20} />,
			valueClassName: 'text-emerald-400',
			iconClassName: 'text-emerald-300',
			panelClassName: 'bg-emerald-500/8',
		},
		{
			label: 'Authors',
			value: totalAuthors,
			icon: <UserPen size={20} />,
			valueClassName: 'text-violet-400',
			iconClassName: 'text-violet-300',
			panelClassName: 'bg-violet-500/8',
		},
		{
			label: 'Readers',
			value: totalReaders,
			icon: <UsersRound size={20} />,
			valueClassName: 'text-amber-400',
			iconClassName: 'text-amber-300',
			panelClassName: 'bg-amber-500/8',
		},
		{
			label: 'Admins',
			value: totalAdmins,
			icon: <UserCog size={20} />,
			valueClassName: 'text-sky-400',
			iconClassName: 'text-sky-300',
			panelClassName: 'bg-sky-500/8',
		},
		{
			label: 'Subscribers',
			value: totalSubscribers,
			icon: <Mail size={20} />,
			valueClassName: 'text-rose-400',
			iconClassName: 'text-rose-300',
			panelClassName: 'bg-rose-500/8',
		},
	];

	const menuItems = [
		{ icon: <Home size={18} />, label: 'Dashboard', path: '/admin' },
		{ icon: <FileText size={18} />, label: 'My Articles', path: '/admin/articles' },
		{ icon: <Mail size={18} />, label: 'Inbox', path: '/admin/inbox' },
		{
			icon: <ChartColumn size={18} />,
			label: 'Analytics',
			path: '/admin/analytics',
		},
		{
			icon: <CalendarDays size={18} />,
			label: 'Post Plan',
			path: '/admin/plan',
		},
		{ icon: <Wallet size={18} />, label: 'Earnings', path: '/admin/earnings' },
		{ icon: <Settings size={18} />, label: 'Settings', path: '/admin/settings' },
	];

	const updateUserRole = async (userId, newRole) => {
		const res = await fetch(`${API_URL}/auth/user/${userId}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ role: newRole }),
			credentials: 'include',
		});

		if (res.ok) {
			setUsers((currentUsers) =>
				currentUsers.map((user) =>
					user._id === userId ? { ...user, role: newRole } : user,
				),
			);
			toast.success(`User role updated to ${newRole}`);
			return;
		}

		toast.error('Failed to update user role');
	};

	const deleteUser = async (userId) => {
		const res = await fetch(`${API_URL}/auth/user/${userId}`, {
			method: 'DELETE',
			credentials: 'include',
		});

		if (res.ok) {
			setUsers((currentUsers) =>
				currentUsers.filter((user) => user._id !== userId),
			);
			toast.success('User deleted successfully');
			return;
		}

		toast.error('Failed to delete user');
	};

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

	const handleLogout = async () => {
		const response = await fetch(`${API_URL}/auth/logout`, {
			method: 'POST',
			credentials: 'include',
		});

		if (response.ok) {
			setUserInfo(null);
			toast.success('Logged out successfully');
			return;
		}

		toast.error('Logout failed');
	};

	const openDeleteUserConfirm = (user) => {
		setPendingAction({
			title: 'Delete this user account?',
			message: `@${user.username} will lose access immediately. This is an admin-only action and should be used carefully.`,
			confirmLabel: 'Delete User',
			tone: 'danger',
			action: () => deleteUser(user._id),
		});
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

				<button
					onClick={handleLogout}
					className="mt-6 flex items-center gap-3 rounded-2xl px-4 py-3 text-slate-300 transition hover:bg-white/5 hover:text-red-400">
					<LogOut size={18} /> Logout
				</button>
			</aside>

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
											Admin Dashboard
										</p>
										<h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
											Hello {userInfo.username.charAt(0).toUpperCase() + userInfo.username.slice(1)}!
										</h1>
										<p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
											Review platform activity, manage your team, and keep publishing
											moving smoothly from one operational workspace.
										</p>
									</div>
								</div>

								<div className="flex flex-col gap-3 sm:flex-row">
									<div className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-300">
										<span className="font-semibold text-white">{totalUsers}</span>{' '}
										registered users
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
									<p className={`mt-5 text-3xl font-bold sm:text-4xl ${card.valueClassName}`}>
										{card.value}
									</p>
								</div>
							))}
						</section>

						<section className="mt-6 space-y-6">
							<div
								id="articles"
								className="rounded-[2rem] bg-white/5 p-4 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-6">
								<div className="mb-6 flex items-end justify-between gap-4">
									<div>
										<h2 className="text-2xl font-bold text-white">Top Articles</h2>
										<p className="mt-2 text-sm text-slate-400">
											Latest published stories with quick moderation actions.
										</p>
									</div>
									<p className="text-sm text-slate-500">
										{Math.min(posts.length, 4)} shown
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
															@{post.author?.username.charAt(0) + post.author?.username.slice(1) || 'unknown'} •{' '}
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
													<button
														onClick={() => openDeletePostConfirm(post)}
														className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-500/15 px-4 py-2 text-sm text-red-300 transition hover:bg-red-500/25 sm:flex-none">
														<Trash2 size={16} />
														Delete
													</button>
												</div>
											</div>
										</div>
									))}
									{posts.length === 0 && (
										<div className="rounded-[1.35rem] bg-slate-900/40 px-4 py-6 text-sm text-slate-400">
											No posts are available yet.
										</div>
									)}
								</div>
								<div className="mt-4 text-center">
									<Link
										to="/admin/articles"
										className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500/20 px-4 py-2 text-sm text-cyan-300 transition hover:bg-cyan-500/30">
										View All Articles →
									</Link>
								</div>
							</div>

							<div className="rounded-[2rem] bg-white/5 shadow-xl shadow-black/10 backdrop-blur-xl">
								<div className="flex flex-col gap-4 p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
									<div>
										<h2 className="flex items-center gap-2 text-2xl font-bold text-white">
											<UserCog size={24} /> Manage Users
										</h2>
										<p className="mt-2 text-sm text-slate-400">
											Search members, update access levels, and remove accounts.
										</p>
									</div>

									<input
										type="search"
										value={search}
										onChange={(e) => {
											setSearch(e.target.value);
											setCurrentPage(1);
										}}
										placeholder="Search by username or email"
										className="w-full rounded-2xl bg-slate-950/50 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none lg:max-w-sm"
									/>
								</div>

								<div className="space-y-3 px-4 pb-4 sm:px-6 sm:pb-6 md:hidden">
									{paginatedUsers.map((user) => (
										<div
											key={user._id}
											className="rounded-[1.35rem] bg-slate-900/40 p-4">
											<div className="flex items-start justify-between gap-3">
												<div className="min-w-0">
													<p className="truncate text-base font-semibold text-white">
														{user.username.charAt(0).toUpperCase() + user.username.slice(1)}
													</p>
													<p className="mt-1 break-all text-sm text-slate-400">
														{user.email}
													</p>
												</div>
												<button
													onClick={() => openDeleteUserConfirm(user)}
													className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-red-500/15 text-red-300">
													<Trash2 size={16} />
												</button>
											</div>

											<div className="mt-4 grid gap-3 sm:grid-cols-2">
												<div className="rounded-2xl bg-white/5 p-3">
													<p className="text-xs uppercase tracking-[0.2em] text-slate-500">
														Role
													</p>
													<select
														value={user.role}
														onChange={(e) => updateUserRole(user._id, e.target.value)}
														className="mt-2 w-full rounded-xl bg-slate-950/60 px-3 py-2 text-sm text-white">
														<option value="reader">Reader</option>
														<option value="author">Author</option>
														<option value="admin">Admin</option>
													</select>
												</div>

												<div className="rounded-2xl bg-white/5 p-3">
													<p className="text-xs uppercase tracking-[0.2em] text-slate-500">
														Joined
													</p>
													<p className="mt-3 text-sm text-slate-300">
														{formatDisplayDate(user.createdAt)}
													</p>
												</div>
											</div>
										</div>
									))}
								</div>

								<div className="hidden overflow-x-auto md:block">
									<table className="w-full min-w-[720px]">
										<thead>
											<tr className="text-left text-sm text-slate-400">
												<th className="px-6 py-4">Username</th>
												<th className="px-6 py-4">Email</th>
												<th className="px-6 py-4">Role</th>
												<th className="px-6 py-4">Joined</th>
												<th className="px-6 py-4">Actions</th>
											</tr>
										</thead>
										<tbody>
											{paginatedUsers.map((user) => (
												<tr
													key={user._id}
													className="text-sm text-slate-300 transition hover:bg-white/5">
													<td className="px-6 py-4 font-medium text-white">
														{user.username}
													</td>
													<td className="px-6 py-4">{user.email}</td>
													<td className="px-6 py-4">
														<select
															value={user.role}
															onChange={(e) => updateUserRole(user._id, e.target.value)}
															className="rounded-xl bg-slate-950/60 px-3 py-2 text-sm text-white">
															<option value="reader">Reader</option>
															<option value="author">Author</option>
															<option value="admin">Admin</option>
														</select>
													</td>
													<td className="px-6 py-4 text-slate-400">
														{formatDisplayDate(user.createdAt)}
													</td>
													<td className="px-6 py-4">
														<button
															onClick={() => openDeleteUserConfirm(user)}
															className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/15 text-red-300 transition hover:bg-red-500/25">
															<Trash2 size={16} />
														</button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>

								<div className="flex flex-col gap-4 px-4 pb-4 pt-2 text-sm text-slate-400 sm:px-6 sm:pb-6 lg:flex-row lg:items-center lg:justify-between">
									<p>
										Showing {paginatedUsers.length} of {filteredUsers.length} users
									</p>

									<div className="flex flex-wrap gap-2">
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
								</div>
							</div>

							<div
								id="inbox"
								className="rounded-[2rem] bg-white/5 p-5 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-6">
								<h2 className="flex items-center gap-2 text-2xl font-bold text-white">
									<Mail size={24} /> Inbox
								</h2>
								<p className="mt-2 text-sm text-slate-400">
									Live platform activity from reader comments and audience growth.
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
													Across all published posts
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
													Active Discussions
												</p>
												<p className="mt-3 text-2xl font-bold text-violet-300">
													{inboxData.summary.activePosts}
												</p>
												<p className="mt-1 text-sm text-slate-400">
													{inboxData.summary.uniqueReaders} unique readers involved
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
																		{activity.post?.title || 'a post'}
																	</Link>{' '}
																	<span className="text-slate-400">
																		by @{activity.post?.author || 'unknown'}
																	</span>
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
													No reader activity yet. Fresh comment activity will surface here.
												</div>
											)}
										</div>
									</div>

									<div className="space-y-3">
										<div className="rounded-[1.35rem] bg-slate-900/40 p-4">
											<p className="text-sm font-semibold text-white">
												Operational Notes
											</p>
											<p className="mt-2 text-sm leading-6 text-slate-400">
												Quick admin prompts grounded in current publishing and audience data.
											</p>
										</div>
										{inboxReminders.map((item) => (
											<div
												key={item.title}
												className="rounded-[1.35rem] bg-slate-900/40 p-4">
												<p className="text-sm font-semibold text-white">{item.title}</p>
												<p className="mt-2 text-sm leading-6 text-slate-400">
													{item.description}
												</p>
											</div>
										))}
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
									Platform-wide content, audience, and author signals.
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
													Readers per Author
												</p>
												<p className="mt-3 text-lg font-semibold text-white">
													{readersPerAuthor}
												</p>
												<p className="mt-1 text-sm text-slate-400">
													Based on current role mix
												</p>
											</div>
											<div className="rounded-[1.35rem] bg-slate-900/40 p-4">
												<p className="text-xs uppercase tracking-[0.22em] text-slate-500">
													Subscriber Reach
												</p>
												<p className="mt-3 text-lg font-semibold text-white">
													{subscriberConversion}%
												</p>
												<p className="mt-1 text-sm text-slate-400">
													Users in newsletter funnel
												</p>
											</div>
										</div>

										<div className="rounded-[1.35rem] bg-slate-900/40 p-4">
											<div className="flex items-center justify-between gap-4">
												<p className="text-sm font-semibold text-white">
													Category Breakdown
												</p>
												<p className="text-sm text-slate-500">{posts.length} total posts</p>
											</div>
											<div className="mt-4 space-y-3">
												{categoryBreakdown.length > 0 ? (
													categoryBreakdown.slice(0, 5).map(([category, count]) => (
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
																			(count / Math.max(posts.length, 1)) * 100,
																		)}%`,
																	}}
																/>
															</div>
														</div>
													))
												) : (
													<p className="text-sm text-slate-400">
														Publishing analytics will appear once posts exist.
													</p>
												)}
											</div>
										</div>
									</div>

									<div className="space-y-3">
										<div className="rounded-[1.35rem] bg-slate-900/40 p-4">
											<p className="text-sm font-semibold text-white">Publishing Rhythm</p>
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
														<p className="mt-1 text-sm text-white">{item.count}</p>
													</div>
												))}
											</div>
										</div>

										<div className="rounded-[1.35rem] bg-slate-900/40 p-4">
											<p className="text-sm font-semibold text-white">Top Authors</p>
											<div className="mt-4 space-y-3">
												{authorBreakdown.length > 0 ? (
													authorBreakdown.map(([author, count]) => (
														<div
															key={author}
															className="flex items-center justify-between gap-4">
															<p className="text-sm text-white">@{author}</p>
															<p className="text-sm text-cyan-300">{count} posts</p>
														</div>
													))
												) : (
													<p className="text-sm text-slate-400">
														Author distribution will appear once posts exist.
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
										Operational next steps based on current publishing and team data.
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
									id="earnings"
									className="rounded-[2rem] bg-white/5 p-5 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-6">
									<h2 className="flex items-center gap-2 text-2xl font-bold text-white">
										<Wallet size={24} /> Earnings
									</h2>
									<p className="mt-2 text-sm text-slate-400">
										Real monetization-readiness signals from your audience and content supply.
									</p>
									<div className="mt-6 grid gap-3 sm:grid-cols-2">
										<div className="rounded-[1.35rem] bg-slate-900/40 p-4">
											<p className="text-xs uppercase tracking-[0.25em] text-slate-500">
												Audience Base
											</p>
											<p className="mt-3 text-lg font-semibold text-white">
												{totalSubscribers} active subscribers
											</p>
											<p className="mt-2 text-sm leading-6 text-slate-400">
												{newsletterStats.totalEmails} total captured emails on record.
											</p>
										</div>
										<div className="rounded-[1.35rem] bg-slate-900/40 p-4">
											<p className="text-xs uppercase tracking-[0.25em] text-slate-500">
												Content Supply
											</p>
											<p className="mt-3 text-lg font-semibold text-white">
												{postsPerAuthor} posts per author
											</p>
											<p className="mt-2 text-sm leading-6 text-slate-400">
												Average story output across current authors.
											</p>
										</div>
										<div className="rounded-[1.35rem] bg-slate-900/40 p-4">
											<p className="text-xs uppercase tracking-[0.25em] text-slate-500">
												Newsletter Conversion
											</p>
											<p className="mt-3 text-lg font-semibold text-white">
												{subscriberConversion}%
											</p>
											<p className="mt-2 text-sm leading-6 text-slate-400">
												Share of registered users currently in the newsletter funnel.
											</p>
										</div>
										<div className="rounded-[1.35rem] bg-slate-900/40 p-4">
											<p className="text-xs uppercase tracking-[0.25em] text-slate-500">
												Readiness Note
											</p>
											<p className="mt-3 text-sm leading-6 text-white">
												{totalSubscribers >= 50
													? 'Your audience is large enough to start testing sponsor, premium, or newsletter monetization experiments.'
													: 'Keep growing subscribers and publishing consistency before expecting meaningful revenue experiments to convert.'}
											</p>
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
									System health and governance notes based on the current platform state.
								</p>
								<div className="mt-6 grid gap-3 sm:grid-cols-3">
									{settingsCards.map((card) => (
										<div
											key={card.title}
											className="rounded-[1.35rem] bg-slate-900/40 p-4">
											<p className="text-sm font-semibold text-white">{card.title}</p>
											<p className="mt-2 text-sm leading-6 text-slate-400">
												{card.description}
											</p>
										</div>
									))}
								</div>
							</div>
						</section>
					</div>
				</div>
			</main>
		</div>
	);
};

export default AdminDashboard;
