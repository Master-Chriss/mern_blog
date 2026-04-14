export const normalizeCategory = (category) => category || 'General';

export const normalizeTag = (tag) => String(tag || '').trim();

export const slugifyValue = (value) =>
	String(value || '')
		.toLowerCase()
		.trim()
		.replace(/&/g, 'and')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');

export const filterPostsByCategory = (posts, category) =>
	posts.filter((post) => normalizeCategory(post.category) === category);

export const filterPostsByTag = (posts, tag) =>
	posts.filter((post) =>
		(post.tags || []).some((postTag) => normalizeTag(postTag) === tag),
	);
