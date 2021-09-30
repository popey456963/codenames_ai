from typing import List
from fastapi import FastAPI
from pydantic import BaseModel

from sim import pickBest, findWords

app = FastAPI()


class Entry(BaseModel):
    word: str
    team: str
    picked: bool


class Board(BaseModel):
    board: List[Entry]
    team: str


@app.post('/api/v1/word')
async def pickWord(board: Board):
    roles = {}

    for entry in board.board:
        score = 0
        if board.team == entry.team:
            score = 1
        elif entry.team == 'civilian':
            score = -8
        elif entry.team == 'assassin':
            score = -20
        else:
            score = -8

        roles[entry.word.lower()] = (score, entry.picked)

    print(roles)

    print(len(roles.keys()))

    res = pickBest(findWords(roles))

    return res
