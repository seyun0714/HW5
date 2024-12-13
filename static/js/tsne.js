$(document).ready(async function(){
    await fetch("/data_routes/t-sne")
    .then(response => response.json())
    .then(data =>{
       tsneData = data.data
       console.log(tsneData)
       
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
       //d3.json("/static/json/tsne_visualization.json").then(data => {
           // X, Y 범위 계산
           const xExtent = d3.extent(tsneData, d => d.x);
           const yExtent = d3.extent(tsneData, d => d.y);
   
           // 스케일 정의
           const xScale = d3.scaleLinear()
               .domain(xExtent)
               .range([margin.left, width - margin.right]);
   
           const yScale = d3.scaleLinear()
               .domain(yExtent)
               .range([height, margin.top]);
   
           // 데이터 포인트 추가
           svg.selectAll(".point")
               .data(tsneData)
               .join("circle")
               .attr("class", "point")
               .attr("cx", d => xScale(d.x))
               .attr("cy", d => yScale(d.y))
               .attr("r", 5)
               .attr("fill", d => d.color);
   
           
           // Legend 추가
           const legendData = [
               {name: "origin", color: "#ffff57"},
               {name: "SR", color: "#a1dab4"},
               {name: "RI", color: "#41b6c4"},
               {name: "RS", color: "#2c7fb8"},
               {name: "RD", color: "#253494"}
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
       }).catch(error => {
           console.error("Error loading JSON:", error);
       });

});