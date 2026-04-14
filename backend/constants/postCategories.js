export const POST_CATEGORIES = [
	'General',
	'Technology',
	'Programming',
	'AI',
	'Web Development',
	'Mobile Development',
	'Cybersecurity',
	'Data Science',
	'Sports',
	'Entertainment',
	'Career',
	'Productivity',
	'Lifestyle',
	'Business',
];

export const DEFAULT_POST_CATEGORY = 'General';

export const normalizePostCategory = (category) => {
	if (!category || typeof category !== 'string') {
		return DEFAULT_POST_CATEGORY;
	}

	const trimmedCategory = category.trim();
	return POST_CATEGORIES.includes(trimmedCategory)
		? trimmedCategory
		: DEFAULT_POST_CATEGORY;
};
