/* tslint:disable */
/**
 * Model of parameters for API `/api/posts`
 */
export interface PostsParameters {
    createdAfter?: string;
    createdBefore?: string;
    createdBy?: string;
    page?: number;
    pageSize?: number;
}
export type PostsResponse<
        TCode extends 200 = 200,
        TContentType extends 'application/json' = 'application/json'
    > = TCode extends 200
    ? TContentType extends 'application/json'
    /**
     * Success
     */
    ? null
    : any
    : any;
export type PostspostResponse<
        TCode extends 200 = 200,
        TContentType extends 'application/json' = 'application/json'
    > = TCode extends 200
    ? TContentType extends 'application/json'
    /**
     * Success
     */
    ? null
    : any
    : any;
export interface PostToAdd {
    text: string;
    postAttachmentId?: null | string;
    locationId?: null | string;
}

export interface Post {
    id: string;
    text: string;
    postAttachmentId?: null | string;
    locationId?: null | string;
    createdTimestamp: string;
    getData?: null |string;
}

export type PostspostRequest<
        TCode extends 'application/json' | 'text/json' | 'application/*+json' =
        | 'application/json'
        | 'text/json'
        | 'application/*+json'
    > = TCode extends 'application/json'
    ? Array<PostToAdd>
    : TCode extends 'text/json'
    ? Array<PostToAdd>
    : TCode extends 'application/*+json'
    ? Array<PostToAdd>
    : any;
export type SystemstatusResponse<
        TCode extends 200 = 200,
        TContentType extends 'application/json' = 'application/json'
    > = TCode extends 200
    ? TContentType extends 'application/json'
    /**
     * Success
     */
    ? null
    : any
    : any;

export interface LoginRequest {
    username: string;
    password: string;
    rememberMe: boolean
}

export interface IQueryParameter {
    key: string;
    value: string | number;
}

export interface IProfilePostItem {
    id: string;
    peerName: string;
    peerPictureUrl: null | string;
    profileUrl: string;
    text: string;
    attachmentId?: null | string;
    createdTimestamp: string;
    createdById: string;
    createdByName: string;
    createdByGender?: number;
    locationId?: null | string;
    getData?: null |string;
}


export interface ApiError 
{
    code: string;
    message: string;
}