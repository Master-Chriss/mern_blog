import { useState, useContext } from 'react';
import { Navigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UserContext } from '../UserContext';
import SmallSpinner from '../assets/smallSpinner/SmallSpinner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function LoginPage() {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [redirect, setRedirect] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const { setUserInfo } = useContext(UserContext);

	async function login(ev) {
		ev.preventDefault();
		if (isLoading) return; // Prevent double submission
		if (!username.trim() || !password.trim()) {
			toast.error('Please fill in all fields');
			return;
		}

			setIsLoading(true);
			try {
				const cleanUsername = username.trim().toLowerCase();
				const cleanPassword = password.trim();

				const response = await fetch(`${API_URL}/auth/login`, {
					method: 'POST',
					body: JSON.stringify({
						username: cleanUsername,
						password: cleanPassword,
					}),
					headers: { 'Content-Type': 'application/json' },
					credentials: 'include',
				});
			if (response.ok) {
				response.json().then((userInfo) => {
					setUserInfo(userInfo);
					toast.success(`Welcome back, ${userInfo.username}! 🎉`);
					setTimeout(() => setRedirect(true), 500);
				});
			} else {
				toast.error('Wrong credentials');
				setIsLoading(false);
			}
		} catch (error) {
			console.error('Login error:', error);
			toast.error('Connection error. Please try again.');
			setIsLoading(false);
		}
	}

	if (redirect) return <Navigate to={'/'} />;

	return (
		<div className="flex flex-col items-center justify-center min-h-[70vh]">
			<form
				onSubmit={login}
				className="w-full max-w-md p-10 rounded-[2.5rem] border border-white/20 bg-white/5 backdrop-blur-3xl shadow-2xl animate-in fade-in zoom-in duration-500">
				<div className="mb-10 text-center">
					<h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
						Log In
					</h1>
				</div>

				<div className="space-y-5">
					<div className="relative group">
						<input
							type="text"
							placeholder="Username"
							className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:bg-white/15 transition-all outline-none"
							value={username}
							onChange={(ev) => setUsername(ev.target.value)}
						/>
					</div>
					<div className="relative group">
						<input
							type="password"
							placeholder="Password"
							className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:bg-white/15 transition-all outline-none"
							value={password}
							onChange={(ev) => setPassword(ev.target.value)}
						/>
					</div>

					<button
						disabled={isLoading}
						aria-label={isLoading ? 'Signing in' : 'Sign in button'}
						className="w-full py-4 mt-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all active:scale-95 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-2">
						{isLoading ? (
							<>
								<SmallSpinner /> Signing In...
							</>
						) : (
							'Sign In'
						)}
					</button>
				</div>

				<p className="mt-10 text-center text-slate-400 text-sm">
					Don't have an account?{' '}
					<Link
						to="/register"
						className="text-cyan-400 font-bold hover:underline ml-1">
						Register Now
					</Link>
				</p>
			</form>
		</div>
	);
}
