import * as React from "react";
import { Radio } from "antd";
import Text from "antd/lib/typography/Text";
import { isMobile } from "react-device-detect";
import { RuneCostType } from "../AppInterfaces";
import { ButtonSize } from "antd/lib/button";

type ItemPosition = "vertical" | "horizontal";

export interface PathTypeSelectionProps {
  onChange: Function;
  position?: ItemPosition;
  costType: RuneCostType;
  size?:ButtonSize;
}

export interface PathTypeSelectionState {}

class PathTypeSelection extends React.PureComponent<
  PathTypeSelectionProps,
  PathTypeSelectionState
> {
  state = {};

  handleOnChange = (e: any) => this.props.onChange(e);

  render() {
    let {size,costType,position} = this.props;
    return (
      <div
        className="cost-type-selection"
        style={{
          width: "100%"
        }}
      >
        <Text strong={true} style={{}}>
          Path Priority
        </Text>
        <Radio.Group
          value={costType}
          buttonStyle="solid"
          onChange={this.handleOnChange}
          size={isMobile ? "default" : size?size:"large"}
          style={{ width: "100%", whiteSpace: "nowrap" }}
          className={position === "vertical" ? "radio-vertical" : ""}
        >
          <Radio.Button value={RuneCostType.Balanced} key={4}>Balanced (Recommended)</Radio.Button>
          <Radio.Button value={RuneCostType.Medal} key={2}>Least Gold Medal</Radio.Button>
          <Radio.Button value={RuneCostType.Contribution} key={3}>Least Contribution</Radio.Button>
          <Radio.Button value={RuneCostType.Step} key={1}>Shortest Distance</Radio.Button>
        </Radio.Group>
      </div>
    );
  }
}

export default PathTypeSelection;
