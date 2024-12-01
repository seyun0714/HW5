from flask import Flask, render_template, jsonify, request
from utils import calc_perplexity

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/t-sne')
def t_sne():
    return "t-sne"

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

    
    perplexity_origin = calc_perplexity(model_origin,data)
    perplexity_augmented = calc_perplexity(model_aug,data)

    return jsonify({
        "origin": perplexity_origin,
        "aug": perplexity_augmented
    })

@app.route('/augmentation')
def augmentation():
    return "augmentation"

@app.route('/chatbot')
def chatbot():
    return "chatbot"

if __name__ == '__main__':
    app.run(debug=True)