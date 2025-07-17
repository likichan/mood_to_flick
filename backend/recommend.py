import pandas as pd
import numpy as np
import ast
from scipy.sparse import hstack, csr_matrix
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import MultiLabelBinarizer, StandardScaler
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Request
import psycopg2
from dotenv import load_dotenv
import os
import requests

router = APIRouter()

movies = None
features = None

# .envファイルを読み込む
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '../.env'))

TMDB_API_KEY = os.environ.get("TMDB_API_KEY")

def get_tmdb_poster(title):
    url = f"https://api.themoviedb.org/3/search/movie"
    params = {
        "api_key": TMDB_API_KEY,
        "query": title,
        "language": "ja-JP"
    }
    try:
        res = requests.get(url, params=params, timeout=3)
        res.raise_for_status()
        data = res.json()
        if data["results"]:
            poster_path = data["results"][0].get("poster_path")
            if poster_path:
                return f"https://image.tmdb.org/t/p/w342{poster_path}"
    except Exception as e:
        print("TMDB poster fetch error:", e)
    return "/fallback.png"

@router.post("/recommend_by_rating")
async def recommend_by_rating(request: Request):
    body = await request.json()
    user_id = body.get("user_id")
    # PostgreSQLに接続（.envから取得）
    conn = psycopg2.connect(
        dbname=os.environ.get("DB_NAME"),
        user=os.environ.get("DB_USER"),
        password=os.environ.get("DB_PASSWORD"),
        host=os.environ.get("DB_HOST"),
        port=os.environ.get("DB_PORT")
    )
    cur = conn.cursor()
    # ユーザーの評価履歴を取得（movie_idはtmdb_idとして保存されている想定）
    cur.execute("SELECT movie_id, rating FROM ratings WHERE user_id = %s", (user_id,))
    ratings = cur.fetchall()
    rated_ids = [r[0] for r in ratings]
    liked_ids = [r[0] for r in ratings if r[1] >= 4]  # 例: 4点以上を高評価
    # CSVのmovies DataFrameを使ってタイトルを取得
    liked_titles = movies[movies['movieId'].isin(liked_ids)]['title'].tolist()
    # 推薦ロジックを回す
    recs = recommend_movies(liked_titles, movies, features, rated_ids)
    return {"recommendations": recs}

@router.get("/popular_classics")
def popular_classics():
    # 映画史で人気の映画（vote_count>1000, vote_average>7.5）を上位20件返す
    popular = movies[(movies['vote_count'] > 1000) & (movies['vote_average'] > 7.5)]
    popular = popular.sort_values(['vote_average', 'vote_count'], ascending=False).head(20)
    result = []
    for _, row in popular.iterrows():
        if row.get('poster_path'):
            thumbnail = f"https://image.tmdb.org/t/p/w342{row['poster_path']}"
        else:
            thumbnail = get_tmdb_poster(row['title'])
        result.append({
            "id": int(row["movieId"]),
            "title": row["title"],
            "year": row["release_year"],
            "genre": row["genres_list"],
            "actors": row["cast_list"],
            "description": row["overview"],
            "thumbnail": thumbnail
        })
    return {"movies": result}

# ---- データの前処理・ロード（1回だけ呼び出す用） ----
def load_and_prepare_data():
    # ファイル読み込み
    ratings = pd.read_csv("notebooks/ratings.csv")
    movies = pd.read_csv("notebooks/tmdb_5000_movies.csv")
    credits = pd.read_csv("notebooks/tmdb_5000_credits.csv")

    # credits側のid整備
    if "movie_id" in credits.columns:
        credits.rename(columns={"movie_id": "movieId"}, inplace=True)
    elif "id" in credits.columns:
        credits.rename(columns={"id": "movieId"}, inplace=True)
    # movies側のid整備
    if "id" in movies.columns:
        movies.rename(columns={"id": "movieId"}, inplace=True)

    # 数値化
    movies["movieId"] = pd.to_numeric(movies["movieId"], errors="coerce")
    credits["movieId"] = pd.to_numeric(credits["movieId"], errors="coerce")

    # マージ
    movies = movies.merge(
        credits[["movieId", "cast", "crew"]],
        on="movieId", how="left"
    )

    # 欠損値補完
    for col in ["genres", "keywords", "overview", "original_language", "cast", "crew", "production_countries", "release_date"]:
        if col in movies.columns:
            movies[col] = movies[col].fillna("[]" if col in ["genres","keywords","cast","crew","production_countries"] else "")

    # 各種リスト化
    movies["genres_list"] = movies["genres"].apply(ast.literal_eval).apply(lambda lst: [d["name"] for d in lst])
    movies["keywords_list"] = movies["keywords"].apply(ast.literal_eval).apply(lambda lst: [d["name"] for d in lst])
    movies["cast_list"] = movies["cast"].apply(ast.literal_eval).apply(lambda lst: [d["name"] for d in lst][:5])
    movies["director_list"] = movies["crew"].apply(ast.literal_eval).apply(lambda lst: [d["name"] for d in lst if d.get("job") == "Director"])
    movies["country_list"] = movies["production_countries"].apply(ast.literal_eval).apply(lambda lst: [d["name"] for d in lst])
    movies["release_year"] = pd.to_datetime(movies["release_date"], errors="coerce").dt.year.fillna(0).astype(int)

    return ratings, movies

# ---- 映画特徴量のベクトル化（推薦ロジックの準備） ----
def create_feature_matrix(movies):
    # TF-IDF
    tfidf = TfidfVectorizer(stop_words="english", max_features=5000, ngram_range=(1,3))
    tfidf_mat = tfidf.fit_transform(movies["overview"])

    # One-hot (MultiLabelBinarizer)
    mlb_genre = MultiLabelBinarizer()
    mlb_keyword = MultiLabelBinarizer()
    mlb_cast = MultiLabelBinarizer()
    mlb_dir = MultiLabelBinarizer()
    mlb_country = MultiLabelBinarizer()

    genre_mat = mlb_genre.fit_transform(movies["genres_list"])
    keyword_mat = mlb_keyword.fit_transform(movies["keywords_list"])
    cast_mat = mlb_cast.fit_transform(movies["cast_list"])
    dir_mat = mlb_dir.fit_transform(movies["director_list"])
    country_mat = mlb_country.fit_transform(movies["country_list"])

    # 数値特徴
    scaler = StandardScaler()
    year_scaled = scaler.fit_transform(movies[["release_year"]])
    year_mat = csr_matrix(year_scaled)

    # 重み付け
    w_overview = 1.0
    w_genre = 1.0
    w_keyword = 1.0
    w_cast = 1.0
    w_director = 2.0
    w_country = 1.0
    w_year = 0.1

    tfidf_mat *= w_overview
    genre_mat = csr_matrix(genre_mat * w_genre)
    keyword_mat = csr_matrix(keyword_mat * w_keyword)
    cast_mat = csr_matrix(cast_mat * w_cast)
    dir_mat = csr_matrix(dir_mat * w_director)
    country_mat = csr_matrix(country_mat * w_country)
    year_mat *= w_year

    features = hstack([
        tfidf_mat,
        genre_mat,
        keyword_mat,
        cast_mat,
        dir_mat,
        country_mat,
        year_mat
    ]).tocsr()

    # Return both features and the fitted TF-IDF vectorizer
    return features, tfidf

# ---- 推薦関数指定したユーザーの映画評価をもとに、類似作品を推薦 ----
def recommend_movies(liked_titles, movies, features, rated_ids=None, top_k=4):
    if rated_ids is None:
        rated_ids = []
    liked_idx = movies[movies["title"].isin(liked_titles)].index
    if len(liked_idx) == 0:
        return []
    user_vec = features[liked_idx].mean(axis=0)
    user_vec = np.asarray(user_vec).flatten()
    sims = cosine_similarity(user_vec.reshape(1, -1), features).flatten()
    sims[liked_idx] = -1
    if rated_ids:
        rated_idx = movies[movies["movieId"].isin(rated_ids)].index
        sims[rated_idx] = -1
    # 上位20件を取得し、その中からランダムにtop_k件選ぶ
    topn = 20
    topn_idx = np.argsort(sims)[::-1][:topn]
    recs = movies.iloc[topn_idx][["movieId", "title", "genres_list", "release_year", "overview", "cast_list"]]
    recs = recs.sample(n=top_k, random_state=None) if len(recs) >= top_k else recs
    result = [
        {
            "id": int(row["movieId"]),
            "title": row["title"],
            "year": row["release_year"],
            "genre": row["genres_list"],
            "actors": row["cast_list"],
            "description": row["overview"],
            "thumbnail": f"https://image.tmdb.org/t/p/w342{row['poster_path']}" if row.get("poster_path") else get_tmdb_poster(row["title"])
        }
        for _, row in recs.iterrows()
    ]
    return result

# ---- ムードワードから映画を推薦する関数（修正版） ----
def recommend_movies_by_mood(mood_input, movies, features, tfidf_vectorizer, top_k=4):
    """
    ムードから映画を推薦する関数
    
    Args:
        mood_input: str or list - ムードワード（文字列またはリスト）
        movies: DataFrame - 映画データ
        features: sparse matrix - 映画特徴量マトリックス
        tfidf_vectorizer: TfidfVectorizer - 学習済みのTF-IDFベクトライザ
        top_k: int - 返す映画数
    """
    
    # ムードキーワードの辞書（日本語対応）
    MOOD_KEYWORDS = {
    "uplifting":    ["inspiring", "hope", "positive", "dream", "victory", "overcome", "success"],
    "relaxing":     ["relaxing", "peaceful", "calm", "serene", "gentle", "slow", "nature"],
    "funny":        ["comedy", "laugh", "funny", "humor", "joke", "hilarious", "witty"],
    "chill":        ["cool", "laid-back", "casual", "chill", "hangout", "friendship"],
    "sad":          ["sad", "tragedy", "loss", "grief", "tears", "emotional", "heartbreaking"],
    "confused":     ["mystery", "puzzle", "confuse", "twist", "complex", "mind-bending", "unexpected"],
    "surprised":    ["surprise", "unexpected", "twist", "shock", "astonishing", "reveal"],
    "adventurous":  ["adventure", "journey", "explore", "expedition", "brave", "danger", "quest"],
    # 日本語ムード
    "元気になりたい":    ["inspiring", "hope", "positive", "dream", "victory", "overcome", "success"],
    "リラックスしたい":     ["relaxing", "peaceful", "calm", "serene", "gentle", "slow", "nature"],
    "思いっきり笑いたい":        ["comedy", "laugh", "funny", "humor", "joke", "hilarious", "witty"],
    "まったりしたい":        ["cool", "laid-back", "casual", "chill", "hangout", "friendship"],
    "しんみりしたい":          ["sad", "tragedy", "loss", "grief", "tears", "emotional", "heartbreaking"],
    "戸惑いたい":     ["mystery", "puzzle", "confuse", "twist", "complex", "mind-bending", "unexpected"],
    "ドキドキしたい":    ["surprise", "unexpected", "twist", "shock", "astonishing", "reveal"],
    "刺激が欲しい":  ["adventure", "journey", "explore", "expedition", "brave", "danger", "quest"],
   }
    
    # 入力がstringの場合はリストに変換
    if isinstance(mood_input, str):
        mood_words = [mood_input]
    else:
        mood_words = mood_input
    
    # ムードワードを英語キーワードに変換
    all_keywords = []
    for mood in mood_words:
        if mood in MOOD_KEYWORDS:
            all_keywords.extend(MOOD_KEYWORDS[mood])
        else:
            # 辞書にない場合はそのまま使用
            all_keywords.append(mood)
    
    # 重複を除去
    all_keywords = list(set(all_keywords))
    
    # キーワードを一文にまとめてベクトル化
    mood_query = " ".join(all_keywords)
    mood_vec = tfidf_vectorizer.transform([mood_query])
    
    # ムードベクトルと映画特徴量で類似度計算（TF-IDF部分のみ使用）
    tfidf_features = features[:, :tfidf_vectorizer.vocabulary_.__len__()]
    sims = cosine_similarity(mood_vec, tfidf_features).flatten()
    
    # 上位50件を取得
    topk_idx = np.argsort(sims)[::-1][:50]
    recs = movies.iloc[topk_idx][["movieId", "title", "genres_list", "release_year", "overview", "cast_list"]]

    # ランダムにmax(10, top_k)件選ぶ
    n_return = max(10, top_k)
    recs = recs.sample(n=n_return, random_state=None) if len(recs) >= n_return else recs

    result = [
        {
            "id": int(row["movieId"]),
            "title": row["title"],
            "year": row["release_year"],
            "genre": row["genres_list"],
            "actors": row["cast_list"],
            "description": row["overview"],
            "thumbnail": f"https://image.tmdb.org/t/p/w342{row['poster_path']}" if row.get("poster_path") else get_tmdb_poster(row["title"])
        }
        for _, row in recs.iterrows()
    ]
    return result