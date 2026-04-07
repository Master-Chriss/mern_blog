import { useContext } from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';
import {
	FaSearch,
	FaSignInAlt,
	FaSignOutAlt,
	FaPlus,
	FaUserPlus,
	FaUserCircle,
	FaBars,
	FaTimes,
	FaTachometerAlt,
} from 'react-icons/fa';
import blogLogo from './assets/Logo/new-gen-logo-cropped.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const Header = () => {
	const { setUserInfo, userInfo } = useContext(UserContext);
	const [searchQuery, setSearchQuery] = useState('');
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [searchOpen, setSearchOpen] = useState(false);
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

	const logout = () => {
		fetch(`${API_URL}/auth/logout`, {
			credentials: 'include',
			method: 'POST',
		});
		setUserInfo(null);
		setMobileMenuOpen(false);
	};

	const username = userInfo?.username;

	const handleInstantSearch = (e) => {
		const value = e.target.value;
		setSearchQuery(value);
		navigate(`/?search=${encodeURIComponent(value)}`, { replace: true });
	};

	return (
		<>
			{/* FIXED NAVBAR WITH SAME MARGINS AS POST CONTENT */}
			<div className="fixed top-0 left-0 right-0 z-50 bg-[#0f172a]/95 backdrop-blur-md border-b border-white/10">
				{/* CONTAINER - MATCHES YOUR HOMEPAGE max-w-7xl AND mx-auto */}
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="py-3">
						<div className="flex items-center justify-between">
							{/* Logo */}
							<Link
								to="/"
								className="text-xl sm:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 whitespace-nowrap"
								onClick={() => setMobileMenuOpen(false)}>
								<img src={blogLogo} class="h-10 w-auto object-contain" alt="Logo" />
							</Link>

							{/* Desktop Search - Hidden on mobile */}
							<div className="hidden md:block flex-1 max-w-xl mx-4">
								<div className="relative">
									<input
										type="text"
										placeholder="Search stories..."
										value={searchQuery}
										onChange={handleInstantSearch}
										className="w-full py-2 px-4 pl-10 rounded-xl bg-white/10 border border-white/10 text-white placeholder-slate-500 outline-none focus:bg-white/20 text-sm"
									/>
									<FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
								</div>
							</div>

							{/* Desktop Menu - Hidden on mobile */}
							<div className="hidden md:flex items-center gap-4">
								{username && (
									<>
										<div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
											<FaUserCircle className="text-cyan-400 w-4 h-4" />
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
												<FaPlus className="inline mr-1" /> Create
											</Link>
										)}
										<button
											onClick={logout}
											className="text-sm text-red-600 hover:text-red-400">
											<FaSignOutAlt className="inline mr-1" /> Logout
										</button>
									</>
								)}
								{!username && (
									<>
										<Link
											to="/login"
											className="text-sm text-slate-300 hover:text-cyan-400">
											<FaSignInAlt className="inline mr-1" /> Login
										</Link>
										<Link
											to="/register"
											className="text-sm text-slate-300 hover:text-cyan-400">
											<FaUserPlus className="inline mr-1" /> Register
										</Link>
									</>
								)}
								{userInfo?.role === 'admin' && (
									<Link
										to="/admin"
										className="text-sm text-green-800 font-bold hover:text-cyan-400">
										<FaTachometerAlt class='inline mr-1' fill='green' />
										Dashboard
									</Link>
								)}
							</div>

							{/* MOBILE ICONS */}
							<div className="flex md:hidden items-center gap-2">
								<button
									onClick={() => setSearchOpen(!searchOpen)}
									className="text-slate-300 p-2">
									<FaSearch size={18} />
								</button>
								<button
									onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
									className="text-white p-2 rounded-lg bg-white/10">
									{mobileMenuOpen ? (
										<FaTimes size={18} />
									) : (
										<FaBars size={18} />
									)}
								</button>
							</div>
						</div>

						{/* MOBILE SEARCH BAR */}
						{searchOpen && (
							<div className="md:hidden mt-2 pb-2">
								<input
									type="text"
									placeholder="Search stories..."
									value={searchQuery}
									onChange={handleInstantSearch}
									className="w-full py-2 px-4 pl-10 rounded-xl bg-white/10 border border-white/10 text-white placeholder-slate-500 outline-none focus:bg-white/20 text-sm"
									autoFocus
								/>
							</div>
						)}
					</div>

					{/* MOBILE MENU DROPDOWN */}
					{mobileMenuOpen && (
						<div className="md:hidden bg-[#0f172a]/95 pb-3">
							<nav className="flex flex-col gap-2">
								{username && (
									<>
										<div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5">
											<FaUserCircle className="text-cyan-400 w-5 h-5" />
											<span className="text-sm text-white/90">{username}</span>
											{userInfo.role !== 'reader' && (
												<span className="text-xs text-blue-300 ml-auto">
													({userInfo.role})
												</span>
											)}
										</div>
										{userInfo?.role !== 'reader' && (
											<Link
												to="/create"
												onClick={() => setMobileMenuOpen(false)}
												className="text-sm text-slate-300 hover:text-cyan-400 py-2 px-3 hover:bg-white/5 rounded-lg">
												<FaPlus className="inline mr-2" /> Create New Post
											</Link>
										)}
										{userInfo?.role === 'admin' && (
											<Link
												to="/admin"
												onClick={() => setMobileMenuOpen(false)}
												className="text-sm text-slate-300 hover:text-cyan-400 py-2 px-3 hover:bg-white/5 rounded-lg">
												📊 Dashboard
											</Link>
										)}
										<button
											onClick={logout}
											className="text-sm text-red-600 hover:text-red-400 py-2 px-3 hover:bg-white/5 rounded-lg text-left">
											<FaSignOutAlt className="inline mr-2" /> Logout
										</button>
									</>
								)}
								{!username && (
									<>
										<Link
											to="/login"
											onClick={() => setMobileMenuOpen(false)}
											className="text-sm text-slate-300 hover:text-cyan-400 py-2 px-3 hover:bg-white/5 rounded-lg">
											<FaSignInAlt className="inline mr-2" /> Login
										</Link>
										<Link
											to="/register"
											onClick={() => setMobileMenuOpen(false)}
											className="text-sm text-slate-300 hover:text-cyan-400 py-2 px-3 hover:bg-white/5 rounded-lg">
											<FaUserPlus className="inline mr-2" /> Register
										</Link>
									</>
								)}
							</nav>
						</div>
					)}
				</div>
			</div>

			{/* SPACER - Same height as navbar */}
			<div className="h-[60px] md:h-[70px]" />
		</>
	);
};

export default Header;
