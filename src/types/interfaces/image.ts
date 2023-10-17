export interface IImage 
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