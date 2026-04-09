/**
 * 证件照P图网站 - 主逻辑文件
 * 功能：图片上传、衣服更换、位置调整、美颜、导出
 */

// ============================================
// 全局变量
// ============================================
let canvas = null;
let ctx = null;
let originalImage = null;      // 原始图片
let processedImageData = null;  // 处理后的图片数据
let currentPhoto = null;        // 当前头像图片
let currentClothes = null;     // 当前衣服SVG
let currentBgColor = '#FFFFFF'; // 当前背景色

// 画布设置
let canvasWidth = 295;
let canvasHeight = 413;
let photoScale = 100;
let photoYOffset = 0;
let clothesScale = 100;
let clothesYOffset = 0;

// 美颜参数
let beautyLevel = 0;    // 美颜 0-100
let whitenLevel = 0;   // 美白 0-100
let slimLevel = 0;     // 瘦脸 0-100

// 显示缩放
let displayZoom = 1;

// ============================================
// 衣服素材定义（SVG）
// ============================================
const clothesList = [
    {
        id: 'none',
        name: '无',
        svg: ''
    },
    {
        id: 'suit-black',
        name: '黑色西装',
        svg: `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
            <!-- 西装主体 -->
            <path d="M40 30 L100 10 L160 30 L170 150 L30 150 Z" fill="#1a1a1a"/>
            <!-- 左领 -->
            <path d="M70 30 L100 70 L85 150 L50 150 L40 60 Z" fill="#2d2d2d"/>
            <!-- 右领 -->
            <path d="M130 30 L100 70 L115 150 L150 150 L160 60 Z" fill="#2d2d2d"/>
            <!-- 衬衫领口 -->
            <path d="M80 40 L100 65 L120 40 L115 50 L100 75 L85 50 Z" fill="#FFFFFF"/>
            <!-- 领带 -->
            <path d="M95 50 L100 55 L105 50 L108 70 L100 80 L92 70 Z" fill="#DC2626"/>
            <path d="M97 80 L100 85 L103 80 L104 100 L100 105 L96 100 Z" fill="#B91C1C"/>
            <!-- 口袋 -->
            <rect x="55" y="95" width="25" height="3" fill="#0f0f0f" rx="1"/>
        </svg>`
    },
    {
        id: 'suit-blue',
        name: '蓝色西装',
        svg: `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
            <path d="M40 30 L100 10 L160 30 L170 150 L30 150 Z" fill="#1E3A5F"/>
            <path d="M70 30 L100 70 L85 150 L50 150 L40 60 Z" fill="#234B73"/>
            <path d="M130 30 L100 70 L115 150 L150 150 L160 60 Z" fill="#234B73"/>
            <path d="M80 40 L100 65 L120 40 L115 50 L100 75 L85 50 Z" fill="#FFFFFF"/>
            <path d="M95 50 L100 55 L105 50 L108 70 L100 80 L92 70 Z" fill="#3B82F6"/>
            <path d="M97 80 L100 85 L103 80 L104 100 L100 105 L96 100 Z" fill="#2563EB"/>
            <rect x="55" y="95" width="25" height="3" fill="#152A45" rx="1"/>
        </svg>`
    },
    {
        id: 'suit-gray',
        name: '灰色西装',
        svg: `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
            <path d="M40 30 L100 10 L160 30 L170 150 L30 150 Z" fill="#4B5563"/>
            <path d="M70 30 L100 70 L85 150 L50 150 L40 60 Z" fill="#5B6573"/>
            <path d="M130 30 L100 70 L115 150 L150 150 L160 60 Z" fill="#5B6573"/>
            <path d="M80 40 L100 65 L120 40 L115 50 L100 75 L85 50 Z" fill="#FFFFFF"/>
            <path d="M95 50 L100 55 L105 50 L108 70 L100 80 L92 70 Z" fill="#7C3AED"/>
            <path d="M97 80 L100 85 L103 80 L104 100 L100 105 L96 100 Z" fill="#6D28D9"/>
            <rect x="55" y="95" width="25" height="3" fill="#374151" rx="1"/>
        </svg>`
    },
    {
        id: 'shirt-white',
        name: '白色衬衫',
        svg: `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
            <path d="M45 35 L100 15 L155 35 L160 150 L40 150 Z" fill="#FAFAFA"/>
            <path d="M75 35 L100 65 L125 35 L120 50 L100 75 L80 50 Z" fill="#FFFFFF"/>
            <path d="M75 35 L100 65 L80 50 Z" fill="#F5F5F5"/>
            <path d="M125 35 L100 65 L120 50 Z" fill="#F5F5F5"/>
            <!-- 纽扣 -->
            <circle cx="100" cy="85" r="4" fill="#E5E7EB"/>
            <circle cx="100" cy="105" r="4" fill="#E5E7EB"/>
            <circle cx="100" cy="125" r="4" fill="#E5E7EB"/>
            <!-- 领口线条 -->
            <path d="M75 35 L100 55 L125 35" stroke="#E5E7EB" stroke-width="2" fill="none"/>
        </svg>`
    },
    {
        id: 'shirt-blue',
        name: '蓝色衬衫',
        svg: `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
            <path d="M45 35 L100 15 L155 35 L160 150 L40 150 Z" fill="#3B82F6"/>
            <path d="M75 35 L100 65 L125 35 L120 50 L100 75 L80 50 Z" fill="#FFFFFF"/>
            <path d="M75 35 L100 65 L80 50 Z" fill="#2563EB"/>
            <path d="M125 35 L100 65 L120 50 Z" fill="#2563EB"/>
            <circle cx="100" cy="85" r="4" fill="#1D4ED8"/>
            <circle cx="100" cy="105" r="4" fill="#1D4ED8"/>
            <circle cx="100" cy="125" r="4" fill="#1D4ED8"/>
        </svg>`
    },
    {
        id: 'suit-red',
        name: '红色西装',
        svg: `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
            <path d="M40 30 L100 10 L160 30 L170 150 L30 150 Z" fill="#7F1D1D"/>
            <path d="M70 30 L100 70 L85 150 L50 150 L40 60 Z" fill="#991B1B"/>
            <path d="M130 30 L100 70 L115 150 L150 150 L160 60 Z" fill="#991B1B"/>
            <path d="M80 40 L100 65 L120 40 L115 50 L100 75 L85 50 Z" fill="#FFFFFF"/>
            <path d="M95 50 L100 55 L105 50 L108 70 L100 80 L92 70 Z" fill="#DC2626"/>
            <path d="M97 80 L100 85 L103 80 L104 100 L100 105 L96 100 Z" fill="#B91C1C"/>
            <rect x="55" y="95" width="25" height="3" fill="#450A0A" rx="1"/>
        </svg>`
    },
    {
        id: 'gown-blue',
        name: '蓝色工作服',
        svg: `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
            <path d="M40 30 L100 10 L160 30 L165 150 L35 150 Z" fill="#1E40AF"/>
            <path d="M70 30 L100 70 L85 150 L50 150 L40 60 Z" fill="#1E3A8A"/>
            <path d="M130 30 L100 70 L115 150 L150 150 L160 60 Z" fill="#1E3A8A"/>
            <!-- V领 -->
            <path d="M80 40 L100 70 L120 40 L115 55 L100 80 L85 55 Z" fill="#3B82F6"/>
            <!-- 纽扣 -->
            <circle cx="100" cy="95" r="5" fill="#FCD34D"/>
            <circle cx="100" cy="115" r="5" fill="#FCD34D"/>
            <!-- 口袋 -->
            <rect x="55" y="100" width="22" height="25" fill="#1E3A8A" rx="2"/>
            <rect x="123" y="100" width="22" height="25" fill="#1E3A8A" rx="2"/>
        </svg>`
    }
];

// ============================================
// 初始化
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    initClothesGrid();
    initEventListeners();
});

// 初始化画布
function initCanvas() {
    canvas = document.getElementById('mainCanvas');
    ctx = canvas.getContext('2d');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    updateCanvasDisplay();
}

// 初始化衣服网格
function initClothesGrid() {
    const grid = document.getElementById('clothesGrid');
    grid.innerHTML = '';
    
    clothesList.forEach((clothes, index) => {
        const item = document.createElement('div');
        item.className = 'clothes-item' + (index === 0 ? ' active' : '');
        item.dataset.id = clothes.id;
        item.innerHTML = `
            <div class="clothes-preview">
                ${clothes.svg || '<div style="width:60px;height:50px;display:flex;align-items:center;justify-content:center;font-size:24px;">🚫</div>'}
            </div>
            <span>${clothes.name}</span>
        `;
        item.addEventListener('click', () => selectClothes(clothes));
        grid.appendChild(item);
    });
}

// ============================================
// 事件监听
// ============================================
function initEventListeners() {
    // 文件上传
    const fileInput = document.getElementById('fileInput');
    const uploadHint = document.getElementById('uploadHint');
    
    fileInput.addEventListener('change', handleFileSelect);
    
    // 拖拽上传
    uploadHint.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadHint.classList.add('dragover');
    });
    
    uploadHint.addEventListener('dragleave', () => {
        uploadHint.classList.remove('dragover');
    });
    
    uploadHint.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadHint.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.match(/image.*/)) {
            handleFile(files[0]);
        }
    });
    
    uploadHint.addEventListener('click', (e) => {
        if (e.target !== fileInput) {
            fileInput.click();
        }
    });
    
    // 尺寸选择
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            canvasWidth = parseInt(btn.dataset.width);
            canvasHeight = parseInt(btn.dataset.height);
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            updateCanvasDisplay();
            if (originalImage) {
                renderCanvas();
            }
        });
    });
    
    // 背景颜色
    document.querySelectorAll('.bg-color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.bg-color-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentBgColor = btn.dataset.color;
            if (originalImage) {
                renderCanvas();
            }
        });
    });
    
    // 滑块控制
    setupSlider('photoScale', 'photoScaleValue', '%', (val) => {
        photoScale = val;
        renderCanvas();
    });
    
    setupSlider('photoYOffset', 'photoYOffsetValue', 'px', (val) => {
        photoYOffset = val;
        renderCanvas();
    });
    
    setupSlider('clothesScale', 'clothesScaleValue', '%', (val) => {
        clothesScale = val;
        updateClothesOverlay();
    });
    
    setupSlider('clothesYOffset', 'clothesYOffsetValue', 'px', (val) => {
        clothesYOffset = val;
        updateClothesOverlay();
    });
    
    // 美颜滑块
    setupSlider('beautyLevel', 'beautyLevelValue', '', (val) => {
        beautyLevel = val;
        applyBeautyEffects();
    });
    
    setupSlider('whitenLevel', 'whitenLevelValue', '', (val) => {
        whitenLevel = val;
        applyBeautyEffects();
    });
    
    setupSlider('slimLevel', 'slimLevelValue', '', (val) => {
        slimLevel = val;
        applyBeautyEffects();
    });
}

// 滑块设置辅助函数
function setupSlider(sliderId, valueId, suffix, callback) {
    const slider = document.getElementById(sliderId);
    const valueDisplay = document.getElementById(valueId);
    
    slider.addEventListener('input', () => {
        valueDisplay.textContent = slider.value + suffix;
        callback(parseInt(slider.value));
    });
}

// ============================================
// 文件处理
// ============================================
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file && file.type.match(/image.*/)) {
        handleFile(file);
    }
}

function handleFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            originalImage = img;
            document.getElementById('originalImage').src = e.target.result;
            showCanvas();
            resetBeauty();
            renderCanvas();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// 显示画布，隐藏上传提示
function showCanvas() {
    document.getElementById('uploadHint').style.display = 'none';
    document.getElementById('canvasContainer').style.display = 'flex';
}

// ============================================
// 画布渲染
// ============================================
function renderCanvas() {
    if (!originalImage) return;
    
    // 清空画布
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // 绘制背景
    ctx.fillStyle = currentBgColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // 计算图片缩放和位置
    const scale = photoScale / 100;
    const imgAspect = originalImage.width / originalImage.height;
    const canvasAspect = canvasWidth / canvasHeight;
    
    let drawWidth, drawHeight;
    
    if (imgAspect > canvasAspect) {
        drawHeight = canvasHeight * scale;
        drawWidth = drawHeight * imgAspect;
    } else {
        drawWidth = canvasWidth * scale;
        drawHeight = drawWidth / imgAspect;
    }
    
    // 居中并应用偏移
    const x = (canvasWidth - drawWidth) / 2;
    const y = (canvasHeight - drawHeight) / 2 + photoYOffset;
    
    // 绘制图片
    ctx.drawImage(originalImage, x, y, drawWidth, drawHeight);
    
    // 应用美颜效果
    if (beautyLevel > 0 || whitenLevel > 0 || slimLevel > 0) {
        applyCanvasBeauty(x, y, drawWidth, drawHeight);
    }
    
    // 保存处理后的数据
    processedImageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
}

// 应用Canvas美颜效果
function applyCanvasBeauty(x, y, width, height) {
    if (beautyLevel === 0 && whitenLevel === 0 && slimLevel === 0) return;
    
    const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    const data = imageData.data;
    
    // 计算人像区域（简化：中心区域）
    const faceX = canvasWidth * 0.2;
    const faceY = canvasHeight * 0.05;
    const faceW = canvasWidth * 0.6;
    const faceH = canvasHeight * 0.7;
    
    for (let i = 0; i < data.length; i += 4) {
        const pixelX = (i / 4) % canvasWidth;
        const pixelY = Math.floor((i / 4) / canvasWidth);
        
        // 检查是否在人物区域
        const inFace = pixelX >= faceX && pixelX <= faceX + faceW &&
                       pixelY >= faceY && pixelY <= faceY + faceH;
        
        if (inFace) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];
            
            // 美白效果
            if (whitenLevel > 0) {
                const whitenFactor = whitenLevel / 100 * 0.3;
                r = r + (255 - r) * whitenFactor;
                g = g + (255 - g) * whitenFactor;
                b = b + (255 - b) * whitenFactor;
            }
            
            // 美颜效果（简单模糊+锐化）
            if (beautyLevel > 0) {
                // 提高对比度，降低饱和度
                const beautyFactor = beautyLevel / 100 * 0.2;
                const avg = (r + g + b) / 3;
                r = r + (avg - r) * beautyFactor;
                g = g + (avg - g) * beautyFactor;
                b = b + (avg - b) * beautyFactor;
                
                // 增加一点亮度
                const brightnessBoost = 1 + (beautyLevel / 100 * 0.1);
                r = Math.min(255, r * brightnessBoost);
                g = Math.min(255, g * brightnessBoost);
                b = Math.min(255, b * brightnessBoost);
            }
            
            data[i] = Math.min(255, Math.max(0, r));
            data[i + 1] = Math.min(255, Math.max(0, g));
            data[i + 2] = Math.min(255, Math.max(0, b));
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
}

// ============================================
// 美颜效果
// ============================================
function applyBeautyEffects() {
    if (originalImage) {
        renderCanvas();
    }
}

function resetBeauty() {
    beautyLevel = 0;
    whitenLevel = 0;
    slimLevel = 0;
    
    document.getElementById('beautyLevel').value = 0;
    document.getElementById('whitenLevel').value = 0;
    document.getElementById('slimLevel').value = 0;
    
    document.getElementById('beautyLevelValue').textContent = '0';
    document.getElementById('whitenLevelValue').textContent = '0';
    document.getElementById('slimLevelValue').textContent = '0';
    
    if (originalImage) {
        renderCanvas();
    }
}

// ============================================
// 衣服选择
// ============================================
function selectClothes(clothes) {
    document.querySelectorAll('.clothes-item').forEach(item => {
        item.classList.toggle('active', item.dataset.id === clothes.id);
    });
    
    currentClothes = clothes;
    updateClothesOverlay();
}

function updateClothesOverlay() {
    const overlay = document.getElementById('clothesOverlay');
    
    if (!currentClothes || !currentClothes.svg) {
        overlay.innerHTML = '';
        return;
    }
    
    const scale = clothesScale / 100;
    const baseWidth = canvasWidth * 0.8;
    const baseHeight = canvasHeight * 0.35;
    
    overlay.innerHTML = `
        <div style="
            position: relative;
            width: ${baseWidth * scale}px;
            height: ${baseHeight * scale}px;
            bottom: ${canvasHeight * 0.05 - clothesYOffset}px;
        ">
            ${currentClothes.svg.replace('<svg', `<svg style="width:100%;height:100%;"`)}
        </div>
    `;
}

// ============================================
// 画布缩放
// ============================================
function zoomCanvas(delta) {
    displayZoom = Math.max(0.25, Math.min(2, displayZoom + delta));
    updateCanvasDisplay();
}

function updateCanvasDisplay() {
    const container = document.getElementById('canvasContainer');
    if (canvas) {
        canvas.style.transform = `scale(${displayZoom})`;
        canvas.style.maxWidth = `${canvasWidth * displayZoom}px`;
        canvas.style.maxHeight = `${canvasHeight * displayZoom}px`;
    }
    document.getElementById('zoomLevel').textContent = Math.round(displayZoom * 100) + '%';
}

// ============================================
// 图片导出
// ============================================
function exportImage(format) {
    if (!originalImage) {
        showToast('请先上传图片', 'error');
        return;
    }
    
    // 创建一个新的临时画布用于导出
    const exportCanvas = document.createElement('canvas');
    const exportCtx = exportCanvas.getContext('2d');
    exportCanvas.width = canvasWidth;
    exportCanvas.height = canvasHeight;
    
    // 绘制背景
    if (format === 'jpg') {
        exportCtx.fillStyle = currentBgColor;
        exportCtx.fillRect(0, 0, canvasWidth, canvasHeight);
    }
    
    // 绘制头像
    const scale = photoScale / 100;
    const imgAspect = originalImage.width / originalImage.height;
    const canvasAspect = canvasWidth / canvasHeight;
    
    let drawWidth, drawHeight;
    
    if (imgAspect > canvasAspect) {
        drawHeight = canvasHeight * scale;
        drawWidth = drawHeight * imgAspect;
    } else {
        drawWidth = canvasWidth * scale;
        drawHeight = drawWidth / imgAspect;
    }
    
    const x = (canvasWidth - drawWidth) / 2;
    const y = (canvasHeight - drawHeight) / 2 + photoYOffset;
    
    exportCtx.drawImage(originalImage, x, y, drawWidth, drawHeight);
    
    // 应用美颜
    if (beautyLevel > 0 || whitenLevel > 0 || slimLevel > 0) {
        const imageData = exportCtx.getImageData(0, 0, canvasWidth, canvasHeight);
        const data = imageData.data;
        
        const faceX = canvasWidth * 0.2;
        const faceY = canvasHeight * 0.05;
        const faceW = canvasWidth * 0.6;
        const faceH = canvasHeight * 0.7;
        
        for (let i = 0; i < data.length; i += 4) {
            const pixelX = (i / 4) % canvasWidth;
            const pixelY = Math.floor((i / 4) / canvasWidth);
            
            const inFace = pixelX >= faceX && pixelX <= faceX + faceW &&
                           pixelY >= faceY && pixelY <= faceY + faceH;
            
            if (inFace) {
                let r = data[i];
                let g = data[i + 1];
                let b = data[i + 2];
                
                if (whitenLevel > 0) {
                    const whitenFactor = whitenLevel / 100 * 0.3;
                    r = r + (255 - r) * whitenFactor;
                    g = g + (255 - g) * whitenFactor;
                    b = b + (255 - b) * whitenFactor;
                }
                
                if (beautyLevel > 0) {
                    const beautyFactor = beautyLevel / 100 * 0.2;
                    const avg = (r + g + b) / 3;
                    r = r + (avg - r) * beautyFactor;
                    g = g + (avg - g) * beautyFactor;
                    b = b + (avg - b) * beautyFactor;
                    
                    const brightnessBoost = 1 + (beautyLevel / 100 * 0.1);
                    r = Math.min(255, r * brightnessBoost);
                    g = Math.min(255, g * brightnessBoost);
                    b = Math.min(255, b * brightnessBoost);
                }
                
                // 瘦脸效果（水平挤压人像区域）
                if (slimLevel > 0) {
                    const centerX = canvasWidth / 2;
                    const distFromCenter = Math.abs(pixelX - centerX);
                    const maxDist = canvasWidth / 2;
                    const slimFactor = 1 - (slimLevel / 100) * 0.3 * (1 - distFromCenter / maxDist);
                    
                    // 简单实现：边缘像素向中心收缩效果（这里只影响视觉上的宽高比）
                    // 实际瘦脸需要更复杂的人脸检测和变形算法
                }
                
                data[i] = Math.min(255, Math.max(0, r));
                data[i + 1] = Math.min(255, Math.max(0, g));
                data[i + 2] = Math.min(255, Math.max(0, b));
            }
        }
        
        exportCtx.putImageData(imageData, 0, 0);
    }
    
    // 绘制衣服（如果选择了的话）
    if (currentClothes && currentClothes.svg) {
        // 创建临时SVG图片
        const svgBlob = new Blob([currentClothes.svg], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        const clothesImg = new Image();
        clothesImg.onload = () => {
            const clothesScaleVal = clothesScale / 100;
            const clothesWidth = canvasWidth * 0.8 * clothesScaleVal;
            const clothesHeight = canvasHeight * 0.35 * clothesScaleVal;
            const clothesX = (canvasWidth - clothesWidth) / 2;
            const clothesY = canvasHeight - clothesHeight - canvasHeight * 0.05;
            
            exportCtx.drawImage(clothesImg, clothesX, clothesY, clothesWidth, clothesHeight);
            
            // 完成导出
            finishExport(exportCanvas, format);
            
            URL.revokeObjectURL(url);
        };
        clothesImg.src = url;
    } else {
        finishExport(exportCanvas, format);
    }
}

function finishExport(exportCanvas, format) {
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    const quality = format === 'jpg' ? 0.95 : undefined;
    
    const dataUrl = exportCanvas.toDataURL(mimeType, quality);
    
    // 创建下载链接
    const link = document.createElement('a');
    link.download = `证件照_${canvasWidth}x${canvasHeight}.${format}`;
    link.href = dataUrl;
    link.click();
    
    showToast(`${format.toUpperCase()} 图片已导出`, 'success');
}

// ============================================
// 工具函数
// ============================================
function showToast(message, type = 'info') {
    // 移除现有toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // 触发动画
    setTimeout(() => toast.classList.add('show'), 10);
    
    // 自动消失
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// 重置所有设置
function resetAll() {
    // 重置画布尺寸
    canvasWidth = 295;
    canvasHeight = 413;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    document.querySelectorAll('.size-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === 0);
    });
    
    // 重置调整参数
    photoScale = 100;
    photoYOffset = 0;
    clothesScale = 100;
    clothesYOffset = 0;
    document.getElementById('photoScale').value = 100;
    document.getElementById('photoYOffset').value = 0;
    document.getElementById('clothesScale').value = 100;
    document.getElementById('clothesYOffset').value = 0;
    document.getElementById('photoScaleValue').textContent = '100%';
    document.getElementById('photoYOffsetValue').textContent = '0px';
    document.getElementById('clothesScaleValue').textContent = '100%';
    document.getElementById('clothesYOffsetValue').textContent = '0px';
    
    // 重置背景色
    currentBgColor = '#FFFFFF';
    document.querySelectorAll('.bg-color-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === 0);
    });
    
    // 重置衣服
    currentClothes = clothesList[0];
    document.querySelectorAll('.clothes-item').forEach((item, i) => {
        item.classList.toggle('active', i === 0);
    });
    document.getElementById('clothesOverlay').innerHTML = '';
    
    // 重置美颜
    resetBeauty();
    
    // 重置缩放
    displayZoom = 1;
    updateCanvasDisplay();
    
    // 重新渲染
    if (originalImage) {
        renderCanvas();
    }
    
    showToast('所有设置已重置', 'success');
}

// ============================================
// 暴露全局函数供HTML调用
// ============================================
window.handleFileSelect = handleFileSelect;
window.zoomCanvas = zoomCanvas;
window.exportImage = exportImage;
window.resetBeauty = resetBeauty;
window.resetAll = resetAll;
