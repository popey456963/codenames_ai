<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![Chat][chat-shield]][chat-url]
[![MIT License][license-shield]][license-url]

<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://github.com/popey456963/codenames_ai">
    <img src="frontend/public/logo.jpg" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Codenames AI</h3>

  <p align="center">
    Automatically generate codenames clues for a given board
    <br />
    <br />
    <b><a href="https://codenames.femto.dev">View Demo</a></b>
    ·
    <a href="https://github.com/popey456963/codenames_ai/issues">Report Bug</a>
    ·
    <a href="https://github.com/popey456963/codenames_ai/issues">Request Feature</a>
  </p>
</p>

<!-- TABLE OF CONTENTS -->

## Table of Contents

- [About the Project](#about-the-project)
  - [Built With](#built-with)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
- [Acknowledgements](#acknowledgements)

<!-- ABOUT THE PROJECT -->

## About The Project

[![Codenames Screenshot][product-screenshot]](https://codenames.femto.dev)

We use GloVe (Global Vectors for Word Representations), a way of converting a word / concept into a vector. By comparing these vectors we can compute clues to give in codewords.

### Built With

- [Rust](https://www.rust-lang.org/)
- [NextJS](https://nextjs.org/)

<!-- GETTING STARTED -->

## Getting Started

1. Install [Rust Nightly](https://www.rust-lang.org/) and [NodeJS](https://nodejs.org/en/).

2. Clone this repository:

```sh
git clone https://github.com/popey456963/codenames_ai
```

3. Download some word vectors:

```sh
mkdir data && cd data

# Quick, easy to setup, bad results:
wget https://nlp.stanford.edu/data/glove.6B.zip && unzip glove.6B.zip

# Slow, good results:
wget https://nlp.stanford.edu/data/glove.840B.300d.zip && unzip glove.840B.300d.zip

# We need a better way to do this, but alter backend/src/main.rs lines 33-35 so that they're accurate:
static FILE: &str = "../data/glove.840B.300d.txt";
const WORDS: usize = 2196017;
const DIMENSIONS: usize = 300;
# you can grab the number of words by doing `cat glove.xxx.xxx.txt | wc -l`
# dimensions are usually included in the file name, suffixed with a 'd'
```

4. Setup the server:

```sh
cd backend
# always use release, debug is too slow!
cargo run --release
```

5. Setup the frontend:

```sh
cd frontend
npm i
npm run dev
```

6. The site should be running on http://localhost:3000

<!-- ROADMAP -->

## Roadmap

See the [open issues](https://github.com/popey456963/codenames_ai/issues) for a list of proposed features (and known issues).

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE` for more information.

<!-- ACKNOWLEDGEMENTS -->

## Acknowledgements

- [Img Shields](https://shields.io)
- [Choose an Open Source License](https://choosealicense.com)

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/popey456963/codenames_ai.svg?style=flat-square
[contributors-url]: https://github.com/popey456963/codenames_ai/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/popey456963/codenames_ai.svg?style=flat-square
[forks-url]: https://github.com/popey456963/codenames_ai/network/members
[chat-shield]: https://img.shields.io/discord/493418312714289158?style=flat-square
[chat-url]: https://femto.pw/discord
[stars-shield]: https://img.shields.io/github/stars/popey456963/codenames_ai.svg?style=flat-square
[stars-url]: https://github.com/popey456963/codenames_ai/stargazers
[issues-shield]: https://img.shields.io/github/issues/popey456963/codenames_ai.svg?style=flat-square
[issues-url]: https://github.com/popey456963/codenames_ai/issues
[license-shield]: https://img.shields.io/github/license/popey456963/codenames_ai.svg?style=flat-square
[license-url]: https://github.com/popey456963/codenames_ai/blob/master/LICENSE.txt
[product-screenshot]: frontend/public/screenshot.png
