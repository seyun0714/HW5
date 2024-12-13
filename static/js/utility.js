$(document).ready(function() {
    $('#prev-btn').click(function() {
        localStorage.removeItem('dataset-name');
        window.location.href = '/';
    });

    $('#download-btn').click(function() {
        // 다운로드 기능 구현
    });

     $("#aug-range").on("input", function() {
        $("#aug-range-value").text(this.value * 10 + "%");
    });
});