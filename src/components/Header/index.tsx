import React, { useEffect, useState } from 'react';

import { ProfilePostItem } from '../../types/api/api';
import { IUserInfo } from '../../types/interfaces/user';

import ApiService from '../../services/ApiService';

import { Link } from 'react-router-dom';
import { ProfileImage } from '../ProfileImage';
import { Button } from './../../components/Button';
import { Icon } from './../../components/Icon';

import './header.scss';

export function Header(props: { displayMode?: "normal" | "skeleton"; user?: any; }) 
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

    const onLogin = () => {};
    const onLogout = () => {};
    const onCreateAccount = () => {};

    return (
        <header>
          <div className="wrapper">
            <div>
              <Link to="/">
                <img width="32" height="32" src = "/logo192.png" style={{border: "1px solid white", borderRadius: "8px"}} />
                <h1>Astrana</h1>
              </Link>
            </div>
            <div>
              {props.user ? (
                  <span className="main-nav">
                    <a className="nav-item" href="#add"><Icon name="mdi-plus-circle-outline"></Icon></a>
                    <a className="nav-item" href="/notifications"><Icon name="mdi-bell"></Icon></a>
                    <Link className="nav-item" to="/settings"><Icon name="mdi-cog"></Icon></Link>
                    <a className="nav-item" onClick={onLogout} href="#logout"><Icon name="mdi-logout"></Icon></a>
                    <Link to="/profile" className="instance-user rounded">
                      <ProfileImage peerName={props.user.fullName} imageAddress={props.user.profilePictureUrl} width={32} height={32} />
                    </Link>
                  </span>
                  ) : (
                    <span>
                      <Button size="small" onClick={onLogin} label="Log in" />
                      <Button primary size="small" onClick={onCreateAccount} label="Sign up" />
                    </span>
                  )}
            </div>
          </div>
        </header>
    );
}