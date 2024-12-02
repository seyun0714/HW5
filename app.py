from flask import Flask, render_template, jsonify, request
from utils import calc_perplexity, tsne_visualization


app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/t-sne')
def t_sne():
    augment_type = request.args.get()

    # 선택 된 증강 기법에 해당하는 데이터 셋 지정
    data = ""
    
    # tsne_visualiztion 함수 내부에서 json 형식으로 값을 return
    return tsne_visualization(data)

@app.route('/perplexity')
def perplexity():

    # request를 통해 증강 종류 확인
    augment_type = request.args.get()

    # 증강 종류에 따라 model_id 지정
    model_type = ""
    data = "static/data/sample.csv" # perplexity 계산을 위한 데이터 셋 경로

    # 모델 경로 설정
    model_path = "models/"
    model_origin = model_path + "origin_model" # origin 모델 경로
    model_aug = model_path + model_type # aug 모델 경로

    # perplexity 계산
    perplexity_origin = calc_perplexity(model_origin,data)
    perplexity_augmented = calc_perplexity(model_aug,data)

    return jsonify({
        "origin": perplexity_origin,
        "aug": perplexity_augmented
    })

@app.route('/augmentation', methods=['GET'])
def augmentation():
    # Query parameter 가져오기
    augmentation_type = request.args.get('augmentationType', 'default')

    # 더미 데이터 생성
    dummy_data = [
        {"origin": f"origin_{i}", "aug": f"{augmentation_type}_aug_{i}"}
        for i in range(5)
    ]

    # JSON 응답 반환
    return jsonify(dummy_data)

@app.route('/chatbot')
def chatbot():
    return "chatbot"

if __name__ == '__main__':
    app.run(debug=True)