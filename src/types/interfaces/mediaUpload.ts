/* tslint:disable */

import { MediaType } from "../enums/mediaType";
import { UploadStatus } from "../enums/uploadStatus";

export interface IMediaUpload
{
    id?: string;
    typeId: MediaType;
    correlationId: string;
    status: UploadStatus; 
    referenceId?: string; 
    address?: string; 
    fileData: File; 
    fileSizeBytes?: number;
    width?: number;
    height?: number;
    displayOrder?: number;
}