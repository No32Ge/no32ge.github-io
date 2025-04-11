
var errMassage = '';

var number = 1 //单词编号


// 替换加粗的单词样式
function replace_bold_from_paragraph_en(content_en) {
    const temp = (content_en || "【无数据】").replace(
        /\*\*(.*?)\*\*/g,
        (match, p1) => { // ✅ 显式返回
            // 首字母大写,并不移除星号，因为还需要它定位
            return "**" + p1.charAt(0).toUpperCase() + p1.slice(1) + "**";
        }
    );
    const result = (temp || "【无数据】").replace(
        /\*\*(.*?)\*\*/g,
        (match, p1) => convertToFancyFont(`${p1}`)
    );
    return result;
}

function convertParagraphs(paragraphs){
    paragraphs.forEach(paragraph => { 
        const contentEnFormatted = replace_bold_from_paragraph_en(paragraph.content_en) //替换加粗的单词样式
        let content = content_deck_white_guy(contentEnFormatted) + word_deck("#rep");
        // 术语和定义块
        let word_card = ""
        word_card =  create_word_card(paragraph.terms)
        word_card = word_card + cn_shell(paragraph.content_cn);
        content = content.replace('#rep', word_card)
        output.innerHTML += content;
        errMassage = ''; // 清空错误信息
    });
}



// 解析排版
function convertJson() {
    // 获取输入的JSON文本
    // const jsonInput = document.getElementById("jsonInput").value; 
    const output = document.getElementById("output");
    
    const jsonInput = editor.getValue();
    output.innerHTML = "";
    try {
        const data = JSON.parse(jsonInput); // 解析JSON文本
        console.log("数据"+data)
        let introduce = data.introduction //文章介绍
        let pageTop = top_log(introduce) //文章顶部的卡片
        console.log(pageTop) 
        const content_shell = `` //文章的总体背景，现已废弃
        convertParagraphs(data.paragraphs)
        number = 1 //解析完成后，让全局变量单词编号再次变成1，方便下一次解析
        output.innerHTML = `${pageTop}` + output.innerHTML
    } catch (error) {
        output.innerHTML = `<p style="color: red;">出现异常: ${error.message}</p>`; // 显示错误信息
        errMassage = error.message; // 保存错误信息
    }
}

// 解析class
function getStyleString(computedStyle, properties) {
    return properties.map(prop => `${prop}: ${computedStyle.getPropertyValue(prop)};`).join(' ');
}

function convertClassToInlineStyleInId(targetId) {
    const container = document.getElementById(targetId);
    if (!container) {
        console.warn(`未找到 id 为 "${targetId}" 的元素`);
        return;
    }

    const elements = container.querySelectorAll('[class]');
    const importantProps = [
        'color', 'font-size', 'font-weight', 'font-style', 'text-decoration',
        'background-color', 'border', 'margin', 'padding', 'display',
        'position', 'top', 'left', 'right', 'bottom', 'width', 'height',
        'line-height', 'letter-spacing', 'text-align', 'white-space',
        'font-family', 'text-shadow'
    ];

    elements.forEach(el => {
        const computed = window.getComputedStyle(el);
        const inlineStyle = getStyleString(computed, importantProps);
        const existingStyle = el.getAttribute('style') || '';
        el.setAttribute('style', existingStyle + inlineStyle);
        el.removeAttribute('class');
    });

    console.log(`id="${targetId}" 区域下的 class 已转换为 style`);
}



function convertToFancyFont(text) {
    const normalUpper = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    // const fancyUpper = Array.from("🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩");
    const fancyUpper = Array.from("𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙");
    const normalLower = Array.from("abcdefghijklmnopqrstuvwxyz");
    const fancyLower = Array.from("𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣");
    return Array.from(text).map(char => {
        let index = normalUpper.indexOf(char);
        if (index !== -1) return fancyUpper[index];
        index = normalLower.indexOf(char);
        if (index !== -1) return fancyLower[index];
        return char;
    }).join("");
}


function copyToClipboardDiv() {
    // 获取 `output` div 的内容
    const outputDiv = document.getElementById("output");

    // 创建一个临时的 textarea 元素
    const tempTextarea = document.createElement("textarea");

    // 设置 textarea 的内容为 `output` 的 HTML
    tempTextarea.value = outputDiv.innerHTML;

    // 添加到 DOM 中（隐藏）
    document.body.appendChild(tempTextarea);

    // 选择并复制内容
    tempTextarea.select();
    document.execCommand("copy");

    // 删除临时 textarea
    document.body.removeChild(tempTextarea);

    // 提示用户复制成功
    alert("内容已复制到剪贴板！");
}

function copyToClipboardStyle() {
    const outputDiv = document.getElementById("output");
    const clonedDiv = outputDiv.cloneNode(true);

    // 将样式内联化
    function inlineStyles(element) {
        const computedStyle = window.getComputedStyle(element); // 获取计算样式
        const styleString = Array.from(computedStyle)
            .map((prop) => `${prop}: ${computedStyle.getPropertyValue(prop)};`)
            .join(" ");

        // 仅在 styleString 不为空时才设置样式
        if (styleString) {
            console.log(`为元素添加样式: ${styleString}`);  // 调试日志，查看生成的样式
            element.setAttribute("style", styleString); // 添加 style 属性
        } else {
            console.log("未获取到任何样式");
        }

        // 递归处理子元素
        Array.from(element.children).forEach(inlineStyles);
    }

    inlineStyles(clonedDiv);

    // 创建一个临时的 textarea 元素
    const tempTextarea = document.createElement("textarea");
    tempTextarea.value = clonedDiv.outerHTML;  // 使用 outerHTML 获取整个 HTML（包括新的内联样式）

    // 隐藏 textarea 并添加到 DOM 中
    document.body.appendChild(tempTextarea);
    tempTextarea.select();

    // 使用 Clipboard API 执行复制
    navigator.clipboard.writeText(tempTextarea.value).then(() => {
        alert("内容已复制到剪贴板！");
    }).catch(err => {
        console.error("复制失败:", err);
    });

    // 删除临时 textarea
    document.body.removeChild(tempTextarea);
}

function copyStylesToClipboard() {
    const output = document.getElementById("output");
    if (!output.innerHTML.trim()) {
        showMessage("请先解析"); // 如果没有内容，提示解析
        return;
    }
    if (errMassage != '') {
        showMessage("复制失败，格式有误"); // 如果有错误，提示复制失败
        return;
    }


    // 创建一个临时元素来存储CSS代码
    const tempElement = document.createElement("div");
    tempElement.style.position = "absolute";
    tempElement.style.left = "-9999px"; // 确保元素在可视区域之外
    tempElement.style.whiteSpace = "pre"; // 保留样式和换行
    tempElement.innerHTML = cssCode; // 将CSS代码放入临时元素中

    // 添加到文档中
    document.body.appendChild(tempElement);

    // 创建一个Range对象来选择内容
    const range = document.createRange();
    range.selectNodeContents(tempElement);

    // 获取当前选择并移除，设置为新选择
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    // 执行复制
    try {
        document.execCommand("copy");
        showMessage("复制成功!"); // 提示复制成功
    } catch (err) {
        showMessage("复制失败 " + err); // 提示复制失败
    }

    // 清理临时元素
    document.body.removeChild(tempElement);
}

// 复制到剪贴板的函数
function copyToClipboard() {
    const output = document.getElementById("output");
    if (!output.innerHTML.trim()) {
        showMessage("请先解析"); // 如果没有内容，提示解析
        return;
    }
    if (errMassage != '') {
        showMessage("复制失败，格式有误"); // 如果有错误，提示复制失败
        return;
    }
    // 创建一个临时元素来存储HTML内容
    const tempElement = document.createElement("div");
    tempElement.style.position = "absolute";
    tempElement.style.left = "10px";
    tempElement.style.whiteSpace = "pre"; // 保留样式和换行
    tempElement.innerHTML = output.innerHTML.replace(/\s+/g, ' ').trim(); // 移除多余的空格和换行
    // 添加到文档中
    document.body.appendChild(tempElement);
    // 创建一个Range对象来选择内容
    const range = document.createRange();
    range.selectNodeContents(tempElement);
    // 获取当前选择并移除，设置为新选择
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    // 执行复制
    try {
        document.execCommand("copy");
        showMessage("复制成功!"); // 提示复制成功
    } catch (err) {
        showMessage("复制失败 " + err); // 提示复制失败
    }
    // 清理临时元素
    document.body.removeChild(tempElement);
}

// 显示消息的函数
function showMessage(message) {
    const msgDiv = document.createElement("div");
    msgDiv.textContent = "Ge32提示：" + message;
    msgDiv.style.position = "fixed";
    msgDiv.style.top = "0";
    msgDiv.style.left = "50%";
    msgDiv.style.transform = "translateX(-50%)";
    msgDiv.style.backgroundColor = "rgba(3, 63, 173, 0.7)";
    msgDiv.style.color = "white";
    msgDiv.style.padding = "10px";
    msgDiv.style.zIndex = "1000";
    msgDiv.style.borderRadius = "15px";
    document.body.appendChild(msgDiv);
    setTimeout(() => {
        document.body.removeChild(msgDiv); // 1秒后移除消息
    }, 1000);
}


function top_log(introduce) {
    return `
<section style="
 max-width: 680px;
 margin: 2rem auto;
 background: 
     linear-gradient(175deg, 
         rgba(255,255,255,0.98) 0%, 
         rgba(252,252,252,0.96) 100%),
     repeating-linear-gradient(
         -15deg,
         transparent 0px,
         transparent 40px,
         rgba(240,240,240,0.6) 41px
     );
 border-radius: 24px 24px 36px 36px;
 box-shadow: 
     0 12px 24px rgba(0,0,0,0.06),
     inset 0 -2px 4px rgba(255,255,255,0.8);
 font-family: 'Georgia', serif;
 overflow: visible;
">
 <!-- 旗帜顶边 -->
 <section style="
     height: 48px;
     background: 
         repeating-linear-gradient(
             45deg,
             transparent 0px,
             transparent 23px,
             rgb(116, 116, 116) 25px
         );
     border-radius: 36px 36px 0 0;
     margin-bottom: -24px;
 "></section>

 <!-- 主体内容 -->
 <section style="padding: 32px 40px;">
     <!-- 头像容器 -->
     <section style="
         width: 120px;
         height: 120px;
         border: 4px solid white;
         border-radius: 50%;
         box-shadow: 0 8px 24px rgba(0,0,0,0.1);
         margin: -76px auto 24px;
         overflow: hidden;
         background: #f8f9fa;
     ">
         <img src="https://mmbiz.qpic.cn/sz_mmbiz_jpg/4vWm7Iev4CaBZSqqNsW6IFlDiaNAT384dgXuSscZfKKtU5Vc0RzYMnpn788EBZNKFs2kMPDiaMFO9azd1Ug1ib4Vw/640?wx_fmt=jpeg" 
              style="width:100%;height:100%;object-fit:cover;">
     </section>

     <!-- 文字内容 -->
     <section style="
         padding: 24px;
         background: rgba(255,255,255,0.9);
         border-radius: 16px;
         box-shadow: 0 4px 12px rgba(0,0,0,0.04);
         text-align: center;
     ">
         <section style="
             width: 80%;
             height: 2px;
             background: linear-gradient(90deg, transparent,  rgb(80, 79, 66), transparent);
             margin: -12px auto 24px;
         "></section>
         
         <p style="
             font-size: 18px;
             line-height: 1.6;
             color: #2d3748;
             margin: 0;
             letter-spacing: 0.03em;
             text-shadow: 0 1px 1px rgba(255,255,255,0.8);
         ">
             ${introduce}
         </p>
     </section>
 </section>
 <!-- 底部飘带  <section style="
     height: 32px;
     background: rgba(255,255,255,0.9);
     transform: rotate(-2deg);
     margin: 24px -20px -16px;
     border-radius: 8px;
     box-shadow: 0 4px 8px rgb(228, 213, 0);
 "></section> -->

</section>
 `
}


function _head_white(introduce, img) {
    var claw = new Shell().section().style(`height: 48px;
        background: 
            repeating-linear-gradient(
                45deg,
                transparent 0px,
                transparent 24px,
                rgba(70, 0, 0, 0.3) 25px
            );
        border-radius: 36px 36px 0 0;
        margin-bottom: -24px;`).toContent();

    var img_block = new Shell().section(
        `<img src="${img}" 
                 style="width:100%;height:100%;object-fit:cover;">`
    ).style(`width: 120px;
            height: 120px;
            border: 4px solid white;
            border-radius: 50%;
            box-shadow: 0 8px 24px rgba(0,0,0,0.1);
            margin: -76px auto 24px;
            overflow: hidden;
            background: #f8f9fa;`).toContent();
    console.log("img : " + img_block)

    var text_area = new Shell().section(
        `<section style="
                width: 80%;
                height: 2px;
                background: linear-gradient(90deg, transparent, #ddd, transparent);
                margin: -12px auto 24px;
            "></section>`,

        `<p style="
                font-size: 18px;
                line-height: 1.6;
                color: #2d3748;
                margin: 0;
                letter-spacing: 0.03em;
                text-shadow: 0 1px 1px rgba(255,255,255,0.8);
            ">
                ${introduce}
            </p>`
    ).style(
        `padding: 24px;
            background: rgba(255,255,255,0.9);
            border-radius: 16px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.04);
            text-align: center;`).toContent()


    let head = new Shell().section(
        claw,
        img_block,
        text_area
    ).style(
        `max-width: 680px;
    margin: 2rem auto;
    background: 
        linear-gradient(175deg, 
            rgba(255,255,255,0.98) 0%, 
            rgba(252,252,252,0.96) 100%),
        repeating-linear-gradient(
            -15deg,
            transparent 0px,
            transparent 40px,
            rgba(240,240,240,0.6) 41px
        );
    border-radius: 24px 24px 36px 36px;
    box-shadow: 
        0 12px 24px rgba(0,0,0,0.06),
        inset 0 -2px 4px rgba(255,255,255,0.8);
    font-family: 'Georgia', serif;
    overflow: visible;`
    ).toContent();
    return head;

}

function create_word_card(terms) {
    let word_cards = ""
      terms.forEach(term => {
        const termHtml = `<section class="section-term-roll-block">
 <section style="
    width: 100%;
    max-width: 480px;
    margin: 2rem auto;
    margin-top:3px;
    padding: 32px;
    background: 
        linear-gradient(175deg, #ffffff 0%, #fcfcfc 100%),
        repeating-linear-gradient(
            90deg,
            transparent 0px,
            transparent 95%,
            rgba(0,0,0,0.03) 96%,
            transparent 100%
        );
    border-radius: 12px;
    box-shadow: 
        12px 12px 24px rgba(0, 0, 0, 0.03),
        -4px -4px 16px rgba(255, 255, 255, 0.8);
    font-family: 'Inter', -apple-system, sans-serif;
    letter-spacing: -0.02em;
">
    <!-- 信息头 -->
    <section style="
        display: flex;
        gap: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(0,0,0,0.08);
        margin-bottom: 12px;
    ">
        <section style="
            width: 45px;
            height: 45px;
            background: 
                conic-gradient(from 90deg at 50% 50%, 
                rgba(0,0,0,0.04) 0deg, 
                rgba(0,0,0,0.08) 180deg, 
                transparent 360deg);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            color: rgba(0,0,0,0.7);
            font-size: 14px;
        ">
            ${number++}
        </section>
        <h2 style="
            margin: 0;
            font-size: 20px;
            font-weight: 600;
            color: rgba(0,0,0,0.9);
            align-self: center;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        ">
            ${term.word || "Untitled"}
        </h2>
    </section>

    <!-- 核心内容 -->
    <article style="
        background: rgba(255,255,255,0.6);
        padding: 24px;
        padding-bottom:12px;
        border-radius: 6px;
        margin-bottom: 16px;
        box-shadow: 
            inset 0 0 0 1px rgba(0,0,0,0.03),
            0 4px 12px -2px rgba(0,0,0,0.02);
    ">
        <p style="
            margin: 0;
            font-size: 15px;
            line-height: 1.6;
            color: rgba(0,0,0,0.75);
            padding-left: 16px;
            border-left: 4px solid rgba(0,0,0,0.1);
        ">
            ${term.definition || "Content awaiting input..."}
        </p>
    </article>
    <!-- 注解模块 -->
    <section style="
        display: grid;
        gap: 8px;
        padding: 16px;
        background: rgba(250,250,250,0.8);
        border-radius: 4px;
        box-shadow: 
            inset 0 0 0 1px rgba(0,0,0,0.03),
            0 2px 6px -2px rgba(0,0,0,0.02);
    ">
        <p style="
            margin: 0;
            font-size: 13px;
            color: rgba(0,0,0,0.6);
            font-style: italic;
            padding-left: 12px;
        ">
            <span style="
                display: inline-block;
                width: 6px;
                height: 6px;
                background: rgba(0,0,0,0.1);
                border-radius: 50%;
                margin-right: 6px;
                vertical-align: middle;
            "></span>
            "${term.sentence_en || "Sample contextual text..."}"
        </p>
        <p style="
            margin: 0;
            font-size: 11px;
            color: rgba(0,0,0,0.4);
            text-align: right;
            padding-right: 8px;
        ">
            ${term.sentence_cn || "自动生成注解"}
        </p>
    </section>
</section>
</section>`;
        word_cards += termHtml;
    })

    return word_cards;

}

function cn_shell(content_cn){
    
    return`
<section class="section-term-roll-block">
<section style="
    width: 100%;
    max-width: 420px;
    margin: 1rem auto;
    padding: 32px 40px;
    background: 
        linear-gradient(175deg, #fff 16px, #f8f9fa 30%, #fff 95%),
        repeating-linear-gradient(
            180deg,
            transparent 0px,
            transparent 23px,
            rgba(0,0,0,0.08) 24px
        );
    border-left: 12px solid #f1f3f5;
    border-right: 12px solid #f1f3f5;
    border-radius: 0 40px 40px 0;
    box-shadow: 
        8px 8px 16px rgba(0,0,0,0.05),
        inset 4px 0 8px rgba(0,0,0,0.03);
    font-family: 'Georgia', serif;
    position: relative;
    transform: perspective(800px) rotateY(-2deg);
">
    <p style="
        font-size: 14px;
        color: #495057;
        margin: 0;
        line-height: 1.8;
        padding-left: 24px;
        border-left: 2px solid #ced4da;
        text-indent: 2em;
        letter-spacing: 0.05em;
    ">
        <span style="
            display: inline-block;
            width: 24px;
            height: 2px;
            background: #ced4da;
            vertical-align: middle;
            margin-right: 8px;
        "></span>
        ${content_cn.replace(/\*\*/g, "")}
    </p>
</section>
</section>
            `
    
}




function content_deck_white_guy(content) {
    return new Shell().style(`
        box-sizing: border-box;
        line-height: 1.8;
        margin: 2rem auto;
        padding: 32px 48px;
        width: 90%;
        max-width: 720px;
        background: 
            linear-gradient(175deg, 
                rgba(255,255,255,0.98) 0%, 
                rgba(250,250,252,0.96) 20%,
                rgba(255,255,255,0.95) 100%),
            repeating-linear-gradient(
                180deg,
                transparent 0px,
                transparent 35px,
                rgba(0,0,0,0.06) 36px
            );
        border-left: 16px solid #f8f9fa;
        border-right: 16px solid #f8f9fa;
        border-radius: 0 56px 56px 0;
        box-shadow: 
            12px 12px 24px rgba(0,0,0,0.06),
            inset 6px 0 12px rgba(0,0,0,0.04),
            inset -6px 0 12px rgba(255,255,255,0.8);
        font-family: 'Noto Serif SC', serif;
        color: #2b2d32;
        font-size: 14px;
        text-align: justify;
        transform: 
            perspective(1200px) 
            rotateY(-1.5deg)
            translateZ(20px);
        transition: transform 0.3s ease;
        white-space: pre-wrap;
        text-indent: 2em;
        letter-spacing: 0.03em;
        position: relative;
        z-index: 1;`)
        .p(
            //段落前方的线条
            `<span style="
        display: inline-block;
        width: 48px;
        height: 2px;
        background: linear-gradient(90deg, #e9ecef 0%, #ced4da 50%, #e9ecef 100%);
        vertical-align: middle;
        margin-right: 16px;
        margin-left: -24px;
        "></span>`
            , content
        )
        .toContent();
} 


//  Shell类
//    ----------------------------------------------------
// ########################################################
// #######################################################
// 定义一个类
class Shell {
    constructor() {
        this.templates = []; // 存储带占位符的 HTML 片段
        this.styleValue = ""; // 最终样式值
    }

    // 接收多个参数作为内容，生成带占位符的模板
    section(...values) {
        const content = values.join(" "); // 将参数拼接成字符串（如 1 2 3 → "1 2 3"）
        this.templates.push(`<section style="#style">${content}</section>`);
        return this;
    }
    p(...values) {
        const content = values.join(" "); // 将参数拼接成字符串（如 1 2 3 → "1 2 3"）
        this.templates.push(`<p style="#style">${content}</p>`);
        return this;
    }
    span(...values) {
        const content = values.join(" "); // 将参数拼接成字符串（如 1 2 3 → "1 2 3"）
        this.templates.push(`<span style="#style">${content}</span>`);
        return this;
    }

    // 设置最终样式
    style(style) {
        this.styleValue = style;
        return this;
    }

    // 生成最终 HTML（替换所有占位符）
    toContent() {
        return this.templates
            .map(tpl => tpl.replace("#style", this.styleValue)) // 替换占位符
            .join(""); // 拼接所有片段
    }
}



function section(...value) {
    return new Shell().section(value);
}
function word_deck(word_cards) {
    //滑动单词块的背景板
    return section(
        section(
            word_cards
        ).style(` 
                line-height: 1.4; 
				orphans: 4; 
				font-family: Times New Roman; 
				overflow-x: auto; 
				display: flex; 
				visibility: visible;`)
            .toContent()
    ).style(`margin: 0 auto;
                    padding: 16px 20px;
                    max-width: 700px;
                    background: rgba(255, 255, 255, 0.95);
                    border-left: 4px solid rgba(180, 180, 180, 0.3);
                    border-radius: 14px;
                    box-shadow: 
                        0px 6px 14px rgba(0, 0, 0, 0.08),
                        0px -1px 4px rgba(255, 255, 255, 0.5) inset;
                    text-align: left;
                    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif;
                    font-size: 14px;
                    color: rgb(50, 50, 50);
                    transition: all 0.3s ease-in-out;`)
        .toContent();

}



function text() {

    console.log(new Shell().span("my name is", "kdog").toContent())

}
