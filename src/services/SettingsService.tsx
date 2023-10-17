import _ from 'lodash';

import { IApiResponse } from '../types/api/apiResponse';
import { ISystemSetting, ISystemSettingCategory } from '../types/interfaces/settings';

import ApiService from "./ApiService";

export default function SettingsService() 
{
    const defaults = 
    {
        languageCode: "EN"
    };

    async function getAll() 
    {
        const endpoint = "settings";

        return ApiService().get(endpoint).then((response: IApiResponse<ISystemSetting[]> | undefined) =>
        {
            const data:ISystemSetting[] | null = ApiService().getDataPayload(response);

            if(!data)
                return Promise.reject(ApiService().buildNoPayloadError("setting"));

            return Promise.resolve(data);

        }).catch((err: Error) => 
        {
            return Promise.reject(err);
        });
    }

    async function getByCategory(category: string) 
    {
        const endpoint = "settings";

        const requestParamters = ApiService().buildParameters([
            { 
                key: "categories",
                value: category 
            }
        ]);
  
        return ApiService().get(endpoint, undefined, requestParamters).then((response: IApiResponse<ISystemSetting[]> | undefined) =>
        {
            const data:ISystemSetting[] | null = ApiService().getDataPayload(response);

            if(!data)
                return Promise.reject(ApiService().buildNoPayloadError("setting"));

            return Promise.resolve(data);

        }).catch((err: Error) => 
        {
            return Promise.reject(err);
        });
    }

    async function getCategories() 
    {
        const endpoint = "settings/categories";

        return ApiService().get(endpoint).then((response: IApiResponse<ISystemSettingCategory[]> | undefined) =>
        {
            const data:ISystemSettingCategory[] | null = ApiService().getDataPayload(response);

            if(!data)
                return Promise.reject(ApiService().buildNoPayloadError("setting category"));

            return Promise.resolve(data);

        }).catch((err: Error) => 
        {
            return Promise.reject(err);
        });
    }
    
    async function getSetting(settingId: string) 
    {
        if(_.isEmpty(settingId))
            return Promise.reject(new Error("settingId is invalid."));

        const endpoint = `settings/${settingId}`;

        return ApiService().get(endpoint).then((response: IApiResponse<ISystemSetting> | undefined) =>
        {
            const data:ISystemSetting | null = ApiService().getDataPayload(response);

            if(!data)
                return Promise.reject(ApiService().buildNoPayloadError("setting"));

            return Promise.resolve<ISystemSetting>(data);

        }).catch((err: Error) => 
        {
            return Promise.reject<Error>(err);
        });
    }
    
    async function getSettingValue(settingId: string) 
    {
        return getSetting(settingId).then((setting: any) =>
        {
            if(!setting)
                return Promise.reject(ApiService().buildError("setting"));

            const returnValue = setting.value ?? setting.defaultValue ?? null;

            if(returnValue === null)
                return Promise.reject(new Error("Value not set."));
            
            if(setting.dataType === "number")
                return Promise.resolve(parseInt(setting.value, 10));

            return Promise.resolve(setting.value);

        }).catch((err: Error) => 
        {
            return Promise.reject(err);
        });
    }

    function find(settings: ISystemSetting[], settingName: string) 
    {
        return _.find(settings, (o) => o.name.toLowerCase() === settingName.toLowerCase());
    }

    function findValue(settings: ISystemSetting[], settingName: string, fallbackValue?: any) 
    {
        const setting = find(settings, settingName);

        if(setting)
        {
            if(setting.value && !_.isEmpty(setting.value))
                return setting.value;
                
            if(setting.defaultValue && !_.isEmpty(setting.defaultValue))
                return setting.defaultValue;
        }
        
        if(!setting && fallbackValue && !_.isEmpty(fallbackValue))
            return fallbackValue;

        return null;
    }

    return {
        defaults,
        getCategories,
        getAll,
        getByCategory,
        getSetting,
        getSettingValue,
        find,
        findValue
    };
}