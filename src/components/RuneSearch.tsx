import React from "react";
import { Select } from "antd";
import { isMobile } from "react-device-detect";
import $ from "jquery";
import { getPropertyLang } from "../Utils";

const { Option } = Select;

export interface RuneSearchProps {
  runeNameList: any;
  onChange: Function;
  lang: string;
}

export interface RuneSearchState {}

class RuneSearch extends React.Component<RuneSearchProps, RuneSearchState> {
  state = {};

  get optElements() {
    let optElement: JSX.Element[] = [];
    if (Object.keys(this.props.runeNameList).length) {
      Object.entries(this.props.runeNameList).forEach(
        (runeNode: any, i: number) => {
          let runeEntry;
          let { uid } = (runeEntry = runeNode[1]);
          let nameProd = this.getLang("name");
          let nameTrans = runeEntry[nameProd];

          optElement.push(
            <Option key={i} value={uid}>
              {nameTrans}
            </Option>
          );
        }
      );
    }
    return optElement;
  }

  handleOnChange = (selections: any) => {
    let { onChange, runeNameList } = this.props;
    let selectionArr: any = [];

    selections.forEach((sel: number) => {
      let selected = runeNameList.find((a: any) => sel === a.uid);
      selectionArr.push(selected.idArray);
    });

    onChange(selectionArr);
  };

  handleFocus = () => {
    // Disable soft keyboard on mobile.
    if (isMobile)
      $(".rune-search-box .ant-select-search__field").attr("readonly", "true");
  };

  clearSelection = () => {
    if(!this.refs.runeSearch){
      return;
    }
    const _this = (this.refs.runeSearch as any).rcSelect;
    const props = _this.props;
    const state = _this.state;

    

    if (props.disabled) {
      return;
    }

    let inputValue = state.inputValue;
    let value = state.value;

    if (inputValue || value.length) {
      if (value.length) {
        _this.fireChange([]);
      }

      _this.setOpenState(false, {
        needFocus: true
      });

      if (inputValue) {
        _this.setInputValue("");
      }
    }
  };

  getLang = (property: string): string => {
    return getPropertyLang(property, this.props.lang);
  };

  render() {
    
    return (
      <Select
        allowClear={true}
        ref="runeSearch"
        placeholder="Search rune..."
        style={{ width: "100%" }}
        onChange={this.handleOnChange}
        onFocus={this.handleFocus}
        mode="multiple"
        showArrow={false}
        loading={!Object.keys(this.props.runeNameList).length}
        disabled={!Object.keys(this.props.runeNameList).length}
        size={isMobile ? "default" : "large"}
        showSearch={true}
        filterOption={(input: any, option: any) =>
          option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
      >
        {this.optElements}
      </Select>
    );
  }
}

export default RuneSearch;
