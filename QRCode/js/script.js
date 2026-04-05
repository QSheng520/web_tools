(function(){
    // ----- DOM 元素 -----
    const canvas = document.getElementById('qrCanvas');
    const textarea = document.getElementById('qrText');
    const fgColorPicker = document.getElementById('fgColor');
    const bgColorPicker = document.getElementById('bgColor');
    const logoUpload = document.getElementById('logoUpload');
    const clearLogoBtn = document.getElementById('clearLogoBtn');
    const logoPreviewArea = document.getElementById('logoPreviewArea');
    const logoPreviewImg = document.getElementById('logoPreviewImg');
    const downloadBtn = document.getElementById('downloadBtn');

    // ----- 全局状态 -----
    let currentLogoImage = null;     // HTMLImageElement 对象
    let currentLogoBlobUrl = null;   // 用于释放内存
    let isGenerating = false;         // 简单防抖标志

    // ----- 辅助函数：释放logo资源 -----
    function releaseLogoUrl() {
        if (currentLogoBlobUrl) {
            URL.revokeObjectURL(currentLogoBlobUrl);
            currentLogoBlobUrl = null;
        }
    }

    // ----- 清除Logo（内存 + UI）-----
    function clearLogo() {
        if (currentLogoImage) {
            currentLogoImage = null;
        }
        releaseLogoUrl();
        // 隐藏预览区域
        logoPreviewArea.style.display = 'none';
        logoPreviewImg.src = '';
        // 清空file input的值，以便重新上传同一文件能触发change
        logoUpload.value = '';
        // 重新生成二维码（不带logo）
        generateQRCode();
    }

    // ----- 在canvas上绘制Logo（白色圆底 + 自适应居中）-----
    function drawLogoOnCanvas(ctx, canvasEl, logoImg) {
        if (!logoImg || !logoImg.complete || logoImg.naturalWidth === 0) {
            return false;
        }

        const size = canvasEl.width;        // 正方形二维码宽高相等
        const logoMaxSize = size * 0.22;     // logo最大宽度占比 22% （保证识别率且美观）
        
        // 计算logo绘制尺寸 (保持宽高比)
        let logoWidth = logoImg.width;
        let logoHeight = logoImg.height;
        let targetWidth, targetHeight;
        
        if (logoWidth > logoHeight) {
            targetWidth = logoMaxSize;
            targetHeight = (logoHeight / logoWidth) * logoMaxSize;
        } else {
            targetHeight = logoMaxSize;
            targetWidth = (logoWidth / logoHeight) * logoMaxSize;
        }
        
        // 边界微调：确保不超过logoMaxSize
        if (targetWidth > logoMaxSize) targetWidth = logoMaxSize;
        if (targetHeight > logoMaxSize) targetHeight = logoMaxSize;
        
        const centerX = size / 2;
        const centerY = size / 2;
        const startX = centerX - targetWidth / 2;
        const startY = centerY - targetHeight / 2;
        
        // 绘制圆形白色背景 (加强对比，使logo更清晰，且避免背景色干扰)
        ctx.save();
        // 绘制柔和阴影提升质感
        ctx.shadowColor = "rgba(0,0,0,0.15)";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        // 绘制圆角方形底纹 (更现代的样式)
        const radius = Math.min(targetWidth, targetHeight) * 0.2;
        ctx.moveTo(centerX - targetWidth/2 + radius, centerY - targetHeight/2);
        ctx.lineTo(centerX + targetWidth/2 - radius, centerY - targetHeight/2);
        ctx.quadraticCurveTo(centerX + targetWidth/2, centerY - targetHeight/2, centerX + targetWidth/2, centerY - targetHeight/2 + radius);
        ctx.lineTo(centerX + targetWidth/2, centerY + targetHeight/2 - radius);
        ctx.quadraticCurveTo(centerX + targetWidth/2, centerY + targetHeight/2, centerX + targetWidth/2 - radius, centerY + targetHeight/2);
        ctx.lineTo(centerX - targetWidth/2 + radius, centerY + targetHeight/2);
        ctx.quadraticCurveTo(centerX - targetWidth/2, centerY + targetHeight/2, centerX - targetWidth/2, centerY + targetHeight/2 - radius);
        ctx.lineTo(centerX - targetWidth/2, centerY - targetHeight/2 + radius);
        ctx.quadraticCurveTo(centerX - targetWidth/2, centerY - targetHeight/2, centerX - targetWidth/2 + radius, centerY - targetHeight/2);
        ctx.closePath();
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
        // 可选: 描边细线
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#E2E8F0";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // 绘制Logo图片 (带轻微圆角裁剪效果)
        ctx.save();
        ctx.beginPath();
        // 同样圆角路径裁剪，让logo边缘更融合
        ctx.moveTo(startX + radius, startY);
        ctx.lineTo(startX + targetWidth - radius, startY);
        ctx.quadraticCurveTo(startX + targetWidth, startY, startX + targetWidth, startY + radius);
        ctx.lineTo(startX + targetWidth, startY + targetHeight - radius);
        ctx.quadraticCurveTo(startX + targetWidth, startY + targetHeight, startX + targetWidth - radius, startY + targetHeight);
        ctx.lineTo(startX + radius, startY + targetHeight);
        ctx.quadraticCurveTo(startX, startY + targetHeight, startX, startY + targetHeight - radius);
        ctx.lineTo(startX, startY + radius);
        ctx.quadraticCurveTo(startX, startY, startX + radius, startY);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(logoImg, startX, startY, targetWidth, targetHeight);
        ctx.restore();
        
        // 外圈增加极细装饰环 (可选精致感)
        ctx.beginPath();
        ctx.arc(centerX, centerY, Math.max(targetWidth, targetHeight)/2 + 3, 0, Math.PI * 2);
        ctx.strokeStyle = "#CBD5E1";
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.restore(); // 恢复阴影等设置
        return true;
    }

    // ----- 核心：生成二维码 (调用qrcode库，然后合成logo) -----
    function generateQRCode() {
        // 防止快速连续调用
        if (isGenerating) return;
        isGenerating = true;
        
        let text = textarea.value.trim();
        if (text === "") {
            text = "https://www.qrcode.demo"; // 默认占位
            textarea.value = text;
        }
        
        const fgColor = fgColorPicker.value;
        const bgColor = bgColorPicker.value;
        
        // 二维码配置：高容错(H) 确保加入logo后仍可识别
        const options = {
            errorCorrectionLevel: 'H',
            margin: 1,          // 外边距小一点更美观
            width: 300,
            color: {
                dark: fgColor,
                light: bgColor
            }
        };
        
        // 调用qrcode库绘制基础二维码
        QRCode.toCanvas(canvas, text, options, (error) => {
            if (error) {
                console.error("二维码生成失败:", error);
                // 显示错误提示
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = "#f8d7da";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = "#721c24";
                ctx.font = "12px sans-serif";
                ctx.fillText("生成失败: 内容无效或过长", 20, canvas.height/2);
                isGenerating = false;
                return;
            }
            
            // 成功生成原始二维码 -> 如果有logo则绘制logo
            if (currentLogoImage && currentLogoImage.complete && currentLogoImage.naturalWidth > 0) {
                const ctx = canvas.getContext('2d');
                // 绘制logo之前确保canvas没有被污染（一般无跨域问题，本地blob安全）
                drawLogoOnCanvas(ctx, canvas, currentLogoImage);
            } else if (currentLogoImage && !currentLogoImage.complete) {
                // 理论上图片加载完成才会赋值，但以防万一: 监听一次加载后再次重绘
                currentLogoImage.addEventListener('load', function onLogoLoad() {
                    currentLogoImage.removeEventListener('load', onLogoLoad);
                    if (currentLogoImage) {
                        const ctx = canvas.getContext('2d');
                        drawLogoOnCanvas(ctx, canvas, currentLogoImage);
                    }
                    isGenerating = false;
                });
                // 本次生成先完成，但是不重复触发isGenerating复位延迟
                setTimeout(() => { isGenerating = false; }, 100);
                return;
            }
            isGenerating = false;
        });
    }

    // ----- 带Logo重绘的包装：确保颜色/文本变化后重新调用生成 -----
    function refreshQR() {
        generateQRCode();
    }

    // ----- 处理logo上传，生成blob url并加载图片 -----
    function handleLogoUpload(file) {
        if (!file) return;
        
        // 检查文件类型
        if (!file.type.match('image.*')) {
            alert("请上传图片文件 (PNG, JPEG, JPG, WEBP, SVG)");
            return;
        }
        
        // 释放旧资源
        if (currentLogoImage) {
            currentLogoImage = null;
        }
        releaseLogoUrl();
        
        // 创建新的ObjectURL
        const blobUrl = URL.createObjectURL(file);
        currentLogoBlobUrl = blobUrl;
        
        const img = new Image();
        img.crossOrigin = "Anonymous"; // 避免跨域（本地blob无需担心）
        img.onload = () => {
            // 图片加载完成，保存图片对象并刷新预览和二维码
            currentLogoImage = img;
            // 更新预览UI
            logoPreviewImg.src = blobUrl;
            logoPreviewArea.style.display = 'flex';
            // 刷新二维码（带logo）
            refreshQR();
        };
        img.onerror = () => {
            console.warn("logo加载失败，可能文件损坏");
            releaseLogoUrl();
            currentLogoImage = null;
            logoPreviewArea.style.display = 'none';
            refreshQR();  // 重新生成无logo版本
            alert("Logo加载失败，请尝试其他图片");
        };
        img.src = blobUrl;
    }
    
    // 文件上传监听
    function onFileSelected(event) {
        const file = event.target.files[0];
        if (file) {
            handleLogoUpload(file);
        }
    }
    
    // ----- 防抖优化（文本输入、颜色变化时频繁刷新，延迟合并）-----
    let debounceTimer = null;
    function debouncedRefresh() {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            refreshQR();
            debounceTimer = null;
        }, 30);
    }
    
    // ----- 监听各种输入事件 -----
    function bindEvents() {
        textarea.addEventListener('input', () => debouncedRefresh());
        fgColorPicker.addEventListener('input', () => debouncedRefresh());
        bgColorPicker.addEventListener('input', () => debouncedRefresh());
        logoUpload.addEventListener('change', onFileSelected);
        clearLogoBtn.addEventListener('click', () => {
            clearLogo();
            // 重置文件上传按钮值
            logoUpload.value = '';
        });
        downloadBtn.addEventListener('click', downloadQRCode);
    }
    
    // ----- 下载二维码 (PNG格式，包含logo和配色) -----
    function downloadQRCode() {
        try {
            // 确保canvas有内容
            if (!canvas || canvas.width === 0) {
                alert("二维码尚未生成，请稍后再试");
                return;
            }
            // 如果当前canvas内没有任何内容（黑屏情况）阻止下载
            const link = document.createElement('a');
            link.download = 'qrcode_custom.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error("下载失败", err);
            alert("下载失败，可能存在跨域限制，但通常不影响");
        }
    }
    
    // ----- 初始加载后生成默认二维码，并且如果之前有logo残留处理-----
    function init() {
        bindEvents();
        // 默认样例内容: 可读文本
        if (textarea.value === "") {
            textarea.value = "https://www.zhuoqiusheng.cn";
        }
        // 清空任何遗留的logo内存
        clearLogo();     // 清除残留预览
        currentLogoImage = null;
        releaseLogoUrl();
        // 初始生成干净二维码
        generateQRCode();
    }
    
    // 在窗口resize时？不需要，canvas固定300px。但额外确保logo绘制适应尺寸
    window.addEventListener('resize', () => {
        // 如果canvas大小因css被缩放，但物理像素不变，无需重绘，但为防止重影调用刷新?
        if (currentLogoImage) {
            refreshQR();
        }
    });
    
    // 启动
    init();
})();
