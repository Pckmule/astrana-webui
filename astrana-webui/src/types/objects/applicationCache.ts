export interface IApplicationCache
{
    lastModified: Date;
    items: IApplicationCacheItem[] | null;
}

export interface IApplicationCacheItem
{
    value: string;
    lastModified: Date;
    items: IApplicationCacheItem[] | null;
}