import pandas as pd
from flask import Flask, render_template, jsonify, request
from utils import calc_perplexity, tsne_visualization
import requests
from flask_restx import Api, Resource, fields
from flask_swagger_ui import get_swaggerui_blueprint
import re

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


@app.route('/perplexity', methods=['POST'])
def perplexity():
    augType = request.json.get('augType')
    print(augType)
    if (augType == "default"):
        return jsonify(
            {"name": "base", "value": 4.0},
            {"name": "base2", "value": 4.6},
        )
    elif (augType == "SR"):
        return jsonify(
            {"name": "base", "value": 4.0},
            {"name": "base2", "value": 4.6},
            {"name": "문장 구조 변경", "value": 3.2}
        )
    elif (augType == "RI"):
        return jsonify(
            {"name": "base", "value": 4.0},
            {"name": "base2", "value": 4.6},
            {"name": "노이즈 추가", "value": 2.4}
        )
    elif (augType == "RS"):
        return jsonify(
            {"name": "base", "value": 4.0},
            {"name": "base2", "value": 4.6},
            {"name": "단어 대체", "value": 1.2}
        )
    elif (augType == "RD"):
        return jsonify(
            {"name": "base", "value": 4.0},
            {"name": "base2", "value": 4.6},
            {"name": "문맥적 삽입", "value": 1.7}
        )


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

        print(response_json)
        aug_df = pd.DataFrame(response_json)

        # 더미 데이터 생성
        aug_data = [
            {"origin": f"{row['Q']}", "aug": f"{row['Q-AUG']}"}
            for _, row in aug_df.iterrows()
        ]

        print(aug_data)
        # JSON 응답 반환
        return jsonify(aug_data)


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
