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

function updateDashboard(augType) {
    updatePerplexity(augType);
    updateTSNE(augType);
    updateAugData(augType);
    updateChatbot(augType);
    updateUtility(augType);
}

function updatePerplexity(augType) {
    var perplexityData = [];
    fetch("/perplexity", {
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
        var cardBody = $("#perplexity").closest(".card-body");
        const margin = {top: 50, right: 30, bottom: 40, left:50};
        var height = cardBody.height() - margin.top - margin.bottom;
        var width = cardBody.width() - margin.left - margin.right;
        // 최소 크기 설정
        height = Math.max(height, 150);
        width = Math.max(width, 350);
        d3.select("#perplexity").select("svg").remove();

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

function updateTSNE(augType) {
    console.log(augType);
}

function updateAugData(augType) {
    // API 호출
    d3.json(`/augmentation?augmentationType=${augType}`)
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

function updateChatbot() {
    $(".chatbot-input").val("");
    $(".chatbot-output").text("여기에 답변이 표시됩니다.");
    $(".chatbot-output").css("opacity", 0.54);
}

function updateUtility(augType) {
    if(augType != "default"){
        $(".csv-download-button").removeClass("disabled");
        $(".csv-download-text").text(augType + ".csv 다운로드");
    }
    else{
        $(".csv-download-button").addClass("disabled");
        $(".csv-download-text").text("증강 데이터셋 다운로드");
    }
}

