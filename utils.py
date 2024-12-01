from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
import pandas as pd
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

    # csv 파일 포맷에 q열와 a열이 있다고 가정.
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