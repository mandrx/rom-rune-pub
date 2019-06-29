import * as React from "react";
import { message } from "antd";
import {
  uniquePush,
  getPropertyLang,
  array_sum,
  mergeArray,
  filterDifferentArray
} from "../Utils";
import localForage from "localforage";
import { RuneCostType } from "../AppInterfaces";
import $ from "jquery";
import "../styles/runeStyling.scss";
import RunePoint from "./RunePoint";
import { isMobile } from "react-device-detect";
import LZString from "lz-string";
import { updateUrlShareKey } from "../UrlManager";
import { RuneHistory } from "../RuneHistory";

export enum ROMJob {
  Job11 = "knight",
  Job12 = "crusader",
  Job21 = "wizard",
  Job22 = "sage",
  Job31 = "assassin",
  Job32 = "rogue",
  Job41 = "hunter",
  Job42 = "bard_dancer",
  Job51 = "priest",
  Job52 = "monk",
  Job61 = "blacksmith",
  Job62 = "alchemist"
}

export enum DBKey {
  RuneBasic = "runebasic",
  Rune11 = "runeData_11",
  Rune12 = "runeData_12",
  Rune21 = "runeData_21",
  Rune22 = "runeData_22",
  Rune31 = "runeData_31",
  Rune32 = "runeData_32",
  Rune41 = "runeData_41",
  Rune42 = "runeData_42",
  Rune51 = "runeData_51",
  Rune52 = "runeData_52",
  Rune61 = "runeData_61",
  Rune62 = "runeData_62"
}

export interface RuneSimulatorProps {
  setZoom: Function;
  setCost: Function;
  setSummary: Function;
  viewportTo: Function;
  tier?: number;
  lang: string;
  getRuneNameList: Function;
}

export interface RuneSimulatorState {
  runeDataLoaded: boolean;
}

export class RuneSimulator extends React.PureComponent<
  RuneSimulatorProps,
  RuneSimulatorState
> {
  private dataLang = this.props.lang;
  private startPoint: number = 10000;
  private tier: number = 20000;
  private currentZoom: number = 3;
  private zoomRange: number[] = [0.27, 0.35, 0.45, 0.6, 0.8, 1, 1.25];
  private activeRunes: number[] = [this.startPoint];
  private runeLinks: any = [];
  private prevActiveRunes: number[] = [this.startPoint];
  private runeWeightType = {
    primary: RuneCostType.Medal,
    secodary: RuneCostType.Contribution
  };
  private secondaryWeightIntensity = 10000;

  private runecost: any = {};
  private runebase: any = {};
  private runesJson: any = {};
  private astrolabeJson: any = {};
  private jobId: number = 0;

  private shareKey: string = "";

  private runeDesc: any = {};
  private basicDataLoaded = false;
  private jobDataLoaded = false;
  private runeNameTables: any = [];
  public History: RuneHistory = new RuneHistory();

  state = {
    runeDataLoaded: false
  };

  constructor(props: any) {
    super(props);
    this.loadGameRuneData();
    this.tier = this.props.tier!;
  }

  componentWillUpdate() {
    this.time_print("componentWillUpdate");
    this.time_reset();
  }

  componentDidUpdate() {
    this.zoom();
    this.time_print("componentDidUpdate");

    if (!!this.shareKey) {
      let binaryPattern = "";
      try {
        binaryPattern = LZString.decompressFromBase64(this.shareKey);
      } catch (error) {
        message.error("Invalid share link!", 20);
      }

      if (binaryPattern) {
        let activateArr: number[] = [];
        const binaryActive = binaryPattern.split("");
        const runeIdList = Object.keys(this.runebase).map(Number);
        runeIdList.sort((a: number, b: number) => (a < b ? -1 : 1));

        // Loop through each binary
        binaryActive.forEach((toggle: string, index: number) => {
          let toggleBool: boolean = Boolean(Number(toggle));
          // Push rune id if it is true
          if (toggleBool) activateArr.push(Number(runeIdList[index]));
        });

        this.activeRunes = activateArr;
        this.updateRunePointDOM(false, false);
      }
    }
  }

  loadGameRuneData() {
    let runebase: any = [];
    let runecost: any = [];
    let vertexlinks: any = [];

    let loadKey = "runeData";
    this.showLoading(loadKey, "Loading rune data...");

    localForage
      .getItem(DBKey.RuneBasic)
      .then((data: any) => {
        if (!data) {
          console.log("Not using cached data.");
          this.runesJson = require("../data/rune.json");
          this.astrolabeJson = require("../data/astrolabe.json");

          this.astrolabeJson.forEach((vertex: any) => {
            runebase[vertex.Id] = {
              coor: [vertex.X / 2.3, -vertex.Y / 2.3],
              link: vertex.Link,
              tier: vertex.Evo
            };

            vertex.Link.forEach((link: number) => {
              if (runecost[link] === undefined) {
                runecost[link] = this.createRuneCost(link);
              }
            });
            [vertex.Link] = vertexlinks;
          });

          localForage.setItem(DBKey.RuneBasic, {
            base: runebase,
            cost: runecost
          });
        } else {
          console.log("Using cached data.");
          runecost = data.cost;
          runebase = data.base;
        }
      })
      .finally(() => {
        this.runecost = runecost;
        this.runebase = runebase;
        this.basicDataLoaded = true;

        if (this.jobDataLoaded) {
          this.setState({
            runeDataLoaded: true
          });
        }
        this.hideLoading(loadKey);
        this.updateRunePointDOM();
        setTimeout(() => {
          this.props.viewportTo();
        }, 500);
      });
  }

  private loadingKeys: any = {};

  showLoading = (key: string, loadingText: string = "Loading...") => {
    this.loadingKeys[key] = message.loading(loadingText, 30);

    if (this.refs["rune-container"]) {
      $(".App").addClass("muted");
      (this.refs["rune-container"] as HTMLDivElement).classList.add("muted");
    }
  };

  hideLoading = (key: string) => {
    this.loadingKeys[key]();

    if (this.refs["rune-container"]) {
      setTimeout(() => {
        $(".App").removeClass("muted");
        (this.refs["rune-container"] as HTMLDivElement).classList.remove(
          "muted"
        );
      }, 200);
    }
  };

  loadJobRuneData(jobId: number) {
    const jobKey: any = "Rune" + jobId;
    const loadKey = "loadJobRune";

    this.showLoading(loadKey, "Loading job data...");
    this.jobId = jobId;

    let runeDesc: any = [];

    localForage
      .getItem(DBKey[jobKey])
      .then((data: any) => {
        if (!data) {
          console.log("Not using cached data.");
          runeDesc = require(`../data/runeData_${jobId}.json`);

          localForage.setItem(DBKey[jobKey], runeDesc);
        } else {
          console.log("Using cached job desc.");
          runeDesc = data;
        }
      })
      .finally(() => {
        this.runeDesc = runeDesc;
        this.jobDataLoaded = true;

        if (this.basicDataLoaded) {
          this.setState({
            runeDataLoaded: true
          });
          let newRuneArray: any = [];
          let uniqueId: number = 0;
          let nameProp = this.getLang("name");
          let descProp = this.getLang("specialRuneTipText");

          runeDesc.forEach((eachRune: any) => {
            let runeExisted = newRuneArray.find(
              (_runeDesc: any) => _runeDesc.name === eachRune.name
            );
            if (runeExisted) {
              // Rune already exist.
              runeExisted.idArray.push(eachRune.id);
              eachRune.amount = runeExisted.amount++;
            } else {
              // Rune is not exist yet. Push new rune object.
              if (!!eachRune.name) {
                let newRune = {
                  uid: uniqueId++,
                  name: eachRune.name,
                  [nameProp]: eachRune[nameProp],
                  idArray: [eachRune.id],
                  amount: 1
                };
                eachRune.amount = 1;
                if (!!eachRune[descProp]) {
                  newRune[descProp] = eachRune[descProp];
                }
                newRuneArray.push(newRune);
              }
            }
          });

          newRuneArray.sort(function(a: any, b: any) {
            return a[nameProp] < b[nameProp] ? -1 : 1;
          });

          this.runeNameTables = newRuneArray;
          this.props.getRuneNameList(newRuneArray);
        }

        this.generateRuneSummary();
        this.hideLoading(loadKey);
      });
  }

  getLang = (property: string): string => {
    return getPropertyLang(property, this.dataLang);
  };

  private t1 = 0;

  time_reset = () => {
    this.t1 = performance.now();
  };
  time_print = (note: string = "") => {
    let tEnd = performance.now() - this.t1;
    console.log(`Render time(${note}): ${tEnd}ms...`);
  };

  undo = () => {
    let toState = this.History.undoState();
    this.loadHistoryState(toState, "undo");
  };

  redo = () => {
    let toState = this.History.redoState();
    this.loadHistoryState(toState, "redo");
  };

  loadHistoryState = (state: any, mode: "undo" | "redo" = "undo") => {
    let newActiveRunes = [];
    let undo = mode === "undo" ? true : false;

    if (state[1].length) {
      this.prevActiveRunes = this.activeRunes;

      if (!!state[0] === undo) {
        newActiveRunes = mergeArray(this.activeRunes, state[1]);
      } else {
        newActiveRunes = filterDifferentArray(this.activeRunes, state[1]);
      }
      this.activeRunes = newActiveRunes;

      this.updateRunePointDOM(!state[0] === undo, false);
      this.generateRuneSummary();
    }
  };

  activateRuneFromShareKey = (key: string) => (this.shareKey = key);

  private createRuneCost = (link: number) => {
    const getCostById = (id: number) =>
      this.runesJson.find((rune: any) => rune.Id === id);

    let runeWithCostRaw = getCostById(link);
    let cont = 0;
    let medal = 0;
    if (!runeWithCostRaw.Cost) {
      cont = 0;
    } else {
      if (runeWithCostRaw.Cost.length > 0) cont = runeWithCostRaw.Cost[0].Count;
      if (runeWithCostRaw.Cost.length > 1)
        medal = runeWithCostRaw.Cost[1].Count;
    }
    return [1, medal, cont];
  };
  getRuneDesc = (id: number) =>
    this.runeDesc.find((eachRune: any) => Number(eachRune.id) === Number(id));
  getRuneCost = (id: string) => this.runecost[Number(id)];
  getRuneCoor = (id: string) => this.runebase[Number(id)].coor;
  getRuneTier = (id: string) => this.runebase[Number(id)].tier;
  getCurrentTier = () => this.tier;
  getCurrentTierCode = () => {
    const tier = this.tier;
    switch (tier) {
      case 20000:
        return "a";
      case 30000:
        return "b";
      case 40000:
        return "c";
      case 45003:
        return "d";
    }
    return "c";
  };

  isActiveRuneClass = (id: string) =>
    this.isActiveRune(Number(id)) ? "activeRune" : "";

  isActiveRune = (id: number): boolean => this.activeRunes.indexOf(id) > -1;

  isRuneConnected = (a: number, b: number): boolean => {
    let linkTable: number[] = this.activeRunes;

    if (linkTable.indexOf(a) > -1 && linkTable.indexOf(b) > -1) {
      return true;
    }
    return false;
  };

  activateRune = (target: number) => {
    // Return If user clicked in mobile mode.
    let activeRunes: number[] = this.activeRunes;
    this.prevActiveRunes = JSON.parse(JSON.stringify(activeRunes));

    let completeRoute: boolean = false;
    let count = 0;
    let pathTable = this.DijkstraPath(target, activeRunes);

    const getViaPath = (_to: any) => {
      return pathTable.find((path: any) => {
        return path.to === _to;
      });
    };

    const getClosestActivePath = () => {
      pathTable.sort(function(a: any, b: any) {
        return a.cost - b.cost;
      });
      let activePathTable = pathTable.filter((path: any) => {
        return activeRunes.indexOf(path.to) > -1;
      });
      return activePathTable[0];
    };

    let currentPath: number = activeRunes[0];

    if (activeRunes.length > 1) {
      let closestPath = getClosestActivePath();
      if (closestPath !== undefined) {
        currentPath = closestPath.to;
      } else {
        message.warning("No path to this rune.");
        return [];
      }
    }

    while (!completeRoute && count < 3000) {
      let nextPath = getViaPath(currentPath);

      if (nextPath === undefined) {
        message.warning("No path to this rune.");
        completeRoute = true;
      } else {
        uniquePush(activeRunes, currentPath);
        currentPath = nextPath.via;

        if (activeRunes.indexOf(currentPath))
          uniquePush(activeRunes, currentPath);

        if (currentPath == target) {
          completeRoute = true;
          this.activeRunes = activeRunes;
          this.updateRunePointDOM();
        }
      }
    }
  };

  DijkstraPath = (from: number, to: number | number[] = this.startPoint) => {
    let shortest_path: any = [];
    let visited: any = [];
    let pathLowestCost: number = Infinity;

    to = typeof to === "number" ? [to] : to;
    to = [...to];

    let unvisitedCombo: any = {};

    const getCostFromStart = (to: number) => {
      const shortestCost = shortest_path.find((path: any) => path.to == to);
      //console.log('shortestCost',shortestCost)
      return shortestCost;
    };

    const getRuneLinkCost = (runeid: any): number => {
      const thisRuneCost = this.runecost[runeid];
      let primary = this.runeWeightType.primary;
      let secondary = this.runeWeightType.secodary;
      let intensity = this.secondaryWeightIntensity;

      if (primary === RuneCostType.Balanced) {
        // Gold medal as Main weight, Contribution as Secondary weight
        primary = RuneCostType.Medal;
        secondary = RuneCostType.Contribution;
        intensity = 1500;
      }
      if (primary === RuneCostType.Contribution) {
        // Contribution as Main weight, Gold medal as Secondary weight
        primary = RuneCostType.Contribution;
        secondary = RuneCostType.Medal;
      }

      const weight =
        thisRuneCost[primary] + thisRuneCost[secondary] / intensity;

      /*
      console.log(
        "weight",
        thisRuneCost[primary],
        thisRuneCost[secondary],
        " / ",
        intensity,
        " = ",
        weight
      );
      */

      return weight;
    };

    const replaceShortestPath = (vertex: any, via: any, cost: number) => {
      //console.log("replaceShortestPath", vertex, via, cost);
      let path = shortest_path.find((path: any) => {
        return path.to === vertex;
      });
      path.via = via;
      path.cost = cost;

      return path;
    };

    const visit = (thisRuneId: number, first: boolean = false) => {
      //console.log("Visiting: ", thisVertexId);

      // Set starting point to 0 cost.
      if (first)
        shortest_path.push({
          via: thisRuneId,
          to: thisRuneId,
          cost: 0
        });

      let costFromStart = getCostFromStart(thisRuneId).cost;

      //console.log("costFromStart", costFromStart, shortest_path);

      this.runebase[thisRuneId].link.map((toId: number) => {
        //console.log(">> ", thisVertexId, " => ", linkId);

        // 27/06/2019 CHANGE
        // let runeLinkCost = getRuneLinkCost(toId);
        let runeLinkCost = getRuneLinkCost(thisRuneId);
        let prevLinkFromStart = getCostFromStart(toId);
        let costLinkFromStart = costFromStart + runeLinkCost;

        if ((to as number[]).indexOf(toId) > -1) {
          // Kalau link ni dah bersambung dengan target atau mana2 activated vertex, set sebagai jupe dh
          //console.log("Target found!", to);

          if (pathLowestCost > costLinkFromStart) {
            //console.log("Found shorter path via", linkId);
            pathLowestCost = costLinkFromStart;
          }
        }

        // Check linkId ni pernah di visit ke tak
        if (visited.indexOf(toId) < 0) {
          /// Kalau tak pernah visit, check define ke tak.
          if (prevLinkFromStart === undefined) {
            let newShortPath = {
              via: thisRuneId,
              to: toId,
              cost: costLinkFromStart
            };

            // Add new shortest path sebab path ni belum ada

            shortest_path.push(newShortPath);
          } else {
            let linkCostFromStart = prevLinkFromStart.cost;
            let newLinkCostFromStart = costLinkFromStart;

            // kalau path baru ni lagi dekat dengan path lama, replace path terdekat tu dengan id baru
            if (linkCostFromStart > newLinkCostFromStart) {
              /*
              console.warn(
                "Shorter path found",
                toId,
                thisRuneId,
                newLinkCostFromStart,
                "older cost:",
                linkCostFromStart
              );
              */
              replaceShortestPath(toId, thisRuneId, newLinkCostFromStart);
            }
          }
        }

        // Kalau linkId ni belum pernah divisit, dan
        if (
          visited.indexOf(toId) < 0 &&
          pathLowestCost > costLinkFromStart + runeLinkCost
        ) {
          if (this.runebase[toId].tier <= this.tier) {
            if (unvisitedCombo[toId] == undefined) {
              unvisitedCombo[toId] = costLinkFromStart;
            } else {
              if (unvisitedCombo[toId] > costLinkFromStart) {
                unvisitedCombo[toId] = costLinkFromStart;
              }
            }
          }
        }
      });

      uniquePush(visited, thisRuneId);
    };

    const getNextShortestVertex = (): number => {
      let sorted = Object.keys(unvisitedCombo).sort((a: string, b: string) => {
        return unvisitedCombo[a] - unvisitedCombo[b];
      });
      let ret = Number(sorted[0]);
      delete unvisitedCombo[sorted[0]];
      return ret;
    };

    visit(from, true);

    while (Object.entries(unvisitedCombo).length > 0) {
      visit(getNextShortestVertex());
    }
    return shortest_path;
  };

  getRuneAmountByCNName = (CNname: string): number => {
    let match = this.runeNameTables.find((a: any) => a.name === CNname);
    return match.amount ? match.amount : 0;
  };

  generateShareKey = () => {
    let runeIdList = Object.keys(this.runebase).map(Number);
    runeIdList.sort((a: number, b: number) => (a < b ? -1 : 1));

    let activeRunes = this.activeRunes;
    activeRunes.sort((a: number, b: number) => (a < b ? -1 : 1));

    let foundCount = 0;
    let binaryArr = runeIdList.map((runeId: number) => {
      if (runeId === this.activeRunes[foundCount]) {
        foundCount++;
        return 1;
      } else {
        return 0;
      }
    });
    const binaryPattern = binaryArr.join("");
    const shareKey = LZString.compressToBase64(binaryPattern);

    return updateUrlShareKey(this.jobId, this.getCurrentTierCode() + shareKey);
  };

  generateRuneSummary = () => {
    /*
    generateRuneSummary() will generate Rune Stat summary and rune cost.
    */
    let summaryArray: any = [];
    let costArray = {};
    let medal = 0;
    let cont = 0;
    let step = 0;

    this.activeRunes.forEach((runeId: number) => {
      let runeDesc = this.getRuneDesc(runeId);
      let nameProp = this.getLang("name");
      let descProp = this.getLang("specialRuneTipText");

      // Accumulate Rune Cost
      medal += this.runecost[runeId][RuneCostType.Medal];
      cont += this.runecost[runeId][RuneCostType.Contribution];
      step += this.runecost[runeId][RuneCostType.Step];

      // Summarize Rune. Check if runeDesc is not undefined.
      if (!!runeDesc && !!runeDesc.name) {
        let runeExisted = summaryArray.find(
          (_runeDesc: any) => _runeDesc.name === runeDesc.name
        );

        // Check if the rune is already in the array.
        if (runeExisted) {
          if (
            !!runeDesc.specialId &&
            runeDesc.specialSkillParam !== "_EmptyTable"
          ) {
            // Special Rune
            runeExisted.value = array_sum(
              runeExisted.value,
              runeDesc.specialSkillParam
            );
            runeExisted.runeCount++;
          } else {
            // Basic Rune
            runeExisted.value = parseFloat(
              (
                parseFloat(runeExisted.value) + parseFloat(runeDesc.value)
              ).toFixed(3)
            );
            runeExisted.runeCount++;
          }
        } else {
          // Initialize new Rune Summary
          let runeAmount = this.getRuneAmountByCNName(runeDesc.name);
          let newData = {
            name: runeDesc.name,
            [nameProp]: runeDesc[nameProp],
            runeCount: 1,
            amount: runeAmount
          };

          // If given value is less than 0.1, it is most probably a percentage value.
          if (runeDesc.value && !!(runeDesc.value < 0.1)) {
            newData.percent = true;
          }

          // Check whether it is basic or special rune.
          if (!!runeDesc.specialId) {
            // Special Rune
            newData.specialRuneTipText = runeDesc.specialRuneTipText;
            newData[descProp] = runeDesc[descProp];

            // Check if special rune contains special value/param
            if (runeDesc.specialSkillParam !== "_EmptyTable") {
              newData.value = runeDesc.specialSkillParam;
            } else {
              // Special rune that has no parameter.
              //console.log(runeDesc);
            }
          } else {
            // Basic Rune
            if (!!runeDesc.value) {
              newData.value = runeDesc.value;
            }
          }
          summaryArray.push(newData);
        }
      }
    });

    costArray = { medal, cont, step };
    this.props.setCost(costArray);
    this.props.setSummary(summaryArray);

    //console.log("%c> Cost:", "background: yellow; color: darkpink", costArray);
  };

  selectAllRune = () => {
    let currentTier = this.getCurrentTier();
    this.prevActiveRunes = JSON.parse(JSON.stringify(this.activeRunes));

    this.activeRunes = Object.keys(this.runebase)
      .map(Number)
      .filter((eachRune: any) => this.runebase[eachRune].tier <= currentTier);

    this.updateRunePointDOM();
    this.generateRuneSummary();
  };

  resetRune = () => {
    //this.activeRuneCost = { step: 0, medal: 0, cont: 0 };
    this.History.addState(this.activeRunes, true);
    this.activeRunes = [this.startPoint];

    // CHANGED 28/06/2019 (commented)
    //this.generateRuneSummary();

    $(`[data-id]:not([data-id="${this.startPoint}"])`).attr(
      "data-active",
      String(false)
    );
    $(`[data-link]:not([data-id="${this.startPoint}"])`).attr(
      "data-active",
      String(false)
    );
  };

  getLinkId = (rune1: number, rune2: number) =>
    rune1 < rune2 ? `${rune1}-${rune2}` : `${rune2}-${rune1}`;

  updateRunePointDOM = (
    deletion: boolean = false,
    recordStateHistory: boolean = true
  ) => {
    const activateRuneDOM = (id: number, addMode: boolean = true) => {
      $(`[data-id="${id}"]`).attr("data-active", String(addMode));
      updateLinkDOM(id, addMode);
    };
    const updateLinkDOM = (id: number, addMode: boolean = true) => {
      if (!this.runeLinks[id]) return;

      this.runeLinks[id].forEach((linkId: any) => {
        if (this.activeRunes.includes(linkId) === !addMode) if (addMode) return;

        let links = this.getLinkId(id, linkId);

        $(`.linkLine[data-link="${links}"]`).attr(
          "data-active",
          String(addMode)
        );
      });
    };

    const getRunePointDOM = (id: number): string => `[data-id="${id}"]`;

    const getLinkDOM = (id: number, deletion: boolean = false) => {
      if (!this.runeLinks[id]) return;

      this.runeLinks[id].forEach((linkId: any) => {
        if (
          this.activeRunes.includes(linkId) === true ||
          this.activeRunes.includes(linkId) === !deletion
        ) {
          let link = this.getLinkId(id, linkId);
          let linkDom = `.linkLine[data-link="${link}"]`;
          uniquePush(affectedRuneLinkSet, linkDom);
        }
      });
    };

    // Only activate/delete affected rune. Instead of looping through all activated runes.
    const prev = this.prevActiveRunes;
    const curr = this.activeRunes;

    let affectedRuneSet: any = [];
    let affectedRuneLinkSet: any = [];
    let runeDOMs: string;
    let linkDOMs: string;

    activateRuneDOM(this.startPoint);

    if (deletion) {
      affectedRuneSet = prev.filter(x => !curr.includes(x));
    } else {
      affectedRuneSet = curr
        .filter(x => !prev.includes(x))
        .concat(prev.filter(x => !curr.includes(x)));
    }
    //runeSet.forEach((runeId: number) => activateRunePoint(runeId));  // Cara lama. slow.... sebab ubah attr satu2 tiap2 loop
    runeDOMs = affectedRuneSet
      .map((runeId: number) => getRunePointDOM(runeId))
      .join(",");

    // Check to prevent overwriting History when we undo/redo
    if (recordStateHistory) {
      // Add only affected runes to the history state
      this.History.addState(affectedRuneSet, deletion);
    }

    affectedRuneSet.forEach((runeId: number) => getLinkDOM(runeId, deletion));
    linkDOMs = affectedRuneLinkSet.join(",");

    $(runeDOMs).attr("data-active", String(!deletion));
    $(linkDOMs).attr("data-active", String(!deletion));
  };

  deactivateRune = (id: number) => {
    let q = [this.startPoint];
    let visited: number[] = [];
    let newActivateRunes: number[] = [];

    let activeRunes = this.activeRunes;
    let delIndex = activeRunes.indexOf(id);

    // Jangan buang. ni untuk compare prev & new active runes dekat dom update.
    this.prevActiveRunes = JSON.parse(JSON.stringify(activeRunes));

    // Deactivate given ID
    activeRunes.splice(delIndex, 1);

    // Check path after given ID deactivated
    this.time_reset();
    while (q.length) {
      let qpop = q.pop();
      uniquePush(newActivateRunes, qpop!);
      if (qpop !== undefined) {
        uniquePush(visited, qpop!);
        this.runeLinks[qpop!].forEach((linkId: number) => {
          if (!activeRunes.includes(linkId)) return;
          if (visited.indexOf(linkId) < 0) uniquePush(q, linkId);
        });
      }
    }
    this.time_print("Preparing Data");
    this.time_reset();
    this.activeRunes = newActivateRunes;
    this.updateRunePointDOM(true);
    this.time_print("Update Render");
  };

  highlightRune = (selections: any) => {
    let lastRune = this.startPoint;
    $(".runepoint").attr("data-highlight", 0);

    message.info(
      `Selected ${
        selections.length > 1 ? "runes have" : "rune has"
      } been highlighted.`,
      1
    );

    selections.forEach((sel: number[], index: number) => {
      let idList: number[] = sel;
      let runeDoms: string[] = [];
      let runeDomsStr = "";

      if (!!idList) {
        idList.forEach((id: number, i: number) => {
          let domSelector = `[data-id="${id}"]`;
          lastRune = id;
          uniquePush(runeDoms, domSelector);
        });
        runeDomsStr = runeDoms.join(",");
      }

      // Highlight rune group with different color ID.
      $(runeDomsStr).attr("data-highlight", (index % 5) + 1);

      // Move viewport last selected rune.
      this.viewportToId(lastRune);
    });
  };

  viewportToId = (id: number | string = 10000) => {
    let coor = this.getRuneCoor(id as string);
    this.props.viewportTo(coor[0], coor[1]);
  };

  RunePoint_onClick = (id: number, _coor?: any) => {
    //console.log("Clicked on Rune ID:", id, _coor ? _coor : ""); // DEBUG
    //this.viewportToId(id)

    id = Number(id);
    if (id == this.startPoint) {
      this.resetRune();
    } else {
      if (this.getRuneTier(id.toString()) > this.getCurrentTier()) {
        return message.warning(
          "Higher job tier is required. Please select higher job tier."
        );
      }

      if (this.isActiveRune(id)) {
        this.deactivateRune(id);
      } else {
        this.activateRune(id);
      }
    }
    this.generateRuneSummary();
    this.generateShareKey();
  };

  renderPoints = () => {
    return (
      <div className="pointContainer">
        {Object.keys(this.runebase).map((a: any) => {
          return (
            <RunePoint
              key={a}
              id={a}
              lang={this.dataLang}
              getRuneDesc={this.getRuneDesc}
              getSelectedTier={this.getCurrentTier}
              onClick={this.RunePoint_onClick}
              cost={this.getRuneCost(a)}
              coor={this.getRuneCoor(a)}
              tier={this.getRuneTier(a)}
            />
          );
        })}
      </div>
    );
  };

  renderLinks = () => {
    let drawnLineMidPoint: string[] = [];

    return (
      <div className="linkContainer">
        <svg className="rune-links">
          {Object.keys(this.runebase).map(_a => {
            const minTier = (a: number, b: number): number => {
              a = this.getRuneTier(a.toString());
              b = this.getRuneTier(b.toString());
              return a > b ? a : b;
            };
            let a: number = Number(_a);
            return this.runebase[a].link.map((b: number) => {
              let midPoint: string = [
                this.runebase[a].coor[0] + this.runebase[b].coor[0],
                this.runebase[a].coor[1] + this.runebase[b].coor[1]
              ].join(",");

              if (!this.runeLinks[a]) {
                this.runeLinks[a] = [b];
              } else {
                this.runeLinks[a].push(b);
              }

              if (drawnLineMidPoint.indexOf(midPoint) === -1) {
                const linkName = this.getLinkId(a, b); //[a, b].join("-");
                //const linkName = [a, b].join("-");

                drawnLineMidPoint.push(midPoint);
                return (
                  <line
                    key={`line_${a}-${b}`}
                    x1={this.runebase[a].coor[0]}
                    x2={this.runebase[b].coor[0]}
                    y1={this.runebase[a].coor[1]}
                    y2={this.runebase[b].coor[1]}
                    strokeWidth={4}
                    stroke="#00000033"
                    className={`linkLine`}
                    data-link={linkName}
                    data-active={false}
                    data-tier={minTier(a, b)}
                  />
                );

                /*
                <text
                      key={`text_${a}-${b}`}
                      x={
                        (this.runebase[a].coor[0] + this.runebase[b].coor[1]) /
                        2
                      }
                      y={
                        (this.runebase[a].coor[1] + this.runebase[b].coor[0]) /
                        2
                      }
                      className="linkWeight"
                    >
                      {this.runebase[a].link[b]}
                    </text>
                 */
              }
            });
          })}
        </svg>
      </div>
    );
  };

  get zoomValue(): number {
    this.currentZoom =
      this.currentZoom >= this.zoomRange.length - 1
        ? this.zoomRange.length - 1
        : this.currentZoom;
    this.currentZoom = this.currentZoom <= 0 ? 0 : this.currentZoom;
    return this.zoomRange[this.currentZoom] * (isMobile ? 0.75 : 1);
  }

  zoom = (): number => this.zoomTo(this.zoomValue);

  zoomIn = (): number => {
    this.currentZoom++;
    return this.zoom();
  };

  zoomOut = (): number => {
    this.currentZoom--;
    return this.zoom();
  };

  zoomReset = (): number => {
    this.currentZoom = 3;
    return this.zoom();
  };

  zoomTo = (scale: number): number => {
    this.props.setZoom(scale);
    return scale;
  };

  changeCostType = (costType: RuneCostType) =>
    (this.runeWeightType.primary = costType);

  changeTier = (tier: number) =>
    $(".rune-simulator").attr("data-tier", (this.tier = tier));

  render() {
    console.info("Simulator Rendered");
    if (Object.keys(this.runebase).length === 0) return "Loading...";
    return (
      <React.Fragment>
        <div className="rune-simulator-container " ref="rune-container">
          <div
            className={`rune-simulator `}
            data-tier={this.tier}
            style={{
              top: 1690 + "px",
              left: 1750 + "px",
              transformOrigin: "-1750px -1690px",
              WebkitTransformOrigin: "-1750px -1690px"
            }}
          >
            {this.renderLinks()}
            {this.renderPoints()}
          </div>
        </div>
      </React.Fragment>
    );
  }
}
