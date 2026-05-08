import { useContext, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { UserContext } from '../UserContext';
import SmallSpinner from '../assets/smallSpinner/SmallSpinner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function LoginPage() {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [redirect, setRedirect] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const { setUserInfo } = useContext(UserContext);

	async function login(ev) {
		ev.preventDefault();
		if (isLoading) return;

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
				const userInfo = await response.json();
				setUserInfo(userInfo);
				toast.success(`Welcome back, ${userInfo.username}! 🎉`);
				setTimeout(() => setRedirect(true), 500);
				return;
			}

			const errorData = await response
				.json()
				.catch(() => ({ message: 'Login failed' }));
			toast.error(errorData.message || 'Login failed');
			setIsLoading(false);
		} catch (error) {
			console.error('Login error:', error);
			toast.error('Connection error. Please try again.');
			setIsLoading(false);
		}
	}

	if (redirect) return <Navigate to="/" />;

	return (
		<div className="flex min-h-[70vh] flex-col items-center justify-center">
			<form
				onSubmit={login}
				className="w-full max-w-md rounded-[2.5rem] border border-white/20 bg-white/5 p-10 shadow-2xl backdrop-blur-3xl animate-in fade-in zoom-in duration-500">
				<div className="mb-10 text-center">
					<h1 className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-4xl font-black text-transparent">
						Log In
					</h1>
				</div>

				<div className="space-y-5">
					<div className="relative group">
						<input
							type="text"
							placeholder="Username or Email"
							className="w-full rounded-2xl border border-white/10 bg-white/10 px-6 py-4 text-white placeholder-slate-500 outline-none transition-all focus:bg-white/15 focus:ring-2 focus:ring-cyan-500/50"
							value={username}
							onChange={(ev) => setUsername(ev.target.value)}
						/>
					</div>
					<div className="relative group">
						<input
							type={showPassword ? 'text' : 'password'}
							placeholder="Password"
							className="w-full rounded-2xl border border-white/10 bg-white/10 px-6 py-4 pr-16 text-white placeholder-slate-500 outline-none transition-all focus:bg-white/15 focus:ring-2 focus:ring-cyan-500/50"
							value={password}
							onChange={(ev) => setPassword(ev.target.value)}
						/>
						<button
							type="button"
							onClick={() => setShowPassword((current) => !current)}
							aria-label={showPassword ? 'Hide password' : 'Show password'}
							className="absolute inset-y-0 right-4 inline-flex items-center text-slate-400 transition hover:text-white">
							{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
						</button>
					</div>

					<button
						disabled={isLoading}
						aria-label={isLoading ? 'Signing in' : 'Sign in button'}
						className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-4 text-lg font-bold text-white shadow-lg transition-all active:scale-95 hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:shadow-none">
						{isLoading ? (
							<>
								<SmallSpinner /> Signing In...
							</>
						) : (
							'Sign In'
						)}
					</button>
				</div>

				<p className="mt-10 text-center text-sm text-slate-400">
					Don&apos;t have an account?{' '}
					<Link
						to="/register"
						className="ml-1 font-bold text-cyan-400 hover:underline">
						Register Now
					</Link>
				</p>
			</form>
		</div>
	);
}
