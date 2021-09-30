import fetch from 'node-fetch'
import format from '../../modules/format'

export default async (req, res) => {
    const horsepaste = await fetch(`https://www.horsepaste.com/guess`, {
        method: "post",
        body: JSON.stringify({
            "game_id": req.query.id,
            "index": Number(req.query.index)
        })
    })

    const data = await horsepaste.json()
    const response = format(data)

    res.status(200).json(response)
}