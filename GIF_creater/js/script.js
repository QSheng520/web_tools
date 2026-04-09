// --------------------- 全局状态 ---------------------
let imageFileList = [];       // 存储图片文件对象（顺序）
let currentGifBlob = null;    // 最新生成的blob

// DOM 元素
const imageUploadInput = document.getElementById('imageUploadInput');
const imageListContainer = document.getElementById('imageListContainer');
const generateImageBtn = document.getElementById('generateImageGifBtn');
const imgDelayInput = document.getElementById('imgDelay');
const imgWidthInput = document.getElementById('imgWidth');
const imgHeightInput = document.getElementById('imgHeight');
const imgQualityInput = document.getElementById('imgQuality');

// 视频元素
const videoUploadInput = document.getElementById('videoUploadInput');
const videoPreviewContainer = document.getElementById('videoPreviewContainer');
const videoPreview = document.getElementById('videoPreview');
const startTimeInput = document.getElementById('startTime');
const endTimeInput = document.getElementById('endTime');
const frameCountInput = document.getElementById('frameCount');
const videoDelayInput = document.getElementById('videoDelay');
const videoOutWidth = document.getElementById('videoOutWidth');
const videoOutHeight = document.getElementById('videoOutHeight');
const videoQuality = document.getElementById('videoQuality');
const generateVideoBtn = document.getElementById('generateVideoGifBtn');

// 预览下载
const previewGifImg = document.getElementById('previewGifImg');
const downloadLink = document.getElementById('downloadGifLink');
const noGifMsg = document.getElementById('noGifMsg');

// 辅助函数: 显示结果GIF
function showGifResult(blob) {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    previewGifImg.src = url;
    previewGifImg.style.display = 'block';
    noGifMsg.style.display = 'none';
    downloadLink.style.display = 'inline-block';
    downloadLink.href = url;
    downloadLink.download = `animated_${Date.now()}.gif`;
    // 清理旧的blob url
    if (currentGifBlob) {
        const oldUrl = previewGifImg.src;
        if (oldUrl && oldUrl.startsWith('blob:')) URL.revokeObjectURL(oldUrl);
    }
    currentGifBlob = blob;
}

function clearResult() {
    if (previewGifImg.src && previewGifImg.src.startsWith('blob:')) URL.revokeObjectURL(previewGifImg.src);
    previewGifImg.style.display = 'none';
    noGifMsg.style.display = 'block';
    downloadLink.style.display = 'none';
    currentGifBlob = null;
}

// 进度条工具
function showProgress(containerId, percent, text) {
    let container = document.getElementById(containerId);
    if (!container) return;
    if (percent === undefined) {
        container.innerHTML = text || '';
        return;
    }
    container.innerHTML = `<div class="progress-bar"><div class="progress-fill" style="width:${percent}%;"></div></div><div class="info-text">${text || Math.floor(percent)+'%'}</div>`;
}

// ---------- 图片模块：显示列表 & 排序删除 ----------
function renderImageList() {
    if (!imageFileList.length) {
        imageListContainer.innerHTML = '<div class="info-text" style="text-align:center;">📭 暂无图片，请上传</div>';
        return;
    }
    let html = '';
    imageFileList.forEach((file, idx) => {
        const url = URL.createObjectURL(file);
        html += `
            <div class="image-item" data-index="${idx}">
                <img src="${url}" alt="preview">
                <div class="info">${escapeHtml(file.name)}</div>
                <button class="move-up" data-idx="${idx}" ${idx === 0 ? 'disabled' : ''}>⬆️</button>
                <button class="move-down" data-idx="${idx}" ${idx === imageFileList.length-1 ? 'disabled' : ''}>⬇️</button>
                <button class="remove-img" data-idx="${idx}">🗑️</button>
            </div>
        `;
        // 释放blob预览url 稍后统一在重新渲染时清理
        setTimeout(() => URL.revokeObjectURL(url), 100);
    });
    imageListContainer.innerHTML = html;
    // 绑定事件
    document.querySelectorAll('.move-up').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(btn.dataset.idx);
            if (idx > 0) {
                [imageFileList[idx-1], imageFileList[idx]] = [imageFileList[idx], imageFileList[idx-1]];
                renderImageList();
            }
        });
    });
    document.querySelectorAll('.move-down').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(btn.dataset.idx);
            if (idx < imageFileList.length-1) {
                [imageFileList[idx+1], imageFileList[idx]] = [imageFileList[idx], imageFileList[idx+1]];
                renderImageList();
            }
        });
    });
    document.querySelectorAll('.remove-img').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(btn.dataset.idx);
            imageFileList.splice(idx,1);
            renderImageList();
            clearResult();
        });
    });
}

function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if(m === '&') return '&amp;';
        if(m === '<') return '&lt;';
        if(m === '>') return '&gt;';
        return m;
    });
}

imageUploadInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    if (files.length) {
        imageFileList.push(...files);
        renderImageList();
        clearResult();
    }
    imageUploadInput.value = '';
});
document.getElementById('imageUploadArea').addEventListener('click', () => imageUploadInput.click());
// 拖拽简单支持
const imageDrop = document.getElementById('imageUploadArea');
imageDrop.addEventListener('dragover', (e) => { e.preventDefault(); imageDrop.style.background = "#e6edf6"; });
imageDrop.addEventListener('dragleave', () => { imageDrop.style.background = "#f8fafd"; });
imageDrop.addEventListener('drop', (e) => {
    e.preventDefault();
    imageDrop.style.background = "#f8fafd";
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if(files.length) {
        imageFileList.push(...files);
        renderImageList();
        clearResult();
    }
});

// 生成图片GIF
generateImageBtn.addEventListener('click', async () => {
    if (imageFileList.length === 0) {
        alert("请先上传至少一张图片");
        return;
    }
    clearResult();
    const delay = parseInt(imgDelayInput.value);
    const outW = parseInt(imgWidthInput.value);
    let outH = parseInt(imgHeightInput.value);
    const quality = parseInt(imgQualityInput.value);
    if (isNaN(delay) || delay<10) { alert("帧延迟需≥10ms"); return; }

    generateImageBtn.disabled = true;
    showProgress('imageProgressArea', 0, '准备图片帧...');

    try {
        // 加载所有图片并转为canvas (缩放)
        const canvases = [];
        for (let i=0; i<imageFileList.length; i++) {
            const img = await loadImageFromFile(imageFileList[i]);
            let width = outW;
            let height = outH;
            if (!width || width<=0) width = img.width;
            if (!height || height<=0) height = img.height;
            // 等比缩放如果用户只给宽度或高度之一
            if (outW && outW>0 && (!outH || outH<=0)) {
                height = Math.round(img.height * (outW / img.width));
            } else if (outH && outH>0 && (!outW || outW<=0)) {
                width = Math.round(img.width * (outH / img.height));
            } else if (outW>0 && outH>0) {
                // 完全按给定尺寸
            } else {
                width = img.width;
                height = img.height;
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            canvases.push(canvas);
            showProgress('imageProgressArea', (i+1)/imageFileList.length * 30, `加载图片 ${i+1}/${imageFileList.length}`);
        }
        await generateGifFromCanvases(canvases, delay, quality, 'imageProgressArea', '图片GIF生成中...');
    } catch(err) {
        console.error(err);
        alert("生成失败："+err.message);
        showProgress('imageProgressArea', 0, '生成失败');
    } finally {
        generateImageBtn.disabled = false;
    }
});

// ------------------- 视频模块 -------------------
let currentVideoFile = null;
videoUploadInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    currentVideoFile = file;
    const url = URL.createObjectURL(file);
    videoPreview.src = url;
    videoPreviewContainer.style.display = 'block';
    generateVideoBtn.disabled = false;
    // 等待元数据加载完毕
    await new Promise((resolve) => {
        videoPreview.onloadedmetadata = () => {
            const dur = videoPreview.duration;
            if (!isNaN(dur)) {
                endTimeInput.value = Math.min(dur, 5);
                startTimeInput.max = dur;
                endTimeInput.max = dur;
                startTimeInput.value = 0;
            }
            resolve();
        };
        videoPreview.load();
    });
    clearResult();
    videoUploadInput.value = ''; // 清空input，允许重复选择同一文件
});
document.getElementById('videoUploadArea').addEventListener('click', () => videoUploadInput.click());

generateVideoBtn.addEventListener('click', async () => {
    if (!currentVideoFile) { alert("请上传视频文件"); return; }
    let start = parseFloat(startTimeInput.value);
    let end = parseFloat(endTimeInput.value);
    const duration = videoPreview.duration;
    if (isNaN(duration)) { alert("无法获取视频时长"); return; }
    if (isNaN(start)) start = 0;
    if (isNaN(end)) end = duration;
    if (start < 0) start = 0;
    if (end > duration) end = duration;
    if (start >= end) { alert("起始时间必须小于结束时间"); return; }
    const frameNum = Math.min(parseInt(frameCountInput.value), 80);
    if (frameNum < 1) { alert("帧数至少为1"); return; }
    const delay = parseInt(videoDelayInput.value);
    const outW = parseInt(videoOutWidth.value);
    let outH = parseInt(videoOutHeight.value);
    const quality = parseInt(videoQuality.value);

    generateVideoBtn.disabled = true;
    showProgress('videoProgressArea', 0, '准备提取视频帧...');

    try {
        // 提取帧
        const framesCanvas = await extractVideoFrames(currentVideoFile, start, end, frameNum, outW, outH);
        if (framesCanvas.length === 0) throw new Error("未提取到任何帧");
        await generateGifFromCanvases(framesCanvas, delay, quality, 'videoProgressArea', '视频GIF生成中...');
    } catch (err) {
        console.error(err);
        alert("视频转GIF失败: " + err.message);
        showProgress('videoProgressArea', 0, '失败');
    } finally {
        generateVideoBtn.disabled = false;
    }
});

// 提取视频帧 (返回canvas数组)
async function extractVideoFrames(file, startSec, endSec, frameCount, targetW, targetH) {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    const url = URL.createObjectURL(file);
    video.src = url;
    await new Promise((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = reject;
        video.load();
    });
    const duration = video.duration;
    const step = (endSec - startSec) / (frameCount - 1);
    const times = [];
    for (let i = 0; i < frameCount; i++) {
        let t = startSec + i * step;
        if (t > endSec) t = endSec;
        times.push(t);
    }
    const canvases = [];
    for (let idx = 0; idx < times.length; idx++) {
        const time = times[idx];
        await seekVideo(video, time);
        const canvas = document.createElement('canvas');
        let width = targetW && targetW>0 ? targetW : video.videoWidth;
        let height = targetH && targetH>0 ? targetH : video.videoHeight;
        if (targetW>0 && (!targetH || targetH<=0)) {
            height = Math.round(video.videoHeight * (targetW / video.videoWidth));
        } else if (targetH>0 && (!targetW || targetW<=0)) {
            width = Math.round(video.videoWidth * (targetH / video.videoHeight));
        } else if (targetW>0 && targetH>0) {
            // 固定
        } else {
            width = video.videoWidth;
            height = video.videoHeight;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, width, height);
        canvases.push(canvas);
        const percent = ((idx+1) / frameCount) * 70;
        showProgress('videoProgressArea', percent, `提取帧 ${idx+1}/${frameCount}`);
    }
    URL.revokeObjectURL(url);
    video.pause();
    video.src = '';
    return canvases;
}

function seekVideo(video, time) {
    return new Promise((resolve) => {
        if (Math.abs(video.currentTime - time) < 0.05) {
            resolve();
            return;
        }
        const handler = () => {
            video.removeEventListener('seeked', handler);
            resolve();
        };
        video.addEventListener('seeked', handler);
        video.currentTime = time;
    });
}

// 通用GIF生成 (canvas列表)
async function generateGifFromCanvases(canvases, delay, quality, progressContainerId, startMsg) {
    if (!canvases.length) throw new Error("无有效帧");
    return new Promise((resolve, reject) => {
        // 配置gif.js worker路径 (使用本地文件避免跨域问题)
        const gif = new GIF({
            workers: 2,
            quality: Math.min(30, Math.max(1, quality)),
            workerScript: 'js/gif.worker.js',
            width: canvases[0].width,
            height: canvases[0].height
        });
        for (let i=0; i<canvases.length; i++) {
            gif.addFrame(canvases[i], {delay: delay, copy: true});
        }
        showProgress(progressContainerId, 80, startMsg);
        gif.on('progress', (p) => {
            const percent = 80 + Math.floor(p * 20);
            showProgress(progressContainerId, percent, `编码中 ${Math.floor(p*100)}%`);
        });
        gif.on('finished', (blob) => {
            showProgress(progressContainerId, 100, '生成完成！');
            showGifResult(blob);
            resolve(blob);
        });
        gif.on('error', (err) => {
            reject(err);
        });
        gif.render();
    });
}

function loadImageFromFile(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
        img.onloadend = () => URL.revokeObjectURL(img.src);
    });
}

// 辅助清除旧预览
window.addEventListener('beforeunload', () => {
    if (currentGifBlob && previewGifImg.src) URL.revokeObjectURL(previewGifImg.src);
});
