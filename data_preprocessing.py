import re
from pykospacing import spacing
import kss
from hanspell import spell_check
from soynlp.normalizer import *
from PyKomoran import *

# 불용어 처리
punct = "/-'?!.,#$%\'()*+-/:;<=>@[\\]^_`{|}~" + '""“”’' + '∞θ÷α•à−β∅³π‘₹´°£€\×™√²—–&'
punct_mapping = {"‘": "'", "₹": "e", "´": "'", "°": "", "€": "e", "™": "tm", "√": " sqrt ", "×": "x", "²": "2", "—": "-", "–": "-", "’": "'", "_": "-", "`": "'", '“': '"', '”': '"', '“': '"', "£": "e", '∞': 'infinity', 'θ': 'theta', '÷': '/', 'α': 'alpha', '•': '.', 'à': 'a', '−': '-', 'β': 'beta', '∅': '', '³': '3', 'π': 'pi', } 

def clean(text, punct, mapping):
    for p in mapping:
        text = text.replace(p, mapping[p])
    
    for p in punct:
        text = text.replace(p, f' {p} ')
    
    specials = {'\u200b': ' ', '…' : ' ... ', '\ufeff' : '', 'करना': '', 'है': ''}
    for s in specials:
        text = text.replace(s, specials[s])
    
    return text.strip()

def clean_str(text):
    pattern = '([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)' # E-mail제거
    text = re.sub(pattern=pattern, repl='', string=text)
    pattern = '(http|ftp|https)://(?:[-\w.]|(?:%[\da-fA-F]{2}))+' # URL제거
    text = re.sub(pattern=pattern, repl='', string=text)
    pattern = '([ㄱ-ㅎㅏ-ㅣ]+)'  # 한글 자음, 모음 제거
    text = re.sub(pattern=pattern, repl='', string=text)
    pattern = '<[^>]*>'         # HTML 태그 제거
    text = re.sub(pattern=pattern, repl='', string=text)
    pattern = '[^\w\s\n]'         # 특수기호제거
    text = re.sub(pattern=pattern, repl='', string=text)
    text = re.sub('[-=+,#/\?:^$.@*\"※~&%ㆍ!』\\‘|\(\)\[\]\<\>`\'…》]','', string=text)
    text = re.sub('\n', '.', string=text)
    return text 

# 띄어쓰기 삽입 
# pip install git+https://github.com/haven-jeon/PyKoSpacing.git
# import kss
print(spacing("김형호영화시장분석가는'1987'의네이버영화정보네티즌	10점평에서언급된단어들을지난해12월27일부터올해1월10일까지통계프로그램R과KoNLP패키지로텍스트마이닝하여분석했다."))

# 문장 분리
# pip install kss ? 
s = "회사 동료 분들과 다녀왔는데 분위기도 좋고 음식도 맛있었어요 다만, 강남 토끼정이 강남 쉑쉑버거 골목길로 쭉 올라가야 하는데 다들 쉑쉑버거의 유혹에 넘어갈 뻔 했답니다 강남역 맛집 토끼정의 외부 모습."
for sent in kss.split_sentences(s):
    print(sent)

# 맞춤법 검사
# pip install py-hanspell
# from hanspell import spell_check
result = spell_checker.check(u'안녕 하세요. 저는 한국인 입니다. 이문장은 한글로 작성됬습니다.')
result.as_dict()  # dict로 출력
# {'checked': '안녕하세요. 저는 한국인입니다. 이 문장은 한글로 작성됐습니다.',
#  'errors': 4,
#  'original': '안녕 하세요. 저는 한국인 입니다. 이문장은 한글로 작성됬습니다.',
#  'result': True,
#  'time': 0.07065701484680176,
#  'words': {'안녕하세요.': 2,
#            '저는': 0,
#            '한국인입니다.': 2,
#            '이': 2,
#            '문장은': 2,
#            '한글로': 0,
#            '작성됐습니다.': 1}}


# 정규화(반복되는 이모티콘, 단어 정규화)
# pip install soynlp
# from soynlp.normalizer import *
print(repeat_normalize('와하하하하하하하하하핫', num_repeats=2))


# 표제어 추출
def lemmatize(sentence):
    morphtags = komoran.pos(sentence)
    words = []
    for m, t in enumerate(morphtags) :
      k = t.get_pos()
      if k=='NNP' or k=='NNG' :
        words.append(t.get_morph())
      elif k=='VA' or k=='VV' :
        words.append(t.get_morph()+'다')
    return words

w_ = []
for i in range(len(sunstic)) :
  words = lemmatize(sunstic.iloc[i]['review'])
  w_.append(' '.join(words))
df['words'] = w_  
df = df[df['words']!='']

# 형태소 분석
# pip install PyKomoran # 코모란 설치 
# from PyKomoran import *

komoran= Komoran(DEFAULT_MODEL['LIGHT'])
n_= []

for i in range(len(sunstic)):
  nouns = komoran.get_morphes_by_tags(sunstic.iloc[i]['review'], tag_list=['NNP', 'NNG','VA']) #추출할 tag 리스트 
  n_.append(' '.join(nouns))
df['nouns'] = n_
df = df[df['nouns']!='']