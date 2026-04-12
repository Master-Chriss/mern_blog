const AboutPage = () => {
	return (
		<div className="max-w-4xl mx-auto py-16 px-6 animate-in fade-in duration-1000">
			<div className="space-y-12">
				{/* Header */}
				<section className="text-center space-y-4">
					<h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
						About New Gen
					</h1>
					<p className="text-xl text-slate-300 max-w-2xl mx-auto">
						Discover stories from curious minds sharing expertise in technology,
						lifestyle, and innovation.
					</p>
				</section>

				{/* Mission */}
				<section className="space-y-4">
					<h2 className="text-3xl font-bold text-white">Our Mission</h2>
					<p className="text-slate-300 leading-relaxed text-lg">
						New Gen is a platform dedicated to publishing high-quality stories
						and insights from talented authors around the world. We believe in
						the power of storytelling to inspire, educate, and connect
						communities through shared knowledge and perspectives.
					</p>
				</section>

				{/* Values */}
				<section className="space-y-6">
					<h2 className="text-3xl font-bold text-white">Our Values</h2>
					<div className="grid md:grid-cols-3 gap-6">
						{[
							{
								title: '📚 Knowledge',
								desc: 'We prioritize well-researched, insightful content that adds value to our readers.',
							},
							{
								title: '🌍 Inclusivity',
								desc: 'We welcome diverse voices and perspectives from authors around the globe.',
							},
							{
								title: '✨ Excellence',
								desc: 'We maintain high editorial standards to ensure quality content for all our readers.',
							},
						].map((value, idx) => (
							<div
								key={idx}
								className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
								<h3 className="text-xl font-bold text-cyan-400 mb-2">
									{value.title}
								</h3>
								<p className="text-slate-400">{value.desc}</p>
							</div>
						))}
					</div>
				</section>

				{/* Community */}
				<section className="space-y-4">
					<h2 className="text-3xl font-bold text-white">Join Our Community</h2>
					<p className="text-slate-300 leading-relaxed text-lg">
						Whether you're a seasoned writer or just starting your journey, New
						Gen welcomes you to share your stories. Create an account, publish
						your articles, and connect with readers worldwide.
					</p>
				</section>

				{/* Stats */}
				<section className="grid md:grid-cols-3 gap-8 py-8 border-y border-white/10">
					{[
						{ number: '500+', label: 'Stories Published' },
						{ number: '100K+', label: 'Active Readers' },
						{ number: '50+', label: 'Creator Authors' },
					].map((stat, idx) => (
						<div key={idx} className="text-center">
							<p className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
								{stat.number}
							</p>
							<p className="text-slate-400 mt-2">{stat.label}</p>
						</div>
					))}
				</section>

				{/* Contact CTA */}
				<section className="text-center space-y-4 py-8">
					<h2 className="text-2xl font-bold text-white">Have Questions?</h2>
					<p className="text-slate-300 mb-6">We'd love to hear from you</p>
					<a
						href="/contact"
						className="inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all">
						Get in Touch
					</a>
				</section>
			</div>
		</div>
	);
};

export default AboutPage;
