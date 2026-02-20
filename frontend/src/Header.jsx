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
} from 'react-icons/fa';

const Header = () => {
	const { setUserInfo, userInfo } = useContext(UserContext);
	const [searchQuery, setSearchQuery] = useState('');
	const navigate = useNavigate();

	useEffect(() => {
		fetch('http://localhost:4000/auth/profile', {
			credentials: 'include',
		}).then((response) => {
			response.json().then((userInfo) => {
				setUserInfo(userInfo);
			});
		});
	}, []);

	const logout = () => {
		fetch('http://localhost:4000/auth/logout', {
			credentials: 'include',
			method: 'POST',
		});
		setUserInfo(null);
	};

	const username = userInfo?.username;

	// Instant search - updates URL as you type
	const handleInstantSearch = (e) => {
		const value = e.target.value;
		setSearchQuery(value);
		navigate(`/?search=${encodeURIComponent(value)}`, { replace: true });
	};

	return (
		<header className="sticky top-6 z-50 max-w-7xl mx-auto px-8 py-4">
			<div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl px-6 py-3">
				<div className="flex items-center justify-between gap-8">
					{/* Logo */}
					<Link
						to="/"
						className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 whitespace-nowrap">
						MCBlog
					</Link>

					{/* Search Bar - Instant Updates */}
					<div className="flex-1 max-w-xl">
						<div className="relative">
							<input
								type="text"
								placeholder="Search stories by title, summary, or author..."
								value={searchQuery}
								onChange={handleInstantSearch}
								className="w-full py-3 px-5 pl-12 rounded-xl bg-white/10 border border-white/10 text-white placeholder-slate-500 outline-none focus:bg-white/20 focus:border-cyan-500/50 transition-all text-sm backdrop-blur-md"
							/>
							<FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
						</div>
					</div>

					{/* Navigation */}
					<nav className="flex items-center gap-6 whitespace-nowrap">
						{username && (
							<>
								<div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
									<span className="flex items-center justify-end text-slate-300 text-sm font-bold text-white/90">
										<FaUserCircle /> {username}
										<span className="text-blue-300">
											{userInfo.role === 'reader'
												? ''
												: '(' + userInfo.role + ')'}
										</span>
									</span>
								</div>
								{userInfo?.role !== 'reader' && (
									<Link
										to="/create"
										className="flex items-center text-sm text-slate-300 hover:text-cyan-400 transition-colors">
										<FaPlus className="mr-1" /> Create
									</Link>
								)}

								<button
									onClick={logout}
									className="flex items-center text-sm font-bold text-red-600 hover:text-red-400 transition-colors">
									<FaSignOutAlt className="mr-1" /> Logout
								</button>
							</>
						)}

						{!username && (
							<>
								<Link
									to="/login"
									className="flex items-center text-sm text-slate-300 hover:text-cyan-400 transition-colors">
									<FaSignInAlt /> Login
								</Link>
								<Link
									to="/register"
									className="flex items-center text-sm text-slate-300 hover:text-cyan-400 transition-colors">
									<FaUserPlus /> Register
								</Link>
							</>
						)}
						
						{userInfo?.role === 'admin' && (
							<Link
								to="/admin"
								className="text-sm text-slate-300 hover:text-cyan-400 transition-colors">
								Dashboard
							</Link>
						)}
					</nav>
				</div>
			</div>
		</header>
	);
};

export default Header;
