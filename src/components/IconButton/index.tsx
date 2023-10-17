import React from 'react';
import _ from 'lodash';

import { DisplayMode } from '../../types/enums/displayMode';

import { Icon } from '../Icon';

import './IconButton.scss';

export function IconButton(props: 
{ 
  displayMode?: DisplayMode;
  buttonStyle: string;
  iconName: string; 
  altText?: string;
  popoverText?: string;
  classNames?: string;
  onClick?: () => void;
}) 
{  
  const handleClick = () => 
  {
      if(props.onClick && typeof(props.onClick) === "function")
        props.onClick();
  }

  const cssClasses: string[] = ["btn"];

  if(props.classNames && !_.isEmpty(props.classNames))
    cssClasses.push(props.classNames);

  if(props.buttonStyle && !_.isEmpty(props.buttonStyle))
  {
      cssClasses.push("btn-" + props.buttonStyle);
  }

  if(props.displayMode === DisplayMode.Stencil)
    cssClasses.push("stencil");
  
  return (
    <button className={cssClasses.join(" ")} onClick={handleClick} title={props.popoverText ?? ""}>
      <Icon name={props.iconName} altText={props.iconName + " icon"} />
    </button>
  );
};
