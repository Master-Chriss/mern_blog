import SmallSpinner from '../assets/smallSpinner/SmallSpinner';

const toneStyles = {
	danger: {
		icon: 'bg-red-500/15 text-red-300 border-red-400/20',
		confirm:
			'bg-red-600 text-white hover:bg-red-500 disabled:bg-red-600/70',
	},
	warning: {
		icon: 'bg-amber-500/15 text-amber-300 border-amber-400/20',
		confirm:
			'bg-amber-500 text-slate-950 hover:bg-amber-400 disabled:bg-amber-500/70',
	},
	info: {
		icon: 'bg-cyan-500/15 text-cyan-300 border-cyan-400/20',
		confirm:
			'bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:bg-cyan-500/70',
	},
};

export default function ConfirmationDialog({
	open,
	title,
	message,
	confirmLabel = 'Confirm',
	cancelLabel = 'Cancel',
	onConfirm,
	onCancel,
	isSubmitting = false,
	tone = 'danger',
	eyebrow = 'Please Confirm',
}) {
	if (!open) return null;

	const styles = toneStyles[tone] || toneStyles.danger;

	return (
		<div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
			<div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-[#111936] p-6 shadow-2xl shadow-black/30">
				<div
					className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border ${styles.icon}`}>
					<span className="text-xl">!</span>
				</div>
				<p className="text-xs uppercase tracking-[0.3em] text-slate-500">
					{eyebrow}
				</p>
				<h2 className="mt-2 text-2xl font-black text-white">{title}</h2>
				<p className="mt-3 text-sm leading-7 text-slate-300">{message}</p>
				<div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
					<button
						type="button"
						onClick={onCancel}
						disabled={isSubmitting}
						className="rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50">
						{cancelLabel}
					</button>
					<button
						type="button"
						onClick={onConfirm}
						disabled={isSubmitting}
						className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed ${styles.confirm}`}>
						{isSubmitting ? (
							<>
								<SmallSpinner /> Processing...
							</>
						) : (
							confirmLabel
						)}
					</button>
				</div>
			</div>
		</div>
	);
}
