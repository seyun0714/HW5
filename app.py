from flask import Flask, render_template, jsonify
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
    """
    하나의 라우터로 동적으로 model을 적용할 방법이 있을지 모르겠습니다
    ^^^ 이게 어렵다면 flask_restx를 사용해서 증강 기법별 namespace를 만들어서 사용해도 좋을 것 같습니다.
    만약 증강기법마다 별도의 라우터를 두게 된다면 model_aug만 변경해서 사용하면 될 거 같습니다.
    """
    data = "static/data/sample.csv" # perplexity 계산을 위한 데이터 셋 경로
    model_origin = "models/origin_model" # origin 모델 경로
    model_aug = "models/noise_model" # aug 모델 경로
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