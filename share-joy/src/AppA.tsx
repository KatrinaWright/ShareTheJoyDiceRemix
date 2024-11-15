<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Winter Wonderland Dice Game</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div id="game-container">
        <div id="game-board">
            <div id="player-area-1" class="player-area">
                <div class="player-info">
                    <span class="player-name">Player 1</span>
                    <span class="dice-count">0</span>
                </div>
                <div class="dice-pool"></div>
            </div>
            <!-- Repeat for other players -->
        </div>
        
        <div id="control-panel">
            <button id="roll-dice">Roll Dice</button>
            <button id="end-turn">End Turn</button>
        </div>
        
        <div id="info-panel">
            <button id="toggle-instructions">Instructions</button>
            <div id="instructions-modal" class="hidden">
                <!-- Game instructions -->
            </div>
        </div>
    </div>
</body>
</html>