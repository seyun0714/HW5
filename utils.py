from transformers import AutoModelForCausalLM, AutoTokenizer
from gensim.models import Word2Vec
from sklearn.manifold import TSNE
from nltk.tokenize import word_tokenize
import numpy as np
import pandas as pd
import seaborn as sns
import json
import torch
from tqdm import tqdm

# def calc_perplexity():
# flask에서 함수 호출 시 model path와 데이터셋 경로를 제공
def calc_perplexity(model_id, csv_path):
    # GPU 사용 설정
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    # model_id = "skt/kogpt2-base-v2" # 임의 지정 모델
    model = AutoModelForCausalLM.from_pretrained(model_id)
    tokenizer = AutoTokenizer.from_pretrained(model_id)

    # csv_path = "static/data/dataset.csv" # 임의 지정 데이터
    data = pd.read_csv(csv_path)

    # csv 파일 포맷에 q와 a 열이 있다고 가정.
    # 모델 학습할 때 사용하는 텍스트 포멧과 동일하게 만들어야 함
    texts = (data['Q']+" "+data['A']).tolist()

    # 토큰화
    encodings = tokenizer("\n\n".join(texts), return_tensors="pt", truncation=True, padding=True)

    max_length = model.config.n_positions
    stride = 512
    seq_len = encodings.input_ids.size(1)

    # code from https://huggingface.co/docs/transformers/ko/perplexity
    # perplexity 계산
    nlls = []
    prev_end_loc = 0
    for begin_loc in tqdm(range(0, seq_len, stride)):
        end_loc = min(begin_loc + max_length, seq_len)
        trg_len = end_loc - prev_end_loc
        input_ids = encodings.input_ids[:, begin_loc:end_loc].to(device)
        target_ids = input_ids.clone()
        target_ids[:, :-trg_len] = -100

        with torch.no_grad():
            outputs = model(input_ids, labels=target_ids)
            neg_log_likelihood = outputs.loss

        nlls.append(neg_log_likelihood)

        prev_end_loc = end_loc
        if end_loc == seq_len:
            break

    ppl = torch.exp(torch.stack(nlls).mean())

    return ppl


def tsne_visualization(data_path):
    # 데이터셋 로드
    data = pd.read_csv(data_path)
    target_column = 'Q'

    # 데이터셋 토큰화(공백문자 토큰화)
    tokens = [word_tokenize(text) for text in data[target_column]]

    # Word2Vec 모델 학습
    model = Word2Vec(sentences=tokens, vector_size=100, window=5, min_count=1, workers=4, sg=1)

    # 벡터 추출
    words = list(model.wv.index_to_key)
    vectors = np.array([model.wv[word] for word in words])

    # 차원 축소
    tsne = TSNE(n_components=2, perplexity=2, random_state=42)
    reduced_vectors = tsne.fit_transform(vectors)

    # json 형태로 저장
    tsne_result = [
        {"word": word, "x": float(coord[0]), "y": float(coord[1])}
        for word, coord in zip(words, reduced_vectors)
    ]

    return tsne_result