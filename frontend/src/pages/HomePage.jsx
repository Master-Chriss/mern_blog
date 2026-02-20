import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Post from '../Post';

const HomePage = () => {
	const [posts, setPosts] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const location = useLocation();

	// Parse search query from URL
	useEffect(() => {
		const params = new URLSearchParams(location.search);
		const query = params.get('search') || '';
		setSearchQuery(query);
	}, [location.search]);

	useEffect(() => {
		fetch('http://localhost:4000/post').then((response) => {
			response.json().then((posts) => {
				setPosts(posts);
			});
		});
	}, []);

	const filteredPosts = posts.filter((post) => {
		const titleMatch = post.title
			.toLowerCase()
			.includes(searchQuery.toLowerCase());
		const summaryMatch = post.summary
			.toLowerCase()
			.includes(searchQuery.toLowerCase());
		const authorMatch = post.author?.username
			?.toLowerCase()
			.includes(searchQuery.toLowerCase());
		return titleMatch || summaryMatch || authorMatch;
	});

	return (
		<main className="max-w-7xl mx-auto px-8 py-12">
			{/* 1. Modern Hero Section */}
			<section className="mb-20 text-center space-y-4">
				<h1 className="text-3xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
					Stories That Matter
				</h1>
				<p className="text-slate-400 text-3xl max-w-2xl mx-auto">
					Technology, lifestyle, insights, entertainment and ideas. Fresh perspectives from curious minds of trained <span className="font-bold text-slate-50">Authors</span>  .
				</p>
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
