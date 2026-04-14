import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Post from '../Post';
import { POST_CATEGORIES } from '../constants/postCategories';

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
			{/* 1. Modern Hero Section */}
				<section className="mb-20 text-center space-y-4">
					<h1 className="text-3xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
						Explore Our Latest Stories
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
