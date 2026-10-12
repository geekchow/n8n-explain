# n8n-explain

A cognitive-mental-model learning guide to the [n8n](https://github.com/n8n-io/n8n) workflow-automation engine, written from a close reading of the n8n `2.41.0` source (commit `c1463d0e`).

Follows the path: **Why → What → Concept map → Running example → Depth dives → Walkthrough**, anchored throughout to one running example (Ada's order-intake workflow), with real source file/line references and a runnable ~90-line toy engine.

- [`n8n-guide/`](n8n-guide/) — English version
- [`n8n-guide-zh/`](n8n-guide-zh/) — Chinese version（中文版）

Start at `n8n-guide/00-overview.md` (or `n8n-guide-zh/00-overview.md`).

## Published on CSDN

The Chinese version is also being serialized on CSDN in the column [「n8n 工作流引擎剖析」](https://mp.csdn.net/mp_blog/manage/column/allColumnList) (author: [PhilZhou](https://blog.csdn.net/PhilZhou)):

| # | 标题 | 链接 |
|---|---|---|
| 01 | n8n 源码解析：认知心智模型指南总览 | https://blog.csdn.net/PhilZhou/article/details/167258467 |
| 02 | n8n 为何存在：从胶水代码到工作流引擎 | https://blog.csdn.net/PhilZhou/article/details/167258525 |
| 03 | n8n 概念地图：8 个核心概念与 11 个关键角色 | https://blog.csdn.net/PhilZhou/article/details/167258817 |
| 04 | 贯穿示例：Ada 的订单接入工作流 | https://blog.csdn.net/PhilZhou/article/details/167258824 |
| 05.01 | 编辑器 Editor | https://blog.csdn.net/PhilZhou/article/details/167496296 |
| 05.02 | 触发器注册中心 Trigger Registry | https://blog.csdn.net/PhilZhou/article/details/167496306 |
| 05.03 | Webhook 接入层 Webhook Ingress | https://blog.csdn.net/PhilZhou/article/details/167496325 |
| 05.04 | 工作流运行器 Workflow Runner | https://blog.csdn.net/PhilZhou/article/details/167496347 |
| 05.05 | 伸缩队列 Scaling Queue（队列模式） | https://blog.csdn.net/PhilZhou/article/details/167496356 |
| 05.06 | 执行引擎 Execution Engine（WorkflowExecute） | https://blog.csdn.net/PhilZhou/article/details/167678794 |
| 05.07 | 节点 Nodes：类型、执行上下文与加载机制 | https://blog.csdn.net/PhilZhou/article/details/167678963 |
| 05.08 | 表达式引擎 Expression Engine | https://blog.csdn.net/PhilZhou/article/details/167679102 |
| 05.09 | 凭据 Credentials | https://blog.csdn.net/PhilZhou/article/details/167679205 |
| 05.10 | 任务运行器 Task Runner（Code 节点真正运行的地方） | https://blog.csdn.net/PhilZhou/article/details/167679332 |
| 05.11 | 生命周期钩子、持久化与推送 | https://blog.csdn.net/PhilZhou/article/details/167679473 |

`05.NN` are sub-parts of chapter 05 (component deep dives, mapping to `n8n-guide-zh/05-deep-dives/`), matching the source guide's own numbering. The remaining parts (06 walkthrough, 07 next steps) will be added to the column over time.
