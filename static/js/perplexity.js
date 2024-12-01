// Perplexity 그래프
$(document).ready(function () {
    // 초기 위치 및 SVG 생성
    const cardBody = $("#perplexity").closest(".card-body");
    const margin = { top: 50, right: 30, bottom: 40, left: 50 };
    const height = cardBody.height() - margin.left - margin.right;
    const width = cardBody.width() - margin.top - margin.bottom;

    const svg = d3.select("#perplexity")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -30)
        .attr("text-anchor", "middle")
        .attr("font-size", "15px")
        .attr("font-weight", "bold")
        .text("Perplexity 지표");

    svg.append("text")
        .attr("x", width - 50)
        .attr("y", height + margin.bottom - 10)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .text("augmentation");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -(height / 2))
        .attr("y", -margin.left + 20)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .text("perplexity");

    const y = d3.scaleLinear().domain([0, 10.0]).range([height, 0]);

    svg.append("g").attr("class", "y-axis").call(d3.axisLeft(y));

    // updatePerplexity 함수를 정의하고 window 객체에 바인딩
    function updatePerplexity(type) {
        // API 호출
        fetch(`/perplexity?type=${type}`)
            .then(response => response.json())
            .then(data => {
                const x = d3.scaleBand()
                    .domain(data.map(d => d.name))
                    .range([0, width])
                    .padding(0.4);

                // x축 업데이트
                svg.selectAll(".x-axis").remove();
                svg.append("g")
                    .attr("class", "x-axis")
                    .attr("transform", `translate(0,${height})`)
                    .call(d3.axisBottom(x));

                // 막대그래프 업데이트
                svg.selectAll("rect")
                    .data(data)
                    .join("rect")
                    .attr("x", d => x(d.name))
                    .attr("y", d => y(d.value))
                    .attr("width", x.bandwidth())
                    .attr("height", d => height - y(d.value))
                    .attr("fill", "#69b3a2");

                // 데이터 이름 표시
                svg.selectAll(".label").remove();
                svg.selectAll(".label")
                    .data(data)
                    .enter()
                    .append("text")
                    .attr("class", "label")
                    .attr("x", d => x(d.name) + x.bandwidth() / 2)
                    .attr("y", d => y(d.value) - 5) // 막대 위에 표시
                    .attr("text-anchor", "middle")
                    .attr("font-size", "12px")
                    .text(d => d.name); // 데이터 이름 표시
            })
            .catch(error => console.error("Error fetching data:", error));
    }

    // 전역 범위로 노출
    window.updatePerplexity = updatePerplexity;

    // 기본 데이터 로드
    updatePerplexity('structure');
});
