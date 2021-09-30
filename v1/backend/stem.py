from nltk.stem import LancasterStemmer

lancaster = LancasterStemmer()


def stem(word):
    return lancaster.stem(word)
