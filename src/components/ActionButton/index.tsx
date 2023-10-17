import React from 'react';
import _ from 'lodash';

import { DisplayMode } from '../../types/enums/displayMode';

import { Icon } from '../Icon';

import "./ActionButton.scss";

export function ActionButton(props: 
{ 
  displayMode?: DisplayMode;
  cssClassNames?: string;
  label: string;
  iconName?: string;
  size?: "normal" | "small" | "big";
  busyBehavior?: "loader" | "text";
  busyLabel?: string;
  allowRetryOnSuccess?: boolean;
  successLabel?: string;
  successIconName?: string;
  successCssClassNames?: string;
  allowRetryOnFail?: boolean;
  failLabel?: string;
  failIconName?: string;
  failCssClassNames?: string;
  data?: any;
  onClick: (data?: any) => Promise<void>;
  callback?: (status: number, response: any) => void;
}) 
{
    const statusValues = {
      none: 0,
      success: 1,
      fail: 2
    }

    const defaultBusyLabel = "Working...";

    const [status, setStatus] = React.useState("ready");
    const [successStatus, setSuccessStatus] = React.useState(statusValues.none);

    const onClick = () => 
    { 
        if(status === "complete")
          return;

        setStatus("working");

        props.onClick(props.data).then((response: any | undefined) => 
        {
            setStatus(props.allowRetryOnSuccess == true ? "ready" : "complete");
            setSuccessStatus(statusValues.success);

            if(_.isFunction(props.callback))
              return props.callback(statusValues.success, response);
            
        }).catch((error: Error | undefined) => 
        {              
            setStatus(props.allowRetryOnFail == true ? "ready" : "complete");
            setSuccessStatus(statusValues.fail);

            if(_.isFunction(props.callback))
              return props.callback(statusValues.fail, error);

            console.log(error);
        });
    };

    const cssClasses: string[] = ["btn"];

    if(props.displayMode === DisplayMode.Stencil)
      cssClasses.push("stencil");

    let iconName = props.iconName;
    let label:string | undefined = props.label;

    if(successStatus === statusValues.success)
    {
      iconName = props.successIconName;
      label = props.successLabel;

      if(props.successCssClassNames && !_.isEmpty(props.successCssClassNames))
        cssClasses.push(props.successCssClassNames)
    }
    else if(successStatus === statusValues.fail)
    {
      iconName = props.failIconName;
      label = props.failLabel;

      if(props.failCssClassNames && !_.isEmpty(props.failCssClassNames))
        cssClasses.push(props.failCssClassNames)
    }
    else
    {
      if(props.cssClassNames && !_.isEmpty(props.cssClassNames))
        cssClasses.push(props.cssClassNames)
    }

    let defaultLabel = _.isEmpty(iconName) ? "Button" : "";

    return (
      <React.Fragment>
        {
          status === "ready" || status === "complete" ? 
          <button type="button" className={cssClasses.join(" ")} onClick={onClick}>
            { iconName && !_.isEmpty(iconName) && <Icon name={iconName} /> }
            { !label && _.isEmpty(label) ? defaultLabel : label }
          </button>
          :
          <button className={cssClasses.join(" ")} disabled>
            {
              props.busyBehavior === "loader" || !props.busyBehavior ? 
              <React.Fragment>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span className="visually-hidden">{ !props.busyLabel && _.isEmpty(props.busyLabel) ? defaultBusyLabel : props.busyLabel }</span>
              </React.Fragment>
              :
              <React.Fragment>
                { !props.busyLabel && _.isEmpty(props.busyLabel) ? defaultBusyLabel : props.busyLabel }
              </React.Fragment>
            }
          </button> 
        }
      </React.Fragment>
    );
};