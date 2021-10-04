import fetch from 'node-fetch'
import format from '../../modules/format'

export default async function handler(req, res) {
    console.log("get state", req.query.id, req.query.state_id || '(no state id)')

    // console.log('making game state request', req.query.id, req.query.state_id)

    const horsepaste = await fetch(`https://www.horsepaste.com/game-state`, {
        method: "post",
        body: JSON.stringify({
            "game_id": req.query.id,
            "state_id": req.query.state_id || ""
        })
    })

    const data = await horsepaste.json()
    const response = format(data)

    res.status(200).json(response)
}