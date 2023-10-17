import { IImage } from "./image";
import { IPeerStatistics } from "./peerStatistics";

export interface IPeerSummary
{
    id: string;
    profileId: string;
    
    address: string;
    
    firstName: string;
    lastName: string;
    age?: number;
    gender?: number;
    
    profilePicture?: IImage;
    profileCoverPicture?: IImage;

    statistics?: IPeerStatistics
}