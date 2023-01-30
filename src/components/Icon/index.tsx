import React from 'react';

import "material-design-icons/iconfont/material-icons.css";
import "@mdi/font/scss/materialdesignicons.scss"

import "./Icon.scss";

export interface IIconState {
    name: string;
    size?: number;
    marginLeft?: number;
    marginRight?: number;
    library?: string;
}

export function Icon(props: { 
    name: string; 
    size?: number;
    marginLeft?: number;
    marginRight?: number;
    library?: string; 
}) 
{
    const intialState = { 
        library: props.library ?? "mdi",
        name: props.name ?? "info", 
        size: props.size ?? 16, 
        marginLeft: props.marginLeft ?? undefined, 
        marginRight: props.marginRight ?? undefined
    };
    
    const [state, setState] = React.useState<IIconState>(intialState);

    const getCurrentState = function()
    {
        return JSON.parse(JSON.stringify(state));
    }

    let cssClasses = "icon";

    if(state.library === "material")
    {
        cssClasses += " material-icons";
    }
    else
    {
        cssClasses += " mdi";
    }

    if(state.marginLeft && state.marginLeft > -1)
        cssClasses += " ml-" + state.marginLeft;

    if(state.marginRight && state.marginRight > -1)
        cssClasses += " me-" + state.marginRight;
    
    return (
        (state.library === "material") ? 
            <i className={cssClasses}>{state.name}</i> : 
            <i className={cssClasses + " " + state.name} aria-hidden="true"></i>
    );
};