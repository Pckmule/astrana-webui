import React, { useEffect } from 'react';
import _ from 'lodash';

import { DisplayMode } from '../../types/enums/displayMode';

import { IPeerInformation } from '../../types/interfaces/peerInformation';

import TranslationService from '../../services/TranslationService';
import UrlBuilderService from '../../services/UrlBuilderService';
import PeerService from '../../services/PeerService';

import { Link } from 'react-router-dom';

import "./VideosList.scss";

export function VideosList(props: { displayMode?: DisplayMode; translations: any; profileId: string; pageSize?: number; }) 
{
    const [videos, setVideos] = React.useState<IPeerInformation[]>([]);

    const trxService = TranslationService();
    const urlBuilder = UrlBuilderService();
    
    const videoService = PeerService();
    
    const loadInitialData = async () => 
    {
        //setVideos(await videoService.getPeers(1, props.pageSize ?? 20));
    };

    useEffect(() => {
      loadInitialData();
    }, []);

    const cssClasses: string[] = ["card", "video-list", "rounded", "mt-3 mb-3"];

    if(props.displayMode === DisplayMode.Stencil)
      cssClasses.push("stencil");

    const getProfilePictureUrl = (video: IPeerInformation) => 
    {      
        if(_.isEmpty(video.profilePictureUrl))
        return "/images/placeholder-profile-picture.png";

        return video.profilePictureUrl;
    };

    return (
      <div className={cssClasses.join(" ")}>
          <div className="video-list-head">
            <h2>
              {trxService.trx(props.translations, "heading_videos")}
              <Link className="btn btn-sm btn-link float-end" to={urlBuilder.profileUrl("videos", props.profileId)}>{trxService.trx(props.translations, "heading_all_videos")}</Link>
            </h2>
          </div>
          <div className="video-list-body">
            <div className="videos">
              Videos List
            </div>
          </div>
      </div>
    );
};