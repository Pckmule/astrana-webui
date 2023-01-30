import React from 'react';

import { LoadIndicator } from './../../components/LoadIndicator';

import "./Audio.scss";

export interface IAudioState {
    audioElement?: any; 
    location?: string;
    caption?: string;
    audioLoadStatus: string;
    stretch?: boolean;
    marginTop: number;
    marginLeft: number;
    maximumHeight: number;
    stretchWidth?: number;
    resizing: boolean;
}

export function Audio(this: any, props: { id?: string; location: string; caption?: string, stretch?: boolean, maximumHeight?: number }) 
{
    const defaultMaximumHeight = 280;
    const placeholderAudioLocation = "/audios/placeholder.png";

    const intialState = { 
        audioElement: undefined, 
        location: props.location ?? "", 
        caption: props.caption ?? "", 
        audioLoadStatus: "loading" , 
        stretch: props.stretch ?? false,
        marginTop: 0,
        marginLeft: 0,
        maximumHeight: props.maximumHeight ?? defaultMaximumHeight,
        stretchWidth: undefined,
        resizing: false
    };
    
    const [state, setState] = React.useState<IAudioState>(intialState);

    const getCurrentState = function()
    {
        return JSON.parse(JSON.stringify(state));
    }

    let cssClasses = "audio";

    if(props.stretch)
    {
        cssClasses += " stretch";
    }

    const location = state.location ? state.location : placeholderAudioLocation;
    const altText = state.caption ? "Audio" : state.caption;
    

    function resetElementWidthAndHeight(element: any)
    {
        if(!element || !element.style)
            return;

        element.style.width = null;
        element.style.height = null;
    }

    function setMargins(element: any, state: IAudioState)
    {
        if(!element || !state)
            return;

        if(!element.naturalWidth || !element.naturalHeight)
            return;

        if(!element.clientWidth || !element.clientHeight)
            return;

        if(!element.parentElement.clientWidth || !element.parentElement.clientHeight)
            return;

        const ratio = element.naturalWidth / element.naturalHeight;

        const iDims = { w: element.clientWidth, h: element.clientHeight };
        const oDims = { w: element.parentElement.clientWidth, h: element.parentElement.clientHeight };
        
        const heightDifference = oDims.h - iDims.h;
        
        state.marginTop = 0;
        state.marginLeft = 0;

        if(heightDifference < 0)
        {
            state.marginTop = (heightDifference / 2);
        }
        else if(heightDifference > 0)
        {
            let heightGapPercentage = 100 - Math.floor(((oDims.h - heightDifference)/oDims.h) * 100);
            let newWidthFactor = (100 + heightGapPercentage)/100;

            const newHeight  = iDims.h * newWidthFactor;

            if(newHeight < oDims.h)
            {
                const newHeightDifference = oDims.h - newHeight;

                heightGapPercentage += 104 - Math.ceil(((oDims.h - newHeightDifference)/oDims.h) * 100);
                newWidthFactor = (100 + heightGapPercentage)/100;
            }

            const newWidth = Math.ceil(oDims.w * newWidthFactor);
            
            state.stretchWidth = newWidth;

            if(ratio > 1)
            {
                state.marginLeft = (oDims.w - newWidth) / 2;
            }
        }
    }

    function handleAudioLoaded(e: any) 
    {
        const newState = getCurrentState();

        if(e && e.target)
        {
            newState.audioElement = e.target;

            newState.audioLoadStatus = "loaded";
            
            resetElementWidthAndHeight(e.target);
            setMargins(e.target, newState);
        }
        else
            newState.audioLoadStatus = "failed";
        
        setState(newState);
    }

    function handleAudioErrored(e: any) 
    {
        const newState = getCurrentState();

        newState.audioLoadStatus= "failed";
        
        if(e && e.target)
        {
            newState.audioElement = e.target;
        }

        setState(newState);
    }

    function resize() 
    {
        const newState = getCurrentState();

        if(!newState.audioElement)
            return;

        if(newState.audioElement)
        {
            resetElementWidthAndHeight(newState.audioElement);
            setMargins(newState.audioElement, newState);
        }
        
        setState(newState);
    }

    function handleResize() 
    {
        const newState = getCurrentState();

        if(!state.resizing)
        {
            setTimeout(function()
            {
                newState.resizing = true;
                setState(newState);

                resize();

            }, 500);
        }
    }

    const audioStyle: any = {
        position: "relative",
        height: "auto"
    };

    if(state.audioLoadStatus == "loading")
    {
        audioStyle.width = "1px";
        audioStyle.height = "1px";
        audioStyle.position = "absolute";
        audioStyle.top = "0px";
        audioStyle.left = "0px";
    }

    if(state.stretch)
    {
        audioStyle.marginTop = state.marginTop + "px";
        audioStyle.marginLeft = state.marginLeft + "px";

        if(state.stretchWidth && state.stretchWidth > 0)
        {
            audioStyle.width = state.stretchWidth + "px";
            audioStyle.maxWidth = state.stretchWidth + "px";
        }
    }

    return (
        <div className={cssClasses}>            
            {
                state.audioLoadStatus != "loaded" ? 
                
                <React.Fragment>
                    <LoadIndicator color="#ff0000" />
                    <img src={location} alt={altText} onLoad={handleAudioLoaded.bind(this)} onError={handleAudioErrored.bind(this)} style={audioStyle} />
                </React.Fragment> : 
                
                <img src={location} alt={altText} style={audioStyle} />
            }            
        </div>
    );
};