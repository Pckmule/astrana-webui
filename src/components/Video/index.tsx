import React from 'react';
import _ from 'lodash';

import { DisplayMode } from '../../types/enums/displayMode';
import { MediaType } from '../../types/enums/mediaType';
import { ImageLoadStatus } from '../../types/enums/imageLoadStatus';

import {IVideoSource, IVideoCaption} from "../../types/interfaces/video";
import UrlBuilderService from '../../services/UrlBuilderService';

import { Link } from 'react-router-dom';
import { LoadIndicator } from './../../components/LoadIndicator';
import Plyr, { APITypes } from './../../lib/astrana-plyr-react/astrana-plyr-react';
import { Source, Track } from 'plyr';

import "./Video.scss";
import "plyr/dist/plyr.css"

export interface IVideoState {
	videoElement?: any; 
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

export function Video(this: any, props: {
	displayMode?: DisplayMode;
	id?: string; 
	poster?: string; 
	sources: IVideoSource[]; 
	muted?: boolean;
	autoPlay?: boolean;
	loop?: boolean;
	languageCode?: string; 
	captions?: IVideoCaption[]; 
	caption?: string;
	stretch?: boolean;
	fit?: "cover" | "contain";
	width?: number;
	widthUnit?: string;
	height?: number; 
	maximumHeight?: number; 
	onVideoLoad?: Function;
	preload?: boolean;
	showModifyControl?: boolean;
	modifyHandler?: Function;
	showRemoveControl?: boolean;
	removeHandler?: Function;
	cssClassNames?: string;
	backgroundColor?: string;
	enableViewer?: boolean;
	setId?: string;
}) 
{
	const namespaceClassName = "video";

	const urlBuilder = UrlBuilderService();

	const defaultMaximumHeight = 304;
	const placeholderVideoLocation = "/videos/placeholder.png";

	const placeholderVideoPoster = "/videos/placeholder-poster.png";

	const placeholderVideoSource = {
		location: "/videos/placeholder.mp4",
		type: "video/mp4",
		size: "576"
	};

	const intialState = { 
		videoElement: undefined, 
		loadStatus: props.preload ? ImageLoadStatus.Loading : ImageLoadStatus.Loaded, 
		stretch: props.stretch ?? false,
		marginTop: 0,
		marginLeft: 0,
		maximumHeight: props.maximumHeight ?? defaultMaximumHeight,
		stretchWidth: undefined,
		resizing: false
	};
	
	const [state, setState] = React.useState<IVideoState>(intialState);

	const cssClasses: string[] = [namespaceClassName];

	if(props.stretch)
		cssClasses.push("stretch");

	if(props.cssClassNames)
		cssClasses.push(props.cssClassNames);

	function resetElementWidthAndHeight(element: any)
	{
		if(!element || !element.style)
			return;

		element.style.width = null;
		element.style.height = null;
	}

	function calculateMargins(element: any, state: IVideoState)
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

	function handleVideoLoaded(e: any) 
	{
		if(typeof(props.onVideoLoad) === "function")
		{
			props.onVideoLoad(e.target);
		}

		setState(state => {

			if(e && e.target)
			{
				state.videoElement = e.target;
				state.loadStatus = ImageLoadStatus.Loaded;
				
				resetElementWidthAndHeight(e.target);
				calculateMargins(e.target, state);
			}
			else
				state.loadStatus = ImageLoadStatus.Error;
	
			return state;
		});
	}

	function handleVideoErrored(e: any) 
	{
		setState(state => {

			state.loadStatus= ImageLoadStatus.Error;
		
			if(e && e.target)
			{
				state.videoElement = e.target;
			}
	
			return state;
		});
	}

	const videoContainerStyle: any = { };
	const videoStyle: any = { };

	if(props.width)
	{
		videoContainerStyle.width = props.widthUnit ? props.width + props.widthUnit : props.width + "px";
		videoStyle.width = props.widthUnit ? props.width + props.widthUnit : props.width + "px";
	}

	if(props.height)
	{
		videoContainerStyle.height = _.isNumber(props.height) ? props.height + "px" : props.height;
		videoStyle.height = _.isNumber(props.height) ? props.height + "px" : props.height;
	}

	if(props.preload)
	{
		if(state.loadStatus === ImageLoadStatus.Loading)
		{
			videoStyle.width = "1px";
			videoStyle.height = "1px";
			videoStyle.position = "absolute";
			videoStyle.top = "0px";
			videoStyle.left = "0px";
		}
	}

	if(state.stretch)
	{
		videoStyle.marginTop = state.marginTop + "px";
		videoStyle.marginLeft = state.marginLeft + "px";

		if(state.stretchWidth && state.stretchWidth > 0)
		{
			videoStyle.width = state.stretchWidth + "px";
			videoStyle.maxWidth = state.stretchWidth + "px";
		}
	}

	if(!props.fit || props.fit === "cover")
	{
		videoStyle.objectFit = "cover";
	}
	else if(props.fit === "contain")
	{
		videoStyle.objectFit = "contain";
	}

	if(props.backgroundColor && !_.isEmpty(props.backgroundColor))
	{
		videoContainerStyle.backgroundColor = props.backgroundColor;
	}

	const ref = React.useRef<APITypes>(null);

	const sources = props.sources.map((source, index) => ({ 
		src: source.location, 
		size: parseInt(source.size, 10), 
		provider: undefined, 
		type: undefined 
	} as Source));

	const captionTracks = props.captions ? props.captions.map((caption, index) => ({ 
		kind: "captions",		
		label: caption.label,
		srclang: caption.languageCode,
		src: caption.location,
		default: caption.isDefault
	} as Track)) : [];

	const tracks = [] as Track[];
	tracks.push(...captionTracks);

	const mutedOn = props.muted === false ? false : true; 
	const autoPlayOn = props.autoPlay === true ? true : false; 
	const loopOn = props.loop === true ? true : false; 

	const videoOptions = {
		controls: [
			'rewind',
			'play',
			'fast-forward',
			'progress',
			'current-time',
			'duration',
			'mute',
			'volume',
			'settings',
			'fullscreen',
			'captions'
		],
		settings: ['captions', 'quality', 'speed', 'loop'],
		captions: { active: true, language: "en", update: false },
		speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] },
		ads: { enabled: false }
	};

	const videoControlsList: string[] = ["nodownload"];

	let videoComponent;
	
	if(props.displayMode === DisplayMode.Working)
	{
		videoComponent = <React.Fragment>
			<span className="center"><LoadIndicator color="#999" size={50} /></span>
		</React.Fragment>;
	}
	else
	{
		if (state.loadStatus === ImageLoadStatus.Loaded)
		{
			videoComponent = <video controls muted={mutedOn} autoPlay={autoPlayOn} loop={loopOn} controlsList={videoControlsList.join(" ")} style={videoStyle}>
				{sources.map((source) => {
					return (
						<source src={source.src} type={source.type} />
					)
				})}
				<React.Fragment>Your browser does not support the video tag.</React.Fragment>
			</video> 
		} 
		else if (state.loadStatus === ImageLoadStatus.Error) 
		{
			videoComponent = <i className="">Load Failed</i>;
		} 
		else 
		{
			videoComponent = <React.Fragment>
				<span className="center"><LoadIndicator color="#999" size={50} /></span>
				<video controls muted={mutedOn} autoPlay={autoPlayOn} loop={loopOn} controlsList={videoControlsList.join(" ")} style={videoStyle}>
					{sources.map((source) => {
						return (
							<source src={source.src} type={source.type} />
						)
					})}
					<React.Fragment>Your browser does not support the video tag.</React.Fragment>
				</video> 
			</React.Fragment>;
		}
	}
	
	if(props.enableViewer === true)
	{
		const linkUrl = props.id && !_.isEmpty(props.id) ? urlBuilder.pictureUrl(props.id, props.setId) : "props.location" ?? "";

		videoComponent = <Link to={linkUrl} state={{backUrl: window.location.toString(), itemUrl: "props.location", itemMediaType: MediaType.Video }}>{videoComponent}</Link>
	}
	
	if(!sources || sources.length < 1 || !videoOptions)
		return null;

	return (
		<div className={cssClasses.join(" ")} style={videoContainerStyle}>
			{ videoComponent }
		</div>
	);

	/*
return (
		<Plyr ref={ref}
			source={{ type: "video", poster: props.poster, sources: sources, tracks: tracks }}
			options={videoOptions}
			playsInline
		/>
	);
	*/
};