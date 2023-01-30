export interface ILookupData 
{
    label: string;
    trxCode: string;
    iconAddress?: string;
    options: ILookupOptionData[];
}

export interface ILookupOptionData 
{
    value: string;
    label: string;
    trxCode: string;
    iconAddress?: string;
}