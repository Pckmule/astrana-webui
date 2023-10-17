/* tslint:disable */

import { MediaType } from "../enums/mediaType";

export interface IMediaItem
{
    id: string;
    typeId: MediaType;
    address: string; 
    mimeType?: string;
    width?: number;
    height?: number;
    fileSizeBytes?: number;
    displayOrder?: number;
}