import _ from 'lodash';
import * as signalR from "@microsoft/signalr";

export default function SignalRService(apiBaseURL?: string) 
{
    const buildLogMessage = (message: string) => 
    {
        return `[Astrana] ${message}`;
    };

    const hubName = "hub";
    const baseUrl = apiBaseURL ?? "https://localhost:7003/" + hubName;

    function handleError(error: Error)
    {
        //console.error(buildLogMessage("SignalR error: " + error.message));
    }

    const connection = new signalR.HubConnectionBuilder().withUrl(baseUrl, { withCredentials: false }).build();

    connection.start().then(() => 
    {
        console.log(`SignalR connection success! connectionId: ${connection.connectionId}`);

    }).catch((error) => handleError(error));

    function addListener(methodName: string, handler: Function) 
    {
        connection.on(methodName, (message: string) => 
        {
            if(_.isFunction(handler))
                handler(message);
        });
    }

    function sendMessage(methodName: string, message: string, onSend: Function) 
    {
        connection.send(methodName, message).then(() => onSend());
    }

    return {
        addListener,
        sendMessage
    };
}