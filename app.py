from flask import Flask, render_template, request, jsonify, send_file
import matplotlib.pyplot as plt
from sklearn import datasets
from sklearn.manifold import TSNE
import io


app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/t-sne')
def t_sne():
    # 증강 기법(type) 파라미터 가져오기
    augmentation_type = request.args.get('type', 'default')

    # Data Load (MNIST: 64 dim)
    digits = datasets.load_digits()
    X = digits.data
    y = digits.target

    # t-SNE (64 to 2)
    tsne = TSNE(n_components=2, random_state=1)
    X_tsne = tsne.fit_transform(X)

    # Create t-SNE Visualization
    plt.figure(figsize=(10, 7))
    scatter = plt.scatter(X_tsne[:, 0], X_tsne[:, 1], c=y, cmap='viridis')
    plt.colorbar(scatter)
    plt.title(f"t-SNE Visualization: {augmentation_type}")
    plt.xlabel("t-SNE Component 1")
    plt.ylabel("t-SNE Component 2")

    # Save the plot to a BytesIO object
    img = io.BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    plt.close()

    # Return the image
    return send_file(img, mimetype='image/png')

@app.route('/perplexity')
def perplexity():
    # 요청된 증강 기법에 따라 데이터 반환
    aug_type = request.args.get('type', 'structure')
    data = {
        'structure': [
            {"name": "base", "value": 4.0},
            {"name": "base2", "value": 4.6},
            {"name": "문장 구조 변경", "value": 5.0},
        ],
        'noise': [
            {"name": "base", "value": 4.0},
            {"name": "base2", "value": 4.6},
            {"name": "노이즈 추가", "value": 7.3},
        ],
        'replace': [
            {"name": "base", "value": 4.0},
            {"name": "base2", "value": 4.6},
            {"name": "단어 대체", "value": 6.1},
        ],
        'context': [
            {"name": "base", "value": 4.0},
            {"name": "base2", "value": 4.6},
            {"name": "문맥적 삽입", "value": 5.7},
        ],
    }
    return jsonify(data.get(aug_type, []))

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