// ---------- DOM 元素 ----------
// 模式切换
const imgPanel = document.getElementById('imgPanel');
const textPanel = document.getElementById('textPanel');
const tabBtns = document.querySelectorAll('.tab-btn');
// 图片模式相关
const imageUpload = document.getElementById('imageUpload');
const dropZone = document.getElementById('dropZone');
const previewImg = document.getElementById('previewImage');
const asciiWidthSlider = document.getElementById('asciiWidth');
const widthValSpan = document.getElementById('widthVal');
const charSetSelect = document.getElementById('charSetSelect');
const customCharsetInput = document.getElementById('customCharset');
const reverseBrightness = document.getElementById('reverseBrightness');
const convertImgBtn = document.getElementById('convertImgBtn');
const imgAsciiPre = document.getElementById('imgAsciiPre');
const copyImgBtn = document.getElementById('copyImgResult');
const downloadImgBtn = document.getElementById('downloadImgResult');
// 文本模式相关
const inputTextArea = document.getElementById('inputText');
const figletFontSelect = document.getElementById('figletFont');
const convertTextBtn = document.getElementById('convertTextBtn');
const textAsciiPre = document.getElementById('textAsciiPre');
const copyTextBtn = document.getElementById('copyTextResult');
const downloadTextBtn = document.getElementById('downloadTextResult');

// ---------- 全局状态 ----------
let currentImgFile = null;         // 存储当前上传的图片文件
let lastImgAscii = "";             // 最近生成的图片ascii结果
let lastTextAscii = "";            // 最近生成的文本ascii结果
let activeMode = "img";            // img / text

// 字符集映射库
const charSets = {
    default: "@%#*+=-:. ",
    dense: "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ",
    simple: "█▓▒░ ",
    numbers: "0123456789",
};

// 更新自定义输入框显隐
function toggleCustomCharset() {
    if (charSetSelect.value === 'custom') {
        customCharsetInput.style.display = 'block';
    } else {
        customCharsetInput.style.display = 'none';
    }
}
charSetSelect.addEventListener('change', toggleCustomCharset);
toggleCustomCharset();

// 获取当前有效的字符集字符串 (从暗到亮)
function getCurrentCharSet() {
    let charset = "";
    if (charSetSelect.value === 'custom') {
        charset = customCharsetInput.value.trim();
        if (charset === "") charset = "@%#*+=-:. ";
    } else {
        charset = charSets[charSetSelect.value] || charSets.default;
    }
    return charset;
}

// 图片转ASCII核心函数 (返回Promise, 结果字符串)
async function imageToAscii(file, targetWidth, charsetRaw, reverse = false) {
    return new Promise((resolve, reject) => {
        if (!file) reject("未选择图片");
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // 计算缩放比例
                const originalWidth = img.width;
                const originalHeight = img.height;
                let width = targetWidth;
                let height = Math.floor((originalHeight / originalWidth) * width);
                // 至少高度为1
                height = Math.max(1, height);

                // 创建canvas并绘制缩放图像
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // 获取像素数据
                const imgData = ctx.getImageData(0, 0, width, height);
                const data = imgData.data; // RGBA

                let charset = charsetRaw;
                if (!charset || charset.length === 0) charset = "@%#*+=-:. ";
                const charLen = charset.length;
                let asciiArt = "";

                for (let y = 0; y < height; y++) {
                    let row = "";
                    for (let x = 0; x < width; x++) {
                        const idx = (y * width + x) * 4;
                        const r = data[idx];
                        const g = data[idx+1];
                        const b = data[idx+2];
                        // 计算亮度 (0~255)
                        let brightness = 0.299 * r + 0.587 * g + 0.114 * b;
                        // 反转
                        if (reverse) brightness = 255 - brightness;
                        // 映射到字符索引 (0 ~ charLen-1)
                        let index = Math.floor((brightness / 255) * (charLen - 1));
                        index = Math.min(charLen-1, Math.max(0, index));
                        row += charset[index];
                    }
                    asciiArt += row + "\n";
                }
                resolve(asciiArt);
            };
            img.onerror = () => reject("图片加载失败");
            img.src = e.target.result;
        };
        reader.onerror = () => reject("文件读取失败");
        reader.readAsDataURL(file);
    });
}

// 图片转换并显示
async function performImageConversion() {
    if (!currentImgFile) {
        imgAsciiPre.innerText = "⚠️ 请先上传一张图片！";
        lastImgAscii = "";
        return;
    }
    const width = parseInt(asciiWidthSlider.value, 10);
    let charset = getCurrentCharSet();
    const reverse = reverseBrightness.checked;
    imgAsciiPre.innerText = "⏳ 正在转换中，请稍候...";
    try {
        const asciiResult = await imageToAscii(currentImgFile, width, charset, reverse);
        imgAsciiPre.innerText = asciiResult;
        lastImgAscii = asciiResult;
    } catch (err) {
        console.error(err);
        imgAsciiPre.innerText = "❌ 转换失败: " + err;
        lastImgAscii = "";
    }
}

// 处理图片上传 & 预览
function handleImageFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    currentImgFile = file;
    const reader = new FileReader();
    reader.onload = (ev) => {
        previewImg.src = ev.target.result;
    };
    reader.readAsDataURL(file);
}

// 上传区域交互
dropZone.addEventListener('click', () => imageUpload.click());
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#9f7eff';
});
dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor = '#4a5080';
});
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#4a5080';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleImageFile(file);
    } else {
        alert("请拖入图片文件");
    }
});
imageUpload.addEventListener('change', (e) => {
    if (e.target.files.length) handleImageFile(e.target.files[0]);
});

// 宽度滑动显示数值
asciiWidthSlider.addEventListener('input', () => {
    widthValSpan.innerText = asciiWidthSlider.value;
});

// 图片转换按钮
convertImgBtn.addEventListener('click', performImageConversion);

// 复制图片ASCII
copyImgBtn.addEventListener('click', () => {
    if (!lastImgAscii) {
        alert("没有可复制的ASCII内容，请先生成图片ASCII");
        return;
    }
    navigator.clipboard.writeText(lastImgAscii).then(() => {
        alert("✅ ASCII艺术已复制到剪贴板");
    }).catch(() => alert("复制失败"));
});
// 下载图片ASCII为txt
downloadImgBtn.addEventListener('click', () => {
    if (!lastImgAscii) {
        alert("没有可下载的内容，请先生成ASCII艺术");
        return;
    }
    const blob = new Blob([lastImgAscii], {type: "text/plain"});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "ascii_art.txt";
    link.click();
    URL.revokeObjectURL(link.href);
});

// ========= 文本模式: figlet 转换 =========
function generateTextArt() {
    const text = inputTextArea.value.trim();
    if (text === "") {
        textAsciiPre.innerText = "⚠️ 请输入一些文字 (字母、数字、符号)";
        lastTextAscii = "";
        return;
    }
    const font = figletFontSelect.value;
    textAsciiPre.innerText = "⏳ 字体渲染中...";
    // 使用figlet库，需要确保已经加载
    if (typeof figlet === 'undefined') {
        textAsciiPre.innerText = "❌ Figlet库未加载，请检查网络后刷新页面。";
        return;
    }
    figlet.text(text, { font: font }, (err, data) => {
        if (err) {
            console.warn(err);
            textAsciiPre.innerText = "❌ 字体转换失败，可能不支持的字符或字体错误。\n请尝试简化文字或更换字体。";
            lastTextAscii = "";
            return;
        }
        textAsciiPre.innerText = data;
        lastTextAscii = data;
    });
}

convertTextBtn.addEventListener('click', generateTextArt);

// 复制文本ASCII
copyTextBtn.addEventListener('click', () => {
    if (!lastTextAscii) {
        alert("没有可复制的内容，请先生成文本ASCII艺术");
        return;
    }
    navigator.clipboard.writeText(lastTextAscii).then(() => {
        alert("✅ 艺术字已复制");
    }).catch(() => alert("复制失败"));
});
downloadTextBtn.addEventListener('click', () => {
    if (!lastTextAscii) {
        alert("没有可下载的内容，请先生成文本ASCII艺术");
        return;
    }
    const blob = new Blob([lastTextAscii], {type: "text/plain"});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "text_ascii_art.txt";
    link.click();
    URL.revokeObjectURL(link.href);
});

// ========= 选项卡切换逻辑 =========
function setActiveMode(mode) {
    activeMode = mode;
    if (mode === 'img') {
        imgPanel.classList.add('active-panel');
        textPanel.classList.remove('active-panel');
        // 如果图片模式有之前的ascii结果可以展示同步一下显示 (确保pre展示最新)
        if (lastImgAscii) imgAsciiPre.innerText = lastImgAscii;
        else if (currentImgFile) imgAsciiPre.innerText = "点击「转换为ASCII」生成字符画";
        else imgAsciiPre.innerText = "✨ 上传图片并点击「转换为 ASCII」生成字符画 ✨";
    } else {
        textPanel.classList.add('active-panel');
        imgPanel.classList.remove('active-panel');
        if (lastTextAscii) textAsciiPre.innerText = lastTextAscii;
        else textAsciiPre.innerText = "✨ 输入文字并点击生成按钮 ✨";
    }
    // 更新按钮样式
    tabBtns.forEach(btn => {
        if (btn.getAttribute('data-mode') === mode) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-mode');
        if (mode === 'img') setActiveMode('img');
        else setActiveMode('text');
    });
});

// 给图片预览区域默认演示图片可以用一个简约占位, 若没有图片文件可以给一个默认演示，方便测试, 增加一个初始示例图(内置base64简单渐变)
// 为了让用户快速体验，自动加载一个默认内置示例图片（一个小渐变）并自动生成一次ASCII（可选但为了开箱展示，转换一次默认示例？提高初次体验）
// 内置一个示例图片作为演示
function loadDemoImage() {
    const canvasDemo = document.createElement('canvas');
    canvasDemo.width = 400;
    canvasDemo.height = 200;
    const ctxDemo = canvasDemo.getContext('2d');
    const grd = ctxDemo.createLinearGradient(0, 0, 400, 200);
    grd.addColorStop(0, '#4a6eff');
    grd.addColorStop(0.5, '#bc7aff');
    grd.addColorStop(1, '#ff93c2');
    ctxDemo.fillStyle = grd;
    ctxDemo.fillRect(0, 0, 400, 200);
    ctxDemo.font = "bold 28px monospace";
    ctxDemo.fillStyle = "#ffffff";
    ctxDemo.shadowBlur = 0;
    ctxDemo.fillText("ASCII", 120, 100);
    ctxDemo.fillText("ART", 260, 150);
    canvasDemo.toBlob(blob => {
        const file = new File([blob], "demo.png", { type: "image/png" });
        handleImageFile(file);
        // 初次自动转换一次
        setTimeout(() => {
            performImageConversion();
        }, 100);
    });
}
// 确保第一次加载时有示例图
loadDemoImage();

// 同步宽度值初始显示
widthValSpan.innerText = asciiWidthSlider.value;

// 文本模式初次默认预生成一次示例
setTimeout(() => {
    if (inputTextArea.value.trim() !== "") {
        generateTextArt();
    } else {
        // 设置默认示例
        inputTextArea.value = "ASCII ART";
        generateTextArt();
    }
}, 300);
