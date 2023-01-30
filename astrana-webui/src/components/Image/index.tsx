import React from 'react';

import { LoadIndicator } from './../../components/LoadIndicator';

import "./Image.scss";

export interface IImageState {
    imageElement?: any; 
    location?: string;
    caption?: string;
    imageLoadStatus: string;
    stretch?: boolean;
    marginTop: number;
    marginLeft: number;
    maximumHeight: number;
    stretchWidth?: number;
    resizing: boolean;
}

export function Image(this: any, props: { 
    id?: string; 
    location: string; 
    caption?: string, 
    stretch?: boolean, 
    maximumHeight?: number, 
    onImageLoad?: Function 
}) 
{
    const defaultMaximumHeight = 304;
    const placeholderImageLocation = "/images/placeholder.png";

    const intialState = { 
        imageElement: undefined, 
        location: props.location ?? "", 
        caption: props.caption ?? "", 
        imageLoadStatus: "loading" , 
        stretch: props.stretch ?? false,
        marginTop: 0,
        marginLeft: 0,
        maximumHeight: props.maximumHeight ?? defaultMaximumHeight,
        stretchWidth: undefined,
        resizing: false
    };
    
    const [state, setState] = React.useState<IImageState>(intialState);

    const getCurrentState = function()
    {
        return JSON.parse(JSON.stringify(state));
    }

    let cssClasses = "image";

    if(props.stretch)
    {
        cssClasses += " stretch";
    }

    const location = state.location ? state.location : placeholderImageLocation;
    const altText = state.caption ? "Image" : state.caption;
    
    function resetElementWidthAndHeight(element: any)
    {
        if(!element || !element.style)
            return;

        element.style.width = null;
        element.style.height = null;
    }

    function setMargins(element: any, state: IImageState)
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
            
            if(props.id && props.id == "4")
            {
                console.log(element.src);
                
                console.log("heightDiff: " + heightDifference);
        
                console.log(`p=[w:${oDims.w}, h:${oDims.h}]`);
                console.log(`i=[w:${iDims.w}, h:${iDims.h}]`);
                console.log("newHeight: " + newHeight);

                console.log("heightGapPercentage: " + heightGapPercentage + "%");
                console.log("newWidthFactor: " + newWidthFactor);
                console.log("newWidth: " + newWidth + " {" + oDims.w + "}");

                if(true)
                {
                    console.log(iDims.h * newWidthFactor);
                }
            }

            state.stretchWidth = newWidth;

            if(ratio > 1)
            {
                state.marginLeft = (oDims.w - newWidth) / 2;
            }
        }
    }

    function handleImageLoaded(e: any) 
    {
        if(typeof(props.onImageLoad) === "function")
        {
            props.onImageLoad(e.target);
        }

        const newState = getCurrentState();

        if(e && e.target)
        {
            newState.imageElement = e.target;

            newState.imageLoadStatus = "loaded";
            
            resetElementWidthAndHeight(e.target);
            setMargins(e.target, newState);
        }
        else
            newState.imageLoadStatus = "failed";
        
        setState(newState);
    }

    function handleImageErrored(e: any) 
    {
        const newState = getCurrentState();

        newState.imageLoadStatus= "failed";
        
        if(e && e.target)
        {
            newState.imageElement = e.target;
        }

        setState(newState);
    }

    const imageStyle: any = {
        
    };

    if(state.imageLoadStatus == "loading")
    {
        imageStyle.width = "1px";
        imageStyle.height = "1px";
        imageStyle.position = "absolute";
        imageStyle.top = "0px";
        imageStyle.left = "0px";
    }

    if(state.stretch)
    {
        imageStyle.marginTop = state.marginTop + "px";
        imageStyle.marginLeft = state.marginLeft + "px";

        if(state.stretchWidth && state.stretchWidth > 0)
        {
            imageStyle.width = state.stretchWidth + "px";
            imageStyle.maxWidth = state.stretchWidth + "px";
        }
    }

    let imageComponent;
    
    if (state.imageLoadStatus == "loaded")
    {
        imageComponent = <img src={location} alt={altText} style={imageStyle} />;
    } 
    else if (state.imageLoadStatus == "failed") 
    {
        imageComponent = <i className="">Load Failed</i>;
    } 
    else 
    {
        imageComponent = <React.Fragment>
            <LoadIndicator color="#ff0000" />
            <img src={location} alt={altText} onLoad={handleImageLoaded.bind(this)} onError={handleImageErrored.bind(this)} style={imageStyle} />
        </React.Fragment>;
    }

    return (
        <div className={cssClasses}>          
            { imageComponent }            
        </div>
    );
};