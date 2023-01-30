import React, { useState, useEffect, ChangeEvent } from "react";

import { IUserInfo } from "../../types/interfaces/user";
import { ProfilePostItem } from "./../../types/api/api";

import ApiService from "./../../services/ApiService";

import { ProfilePostContentItemComponent } from "./../../components/ProfilePostContentItem/ProfilePostContentItem";

import "./ProfilePosts.scss";

export interface IProfilePostsState {
    userInfo: IUserInfo; 
}
  
export function ProfilePosts(props: { 
    displayMode?: "normal" | "skeleton";
    translations: any, 
    userInfo: IUserInfo; 
}) 
{
    // TODO: Remove
    const [loadingStatus, setLoadingStatus] = useState<string>("loading");
    const [feedItems, setProfilePostsItems] = useState<Array<ProfilePostItem>>([]);
    const [currentProfilePostsItem, setCurrentProfilePostsItem] = useState<ProfilePostItem | null>(null);
    const [currentIndex, setCurrentIndex] = useState<number>(-1);

    useEffect(() => {
        retrieveProfilePostsItems();
    }, []);

    const retrieveProfilePostsItems = async () => {
        
        setTimeout(async function()
        {
            await ApiService().getAll("posts?page=1&pageSize=10")
                .then((response: any) => 
                {
                    setProfilePostsItems(response.data);
                    setLoadingStatus("loaded");
                })
                .catch((err: Error) => {
                    console.log(err);
                    setLoadingStatus("loaded");
                });
        }, 2000);
    };

    const refreshList = () => {
        retrieveProfilePostsItems();
        setCurrentProfilePostsItem(null);
        setCurrentIndex(-1);
    };

    return (
        <ul className="feed">
            {feedItems && feedItems.map((feedItem, index) => (
                <ProfilePostContentItemComponent key={index} data={feedItem} getDataUrl={"/data/post"} createdByUser={props.userInfo} />
            ))}
        </ul>
    );
}