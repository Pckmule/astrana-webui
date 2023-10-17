import React from "react";
import _ from "lodash";

import { DisplayMode } from "../../types/enums/displayMode";

import { Image } from '../Image';
import { Icon } from "../Icon";

import "./PostLinkAttachment.scss";

export function PostLinkAttachment(props: { displayMode?: DisplayMode; title?: string; url: string; imageUrl?: string; description?: string; disableLink?: boolean; }) 
{
    const namespaceClassName = "post-attachment-link";

	const cssClasses: string[] = [namespaceClassName, "rounded", "unselectable"];

	if(props.displayMode === DisplayMode.Working)
	{
		return (
			<div className={cssClasses.join(" ")}>
				<span className="post-attachment-link-generating-preview unselectable">
					<span className="post-attachment-link-generating-preview-message">Generating Preview...</span>
				</span>
			</div>
		);
	}

	const content = <React.Fragment>
		{props.imageUrl && !_.isEmpty(props.imageUrl) &&
			<span className="post-attachment-link-image">
				<Image displayMode={props.displayMode} location={props.imageUrl} altText={props.title} height={360} enableViewer={false} />
			</span>
		}

		<span className="post-attachment-link-text">
			<span className="post-attachment-link-title">
				{(props.title && !_.isEmpty(props.title) ? props.title : props.url)}
			</span>

			<span className="post-attachment-link-url">
				<span>{props.url}</span>
				<span>
					<Icon name="info" align="end" marginStart={2} altText="Link Information Icon" /> 
				</span>		
			</span>
			
			{props.description && !_.isEmpty(props.description) && 
				<span className="post-attachment-link-description">
				{props.description}
				</span>}
		</span>
	</React.Fragment>

	return (
	<div className={cssClasses.join(" ")}>
		{!props.disableLink && <a href={props.url} target="_blank" rel="noreferrer">{content}</a>}
		{props.disableLink && content}
	</div>
	);
};