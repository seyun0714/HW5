        // SVG 크기 설정
        const width = 800;
        const height = 400;
        const margin = 40; // 축을 위한 여백

        // SVG 추가
        const svg = d3.select("#tsne")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        // t-SNE JSON 데이터 불러오기
        d3.json("/static/tsne_result.json").then(data => {
            // X, Y 범위 계산
            const xExtent = d3.extent(data, d => d.x);
            const yExtent = d3.extent(data, d => d.y);

            // 스케일 정의
            const xScale = d3.scaleLinear()
                .domain(xExtent)
                .range([margin, width - margin]);

            const yScale = d3.scaleLinear()
                .domain(yExtent)
                .range([height - margin, margin]);

            // 축 추가
            const xAxis = d3.axisBottom(xScale);
            const yAxis = d3.axisLeft(yScale);

            svg.append("g")
                .attr("transform", `translate(0, ${height - margin})`)
                .call(xAxis);

            svg.append("g")
                .attr("transform", `translate(${margin}, 0)`)
                .call(yAxis);

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

            // 축 레이블 추가
            svg.append("text")
                .attr("x", width / 2)
                .attr("y", height - 10)
                .attr("text-anchor", "middle")
                .attr("font-size", "12px")
                .text("t-SNE X-Axis");

            svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("x", -height / 2)
                .attr("y", 15)
                .attr("text-anchor", "middle")
                .attr("font-size", "12px")
                .text("t-SNE Y-Axis");
        }).catch(error => {
            console.error("Error loading JSON:", error);
        });
