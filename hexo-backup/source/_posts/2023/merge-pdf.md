---
title: 使用itext处理PDF文件
categories: Develop
comments: true
keywords: pdf
tags: [java,itext]
description: 对pdf文件进行分割和合并
date: '2024-04-02T19:46:31.050Z'
updated: '2024-04-02T19:46:31.050Z'
---


# 使用itext 分割以及合并PDF文件

```java
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;

import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;

public class PDFTest {

    public static final Rectangle EXP = new RectangleReadOnly(285.0F, 425.0F);
    public static final Rectangle EXP_TOP = new RectangleReadOnly(285.0F, 225.0F);
    public static final Rectangle EXP_DOWN = new RectangleReadOnly(285.0F, 225.0F);

//    public static final Rectangle EXP = new RectangleReadOnly(297.64F, 575.43F);

    public static final String FILE_DIR = "/Users/dy/Downloads/";

    public static void main(String[] args) throws IOException, DocumentException {
//        split();
        merge();
    }


    public static void merge() throws IOException, DocumentException {
        PdfReader reader1 = new PdfReader(FILE_DIR + "1.pdf");
        PdfReader reader2 = new PdfReader(FILE_DIR + "2.pdf");

        FileOutputStream out = new FileOutputStream(FILE_DIR + "3.pdf");

        Document document = new Document(EXP);
        PdfWriter writer = PdfWriter.getInstance(document, out);
        document.open();
        PdfContentByte cb = writer.getDirectContent();
        PdfImportedPage page = writer.getImportedPage(reader1, 1);
        cb.addTemplate(page,0,200);
        PdfImportedPage page2 = writer.getImportedPage(reader2, 1);
        cb.addTemplate(page2,0,-25);

        out.flush();
        document.close();
        out.close();
    }

    public static void split() throws IOException, DocumentException {

        PdfReader reader = new PdfReader(FILE_DIR + "DHL-shipping label.pdf");
        Rectangle r = reader.getPageSize(1);

        Document dd = new Document(EXP_TOP);
        PdfWriter writer = PdfWriter.getInstance(dd, new FileOutputStream(FILE_DIR + "1.pdf"));
        dd.open();
        PdfContentByte cb = writer.getDirectContent();
        dd.newPage();
        cb.addTemplate(writer.getImportedPage(reader, 1), -5, -350);

        dd.close();
        writer.close();

        Document dd2 = new Document(EXP_DOWN);
        PdfWriter writer2 = PdfWriter.getInstance(dd2, new FileOutputStream(FILE_DIR + "2.pdf"));
        dd2.open();
        PdfContentByte cb2 = writer2.getDirectContent();
        dd2.newPage();
        cb2.addTemplate(writer2.getImportedPage(reader, 1), -5, -10);

        dd2.close();
        writer2.close();
    }
}

```
