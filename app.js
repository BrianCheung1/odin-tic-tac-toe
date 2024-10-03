function GameBoard() {
  const rows = 3
  const cols = 3
  const board = []

  for (let i = 0; i < rows; i++) {
    board[i] = []
    for (let j = 0; j < cols; j++) {
      board[i].push(Cell())
    }
  }

  const getBoard = () => board
  const markBoard = (row, col, player) => {
    if (board[row][col].getValue() !== "-") {
      return false
    }
    board[row][col].addToken(player)
    return true
  }
  const printBoard = () => {
    const boardWithCellValues = board.map((row) =>
      row.map((cell) => cell.getValue())
    )
  }
  const resetBoard = () => {
    for (let i = 0; i < rows; i++) {
      board[i] = []
      for (let j = 0; j < cols; j++) {
        board[i].push(Cell())
      }
    }
  }

  return { getBoard, printBoard, markBoard, resetBoard }
}

function Cell() {
  let value = "-"

  const addToken = (player) => {
    value = player
  }
  const getValue = () => value

  return {
    addToken,
    getValue,
  }
}

function GameController() {
  const board = GameBoard()
  const playerOneName = document.getElementById("playerOne")
  const playerTwoName = document.getElementById("playerTwo")
  const players = [
    {
      name: playerOneName.value,
      token: "X",
    },
    {
      name: playerTwoName.value,
      token: "O",
    },
  ]

  let activePlayer = players[0]
  const switchPlayerTurn = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0]
  }

  const getActivePlayer = () => activePlayer

  const printNewRound = () => {
    board.printBoard()
    console.log(`${getActivePlayer().name}'s turn`)
  }

  const checkBoard = () => {
    const availableCells = board
      .getBoard()
      .map((row) => row.filter((col) => col.getValue() === "-")) // Get all cells with value 0 in each row
      .filter((cells) => cells.length > 0)
    const checkLine = (cells, player) =>
      cells.every((cell) => cell.getValue() === player)
    // Get the board once and reuse it
    const boardState = board.getBoard()

    // Define the lines to check (rows, columns, and diagonals)
    const linesToCheck = [
      // Rows
      [boardState[0][0], boardState[0][1], boardState[0][2]],
      [boardState[1][0], boardState[1][1], boardState[1][2]],
      [boardState[2][0], boardState[2][1], boardState[2][2]],

      // Columns
      [boardState[0][0], boardState[1][0], boardState[2][0]],
      [boardState[0][1], boardState[1][1], boardState[2][1]],
      [boardState[0][2], boardState[1][2], boardState[2][2]],

      // Diagonals
      [boardState[0][0], boardState[1][1], boardState[2][2]],
      [boardState[0][2], boardState[1][1], boardState[2][0]],
    ]
    // Check if 'X' or 'O' has a winning line
    const isXWinner = linesToCheck.some((line) => checkLine(line, "X"))
    const isOWinner = linesToCheck.some((line) => checkLine(line, "O"))

    console.log(isXWinner, isOWinner, availableCells.length)
    // Final check if there's a winner
    if (isXWinner || isOWinner) {
      return isXWinner ? `${players[0].name} Wins` : `${players[1].name} Wins`
    } else if (availableCells.length === 0) {
      return "No winner"
    }
    return false
  }

  const resetGame = () => {
    activePlayer = players[0]
    board.resetBoard()
  }

  const playRound = (row, col) => {
    console.log(
      `Placing ${getActivePlayer().name} token into row ${row} col ${col}`
    )
    if (!board.markBoard(row, col, getActivePlayer().token)) {
      return
    }
    switchPlayerTurn()
    printNewRound()
    return checkBoard()
  }

  printNewRound()

  return {
    playRound,
    getActivePlayer,
    getBoard: board.getBoard,
    resetGame,
  }
}

function ScreenController() {
  const game = GameController()
  const playerTurnDiv = document.querySelector(".turn")
  const boardDiv = document.querySelector(".board")
  const resetDiv = document.querySelector(".reset")

  const updateScreen = () => {
    boardDiv.textContent = ""
    resetDiv.textContent = ""

    const board = game.getBoard()
    const activePlayer = game.getActivePlayer()

    playerTurnDiv.textContent = `${activePlayer.name}'s turn`

    let rowNumber = 0
    board.forEach((row) => {
      row.forEach((cell, index) => {
        const cellButton = document.createElement("button")
        cellButton.classList.add("cell")
        cellButton.dataset.col = index
        cellButton.dataset.row = rowNumber
        cellButton.textContent = cell.getValue()
        boardDiv.appendChild(cellButton)
      })
      rowNumber++
    })
  }

  const endGame = (gameState) => {
    playerTurnDiv.textContent = `${gameState}`
    const cellButtons = document.querySelectorAll(".cell")
    cellButtons.forEach((cell) => {
      cell.disabled = true
    })
    const resetButton = document.createElement("button")
    resetButton.textContent = "Reset"
    resetButton.classList.add("resetButton")
    resetButton.addEventListener("click", () => {
      game.resetGame()
      updateScreen()
    })
    resetDiv.appendChild(resetButton)
  }

  function clickHandlerBoard(e) {
    const selectedRow = e.target.dataset.row
    const selectedCol = e.target.dataset.col

    if (!selectedCol || !selectedRow) {
      return
    }
    let gameState = game.playRound(selectedRow, selectedCol)
    console.log(gameState)
    if (gameState) {
      updateScreen()
      endGame(gameState)
    } else {
      updateScreen()
    }
  }
  boardDiv.addEventListener("click", clickHandlerBoard)
  updateScreen()
}

const playerOneName = document.getElementById("playerOne")
const playerTwoName = document.getElementById("playerTwo")

const startButton = document.getElementById("formButton")
startButton.addEventListener("click", (e) => {
  e.preventDefault()

  if(playerOneName.checkValidity() || playerTwoName.checkValidity()){
     ScreenController()
  }
  else {
    playerOneName.reportValidity()
    playerTwoName.reportValidity()
  }
})
