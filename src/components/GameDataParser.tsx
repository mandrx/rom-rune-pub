import * as React from "react";
import { Component } from "react";

export interface ArrTable {
  name?: string;
  indexNameStart?: number;
  indexFrom?: number;
  indexTo?: number;
  data?: any;
}

export interface GameDataParserProps {}

export interface GameDataParserState {}

class GameDataParser extends React.Component<
  GameDataParserProps,
  GameDataParserState
> {
  //state = { :  }
  componentDidMount = () => {
    const data = `--md5:64c35700583e59e3461dcc03cd298308
  Table_Map_WW = {
    [68001] = {id = 68001, time = {70}, BuffRate = {Odds=100}, BuffEffect = {type="AttrChange",MaxHp=30}, id={30001311,30001312,30001313,30001314,30001315,30001316}, ResetCost = {{100,800}}, Attr = {[1]=62,[2]="魔法防御",[3]=3,[4]={MDef=0.5}}, NameZh = '月亮马戏团', NameEn = 'room_xmas3', CallZh = '1019', LvRange = _EmptyTable, Type = 3, Mode = 3, MapScale = 40, MonsterRatio = _EmptyTable, Desc = '圣诞节活动', ShowInList = 0, SceneAnimation = 0, PVPmap = 0, Position = _EmptyTable, Camera = 1, LeapsMapNavigation = 1, MapUi = 7, EnterCond = _EmptyTable, IndexRange = _EmptyTable,id=123123},      
    [68002] = {id = 68002, NameZh = '月亮马戏团', NameEn = 'room_xmas3', CallZh = '1019', LvRange = _EmptyTable, Type = 3, Mode = 3, MapScale = 40, MonsterRatio = _EmptyTable, Desc = '圣诞节活动', ShowInList = 0, SceneAnimation = 0, PVPmap = 0, Position = _EmptyTable, Camera = 1, LeapsMapNavigation = 1, MapUi = 7, EnterCond = _EmptyTable, IndexRange = _EmptyTable},      
    }
  
  Table_Map_WW_fields = { "id","NameZh","NameEn","CallZh","LvRange","Type","Mode","Range","MoneyType","Money","MapTips","MapScale","MonsterRatio","Desc","ShowInList","AdventureValue","SceneAnimation","PVPmap","Position","Camera","MapArea","LeapsMapNavigation","MapNavigation","MapUi","EnterCond","IsDangerous","IndexRange",}
  return Table_Map_WW`;

    let rawRows = this.getMainTable(data);
    console.log(">> rawRows::", rawRows);
    //this.parseObject2(data);
  };
  //
  //
  //
  //
  //
  parseEachRow = (data: string) => {
    data = data.replace(/ = /gm, "=");
    console.log("each row data::", data);

    let nextIndex = 0;
    let arrayProperty: any = [];
    while (nextIndex !== -1) {
      // Looping through each property
      // Find the index of = character, and check the type of its first neightbour.
      let prevIndex = nextIndex;
      nextIndex = data.indexOf("=", nextIndex + 1);
      if (nextIndex === -1) {
        console.log("Break loop. ended");
        break;
      }

      let propertyNameIndex = data.lastIndexOf(" ", nextIndex);
      let propertyName = data.substring(propertyNameIndex, nextIndex);
      let propertyValue: any = undefined;

      let valueFirstChar = data[nextIndex + 1];

      let valueEndIndex: number = 0;

      if (valueFirstChar === '"' || valueFirstChar === "'") {
        if (valueFirstChar === '"') {
          valueEndIndex = data.indexOf('"', nextIndex + 2);
        } else {
          valueEndIndex = data.indexOf("'", nextIndex + 2);
        }
        propertyValue = data.substring(nextIndex + 2, valueEndIndex);

        console.log(
          "> %c String ",
          "color: #fff; background-color: #03A9F4; font-weight: bold",
          propertyName,
          ":",
          propertyValue
        );

        arrayProperty.push({
          name: propertyName,
          value: propertyValue,
          type: "String"
        });
      } else if (valueFirstChar.match(/\d+/)) {
        valueEndIndex = data.indexOf(",", nextIndex + 1);

        propertyValue =
          valueEndIndex === -1
            ? data.substring(nextIndex + 1)
            : parseInt(data.substring(nextIndex + 1, valueEndIndex));

        console.log(
          "> %c Number ",
          "color: #fff; background-color: #8bc34a; font-weight: bold",
          propertyName,
          ":",
          propertyValue
          //"          >  Value first char:",
          //valueFirstChar
        );

        arrayProperty.push({
          name: propertyName,
          value: propertyValue,
          type: "Number"
        });
      } else if (valueFirstChar === "[") {
   
        console.log(
          "> %c Array ",
          "color: #fff; background-color: #ff9800; font-weight: bold",
          propertyName,
          ":",
          propertyValue
          //"          >  Value first char:",
          //valueFirstChar
        );

        console.log("TODO!!");
        
        //////////////////////////////////////////
        //////////////////////////////////////////
        //////////////////////////////////////////
      } else if (valueFirstChar === "{") {
        let currentDepth = 0;
        let countLoop = 0;
        let endFound = false;
        let objectStarts = data.substring(nextIndex + 1);
        let openingIndex = -1;
        let closingIndex = -1;
        let prevOpeningIndex = -1;
        let prevClosingIndex = -1;

        console.log(
          "> %c Object ",
          "color: #fff; background-color: #009688; font-weight: bold",
          propertyName
          //"          >  Value first char:",
          //valueFirstChar
        );

        console.log("objectStarts", objectStarts);

        while (!endFound) {
          prevOpeningIndex = openingIndex;
          prevClosingIndex = closingIndex;
          openingIndex = objectStarts.indexOf("{", openingIndex + 1);
          closingIndex = objectStarts.indexOf("}", closingIndex + 1);

          if (openingIndex > -1 || closingIndex > -1) {
            if (openingIndex < 0) {
              openingIndex = Infinity;
            }
            if (openingIndex < closingIndex) {
              closingIndex = prevClosingIndex;
              currentDepth++;
            } else {
              openingIndex = prevOpeningIndex;
              currentDepth--;
            }

            if (currentDepth <= 0) {
              propertyValue = objectStarts.substring(1, closingIndex);
              console.log("Closed at", closingIndex, propertyValue);
              //let parseObjectResult = this.parseEachRow(propertyValue);
              let parseObjectResult = propertyValue;
              console.log("parseObjectResult: ", parseObjectResult);
              arrayProperty.push({
                name: propertyName,
                value: arrayProperty,
                type: "Object"
              });
              console.log(
                "nextIndex = prevIndex+closingIndex",
                nextIndex,
                prevIndex,
                prevIndex + closingIndex
              );
              nextIndex = nextIndex + closingIndex + 2;
              console.log("next", data.substring(nextIndex));
              endFound = true;
            }
          } else {
            endFound = true;
          }

          if (countLoop++ > 50) {
            endFound = true;
          }
        }
        ///////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////////////////
      } else {
        valueEndIndex = data.indexOf(",", nextIndex + 1);

        propertyValue =
          valueEndIndex === -1
            ? data.substring(nextIndex + 1)
            : data.substring(nextIndex + 1, valueEndIndex);

        console.log(
          "> %c Variable ",
          "color: #fff; background-color: #f44336; font-weight: bold",
          propertyName,
          ":",
          propertyValue
          //"          >  Value first char:",
          //valueFirstChar
        );

        arrayProperty.push({
          name: propertyName,
          value: propertyValue,
          type: "Variable"
        });
      }
    }
    console.log("arrayProperty", arrayProperty);
    return arrayProperty;
  };

  getMainTable = (data: string) => {
    let pattern1: RegExp = /((\w+)\s*=\s*{)/m;
    let res: any = undefined;

    data = data.replace(/\n/gm, "");
    data = data.replace(/ = /gm, "=");
    data = data.replace(/\s*{\s*/gm, "{");
    data = data.replace(/\s*}\s*/gm, "}");

    res = pattern1.exec(data);
    let mainTableStartIndex = res.index + res[0].length - 1;
    let mainTableRawString = data.substring(mainTableStartIndex);
    //console.log("mainTableRawString", mainTableRawString, mainTableStartIndex);
    let mainTableData = this.getObjectDataString(mainTableRawString);

    console.log('mainTableData',mainTableData)

    return;
  };

  getObjectDataString = (data: string) => {
    let currentDepth = 0;
    let startIndex = -1;
    let openingIndex = -1;
    let closingIndex = -1;
    let prevOpeningIndex = -1;
    let prevClosingIndex = -1;
    let endFound = false;
    let propertyValue: any = undefined;
    let arrayProperty: any = [];
    let countLoop = 0;

    while (!endFound) {
      prevOpeningIndex = openingIndex;
      prevClosingIndex = closingIndex;
      openingIndex = data.indexOf("{", openingIndex + 1);
      closingIndex = data.indexOf("}", closingIndex + 1);
      
      if (openingIndex > -1 || closingIndex > -1) {
        if (openingIndex < 0) {
          openingIndex = Infinity;
        }
        if (openingIndex < closingIndex) {
          closingIndex = prevClosingIndex;
          currentDepth++;
        } else {
          openingIndex = prevOpeningIndex;
          currentDepth--;
        }

        if (currentDepth <= 0) {
          propertyValue = data.substring(0, closingIndex);
          
          console.log("Closed at", closingIndex, propertyValue);
          //let parseObjectResult = this.parseEachRow(propertyValue);
          endFound = true;
          return propertyValue;
        }
      } else {
        endFound = true;
      }

      if (countLoop++ > 50) {
        endFound = true;
      }
    }
    return propertyValue;
  };

  parseRawData = (data: string) => {
    let pattern1: RegExp = /((\w+)\s*=\s*{)/m;
    let res: any = undefined;
    let tables: ArrTable[] = [];

    data = data.replace(/ = /gm, "=");
    console.log(data);

    return;

    const processEachRow = (rowData: string) => {
      // Check rowdata validity
      //let rowRes = rowData.match(/\[(\d+)\]\s*=\s*{*.+}/);
      let rowRes = rowData.match(/\[(\d+)\]\s*=\s*{(.+)}/);

      if (rowRes !== null) {
        // This is valid rowData
        let rowId = rowRes[1];
        let rowContent = rowRes[2];
        console.log(`+ ${rowId}:`);
        console.log(">", rowContent);

        return rowContent;
      }
    };

    tables.map(eachTable => {
      let tableContent = data.substring(
        eachTable.indexFrom! - 1,
        eachTable.indexTo!
      );
      let tableContent_arr: string[] = tableContent.split("\n");
      let rowTable: any = [];

      tableContent_arr.forEach((eachRow: string) => {
        let eachRowRes = processEachRow(eachRow);
        if (eachRowRes) {
          /*
           *   Result Example:
           *
           *   id=68001, NameZh='月亮马戏团', NameEn='room_xmas3', CallZh='1019', LvRange=_EmptyTable, Type=3, Mode=3, MapScale=40, MonsterRatio=_EmptyTable, Desc='圣诞节活动', ShowInList=0, SceneAnimation=0, PVPmap=0, Position=_EmptyTable, Camera=1, LeapsMapNavigation=1, MapUi=7, EnterCond=_EmptyTable, IndexRange=_EmptyTable
           *
           * */
          let parsedRow = this.parseEachRow(eachRowRes);
          rowTable.push(parsedRow);
        }
      });
      eachTable["data"] = rowTable;
    });

    return tables;
  };

  render() {
    return <div />;
  }
}

export default GameDataParser;
