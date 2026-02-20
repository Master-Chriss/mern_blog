import { useContext, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { formatISO9075 } from 'date-fns';
import { UserContext } from '../UserContext';
import { FaEdit, FaChevronLeft, FaTrashAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import DOMPurify from 'dompurify';

const PostPage = () => {
	const [postInfo, setPostInfo] = useState(null);
	const [showModal, setShowModal] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);

	const { userInfo } = useContext(UserContext);
	const { id } = useParams();
	const navigate = useNavigate();

	// Fixed permission logic
	const isAdmin = userInfo?.role === 'admin';
	const isActualAuthor = userInfo?.id === postInfo?.author?._id;
	const canEdit = isActualAuthor || isAdmin;
	const canDelete = isAdmin;

	useEffect(() => {
		fetch(`http://localhost:4000/post/${id}`).then((response) => {
			response.json().then((info) => setPostInfo(info));
		});
	}, [id]);

	const confirmDelete = async () => {
		setIsDeleting(true);
		try {
			const response = await fetch(`http://localhost:4000/post/${id}`, {
				method: 'DELETE',
				credentials: 'include',
			});
			if (response.ok) {
				setIsSuccess(true);
				toast.success('Story Deleted');
				setTimeout(() => navigate('/'), 1500);
			} else {
				toast.error('Delete failed');
				setIsDeleting(false);
			}
		} catch (e) {
			toast.error('Server error');
			setIsDeleting(false);
		}
	};

	if (!postInfo)
		return <div className="text-center p-20 text-white">Loading...</div>;

	const cleanHTML = postInfo.content
		? DOMPurify.sanitize(postInfo.content)
		: '';
	const coverUrl = postInfo?.cover
		? postInfo.cover.startsWith('http')
			? postInfo.cover
			: `http://localhost:4000/${postInfo.cover.replace(/\\/g, '/')}`
		: '';

	return (
		<article className="max-w-6xl mx-auto py-8 animate-in fade-in duration-1000 px-4">
			{showModal && (
				<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
					<div className="bg-[#1a1b4b] border border-white/10 p-8 rounded-[2.5rem] max-w-sm w-full shadow-2xl overflow-hidden relative">
						{isSuccess && (
							<div className="absolute inset-0 bg-cyan-500 flex flex-col items-center justify-center z-10 animate-in fade-in duration-300">
								<div className="w-16 h-16 bg-white rounded-full flex items-center justify-center animate-bounce">
									<svg
										className="w-8 h-8 text-cyan-500"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										strokeWidth={3}>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="m4.5 12.75 6 6 9-13.5"
										/>
									</svg>
								</div>
								<p className="text-white font-black mt-4 uppercase tracking-widest">
									Deleted
								</p>
							</div>
						)}
						<h2 className="text-2xl font-black text-white text-center mb-6">
							Are you sure?
						</h2>
						<div className="flex gap-3">
							<button
								disabled={isDeleting}
								onClick={() => setShowModal(false)}
								className="flex-1 py-3 text-white font-bold bg-white/5 rounded-xl hover:bg-white/10 transition-all">
								Cancel
							</button>
							<button
								disabled={isDeleting}
								onClick={confirmDelete}
								className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl flex items-center justify-center hover:bg-red-700 transition-all">
								{isDeleting ? (
									<div className="w-5 h-5 border-2 border-t-transparent animate-spin rounded-full" />
								) : (
									'Delete'
								)}
							</button>
						</div>
					</div>
				</div>
			)}

			<Link
				to="/"
				className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-8 transition-colors text-sm">
				<FaChevronLeft size={12} /> Back to stories
			</Link>

			<header className="mb-10">
				<h1 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight leading-tight">
					{postInfo.title}
				</h1>

				<div className="flex flex-wrap items-center justify-between gap-4 py-6 border-y border-white/10">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 shadow-lg" />
						<div>
							<p className="text-white font-bold leading-none">
								@{postInfo?.author?.username || 'Anonymous'}
							</p>
							<time className="text-xs text-slate-500">
								{formatISO9075(new Date(postInfo.createdAt))}
							</time>
						</div>
					</div>

					<div className="flex items-center gap-6">
						{/* Edit - available to actual post author OR admin */}
						{canEdit && (
							<Link
								to={`/edit/${postInfo._id}`}
								className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-cyan-500 hover:border-cyan-400 transition-all shadow-lg">
								<FaEdit size={16} />
								<span className="font-semibold text-sm">Edit Story</span>
							</Link>
						)}

						{/* Delete - admin only */}
						{canDelete && (
							<button
								onClick={() => setShowModal(true)}
								className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors py-2">
								<FaTrashAlt size={14} />
								<span className="font-semibold text-sm tracking-wider">
									Delete Story
								</span>
							</button>
						)}
					</div>
				</div>
			</header>

			<div className="rounded-[2.5rem] overflow-hidden bg-white/5 border border-white/10 shadow-2xl backdrop-blur-2xl">
				<div className="h-[400px] md:h-[500px] w-full relative">
					{coverUrl ? (
						<img
							src={coverUrl}
							className="w-full h-full object-cover"
							alt={postInfo.title}
						/>
					) : (
						<div className="w-full h-full bg-slate-800/60" />
					)}
					<div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] to-transparent" />
				</div>

				<div className="p-8 md:p-16">
					<div
						className="post-content prose prose-invert prose-cyan max-w-none text-slate-300 text-lg leading-relaxed"
						dangerouslySetInnerHTML={{ __html: cleanHTML }}
					/>
				</div>
			</div>
		</article>
	);
};

export default PostPage;
