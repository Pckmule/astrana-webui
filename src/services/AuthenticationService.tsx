import _ from 'lodash';

import ApiService from "./ApiService";

import { LoginRequest } from "../types/api/api";

interface IAuthenticationResult 
{
    outcome: "success" | "failure";
    outcomeMessage: string;
    accessToken?: string | null;
}

export default function AuthenticationService() 
{
    const httpSuccessCode = 200;

    async function authenticate(username: string, password: string) 
    {
        console.debug("Authenticating...");

        const endpoint = "user/authenticate";

        const authenticationRequest: LoginRequest = {
          "username": username,
          "password": password,
          "rememberMe": true
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

        }).catch((err: Error) => 
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
    
    return {
        authenticate
    };
}