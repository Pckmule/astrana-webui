import React, {	useState,	useRef,	useEffect,	useReducer,	ReactElement  } from "react";

import _ from 'lodash';
  
import { initialState, focusReducer } from "./../../features/formComboBox/reducers/focusReducer";
import useScroll from "./../../features/formComboBox/hooks/useScroll";

import "./FormComboBox.scss";

interface IComboBoxOptionData
{
	icon: string | undefined;
	value: string | null;
	text: string | undefined;
}

type FormComboBoxProps = {
	options: IComboBoxOptionData[],
	onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void,
	optionPrefix?: string,
	defaultValue?: IComboBoxOptionData,	
	placeholder?: string,
	placeholderIcon?: string,
	onSelect?: (option: string) => void,
	onOptionsChange?: (option: IComboBoxOptionData) => void,
	optionsListMaxHeight?: number,
	renderOptions?: (option: IComboBoxOptionData) => React.ReactNode,
	style?: React.CSSProperties,
	className?: string,
	inputClassName?: string,
	wrapperClassName?: string,
	listClassName?: string,
	popoverClassName?: string,
	highlightClass?: string,
	selectedOptionClass?: string,
	enableAutocomplete?: boolean,
	inputStyles?: React.CSSProperties,
	id?: string,
	name?: string,
	onBlur?: (event?: React.ChangeEvent<HTMLInputElement>) => void,
	editable?: boolean,
	renderRightElement?: () => ReactElement,
	renderLeftElement?: () => ReactElement
}

const UP_ARROW = 38
const DOWN_ARROW = 40
const ENTER_KEY = 13
const ESCAPE_KEY = 27

const FormComboBox: React.FC<FormComboBoxProps> = ({
	options: comboBoxOptions,
	onChange,
	optionPrefix,
	defaultValue,
	placeholder,
	placeholderIcon,
	onSelect,
	onOptionsChange,
	optionsListMaxHeight,
	renderOptions,
	style,
	className,
	inputClassName,
	wrapperClassName,
	listClassName,
	popoverClassName,
	highlightClass,
	selectedOptionClass,
	enableAutocomplete,
	inputStyles,
	name,
	onBlur,
	editable = true,
	renderRightElement,
	renderLeftElement
}) => {

	const findByValue = function (o: IComboBoxOptionData, value: string) { return o.value === value };

	const optionMaxHeight = optionsListMaxHeight || 200;
	let suggestionListPositionStyles: React.CSSProperties = {};

	const [options, setOptions] = useState<IComboBoxOptionData[]>(comboBoxOptions);

	const defaultOption:IComboBoxOptionData = {
		icon: defaultValue?.icon ?? placeholderIcon ?? "",
		value: defaultValue?.value ?? "",
		text: defaultValue?.text ?? ""
	};

	const [selectedValue, setSelectedValue] = useState(defaultOption);
	const [state, dispatch] = useReducer(focusReducer, initialState);
	const { isFocus, focusIndex } = state;
	const [isMouseInsideOptions, setIsMouseInsideOptions] = useState(false);
	const [IsOptionsPositionedTop, setIsOptionsPositionedTop] = useState(false);
	const [selectedOptionIndex, setSelectedOptionIndex] = useState(-1);

	const dropdownRef = useRef<HTMLDivElement | null>(null);
	const optionsListRef = useRef<HTMLUListElement>(null);

	useEffect(() => { setOptions(comboBoxOptions) }, [comboBoxOptions]);

	useEffect(() => {
		if (!isFocus) 
			setSelectedValue(defaultOption);

		dispatch({ type: "setFocusIndex", focusIndex: defaultValue ? _.findIndex(options, (o) => findByValue(o, defaultValue.toString())) : -1 });
		setSelectedOptionIndex(defaultValue ? _.findIndex(options, (o) => findByValue(o, defaultValue.toString())) : -1);

	}, [defaultValue]);

	useScroll(focusIndex, dropdownRef, optionsListRef)

	useEffect(() => {
		// Position the options container top or bottom based on the space available
		const optionsContainerElement: any = dropdownRef.current

		const offsetBottom = window.innerHeight - optionsContainerElement?.offsetParent?.getBoundingClientRect().top;

		if (optionMaxHeight > offsetBottom && optionsContainerElement?.offsetParent?.getBoundingClientRect().top > offsetBottom) 
		{
			setIsOptionsPositionedTop(true);
		} 
		else 
		{
			setIsOptionsPositionedTop(false);
		}

	}, [isFocus])

	if (IsOptionsPositionedTop)
		suggestionListPositionStyles = { bottom: "100%", marginBottom: "5px" };
	else
		suggestionListPositionStyles = { top: "100%", marginTop: "5px" };

	const blurHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (!isMouseInsideOptions) 
			dispatch({ type: "toggleFocus", isFocus: false });
		
		if (onBlur)
			onBlur(event);
	}

	const updateValue = (index: number = focusIndex) => {
		if (index !== -1) 
		{ 
			setSelectedValue(options[index]);

			if (onOptionsChange) 
				onOptionsChange(options[index]);
		}
	}

	// While searching, the options are filtered and the index also changed.
	// So the focus index is set to original based on all the options.
	const resetFocusIndex = () => {
		comboBoxOptions.forEach((option: IComboBoxOptionData, index: number) => 
		{
			if (option === options[focusIndex])
				dispatch({ type: "setFocusIndex", focusIndex: index	})
		});
	}

	const selectSuggestionHandler = () => 
	{
		updateValue();
		dispatch({ type: "toggleFocus", isFocus: false });
		setSelectedOptionIndex(focusIndex);
		resetFocusIndex();
		setOptions(comboBoxOptions);

		if (onSelect) 
			onSelect(options[focusIndex].value ?? "");
	}

	const keyHandler = (event: any) => {
		const optionsContainerElement: any = dropdownRef.current
		let newFocusIndex = focusIndex

		switch (event.keyCode) 
		{
			case DOWN_ARROW: 
			{
				event.preventDefault();

				// set the focus to true if the options list was not opened.
				// Also set the scroll top
				if (!isFocus) 
				{
					dispatch({ type: "toggleFocus", isFocus: true });
				} 
				else 
				{
					// If the focus reaches the end of the options in the list, set the focus to 0

					if (focusIndex >= options.length - 1) 
					{
						newFocusIndex = 0;
						optionsContainerElement.scrollTop = 0;
					} 			
					else  // Change the scroll position based on the selected option position
					{
						newFocusIndex = focusIndex + 1;
					}
				}

				dispatch({ type: "setFocusIndex", focusIndex: newFocusIndex });

				if (onOptionsChange) 
					onOptionsChange(options[newFocusIndex]);
					
				dropdownRef.current = optionsContainerElement;

				break
			}
			case UP_ARROW: 
			{
				event.preventDefault();

				// set the focus to true if the options list was not opened.
				if (!isFocus) 
				{
					dispatch({ type: "toggleFocus", isFocus: true });
				} 
				else 
				{
					// If the focus falls beyond the start of the options in the list, set the focus to height of the suggestion-list
					if (focusIndex <= 0) 
					{
						newFocusIndex = options.length - 1;

						if (optionsContainerElement)
							optionsContainerElement.scrollTop = optionsContainerElement.scrollHeight;

					} 
					else 
					{
						newFocusIndex = focusIndex - 1;
					}
				}

				dispatch({ type: "setFocusIndex", focusIndex: newFocusIndex });

				if (onOptionsChange) 
					onOptionsChange(options[newFocusIndex]);
					
				dropdownRef.current = optionsContainerElement;
				break
			}
			case ENTER_KEY: 
			{
				event.preventDefault();
				
				if (focusIndex > -1 && focusIndex < options.length)
					selectSuggestionHandler();

				break
			}
			case ESCAPE_KEY: 
			{
				event.target.blur();
				dispatch({ type: "toggleFocus", isFocus: false });

				break
			}
		}
	}

	const filterSuggestion = (filterText: string) => {
		if (filterText.length === 0) 
			setOptions(comboBoxOptions);
		else 
		{
			const filteredSuggestion = comboBoxOptions.filter((option: IComboBoxOptionData) => 
			{
				return option.value == null ? false : option.value.toLowerCase().indexOf(filterText.toLowerCase()) !== -1;
			});

			setOptions(filteredSuggestion);
		}
	}

	const inputChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => 
	{
		if (onChange) 
			onChange(event);
		
		setSelectedValue(_.find(options, (o) => findByValue(o, event.target.value)) ?? defaultOption);

		if (enableAutocomplete) 
			filterSuggestion(event.target.value);
	}

	const inputClickHandler = () => {
		dispatch({ type: "toggleFocus", isFocus: true });
		dispatch({ type: "setFocusIndex", focusIndex: _.findIndex(options, (o) => findByValue(o, selectedValue.toString()))});
	}

	const focusHandler = () => {
		dispatch({ type: "toggleFocus", isFocus: true });
	}

	const mouseEnterHandler = (index: number) => 
	{
		dispatch({ type: "setFocusIndex", focusIndex: index });

		if (onOptionsChange) 
			onOptionsChange(options[index]);
	}

	const getComboBoxOptionClassName = (optionIndex: number) => 
	{
		let classNames = className ? `comboBoxOption ${className}` : "comboBoxOption";

		if ((optionIndex === focusIndex && optionIndex === selectedOptionIndex) || (optionIndex === selectedOptionIndex))
		{
			classNames += " " + (selectedOptionClass || "selected");
		}
		else if (optionIndex === focusIndex) 
		{
			classNames += " " + (highlightClass || "highlight");
		}
		
		return classNames;
	}

	function buildOptionIconHtml(icon: string | undefined | null, altText: string | undefined)
	{
		if(icon == null || icon == undefined || _.isEmpty(icon))
			icon = placeholderIcon ?? "";
		
		return icon!.indexOf("://") > -1 ? 
				<img className="icon" src={icon!} alt={(!_.isEmpty(altText)) ? altText : ""} /> : 
				<i className="icon material-icons">{icon}</i>;
	}

	const showIcon = (selectedValue.icon && !_.isEmpty(selectedValue.icon)) || !_.isEmpty(placeholderIcon);

	const inputHtml = <input
						onFocus={focusHandler}
						onChange={inputChangeHandler}
						placeholder={placeholder || ""}
						onKeyDown={keyHandler}
						value={selectedValue.value ?? ""}
						className={	inputClassName ? `comboBoxInput ${inputClassName}` : "comboBoxInput" }
						onBlur={blurHandler}
						name={name}
						style={{
							...inputStyles,
							cursor: editable ? "text" : "pointer",
							paddingLeft: renderLeftElement ? 30 : 10
						}}
						readOnly={!editable}
						onClick={inputClickHandler}
						/>

	return (
		<div className={ wrapperClassName ? `comboBox ${wrapperClassName}` : "comboBox" } style={style}>
			{renderLeftElement && ( <div className="leftElement">{ renderLeftElement() }</div> )}
			
			{showIcon ? <span className="input-group"><span className="input-group-text" style={{borderRight: "none"}}>{buildOptionIconHtml(selectedValue.icon, (!_.isEmpty(selectedValue.text) ? selectedValue.text : selectedValue.value) ?? "")}</span> {inputHtml}</span> : <>{inputHtml}</> }

			{renderRightElement && (<div className="rightElement">{renderRightElement()}</div>)}
			<div
				className={ popoverClassName ? `comboBoxPopover ${popoverClassName}` : "comboBoxPopover" }
				style={{ opacity: isFocus ? 1 : 0, visibility: isFocus ? "visible" : "hidden", maxHeight: isFocus ? optionMaxHeight : 0, ...suggestionListPositionStyles }}
				ref={dropdownRef} onMouseEnter={() => setIsMouseInsideOptions(true)} onMouseLeave={() => setIsMouseInsideOptions(false)}
			>
				<ul	className={ listClassName ? `comboBoxList ${listClassName}` : "comboBoxList" } ref={optionsListRef}>
				{options.map((option, index) => {
					return (
						<li	className={ getComboBoxOptionClassName(index) } key={option.value} onClick={() => selectSuggestionHandler()} onMouseDown={(e) => e.preventDefault()} onMouseEnter={() => mouseEnterHandler(index)}>
							{buildOptionIconHtml(option.icon, (!_.isEmpty(option.text) ? option.text : option.value) ?? "")}
							{optionPrefix}{renderOptions ? renderOptions(option) : (_.isEmpty(option.text) ? option.value : option.text)}
						</li>
					)
				})}
				</ul>
			</div>
		</div>
	)
}

export default FormComboBox