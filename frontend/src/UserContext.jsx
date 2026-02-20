import { createContext, useEffect, useState } from 'react';

// 1. Create the Context object
export const UserContext = createContext({});

// 2. Define the Provider component
export function UserContextProvider({ children }) {
	const [userInfo, setUserInfo] = useState(null);
	const [ready, setReady] = useState(false); // Tracks if the profile fetch is finished

	useEffect(() => {
		// This runs once when the app starts or the page is refreshed
		fetch('http://localhost:4000/auth/profile', {
			credentials: 'include', // Crucial: Sends the JWT cookie to the backend
		})
			.then((response) => {
				if (response.ok) {
					return response.json();
				}
				throw new Error('Not logged in');
			})
			.then((info) => {
				setUserInfo(info);
				setReady(true);
			})
			.catch(() => {
				// Even if the user isn't logged in, we are "ready" to show the UI
				setUserInfo(null);
				setReady(true);
			});
	}, []);

	// 3. Provide the state and the setter to the rest of the app
	return (
		<UserContext.Provider value={{ userInfo, setUserInfo, ready }}>
			{children}
		</UserContext.Provider>
	);
}

// Default export makes it easy to import in App.jsx
export default UserContextProvider;
