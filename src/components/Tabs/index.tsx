
import React from 'react';
import _ from 'lodash';

import { DisplayMode } from '../../types/enums/displayMode';

import { ITab } from '../../types/interfaces/tabs';

import { Link } from 'react-router-dom';

import "./Tabs.scss";

export function Tabs(props: { 
  displayMode?: DisplayMode;
  tabs: ITab[];
  activeTabId?: string;
  onSelect?: (id: string) => void;
  cssClassNames?: string;
}) 
{
	const namespaceClassName = "nav-tabs";

	const defaultTab = props.activeTabId ?? _.first(props.tabs)?.id ?? "";

	const [activeTabId, setActiveTabId] = React.useState<string>(defaultTab);

	const onSelect = (id: string) => 
	{
		setActiveTabId(id);
	}
	
	const cssClasses: string[] = [namespaceClassName, "nav"];

	if(props.cssClassNames && !_.isEmpty(props.cssClassNames))
		cssClasses.push(props.cssClassNames);

	if(props.displayMode === DisplayMode.Stencil)
		cssClasses.push("stencil");

	return (
		<ul className={cssClasses.join(" ")}>
			{(props.tabs).map((tab: ITab) => (
				<li key={tab.id} className="nav-item">
					<Link to={tab.url} className={"nav-link" + (activeTabId === tab.id ? " active" : "")} onClick={() => onSelect(tab.id)}>{tab.title}</Link>
				</li>
			))}
		</ul>
	);
};