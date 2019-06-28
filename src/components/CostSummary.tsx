import * as React from "react";
import { Row, Col } from "antd";
import Text from "antd/lib/typography/Text";
import { numberWithCommas } from "../Utils";
import "react-device-detect";

export interface CostSummaryProps {
  cost: any;
  width: number|string;
}

export interface CostSummaryState {}

class CostSummary extends React.PureComponent<
  CostSummaryProps,
  CostSummaryState
> {
  render() {
    return (
      <div className="cost-summary" style={{ width: this.props.width }}>
        <Row style={{ textAlign: "center" }}>
          <Col span={12}>
            <Row
              className="cost-value"
              //style={{ backgroundColor: "#ffb300" }}
            >
              <div>
                <span className="cost-icon icon-contribution" />
                {numberWithCommas(this.props.cost.cont)}
              </div>
            </Row>
            <Row
              className="cost-name"
              //style={{ backgroundColor: "#f57c00" }}
            >
              <Text strong={true}>Contribution</Text>
            </Row>
          </Col>
          <Col span={12}>
            <Row
              className="cost-value"
              style={
                {
                  //backgroundColor: "#ec407a"
                }
              }
            >
              <div>
                <span className="cost-icon icon-medal" />
                {numberWithCommas(this.props.cost.medal)}
              </div>
            </Row>
            <Row
              className="cost-name"
              style={
                {
                  //backgroundColor: "#d42c64"
                }
              }
            >
              <Text strong={true}>Gold Medal</Text>
            </Row>
          </Col>
        </Row>
      </div>
    );
  }
}

export default CostSummary;
