from flask import Flask, render_template, jsonify, request
from utils import calc_perplexity, tsne_visualization


app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

# @app.route('/t-sne')
# def t_sne():
#     augment_type = request.args.get()

#     # 선택 된 증강 기법에 해당하는 데이터 셋 지정
#     data = ""
    
#     # tsne_visualiztion 함수 내부에서 json 형식으로 값을 return
#     return tsne_visualization(data)

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

@app.route('/chatbot', methods=['POST'])
def chatbot():
    # input 가져오기    
    content = request.json.get('content')
    augType = request.json.get('augType')

    # 챗봇 응답 가져오기
    chatbot_result = content

    return jsonify({"result": chatbot_result})

if __name__ == '__main__':
    app.run(debug=True)