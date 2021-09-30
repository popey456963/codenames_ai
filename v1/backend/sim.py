import time

import numpy as np

from glove import get_vectors
from stem import stem
from decorator import conditional_decorator

(gloves, mags) = get_vectors()

is_profiling = 'profile' in globals()
if not is_profiling:
    def profile():
        pass


@conditional_decorator(profile, is_profiling)
def vectorSimilarity(word1, word2):
    if word1 not in gloves or word2 not in gloves:
        return 0

    vec1 = gloves[word1]
    vec2 = gloves[word2]

    num = np.dot(vec1, vec2)
    denom = mags[word1] * mags[word2]

    return num / denom


def cut(similarityScore):
    return 0 if abs(similarityScore) < 0.2 else similarityScore


@conditional_decorator(profile, is_profiling)
def scoreWord(word1, roles, unrevealed):
    wordscores = [(role, cut(vectorSimilarity(word1, word2)), word2)
                  for word2, (role, revealed) in unrevealed]
    sorted_scores = sorted(wordscores, key=lambda x: x[1], reverse=True)

    if sorted_scores[0][0] < 0:
        return None

    for x in range(len(wordscores)):
        if (sorted_scores[x][0] < 0 or sorted_scores[x][1] == 0) and x > 0:
            return sorted_scores[:x]

    return None


@conditional_decorator(profile, is_profiling)
def findWords(roles):
    # for each number, returns the best list of words of that length
    start = time.time()
    bests = {}
    bestScores = [0] * 25

    stems = [stem(word) for word in roles.keys()]
    unrevealed = [[word2, (role, revealed)]
                  for word2, (role, revealed) in roles.items() if not revealed]

    for word1 in gloves.keys():
        exp = scoreWord(word1, roles, unrevealed)

        if not exp:
            continue

        count = len(exp)
        score = sum([x[1] for x in exp])
        if score > bestScores[count] and stem(word1) not in stems:
            bestScores[count] = score
            bests[count] = (word1, bestScores[count], exp)
    print("took", str(round(time.time() - start, 1)), "seconds to find words")
    print(bests)

    return bests


def pickBest(bests):
    # picks the best length of list
    # bests cannot be empty
    bestScore = 0
    bestList = []

    for wordList in bests.items():
        if wordList[1][1] > bestScore:
            bestScore = wordList[1][1]
            bestList = wordList

    print(bestList[1][0], bestList[0])

    return {
        'word': bestList[1][0],
        'count': bestList[0],
        'expected': bestList[1][2]
    }
