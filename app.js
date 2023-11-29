"use strict";

const BASE_URL = "https://sudoku-api.vercel.app/api/dosuku";
const $htmlBoard = $("#html-board");
const $numberBoard = $("#number-board");

const $difficulty = $("#difficulty");
const $errors = $("#errors");
const $button = $(".btn");

//instance of Game
let game;

/**Creates a working 9x9 sudoku board game */
class Game {
  constructor(height = 9, width = 9) {
    this.height = height;
    this.width = width;
    this.difficulty = null;
    this.numSelected = null;
    this.tileSelected = null;
    this.board = null;
    this.solution = null;
    this.scoreErrors = 0;
  }

  /**On start, retrieve board data from API and set up game and number
   * board
   */
  async start() {
    const boardData = await this.getBoardDataFromAPI();
    this.setBoard(boardData.value);
    this.setNumbers();
    this.setDifficulty(boardData.difficulty);
    this.board = boardData.value;
    this.solution = boardData.solution;
  }

  /**Creates 9x9 HTML board and appends it to the $htmlBoard*/
  setBoard(board) {
    $htmlBoard.text = "";
    for (let y = 0; y < this.height; y++) {
      const $row = $("<tr>");
      for (let x = 0; x < this.width; x++) {
        const $cell = $(`<td class="tile" id="${y}-${x}"></td>`);
        $row.append($cell);

        //Adds starting sudoku values to board
        if (board[y][x] === 0) {
          $cell.text("");
        } else {
          $cell.addClass("start-tile").text(board[y][x]);
        }

        //Sets horizontal line in board for 3 x 3 board pattern
        if (y === 2 || y === 5) {
          $cell.addClass("horizontal-line");
        }

        //Sets vertical line in board for 3 x 3 board pattern
        if (x === 2 || x === 5) {
          $cell.addClass("vertical-line");
        }
        //console.log(y, x);
      }
      $htmlBoard.append($row);
    }
  }

  /**Displays numbers 1-9 at the bottom of the board and appends it */
  setNumbers() {
    for (let i = 1; i <= 9; i++) {
      const $number = $(`<div id=${i} class="number">${i}</div>`);
      $numberBoard.append($number);
    }
  }

  /**Displays difficulty level in the dom*/
  setDifficulty(difficulty) {
    $difficulty.text(difficulty);
    this.difficulty = difficulty;
    //console.log($difficulty);
  }

  /**Retrieves board data from API and returns it
   * Object {
   *        difficulty: "Easy"
   *        solution: 0:(9)[6, 4, 1, 5, 3, 7, 2, 8, 9]
   *                  1:(9)[8, 3, 7, 6, 2, 9, 4, 1, 5]
   *                  2:(9)[5, 9, 2, 8, 1, 4, 7, 3, 6]
   *                  3:(9)[2, 7, 5, 4, 6, 1, 3, 9, 8]
   *                  4:(9)[4, 8, 6, 2, 9, 3, 5, 7, 1]
   *                  5:(9)[3, 1, 9, 7, 5, 8, 6, 4, 2]
   *                  6:(9)[9, 6, 4, 3, 8, 2, 1, 5, 7]
   *                  7:(9)[1, 5, 3, 9, 7, 6, 8, 2, 4]
   *                  8:(9)[7, 2, 8, 1, 4, 5, 9, 6, 3]
   *        }
   *        value:    0:(9)[6, 0, 1, 5, 0, 0, 0, 8, 9]
   *                  1:(9)[8, 3, 7, 0, 0, 9, 0, 1, 5]
   *                  2:(9)[0, 0, 0, 8, 1, 4, 7, 0, 0]
   *                  3:(9)[0, 7, 5, 0, 6, 0, 0, 0, 0]
   *                  4:(9)[4, 0, 6, 0, 0, 3, 5, 7, 0]
   *                  5:(9)[0, 0, 0, 7, 5, 8, 6, 0, 2]
   *                  6:(9)[9, 0, 0, 3, 0, 0, 0, 5, 7]
   *                  7:(9)[0, 5, 3, 0, 7, 6, 0, 0, 0]
   *                  8:(9)[7, 2, 0, 1, 0, 5, 0, 0, 0]
   *        }
   */
  async getBoardDataFromAPI() {
    const response = await fetch(`${BASE_URL}`);
    const dataFromAPI = await response.json();
    //console.log("response is:", response,"data is:",data);
    const boardData = dataFromAPI.newboard.grids[0];
    //console.log("board data is:", boardData);
    return boardData;
  }

}


$numberBoard.on("click", "div", selectNumber);

/**Handles click on number board, changing color for selected num.
 * Updates numSelected property on game instance
*/
function selectNumber(evt) {
  console.log("selectNumber", evt);
  //evt.preventDefault();

  $numberBoard.find("div").not($(evt.target)).removeClass("number-selected");

  $(evt.target).toggleClass("number-selected");

  game.numSelected = $(evt.target).attr("id");
  console.log("digit is:", game.numSelected);
}


$htmlBoard.on("click", "td", selectTile);

/**Handles click on sudoku board and updates HTML board and JS board with num
 * selected. Checks if tile selected is a starter-tile. If true, it returns.
 * Checks if a num is selected. Checks against API solution board and highlights
 * correct/incorrect answers. Updates error count.
*/
function selectTile(evt) {
  console.log("selectTile", evt);
  game.tileSelected = $(evt.target);

  if(game.tileSelected.hasClass("start-tile")){
    return;
  }

  const tileCoords = game.tileSelected.attr("id").split('-');
  const y = Number(tileCoords[0]);
  const x = Number(tileCoords[1]);

  if (game.numSelected !== null) {
    game.tileSelected.text(game.numSelected);
    game.board[y][x] = game.numSelected;
    if(game.solution[y][x] == game.board[y][x]){
    //console.log(game.solution[y][x], game.board[y][x])
    game.tileSelected.addClass("tile-selected");
    }else{
      game.tileSelected.addClass("error");
      game.scoreErrors+= 1;
      $errors.text(game.scoreErrors);
    }
  }
}


$button.on("click", handleStartClick)

/**Handles start click. Empties board, creates a new game instance, and starts
 * game
*/
async function handleStartClick(evt){
  $htmlBoard.empty()
  $numberBoard.empty()
  game = new Game();
  await game.start();
  $button.text("Restart");

}