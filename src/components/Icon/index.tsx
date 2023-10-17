import _ from "lodash";

import "material-design-icons/iconfont/material-icons.css";
import "@mdi/font/scss/materialdesignicons.scss"

import { DisplayMode } from "../../types/enums/displayMode";

import "./Icon.scss";

export function Icon(props: { 
    displayMode?: DisplayMode;
    name: string; 
    size?: number;
    marginStart?: number;
    marginEnd?: number; 
    library?: string;
    align?: "start" | "end" | undefined;
    altText?: string;
    description?: string;
    className?: string;
}) 
{
    const name = props.name ?? "info";
    const library = props.library ?? "mdi";
    const align = props.align ?? undefined;
    const size = props.size ?? 16;
    const marginStart = props.marginStart ?? undefined;
    const marginEnd = props.marginEnd ?? undefined;
    const altText = props.altText ?? name;
    
    const cssClasses: string[] = ["icon"];

    (library === "material") ? cssClasses.push("material-icons") : cssClasses.push("mdi");    

    if(marginStart && marginStart > -1)
        cssClasses.push("ms-" + marginStart);

    if(marginEnd && marginEnd > -1)
        cssClasses.push("me-" + marginEnd);
    
    if(library === "mdi")
        cssClasses.push("mdi-" + name);
    else if(library !== "material")
        cssClasses.push(name);
    
    if(align === "start")
        cssClasses.push("float-start");

    if(align === "end")
        cssClasses.push("float-end");

    if(props.displayMode === DisplayMode.Stencil)
        cssClasses.push("rounded");

    if(props.className && !_.isEmpty(props.className))
        cssClasses.push(props.className);

    return (
        (library === "material") ? 
            <i className={cssClasses.join(" ")} aria-description={props.description} aria-roledescription="icon" aria-label={altText}>{name}</i> : 
            <i className={cssClasses.join(" ")} aria-description={props.description}  aria-roledescription="icon" aria-hidden="true" aria-label={altText}></i>
    );
};