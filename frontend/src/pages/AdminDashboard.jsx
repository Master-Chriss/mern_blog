import { useContext, useEffect, useMemo, useState } from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
	FaCalendarAlt,
	FaChartLine,
	FaCog,
	FaDollarSign,
	FaEdit,
	FaEnvelope,
	FaEnvelopeOpenText,
	FaFileAlt,
	FaHome,
	FaPenNib,
	FaSignOutAlt,
	FaTrash,
	FaUserCog,
	FaUserEdit,
	FaUserFriends,
	FaUsers,
} from 'react-icons/fa';
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
				const readers = data.filter((u) => u.role === 'reader').length;

				setStats((prev) => ({
					...prev,
					totalUsers: data.length,
					totalAuthors: authors,
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
		{ icon: <FaHome />, label: 'Dashboard', path: '/admin' },
		{ icon: <FaFileAlt />, label: 'My Articles', path: '/my-articles' },
		{ icon: <FaChartLine />, label: 'Analytics', path: '/analytics' },
		{ icon: <FaEnvelope />, label: 'Inbox', path: '/inbox' },
		{ icon: <FaCalendarAlt />, label: 'Post Plan', path: '/plan' },
		{ icon: <FaDollarSign />, label: 'Earning', path: '/earning' },
		{ icon: <FaCog />, label: 'Settings', path: '/settings' },
	];

	const statCards = [
		{
			label: 'Posts',
			value: stats.totalPosts,
			icon: <FaPenNib />,
			valueClassName: 'text-cyan-400',
			iconClassName: 'text-cyan-300',
			panelClassName: 'border-cyan-500/20 bg-cyan-500/5',
		},
		{
			label: 'Users',
			value: stats.totalUsers,
			icon: <FaUsers />,
			valueClassName: 'text-emerald-400',
			iconClassName: 'text-emerald-300',
			panelClassName: 'border-emerald-500/20 bg-emerald-500/5',
		},
		{
			label: 'Authors',
			value: stats.totalAuthors,
			icon: <FaUserEdit />,
			valueClassName: 'text-violet-400',
			iconClassName: 'text-violet-300',
			panelClassName: 'border-violet-500/20 bg-violet-500/5',
		},
		{
			label: 'Readers',
			value: stats.totalReaders,
			icon: <FaUserFriends />,
			valueClassName: 'text-amber-400',
			iconClassName: 'text-amber-300',
			panelClassName: 'border-amber-500/20 bg-amber-500/5',
		},
		{
			label: 'Subscribers',
			value: stats.totalSubscribers,
			icon: <FaEnvelopeOpenText />,
			valueClassName: 'text-rose-400',
			iconClassName: 'text-rose-300',
			panelClassName: 'border-rose-500/20 bg-rose-500/5',
		},
	];

	if (!userInfo || userInfo.role !== 'admin') {
		return <Navigate to="/" />;
	}

	return (
		<div className="flex min-h-screen bg-slate-900/50">
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
					className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
				/>
			)}

			<aside
				className={`fixed top-0 left-0 z-50 h-full w-64 transform border-r border-white/10 bg-white/5 p-6 transition-all duration-300 ${
					isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
				} md:translate-x-0`}>
				<button
					onClick={() => setIsSidebarOpen(false)}
					className="mb-4 text-white md:hidden">
					x
				</button>

				<div className="mb-8 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-2xl font-black text-transparent">
					MCBlog
				</div>

				<nav className="space-y-6">
					<div className="space-y-2">
						<p className="text-xs uppercase tracking-wider text-slate-500">
							Navigation
						</p>
						{menuItems.map((item) => {
							const isActive = location.pathname === item.path;
							return (
								<Link
									key={item.path}
									to={item.path}
									onClick={() => setIsSidebarOpen(false)}
									className={`flex items-center gap-3 rounded-xl px-4 py-2 transition-all ${
										isActive
											? 'border border-cyan-500/30 bg-cyan-500/20 text-cyan-400'
											: 'text-slate-300 hover:bg-white/5'
									}`}>
									{item.icon}
									<span className="text-sm font-medium">{item.label}</span>
								</Link>
							);
						})}
					</div>

					<div className="border-t border-white/10 pt-6">
						<button className="flex w-full items-center gap-3 px-4 py-2 text-slate-300 hover:text-red-400">
							<FaSignOutAlt /> Logout
						</button>
					</div>
				</nav>
			</aside>

			<main className="flex-1 p-4 md:ml-64 md:p-8">
				<button
					onClick={() => setIsSidebarOpen(true)}
					className="mb-4 text-2xl text-white md:hidden">
					☰
				</button>

				<div className="mb-8">
					<h1 className="mb-2 text-2xl font-bold text-white md:text-4xl">
						Hello {userInfo.username}!
					</h1>
					<p className="text-slate-400">Welcome to your admin dashboard.</p>
				</div>

				<Link
					to="/create"
					className="mb-12 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 px-6 py-3 font-bold text-white transition-all hover:scale-105">
					Write new post
				</Link>

				<div className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
					{statCards.map((card) => (
						<div
							key={card.label}
							className={`rounded-2xl border p-6 shadow-lg shadow-black/10 ${card.panelClassName}`}>
							<div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-300">
								<span className={card.iconClassName}>{card.icon}</span>
								<p>{card.label}</p>
							</div>
							<p className={`text-3xl font-bold ${card.valueClassName}`}>
								{card.value}
							</p>
						</div>
					))}
				</div>

				<h2 className="mb-6 text-2xl font-bold text-white">Top Articles</h2>
				<div className="mb-12 space-y-4">
					{posts.slice(0, 4).map((post, index) => (
						<div
							key={post._id}
							className="group flex flex-col items-start gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/10 sm:flex-row sm:items-center sm:gap-6">
							<span className="text-2xl font-bold text-slate-600 sm:w-12 sm:flex-shrink-0">
								{(index + 1).toString().padStart(2, '0')}
							</span>
							<div className="min-w-0 flex-1">
								<h3 className="break-words font-semibold text-white">
									{post.title}
								</h3>
								<p className="text-sm text-slate-500">@{post.author?.username}</p>
							</div>
							<div className="flex w-full items-center justify-end gap-2 opacity-100 transition-opacity sm:w-auto sm:opacity-0 sm:group-hover:opacity-100">
								<Link
									to={`/edit/${post._id}`}
									className="p-2 text-slate-400 hover:text-cyan-400">
									<FaEdit />
								</Link>
								<button
									onClick={() => openDeletePostConfirm(post)}
									className="p-2 text-red-400">
									<FaTrash color="red" />
								</button>
							</div>
						</div>
					))}
				</div>

				<h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-white">
					<FaUserCog /> Manage Users
				</h2>
				<div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
					<div className="border-b border-white/10 p-4">
						<input
							type="search"
							value={search}
							onChange={(e) => {
								setSearch(e.target.value);
								setCurrentPage(1);
							}}
							placeholder="Search by username or email"
							className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
						/>
					</div>
					<div className="overflow-x-auto">
						<table className="w-full min-w-[720px]">
							<thead className="bg-white/10">
								<tr className="text-left text-sm text-slate-400">
									<th className="p-4">Username</th>
									<th className="p-4">Email</th>
									<th className="p-4">Role</th>
									<th className="p-4">Joined</th>
									<th className="p-4">Actions</th>
								</tr>
							</thead>
							<tbody>
								{paginatedUsers.map((user) => (
									<tr
										key={user._id}
										className="border-t border-white/10 hover:bg-white/5">
										<td className="p-4 text-white">{user.username}</td>
										<td className="p-4 text-slate-300">{user.email}</td>
										<td className="p-4">
											<select
												value={user.role}
												onChange={(e) => updateUserRole(user._id, e.target.value)}
												className="rounded-lg border border-white/20 bg-white/10 px-3 py-1 text-sm text-white">
												<option value="reader">Reader</option>
												<option value="author">Author</option>
												<option value="admin">Admin</option>
											</select>
										</td>
										<td className="p-4 text-slate-400">
											{new Date(user.createdAt).toLocaleDateString()}
										</td>
										<td className="p-4">
											<button
												onClick={() => openDeleteUserConfirm(user)}
												className="text-red-400 transition-colors hover:text-red-300">
												<FaTrash fill="red" />
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<div className="flex flex-col gap-3 border-t border-white/10 p-4 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
						<p>
							Showing {paginatedUsers.length} of {filteredUsers.length} users
						</p>
						<div className="flex flex-wrap gap-2">
							<button
								type="button"
								onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
								disabled={currentPage === 1}
								className="rounded-lg border border-white/10 px-3 py-2 text-slate-200 transition disabled:cursor-not-allowed disabled:opacity-40">
								Previous
							</button>
							{Array.from({ length: totalPages }, (_, index) => {
								const page = index + 1;
								return (
									<button
										key={page}
										type="button"
										onClick={() => setCurrentPage(page)}
										className={`rounded-lg border px-3 py-2 transition ${
											currentPage === page
												? 'border-cyan-400 bg-cyan-500/20 text-cyan-300'
												: 'border-white/10 text-slate-200'
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
								className="rounded-lg border border-white/10 px-3 py-2 text-slate-200 transition disabled:cursor-not-allowed disabled:opacity-40">
								Next
							</button>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
};

export default AdminDashboard;
