/* tslint:disable */

import { IPostAttachment } from "../interfaces/postAttachment";

export interface IPost
{
    id: string;
    text?: string;
    attachments?: IPostAttachment[];
    createdBy: string;
    createdTimestamp:  string;
    lastModifiedBy?:  string;
    lastModifiedTimestamp?:  string;
}

export interface IPostToAdd
{
    text?: string;
    attachments?: IPostAttachment[];
}