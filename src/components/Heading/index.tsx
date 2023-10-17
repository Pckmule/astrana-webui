import React from 'react';
import _ from 'lodash';

import { DisplayMode } from '../../types/enums/displayMode';

import { Link } from 'react-router-dom';

import "./Heading.scss";

export function Heading(props: 
{ 
	displayMode?: DisplayMode; 
	text: string; 
	size: 1 | 2 | 3 | 4 | 5 | 6; 
	marginTop?: 1 | 2 | 3 | 4 | 5;
	marginBottom?: 1 | 2 | 3 | 4 | 5;
	btnLinkUrl?: string; 
	btnText?: string;
	cssClasses?: string;
	placeholderTextLength?: number;
}) 
{
	const cssClasses: string[] = [];

	if(props.cssClasses && !_.isEmpty(props.cssClasses))
		cssClasses.push(props.cssClasses);

	const wrapHeaderTag = (size: 1 | 2 | 3 | 4 | 5 | 6, content: any) =>
	{
		if(props.displayMode === DisplayMode.Stencil)
			cssClasses.push( "text-placeholder");

		if(props.marginTop)
			cssClasses.push( "mt-" + props.marginTop);

		if(props.marginBottom)
			cssClasses.push( "mtb-" + props.marginBottom);

		switch(size)
		{
			case 1: 
				return <h1 className={cssClasses.join(" ")}>{content}</h1>;
				
			case 2: 
				return <h2 className={cssClasses.join(" ")}>{content}</h2>;
			
			case 3: 
				return <h3 className={cssClasses.join(" ")}>{content}</h3>;
				
			case 4: 
				return <h4 className={cssClasses.join(" ")}>{content}</h4>;
			
			case 5: 
				return <h5 className={cssClasses.join(" ")}>{content}</h5>;
				
			case 6: 
				return <h6 className={cssClasses.join(" ")}>{content}</h6>;
		}
	};
	
	if(props.displayMode === DisplayMode.Stencil)
		return (
			<React.Fragment>
				{wrapHeaderTag(props.size, 
					<React.Fragment>
						<span style={{ width: props.placeholderTextLength ?? 200 }}>&nbsp;</span>
						{ (props.btnLinkUrl && !_.isEmpty(props.btnLinkUrl)) && (props.btnText && !_.isEmpty(props.btnText)) && 
							<div className="btn btn-sm btn-placeholder btn-link float-end">&nbsp;</div> 
						}
					</React.Fragment>
				)}
			</React.Fragment>
		);

	return (
		<React.Fragment>
			{wrapHeaderTag(props.size, 
				<React.Fragment>
					{ props.text }
					{ (props.btnLinkUrl && !_.isEmpty(props.btnLinkUrl)) && (props.btnText && !_.isEmpty(props.btnText)) && 
						<Link className="btn btn-sm btn-link float-end" to={props.btnLinkUrl}>{props.btnText}</Link> 
					}
				</React.Fragment>
			)}
		</React.Fragment>
	);
};