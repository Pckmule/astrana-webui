/* tslint:disable */

import { AttachmentType } from "../enums/attachmentType";

export interface IPostAttachmentType 
{
    typeId: AttachmentType; 
    name: string; 
    iconName: string; 
    cssClassName?: string; 
    isAction?: boolean; 
    excludeFromTypeSelector?: boolean;
}