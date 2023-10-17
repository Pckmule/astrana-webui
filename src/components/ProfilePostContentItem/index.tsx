import React, { useRef } from "react";
import _ from 'lodash';
import moment from 'moment';

import { DisplayMode } from "../../types/enums/displayMode";

import { IPost } from "../../types/interfaces/post";
import { IFeedItem } from "../../types/interfaces/feedItem";

import UrlBuilderService from "../../services/UrlBuilderService";
import TextService from "./../../services/TextService";
import FeedService from "../../services/FeedService";
import PostService from "../../services/PostService";
import PeerService from "../../services/PeerService";

import { Link } from "react-router-dom";
import { PostLinkAttachment } from "../PostLinkAttachment";
import { ProfileImage } from './../../components/ProfileImage';
import { Image } from './../../components/Image';
import { Video } from "../Video";
import { AlbumCover } from "../AlbumCover";
import { InteractionsPanel } from "../InteractionsPanel";

import "./ProfilePostContentItem.scss";

export function ProfilePostContentItem(props: 
{
	data?: IFeedItem;
	postId?: string;
	hardBorders?: boolean;
	displayMode?: DisplayMode;
	translations: any;
}) 
{
	const namespaceClassName = "feed-content-item";

	let displayMode = props.displayMode ?? (!props.data ? DisplayMode.Stencil : DisplayMode.Normal);

	const [data, setData] = React.useState<IFeedItem | undefined>(props.data);

	const urlBuilder = UrlBuilderService();
	const feedService = FeedService();
	const postService = PostService();
	const peerService = PeerService();
	
	const testUser = {
		id: "7c0361d8-5db9-4e93-3516-08dbc7b4b147",
		profileId: "7c0361d8-5db9-4e93-3516-08dbc7b4b147",
		address: "",
		firstName:  "Test",
		lastName:  "User",
		gender:  1,
		age:  20,
		profilePictureUrl: "",
		profileCoverPictureUrl: ""
	};

	if(!props.data)
	{
		displayMode = DisplayMode.Stencil;

		if(props.postId)
		{
			postService.getPost(props.postId).then(async (post: IPost) => 
			{
				const createdByPeer = testUser;

				const feedItem: IFeedItem = {
					id: post.id,
					postId: post.id,
					text: post.text,
					attachments: post.attachments,

					createdTimestamp: post.createdTimestamp,
					createdBy: post.createdBy,
					createdByPeer: createdByPeer,

					lastModifiedTimestamp: post.lastModifiedTimestamp,
					lastModifiedBy: post.lastModifiedBy,
					lastModifiedByPeer: undefined
				};

				setData(feedItem);
			})
			.catch((error: Error) => { console.log(error); });
		}
	}
	
	const profileUrl = !props.data ? "/" : urlBuilder.profileUrl("default", props.data.createdByPeer.profileId);
	const profileFullName = peerService.buildPeerFullName(props.data?.createdByPeer);
	const profileGender = props.data?.createdByPeer.gender ?? undefined;
	const profilePictureUrl = peerService.getPeerProfilePictureUrlOrDefaultUrl(props.data?.createdByPeer);

	const linkAttachment = feedService.getLinkAttachment(data);
	const imageAttachment = feedService.getImageAttachment(data);
	const videoAttachment = feedService.getVideoAttachment(data);
	const collectionCollectionAttachment = feedService.getContentCollectionAttachment(data);
	
	const postContainerRef = useRef<HTMLDivElement>(null);	
	const postContainerDims = postContainerRef?.current?.getBoundingClientRect();

	const roundingClasses = props.hardBorders ? "rounded-0" : "rounded";
	const cssClasses: string[] = [namespaceClassName, roundingClasses, "mt-3 mb-4"];

	return (
		<div className={cssClasses.join(" ")} ref={postContainerRef}>
			<div className={`card ${roundingClasses} ${namespaceClassName}-content`}>

				<div className={`${namespaceClassName}-header`}>
					<div className="profile-picture rounded">
						{(displayMode === DisplayMode.Stencil ? <span className="stencil" style={{width:"40px", height:"40px"}}></span> :						 
							<ProfileImage peerName={profileFullName} imageAddress={profilePictureUrl} profileUrl={profileUrl} height={40} gender={profileGender} translations={props.translations} />
						)}
					</div>
				
					<div className={`${namespaceClassName}-details`}>
						<h4>
							{ displayMode === DisplayMode.Stencil && <span className="stencil w40"></span> }
							{ displayMode === DisplayMode.Normal && <Link to={profileUrl} tabIndex={0}><span>{profileFullName}</span></Link> }
						</h4>

						<span className="txt-sm">
							<span className="timestamp">
								{ displayMode === DisplayMode.Stencil && <span className="stencil w25"></span>}
								{ displayMode === DisplayMode.Normal && <Link to={`/post/${data!.id}`} tabIndex={-1}><span title={moment(data?.createdTimestamp).format('LLLL')}>{moment(data?.createdTimestamp).fromNow()}</span></Link> }
							</span>
						</span>
					</div>

					<div className="actions">
						<div aria-expanded="false" aria-haspopup="menu" aria-label="Actions for this post" role="button">
							<div>...</div>
						</div>
					</div>
				</div>

				{(displayMode === DisplayMode.Stencil || data === null) && 
					<div className="card-body">
							<div className="placeholder-body">
								<p>
									<span className="stencil x2 w100"></span>
									<span className="stencil x2 w15"></span>
									<span className="stencil x2 w80"></span>
									<span className="stencil x2 w60"></span>
									<span className="stencil x2 w40"></span>
									<span className="stencil x2 w25"></span>
									<span className="stencil x2 w50"></span>
									<span className="stencil x2 w15"></span>
									<span className="stencil x2 w95"></span>
								</p>
							</div>
					</div>
				}

				{(displayMode === DisplayMode.Normal  && data && data.text && !_.isEmpty(data.text)) && 
					<div className="card-body">
						<div className="card-text" dangerouslySetInnerHTML={{__html: TextService().formatHtml(data!.text) }}></div> 
					</div>
				}

				{data && data.attachments && 
				<div className={`${namespaceClassName}-attachment`}>
					{linkAttachment &&  
						<PostLinkAttachment title={linkAttachment.title} url={linkAttachment.url} description={linkAttachment.description} imageUrl={linkAttachment.previewImage ? linkAttachment.previewImage.location : undefined} />
					}
					{imageAttachment && imageAttachment.id && imageAttachment.url && 
						<Image id={imageAttachment.id} location={imageAttachment.url} enableViewer={true} />
					}
					{videoAttachment && videoAttachment.id && videoAttachment.url && 
						<Video id={videoAttachment.id} width={100} widthUnit="%" sources={[{location: videoAttachment.url, type: "video/mp4", size: "0" }]} enableViewer={true} />
					}
					{collectionCollectionAttachment && postContainerDims?.width &&
						<AlbumCover mediaItems={feedService.getContentCollectionAttachmentMediaItems(collectionCollectionAttachment)} maxWidth={Math.floor(postContainerDims?.width)} maxWidthUnit={"px"} maxHeight={600} enableViewer={true} setId={collectionCollectionAttachment.id} />
					}
				</div>}
				
				{ data && <InteractionsPanel targetContentId={data.postId} targetContentTypeId={"post"} peer={testUser} displayMode={props.displayMode} translations={props.translations} /> }
			</div>
		</div>
	);
}