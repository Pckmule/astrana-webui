import _ from 'lodash';
import axios, { AxiosError } from "axios";

import { ApiError, IQueryParameter, LoginRequest } from "../types/api/api";

import SettingsService from "./SettingsService";

export default function ApiService(baseURL?: string) 
{
    const ResponseCodes = {
        BadRequest: "ERR_BAD_REQUEST",
        NetworkError: "ERR_NETWORK"
    };
    
    const buildLogMessage = (message: string) => 
    {
        return `[Astrana] ${message}`;
    };

    const baseUrl = baseURL ?? SettingsService.getSettings().apiDomain;

    let http = axios.create({
        baseURL: baseUrl,
        headers: {
            "Content-type": "application/json"
        }
    });

    const currentAccessToken = localStorage.getItem("api_access_token") ?? "";

    if(!currentAccessToken || !_.isEmpty(currentAccessToken))
    {
        setAuthorizationHeader(currentAccessToken);
    }

    function setAuthorizationHeader(apiToken: string)
    {
        if(!_.isEmpty(apiToken))
        {
            http.defaults.headers.common["Authorization"] = `Bearer ${apiToken}`;

            localStorage.setItem("api_access_token", apiToken);
        }
    }

    function handleError(error: AxiosError, endpoint: string)
    {
        if(error.code === ResponseCodes.NetworkError)
        {
            console.warn(buildLogMessage("Unable to connect to " + baseUrl + endpoint));
        }
        else if(error.code === ResponseCodes.BadRequest)
        {
            return refreshApiTokenAndRetry(endpoint);
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
            
            setAuthorizationHeader(response.data);

            Promise.resolve("API Token refresh succeeded.");

        }).catch((error: AxiosError) => 
        {
            if(error.code === ResponseCodes.NetworkError)
            {
                console.warn(buildLogMessage("Unable to connect to " + baseUrl + endpoint));
            }
            else if(error.code === ResponseCodes.BadRequest)
            {
                alert("Redirect to Login page...");
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
    
    function create(endpoint: string, data: any)
    {
      return http.put<any>(endpoint, data);
    }
    
    function update(endpoint: string, data: any) 
    {
      return http.post<any>(endpoint, data);
    }
    
    function remove(endpoint: string)
    {
      return http.delete<any>(endpoint);
    }
    
    return {
      getAll,
      get,
      put: create,
      post: update,
      delete: remove
    };
}