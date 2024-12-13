$(document).ready(function() {
    $('#prev-btn').show();
    $('#download-btn').show();
    $("#dataset-name").text(localStorage.getItem('dataset-name'));
    updateDashboard("default");

    var augSelect = $(".aug-select");
    var augButton = $(".aug-button");
    augButton.on("click", function() {
        updateDashboard(augSelect.val());
    });

});

async function updateDashboard(augType) {
    await Promise.all([
        updatePerformance(augType),
        updateTSNE(augType),
        updateAugData(augType),
        updateChatbot(augType),
        updateUtility(augType)
    ]);
}

function updatePerformance(augType) {
    const svg = d3.select("#performance").select("svg");
    
    svg.selectAll(".bar")
        .transition()
        .duration(300)
        .style("stroke", "none");

    if (augType !== "default") {
        svg.selectAll(".bar")
            .filter(function() {
                // x 위치를 기반으로 해당 augType의 막대들을 찾음
                const xPos = d3.select(this).attr("x");
                const xScale = d3.scaleBand()
                    .domain(["koGPT2", "base fine-tuned", "SR", "RI", "RS", "RD"])
                    .range([0, svg.node().getBoundingClientRect().width - 50]);
                const barGroup = xScale.domain()[Math.floor(xPos / xScale.step())];
                return barGroup === augType;
            })
            .transition()
            .duration(300)
            .style("stroke", "black")
            .style("stroke-width", 0.1);
    }
}

async function updateTSNE(augType) {
    // todo : 강조만 변경
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

        console.log(fetchdata);
        
        // var data = [
        //     {"origin" : "1", "aug": "1"},
        //     {"origin" : "2", "aug": "2"},
        //     {"origin" : "3", "aug": "3"},
        //     {"origin" : "4", "aug": "4"},
        //     {"origin" : "5", "aug": "5"},
        //     {"origin" : "6", "aug": "6"},
        // ]

        const augContainer = d3.select("#aug-container");
        let currentIndex = 0;

        // 이벤트 리스너 설정
        d3.select(".aug-prev-btn").on("click", () => showCard(currentIndex - 1));
        d3.select(".aug-next-btn").on("click", () => showCard(currentIndex + 1));

        function showCard(index) {
            // 인덱스 범위 확인
            if (index < 0 || index >= fetchdata.length) return;
            
            currentIndex = index;
            
            // 카드 컨테이너 초기화
            augContainer.selectAll("*").remove();

            var origin = fetchdata[index].origin;
            var aug = fetchdata[index].aug;

            if($(".aug-select").val() == "default"){
                origin = "증강 전 질문";
                aug = "증강 후 질문";
            }

            console.log(origin, aug);

            // 원본 질문
            augContainer.append("div")
                .attr("class", "aug-card-header")
                .html(`<div class="aug-card-label">origin Q</div><div class="aug-card-content">${origin}</div>`);

            // 증강된 질문
            augContainer.append("div")
                .attr("class", "aug-card-body")
                .html(`<div class="aug-card-label">aug Q</div><div class="aug-card-content">${aug}</div>`);
                    
            if($(".aug-select").val() == "default"){
                $(".aug-card-content").css("opacity", 0.54);
            }
            
            // 버튼 활성화/비활성화
            d3.select(".aug-prev-btn")
                .classed("disabled", currentIndex === 0)
                .style("visibility", currentIndex === 0 ? "hidden" : "visible");
            d3.select(".aug-next-btn")
                .classed("disabled", currentIndex === fetchdata.length - 1)
                .style("visibility", currentIndex === fetchdata.length - 1 ? "hidden" : "visible");
        }

        // 초기 카드 표시
        showCard(0);
}

async function updateChatbot(augType) {
    if(augType != "default"){
        $("#chatbot-title h5").text(augType + " Chatbot");
    }
    else{
        $("#chatbot-title h5").text("Base Chatbot");
    }
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