import React from "react";
import { Select, Icon } from "antd";
import { isMobile } from "react-device-detect";
import $ from "jquery";
import { getPropertyLang } from "../Utils";
const { Option, OptGroup } = Select;

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
          let { name, uid } = (runeEntry = runeNode[1]);
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

  getLang = (property: string): string => {
    return getPropertyLang(property, this.props.lang);
  };

  render() {
    return (
      <Select
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
