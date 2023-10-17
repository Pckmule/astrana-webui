import _ from 'lodash';

import { ContentCollectionType } from '../types/enums/contentCollectionType';

import { IApiResponse } from '../types/api/apiResponse';
import { IContentCollection, IContentCollectionItem } from '../types/interfaces/contentCollection';

import ApiService from "./ApiService";
import { OrderByDirection } from '../types/enums/orderByDirection';

export default function ContentCollectionService() 
{
    async function getContentCollection(contentcollectionId: string, includeContentItems?: boolean) 
    {
        if(_.isEmpty(contentcollectionId))
            return Promise.reject(new Error("contentcollectionId is invalid."));

        const endpoint = `contentcollections/${contentcollectionId}`;

        const parameters = ApiService().buildParameters([]);
  
		if(includeContentItems)
			parameters.push({ key: "includeContentItems", value: `${includeContentItems}` });

        return ApiService().get(endpoint, undefined, parameters).then((response: IApiResponse<IContentCollection> | undefined) =>
        {
            const data:IContentCollection | null = ApiService().getDataPayload(response);

            if(!data)
                return Promise.reject(ApiService().buildNoPayloadError("contentcollection"));

            return Promise.resolve<IContentCollection>(data);

        }).catch((error: Error) => 
        {
            return Promise.reject(error);
        });
    }

    async function getContentCollections(includeContentItems?: boolean, collectionType?: ContentCollectionType, orderBy?: string, orderByDirection?: OrderByDirection, page: number = 1, pageSize: number = 20) 
    {
        const endpoint = "contentcollections";

        const parameters = ApiService().buildParameters([
			{ key: "page", value: page },
			{ key: "pageSize", value: pageSize }
		]);

		if(collectionType)
			parameters.push({ key: "collectionType", value: collectionType });

		if(includeContentItems === true)
			parameters.push({ key: "includeContentItems", value: "true" });

		if(orderBy && !_.isEmpty(orderBy))
			parameters.push({ key: "orderBy", value: orderBy });
		
		if(orderByDirection)
			parameters.push({ key: "orderByDirection", value: `${orderByDirection}` });
		
        return ApiService().get(endpoint, undefined, parameters).then((response: IApiResponse<IContentCollection[]> | undefined) =>
        {
            const data:IContentCollection[] | null = ApiService().getDataPayload(response);
			
            if(!data)
                return Promise.reject(ApiService().buildNoPayloadError("contentcollection"));

            return Promise.resolve(data);

        }).catch((error: Error) => 
        {
            return Promise.reject(error);
        });
    }
    
	async function createContentCollection(contentItems: IContentCollectionItem[], name?: string, collectionType: ContentCollectionType = ContentCollectionType.Generic) 
	{
		const endpoint = "contentcollections";

		const collectionToCreate: any = 
		{
			"collectionType": collectionType,
			"contentItems": contentItems 
		};

		if(name && !_.isEmpty(name))
			collectionToCreate.name = name;

		const payload = [collectionToCreate];

		return ApiService().put(endpoint, payload).then((response: IApiResponse<IContentCollection[]>) =>
		{
			const data: IContentCollection[] | null = ApiService().getDataPayload(response);

			if(!data || data.length < 1)
				return Promise.reject(ApiService().buildNoPayloadError("contentcollection"));

			return Promise.resolve(data[0]);

		}).catch((error: Error) => 
		{
			return Promise.reject(error);
		});
	}
	
	return {
		getContentCollection,
		getContentCollections,
		createContentCollection
	};
}