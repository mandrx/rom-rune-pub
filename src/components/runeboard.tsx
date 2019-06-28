import * as React from "react";
import { RuneData } from "../RuneData";
import RunePoint from "./RunePoint";
import "../styles/runeStyling.scss";
import {
  AstrolabeData,
  RunePosition,
  RuneBoardData,
  Rune
} from "../AppInterfaces";
import "dragscroll";
import DebugPanel from "./DebugPanel";
import { DijkstraDemo } from "../DijkstraDemo";

export interface RuneBoardProps {
  boardSize: number;
}

export interface RuneBoardState {
  boardHeight: number;
  boardWidth: number;
  runes: Rune[];
  scale: number;
  lastRuneId: number;
  evoLevel: number;
  options?: object;
}

class RuneBoard extends React.Component<RuneBoardProps, RuneBoardState> {
  /*
  private runeData: RuneData = new RuneData();

  private drawnLineMidPoint: string[] = []; // Record to prevent line overlap

  private runePointSize = 10;
  private linkLineWidth = 4;

  private minX = -3793;
  private maxX = 4449;

  private minY = -2898;
  private maxY = 3886;

  private rangeX = this.maxX - this.minX;
  private rangeY = this.maxY - this.minY;

  state: any = {
    boardHeight: 0,
    boardWidth: 0,
    scale: 1,
    options: { evo: 90000 },
    runes: this.runeData.initRune()
  };

  componentDidMount() {
    console.log("this.runeData", this.runeData);

    this.setState({
      boardHeight: this.props.boardSize,
      boardWidth: Math.ceil((this.rangeX / this.rangeY) * this.props.boardSize)
    });
  }
  convertCoordinate = (realX: number, realY: number) => {
    let scale = 1; //this.state.scale;

    return {
      x:
        (realX / (this.rangeX / this.state.boardWidth)) * scale +
        Math.abs((this.minX / (this.rangeX / this.state.boardWidth)) * scale),

      y:
        -(realY / (this.rangeY / this.state.boardHeight)) * scale +
        Math.abs((this.minY / (this.rangeY / this.state.boardHeight)) * scale) +
        175
    };
  };

  handleZoomClick = (scale: number, e?: any) => {
    this.setState({ scale: scale });
    console.log("Zooming x", scale);
  };

  render() {
    return <DijkstraDemo />;
    return (
      <div>
        <div className="top-panel">
          <h1>Runeboard</h1>

          <DebugPanel zoom={this.handleZoomClick} />
        </div>
        <div className="rune-board-container dragscroll">
          <div
            className="rune-board"
            style={{
              height: this.state.boardHeight,
              width: this.state.boardWidth,
              transform: `scale(${this.state.scale})`
            }}
          >
            {this.renderRuneLinkSVG()}
            {this.renderRunePoints()}
          </div>
        </div>
      </div>
    );
  }

  renderRuneLinkSVG(): JSX.Element[] | JSX.Element {
    this.drawnLineMidPoint = [];
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height={this.state.boardHeight}
        width={this.state.boardWidth}
        ref="runeLinksContainer"
      >
        {console.log("Redrawing (#TODO)...")}
        {this.state.runes.map((rune: Rune, i: number) => {
          let runeStartCoor: RunePosition = this.convertCoordinate(
            rune.x,
            rune.y
          );
          return rune.link.map((runeLinkID: number, b: number) => {
            let runeLink = this.runeData.getRune(runeLinkID);
            let runeEndCoor: RunePosition = this.convertCoordinate(
              runeLink.x,
              runeLink.y
            );

            let midPoint = [
              (runeStartCoor.x + runeEndCoor.x) / 2,
              (runeStartCoor.y + runeEndCoor.y) / 2
            ].join(",");

            if (this.drawnLineMidPoint.indexOf(midPoint) === -1) {
              // Check to prevent line overlapping

              this.drawnLineMidPoint.push(midPoint);
              return (
                <line
                  key={rune.id + "-" + runeLinkID}
                  x1={runeStartCoor.x}
                  x2={runeEndCoor.x}
                  y1={runeStartCoor.y}
                  y2={runeEndCoor.y}
                  strokeWidth={this.linkLineWidth}
                  //stroke="#b8b8b8"
                  className="linkLine"
                />
              );
            }
          });
        })}
      </svg>
    );
  }

  renderRunePoint_onMouseOver_callBack = (id: number, e?: React.MouseEvent) => {
    console.log("renderRunePoint_onMouseOver", id, this.runeData.getRune(id));
  };

  renderRunePoints() {
    let abc = [1, 2, 3];
    console.log(this.state.runes);
    return (
      <div>
        {this.state.runes.map((rune: Rune, i: number) => {
          return (
            <RunePoint
              key={rune.id}
              runeId={rune.id}
              runeData={this.runeData}
              onMouseOver_callback={this.renderRunePoint_onMouseOver_callBack}
              coor={this.convertCoordinate(rune.x, rune.y)}
              size={this.runePointSize}
              options={this.state.options}
            />
          );
        })}
      </div>
    );
  }
  */
}

export default RuneBoard;
