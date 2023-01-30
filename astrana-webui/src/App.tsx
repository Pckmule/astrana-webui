import "./App.css";
import "./layout.scss";

import React from "react";
import _ from 'lodash';

import { IApplicationCache } from "./types/objects/applicationCache";

import { IUserInfo } from "./types/interfaces/user";

import { LoginPage } from "./../src/pages/LoginPage";
import { SetupPage } from './../src/pages/SetupPage';
import { HomePage } from "./../src/pages/HomePage";
import { PinBoardPage } from "./../src/pages/PinBoardPage";
import { NewsReaderPage } from "./../src/pages/NewsReaderPage";
import { ProfilePage } from "./pages/ProfilePage";

import { BrowserRouter, Routes, Route, Link, Navigate  } from "react-router-dom";

import { useAppSelector, useAppDispatch } from './app/hooks';
import { setAuthToken, clearAuthToken, selectAuthToken} from './features/session/sessionSlice';

function App() 
{
    const cache: IApplicationCache = { 
        lastModified: new Date(),
        items: []
    };

    const [state, setState] = React.useState({ 
        applicationSettings: {
            apiDomain: "https://localhost:44301/",
            peerInformation: null
        }
    });

    const userInfo: IUserInfo = {
        id: "12345",
        firstName: "Darin",
        fullName: "Darin Morris",
        gender: 1,
        profilePictureUrl: "/images/temp/profile-photo.jpg",
        profileCoverPicture: "/images/temp/cover-photo.jpg",
        description: "Aliquam at tellus pellentesque nunc porta sollicitudin. Suspendisse et purus et metus sagittis rutrum.",
        websiteUrl: "https://www.darinm.com"
    }
    
    function getAuth() 
    {
        const authToken = "ddd"; //useAppSelector(selectAuthToken);

        return !_.isEmpty(authToken) && _.isString(authToken); 
    }
    
    interface IRequireAuth {
        children: any;
        redirectTo: string;
    }

    function RequireAuth({ children, redirectTo } : IRequireAuth) {
      let isAuthenticated = getAuth();
      return isAuthenticated ? children : <Navigate to={redirectTo} />;
    }
    
    return (
        <div className="App">
            <BrowserRouter basename="/">                
                <Routes>
                    <Route path="/" element={
                        <RequireAuth redirectTo="/login">
                            <HomePage cache={cache} settings={state.applicationSettings} user={userInfo} />
                        </RequireAuth>
                    }></Route>

                    <Route path="/pinboards" element={
                        <RequireAuth redirectTo="/login">
                            <PinBoardPage settings={state.applicationSettings} user={userInfo} />
                        </RequireAuth>
                    }></Route>

                    <Route path="/newsfeed" element={
                        <RequireAuth redirectTo="/login">
                            <NewsReaderPage settings={state.applicationSettings} user={userInfo} />
                        </RequireAuth>
                    }></Route>

                    <Route path="/profile" element={
                        <RequireAuth redirectTo="/login">
                            <ProfilePage settings={state.applicationSettings} user={userInfo} />
                        </RequireAuth>
                    }></Route>

                    <Route path="/profile/:id" element={
                        <RequireAuth redirectTo="/login">
                            <ProfilePage settings={state.applicationSettings} user={userInfo} />
                        </RequireAuth>
                    }></Route>

                    <Route path="/profile/:id/posts" element={
                        <RequireAuth redirectTo="/login">
                            <ProfilePage settings={state.applicationSettings} user={userInfo} />
                        </RequireAuth>
                    }></Route>

                    <Route path="/profile/:id/about" element={
                        <RequireAuth redirectTo="/login">
                            <ProfilePage settings={state.applicationSettings} user={userInfo} />
                        </RequireAuth>
                    }></Route>

                    <Route path="/profile/about" element={
                        <RequireAuth redirectTo="/login">
                            <ProfilePage settings={state.applicationSettings} user={userInfo} />
                        </RequireAuth>
                    }></Route>

                    <Route path="/profile/:id/peers" element={
                        <RequireAuth redirectTo="/login">
                            <ProfilePage settings={state.applicationSettings} user={userInfo} />
                        </RequireAuth>
                    }></Route>

                    <Route path="/profile/peers" element={
                        <RequireAuth redirectTo="/login">
                            <ProfilePage settings={state.applicationSettings} user={userInfo} />
                        </RequireAuth>
                    }></Route>

                    <Route path="/profile/:id/photos" element={
                        <RequireAuth redirectTo="/login">
                            <ProfilePage settings={state.applicationSettings} user={userInfo} />
                        </RequireAuth>
                    }></Route>
                    
                    <Route path="/profile/photos" element={
                        <RequireAuth redirectTo="/login">
                            <ProfilePage settings={state.applicationSettings} user={userInfo} />
                        </RequireAuth>
                    }></Route>

                    <Route path="/profile/:id/videos" element={
                        <RequireAuth redirectTo="/login">
                            <ProfilePage settings={state.applicationSettings} user={userInfo} />
                        </RequireAuth>
                    }></Route>

                    <Route path="/profile/videos" element={
                        <RequireAuth redirectTo="/login">
                            <ProfilePage settings={state.applicationSettings} user={userInfo} />
                        </RequireAuth>
                    }></Route>
                    
                    <Route path="/setup"element={<SetupPage settings={state.applicationSettings} user={userInfo} />}></Route>
                    <Route path="/login" element={<LoginPage settings={state.applicationSettings} user={userInfo} />}></Route>
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;