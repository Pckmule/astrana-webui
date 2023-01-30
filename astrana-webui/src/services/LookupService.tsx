import _ from 'lodash';

import ApiService from "./ApiService";

export default function LookupService() 
{
    async function getLookup(name: string) 
    {
        const endpoint = "settings/lookup/" + name.toLowerCase();

        return ApiService().get(endpoint).then((response: any | undefined) =>
        {
            const lookup = (response == null || _.isEmpty(response) || !_.isString(response)) ? response : {};

            return Promise.resolve(lookup);

        }).catch((error: Error) => 
        {
            return Promise.reject(error);
        });
    }
    
    return {
      getLookup: getLookup
    };
}