import { useContext, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Wallet, Menu, Loader } from 'lucide-react';
import { UserContext } from '../UserContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const Earnings = () => {
	const { userInfo } = useContext(UserContext);
	const navigate = useNavigate();
	const [posts, setPosts] = useState([]);
	const [users, setUsers] = useState([]);
	const [newsletterStats, setNewsletterStats] = useState({
		activeSubscribers: 0,
		totalEmails: 0,
	});
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const loadEarningsData = async () => {
			try {
				setIsLoading(true);
				const [postsRes, usersRes, newsletterRes] = await Promise.all([
					fetch(`${API_URL}/post/admin/all`, { credentials: 'include' }),
					fetch(`${API_URL}/auth/users`, { credentials: 'include' }),
					fetch(`${API_URL}/newsletter/stats`),
				]);

				if (!postsRes.ok || !usersRes.ok || !newsletterRes.ok)
					throw new Error('Failed to load data');

				const postsData = await postsRes.json();
				const usersData = await usersRes.json();
				const newsletterData = await newsletterRes.json();

				setPosts(Array.isArray(postsData) ? postsData : []);
				setUsers(Array.isArray(usersData) ? usersData : []);
				setNewsletterStats({
					activeSubscribers: newsletterData?.activeSubscribers || 0,
					totalEmails: newsletterData?.totalEmails || 0,
				});
			} catch (error) {
				console.error('Load earnings data error:', error);
				toast.error(error.message || 'Could not load earnings data');
			} finally {
				setIsLoading(false);
			}
		};

		loadEarningsData();
	}, []);

	const totalUsers = users.length;
	const totalAuthors = users.filter((user) => user.role === 'author').length;
	const totalReaders = users.filter((user) => user.role === 'reader').length;
	const totalSubscribers = newsletterStats.activeSubscribers;

	const subscriberConversion =
		totalUsers > 0 ? Math.round((totalSubscribers / totalUsers) * 100) : 0;
	const postsPerAuthor =
		totalAuthors > 0 ? Math.round((posts.length / totalAuthors) * 10) / 10 : 0;

	const earningsMetrics = [
		{
			label: 'Audience Base',
			value: `${totalSubscribers} active subscribers`,
			detail: `${newsletterStats.totalEmails} total captured emails on record`,
			icon: '👥',
		},
		{
			label: 'Content Supply',
			value: `${postsPerAuthor} posts per author`,
			detail: 'Average story output across current authors',
			icon: '📝',
		},
		{
			label: 'Newsletter Conversion',
			value: `${subscriberConversion}%`,
			detail: 'Share of registered users in newsletter funnel',
			icon: '📧',
		},
		{
			label: 'Reader Engagement',
			value: `${totalReaders} active readers`,
			detail: `Across ${totalAuthors} authors`,
			icon: '👁️',
		},
	];

	const readinessLevel =
		totalSubscribers >= 100
			? 'Ready for monetization'
			: totalSubscribers >= 50
				? 'Getting close'
				: 'Early stage';

	const readinessColor =
		totalSubscribers >= 100
			? 'emerald'
			: totalSubscribers >= 50
				? 'amber'
				: 'slate';

	const recommendations = [
		{
			title: 'Audience Growth',
			description:
				totalSubscribers < 50
					? 'Focus on growing your subscriber base. Aim for at least 50 active subscribers before testing monetization.'
					: totalSubscribers < 100
						? "You're on the right track! Continue growing your audience to unlock more monetization opportunities."
						: 'Your audience is large enough to test multiple monetization strategies.',
		},
		{
			title: 'Content Consistency',
			description:
				postsPerAuthor < 5
					? 'Increase publishing frequency. Consistent content drives subscriber growth and engagement.'
					: 'Great publishing cadence! Keep maintaining this consistency.',
		},
		{
			title: 'Monetization Options',
			description:
				totalSubscribers >= 50
					? 'Consider: Sponsored content, premium newsletters, affiliate marketing, or paid subscriptions.'
					: 'Build your audience first, then explore monetization options.',
		},
	];

	if (!userInfo || userInfo.role !== 'admin') {
		return <Navigate to="/" />;
	}

	return (
		<div className="min-h-screen bg-slate-950 text-white md:flex">
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
								<div className="flex h-11 w-11 flex-shrink-0 items-center justify-center">
									<button
										onClick={() => setIsSidebarOpen(true)}
										className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-white/5 text-xl text-white md:hidden">
										<Menu size={20} />
									</button>
									<button
										onClick={() => navigate('/admin')}
										className="hidden h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-white transition hover:bg-white/10 md:inline-flex">
										<ArrowLeft size={20} />
									</button>
								</div>
								<div>
									<p className="text-xs uppercase tracking-[0.28em] text-cyan-300/80">
										Revenue Potential
									</p>
									<h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
										Earnings
									</h1>
									<p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
										Monetization readiness signals from your audience and
										content supply.
									</p>
								</div>
							</div>
						</section>

						<section className="mt-6 rounded-[2rem] bg-white/5 p-4 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-6">
							{isLoading ? (
								<div className="flex justify-center items-center gap-3 rounded-[1.35rem] bg-slate-900/40 px-4 py-8 text-center text-slate-400">
									<Loader size={24} className="animate-spin text-slate-500" />
									<p>Loading earnings data...</p>
								</div>
							) : (
								<div className="space-y-6">
									<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
										{earningsMetrics.map((metric) => (
											<div
												key={metric.label}
												className="rounded-[1.35rem] bg-slate-900/40 p-4">
												<div className="flex items-start justify-between gap-2">
													<p className="text-xs uppercase tracking-[0.22em] text-slate-500">
														{metric.label}
													</p>
													<span className="text-2xl">{metric.icon}</span>
												</div>
												<p className="mt-3 text-lg font-semibold text-white">
													{metric.value}
												</p>
												<p className="mt-1 text-sm text-slate-400">
													{metric.detail}
												</p>
											</div>
										))}
									</div>

									<div
										className={`rounded-[1.35rem] bg-${readinessColor}-500/10 p-6 border border-${readinessColor}-500/20`}>
										<div className="flex items-start justify-between gap-4">
											<div>
												<p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
													Monetization Readiness
												</p>
												<p
													className={`mt-2 text-3xl font-bold text-${readinessColor}-300`}>
													{readinessLevel}
												</p>
												<p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
													{totalSubscribers >= 100
														? 'Your audience is large enough to start testing sponsor, premium, or newsletter monetization experiments.'
														: totalSubscribers >= 50
															? "You're approaching the threshold for meaningful monetization. Keep growing your audience."
															: 'Focus on building your audience and publishing consistently before monetization.'}
												</p>
											</div>
											<div
												className={`flex-shrink-0 rounded-full bg-${readinessColor}-500/20 px-4 py-2 text-center`}>
												<p
													className={`text-2xl font-bold text-${readinessColor}-300`}>
													{Math.round((totalSubscribers / 100) * 100)}%
												</p>
												<p className="text-xs text-slate-400">of target</p>
											</div>
										</div>
									</div>

									<div className="space-y-3">
										<h2 className="text-xl font-bold text-white">
											Recommendations
										</h2>
										{recommendations.map((rec) => (
											<div
												key={rec.title}
												className="rounded-[1.35rem] bg-slate-900/40 p-4">
												<p className="text-sm font-semibold text-white">
													{rec.title}
												</p>
												<p className="mt-2 text-sm leading-6 text-slate-300">
													{rec.description}
												</p>
											</div>
										))}
									</div>
								</div>
							)}
						</section>
					</div>
				</div>
			</main>
		</div>
	);
};

export default Earnings;
