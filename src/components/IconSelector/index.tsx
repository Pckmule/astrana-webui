import React, { useEffect } from "react";
import _ from "lodash";

import { Icon } from "../Icon";

import "./IconSelector.scss";

export function IconSelector(props: { name?: string; library?: string; altText?: string; className?: string; onChange?: (value: string) => void }) 
{
    const namespaceClassName = "icon-selector";
    const defaultIconName = "help";

	const [value, setValue] = React.useState<string>(props.name ?? defaultIconName);

    useEffect(() => {
        if(props.onChange && typeof(props.onChange) === "function")
            props.onChange(value);
    }, []);
  
    const cssClasses: string[] = [namespaceClassName];

    if(props.className && !_.isEmpty(props.className))
        cssClasses.push(props.className);

    return (
        <span className={cssClasses.join(" ")}>
            <span className={namespaceClassName + "-preview"}>
                <Icon name={!props.name || _.isEmpty(props.name) ? defaultIconName : props.name} library={props.library} altText={props.altText} /> 
            </span>
            <span className={namespaceClassName + "-caret"}>
                <Icon name="menu-down" library={props.library} altText={props.altText} /> 
            </span>
        </span>
    );
};