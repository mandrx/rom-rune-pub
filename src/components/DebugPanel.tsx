import * as React from "react";

export interface DebugPanelProps {
  zoom: Function;
}

class DebugPanel extends React.Component<DebugPanelProps> {
  render() {
    return (
      <ul className="zoomButtons">
        <li>
          <div
            className="button"
            onClick={e => {
              this.props.zoom(0.5, e);
            }}
          >
            1
          </div>
        </li>
        <li>
          <div
            className="button"
            onClick={e => {
              this.props.zoom(0.75, e);
            }}
          >
            2
          </div>
        </li>
        <li>
          <div
            className="button"
            onClick={e => {
              this.props.zoom(1, e);
            }}
          >
            3
          </div>
        </li>
        <li>
          <div
            className="button"
            onClick={e => {
              this.props.zoom(1.25, e);
            }}
          >
            4
          </div>
        </li>
        <li>
          <div
            className="button"
            onClick={e => {
              this.props.zoom(1.5, e);
            }}
          >
            5
          </div>
        </li>
        <li>
          <div
            className="button"
            onClick={e => {
              this.props.zoom(1.75, e);
            }}
          >
            6
          </div>
        </li>
        <li>
          <div
            className="button"
            onClick={e => {
              this.props.zoom(2, e);
            }}
          >
            7
          </div>
        </li>
      </ul>
    );
  }
}

export default DebugPanel;
