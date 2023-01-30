import React, { useState, useEffect, ChangeEvent } from "react";

import { IUserInfo } from "../../types/interfaces/user";

import { IFeedItem } from "./../../types/api/api";
import ApiService from "./../../services/ApiService";
import { FeedContentItemComponent } from "./../../components/FeedContentItem/FeedContentItem";

import "./Feed.scss";
import { IServiceWrapper } from "../../types/interfaces/services";

export function Feed(props: { 
    displayMode?: "normal" | "skeleton";
    translations: any
}) 
{
    // TODO: Remove
    const [loadingStatus, setLoadingStatus] = useState<string>("loading");
    const [feedItems, setFeedItems] = useState<Array<IFeedItem>>([]);
    const [currentFeedItem, setCurrentFeedItem] = useState<IFeedItem | null>(null);
    const [currentIndex, setCurrentIndex] = useState<number>(-1);

    useEffect(() => {
        retrieveFeedItems();
    }, []);

    const retrieveFeedItems = async () => {
        
        setTimeout(async function()
        {
            await ApiService().getAll("feed?page=1&pageSize=10")
                .then((response: any) => 
                {
                    setFeedItems(response.data);
                    setLoadingStatus("loaded");
                })
                .catch((err: Error) => {
                    console.log(err);
                    setLoadingStatus("loaded");
                });
        }, 2000);
    };

    const refreshList = () => {
        retrieveFeedItems();
        setCurrentFeedItem(null);
        setCurrentIndex(-1);
    };

    const createdByUser:IUserInfo = {
        id: "12345",
        firstName: "Darin",
        fullName: "Darin Morris",
        gender: 1,
        profilePictureUrl: "/images/temp/profile-photo.jpg",
        profileCoverPicture: "/images/temp/cover-photo.jpg",
        description: "Aliquam at tellus pellentesque nunc porta sollicitudin. Suspendisse et purus et metus sagittis rutrum.",
        websiteUrl: "https://www.darinm.com"
    };

    return (
        <React.Fragment>
        {props.displayMode === "normal" &&
            <ul className="feed">
                {feedItems && feedItems.map((feedItem, index) => (
                    <FeedContentItemComponent key={index} data={feedItem} getDataUrl={"/data/post"} createdByUser={createdByUser} />
                ))}
            </ul>
        }
        </React.Fragment>
    );
}