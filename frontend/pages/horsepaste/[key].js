import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import fetch from 'node-fetch'
import memoize from 'memoizee'

import Board from '../../components/Board'

import game from "../../styles/Game.module.css"

async function getHorsepasteState(key, stateId) {
    console.log('updated called', key, stateId)

    return await fetch(`/api/horsepaste-get-state?id=${key}&state_id=${stateId}`)
        .then(res => res.json())
}

const cachedGetHorsepasteState = memoize(getHorsepasteState, { maxAge: 999, promise: true })

export default function Horsepaste() {
    const router = useRouter()

    const { key } = router.query
    const playing = router.query.playing !== "false"

    const [state, setRawState] = useState({
        tiles: [],
        currentTeam: '',
    })
    const [stateId, setStateId] = useState('')

    function setIsPlaying(isPlaying) {
        router.push({
            pathname: '/horsepaste/[key]',
            query: {
                key,
                playing: isPlaying
            }
        })
    }

    function setState(newState) {
        if (stateId !== newState.stateId) {
            setStateId(newState.stateId)
            setRawState(newState)
        }
    }

    async function onNewGame() {
        return await fetch(`/api/horsepaste-new-game?id=${key}`)
            .then(res => res.json())
            .then(newState => setState(newState))
    }

    async function onEndTurn() {
        return await fetch(`/api/horsepaste-end-turn?id=${key}`)
            .then(res => res.json())
            .then(newState => setState(newState))
    }

    async function onTileClick(tile) {
        return await fetch(`/api/horsepaste-click-tile?id=${key}&index=${tile.index}`)
            .then(res => res.json())
            .then(newState => setState(newState))
    }

    const update = useCallback(async () => {
        setState(await cachedGetHorsepasteState(key, stateId))
    }, [key, stateId])

    useEffect(() => {
        update()
        const interval = setInterval(() => {
            update()
        }, 5000)

        return () => clearInterval(interval)
    }, [key, state])

    return (
        <div className={game.container}>
            <Board state={state} spymaster={!playing} setIsPlaying={setIsPlaying} onNewGame={onNewGame} onEndTurn={onEndTurn} onTileClick={onTileClick} />
        </div>
    )
}