/* tslint:disable */

import { IImage } from "./image";

export interface ILink
{
    id: string;
    url: string;
    title?: string;
    description?: string;
    locale?: string;
    charSet?: string;
    robots?: string;
    siteName?: string;
    previewImage?: IImage;
}

export interface ILinkToAdd
{
    url: string;
    title?: string;
    description?: string;
    locale?: string;
    charSet?: string;
    robots?: string;
    siteName?: string;
    previewImage?: IImage;
}