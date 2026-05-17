import { useContext, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UserContext } from '../UserContext';
import { ArrowLeft, ChartColumn, Menu, Loader } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const formatMonthLabel = (value) =>
	new Intl.DateTimeFormat(undefined, { month: 'short' }).format(value);

const Analytics = () => {
	const { userInfo } = useContext(UserContext);
	const navigate = useNavigate();
	const [posts, setPosts] = useState([]);
	const [users, setUsers] = useState([]);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const loadAnalyticsData = async () => {
			try {
				setIsLoading(true);
				const [postsRes, usersRes] = await Promise.all([
					fetch(`${API_URL}/post/admin/all`, { credentials: 'include' }),
					fetch(`${API_URL}/auth/users`, { credentials: 'include' }),
				]);

				if (!postsRes.ok || !usersRes.ok)
					throw new Error('Failed to load data');

				const postsData = await postsRes.json();
				const usersData = await usersRes.json();

				setPosts(Array.isArray(postsData) ? postsData : []);
				setUsers(Array.isArray(usersData) ? usersData : []);
			} catch (error) {
				console.error('Load analytics error:', error);
				toast.error(error.message || 'Could not load analytics');
			} finally {
				setIsLoading(false);
			}
		};

		loadAnalyticsData();
	}, []);

	const now = new Date();
	const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
	const weekStart = new Date(now);
	weekStart.setDate(now.getDate() - 7);

	const thisMonthPosts = posts.filter(
		(post) => new Date(post.createdAt) >= monthStart,
	).length;
	const thisWeekPosts = posts.filter(
		(post) => new Date(post.createdAt) >= weekStart,
	).length;

	const categoryBreakdown = Object.entries(
		posts.reduce((acc, post) => {
			const key = post.category || 'General';
			acc[key] = (acc[key] || 0) + 1;
			return acc;
		}, {}),
	).sort((a, b) => b[1] - a[1]);

	const dominantCategory = categoryBreakdown[0] || null;
	const dominantCategoryShare = dominantCategory
		? Math.round((dominantCategory[1] / Math.max(posts.length, 1)) * 100)
		: 0;

	const monthlyBreakdown = Array.from({ length: 4 }, (_, index) => {
		const date = new Date(now.getFullYear(), now.getMonth() - (3 - index), 1);
		const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
		const count = posts.filter((post) => {
			const postDate = new Date(post.createdAt);
			return postDate >= date && postDate < nextMonth;
		}).length;

		return { label: formatMonthLabel(date), count };
	});

	const busiestMonthCount = Math.max(
		...monthlyBreakdown.map((item) => item.count),
		1,
	);

	const authorBreakdown = Object.entries(
		posts.reduce((acc, post) => {
			const key = post.author?.username || 'Unknown';
			acc[key] = (acc[key] || 0) + 1;
			return acc;
		}, {}),
	)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 5);

	const totalAuthors = users.filter((user) => user.role === 'author').length;
	const totalReaders = users.filter((user) => user.role === 'reader').length;
	const readersPerAuthor =
		totalAuthors > 0 ? Math.round((totalReaders / totalAuthors) * 10) / 10 : 0;
	const postsPerAuthor =
		totalAuthors > 0 ? Math.round((posts.length / totalAuthors) * 10) / 10 : 0;

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
										Platform Insights
									</p>
									<h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
										Analytics
									</h1>
									<p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
										Content performance, audience metrics, and author engagement
										data.
									</p>
								</div>
							</div>
						</section>

						<section className="mt-6 rounded-[2rem] bg-white/5 p-4 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-6">
							{isLoading ? (
								<div className="flex justify-center items-center gap-3 rounded-[1.35rem] bg-slate-900/40 px-4 py-8 text-center text-slate-400">
									<Loader size={24} className="animate-spin text-slate-500" />
									<p>Loading analytics...</p>
								</div>
							) : (
								<div className="space-y-6 xl:grid xl:grid-cols-[1.15fr_0.85fr] xl:gap-6 xl:space-y-0">
									<div className="space-y-3">
										<div className="grid gap-3 sm:grid-cols-3">
											<div className="rounded-[1.35rem] bg-slate-900/40 p-4">
												<p className="text-xs uppercase tracking-[0.22em] text-slate-500">
													Dominant Category
												</p>
												<p className="mt-3 text-lg font-semibold text-white">
													{dominantCategory?.[0] || 'No data'}
												</p>
												<p className="mt-1 text-sm text-slate-400">
													{dominantCategory
														? `${dominantCategoryShare}% of posts`
														: 'Publish to unlock'}
												</p>
											</div>
											<div className="rounded-[1.35rem] bg-slate-900/40 p-4">
												<p className="text-xs uppercase tracking-[0.22em] text-slate-500">
													Readers per Author
												</p>
												<p className="mt-3 text-lg font-semibold text-white">
													{readersPerAuthor}
												</p>
												<p className="mt-1 text-sm text-slate-400">
													Based on current role mix
												</p>
											</div>
											<div className="rounded-[1.35rem] bg-slate-900/40 p-4">
												<p className="text-xs uppercase tracking-[0.22em] text-slate-500">
													Posts per Author
												</p>
												<p className="mt-3 text-lg font-semibold text-white">
													{postsPerAuthor}
												</p>
												<p className="mt-1 text-sm text-slate-400">
													Average output per author
												</p>
											</div>
										</div>

										<div className="rounded-[1.35rem] bg-slate-900/40 p-4">
											<div className="flex items-center justify-between gap-4">
												<p className="text-sm font-semibold text-white">
													Category Breakdown
												</p>
												<p className="text-sm text-slate-500">
													{posts.length} total posts
												</p>
											</div>
											<div className="mt-4 space-y-3">
												{categoryBreakdown.length > 0 ? (
													categoryBreakdown
														.slice(0, 5)
														.map(([category, count]) => (
															<div key={category}>
																<div className="flex items-center justify-between gap-4">
																	<p className="text-sm text-white">
																		{category}
																	</p>
																	<p className="text-sm text-cyan-300">
																		{count}
																	</p>
																</div>
																<div className="mt-2 h-2 rounded-full bg-white/5">
																	<div
																		className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
																		style={{
																			width: `${Math.max(
																				16,
																				(count / Math.max(posts.length, 1)) *
																					100,
																			)}%`,
																		}}
																	/>
																</div>
															</div>
														))
												) : (
													<p className="text-sm text-slate-400">
														Publishing analytics will appear once posts exist.
													</p>
												)}
											</div>
										</div>
									</div>

									<div className="space-y-3">
										<div className="rounded-[1.35rem] bg-slate-900/40 p-4">
											<p className="text-sm font-semibold text-white">
												Publishing Rhythm
											</p>
											<div className="mt-4 grid grid-cols-4 gap-3">
												{monthlyBreakdown.map((item) => (
													<div key={item.label} className="text-center">
														<div className="flex h-28 items-end justify-center rounded-2xl bg-white/5 px-2 pb-3">
															<div
																className="w-full rounded-xl bg-gradient-to-t from-cyan-500 to-purple-500"
																style={{
																	height: `${Math.max(
																		14,
																		(item.count / busiestMonthCount) * 88,
																	)}px`,
																}}
															/>
														</div>
														<p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
															{item.label}
														</p>
														<p className="mt-1 text-sm text-white">
															{item.count}
														</p>
													</div>
												))}
											</div>
										</div>

										<div className="rounded-[1.35rem] bg-slate-900/40 p-4">
											<p className="text-sm font-semibold text-white">
												Top Authors
											</p>
											<div className="mt-4 space-y-3">
												{authorBreakdown.length > 0 ? (
													authorBreakdown.map(([author, count]) => (
														<div
															key={author}
															className="flex items-center justify-between gap-4">
															<p className="text-sm text-white">@{author}</p>
															<p className="text-sm text-cyan-300">
																{count} posts
															</p>
														</div>
													))
												) : (
													<p className="text-sm text-slate-400">
														Author distribution will appear once posts exist.
													</p>
												)}
											</div>
										</div>

										<div className="rounded-[1.35rem] bg-slate-900/40 p-4">
											<p className="text-sm font-semibold text-white">
												Publishing Cadence
											</p>
											<div className="mt-4 space-y-2 text-sm text-slate-300">
												<p>
													<span className="text-slate-400">This week:</span>{' '}
													{thisWeekPosts} posts
												</p>
												<p>
													<span className="text-slate-400">This month:</span>{' '}
													{thisMonthPosts} posts
												</p>
												<p>
													<span className="text-slate-400">Total:</span>{' '}
													{posts.length} posts
												</p>
											</div>
										</div>
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

export default Analytics;
