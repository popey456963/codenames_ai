import Head from 'next/head'
import Image from 'next/image'
import Spacer from 'react-spacer'
import { useRouter } from 'next/router'

import styles from '../styles/Home.module.css'

export default function Home() {
  const router = useRouter()

  function startHorsepasteGame() {
    router.push('/horsepaste')
  }

  function startManualGame() {
    router.push('/manual')
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Codenames AI</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Codenames AI
        </h1>

        <p>An AI to predict good codenames clues!</p>

        <Spacer height='2rem' />

        <section className="nes-container with-title">
          <h3 className="title">Description</h3>

          <p>
            We use GloVe (Global Vectors for Word Representations), a way of converting a word / concept into a vector.  By comparing these vectors we can compute clues to give in codewords.
          </p>

          <p>
            Try it out by providing a <a href="https://www.horsepaste.com/" rel="noreferrer" target="_blank">Horsepaste</a> key or by entering in the words and types manually.
          </p>

          <p>

          </p>
        </section>

        <Spacer grow='1' />

        <button type="button" className="nes-btn is-primary" onClick={startHorsepasteGame}>Join Horsepaste Game</button>
        <Spacer height='2rem' />
        <button type="button" className="nes-btn" onClick={startManualGame}>Enter Tiles Manually</button>
      </main>
    </div >
  )
}
