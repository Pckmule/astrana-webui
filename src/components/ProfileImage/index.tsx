import _ from 'lodash';

import { DisplayMode } from '../../types/enums/displayMode';

import { Link } from 'react-router-dom';
import { Image } from '../Image';

import TranslationService from "./../../services/TranslationService";

import './profileimage.css';

export function ProfileImage(props: 
{
	displayMode?: DisplayMode; 
	translations: any;
	imageAddress: string;
	profileUrl?: string;
	peerName?: string;
	gender?: number;
	width?: number;
	height?: number;
}) 
{
	const trxService = TranslationService();

	const defaultIfEmpty = (value?: string, defaultValue?: string) => 
	{
		return value && !_.isEmpty(value) ? value : defaultValue;
	};

	const profileUrl = defaultIfEmpty(props.profileUrl, undefined);
	const gender = props.gender ?? 0;
	const peerName = defaultIfEmpty(props.peerName, trxService.trx(props.translations, "unknown_peer"));
	const address = defaultIfEmpty(props.imageAddress, "/images/placeholder-profile-picture.png") + "";
	const altText = defaultIfEmpty(trxService.trx(props.translations, "picture_of").replace("{{peer_name}}", peerName), trxService.trx(props.translations, "profile_picture")) + "";
	const ariaLabel = defaultIfEmpty(altText, trxService.trx(props.translations, "peers_profile"));

	return (
		(!profileUrl ? 
			<span>
				<Image displayMode={props.displayMode} location={address} altText={altText} />
			</span> :

			<Link to={profileUrl} aria-label={ariaLabel}>
				<Image displayMode={props.displayMode} location={address} altText={altText} />
			</Link>
		)
	);
};
