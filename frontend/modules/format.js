export default function format(data) {
    const formatted = data.words.map((word, index) => ({
        word: word.toLowerCase(),
        team: data.layout[index] === 'neutral' ? 'civilian' :
            data.layout[index] === 'black' ? 'assassin' : data.layout[index],
        picked: data.revealed[index]
    }))

    // console.log(data.revealed)

    let team
    let starting_team = data.round % 2 === 0
    if (starting_team) team = data.starting_team
    else {
        if (data.starting_team === 'red') team = 'blue'
        if (data.starting_team === 'blue') team = 'red'
    }

    const response = {
        tiles: formatted,
        currentTeam: team,
        stateId: data.state_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at
    }

    return response
}