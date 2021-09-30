import fetch from 'node-fetch'
import format from '../../modules/format'

export default async (req, res) => {
    const horsepaste = await fetch(`https://www.horsepaste.com/next-game`, {
        method: "post",
        body: JSON.stringify({
            "game_id": req.query.id,
            "create_new": true
        })
    })

    const data = await horsepaste.json()
    const response = format(data)

    res.status(200).json(response)
}