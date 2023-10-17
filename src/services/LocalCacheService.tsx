import _ from 'lodash';
import moment from 'moment';

interface ICachePolicy
{
	maxItems: number | null;
}

interface ICacheItem
{
	expires: Date;
	data: any;
	policy: ICachePolicy;
}

export default function LocalCacheService()
{
    const isStorageAvailable = () => 
    {      
        if(localStorage)
          return true;

        console.warn("Local Storage is not supported by this Web Browser.");
        return false;
    }

    const buildCache = (items?: any, expires?: Date, maxItems?: number) => 
    {      
        if(!isStorageAvailable())
          return null;

		const policy: ICachePolicy = {
			maxItems: maxItems ?? null
		};
		
		const cache: ICacheItem = 
		{
          expires: expires ?? new Date(moment(Date.now()).add(60, 'm').toDate()),
          data: items,
		  policy: policy
        };

		return cache;
    }

    const isCacheValid = (cache: ICacheItem) => 
    {
        if(!cache)
          return false;

        if(!cache.expires || !(cache.expires instanceof Date))
            return false;
			
        if(!cache.data)
            return false;

		return true;
    }

    const enforcePolicy = (cache: ICacheItem) => 
    {
        if(!cache || !cache.policy)
          return cache;

        if(cache.policy.maxItems && cache.policy.maxItems > 0)
		{
			if(Array.isArray(cache.data))
				cache.data = cache.data.slice(0, cache.policy.maxItems);
		}

		return cache;
    }

    const configCache = (cacheKey: string, maxItems?: number) => 
    {
        if(!isStorageAvailable())
          return null;

        const cache = getCache(cacheKey) ?? buildCache();

		if(!cache)
			return null;


		if(cache.policy && maxItems)
			cache.policy.maxItems = maxItems;

		if(!cache.data)
			cache.data = [];

		localStorage.setItem(cacheKey, JSON.stringify(enforcePolicy(cache)));
    }

    const getCache = (cacheKey: string) => 
    {
		if(!isStorageAvailable())
			return null;

		const raw = localStorage.getItem(cacheKey) ?? "null";

		try
		{
			const cache: ICacheItem = JSON.parse(raw, function (key, value) 
			{
				if (key === "expires" && typeof value === "string") 
				{
					return new Date(value);
				}
	
				return value;
			});

			return isCacheValid(cache) ? cache : null;
		}
		catch(ex)
		{
			return null;
		}
    }

    const getCacheData = (cacheKey: string) => 
    {
        if(!isStorageAvailable())
          return null;
        
        const cache = getCache(cacheKey);

        return (cache) ? cache.data : null;
    }

    const getCacheItems = (cacheKey: string) => 
    {
        const cacheData = getCacheData(cacheKey);

        if(cacheData)
          return Array.isArray(cacheData) ? cacheData : [cacheData];

        return [];
    }

    const getCacheItem = (cacheKey: string) => 
    {
        const items = getCacheItems(cacheKey);

        if(items)
          return Array.isArray(items) ? items[0] : items;

        return undefined;
    }

    const getCacheItemsCount = (cacheKey: string) => 
    {
        return getCacheItems(cacheKey).length;
    }

    const setCacheData = (cacheKey: string, data: any) => 
    {
        if(!isStorageAvailable())
          return;

        let cache = getCache(cacheKey);

        if(cache)
          cache.data = data;
        else
          cache = buildCache(data);

		if(cache)
        	localStorage.setItem(cacheKey, JSON.stringify(enforcePolicy(cache)));
    }

    const setCacheItems = (cacheKey: string, items: any[]) => 
    {
        setCacheData(cacheKey, items);
    }

    const setCacheItem = (cacheKey: string, item: any) => 
    {
        setCacheData(cacheKey, [item]);
    }

    const addItem = (cacheKey: string, item: any, pushStart?: boolean) => 
    {
        if(!isStorageAvailable())
          return;

        const items = getCacheItems(cacheKey);

		if(_.some(items, item))
			return;
		
		pushStart ? items.unshift(item) : items.push(item);
		
        setCacheItems(cacheKey, items);
    }
    
    const empty = (cacheKey: string) => 
    {
		if(!isStorageAvailable())
			return null;

		localStorage.removeItem(cacheKey);
    }

    const emptyAll = (cacheKey: string) => 
    {
		if(!isStorageAvailable())
			return null;

		localStorage.clear();
    }

    return {
		configCache,
		getCacheItemsCount,
		getCacheItems,
		getCacheItem,
		setCacheItems,
		setCacheItem,
		addItem,
		empty,
		emptyAll
    };
}