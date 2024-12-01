// CSV 데이터를 문자열로 저장
var csvData = `Q,A,id
높이 길이를 좀 더 길게 해주실 수 있나요?,저희는 완제품을 판매하는 곳으로 따로 사이즈 제작은 어려운 점 양해 부탁드립니다.,1
그레이 커튼을 배송받았는데요레이스 커튼이 흰색이 아니고 회색이네요 잘못 온 건가요?,주문하신 상품은 레이스 커튼이 화이트로 구성되어 있어서 그레이 색으로 받으신 경우 잘못 받으신 겁니다.,2
거실 총길이가 가로 480세로 230인데 어떤 걸로 신청해야 하나요?,커튼은 설치할 곳에 1.5배 2배 정도로 생각하셔서 구매해 주시면 되세요.,4
레이스 커튼만 개별 구매 안 될까요?,현재 레이스 커튼은 따로 판매하고 있지 않은 점 양해 부탁드립니다. 다른 문의사항은 언제든 글 남겨주시구요.,5
화이트 구입 시 봉색이 화이트로 오나요?,참고하셔서 구매 부탁드립니다. 다른 문의사항은 언제든 글 남겨주시구요.,6
화이트 구입 시 봉색이 화이트로 오나요?,참고하셔서 구매 부탁드립니다. 다른 문의사항은 언제든 글 남겨주시구요.,6
화이트 구입 시 봉색이 화이트로 오나요?,참고하셔서 구매 부탁드립니다. 다른 문의사항은 언제든 글 남겨주시구요.,6
화이트 구입 시 봉색이 화이트로 오나요?,참고하셔서 구매 부탁드립니다. 다른 문의사항은 언제든 글 남겨주시구요.,6
화이트 구입 시 봉색이 화이트로 오나요?,참고하셔서 구매 부탁드립니다. 다른 문의사항은 언제든 글 남겨주시구요.,6`;

// CSV 데이터 파싱
var data = d3.csvParse(csvData);

// 컨테이너 선택 (Chart1 ID를 가진 div)
var container = d3.select("#augdata");

// 스크롤 가능한 div 생성
var scrollableDiv = container.append("div")
    .attr("class", "row scrollable");

// 스타일 추가
var style = `
.scrollable {
    max-height: 500px; /* 필요에 따라 조정 */
    overflow-y: auto;
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

    // 카드 헤더(Q)
    card.append("div")
        .attr("class", "card-header")
        .text("Q: " + d.Q);

    // 카드 바디(A)
    card.append("div")
        .attr("class", "card-body")
        .text("A: " + d.A);
});