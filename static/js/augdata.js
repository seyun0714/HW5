// 데이터 가져오기 및 화면 표시
function fetchAndDisplayAugmentationData(augmentationType) {
    // API 호출
    d3.json(`/augmentation?augmentationType=${augmentationType}`)
        .then(data => {
            // 데이터 컨테이너 가져오기
            const container = d3.select('#augdata');

            // 기존 데이터를 제거
            container.selectAll('.data-item').remove();

            // 새로운 데이터 표시
            container.selectAll('.data-item')
                .data(data)
                .enter()
                .append('div')
                .attr('class', 'data-item')
                .text(d => `Origin: ${d.origin}, Aug: ${d.aug}`);
        })
        .catch(error => console.error('Error fetching data:', error));
}
`;

// 스타일 요소 추가
d3.select("head")
  .append("style")
  .html(style);

// 각 데이터 항목에 대해 Bootstrap 카드를 생성
data.forEach(function(d) {
    // 컬럼 생성
    var col = scrollableDiv.append("div")
        .attr("class", "col-12"); // 1열로 설정

    // 카드 생성
    var card = col.append("div")
        .attr("class", "card mb-3");

// HTML에 이미 생성된 버튼에 이벤트 핸들러 추가
document.getElementById('btn-structure').addEventListener('click', () => fetchAndDisplayAugmentationData('structure'));
document.getElementById('btn-noise').addEventListener('click', () => fetchAndDisplayAugmentationData('noise'));
document.getElementById('btn-replace').addEventListener('click', () => fetchAndDisplayAugmentationData('replace'));
document.getElementById('btn-context').addEventListener('click', () => fetchAndDisplayAugmentationData('context'));

// 기본 데이터 로드
fetchAndDisplayAugmentationData('default');
