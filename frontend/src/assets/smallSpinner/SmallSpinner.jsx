import './SmallSpinner.css';

const SmallSpinner = () => {
	return (
		<div
			className="smallSpinner"
			role="status"
			aria-label="Processing"
			aria-live="polite"></div>
	);
};

export default SmallSpinner;
