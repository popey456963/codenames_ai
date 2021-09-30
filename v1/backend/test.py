from sim import pickBest, findWords

roles = {
    "triangle": (-1, False),
    "pupil": (-3, False),
    "frost": (1, False),
    "cane": (-1, False),
    "missile": (-3, False),

    "sound": (-3, False),
    "hercules": (-1, False),
    "crab": (-1, False),
    "field": (1, False),
    "africa": (-3, False),

    "sled": (-1, True),
    "disk": (-3, True),
    "ink": (1, True),
    "joker": (1, True),
    "wake": (-1, True),
    "state": (-1, False),
    "sherlock": (1, True),
    "viking": (1, True),
    "goat": (-3, True),
    "tablet": (-10, False),
    "rat": (1, True),
    "coach": (1, True),
    "skull": (1, False),
    "arm": (-1, True),
    "server": (-1, False),
}

pickBest(findWords(roles))
