export interface IAudio
{
    id?: string;
    location: string;
    previewLocationl?: string; 
    caption?: string;
    stretch?: boolean;    
    fileSizeBytes?: number;
    fileData?: File; 
}