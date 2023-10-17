import _ from 'lodash';

import { LogLevel } from '../types/enums/logLevel';

export default function LogService() 
{
	const debugModeKey = "logLevel";
	const enableModeKey = "enableLogging";

    const isStorageAvailable = () => 
    {      
        if(localStorage)
          return true;

        console.warn("Local Storage is not supported by this Web Browser.");
        return false;
    }

    const isEnabled = () => 
    {      
        if(!isStorageAvailable())
			return false;
		
		return localStorage.getItem(enableModeKey) === "true" ? true : false;
    }

    const getLogLevel = (): LogLevel => 
    {
		if(!isStorageAvailable())
			return LogLevel.None;
		
		switch(localStorage.getItem(debugModeKey))
		{
			case `${LogLevel.Info}`: return LogLevel.Info;
			case `${LogLevel.Warn}`: return LogLevel.Warn;
			case `${LogLevel.Error}`: return LogLevel.Error;
			case `${LogLevel.Debug}`: return LogLevel.Debug;
		}
	
		return LogLevel.None;
    }

    const getLogLevelName = () => 
    {
		return LogLevel[getLogLevel()];
    }

    const setLogLevel = (logLevel: LogLevel) => 
    {
		if(!isStorageAvailable())
			return;
	
		localStorage.setItem(debugModeKey, `${logLevel}`);

		console.info(`Log Level set to ${LogLevel[logLevel]}`);
    }

    const setLogLevelByName = (logLevel: string) => 
    {
		switch(logLevel.toLowerCase())
		{
			case "info" : setLogLevel(LogLevel.Info); break;
			case "warn" : setLogLevel(LogLevel.Warn); break;
			case "error" : setLogLevel(LogLevel.Error); break;
			case "debug" : setLogLevel(LogLevel.Debug); break;
			case "none" : setLogLevel(LogLevel.None); break;
			
			default: 
				console.log(`${logLevel} is not a valid log level.`) ;
			break;
		}
    }

    const enableDisableLogging = (enable: boolean) => 
    {
		if(!isStorageAvailable())
			return;

		localStorage.setItem(enableModeKey, enable === true ? "true" : "false");

		console.info(enableModeKey, enable === true ? "Enabled logging." : "Disabled logging.");
    }

    const log = (message?: any) => 
    {
		if(!isEnabled() || getLogLevel() < LogLevel.Info)
			return;
		
		console.log(message);
    }

    const info = (message?: any) => 
    {
		if(!isEnabled() || getLogLevel() < LogLevel.Info)
			return;
		
		console.info(message);
    }

    const warn = (message?: any) => 
    {
		if(!isEnabled() || getLogLevel() < LogLevel.Warn)
			return;

		console.warn(message);
    }

    const error = (message?: any, data?: any) => 
    {
		if(!isEnabled() || getLogLevel() < LogLevel.Error)
			return;

		data ? console.error(message, data) : console.error(message);
    }

    const debug = (message?: any, data?: any) => 
    {
		if(!isEnabled() || getLogLevel() < LogLevel.Debug)
			return;
		
		data ? console.debug(message, data) : console.debug(message);
    }

	window.logging = {
	    enable: () => enableDisableLogging(true),
		disable: () => enableDisableLogging(false),
	    getLogLevel: getLogLevelName,
	    setLogLevel: setLogLevelByName
	};

	return {
		isEnabled,
	    enable: () => enableDisableLogging(true),
		disable: () => enableDisableLogging(false),
	    getLogLevel,
		getLogLevelName,
	    setLogLevel,
		setLogLevelByName,
		log,
		info,
		warn,
		error,
		debug
	};
}