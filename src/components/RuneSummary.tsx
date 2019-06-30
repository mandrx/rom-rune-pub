import * as React from "react";
import { Descriptions, Empty, Badge, Tooltip, Popover } from "antd";
import {
  getPropertyLang,
  numberWithCommas,
  replaceStringParam
} from "../Utils";
import parse from "html-react-parser";

export interface RuneSummaryProps {
  summaryData: any;
  lang: string;
  jobId: number;
}

export interface RuneSummaryState {}

class RuneSummary extends React.PureComponent<
  RuneSummaryProps,
  RuneSummaryState
> {
  state = {};
  basicRune: any = [];
  specialRune: any = [];

  splitRuneData = () => {
    const { summaryData } = this.props;
    this.basicRune = [];
    this.specialRune = [];
    let nameProp = this.getLang("name");

    summaryData.forEach((runeStat: any, index: number) => {
      if (!runeStat.specialRuneTipText) {
        runeStat.order = 99; //  Default
        if (runeStat.name === "力量" || runeStat.name === "Str") runeStat.order = 1; //     Str
        if (runeStat.name === "敏捷" || runeStat.name === "Agi") runeStat.order = 2; //     Agi
        if (runeStat.name === "体质" || runeStat.name === "VIT") runeStat.order = 3; //     VIT
        if (runeStat.name === "智力" || runeStat.name === "Int") runeStat.order = 4; //     Int
        if (runeStat.name === "灵巧" || runeStat.name === "Dex") runeStat.order = 5; //     Dex
        if (runeStat.name === "幸运" || runeStat.name === "Luk") runeStat.order = 6; //     Luk
        if (runeStat.name === "物理攻击" || runeStat.name === "Atk") runeStat.order = 7; //     Atk
        if (runeStat.name === "魔法攻击" || runeStat.name === "M.Atk") runeStat.order = 8; //     M.Atk
        if (runeStat.name === "精炼魔攻" || runeStat.name === "Refine M.Atk") runeStat.order = 9; //      Refine M.Atk
        if (runeStat.name === "精炼物攻" || runeStat.name === "Refine Atk") runeStat.order = 10; //     Refine Atk
        if (runeStat.name === "忽视物防" || runeStat.name === "Ignore Def") runeStat.order = 11; //     Ignore Def
        if (runeStat.name === "生命上限" || runeStat.name === "Max HP") runeStat.order = 12; //     Max HP
        if (runeStat.name === "魔法上限" || runeStat.name === "Max SP") runeStat.order = 13; //     Max SP
        if (runeStat.name === "物理防御" || runeStat.name === "Def") runeStat.order = 14; //      Def
        if (runeStat.name === "魔法防御" || runeStat.name === "M.Def") runeStat.order = 15; //      M.Def
        if (runeStat.name === "无属性攻击" || runeStat.name === "Neutral Dmg") runeStat.order = 16; //      Neutral Dmg
        if (runeStat.name === "风属性攻击" || runeStat.name === "Wind Dmg") runeStat.order = 17; //     Wind Dmg
        if (runeStat.name === "地属性攻击" || runeStat.name === "Earth Dmg") runeStat.order = 18; //    Earth Dmg
        if (runeStat.name === "火属性攻击" || runeStat.name === "Fire Dmg") runeStat.order = 19; //     Fire Dmg
        if (runeStat.name === "水属性攻击" || runeStat.name === "Water Dmg") runeStat.order = 20; //    Water Dmg
        if (runeStat.name === "无属性攻击" || runeStat.name === "Neutral Dmg") runeStat.order = 21; //    Neutral Dmg
        if (runeStat.name === "圣属性攻击" || runeStat.name === "Holy Dmg") runeStat.order = 22; //     Holy Dmg
        if (runeStat.name === "暗属性攻击" || runeStat.name === "Dark Dmg") runeStat.order = 23; //     Dark Dmg
        if (runeStat.name === "风属性防御" || runeStat.name === "Wind Resistance") runeStat.order = 24; //    Wind Resistance
        if (runeStat.name === "地属性防御" || runeStat.name === "Earth Resistance") runeStat.order = 25; //     Earth Resistance
        if (runeStat.name === "火属性防御" || runeStat.name === "Fire Resistance") runeStat.order = 26; //    Fire Resistance
        if (runeStat.name === "水属性防御" || runeStat.name === "Water Resistance") runeStat.order = 27; //     Water Resistance
        if (runeStat.name === "无属性防御" || runeStat.name === "Neutral Resistance") runeStat.order = 28; //     Neutral Resistance
        if (runeStat.name === "圣属性防御" || runeStat.name === "Holy Resistance") runeStat.order = 29; //    Holy Resistance
        if (runeStat.name === "暗属性防御" || runeStat.name === "Dark Resistance") runeStat.order = 30; //    Dark Resistance
        if (runeStat.name === "对动物增伤" || runeStat.name === "Against Beast") runeStat.order = 31; //      Against Beast
        if (runeStat.name === "对人形增伤" || runeStat.name === "Ag. Demi-Human") runeStat.order = 32; //     Ag. Demi-Human
        if (runeStat.name === "对恶魔增伤" || runeStat.name === "Against Demon") runeStat.order = 33; //      Against Demon
        if (runeStat.name === "对植物增伤" || runeStat.name === "Against Plant") runeStat.order = 34; //      Against Plant
        if (runeStat.name === "对不死增伤" || runeStat.name === "Against Undead") runeStat.order = 35; //     Against Undead
        if (runeStat.name === "对无形增伤" || runeStat.name === "Against Formless") runeStat.order = 36; //     Against Formless
        if (runeStat.name === "对鱼贝增伤" || runeStat.name === "Against Fish") runeStat.order = 37; //     Against Fish
        if (runeStat.name === "对天使增伤" || runeStat.name === "Against Angel") runeStat.order = 38; //      Against Angel
        if (runeStat.name === "对昆虫增伤" || runeStat.name === "Against Insect") runeStat.order = 39; //     Against Insect
        if (runeStat.name === "对龙族增伤" || runeStat.name === "Against Dragon") runeStat.order = 40; //     Against Dragon
        if (runeStat.name === "毒属性攻击" || runeStat.name === "Poison Attack") runeStat.order = 41; //      Poison Attack
        if (runeStat.name === "毒属性攻击" || runeStat.name === "Poison Attack") runeStat.order = 42; //      Poison Attack
        if (runeStat.name === "念属性攻击" || runeStat.name === "Thought Attack") runeStat.order = 43; //     Thought Attack
        if (runeStat.order < 7)
          runeStat[nameProp] = runeStat[nameProp].toUpperCase();

        this.basicRune.push(runeStat);
      } else {
        this.specialRune.push(runeStat);
      }
    });
  };

  basicRuneSummary = () => {
    let elements: JSX.Element[] = [];
    let nameProp = this.getLang("name");

    this.basicRune.sort((a: any, b: any) => {
      if (a.order === 99 && b.order === 99) {
        return a[nameProp].toUpperCase() < b[nameProp].toUpperCase() ? -1 : 1;
      }
      return a.order < b.order ? -1 : 1;
    });
    this.basicRune.forEach((runeStat: any, index: number) => {
      // Basic Rune
      elements.push(
        <Descriptions.Item
          key={index}
          label={
            <div className="rune-stat-property">
              <span className="stat-property-text">{runeStat[nameProp]}</span>
              <Tooltip
                mouseLeaveDelay={0}
                title={`${runeStat.runeCount}/${runeStat.amount} ${
                  runeStat[nameProp]
                } rune${runeStat.runeCount > 1 ? "s" : ""} activated.`}
              >
                <Badge count={runeStat.runeCount} />
              </Tooltip>
            </div>
          }
        >
          {runeStat.percent
            ? parseFloat((parseFloat(runeStat.value) * 100).toFixed(3)) + "%"
            : numberWithCommas(runeStat.value)}
        </Descriptions.Item>
      );
    });
    return elements;
  };

  specialRuneSummary = () => {
    let elements: JSX.Element[] = [];
    let nameProp = this.getLang("name");
    let descProp = this.getLang("specialRuneTipText");

    this.specialRune.sort((a: any, b: any) => {
      return a[nameProp].toUpperCase() < b[nameProp].toUpperCase() ? -1 : 1;
    });

    this.specialRune.forEach((runeStat: any, index: number) => {
      // Special Rune

      let popoverContent = parse(
        replaceStringParam(runeStat[descProp], runeStat.value)
      );
      
      elements.push(
        <Descriptions.Item
          key={index}
          label={
            <div className="rune-stat-property">
              <Popover
                mouseLeaveDelay={0}
                title={runeStat[nameProp]}
                content={popoverContent}
              >
                <span className="stat-property-text">{runeStat[nameProp]}</span>
              </Popover>
            </div>
          }
        >
          <span
            className={
              runeStat.runeCount === runeStat.amount ? "all-runes" : ""
            }
          >
            {runeStat.runeCount === runeStat.amount
              ? `All${
                  runeStat.amount > 1
                    ? ` (${runeStat.amount}/${runeStat.amount})`
                    : " (1/1)"
                }`
              : `${runeStat.runeCount}/${runeStat.amount} runes`}
          </span>
        </Descriptions.Item>
      );
    });
    return elements;
  };

  getLang = (property: string): string => {
    return getPropertyLang(property, this.props.lang);
  };

  render() {
    const { summaryData } = this.props;

    if (!!Object.keys(summaryData).length) {
      this.splitRuneData();

      let basicSummary = this.basicRune.length ? (
        <Descriptions
          className="rune-summary"
          title="Basic Stat"
          bordered
          size="small"
          column={1}
        >
          {this.basicRuneSummary()}
        </Descriptions>
      ) : (
        <></>
      );

      let specialSummary = this.specialRune.length ? (
        <Descriptions
          className="rune-summary special"
          title="Special Rune"
          bordered
          size="small"
          column={1}
        >
          {this.specialRuneSummary()}
        </Descriptions>
      ) : (
        <></>
      );

      return (
        <>
          {basicSummary}
          {specialSummary}
        </>
      );
    }
    return <Empty description="No rune activated." />;
  }
}

export default RuneSummary;
