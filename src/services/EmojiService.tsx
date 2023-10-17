import _ from 'lodash';

import { IQueryParameter } from '../types/api/api';

import ApiService from "./ApiService";

export default function EmojiService() 
{
    async function getEmojis() 
    {
        const endpoint = "emoji";

        const parameters: IQueryParameter[] = [];
  
        return ApiService().get(endpoint, undefined, parameters).then((response: any | undefined) =>
        {
            return Promise.resolve((response && _.isObject(response.data)) ? response.data : {});

        }).catch((error: Error) => 
        {
            return Promise.reject(error);
        });
    }
    return {
      getEmojis
    };
}