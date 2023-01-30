import React from 'react';

import TranslationService from '../../services/TranslationService';
import UrlBuilderService from '../../services/UrlBuilderService';

import { Link } from 'react-router-dom';
import { Image } from './../../components/Image';

import "./ProfilePhotos.scss";

export interface IProfilePhotosState {
  profileId: string;
}

export function ProfilePhotos(props: { 
  displayMode?: "normal" | "skeleton";
  translations: any,
  profileId: string; 
}) 
{
    const intialState = { 
      profileId: props.profileId ?? ""
    };
    
    const trxService = TranslationService();
    const urlBuilder = UrlBuilderService();
    
    const [state, setState] = React.useState<IProfilePhotosState>(intialState);

    const cssClasses: string[] = ["card", "profile-section", "rounded", "mt-3 mb-3"];

    if(props.displayMode === "skeleton")
      cssClasses.push("skeleton");

    return (
      <div className={cssClasses.join(" ")}>
          <div className="profile-section-head">
            <h2>
              {trxService.trx(props.translations, "heading_photos")}
              <Link className="btn btn-sm btn-link float-end" to={urlBuilder.profileUrl("photos", props.profileId)}>{trxService.trx(props.translations, "heading_all_photos")}</Link>
            </h2>
          </div>
          <div className="profile-section-body">
            <div className="images">
              <Image location="/images/temp/photos/photo1.jpg"></Image>
              <Image location="/images/temp/photos/photo2.jpg"></Image>
              <Image location="/images/temp/photos/photo3.jpg"></Image>
              <Image location="/images/temp/photos/photo4.jpg"></Image>
              <Image location="/images/temp/photos/photo5.jpg"></Image>
              <Image location="/images/temp/photos/photo6.jpg"></Image>
              <Image location="/images/temp/photos/photo7.jpg"></Image>
              <Image location="/images/temp/photos/photo8.jpg"></Image>
              <Image location="/images/temp/photos/photo9.jpg"></Image>
            </div>
          </div>
      </div>
    );
};