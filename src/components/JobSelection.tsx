import * as React from "react";
import Text from "antd/lib/typography/Text";
import { Select } from "antd";
import { isMobile } from "react-device-detect";
import { GameClasses } from "../AppInterfaces";
import { ButtonSize } from "antd/lib/button";

const { Option, OptGroup } = Select;

export interface JobSelectionProps {
  jobId: number;
  runeNameList: any;
  onChange: Function;
  size?:ButtonSize;
}

export interface JobSelectionState {}

class JobSelection extends React.PureComponent<
  JobSelectionProps,
  JobSelectionState
> {
  constructor(props: JobSelectionProps) {
    super(props);
    this.state = {};
  }

  getJobList = () => {
    let classTree = GameClasses.getClassTree();
    let element: JSX.Element[] = [];

    Object.keys(classTree).forEach((eachJob: string, i: number) => {
      element.push(
        <OptGroup key={eachJob} label={eachJob}>
          {classTree[eachJob].map((eachJobLine: string[], i: number) => {
            let _name = classTree[eachJob][i][1];
            let _id = GameClasses.getIdByName(_name);
            return (
              <Option key={_id} value={_id}>
                {_name}
              </Option>
            );
          })}
        </OptGroup>
      );
    });
    return element;
  };

  handleOnChange = (e: any) => this.props.onChange(e);

  render() {
    let {size,jobId,runeNameList} = this.props;
    return (
      <div
        className="job-selection"
        style={{
          width: "100%"
        }}
      >
        <Text strong={true} style={{}}>
          Job
        </Text>
        <Select
          value={jobId}
          style={{ width: "100%" }}
          onChange={this.handleOnChange}
          disabled={!Object.keys(runeNameList).length}
          size={isMobile ? "default" : size?size:"large"}
        >
          {this.getJobList()}
        </Select>
      </div>
    );
  }
}

export default JobSelection;
