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

const AdminDashboard = () => {
	const { userInfo } = useContext(UserContext);
	const location = useLocation();

	const [users, setUsers] = useState([]);
	const [posts, setPosts] = useState([]);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [search, setSearch] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [pendingAction, setPendingAction] = useState(null);
	const [isConfirmingAction, setIsConfirmingAction] = useState(false);

	const [stats, setStats] = useState({
		totalPosts: 0,
		totalUsers: 0,
		totalAuthors: 0,
		totalAdmins: 0,
		totalReaders: 0,
		totalSubscribers: 0,
	});

	useEffect(() => {
		setIsSidebarOpen(false);
	}, [location.pathname]);

	useEffect(() => {
		fetch(`${API_URL}/post`)
			.then((res) => res.json())
			.then((data) => {
				setPosts(data);
				setStats((prev) => ({ ...prev, totalPosts: data.length }));
			});

		fetch(`${API_URL}/auth/users`, { credentials: 'include' })
			.then((res) => res.json())
			.then((data) => {
				setUsers(data);
				const authors = data.filter((u) => u.role === 'author').length;
				const admins = data.filter((u) => u.role === 'admin').length;
				const readers = data.filter((u) => u.role === 'reader').length;

				setStats((prev) => ({
					...prev,
					totalUsers: data.length,
					totalAuthors: authors,
					totalAdmins: admins,
					totalReaders: readers,
				}));
			});

		fetch(`${API_URL}/newsletter/stats`)
			.then((res) => res.json())
			.then((data) => {
				setStats((prev) => ({
					...prev,
					totalSubscribers: data.activeSubscribers,
				}));
			});
	}, []);

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

	const menuItems = [
		{ icon: <Home size={18} />, label: 'Dashboard', path: '/admin' },
		{ icon: <FileText size={18} />, label: 'My Articles', path: '/my-articles' },
		{ icon: <ChartColumn size={18} />, label: 'Analytics', path: '/analytics' },
		{ icon: <Mail size={18} />, label: 'Inbox', path: '/inbox' },
		{ icon: <CalendarDays size={18} />, label: 'Post Plan', path: '/plan' },
		{ icon: <Wallet size={18} />, label: 'Earning', path: '/earning' },
		{ icon: <Settings size={18} />, label: 'Settings', path: '/settings' },
	];

	const statCards = [
		{
			label: 'Posts',
			value: stats.totalPosts,
			icon: <PenTool size={20} />,
			valueClassName: 'text-cyan-400',
			iconClassName: 'text-cyan-300',
			panelClassName: 'bg-cyan-500/8',
		},
		{
			label: 'Users',
			value: stats.totalUsers,
			icon: <Users size={20} />,
			valueClassName: 'text-emerald-400',
			iconClassName: 'text-emerald-300',
			panelClassName: 'bg-emerald-500/8',
		},
		{
			label: 'Authors',
			value: stats.totalAuthors,
			icon: <UserPen size={20} />,
			valueClassName: 'text-violet-400',
			iconClassName: 'text-violet-300',
			panelClassName: 'bg-violet-500/8',
		},
		{
			label: 'Readers',
			value: stats.totalReaders,
			icon: <UsersRound size={20} />,
			valueClassName: 'text-amber-400',
			iconClassName: 'text-amber-300',
			panelClassName: 'bg-amber-500/8',
		},
		{
			label: 'Admins',
			value: stats.totalAdmins,
			icon: <UserCog size={20} />,
			valueClassName: 'text-sky-400',
			iconClassName: 'text-sky-300',
			panelClassName: 'bg-sky-500/8',
		},
		{
			label: 'Subscribers',
			value: stats.totalSubscribers,
			icon: <Mail size={20} />,
			valueClassName: 'text-rose-400',
			iconClassName: 'text-rose-300',
			panelClassName: 'bg-rose-500/8',
		},
	];

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

				<nav className="mt-2 flex-1 space-y-2">
					<p className="px-3 text-xs uppercase tracking-wider text-slate-500">
						Navigation
					</p>
					{menuItems.map((item) => {
						const isActive = location.pathname === item.path;
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
											Hello {userInfo.username}!
										</h1>
										<p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
											Welcome to your admin dashboard. Review platform activity,
											manage your team, and keep publishing moving smoothly on any
											screen size.
										</p>
									</div>
								</div>

								<div className="flex flex-col gap-3 sm:flex-row">
									<div className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-300">
										<span className="font-semibold text-white">
											{stats.totalUsers}
										</span>{' '}
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
							<div className="rounded-[2rem] bg-white/5 p-4 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-6">
								<div className="mb-6 flex items-end justify-between gap-4">
									<div>
										<h2 className="text-2xl font-bold text-white">Top Articles</h2>
										<p className="mt-2 text-sm text-slate-400">
											Your latest stories with quick actions.
										</p>
									</div>
									<p className="text-sm text-slate-500">
										{Math.min(posts.length, 4)} shown
									</p>
								</div>

								<div className="space-y-3">
									{posts.slice(0, 4).map((post, index) => (
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
															@{post.author?.username}
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
														{user.username}
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
														{new Date(user.createdAt).toLocaleDateString()}
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
															onChange={(e) =>
																updateUserRole(user._id, e.target.value)
															}
															className="rounded-xl bg-slate-950/60 px-3 py-2 text-sm text-white">
															<option value="reader">Reader</option>
															<option value="author">Author</option>
															<option value="admin">Admin</option>
														</select>
													</td>
													<td className="px-6 py-4 text-slate-400">
														{new Date(user.createdAt).toLocaleDateString()}
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
						</section>
					</div>
				</div>
			</main>
		</div>
	);
};

export default AdminDashboard;
