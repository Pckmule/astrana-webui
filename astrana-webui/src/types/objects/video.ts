export interface IVideoSource 
{
    location: string;
    type: string;
    size: string;
}

export interface IVideoCaption
{
    location: string;
    label: string;
    languageCode: string;
    isDefault: boolean;
}