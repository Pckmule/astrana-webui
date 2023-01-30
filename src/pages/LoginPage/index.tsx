import React, { useEffect, useState } from 'react';

import { useAppSelector, useAppDispatch } from './../../app/hooks';
import { setAuthToken, clearAuthToken, selectAuthToken} from './../../features/session/sessionSlice';

import { IApplicationSettings } from './../../types/objects/applicationSettings';
import { IUserInfo } from '../../types/interfaces/user';

import TranslationService from '../../services/TranslationService';
import UserService from '../../services/UserService';
import AuthenticationService from "./../../services/AuthenticationService";

import { Header } from './../../components/Header';

import './loginpage.scss';

interface LoginPageProps {
  settings: IApplicationSettings;
  user: IUserInfo;
}

export interface ILoginPageState {
  username: string;
  password: string;
  rememberMe: boolean;
}

export function LoginPage({ settings, user }: LoginPageProps)
{
    const [translations, setTranslations] = React.useState<any>({ __loading: true });

    const [currentUserSettings, setCurrentUserSettings] = React.useState<any>({
      languageCode: "zh"
    });
  
    const authToken = useAppSelector(selectAuthToken);
    const dispatch = useAppDispatch();
    const [incrementAmount, setIncrementAmount] = useState('test');

    const intialState = { 
        username: "",
        password: "",
        rememberMe: false
    };
    
    const [state, setState] = React.useState<ILoginPageState>(intialState);
    const [signInStatus, setSignInStatus] = React.useState<string>("");

    const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        state.username = event.target.value;
        setState(state);
    };
    
    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      state.password = event.target.value;
      setState(state);
    };
  
    const handleRememberMeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      state.rememberMe = event.target.checked;
      setState(state);
    };

    async function handleLogin() 
    {
        const username = state.username;
        const password = state.password;
        const rememberMe = state.rememberMe;

        setSignInStatus("working");

        await AuthenticationService().authenticate(username, password).then((response: any) => {
          
            setSignInStatus("");
            dispatch(setAuthToken(response));

        }).catch((err: Error) => 
        {
            setSignInStatus("");
        });
    }

    const trxService = TranslationService();
    const userService = UserService();
    
    const loadInitialData = async () => 
    {
        setCurrentUserSettings({
            languageCode: navigator.language
        });
        
        setTranslations(await trxService.getTranslations(currentUserSettings.languageCode));
    };

    useEffect(() => {
      loadInitialData();
    }, []);

    const isPageReady = translations.__loading ? "loading" : "ready";
    const displayMode = !isPageReady ? "skeleton" : "normal";

    return(
      <React.Fragment>
        <Header displayMode={displayMode} user={user} />
    
        <div className="container-fluid page-content">
          <div className="row g-0">
            <div className="main-content col-12 col-sm-12 col-md-10 col-lg-6 col-xl-4 offset-1 offset-sm-2 offset-md-1 offset-lg-3 offset-xl-4">
              <main>
                <form className="login-form">
                  
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">Username</label>
                    <input type="text" className="form-control" id="username" aria-describedby="emailHelp" value={state.username} onChange={handleUsernameChange} />
                    <div id="emailHelp" className="form-text">We'll never share your username with anyone else.</div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input type="password" className="form-control" id="password" value={state.password} onChange={handlePasswordChange} />
                  </div>
                  
                  <div className="mb-3 form-check">
                    <input type="checkbox" className="form-check-input" id="rememberMe" checked={state.rememberMe} onChange={handleRememberMeChange} />
                    <label className="form-check-label" htmlFor="rememberMe">Remember Me</label>
                  </div>
                  
                  <button type="button" className="btn btn-primary" onClick={() => { handleLogin(); }}>Login</button>

                  <p>{signInStatus}</p>
                  
                </form>
              </main>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
};
