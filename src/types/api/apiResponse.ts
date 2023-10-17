/* tslint:disable */
export interface IApiResponse<T>
{
	message?: string;
	data?: T | null;
	failures?: []
}