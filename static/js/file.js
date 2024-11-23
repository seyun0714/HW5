// 파일 드래그 앤 드롭 함수 구현
// 데이터셋 업로드 -> 메인 페이지 흐름
document.addEventListener('DOMContentLoaded', () => {
    const drop = document.querySelector('.file-container');

    drop.addEventListener('dragover', (event)=>{
        event.preventDefault();
        drop.style.backgroundColor = '#e0e0e0';
    });

    drop.addEventListener('dragleave', ()=>{
        drop.style.backgroundColor = '#eb6363a6';
    })

    drop.addEventListener('drop', (event)=>{
        event.preventDefault();
        drop.style.backgroundColor = '#f0f0f0';

        const files = event.dataTransfer.files;
        
        console.log(files);
        
        window.location.href='index.html';
    });

    drop.addEventListener('click', () =>{
        const fileInput = document.querySelector('input');
        fileInput.click();
    })
});