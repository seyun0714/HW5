// tsne.js

// t-SNE 이미지 업데이트 함수
function updateTsneImage(augmentationType) {
    // t-SNE 이미지 컨테이너 가져오기
    const tsneContainer = document.getElementById('tsne');

    // 기존 이미지를 제거
    tsneContainer.innerHTML = '';

    // 새로운 이미지를 추가
    const img = document.createElement('img');
    img.src = `/t-sne?type=${augmentationType}`;
    img.alt = `t-SNE Plot for ${augmentationType}`;
    img.style.width = '100%';
    img.style.height = 'auto';
    img.style.border = '1px solid #ddd';

    tsneContainer.appendChild(img);
}

// 버튼 클릭 이벤트 핸들러
document.getElementById('btn-structure').addEventListener('click', () => updateTsneImage('structure'));
document.getElementById('btn-noise').addEventListener('click', () => updateTsneImage('noise'));
document.getElementById('btn-replace').addEventListener('click', () => updateTsneImage('replace'));
document.getElementById('btn-context').addEventListener('click', () => updateTsneImage('context'));

// 초기 t-SNE 이미지를 로드
updateTsneImage('default');
