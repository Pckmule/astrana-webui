import React from 'react';
import _ from 'lodash';

import { LoginPage } from "./../src/pages/LoginPage";
import { SetupPage } from './../src/pages/SetupPage';
import { HomePage } from "./../src/pages/HomePage";
import { PinBoardPage } from "./../src/pages/PinBoardPage";
import { NewsReaderPage } from "./../src/pages/NewsReaderPage";
import { ProfilePage } from "./pages/ProfilePage";
import { MediaPage } from "./pages/MediaPage";
import { MediaSetPage } from './pages/MediaSetPage';
import { SettingsPage } from "./pages/SettingsPage";
import { NotificationsPage } from "./pages/NotificationsPage";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';

import { useSelector } from 'react-redux';
import { RootState } from './app/store';

import { useAppSelector, useAppDispatch } from './app/hooks';
import { setAuthToken, clearAuthToken, selectAuthToken} from './features/session/sessionSlice';

import "./App.css";
import "./layout.scss";
import 'react-toastify/dist/ReactToastify.css';

function App() 
{
	const authToken = useSelector((state: RootState) => state.session.apiAuthorizationToken);

	console.dir(authToken);

	function getAuth() 
	{
		return !_.isEmpty(authToken) && _.isString(authToken); 
	}
	
	interface IRequireAuth {
		children: any;
		redirectTo: string;
	}

	function RequireAuth({ children, redirectTo } : IRequireAuth) 
	{
		let isAuthenticated = getAuth();
		return isAuthenticated ? children : <Navigate to={redirectTo} />;
	}
	
	return (
		<React.Fragment>
			<div className="App">
				<BrowserRouter basename="/">				
					<Routes>
						<Route path="/" element={
							<RequireAuth redirectTo="/login">
								<HomePage />
							</RequireAuth>
						}></Route>

						<Route path="/pinboards" element={
							<RequireAuth redirectTo="/login">
								<PinBoardPage />
							</RequireAuth>
						}></Route>

						<Route path="/newsfeed" element={
							<RequireAuth redirectTo="/login">
								<NewsReaderPage />
							</RequireAuth>
						}></Route>

						<Route path="/profile" element={
							<RequireAuth redirectTo="/login">
								<ProfilePage />
							</RequireAuth>
						}></Route>

						<Route path="/profile/:id" element={
							<RequireAuth redirectTo="/login">
								<ProfilePage />
							</RequireAuth>
						}></Route>

						<Route path="/profile/:id/posts" element={
							<RequireAuth redirectTo="/login">
								<ProfilePage />
							</RequireAuth>
						}></Route>

						<Route path="/profile/:id/about" element={
							<RequireAuth redirectTo="/login">
								<ProfilePage />
							</RequireAuth>
						}></Route>

						<Route path="/profile/about" element={
							<RequireAuth redirectTo="/login">
								<ProfilePage />
							</RequireAuth>
						}></Route>

						<Route path="/profile/:id/peers" element={
							<RequireAuth redirectTo="/login">
								<ProfilePage />
							</RequireAuth>
						}></Route>

						<Route path="/profile/peers" element={
							<RequireAuth redirectTo="/login">
								<ProfilePage />
							</RequireAuth>
						}></Route>

						<Route path="/profile/peers/requests" element={
							<RequireAuth redirectTo="/login">
								<ProfilePage />
							</RequireAuth>
						}></Route>

						<Route path="/profile/:id/peers-requests" element={
							<RequireAuth redirectTo="/login">
								<ProfilePage />
							</RequireAuth>
						}></Route>

						<Route path="/profile/:id/photos" element={
							<RequireAuth redirectTo="/login">
								<ProfilePage />
							</RequireAuth>
						}></Route>
						
						<Route path="/profile/photos" element={
							<RequireAuth redirectTo="/login">
								<ProfilePage />
							</RequireAuth>
						}></Route>

						<Route path="/profile/photos_albums" element={
							<RequireAuth redirectTo="/login">
								<ProfilePage />
							</RequireAuth>
						}></Route>

						<Route path="/profile/:id/photos_albums" element={
							<RequireAuth redirectTo="/login">
								<ProfilePage />
							</RequireAuth>
						}></Route>
						
						<Route path="/profile/:id/videos" element={
							<RequireAuth redirectTo="/login">
								<ProfilePage />
							</RequireAuth>
						}></Route>

						<Route path="/profile/videos_albums" element={
							<RequireAuth redirectTo="/login">
								<ProfilePage />
							</RequireAuth>
						}></Route>

						<Route path="/profile/:id/videos_albums" element={
							<RequireAuth redirectTo="/login">
								<ProfilePage />
							</RequireAuth>
						}></Route>

						<Route path="/profile/albums/:albumid" element={
							<RequireAuth redirectTo="/login">
								<ProfilePage />
							</RequireAuth>
						}></Route>

						<Route path="/profile/:id/albums/:albumid" element={
							<RequireAuth redirectTo="/login">
								<ProfilePage />
							</RequireAuth>
						}></Route>

						<Route path="/photo/:id" element={
							<RequireAuth redirectTo="/login">
								<MediaPage />
							</RequireAuth>
						}></Route>

						<Route path="/video/:id" element={
							<RequireAuth redirectTo="/login">
								<MediaPage />
							</RequireAuth>
						}></Route>

						<Route path="/media/set" element={
							<RequireAuth redirectTo="/login">
								<MediaSetPage />
							</RequireAuth>
						}></Route>

						<Route path="/media/set/:id" element={
							<RequireAuth redirectTo="/login">
								<MediaSetPage />
							</RequireAuth>
						}></Route>

						<Route path="/media/set/create" element={
							<RequireAuth redirectTo="/login">
								<MediaSetPage />
							</RequireAuth>
						}></Route>

						<Route path="/connect/requests" element={
							<RequireAuth redirectTo="/login">
								<ProfilePage />
							</RequireAuth>
						}></Route>

						<Route path="/settings" element={
							<RequireAuth redirectTo="/login">
								<SettingsPage />
							</RequireAuth>
						}></Route>
						
						<Route path="/settings/:category" element={
							<RequireAuth redirectTo="/login">
								<SettingsPage />
							</RequireAuth>
						}></Route>

						<Route path="/notifications" element={
							<RequireAuth redirectTo="/login">
								<NotificationsPage />
							</RequireAuth>
						}></Route>
						
						<Route path="/notifications/:id" element={
							<RequireAuth redirectTo="/login">
								<NotificationsPage />
							</RequireAuth>
						}></Route>

						<Route path="/setup"element={<SetupPage />}></Route>
						<Route path="/login" element={<LoginPage />}></Route>
					</Routes>
				</BrowserRouter>
			</div>
			<ToastContainer />
		</React.Fragment>
	);
}

export default App;