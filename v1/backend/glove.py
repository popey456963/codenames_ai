import time

from cached import cached


@cached('cache/gloves.pickle')
def get_gloves():
    return {row[0]: (np.array([float(val) for val in row[1:]])) for row in (
        [line.split() for line in open('data/glove.6B.300d.txt').read().strip().split("\n")])}


@cached('cache/mags.pickle')
def get_mags(gloves):
    return {word: np.sqrt(np.dot(vec, vec)) for (word, vec) in gloves.items()}


def get_vectors():
    beginVectors = time.time()

    gloves = get_gloves()
    mags = get_mags(gloves)

    print(mags["test"])

    print("took", str(round(time.time() - beginVectors, 1)), "seconds to start up")

    return (gloves, mags)
