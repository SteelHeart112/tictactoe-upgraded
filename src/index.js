import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

const defaultWidth = 31;
const defaultHeight = 23;
const nSquareToWin = 5;

function Square(props) {
  return props.win ? (
    <button className="square square-highlight" onClick={props.onClick}>
      {props.value}
    </button>
  ) : (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

function calculateWinner(squares) {
  let win;
  for (let i = 0; i < squares.length; i++) {
    for (let j = 0; j < squares[i].length; j++) {
      if (!squares[i][j]) continue;
      if (j <= squares[i].length - nSquareToWin) {
        win = true;
        for (let k = 0; k < nSquareToWin - 1; k++) {
          if (squares[i][j + k] !== squares[i][j + k + 1]) {
            win = false;
          }
        }
        if (win)
          return { val: squares[i][j], x: j, y: i, direction: "ToRight" };
      }
      if (i <= squares.length - nSquareToWin) {
        win = true;
        for (let k = 0; k < nSquareToWin - 1; k++) {
          if (squares[i + k][j] !== squares[i + k + 1][j]) {
            win = false;
          }
        }
        if (win) return { val: squares[i][j], x: j, y: i, direction: "ToDown" };
      }
      if (
        j <= squares[i].length - nSquareToWin &&
        i <= squares.length - nSquareToWin
      ) {
        win = true;
        for (let k = 0; k < nSquareToWin - 1; k++) {
          if (squares[i + k][j + k] !== squares[i + k + 1][j + k + 1]) {
            win = false;
          }
        }
        if (win)
          return { val: squares[i][j], x: j, y: i, direction: "ToRightDown" };
      }
      if (i <= squares.length - nSquareToWin && j >= nSquareToWin - 1) {
        win = true;
        for (let k = 0; k < nSquareToWin - 1; k++) {
          if (squares[i + k][j - k] !== squares[i + k + 1][j - k - 1]) {
            win = false;
          }
        }
        if (win)
          return { val: squares[i][j], x: j, y: i, direction: "ToLeftDown" };
      }
    }
  }
  return null;
}

class SquareRow extends React.Component {
  render() {
    let squareRow = this.props.row.map((square, idx) => {
      let k = idx;
      let win = false;
      let winner = this.props.winner;
      let rowIdx = this.props.rowIdx;
      if (winner) {
        if (
          winner.direction === "ToRight" &&
          idx >= winner.x &&
          idx <= winner.x + nSquareToWin - 1 &&
          rowIdx === winner.y
        ) {
          win = true;
        }
        if (
          winner.direction === "ToDown" &&
          rowIdx >= winner.y &&
          rowIdx <= winner.y + nSquareToWin - 1 &&
          idx === winner.x
        ) {
          win = true;
        }
        if (
          winner.direction === "ToRightDown" &&
          idx >= winner.x &&
          idx <= winner.x + nSquareToWin - 1 &&
          idx - winner.x === rowIdx - winner.y
        ) {
          win = true;
        }
        if (
          winner.direction === "ToLeftDown" &&
          idx <= winner.x &&
          idx >= winner.x - nSquareToWin + 1 &&
          winner.x - idx === rowIdx - winner.y
        ) {
          win = true;
        }
      }
      return (
        <Square
          win={win}
          value={square}
          onClick={() => this.props.onClick(this.props.rowIdx, idx)}
          key={k}
        />
      );
    });
    return <div className="board-row">{squareRow}</div>;
  }
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }
  render() {
    let board;
    board = this.props.squares.map((row, idx) => {
      let k = idx;
      return (
        <SquareRow
          winner={this.props.winner}
          rowIdx={idx}
          row={row}
          onClick={this.props.onClick}
          key={k}
        />
      );
    });
    return <div>{board}</div>;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    let makeBoard = Array(defaultHeight);
    for (let i = 0; i < defaultHeight; i++) {
      makeBoard[i] = Array(defaultWidth).fill(null);
    }
    this.state = {
      history: [
        {
          squares: makeBoard,
          location: null
        }
      ],
      stepNumber: 0,
      xIsNext: true
    };
  }
  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0
    });
  }

  componentDidMount() {}

  handleClick(i, j) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[this.state.stepNumber];
    const squares = current.squares.slice();
    current.squares.map((row, idx) => {
      squares[idx] = current.squares[idx].slice();
      return true;
    });
    if (calculateWinner(squares) || squares[i][j]) {
      return;
    }
    squares[i][j] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([
        {
          squares: squares,
          location: { x: i, y: j }
        }
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }

  responseFacebook = response => {
    console.log(response);
    this.setState(
      {
        isLogin: true,
        firstName: response.name,
        userEmail: response.email
      },
      () => console.log("this.state", this.state)
    );
  };

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    let moves = history.map((step, move) => {
      const desc = move
        ? "Go to move #" +
          move +
          " (" +
          step.location.x +
          "," +
          step.location.y +
          ")"
        : "Go to game start";
      return this.state.stepNumber === move ? (
        <li k={move}>
          <button className="btn-bold" onClick={() => this.jumpTo(move)}>
            {desc}
          </button>
        </li>
      ) : (
        <li k={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    let status;
    if (winner) {
      status = "Winner: " + winner.val;
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    return (
      <div class="content">
        <div className="game">
          <div className="game-board">
            <Board
              squares={current.squares}
              onClick={(i, j) => this.handleClick(i, j)}
              winner={winner}
            />
          </div>
          <div className="game-info">
            <div>{status}</div>
            <ol>{moves}</ol>
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Game />, document.getElementById("root"));
