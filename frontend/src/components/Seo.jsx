import { useEffect } from 'react';

const ensureMetaTag = (selector, attributes) => {
	let element = document.head.querySelector(selector);

	if (!element) {
		element = document.createElement('meta');
		Object.entries(attributes).forEach(([key, value]) => {
			element.setAttribute(key, value);
		});
		document.head.appendChild(element);
	}

	return element;
};

const ensureLinkTag = (selector, rel) => {
	let element = document.head.querySelector(selector);

	if (!element) {
		element = document.createElement('link');
		element.setAttribute('rel', rel);
		document.head.appendChild(element);
	}

	return element;
};

export default function Seo({
	title,
	description,
	image,
	type = 'website',
	pathname = '/',
}) {
	useEffect(() => {
		const previousTitle = document.title;
		const canonicalBase =
			import.meta.env.VITE_SITE_URL ||
			(typeof window !== 'undefined' ? window.location.origin : '');
		const canonicalUrl = `${canonicalBase}${pathname}`;
		const imageUrl = image
			? image.startsWith('http')
				? image
				: `${canonicalBase}${image}`
			: `${canonicalBase}/src/assets/Logo/new-gen-logo-cropped.png`;

		document.title = title;

		const descriptionTag = ensureMetaTag('meta[name="description"]', {
			name: 'description',
		});
		descriptionTag.setAttribute('content', description);

		const ogTitle = ensureMetaTag('meta[property="og:title"]', {
			property: 'og:title',
		});
		ogTitle.setAttribute('content', title);

		const ogDescription = ensureMetaTag('meta[property="og:description"]', {
			property: 'og:description',
		});
		ogDescription.setAttribute('content', description);

		const ogType = ensureMetaTag('meta[property="og:type"]', {
			property: 'og:type',
		});
		ogType.setAttribute('content', type);

		const ogUrl = ensureMetaTag('meta[property="og:url"]', {
			property: 'og:url',
		});
		ogUrl.setAttribute('content', canonicalUrl);

		const ogImage = ensureMetaTag('meta[property="og:image"]', {
			property: 'og:image',
		});
		ogImage.setAttribute('content', imageUrl);

		const twitterCard = ensureMetaTag('meta[name="twitter:card"]', {
			name: 'twitter:card',
		});
		twitterCard.setAttribute('content', 'summary_large_image');

		const twitterTitle = ensureMetaTag('meta[name="twitter:title"]', {
			name: 'twitter:title',
		});
		twitterTitle.setAttribute('content', title);

		const twitterDescription = ensureMetaTag(
			'meta[name="twitter:description"]',
			{
				name: 'twitter:description',
			},
		);
		twitterDescription.setAttribute('content', description);

		const twitterImage = ensureMetaTag('meta[name="twitter:image"]', {
			name: 'twitter:image',
		});
		twitterImage.setAttribute('content', imageUrl);

		const canonicalTag = ensureLinkTag('link[rel="canonical"]', 'canonical');
		canonicalTag.setAttribute('href', canonicalUrl);

		return () => {
			document.title = previousTitle;
		};
	}, [description, image, pathname, title, type]);

	return null;
}
