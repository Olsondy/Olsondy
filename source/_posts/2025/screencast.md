---
title: OS X 屏幕录制转 GIF 动画 (翻译)
categories: Tutorial
comments: true
keywords: tools
tags:
  - translate
  - tutorial
  - tools
description: 转自 https://gist.github.com/dergachev/4627207
date: 2025-01-02T10:00:31.050Z
updated: 2025-12-26T10:17:01.081Z
---

# OS X 屏幕录制转 GIF 动画
>转自 https://gist.github.com/dergachev/4627207

本指南展示如何仅使用免费的 OS X 工具（*QuickTime、ffmpeg 和 gifsicle*）创建 GIF 格式的屏幕录制动画。

![屏幕录制 GIF 示例](https://user-images.githubusercontent.com/135904/160882711-d80baad8-f033-4ad0-b6ff-d4d6122e1b24.gif)

## 操作指南

**第一步：录制视频 (文件大小：19MB)**，使用免费的 "QuickTime Player" 应用程序：

*   打开 "QuickTime Player"。
*   前往 文件 -> 新建屏幕录制。
*   拖动矩形框选择屏幕录制区域，录制一段 13 秒的视频。
*   前往 文件 -> 导出 -> 为影片...
    *   以**最高质量**保存视频，文件命名为 `in.mov`。

**第二步：将 `in.mov` 转换为 `out.gif` (文件大小：48KB)**：
打开终端（Terminal），进入到存放 `in.mov` 文件的目录，运行以下命令：

    ffmpeg -i in.mov -s 600x400 -pix_fmt rgb24 -r 10 -f gif - | gifsicle --optimize=3 --delay=3 > out.gif

命令参数说明：

*   `-r 10`：指示 ffmpeg 将帧率从 25 fps 降低到 10 fps。
*   `-s 600x400`：指示 ffmpeg 设置 GIF 的最大宽度和最大高度（单位：像素）。
*   `--delay=3`：指示 gifsicle 设置每帧 GIF 之间的延迟为 3（单位：每单位代表 10 毫秒，即 30 毫秒）。
*   `--optimize=3`：要求 gifsicle 使用最慢但文件体积优化效果最好的级别（3级）。

**第三步：通过 [Dropbox](http://dropbox.com) 和 [Copy Public URL](https://github.com/dergachev/copy-public-url) 分享新生成的 GIF**：
运行以下命令（将 GIF 复制到 Dropbox 的公共文件夹并按时间命名）：

    cp out.gif ~/Dropbox/Public/screenshots/Screencast-`date +"%Y.%m.%d-%H.%M"`.gif

## 软件安装

转换过程需要安装以下命令行工具：

*   **ffmpeg**：用于处理视频文件。
*   **gifsicle**：用于创建和优化 GIF 动画。

如果你使用 Homebrew 和 Homebrew Cask 管理软件包，只需在终端输入以下命令安装：

    brew install ffmpeg
    brew install --cask xquartz # gifsicle 的依赖项，仅 Mountain Lion 及更高版本需要
    open /usr/local/Cellar/x-quartz/2.7.4/XQuartz.pkg # 运行 XQuartz 安装程序（注意：版本路径可能需要更新）
    brew install gifsicle

## 另请参阅

我已将此指南的功能重写为 [**screengif**](https://github.com/dergachev/screengif) —— 一个 Ruby 脚本。它显著提升了输出质量，并增加了一些额外功能。欢迎访问 https://github.com/dergachev/screengif 查看。

## 参考资料

*   http://schneems.com/post/41104255619/use-gifs-in-your-pull-request-for-good-not-evil (主要来源!)
*   http://www.reddit.com/r/programming/comments/16zu7d/use_gifs_in_your_pull_requests_for_good_not_evil/
*   http://superuser.com/questions/436056/how-can-i-get-ffmpeg-to-convert-a-mov-to-a-gif#_=_
*   http://gnuski.blogspot.ca/2012/06/creating-animate-gif-with-free-software.html

## 相关想法

*   扩展 [https://github.com/dergachev/copy-public-url](https://github.com/dergachev/copy-public-url) 的文件夹操作（Folder Action）以支持此流程：
    *   在复制 Dropbox 公开链接前自动完成转换。
    *   将此文件夹操作分配给 `~/Dropbox/Public/Screenshots/gif`。
    *   考虑如何简化依赖项的安装过程。