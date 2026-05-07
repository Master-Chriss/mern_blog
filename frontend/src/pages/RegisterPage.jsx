import { useContext, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import SmallSpinner from '../assets/smallSpinner/SmallSpinner';
import { UserContext } from '../UserContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function RegisterPage() {
	const { setUserInfo } = useContext(UserContext);
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [redirect, setRedirect] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	async function register(ev) {
		ev.preventDefault();
		if (isLoading) return;

		if (!username.trim() || !email.trim() || !password.trim()) {
			toast.error('Please fill in all fields');
			return;
		}

		setIsLoading(true);

		try {
			const cleanUsername = username.trim().toLowerCase();
			const cleanEmail = email.trim().toLowerCase();
			const cleanPassword = password.trim();

			const response = await fetch(`${API_URL}/auth/register`, {
				method: 'POST',
				body: JSON.stringify({
					username: cleanUsername,
					password: cleanPassword,
					email: cleanEmail,
				}),
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
			});

			if (response.ok) {
				const userInfo = await response.json();
				setUserInfo(userInfo);
				toast.success(`Welcome, ${userInfo.username}! 🎉`);
				setTimeout(() => setRedirect(true), 700);
				return;
			}

			const errorData = await response
				.json()
				.catch(() => ({ message: 'Registration failed' }));
			toast.error(errorData.message || 'Registration failed');
			setIsLoading(false);
		} catch (error) {
			console.error('Register error:', error);
			toast.error('Connection error. Please try again.');
			setIsLoading(false);
		}
	}

	if (redirect) return <Navigate to="/" />;

	return (
		<div className="flex min-h-[70vh] flex-col items-center justify-center">
			<form
				onSubmit={register}
				className="w-full max-w-md rounded-[2.5rem] border border-white/20 bg-white/5 p-10 shadow-2xl backdrop-blur-3xl animate-in fade-in zoom-in duration-500">
				<div className="mb-10 text-center">
					<h1 className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-500 bg-clip-text text-4xl font-black text-transparent">
						Join the Blog
					</h1>
					<p className="mt-2 text-sm uppercase tracking-widest text-slate-400">
						Create Your Identity
					</p>
				</div>

				<div className="space-y-5">
					<input
						type="text"
						placeholder="Choose Username"
						className="w-full rounded-2xl border border-white/10 bg-white/10 px-6 py-4 text-white placeholder-slate-500 outline-none transition-all focus:bg-white/15 focus:ring-2 focus:ring-purple-500/50"
						value={username}
						onChange={(ev) => setUsername(ev.target.value)}
					/>
					<input
						type="text"
						placeholder="Enter Email"
						className="w-full rounded-2xl border border-white/10 bg-white/10 px-6 py-4 text-white placeholder-slate-500 outline-none transition-all focus:bg-white/15 focus:ring-2 focus:ring-purple-500/50"
						value={email}
						onChange={(ev) => setEmail(ev.target.value)}
					/>
					<input
						type="password"
						placeholder="Create Password"
						className="w-full rounded-2xl border border-white/10 bg-white/10 px-6 py-4 text-white placeholder-slate-500 outline-none transition-all focus:bg-white/15 focus:ring-2 focus:ring-purple-500/50"
						value={password}
						onChange={(ev) => setPassword(ev.target.value)}
					/>

					<button
						disabled={isLoading}
						aria-label={isLoading ? 'Creating account' : 'Create account button'}
						className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 py-4 text-lg font-bold text-white shadow-lg transition-all active:scale-95 hover:shadow-[0_0_20px_rgba(147,51,234,0.5)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:shadow-none">
						{isLoading ? (
							<>
								<SmallSpinner /> Creating Account...
							</>
						) : (
							'Create Account'
						)}
					</button>
				</div>

				<p className="mt-10 text-center text-sm text-slate-400">
					Already a member?{' '}
					<Link
						to="/login"
						className="ml-1 font-bold text-purple-400 hover:underline">
						Sign In
					</Link>
				</p>
			</form>
		</div>
	);
}
