$(document).ready(function() {
    $('#prev-btn').show();
    updateDashboard("default");

    var augSelect = $(".aug-select");
    var augButton = $(".aug-button");
    augButton.on("click", function() {
        console.log(augSelect.val());
        if (augSelect.val() == "default") {
            return;
        }
        updateDashboard(augSelect.val());
    });

    // 윈도우 리사이즈 이벤트 핸들러 추가
    $(window).on('resize', _.debounce(function() {
        if ($('.aug-select').val()) {
            updateDashboard($('.aug-select').val());
        } else {
            updateDashboard("default");
        }
    }, 250));
});

async function updateDashboard(augType) {
    await Promise.all([
        updatePerplexity(augType),
        updateTSNE(augType),
        updateAugData(augType),
        updateChatbot(augType),
        updateUtility(augType)
    ]);
}

async function updatePerplexity(augType) {
    var perplexityData = [];
    await fetch("/perplexity", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({augType: augType})
    })
    .then(response => response.json())
    .then(data => {
        perplexityData = data;
        console.log(perplexityData);
        // 한 칸에 해당하는 크기 설정
        const cardBody = $("#perplexity").closest(".card-body");
        const margin = {top: 50, right: 20, bottom: 40, left:50};
        var height = cardBody.height() - margin.top - margin.bottom;
        var width = cardBody.width() - margin.left - margin.right;
        d3.select("#perplexity").select("svg").remove();
        console.log("perplexity : " + cardBody.height(), cardBody.width());


        // 기본 위치 설정
        const svg = d3.select("#perplexity")
            .append("svg")
            .attr("width", width+margin.left+margin.right)
            .attr("height", height+margin.top+margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        svg.append("text")
            .attr("x", width - 50)
            .attr("y", height + margin.bottom -10)
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .text("Augmentation")
            .attr("font-family", "Poppins, Noto Sans KR, sans-serif");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", height - 270)
            .attr("y", -margin.left + 10)
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .text("Perplexity")
            .attr("font-family", "Poppins, Noto Sans KR, sans-serif");

        let x = d3.scaleBand()
            .domain(perplexityData.map(d => d.name))
            .range([0, width])
            .padding(0.5);

        const y = d3.scaleLinear()
            .domain([0, d3.max(perplexityData, d => d.value) * 1.2])
            .range([height, 0]);

        // 차트 배경에 그리드 추가
        svg.append("g")
            .attr("class", "grid")
            .call(d3.axisLeft(y)
                .tickSize(-width)
                .tickFormat("")
            )
            .style("stroke-dasharray", "3,3")
            .style("opacity", 0.1);

        // x축 스타일 개선
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .attr("font-family", "Poppins, Noto Sans KR, sans-serif")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("font-size", "11px")
            .style("font-weight", "500");

        // y축 스타일 개선
        svg.append("g")
            .call(d3.axisLeft(y))
            .attr("font-family", "Poppins, Noto Sans KR, sans-serif")
            .attr("class", "y-axis")
            .selectAll("text")
            .style("font-size", "11px")
            .style("font-weight", "500");

        svg.selectAll("rect")
            .data(perplexityData)
            .join("rect")
            .attr("x", d => x(d.name))
            .attr("y", height)
            .attr("width", x.bandwidth())
            .attr("height", 0)
            .attr("fill", "#6C8EBF")
            .attr("rx", 4)  // 모서리 둥글게
            .attr("ry", 4)  // 모서리 둥글게
            .style("filter", "drop-shadow(0px 2px 3px rgba(0,0,0,0.1))") // 그림자 효과
            .append("title")
            .text(d => `${d.name}\n값: ${d.value.toFixed(2)}`)
            .select(function() { return this.parentNode; })
            .on("mouseover", function() {
                d3.select(this)
                    .attr("fill", "#4A6FA5")
                    .style("filter", "drop-shadow(0px 4px 6px rgba(0,0,0,0.2))");
            })
            .on("mouseout", function() {
                d3.select(this)
                    .attr("fill", "#6C8EBF")
                    .style("filter", "drop-shadow(0px 2px 3px rgba(0,0,0,0.1))");
            })
            .transition()
            .duration(1000)
            .ease(d3.easeLinear)
            .attr("y", d => y(d.value))
            .attr("height", d => Math.max(0, height - y(d.value)));
    })
    .catch(error => {
        console.error("Error fetching perplexity data:", error);
    });
}

async function updateTSNE(augType) {
    // await fetch("/t-sne", {
    //     method: 'POST',
    //     headers: {
    //         "Content-Type": "application/json"
    //     },
    //     body: JSON.stringify({augType: augType})
    // })
    // .then(response => response.json())
    // .then(data =>{
    //     // Todo : api 호출 후 t-sne 가져오도록
    // })
    const cardBody = $("#tsne").closest(".card-body");
    const margin = {top: 20, right: 20, bottom: 20, left: 20};
    var height = cardBody.height() - margin.top - margin.bottom;
    var width = cardBody.width() - margin.left - margin.right;
    d3.select("#tsne").select("svg").remove();
    console.log("tsne : " + cardBody.height(), cardBody.width());

    // 기본 위치 설정
    const svg = d3.select("#tsne")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // t-SNE JSON 데이터 불러오기
    d3.json("/static/json/tsne_result.json").then(data => {
        // X, Y 범위 계산
        const xExtent = d3.extent(data, d => d.x);
        const yExtent = d3.extent(data, d => d.y);

        // 스케일 정의
        const xScale = d3.scaleLinear()
            .domain(xExtent)
            .range([margin.left, width - margin.right]);

        const yScale = d3.scaleLinear()
            .domain(yExtent)
            .range([height, margin.top]);

        // 데이터 포인트 추가
        svg.selectAll(".point")
            .data(data)
            .join("circle")
            .attr("class", "point")
            .attr("cx", d => xScale(d.x))
            .attr("cy", d => yScale(d.y))
            .attr("r", 5)
            .attr("fill", d => d.color);

        // 단어 레이블 추가
        svg.selectAll(".label")
            .data(data)
            .join("text")
            .attr("x", d => xScale(d.x))
            .attr("y", d => yScale(d.y))
            .attr("dx", 8)
            .attr("dy", 4)
            .attr("font-size", 10)
            .text(d => d.word)
            .attr("font-family", "Poppins, Noto Sans KR, sans-serif");

        // Legend 추가
        const legendData = [
            {name: "origin", color: "red"},
            {name: "SR", color: "skyblue"},
            {name: "RI", color: "orange"},
            {name: "RS", color: "green"},
            {name: "RD", color: "yellow"}
        ];

        const legendGroup = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${margin.left}, 0)`); // 좌상단 위치

        legendData.forEach((d, i) => {
            const legendItem = legendGroup.append("g")
                .attr("transform", `translate(0, ${i * 20})`); // 각 항목 간격

            // 색상 박스
            legendItem.append("rect")
                .attr("width", 15)
                .attr("height", 15)
                .attr("fill", d.color);

            // 텍스트
            legendItem.append("text")
                .attr("x", 20)
                .attr("y", 12)
                .attr("font-size", "12px")
                .text(d.name)
                .attr("font-family", "Poppins, Noto Sans KR, sans-serif");
        });

        // 축 레이블 제거 (X, Y 이름 삭제)
    }).catch(error => {
        console.error("Error loading JSON:", error);
    });
}
    

async function updateAugData(augType) {
    var fetchdata = []
    // API 호출
    await d3.json(`/data_routes/augmentation?augmentationType=${augType}`)
        .then(data => {

            fetchdata = data;
            // // 데이터 컨테이너 가져오기
            // const container = d3.select('#augdata');
            //
            // // 기존 데이터를 제거
            // container.selectAll('.data-item').remove();
            //
            // // 새로운 데이터 표시
            // container.selectAll('.data-item')
            //     .data(data)
            //     .enter()
            //     .append('div')
            //     .attr('class', 'data-item')
            //     .text(d => `Origin: ${d.origin}, Aug: ${d.aug}`);
        })
        .catch(error => console.error('Error fetching data:', error));

        var data = [
            {"origin" : "1", "aug": "1"},
            {"origin" : "2", "aug": "2"},
            {"origin" : "3", "aug": "3"},
            {"origin" : "4", "aug": "4"},
            {"origin" : "5", "aug": "5"},
            {"origin" : "6", "aug": "6"},
        ]

        // 스타일 요소 추가
        d3.select("head")
        .append("style")
        .html(style);

        // 각 데이터 항목에 대해 Bootstrap 카드를 생성
        fetchdata.forEach(function(d) {
           
        });

    const augContainer = d3.select("#aug-container");
    let currentIndex = 0;

    // 이벤트 리스너 설정
    d3.select(".aug-prev-btn").on("click", () => showCard(currentIndex - 1));
    d3.select(".aug-next-btn").on("click", () => showCard(currentIndex + 1));

    function showCard(index) {
        // 인덱스 범위 확인
        if (index < 0 || index >= data.length) return;
        
        currentIndex = index;
        
        // 카드 컨테이너 초기화
        augContainer.selectAll("*").remove();

        // 원본 질문
        augContainer.append("div")
            .attr("class", "aug-card-header")
            .html(`<div class="aug-card-label">origin Q</div><div class="aug-card-content">${data[index].origin}</div>`);

        // 증강된 질문
        augContainer.append("div")
            .attr("class", "aug-card-body")
            .html(`<div class="aug-card-label">aug Q</div><div class="aug-card-content">${data[index].aug}</div>`);
                
        // 버튼 활성화/비활성화
        d3.select(".aug-prev-btn")
            .classed("disabled", currentIndex === 0)
            .style("visibility", currentIndex === 0 ? "hidden" : "visible");
        d3.select(".aug-next-btn")
            .classed("disabled", currentIndex === data.length - 1)
            .style("visibility", currentIndex === data.length - 1 ? "hidden" : "visible");
    }

    // 초기 카드 표시
    showCard(0);
}

async function updateChatbot() {
    $(".chatbot-input").val("");
    $(".chatbot-output").text("여기에 답변이 표시됩니다.");
    $(".chatbot-output").css("opacity", 0.54);
}

async function updateUtility(augType) {
    if(augType != "default"){
        $(".csv-download-button").removeClass("disabled");
        $(".csv-download-text").text(augType + ".csv 다운로드");
    }
    else{
        $(".csv-download-button").addClass("disabled");
        $(".csv-download-text").text("증강 데이터셋 다운로드");
    }
}