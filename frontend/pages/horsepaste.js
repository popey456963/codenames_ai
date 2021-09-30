import { useState } from "react";
import { useRouter } from 'next/router'

import common from '../styles/Common.module.css'
import Spacer from "react-spacer";

export default function HorsepasteMenu() {
    const [key, setKey] = useState(undefined)
    const [isPlaying, setIsPlaying] = useState(false)

    const router = useRouter()

    function goBack() {
        router.push('/')
    }

    function enterGame() {
        router.push({
            pathname: '/horsepaste/[key]',
            query: {
                key,
                playing: true
            }
        })
    }

    return (
        <div className={common.wrapper}>
            <header>
                <div onClick={goBack} className={common.close_button + " nes-pointer"}>
                    <i className="nes-icon close is-small"></i>
                </div>
            </header>
            <main className={common.page_main}>
                <div className={common.container}>
                    <div>
                        <div className="nes-field">
                            <label for="name_field">Horsepaste Key</label>
                            <input value={key} onChange={e => setKey(e.target.value)} type="text" id="name_field" className="nes-input" placeholder={"beautiful-elk"} />
                        </div>

                        <Spacer height="2rem" />

                        <label>
                            <input type="checkbox" className="nes-checkbox" checked={isPlaying} onChange={e => setIsPlaying(e.target.checked)} />
                            <span>Are you playing (hides answers)</span>
                        </label>
                    </div>

                    <Spacer height="3rem" />

                    <button type="button" className="nes-btn is-primary" onClick={enterGame}>Join Game</button>
                </div>
            </main>
            <footer className="page-footer">

            </footer>
        </div>
    )
}