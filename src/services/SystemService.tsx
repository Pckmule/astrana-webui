import _ from 'lodash';

import { IApiResponse } from '../types/api/apiResponse';
import { ILanguageData } from '../types/objects/globalization';
import { ICountryData } from '../types/data/country';
import { IDatabaseConnectionTestSettings, IDatabaseSettings } from '../types/interfaces/databaseSettings';

import ApiService from "./ApiService";

export default function SystemService() 
{
    async function getSetupStatus() 
    {
        const endpoint = "system/setup/status";

        return ApiService().getAll(endpoint).then((response: any | undefined) =>
        {
            const status = ((!response || !_.isString(response)) || _.isEmpty(response) ? "unknown" : response.toLowerCase());

            return Promise.resolve(status);

        }).catch((error: Error) => 
        {
            return Promise.reject(error);
        });
    }
    
    async function getLicense(languageCode: string, format?: string) 
    {
        const endpoint = "legal/license";

        const parameters = ApiService().buildParameters([
            { key: "languageCode", value: languageCode },
            { key: "format", value: format ?? "markdown" }
          ]);
    
        return ApiService().get(endpoint, undefined, parameters).then((response: string | null | undefined) =>
        {
            const licenseText: string = response ?? "";

            return Promise.resolve(licenseText);

        }).catch((error: Error) => 
        {
            return Promise.reject(error);
        });        
    }
    
    async function getLanguages() 
    {
        const endpoint = "internationalization/languages";

        return ApiService().getAll(endpoint).then((response: IApiResponse<ILanguageData[]>) =>
        {
            const data: ILanguageData[] | null = ApiService().getDataPayload(response);

            if(!data)
                return Promise.reject(ApiService().buildNoPayloadError("languages"));

            return Promise.resolve<ILanguageData[]>(data);

        }).catch((error: Error) => 
        {
            return Promise.reject(error);
        });        
    }
    
    async function getCountries() 
    {
        const endpoint = "system/countries";

        const parameters = ApiService().buildParameters([
            { key: "pageSize", value: "500"}
          ]);
    
        return ApiService().get(endpoint, undefined, parameters).then((response: IApiResponse<ICountryData[]>) =>
        {
            const data:ICountryData[] | null = ApiService().getDataPayload(response);

            if(!data)
                return Promise.reject(ApiService().buildNoPayloadError("countries"));

            return Promise.resolve<ICountryData[]>(data);

        }).catch((error: Error) => 
        {
            return Promise.reject(error);
        });        
    }

    async function getSetupDatabaseSettings() 
    {
        const endpoint = "system/setup/database/settings";

        return ApiService().getAll(endpoint).then((response: IApiResponse<IDatabaseSettings>) =>
        {
            const data:IDatabaseSettings | null = ApiService().getDataPayload(response);

            if(!data)
                return Promise.reject(ApiService().buildNoPayloadError("database settings"));

            return Promise.resolve<IDatabaseSettings>(data);

        }).catch((error: Error) => 
        {
            return Promise.reject(error);
        });        
    }
   
    async function testDatabaseConnection(databaseSettings: IDatabaseConnectionTestSettings) 
    {
        const endpoint = "system/setup/database/test";

        return ApiService().post(endpoint, databaseSettings).then((response: any | undefined) => 
        {
            return Promise.resolve<boolean>(true);

        }).catch((error: Error) => 
        {
            return Promise.reject(false);
        });        
    }

    return {
        getSetupStatus,
        getSetupDatabaseSettings,
        testDatabaseConnection,
        getLicense,
        getLanguages,
        getCountries, 
    };
}