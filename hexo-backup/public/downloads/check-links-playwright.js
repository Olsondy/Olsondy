#!/usr/bin/env node
/**
 * 网站内链有效性检查工具 (Playwright 版)
 * 使用真实浏览器渲染页面后检测链接
 * 
 * 用法:
 *   node check-links-playwright.js                              # 检查本地开发服务器
 *   node check-links-playwright.js --url https://example.com
 *   node check-links-playwright.js --start /creation-lab/skills/s001-controlling-mood-with-words
 *   node check-links-playwright.js --verbose
 */

const { chromium } = require('playwright');

// 命令行参数解析
const args = process.argv.slice(2);
const getArg = (name, defaultValue) => {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1) return defaultValue;
  return args[idx + 1] || defaultValue;
};
const hasFlag = (name) => args.includes(`--${name}`);

const BASE_URL = getArg('url', 'http://localhost:4000');
const START_PATH = getArg('start', '/');
const VERBOSE = hasFlag('verbose') || hasFlag('v');
const MAX_PAGES = parseInt(getArg('max', '30'), 10);
const TIMEOUT = parseInt(getArg('timeout', '30000'), 10);

// 结果存储
const results = {
  visited: new Set(),
  valid: [],
  invalid: [],
  errors: []
};

/**
 * 检查单个页面的所有内链
 */
async function checkPage(page, url) {
  console.log(`扫描: ${url}`);
  
  try {
    const response = await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: TIMEOUT 
    });
    
    if (!response || response.status() >= 400) {
      results.invalid.push({ url, status: response?.status() || 0, error: 'Page load failed' });
      return [];
    }
    
    // 等待 React 完全渲染
    await page.waitForTimeout(1000);
    
    // 提取所有内链
    const links = await page.$$eval('a[href]', (anchors, baseUrl) => {
      return anchors
        .map(a => {
          const href = a.getAttribute('href');
          if (!href) return null;
          // 跳过外链、锚点、特殊协议
          if (href.startsWith('http') && !href.startsWith(baseUrl)) return null;
          if (href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:')) return null;
          if (href.startsWith('javascript:') || href.startsWith('data:')) return null;
          // 跳过静态资源
          if (/\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ico|pdf|zip)$/i.test(href)) return null;
          // 跳过 API 路径
          if (href.includes('/api/')) return null;
          
          // 标准化为绝对路径
          if (href.startsWith('/')) {
            return baseUrl + href;
          }
          return href;
        })
        .filter(Boolean);
    }, BASE_URL);
    
    // 去重
    const uniqueLinks = [...new Set(links)];
    
    if (VERBOSE) {
      console.log(`  发现 ${uniqueLinks.length} 个内链`);
    }
    
    return uniqueLinks;
    
  } catch (error) {
    results.errors.push({ url, error: error.message });
    console.error(`  错误: ${error.message}`);
    return [];
  }
}

/**
 * 验证链接是否有效
 */
async function validateLink(page, url, fromPage) {
  if (results.visited.has(url)) return null;
  
  try {
    const response = await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: TIMEOUT 
    });
    
    const status = response?.status() || 0;
    const isValid = status >= 200 && status < 400;
    
    const result = { url, status, fromPage, isValid };
    
    if (isValid) {
      results.valid.push(result);
    } else {
      results.invalid.push(result);
    }
    
    return result;
  } catch (error) {
    const result = { url, status: 0, fromPage, isValid: false, error: error.message };
    results.invalid.push(result);
    return result;
  }
}

/**
 * 打印报告
 */
function printReport() {
  console.log('\n' + '='.repeat(60));
  console.log('内链检查报告 (Playwright)');
  console.log('='.repeat(60));
  
  console.log(`\n扫描页面数: ${results.visited.size}`);
  console.log(`验证链接数: ${results.valid.length + results.invalid.length}`);
  console.log(`有效链接: ${results.valid.length}`);
  console.log(`无效链接: ${results.invalid.length}`);
  
  const total = results.valid.length + results.invalid.length;
  if (total > 0) {
    console.log(`有效率: ${(results.valid.length / total * 100).toFixed(1)}%`);
  }
  
  if (results.invalid.length > 0) {
    console.log('\n❌ 无效链接:');
    console.log('-'.repeat(60));
    results.invalid.forEach(link => {
      console.log(`  ${link.url} [${link.status}]`);
      if (link.error) console.log(`    错误: ${link.error}`);
      if (link.fromPage) console.log(`    来源: ${link.fromPage}`);
    });
  }
  
  if (results.errors.length > 0) {
    console.log('\n⚠️ 错误:');
    results.errors.forEach(err => {
      console.log(`  ${err.url}: ${err.error}`);
    });
  }
  
  if (VERBOSE) {
    console.log('\n📄 已访问页面:');
    [...results.visited].forEach(url => {
      console.log(`  ✅ ${url}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
}

/**
 * 主函数
 */
async function main() {
  console.log(`开始检查: ${BASE_URL}`);
  console.log(`起始路径: ${START_PATH}`);
  console.log(`最大页面数: ${MAX_PAGES}`);
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Playwright Link Checker'
  });
  const page = await context.newPage();
  
  // 广度优先爬取
  const startUrl = BASE_URL + START_PATH;
  const toVisit = [startUrl];
  results.visited.add(startUrl);
  
  try {
    while (toVisit.length > 0 && results.visited.size < MAX_PAGES) {
      const currentUrl = toVisit.shift();
      
      // 检查当前页面
      const links = await checkPage(page, currentUrl);
      
      // 验证并收集新链接
      for (const link of links) {
        if (!results.visited.has(link)) {
          // 先验证链接
          const result = await validateLink(page, link, currentUrl);
          
          // 然后加入已访问集合
          results.visited.add(link);
          
          // 如果有效且是页面，加入待访问队列
          if (result?.isValid && results.visited.size < MAX_PAGES) {
            toVisit.push(link);
          }
        }
      }
    }
  } finally {
    await browser.close();
  }
  
  printReport();
  
  // 如果有无效链接，返回非零退出码
  process.exit(results.invalid.length > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
