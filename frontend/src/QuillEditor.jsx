import { useEffect, useRef } from 'react';
const QuillEditor = ({ value, onChange }) => {
	const editorRef = useRef(null);
	const quillRef = useRef(null);

	const handleImageUpload = async () => {
		const input = document.createElement('input');
		input.setAttribute('type', 'file');
		input.setAttribute('accept', 'image/*');
		input.click();

		input.onchange = async () => {
			const file = input.files[0];
			if (!file) return;

			const formData = new FormData();
			formData.append('file', file);

			try {
				// Upload to backend's multer+cloudinary middleware
				const response = await fetch(
					`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/admin/upload-temp`,
					{
						method: 'POST',
						body: formData,
						credentials: 'include',
					},
				);

				if (response.ok) {
					const data = await response.json();
					const imageUrl = data.secure_url || data.url;

					// Insert the image URL into Quill (not base64)
					const range = quillRef.current.getSelection();
					if (range) {
						quillRef.current.insertEmbed(
							range.index,
							'image',
							imageUrl,
							'user',
						);
						quillRef.current.setSelection(range.index + 1);
					}
				} else {
					alert('Image upload failed');
				}
			} catch (error) {
				console.error('Image upload error:', error);
				alert('Error uploading image');
			}
		};
	};

	useEffect(() => {
		const applyToolbarTitles = (toolbarEl) => {
			if (!toolbarEl) return;

			const titleMap = {
				'.ql-header': 'Heading size',
				'.ql-bold': 'Bold',
				'.ql-italic': 'Italic',
				'.ql-underline': 'Underline',
				'.ql-strike': 'Strikethrough',
				'.ql-color': 'Text color',
				'.ql-background': 'Background color',
				'.ql-list[value="ordered"]': 'Numbered list',
				'.ql-list[value="bullet"]': 'Bullet list',
				'.ql-link': 'Insert link',
				'.ql-image': 'Insert image',
				'.ql-video': 'Insert video',
				'.ql-code-block': 'Code block',
				'.ql-clean': 'Clear formatting',
			};

			Object.entries(titleMap).forEach(([selector, title]) => {
				const element = toolbarEl.querySelector(selector);
				if (element) {
					element.setAttribute('title', title);
					element.setAttribute('aria-label', title);
				}
			});
		};

		// Load Quill CSS
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = 'https://cdn.quilljs.com/1.3.6/quill.snow.css';
		document.head.appendChild(link);

		// Add custom dark theme styles
		const style = document.createElement('style');
		style.textContent = `
      .ql-toolbar {
        background: #1e293b !important;
        border-color: #334155 !important;
        border-radius: 12px 12px 0 0 !important;
      }
      
      .ql-container {
        background: #0f172a !important;
        border-color: #334155 !important;
        border-radius: 0 0 12px 12px !important;
        font-size: 16px !important;
      }
      
	      .ql-editor {
	        color: #e2e8f0 !important;
	        min-height: 350px;
	      }

	      .ql-editor img,
	      .ql-editor video,
	      .ql-editor iframe {
	        display: block;
	        width: min(100%, 720px) !important;
	        max-width: 100%;
	        margin: 1rem auto;
	        border-radius: 12px;
	      }

	      .ql-editor img,
	      .ql-editor video {
	        max-height: 420px;
	        height: auto !important;
	        object-fit: contain;
	      }

	      .ql-editor iframe {
	        aspect-ratio: 16 / 9;
	        max-height: 420px;
	        height: auto !important;
	      }
      
      .ql-editor.ql-blank::before {
        color: #64748b !important;
        font-style: normal !important;
      }
      
      /* Toolbar icons and text */
      .ql-picker-label, 
      .ql-picker,
      .ql-stroke {
        color: #cbd5e1 !important;
        stroke: #cbd5e1 !important;
      }
      
      .ql-fill {
        fill: #cbd5e1 !important;
      }
      
      .ql-picker-options {
        background: #1e293b !important;
        border-color: #334155 !important;
      }
      
      .ql-active .ql-stroke {
        stroke: #22d3ee !important;
      }
      
      .ql-active .ql-fill {
        fill: #22d3ee !important;
      }
      
      .ql-picker-item:hover {
        color: #22d3ee !important;
      }
      
      button:hover .ql-stroke {
        stroke: #22d3ee !important;
      }
      
      button:hover .ql-fill {
        fill: #22d3ee !important;
      }
    `;
		document.head.appendChild(style);

		// Load Quill JS
		const script = document.createElement('script');
		script.src = 'https://cdn.quilljs.com/1.3.6/quill.js';
		script.onload = () => {
			if (editorRef.current && !quillRef.current) {
				quillRef.current = new window.Quill(editorRef.current, {
					theme: 'snow',
					modules: {
						toolbar: {
							container: [
								[{ header: [1, 2, 3, 4, 5, 6, false] }],
								['bold', 'italic', 'underline', 'strike'],
								[{ color: [] }, { background: [] }],
								[{ list: 'ordered' }, { list: 'bullet' }],
								['link', 'image', 'video', 'code-block'],
								['clean'],
							],
							handlers: {
								image: handleImageUpload,
							},
						},
					},
				});

				applyToolbarTitles(quillRef.current.getModule('toolbar')?.container);

				if (value) {
					quillRef.current.root.innerHTML = value;
				}

				quillRef.current.on('text-change', () => {
					onChange(quillRef.current.root.innerHTML);
				});
			}
		};
		document.body.appendChild(script);

		return () => {
			if (document.head.contains(link)) document.head.removeChild(link);
			if (document.head.contains(style)) document.head.removeChild(style);
			if (document.body.contains(script)) document.body.removeChild(script);
		};
	}, []);

	useEffect(() => {
		if (quillRef.current && value !== quillRef.current.root.innerHTML) {
			quillRef.current.root.innerHTML = value;
		}
	}, [value]);

	return (
		<div className="rounded-xl overflow-hidden shadow-2xl">
			<div ref={editorRef} style={{ minHeight: '400px' }} />
		</div>
	);
};

export default QuillEditor;
