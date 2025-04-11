const fakeInput = document.getElementById('fakeInput');
const keyboard = document.getElementById('keyboard');
const keys = document.querySelectorAll('.key');

// 打开键盘并模拟输入
setTimeout(() => {
    keyboard.classList.add('show');
    const fakeText = "这是你想要的吗？";
    let index = 0;

    const typeInterval = setInterval(() => {
        if (index < fakeText.length) {
            fakeInput.textContent += fakeText[index];
            index++;
        } else {
            clearInterval(typeInterval);
        }
    }, 200);
}, 1000);

// 键盘弹出逻辑
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            keyboard.classList.add('show');
        } else {
            keyboard.classList.remove('show');
        }
    });
}, {
    threshold: 0.6 // 至少有 60% 的输入框出现在视口中才触发
});

// 监听输入框
observer.observe(document.querySelector('.fake-input-area'));

// 点击键盘输入
keys.forEach(key => {
    key.addEventListener('click', () => {
        const action = key.dataset.action;
        if (action === 'backspace') {
            fakeInput.textContent = fakeInput.textContent.slice(0, -1);
        } else if (action === 'space') {
            fakeInput.textContent += ' ';
        } else {
            fakeInput.textContent += key.textContent;
        }
    });
});