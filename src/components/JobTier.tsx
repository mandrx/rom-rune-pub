import * as React from "react";
import Text from "antd/lib/typography/Text";
import { Radio } from "antd";
import { isMobile } from "react-device-detect";
import { Tier, GameClasses } from "../AppInterfaces";
import { ButtonSize } from "antd/lib/button";

type ItemPosition = "vertical" | "horizontal";

export interface JobTierProps {
  jobId: number;
  runeNameList: any;
  onChange: Function;
  tier: number;
  position?: ItemPosition;
  size?: ButtonSize;
}

export interface JobTierState {}

class JobTier extends React.PureComponent<JobTierProps, JobTierState> {
  state = {};

  getJobTierList = () => {
    let element: JSX.Element[] = [];
    let finalClass = "";

    GameClasses.getById(this.props.jobId).forEach(
      (eaJob: string, count: Number) => {
        let tier = (Tier as any)["t" + count];
        finalClass = eaJob;

        if (count > 0)
          element.push(
            <Radio.Button value={tier} key={tier}>
              {eaJob}
            </Radio.Button>
          );
      }
    );

    /*
        radioList.push(
          <Radio.Button value={Tier.t4} key={Tier.t4} disabled={true}>
            Adv. {finalClass} (EP5.0)
          </Radio.Button>
        );
        */

    return element;
  };

  handleOnChange = (e: any) => this.props.onChange(e);

  render() {
    let { size, tier, position, runeNameList } = this.props;
    return (
      <div
        className="job-tier-selection"
        style={{
          width: "100%"
        }}
      >
        <Text strong={true} style={{}}>
          Job Tier
        </Text>
        <Radio.Group
          value={tier}
          buttonStyle="solid"
          onChange={this.handleOnChange}
          disabled={!Object.keys(runeNameList).length}
          size={isMobile ? "default" : size ? size : "large"}
          style={{ width: "100%", whiteSpace: "nowrap" }}
          className={position === "vertical" ? "radio-vertical" : ""}
        >
          {this.getJobTierList()}
        </Radio.Group>
      </div>
    );
  }
}

export default JobTier;
