import React, { useEffect, useState } from 'react'
import { GameState } from './logic'

const App: React.FC = () => {
  const [game, setGame] = useState<GameState | null>(null)
  const [yourPlayerId, setYourPlayerId] = useState<string | null>(null)

  useEffect(() => {
    Rune.initClient({
      onChange: ({ game, yourPlayerId: newYourPlayerId }) => {
        setGame(game)
        setYourPlayerId(newYourPlayerId ?? null)
      },
    })
  }, [])

  if (!game) {
    return <div className="text-center py-10">Loading...</div>
  }

  const currentPaper = game.papers.find(
    paper => paper.currentPlayerId === yourPlayerId
  )

  const handleSubmit = (content: string) => {
    if (!currentPaper) return
    const paperId = game.papers.indexOf(currentPaper)
    Rune.actions.submitContribution({ paperId, content })
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Telephone Pictionary</h1>
      
      {currentPaper ? (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl mb-2">Your Turn!</h2>
          {currentPaper.contributions.length % 2 === 0 ? (
            <CaptionInput 
              previousContent={
                currentPaper.contributions[currentPaper.contributions.length - 1]?.content
              }
              onSubmit={handleSubmit} 
            />
          ) : (
            <DrawingInput 
              previousContent={
                currentPaper.contributions[currentPaper.contributions.length - 1]?.content
              }
              onSubmit={handleSubmit} 
            />
          )}
        </div>
      ) : (
        <div className="text-center py-4">Waiting for other players...</div>
      )}

      <div className="mt-6">
        <h2 className="text-xl mb-2">Game Status</h2>
        <p>Contributions: {currentPaper?.contributions.length ?? 0} / {game.contributionsPerPlayer}</p>
        <p>Players: {game.playerOrder.length}</p>
      </div>
    </div>
  )
}

const CaptionInput: React.FC<{ 
  previousContent?: string, 
  onSubmit: (content: string) => void 
}> = ({ previousContent, onSubmit }) => {
  const [caption, setCaption] = useState('')

  return (
    <div>
      {previousContent && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Previous Drawing:</h3>
          <img src={previousContent} alt="Previous drawing" className="max-w-full h-auto" />
        </div>
      )}
      <input 
        type="text" 
        value={caption} 
        onChange={(e) => setCaption(e.target.value)}
        className="w-full p-2 border rounded mb-2"
        placeholder="Enter your caption"
      />
      <button 
        onClick={() => onSubmit(caption)}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Submit Caption
      </button>
    </div>
  )
}

const DrawingInput: React.FC<{ 
  previousContent?: string, 
  onSubmit: (content: string) => void 
}> = ({ previousContent, onSubmit }) => {
  // Implement drawing canvas
  const [drawing, setDrawing] = useState('')

  return (
    <div>
      {previousContent && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Caption to illustrate:</h3>
          <p className="italic">{previousContent}</p>
        </div>
      )}
      {/* Drawing canvas implementation goes here */}
      <button 
        onClick={() => onSubmit('mock-drawing-data')} // Replace with actual drawing data
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Submit Drawing
      </button>
    </div>
  )
}

export default App