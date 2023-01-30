import { Link, useLocation } from 'react-router-dom';

import _ from 'lodash';

import UrlBuilderService from "./../../services/UrlBuilderService";
import TranslationService from "./../../services/TranslationService";

import "./ProfileHeader.scss";

export interface IProfileHeaderState {
  coverPictureUrl: string;
  currentPageName: string;
}

export function ProfileHeader(props: { 
  displayMode?: "normal" | "skeleton";
  translations: any, 
  profileId: string | undefined;
  coverPictureUrl?: string;
  currentPageName: string;
}) 
{
    const cssClasses: string[] = ["profile-header", "rounded", "mt-3 mb-3"];

    if(props.displayMode === "skeleton")
      cssClasses.push("skeleton");

    const trxService = TranslationService();
    const urlBuilder = UrlBuilderService();
    
    const menuItems: any[] = [
      { id: "posts", trxCode: "heading_posts" },
      { id: "about", trxCode: "heading_about" },
      { id: "peers", trxCode: "heading_peers" },
      { id: "photos", trxCode: "heading_photos" },
      { id: "videos", trxCode: "heading_videos" }
    ];

    return (
      <div className={cssClasses.join(" ")}>
        <div className="profile-header-cover-picture">
          <img src={props.coverPictureUrl} />
        </div>

        <div className="profile-header-nav">   
          <ul className="nav nav-pills" role="navigation">
            {menuItems && menuItems.map((menuItem, index) => (
                <li className="nav-item" key={index}>
                  <Link className={"nav-link" + (props.currentPageName == menuItem.id ? " active" : "")} aria-label="posts" aria-current="page" to={urlBuilder.profileUrl(menuItem.id, props.profileId)}>{trxService.trx(props.translations, menuItem.trxCode)}</Link>
                </li>
            ))}
          </ul>
        </div>

      </div>
    );
};