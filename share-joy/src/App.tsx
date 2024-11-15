// import { useEffect, useState } from "react"
// import { PlayerId } from "rune-sdk"

// import selectSoundAudio from "./assets/select.wav"
// import { GameState } from "./logic.ts"

// const selectSound = new Audio(selectSoundAudio)

// function App() {
//   const [game, setGame] = useState<GameState>()
//   const [yourPlayerId, setYourPlayerId] = useState<PlayerId | undefined>()

//   useEffect(() => {
//     Rune.initClient({
//       onChange: ({ game, action, yourPlayerId }) => {
//         setGame(game)
//         setYourPlayerId(yourPlayerId)

//         if (action && action.name === "claimCell") selectSound.play()
//       },
//     })
//   }, [])

//   if (!game) {
//     // Rune only shows your game after an onChange() so no need for loading screen
//     return
//   }

//   const { winCombo, cells, lastMovePlayerId, playerIds, freeCells } = game

//   return (
//     <>
//       <div id="board" className={!lastMovePlayerId ? "initial" : ""}>
//         {cells.map((cell, cellIndex) => {
//           const cellValue = cells[cellIndex]

//           return (
//             <button
//               key={cellIndex}
//               onClick={() => Rune.actions.claimCell(cellIndex)}
//               data-player={(cellValue !== null
//                 ? playerIds.indexOf(cellValue)
//                 : -1
//               ).toString()}
//               data-dim={String(
//                 (winCombo && !winCombo.includes(cellIndex)) ||
//                   (!freeCells && !winCombo)
//               )}
//               {...(cells[cellIndex] ||
//               lastMovePlayerId === yourPlayerId ||
//               winCombo
//                 ? { "data-disabled": "" }
//                 : {})}
//             />
//           )
//         })}
//       </div>
//       <ul id="playersSection">
//         {playerIds.map((playerId, index) => {
//           const player = Rune.getPlayerInfo(playerId)

//           return (
//             <li
//               key={playerId}
//               data-player={index.toString()}
//               data-your-turn={String(
//                 playerIds[index] !== lastMovePlayerId && !winCombo && freeCells
//               )}
//             >
//               <img src={player.avatarUrl} />
//               <span>
//                 {player.displayName}
//                 {player.playerId === yourPlayerId && (
//                   <span>
//                     <br />
//                     (You)
//                   </span>
//                 )}
//               </span>
//             </li>
//           )
//         })}
//       </ul>
//     </>
//   )
// }

// export default App


import React, { useEffect, useState } from 'react';
import { GameState } from './logic';

function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [yourPlayerId, setYourPlayerId] = useState<string | null>(null);

  useEffect(() => {
    Rune.initClient({
      onChange: ({ newGame, yourPlayerId }) => {
        setGameState(newGame);
        setYourPlayerId(yourPlayerId);
      },
    });
  }, []);

  if (!gameState || !yourPlayerId) {
    return <div>Loading...</div>;
  }

  const isYourTurn = Object.keys(gameState.playerDice)[gameState.currentPlayerIndex] === yourPlayerId;

  const rollDice = () => {
    if (isYourTurn) {
      Rune.actions.rollDice();
    }
  };

  const endTurn = () => {
    if (isYourTurn) {
      Rune.actions.endTurn();
    }
  };

  return (
    <div>
      <h1>Winter Dice Game</h1>
      <div>Turn: {gameState.turnCount}</div>
      <div>Total Dice: {gameState.totalDice}</div>
      <h2>Players:</h2>
      {Object.entries(gameState.playerDice).map(([playerId, diceCount]) => (
        <div key={playerId}>
          {Rune.getPlayerInfo(playerId).displayName}: {diceCount} dice
          {playerId === yourPlayerId && " (You)"}
        </div>
      ))}
      <h2>Current Turn:</h2>
      <div>{Rune.getPlayerInfo(Object.keys(gameState.playerDice)[gameState.currentPlayerIndex]).displayName}</div>
      {isYourTurn && (
        <div>
          <button onClick={rollDice} disabled={Object.keys(gameState.rollResult).length > 0}>Roll Dice</button>
          <button onClick={endTurn} disabled={Object.keys(gameState.rollResult).length === 0}>End Turn</button>
        </div>
      )}
      {Object.keys(gameState.rollResult).length > 0 && (
        <div>
          <h3>Roll Result:</h3>
          {Object.entries(gameState.rollResult).map(([face, count]) => (
            <div key={face}>{face}: {count}</div>
          ))}
        </div>
      )}
      {gameState.gameOver && <h2>Game Over!</h2>}
    </div>
  );
}

export default App;