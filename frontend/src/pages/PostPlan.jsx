import { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CalendarDays, Menu } from 'lucide-react';
import { UserContext } from '../UserContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const PostPlan = () => {
	const { userInfo } = useContext(UserContext);
	const [posts, setPosts] = useState([]);
	const [users, setUsers] = useState([]);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const loadPlanData = async () => {
			try {
				setIsLoading(true);
				const [postsRes, usersRes] = await Promise.all([
					fetch(`${API_URL}/post/admin/all`, { credentials: 'include' }),
					fetch(`${API_URL}/auth/users`, { credentials: 'include' }),
				]);

				if (!postsRes.ok || !usersRes.ok) throw new Error('Failed to load data');

				const postsData = await postsRes.json();
				const usersData = await usersRes.json();

				setPosts(Array.isArray(postsData) ? postsData : []);
				setUsers(Array.isArray(usersData) ? usersData : []);
			} catch (error) {
				console.error('Load plan data error:', error);
				toast.error(error.message || 'Could not load plan data');
			} finally {
				setIsLoading(false);
			}
		};

		loadPlanData();
	}, []);

	const now = new Date();
	const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
	const weekStart = new Date(now);
	weekStart.setDate(now.getDate() - 7);

	const thisWeekPosts = posts.filter(
		(post) => new Date(post.createdAt) >= weekStart,
	).length;
	const thisMonthPosts = posts.filter(
		(post) => new Date(post.createdAt) >= monthStart,
	).length;

	const postsWithoutTags = posts.filter((post) => (post.tags || []).length === 0)
		.length;
	const postsWithoutCategory = posts.filter((post) => !post.category).length;

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

	const totalAuthors = users.filter((user) => user.role === 'author').length;
	const authorsWithoutPosts = users.filter(
		(user) =>
			user.role === 'author' &&
			!posts.some((post) => String(post.author?._id) === String(user._id)),
	).length;

	const inactiveAuthors = users.filter((user) => {
		if (user.role !== 'author') return false;
		const authoredPosts = posts.filter(
			(post) => String(post.author?._id) === String(user._id),
		);
		if (authoredPosts.length === 0) return false;

		const latestPostDate = authoredPosts.reduce((latest, post) => {
			const createdAt = new Date(post.createdAt);
			return createdAt > latest ? createdAt : latest;
		}, new Date(0));

		return (now.getTime() - latestPostDate.getTime()) / 86400000 > 21;
	}).length;

	const planItems = [
		{
			label: 'Publishing Cadence',
			value: `${thisWeekPosts} posts in the last 7 days and ${thisMonthPosts} this month.`,
			status: thisWeekPosts > 0 ? 'good' : 'warning',
		},
		{
			label: 'Author Coverage',
			value:
				authorsWithoutPosts > 0
					? `${authorsWithoutPosts} authors have no published stories yet and may need onboarding or assignments.`
					: 'Every current author has at least one published story.',
			status: authorsWithoutPosts === 0 ? 'good' : 'warning',
		},
		{
			label: 'Category Balance',
			value:
				dominantCategory && dominantCategoryShare >= 55
					? `${dominantCategory[0]} currently makes up ${dominantCategoryShare}% of recent publishing.`
					: 'Your current category mix is reasonably balanced.',
			status: dominantCategoryShare >= 55 ? 'warning' : 'good',
		},
		{
			label: 'Metadata Cleanup',
			value:
				postsWithoutTags > 0 || postsWithoutCategory > 0
					? `${postsWithoutTags} posts need tags and ${postsWithoutCategory} posts need category assignment.`
					: 'Your content metadata looks clean across categories and tags.',
			status: postsWithoutTags > 0 || postsWithoutCategory > 0 ? 'warning' : 'good',
		},
		{
			label: 'Author Activity',
			value:
				inactiveAuthors > 0
					? `${inactiveAuthors} authors have been quiet for more than 3 weeks.`
					: 'All active authors are maintaining a consistent publishing rhythm.',
			status: inactiveAuthors > 0 ? 'warning' : 'good',
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
										Content Strategy
									</p>
									<h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
										Post Plan
									</h1>
									<p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
										Strategic recommendations based on your current publishing and team data.
									</p>
								</div>
							</div>
						</section>

						<section className="mt-6 rounded-[2rem] bg-white/5 p-4 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-6">
							{isLoading ? (
								<div className="rounded-[1.35rem] bg-slate-900/40 px-4 py-8 text-center text-slate-400">
									Loading plan data...
								</div>
							) : (
								<div className="space-y-3">
									{planItems.map((item) => (
										<div
											key={item.label}
											className={`rounded-[1.35rem] p-4 ${
												item.status === 'good'
													? 'bg-emerald-500/10'
													: 'bg-amber-500/10'
											}`}>
											<div className="flex items-start justify-between gap-4">
												<div className="min-w-0">
													<p className="text-sm font-semibold text-white">
														{item.label}
													</p>
													<p className="mt-2 text-sm leading-6 text-slate-300">
														{item.value}
													</p>
												</div>
												<div
													className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
														item.status === 'good'
															? 'bg-emerald-500/20 text-emerald-300'
															: 'bg-amber-500/20 text-amber-300'
													}`}>
													{item.status === 'good' ? '✓ Good' : '⚠ Review'}
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</section>
					</div>
				</div>
			</main>
		</div>
	);
};

export default PostPlan;
