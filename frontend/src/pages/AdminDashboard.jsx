import { useContext, useEffect, useState, useMemo } from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { UserContext } from '../UserContext';
import {
	FaHome,
	FaFileAlt,
	FaChartLine,
	FaEnvelope,
	FaCalendarAlt,
	FaDollarSign,
	FaCog,
	FaSignOutAlt,
	FaEdit,
	FaTrash,
	FaUserCog,
	FaUsers,
	FaPenNib,
	FaUserEdit,
	FaUserFriends,
	FaEnvelopeOpenText,
} from 'react-icons/fa';

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

	const [stats, setStats] = useState({
		totalPosts: 0,
		totalUsers: 0,
		totalAuthors: 0,
		totalReaders: 0,
		totalSubscribers: 0,
	});

	if (!userInfo || userInfo.role !== 'admin') {
		return <Navigate to="/" />;
	}

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

	const filteredUsers = useMemo(() => {
		return users.filter(
			(u) =>
				u.username.toLowerCase().includes(search.toLowerCase()) ||
				u.email.toLowerCase().includes(search.toLowerCase()),
		);
	}, [users, search]);

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
			setUsers(
				users.map((u) => (u._id === userId ? { ...u, role: newRole } : u)),
			);
		}
	};

	const deleteUser = async (userId) => {
		if (!window.confirm('Delete this user?')) return;

		const res = await fetch(`${API_URL}/auth/user/${userId}`, {
			method: 'DELETE',
			credentials: 'include',
		});

		if (res.ok) {
			setUsers(users.filter((u) => u._id !== userId));
		}
	};

	const deletePost = async (postId) => {
		if (!window.confirm('Delete this post?')) return;

		const res = await fetch(`${API_URL}/post/${postId}`, {
			method: 'DELETE',
			credentials: 'include',
		});

		if (res.ok) {
			setPosts(posts.filter((p) => p._id !== postId));
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

	return (
		<div className="flex min-h-screen bg-slate-900/50">
			{/* Overlay */}
			{isSidebarOpen && (
				<div
					onClick={() => setIsSidebarOpen(false)}
					className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
				/>
			)}

			{/* Sidebar */}
				<aside
					className={`fixed top-0 left-0 h-full w-64 bg-white/5 border-r border-white/10 p-6 z-50 transform transition-all duration-300
	        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
				<button
					onClick={() => setIsSidebarOpen(false)}
					className="md:hidden text-white mb-4">
					✕
				</button>

				<div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-8">
					MCBlog
				</div>

				<nav className="space-y-6">
					<div className="space-y-2">
						<p className="text-xs uppercase tracking-wider text-slate-500">
							Navigation
						</p>

						{menuItems.map((item, index) => {
							const isActive = location.pathname === item.path;

							return (
								<Link
									key={index}
									to={item.path}
									onClick={() => setIsSidebarOpen(false)}
									className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${
										isActive
											? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
											: 'text-slate-300 hover:bg-white/5'
									}`}>
									{item.icon}
									<span className="text-sm font-medium">{item.label}</span>
								</Link>
							);
						})}
					</div>

					<div className="pt-6 border-t border-white/10">
						<button className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:text-red-400 w-full">
							<FaSignOutAlt /> Logout
						</button>
					</div>
				</nav>
			</aside>

			{/* Main */}
			<main className="flex-1 p-4 md:p-8 md:ml-64">
				<button
					onClick={() => setIsSidebarOpen(true)}
					className="md:hidden mb-4 text-white text-2xl">
					☰
				</button>

				{/* Header */}
				<div className="mb-8">
					<h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
						Hello {userInfo.username}! 👋
					</h1>
					<p className="text-slate-400">Welcome to your admin dashboard.</p>
				</div>

				{/* CTA */}
				<Link
					to="/create"
					className="inline-flex items-center gap-2 mb-12 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-xl hover:scale-105 transition-all">
					✍️ Write new post
				</Link>

					{/* Stats */}
					<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
						{statCards.map((card) => (
							<div
								key={card.label}
								className={`rounded-2xl p-6 border shadow-lg shadow-black/10 ${card.panelClassName}`}>
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

				{/* 🔥 RESTORED TOP ARTICLES */}
				<h2 className="text-2xl font-bold text-white mb-6">Top Articles</h2>
					<div className="space-y-4 mb-12">
						{posts.slice(0, 4).map((post, index) => (
							<div
								key={post._id}
								className="flex flex-col items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all group sm:flex-row sm:items-center sm:gap-6">
								<span className="text-2xl font-bold text-slate-600 sm:w-12 sm:flex-shrink-0">
									{(index + 1).toString().padStart(2, '0')}
								</span>

								<div className="min-w-0 flex-1">
									<h3 className="text-white font-semibold break-words">
										{post.title}
									</h3>
									<p className="text-sm text-slate-500">
										@{post.author?.username}
									</p>
								</div>

								<div className="flex w-full items-center justify-end gap-2 opacity-100 transition-opacity sm:w-auto sm:opacity-0 sm:group-hover:opacity-100">
									<Link
										to={`/edit/${post._id}`}
										className="p-2 text-slate-400 hover:text-cyan-400">
									<FaEdit />
								</Link>
								<button
									onClick={() => deletePost(post._id)}
									className="p-2 text-red-400">
									<FaTrash color='red' />
								</button>
							</div>
						</div>
					))}
				</div>

				{/* User Management Section */}
				<h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
					<FaUserCog /> Manage Users
				</h2>
					<div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
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
							<table className="min-w-[720px] w-full">
							<thead className="bg-white/10">
								<tr className="text-left text-slate-400 text-sm">
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
											className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm">
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
											onClick={() => deleteUser(user._id)}
											className="text-red-400 hover:text-red-300 transition-colors">
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
