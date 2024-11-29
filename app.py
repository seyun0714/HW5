from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/t-sne')
def t_sne():
    return "t-sne"

@app.route('/perplexity')
def perplexity():
    return "perplexity"

@app.route('/augmentation')
def augmentation():
    return "augmentation"

@app.route('/chatbot')
def chatbot():
    return "chatbot"

if __name__ == '__main__':
    app.run(debug=True)