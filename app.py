import pandas as pd
from flask import Flask, render_template, jsonify, request, send_file
import requests
from flask_restx import Api, Resource, fields
from flask_swagger_ui import get_swaggerui_blueprint
from werkzeug.utils import secure_filename
import os, csv

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('file.html')

@app.route('/dashboard', methods=['GET'])
def dashboard():
    return render_template('dashboard.html')


USER_DATA = './static/data/users'
os.makedirs(USER_DATA, exist_ok=True)
app.config['USER_DATA'] = USER_DATA

REMOTE_SERVER_URL = "https://team-e.gpu.seongbum.com"
REMOTE_SERVER_UPLOAD_ROUTE = "/flask/upload"
REMOTE_SERVER_AUGMENT_DOWNLOAD_ROUTE = "/flask/augment_download"

@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({'error':'No file in request'}), 400
    
    file = request.files['file']

    if file.filename == '':
        return jsonify({'error':'No selected file'}), 400
    
    if not file.filename.endswith('.csv'):
        return jsonify({'error':'Only CSV files are allowed'}), 400
    
    try:
        # 1. 로컬에 사용자 업로드 파일 저장
        new_filename = "uploaded_file.csv"
        filepath = os.path.join(app.config['USER_DATA'], new_filename)
        file.save(filepath)

         # 2. 파일을 원격 서버로 전송
        with open(filepath, 'rb') as f:
            files = {'file': (new_filename, f)}
            remote_response = requests.post(
                f"{REMOTE_SERVER_URL}{REMOTE_SERVER_UPLOAD_ROUTE}", 
                files=files
            )

        if remote_response.status_code != 200:
            return jsonify({'error': 'Failed to send file to remote server'}), 500
        
        received_files = []
        for aug_type in ['SR', 'RI', 'RS', 'RD']:
            response = requests.get(
                f"{REMOTE_SERVER_URL}{REMOTE_SERVER_AUGMENT_DOWNLOAD_ROUTE}", 
                params={'aug_type': aug_type}
            )
            if response.status_code == 200:
                # 받은 파일을 로컬에 저장
                file_content = response.content
                file_name = f"data_{aug_type.lower()}.csv"
                file_path = os.path.join(app.config['USER_DATA'], file_name)
                with open(file_path, 'wb') as local_file:
                    local_file.write(file_content)
                received_files.append(file_path)
            else:
                return jsonify({'error': f'Failed to download file for augType: {aug_type}'}), 500

        return jsonify({
            'message': 'File uploaded and augmented files saved successfully',
            'saved_files': received_files
        }), 200
        

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/download', methods=['GET'])
def download():
    aug_type = request.args.get('augType', 'default')

    if aug_type == 'default':
        return jsonify({'error':'증강 기법을 선택해주세요.'}), 400
    
    try:
        filepath = os.path.join(USER_DATA, f'data_{aug_type.lower()}.csv')

        if not os.path.exists(filepath):
            return jsonify({'error': f'File not found for augType: {aug_type}'}), 404

        # 클라이언트로 CSV 파일 전송
        return send_file(
            filepath,
            mimetype='text/csv',
            as_attachment=True,
            download_name='augmented_dataset.csv'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

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

REMOTE_SERVER_URL = "https://team-e.gpu.seongbum.com"
REMOTE_SERVER_TSNE_ROUTE = "/flask/t-sne"
@ns.route('/t-sne')
# Flask-RESTX를 사용하여 API 엔드포인트 등록
class TSNEVisualization(Resource):
    @ns.doc('t_sne_visualization')
    def get(self):
        #augmentation_type = request.get_json()
        #print(augmentation_type)
        
        try:
            # 원격 서버로 POST 요청
            response = requests.get(REMOTE_SERVER_URL + REMOTE_SERVER_TSNE_ROUTE)#, json=augmentation_type)
            response.raise_for_status()  # 요청 성공 여부 확인

            # 응답 데이터를 JSON 형식으로 파싱
            tsne_data = response.json()
            print(tsne_data)
            
            return {
                "message":"fetch Done.",
                "data":tsne_data
            }, 200
            # JSON 데이터를 Pandas DataFrame으로 변환
            #df = pd.DataFrame(tsne_data)
            
            # 데이터를 JSON 파일로 저장
            #save_path = "static/json/"
            #df.to_json(save_path + 'tsne_visualization.json', orient='records', indent=4, force_ascii=False)
            
            #return {
            #    "message": "t-SNE visualization data saved successfully as JSON.",
            #    "data_preview": df.head().to_dict(orient='records')  # 데이터 미리보기 반환
            #}, 200
        except requests.exceptions.RequestException as e:
            # 요청 중 오류가 발생한 경우
            return {
                "message": "Failed to fetch t-SNE data from remote server.",
                "error": str(e)
            }, 500
        except ValueError:
            # 응답 데이터가 JSON 형식이 아닌 경우
            return {
                "message": "Invalid JSON response from remote server."
            }, 500


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
REMOTE_SERVER_CHATBOT_ROUTE = "/flask/chatbot"
@ns.route('/chatbot')
class CHATBOT(Resource):
    @ns.doc('chatbot_data')  # Swagger 문서 설명
    @ns.expect(chatbot_model)
    def post(self):  # 브라우저에서 데이터를 받는 POST 요청 처리
        try:
            # 브라우저에서 전달받은 JSON 데이터 가져오기
            client_data = request.get_json()
            print(f"Received data from client: {client_data}")

            augtype = client_data['augmentationType']
            print(client_data['augmentationType'])
            response = requests.post(REMOTE_SERVER_URL + "/flask/chatbot", json=client_data)

            # 원격 서버의 응답 처리
            if response.status_code == 200:
                remote_data = response.json()  # 원격 서버로부터 받은 응답 데이터
                print(f"Received response from remote server: {remote_data}")
                return {'status': 'success', 'data': remote_data}, 200
            else:
                return {'status': 'fail', 'message': 'Error from remote server'}, response.status_code

        except requests.exceptions.RequestException as e:
            return {'status': 'error', 'message': str(e)}, 500

if __name__ == '__main__':
    app.run(debug=True)
