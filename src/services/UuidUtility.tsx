import _ from 'lodash';

export default function UuidUtility() 
{
	const validGuidRegEx = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

	const emptyGuid = "00000000-0000-0000-0000-000000000000";

	function generateGuid()
	{
		let guid = "";

		for(let j = 0; j < 32; j++) 
		{
			if(j === 8 || j === 12 || j === 16 || j === 20) 
				guid = guid + '-';

			guid += Math.floor(Math.random() * 16).toString(16).toUpperCase();
		}

		return guid;
	}
	
	function isValidGuid(guid: string)
	{
		if(guid === emptyGuid)
			return true;

		if(guid.length !== emptyGuid.length)
			return false;

		return validGuidRegEx.test(guid);
	}
	
	return {
		emptyGuid,
		generateGuid,
		isValidGuid
	};
}