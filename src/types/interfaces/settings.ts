export interface ISystemSettingCategory {
	id?: string;
	name: string;
	nameTrxCode?: string;
	description?: string;
	descriptionTrxCode?: string;
	settingIds?: string[];
  }

export interface ISystemSetting {
	id: string;
	name: string;
	nameTrxCode?: string;
	shortDescription: string;
	shortDescriptionTrxCode?: string;
	dataType: string;
	defaultValue: string;
	value: string;
	userMaySet: boolean;
  }
