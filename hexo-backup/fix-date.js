const fs = require('fs');
const path = require('path');

// 目标目录：source/_posts
const rootDir = path.join(__dirname, 'source', '_posts');

/**
 * 递归遍历文件夹
 * @param {string} currentPath 当前路径
 */
function traverseDir(currentPath) {
    const files = fs.readdirSync(currentPath);

    files.forEach(file => {
        const fullPath = path.join(currentPath, file);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            // 如果是文件夹，递归调用
            traverseDir(fullPath);
        } else if (path.extname(file) === '.md') {
            // 如果是 Markdown 文件，执行替换逻辑
            processFile(fullPath);
        }
    });
}

/**
 * 处理单个文件的内容替换
 * @param {string} filePath 文件绝对路径
 */
function processFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');

        // 使用正则替换：
        // ^ 表示行首，m 表示多行模式（这样每一行开头都会匹配）
        const newContent = content
            .replace(/^created:/m, 'date:')
            .replace(/^modified:/m, 'updated:');

        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            // 打印相对路径，方便查看进度
            const relativePath = path.relative(rootDir, filePath);
            console.log(`✅ 已处理: ${relativePath}`);
        }
    } catch (err) {
        console.error(`❌ 处理失败 [${filePath}]:`, err.message);
    }
}

// 执行脚本
console.log('🚀 开始递归扫描并转换字段...\n');
if (fs.existsSync(rootDir)) {
    traverseDir(rootDir);
    console.log('\n✨ 任务完成！所有层级的 created/modified 已修复。');
} else {
    console.error(`❌ 错误：找不到目录 ${rootDir}`);
}