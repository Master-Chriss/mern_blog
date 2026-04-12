import './DataSpinner.css';

const DataSpinner = () => {
	return (
		<>
			<div
				className="dataSpinner"
				role="status"
				aria-label="Loading content"
				aria-live="polite"></div>
		</>
	);
};

export default DataSpinner;
