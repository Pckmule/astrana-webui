import React, { useEffect } from 'react';
import _ from 'lodash';

import { Link } from 'react-router-dom';

import { IPeerInformation } from '../../types/objects/peerInformation';

import TranslationService from '../../services/TranslationService';
import UrlBuilderService from '../../services/UrlBuilderService';

import "./ProfileAbout.scss";
import PeerService from '../../services/PeerService';

export function ProfileAbout(props: { 
  displayMode?: "normal" | "skeleton";
  translations: any, 
  profileId: string; 
}) 
{
    const [profileInformation, setProfileAbout] = React.useState<IPeerInformation[]>([]);

    const trxService = TranslationService();
    const urlBuilder = UrlBuilderService();
    
    const videoService = PeerService();
    
    const loadInitialData = async () => 
    {
        //setProfileAbout(await videoService.getPeers(1, props.pageSize ?? 20));
    };

    useEffect(() => {
      loadInitialData();
    }, []);

    const cssClasses: string[] = ["card", "profile-about", "rounded", "mt-3 mb-3"];

    if(props.displayMode === "skeleton")
      cssClasses.push("skeleton");

    const getProfilePictureUrl = (video: IPeerInformation) => 
    {      
        if(_.isEmpty(video.profilePictureUrl))
        return "/images/placeholder-profile-picture.png";

        return video.profilePictureUrl;
    };

    return (
      <div className={cssClasses.join(" ")}>
          <div className="profile-about-head">
            <h2>
              {trxService.trx(props.translations, "heading_about")}
              <Link className="btn btn-sm btn-link float-end" to={urlBuilder.profileUrl("about", props.profileId)}>{trxService.trx(props.translations, "heading_all_about")}</Link>
            </h2>
          </div>
          <div className="profile-about-body">
            <div className="profile-about">
              About
            </div>
          </div>
      </div>
    );
};