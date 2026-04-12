const TermsOfServicePage = () => {
	return (
		<div className="max-w-4xl mx-auto py-16 px-6 animate-in fade-in duration-1000">
			<div className="space-y-8">
				<h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
					Terms of Service
				</h1>

				<p className="text-slate-400">Last Updated: April 12, 2026</p>

				<section className="space-y-4">
					<h2 className="text-2xl font-bold text-white">
						1. Agreement to Terms
					</h2>
					<p className="text-slate-300 leading-relaxed">
						By accessing and using New Gen, you accept and agree to be bound by
						the terms and provision of this agreement. If you do not agree to
						abide by the above, please do not use this service.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-bold text-white">2. User Accounts</h2>
					<p className="text-slate-300 leading-relaxed">
						When you create an account on New Gen, you must provide accurate,
						current, and complete information. You are responsible for
						maintaining the confidentiality of your password and account
						information. You agree to accept responsibility for all activities
						that occur under your account.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-bold text-white">
						3. Content Guidelines
					</h2>
					<p className="text-slate-300 leading-relaxed">
						Users agree not to post content that:
					</p>
					<ul className="space-y-2 text-slate-300 ml-4">
						<li>• Is illegal or violates applicable laws</li>
						<li>• Is defamatory, obscene, or offensive</li>
						<li>• Infringes on intellectual property rights</li>
						<li>• Constitutes spam or unsolicited advertising</li>
						<li>• Violates the privacy or rights of others</li>
						<li>• Contains malware or harmful code</li>
					</ul>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-bold text-white">
						4. Intellectual Property Rights
					</h2>
					<p className="text-slate-300 leading-relaxed">
						You retain all rights to your original content. By publishing on New
						Gen, you grant us a non-exclusive, royalty-free license to display,
						distribute, and promote your content on our platform. You are
						responsible for ensuring you have the right to publish any content
						you submit.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-bold text-white">
						5. Limitation of Liability
					</h2>
					<p className="text-slate-300 leading-relaxed">
						New Gen shall not be held liable for any damages, including
						indirect, incidental, special, consequential or punitive damages,
						resulting from your use of or inability to use the service or any
						content linked to the service or the materials contained on the
						website, whether based on warranty, contract, tort or any other
						legal theory.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-bold text-white">6. Termination</h2>
					<p className="text-slate-300 leading-relaxed">
						We reserve the right to terminate or suspend your account and access
						to the service at our sole discretion, without notice, for conduct
						that we believe violates these Terms of Service or is otherwise
						harmful to the interests of New Gen or other users.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-bold text-white">7. Changes to Terms</h2>
					<p className="text-slate-300 leading-relaxed">
						We reserve the right to modify these Terms of Service at any time.
						Your continued use of New Gen following the posting of revised Terms
						of Service means that you accept and agree to the changes.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-bold text-white">8. Governing Law</h2>
					<p className="text-slate-300 leading-relaxed">
						These terms and conditions are governed by and construed in
						accordance with applicable laws, and you irrevocably submit to the
						exclusive jurisdiction of the courts located in our jurisdiction.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-bold text-white">9. Contact Us</h2>
					<p className="text-slate-300 leading-relaxed">
						If you have any questions about these Terms of Service, please{' '}
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

export default TermsOfServicePage;
