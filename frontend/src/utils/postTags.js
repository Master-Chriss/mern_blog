export const tagsToInputValue = (tags) =>
	Array.isArray(tags) ? tags.join(', ') : '';

export const parseTagInput = (value) => {
	if (!value) return [];

	const uniqueTags = new Set();

	value
		.split(',')
		.map((tag) => tag.trim().replace(/\s+/g, ' '))
		.filter(Boolean)
		.forEach((tag) => {
			const normalizedTag = tag
				.split(' ')
				.map((word) =>
					word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : word,
				)
				.join(' ');

			if (normalizedTag && uniqueTags.size < 8) {
				uniqueTags.add(normalizedTag);
			}
		});

	return Array.from(uniqueTags);
};
