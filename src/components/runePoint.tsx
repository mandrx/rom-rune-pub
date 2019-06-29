import * as React from "react";
import { RuneCostType } from "../AppInterfaces";
import { Popover, Button } from "antd";
import { replaceStringParam, getPropertyLang } from "../Utils";
import { isMobile, isBrowser } from "react-device-detect";
import parse from "html-react-parser";

export interface RunePointProps {
  onClick: any;
  id: number;
  cost: number[];
  key: number;
  coor: number[];
  tier: number;
  getRuneDesc: Function;
  getSelectedTier: Function;
  lang: string;
}

export interface RunePointState {
  title: string;
  content: string;
}

class RunePoint extends React.PureComponent<RunePointProps, RunePointState> {
  state = {
    title: "",
    content: ""
  };

  handleClick = (e: any) => {
    this.props.onClick!(this.props.id);
  };

  get isSpecialRune(): boolean {
    return !!this.props.cost[RuneCostType.Medal];
  }
  get startingPoint(): string {
    return this.props.id == 10000 ? " startingPoint" : "";
  }
  get runeTier(): string {
    return this.props.tier.toString();
  }

  getLang(property: string): string {
    return getPropertyLang(property, this.props.lang);
  }

  handleOnVisibleChange = (visible: boolean) => {
    let { id, getRuneDesc, tier, cost } = this.props;
    let currentTier = this.props.getSelectedTier();
    if (visible) {
      let popoverTitle: any = "";
      let popoverContent: any = "";
      let runeDesc = getRuneDesc(id);

      if (runeDesc && Number(id) !== 10000) {
        let runeName = runeDesc[this.getLang("name")];
        let runeValue = runeDesc["value"] ? runeDesc["value"] : 0;
        let specialId = runeDesc["specialId"];

        if (!specialId) {
          //console.log("runeValue", runeValue);

          let runeValueStr =
            runeValue < 0.1 ? Number(runeValue) * 100 + "%" : runeValue;

          popoverContent = `${runeName} +${runeValueStr}`;
        } else {
          let specialName = (popoverTitle =
            runeDesc[this.getLang("specialName")]);
          let specialSkillParam = runeDesc["specialSkillParam"];
          let specialRuneTipId = runeDesc["specialRuneTipId"];
          let specialRuneTipText: string =
            runeDesc[this.getLang("specialRuneTipText")];

          popoverContent = parse(
            replaceStringParam(specialRuneTipText, specialSkillParam)
          );
        }

        let extraNote = <></>;
        if (currentTier < tier) {
          extraNote = (
            <>
              <span className="text-low-tier">Require higher job tier.</span>
            </>
          );
        }

        let contr_element = cost[RuneCostType.Contribution] ? (
          <span className="cost-cont">
            <span className="desc-icon icon-contribution" />
            {cost[RuneCostType.Contribution]}
          </span>
        ) : (
          <></>
        );
        let medal_element = cost[RuneCostType.Medal] ? (
          <span className="cost-medal">
            <span className="desc-icon icon-medal" />
            {cost[RuneCostType.Medal]}
          </span>
        ) : (
          <></>
        );

        popoverContent = (
          <>
            {popoverContent}
            <div className="rune-cost">
              {contr_element}
              {medal_element}
            </div>
            {extraNote}
          </>
        );

        if (isMobile) {
          popoverContent = (
            <>
              {popoverContent}
              <div>
                <Button
                  style={{ width: "100%" }}
                  className="btn-activate"
                  onClick={this.handleClick}
                >
                  Apply
                </Button>
              </div>
            </>
          );
        }
      } else if (Number(id) === 10000) {
        popoverContent = <span className="rune-reset">Click to Reset!</span>;
        if (isMobile) {
          popoverContent = (
            <>
              {popoverContent}
              <div>
                  <Button
                    style={{ width: "100%", marginTop: 5 }}
                    className="btn-reset"
                    onClick={this.handleClick}
                  >
                    Reset
                  </Button>
              </div>
            </>
          );
        }
      } else {
        popoverContent = (
          <span className="rune-unavaliable">Not available yet.</span>
        );
      }

      this.setState({
        title: popoverTitle,
        content: popoverContent
      });
    }
  };

  render() {
    let { id, coor } = this.props;
    return (
      <Popover
        content={this.state.content}
        title={this.state.title}
        mouseEnterDelay={isMobile ? 0 : 0.1}
        mouseLeaveDelay={0}
        transitionName={isMobile ? "" : "zoom-big"}
        trigger={isMobile ? "click" : "hover"}
        onVisibleChange={this.handleOnVisibleChange}
      >
        <div
          className={`runepoint${this.startingPoint}`}
          style={{
            left: coor[0],
            top: coor[1]
          }}
          onClick={
            isBrowser
              ? this.handleClick
              : () => {
                  console.log("mobile mode");
                }
          }
          data-id={id}
          data-tier={this.runeTier}
          data-special={this.isSpecialRune}
          data-active={false}
          data-highlight={0}
        />
      </Popover>
    );
  }
}

export default RunePoint;
