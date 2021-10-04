import fetch from 'node-fetch'
import format from '../../modules/format'

export default async (req, res) => {
    console.log("end turn", req.query.id)


    const horsepaste = await fetch(`https://www.horsepaste.com/end-turn`, {
        method: "post",
        body: JSON.stringify({
            "game_id": req.query.id,
        })
    })

    const data = await horsepaste.json()
    const response = format(data)

    res.status(200).json(response)
}