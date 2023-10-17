import React from 'react';
import _ from 'lodash';

import { DisplayMode } from '../../types/enums/displayMode';
import { ReadyStatus } from '../../types/enums/readyStatus';
import { AuthenticationStatus } from '../../types/enums/authenticationStatus';

import { useNavigate	} from 'react-router-dom'

import SettingsService from './../../services/SettingsService';
import TranslationService from './../../services/TranslationService';
import AuthenticationService from './../../services/AuthenticationService';

import { Header } from './../../components/Header';

import './LoginPage.scss';

export function LoginPage()
{
	const [loadStatus, setLoadStatus] = React.useState<ReadyStatus>(ReadyStatus.Ready);
	const [preloadCount, setPreloadCount] = React.useState(0);

	const countPreloadCompletionAsync = () => setPreloadCount((preloadCount) => preloadCount + 1);

	const [translations, setTranslations] = React.useState<any>({ __loading: true });

	const [username, setUsername] = React.useState<string>("");
	const [password, setPassword] = React.useState<string>("");
	const [rememberMe, setRememberMe] = React.useState<boolean>(false);

	const [authenticationStatus, setAuthenticationStatus] = React.useState<AuthenticationStatus>(AuthenticationStatus.Unauthenticated);

	const settingsService = SettingsService();
	const trxService = TranslationService();
	const authenticationService = AuthenticationService();
	
	const hasInitialDataLoaded = () => 
	{
		return (loadStatus !== ReadyStatus.Loaded && preloadCount === 1);
	}

	const loadInitialData = async () => 
	{
		setLoadStatus(ReadyStatus.Loading);

		await trxService.getTranslations(settingsService.defaults.languageCode).then((trx: any | undefined) => 
		{
			setTranslations(trx);
			countPreloadCompletionAsync();

		}).catch((error: Error) => { console.log(error); });
	};

	const isPageReady = () => 
	{
		return loadStatus === ReadyStatus.Loaded;
	}
	
	if(hasInitialDataLoaded()) { setLoadStatus(ReadyStatus.Loaded); }
  
	if(loadStatus === ReadyStatus.Ready)
	{
		loadInitialData();
	}

	const navigate = useNavigate();

	const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setUsername(event.target.value);
	};
	
	const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setPassword(event.target.value);
	};
	
	const handleRememberMeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRememberMe(event.target.checked);
	};
	
	async function handleLogin() 
	{
		setAuthenticationStatus(AuthenticationStatus.Authenticating);

		await authenticationService.login(username, password, rememberMe).catch((error: Error) => { console.dir(error); });
	}

	const displayMode = !isPageReady() ? DisplayMode.Stencil : DisplayMode.Normal;

	return(
		<React.Fragment>
			<Header displayMode={displayMode} translations={translations} user={{}} />
		
			<div className="container-fluid page-content">
				<div className="row g-0">
					<div className="main-content col-12 col-sm-12 col-md-10 col-lg-6 col-xl-4 offset-1 offset-sm-2 offset-md-1 offset-lg-3 offset-xl-4">
						<main>
							<form className="login-form">
								
								<div className="mb-3">
									<label htmlFor="username" className="form-label">{trxService.trx(translations, "username")}</label>
									<input type="text" className="form-control" id="username" aria-describedby="emailHelp" defaultValue={username} onChange={handleUsernameChange} />
									<div id="emailHelp" className="form-text">{trxService.trx(translations, "login_page_username_help")}</div>
								</div>

								<div className="mb-3">
									<label htmlFor="password" className="form-label">{trxService.trx(translations, "password")}</label>
									<input type="password" className="form-control" id="password" defaultValue={password} onChange={handlePasswordChange} />
								</div>
								
								<div className="mb-3 form-check">
									<input type="checkbox" className="form-check-input" id="rememberMe" checked={rememberMe} onChange={handleRememberMeChange} />
									<label className="form-check-label" htmlFor="rememberMe">{trxService.trx(translations, "remember_me")}</label>
								</div>
								
								<button type="button" className="btn btn-primary" onClick={() => { handleLogin(); }}>{trxService.trx(translations, "login")}</button>

								<p>{authenticationStatus}</p>						
							</form>
						</main>
					</div>
				</div>
			</div>
		</React.Fragment>
	);
};
