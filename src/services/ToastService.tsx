import _ from 'lodash';

import { ToastOptions, toast } from 'react-toastify';
import { ToastPosition, ToastType } from '../types/enums/toastNotification';

export default function ToastService() 
{
    async function notify(message: string, type: ToastType = ToastType.Info, position: ToastPosition = ToastPosition.BOTTOM_RIGHT) 
    {
        if(!message || _.isEmpty(message))
            return;

        const options: ToastOptions = {
            className: "astrana-toast",
            position: toast.POSITION.BOTTOM_RIGHT
        };

        switch(position)
        {
            case ToastPosition.TOP_LEFT: options.position = toast.POSITION.TOP_LEFT; break;
            case ToastPosition.TOP_RIGHT: options.position = toast.POSITION.TOP_RIGHT; break;
            case ToastPosition.BOTTOM_LEFT: options.position = toast.POSITION.BOTTOM_LEFT; break;
        }
        
        if(type === ToastType.Success)
        {
            toast.success(message, options);
        }        
        else if(type === ToastType.Warning)
        {
            toast.warn(message, options);
        }        
        else if(type === ToastType.Error)
        {
            toast.error(message, options);
        }
        else
        {
            toast.info(message, options);
        }
    }
        
    async function info(message: string, position: ToastPosition = ToastPosition.BOTTOM_RIGHT)
    {
        notify(message, ToastType.Info, position);
    }

    async function success(message: string, position: ToastPosition = ToastPosition.BOTTOM_RIGHT)
    {
        notify(message, ToastType.Success, position);
    }
    
    async function warn(message: string, position: ToastPosition = ToastPosition.BOTTOM_RIGHT)
    {
        notify(message, ToastType.Warning, position);
    }
    
    async function error(message: string, position: ToastPosition = ToastPosition.BOTTOM_RIGHT)
    {
        notify(message, ToastType.Error, position);
    }

    return {
        notify,
        success,
        warn,
        error
    };
}