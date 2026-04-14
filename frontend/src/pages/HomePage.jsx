import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Post from '../Post';
import Seo from '../components/Seo';
import { POST_CATEGORIES } from '../constants/postCategories';
import { slugifyValue } from '../utils/postFilters';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const HomePage = () => {
	const [posts, setPosts] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [activeCategory, setActiveCategory] = useState('All');
	const location = useLocation();
	const navigate = useNavigate();

	// Parse search query from URL
	useEffect(() => {
		const params = new URLSearchParams(location.search);
		const query = params.get('search') || '';
		const category = params.get('category') || 'All';
		setSearchQuery(query);
		setActiveCategory(
			POST_CATEGORIES.includes(category) ? category : 'All',
		);
	}, [location.search]);

	useEffect(() => {
		fetch(`${API_URL}/post`).then((response) => {
			response.json().then((posts) => {
				setPosts(posts);
			});
		});
	}, []);

	const filteredPosts = posts.filter((post) => {
		const matchesCategory =
			activeCategory === 'All' || (post.category || 'General') === activeCategory;
		const titleMatch = post.title
			.toLowerCase()
			.includes(searchQuery.toLowerCase());
		const summaryMatch = post.summary
			.toLowerCase()
			.includes(searchQuery.toLowerCase());
		const authorMatch = post.author?.username
			?.toLowerCase()
			.includes(searchQuery.toLowerCase());
		return matchesCategory && (titleMatch || summaryMatch || authorMatch);
	});

	const calculateTrendingScore = (post) => {
		const contentLength = (post.content || '').replace(/<[^>]*>/g, '').length;
		const tagScore = (post.tags?.length || 0) * 12;
		const freshnessBoost = Math.max(
			0,
			30 - Math.floor((Date.now() - new Date(post.createdAt).getTime()) / 86400000),
		);

		return contentLength / 180 + tagScore + freshnessBoost;
	};

	const featuredPost = filteredPosts[0] || null;
	const trendingPosts = [...filteredPosts]
		.sort((a, b) => calculateTrendingScore(b) - calculateTrendingScore(a))
		.filter((post) => post._id !== featuredPost?._id)
		.slice(0, 4);

	const handleCategoryChange = (category) => {
		const params = new URLSearchParams(location.search);
		if (category === 'All') {
			params.delete('category');
		} else {
			params.set('category', category);
		}

		const nextSearch = params.toString();
		navigate(nextSearch ? `/?${nextSearch}` : '/');
	};

	return (
			<main className="max-w-7xl mx-auto px-8 py-12">
				<Seo
					title="New Generation Latest News | Explore Our Latest Trending News"
					description="Discover the latest stories across technology, entertainment, sports, lifestyle, business, and more from New Generation Latest News."
					pathname={location.pathname + location.search}
				/>
				{/* 1. Modern Hero Section */}
				<section className="mb-20 text-center space-y-4">
					<h1 className="text-3xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
						Explore Our Latest Trending News
					</h1>
					<p className="text-slate-400 text-xl max-w-2xl mx-auto">
						Technology, lifestyle, insights, entertainment and ideas. Fresh perspectives from curious minds of our talented <span className="font-bold text-slate-50">Authors</span>  .
					</p>
					<div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-3 pt-4">
						{POST_CATEGORIES.map((category) => {
							const isActive = activeCategory === category;
							return (
								<button
									key={category}
									type="button"
									onClick={() => handleCategoryChange(category)}
									className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
										isActive
											? 'border-cyan-400 bg-cyan-500/20 text-cyan-200'
											: 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10'
									}`}>
									{category}
								</button>
							);
						})}
					</div>
				</section>

				{featuredPost && (
					<section className="mb-16 grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
						<Link
							to={`/post/${featuredPost._id}`}
							className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl shadow-cyan-950/20">
							<div className="relative h-[360px] overflow-hidden bg-slate-900/60">
								{featuredPost.cover ? (
									<img
										src={
											featuredPost.cover.startsWith('http')
												? featuredPost.cover
												: `${API_URL}/${featuredPost.cover.replace(/\\/g, '/')}`
										}
										alt={featuredPost.title}
										className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
									/>
								) : (
									<div className="h-full w-full bg-slate-800/60" />
								)}
								<div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent" />
								<div className="absolute left-6 top-6 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-cyan-200">
									Featured Story
								</div>
							</div>
							<div className="p-6 md:p-8">
								<div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
									<Link
										to={`/category/${slugifyValue(featuredPost.category || 'General')}`}
										className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-semibold text-cyan-300">
										{featuredPost.category || 'General'}
									</Link>
									<span>@{featuredPost.author?.username}</span>
								</div>
								<h2 className="max-w-3xl text-3xl font-black leading-tight text-white transition group-hover:text-cyan-200 md:text-4xl">
									{featuredPost.title}
								</h2>
								<p className="mt-4 max-w-3xl text-base leading-8 text-slate-300 md:text-lg">
									{featuredPost.summary}
								</p>
								<div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300">
									Read featured story <span>→</span>
								</div>
							</div>
						</Link>

						<div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-md">
							<div className="mb-5">
								<p className="text-xs uppercase tracking-[0.35em] text-slate-500">
									Trending Now
								</p>
								<h3 className="mt-2 text-2xl font-bold text-white">
									Popular in the feed
								</h3>
							</div>

							<div className="space-y-4">
								{trendingPosts.map((post, index) => (
									<Link
										key={post._id}
										to={`/post/${post._id}`}
										className="flex items-start gap-4 rounded-2xl border border-white/10 bg-slate-950/20 p-4 transition hover:border-cyan-400/30 hover:bg-white/5">
										<span className="w-8 text-lg font-black text-slate-600">
											{String(index + 1).padStart(2, '0')}
										</span>
										<div className="min-w-0">
											<p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
												{post.category || 'General'}
											</p>
											<h4 className="line-clamp-2 text-base font-semibold text-white">
												{post.title}
											</h4>
											<p className="mt-2 text-sm text-slate-400">
												@{post.author?.username}
											</p>
										</div>
									</Link>
								))}
							</div>
						</div>
					</section>
				)}

				{/* 2. Post Grid Container */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
				{filteredPosts.length > 0 ? (
					filteredPosts.map((post) => (
						<Post key={post._id || Math.random()} {...post} />
					))
					) : searchQuery ? (
						<div className="col-span-full text-center py-20">
							<p className="text-2xl text-slate-500">
								No stories found for "{searchQuery}"
							</p>
						</div>
					) : activeCategory !== 'All' ? (
						<div className="col-span-full text-center py-20">
							<p className="text-2xl text-slate-500">
								No stories found in {activeCategory}
							</p>
						</div>
					) : (
					[1, 2, 3].map((n) => (
						<div
							key={n}
							className="h-64 rounded-3xl bg-white/5 animate-pulse border border-white/10"
						/>
					))
				)}
			</div>
		</main>
	);
};

export default HomePage;
