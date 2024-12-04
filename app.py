from flask import Flask, render_template, jsonify, request
from utils import calc_perplexity, tsne_visualization
import requests
from flask_restx import Api, Resource, fields
from flask_swagger_ui import get_swaggerui_blueprint

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

# Flask-RESTX API 초기화
api = Api(
    app,
    version='1.0',
    title='User API',
    description='A simple User API using Flask-RESTX',
    doc='/apidoc'  # Swagger UI 경로 설정
)

# 네임스페이스 정의
ns = api.namespace('users', description='User operations')

# 모델 정의 (Swagger에서 사용)
user_model = api.model('User', {
    'id': fields.Integer(readonly=True, description='The user unique identifier'),
    'name': fields.String(required=True, description='The user name'),
    'email': fields.String(required=True, description='The user email')
})



@ns.route('/t-sne')
# Flask-RESTX를 사용하여 API 엔드포인트 등록
class TSNEVisualization(Resource):
    @ns.doc('t_sne_visualization')
    def t_sne():
    # 증강된 데이터 파일 경로
      origin_path = ""
      SR_path=""
      RI_path=""
      RD_path=""
      RS_path=""

      origin_data = tsne_visualization(origin_path, aug_type="origin")
      SR_data = tsne_visualization(SR_path, aug_type="SR")
      RI_data = tsne_visualization(RI_path, aug_type="RI")
      RD_data = tsne_visualization(RD_path, aug_type="RD")
      RS_data = tsne_visualization(RS_path, aug_type="RS")

      return jsonify(origin_data+
                     SR_data+
                     RI_data+
                     RD_data+
                     RS_data)

@app.route('/perplexity', methods=['POST'])
def perplexity():
    augType = request.json.get('augType')
    print(augType)
    if(augType == "default"):
        return jsonify(
            {"name": "base", "value": 4.0},
            {"name": "base2", "value": 4.6},
        )
    elif(augType == "aug1"):
        return jsonify(
            {"name": "base", "value": 4.0},
            {"name": "base2", "value": 4.6},
            {"name": "문장 구조 변경", "value": 3.2}
        )
    elif(augType == "aug2"):
        return jsonify(
            {"name": "base", "value": 4.0}, 
            {"name": "base2", "value": 4.6},
            {"name": "노이즈 추가", "value": 2.4}
        )
    elif(augType == "aug3"):
        return jsonify(
            {"name": "base", "value": 4.0},
            {"name": "base2", "value": 4.6},
            {"name": "단어 대체", "value": 1.2}
        )
    elif(augType == "aug4"):
        return jsonify(
            {"name": "base", "value": 4.0},
            {"name": "base2", "value": 4.6},
            {"name": "문맥적 삽입", "value": 1.7}
        )
    
    # var data1 = [
    #     {name: "base", value: 4.0},
    #     {name: "base2", value: 4.6},
    #     {name: "문장 구조 변경", value: 5.0}
    # ];
    # var data2 = [
    #     {name: "base", value: 4.0},
    #     {name: "base2", value: 4.6},
    #     {name: "노이즈 추가", value: 7.3}
    # ];
    # var data3 = [
    #     {name: "base", value: 4.0},
    #     {name: "base2", value: 4.6},
    #     {name: "단어 대체", value: 6.1}
    # ];
    # var data4 = [
    #     {name: "base", value: 4.0},
    #     {name: "base2", value: 4.6},
    #     {name: "문맥적 삽입", value: 5.7}
    # ];
    

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

@app.route('/chatbot', methods=['GET'])
def chatbot():
    try:
        # 원격 서버에 GET 요청 보내기
        response = requests.get(REMOTE_SERVER_URL, params={'key': 'value'})

        # 원격 서버의 응답을 처리
        if response.status_code == 200:
            data = response.json()  # JSON 응답 파싱
            return jsonify({'status': 'success', 'data': data}), 200
        else:
            return jsonify({'status': 'fail', 'message': 'Error from remote server'}), response.status_code
    except requests.exceptions.RequestException as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


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