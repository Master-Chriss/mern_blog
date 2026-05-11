import { useContext, useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Menu, X } from 'lucide-react';
import { UserContext } from '../UserContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const formatRelativeTime = (value) => {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return 'Recently';

	const seconds = Math.round((date.getTime() - Date.now()) / 1000);
	const thresholds = [
		{ amount: 60, unit: 'second' },
		{ amount: 60, unit: 'minute' },
		{ amount: 24, unit: 'hour' },
		{ amount: 7, unit: 'day' },
		{ amount: 4.34524, unit: 'week' },
		{ amount: 12, unit: 'month' },
		{ amount: Number.POSITIVE_INFINITY, unit: 'year' },
	];
	const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
	let duration = seconds;

	for (const threshold of thresholds) {
		if (Math.abs(duration) < threshold.amount) {
			return formatter.format(Math.round(duration), threshold.unit);
		}
		duration /= threshold.amount;
	}
	return 'Recently';
};

const Inbox = () => {
	const { userInfo } = useContext(UserContext);
	const [inboxData, setInboxData] = useState({
		activities: [],
		summary: {
			totalReaderMessages: 0,
			recentReaderMessages: 0,
			activePosts: 0,
			uniqueReaders: 0,
		},
	});
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const loadInboxData = async () => {
			try {
				setIsLoading(true);
				const response = await fetch(`${API_URL}/comments/inbox/admin`, {
					credentials: 'include',
				});

				if (!response.ok) throw new Error('Failed to load inbox');

				const data = await response.json();
				setInboxData({
					activities: Array.isArray(data?.activities) ? data.activities : [],
					summary: {
						totalReaderMessages: data?.summary?.totalReaderMessages || 0,
						recentReaderMessages: data?.summary?.recentReaderMessages || 0,
						activePosts: data?.summary?.activePosts || 0,
						uniqueReaders: data?.summary?.uniqueReaders || 0,
					},
				});
			} catch (error) {
				console.error('Load inbox error:', error);
				toast.error(error.message || 'Could not load inbox');
			} finally {
				setIsLoading(false);
			}
		};

		loadInboxData();
	}, []);

	const inboxReminders = [
		{
			title: 'Engagement Pulse',
			description: `${inboxData.summary.recentReaderMessages} new messages in the last 7 days from ${inboxData.summary.uniqueReaders} unique readers.`,
		},
		{
			title: 'Active Discussions',
			description: `${inboxData.summary.activePosts} posts currently have active reader engagement.`,
		},
		{
			title: 'Total Reach',
			description: `${inboxData.summary.totalReaderMessages} total reader messages across your platform.`,
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
								<button
									onClick={() => setIsSidebarOpen(true)}
									className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-white/5 text-xl text-white md:hidden">
									<Menu size={20} />
								</button>
								<div>
									<p className="text-xs uppercase tracking-[0.28em] text-cyan-300/80">
										Reader Engagement
									</p>
									<h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
										Inbox
									</h1>
									<p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
										Monitor reader comments, engagement, and audience interactions across your posts.
									</p>
								</div>
							</div>
						</section>

						<section className="mt-6 rounded-[2rem] bg-white/5 p-4 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-6">
							{isLoading ? (
								<div className="rounded-[1.35rem] bg-slate-900/40 px-4 py-8 text-center text-slate-400">
									Loading inbox data...
								</div>
							) : (
								<div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
									<div>
										<div className="mb-6 grid gap-3 sm:grid-cols-3">
											<div className="rounded-[1.35rem] bg-slate-900/40 p-4">
												<p className="text-xs uppercase tracking-[0.22em] text-slate-500">
													Total Messages
												</p>
												<p className="mt-3 text-2xl font-bold text-cyan-300">
													{inboxData.summary.totalReaderMessages}
												</p>
												<p className="mt-1 text-sm text-slate-400">
													Across all published posts
												</p>
											</div>
											<div className="rounded-[1.35rem] bg-slate-900/40 p-4">
												<p className="text-xs uppercase tracking-[0.22em] text-slate-500">
													Last 7 Days
												</p>
												<p className="mt-3 text-2xl font-bold text-emerald-300">
													{inboxData.summary.recentReaderMessages}
												</p>
												<p className="mt-1 text-sm text-slate-400">
													New comments and replies
												</p>
											</div>
											<div className="rounded-[1.35rem] bg-slate-900/40 p-4">
												<p className="text-xs uppercase tracking-[0.22em] text-slate-500">
													Active Discussions
												</p>
												<p className="mt-3 text-2xl font-bold text-violet-300">
													{inboxData.summary.activePosts}
												</p>
												<p className="mt-1 text-sm text-slate-400">
													{inboxData.summary.uniqueReaders} unique readers
												</p>
											</div>
										</div>

										<div className="mt-6">
											<h2 className="mb-4 text-xl font-bold text-white">Recent Activity</h2>
											<div className="space-y-3">
												{inboxData.activities.length > 0 ? (
													inboxData.activities.map((activity) => (
														<div
															key={activity._id}
															className="rounded-[1.35rem] bg-slate-900/40 p-4">
															<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
																<div className="min-w-0">
																	<p className="text-sm font-semibold text-white">
																		{activity.author?.username.charAt(0)?.toUpperCase() + activity.author?.username.slice(1) || 'A reader'}{' '}
																		<span className="text-slate-400">
																			left a {activity.type}
																		</span>
																	</p>
																	<p className="mt-1 text-sm text-cyan-200">
																		on{' '}
																		<Link
																			to={`/post/${activity.post?._id}`}
																			className="hover:underline">
																			{activity.post?.title || 'a post'}
																		</Link>{' '}
																		<span className="text-slate-400">
																			by @{activity.post?.author || 'unknown'}
																		</span>
																	</p>
																</div>
																<p className="text-xs uppercase tracking-[0.18em] text-slate-500">
																	{formatRelativeTime(activity.createdAt)}
																</p>
															</div>
															<p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">
																{activity.content}
															</p>
														</div>
													))
												) : (
													<div className="rounded-[1.35rem] bg-slate-900/40 p-4 text-sm leading-6 text-slate-400">
														No reader activity yet. Fresh comment activity will surface here.
													</div>
												)}
											</div>
										</div>
									</div>

									<div className="space-y-3">
										<div className="rounded-[1.35rem] bg-slate-900/40 p-4">
											<p className="text-sm font-semibold text-white">Engagement Insights</p>
											<p className="mt-2 text-sm leading-6 text-slate-400">
												Real-time reader engagement metrics and interaction patterns.
											</p>
										</div>
										{inboxReminders.map((item) => (
											<div
												key={item.title}
												className="rounded-[1.35rem] bg-slate-900/40 p-4">
												<p className="text-sm font-semibold text-white">{item.title}</p>
												<p className="mt-2 text-sm leading-6 text-slate-400">
													{item.description}
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

export default Inbox;
