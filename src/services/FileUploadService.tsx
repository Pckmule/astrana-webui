import _ from 'lodash';

import ApiService from "./ApiService";

export default function FileUploadService() 
{
    async function save(data: any) 
    {
        const endpoint = "images/upload";

        return ApiService().postFormData(endpoint, data).then((response: any | undefined) =>
        {
            const results = (response && _.isObject(response.data)) ? response.data : null;

            return Promise.resolve(results);

        }).catch((err: Error) => 
        {
            return Promise.reject(err);
        });
    };

    return {
      save
    };
}