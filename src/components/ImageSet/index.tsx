import React from 'react';

import { IImage } from "./../../types/objects/image";

import { Image } from './../../components/Image';

import "./ImageSet.scss";

export function ImageSet(props: { 
    images: IImage[],
    stretch?: boolean 
    maximumHeight?: number
}) 
{
    const [state, setState] = React.useState({ 
        images: props.images, 
        stretch: props.stretch, 
        maximumHeight: props.maximumHeight ?? 304
    });

    const getCurrentState = function()
    {
        return JSON.parse(JSON.stringify(state));
    }

    let cssClasses = "imageset";

    if(state.images.length > 0 && state.images.length < 6)
    {
        cssClasses += " d" + state.images.length;
    }
    else
    {
        cssClasses += " dn";
    }

    function calculateMaximumHeight(index: number)
    {
        if(state.images.length = 5)
        {
            if(index > 1)
                return Math.ceil(state.maximumHeight / 2);
        }

        return state.maximumHeight;
    }

    function onImageLoad(imageElement: HTMLImageElement)
    {
        if(!imageElement)
            return;
        
        if(imageElement.naturalHeight > state.maximumHeight)
        {
            const newState = getCurrentState();

            newState.maximumHeight = imageElement.naturalHeight;
        
            setState(newState);
        }        
    }

    return (
        <ul className={cssClasses}>
            {state.images.map((image, index)=><li key={index}><Image id={image.id} location={image.location} caption={image.caption} stretch={state.stretch} onImageLoad={onImageLoad} /></li>)}
        </ul>
    );
};