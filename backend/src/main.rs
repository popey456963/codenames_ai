#![feature(proc_macro_hygiene, decl_macro)]
#[macro_use]
extern crate rocket;
#[macro_use]
extern crate lazy_static;

use bincode;
use hashbrown::HashMap;
use rayon::prelude::*;
use rocket_contrib::{
    json,
    json::{Json, JsonValue},
};
use rust_stemmers::{Algorithm, Stemmer};
use serde::{Deserialize, Serialize};
use std::fs::{File, OpenOptions};
use std::io::{prelude::*, BufReader, BufWriter};
use std::sync::{Arc};
use std::time::Instant;

use packed_simd::f32x16;

// large dataset, requires ~7 seconds to ingest
// static FILE: &str = "../data/glove.6B.300d.txt";
// const WORDS: usize = 400000;
// const DIMENSIONS: usize = 300;

// small dataset, requires ~1.4 seconds to ingest
// static FILE: &str = "../data/glove.6B.50d.txt";
// const WORDS: usize = 400000;
// const DIMENSIONS: usize = 50;

static FILE: &str = "../data/glove.840B.300d.txt";
const WORDS: usize = 2196017;
const DIMENSIONS: usize = 300;

#[derive(Deserialize, Debug, PartialEq, Clone, Copy)]
#[serde(rename_all = "snake_case")]
enum Team {
    Civilian,
    Assassin,
    Red,
    Blue,
}

#[derive(Deserialize, Debug, Clone)]
struct Tile {
    word: String,
    team: Team,
    picked: bool,
}

#[derive(Deserialize, Debug)]
struct Board {
    tiles: Vec<Tile>,
    #[serde(alias = "currentTeam")]
    current_team: Team,
}

type Gloves = HashMap<String, Vec<f32>>;
type Magnitudes = HashMap<String, f32>;
type Stems = HashMap<String, String>;

#[derive(PartialEq, Debug, Serialize, Deserialize)]
struct Vectors {
    gloves: Gloves,
    magnitudes: Magnitudes,
    stems: Stems,
}

#[derive(Debug, Serialize)]
struct Expected {
    word: String,
    score: f32,
}

#[derive(Serialize, Debug)]
struct Clue {
    word: String,
    score: f32,
    expected: Vec<Expected>,
}

#[derive(Debug)]
struct ClueScore {
    word: String,
    score: f32,
}

struct State {
    current_team: Team,
    unpicked_tiles: Vec<Tile>,
    assassin_index: usize,
    tile_vecs: Vec<(f32, Vec<f32>)>,
}

lazy_static! {
    static ref VECTORS_GLOBAL: Arc<Vectors> = Arc::new(get_vectors().unwrap());
}

#[post("/api/v1/word", data = "<board>")]
fn make_move(board: Json<Board>) -> JsonValue {
    let now = Instant::now();

    let clue_scores = &calculate_clue(&board, 10);

    println!(
        "calculating a clue took {} milliseconds.",
        now.elapsed().as_millis()
    );

    let clues: Vec<Clue> = clue_scores
        .iter()
        .map(|c| Clue {
            word: c.word.clone(),
            score: c.score,
            expected: calculate_expected(&board, &c.word),
        })
        .collect();

    json!(clues)
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let king_queen_similarity = vector_similarity(&"king".to_string(), &"queen".to_string());
    let dead_cactus_similarity = vector_similarity(&"dead".to_string(), &"cactus".to_string());

    println!("number of items found are {}", VECTORS_GLOBAL.gloves.keys().len());
    println!(
        "magnitude of 'test' is {}",
        VECTORS_GLOBAL.magnitudes.get("test").unwrap()
    );
    println!(
        "vector similarity of 'king' and 'queen' is {}",
        king_queen_similarity
    );
    println!(
        "vector similarity of 'dead' and 'cactus' is {}",
        dead_cactus_similarity
    );

    let mut tiles: Vec<Tile> = Vec::new();
    tiles.push(Tile {
        word: "sink".to_string(),
        team: Team::Red,
        picked: false,
    });
    tiles.push(Tile {
        word: "maple".to_string(),
        team: Team::Red,
        picked: false,
    });
    tiles.push(Tile {
        word: "teacher".to_string(),
        team: Team::Red,
        picked: false,
    });
    tiles.push(Tile {
        word: "force".to_string(),
        team: Team::Red,
        picked: false,
    });
    tiles.push(Tile {
        word: "ground".to_string(),
        team: Team::Red,
        picked: false,
    });
    tiles.push(Tile {
        word: "ice".to_string(),
        team: Team::Red,
        picked: false,
    });
    tiles.push(Tile {
        word: "bridge".to_string(),
        team: Team::Red,
        picked: false,
    });
    tiles.push(Tile {
        word: "paste".to_string(),
        team: Team::Red,
        picked: false,
    });

    tiles.push(Tile {
        word: "casino".to_string(),
        team: Team::Civilian,
        picked: false,
    });
    tiles.push(Tile {
        word: "triangle".to_string(),
        team: Team::Civilian,
        picked: false,
    });
    tiles.push(Tile {
        word: "hercules".to_string(),
        team: Team::Civilian,
        picked: false,
    });
    tiles.push(Tile {
        word: "crab".to_string(),
        team: Team::Civilian,
        picked: false,
    });
    tiles.push(Tile {
        word: "field".to_string(),
        team: Team::Civilian,
        picked: false,
    });
    tiles.push(Tile {
        word: "sled".to_string(),
        team: Team::Civilian,
        picked: false,
    });
    tiles.push(Tile {
        word: "wake".to_string(),
        team: Team::Civilian,
        picked: false,
    });
    tiles.push(Tile {
        word: "state".to_string(),
        team: Team::Civilian,
        picked: false,
    });
    tiles.push(Tile {
        word: "arm".to_string(),
        team: Team::Civilian,
        picked: false,
    });
    tiles.push(Tile {
        word: "server".to_string(),
        team: Team::Civilian,
        picked: false,
    });

    tiles.push(Tile {
        word: "pupil".to_string(),
        team: Team::Blue,
        picked: false,
    });
    tiles.push(Tile {
        word: "missile".to_string(),
        team: Team::Blue,
        picked: false,
    });
    tiles.push(Tile {
        word: "sound".to_string(),
        team: Team::Blue,
        picked: false,
    });
    tiles.push(Tile {
        word: "the".to_string(),
        team: Team::Blue,
        picked: false,
    });
    tiles.push(Tile {
        word: "the".to_string(),
        team: Team::Blue,
        picked: false,
    });
    tiles.push(Tile {
        word: "the".to_string(),
        team: Team::Blue,
        picked: false,
    });

    tiles.push(Tile {
        word: "tube".to_string(),
        team: Team::Assassin,
        picked: false,
    });

    let board = Board {
        tiles: tiles,
        current_team: Team::Red,
    };

    let now = Instant::now();
    dbg!(calculate_clue(&board, 10));
    println!(
        "calculating a clue took {} milliseconds.",
        now.elapsed().as_millis()
    );

    rocket::ignite().mount("/", routes![make_move]).launch();

    Ok(())
}

fn save_vectors(filename: &str, vectors: &Vectors) -> Result<(), Box<dyn std::error::Error>> {
    let cache_file = OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(filename)?;
    let writer = BufWriter::new(cache_file);
    bincode::serialize_into(writer, vectors)?;
    Ok(())
}

fn load_vectors(filename: &str) -> Result<Vectors, Box<dyn std::error::Error>> {
    let cache_file = OpenOptions::new().read(true).open(filename)?;
    let reader = BufReader::new(cache_file);
    let vectors = bincode::deserialize_from(reader)?;
    Ok(vectors)
}

fn get_vectors() -> Result<Vectors, Box<dyn std::error::Error>> {
    match load_vectors("vectors_cache.bc") {
        Ok(vectors) => return Ok(vectors),
        Err(_) => {}
    }

    println!("Recalculating vectors.");
    let gloves = get_gloves()?;
    println!("Got gloves");
    let magnitudes = get_magnitudes(&gloves);
    println!("got mag");
    let stems = get_stems(&gloves);
    println!("got stems");

    let vectors = Vectors {
        gloves: gloves,
        magnitudes: magnitudes,
        stems: stems,
    };

    save_vectors("vectors_cache.bc", &vectors).unwrap();

    Ok(vectors)
}

// fn dot_product(a: &[f32], b: &[f32]) -> f32 {
//     return a.iter().zip(b.iter()).map(|(x, y)| x * y).sum();
// }

fn dot_product(x: &[f32], y: &[f32]) -> f32 {
    return x
        .chunks(16)
        .map(f32x16::from_slice_unaligned)
        .zip(y.chunks(16).map(f32x16::from_slice_unaligned))
        .map(|(a, b)| a * b)
        .sum::<f32x16>()
        .sum();
}

fn get_magnitudes(gloves: &Gloves) -> Magnitudes {
    let mut magnitudes: Magnitudes = HashMap::with_capacity(WORDS);

    for key in gloves.keys() {
        let value = gloves.get(key).unwrap();
        let dot: f32 = dot_product(value, value);
        magnitudes.insert(key.to_string(), dot.sqrt());
    }

    magnitudes
}

fn get_stems(gloves: &Gloves) -> Stems {
    let mut stems: Stems = HashMap::with_capacity(WORDS);
    let en_stemmer = Stemmer::create(Algorithm::English);

    for key in gloves.keys() {
        stems.insert(key.to_string(), en_stemmer.stem(key).to_string());
    }

    stems
}

fn get_gloves() -> Result<Gloves, Box<dyn std::error::Error>> {
    let file = File::open(FILE)?;
    let reader = BufReader::new(file);
    let mut gloves: Gloves = HashMap::with_capacity(WORDS);

    for line in reader.lines() {
        let unwrapped_line = line.unwrap();
        let mut line_iterator = unwrapped_line.split(" ");
        let word = line_iterator.next().unwrap().clone();

        let simd_size = 16;
        let num_extra = if DIMENSIONS % simd_size != 0 {
            (simd_size - DIMENSIONS % simd_size)
        } else {
            0
        };
        let mut vectors = vec![0f32; DIMENSIONS + num_extra];
        for i in 0..DIMENSIONS {
            vectors[i] = line_iterator
                .next()
                .expect("Didnt find enough dimensions in provided file.")
                .parse::<f32>()?;
        }

        for i in 0..num_extra {
            vectors[DIMENSIONS + i] = 0.0;
        }

        gloves.insert(word.to_string(), vectors);
    }

    Ok(gloves)
}

fn vector_similarity(word1: &String, word2: &String) -> f32 {
    let vec1 = VECTORS_GLOBAL.gloves.get(word1).unwrap();
    let vec2 = VECTORS_GLOBAL.gloves.get(word2).unwrap();

    let product = dot_product(vec1, vec2);
    let denominator =
        VECTORS_GLOBAL.magnitudes.get(word1).unwrap() * VECTORS_GLOBAL.magnitudes.get(word2).unwrap();

    product / denominator
}

fn vector_similarity_by_vec(vec1: &[f32], vec2: &[f32], mag1: f32, mag2: f32) -> f32 {
    // let vec1 = vectors.gloves.get(word1).unwrap();
    // let vec2 = vectors.gloves.get(word2).unwrap();
    // let denominator =
    //     vectors.magnitudes.get(word1).unwrap() * vectors.magnitudes.get(word2).unwrap();

    dot_product(vec1, vec2) / (mag1 * mag2)
}

fn score_team(current_team: Team, card_team: Team) -> i8 {
    match card_team {
        Team::Civilian => -1,
        Team::Assassin => -10,
        Team::Red | Team::Blue => {
            if current_team == card_team {
                1
            } else {
                -3
            }
        }
    }
}

fn score_clue(
    state: &State,
    stems: &Vec<String>,
    key: &String,
    key_vec: &[f32],
    key_mag: f32,
) -> Option<ClueScore> {
    // don't process words with same stems
    if stems.iter().any(|stem| *stem == (&VECTORS_GLOBAL).stems[key]) {
        return None;
    }

    if key.chars().count() < 3 {
        return None;
    }

    // if it's too close to assassin, ignore.
    if vector_similarity(key, &state.unpicked_tiles[state.assassin_index].word) > 0.4 {
        return None;
    }

    // calculate word similarity to each tile
    let similarities: Vec<(usize, f32)> = state
        .unpicked_tiles
        .iter()
        .enumerate()
        .map(|(i, tile)| {
            (
                i,
                vector_similarity_by_vec(
                    key_vec,
                        &state.tile_vecs[i].1,
                    key_mag,
                    state.tile_vecs[i].0,
                ),
            )
        })
        .collect();

    // ensure at least one word is similar
    let positive_similarity = similarities
        .iter()
        .find(|(_, similarity)| *similarity > 0.4);

    if positive_similarity.is_none() {
        return None;
    }

    // score is calculated as similarity multiplied by a 'card value' (ranging from -20 to 1)
    // and summed.  We ignore cards that are not similar to the card at all.
    let score = similarities
        .iter()
        .filter(|(_, similarity)| *similarity > 0.4)
        .map(|(i, similarity)| {
            similarity * score_team(state.current_team, state.unpicked_tiles[*i].team) as f32
        })
        .sum::<f32>();

    Some(ClueScore {
        word: key.to_string(),
        score: score,
    })
}

fn calculate_expected(board: &Board, key: &String) -> Vec<Expected> {
    // first, we extract all unsolved words and assign them a score.
    let unpicked_tiles: Vec<Tile> = board
        .tiles
        .iter()
        .filter(|tile| !tile.picked)
        .cloned()
        .collect();

    let mut similarities: Vec<(usize, f32)> = unpicked_tiles
        .iter()
        .enumerate()
        .map(|(i, tile)| (i, vector_similarity(key, &tile.word)))
        .collect();
    similarities.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap());

    similarities
        .iter()
        .take_while(|(i, score)| {
            !(*score < 0.4 || score_team(board.current_team, unpicked_tiles[*i].team) < 0)
        })
        .map(|(i, similarity)| Expected {
            word: unpicked_tiles[*i].word.clone(),
            score: *similarity,
        })
        .collect()
}

fn calculate_clue(board: &Board, number: usize) -> Vec<ClueScore> {
    // first, we extract all unsolved words and assign them a score.
    let unpicked_tiles: Vec<Tile> = board
        .tiles
        .iter()
        .filter(|tile| !tile.picked)
        .cloned()
        .collect();

    let assassin_index = unpicked_tiles
        .iter()
        .position(|tile| tile.team == Team::Assassin)
        .unwrap();

    let stems: Vec<String> = unpicked_tiles
        .iter()
        .map(|tile| VECTORS_GLOBAL.stems[&tile.word].clone())
        .collect();

    let tile_vecs = unpicked_tiles
        .iter()
        .map(|tile| (*VECTORS_GLOBAL.magnitudes.get(&tile.word).unwrap(), VECTORS_GLOBAL.gloves.get(&tile.word).unwrap().clone()))
        .collect::<Vec<(f32, Vec<f32>)>>();

    let state = State {
        current_team: board.current_team,
        unpicked_tiles: unpicked_tiles,
        assassin_index: assassin_index,
        tile_vecs: tile_vecs
    };

    let mut best_clues: Vec<ClueScore> = VECTORS_GLOBAL
        .gloves
        .par_iter()
        .filter_map(|(key, _)| {
            score_clue(
                &state,
                &stems,
                key,
                VECTORS_GLOBAL.gloves.get(key).unwrap(),
                *VECTORS_GLOBAL.magnitudes.get(key).unwrap(),
            )
        })
        .fold(
            || Vec::new(),
            |mut acc: Vec<ClueScore>, elem| {
                if elem.score > acc.last().map(|x| x.score).unwrap_or(f32::NEG_INFINITY) {
                    acc.push(elem);
                    acc.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap());
                    acc
                } else {
                    acc
                }
            },
        )
        .flatten()
        .collect();
    // dbg!(&best_clues);
    // .max_by(|a, b| a.score.partial_cmp(&b.score).unwrap())
    // .unwrap()];

    best_clues.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap());

    best_clues.into_iter().take(number).collect()
}
