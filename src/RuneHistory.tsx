export class RuneHistory {
  private HISTORY_LIMIT = 20;
  private stateIndex = 0;

  constructor() {
    this.resetHistory();
  }

  addState = (state: number[], deleteMode: boolean = false) => {
    let historyStr = "";
    let history = this.getHistory();

    if (history.length > this.HISTORY_LIMIT) {
      history.shift();
    }

    // If new state added when we're on previous state (added after we undo).
    if (this.stateIndex !== history.length - 1)
      history.splice(this.stateIndex + 1);

    // [(add/remove),[affected ids]]
    let newHistoryState = [Number(deleteMode), state];

    history.push(newHistoryState);
    this.stateIndex = history.length - 1;

    historyStr = JSON.stringify(history);
    localStorage.setItem("history", historyStr);
  };

  showHistory = () => {
    let history: any = this.getHistory();
    console.log(history);
  };

  getHistory = () => {
    let history: any = localStorage.getItem("history");
    return history ? JSON.parse(history) : [];
  };

  resetHistory = (): void => {
    localStorage.setItem("history", "");
  };

  undoState = () => {
    let history = this.getHistory();
    let currentState = history[this.stateIndex--];

    if (this.stateIndex < 0) {
      this.stateIndex = 0;
      currentState = [0, []];
    }
    return currentState;
  };

  redoState = () => {
    let history = this.getHistory();
    let currentState = history[++this.stateIndex];

    if (this.stateIndex >= history.length) {
      this.stateIndex = history.length - 1;
      currentState = [0, []];
    }
    return currentState;
  };
}
