import _ from 'lodash';

import ApiService from "./ApiService";
import AccessTokenStorageService from './AccessTokenStorageService';

import { LoginRequest } from "../types/api/api";
import { useNavigate } from 'react-router-dom';

interface IAuthenticationResult 
{
    outcome: "success" | "failure";
    outcomeMessage: string;
    accessToken?: string | null;
}

export default function AuthenticationService() 
{
    const httpSuccessCode = 200;

    var accessTokenStorageService = AccessTokenStorageService();

    async function authenticate(username: string, password: string, rememberMe?: boolean) 
    {
        console.debug("Authenticating...");

        const endpoint = "user/authenticate";

        const authenticationRequest: LoginRequest = {
          "username": username,
          "password": password,
          "rememberMe": rememberMe ?? false
        };

        return await ApiService().post(endpoint, authenticationRequest).then((response: any) =>
        {
            return new Promise((resolve, reject) => 
            {
                const result : IAuthenticationResult =
                {
                    outcome: "failure",
                    outcomeMessage: response.message,
                    accessToken: response.data
                };
                
                if(response !== null && response.status === httpSuccessCode && !_.isEmpty(response.data) && _.isString(response.data))
                {
                    result.outcome = "success";
                    result.outcomeMessage = "Authentication Succeeded";

                    console.info("Authentication Succeeded");
                    resolve(result);
                    return;
                }
                
                console.warn("Authentication Failed");
                reject(result);
            });

        }).catch((error: Error) => 
        {
            console.warn("Authentication Failed");
    
            const result : IAuthenticationResult =
            {
                outcome: "failure",
                outcomeMessage: "Authentication Failed",
                accessToken: null
            };
            
            return Promise.reject(result);
        });
    }
    
    function parseJsonWebToken (token: string) 
    {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) 
        {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    
        return JSON.parse(jsonPayload);
    }

    function validateJsonWebTokenSignature (token: string) 
    {
        const parsedToken = parseJsonWebToken(token);

        return true;
    }

    async function isAuthTokenValid(token: string, validityPeriodInSeconds: number = 60) 
    {
        const parsedToken = parseJsonWebToken(token);

        console.dir(parsedToken);
    }

    async function refreshAuthToken(token: string) 
    {
        console.debug("Refreshing API Access Token...");

        const endpoint = "user/refreshtoken";

        const request: any = { "token": token };

        return await ApiService().post(endpoint, request).then((response: any) =>
        {
            return new Promise((resolve, reject) => 
            {
                const result : IAuthenticationResult =
                {
                    outcome: "failure",
                    outcomeMessage: response.message,
                    accessToken: response.data
                };
                
                if(response !== null && response.status === httpSuccessCode && !_.isEmpty(response.data) && _.isString(response.data))
                {
                    result.outcome = "success";
                    result.outcomeMessage = "Access Token Refresh Succeeded";

                    console.info("Access Token Refresh Succeeded");
                    resolve(result);
                    return;
                }
                
                console.warn("Access Token Refresh Failed");
                reject(result);
            });

        }).catch((error: Error) => 
        {
            console.warn("Access Token Refresh Failed");
    
            const result : IAuthenticationResult =
            {
                outcome: "failure",
                outcomeMessage: "Access Token Refresh Failed",
                accessToken: null
            };
            
            return Promise.reject(result);
        });
    }

	const navigate = useNavigate();

    async function login(username: string, password: string, rememberMe?: boolean) 
    {
		await authenticate(username, password, rememberMe).then((response: any) => 
		{
			if (response && response.accessToken && !_.isEmpty(response.accessToken)) 
			{
                accessTokenStorageService.set(response.accessToken)
				navigate("/");
				return;
			}
            
            accessTokenStorageService.clear();

		}).catch((error: Error) => { console.dir(error); });
    }

    function logout()
    {
        accessTokenStorageService.clear();
        navigate("/logout");
    }

    return {
        authenticate,
        isAuthTokenValid,
        refreshAuthToken,
        login,
        logout
    };
}