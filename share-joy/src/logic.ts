import type { PlayerId, RuneClient } from "rune-sdk"

export type DiceFace = 'Blank' | 'Present' | 'Snowflake' | 'Candy Cane' | 'Star';

export interface GameState {
  playerDice: Record<PlayerId, number>
  totalDice: number
  turnCount: number
  currentPlayerIndex: number
  rollResult: DiceFace[]
  gameOver: boolean
  playerOrder: PlayerId[]
}

type GameActions = {
  rollDice: () => void
  resolveDie: (index: number) => void
  endTurn: () => void
}

declare global {
  const Rune: RuneClient<GameState, GameActions>
}

const DICE_FACES: DiceFace[] = ['Blank', 'Blank', 'Blank', 'Present', 'Snowflake', 'Candy Cane', 'Star'];

function rollDice(numDice: number): DiceFace[] {
  return Array.from({ length: numDice }, () => DICE_FACES[Math.floor(Math.random() * DICE_FACES.length)]);
}

function handlePresent(game: GameState, currentPlayer: PlayerId) {
  const otherPlayers = game.playerOrder.filter(p => p !== currentPlayer);
  if (game.playerDice[currentPlayer] > 0) {
    const recipient = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
    game.playerDice[currentPlayer]--;
    game.playerDice[recipient]++;
  }
}

function handleSnowflake(game: GameState, currentPlayer: PlayerId) {
  if (game.playerDice[currentPlayer] > 0) {
    game.playerDice[currentPlayer]--;
    game.totalDice--;
  }
}

function handleCandyCane(game: GameState, currentPlayer: PlayerId) {
  const nextPlayerIndex = (game.playerOrder.indexOf(currentPlayer) + 1) % game.playerOrder.length;
  const nextPlayer = game.playerOrder[nextPlayerIndex];
  
  const defenderRoll = rollDice(game.playerDice[nextPlayer]);
  const defenderCandyCanes = defenderRoll.filter(face => face === 'Candy Cane').length;
  
  if (defenderCandyCanes >= 1) {
    if (game.playerDice[currentPlayer] > 0) {
      game.playerDice[currentPlayer]--;
      game.playerDice[nextPlayer]++;
    }
  } else {
    if (game.playerDice[nextPlayer] > 0) {
      game.playerDice[nextPlayer]--;
      game.playerDice[currentPlayer]++;
    }
  }
}

function handleStar(game: GameState, currentPlayer: PlayerId) {
  if (game.playerDice[currentPlayer] > 0) {
    game.playerDice[currentPlayer]--;
    game.totalDice--;
  }
}

Rune.initLogic({
  minPlayers: 2,
  maxPlayers: 5,
  setup: (allPlayerIds): GameState => ({
    playerDice: Object.fromEntries(allPlayerIds.map(id => [id, 5])),
    totalDice: allPlayerIds.length * 5,
    turnCount: 0,
    currentPlayerIndex: 0,
    rollResult: [],
    gameOver: false,
    playerOrder: allPlayerIds,
  }),
  actions: {
    rollDice: (_, { game }) => {
      const currentPlayer = game.playerOrder[game.currentPlayerIndex];
      game.rollResult = rollDice(game.playerDice[currentPlayer]);
    },
    resolveDie: (index, { game }) => {
      const currentPlayer = game.playerOrder[game.currentPlayerIndex];
      const face = game.rollResult[index];

      switch (face) {
        case 'Present':
          handlePresent(game, currentPlayer);
          break;
        case 'Snowflake':
          handleSnowflake(game, currentPlayer);
          break;
        case 'Candy Cane':
          handleCandyCane(game, currentPlayer);
          break;
        case 'Star':
          handleStar(game, currentPlayer);
          break;
      }

      game.rollResult.splice(index, 1);
    },
    endTurn: (_, { game }) => {
      game.turnCount++;
      game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.playerOrder.length;
      game.rollResult = [];

      const activePlayers = game.playerOrder.filter(id => game.playerDice[id] > 0);
      if (activePlayers.length === 1) {
        game.gameOver = true;
        const winner = activePlayers[0];
        const players: Record<PlayerId, "WON" | "LOST"> = Object.fromEntries(
          game.playerOrder.map(id => [id, id === winner ? "WON" : "LOST"])
        );
        Rune.gameOver({ players });
      }
    },
  },
})