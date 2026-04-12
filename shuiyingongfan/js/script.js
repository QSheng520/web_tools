// ===== 水印工坊脚本 =====

// DOM元素引用
const uploadBox = document.getElementById('uploadBox');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const watermarkText = document.getElementById('watermarkText');
const fontFamily = document.getElementById('fontFamily');
const fontSize = document.getElementById('fontSize');
const textColor = document.getElementById('textColor');
const textEnable = document.getElementById('textEnable');
const watermarkImageInput = document.getElementById('watermarkImageInput');
const wmImageStatus = document.getElementById('wmImageStatus');
const imageEnable = document.getElementById('imageEnable');
const wmScale = document.getElementById('wmScale');
const scaleValue = document.getElementById('scaleValue');
const opacitySlider = document.getElementById('opacitySlider');
const opacityValue = document.getElementById('opacityValue');
const grid9Container = document.getElementById('grid9Container');
const offsetX = document.getElementById('offsetX');
const offsetY = document.getElementById('offsetY');
const downloadBtn = document.getElementById('downloadBtn');
const previewCanvas = document.getElementById('previewCanvas');
const previewSizeLabel = document.getElementById('previewSizeLabel');

// 状态变量
let originalImage = null;
let watermarkImage = null;
let position = 'center'; // 九宫格位置

// 初始化
function init() {
  setupEventListeners();
  updatePreview();
}

// 设置事件监听器
function setupEventListeners() {
  // 文件上传
  uploadBox.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', handleFileSelect);
  
  // 拖拽上传
  uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadBox.classList.add('dragover');
  });
  uploadBox.addEventListener('dragleave', () => {
    uploadBox.classList.remove('dragover');
  });
  uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadBox.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      fileInput.files = files;
      handleFileSelect({ target: fileInput });
    }
  });

  // 水印图片上传
  watermarkImageInput.addEventListener('change', handleWatermarkImageSelect);

  // 所有控件变化时更新预览
  const controls = [
    watermarkText, fontFamily, fontSize, textColor, textEnable,
    imageEnable, wmScale, opacitySlider, offsetX, offsetY
  ];
  
  controls.forEach(control => {
    control.addEventListener('input', updatePreview);
    control.addEventListener('change', updatePreview);
  });

  // 滑块值显示
  wmScale.addEventListener('input', () => {
    scaleValue.textContent = parseFloat(wmScale.value).toFixed(2) + 'x';
  });

  opacitySlider.addEventListener('input', () => {
    opacityValue.textContent = Math.round(opacitySlider.value * 100) + '%';
  });

  // 九宫格按钮
  const gridButtons = grid9Container.querySelectorAll('.grid-btn');
  gridButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      position = btn.dataset.pos;
      updatePreview();
    });
  });

  // 下载按钮
  downloadBtn.addEventListener('click', downloadImage);
}

// 处理原图文件选择
function handleFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.match(/image\/(jpeg|png|webp)/)) {
    alert('请上传 JPG、PNG 或 WEBP 格式的图片');
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      originalImage = img;
      fileInfo.textContent = `${file.name} (${img.width}×${img.height})`;
      updatePreview();
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

// 处理水印图片选择
function handleWatermarkImageSelect(e) {
  const file = e.target.files[0];
  if (!file) {
    wmImageStatus.textContent = '未选择水印图片';
    watermarkImage = null;
    updatePreview();
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      watermarkImage = img;
      wmImageStatus.textContent = `已加载: ${file.name} (${img.width}×${img.height})`;
      updatePreview();
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

// 获取九宫格位置坐标
function getPositionCoords(canvasWidth, canvasHeight, elementWidth, elementHeight) {
  const marginX = parseInt(offsetX.value) || 0;
  const marginY = parseInt(offsetY.value) || 0;
  
  let x, y;
  
  switch(position) {
    case 'nw': // 左上
      x = marginX;
      y = marginY;
      break;
    case 'n': // 中上
      x = (canvasWidth - elementWidth) / 2;
      y = marginY;
      break;
    case 'ne': // 右上
      x = canvasWidth - elementWidth - marginX;
      y = marginY;
      break;
    case 'w': // 左中
      x = marginX;
      y = (canvasHeight - elementHeight) / 2;
      break;
    case 'center': // 居中
      x = (canvasWidth - elementWidth) / 2;
      y = (canvasHeight - elementHeight) / 2;
      break;
    case 'e': // 右中
      x = canvasWidth - elementWidth - marginX;
      y = (canvasHeight - elementHeight) / 2;
      break;
    case 'sw': // 左下
      x = marginX;
      y = canvasHeight - elementHeight - marginY;
      break;
    case 's': // 中下
      x = (canvasWidth - elementWidth) / 2;
      y = canvasHeight - elementHeight - marginY;
      break;
    case 'se': // 右下
      x = canvasWidth - elementWidth - marginX;
      y = canvasHeight - elementHeight - marginY;
      break;
    default:
      x = (canvasWidth - elementWidth) / 2;
      y = (canvasHeight - elementHeight) / 2;
  }
  
  return { x, y };
}

// 更新预览
function updatePreview() {
  if (!originalImage) {
    previewCanvas.width = 800;
    previewCanvas.height = 600;
    const ctx = previewCanvas.getContext('2d');
    ctx.fillStyle = '#eef1f5';
    ctx.fillRect(0, 0, 800, 600);
    ctx.fillStyle = '#9aa4b8';
    ctx.font = '20px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('请上传图片', 400, 300);
    previewSizeLabel.textContent = '';
    return;
  }

  // 设置画布尺寸为原图尺寸
  previewCanvas.width = originalImage.width;
  previewCanvas.height = originalImage.height;
  previewSizeLabel.textContent = `${originalImage.width}×${originalImage.height}`;

  const ctx = previewCanvas.getContext('2d');
  
  // 绘制原图
  ctx.drawImage(originalImage, 0, 0);

  const opacity = parseFloat(opacitySlider.value);

  // 绘制文字水印
  if (textEnable.checked && watermarkText.value) {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.font = `${fontSize.value}px ${fontFamily.value}`;
    ctx.fillStyle = textColor.value;
    ctx.textBaseline = 'top';
    
    const textMetrics = ctx.measureText(watermarkText.value);
    const textWidth = textMetrics.width;
    const textHeight = parseInt(fontSize.value);
    
    const coords = getPositionCoords(previewCanvas.width, previewCanvas.height, textWidth, textHeight);
    ctx.fillText(watermarkText.value, coords.x, coords.y);
    ctx.restore();
  }

  // 绘制图片水印
  if (imageEnable.checked && watermarkImage) {
    ctx.save();
    ctx.globalAlpha = opacity;
    
    const scale = parseFloat(wmScale.value);
    const wmWidth = watermarkImage.width * scale;
    const wmHeight = watermarkImage.height * scale;
    
    const coords = getPositionCoords(previewCanvas.width, previewCanvas.height, wmWidth, wmHeight);
    ctx.drawImage(watermarkImage, coords.x, coords.y, wmWidth, wmHeight);
    ctx.restore();
  }
}

// 下载图片
function downloadImage() {
  if (!originalImage) {
    alert('请先上传图片');
    return;
  }

  const link = document.createElement('a');
  link.download = `watermarked_${Date.now()}.png`;
  link.href = previewCanvas.toDataURL('image/png');
  link.click();
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
