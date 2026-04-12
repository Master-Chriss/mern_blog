import { useState } from 'react';
import toast from 'react-hot-toast';
import SmallSpinner from '../assets/smallSpinner/SmallSpinner';

const ContactPage = () => {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		subject: '',
		message: '',
	});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (isSubmitting) return;

		if (
			!formData.name.trim() ||
			!formData.email.trim() ||
			!formData.subject.trim() ||
			!formData.message.trim()
		) {
			toast.error('Please fill in all fields');
			return;
		}

		setIsSubmitting(true);

		// Simulate email submission (in production, send to backend)
		setTimeout(() => {
			toast.success("Message sent successfully! We'll get back to you soon.");
			setFormData({ name: '', email: '', subject: '', message: '' });
			setIsSubmitting(false);
		}, 1500);
	};

	return (
		<div className="max-w-4xl mx-auto py-16 px-6 animate-in fade-in duration-1000">
			<div className="space-y-12">
				{/* Header */}
				<section className="text-center space-y-4">
					<h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
						Get in Touch
					</h1>
					<p className="text-xl text-slate-300 max-w-2xl mx-auto">
						Have questions or feedback? We'd love to hear from you. Send us a
						message and we'll respond as soon as possible.
					</p>
				</section>

				{/* Contact Form */}
				<section className="grid md:grid-cols-2 gap-12">
					{/* Form */}
					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<label className="block text-white font-semibold mb-2">
								Name
							</label>
							<input
								type="text"
								name="name"
								value={formData.name}
								onChange={handleChange}
								placeholder="Your name"
								className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
							/>
						</div>

						<div>
							<label className="block text-white font-semibold mb-2">
								Email
							</label>
							<input
								type="email"
								name="email"
								value={formData.email}
								onChange={handleChange}
								placeholder="your@email.com"
								className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
							/>
						</div>

						<div>
							<label className="block text-white font-semibold mb-2">
								Subject
							</label>
							<input
								type="text"
								name="subject"
								value={formData.subject}
								onChange={handleChange}
								placeholder="What's this about?"
								className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
							/>
						</div>

						<div>
							<label className="block text-white font-semibold mb-2">
								Message
							</label>
							<textarea
								name="message"
								value={formData.message}
								onChange={handleChange}
								placeholder="Your message..."
								rows="5"
								className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all resize-none"
							/>
						</div>

						<button
							type="submit"
							disabled={isSubmitting}
							aria-label={
								isSubmitting ? 'Sending message' : 'Send message button'
							}
							className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
							{isSubmitting ? (
								<>
									<SmallSpinner /> Sending...
								</>
							) : (
								'Send Message'
							)}
						</button>
					</form>

					{/* Info */}
					<div className="space-y-8">
						<div>
							<h3 className="text-xl font-bold text-cyan-400 mb-2">
								📍 Based In
							</h3>
							<p className="text-slate-300">Global Community</p>
						</div>

						<div>
							<h3 className="text-xl font-bold text-cyan-400 mb-2">
								🕐 Response Time
							</h3>
							<p className="text-slate-300">Usually within 24-48 hours</p>
						</div>

						<div>
							<h3 className="text-xl font-bold text-cyan-400 mb-2">
								💬 For Other Inquiries
							</h3>
							<p className="text-slate-300 mb-3">
								Business partnerships, sponsorships, or press inquiries
							</p>
							<p className="text-slate-400 text-sm">Email: hello@newgen.com</p>
						</div>

						<div className="p-6 rounded-xl bg-white/5 border border-white/10">
							<h3 className="text-lg font-bold text-white mb-3">Quick Links</h3>
							<ul className="space-y-2 text-slate-300">
								<li>
									<a
										href="/about"
										className="hover:text-cyan-400 transition-colors">
										→ About Us
									</a>
								</li>
								<li>
									<a
										href="/privacy"
										className="hover:text-cyan-400 transition-colors">
										→ Privacy Policy
									</a>
								</li>
								<li>
									<a
										href="/terms"
										className="hover:text-cyan-400 transition-colors">
										→ Terms of Service
									</a>
								</li>
							</ul>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
};

export default ContactPage;
