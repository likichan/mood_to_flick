# backend/main.py

from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware


# recommendation モジュールを絶対インポート
from backend.recommend import (
    load_and_prepare_data,
    create_feature_matrix,
    recommend_movies,
    recommend_movies_by_mood,
    router as recommend_router
)

app = FastAPI()

# CORS 設定 (フロントが localhost:3000 の場合)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 推薦APIルーターを登録
app.include_router(recommend_router)

# アプリ起動時にデータ読み込み＋特徴量作成
ratings, movies = load_and_prepare_data()
features, tfv = create_feature_matrix(movies)

# ここでrecommend.pyのグローバル変数に代入
import backend.recommend as recommend
recommend.movies = movies
recommend.features = features

# リクエスト／レスポンスモデル
class RecommendRequest(BaseModel):
    liked_titles: list[str]
    rated_ids: Optional[List[int]] = None

class RecommendMoodRequest(BaseModel):
    mood: str

class RecommendResponse(BaseModel):
    recommended: list[dict]

# 通常推薦エンドポイント
@app.post("/recommend", response_model=RecommendResponse)
def recommend(request: RecommendRequest):
    recs = recommend_movies(
        request.liked_titles,
        movies,
        features,
        request.rated_ids
    )
    return {"recommended": recs}

# ムード推薦エンドポイント
@app.post("/recommend_mood", response_model=RecommendResponse)
def recommend_mood(request: RecommendMoodRequest):
    recs = recommend_movies_by_mood(
        request.mood,
        movies,
        features,
        tfv,         # ← ここを追加
        top_k=4
    )
    return {"recommended": recs}
