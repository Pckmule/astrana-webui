/* tslint:disable */

export interface IUserInfo {
    id: string;
    firstName: string;
    fullName: string;
    gender: number;
    profilePicture: IPicture;
    coverPicture?: IPicture;
    description?: string;
    websiteUrl?: string;
}

export interface IPicture {
    caption?: string;
    location: string;
}