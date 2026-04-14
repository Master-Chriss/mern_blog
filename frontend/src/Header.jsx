import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UserContext } from './UserContext';
import ConfirmationDialog from './components/ConfirmationDialog';
import {
	FaBars,
	FaPlus,
	FaSearch,
	FaSignInAlt,
	FaSignOutAlt,
	FaTachometerAlt,
	FaTimes,
	FaUserCircle,
	FaUserPlus,
} from 'react-icons/fa';
import blogLogo from './assets/Logo/new-gen-logo-cropped.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const Header = () => {
	const { setUserInfo, userInfo } = useContext(UserContext);
	const [searchQuery, setSearchQuery] = useState('');
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [searchOpen, setSearchOpen] = useState(false);
	const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		fetch(`${API_URL}/auth/profile`, {
			credentials: 'include',
		}).then((response) => {
			response.json().then((userInfo) => {
				setUserInfo(userInfo);
			});
		});
	}, []);

	const logout = async () => {
		setIsLoggingOut(true);
		try {
			const response = await fetch(`${API_URL}/auth/logout`, {
				credentials: 'include',
				method: 'POST',
			});

			if (!response.ok) {
				throw new Error('Logout failed');
			}

			setUserInfo(null);
			setMobileMenuOpen(false);
			setShowLogoutConfirm(false);
			toast.success('Logged out successfully');
		} catch (error) {
			console.error('Logout failed:', error);
			toast.error('Logout failed');
		} finally {
			setIsLoggingOut(false);
		}
	};

	const username = userInfo?.username;

	const handleInstantSearch = (e) => {
		const value = e.target.value;
		setSearchQuery(value);
		navigate(`/?search=${encodeURIComponent(value)}`, { replace: true });
	};

	return (
		<>
			<ConfirmationDialog
				open={showLogoutConfirm}
				title="Log out of your account?"
				message="You will need to sign in again to create posts, leave comments, or perform admin actions."
				confirmLabel="Log Out"
				tone="warning"
				isSubmitting={isLoggingOut}
				onCancel={() => setShowLogoutConfirm(false)}
				onConfirm={logout}
			/>

			<div className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0f172a]/95 backdrop-blur-md">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="py-3">
						<div className="flex items-center justify-between">
							<Link
								to="/"
								className="whitespace-nowrap bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-xl font-black text-transparent sm:text-2xl"
								onClick={() => setMobileMenuOpen(false)}>
								<img
									src={blogLogo}
									className="h-10 w-auto object-contain"
									alt="Logo"
								/>
							</Link>

							<div className="mx-4 hidden max-w-xl flex-1 md:block">
								<div className="relative">
									<input
										type="text"
										placeholder="Search stories..."
										value={searchQuery}
										onChange={handleInstantSearch}
										className="w-full rounded-xl border border-white/10 bg-white/10 py-2 px-4 pl-10 text-sm text-white placeholder-slate-500 outline-none focus:bg-white/20"
									/>
									<FaSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
								</div>
							</div>

							<div className="hidden items-center gap-4 md:flex">
								{username ? (
									<>
										<div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
											<FaUserCircle className="h-4 w-4 text-cyan-400" />
											<span className="text-sm text-white/90">{username}</span>
											{userInfo.role !== 'reader' && (
												<span className="text-xs text-blue-300">
													({userInfo.role})
												</span>
											)}
										</div>
										{userInfo?.role !== 'reader' && (
											<Link
												to="/create"
												className="text-sm text-slate-300 hover:text-cyan-400">
												<FaPlus className="mr-1 inline" /> Create
											</Link>
										)}
										<button
											onClick={() => setShowLogoutConfirm(true)}
											className="text-sm text-red-600 hover:text-red-400">
											<FaSignOutAlt className="mr-1 inline" /> Logout
										</button>
									</>
								) : (
									<>
										<Link
											to="/login"
											className="text-sm text-slate-300 hover:text-cyan-400">
											<FaSignInAlt className="mr-1 inline" /> Login
										</Link>
										<Link
											to="/register"
											className="text-sm text-slate-300 hover:text-cyan-400">
											<FaUserPlus className="mr-1 inline" /> Register
										</Link>
									</>
								)}
								{userInfo?.role === 'admin' && (
									<Link
										to="/admin"
										className="text-sm font-bold text-green-800 hover:text-cyan-400">
										<FaTachometerAlt className="mr-1 inline" fill="green" />
										Dashboard
									</Link>
								)}
							</div>

							<div className="flex items-center gap-2 md:hidden">
								<button
									onClick={() => setSearchOpen(!searchOpen)}
									className="p-2 text-slate-300">
									<FaSearch size={18} />
								</button>
								<button
									onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
									className="rounded-lg bg-white/10 p-2 text-white">
									{mobileMenuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
								</button>
							</div>
						</div>

						{searchOpen && (
							<div className="mt-2 pb-2 md:hidden">
								<input
									type="text"
									placeholder="Search stories..."
									value={searchQuery}
									onChange={handleInstantSearch}
									className="w-full rounded-xl border border-white/10 bg-white/10 py-2 px-4 pl-10 text-sm text-white placeholder-slate-500 outline-none focus:bg-white/20"
									autoFocus
								/>
							</div>
						)}
					</div>

					{mobileMenuOpen && (
						<div className="bg-[#0f172a]/95 pb-3 md:hidden">
							<nav className="flex flex-col gap-2">
								{username ? (
									<>
										<div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2">
											<FaUserCircle className="h-5 w-5 text-cyan-400" />
											<span className="text-sm text-white/90">{username}</span>
											{userInfo.role !== 'reader' && (
												<span className="ml-auto text-xs text-blue-300">
													({userInfo.role})
												</span>
											)}
										</div>
										{userInfo?.role !== 'reader' && (
											<Link
												to="/create"
												onClick={() => setMobileMenuOpen(false)}
												className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-cyan-400">
												<FaPlus className="mr-2 inline" /> Create New Post
											</Link>
										)}
										{userInfo?.role === 'admin' && (
											<Link
												to="/admin"
												onClick={() => setMobileMenuOpen(false)}
												className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-cyan-400">
												<FaTachometerAlt className="mr-2 inline" /> Dashboard
											</Link>
										)}
										<button
											onClick={() => setShowLogoutConfirm(true)}
											className="rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-white/5 hover:text-red-400">
											<FaSignOutAlt className="mr-2 inline" /> Logout
										</button>
									</>
								) : (
									<>
										<Link
											to="/login"
											onClick={() => setMobileMenuOpen(false)}
											className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-cyan-400">
											<FaSignInAlt className="mr-2 inline" /> Login
										</Link>
										<Link
											to="/register"
											onClick={() => setMobileMenuOpen(false)}
											className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-cyan-400">
											<FaUserPlus className="mr-2 inline" /> Register
										</Link>
									</>
								)}
							</nav>
						</div>
					)}
				</div>
			</div>

			<div className="h-[60px] md:h-[70px]" />
		</>
	);
};

export default Header;
