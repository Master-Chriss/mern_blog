import { useState, useContext } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { UserContext } from '../UserContext';

export default function LoginPage() {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [redirect, setRedirect] = useState(false);
	const { setUserInfo } = useContext(UserContext);

	async function login(ev) {
		ev.preventDefault();
		const response = await fetch('http://localhost:4000/auth/login', {
			method: 'POST',
			body: JSON.stringify({ username, password }),
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
		});
		if (response.ok) {
			response.json().then((userInfo) => {
				setUserInfo(userInfo);
				setRedirect(true);
			});
		} else {
			alert('Wrong credentials');
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

					<button className="w-full py-4 mt-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all active:scale-95 shadow-lg">
						Sign In
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
