import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';

export default function RegisterPage() {
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [redirect, setRedirect] = useState(false);

	async function register(ev) {
		ev.preventDefault();
		const response = await fetch('http://localhost:4000/auth/register', {
			method: 'POST',
			body: JSON.stringify({ username, password, email }),
			headers: { 'Content-Type': 'application/json' },
		});
		if (response.ok) {
			alert('Registration successful');
			setRedirect(true);
		} else {
			alert('Registration failed');
		}
	}

	if (redirect) return <Navigate to={'/login'} />;

	return (
		<div className="flex flex-col items-center justify-center min-h-[70vh]">
			<form
				onSubmit={register}
				className="w-full max-w-md p-10 rounded-[2.5rem] border border-white/20 bg-white/5 backdrop-blur-3xl shadow-2xl animate-in fade-in zoom-in duration-500">
				<div className="mb-10 text-center">
					<h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-red-500 bg-clip-text text-transparent">
						Join the Blog
					</h1>
					<p className="text-slate-400 mt-2 text-sm uppercase tracking-widest">
						Create Your Identity
					</p>
				</div>

				<div className="space-y-5">
					<input
						type="text"
						placeholder="Choose Username"
						className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:bg-white/15 transition-all outline-none"
						value={username}
						onChange={(ev) => setUsername(ev.target.value)}
					/>
					<input
						type="text"
						placeholder="Enter Email"
						className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:bg-white/15 transition-all outline-none"
						value={email}
						onChange={(ev) => setEmail(ev.target.value)}
					/>
					<input
						type="password"
						placeholder="Create Password"
						className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:bg-white/15 transition-all outline-none"
						value={password}
						onChange={(ev) => setPassword(ev.target.value)}
					/>

					<button className="w-full py-4 mt-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg hover:shadow-[0_0_20px_rgba(147,51,234,0.5)] transition-all active:scale-95 shadow-lg">
						Create Account
					</button>
				</div>

				<p className="mt-10 text-center text-slate-400 text-sm">
					Already a member?{' '}
					<Link
						to="/login"
						className="text-purple-400 font-bold hover:underline ml-1">
						Sign In
					</Link>
				</p>
			</form>
		</div>
	);
}
