
import React, { useEffect } from 'react';
import _ from 'lodash';

import { DisplayMode } from '../../types/enums/displayMode';
import { LoadStatus } from '../../types/enums/loadStatus';

import LocalCacheService from '../../services/LocalCacheService';
import TranslationService from '../../services/TranslationService';
import LookupService from '../../services/LookupService';

import { Icon } from '../Icon';

import "./FeelingPicker.scss";

export function FeelingPicker(props: { 
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
    const namespaceClassName = "feeling-picker";

    const localCacheService = LocalCacheService();
    const trxService = TranslationService();
    const lookupService = LookupService();

    const [loadStatus, setLoadStatus] = React.useState<LoadStatus>(LoadStatus.Ready);
    const [preloadCount, setPreloadCount] = React.useState(0);

    const countPreloadCompletionAsync = () => setPreloadCount((preloadCount) => preloadCount + 1);

    const [feelings, setFeelings] = React.useState<any[]>([]);
    const [filterText, setFilterText] = React.useState<string>("");

    const isLoaded = () => 
    {
        return (loadStatus !== LoadStatus.Loaded && preloadCount === 1);
    }

    const loadInitialData = async () => 
    {
        setLoadStatus(LoadStatus.Loading);

        await lookupService.getLookup("feelings").then(async (settings: any | undefined) => 
        {
            if(settings)
              setFeelings(settings);
              
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

    useEffect(() => {
		loadInitialData();
    }, []);

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

    const getFeelingsToDisplay = () => 
    {
        if(!filterText || _.isEmpty(filterText))
          return feelings;
          
        return feelings.filter((o: { name: string; }) => (o.name && o.name.includes(filterText)));
    }

    const onSelectFeeling = (feeling: any) => 
    {
        if(!feeling)
          return;

        if(typeof(props.onSelect) === "function")
          props.onSelect(feeling.character);
    }
    
    const handleOnBlur = (event: React.FocusEvent<HTMLElement>) => 
    {
        if(event.currentTarget.contains(event.relatedTarget))
          return;

		  setFilterText("");

        if(typeof(props.onBlur) === "function")
          props.onBlur();
    };

    const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => 
    {
        setFilterText(event.target.value);
    };

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
              <span className={namespaceClassName + "-filter"} aria-label="Feeling Picker Filter">
                <input type="text" value={filterText} onChange={handleFilterChange} tabIndex={-1} placeholder={trxService.trx(props.translations, "find")} maxLength={30} className="rounded" />
                <Icon name="magnify" />
              </span>
          </div>
        
          <div className={namespaceClassName + "-body thin-scroll scroll-y "}>
            <div className="feelings-grid ">
              {
                (getFeelingsToDisplay()).map((feeling: any, index: number) => (
                  <span className="feeling " key={index} title={feeling.annotation} aria-label={feeling.annotation} role="button" onClick={() => { if(displayMode === DisplayMode.Normal) onSelectFeeling(feeling); }}>
                    {feeling.character}
                    {trxService.trx(props.translations, feeling.nameTrxCode)}            
                  </span>
                ))
              }
            </div>
          </div>
      </div>
    );
};