import { Route, Routes, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from './UserContext';
import { UserContextProvider } from './UserContext';
import DataSpinner from './assets/dataSpinner/DataSpinner';

// Page Imports
import HomePage from './pages/HomePage';
import Layout from './Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CreatePost from './pages/CreatePost';
import PostPage from './pages/PostPage';
import EditPage from './pages/EditPage';
import AdminDashboard from './pages/AdminDashboard';
import AuthorDashboard from './pages/AuthorDashboard';
import ArchivePage from './pages/ArchivePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';

import MyArticles from './pages/MyArticles';
import Inbox from './pages/Inbox';
import Analytics from './pages/Analytics';
import PostPlan from './pages/PostPlan';
import Earnings from './pages/Earnings';
import Settings from './pages/Settings';

/**
 * AppRoutes Component
 * This component is separate so it can sit INSIDE the UserContextProvider.
 * This allows us to use 'useContext' to access the global user state.
 */
const AppRoutes = () => {
	// Access userInfo (user data) and ready (is the fetch finished?) from Context
	const { userInfo, ready } = useContext(UserContext);

	// Prevent the app from redirecting while it is still checking the user's login status
	if (!ready) {
		return (
			<div
				className="flex items-center justify-center min-h-screen bg-slate-900"
				role="alert"
				aria-label="Loading user session">
				<DataSpinner />
			</div>
		);
	}

	return (
		<Routes>
			{/* Layout wraps all child routes with common elements like the Header */}
			<Route path="/" element={<Layout />}>
				<Route index element={<HomePage />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/register" element={<RegisterPage />} />

				{/* Protected Route: Redirects to login if user is not authenticated */}
				<Route
					path="/create"
					element={
						userInfo?.role !== 'reader' ? (
							<CreatePost />
						) : (
							<Navigate to="/login" />
						)
					}
				/>

				<Route path="/post/:id" element={<PostPage />} />
				<Route path="/:type(category|tag)/:slug" element={<ArchivePage />} />
				<Route path="/edit/:id" element={<EditPage />} />
				<Route
					path="/author"
					element={
						userInfo?.role === 'author' ? (
							<AuthorDashboard />
						) : (
							<Navigate to="/" />
						)
					}
				/>
				<Route
					path="/admin"
					element={
						userInfo?.role === 'admin' ? (
							<AdminDashboard />
						) : (
							<Navigate to="/" />
						)
					}
				/>
				<Route path="/admin/articles" element={userInfo?.role === 'admin' ? <MyArticles /> : <Navigate to="/" />} />
				<Route path="/admin/inbox" element={userInfo?.role === 'admin' ? <Inbox /> : <Navigate to="/" />} />
				<Route path="/admin/analytics" element={userInfo?.role === 'admin' ? <Analytics /> : <Navigate to="/" />} />
				<Route path="/admin/plan" element={userInfo?.role === 'admin' ? <PostPlan /> : <Navigate to="/" />} />
				<Route path="/admin/earnings" element={userInfo?.role === 'admin' ? <Earnings /> : <Navigate to="/" />} />
				<Route path="/admin/settings" element={userInfo?.role === 'admin' ? <Settings /> : <Navigate to="/" />} />

				<Route path="/about" element={<AboutPage />} />
				<Route path="/contact" element={<ContactPage />} />
				<Route path="/privacy" element={<PrivacyPolicyPage />} />
				<Route path="/terms" element={<TermsOfServicePage />} />
			</Route>
		</Routes>
	);
};

/**
 * Main App Component
 * Its primary job is to wrap the entire application in the Context Provider.
 * This makes the user data available to every component in the tree.
 */
const App = () => {
	return (
		<UserContextProvider>
			<AppRoutes />
		</UserContextProvider>
	);
};

export default App;
