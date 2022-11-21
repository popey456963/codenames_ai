import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import fetch from 'node-fetch'
import memoize from 'memoizee'

import ManualBoard from '../components/ManualBoard'

import game from "../styles/Game.module.css"
import Head from 'next/head'

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
        tiles: new Array(25).fill(1).map((item, index) => ({
            picked: false,
            team: 'civilian',
            word: '',
            index
        })),
        currentTeam: 'red',
    })
    const [stateId, setStateId] = useState('')
    const [team, setTeam] = useState('civilian')

    function setIsPlaying(isPlaying) {
        router.push({
            pathname: '/manual',
            query: {
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

    async function onClearBoard() {
        setRawState({
            tiles: new Array(25).fill(1).map((item, index) => ({
                picked: false,
                team: 'civilian',
                word: '',
                index
            })),
            currentTeam: 'red',
        })
    }

    async function onSwitchTeam() {
        setRawState((state) => ({
            ...state,
            currentTeam: state.currentTeam === 'red' ? 'blue' : 'red',
        }))
    }

    async function onType(tile, event) {
        setRawState(state => {
            const newTiles = [...state.tiles]
            newTiles[tile.index].word = event.target.value

            return {
                ...state,
                tiles: newTiles
            }

        })
    }

    async function onTileClick(tile) {
        if (!team) return
        setRawState(state => {
            const newTiles = [...state.tiles]
            newTiles[tile.index].team = team

            return {
                ...state,
                tiles: newTiles
            }

        })
    }

    return (
        <div className={game.container}>
            <Head>
                <title>Codenames AI</title>
            </Head>
            <ManualBoard onType={onType} team={team} state={state} setTeam={setTeam} spymaster={true} onClearBoard={onClearBoard} onSwitchTeam={onSwitchTeam} onTileClick={onTileClick} />
        </div>
    )
}