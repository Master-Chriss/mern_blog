import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './Header';
import Footer from './components/Footer';

const Layout = () => {
	return (
		<main>
			<Toaster
				position="top-right"
				reverseOrder={false}
				gutter={8}
				toastOptions={{
					duration: 4000,
					style: {
						background: '#1e293b',
						color: '#e2e8f0',
						border: '1px solid #334155',
						borderRadius: '12px',
						boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
					},
					success: {
						style: {
							background: '#065f46',
							borderColor: '#10b981',
						},
						icon: '✅',
					},
					error: {
						style: {
							background: '#7f1d1d',
							borderColor: '#ef4444',
						},
						icon: '❌',
					},
				}}
			/>
			<Header />
			<Outlet />
			<Footer />
		</main>
	);
};

export default Layout;
