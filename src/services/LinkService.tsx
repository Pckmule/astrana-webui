import _ from 'lodash';

import { IQueryParameter } from '../types/api/api';

import ApiService from "./ApiService";

import { ILink } from '../types/interfaces/link';

export default function LinkService() 
{
    const urlRegex = /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/ig;
    
    function getAllUrlsInText(text: string)
    {
        return text.match(urlRegex) ?? [];
    }

    function getUrlInText(index: number, text: string, defaultValue?: string)
    {
        const urls = getAllUrlsInText(text);

        return urls.length > index ? urls[index] : defaultValue ?? undefined;
    }

    async function getSummary(url: string) 
    {
        const endpoint = "links/summary";

        const parameters: IQueryParameter[] = [
            { key: "url", value: url },
        ];

        return ApiService().get(endpoint, undefined, parameters).then((response: any | undefined) =>
        {
            const results = (response && _.isObject(response.data)) ? response.data : null;

            return Promise.resolve(results);

        }).catch((err: Error) => 
        {
            return Promise.reject(err);
        });
    };

    async function createLink(linkData: ILink) 
    {
        const endpoint = "links";

        const payload = [linkData];

        return ApiService().put(endpoint, payload).then((response: any | undefined) =>
        {
            return Promise.resolve((response && _.isObject(response.data)) ? response.data : {});

        }).catch((error: Error) => 
        {
            return Promise.reject(error);
        });
    }
    
    return {
        getSummary,
        getAllUrlsInText,
        getUrlInText,
        createLink
    };
}