// import type { PlayerId, RuneClient } from "rune-sdk"

// export type Cells = (PlayerId | null)[]
// export interface GameState {
//   cells: Cells
//   winCombo: number[] | null
//   lastMovePlayerId: PlayerId | null
//   playerIds: PlayerId[]
//   freeCells?: boolean
// }

// type GameActions = {
//   claimCell: (cellIndex: number) => void
// }

// declare global {
//   const Rune: RuneClient<GameState, GameActions>
// }

// function findWinningCombo(cells: Cells) {
//   return (
//     [
//       [0, 1, 2],
//       [3, 4, 5],
//       [6, 7, 8],
//       [0, 3, 6],
//       [1, 4, 7],
//       [2, 5, 8],
//       [0, 4, 8],
//       [2, 4, 6],
//     ].find((combo) =>
//       combo.every((i) => cells[i] && cells[i] === cells[combo[0]])
//     ) || null
//   )
// }

// Rune.initLogic({
//   minPlayers: 2,
//   maxPlayers: 2,
//   setup: (allPlayerIds) => ({
//     cells: new Array(9).fill(null),
//     winCombo: null,
//     lastMovePlayerId: null,
//     playerIds: allPlayerIds,
//   }),
//   actions: {
//     claimCell: (cellIndex, { game, playerId, allPlayerIds }) => {
//       if (
//         game.cells[cellIndex] !== null ||
//         playerId === game.lastMovePlayerId
//       ) {
//         throw Rune.invalidAction()
//       }

//       game.cells[cellIndex] = playerId
//       game.lastMovePlayerId = playerId
//       game.winCombo = findWinningCombo(game.cells)

//       if (game.winCombo) {
//         const [player1, player2] = allPlayerIds

//         Rune.gameOver({
//           players: {
//             [player1]: game.lastMovePlayerId === player1 ? "WON" : "LOST",
//             [player2]: game.lastMovePlayerId === player2 ? "WON" : "LOST",
//           },
//         })
//       }

//       game.freeCells = game.cells.findIndex((cell) => cell === null) !== -1

//       if (!game.freeCells) {
//         Rune.gameOver({
//           players: {
//             [game.playerIds[0]]: "LOST",
//             [game.playerIds[1]]: "LOST",
//           },
//         })
//       }
//     },
//   },
// })


import type { PlayerId, RuneClient } from "rune-sdk"

export interface GameState {
  playerDice: Record<PlayerId, number>
  totalDice: number
  turnCount: number
  currentPlayerIndex: number
  rollResult: Record<string, number>
  gameOver: boolean
}

type GameActions = {
  rollDice: () => void
  endTurn: () => void
}

declare global {
  const Rune: RuneClient<GameState, GameActions>
}

const DICE_FACES = ['Blank', 'Blank', 'Blank', 'Present', 'Snowflake', 'Candy Cane', 'Star'];

function rollDice(numDice: number): Record<string, number> {
  const rolls: string[] = Array.from({ length: numDice }, () => DICE_FACES[Math.floor(Math.random() * DICE_FACES.length)]);
  return rolls.reduce((acc, face) => {
    acc[face] = (acc[face] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

function handlePresents(game: GameState, currentPlayer: PlayerId, presents: number) {
  const otherPlayers = Object.keys(game.playerDice).filter(p => p !== currentPlayer);
  for (let i = 0; i < presents; i++) {
    if (game.playerDice[currentPlayer] > 0) {
      const recipient = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
      game.playerDice[currentPlayer]--;
      game.playerDice[recipient]++;
    }
  }
}

function handleSnowflakes(game: GameState, currentPlayer: PlayerId, snowflakes: number) {
  game.playerDice[currentPlayer] -= snowflakes;
  game.totalDice -= snowflakes;
}

function handleCandyCanes(game: GameState, currentPlayer: PlayerId, candyCanes: number) {
  const playerIds = Object.keys(game.playerDice);
  const nextPlayerIndex = (playerIds.indexOf(currentPlayer) + 1) % playerIds.length;
  const nextPlayer = playerIds[nextPlayerIndex];
  
  const defenderRoll = rollDice(game.playerDice[nextPlayer]);
  const defenderCandyCanes = defenderRoll['Candy Cane'] || 0;
  
  if (defenderCandyCanes >= candyCanes) {
    const excess = defenderCandyCanes - candyCanes;
    game.playerDice[currentPlayer] += excess;
    game.playerDice[nextPlayer] -= excess;
  } else {
    const unblocked = candyCanes - defenderCandyCanes;
    game.playerDice[nextPlayer] += unblocked;
    game.playerDice[currentPlayer] -= unblocked;
  }
}

function handleStars(game: GameState, currentPlayer: PlayerId, stars: number) {
  game.playerDice[currentPlayer] -= stars;
  game.totalDice -= stars;
}

Rune.initLogic({
  minPlayers: 2,
  maxPlayers: 5,
  setup: (allPlayerIds): GameState => ({
    playerDice: Object.fromEntries(allPlayerIds.map(id => [id, 5])),
    totalDice: allPlayerIds.length * 5,
    turnCount: 0,
    currentPlayerIndex: 0,
    rollResult: {},
    gameOver: false,
  }),
  actions: {
    rollDice: (_, { game }) => {
      const currentPlayer = Object.keys(game.playerDice)[game.currentPlayerIndex];
      game.rollResult = rollDice(game.playerDice[currentPlayer]);
    },
    endTurn: (_, { game }) => {
      const currentPlayer = Object.keys(game.playerDice)[game.currentPlayerIndex];
      
      handlePresents(game, currentPlayer, game.rollResult['Present'] || 0);
      handleSnowflakes(game, currentPlayer, game.rollResult['Snowflake'] || 0);
      handleCandyCanes(game, currentPlayer, game.rollResult['Candy Cane'] || 0);
      handleStars(game, currentPlayer, game.rollResult['Star'] || 0);

      game.turnCount++;
      game.currentPlayerIndex = (game.currentPlayerIndex + 1) % Object.keys(game.playerDice).length;
      game.rollResult = {};

      const activePlayers = Object.entries(game.playerDice).filter(([, dice]) => dice > 0);
      if (activePlayers.length === 1) {
        game.gameOver = true;
        const winner = activePlayers[0][0];
        const players = Object.fromEntries(
          Object.keys(game.playerDice).map(id => [id, id === winner ? "WON" : "LOST"])
        );
        Rune.gameOver({ players });
      }
    },
  },
})