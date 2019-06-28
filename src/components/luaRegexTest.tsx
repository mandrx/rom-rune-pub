export interface ArrTable {
    name?: string;
    indexNameStart?: number;
    indexFrom?: number;
    indexTo?: number;
  }
  
  export function luaRegexTest() {
    const data = `--md5:64c35700583e59e3461dcc03cd298308
  Table_Map_WW = { 
      [68001] = {id = 68001, NameZh = '月亮马戏团', NameEn = 'room_xmas3', CallZh = '1019', LvRange = _EmptyTable, Type = 3, Mode = 3, MapScale = 40, MonsterRatio = _EmptyTable, Desc = '圣诞节活动', ShowInList = 0, SceneAnimation = 0, PVPmap = 0, Position = _EmptyTable, Camera = 1, LeapsMapNavigation = 1, MapUi = 7, EnterCond = _EmptyTable, IndexRange = _EmptyTable},
      [68002] = {id = 68002, NameZh = '月亮马戏团', NameEn = 'room_xmas3', CallZh = '1019', LvRange = _EmptyTable, Type = 3, Mode = 3, MapScale = 40, MonsterRatio = _EmptyTable, Desc = '圣诞节活动', ShowInList = 0, SceneAnimation = 0, PVPmap = 0, Position = _EmptyTable, Camera = 1, LeapsMapNavigation = 1, MapUi = 7, EnterCond = _EmptyTable, IndexRange = _EmptyTable},
  }
  
  Table_Map_WW_fields = { "id","NameZh","NameEn","CallZh","LvRange","Type","Mode","Range","MoneyType","Money","MapTips","MapScale","MonsterRatio","Desc","ShowInList","AdventureValue","SceneAnimation","PVPmap","Position","Camera","MapArea","LeapsMapNavigation","MapNavigation","MapUi","EnterCond","IsDangerous","IndexRange",}
  return Table_Map_WW`;
  
    let pattern1: RegExp = /((\w+)\s*=\s*{)/gm;
    let res: any = undefined;
    let tables: ArrTable[] = [];
  
    // SPLIT BY ALL TABLE. Table_Map_WW_fields = {}
    while ((res = pattern1.exec(data)) !== null) {
      console.log(`>> Found ${res[2]} as TableName}.`);
      if (tables.length) {
        tables[tables.length - 1]["indexTo"] = res.index;
      }
      tables.push({
        name: res[2],
        indexNameStart: res.index,
        indexFrom: pattern1.lastIndex
      });
    }
  
    const processEachRow = (rowData: string) => {
        console.log('rowData:',rowData)
    };
  
    tables.forEach(eachTable => {
      let tableContent = data.substring(
        eachTable.indexFrom! - 1,
        eachTable.indexTo!
      );
      let tableContent_arr: string[] = tableContent.split("\n");
      console.log(eachTable.name);
      tableContent_arr.forEach((eachRow: string) => {
        processEachRow(eachRow);
      });
  
      console.log("tableContent_arr", tableContent_arr);
    });
  }
  