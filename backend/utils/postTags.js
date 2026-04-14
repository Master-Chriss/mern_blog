export const normalizePostTags = (value) => {
	if (!value) return [];

	const rawTags = Array.isArray(value) ? value : String(value).split(',');
	const uniqueTags = new Set();

	for (const tag of rawTags) {
		const trimmedTag = String(tag).trim().replace(/\s+/g, ' ');
		if (!trimmedTag) continue;

		const normalizedTag = trimmedTag
			.split(' ')
			.map((word) =>
				word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : word,
			)
			.join(' ');

		uniqueTags.add(normalizedTag);

		if (uniqueTags.size >= 8) break;
	}

	return Array.from(uniqueTags);
};
