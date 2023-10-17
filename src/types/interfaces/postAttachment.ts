/* tslint:disable */

import { AttachmentType } from "../enums/attachmentType";

import { ILink } from "./link";
import { IImage } from "./image";
import { IVideo } from "./video";
import { IAudio } from "./audio";
import { IContentCollection } from "./contentCollection";

export interface IPostAttachment
{
    type: AttachmentType; 
       
    correlationId: string,

    link?: ILink;
    linkId?: string;

    image?: IImage;
    imageId?: string;

    video?: IVideo;
    videoId?: string;

    audio?: IAudio;
    audioId?: string;

    contentCollection?: IContentCollection;
    contentCollectionId?: string;
}