import _ from 'lodash';
import axios, { AxiosError, AxiosInstance } from "axios";

import { ApiError, IQueryParameter, LoginRequest } from "../types/api/api";

import AccessTokenStorageService from './AccessTokenStorageService';
import { IApiResponse } from '../types/api/apiResponse';

export default function ApiService(apiBaseURL?: string) 
{
	const ResponseCodes = {
		BadRequest: "ERR_BAD_REQUEST",
		NetworkError: "ERR_NETWORK"
	};
	
	var accessTokenStorageService = AccessTokenStorageService();

	const buildLogMessage = (message: string) => 
	{
		return `[Astrana] ${message}`;
	};

	const baseUrl = apiBaseURL ?? "https://localhost:7003/api/";
	
	/*
	if(!baseURL || _.isEmpty(baseURL))
	{
		await SettingsService().getSettingValue("Host Name").then((response: any | undefined) =>
		{
			baseURL = response;

		}).catch((err: Error) => 
		{
			return Promise.reject(err);
		});
	}
	*/

	const createAxiosInstance = (contentType?: "json" | "form") =>
	{
		const http = axios.create({
			baseURL: baseUrl,
			headers: {
				"Content-Type": contentType === "form" ? "multipart/form-data" : "application/json" 
			}
		});

		const currentAccessToken = accessTokenStorageService.getCurrent();

		if(!currentAccessToken || !_.isEmpty(currentAccessToken))
		{
			setAuthorizationHeader(http, currentAccessToken);
		}

		return http;
	}

	function setAuthorizationHeader(http : AxiosInstance, apiToken: string)
	{
		if(!_.isEmpty(apiToken))
		{
			http.defaults.headers.common["Authorization"] = `Bearer ${apiToken}`;

			accessTokenStorageService.set(apiToken);
		}
	}

	function handleError(error: AxiosError, endpoint: string, retry: boolean = true)
	{
		if(error.code === ResponseCodes.NetworkError)
		{
			console.warn(buildLogMessage("Unable to connect to " + baseUrl + endpoint));
		}
		else if(error.code === ResponseCodes.BadRequest)
		{
			if(retry)
			{
				return refreshApiTokenAndRetry(endpoint);
			}
		}
		else 
		{
			console.error(error.message);
		}
	}

	const buildApiError = (code: string, message: string): ApiError =>
	{
		return { code: code, message: message };
	}

	async function refreshApiToken()
	{
		const authenticationRequest: LoginRequest = {
		  "username": "dazza",
		  "password": "Pwd123!!",
		  "rememberMe": true
		};

		const endpoint = "user/authenticate";

		return update(endpoint, authenticationRequest).then((response: any | undefined) =>
		{
			if(!response || _.isEmpty(response.data) || !_.isString(response.data))
			{
				return Promise.reject(buildApiError("No Data", "API Token refresh failed."));
			}
			
			setAuthorizationHeader(http, response.data);

			Promise.resolve("API Token refresh succeeded.");

		}).catch((error: AxiosError) => 
		{
			if(error.code === ResponseCodes.NetworkError)
			{
				console.warn(buildLogMessage("Unable to connect to " + baseUrl + endpoint));
			}
			else if(error.code === ResponseCodes.BadRequest)
			{
				console.warn("Redirect to Login page...");
			}
			else 
			{
				console.error(error.message);
			}

			return Promise.reject(buildApiError(error.code ?? "", error.message));
		});
	}

	function refreshApiTokenAndRetry(endpoint: string)
	{
		console.info(buildLogMessage("Refreshing API Token..."));

		return refreshApiToken().then((refreshApiTokenResult: any) => 
		{
			return http.get<Array<any>>(endpoint).then((response: any | undefined) => 
			{
				console.info(buildLogMessage("API Token Refreshed"));

				return response.data;
	
			}).catch((error: AxiosError) => 
			{
				console.warn(buildLogMessage(`Failed to Refresh API Token. Error message: ${error.message}`));
			});

		}).catch((err: any) => { return null; });
	}

	async function canConnect()
	{
		const endpoint = "system/status";

		return http.get<any>(endpoint).then((response: any | undefined) => 
		{
			return Promise.resolve(true);

		}).catch((error: AxiosError) => 
		{
			handleError(error, endpoint);

			return Promise.reject(false);
		});
	}

	async function getAll(endpoint: string) 
	{
		return http.get<Array<any>>(endpoint).then((response: any | undefined) => 
		{
			return response.data;

		}).catch((error: AxiosError) => 
		{
			handleError(error, endpoint);
		});
	}
	
	async function get(endpoint: string, id?: string, parameters?: IQueryParameter[])
	{
		let url = endpoint;

		if(id && !_.isEmpty(id))
			url += `/${id}`

		if(parameters && parameters.length > 0)
		{
			url += "?";

			parameters.forEach(item => {
				url += `${item.key}=${item.value}&`;
			});

			url = url.substring(0, url.length - 1);
		}

		return http.get<any>(url).then((response: any | undefined) => 
		{
			return response.data;

		}).catch((error: AxiosError) => 
		{
			handleError(error, endpoint);
		});
	}

	function getApiResponseFromAxiosResponse(axiosResponse: any)
	{
		const apiResponse: IApiResponse<any> = {};

		if(!axiosResponse)
			return undefined;
		
		if(axiosResponse.message)
			apiResponse.message = axiosResponse.message;

		if(axiosResponse.data)
		{
			if(axiosResponse.data.data)
				apiResponse.data = axiosResponse.data.data;
		}

		if(axiosResponse.failures)
			apiResponse.failures = axiosResponse.failures;

		return apiResponse
	}

	function create(endpoint: string, data: any)
	{
		return http.put<any>(endpoint, data).then((axiosResponse: any) =>
        {
			const apiResponse = getApiResponseFromAxiosResponse(axiosResponse);

			if(!apiResponse)
            	return Promise.reject(new Error("No API Response"));
			
            return Promise.resolve(apiResponse);

        }).catch((error: Error) => 
        {
            return Promise.reject(error);
        });
	}
	
	function update(endpoint: string, data: any) 
	{
	  return http.post<any>(endpoint, data);
	}
	
	function postFormData(endpoint: string, data: any) 
	{
		return createAxiosInstance("form").post<any>(endpoint, data);
	}
	
	function remove(endpoint: string)
	{
	  return http.delete<any>(endpoint);
	}
	
	function getDataPayload(response: any)
	{
		if(response === null || response === undefined)
			return null;
			
		if(Array.isArray(response.data) || _.isObject(response.data))
			return response.data;
	
		return response.data ? response.data : null;
	}
	
	function buildError(reason: string)
	{
		if(!reason || _.isEmpty(reason))
			throw new Error("Reason is required.");

		const error: Error = {
			name: "Api Error",
			message: reason,
			cause: reason
		};

		return error;
	}
 
	function buildParameters(parameters: IQueryParameter[])
	{
		if(Array.isArray(parameters))
			return parameters;

		const newParameters:IQueryParameter[] = [];
		return newParameters;
	}
	
	function buildNoPayloadError(payloadName: string)
	{
		if(_.isEmpty(payloadName))
			return buildError("Invalid payload: Response payload was missing.");

		return buildError(`Invalid payload: ${payloadName} data is missing.`);
	}

	const http = createAxiosInstance();

	return {
		canConnect,
		getAll,
		get,
		put: create,
		post: update,
		postFormData,
		delete: remove,
		getDataPayload,
		buildParameters,
		buildError,
		buildNoPayloadError
	};
}