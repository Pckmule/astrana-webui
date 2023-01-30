import _ from 'lodash';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './profileimage.css';

interface IProfileImageProps {
  peerName: undefined | string;
  imageAddress: undefined | string;
  profileUrl?: undefined | null | string;
  gender?: undefined | number;
  width?: undefined | number;
  height?: undefined | number;
  lazyLoad?: boolean; 
  ariaLabel?: string | undefined;
}

export function ProfileImage(props: IProfileImageProps) 
{
  interface IImageData {
    peerName: string;
    altText: string;
    address: string;
    profileUrl: string;
    gender: number;
    width: number | undefined;
    height: number;
    loading: "eager" | "lazy" | undefined; 
    ariaLabel: string | undefined;
  }

  const imageData: IImageData = {
    peerName: props.peerName ?? "Unknown Peer",
    address: _.isNull(props.imageAddress) || _.isEmpty(props.imageAddress) ? "/images/placeholder-profile-picture.png" : props.imageAddress!,
    altText: _.isNull(props.imageAddress) || _.isEmpty(props.peerName) ? "Profile Picture" : "Picture of " + props.peerName,
    profileUrl: _.isNull(props.imageAddress) || _.isEmpty(props.profileUrl) ? "" : props.profileUrl ?? "",
    gender: props.gender ?? 0,
    width: props.width ?? undefined,
    height: props.height ?? 40,
    loading: props.lazyLoad ? "lazy" : undefined,
    ariaLabel: _.isNull(props.ariaLabel) || _.isEmpty(props.ariaLabel) ? "Peer's Profile" : props.ariaLabel
  }

  const loadingImage = "/images/loaders/loading.gif";

  const [imageSrc, _setImageSrc] = useState(loadingImage);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      _setImageSrc(imageData.address);
    };
    img.src = imageData.address;
  }, [imageData.address]);

  return (
    (imageData.profileUrl === null || _.isEmpty(imageData.profileUrl) ? 
      <span><img src={imageSrc} alt={imageData.altText} style={{height: imageData.height, width: imageData.width }} loading={imageData.loading} /></span> :

      <Link to={imageData.profileUrl} aria-label={imageData.ariaLabel}>
        <img src={imageSrc} alt={imageData.altText} style={{height: imageData.height, width: imageData.width }} loading={imageData.loading} />
      </Link>
    )
  );
};
