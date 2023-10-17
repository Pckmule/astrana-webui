/* tslint:disable */

import { AttachmentType } from "../enums/attachmentType";

import { IImage } from "./image";
import { IAudio } from "./audio";
import { IVideo } from "./video";
import { ILink } from "./link";
import { MediaType } from "../enums/mediaType";

export interface IContentCollection 
{
    id?: string;
    name: string;
    caption?: string;
    copyright?: string;
    contentItems: IContentCollectionItem[];
    itemCount?: number;
}

export interface IContentCollectionItem
{
    id?: string;
    mediaType: MediaType;

    imageId?: string;
    image?: IImage;

    videoId?: string;
    video?: IVideo;
    
    audioId?: string;
    audio?: IAudio;
    
    linkId?: string;
    link?: ILink;

    displayOrder?: number;
}

export interface IContentCollectionToAdd
{
    id?: string;
    name: string;
    contentItems: IContentCollectionItem[];
}

export interface IContentCollectionItemToAdd
{
    id?: string;
    mediaType: AttachmentType;
    imageId?: string;
    videoId?: string;
    audioId?: string;
}