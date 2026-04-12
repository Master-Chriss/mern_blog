const PrivacyPolicyPage = () => {
	return (
		<div className="max-w-4xl mx-auto py-16 px-6 animate-in fade-in duration-1000">
			<div className="space-y-8">
				<h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
					Privacy Policy
				</h1>

				<p className="text-slate-400">Last Updated: April 12, 2026</p>

				<section className="space-y-4">
					<h2 className="text-2xl font-bold text-white">1. Introduction</h2>
					<p className="text-slate-300 leading-relaxed">
						New Gen ("we", "our", or "us") operates the New Gen blog. This page
						informs you of our policies regarding the collection, use, and
						disclosure of personal data when you use our Service and the choices
						you have associated with that data.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-bold text-white">
						2. Information Collection and Use
					</h2>
					<p className="text-slate-300 leading-relaxed">
						We collect several different types of information for various
						purposes to provide and improve our Service to you.
					</p>
					<div className="space-y-3 ml-4 border-l-2 border-cyan-500/30 pl-4">
						<div>
							<h3 className="font-semibold text-white">Personal Data:</h3>
							<p className="text-slate-400">
								Email address, name, profile information
							</p>
						</div>
						<div>
							<h3 className="font-semibold text-white">Usage Data:</h3>
							<p className="text-slate-400">
								Browser type, IP address, pages visited, access times
							</p>
						</div>
						<div>
							<h3 className="font-semibold text-white">Cookies:</h3>
							<p className="text-slate-400">
								Small data files stored on your device for authentication and
								analytics
							</p>
						</div>
					</div>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-bold text-white">3. Use of Data</h2>
					<p className="text-slate-300 leading-relaxed">
						New Gen uses the collected data for various purposes:
					</p>
					<ul className="space-y-2 text-slate-300 ml-4">
						<li>• To provide and maintain our Service</li>
						<li>• To notify you about changes to our Service</li>
						<li>• To allow you to create and manage content</li>
						<li>
							• To gather analysis or valuable information for improving the
							Service
						</li>
						<li>• To monitor the usage of our Service</li>
						<li>
							• To detect and prevent fraudulent transactions and other illegal
							activities
						</li>
					</ul>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-bold text-white">4. Security of Data</h2>
					<p className="text-slate-300 leading-relaxed">
						The security of your data is important to us but remember that no
						method of transmission over the Internet or method of electronic
						storage is 100% secure. While we strive to use commercially
						acceptable means to protect your Personal Data, we cannot guarantee
						its absolute security.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-bold text-white">
						5. Changes to This Privacy Policy
					</h2>
					<p className="text-slate-300 leading-relaxed">
						We may update our Privacy Policy from time to time. We will notify
						you of any changes by posting the new Privacy Policy on this page
						and updating the "Last Updated" date at the top of this Privacy
						Policy.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-bold text-white">6. Contact Us</h2>
					<p className="text-slate-300 leading-relaxed">
						If you have any questions about this Privacy Policy, please{' '}
						<a href="/contact" className="text-cyan-400 hover:underline">
							contact us
						</a>
						.
					</p>
				</section>
			</div>
		</div>
	);
};

export default PrivacyPolicyPage;
