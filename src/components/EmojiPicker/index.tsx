
import React, { useEffect } from 'react';
import _ from 'lodash';

import { DisplayMode } from '../../types/enums/displayMode';
import { LoadStatus } from '../../types/enums/loadStatus';

import LocalCacheService from '../../services/LocalCacheService';
import TranslationService from '../../services/TranslationService';
import EmojiService from '../../services/EmojiService';

import { Icon } from '../Icon';
import { LoadIndicator } from '../LoadIndicator';

import "./EmojiPicker.scss";

interface IEmojiGroup
{
	id: string;
	nameTrxCode: string;
	iconName: string;
}

export function EmojiPicker(props: { 
  displayMode?: DisplayMode;
  translations: any;
  width?: number;
  visible: boolean;
  positionTop: number;
  positionLeft: number;
  onSelect: (character: string) => void;
  onBlur: () => void;
}) 
{
    const namespaceClassName = "emoji-picker";

    const recentGroupId = "recent";
    const recentEmojisCacheKey = "emoji_picker_recently_selected";
    const recentEmojisCacheMaxSize = 15;
  
    const localCacheService = LocalCacheService();
    const trxService = TranslationService();
    const emojiService = EmojiService();
    
    const [loadStatus, setLoadStatus] = React.useState<LoadStatus>(LoadStatus.Ready);
    const [preloadCount, setPreloadCount] = React.useState(0);

    const countPreloadCompletionAsync = () => setPreloadCount((preloadCount) => preloadCount + 1);

      useEffect(() => {
        if(loadStatus !== LoadStatus.Loaded)
        {
          localCacheService.configCache(recentEmojisCacheKey, recentEmojisCacheMaxSize);
          loadInitialData();
        }
      }, []);
    
    const [emojiData, setEmojiData] = React.useState<any[]>([]);
    const [selectedGroupId, setSelectedGroupId] = React.useState<string>(recentGroupId);
    const [filterText, setFilterText] = React.useState<string>("");

    const isLoaded = () => 
    {
        return (loadStatus !== LoadStatus.Loaded && preloadCount === 1);
    };

    const loadInitialData = async () => 
    {
        setLoadStatus(LoadStatus.Loading);

        await emojiService.getEmojis().then(async (emojis: any | undefined) => 
        {
            if(emojis)
              setEmojiData(emojis);
              
            countPreloadCompletionAsync();
        })
        .catch((error: Error | undefined) => { console.log(error); });
    };

    if(isLoaded())
    {
        setLoadStatus(LoadStatus.Loaded);
    }

    if(loadStatus === LoadStatus.Ready)
    {
        loadInitialData();
    }

    const pickerDivRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
      pickerDivRef.current?.focus();
    }, []);

    const style: any = {};

    if(!isNaN(props.positionTop) && !isNaN(props.positionLeft))
    {
      style.position = "absolute";
      style.top = props.positionTop;
      style.left = props.positionLeft;
      style.zIndex = 11000;
    }

    if(props.width)
    {
      style.width = props.width + "px";
    }

    const getEmojiGroupById = (id: string) => 
    {
        const recentGroup = {
          id: recentGroupId,
          nameTrxCode: "emoji_group_recent",
          emojis: localCacheService.getCacheItems(recentEmojisCacheKey)
        };

        if(id === recentGroupId || !id || _.isEmpty(id))
          return recentGroup

        return _.find(emojiData, { id: id }) ?? recentGroup;
    }
    
    const getEmojisToDisplay = () => 
    {
        let emojis = getEmojiGroupById(!selectedGroupId || _.isEmpty(selectedGroupId) ? recentGroupId : selectedGroupId).emojis;

        if(!filterText || _.isEmpty(filterText))
          return emojis;
          
        return emojis.filter((o: { annotation: string; tags: string[]; }) => (o.annotation && o.annotation.includes(filterText)) || (o.tags && o.tags.includes(filterText)));
    }
    
    const getEmojiGroups = () => 
    {
		const groups: IEmojiGroup[] = [];

		for(let i = 0; i < emojiData.length; i++)
		{
			if(!emojiData[i])
				continue;
				
			groups.push({
				id: emojiData[i].id,
				nameTrxCode: emojiData[i].nameTrxCode,
				iconName: emojiData[i].iconName
			});
		}

        return groups;
    }

    const onSelectEmoji = (emoji: any) => 
    {
        if(!emoji)
          return;

        localCacheService.addItem(recentEmojisCacheKey, emoji, true);
		
        if(typeof(props.onSelect) === "function")
          props.onSelect(emoji.character);
    }
    
    const handleOnBlur = (event: React.FocusEvent<HTMLElement>) => 
    {
        if(event.currentTarget.contains(event.relatedTarget))
          return;

		  setSelectedGroupId(recentGroupId);
		  setFilterText("");

        if(typeof(props.onBlur) === "function")
          props.onBlur();
    };

    const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => 
    {
        setFilterText(event.target.value);
    };

    const getGroupCssClasses = (groupId: string) => 
    {
        let classNames = "group unselectable";
        
        if(selectedGroupId === groupId)
          classNames += " active";

        return classNames;
    }

    const cssClasses: string[] = [namespaceClassName, "rounded", "box-shadow"];

    if(props.displayMode === DisplayMode.Stencil)
      cssClasses.push("stencil");

    const isReady = loadStatus === LoadStatus.Loaded;
    const displayMode = !isReady ? DisplayMode.Stencil : DisplayMode.Normal;
  
    if(!props.visible)
      return <React.Fragment></React.Fragment>
	
    return (
      <div ref={pickerDivRef} className={cssClasses.join(" ")} style={style} onBlur={handleOnBlur} tabIndex={0}>
            
        <div className={namespaceClassName + "-header"}>
            <span className={namespaceClassName + "-filter"} aria-label="Emoji Picker Filter">
              <input type="text" value={filterText} onChange={handleFilterChange} tabIndex={-1} placeholder={trxService.trx(props.translations, "find")} maxLength={30} className="rounded" />
              <Icon name="magnify" />
            </span>
        </div>
        
          <div className={namespaceClassName + "-body thin-scroll scroll-y "}>
            <div className={namespaceClassName + "-group-name "}>{trxService.trx(props.translations, getEmojiGroupById(selectedGroupId).nameTrxCode)}</div>
            <div className="emojis-grid ">
            {
				(getEmojisToDisplay()).map((emoji: any, index: number) => (
					<span className="emoji " key={index} title={emoji.annotation} aria-label={emoji.annotation} role="button" onClick={() => { if(displayMode === DisplayMode.Normal) onSelectEmoji(emoji); }}>
						{emoji.character}
					</span>
				))				
			}
			{ (getEmojisToDisplay().length < 1) && <span className={namespaceClassName + "-loading"}><LoadIndicator thickness={10} size={50} /></span> }
            </div>
          </div>
          
          <div className={namespaceClassName + "-footer unselectable"}>
              {(localCacheService.getCacheItemsCount(recentEmojisCacheKey) > 0) && <span className={getGroupCssClasses(recentGroupId)} aria-label="recent" role="button" onClick={() => { if(displayMode === DisplayMode.Normal) setSelectedGroupId(recentGroupId); }}>
                <Icon name="history" />
              </span>}
              {
                (getEmojiGroups()).map((group: IEmojiGroup, index: number) => (
                  <span className={getGroupCssClasses(group.id)} key={index} aria-label={trxService.trx(props.translations, group.nameTrxCode)} role="button" onClick={() => { if(displayMode === DisplayMode.Normal) setSelectedGroupId(group.id); }}>
                    <Icon name={group.iconName} />
                  </span>				  
                ))
              }
          </div>
      </div>
    );
};