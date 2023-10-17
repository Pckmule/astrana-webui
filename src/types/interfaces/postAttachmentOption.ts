/* tslint:disable */

import { AttachmentOption } from "../enums/attachmentOption";

export interface IPostAttachmentOption 
{
    typeId: AttachmentOption; 
    name: string; 
    iconName: string; 
    cssClassName?: string; 
    isAction?: boolean; 
    excludeFromTypeSelector?: boolean;
}