$(document).ready(function() {

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
        const margin = {top: 50, right: 40, bottom: 40, left:50};
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
            .text("augmentation");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", height - 220)
            .attr("y", -margin.left + 20)
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .text("perplexity");

        let x = d3.scaleBand()
            .domain(perplexityData.map(d => d.name))
            .range([0, width])
            .padding(0.4);

        const y = d3.scaleLinear()
            .domain([0, d3.max(perplexityData, d => d.value) * 1.2])
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

        svg.selectAll("rect")
            .data(perplexityData)
            .join("rect")
            .attr("x", d => x(d.name))
            .attr("y", height)
            .attr("width", x.bandwidth())
            .attr("height", 0)
            .attr("fill", "#4A6FA5")
            .append("title")
            .text(d => `name : ${d.name} \nvalue : ${d.value.toFixed(2)}`)
            .select(function() { return this.parentNode; })
            .on("mouseover", function() {
                d3.select(this)
                    .attr("fill", "#2C4875");
            })
            .on("mouseout", function() {
                d3.select(this)
                    .attr("fill", "#4A6FA5");
            })
            .transition()
            .duration(1000)
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
    const margin = {top: 20, right: 40, bottom: 20, left: 40};
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
    d3.json("/static/tsne_result.json").then(data => {
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
            .text(d => d.word);

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
                .text(d.name);
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

        // 컨테이너 선택 (Chart1 ID를 가진 div)
        var container = d3.select("#augdata");
        container.select("div").remove();


        // 스크롤 가능한 div 생성
        var scrollableDiv = container.append("div")
            .attr("class", "row scrollable");

        // 스타일 추가
        var style = `
        .scrollable {
            max-height : 350px;
            overflow-y: auto;
        }
        .scrollable::-webkit-scrollbar{
            display : none;
        }
        `;

        // 스타일 요소 추가
        d3.select("head")
        .append("style")
        .html(style);

        // 각 데이터 항목에 대해 Bootstrap 카드를 생성
        fetchdata.forEach(function(d) {
            // 컬럼 생성
            var col = scrollableDiv.append("div")
                .attr("class", "col-12"); // 1열로 설정

            // 카드 생성
            var card = col.append("div")
                .attr("class", "card mb-3");

            // 카드 헤더(Q)
            card.append("div")
                .attr("class", "card-header px-3")
                .text("origin Q: " + d.origin);

            // 카드 바디(A)
            card.append("div")
                .attr("class", "aug-card px-3")
                .text("aug Q: " + d.aug);
        });
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

