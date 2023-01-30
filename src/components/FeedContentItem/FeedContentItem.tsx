import React from "react";
import _ from 'lodash';
import moment from 'moment';

import { IUserInfo } from "../../types/interfaces/user";
import { IImage } from "./../../types/objects/image";

import TextService from "./../../services/TextService";
import { IFeedItem } from "../../types/api/api";

import { ProfileImage } from './../../components/ProfileImage';
import { Icon } from './../../components/Icon';
import { ImageSet } from './../../components/ImageSet';

import "./FeedContentItem.scss";

export function FeedContentItemComponent(props: {
    data?: IFeedItem | null | undefined;
    getDataUrl?: string | null | undefined;
    createdByUser: IUserInfo;
    imageSet?: IImage[];
    hardBorders?: boolean;
}) 
{
    const [state, setState] = React.useState({ 
        data: props.data,
        getDataUrl: props.getDataUrl ?? null,
        imageSet: props.imageSet ?? [], 
        hardBorders: props.hardBorders ?? false
    });

    let cssClasses = "feed-content-item m-3";
    const roundingClasses = state.hardBorders ? "rounded-0" : "rounded";

    cssClasses += " " + roundingClasses;

    return (
        <div className={cssClasses}>
            <div className={"card " + roundingClasses + " feed-content-item-content"}>

                <div className="feed-content-item-header">
                    <div className="profile-picture rounded">
                        {(state.data === null ? <span className="skeleton" style={{width:"40px", height:"40px"}}></span> :                         
                            <><ProfileImage peerName={state.data?.peerName} imageAddress={state.data?.peerPictureUrl ?? ""} profileUrl={state.data?.profileUrl} height={40} gender={0} /></>
                        )}
                    </div>
                
                    <div className="feed-content-item-details">
                        <h4>{(state.data === null ? <span className="skeleton w40"></span> : <a href={state.data?.profileUrl} role="link" tabIndex={0}><span>{state.data?.peerName}</span></a>)}</h4>
                        <span className="txt-sm"><span className="timestamp">
                        {(state.data === null ? <span className="skeleton w25"></span> : <a href={`/post/${state.data!.id}`} role="link" tabIndex={0}><span title={moment(state.data?.createdTimestamp).format('LLLL')}>{moment(state.data?.createdTimestamp).fromNow()}</span></a>)}
                        </span></span>
                    </div>

                    <div className="actions">
                        <div aria-expanded="false" aria-haspopup="menu" aria-label="Actions for this post" role="button">
                            <div>...</div>
                        </div>
                    </div>
                </div>

                <div className="card-body">
                    {(state.data === null ?
                        <div className="placeholder-body">
                            <p>
                                <span className="skeleton x2 w100"></span>
                                <span className="skeleton x2 w15"></span>
                                <span className="skeleton x2 w80"></span>
                                <span className="skeleton x2 w60"></span>
                                <span className="skeleton x2 w40"></span>
                                <span className="skeleton x2 w25"></span>
                                <span className="skeleton x2 w50"></span>
                                <span className="skeleton x2 w15"></span>
                                <span className="skeleton x2 w95"></span>
                            </p>
                        </div> :
                        <div className="card-text" dangerouslySetInnerHTML={{__html: TextService.formatHtml(state.data!.text) }}></div>
                    )}
                </div>

                {state.imageSet.length > 0 ? 
                <div className={"feed-content-item-attachment"}>
                    <ImageSet images={state.imageSet} maximumHeight={304} />
                </div>: null}

                {(state.data !== null ?
                <div className="feed-content-item-interactions">
                    <div className="interactions-details">
                        <div className="count reactions-count">
                            <a href="#" className="fw-n">{0}</a>
                        </div>
                        <div className="count comments-count">
                            <a href="#" className="fw-n">{0} comments</a>
                        </div>
                        <div className="count shares-count">
                            <a href="#" className="fw-n">{0} shares</a>
                        </div>
                    </div>
                    
                    <div className="actions">
                        <span className="action react">
                            <span><Icon name="thumb_up" marginRight={2} /> Like</span>
                        </span>

                        <span className="action comment">
                            <span><Icon name="insert_comment" marginRight={2} /> Comment</span>
                        </span>

                        <span className="action share">
                            <span><Icon name="share" marginRight={2} /> Share</span>
                        </span>
                    </div>
                </div>: null)}
            </div>
        </div>
    );
}