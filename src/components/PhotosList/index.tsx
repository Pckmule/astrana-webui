import React, { useEffect } from 'react';
import _ from 'lodash';

import { Link } from 'react-router-dom';

import { IPeerInformation } from '../../types/objects/peerInformation';

import TranslationService from '../../services/TranslationService';
import UrlBuilderService from '../../services/UrlBuilderService';

import "./PhotosList.scss";
import PeerService from '../../services/PeerService';

export function PhotosList(props: { 
  displayMode?: "normal" | "skeleton";
  translations: any, 
  profileId: string; 
  pageSize?: number;
}) 
{
    const [photos, setPhotos] = React.useState<IPeerInformation[]>([]);

    const trxService = TranslationService();
    const urlBuilder = UrlBuilderService();
    
    const photoService = PeerService();
    
    const loadInitialData = async () => 
    {
        //setPhotos(await photoService.getPeers(1, props.pageSize ?? 20));
    };

    useEffect(() => {
      loadInitialData();
    }, []);

    const cssClasses: string[] = ["card", "photo-list", "rounded", "mt-3 mb-3"];

    if(props.displayMode === "skeleton")
      cssClasses.push("skeleton");

    const getProfilePictureUrl = (photo: IPeerInformation) => 
    {      
        if(_.isEmpty(photo.profilePictureUrl))
        return "/images/placeholder-profile-picture.png";

        return photo.profilePictureUrl;
    };

    return (
      <div className={cssClasses.join(" ")}>
          <div className="photo-list-head">
            <h2>
              {trxService.trx(props.translations, "heading_photos")}
              <Link className="btn btn-sm btn-link float-end" to={urlBuilder.profileUrl("photos", props.profileId)}>{trxService.trx(props.translations, "heading_all_photos")}</Link>
            </h2>
          </div>
          <div className="photo-list-body">
            <div className="photos">
              Photos List
            </div>
          </div>
      </div>
    );
};