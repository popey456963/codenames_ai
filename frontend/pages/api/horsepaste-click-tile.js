import fetch from 'node-fetch'
import format from '../../modules/format'

export default async function handler(req, res) {
    console.log("click card", req.query.id, req.query.index)

    const horsepaste = await fetch(`https://www.horsepaste.com/guess`, {
        method: "post",
        body: JSON.stringify({
            "game_id": req.query.id,
            "index": Number(req.query.index)
        })
    })

    const text = await horsepaste.text()
    let data

    try {
        data = JSON.parse(text)

        // const data = await horsepaste.json()
        const response = format(data)

        res.status(200).json(response)
    } catch (e) {
        console.log("error", text)

        throw e
    }
}