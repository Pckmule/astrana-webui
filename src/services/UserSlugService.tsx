import _ from 'lodash';

import ApiService from "./ApiService";

export default function UserSlugService() 
{
    const cacheKey = "userSlugs";

    async function getSlugs()
    {
        const endpoint = "settings/slugs"

        return ApiService().get(endpoint).then((response: any | undefined) =>
        {
            return Promise.resolve((response && _.isObject(response.data)) ? response.data : {});

        }).catch((error: Error) => 
        {
            return Promise.reject(error);
        });
    }

    async function getSlug(slugId: string) 
    {
        const slugs = localStorage ? localStorage.getItem(cacheKey) : undefined;

        const slug = JSON.parse(slugs ?? "{}")[slugId];

        if(slug || !_.isEmpty(slug))
            return Promise.resolve(slug);

        return getSlugs().then((response: any | undefined) =>
        {
            const slugs = (response && _.isObject(response.data)) ? response.data : null;
    
            if(localStorage && slugs)
              localStorage.setItem(cacheKey, slugs);
    
            return Promise.resolve((response && _.isObject(response.data)) ? response.data[slugId] : null);

        }).catch((error: Error) => 
        {
            return Promise.reject(error);
        });
    }

    return {
        getSlugs,
        getSlug,
    };
}