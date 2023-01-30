import React, { useEffect } from 'react'
import { useNavigate } from "react-router-dom";

import _ from 'lodash';
import moment from 'moment';
import 'moment-timezone';

import { phoneCodes, genders, defaultLanguage, defaultTimeZone } from '../../constants';
import { IQueryParameter } from '../../types/api/api';
import { IApplicationSettings } from './../../types/objects/applicationSettings';
import { IUserInfo } from '../../types/interfaces/user';
import { ILanguageData } from '../../types/objects/globalization';
import { ICountryData } from '../../types/data/country';
import { ILookupData, ILookupOptionData } from '../../types/data/lookup';

import ApiService from '../../services/ApiService';
import TranslationsService from './../../services/TranslationService';
import LookupService from '../../services/LookupService';
import ReactMarkdown from 'react-markdown'

import { Header } from './../../components/Header';
import FormComboBox from '../../components/FormComboBox';
import { Icon } from '../../components/Icon';
import { FormDropdownBox } from '../../components/FormDropdownBox';

import './SetupPage.scss';

interface SetupPageProps {
  settings: IApplicationSettings;
  user: IUserInfo;
}

export interface ISetupConfiguration 
{
  languageCode: string;
  regionCode: string;
  timeZone: string;

  acceptedTerms: boolean;

  databaseProvider: string;
  databaseHost: string;
  databaseHostPort: string;
  databaseUsername: string;
  databasePassword: string;
  databaseName: string;

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
    setupStatus: string;
    pageReadiness: string | "loading" | "ready"
    installStatus: string | "gathering" | "installing" | "complete";
    currentStep: string | "language" | "welcome" | "termsandconditions" | "localization" | "database" | "webserver" | "usercredentials" | "userinformation" | "summary";
    progressPercentage: number;
    languageCode: string,
    configuration: ISetupConfiguration;
}

const defaultPhoneCode = _.find(phoneCodes, (o) => { return o.value === "27" });

const intialState = { 
  setupStatus: "new",
  pageReadiness: "loading",
  installStatus: "gathering",
  currentStep: "language",
  progressPercentage: 0,
  languageCode: navigator.language ?? defaultLanguage.code, 
  configuration: {          
      languageCode: navigator.language ?? defaultLanguage.code, 
      regionCode: "",      
      timeZone: moment.tz(moment.tz.guess()).zoneAbbr() ?? defaultTimeZone,

      acceptedTerms: false,

      databaseProvider: "",
      databaseHost: "",
      databaseHostPort: "",
      databaseUsername: "",
      databasePassword: "",
      databaseName: "",

      emailAddress: "",
      phoneCode: "",
      phoneNumber: "",

      username: "",
      password: "",
      confirmPassword: "",
      
      firstName: "",
      lastName: "",          
      gender: genders[0].code,
      dateOfBirth: ""
  }
};

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

export function SetupPage({ settings, user }: SetupPageProps) 
{
    const [state, setState] = React.useState<ISetupPageState>(intialState);
    const [translations, setTranslations] = React.useState<any>({});
    const [languages, setLanguages] = React.useState<ILanguageData[]>([]);    
    const [countries, setCountries] = React.useState<ICountryData[]>([]);
    
    const [licenseText, setLicenseText] = React.useState<string>("");
    
    const lookupInitialState = { label: "", trxCode: "", options: []};
    const [databaseProviderLookup, setDatabaseProviderLookup] = React.useState<ILookupData>(lookupInitialState);
    const [genderLookup, setGenderLookup] = React.useState<ILookupData>(lookupInitialState);
    
    const [currentDatabaseSettings, setCurrentDatabaseSettings] = React.useState<any>(false);

    const [databaseConnectionTestStatus, setDatabaseConnectionTestStatus] = React.useState<string>("complete");
    const [databaseConnectionTestResult, setDatabaseConnectionTestResult] = React.useState<boolean>(false);
        
    const [submitResponse, setSubmitResponse] = React.useState<ISubmitResponse>({ data: {}, failures: [] });

    const getCurrentState = function()
    {
        return JSON.parse(JSON.stringify(state));
    };
    
    const databaseOverrideRequired = !currentDatabaseSettings || 
          _.isEmpty(currentDatabaseSettings.databaseProvider) || 
          _.isEmpty(currentDatabaseSettings.connectionString.hostAddress) || 
          _.isEmpty(currentDatabaseSettings.connectionString.hostAddressPort) || 
          _.isEmpty(currentDatabaseSettings.connectionString.userId) || 
          _.isEmpty(currentDatabaseSettings.connectionString.password) || 
          _.isEmpty(currentDatabaseSettings.connectionString.databaseName);
    
    
      useEffect(() => {
        loadInitialData();
      }, []);
      
    const loadInitialData = async () => 
    {
        await getSetupStatus();
        await loadLicense();
        
        await loadLanguages();
        await loadTrx(state.configuration.languageCode);
        
        await loadCountries();

        await loadDatabaseProviderLookup();
        await loadGenderLookup();
        
        await loadCurrentDatabaseSettings();
    }
    
    const getSetupStatus = async () => 
    {
        return await ApiService().getAll("system/setup/status")
          .then((response: any | undefined) => 
          {
              state.setupStatus = response.toLowerCase();
              setState(state);
          })
          .catch((error: Error | undefined) => {
              console.log(error);
          });
    }
    
    const loadCurrentDatabaseSettings = async () => 
    {
        return await ApiService().getAll("system/setup/database/settings").then((response: any) => 
        {
            setCurrentDatabaseSettings(response.data);

            state.configuration.databaseProvider = response.data.databaseProvider;
            state.configuration.databaseHost = response.data.connectionString.hostAddress;
            state.configuration.databaseHostPort = response.data.connectionString.hostAddressPort;
            state.configuration.databaseUsername = response.data.connectionString.userId;
            state.configuration.databasePassword = response.data.connectionString.password;
            state.configuration.databaseName = response.data.connectionString.databaseName;
            setState(state);
        })
        .catch((error: Error) => {
            console.log(error);
        });
    }
    
    const loadLanguages = async () => 
    {
        return await ApiService().getAll("internationalization/languages")
          .then((response: any | undefined) => 
          {
              setLanguages(response.data.data);
              setDocumentLanguage();
          })
          .catch((error: Error | undefined) => {
              console.log(error);
          });
    }
    
    const loadTrx = async (languageCode: string) => 
    {
          return await TranslationsService().loadTranslations(languageCode)
            .then((response: any | undefined) => 
            {                  
                setTranslations(response);
            })
            .catch((error: Error | undefined) => {
                console.log(error);
            });
    }
    
    const trx = function (translationKey: string, defaultValue?: string | undefined | null) 
    {
        const translation = translations[translationKey];

        if(translation)
          return translation;

        if(defaultValue && !_.isEmpty(defaultValue))
          return defaultValue;

        return translationKey;
    }
    
    const loadLicense = async () => 
    {
        const parameters: IQueryParameter[] = [
          { key: "languageCode", value: state.configuration.languageCode },
          { key: "format", value: "markdown" }
        ];

        return await ApiService().get("legal/license", undefined, parameters)
          .then((response: string) => 
          {
              setLicenseText(response);
          })
          .catch((error: Error | undefined) => {
              console.log(error);
          });
    }

    const loadDatabaseProviderLookup = async () => 
    {
        return await LookupService().getLookup("DatabaseProvider")
            .then((response: any | undefined) => 
            {                  
                setDatabaseProviderLookup(response.data);        
            })
            .catch((error: Error | undefined) => {
                console.log(error);
            });
    }

    const loadGenderLookup = async () => 
    {
        return await LookupService().getLookup("Gender")
            .then((response: any | undefined) => 
            {                  
                setGenderLookup(response.data);        
            })
            .catch((error: Error | undefined) => {
                console.log(error);
            });
    }

    const loadCountries = async () => 
    {
        const parameters: IQueryParameter[] = [
          { key: "pageSize", value: "250"}
        ];

        return await ApiService().get("system/countries", undefined, parameters)
          .then((response: any | undefined) => 
          {
              console.log("set countries")

              setCountries(response.data);
          })
          .catch((error: Error | undefined) => {
              console.log(error);
          });
    }

    const setDocumentLanguage = () => 
    {
      const currentLanguage = getCurrentLanguage();

      if(currentLanguage && currentLanguage.twoLetterCode)
      {
          document.documentElement.lang = currentLanguage.twoLetterCode;
          document.documentElement.dir = getTextDirection(currentLanguage.direction);
      }
    };

    const handleLanguageCodeChange = function(event: React.ChangeEvent<HTMLSelectElement>)
    {
      state.configuration.languageCode = event.target.value;
      setState(state);
      
      setDocumentLanguage();
      loadTrx(event.target.value);
      loadLicense();
    };
    
    const handleRegionCodeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const state = getCurrentState();
      state.configuration.regionCode = event.target.value;
      setState(state);
    };

    const handleTimeZoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const state = getCurrentState();
      state.configuration.timeZone = event.target.value;
      setState(state);
    };

    const handleTermsAndConditionsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const state = getCurrentState();
      state.configuration.acceptedTerms = event.target.checked;
      setState(state);
    };
    
    const handleDatabaseProviderChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const state = getCurrentState();
      state.configuration.databaseProvider = event.target.value;
      setState(state);
    };

    const getSelectedDatabaseProviderIcon = () => 
    {
        const matches = _.filter(databaseProviderLookup.options, (item) => { return item.value === defaultWhenEmpty(state.configuration.databaseProvider, currentDatabaseSettings.databaseProvider) });
        
        return matches.length > 0 ? matches[0].iconAddress : "";
    }
    
    const handleDatabaseHostChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const state = getCurrentState();
      state.configuration.databaseHost = event.target.value;
      setState(state);
    };

    const handleDatabaseHostPortChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const state = getCurrentState();
      state.configuration.databaseHostPort = event.target.value;
      setState(state);
    };
    
    const handleDatabaseUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const state = getCurrentState();
      state.configuration.databaseUsername = event.target.value;
      setState(state);
    };
    
    const handleDatabasePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const state = getCurrentState();
      state.configuration.databasePassword = event.target.value;
      setState(state);
    };
    
    const handleDatabaseNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const state = getCurrentState();
      state.configuration.databaseName = event.target.value;
      setState(state);
    };

    const testDatabaseConnection = () => 
    {
        setDatabaseConnectionTestStatus("working");

        const state = getCurrentState();

        const databaseSettings = {
          databaseProvider: defaultWhenEmpty(state.configuration.databaseProvider, currentDatabaseSettings.databaseProvider),
          databaseName: defaultWhenEmpty(state.configuration.databaseName, currentDatabaseSettings.databaseName),
          databaseHost: defaultWhenEmpty(state.configuration.databaseHost, currentDatabaseSettings.databaseHost),
          databaseHostPort: defaultWhenEmpty(state.configuration.databaseHostPort, currentDatabaseSettings.databaseHostPort),
          databaseUsername: defaultWhenEmpty(state.configuration.databaseUsername, currentDatabaseSettings.databaseUsername),
          databasePassword: defaultWhenEmpty(state.configuration.databasePassword, currentDatabaseSettings.databasePassword)
        }

        console.dir(databaseSettings);

        ApiService().post("system/setup/database/test", databaseSettings)
          .then((response: any | undefined) => 
          {
              setCurrentDatabaseSettings(response.data);  

              setTimeout(() => {
                setDatabaseConnectionTestResult(true);
                setDatabaseConnectionTestStatus("complete");
              }, 1000);
          })
          .catch((error: Error | undefined) => {
              console.log(error);

              setTimeout(() => {
                setDatabaseConnectionTestResult(false);
                setDatabaseConnectionTestStatus("complete");
              }, 1000);
          });
    };
    
    const handleEmailAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const state = getCurrentState();
        state.configuration.emailAddress = event.target.value;
        setState(state);
    };
    
    const handlePhoneCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const state = getCurrentState();
      state.configuration.phoneCode = event.target.value;
      setState(state);
    };

    const handlePhoneCodeSelect = (value: string) => {
      const state = getCurrentState();
      state.configuration.phoneCode = value;
      setState(state);
    };

    const handlePhoneNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const state = getCurrentState();
      state.configuration.phoneNumber = event.target.value;
      setState(state);
    };

    const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const state = getCurrentState();
        state.configuration.username = event.target.value;
        setState(state);
    };
    
    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const state = getCurrentState();
      state.configuration.password = event.target.value;
      setState(state);
    };
  
    const handleConfirmPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const state = getCurrentState();
      state.configuration.confirmPassword = event.target.value;
      setState(state);
    };
  
    const handleFirstNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const state = getCurrentState();
      state.configuration.firstName = event.target.value;
      setState(state);
    };
  
    const handleLastNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const state = getCurrentState();
      state.configuration.lastName = event.target.value;
      setState(state);
    };
  
    const handleDateOfBirthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const state = getCurrentState();
      state.configuration.dateOfBirth = event.target.value;
      setState(state);
    };
  
    const handleGenderChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const state = getCurrentState();
      state.configuration.gender = event.target.value;
      setState(state);
    };

    const switchFieldType = (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
      event.target.type = type;
    };

    const setInstallStatus = (status: string) => {
      const state = getCurrentState();      
      state.installStatus = status;      
      setState(state);
    };

    const goToStep = (stepName: string, progressPercentage?: number) => 
    {
        const state = getCurrentState();
        
        state.currentStep = stepName;
        
        if(progressPercentage)
          state.progressPercentage = progressPercentage;
      
        setState(state);
    };

    function validateForm(event: React.FormEvent<HTMLFormElement>, stepName: string, progressPercentage?: number) 
    {
      event.preventDefault();
      event.stopPropagation();

      const form = event.currentTarget;

      if (form.checkValidity()) { goToStep(stepName, progressPercentage); }

      form.classList.add('was-validated');
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) 
    {
      setInstallStatus("installing");

      event.preventDefault();
      event.stopPropagation();

      const form = event.currentTarget;

      if (form.checkValidity()) 
      {
         const setupRequest = {
              instanceUsername: state.configuration.username,
              instanceUserEmailAddress: state.configuration.emailAddress,
              instanceUserPassword: state.configuration.password,
              
              instanceUserFirstName: state.configuration.firstName,
              instanceUserLastName: state.configuration.lastName,
              
              instanceUserDateOfBirth: state.configuration.dateOfBirth,
              instanceUserGender: state.configuration.gender,

              instancePhoneCountryCodeISO: state.configuration.phoneCode,
              instancePhoneNumber: state.configuration.phoneNumber,

              instanceLanguageCode: state.configuration.languageCode,              
              instanceCountryCode: state.configuration.regionCode,
              instanceTimeZone: state.configuration.timeZone
          }

          console.dir(setupRequest);

          ApiService().post("system/setup", setupRequest).then((response: any) => 
          { 
              console.log(response.data);
              setInstallStatus("complete");
          })
          .catch((err: any) => {

            setSubmitResponse(
            {
                data: err!.response!.data,
                failures: err!.response!.data!.failures
            });

            setInstallStatus("gathering");
          });
      }

      form.classList.add('was-validated');
    }

    const progressBarHtml = <div className="form-section-progress">
      
        <div className="row">
          <div className="col-7">
            <label htmlFor="setupProgress" className="float-end">{trx("progress")}:</label>
          </div>
          
          <div className="col-5">
            <div id="setupProgress" className="progress">
              <div className={state.installStatus === "installing" ? "progress-bar progress-bar-striped progress-bar-animated" : "progress-bar"} role="progressbar" style={{width: state.progressPercentage + "%"}} aria-valuenow={state.progressPercentage} aria-valuemin={0} aria-valuemax={100}></div>
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
            return _.find(languages, (o) => o.twoLetterCode === state.configuration.languageCode);
        }
        
        return null;
    }

    const getTextDirection = function(direction: string)
    {
        switch(direction.toLowerCase())
        {
            case 'ltr':
              return 'ltr';

            case 'rtl':
              return 'rtl';

            default:
              return 'auto';
        }
    }

    const defaultWhenEmpty = (value: string, defaultValue: string) =>
    {
        return !value || value === undefined || _.isEmpty(value) ? defaultValue : value;
    }

    const maySetup = (state.setupStatus === "new" || state.setupStatus === "inprogress");   

    const isPageReady = maySetup && languages.length > 0 && translations ? "ready" : "loading";
    const mode = !isPageReady ? "skeleton" : "normal";

    const navigate = useNavigate();

    useEffect(() => 
    {
      if(!maySetup)
      {
        navigate('/login', { replace: true });
      }
    }, []);
  
    if(!maySetup)
    {
        return ( <React.Fragment></React.Fragment> );
    }
    
    const textDirection = getTextDirection(getCurrentLanguage()?.direction ?? "LTR");
    const formSectionHeaderClassNames = `form-section-head ${textDirection}`;
    const formSectionBodyClassNames = `form-section-body ${textDirection}`;
    const formSectionFooterClassNames = `form-section-foot ${textDirection}`;

    return (
      <React.Fragment>
        <Header displayMode={mode} user={user} />
    
        <div className="container-fluid page-content">
          <div className="row g-0">
            <div className="main-content col-12 col-sm-12 col-md-10 col-lg-6 col-xl-4 offset-1 offset-sm-2 offset-md-1 offset-lg-3 offset-xl-4">
              { isPageReady === "ready" &&  
                <main>                
                  { state.currentStep === "language" && 
                      
                      <div className="form-section card rounded">
                        
                        <form noValidate onSubmit={(e) => validateForm(e, "welcome", 7)}>
                          <div className={formSectionBodyClassNames}>
                          
                              <div className="form-field">
                                <label className="visually-hidden" htmlFor="languageCode">{trx("language")}</label>
                                <FormDropdownBox id="languageCode" options={languages} placeholder="Language" value={calculateDefaultLanguage(state.configuration.languageCode)} sortBy="alpha" onChange={handleLanguageCodeChange} translations={[]} aria-describedby="languageCodeHelp" size={3} />
                                <div id="languageCodeHelp" className="visually-hidden">Language help...</div>
                              </div>

                          </div>

                          <div className={formSectionFooterClassNames}>
                            <button type="submit" className="btn btn-sm btn-primary float-end"><Icon name="mdi-arrow-right" /></button>
                          </div>
                        </form>
                      </div>
                    }
                    
                    { state.currentStep === "welcome" && 
                      
                      <div className="form-section card rounded">
                        {progressBarHtml}
                        <div className={formSectionHeaderClassNames}>{trx("astrana")} {trx("heading_setup_wizard")}</div>
                        
                        <form noValidate onSubmit={(e) => validateForm(e, "termsandconditions", 15)}>
                          <div className={formSectionBodyClassNames}>
                            {trx("setup_wizard_summary")}
                          </div>

                          <div className={formSectionFooterClassNames}>
                            <button className="btn btn-sm btn-back me-1" onClick={() => goToStep("language")} tabIndex={-1}><Icon name="mdi-arrow-left" /></button>
                            <button type="submit" className="btn btn-sm btn-primary btn-next float-end">{trx("heading_terms_and_conditions")} <Icon name="mdi-arrow-right" /></button>
                          </div>
                        </form>
                        
                      </div>
                    }

                    { state.currentStep === "termsandconditions" && 
                      
                      <div className="form-section card rounded">
                        {progressBarHtml}
                        <div className={formSectionHeaderClassNames}>{trx("heading_terms_and_conditions")}</div>
                        
                        <form noValidate onSubmit={(e) => validateForm(e, "localization", 26)}>
                          <div className={formSectionBodyClassNames}>
                            <div className="textblock">
                              <ReactMarkdown>{licenseText}</ReactMarkdown>
                            </div>
                            
                            <div className="form-field">
                              <input className="form-check-input me-2" type="checkbox" value="" id="acceptTerms" checked={state.configuration.acceptedTerms} onChange={handleTermsAndConditionsChange} required autoComplete="off" />
                              <label className="form-check-label" htmlFor="acceptTerms"><b>{trx("accept_astrana_toc")}</b></label>
                            </div>  
                          </div>

                          <div className={formSectionFooterClassNames}>
                            <button className="btn btn-sm btn-back me-1" onClick={() => goToStep("welcome")} tabIndex={-1}><Icon name="mdi-arrow-left" /></button>
                            <button type="submit" className="btn btn-sm btn-primary btn-next float-end">{trx("heading_localization")} <Icon name="mdi-arrow-right" /></button>
                          </div>
                        </form>
                      </div>
                    }

                    { state.currentStep === "localization" && 
                    
                      <div className="form-section card rounded">                      
                        {progressBarHtml}
                        <div className={formSectionHeaderClassNames}>{trx("heading_culture_settings")}</div>
                        
                        <form noValidate onSubmit={(e) => validateForm(e, "database", 37)}>
                          <div className={formSectionBodyClassNames}>
                          
                              <div className="form-field">
                                <label className="visually-hidden" htmlFor="regionCountry">{trx("region")} / {trx("country")}</label>
                                <FormDropdownBox id="countryCode" options={countries} placeholder={trx("region") + "/" + trx("country")} value={state.configuration.regionCode} sortBy="alpha" onChange={handleRegionCodeChange} translations={[]} aria-describedby="regionRegionHelp" />
                              </div> 

                              <div className="form-field">
                                <label className="visually-hidden" htmlFor="timeZone">{trx("time_zone")}</label>
                                <input type="text" className="form-control" id="timeZone" placeholder={trx("time_zone")} aria-describedby="timeZoneHelp" value={state.configuration.timeZone} onChange={handleTimeZoneChange} />
                              </div>                        
                          </div>

                          <div className={formSectionFooterClassNames}>
                            <button className="btn btn-sm btn-back me-1" onClick={() => goToStep("termsandconditions")} tabIndex={-1}><Icon name="mdi-arrow-left" /></button>
                            <button type="submit" className="btn btn-sm btn-primary btn-next float-end">{trx("heading_database")} <Icon name="mdi-arrow-right" /></button>
                          </div>
                        </form>
                      </div>
                    }

                    { state.currentStep === "database" && 
                      <div className="form-section card rounded">
                        {progressBarHtml}
                        <div className={formSectionHeaderClassNames}>
                          <h1>{trx("heading_database")}</h1>
                          <span className="advanced-options float-end">
                            <span className="form-check form-switch">
                              <input className="form-check-input" type="checkbox" id="enableDatabaseAdvanvedOptions" />
                              <label className="form-check-label" htmlFor="enableDatabaseAdvanvedOptions">{trx("advanced")}</label>
                            </span>
                          </span>
                        </div>

                        <form noValidate onSubmit={(e) => validateForm(e, "webserver", 48)}>
                          <div className={formSectionBodyClassNames}>

                            <div className="row ">                            
                              <div className="col-3">
                                <img src={getSelectedDatabaseProviderIcon()} alt={defaultWhenEmpty(state.configuration.databaseProvider, currentDatabaseSettings.databaseProvider)} style={{width: "100%"}} className="database-logo rounded" />
                              </div>

                              <div className="col-9">
                                
                                {databaseOverrideRequired && <span>Override required.</span>}
                                
                                <div className="form-field">
                                  <label className="visually-hidden" htmlFor="databaseProvider">{trx("database_provider")}</label>
                                  <FormDropdownBox id="databaseProvider" options={databaseProviderLookup.options} placeholder={trx("database_provider")} value={state.configuration.databaseProvider} sortBy="alpha" onChange={handleDatabaseProviderChange} translations={[]} aria-describedby="databaseProviderHelp" required />
                                  <div id="databaseProviderHelp" className="visually-hidden">Database help...</div>
                                </div>

                                <div className="row">
                                  <div className="col-9 form-field">
                                    <label className="visually-hidden" htmlFor="databaseHost">{trx("address")}</label>
                                    <input type="text" className="form-control" id="databaseHost" placeholder={trx("address")} value={state.configuration.databaseHost} onChange={handleDatabaseHostChange} autoComplete="off" required />
                                  </div>
                                  
                                  <div className="col-3 form-field">
                                    <label className="visually-hidden" htmlFor="databaseHostPort">{trx("port")}</label>
                                    <input type="text" className="form-control" id="databaseHostPort" placeholder={trx("port")} value={state.configuration.databaseHostPort} onChange={handleDatabaseHostPortChange} autoComplete="off" />
                                  </div>
                                </div>

                                <div className="row">
                                  <div className="col-6 form-field">
                                    <label className="visually-hidden" htmlFor="databaseUsername">{trx("username")}</label>
                                    <input type="text" className="form-control" id="databaseUsername" placeholder={trx("username")} value={state.configuration.databaseUsername} onChange={handleDatabaseUsernameChange} required autoComplete="off" minLength={minimumUsernameLength} />
                                    <div className="invalid-feedback">
                                      Please enter your database username.
                                    </div>
                                  </div>
                                  
                                  <div className="col-6 form-field">
                                    <label className="visually-hidden" htmlFor="databasePassword">{trx("password")}</label>
                                    <input type="password" className="form-control" id="databasePassword" placeholder={trx("password")} value={state.configuration.databasePassword} onChange={handleDatabasePasswordChange} autoComplete="off" required minLength={minimumPasswordLength} />
                                    <div className="invalid-feedback">
                                      Please enter your database password.
                                    </div>
                                  </div>
                                </div>

                                <div className="form-field">
                                  <label className="visually-hidden" htmlFor="databaseName">{trx("name")}</label>
                                  <input type="text" className="form-control" id="databaseName" placeholder={trx("name")} value={state.configuration.databaseName} onChange={handleDatabaseNameChange} autoComplete="off" aria-describedby="databaseNameHelp" />
                                  <div id="databaseNameHelp" className="visually-hidden">Database Name help...</div>
                                </div>
                                
                              </div>
                            </div>

                          </div>
                                              
                          <div className={formSectionFooterClassNames}>
                            <button className="btn btn-sm btn-back me-1" onClick={() => goToStep("localization")} tabIndex={-1}><Icon name="mdi-arrow-left" /></button>
                            
                            {databaseConnectionTestResult && <button type="submit" className="btn btn-sm btn-primary btn-next float-end" disabled={databaseConnectionTestStatus === "working"}>Web Server <Icon name="mdi-arrow-right" /></button>}

                            {databaseConnectionTestStatus === "complete" && 
                              <button className={`btn btn-sm ${databaseConnectionTestResult ? "btn-outline-success" : "btn-outline-secondary"} float-end me-1`} onClick={() => testDatabaseConnection()} tabIndex={-1}>
                                {trx("test_connection")}
                                { databaseConnectionTestResult && <Icon name="ms-1 mdi-check-circle" />}
                              </button> 
                            }
                            
                            {databaseConnectionTestStatus === "working" && <button className="btn btn-sm btn-outline-secondary btn-next float-end me-1" tabIndex={-1} disabled>
                                                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                                        <span className="visually-hidden">{trx("testing")}...</span>
                                                                    </button> 
                                                                  }                            
                          </div>
                        </form>
                      </div>
                    }

                    { state.currentStep === "webserver" && 
                      <div className="form-section card rounded">                      
                        {progressBarHtml}
                        <div className={formSectionHeaderClassNames}>Web Server</div>
                        
                        <form noValidate onSubmit={(e) => validateForm(e, "usercredentials", 59)}>
                          <div className={formSectionBodyClassNames}>
                            
                            <div className="form-field">
                              <label className="visually-hidden" htmlFor="databaseProvider">Web Server</label>                              
                              <div id="databaseProviderHelp" className="visually-hidden">Web Server help...</div>
                            </div>

                            <div className="row ">
                              <div className="col-9 form-field">
                                <label className="visually-hidden" htmlFor="databaseHost">Address</label>
                                <input type="text" className="form-control" id="databaseHost" placeholder="Address" value={state.configuration.databaseHost} onChange={handleDatabaseHostChange} autoComplete="off" />
                              </div>
                              
                              <div className="col-3 form-field">
                                <label className="visually-hidden" htmlFor="databaseHostPort">Port</label>
                                <input type="text" className="form-control" id="databaseHostPort" placeholder="Port" value={state.configuration.databaseHostPort} onChange={handleDatabaseHostPortChange} autoComplete="off" />
                              </div>
                            </div>

                            <div className="form-field">
                              <label className="visually-hidden" htmlFor="databaseName">SSL Certificate</label>
                              <input type="text" className="form-control" id="databaseName" placeholder="SSL Certificate" value={state.configuration.databaseName} onChange={handleDatabaseNameChange} autoComplete="off" aria-describedby="databaseNameHelp" />
                              <div id="databaseNameHelp" className="visually-hidden">SSL Certificate help...</div>
                            </div>
                          </div>
                                        
                          <div className={formSectionFooterClassNames}>
                            <button className="btn btn-sm btn-back me-1" onClick={() => goToStep("database")} tabIndex={-1}><Icon name="mdi-arrow-left" /></button>
                            <button type="submit" className="btn btn-sm btn-primary btn-next float-end">{trx("heading_user_credentials")} <Icon name="mdi-arrow-right" /></button>
                          </div>
                        </form>
                      </div>
                    }

                    { state.currentStep === "usercredentials" && 
                      <div className="form-section card rounded">                          
                        {progressBarHtml}
                        <div className={formSectionHeaderClassNames}>{trx("heading_user_credentials")}</div>
                            
                        <form noValidate onSubmit={(e) => validateForm(e, "userinformation", 80)}>
                          <div className={formSectionBodyClassNames}>
                            
                            <div className="form-field">
                              <label className="visually-hidden" htmlFor="username">{trx("username")}</label>
                              <div className="input-group">
                                <div className="input-group-text">@</div>
                                <input type="text" className="form-control" id="username" placeholder={trx("username")} value={state.configuration.username} onChange={handleUsernameChange} aria-describedby="usernameHelp" required autoComplete="off"  />
                              </div>
                              <div className="invalid-feedback">
                                  Please choose a username.
                                </div>
                              <div id="usernameHelp" className="visually-hidden">This is the username you'll use to login with.</div>
                            </div>

                            <div className="row ">
                              <div className="col-6 form-field">
                                <label className="visually-hidden" htmlFor="password">{trx("password")}</label>
                                <input type="password" className="form-control" id="password" placeholder={trx("password")} value={state.configuration.password} onChange={handlePasswordChange} autoComplete="off" required minLength={minimumPasswordLength} />
                              </div>
                              
                              <div className="col-6 form-field">
                                <label className="visually-hidden" htmlFor="confirmPassword">{trx("confirm_password")}</label>
                                <input type="password" className="form-control" id="password" placeholder={trx("confirm_password")} value={state.configuration.confirmPassword} onChange={handleConfirmPasswordChange} autoComplete="off" required minLength={minimumPasswordLength} />
                              </div>
                            </div>

                            <div className="form-field">
                              <label className="visually-hidden" htmlFor="emailAddress">{trx("email_address")}</label>
                              <input type="email" className="form-control" id="emailAddress" placeholder={trx("email_address")} value={state.configuration.emailAddress} onChange={handleEmailAddressChange} aria-describedby="emailHelp" autoComplete="off" required />
                            </div>

                            <div className="row form-field">
                              <div className="input-group">
                                <label className="visually-hidden" htmlFor="phoneCode">{trx("phone_code")}</label>
                                <FormComboBox options={phoneCodes} optionPrefix="+" inputClassName="form-control" id="phoneCode" placeholder="Phone Code" defaultValue={defaultPhoneCode} placeholderIcon="https://cdn3.iconfinder.com/data/icons/mission/500/yul754_12_flag_mission_business_logo_hand_silhouette_person-256.png" onChange={handlePhoneCodeChange} onSelect={handlePhoneCodeSelect} aria-describedby="phoneCodeHelp"></FormComboBox>
                                <label className="visually-hidden" htmlFor="phoneNumber">{trx("phone_number")}</label>
                                <input type="text" className="form-control" id="phoneNumber" placeholder={trx("phone_number")} value={state.configuration.phoneNumber} onChange={handlePhoneNumberChange} aria-describedby="phoneNumberHelp" />
                              </div>
                            </div>

                          </div>
                          
                          <div className={formSectionFooterClassNames}>
                            <button className="btn btn-sm btn-back me-1" onClick={() => goToStep("webserver")} tabIndex={-1}><Icon name="mdi-arrow-left" /></button>
                            <button type="submit" className="btn btn-sm btn-primary btn-next float-end">{trx("heading_user_information")} <Icon name="mdi-arrow-right" /></button>
                          </div>
                        </form>
                      </div>
                    }

                    { state.currentStep === "userinformation" &&                
                      <div className="form-section card rounded">                      
                        {progressBarHtml}
                        <div className={formSectionHeaderClassNames}>{trx("heading_user_information")}</div>
                            
                        <form id="setupForm" noValidate onSubmit={(e) => validateForm(e, "summary", 91)}>   
                            <div className={formSectionBodyClassNames}>
                              
                              <div className="row ">
                                <div className="col-6 form-field">
                                  <label className="visually-hidden" htmlFor="firstName">{trx("first_name")}</label>
                                  <input type="text" className="form-control" id="firstName" placeholder={trx("first_name")} aria-describedby="firstNameHelp" value={state.configuration.firstName} onChange={handleFirstNameChange} autoComplete="off" required />
                                </div>
                                
                                <div className="col-6 form-field">
                                  <label className="visually-hidden" htmlFor="lastName">{trx("last_name")}</label>
                                  <input type="text" className="form-control" id="lastName" placeholder={trx("last_name")} aria-describedby="lastNameHelp" value={state.configuration.lastName} onChange={handleLastNameChange} autoComplete="off" required />
                                </div>
                              </div>

                              <div className="row ">
                                <div className="col-6 form-field">
                                  <label className="visually-hidden" htmlFor="gender">{trx("gender")}</label>
                                  <FormDropdownBox id="gender" options={genderLookup.options} placeholder={trx("gender")} value={state.configuration.gender} sortBy="alpha" onChange={handleGenderChange} translations={[]} aria-describedby="genderHelp" autoComplete="off" required />
                                  <div id="genderNameHelp" className="visually-hidden">Geneder help...</div>
                                </div>
                                
                                <div className="col-6 form-field">
                                  <label className="visually-hidden" htmlFor="dateOfBirth">{trx("date_of_birth")}</label>
                                  <div className="input-group">
                                    <div className="input-group-text">
                                      <Icon name="mdi-calendar" />
                                    </div>
                                    <input type="text" onFocus={(e) => switchFieldType(e, "date")} onBlur={(e) => switchFieldType(e, "text")} className="form-control" id="dateOfBirth" placeholder={trx("date_of_birth")} aria-describedby="dateOfBirthHelp" value={state.configuration.dateOfBirth} onChange={handleDateOfBirthChange} autoComplete="off" required max={today} />
                                  </div>                          
                                </div>
                                
                              </div>

                            </div>
                            
                            <div className={formSectionFooterClassNames}>
                              <button className="btn btn-sm btn-back me-1" onClick={() => goToStep("usercredentials")} tabIndex={-1}><Icon name="mdi-arrow-left" /></button>
                              <button type="submit" className="btn btn-sm btn-primary btn-next float-end">{trx("heading_summary")} <Icon name="mdi-arrow-right" /></button>
                            </div>
                        </form>
                      </div>
                    }
                    
                    { state.currentStep === "summary" && 
                      <div className="form-section card rounded">                      
                        {progressBarHtml}
                        <div className={formSectionHeaderClassNames}>{trx("heading_summary")}</div>

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
                              {state.installStatus === "gathering" && <button className="btn btn-sm btn-back me-1" onClick={() => goToStep("userinformation")} tabIndex={-1}><Icon name="mdi-arrow-left" /></button> }
                              {state.installStatus === "gathering" && <input type="submit" className="btn btn-sm btn-primary float-end" value={trx("confirm")} /> }
                              {state.installStatus === "installing" && <button disabled className="btn btn-sm btn-primary float-end">
                                                                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                                          <span className="visually-hidden">{trx("configuring")}...</span>
                                                                      </button> 
                                                                    }
                            </div>
                        </form>
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