import * as React from "react";
import { uniquePush } from "./Utils";
import localForage from "localforage";
import { RuneCostType } from "./AppInterfaces";
import "dragscroll";

export enum DBKey {
  RuneBasic = "runebasic",
  RuneDesc = "runedesc",
  RuneCost = "runecost"
}



export class DijkstraDemo extends React.Component {
  private startPoint = "10000";
  private runeCostType = RuneCostType.Contribution;
  private runecost: any = {};
  private runebase: any = {};
  private activeRuneCost = {
    step: 0,
    medal: 0,
    cont: 0
  };

  private runes = require("./data/rune.json");
  private astrolabe = require("./data/astrolabe.json");

  state = {
    routeTable: [this.startPoint],
    runeDataLoaded: false,
    scale:1,
  };

  constructor(props: any) {
    super(props);
    this.loadGameRuneData();
  }

  loadGameRuneData() {
    let runebase: any = [];
    let runecost: any = [];
    let vertexlinks: any = [];

    localForage
      .getItem(DBKey.RuneBasic)
      .then((data: any) => {
        if (!data) {
          console.log("Not using cached data.");

          this.astrolabe.forEach((vertex: any) => {
            runebase[vertex.Id] = {
              coor: [vertex.X / 2.3, -vertex.Y / 2.3],
              link: vertex.Link
            };
            vertex.Link.forEach((link: string) => {
              if (runecost[link] == undefined) {
                runecost[link] = this.getRuneCost(link);
              }
            });
            [vertex.Link] = vertexlinks;
          });

          //localForage.setItem(DBKey.RuneBasic, {base:runebase,cost:runecost});
        } else {
          console.log("Using cached data.", data);
          runecost = data.cost;
          runebase = data.base;
        }
      })
      .finally(() => {
        this.runecost = runecost;
        this.runebase = runebase;
        this.setState({
          runeDataLoaded: true
        });
      });
  }

  componentDidMount() {}

  private resetRune = () => {
    console.log("Reset!");
    this.activeRuneCost = {
      step: 0,
      medal: 0,
      cont: 0
    };
    this.setState({
      routeTable: [this.startPoint]
    });
  };

  private getRuneCost = (link: string) => {
    let ret: any = {};

    const getCostById = (id: string) => {
      return this.runes.find((rune: any) => {
        return rune.Id == id;
      });
    };

    let runeWithCostRaw = getCostById(link);
    let cont = 0;
    let medal = 0;
    if (!runeWithCostRaw.Cost) {
      // Starting point. "10000"
      cont = 150;
    } else {
      if (runeWithCostRaw.Cost.length == 1) {
        cont = runeWithCostRaw.Cost[0].Count;
      }

      if (runeWithCostRaw.Cost.length == 2) {
        medal = runeWithCostRaw.Cost[1].Count;
      }
    }

    return [1, medal, cont];
  };

  pointOnClick = (id: string) => {
    if (id == this.startPoint) {
      this.resetRune();
    } else {
      this.getPath(id);
    }
    console.log("Cost:", this.activeRuneCost);
  };

  isActiveRune = (id: string): boolean => {
    return this.state.routeTable.indexOf(id) > -1 ? true : false;
  };
  activeVertextClass = (id: string) =>
    this.isActiveRune(id) ? "activeRune" : "";

  isConnected = (a: string, b: string): boolean => {
    let linkTable: string[] = this.state.routeTable;
    if (linkTable.indexOf(a) > -1 && linkTable.indexOf(b) > -1) {
      return true;
    }
    return false;
  };

  getPath = (target: string) => {
    let activeRunes: any = this.state.routeTable;

    let completeRoute: boolean = false;
    let count = 0;
    let pathTable = this.DijkstraPath(target, activeRunes);
    let activeRuneCost: any = this.activeRuneCost;

    const getViaPath = (_to: any) => {
      return pathTable.find((path: any) => {
        //console.log(path,_to)
        return path.to == _to;
      });
    };

    const getClosestActivePath = () => {
      pathTable.sort(function(a: any, b: any) {
        return a.cost - b.cost;
      });
      let activePathTable = pathTable.filter((path: any) => {
        return activeRunes.indexOf(path.to) > -1;
      });
      //console.log("activePathTable", activePathTable);
      return activePathTable[0];
    };

    const updateActiveRuneCost = (cost: any) => {
      this.activeRuneCost.step += cost[RuneCostType.Step];
      this.activeRuneCost.medal += cost[RuneCostType.Medal];
      this.activeRuneCost.cont += cost[RuneCostType.Contribution];
      return this.activeRuneCost;
    };

    let currentPath = activeRunes[0];

    if (activeRunes.length > 1) {
      currentPath = getClosestActivePath().to;
    }

    while (!completeRoute && count < 3000) {
      let nextPath = getViaPath(currentPath);

      if (nextPath === undefined) {
        console.log("Route not connected");
        completeRoute = true;
      } else {
        uniquePush(activeRunes, currentPath);
        currentPath = nextPath.via; // get current path's via.

        if (activeRunes.indexOf(currentPath)) {
          let newRuneCost = this.getRuneCost(currentPath);
          updateActiveRuneCost(newRuneCost);
          activeRunes.push(currentPath);
        }

        if (currentPath == target) {
          completeRoute = true;
          this.setState({
            activeRunes: activeRunes
          });
          console.log(`Route fully generated. Target ${target}`, activeRunes);
        }
      }
      //console.log("getPath loop count:", ++count);
    }
  };

  DijkstraPath = (from: string, to: string | string[] = this.startPoint) => {
    let shortest_path: any = [];
    let visited: any = [];
    let loopCount = 0;
    let pathLowestCost: number = Infinity;

    to = typeof to === "string" ? [to] : to;
    to = [...to];

    console.log("DijkstraPath", from, to);

    let unvisitedCombo: any = {};

    const getCostFromStart = (to: string) => {
      return shortest_path.find((path: any) => path.to == to);
    };
    const getRuneLinkCost = (runeid: any): number =>
      this.runecost[runeid][this.runeCostType];

    const replaceShortestPath = (vertex: any, via: any, cost: number) => {
      console.log("replaceShortestPath", vertex, via, cost);
      let path = shortest_path.find((path: any) => {
        return path.to === vertex;
      });
      path.via = via;
      path.cost = cost;

      return path;
    };

    const visit = (thisVertexId: string, first: boolean = false) => {
      //console.log("Visiting: ", thisVertexId);

      if (first)
        shortest_path.push({
          via: thisVertexId,
          to: thisVertexId,
          cost: 0
        });

      let costFromStart = getCostFromStart(thisVertexId).cost;

      this.runebase[thisVertexId].link.map((linkId: string) => {
        linkId = linkId.toString();
        loopCount++;
        //console.log(">> ", thisVertexId, " => ", linkId);

        let runeLinkCost = getRuneLinkCost(linkId);
        let prevLinkFromStart = getCostFromStart(linkId);
        let costLinkFromStart = costFromStart + runeLinkCost;

        if (to.indexOf(linkId) > -1) {
          // Kalau link ni dah bersambung dengan target atau mana2 activated vertex, set sebagai jupe dh
          console.log("Target found!", to, linkId, thisVertexId);

          if (pathLowestCost > costLinkFromStart) {
            console.log("Found shorter path via", linkId);
            pathLowestCost = costLinkFromStart;
          }
        }

        if (visited.indexOf(linkId) < 0) {
          if (prevLinkFromStart === undefined) {
            let newShortPath = {
              via: thisVertexId,
              to: linkId,
              cost: costLinkFromStart
            };

            shortest_path.push(newShortPath);
          } else {
            let linkCostFromStart = prevLinkFromStart.cost;
            let newLinkCostFromStart = costLinkFromStart;

            if (linkCostFromStart > newLinkCostFromStart) {
              replaceShortestPath(linkId, thisVertexId, newLinkCostFromStart);
            }
          }
        }

        if (
          visited.indexOf(linkId) < 0 &&
          pathLowestCost > costLinkFromStart + runeLinkCost
        ) {
          if (unvisitedCombo[linkId] == undefined) {
            unvisitedCombo[linkId] = costLinkFromStart;
          } else {
            if (unvisitedCombo[linkId] > costLinkFromStart) {
              unvisitedCombo[linkId] = costLinkFromStart;
            }
          }
        }
      });

      visited = uniquePush(visited, thisVertexId);
    };

    const getNextShortestVertext = () => {
      let sorted = Object.keys(unvisitedCombo).sort(function(a, b) {
        return unvisitedCombo[a] - unvisitedCombo[b];
      });
      let ret = sorted[0];
      delete unvisitedCombo[sorted[0]];
      return ret;
    };

    visit(from, true);

    while (Object.entries(unvisitedCombo).length > 0) {
      //console.log("unvisitedCombo", unvisitedCombo,shortest_path);
      visit(getNextShortestVertext());
    }

    console.log("loopCount", loopCount);
    return shortest_path;
  };

  renderPoints = () => {
    return (
      <div className="pointContainer">
        {Object.keys(this.runebase).map((a: any) => {
          return (
            <div
              onClick={e => {
                this.pointOnClick(a);
              }}
              key={a}
              className={`vertex ${this.activeVertextClass(a)}`}
              style={{
                left: this.runebase[a].coor[0],
                top: this.runebase[a].coor[1]
              }}
            >
              {a}
            </div>
          );
        })}
      </div>
    );
  };

  renderLinks = () => {
    let drawnLineMidPoint: string[] = [];

    return (
      <div className="linkContainer">
        <svg>
          {Object.keys(this.runebase).map((a: string) => {
            return this.runebase[a].link.map((b: string) => {
              b = b.toString();
              let midPoint = [
                (this.runebase[a].coor[0] + this.runebase[b].coor[0]),
                (this.runebase[a].coor[1] + this.runebase[b].coor[1])
              ].join(",");

              let isActiveLink = this.isConnected(a, b) ? "activeLink" : "";

              if (drawnLineMidPoint.indexOf(midPoint) === -1) {
                drawnLineMidPoint.push(midPoint);
                return (
                  <React.Fragment key={`g_${a}-${b}`}>
                    <line
                      key={`line_${a}-${b}`}
                      x1={this.runebase[a].coor[0]}
                      x2={this.runebase[b].coor[0]}
                      y1={this.runebase[a].coor[1]}
                      y2={this.runebase[b].coor[1]}
                      strokeWidth={4}
                      stroke="#00000033"
                      className={`linkLine ${isActiveLink}`}
                    />
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
                  </React.Fragment>
                );
              }
            });
          })}
        </svg>
      </div>
    );
  };

  changeScale = (scale:number) =>{
    console.log('Change scale:',scale)
    this.setState({
      scale:scale
    })
  }
  changeCostType = (costType:RuneCostType) =>{
    this.runeCostType = costType;
  }

  render() {
    if (Object.keys(this.runebase).length === 0) return "Loading...";
    return (
      <React.Fragment>
        <div style={{
          position:"absolute",
          zIndex:10000,
          top:0,
          
        }}>
        <div>
          <button onClick={(e)=>{this.changeScale(0.3)}}>Scale 1</button>
          <button onClick={(e)=>{this.changeScale(0.5)}}>Scale 2</button>
          <button onClick={(e)=>{this.changeScale(1)}}>Scale 3</button>
          </div>
          <hr></hr>
          <div>
          <button onClick={(e)=>{this.changeCostType(RuneCostType.Step)}}>Distance</button>
          <button onClick={(e)=>{this.changeCostType(RuneCostType.Medal)}}>Gold Medal</button>
          <button onClick={(e)=>{this.changeCostType(RuneCostType.Contribution)}}>Contribution</button>
          </div>
        </div>
        <div className="demoContainer dragscroll" style={{
          transform: `scale(${this.state.scale})`
        }}>
          {this.renderLinks()}
          {this.renderPoints()}
        </div>
        <div className="demoPanel" />
      </React.Fragment>
    );
  }
}
