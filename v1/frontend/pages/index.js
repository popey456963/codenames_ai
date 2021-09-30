import { useEffect, useState } from 'react'
import update from 'immutability-helper'
import axios from 'axios'

const RED = 'red'
const BLUE = 'blue'
const ASSASSIN = 'assassin'
const CIVILIAN = 'civilian'

const getSuggestion = async (board) => {
  const res = await fetch('/api/v1/word', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(board)
  }).then(res => res.json())

  return res
}

const getBoardStateFromHorsepaste = async (horsepasteCode, state_id) => {
  return await fetch(`/api/horsepaste?id=${horsepasteCode}&start_id=${state_id || ''}`)
    .then(res => res.json())
}

const horsePasteEndTurn = async (horsepasteCode) => {
  return await fetch(`/api/horsepaste-end-turn?id=${horsepasteCode}`)
    .then(res => res.json())
}

const horsePasteClickTile = async (horsepasteCode, index) => {
  return await fetch(`/api/horsepaste-click-tile?id=${horsepasteCode}&index=${index}`)
    .then(res => res.json())
}

const horsePasteNewGame = async (horsepasteCode) => {
  return await fetch(`/api/horsepaste-new-game?id=${horsepasteCode}`)
    .then(res => res.json())
}

export default function Home() {
  const [isControllerPlaying, setIsControllerPlaying] = useState(true)
  const [horsepasteCode, setHorsepasteCode] = useState('')
  const [board, setBoard] = useState({
    currentTeam: RED,
    tiles: Array(25).fill('').map(tile => ({ word: '', team: CIVILIAN, picked: false })),
    stateId: ''
  })
  const [guesses, setGuesses] = useState([])

  const setValue = (index, item) => {
    setData(update(data, { [index]: { $merge: item } }))
  }

  const updateLocalState = async () => {
    setBoard(await getBoardStateFromHorsepaste(horsepasteCode))
  }

  const resetBoard = async () => {
    setBoard({
      currentTeam: RED,
      tiles: Array(25).fill('').map(tile => ({
        word: '', team: CIVILIAN, picked: false
      })),
      stateId: ''
    })
  }

  const tileClick = async (tile, index) => {
    if (tile.picked) return

    setBoard(await horsePasteClickTile(horsepasteCode, index))
  }

  const endTurn = async () => {
    setBoard(await horsePasteEndTurn(horsepasteCode))
  }

  const newGame = async () => {
    setBoard(await horsePasteNewGame(horsepasteCode))
  }

  const getGuess = async () => {
    const guess = await getSuggestion(board)
    setGuesses([...guesses, guess])
  }

  useEffect(() => {
    const update = async () => {
      const data = await getBoardStateFromHorsepaste(horsepasteCode, board.stateId)
      setBoard(data)
    }

    let interval = setInterval(update, 1000)

    return () => clearInterval(interval)
  }, [horsepasteCode])

  return (
    <div id="game-view">
      <h2>Stage One</h2>
      <p>Fetch state from a horsepaste code (e.g. beautiful-elk)</p>
      <input
        placeholder="horsepaste code"
        value={horsepasteCode}
        onChange={e => setHorsepasteCode(e.target.value)}
      />
      <button onClick={() => updateLocalState()}>Fetch State</button>
      <p>After you click the 'fetch state' button, we'll constantly poll for changes until you make a change to the board / start a new blank board.</p>
      <p><b>or</b></p>
      <p>Start with a blank board</p>
      <button onClick={() => resetBoard()}>Blank Board</button>
      <hr />
      <h2>Stage Two</h2>
      <p>Play!</p>
      <p>You can select / deselect a word by left-clicking it.  You can change it's type by right clicking it.  You can quickly change the type of a card by hovering over it and hitting [<b>a</b>: assassin] [<b>c</b>: civilian] [<b>r</b>: red] [<b>b</b>: blue]</p>
      <div id="game-view" className={`${isControllerPlaying ? 'player' : 'codemaster'} color-blind`}>
        <div id="status-line" className={board.currentTeam === 'red' ? "red-turn" : 'blue-turn'}>
          <div id="remaining">
            {console.log(board.tiles)}
            <span className="red-remaining">{String(board.tiles.filter(tile => !tile.picked && tile.team === RED).length)}</span>
            &nbsp;-&nbsp;
            <span className="blue-remaining">{String(board.tiles.filter(tile => !tile.picked && tile.team === BLUE).length)}</span>
          </div>
          <div id="status" className="status-text">{board.currentTeam}'s turn</div>
          <div id="end-turn-cont"><button id="end-turn-btn" onClick={() => endTurn()}>End {board.currentTeam}'s turn</button></div>
        </div>
        <div className="board red-turn">
          {
            board.tiles.map((tile, index) => <div onClick={() => tileClick(tile, index)} className={`cell ${tile.team} ${tile.picked ? 'revealed' : 'hidden-word'}`}>
              <span className="word">{tile.word.toUpperCase()}</span>
            </div>)
          }
        </div>
        <div id="mode-toggle" className={isControllerPlaying ? "player-selected" : "codemaster-selected"}>
          <button className="player" onClick={() => setIsControllerPlaying(true)}>Player</button>
          <button className="codemaster" onClick={() => setIsControllerPlaying(false)}>Spymaster</button>
          <button id="next-game-btn" onClick={() => newGame()}>Next game</button>
        </div>
        <button onClick={() => getGuess()}>Suggest Words</button>
        {
          !isControllerPlaying && guesses.length && guesses[guesses.length - 1].map(item => {
            return <p>{parseInt(item.score * 1000) / 10} <b>{item.word} {item.expected.length}</b>: {
              item.expected.map((expected, i) => [
                i > 0 && ", ",
                <span>{expected.word} ({parseInt(expected.score * 1000) / 10}%)</span>
              ])
            }</p>
          })
        }
        {
          isControllerPlaying && guesses.length && <p>
            {guesses[guesses.length - 1][0].word} {guesses[guesses.length - 1][0].expected.length}
          </p>
        }
      </div>
      <div style={{ paddingBottom: '10rem' }} />
    </div >
  )

  return (
    <div>
      <div>
        <input placeholder="horsepaste code" value={horsepaste} onChange={e => setHorsepaste(e.target.value)} />
        <button onClick={() => getState()}>Fetch State</button>

        <p>
          I am on team:
          <input type="radio" style={{ outline: '3px solid red' }} name={'team'} value='red' checked={team === 'red'} onChange={() => setTeam('red')} />
          <input type="radio" name={'team'} style={{ outline: '3px solid blue' }} value='blue' checked={team === 'blue'} onChange={() => setTeam('blue')} />
        </p>
        <button onClick={() => setHideState(!hideState)}>Show / Hide Board State & Answers</button>
        {!hideState && <table>
          {
            Array(5).fill('').map((_, index) =>
              <tr>
                {
                  Array(5).fill('').map((_, jndex) => {
                    const i = index * 5 + jndex
                    return <td>
                      <input type='text' value={data[i].word} onChange={(e) => setValue(i, { word: e.target.value })} />
                      <input tabindex="-1" type='checkbox' checked={data[i].picked} onChange={() => setValue(i, { picked: !data[i].picked })} />
                      <br />
                      <input tabindex="-1" type="radio" name={i + '-type'} style={{ outline: '3px solid red' }} value='red' checked={data[i].team === 'red'} onChange={() => setValue(i, { team: 'red' })} />
                      <input tabindex="-1" type="radio" name={i + '-type'} style={{ outline: '3px solid blue' }} value='blue' checked={data[i].team === 'blue'} onChange={() => setValue(i, { team: 'blue' })} />
                      <input tabindex="-1" type="radio" name={i + '-type'} style={{ outline: '3px solid brown' }} value='civilian' checked={data[i].team === 'civilian'} onChange={() => setValue(i, { team: 'civilian' })} />
                      <input tabindex="-1" type="radio" name={i + '-type'} style={{ outline: '3px solid black' }} value='assassin' checked={data[i].team === 'assassin'} onChange={() => setValue(i, { team: 'assassin' })} />
                    </td>
                  }
                  )
                }
                <br />
              </tr>
            )
          }
        </table>}
        <button onClick={() => suggestWord()}>Suggest Word</button>

        <br />
        <p>
          <b>Word: </b><span>{expected.word}</span>
          <br />
          <b>Count: </b><span>{expected.count}</span>
          <br />
          {!hideState && <><b>Answers: </b><span>{expected.expected.map(item => `${item[2]}: ${parseInt(item[1] * 1000) / 10}%`).join(', ')}</span></>}
        </p>
        <br />
        <b>History</b><br />
        {!hideState && <p>
          {
            history.map(item => {
              return <p>{item.word} ({item.team} - {item.count}): {
                item.expected.map((expected, i) => [
                  i > 0 && ", ",
                  <span>{expected[2]} ({parseInt(expected[1] * 1000) / 10}%)</span>
                ])
              }</p>
            })
          }
        </p>}
      </div>
    </div>
  )
}
