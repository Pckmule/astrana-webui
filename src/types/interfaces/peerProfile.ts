import { IContentCollection } from "./contentCollection";

export interface IPeerProfile 
{
    id: string;
    profileId: string;
    firstName: string;
    lastName: string;
    gender: number;
    dateOfBirth: string;
    introduction?: string;
    userAccountId: string;
    
    profilePicturesCollection?: IContentCollection;
    coverPicturesCollection?: IContentCollection;
    
    createdBy: string;
    createdTimestamp: string;
    lastModifiedBy: string​;
    lastModifiedTimestamp: string;
}