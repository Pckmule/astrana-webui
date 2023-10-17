import _ from 'lodash';

import { IApiResponse } from '../types/api/apiResponse';
import { IPeerProfile } from '../types/interfaces/peerProfile';
import { IPeerSummary } from '../types/interfaces/peerSummary';

import ApiService from "./ApiService";

export default function UserService() 
{
	async function getInstancePeerSummary() 
	{
		const endpoint = "user/instance"

		return ApiService().get(endpoint).then((response: IApiResponse<IPeerSummary>) =>
		{
			const data: IPeerSummary | null = ApiService().getDataPayload(response);

			if(!data)
				return Promise.reject(ApiService().buildNoPayloadError("instancePeerSummary"));

			return Promise.resolve<IPeerSummary>(data);

		}).catch((error: Error) => 
		{
			return Promise.reject(error);
		});
	}

	async function getProfile() 
	{
		const endpoint = "user/profile"

		return ApiService().getAll(endpoint).then((response: IApiResponse<IPeerProfile>) =>
		{
			const data: IPeerProfile | null = ApiService().getDataPayload(response);

			if(!data)
				return Promise.reject(ApiService().buildNoPayloadError("profile"));

			return Promise.resolve<IPeerProfile>(data);

		}).catch((error: Error) => 
		{
			return Promise.reject(error);
		});		
	}	

	async function setPicture(data: FormData, pictureType: "cover" | "profile") 
	{
		const endpoint = "user/profile/" + (pictureType === "cover" ? "coverpicture" : "picture");

		return ApiService().postFormData(endpoint, data).then((response: any | undefined) =>
		{
			const results = (response && _.isObject(response.data)) ? response.data : null;

			return Promise.resolve(results);

		}).catch((err: Error) => 
		{
			return Promise.reject(err);
		});
	};

	async function setProfilePicture(data: FormData) 
	{
		return setPicture(data, "profile");
	};

	async function setCoverPicture(data: FormData) 
	{
		return setPicture(data, "cover");
	};

	return {
	    getInstancePeerSummary,
		getProfile,
		setProfilePicture,
		setCoverPicture
	};
}