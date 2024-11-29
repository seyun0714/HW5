import pandas as pd
from datasets import Dataset

# 데이터 로드
data = pd.read_csv("/Users/sejunkwon/PycharmProjects/IntentClassification/Data/소상공인 고객 주문 질의-응답 텍스트/Training/라벨링데이터_train/가구인테리어_train.csv", low_memory=False)

# 그룹별로 처리하여 결과 저장
grouped_data = []
for idx, group in data.groupby('상담번호'):
    group_dict = {
        "Q": group.loc[group['QA여부'] == 'q', '발화문'].tolist(),
        "A": group.loc[group['QA여부'] == 'a', '발화문'].tolist(),
        "id": idx
    }
    # 리스트 형태로 변환된 데이터만 추가
    group_dict['Q'] = ' '.join(group_dict['Q'])  # 각 질문을 하나의 문자열로 결합
    group_dict['A'] = ' '.join(group_dict['A'])  # 각 답변을 하나의 문자열로 결합
    grouped_data.append(group_dict)

# 딕셔너리 리스트를 DataFrame으로 변환
grouped_df = pd.DataFrame(grouped_data)

# 데이터프레임을 Dataset으로 변환
dataset = Dataset.from_pandas(grouped_df)

# 데이터셋을 CSV 파일로 저장
csv_filename = "makedata.csv"
grouped_df.to_csv(csv_filename, index=False, encoding="utf-8")

# 결과 출력
print(dataset[0:5])