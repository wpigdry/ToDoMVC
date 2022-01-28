window.addEventListener('load', load);
function load () {
    const arrowContainer = document.querySelector('.message-arrow-wrap'); // 箭头容器
    const arrow = document.querySelector('.message-arrow'); // 箭头
    const content = document.querySelector('.message-list'); // 列表
    const item = document.getElementsByClassName('message-list-item'); // item容器
    const num = document.querySelector('.count-num'); // 未完成数量
    const all = document.querySelector('.all-btn'); // all按钮
    const active = document.querySelector('.active-btn'); // 未完成按钮
    const completed = document.querySelector('.completed-btn'); // 已完成按钮
    const input = document.querySelector('.message-val'); // 新增item
    const operation = document.getElementsByClassName('operation-wrap'); // 选中按钮
    const operationCtr = document.getElementsByClassName('operation-container'); // 选中按钮容器
    const text = document.getElementsByClassName('text'); // item
    const numText = document.getElementById('num-text'); // 未完成数量是否为复数
    const clearCheck = document.getElementById('clear-check'); // 清除已选中
    const modification = document.getElementsByClassName('modification'); // 修改item
    const deleteBtn = document.getElementsByClassName('delete-btn'); // 删除item
    const countContainer = document.getElementById('count-container'); // 底部容器
    
    let dataList = JSON.parse(localStorage.getItem('dataList')) || []; // 列表数据
    let type = localStorage.getItem('type') || 'all'; // 点击的按钮类型
    const typeObj = {all, active, completed};
    typeObj[type].classList.add('border');
    const dataLength = dataList.length;
    numText.innerText = dataLength === 1 ? 'item left' : 'items left';
    countContainer.style.display = dataLength > 0 ? 'block' : 'none';
    arrow.style.display = dataLength > 0 ? 'block' : 'none';
    
    window.addEventListener('beforeunload', () => {
        localStorage.setItem('dataList', JSON.stringify(dataList));
        localStorage.setItem('type', type);
    })
    
    contentRender(type);
    
    function contentRender(type) {
        let newList = [];
        dataList.forEach((item, index) => {
            item.idx = index;
        });

        switch(type) {
            case 'all':
                newList = dataList;
                break;
            case 'active':
                newList = dataList.filter(({isCheck}) => !isCheck);
                break;
            case 'completed':
                newList = dataList.filter(({isCheck}) => isCheck);
                break;
            default:
                newList = dataList;
                break;
        }

        let html = '';
        for (let i = 0; i < newList.length; i++) {
            const item = newList[i];
            const {value, isCheck, idx} = item;
            html+=`
            <li class='message-list-item'>
                <div class='operation-container'>
                    <div class='operation-wrap ${isCheck ? 'check' : ''}'>
                        <img 
                            src='./image/shops-pick.png'
                            class='operation'
                        />
                    </div>
                </div>
                <input class='modification' type='text'/>
                <div class='text ${isCheck ? 'check-text' : ''}'>${value}</div>
                <img 
                    src='./image/close.png'
                    class='delete-btn'
                />
            </li>`
        }
        content.innerHTML = html;
        const dataLength = dataList.length;
        num.innerText = dataList.filter(item => !item.isCheck).length;
        numText.innerText = newList.length === 1 ? 'item left' : 'items left';
        clearCheck.style.display = dataLength - num.innerText > 0
            ? 'block' : 'none';
        countContainer.style.display = dataLength > 0 ? 'block' : 'none';
        arrowContainer.style.display = dataLength > 0 ? 'block' : 'none';
        allCheck();
        if (!dataList.length) return;
        mountHandle(newList);
    }

    function mountHandle(newList) {
        for (let i = 0; i < item.length; i++) {
            operationCtr[i].addEventListener('click', function () {
                operation[i].classList.toggle('check');
                text[i].classList.toggle('check-text');
                newList[i].isCheck = operation[i].classList.contains('check')
                    ? true : false;
                num.innerText = dataList.filter(({isCheck}) => !isCheck).length;
                contentRender(type);
            });
            item[i].addEventListener('mouseenter', () => {
                deleteBtn[i].style.display = 'block';
            });
            item[i].addEventListener('mouseleave', () => {
                deleteBtn[i].style.display = 'none';
            });
            deleteBtn[i].addEventListener('click', () => {
                dataList.splice(newList[i].idx, 1);
                contentRender(type);
            });
            text[i].addEventListener('dblclick', () => {
                text[i].style.display = 'none';
                deleteBtn[i].style.display = 'none';
                modification[i].style.display = 'block';
                modification[i].focus();
                modification[i].value = newList[i].value;
            }); 
            modification[i].addEventListener('blur', blurFn);
            modification[i].addEventListener('keyup', function (e) {
                if (e && e.keyCode === 13) {
                    blurFn();
                } else if (e && e.keyCode === 27) {
                    modification[i].removeEventListener('blur', blurFn)
                    text[i].style.display = 'block';
                    modification[i].style.display = 'none';
                    contentRender(type);
                }
            });

            function blurFn () {
                text[i].style.display = 'block';
                modification[i].style.display = 'none';
                newList[i].value = modification[i].value;
                contentRender(type);
            }
        }
    }

    function allCheck() {
        let isAll =  dataList.every(function(item) {
            return item.isCheck;
        });

        if (isAll) {
            arrow.classList.add('message-arrow-operation');
        } else {
            arrow.classList.remove('message-arrow-operation');
        }
    }

    input.addEventListener('keyup', function (e) { 
        if (e && e.keyCode === 13) {
            let value = e.target.value.replace(/\s*/g,"");
            if (!value) return;
            const length = dataList.length;
            dataList.push({
                value: value,
                isCheck: false,
                idx: length
            });
            contentRender(type);
            e.target.value = null;
        }
    });
    arrowContainer.onclick = function () {
        arrow.classList.toggle('message-arrow-operation');
        let arrowOnStatus = arrow.classList.contains('message-arrow-operation') ? true : false;
        switch(type) {
            case 'all':
                allFn(arrowOnStatus);
                return;
            case 'active':
                activeFn(arrowOnStatus);
                return;
            case 'completed':
                allFn(arrowOnStatus);
                return;
            default: return;
        }
    };
    function allFn(arrowOnStatus) {
        for (let i = 0; i < dataList.length; i++) {
            dataList[i].isCheck = arrowOnStatus;
        }
        contentRender(type);
    }
    function activeFn(arrowOnStatus) {
        for (let i = 0; i < dataList.length; i++) {
            dataList[i].isCheck = arrowOnStatus;
        }
        contentRender(type);
    }
    all.onclick = function() {
        if (type === 'all') return;
        type = 'all';
        this.classList.add('border');
        active.classList.remove('border');
        completed.classList.remove('border');
        contentRender(type);
    }
    active.onclick = function() {
        if (type === 'active') return;
        type = 'active';
        this.classList.add('border');
        all.classList.remove('border');
        completed.classList.remove('border');
        contentRender(type);
    }
    completed.onclick = function() {
        if (type === 'completed') return;
        type = 'completed';
        this.classList.add('border');
        all.classList.remove('border');
        active.classList.remove('border');
        contentRender(type);
    }
    clearCheck.addEventListener('click', () => {
        dataList = dataList.filter(({isCheck}) => !isCheck);
        contentRender(type);
    });
}
