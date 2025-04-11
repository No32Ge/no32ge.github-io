
// doPDF.js


function getJsonData() {
  return JSON.parse(editor.getValue());
}

pdfMake.vfs = {
  'NotoSansSC-Light.ttf': font_cn1 // font_cn Base64字符串在另一个文件中，通过在 主页面中引入：<script src="js/font.js"></script> 我还是不懂为什么导入不同域会报错
};

pdfMake.fonts = {
  ChineseFont: {
    normal: 'NotoSansSC-Light.ttf',
    bold: 'NotoSansSC-Light.ttf',
    italics: 'NotoSansSC-Light.ttf',
    bolditalics: 'NotoSansSC-Light.ttf'
  }
};


// 新的PDF

function convertJsonToPdfDocDefinition() {
  var jsonData = getJsonData()
  const content = [];

  jsonData.paragraphs.forEach(paragraph => {
    // 文本内容显式指定字体
    content.push({
      text: paragraph.content_en.replace(
        /\*\*(.*?)\*\*/g,
        (match, p1) => { 
            return `[${p1}]`;
        }
    ),
      style: 'paragraph',
      font: 'ChineseFont' // 显式覆盖
    });
    content.push({
      text: paragraph.content_cn.replace(/\*\*/g, ""),
      style: 'paragraph',
      font: 'ChineseFont',
      fontSize: 12,
      color:`#7f8c8d`
    })

    if (paragraph.terms && Array.isArray(paragraph.terms)) {
      for (let i = 0; i < paragraph.terms.length; i += 2) {
        const term1 = paragraph.terms[i];
        const term2 = paragraph.terms[i + 1];  // 可能为 undefined

        content.push({
          columns: [
            {
              width: '50%',
              text: `${term1.word}: ${term1.definition}`,
              font: 'ChineseFont',
              fontSize: 10,
              color: '#1a237e', // 深蓝
              margin: [0, 2, 5, 2]
            },
            // 检查 term2 是否存在
            term2 ? {
              width: '50%',
              text: `${term2.word}: ${term2.definition}`,
              font: 'ChineseFont',
              fontSize: 10,
              color: '#1a237e',
              margin: [0, 2, 0, 2]
            } : {
              width: '50%',
              text: '', // 没有第二个术语时，保持右侧为空
              margin: [0, 2, 0, 2]
            }
          ],
          columnGap: 10,
          style: 'term'
        });
      }
    }
  });

  return {
    content,
    defaultStyle: {
      font: 'ChineseFont',
      characterSet: 'full'
    },
    styles: {
      paragraph: { fontSize: 12, margin: [0, 5] },

      term: {
        fontSize: 10,
        margin: [10, 2],
        font: 'ChineseFont', // 冗余保险
        italics: false       // 确认关闭斜体
      }
    }
  };
}
function exportPdf() {
  var name = getJsonData().title;
  const docDefinition = convertJsonToPdfDocDefinition();
  pdfMake.createPdf(docDefinition).download(name+'.pdf');
}

// 下面内容已经弃用


//下面是老版本，通过链表解析，好处是每一个标签的样式在一定程度上可以花里胡哨，但只可以解析为图片

//适当修改，可以做成新的公众号样式解析
function convertJsonPFD() {
  // const jsonInput = document.getElementById("jsonInput").value; // 获取输入的JSON文本，老版本内容，现在已经唾弃
  const jsonInput = getdata()
  console.log("值为" + jsonInput)
  output.innerHTML = "";
  try {
    const data = JSON.parse(jsonInput); // 解析JSON文本
    data.paragraphs.forEach(paragraph => {
      en = (paragraph.content_en || "【无数据】").replace(
        /\*\*(.*?)\*\*/g,
        (match, p1) => `<strong class= "term-word">${p1}</strong>`
      );
      output.innerHTML = '<p>' + en + '</p>' + output.innerHTML
    })
  } catch (error) {
    output.innerHTML = `<p style="color: red;">出现异常: ${error.message}</p>`; // 显示错误信息
    errMassage = error.message; // 保存错误信息
  }
}

function renderOutputToPDF() {
  const jsonInput = editor.getValue();
  const output = document.getElementById("output");
  let data = JSON.parse(jsonInput)
  console.log(+output)
  output.innerHTML = `
    <div class="hologram-header">
      <h2>${data.title}</h2>
      <p class="cyber-intro">${data.introduction}</p>
    </div>
    ${data.paragraphs.map(para => `
      <div class="cyber-paragraph">
        <div class="en-content glow-text">${para.content_en.replace(/\*\*(.*?)\*\*/g, '<span class="neon-highlight">$1</span>')}</div>
        <div class="cn-content">${para.content_cn.replace(/\*\*(.*?)\*\*/g, '<span class="neon-highlight">$1</span>')}</div>
        ${para.terms.map(term => `
          <div class="term-card">
            <h3 class="cyber-term">${term.word}</h3>
            <p>${term.definition}</p>
            <div class="example-box">
              <p class="en-example">${term.sentence_en}</p>
              <p class="cn-example">${term.sentence_cn}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `).join('')}
  `;
}

// 重新渲染页面
function clickToPDF() {
  renderOutputToPDF();
  const output = document.getElementById("output");

  // 内容检查
  if (!output.innerHTML.trim() || errMassage) {
    showMessage(errMassage ? "导出失败，存在错误" : "请先解析内容");
    return;
  }

  // 配置项
  const opt = {
    margin: [10, 10, 10, 10],  // 上右下左
    filename: 'output.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] } // 避免分页时断开块
  };

  // 创建临时容器防止样式干扰
  const clonedOutput = output.cloneNode(true);
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'fixed';
  tempContainer.style.left = '-9999px';
  tempContainer.appendChild(clonedOutput);
  document.body.appendChild(tempContainer);

  // 开始生成 PDF
  html2pdf().set(opt).from(clonedOutput).save().then(() => {
    document.body.removeChild(tempContainer);
    showMessage("PDF已生成");
  }).catch(err => {
    console.error("PDF生成失败:", err);
    document.body.removeChild(tempContainer);
    showMessage("导出失败，请检查内容");
  });
}
