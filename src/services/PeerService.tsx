import _ from 'lodash';

import { IApiResponse } from '../types/api/apiResponse';
import { IQueryParameter } from '../types/api/api';
import { IPeerSummary } from '../types/interfaces/peerSummary';
import { IPeerProfile } from '../types/interfaces/peerProfile';

import ApiService from "./ApiService";

export default function PeerService() 
{

	const placeholderProfilePictureUrl = "/images/placeholder-profile-picture.png";
	const placeholderProfileCoverPictureUrl = "/images/placeholder-profile-cover-picture.png";

	async function getProfile(peerId: string) 
	{
		if(_.isEmpty(peerId))
			return Promise.reject(new Error("peerId is invalid."));

		const endpoint = `peers/${peerId}/profile`;

		return ApiService().get(endpoint).then((response: any | undefined) =>
		{
			return Promise.resolve((response && _.isObject(response.data)) ? response.data : {});

		}).catch((error: Error) => 
		{
			return Promise.reject(error);
		});
	}

    async function getPeers(page: number, pageSize: number) 
    {
        const endpoint = "peers";

        const parameters = ApiService().buildParameters([
            { key: "page", value: page },
            { key: "pageSize", value: pageSize }
          ]);
  
        return ApiService().get(endpoint, undefined, parameters).then((response: IApiResponse<IPeerSummary[]> | undefined) =>
        {
            const data:IPeerSummary[] | null = ApiService().getDataPayload(response);
			console.dir(data);
            if(!data)
                return Promise.reject(ApiService().buildNoPayloadError("peer"));

            return Promise.resolve(data);

        }).catch((error: Error) => 
        {
            return Promise.reject(error);
        });
    }
    
	async function getSummary(peerId: string) 
	{
        if(_.isEmpty(peerId))
            return Promise.reject(new Error("peerId is invalid."));

		const endpoint = `peers/${peerId}/summary`;

		return ApiService().get(endpoint).then((response: IApiResponse<IPeerSummary>) =>
		{
			const data: IPeerSummary | null = ApiService().getDataPayload(response);

			if(!data)
				return Promise.reject(ApiService().buildNoPayloadError("peerSummary"));

			return Promise.resolve<IPeerSummary>(data);

		}).catch((error: Error) => 
		{
			return Promise.reject(error);
		});
	}

	async function getPeerSummaries(page: number, pageSize: number) 
	{
		const endpoint = "peers/summary";

		const parameters: IQueryParameter[] = [
			{ key: "page", value: page },
			{ key: "pageSize", value: pageSize }
		  ];
  
		return ApiService().get(endpoint, undefined, parameters).then((response: any | undefined) =>
		{
			return Promise.resolve((response && _.isObject(response.data)) ? response.data : {});

		}).catch((error: Error) => 
		{
			return Promise.reject(error);
		});
	}
	
	async function getPeerConnectionRequestsReceived(status: number | null, page: number, pageSize: number)
	{
		const endpoint = "peers/connect/requests";

		const parameters: IQueryParameter[] = [
			{ key: "page", value: page },
			{ key: "pageSize", value: pageSize }
		  ];

		if(_.isNumber(status))
		{
			parameters.push({ key: "status", value: status });
		}
		
		return ApiService().get(endpoint, undefined, parameters).then((response: any | undefined) =>
		{
			return Promise.resolve((response && _.isObject(response.data)) ? response.data : {});

		}).catch((error: Error) => 
		{
			return Promise.reject(error);
		});
	}
	
	async function getPeerConnectionRequestsSubmitted(status: number | null, page: number, pageSize: number)
	{
		const endpoint = "peers/connect/requests/submitted";

		const parameters: IQueryParameter[] = [
			{ key: "page", value: page },
			{ key: "pageSize", value: pageSize }
		  ];
  
		if(_.isNumber(status))
		{
			parameters.push({ key: "status", value: status });
		}
		  
		return ApiService().get(endpoint, undefined, parameters).then((response: any | undefined) =>
		{
			return Promise.resolve((response && _.isObject(response.data)) ? response.data : {});

		}).catch((error: Error) => 
		{
			return Promise.reject(error);
		});
	}
	
	async function approvePeerConnectionRequest(peerId: string)
	{
		const endpoint = "peers/connect/requests/accept";

		const data = [peerId];

		return ApiService().post(endpoint, data).then((response: any | undefined) =>
		{
			return Promise.resolve((response && _.isObject(response.data)) ? response.data : {});

		}).catch((error: Error) => 
		{
			return Promise.reject(error);
		});
	}
	
	async function rejectPeerConnectionRequest(peerId: string)
	{
		const endpoint = "peers/connect/requests/reject";

		const data = [peerId];

		return ApiService().post(endpoint, data).then((response: any | undefined) =>
		{
			return Promise.resolve((response && _.isObject(response.data)) ? response.data : {});

		}).catch((error: Error) => 
		{
			return Promise.reject(error);
		});
	}
	
	async function sendPeerConnectionRequest(targetPeerAddress: string, sourcePeerId?: string, sourcePeerName?: string, sourcePeerAddress?: string)
	{
		if(_.isEmpty(targetPeerAddress))
			return Promise.reject(new Error("Invalid target Peer Address"));
		
		if(_.isEmpty(sourcePeerId))
			return Promise.reject(new Error("Invalid source Peer ID"));
		
		if(_.isEmpty(sourcePeerName))
			return Promise.reject(new Error("Invalid source Peer Name"));
	
		if(_.isEmpty(sourcePeerAddress))
			return Promise.reject(new Error("Invalid source Peer Address"));

		const endpoint = "/api/peers/connect";
		
		const data = {
			peerUuid: sourcePeerId,
			peerName: sourcePeerName,
			peerAddress: sourcePeerAddress
		};

		return ApiService(`https://${targetPeerAddress}`).put(endpoint, data).then((response: any | undefined) =>
		{
			return Promise.resolve((response && _.isObject(response.data)) ? response.data : {});

		}).catch((error: Error) => 
		{
			return Promise.reject(error);
		});
	}

	function buildPeerFullName(peer?: IPeerSummary | IPeerProfile)
	{
		if(!peer)
			return "Unknown";

		if(peer.firstName && peer.lastName)
			return peer.firstName + " " + peer.lastName;

			if(peer.firstName)
				return peer.firstName;

		return "Unknown";
	}

	function getPeerProfilePictureUrlOrDefaultUrl(peer?: IPeerSummary)
	{
		if(!peer)
			return placeholderProfilePictureUrl;
		
		if(peer.profilePicture && !_.isEmpty(peer.profilePicture))
			return peer.profilePicture.location;

		return placeholderProfilePictureUrl;
	}

	function getPeerProfileCoverPictureUrlOrDefaultUrl(peer: IPeerSummary)
	{
		if(!peer)
			return placeholderProfileCoverPictureUrl;

		if(peer.profileCoverPicture && !_.isEmpty(peer.profileCoverPicture))
			return peer.profileCoverPicture.location;

		return placeholderProfileCoverPictureUrl;
	}
	
	return {
		getSummary,
		getProfile,
		getPeerProfilePictureUrlOrDefaultUrl,
		getPeerProfileCoverPictureUrlOrDefaultUrl,
		getPeers,
		getPeerSummaries,
		getPeerConnectionRequestsReceived,
		getPeerConnectionRequestsSubmitted,
		approvePeerConnectionRequest,
		rejectPeerConnectionRequest,
		sendPeerConnectionRequest,
		buildPeerFullName
	};
}