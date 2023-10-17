export interface IVideo 
{
    id?: string;
    location: string;
    previewLocationl?: string; 
    caption?: string;
    stretch?: boolean;    
    fileSizeBytes?: number;
    width?: number;
    height?: number;
    fileData?: File; 
}

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