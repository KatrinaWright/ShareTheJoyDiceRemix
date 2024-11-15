import type { PlayerId, RuneClient } from "rune-sdk"

interface Contribution {
  type: "drawing" | "caption"
  content: string
  playerId: PlayerId
}

interface Paper {
  contributions: Contribution[]
  currentPlayerId: PlayerId | null
  startPlayerId: PlayerId
}

interface GameState {
  papers: Paper[]
  playerOrder: PlayerId[]
  contributionsPerPlayer: number
}

type GameActions = {
  submitContribution: (params: { paperId: number; content: string }) => void
}

declare global {
  const Rune: RuneClient<GameState, GameActions>
}

function isGameOver(game: GameState): boolean {
  return game.papers.every(
    paper => paper.contributions.length === game.contributionsPerPlayer
  )
}

function getNextPlayer(
  currentPlayerId: PlayerId, 
  playerOrder: PlayerId[]
): PlayerId {
  const currentIndex = playerOrder.indexOf(currentPlayerId)
  return playerOrder[(currentIndex + 1) % playerOrder.length]
}

Rune.initLogic({
  minPlayers: 3,
  maxPlayers: 6,
  setup: (allPlayerIds) => {
    const playerOrder = [...allPlayerIds]
    const contributionsPerPlayer = playerOrder.length * 2
    const papers = allPlayerIds.map((startPlayerId) => ({
      contributions: [],
      currentPlayerId: startPlayerId, // Start with a caption from the paper owner
      startPlayerId
    }))

    return {
      papers,
      playerOrder,
      contributionsPerPlayer
    }
  },
  actions: {
    submitContribution: ({ paperId, content }, { game, playerId }) => {
      const paper = game.papers[paperId]
      
      if (paper.currentPlayerId !== playerId) {
        throw Rune.invalidAction()
      }

      const contributionType = 
        paper.contributions.length % 2 === 0 ? "caption" : "drawing"

      paper.contributions.push({
        type: contributionType,
        content,
        playerId
      })

      paper.currentPlayerId = getNextPlayer(playerId, game.playerOrder)

      if (isGameOver(game)) {
        Rune.gameOver({ 
          players: Object.fromEntries(
            game.playerOrder.map(id => [id, "WON"])
          )
        })
      }
    }
  },
  events: {
    playerJoined: (playerId, { game }) => {
      const totalContributions = game.papers.reduce(
        (sum, paper) => sum + paper.contributions.length, 
        0
      )
      if (totalContributions > game.playerOrder.length) {
        return // Player becomes spectator
      }

      game.playerOrder.push(playerId)
      game.contributionsPerPlayer = game.playerOrder.length * 2
      
      game.papers.push({
        contributions: [],
        currentPlayerId: playerId,
        startPlayerId: playerId
      })
    },
    playerLeft: (playerId, { game }) => {
      const playerIndex = game.playerOrder.indexOf(playerId)
      if (playerIndex === -1) return

      game.playerOrder.splice(playerIndex, 1)
      game.papers = game.papers.filter(paper => paper.startPlayerId !== playerId)
      game.contributionsPerPlayer = game.playerOrder.length * 2

      game.papers.forEach(paper => {
        if (paper.currentPlayerId === playerId) {
          paper.currentPlayerId = getNextPlayer(paper.startPlayerId, game.playerOrder)
        }
      })

      if (game.playerOrder.length < 3) {
        Rune.gameOver({ 
          players: Object.fromEntries(
            game.playerOrder.map(id => [id, "LOST"])
          )
        })
      }
    }
  }
})