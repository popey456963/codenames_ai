import { chunk } from 'lodash'
import { useRouter } from 'next/router'
import { useState } from 'react'
import Spacer from 'react-spacer'

import common from '../styles/Common.module.css'
import game from '../styles/Game.module.css'

import ContainerList from './ContainerList'

import { toTitleCase } from '../modules/utils'
import { TEAM_COLORS } from '../modules/constants'

function countRemaining(tiles, team) {
    return tiles.filter(tile => tile.team === team && !tile.picked).length
}

const getSuggestion = async (board) => {
    const res = await fetch('/api/v1/word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(board)
    }).then(res => res.json())

    return res
}

function Suggestion({ suggestion, spymaster, onClick = () => { } }) {
    return (
        <li>
            {suggestion.score.toFixed(2)}

            <span onClick={onClick} style={{ color: suggestion.team === 'blue' ? '#209cee' : '#e76e55' }}>
                {" "}
                {toTitleCase(suggestion.word)}
                {` (${suggestion.expected.length})${spymaster ? ": " : ""}`}
            </span>

            {spymaster && suggestion.expected.map(expected => `${expected.word} [${Math.round(expected.score.toFixed(2) * 100)}%]`).join(", ")}
        </li>
    )
}

function Tile({ tile, spymaster, onClick, onType }) {
    const onTileClick = function () { onClick(tile) }
    const onTileType = function (event) { onType(tile, event) }

    const roleVisible = tile.picked || spymaster
    const isSelectable = !tile.picked
    const isCrossedOut = tile.picked

    const text = `${roleVisible && tile.team === "assassin" ? "💀 " : ""}${toTitleCase(tile.word)}`

    let inputClasses = ['nes-input']

    switch (tile.team) {
        case 'assassin': inputClasses.push('is-dark'); break
        case 'red': inputClasses.push('is-error'); break
        case 'blue': inputClasses.push('is-success'); break
        case 'civilian': inputClasses.push('is-warning'); break
        default: inputClasses.push('asd'); break
    }

    return (
        <td
            onClick={isSelectable && onTileClick}
            style={{
                color: roleVisible && TEAM_COLORS[tile.team],
                textDecoration: isCrossedOut && "line-through",
                textDecorationThickness: isCrossedOut && "2px"
            }}
        >
            <input style={{ padding: '0rem 0rem' }} className={inputClasses.join(' ')} value={text} onChange={onTileType} />
        </td>
    )
}

function Header({ remainingBlue, remainingRed, currentTeam }) {
    return (
        <div className={game.flex_container}>
            <a href="#" className="nes-badge">
                <span className="is-primary">{remainingBlue}</span>
            </a>

            <a href="#" className="nes-badge" style={{ width: "15em" }}>
                <span className="is-dark">{currentTeam}&apos;s turn</span>
            </a>

            <a href="#" className="nes-badge">
                <span className="is-error">{remainingRed}</span>
            </a>
        </div>
    )
}

export default function Board({ state, team, spymaster = true, onType, setTeam, onClearBoard, onSwitchTeam, onTileClick }) {
    const { tiles, currentTeam } = state
    const router = useRouter()

    const remainingRed = countRemaining(tiles, 'red')
    const remainingBlue = countRemaining(tiles, 'blue')

    const [suggestions, setSuggestions] = useState([])
    const [suggestionsTeam, setSuggestionsTeam] = useState('blue')
    const [historicalClues, setHistoricalClues] = useState([])
    const [error, setError] = useState(undefined)

    function goBack() {
        router.push('/')
    }

    async function computeWord() {
        const saveCurrentTeam = currentTeam

        const newSuggestions = await getSuggestion(state)

        if (newSuggestions.error) {
            setError(newSuggestions)
        } else {
            setError(undefined)
            setSuggestionsTeam(saveCurrentTeam)
            setSuggestions(newSuggestions)
        }
    }


    return (
        <div className={common.wrapper}>
            <header>
                <div onClick={goBack} className={common.close_button + " nes-pointer"}>
                    <i className="nes-icon close is-small"></i>
                </div>
            </header>
            <main className={common.page_main}>
                {error && <p class="nes-balloon from-left" style={{ width: "100%" }}>
                    Error Concepts Not Found: {error.concepts.map(word => word.word).join(', ')}.  Please pick a new grid of words, or use a larger dataset (if available)
                </p>}
                <div className={game.page}>
                    <Header remainingRed={remainingRed} remainingBlue={remainingBlue} currentTeam={currentTeam} />

                    <Spacer height="1rem" />

                    <div style={{ width: "100%" }}>
                        <div className="nes-table-responsive">
                            <table className={"nes-table is-bordered is-centered " + game.full_table}>
                                <tbody>
                                    {chunk(tiles, 5).map((chunk, row) =>
                                        <tr key={row}>{
                                            chunk.map((tile, index) => <Tile key={index + row * 5} tile={Object.assign(tile, { index: index + row * 5 })} spymaster={spymaster} onClick={onTileClick} onType={onType} />)
                                        }</tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <Spacer height="0.5rem" />

                <div className={game.flex_container}>
                    <span className="nes-text is-error nes-pointer" onClick={onClearBoard}>Clear Board</span>

                    <span className="nes-text is-primary nes-pointer" onClick={onSwitchTeam}>Switch Team</span>
                </div>

                <Spacer height="0.5rem" />

                <hr />

                <b>Paint Tile Type</b>

                <Spacer height="0.5rem" />

                <div className={game.flex_container}>
                    <a onClick={() => setTeam('assassin')} class="nes-badge">
                        <span class={`is-dark ${team === 'assassin' ? 'is-white-selected' : ''}`}>Assassin</span>
                    </a>
                    <a onClick={() => setTeam('blue')} class="nes-badge">
                        <span class={`is-primary ${team === 'blue' ? 'is-selected' : ''}`}>Blue</span>
                    </a>
                    <a onClick={() => setTeam('civilian')} class="nes-badge">
                        <span class={`is-warning ${team === 'civilian' ? 'is-selected' : ''}`}>Civilian</span>
                    </a>
                    <a onClick={() => setTeam('red')} class="nes-badge">
                        <span class={`is-error ${team === 'red' ? 'is-selected' : ''}`}>Red</span>
                    </a>
                    <a onClick={() => setTeam(undefined)} class="nes-badge">
                        <span>None</span>
                    </a>
                </div>

                <Spacer height="0.5rem" />

                <hr />

                <Spacer height="2rem" />

                {!!suggestions.length && <>
                    <ContainerList title="Suggestions">{
                        (spymaster ? suggestions : [suggestions[0]]).map((suggestion, index) =>
                            <Suggestion
                                key={index}
                                suggestion={Object.assign({}, suggestion, { team: suggestionsTeam })}
                                spymaster={spymaster}
                                onClick={() => setHistoricalClues([Object.assign({}, suggestion, { team: suggestionsTeam }), ...historicalClues])}
                            />
                        )
                    }</ContainerList>

                    <Spacer height="2rem" />
                </>}

                {!!historicalClues.length && <>
                    <ContainerList title="Historical Clues">{
                        historicalClues.map((suggestion, index) =>
                            <Suggestion
                                key={index}
                                suggestion={suggestion}
                                spymaster={spymaster}
                            />
                        )
                    }</ContainerList>

                    <Spacer height="2rem" />
                </>}

                {/* <Spacer height="2rem" />

                <label for="dataset">Vector Dataset</label>
                <div className="nes-select" style={{ maxWidth: "450px" }}>
                    <select required id="dataset">
                        <option value="glove.6B.50d.txt" selected>GloVe 6B 50D (Fastest)</option>
                        <option value="glove.6B.100d.txt">GloVe 6B 100D</option>
                        <option value="glove.6B.200d.txt">GloVe 6B 200D</option>
                        <option value="glove.6B.300d.txt">GloVe 6B 300D (Best)</option>
                    </select>
                </div>

                <Spacer height="1rem" />

                <label for="dataset">Prioritisation Method</label>
                <div className="nes-select" style={{ maxWidth: "450px" }}>
                    <select required id="dataset">
                        <option value="glove.6B.50d.txt" selected>Optimistic A (Best)</option>
                        <option value="glove.6B.100d.txt">Conservative A</option>
                        <option value="glove.6B.200d.txt">Conservative B</option>
                        <option value="glove.6B.300d.txt">Overall A</option>
                    </select>
                </div> */}

                <Spacer height="2rem" />

                <a className="nes-btn" onClick={computeWord}>Compute Word</a>
            </main>
        </div >
    )
}