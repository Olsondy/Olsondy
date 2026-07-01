---
title: Flowable 框架介绍
categories: Develop
comments: true
keywords: flowable
tags: [java,flowable]
description: Flowable 框架介绍
date: '2023-07-11T16:00:31.050Z'
updated: '2023-09-25T06:00:01.081Z'
---

# 数据库表

## 表介绍

**ACT_RE_*   :**  ’RE’表示repository（存储）。RepositoryService接口操作的表。带此前缀的表包含的是静态信息，如，流程定义，流程的资源（图片，规则等）。

**ACT_RU_*   :**  ’RU’表示runtime。这是运行时的表存储着流程变量，用户任务，变量，职责（job）等运行时的数据。flowable只存储实例执行期间的运行时数据，当流程实例结束时，将删除这些记录。这就保证了这些运行时的表小且快。

**ACT_ID_*   :**  ’ID’表示identity(组织机构)。这些表包含标识的信息，如用户，用户组，等等。

**ACT_HI_*   :**  ’HI’表示history。就是这些表包含着历史的相关数据，如结束的流程实例，变量，任务，等等。

**ACT_GE_*   :**  普通数据，各种情况都使用的数据。


## 数据库表结构 (34 张表，不同版本数量可能会有出入)

### 一般数据 (2)

- ACT_GE_BYTEARRAY 通用的流程定义和流程资源

- ACT_GE_PROPERTY 系统相关属性

### 流程历史记录 (8)

- ACT_HI_ACTINST 历史的流程实例

- ACT_HI_ATTACHMENT 历史的流程附件

- ACT_HI_COMMENT 历史的说明性信息

- ACT_HI_DETAIL 历史的流程运行中的细节信息

- ACT_HI_IDENTITYLINK 历史的流程运行过程中用户关系

- ACT_HI_PROCINST 历史的流程实例

- ACT_HI_TASKINST 历史的任务实例

- ACT_HI_VARINST 历史的流程运行中的变量信息

### 用户用户组表 (9)

ACT_ID_BYTEARRAY 二进制数据表

ACT_ID_GROUP 用户组信息表

ACT_ID_INFO 用户信息详情表

ACT_ID_MEMBERSHIP 人与组关系表

ACT_ID_PRIV 权限表

ACT_ID_PRIV_MAPPING 用户或组权限关系表

ACT_ID_PROPERTY 属性表

ACT_ID_TOKEN 系统登录日志表

ACT_ID_USER 用户表

### 流程定义表 (3)

ACT_RE_DEPLOYMENT 部署单元信息

ACT_RE_MODEL 模型信息

ACT_RE_PROCDEF 已部署的流程定义

### 运行实例表 (10)

ACT_RU_DEADLETTER_JOB 作业失败表

ACT_RU_EVENT_SUBSCR 运行时事件

ACT_RU_EXECUTION 运行时流程执行实例

ACT_RU_HISTORY_JOB 历史作业表

ACT_RU_IDENTITYLINK 运行时用户关系信息

ACT_RU_JOB 运行时作业表

ACT_RU_SUSPENDED_JOB 暂停作业表

ACT_RU_TASK 运行时任务表

ACT_RU_TIMER_JOB 定时作业表

ACT_RU_VARIABLE 运行时变量表

### 其他表 (2)

ACT_EVT_LOG 事件日志表

ACT_PROCDEF_INFO 流程定义信息


# 系统原理

![[runtimeFlowable.png]]

![[userTask.webp]] **人工任务（User Task）** ，它是使用得做多的一种任务类型，他自带有一些人工任务的变量，例如签收人（Assignee），签收人就代表该任务交由谁处理，我们也可以通过某个特定或一系列特定的签收人来查找待办任务。利用上面的行为解释便是，当到达User Task节点的时候，节点设置Assignee变量或等待设置Assignee变量，当任务被完成的时候，我们使用Trigger来要求流程引擎退出该任务，继续流转。

![[serviceTask.webp]] **服务任务（Service Task），** 该任务会在到达的时候执行一段自动的逻辑并自动流转。从“到达自动执行一段逻辑”这里我们就可以发现，服务任务的想象空间就可以非常大，我们可以执行一段计算，执行发送邮件，执行RPC调用，而使用最广泛的则为HTTP调用，因为HTTP是使用最广泛的协议之一，它可以解决大部分第三方调用问题，在我们的使用中，HTTP服务任务也被我们单独剥离出来作为一个特殊任务节点。

![[receiveTask.webp]]  **接受任务（Receive Task）** ，该任务的名字让人费解，但它又是最简单的一种任务，当该任务到达的时候，它不做任何逻辑，而是被动地等待Trigger，它的适用场景往往是一些不明确的阻塞，比如：一个复杂的计算需要等待很多条件，这些条件是需要人为来判断是否可以执行，而不是直接执行，这个时候，工作人员如果判断可以继续了，那么就Trigger一下使其流转。

![[callActivity.webp]] **调用活动（Call Activity）**，调用活动可以理解为函数调用，它会引用另外一个流程使之作为子流程运行，调用活动跟函数调用的功能一样，使流程模块化，增加复用的可能性。
