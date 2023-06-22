/* tslint:disable */

import { AttachmentType } from "../enums/attachmentType";

export interface IPostAttachment
{
    type: AttachmentType;
    
    correlationId: string,
}