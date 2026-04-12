import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import SmallSpinner from '../assets/smallSpinner/SmallSpinner';

const Footer = () => {
	const [email, setEmail] = useState('');
	const [isSubscribing, setIsSubscribing] = useState(false);

	const handleSubscribe = async (e) => {
		e.preventDefault();
		if (isSubscribing) return;

		if (!email.trim()) {
			toast.error('Please enter your email');
			return;
		}

		setIsSubscribing(true);

		try {
			// Use localhost:4000 for newsletter (since it's not on production yet)
			const API_URL = 'http://localhost:4000';
			console.log('🔗 Calling API:', `${API_URL}/newsletter/subscribe`);
			console.log('📧 Email:', email.trim());

			const response = await fetch(`${API_URL}/newsletter/subscribe`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email: email.trim() }),
			});

			console.log('✅ Response status:', response.status);
			console.log('✅ Response ok:', response.ok);

			const data = await response.json();

			console.log('📦 Response data:', data);

			if (!response.ok) {
				console.error('❌ Error response:', data.message);
				toast.error(data.message || 'Failed to subscribe');
				setIsSubscribing(false);
				return;
			}

			console.log('✅ Success:', data.message);
			toast.success(data.message || 'Thanks for subscribing!');
			setEmail('');
		} catch (error) {
			console.error('❌ Newsletter subscription error:', error);
			console.error('Error details:', error.message);
			console.error('Error stack:', error.stack);
			toast.error('Error subscribing. Please try again.');
		} finally {
			setIsSubscribing(false);
		}
	};

	const currentYear = new Date().getFullYear();

	return (
		<footer className="bg-slate-900/50 border-t border-white/10 mt-16">
			<div className="max-w-7xl mx-auto px-6 py-12">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
					{/* Brand */}
					<div className="space-y-4">
						<h3 className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
							New Gen
						</h3>
						<p className="text-slate-400 text-sm leading-relaxed">
							Discover stories from curious minds sharing expertise in
							technology, lifestyle, and innovation.
						</p>
						<div className="flex gap-3">
							{[
								{ icon: '𝕏', link: '#' },
								{ icon: '👔', link: '#' },
								{ icon: '🐙', link: '#' },
							].map((social, idx) => (
								<a
									key={idx}
									href={social.link}
									className="w-10 h-10 rounded-lg bg-white/10 hover:bg-cyan-500/20 flex items-center justify-center transition-all text-lg"
									aria-label={`Social media link ${idx + 1}`}>
									{social.icon}
								</a>
							))}
						</div>
					</div>

					{/* Product */}
					<div className="space-y-4">
						<h4 className="text-white font-bold">Product</h4>
						<ul className="space-y-2 text-slate-400 text-sm">
							<li>
								<Link to="/" className="hover:text-cyan-400 transition-colors">
									Home
								</Link>
							</li>
							<li>
								<a
									href="#categories"
									className="hover:text-cyan-400 transition-colors">
									Categories
								</a>
							</li>
							<li>
								<a
									href="#featured"
									className="hover:text-cyan-400 transition-colors">
									Featured
								</a>
							</li>
							<li>
								<Link to="/" className="hover:text-cyan-400 transition-colors">
									Stories
								</Link>
							</li>
						</ul>
					</div>

					{/* Company */}
					<div className="space-y-4">
						<h4 className="text-white font-bold">Company</h4>
						<ul className="space-y-2 text-slate-400 text-sm">
							<li>
								<Link
									to="/about"
									className="hover:text-cyan-400 transition-colors">
									About Us
								</Link>
							</li>
							<li>
								<Link
									to="/contact"
									className="hover:text-cyan-400 transition-colors">
									Contact
								</Link>
							</li>
							<li>
								<Link
									to="/privacy"
									className="hover:text-cyan-400 transition-colors">
									Privacy Policy
								</Link>
							</li>
							<li>
								<Link
									to="/terms"
									className="hover:text-cyan-400 transition-colors">
									Terms of Service
								</Link>
							</li>
						</ul>
					</div>

					{/* Newsletter */}
					<div className="space-y-4">
						<h4 className="text-white font-bold">Newsletter</h4>
						<p className="text-slate-400 text-sm">
							Subscribe to get updates on new stories.
						</p>
						<form onSubmit={handleSubscribe} className="space-y-2">
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="your@email.com"
								className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
								aria-label="Newsletter email input"
							/>
							<button
								type="submit"
								disabled={isSubscribing}
								aria-label={
									isSubscribing
										? 'Subscribing to newsletter'
										: 'Subscribe to newsletter'
								}
								className="w-full px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
								{isSubscribing ? (
									<>
										<SmallSpinner />
										Subscribing...
									</>
								) : (
									'Subscribe'
								)}
							</button>
						</form>
					</div>
				</div>

				{/* Bottom Section */}
				<div className="border-t border-white/10 pt-8 space-y-4">
					<div className="flex flex-col md:flex-row justify-between items-center gap-4">
						<p className="text-slate-400 text-sm">
							© {currentYear} New Gen. All rights reserved.
						</p>
						<p className="text-slate-500 text-sm">
							Made with <span className="text-cyan-400">❤️</span> for the
							community
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
