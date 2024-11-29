// Perplexity 그래프
$(document).ready(function(){

    // 한 칸에 해당하는 크기 설정
    var cardBody = $("#perplexity").closest(".card-body");
    const margin = {top: 50, right: 30, bottom: 40, left:50};
    var height = cardBody.height() - margin.left - margin.right;
    var width = cardBody.width() - margin.top - margin.bottom;

    // 증강 기법 선택 버튼 생성
    d3.select(".aug-button")
    .append("button")
    .text("문장 구조 변경")
    .on("click", function() {
        update(data1);
    });
    
    d3.select(".aug-button")
    .append("button")
    .text("노이즈 추가")
    .on("click", function() {
        update(data2); 
    });

    d3.select(".aug-button")
    .append("button")
    .text("단어 대체")
    .on("click", function() {
        update(data3);
    });
    
    d3.select(".aug-button")
    .append("button")
    .text("문맥적 삽입")
    .on("click", function() {
        update(data4); 
    });


    // 기본 위치 설정
    const svg = d3.select("#perplexity")
        .append("svg")
        .attr("width", width+margin.left+margin.right)
        .attr("height", height+margin.top+margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    svg.append("text")
        .attr("x", width/2)
        .attr("y", -30)
        .attr("text-anchor", "middle")
        .attr("font-size", "15px")
        .attr("font-weight", "bold")
        .text("Perplexity 지표");

    svg.append("text")
        .attr("x", width - 50)
        .attr("y", height + margin.bottom -10)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .text("augmentation");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", height - 220)
        .attr("y", -margin.left + 20)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .text("perplexity");



    // Todo: perplexity 지표 불러오기
    // 임시로 로컬 데이터 선언
    var data1 = [
        {name: "base", value: 4.0},
        {name: "base2", value: 4.6},
        {name: "문장 구조 변경", value: 5.0}
    ];
    var data2 = [
        {name: "base", value: 4.0},
        {name: "base2", value: 4.6},
        {name: "노이즈 추가", value: 7.3}
    ];
    var data3 = [
        {name: "base", value: 4.0},
        {name: "base2", value: 4.6},
        {name: "단어 대체", value: 6.1}
    ];
    var data4 = [
        {name: "base", value: 4.0},
        {name: "base2", value: 4.6},
        {name: "문맥적 삽입", value: 5.7}
    ];
     
    let x = d3.scaleBand()
        .domain(data1.map(d => d.name))
        .range([0, width])
        .padding(0.4);

    const y = d3.scaleLinear()
        .domain([0, 10.0])
        .range([height, 0]);

    // x축 생성
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    // y축 생성
    svg.append("g")
        .call(d3.axisLeft(y))
        .attr("class", "y-axis");

    // 증강 기법 버튼 클릭 시 변경
    function update(data) {
        x = d3.scaleBand()
            .domain(data.map(d => d.name))
            .range([0, width])
            .padding(0.4);

        svg.select(".x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));

        var u = svg.selectAll("rect")
            .data(data)
            .join("rect")
            .transition()
            .duration(1000)
            .attr("x", d => x(d.name))
            .attr("y", d => y(d.value))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.value))
            .attr("fill", "#69b3a2")
        }
    // 초기 로드
    update(data1);
});