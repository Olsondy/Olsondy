#!/usr/bin/env python3
"""
网站内链有效性检查工具

用法:
    python check-links.py                    # 检查本地开发服务器
    python check-links.py --url https://example.com
    python check-links.py --verbose          # 显示详细输出
"""

import argparse
import re
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass, field
from typing import Set, List, Dict
from urllib.parse import urljoin, urlparse

import requests


@dataclass
class LinkResult:
    """链接检查结果"""
    url: str
    status: int
    from_page: str
    is_valid: bool
    error: str = ""


@dataclass
class PageResult:
    """页面检查结果"""
    url: str
    total_links: int = 0
    valid_links: int = 0
    invalid_links: int = 0
    link_details: List[LinkResult] = field(default_factory=list)


class LinkChecker:
    """内链检查器"""

    def __init__(self, base_url: str, max_workers: int = 10, timeout: int = 10):
        self.base_url = base_url.rstrip("/")
        self.max_workers = max_workers
        self.timeout = timeout
        self.visited_urls: Set[str] = set()
        self.results: Dict[str, PageResult] = {}
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })

    def is_internal_link(self, url: str) -> bool:
        """判断是否为内链"""
        parsed = urlparse(url)
        base_parsed = urlparse(self.base_url)

        # 相对路径肯定是内链
        if not parsed.netloc:
            return True

        # 同域名
        return parsed.netloc == base_parsed.netloc

    def normalize_url(self, url: str, base: str) -> str:
        """标准化URL"""
        if url.startswith(("//",)):
            return f"https:{url}"
        if url.startswith("/"):
            return f"{base}{url}"
        if not url.startswith("http"):
            return f"{base}/{url}"
        return url

    def extract_links(self, html: str, page_url: str) -> List[str]:
        """从HTML中提取所有链接（支持标准HTML、RSC payload、Markdown格式）"""
        raw_links = []
        
        # 1. 匹配标准 HTML href 属性
        href_pattern = r'href=["\'"]([^"\']+)["\'"]'
        raw_links.extend(re.findall(href_pattern, html, re.IGNORECASE))
        
        # 2. 匹配 RSC payload / JSON 中的内部路径
        #    例如: "/creation-lab/prompts/p003-emotional-underscore"
        rsc_pattern = r'["\'](/creation-lab/[a-zA-Z0-9\-/_]+)["\']'
        raw_links.extend(re.findall(rsc_pattern, html))
        
        # 3. 匹配 Markdown 链接格式 [text](url)
        md_pattern = r'\]\((/[^)\s]+)\)'
        raw_links.extend(re.findall(md_pattern, html))
        
        # 4. 匹配转义的 JSON 路径 (如 RSC payload 中的 \"\/creation-lab\/...\" )
        escaped_pattern = r'\\/creation-lab\\/[a-zA-Z0-9_/-]+'
        escaped_matches = re.findall(escaped_pattern, html)
        for match in escaped_matches:
            # 去掉转义斜杠
            raw_links.append(match.replace('\\/', '/'))

        # 过滤和标准化
        links = []
        skip_extensions = [".pdf", ".zip", ".exe", ".dmg", ".css", ".js", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".woff", ".woff2", ".ico"]
        
        for link in raw_links:
            # 跳过锚点、tel、mailto、javascript
            if link.startswith(("#", "tel:", "mailto:", "javascript:", "data:")):
                continue
            # 跳过静态资源和文件下载链接
            if any(ext in link.lower() for ext in skip_extensions):
                continue
            # 跳过 API 路径
            if "/api/" in link:
                continue
            links.append(self.normalize_url(link, self.base_url))

        return list(set(links))  # 去重

    def check_link(self, url: str, from_page: str) -> LinkResult:
        """检查单个链接"""
        try:
            response = self.session.head(url, timeout=self.timeout, allow_redirects=True)
            # HEAD 不支持则尝试 GET
            if response.status_code == 405:
                response = self.session.get(url, timeout=self.timeout, allow_redirects=True)

            return LinkResult(
                url=url,
                status=response.status_code,
                from_page=from_page,
                is_valid=response.status_code < 400,
                error=""
            )
        except requests.Timeout:
            return LinkResult(
                url=url,
                status=0,
                from_page=from_page,
                is_valid=False,
                error="Timeout"
            )
        except requests.RequestException as e:
            return LinkResult(
                url=url,
                status=0,
                from_page=from_page,
                is_valid=False,
                error=str(e)
            )

    def scan_page(self, url: str) -> PageResult:
        """扫描单个页面"""
        print(f"扫描: {url}")

        try:
            response = self.session.get(url, timeout=self.timeout)
            response.raise_for_status()

            links = self.extract_links(response.text, url)
            internal_links = [l for l in links if self.is_internal_link(l)]

            page_result = PageResult(url=url, total_links=len(internal_links))

            # 并发检查链接
            with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
                futures = {
                    executor.submit(self.check_link, link, url): link
                    for link in internal_links
                }
                for future in as_completed(futures):
                    result = future.result()
                    page_result.link_details.append(result)
                    if result.is_valid:
                        page_result.valid_links += 1
                    else:
                        page_result.invalid_links += 1

            self.results[url] = page_result
            return page_result

        except requests.RequestException as e:
            print(f"  错误: {e}", file=sys.stderr)
            return PageResult(url=url)

    def run(self, start_path: str = "/") -> Dict[str, PageResult]:
        """运行检查"""
        start_url = f"{self.base_url}{start_path}" if start_path != "/" else self.base_url
        self.visited_urls.add(start_url)

        # 简单广度优先爬取
        to_visit = [start_url]
        max_pages = 50  # 限制页面数量防止无限循环

        while to_visit and len(self.visited_urls) < max_pages:
            current_url = to_visit.pop(0)
            if current_url in self.results:
                continue

            page_result = self.scan_page(current_url)

            # 收集新发现的页面
            for link_result in page_result.link_details:
                if link_result.is_valid and link_result.url not in self.visited_urls:
                    self.visited_urls.add(link_result.url)
                    # 只添加看起来是页面的链接（非静态资源）
                    if not any(ext in link_result.url for ext in [".css", ".js", ".png", ".jpg", ".svg", ".woff", ".ico"]):
                        to_visit.append(link_result.url)

        return self.results

    def print_report(self, verbose: bool = False):
        """打印报告"""
        print("\n" + "=" * 60)
        print("内链检查报告")
        print("=" * 60)

        total_pages = len(self.results)
        total_valid = sum(r.valid_links for r in self.results.values())
        total_invalid = sum(r.invalid_links for r in self.results.values())

        print(f"\n扫描页面数: {total_pages}")
        print(f"有效链接: {total_valid}")
        print(f"无效链接: {total_invalid}")
        if total_valid + total_invalid > 0:
            print(f"有效率: {total_valid / (total_valid + total_invalid) * 100:.1f}%")

        if total_invalid > 0:
            print("\n无效链接列表:")
            print("-" * 60)

            for page_url, page_result in self.results.items():
                invalid = [l for l in page_result.link_details if not l.is_valid]
                if invalid:
                    print(f"\n页面: {page_url}")
                    for link in invalid:
                        if link.error:
                            print(f"  ❌ {link.url} ({link.status}) - {link.error}")
                        else:
                            print(f"  ❌ {link.url} ({link.status})")

        if verbose:
            print("\n" + "=" * 60)
            print("详细报告:")
            print("=" * 60)

            for page_url, page_result in sorted(self.results.items()):
                print(f"\n📄 {page_url}")
                print(f"   总链接: {page_result.total_links}")
                print(f"   有效: {page_result.valid_links} | 无效: {page_result.invalid_links}")

                if page_result.link_details:
                    for link in sorted(page_result.link_details, key=lambda x: x.url):
                        status_icon = "✅" if link.is_valid else "❌"
                        print(f"   {status_icon} {link.url} [{link.status}]")


def main():
    parser = argparse.ArgumentParser(description="检查网站内链有效性")
    parser.add_argument("--url", default="http://localhost:3000", help="网站URL (默认: http://localhost:3000)")
    parser.add_argument("--start", default="/", help="起始路径 (默认: /)")
    parser.add_argument("--workers", type=int, default=10, help="并发线程数 (默认: 10)")
    parser.add_argument("--timeout", type=int, default=10, help="请求超时秒数 (默认: 10)")
    parser.add_argument("-v", "--verbose", action="store_true", help="显示详细输出")

    args = parser.parse_args()

    print(f"开始检查: {args.url}")

    checker = LinkChecker(
        base_url=args.url,
        max_workers=args.workers,
        timeout=args.timeout
    )

    checker.run(start_path=args.start)
    checker.print_report(verbose=args.verbose)


if __name__ == "__main__":
    main()
