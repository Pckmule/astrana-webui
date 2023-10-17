import React from 'react';
import _ from 'lodash';

import { DisplayMode } from '../../types/enums/displayMode';
import { ImageLoadStatus } from '../../types/enums/imageLoadStatus';
import { MediaType } from '../../types/enums/mediaType';

import UrlBuilderService from '../../services/UrlBuilderService';

import { Link } from 'react-router-dom';
import { LoadIndicator } from './../../components/LoadIndicator';

import "./Image.scss";

export interface IImageState {
	imageElement?: any; 
	loadStatus: ImageLoadStatus;
	stretch?: boolean;
	marginTop: number;
	marginLeft: number;
	maximumHeight: number;
	stretchWidth?: number;
	resizing: boolean;
	showModifyControl?: boolean;
	modifyHandler?: Function;
	showRemoveControl?: boolean;
	removeHandler?: Function;
	className?: string;
	overlayText?: string;
}

export function Image(this: any, props: {
	displayMode?: DisplayMode;
	id?: string; 
	location: string; 
	caption?: string;
	stretch?: boolean;
	fit?: "cover" | "contain";
	width?: number;
	widthUnit?: string;
	height?: number; 
	maximumHeight?: number; 
	onImageLoad?: Function;
	preload?: boolean;
	showModifyControl?: boolean;
	modifyHandler?: Function;
	showRemoveControl?: boolean;
	removeHandler?: Function;
	cssClassNames?: string;
	backgroundColor?: string;
	overlayText?: string;
	altText?: string;
	enableViewer?: boolean;
	setId?: string;
}) 
{
	const namespaceClassName = "image";

	const urlBuilder = UrlBuilderService();

	const defaultMaximumHeight = 304;
	const placeholderImageLocation = "/images/placeholder.png";

	const intialState = { 
		imageElement: undefined, 
		loadStatus: props.preload ? ImageLoadStatus.Loading : ImageLoadStatus.Loaded, 
		stretch: props.stretch ?? false,
		marginTop: 0,
		marginLeft: 0,
		maximumHeight: props.maximumHeight ?? defaultMaximumHeight,
		stretchWidth: undefined,
		resizing: false
	};
	
	const [state, setState] = React.useState<IImageState>(intialState);

	const cssClasses: string[] = [namespaceClassName];

	if(props.stretch)
		cssClasses.push("stretch");


	if(props.cssClassNames)
		cssClasses.push(props.cssClassNames);

	const location = props.location ? props.location : placeholderImageLocation;
	const altText = props.altText ? props.altText : props.caption ? props.caption : "Image";
	
	function resetElementWidthAndHeight(element: any)
	{
		if(!element || !element.style)
			return;

		element.style.width = null;
		element.style.height = null;
	}

	function calculateMargins(element: any, state: IImageState)
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

		setState(state => {

			if(e && e.target)
			{
				state.imageElement = e.target;
				state.loadStatus = ImageLoadStatus.Loaded;
				
				resetElementWidthAndHeight(e.target);
				calculateMargins(e.target, state);
			}
			else
				state.loadStatus = ImageLoadStatus.Error;
	
			return state;
		});
	}

	function handleImageErrored(e: any) 
	{
		setState(state => {

			state.loadStatus= ImageLoadStatus.Error;
		
			if(e && e.target)
			{
				state.imageElement = e.target;
			}
	
			return state;
		});
	}

	const imageContainerStyle: any = { };
	const imageStyle: any = { };

	if(props.width)
	{
		imageContainerStyle.width = props.widthUnit ? props.width + props.widthUnit : props.width + "px";
		imageStyle.width = props.widthUnit ? props.width + props.widthUnit : props.width + "px";
	}

	if(props.height)
	{
		imageContainerStyle.height = _.isNumber(props.height) ? props.height + "px" : props.height;
		imageStyle.height = _.isNumber(props.height) ? props.height + "px" : props.height;
	}

	if(props.preload)
	{
		if(state.loadStatus === ImageLoadStatus.Loading)
		{
			imageStyle.width = "1px";
			imageStyle.height = "1px";
			imageStyle.position = "absolute";
			imageStyle.top = "0px";
			imageStyle.left = "0px";
		}
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

	if(!props.fit || props.fit === "cover")
	{
		imageStyle.objectFit = "cover";
	}
	else if(props.fit === "contain")
	{
		imageStyle.objectFit = "contain";
	}

	if(props.backgroundColor && !_.isEmpty(props.backgroundColor))
	{
		imageContainerStyle.backgroundColor = props.backgroundColor;
	}

	let imageComponent;
	
	if(props.displayMode === DisplayMode.Working)
	{
		imageComponent = <React.Fragment>
			<span className="center"><LoadIndicator color="#999" size={50} /></span>
		</React.Fragment>;
	}
	else
	{
		if (state.loadStatus === ImageLoadStatus.Loaded)
		{
			imageComponent = <img src={location} alt={altText} style={imageStyle} />;
		} 
		else if (state.loadStatus === ImageLoadStatus.Error) 
		{
			imageComponent = <i className="">Load Failed</i>;
		} 
		else 
		{
			imageComponent = <React.Fragment>
				<span className="center"><LoadIndicator color="#999" size={50} /></span>
				<img src={location} alt={altText} onLoad={handleImageLoaded.bind(this)} onError={handleImageErrored.bind(this)} style={imageStyle} />
			</React.Fragment>;
		}
	}
	
	if(props.enableViewer === true)
	{
		const linkUrl = props.id && !_.isEmpty(props.id) ? urlBuilder.pictureUrl(props.id, props.setId) : props.location ?? "";

		imageComponent = <Link to={linkUrl} state={{backUrl: window.location.toString(), itemUrl: props.location, itemMediaType: MediaType.Image }}>{imageComponent}</Link>
	}
	
	if(props.overlayText && !_.isEmpty(props.overlayText))
	{
		return (
			<div className={cssClasses.join(" ")} style={imageContainerStyle}>
				<div className={`${namespaceClassName}-text-overlay`}><span className={`${namespaceClassName}-text-overlay-content`}>{ props.overlayText }</span></div>
				{ imageComponent }
			</div>
		);
	}

	return (
		<div className={cssClasses.join(" ")} style={imageContainerStyle}>
			{ imageComponent }
		</div>
	);
};