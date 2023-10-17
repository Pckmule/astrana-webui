/* tslint:disable */

import { IPeerSummary } from "./peerSummary";
import { IPostAttachment } from "./postAttachment";

export interface IFeedItem 
{
    id: string;
    postId: string;
    text?: string;
    attachments?: IPostAttachment[];
    
    createdTimestamp: string;
    createdBy: string;
    createdByPeer: IPeerSummary;
    
    lastModifiedTimestamp?: string;
    lastModifiedBy?: string;
    lastModifiedByPeer?: IPeerSummary;
}