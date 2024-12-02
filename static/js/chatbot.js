$(document).ready(function(){
    $(".chatbot-button").on("click", function(){
        var augType = $(".aug-select").val();
        var content = $(".chatbot-input").val();
        if(content == ""){
            $(".chatbot-output").text("여기에 답변이 표시됩니다.");
            $(".chatbot-output").css("opacity", 0.54);
            return;
        }
        getChatbotResult(augType, content);
    });
});

function getChatbotResult(augType, content){
    fetch("/chatbot", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({augType: augType, content: content})
    })
    .then(response => response.json())
    .then(data => {
        $(".chatbot-output").text(data.result);
        $(".chatbot-output").css("opacity", 1);
    });
}