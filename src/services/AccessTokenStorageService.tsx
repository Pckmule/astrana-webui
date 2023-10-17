import _ from 'lodash';

import LocalCacheService from './LocalCacheService';

export default function AccessTokenStorageService() 
{
    const accessTokenStorageKey = "api_access_token";

    const localCacheService = LocalCacheService();

    function storeAccessToken(accessToken: string)
    {
        localCacheService.setCacheItem(accessTokenStorageKey, accessToken);
    }

    function clearAccessToken()
    {
        localCacheService.setCacheItem(accessTokenStorageKey, "");
    }

    function getAccessToken()
    {
        return localCacheService.getCacheItem(accessTokenStorageKey);
    }

    return {
        set: storeAccessToken,
        clear: clearAccessToken,
        getCurrent: getAccessToken
    };
}