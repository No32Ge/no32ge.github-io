
// doPDF.js


function getdata(){
    return editor.getValue();
}


//老版本，通过链表解析，好处是每一个标签的样式在一定程度上可以花里胡哨
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
            output.innerHTML = '<p>'+en+'</p>' + output.innerHTML
        })
    } catch (error) {
        output.innerHTML = `<p style="color: red;">出现异常: ${error.message}</p>`; // 显示错误信息
        errMassage = error.message; // 保存错误信息
    }
}

function renderOutputToPDF() {
    const  jsonInput = editor.getValue();
    const output = document.getElementById("output");
    let data  =  JSON.parse(jsonInput)
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
    renderOutputToPDF()
    const output = document.getElementById("output");

    // 检查内容有效性
    if (!output.innerHTML.trim() || errMassage) {
        showMessage(errMassage ? "导出失败，存在错误" : "请先解析内容");
        return;
    }

    // 克隆节点并内联样式
    const clonedOutput = output.cloneNode(true);

    // 隐藏原始元素显示克隆元素
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.left = '-9999px';
    tempContainer.appendChild(clonedOutput);
    document.body.appendChild(tempContainer);

    // 生成PDF
    html2canvas(clonedOutput, {
        scale: 2, // 提高分辨率
        useCORS: true, // 允许跨域图片
        logging: true // 调试时可开启
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jspdf.jsPDF({
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait'
        });

        // 计算图片尺寸
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgRatio = canvas.width / canvas.height;
        let imgWidth = pageWidth;
        let imgHeight = pageWidth / imgRatio;

        // 多页处理
        let position = 0;
        while (position < imgHeight) {
            if (position > 0) pdf.addPage();
            const sliceHeight = Math.min(pageHeight, imgHeight - position);
            pdf.addImage(imgData, 'PNG', 0, -position, imgWidth, imgHeight);
            position += pageHeight;
        }

        // 清理并保存
        document.body.removeChild(tempContainer);
        pdf.save("output.pdf");
        showMessage("PDF已生成");
    }).catch(err => {
        console.error('PDF生成失败:', err);
        showMessage("导出失败，请检查内容");
    });
}
