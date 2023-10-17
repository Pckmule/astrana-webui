/* tslint:disable */

import { IAlbumItem, IAlbumItemToAdd } from "./albumItem";
import { IImage } from "./image";

export interface IAlbum
{
    id: string;
    name: string;
    coverImage?: IImage;
    description: string;
    copyright: string;
    itemCount: number;
    contentItems: IAlbumItem[];
}

export interface IAlbumToAdd
{
    title: string;
    description: string;
    copyright: string;
    items: IAlbumItemToAdd[];
}