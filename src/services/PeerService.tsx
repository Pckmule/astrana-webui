import _ from 'lodash';

import { IQueryParameter } from '../types/api/api';

import ApiService from "./ApiService";

export default function PeerService() 
{
    async function getProfile(peerId: string) 
    {
        if(_.isEmpty(peerId))
            return Promise.reject(new Error("peerId is invalid."));

        const endpoint = `peers/${peerId}/profile`;

        return ApiService().get(endpoint).then((response: any | undefined) =>
        {
            return Promise.resolve((response && _.isObject(response.data)) ? response.data : {});

        }).catch((err: Error) => 
        {
            return Promise.reject(err);
        });
    }

    async function getPeers(page: number, pageSize: number) 
    {
        const endpoint = "peers";

        const parameters: IQueryParameter[] = [
            { key: "page", value: page },
            { key: "pageSize", value: pageSize }
          ];
  
        return ApiService().get(endpoint, undefined, parameters).then((response: any | undefined) =>
        {
            return Promise.resolve((response && _.isObject(response.data)) ? response.data : {});

        }).catch((err: Error) => 
        {
            return Promise.reject(err);
        });
    }
    
    return {
      getProfile,
      getPeers
    };
}