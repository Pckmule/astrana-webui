import React, { useState, useEffect } from "react";

import { DisplayMode } from "../../types/enums/displayMode";
import { LoadStatus } from "../../types/enums/loadStatus";

import { IFeedItem } from "./../../types/interfaces/feedItem";

import ApiService from "./../../services/ApiService";

import { ProfilePostContentItem } from "./../../components/ProfilePostContentItem";

import "./Feed.scss";

export function Feed(props: 
{ 
    displayMode?: DisplayMode;
    translations: any
}) 
{
    // TODO: Remove
    const [loadingStatus, setLoadingStatus] = useState<LoadStatus>(LoadStatus.Loading);
    
    const [feedItems, setFeedItems] = useState<IFeedItem[]>([]);
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
                    setLoadingStatus(LoadStatus.Loaded);
                })
                .catch((err: Error) => {
                    console.log(err);
                    setLoadingStatus(LoadStatus.Loaded);
                });
        }, 2000);
    };

    const refreshList = () => 
    {
        retrieveFeedItems();
        setCurrentIndex(-1);
    };

    return (
        <div className="feed">
        {props.displayMode === DisplayMode.Normal && 
            <React.Fragment>
                <div className="feed-items">
                    <ul>
                        {(feedItems).map((feedItem) => (
                            <ProfilePostContentItem key={feedItem.id} data={feedItem} displayMode={props.displayMode} translations={props.translations} />
                        ))}
                    </ul>
                </div>
                <nav className="feed-pagination" aria-label="Page navigation example">
                    <ul className="pagination">
                        <li className="page-item"><a className="page-link" href="#">Previous</a></li>
                        <li className="page-item"><a className="page-link" href="#">1</a></li>
                        <li className="page-item"><a className="page-link" href="#">2</a></li>
                        <li className="page-item"><a className="page-link" href="#">3</a></li>
                        <li className="page-item"><a className="page-link" href="#">Next</a></li>
                    </ul>
                </nav>
            </React.Fragment>
        }
        </div>
    );
}