import pandas as pd
from flask import Flask, render_template, jsonify, request
from utils import calc_perplexity, tsne_visualization
import requests
from flask_restx import Api, Resource, fields
from flask_swagger_ui import get_swaggerui_blueprint

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('file.html')

@app.route('/dashboard', methods=['GET'])
def dashboard():
    return render_template('dashboard.html')


# Flask-RESTX API 초기화
api = Api(
    app,
    version='1.0',
    title='NLP API',
    description='API For NLP Serving',
    doc='/apidoc'  # Swagger UI 경로 설정
)

# 네임스페이스 정의
ns = api.namespace('data_routes', description='Send to GPU Server')

# 모델 정의 (Swagger에서 사용)
chatbot_model = ns.model('data_routes', {
    'augType': fields.String(required=True, description='The type of augmentation'),
    'content': fields.String(required=True, description='The input content for the chatbot')
})

chatbot_model_second = ns.model('data_routes_second', {
    'afff': fields.String(required=True, description='The type of augmentation'),
    'codddd': fields.String(required=True, description='The input content for the chatbot')
})


@ns.route('/t-sne')
# Flask-RESTX를 사용하여 API 엔드포인트 등록
class TSNEVisualization(Resource):
    @ns.doc('t_sne_visualization')
    def get(self):
        augment_type = request.json.get('augType', 'default')
        data = ""  # 여기서 필요한 데이터 설정
        return {"message": "t-SNE visualization endpoint", "augmentType": augment_type}


@app.route('/performance')
def performance():
    return jsonify([
            {"name": "koGPT2", "perplexity": 50.3, "BLEU": 52.2, "ROUGE": 46.3, "METEOR": 38.4, "chrF": 42.2},
            {"name": "base fine-tuned", "perplexity": 45.2, "BLEU": 47.8, "ROUGE": 42.1, "METEOR": 35.2, "chrF": 38.9},
            {"name": "SR", "perplexity": 40.1, "BLEU": 43.2, "ROUGE": 38.4, "METEOR": 31.5, "chrF": 35.3},
            {"name": "RI", "perplexity": 35.8, "BLEU": 38.9, "ROUGE": 34.2, "METEOR": 28.1, "chrF": 31.6},
            {"name": "RS", "perplexity": 31.2, "BLEU": 34.5, "ROUGE": 30.1, "METEOR": 24.8, "chrF": 27.9},
            {"name": "RD", "perplexity": 26.9, "BLEU": 30.1, "ROUGE": 26.3, "METEOR": 21.4, "chrF": 24.2}
        ])
   

    # # request를 통해 증강 종류 확인
    # augment_type = request.args.get()

    # # 증강 종류에 따라 model_id 지정
    # model_type = ""
    # data = "static/data/sample.csv" # perplexity 계산을 위한 데이터 셋 경로

    # # 모델 경로 설정
    # model_path = "models/"
    # model_origin = model_path + "origin_model" # origin 모델 경로
    # model_aug = model_path + model_type # aug 모델 경로

    # # perplexity 계산
    # perplexity_origin = calc_perplexity(model_origin,data)
    # perplexity_augmented = calc_perplexity(model_aug,data)

    # return jsonify({
    #     "origin": perplexity_origin,
    #     "aug": perplexity_augmented
    # })

REMOTE_SERVER_URL = "https://team-e.gpu.seongbum.com"
REMOTE_SERVER_AUG_ROUTE = "/flask/augdata"
@ns.route('/augmentation')
class AUGMENTATION(Resource):
    @ns.doc('aug_data')
    @ns.expect(chatbot_model_second)
    def get(self):
        # Query parameter 가져오기
        augmentation_type = request.args.get('augmentationType', 'default')
        
        if(augmentation_type == "default"):
            return jsonify([{"origin" : "", "aug" : ""}])
        
        payload = {'augmentationType': augmentation_type}
        # 원격 Flask 서버로 데이터 전달
        response = requests.post(REMOTE_SERVER_URL + REMOTE_SERVER_AUG_ROUTE, json=payload)
        response_json = response.json()

        aug_df = pd.DataFrame(response_json)
        if augmentation_type == "SR":
            aug_df = aug_df[aug_df['id'].str.startswith('sr')]
            filtered_json = aug_df.to_dict(orient='records')
        elif augmentation_type == "RI":
            aug_df = aug_df[aug_df['id'].str.startswith('ri')]
            filtered_json = aug_df.to_dict(orient='records')
        elif augmentation_type == "RS":
            aug_df = aug_df[aug_df['id'].str.startswith('rs')]
            filtered_json = aug_df.to_dict(orient='records')
        elif augmentation_type == "RD":
            aug_df = aug_df[aug_df['id'].str.startswith('rd')]
            filtered_json = aug_df.to_dict(orient='records')

        # 더미 데이터 생성
        dummy_data = [
            {"origin": f"{row['Q']}", "aug": f"{row['A']}"}
            for row in filtered_json
        ]

        # JSON 응답 반환
        return jsonify(dummy_data)


REMOTE_SERVER_URL = "https://team-e.gpu.seongbum.com"
REMOTE_SERVER_CHATBOT_ROUTE = "/flask/generate"
@ns.route('/chatbot')
class CHATBOT(Resource):
    @ns.doc('chatbot_data')  # Swagger 문서 설명
    @ns.expect(chatbot_model)
    def post(self):  # 브라우저에서 데이터를 받는 POST 요청 처리
        try:
            # 브라우저에서 전달받은 JSON 데이터 가져오기
            client_data = request.get_json()
            print(f"Received data from client: {client_data}")

            # 원격 Flask 서버로 데이터 전달
            response = requests.post(REMOTE_SERVER_URL + REMOTE_SERVER_CHATBOT_ROUTE, json=client_data)

            # 원격 서버의 응답 처리
            if response.status_code == 200:
                remote_data = response.json()  # 원격 서버로부터 받은 응답 데이터
                print(f"Received response from remote server: {remote_data}")
                return {'status': 'success', 'data': remote_data}, 200
            else:
                return {'status': 'fail', 'message': 'Error from remote server'}, response.status_code

        except requests.exceptions.RequestException as e:
            return {'status': 'error', 'message': str(e)}, 500
    # # input 가져오기
    # content = request.json.get('content')
    # augType = request.json.get('augType')
    #
    # # 챗봇 응답 가져오기
    # chatbot_result = content
    #
    # return jsonify({"result": chatbot_result})


if __name__ == '__main__':
    app.run(debug=True)
