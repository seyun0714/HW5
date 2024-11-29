from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/t-sne')
def t_sne():
    return "OK"

@app.route('/perplexity')
def t_sne():
    return "OK"

@app.route('/augmentation')
def t_sne():
    return "OK"

@app.route('/chatbot')
def t_sne():
    return "OK"

if __name__ == '__main__':
    app.run(debug=True)