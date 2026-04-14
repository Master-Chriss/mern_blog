import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Post from '../Post';
import Seo from '../components/Seo';
import { POST_CATEGORIES } from '../constants/postCategories';
import {
	filterPostsByCategory,
	filterPostsByTag,
	slugifyValue,
} from '../utils/postFilters';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const resolveArchiveConfig = (type, slug) => {
	if (type === 'category') {
		const category = POST_CATEGORIES.find(
			(item) => item !== 'All' && slugifyValue(item) === slug,
		);

		if (!category) return null;

		return {
			title: `${category} Articles`,
			subtitle: `Browse every story filed under ${category}.`,
			filter: (posts) => filterPostsByCategory(posts, category),
		};
	}

	const tagLabel = slug
		.split('-')
		.filter(Boolean)
		.map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
		.join(' ');

	return {
		title: `Posts Tagged ${tagLabel}`,
		subtitle: `A focused archive for stories connected to ${tagLabel}.`,
		filter: (posts) =>
			filterPostsByTag(
				posts,
				tagLabel,
			),
	};
};

export default function ArchivePage() {
	const { type, slug } = useParams();
	const [posts, setPosts] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	const archiveConfig = useMemo(
		() => resolveArchiveConfig(type, slug),
		[type, slug],
	);

	useEffect(() => {
		setIsLoading(true);
		fetch(`${API_URL}/post`)
			.then((response) => response.json())
			.then((data) => {
				setPosts(Array.isArray(data) ? data : []);
			})
			.catch(() => setPosts([]))
			.finally(() => setIsLoading(false));
	}, [type, slug]);

	const filteredPosts = archiveConfig ? archiveConfig.filter(posts) : [];

	if (!archiveConfig) {
		return (
			<main className="mx-auto max-w-5xl px-6 py-16 text-center">
				<h1 className="text-3xl font-black text-white">Archive Not Found</h1>
				<p className="mt-4 text-slate-400">
					That archive does not exist yet.
				</p>
				<Link
					to="/"
					className="mt-8 inline-flex rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
					Back to Home
				</Link>
			</main>
		);
	}

	return (
		<main className="mx-auto max-w-7xl px-6 py-12">
			<Seo
				title={`${archiveConfig.title} | New Generation Latest News`}
				description={archiveConfig.subtitle}
				pathname={`/${type}/${slug}`}
			/>
			<section className="mb-14 rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-md">
				<p className="text-xs uppercase tracking-[0.35em] text-cyan-300">
					Archive
				</p>
				<h1 className="mt-3 text-3xl font-black text-white md:text-5xl">
					{archiveConfig.title}
				</h1>
				<p className="mt-4 max-w-2xl text-slate-400">
					{archiveConfig.subtitle}
				</p>
				<p className="mt-6 text-sm text-slate-500">
					{filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
				</p>
			</section>

			<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
				{isLoading
					? [1, 2, 3].map((item) => (
							<div
								key={item}
								className="h-64 animate-pulse rounded-3xl border border-white/10 bg-white/5"
							/>
					  ))
					: filteredPosts.map((post) => <Post key={post._id} {...post} />)}
			</div>

			{!isLoading && filteredPosts.length === 0 && (
				<div className="py-20 text-center">
					<p className="text-2xl text-slate-500">
						No posts in this archive yet.
					</p>
				</div>
			)}
		</main>
	);
}
