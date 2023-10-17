import _ from 'lodash';

import { ILookupData } from '../types/data/lookup';

import ApiService from "./ApiService";

export default function LookupService() 
{
    async function getLookup(name: string) 
    {
        const endpoint = "settings/lookup/" + name.toLowerCase();

        return ApiService().get(endpoint).then((response: ILookupData) =>
        {
            const data:ILookupData | null = ApiService().getDataPayload(response);

            if(!data)
                return Promise.reject(ApiService().buildNoPayloadError(name.toLowerCase()));

            return Promise.resolve<ILookupData>(data);

        }).catch((error: Error) => 
        {
            return Promise.reject(error);
        });
    }
    
    return {
      getLookup
    };
}