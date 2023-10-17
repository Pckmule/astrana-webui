import _ from 'lodash';

import { ReadyStatus } from '../types/enums/readyStatus';

import LogService from './LogService';
import ApiService from '../services/ApiService';
import ToastService from './ToastService';

export default function DataLoadUtility() 
{	
	const logService = LogService();
	const toastService = ToastService();
	
	const canBeginLoad = (currentLoadStatus: ReadyStatus, expectedLoadCount: number, currentLoadCount: number) => 
	{
		return currentLoadStatus === ReadyStatus.Ready && !hasDataLoaded(currentLoadStatus, expectedLoadCount, currentLoadCount);
	}

	const handleLoad = async (currentLoadStatus: ReadyStatus, setLoadStatus: React.Dispatch<React.SetStateAction<ReadyStatus>>, loadDataFunc: () => void, expectedLoadCount: number, currentLoadCount: number) => 
	{
		checkAndSetLoadStatus(setLoadStatus, currentLoadStatus, expectedLoadCount, currentLoadCount);

		if(canBeginLoad(currentLoadStatus, expectedLoadCount, currentLoadCount) && _.isFunction(loadDataFunc))
		{
			return await ApiService().canConnect().then(async () => 
			{
				logService.info("Loading initial data...");

				loadDataFunc();
			})
			.catch((error: Error) => 
			{
				logService.log(error); 
				
				toastService.notify("Unable to connecto API.");
				
				setLoadStatus(ReadyStatus.LoadError);
			});
		}
		else
		{
			return Promise.resolve();
		}
	}

	const hasDataLoaded = (currentLoadStatus: ReadyStatus, expectedLoadCount: number, currentLoadCount: number) => 
	{
		return (currentLoadStatus !== ReadyStatus.Loaded && currentLoadCount === expectedLoadCount);
	}

	const checkAndSetLoadStatus = (setLoadStatus: React.Dispatch<React.SetStateAction<ReadyStatus>>, currentLoadStatus: ReadyStatus, expectedLoadCount: number, currentLoadCount: number) => 
	{
		logService.debug(`Loaded ${currentLoadCount} of ${expectedLoadCount}.`);

		if(hasDataLoaded(currentLoadStatus, expectedLoadCount, currentLoadCount)) 
		{
			setLoadStatus(ReadyStatus.Loaded); 
			
			logService.info("Initial data load completed.");
		}
	}
  
	const isLoadComplete = (loadStatus: ReadyStatus) => 
	{
		return loadStatus === ReadyStatus.Loaded;
	}

	return {
	    handleLoad,
		checkAndSetLoadStatus,
		isLoadComplete
	};
}