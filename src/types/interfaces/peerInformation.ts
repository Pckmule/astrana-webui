export interface IPeerInformation 
{
    uuid: string;
    address: string;
    firstName: string;
    lastName: string | undefined;
    profilePictureUrl: string;
    profileCoverPictureUrl?: string;
    gender: number;
    mutalPeerCount: number;
}