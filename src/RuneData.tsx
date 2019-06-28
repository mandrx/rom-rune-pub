import { AstrolabeData, Rune, RuneType, RuneCost } from "./AppInterfaces";

import "./Utils";
import { min, max, remove } from "./Utils";

export class RuneData {
  private data: any = [];
  private runes: Rune[] = [];

  constructor() {
    this.data["astrolabe"] = require("./data/astrolabe.json");
    this.data["rune"] = require("./data/rune.json");
    this.data["runeByTypeBranch"] = require("./data/runeByTypeBranch.json");
    this.data["runeSpecial"] = require("./data/runeSpecial.json");
    this.data["runeSpecialDesc"] = require("./data/runeSpecialDesc.json");
  }

  getRawData = (data:any) => {
    return this.data[data];
  };

  initRune(): Rune[] {
    this.getRawData("rune").forEach((runeData: any, i: number) => {
      let pointData = this.getRawData("astrolabe").find((a: any) => {
        return a.Id === runeData.Id;
      });

      let costs = { contribution: 0, medal: 0 };
      if (runeData.Cost) {
        costs = {
          contribution: runeData.Cost
            ? runeData.Cost[0]
              ? runeData.Cost[0].Count
              : 0
            : 0,
          medal: runeData.Cost
            ? runeData.Cost[1]
              ? runeData.Cost[1].Count
              : 0
            : 0
        };
      }

      this.runes.push({
        id: runeData.Id,
        link: pointData.Link,
        tier: pointData.Evo,
        x: pointData.X,
        y: pointData.Y,
        cost: costs,
        active: false
        //resetCost
      });
    });
    return this.runes;
  }

  getRune = (id: number): Rune => {
    return this.runes.find((rune: Rune, i: number) => {
      return rune.id === id;
    })!;
  };

  sortByProperty = (
    data: any,
    prop: string,
    ascending: boolean = true
  ) => {
    let sorted: any = this.getRawData(data);

    sorted.sort((a: any, b: any) => {
      return (a[prop] - b[prop]) * Number(ascending ? 1 : -1);
    });

    return sorted;
  };

  getRuneType = (id: number): RuneType => {
    if (id === 10000) return RuneType.start;
    let runeCost = this.getRuneCost(id);
    if (runeCost.medal > 0) return RuneType.special;
    return RuneType.basic;
  };

  getRuneLink = (id: number): number[] => {
    return this.getRune(id) && this.getRune(id)!.link;
  };

  getRuneCost = (id: number): RuneCost => {
    return this.getRune(id).cost;
  };

  getRuneStatus = (id: number): boolean => {
    return !!this.getRune(id).active;
  };

  activateRune = (id: number, recursive: boolean = true) => {
    let rune = this.getRune(id);
    rune.active = true;
    return rune;
  };

  activateRunePath = (runeId: number) => {
    let maxevo = 90000; // TODO
    let distTo: any = [];
    let edgeTo: any = [];
    let pq: any = []; // pointQueue
    let pdone: any = [];
    let shortest: any = {};

    console.log('activateRunePath',runeId)

    let DijkstraSP = (id: any) => {
      this.data.astrolabe.forEach((point: AstrolabeData) => {
        distTo[point.Id] = Infinity; // set semua jadi infinity sebab belum cek lagi.
      });

      // initialize starting point. tempat kito duk loni, set 0 starting
      distTo[id] = 0;
      pq.push({ id: id, weight: 0 });

      let checkRuneLink = (id: number) => {
        let links = this.getRuneLink(id);
        let currWeight = this.getRuneCost(id).medal;

        links.forEach((link: any) => {
          if (!pdone.includes(link)) {
            let linkWeight = this.getRuneCost(link).medal;
            pq.push({ id: link, weight: linkWeight + currWeight });
          }
        });
        pdone.push(id);
        //console.log("new pq::::", pq, pdone);
      };

      while (pq.length) {
        let _min = min(pq, "weight"); // get lowest medal
        pq = remove(pq, "id", _min.id);
        checkRuneLink(_min.id);

        if (pq.length > 100) {
          console.log("Forced end...");
          pq = [];
        }
      }
      console.log(pq);
    };

    DijkstraSP(runeId);
  };

  deactivateRune = (id: number) => {
    let rune = this.getRune(id);
    rune.active = false;
    return rune;
  };

  doActivateRune = (id: number) => {
    if (id === 10000) {
      console.log("This is Starting Point!");
    } else {
      if (!this.getRuneStatus(id)) {
        //this.activateRunePath(id);
        console.log('test');
      } else {
        this.deactivateRune(id);
      }
    }
  };
}
