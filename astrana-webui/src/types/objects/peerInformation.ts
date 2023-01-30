export interface IPeerInformation 
{
    uuid: string;
    address: string;
    firstName: string;
    lastName: string | undefined;
    profilePictureUrl: string;
    gender: number;
    mutalPeerCount: number;
}