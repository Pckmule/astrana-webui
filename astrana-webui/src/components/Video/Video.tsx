import "./Video.scss";

import React from 'react';

import Plyr, { APITypes } from './../../lib/astrana-plyr-react/astrana-plyr-react';
import { Source, Track } from 'plyr';
import "plyr/dist/plyr.css";

import * as Constants from "./../../constants";

import {IVideoSource, IVideoCaption} from "../../types/objects/video";

export interface IVideoState {
    id: string;
    poster: string;
    sources: IVideoSource[];
    languageCode?: string;
    captions: IVideoCaption[];
}

export function Video(props: { 
    id?: string | null | undefined; 
    poster: string; 
    sources: IVideoSource[]; 
    languageCode?: string; 
    captions: IVideoCaption[]; 
})
{
    const placeholderVideoPoster = "/videos/placeholder-poster.png";

    const placeholderVideoSource = {
        location: "/videos/placeholder.mp4",
        type: "video/mp4",
        size: "576"
    };

    const intialState = {
        id: props.id ?? "",
        poster: props.poster ?? placeholderVideoPoster,
        sources: props.sources ?? [placeholderVideoSource],
        languageCode: props.languageCode ?? Constants.defaultLanguage.code,
        captions: props.captions ?? []
    };
    
    const [state, setState] = React.useState<IVideoState>(intialState);

    const getCurrentState = function()
    {
        return JSON.parse(JSON.stringify(state));
    }

    const ref = React.useRef<APITypes>(null);

    const sources = state.sources.map((source, index) => ({ 
        src: source.location, 
        size: parseInt(source.size, 10), 
        provider: undefined, 
        type: undefined 
    } as Source));

    const captionTracks = state.captions.map((caption, index) => ({ 
        kind: "captions",        
        label: caption.label,
        srclang: caption.languageCode,
        src: caption.location,
        default: caption.isDefault
    } as Track));

    const tracks = [] as Track[];
    tracks.push(...captionTracks);

    console.dir(tracks);

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

    return <Plyr 
        ref={ref}
        source={{ type: "video", poster: state.poster, sources: sources, tracks: tracks }}
        options={videoOptions}
        crossOrigin="true"
        playsInline
    />
}