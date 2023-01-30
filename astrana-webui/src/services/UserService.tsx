import _ from 'lodash';

import ApiService from "./ApiService";

export default function UserService() 
{
    async function getProfile() 
    {
        const endpoint = "user/profile"

        return ApiService().get(endpoint).then((response: any | undefined) =>
        {
            return Promise.resolve((response && _.isObject(response.data)) ? response.data : {});

        }).catch((err: Error) => 
        {
            return Promise.reject(err);
        });
    }
    
    return {
      getProfile: getProfile
    };
}