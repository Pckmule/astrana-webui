import { useState, useEffect } from "react";
import _ from "lodash";

import { DisplayMode } from "../../types/enums/displayMode";
import { LoadStatus } from "../../types/enums/loadStatus";

import { IPost } from "../../types/interfaces/post";
import { IPeerSummary } from "../../types/interfaces/peerSummary";
import { IFeedItem } from "../../types/interfaces/feedItem";

import PostService from "../../services/PostService";

import { ProfilePostContentItem } from "./../../components/ProfilePostContentItem";

import "./ProfilePosts.scss";
import UuidUtility from "../../services/UuidUtility";

export function ProfilePosts(props: 
{ 
	displayMode?: DisplayMode; 
	translations: any; 
	instancePeerSummary: IPeerSummary;
	peerProfileId?: string; 
	refreshTimestamp?: string; 
}) 
{
	// TODO: Remove
	const [loadingStatus, setLoadingStatus] = useState<LoadStatus>(LoadStatus.Loading);

	const [peerSummaries, setPeerSummaries] = useState<IPeerSummary[]>();
	
	const [posts, setProfilePostsItems] = useState<IFeedItem[]>([]);
	const [currentPageIndex, setCurrentPageIndex] = useState<number>(-1);
		
	const [refreshTimestamp, setRefreshTimestamp] = useState<string>("");

	if(props.refreshTimestamp && refreshTimestamp !== props.refreshTimestamp)
	{
		console.dir(props.refreshTimestamp);

		setRefreshTimestamp(state => props.refreshTimestamp ?? "");	  
	}

	const uuidUtility = UuidUtility();
	const postService = PostService();
	
	useEffect(() => {
		retrieveProfilePostsItems();
		
	}, [refreshTimestamp]);

	const findPeerSummaryById = (peerId: string) : IPeerSummary | undefined => 
	{
		if(props.instancePeerSummary.id === peerId)
			return props.instancePeerSummary;
		
		return _.find(peerSummaries, ["id", peerId]);
	};
	
	const retrieveProfilePostsItems = async () => 
	{
		setLoadingStatus(LoadStatus.Loading);
		
		if(props.peerProfileId && !_.isEmpty(props.peerProfileId))
		{
			const peerProfileId = uuidUtility.isValidGuid(props.peerProfileId) ? props.peerProfileId : undefined;
			await postService.getPosts(peerProfileId, 1, 10).then((postsResponse: IPost[]) => 
			{
				if(postsResponse)
				{
					const feedItems: IFeedItem[] = [];

					for(const post of postsResponse)
					{
						const createdByPeer = findPeerSummaryById(post.createdBy);
						const lastModifiedByPeer = findPeerSummaryById(post.createdBy);

						if(createdByPeer)
						{
							feedItems.push({
								id: post.id,
								postId: post.id,
								text: post.text,
								attachments: post.attachments,

								createdTimestamp: post.createdTimestamp,
								createdBy: post.createdBy,
								createdByPeer: createdByPeer,

								lastModifiedTimestamp: post.lastModifiedTimestamp,
								lastModifiedBy: post.lastModifiedBy,
								lastModifiedByPeer: lastModifiedByPeer
							});
						}
					}

					setProfilePostsItems(feedItems);
				}

				setLoadingStatus(LoadStatus.Loaded);
			})
			.catch((error: Error) => {
				setLoadingStatus(LoadStatus.Loaded);
			});
		}
	};

	const refreshList = () => {
		retrieveProfilePostsItems();
		setCurrentPageIndex(-1);
	};
	
	if(props.displayMode !== DisplayMode.Stencil && !props.peerProfileId)
		return null;
	
	return (
		<ul className="profile-feed">
			{posts && posts.map((postItem, index) => (
				<ProfilePostContentItem key={index} data={postItem} displayMode={props.displayMode} translations={props.translations} />
			))}
		</ul>
	);
}