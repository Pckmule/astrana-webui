/* tslint:disable */

import { MediaType } from "../enums/mediaType";
import { UploadStatus } from "../enums/uploadStatus";

import { IAudio } from "./audio";
import { IImage } from "./image";
import { ILink } from "./link";
import { IVideo } from "./video";

export interface IAlbumItem
{
    id?: string;
    correlationId: string;
    mediaType: MediaType;

    // TODO: Refactor
    uploadStatus: UploadStatus; 
    referenceId?: string; 
    url?: string; 
    previewUrl?: string; 
    fileData?: File; 
    fileSizeBytes?: number;
    width?: number;
    height?: number;
    
    image?: IImage
    video?: IVideo
    audio?: IAudio
    link?: ILink
}

export interface IAlbumItemToAdd
{
    correlationId: string,
    uploadStatus: UploadStatus; 
    referenceId?: string | undefined; 
    url?: string | undefined; 
    fileData?: File; 
    fileSizeBytes?: number;
    width?: number;
    height?: number;
}