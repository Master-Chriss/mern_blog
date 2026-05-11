import { useContext, useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Settings, Menu, Trash2, Search, Loader } from 'lucide-react';
import { UserContext } from '../UserContext';
import ConfirmationDialog from '../components/ConfirmationDialog';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const USERS_PER_PAGE = 8;

const formatDisplayDate = (value) => {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return 'No date';
	return date.toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
};

const SettingsPage = () => {
	const { userInfo } = useContext(UserContext);
	const [users, setUsers] = useState([]);
	const [search, setSearch] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [pendingAction, setPendingAction] = useState(null);
	const [isConfirmingAction, setIsConfirmingAction] = useState(false);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const loadUsers = async () => {
			try {
				setIsLoading(true);
				const response = await fetch(`${API_URL}/auth/users`, {
					credentials: 'include',
				});

				if (!response.ok) throw new Error('Failed to load users');

				const data = await response.json();
				setUsers(Array.isArray(data) ? data : []);
			} catch (error) {
				console.error('Load users error:', error);
				toast.error(error.message || 'Could not load users');
				setUsers([]);
			} finally {
				setIsLoading(false);
			}
		};

		loadUsers();
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

	const totalAdmins = users.filter((user) => user.role === 'admin').length;
	const totalAuthors = users.filter((user) => user.role === 'author').length;
	const totalReaders = users.filter((user) => user.role === 'reader').length;

	const updateUserRole = async (userId, newRole) => {
		try {
			const res = await fetch(`${API_URL}/auth/user/${userId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ role: newRole }),
				credentials: 'include',
			});

			if (!res.ok) throw new Error('Failed to update role');

			setUsers((currentUsers) =>
				currentUsers.map((user) =>
					user._id === userId ? { ...user, role: newRole } : user,
				),
			);
			toast.success(`User role updated to ${newRole}`);
		} catch (error) {
			console.error('Update role error:', error);
			toast.error(error.message || 'Failed to update user role');
		}
	};

	const deleteUser = async (userId) => {
		try {
			const res = await fetch(`${API_URL}/auth/user/${userId}`, {
				method: 'DELETE',
				credentials: 'include',
			});

			if (!res.ok) throw new Error('Failed to delete user');

			setUsers((currentUsers) =>
				currentUsers.filter((user) => user._id !== userId),
			);
			toast.success('User deleted successfully');
		} catch (error) {
			console.error('Delete user error:', error);
			toast.error(error.message || 'Failed to delete user');
		}
	};

	const openDeleteConfirm = (user) => {
		setPendingAction({
			title: 'Delete this user account?',
			message: `@${user.username} will lose access immediately. This is an admin-only action and should be used carefully.`,
			confirmLabel: 'Delete User',
			tone: 'danger',
			action: () => deleteUser(user._id),
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
							<div className="flex items-start gap-3 sm:gap-4">
								<button
									onClick={() => setIsSidebarOpen(true)}
									className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-white/5 text-xl text-white md:hidden">
									<Menu size={20} />
								</button>
								<div>
									<p className="text-xs uppercase tracking-[0.28em] text-cyan-300/80">
										System Configuration
									</p>
									<h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
										Settings
									</h1>
									<p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
										Manage users, roles, and system governance.
									</p>
								</div>
							</div>
						</section>

						<section className="mt-6 rounded-[2rem] bg-white/5 p-4 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-6">
							<div className="mb-6 grid gap-3 sm:grid-cols-3">
								<div className="rounded-[1.35rem] bg-slate-900/40 p-4">
									<p className="text-xs uppercase tracking-[0.22em] text-slate-500">
										Total Users
									</p>
									<p className="mt-3 text-2xl font-bold text-cyan-300">
										{users.length}
									</p>
									<p className="mt-1 text-sm text-slate-400">
										Registered on platform
									</p>
								</div>
								<div className="rounded-[1.35rem] bg-slate-900/40 p-4">
									<p className="text-xs uppercase tracking-[0.22em] text-slate-500">
										Role Distribution
									</p>
									<p className="mt-3 text-sm text-white">
										<span className="font-bold text-violet-300">
											{totalAdmins}
										</span>{' '}
										admins,{' '}
										<span className="font-bold text-emerald-300">
											{totalAuthors}
										</span>{' '}
										authors,{' '}
										<span className="font-bold text-amber-300">
											{totalReaders}
										</span>{' '}
										readers
									</p>
									<p className="mt-1 text-sm text-slate-400">
										Current access levels
									</p>
								</div>
								<div className="rounded-[1.35rem] bg-slate-900/40 p-4">
									<p className="text-xs uppercase tracking-[0.22em] text-slate-500">
										Access Control
									</p>
									<p className="mt-3 text-sm text-white">
										Role-based permissions enabled
									</p>
									<p className="mt-1 text-sm text-slate-400">
										Admin, Author, Reader
									</p>
								</div>
							</div>

							<div className="mt-6 space-y-4">
								<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
									<div>
										<h2 className="text-xl font-bold text-white">
											Manage Users
										</h2>
										<p className="mt-1 text-sm text-slate-400">
											Update roles and remove accounts
										</p>
									</div>

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
											placeholder="Search users..."
											className="w-full rounded-2xl bg-slate-950/50 pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none sm:w-64"
										/>
									</div>
								</div>

								{isLoading ? (
									<div className="flex justify-center items-center gap-3 rounded-[1.35rem] bg-slate-900/40 px-4 py-8 text-center text-slate-400">
										<Loader size={24} className="animate-spin text-slate-500" />
										<p>Loading users...</p>
									</div>
								) : paginatedUsers.length > 0 ? (
									<div className="space-y-3">
										{paginatedUsers.map((user) => (
											<div
												key={user._id}
												className="rounded-[1.35rem] bg-slate-900/40 p-4">
												<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
													<div className="min-w-0">
														<p className="truncate text-base font-semibold text-white">
															{user.username.charAt(0).toUpperCase() +
																user.username.slice(1)}
														</p>
														<p className="mt-1 break-all text-sm text-slate-400">
															{user.email}
														</p>
														<p className="mt-1 text-xs text-slate-500">
															Joined {formatDisplayDate(user.createdAt)}
														</p>
													</div>

													<div className="flex w-full gap-2 sm:w-auto sm:flex-shrink-0">
														<select
															value={user.role}
															onChange={(e) =>
																updateUserRole(user._id, e.target.value)
															}
															className="flex-1 rounded-xl bg-slate-950/60 px-3 py-2 text-sm text-white sm:flex-none">
															<option value="reader">Reader</option>
															<option value="author">Author</option>
															<option value="admin">Admin</option>
														</select>
														<button
															onClick={() => openDeleteConfirm(user)}
															className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-red-500/15 text-red-300 transition hover:bg-red-500/25">
															<Trash2 size={16} />
														</button>
													</div>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="rounded-[1.35rem] bg-slate-900/40 px-4 py-8 text-center text-slate-400">
										{search ? 'No users match your search.' : 'No users found.'}
									</div>
								)}

								{totalPages > 1 && (
									<div className="mt-6 flex flex-wrap gap-2">
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
								)}
							</div>
						</section>
					</div>
				</div>
			</main>
		</div>
	);
};

export default SettingsPage;
