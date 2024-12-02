// 파일 드래그 앤 드롭 함수 구현
// 데이터셋 업로드 -> 메인 페이지 흐름
document.addEventListener('DOMContentLoaded', () => {
    const drop = document.querySelector('.file-container');

    // 파일 정보를 표시할 요소들 추가
    const fileInfoDiv = document.createElement('div');
    fileInfoDiv.className = 'file-info';
    fileInfoDiv.style.display = 'none';
    
    const fileName = document.createElement('p');
    const loadButton = document.createElement('button');
    loadButton.textContent = '로드';
    loadButton.className = 'my-btn load-button';
    
    fileInfoDiv.appendChild(fileName);
    fileInfoDiv.appendChild(loadButton);
    drop.appendChild(fileInfoDiv);

    drop.addEventListener('dragover', (event)=>{
        event.preventDefault();
        drop.style.backgroundColor = '#e0e0e0';
    });

    drop.addEventListener('dragleave', ()=>{
        drop.style.backgroundColor = '#eb6363a6';
    })

    // 파일 처리 함수
    const handleFile = (file) => {
        if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
            fileName.textContent = `선택된 파일: ${file.name}`;
            fileInfoDiv.style.display = 'block';
            drop.style.backgroundColor = '#f0f0f0';
            
            // 로드 버튼 클릭 이벤트
            loadButton.onclick = () => {
                window.location.href = 'index.html';
            };
        } else {
            alert('CSV 파일만 업로드 가능합니다.');
            drop.style.backgroundColor = '#eb6363a6';
            fileInfoDiv.style.display = 'none';
        }
    };

    drop.addEventListener('drop', (event) => {
        event.preventDefault();
        drop.style.backgroundColor = '#f0f0f0';

        const files = event.dataTransfer.files;
        
        if (files.length > 1) {
            alert('파일은 하나만 업로드 가능합니다.');
            drop.style.backgroundColor = '#eb6363a6';
            fileInfoDiv.style.display = 'none';
            return;
        }
        
        if (files.length === 1) {
            handleFile(files[0]);
        }
    });

    drop.addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.csv';
        fileInput.multiple = false;
        fileInput.click();
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                handleFile(file);
            }
        });
    });
});