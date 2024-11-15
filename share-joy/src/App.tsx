import React, { useEffect, useState } from 'react';
import { GameState, DiceFace } from './logic';
import './App.css';

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

  if (!gameState) {
    return <div>Loading...</div>;
  }

  const isYourTurn = gameState.playerOrder[gameState.currentPlayerIndex] === yourPlayerId;

  const rollDice = () => {
    if (isYourTurn) {
      Rune.actions.rollDice();
    }
  };

  const resolveDie = (index: number) => {
    if (isYourTurn) {
      Rune.actions.resolveDie(index);
    }
  };

  const endTurn = () => {
    if (isYourTurn) {
      Rune.actions.endTurn();
    }
  };

  const renderDie = (face: DiceFace, index: number) => (
    <button key={index} onClick={() => resolveDie(index)} className={`die ${face.toLowerCase()}`}>
      {face}
    </button>
  );

  const renderPlayerInfo = (playerId: string) => (
    <div key={playerId} className={`player-info ${playerId === yourPlayerId ? 'your-player' : ''}`}>
      <img src={Rune.getPlayerInfo(playerId).avatarUrl} alt="Player avatar" className="player-avatar" />
      <div>
        <div>{Rune.getPlayerInfo(playerId).displayName}</div>
        <div>{gameState.playerDice[playerId]} dice</div>
      </div>
    </div>
  );

  return (
    <div className="game-container">
      <div className="other-players">
        {gameState.playerOrder.filter(id => id !== yourPlayerId).map(renderPlayerInfo)}
      </div>
      <div className="game-info">
        <div>Turn: {gameState.turnCount}</div>
        <div>Total Dice: {gameState.totalDice}</div>
      </div>
      <div className="current-player">
        Current Turn: {Rune.getPlayerInfo(gameState.playerOrder[gameState.currentPlayerIndex]).displayName}
      </div>
      <div className="your-player-area">
        {yourPlayerId && renderPlayerInfo(yourPlayerId)}
        {isYourTurn && (
          <div className="action-buttons">
            <button onClick={rollDice} disabled={gameState.rollResult.length > 0}>Roll Dice</button>
            <button onClick={endTurn} disabled={gameState.rollResult.length > 0}>End Turn</button>
          </div>
        )}
      </div>
      {gameState.rollResult.length > 0 && (
        <div className="dice-result">
          <h3>Roll Result:</h3>
          <div className="dice-container">
            {gameState.rollResult.map((face, index) => renderDie(face, index))}
          </div>
        </div>
      )}
      {gameState.gameOver && <h2 className="game-over">Game Over!</h2>}
    </div>
  );
}

export default App;