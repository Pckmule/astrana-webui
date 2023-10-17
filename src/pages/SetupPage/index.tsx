import React from 'react'

import _ from 'lodash';
import moment from 'moment';
import 'moment-timezone';

import { ReadyStatus } from '../../types/enums/readyStatus';
import { DisplayMode } from '../../types/enums/displayMode';

import { InstallStatus } from '../../types/enums/installStatus';
import { SetupStep } from '../../types/enums/setupStatus';

import { phoneCodes, genders, defaultLanguage, defaultTimeZone } from '../../constants';
import { ILanguageData } from '../../types/objects/globalization';
import { ICountryData } from '../../types/data/country';
import { ILookupData } from '../../types/data/lookup';
import { IDatabaseSettings, IDatabaseConnectionTestSettings } from '../../types/interfaces/databaseSettings';

import SystemService from '../../services/SystemService';
import SettingsService from './../../services/SettingsService';
import TranslationService from './../../services/TranslationService';
import TextService from '../../services/TextService';
import ApiService from '../../services/ApiService';
import LookupService from '../../services/LookupService';

import { Link, useSearchParams } from "react-router-dom";
import { Header } from './../../components/Header';
import FormComboBox from '../../components/FormComboBox';
import { Icon } from '../../components/Icon';
import { FormDropdownBox, FormDropdownSortBy } from '../../components/FormDropdownBox';
import { LoadIndicator } from '../../components/LoadIndicator';
import { Fireworks } from '../../components/Fireworks';
import ReactMarkdown from 'react-markdown'

import './SetupPage.scss';

export interface ISetupConfiguration 
{
	languageCode: string;
	regionCode: string;
	timeZone: string;

	emailAddress: string;
	phoneCode: string;
	phoneNumber: string;

	username: string;
	password: string;
	confirmPassword: string;

	firstName: string;
	lastName: string;
	gender: string;
	dateOfBirth: string;
}

export interface ISetupPageState 
{
	languageCode: string,
	configuration: ISetupConfiguration;
}

const defaultPhoneCode = _.find(phoneCodes, (o) => { return o.value === "27" });

const minimumUsernameLength = 6;
const minimumPasswordLength = 8;

const today = moment().format("YYYY-MM-DD");

interface ISubmitResponseFailure
{
	itemId: string;
	message: string;
}

interface ISubmitResponse
{
	data: any | null | undefined;
	failures: ISubmitResponseFailure[] | null | undefined;
}

export function SetupPage() 
{
	const systemService = SystemService();
	const settingsService = SettingsService();
	const trxService = TranslationService();
	const textService = TextService();
	const lookupService = LookupService();
	
	const [searchParams] = useSearchParams();

	const getDisplayLanguageCode = () => 
	{
		let code = searchParams.get("lc");
		
		if(!code || _.isEmpty(code))
		{
			code = navigator.language + ""; 
		}
		
		if(!code || _.isEmpty(code))
		{
			code = settingsService.defaults.languageCode
		}
		
		if(!code || _.isEmpty(code))
		{
			code = defaultLanguage.code + ""
		}
	
		return code;	
	};

	const [loadStatus, setLoadStatus] = React.useState<ReadyStatus>(ReadyStatus.Ready);
	const [preloadCount, setPreloadCount] = React.useState(0);

	const countPreloadCompletionAsync = () => setPreloadCount((preloadCount) => preloadCount + 1);

	const [translations, setTranslations] = React.useState<any>({ __loading: true });
	
	const [setupStatus, setSetupStatus] = React.useState<string>("unknown");
	const [languages, setLanguages] = React.useState<ILanguageData[]>([]);	
	const [countries, setCountries] = React.useState<ICountryData[]>([]);
	
	const [languageCode, setLanguageCode] = React.useState<string>(getDisplayLanguageCode());
	const [licenseText, setLicenseText] = React.useState<string>("");
	
	const lookupInitialState = { label: "Loading", trxCode: "loading", options: []}; // Move out into central file
	const [databaseProviderLookup, setDatabaseProviderLookup] = React.useState<ILookupData>(lookupInitialState);
	const [genderLookup, setGenderLookup] = React.useState<ILookupData>(lookupInitialState);
	
	const [installStatus, setInstallStatus] = React.useState<InstallStatus>(InstallStatus.GatheringDetails);
	const [currentStep, setCurrentStep] = React.useState<SetupStep>(SetupStep.Language);
	const [progressPercentage, setProgressPercentage] = React.useState<number>(0);
	
	const [regionCode, setRegionCode] = React.useState<string>("");	
	const [timeZone, setTimeZone] = React.useState<string>(moment.tz(moment.tz.guess()).zoneAbbr() ?? defaultTimeZone);

	const [emailAddress, setEmailAddress] = React.useState<string>("");
	const [phoneCode, setPhoneCode] = React.useState<string>("");
	const [phoneNumber, setPhoneNumber] = React.useState<string>("");

	const [username, setUsername] = React.useState<string>("");
	const [password, setPassword] = React.useState<string>("");
	const [confirmPassword, setConfirmPassword] = React.useState<string>("");

	const [firstName, setFirstName] = React.useState<string>("");
	const [lastName, setLastName] = React.useState<string>("");
	const [gender, setGender] = React.useState<string>(genders[0].code);
	const [dateOfBirth, setDateOfBirth] = React.useState<string>("");

	const [currentDatabaseSettings, setCurrentDatabaseSettings] = React.useState<any>(false);

	const [databaseProvider, setDatabaseProvider] = React.useState<string>("");
	const [databaseHost, setDatabaseHost] = React.useState<string>("");
	const [databaseHostPort, setDatabaseHostPort] = React.useState<string>("");
	const [databaseUsername, setDatabaseUsername] = React.useState<string>("");
	const [databasePassword, setDatabasePassword] = React.useState<string>("");
	const [databaseName, setDatabaseName] = React.useState<string>("");

	const [databaseConnectionTestStatus, setDatabaseConnectionTestStatus] = React.useState<string>("complete");
	const [databaseConnectionTestResult, setDatabaseConnectionTestResult] = React.useState<boolean>(false);
		
	const [acceptedTerms, setAcceptedTerms] = React.useState<boolean>(false);

	const [submitResponse, setSubmitResponse] = React.useState<ISubmitResponse>({ data: {}, failures: [] });

	const hasInitialDataLoaded = () => 
	{
		return (loadStatus !== ReadyStatus.Loaded && preloadCount === 8);
	}

	const loadInitialData = async () => 
	{
		setLoadStatus(ReadyStatus.Loading);

		var displayLanguageCode = getDisplayLanguageCode();

		await trxService.getTranslations(displayLanguageCode).then((trx: any | undefined) => 
		{
			setTranslations(trx);
			countPreloadCompletionAsync();

		}).catch((error: Error) => { console.log(error); });

		await systemService.getLicense(displayLanguageCode).then((licenseText: string) => 
		{
			setLicenseText(licenseText);
			countPreloadCompletionAsync();
		
		}).catch((error: Error) => { console.log(error); });

		await systemService.getSetupStatus().then(async (status: string) => { 
			setSetupStatus(status); 
			countPreloadCompletionAsync();

			if(status.toLowerCase() === "complete")
			{
				countPreloadCompletionAsync();
			}
			else
			{
				await systemService.getSetupDatabaseSettings().then((databaseSettings: IDatabaseSettings) => 
				{ 
					setCurrentDatabaseSettings(databaseSettings);
		
					setDatabaseProvider(databaseSettings.databaseProvider);
					setDatabaseHost(databaseSettings.connectionString.hostAddress);
					setDatabaseHostPort(databaseSettings.connectionString.hostAddressPort);
					setDatabaseUsername(databaseSettings.connectionString.userId);
					setDatabasePassword(databaseSettings.connectionString.password);
					setDatabaseName(databaseSettings.connectionString.databaseName);
		
					countPreloadCompletionAsync();
		
				}).catch((error: Error) => { console.log(error); });
			}
		
		}).catch((error: Error) => { console.log(error); });
		
		await systemService.getLanguages().then((languages: ILanguageData[]) => { setLanguages(languages); setDocumentLanguage(); countPreloadCompletionAsync(); }).catch((error: Error) => { console.log(error); });

		await systemService.getCountries().then((countries: ICountryData[]) => { setCountries(countries);	countPreloadCompletionAsync(); }).catch((error: Error) => { console.log(error); });

		await lookupService.getLookup("Gender").then((lookup: ILookupData) => { setGenderLookup(lookup); countPreloadCompletionAsync(); }).catch((error: Error) => { console.log(error); });
		
		await lookupService.getLookup("DatabaseProvider").then((lookup: ILookupData) => { setDatabaseProviderLookup(lookup); countPreloadCompletionAsync(); }).catch((error: Error) => { console.log(error); });

		await settingsService.getAll().then(async (settings: any | undefined) => 
		{
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

	const databaseOverrideRequired = !currentDatabaseSettings || 
			_.isEmpty(currentDatabaseSettings.databaseProvider) || 
			_.isEmpty(currentDatabaseSettings.connectionString.hostAddress) || 
			_.isEmpty(currentDatabaseSettings.connectionString.hostAddressPort) || 
			_.isEmpty(currentDatabaseSettings.connectionString.userId) || 
			_.isEmpty(currentDatabaseSettings.connectionString.password) || 
			_.isEmpty(currentDatabaseSettings.connectionString.databaseName);
	
	const loadTrx = async (languageCode: string) => 
	{
		return await trxService.loadTranslations(languageCode).then((response: any | undefined) => 
		{					
			setTranslations(response);

		}).catch((error: Error) => { console.log(error); }); 
	}

	const setDocumentLanguage = () => 
	{
		const currentLanguage = getCurrentLanguage();

		if(currentLanguage && currentLanguage.twoLetterCode)
		{
			document.documentElement.lang = currentLanguage.twoLetterCode;
			document.documentElement.dir = textService.getTextDirection(currentLanguage.direction);
		}
	};

	const handleLanguageCodeChange = async function(event: React.ChangeEvent<HTMLSelectElement>)
	{
		setLanguageCode(event.target.value);
		
		setDocumentLanguage();
		loadTrx(event.target.value);
		
		await systemService.getLicense(event.target.value).then((licenseText: string) => 
		{
			setLicenseText(licenseText);

		}).catch((error: Error) => { console.log(error); });
	};
	
	const handleRegionCodeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		setRegionCode(event.target.value);
	};

	const handleTimeZoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setTimeZone(event.target.value);
	};

	const handleTermsAndConditionsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setAcceptedTerms(event.target.checked);
	};
	
	const handleDatabaseProviderChange = (event: React.ChangeEvent<HTMLSelectElement>) => {		
		setDatabaseProvider(event.target.value);
	};

	const getSelectedDatabaseProviderIcon = () => 
	{
		const matches = _.filter(databaseProviderLookup.options, (item) => { return item.value === defaultWhenEmpty(databaseProvider, currentDatabaseSettings.databaseProvider) });
		
		return matches.length > 0 ? matches[0].iconAddress : "";
	}
	
	const handleDatabaseHostChange = (event: React.ChangeEvent<HTMLInputElement>) => {		
		setDatabaseHost(event.target.value);
	};

	const handleDatabaseHostPortChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setDatabaseHostPort(event.target.value);
	};
	
	const handleDatabaseUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setDatabaseUsername(event.target.value);		
	};
	
	const handleDatabasePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setDatabasePassword(event.target.value);
	};
	
	const handleDatabaseNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setDatabaseName(event.target.value);
	};

	const testDatabaseConnection = () => 
	{
		setDatabaseConnectionTestStatus("working");

		const databaseSettings: IDatabaseConnectionTestSettings = {
			databaseProvider: defaultWhenEmpty(databaseProvider, currentDatabaseSettings.databaseProvider),
			databaseName: defaultWhenEmpty(databaseName, currentDatabaseSettings.databaseName),
			databaseHost: defaultWhenEmpty(databaseHost, currentDatabaseSettings.databaseHost),
			databaseHostPort: defaultWhenEmpty(databaseHostPort, currentDatabaseSettings.databaseHostPort),
			databaseUsername: defaultWhenEmpty(databaseUsername, currentDatabaseSettings.databaseUsername),
			databasePassword: defaultWhenEmpty(databasePassword, currentDatabaseSettings.databasePassword)
		}

		systemService.testDatabaseConnection(databaseSettings).then((response: any | undefined) => 
		{
			setTimeout(() => {
				setDatabaseConnectionTestResult(true);
				setDatabaseConnectionTestStatus("complete");
			}, 1000);
		})
		.catch((error: Error) => {
			console.log(error);

			setTimeout(() => {
				setDatabaseConnectionTestResult(false);
				setDatabaseConnectionTestStatus("complete");
			}, 1000);
		});
	};
	
	const handleEmailAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setEmailAddress(event.target.value);
	};
	
	const handlePhoneCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setPhoneCode(event.target.value);
	};

	const handlePhoneCodeSelect = (value: string) => {
		setPhoneCode(value);
	};

	const handlePhoneNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setPhoneNumber(event.target.value);
	};

	const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setUsername(event.target.value);
	};
	
	const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setPassword(event.target.value);
	};
	
	const handleConfirmPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setConfirmPassword(event.target.value);
	};
	
	const handleFirstNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setFirstName(event.target.value);
	};
	
	const handleLastNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setLastName(event.target.value);
	};
	
	const handleDateOfBirthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setDateOfBirth(event.target.value);
	};
	
	const handleGenderChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		setGender(event.target.value);
	};

	const switchFieldType = (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
		event.target.type = type;
	};

	const goToStep = (step: SetupStep, percentageComplete?: number) => 
	{		
		if(percentageComplete)
			setProgressPercentage(percentageComplete);

		setCurrentStep(step);
	};

	function validateForm(event: React.FormEvent<HTMLFormElement>, step: SetupStep, percentageComplete?: number) 
	{
		event.preventDefault();
		event.stopPropagation();

		const form = event.currentTarget;

		if (form.checkValidity()) { goToStep(step, percentageComplete); }

		form.classList.add('was-validated');
	}

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) 
	{
		setInstallStatus(InstallStatus.Installing);

		event.preventDefault();
		event.stopPropagation();

		const form = event.currentTarget;

		if (form.checkValidity()) 
		{
			const setupRequest = {
				instanceUsername: username,
				instanceUserEmailAddress: emailAddress,
				instanceUserPassword: password,

				instanceUserFirstName: firstName,
				instanceUserLastName: lastName,

				instanceUserDateOfBirth: dateOfBirth,
				instanceUserGender: gender,

				instancePhoneCountryCodeISO: phoneCode,
				instancePhoneNumber: phoneNumber,

				instanceLanguageCode: languageCode,				
				instanceCountryCode: regionCode,
				instanceTimeZone: timeZone
			}

			ApiService().post("system/setup", setupRequest).then((response: any) => 
			{ 
				setInstallStatus(InstallStatus.Complete);
				goToStep(SetupStep.Finished, 100);

			}).catch((err: any) => 
			{
				setSubmitResponse({
					data: err!.response!.data,
					failures: err!.response!.data!.failures
				});

				setInstallStatus(InstallStatus.GatheringDetails);
			});
		}

		form.classList.add('was-validated');
	}

	const progressBarHtml = <div className="form-section-progress">
		
		<div className="row">
			<div className="col-7">
				<label htmlFor="setupProgress" className="float-end">{trxService.trx(translations, "progress")}:</label>
			</div>
			
			<div className="col-5">
				<div id="setupProgress" className="progress">
					<div className={installStatus === InstallStatus.Installing ? "progress-bar progress-bar-striped progress-bar-animated" : "progress-bar"} role="progressbar" style={{width: progressPercentage + "%"}} aria-valuenow={progressPercentage} aria-valuemin={0} aria-valuemax={100}></div>
				</div>
			</div>
		</div>
	</div>

	const calculateDefaultLanguage = function (languageCode: string) 
	{
		languageCode = languageCode.toUpperCase();

		if(languages.length > 0)
		{
			let language = _.find(languages, (o) => o.twoLetterCode === languageCode);

			if(!language)
			{
				const parts = languageCode.split("-"); 
				language = _.find(languages, (o) => o.twoLetterCode === parts[0]);
			}

			if(language)
				return language.twoLetterCode;
		}

		return languageCode;
	}

	const getCurrentLanguage = function()
	{
		if(languages.length > 0)
		{
			return _.find(languages, (o) => o.twoLetterCode === languageCode);
		}
		
		return null;
	}

	const defaultWhenEmpty = (value: string, defaultValue: string) =>
	{
		return !value || value === undefined || _.isEmpty(value) ? defaultValue : value;
	}
	
	const textDirection = textService.getTextDirection(getCurrentLanguage()?.direction ?? "LTR");
	
	const displayMode = !hasInitialDataLoaded() ? DisplayMode.Stencil : DisplayMode.Normal;
	
	const isSetupComplete = setupStatus.toLowerCase() === "complete";

	if(!isPageReady() || isSetupComplete)
		return (
			<React.Fragment>
				<Header displayMode={displayMode} translations={translations} />
				
				<div className="container-fluid page-content">
					<div className="row">
					<div className="main-content text-center col-12 col-sm-12 col-md-10 col-lg-6 col-xl-4 offset-1 offset-sm-2 offset-md-1 offset-lg-3 offset-xl-4">
						<main>
						{ isSetupComplete && 
							<span className="setup-complete-message rounded m-3">{trxService.trx(translations, "setup_is_already_complete")} <Link to="/login">{trxService.trx(translations, "login")}</Link>.</span>
						}
						{ (!isSetupComplete && !hasInitialDataLoaded()) && <LoadIndicator size={120} colorClass="primary-color" /> }
						{ (!isSetupComplete && translations.setup_is_getting_ready_message) && <span>{trxService.trx(translations, "setup_is_getting_ready_message")}</span> }						
						</main>
					</div>
					</div>
				</div>
			</React.Fragment>
		);

	const formSectionHeaderClassNames = `form-section-head ${textDirection}`;
	const formSectionBodyClassNames = `form-section-body ${textDirection}`;
	const formSectionFooterClassNames = `form-section-foot ${textDirection}`;

	return (
		<React.Fragment>
			<Header displayMode={displayMode} translations={translations} />
		
			<div className="container-fluid page-content">
				<div className="row g-0">
					<div className="main-content col-12 col-sm-12 col-md-10 col-lg-6 col-xl-4 offset-1 offset-sm-2 offset-md-1 offset-lg-3 offset-xl-4">
						{ loadStatus === ReadyStatus.Loaded &&	
						<main>
							{ currentStep === SetupStep.Language && 								
								<div className="form-section card rounded">								
									<form noValidate onSubmit={(e) => validateForm(e, SetupStep.Welcome, 7)}>
										<div className={formSectionBodyClassNames}>
										
											<div className="form-field">
												<label className="visually-hidden" htmlFor="languageCode">{trxService.trx(translations, "language")}</label>
												<FormDropdownBox id="languageCode" options={languages} placeholder="Language" value={calculateDefaultLanguage(languageCode)} sortBy={FormDropdownSortBy.Alphabetical} onChange={handleLanguageCodeChange} translations={[]} aria-describedby="languageCodeHelp" size={3} />
												<div id="languageCodeHelp" className="visually-hidden">Language help...</div>
											</div>

										</div>

										<div className={formSectionFooterClassNames}>
											<button type="submit" className="btn btn-sm btn-primary float-end"><Icon name="arrow-right" /></button>
										</div>
									</form>
								</div>
							}
							
							{ currentStep === SetupStep.Welcome && 
								
								<div className="form-section card rounded">
									{progressBarHtml}
									<div className={formSectionHeaderClassNames}>{trxService.trx(translations, "astrana")} {trxService.trx(translations, "heading_setup_wizard")}</div>
									
									<form noValidate onSubmit={(e) => validateForm(e, SetupStep.TermsAndConditions, 15)}>
										<div className={formSectionBodyClassNames}>
										{trxService.trx(translations, "setup_wizard_summary")}
										</div>

										<div className={formSectionFooterClassNames}>
										<button className="btn btn-sm btn-back me-1" onClick={() => goToStep(SetupStep.Language)} tabIndex={-1}><Icon name="arrow-left" /></button>
										<button type="submit" className="btn btn-sm btn-primary btn-next float-end">{trxService.trx(translations, "heading_terms_and_conditions")} <Icon name="arrow-right" /></button>
										</div>
									</form>						
								</div>
							}

							{ currentStep === SetupStep.TermsAndConditions && 
								
								<div className="form-section card rounded">
									{progressBarHtml}
									<div className={formSectionHeaderClassNames}>{trxService.trx(translations, "heading_terms_and_conditions")}</div>
									
									<form noValidate onSubmit={(e) => validateForm(e, SetupStep.Localization, 26)}>
										<div className={formSectionBodyClassNames}>
										<div className="textblock">
											<ReactMarkdown>{licenseText}</ReactMarkdown>
										</div>
										
										<div className="form-field">
											<input className="form-check-input me-2" type="checkbox" value="" id="acceptTerms" checked={acceptedTerms} onChange={handleTermsAndConditionsChange} required autoComplete="off" data-lpignore="true" />
											<label className="form-check-label" htmlFor="acceptTerms"><b>{trxService.trx(translations, "accept_astrana_toc")}</b></label>
										</div>	
										</div>

										<div className={formSectionFooterClassNames}>
										<button className="btn btn-sm btn-back me-1" onClick={() => goToStep(SetupStep.Welcome)} tabIndex={-1}><Icon name="arrow-left" /></button>
										<button type="submit" className="btn btn-sm btn-primary btn-next float-end">{trxService.trx(translations, "heading_localization")} <Icon name="arrow-right" /></button>
										</div>
									</form>
								</div>
							}

							{ currentStep === SetupStep.Localization && 
							
								<div className="form-section card rounded">						
									{progressBarHtml}
									<div className={formSectionHeaderClassNames}>{trxService.trx(translations, "heading_culture_settings")}</div>
									
									<form noValidate onSubmit={(e) => validateForm(e, SetupStep.Database, 37)}>
										<div className={formSectionBodyClassNames}>
										
											<div className="form-field">
											<label className="visually-hidden" htmlFor="regionCountry">{trxService.trx(translations, "region")} / {trxService.trx(translations, "country")}</label>
											<FormDropdownBox id="countryCode" options={countries} placeholder={trxService.trx(translations, "region") + "/" + trxService.trx(translations, "country")} value={regionCode} sortBy={FormDropdownSortBy.Alphabetical} onChange={handleRegionCodeChange} translations={[]} aria-describedby="regionRegionHelp" />
											</div> 

											<div className="form-field">
											<label className="visually-hidden" htmlFor="timeZone">{trxService.trx(translations, "time_zone")}</label>
											<input type="text" className="form-control" id="timeZone" placeholder={trxService.trx(translations, "time_zone")} aria-describedby="timeZoneHelp" value={timeZone} onChange={handleTimeZoneChange} />
											</div>						
										</div>

										<div className={formSectionFooterClassNames}>
										<button className="btn btn-sm btn-back me-1" onClick={() => goToStep(SetupStep.TermsAndConditions)} tabIndex={-1}><Icon name="arrow-left" /></button>
										<button type="submit" className="btn btn-sm btn-primary btn-next float-end">{trxService.trx(translations, "heading_database")} <Icon name="arrow-right" /></button>
										</div>
									</form>
								</div>
							}

							{ currentStep === SetupStep.Database && 
								<div className="form-section card rounded">
									{progressBarHtml}
									<div className={formSectionHeaderClassNames}>
										<h1>{trxService.trx(translations, "heading_database")}</h1>
										<span className="advanced-options float-end">
										<span className="form-check form-switch">
											<input className="form-check-input" type="checkbox" id="enableDatabaseAdvanvedOptions" />
											<label className="form-check-label" htmlFor="enableDatabaseAdvanvedOptions">{trxService.trx(translations, "advanced")}</label>
										</span>
										</span>
									</div>

									<form noValidate onSubmit={(e) => validateForm(e, SetupStep.UserCredentials, 48)}>
										<div className={formSectionBodyClassNames}>

										<div className="row ">							
											<div className="col-3">
											<img src={getSelectedDatabaseProviderIcon()} alt={defaultWhenEmpty(databaseProvider, currentDatabaseSettings.databaseProvider)} style={{width: "100%"}} className="database-logo rounded" />
											</div>

											<div className="col-9">
											
											{databaseOverrideRequired && <span>Override required.</span>}
											
											<div className="form-field">
												<label className="visually-hidden" htmlFor="databaseProvider">{trxService.trx(translations, "database_provider")}</label>
												<FormDropdownBox id="databaseProvider" options={databaseProviderLookup.options} placeholder={trxService.trx(translations, "database_provider")} value={databaseProvider} sortBy={FormDropdownSortBy.Alphabetical} onChange={handleDatabaseProviderChange} translations={[]} aria-describedby="databaseProviderHelp" required />
												<div id="databaseProviderHelp" className="visually-hidden">Database help...</div>
											</div>

											<div className="row">
												<div className="col-9 form-field">
												<label className="visually-hidden" htmlFor="databaseHost">{trxService.trx(translations, "address")}</label>
												<input type="text" className="form-control" id="databaseHost" placeholder={trxService.trx(translations, "address")} value={databaseHost} onChange={handleDatabaseHostChange} autoComplete="off" data-lpignore="true" required />
												</div>
												
												<div className="col-3 form-field">
												<label className="visually-hidden" htmlFor="databaseHostPort">{trxService.trx(translations, "port")}</label>
												<input type="text" className="form-control" id="databaseHostPort" placeholder={trxService.trx(translations, "port")} value={databaseHostPort} onChange={handleDatabaseHostPortChange} data-lpignore="true" autoComplete="off" />
												</div>
											</div>

											<div className="row">
												<div className="col-6 form-field">
												<label className="visually-hidden" htmlFor="databaseUsername">{trxService.trx(translations, "username")}</label>
												<input type="text" className="form-control" id="databaseUsername" placeholder={trxService.trx(translations, "username")} value={databaseUsername} onChange={handleDatabaseUsernameChange} required data-lpignore="true" autoComplete="off" minLength={minimumUsernameLength} />
												<div className="invalid-feedback">
													Please enter your database username.
												</div>
												</div>
												
												<div className="col-6 form-field">
												<label className="visually-hidden" htmlFor="databasePassword">{trxService.trx(translations, "password")}</label>
												<input type="password" className="form-control" id="databasePassword" placeholder={trxService.trx(translations, "password")} value={databasePassword} onChange={handleDatabasePasswordChange} autoComplete="off" required minLength={minimumPasswordLength} />
												<div className="invalid-feedback">
													Please enter your database password.
												</div>
												</div>
											</div>

											<div className="form-field">
												<label className="visually-hidden" htmlFor="databaseName">{trxService.trx(translations, "name")}</label>
												<input type="text" className="form-control" id="databaseName" placeholder={trxService.trx(translations, "name")} value={databaseName} onChange={handleDatabaseNameChange} autoComplete="off" aria-describedby="databaseNameHelp" />
												<div id="databaseNameHelp" className="visually-hidden">Database Name help...</div>
											</div>
											
											</div>
										</div>

										</div>
															
										<div className={formSectionFooterClassNames}>
											<button className="btn btn-sm btn-back me-1" onClick={() => goToStep(SetupStep.Localization)} tabIndex={-1}><Icon name="arrow-left" /></button>
											
											{databaseConnectionTestResult && <button type="submit" className="btn btn-sm btn-primary btn-next float-end" disabled={databaseConnectionTestStatus === "working"}>{trxService.trx(translations, "heading_user_credentials")} <Icon name="arrow-right" /></button>}

											{databaseConnectionTestStatus === "complete" && 
												<button className={`btn btn-sm ${databaseConnectionTestResult ? "btn-outline-success" : "btn-outline-secondary"} float-end me-1`} onClick={() => testDatabaseConnection()} tabIndex={-1}>
												{trxService.trx(translations, "test_connection")}
												{ databaseConnectionTestResult && <Icon name="ms-1 check-circle" />}
												</button> 
											}
											
											{databaseConnectionTestStatus === "working" && <button className="btn btn-sm btn-outline-secondary btn-next float-end me-1" tabIndex={-1} disabled>
																						<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
																						<span className="visually-hidden">{trxService.trx(translations, "testing")}...</span>
																					</button> 
																					}							
										</div>
									</form>
								</div>
							}

							{ currentStep === SetupStep.UserCredentials && 
								<div className="form-section card rounded">							
									{progressBarHtml}
									<div className={formSectionHeaderClassNames}>{trxService.trx(translations, "heading_user_credentials")}</div>
										
									<form noValidate onSubmit={(e) => validateForm(e, SetupStep.UserInformation, 80)}>
										<div className={formSectionBodyClassNames}>
										
										<div className="form-field">
											<label className="visually-hidden" htmlFor="username">{trxService.trx(translations, "username")}</label>
											<div className="input-group">
											<div className="input-group-text">@</div>
											<input type="text" className="form-control" id="username" placeholder={trxService.trx(translations, "username")} value={username} onChange={handleUsernameChange} aria-describedby="usernameHelp" required autoComplete="off"	/>
											</div>
											<div className="invalid-feedback">
												Please choose a username.
											</div>
											<div id="usernameHelp" className="visually-hidden">This is the username you'll use to login with.</div>
										</div>

										<div className="row ">
											<div className="col-6 form-field">
											<label className="visually-hidden" htmlFor="password">{trxService.trx(translations, "password")}</label>
											<input type="password" className="form-control" id="password" placeholder={trxService.trx(translations, "password")} value={password} onChange={handlePasswordChange} autoComplete="off" required minLength={minimumPasswordLength} />
											</div>
											
											<div className="col-6 form-field">
											<label className="visually-hidden" htmlFor="confirmPassword">{trxService.trx(translations, "confirm_password")}</label>
											<input type="password" className="form-control" id="password" placeholder={trxService.trx(translations, "confirm_password")} value={confirmPassword} onChange={handleConfirmPasswordChange} autoComplete="off" required minLength={minimumPasswordLength} />
											</div>
										</div>

										<div className="form-field">
											<label className="visually-hidden" htmlFor="emailAddress">{trxService.trx(translations, "email_address")}</label>
											<input type="email" className="form-control" id="emailAddress" placeholder={trxService.trx(translations, "email_address")} value={emailAddress} onChange={handleEmailAddressChange} aria-describedby="emailHelp" autoComplete="off" required />
										</div>

										<div className="row form-field">
											<div className="input-group">
												<label className="visually-hidden" htmlFor="phoneCode">{trxService.trx(translations, "phone_code")}</label>
												<FormComboBox options={phoneCodes} optionPrefix="+" inputClassName="form-control" id="phoneCode" placeholder="Phone Code" defaultValue={defaultPhoneCode} placeholderIcon="https://cdn3.iconfinder.com/data/icons/mission/500/yul754_12_flag_mission_business_logo_hand_silhouette_person-256.png" onChange={handlePhoneCodeChange} onSelect={handlePhoneCodeSelect} aria-describedby="phoneCodeHelp"></FormComboBox>
												<label className="visually-hidden" htmlFor="phoneNumber">{trxService.trx(translations, "phone_number")}</label>
												<input type="text" className="form-control" id="phoneNumber" placeholder={trxService.trx(translations, "phone_number")} value={phoneNumber} onChange={handlePhoneNumberChange} aria-describedby="phoneNumberHelp" />
											</div>
										</div>

										</div>
										
										<div className={formSectionFooterClassNames}>
											<button className="btn btn-sm btn-back me-1" onClick={() => goToStep(SetupStep.Database)} tabIndex={-1}><Icon name="arrow-left" /></button>
											<button type="submit" className="btn btn-sm btn-primary btn-next float-end">{trxService.trx(translations, "heading_user_information")} <Icon name="arrow-right" /></button>
										</div>
									</form>
								</div>
							}

							{ currentStep === SetupStep.UserInformation &&				
								<div className="form-section card rounded">						
									{progressBarHtml}
									<div className={formSectionHeaderClassNames}>{trxService.trx(translations, "heading_user_information")}</div>
										
									<form id="setupForm" noValidate onSubmit={(e) => validateForm(e, SetupStep.Summary, 91)}>	 
										<div className={formSectionBodyClassNames}>
											
											<div className="row ">
											<div className="col-6 form-field">
												<label className="visually-hidden" htmlFor="firstName">{trxService.trx(translations, "first_name")}</label>
												<input type="text" className="form-control" id="firstName" placeholder={trxService.trx(translations, "first_name")} aria-describedby="firstNameHelp" value={firstName} onChange={handleFirstNameChange} autoComplete="off" required />
											</div>
											
											<div className="col-6 form-field">
												<label className="visually-hidden" htmlFor="lastName">{trxService.trx(translations, "last_name")}</label>
												<input type="text" className="form-control" id="lastName" placeholder={trxService.trx(translations, "last_name")} aria-describedby="lastNameHelp" value={lastName} onChange={handleLastNameChange} autoComplete="off" required />
											</div>
											</div>

											<div className="row ">
											<div className="col-6 form-field">
												<label className="visually-hidden" htmlFor="gender">{trxService.trx(translations, "gender")}</label>
												<FormDropdownBox id="gender" options={genderLookup.options} placeholder={trxService.trx(translations, "gender")} value={gender} sortBy={FormDropdownSortBy.Alphabetical} onChange={handleGenderChange} translations={[]} aria-describedby="genderHelp" autoComplete="off" required />
												<div id="genderNameHelp" className="visually-hidden">Geneder help...</div>
											</div>
											
											<div className="col-6 form-field">
												<label className="visually-hidden" htmlFor="dateOfBirth">{trxService.trx(translations, "date_of_birth")}</label>
												<div className="input-group">
												<div className="input-group-text">
													<Icon name="calendar" />
												</div>
												<input type="text" onFocus={(e) => switchFieldType(e, "date")} onBlur={(e) => switchFieldType(e, "text")} className="form-control" id="dateOfBirth" placeholder={trxService.trx(translations, "date_of_birth")} aria-describedby="dateOfBirthHelp" value={dateOfBirth} onChange={handleDateOfBirthChange} autoComplete="off" required max={today} />
												</div>							
											</div>
											
											</div>

										</div>
										
										<div className={formSectionFooterClassNames}>
											<button className="btn btn-sm btn-back me-1" onClick={() => goToStep(SetupStep.UserCredentials)} tabIndex={-1}><Icon name="arrow-left" /></button>
											<button type="submit" className="btn btn-sm btn-primary btn-next float-end">{trxService.trx(translations, "heading_summary")} <Icon name="arrow-right" /></button>
										</div>
									</form>
								</div>
							}
							
							{ currentStep === SetupStep.Summary && 
								<div className="form-section card rounded">						
									{progressBarHtml}
									<div className={formSectionHeaderClassNames}>{trxService.trx(translations, "heading_summary")}</div>

									<form id="setupForm" noValidate onSubmit={handleSubmit}>
										<div className={formSectionBodyClassNames}>
											<p>This is the summary of configurations choices.</p>
											{
											(submitResponse.failures ?? []).map((failure: any) => (
												<p>{failure.message}</p>
											))
											}
										</div>
										
										<div className={formSectionFooterClassNames}>
											{installStatus === InstallStatus.GatheringDetails && <button className="btn btn-sm btn-back me-1" onClick={() => goToStep(SetupStep.UserInformation)} tabIndex={-1}><Icon name="arrow-left" /></button> }
											{installStatus === InstallStatus.GatheringDetails && <input type="submit" className="btn btn-sm btn-primary float-end" value={trxService.trx(translations, "confirm")} /> }
											{installStatus === InstallStatus.Installing && <button disabled className="btn btn-sm btn-primary float-end">
																						<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
																						<span className="visually-hidden">{trxService.trx(translations, "configuring")}...</span>
																					</button> 
																				}
										</div>
									</form>
								</div>
							}

							{ currentStep === SetupStep.Finished && 
								<div className="form-section card rounded">
									{progressBarHtml}
									<div className={formSectionHeaderClassNames}>{trxService.trx(translations, "heading_setup_finished")}</div>
									<div className={formSectionBodyClassNames}>
										<p>{trxService.trx(translations, "setup_completed_message")}</p>
									</div>
									{ currentStep === SetupStep.Finished && <Fireworks timeout={15} /> }
									
									<div className={formSectionFooterClassNames}>
										{installStatus === InstallStatus.Complete && <Link to="/login" className="btn btn-sm btn-primary">{trxService.trx(translations, "login")}</Link> }
									</div>
								</div>
							}	
						</main>
						}
					</div>
				</div>
			</div>
		</React.Fragment>
	);
};