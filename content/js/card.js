document.addEventListener("DOMContentLoaded", () => {
	// 1. 卡片进入动画
	document.querySelectorAll('.moment-card').forEach((card, index) => {
		card.style.opacity = 0;
		card.style.transform = 'translateY(20px)';
		setTimeout(() => {
			card.style.transition = 'all 0.6s ease';
			card.style.opacity = 1;
			card.style.transform = 'translateY(0)';
		}, 100 * index);
	});

	// 2. 头像 hover 动效
	document.querySelectorAll('.avatar').forEach(avatar => {
		avatar.addEventListener('mouseenter', () => {
			avatar.classList.add('avatar-hover');
		});
		avatar.addEventListener('mouseleave', () => {
			avatar.classList.remove('avatar-hover');
		});
	});

	// 3. 删除按钮点了以后弹出确认，再消失
	document.querySelectorAll('.delete').forEach(btn => {
		btn.addEventListener('click', (e) => {
			const card = btn.closest('.moment-card');
			const sure = confirm("你确定要删除这条超装逼朋友圈吗？");
			if (sure) {
				card.style.transition = 'all 0.6s ease';
				card.style.transform = 'scale(0.9) rotateX(15deg)';
				card.style.opacity = 0;
				setTimeout(() => {
					card.remove();
				}, 600);
			}
		});
	});

	// 4. 卡片点击时有微妙震动
	document.querySelectorAll('.moment-card').forEach(card => {
		card.addEventListener('click', () => {
			card.classList.add('moment-bounce');
			setTimeout(() => card.classList.remove('moment-bounce'), 300);
		});
	});
});


document.addEventListener("DOMContentLoaded", () => {
	const elements = document.querySelectorAll('.typewriter-text');

	elements.forEach(el => {
		const texts = JSON.parse(el.getAttribute('data-text'));
		let textIndex = 0;
		let charIndex = 0;
		let isDeleting = false;

		const type = () => {
			const currentText = texts[textIndex];
			const visibleText = isDeleting 
				? currentText.substring(0, charIndex--) 
				: currentText.substring(0, charIndex++);

			el.textContent = visibleText;

			if (!isDeleting && charIndex === currentText.length) {
				setTimeout(() => isDeleting = true, 1200);
			} else if (isDeleting && charIndex === 0) {
				isDeleting = false;
				textIndex = (textIndex + 1) % texts.length;
			}

			const delay = isDeleting ? 40 : 60;
			setTimeout(type, delay);
		};

		type();
	});
});