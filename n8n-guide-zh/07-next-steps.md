# 07 —— 后续步骤

> **你在这里：** 本指南包的最后一篇文件。**读完本文件后**，你会拥有一些能检验你心智模型的练习题、一张源码入口地图，以及一份明确列出本指南*没有*覆盖哪些内容的清单。

缩写：**AI**（Artificial Intelligence，人工智能）、**MCP**（Model Context Protocol，模型上下文协议）、**DB**（Database，数据库）、**HTTP**（Hypertext Transfer Protocol，超文本传输协议）、**UI**（User Interface，用户界面）、**ID**（Identifier，标识符）。

---

## 1. 练习题（先自己预测，再去源码里核对）

| # | 问题 | 去哪里找答案 |
|---|---|---|
| 1 | 把 Ada 的工作流改一下，让 `Add VAT` 和第二个节点都从 `Order Webhook` 连出来，并且两者都接到一个 **Merge** 节点上。它们按什么顺序运行？Merge 什么时候运行？ | [引擎深度剖析 §4](05-deep-dives/06-execution-engine.md)，`addNodeToBeExecuted`（`workflow-execute.ts` 第 444 行） |
| 2 | 把 `Create Invoice` 设为 `retryOnFail`，并设 `maxTries: 10`。实际会尝试几次？ | `getRetryParams` 第 1805 行（会被限制在 2–5 之间） |
| 3 | 两个工作流都用了一个路径为 `orders`、方法为 POST 的 Webhook 节点。哪一个会发布失败？失败在哪一步？ | `WebhookService.storeWebhook`、`WebhookPathTakenError` |
| 4 | 把 Ada 工作流的"保存成功的执行"关掉。还有什么会被写入？什么会被删除？ | `hookFunctionsSaveWorker`（`execution-lifecycle-hooks.ts` 第 713 行）以及 `getLifecycleHooksForScalingMain` 里主进程一侧的钩子 |
| 5 | 在运行中途杀掉一个工作进程。这次执行最终会是什么状态？是谁把它设成这个状态的？ | `CRASHABLE_EXECUTION_STATUSES`（`workflow/src/execution-status.ts`）、`JobProcessor.processJob` 里对 `crashed` 状态的防护判断 |
| 6 | 在 `Create Invoice` 之后加一个 **Wait** 节点（通过 webhook 恢复）。会存下什么数据？引擎是怎么避免在恢复时把 Wait 节点跑两遍的？ | `handleWaitingState`（第 1500 行）、`waitTill`、`resumeToken` |
| 7 | 设置 `N8N_EXPRESSION_ENGINE=legacy`。你会失去哪些保障？ | [表达式引擎深度剖析](05-deep-dives/08-expression-engine.md)、`expression-engine.config.ts` |
| 8 | 给 `examples/mini-engine.mjs` 扩展一个需要等待两个输入的双输入 **Merge** 节点。你需要什么样的数据结构？ | `IRunExecutionData` 中的 `waitingExecution` |
| 9 | 写一个小小的声明式或编程式自定义节点，并从一个自定义目录里加载它。 | `CustomDirectoryLoader`、`packages/@n8n/create-node`、`node-cli` |

## 2. 源码入口（阅读顺序与本指南一致）

| 主题 | 文件（位于 `packages/` 下） | 从哪里开始看 |
|---|---|---|
| 核心词汇 | `workflow/src/interfaces.ts` | `INode`（1730）、`IConnections`（509）、`INodeExecutionData`（1844）、`INodeType`（2559）、`ITaskData`（3591） |
| 图的包装层 | `workflow/src/workflow.ts` | 构造函数、`setConnections`、`getParentNodes` |
| 运行状态 | `workflow/src/run-execution-data/run-execution-data.v1.ts` | `IRunExecutionDataV1` |
| 发布 | `cli/src/workflows/workflows.controller.ts`（441）→ `workflow.service.ts` 的 `activateWorkflow` → `cli/src/active-workflow-manager.ts`（539 行的 `add`） | |
| webhook 数据行 | `cli/src/webhooks/webhook.service.ts` | `storeWebhook`（214）、`getNodeWebhooks`（372）、`runWebhook`（646） |
| 接入层 | `cli/src/webhooks/live-webhooks.ts`、`webhook-helpers.ts`（`executeWebhook` 804） | |
| 运行器 | `cli/src/workflow-runner.ts`（407 行的 `run`、569 行的 `runMainProcess`、740 行的 `enqueueExecution`）、`active-executions.ts` | |
| 队列 | `cli/src/scaling/scaling.service.ts`、`job-processor.ts`（121）、`commands/worker.ts` | |
| 引擎 | `core/src/execution-engine/workflow-execute.ts` | `processRunExecutionData`（2226）、`runNode`（1349）、`addNodeToBeExecuted`（444） |
| 节点上下文 | `core/src/execution-engine/node-execution-context/execute-context.ts` | 构造函数、`helpers` |
| 节点加载 | `cli/src/load-nodes-and-credentials.ts`（78）、`cli/src/node-types.ts` | |
| 示例节点 | `nodes-base/nodes/Webhook/Webhook.node.ts`、`Set/v2/SetV2.node.ts`、`HttpRequest/V3/HttpRequestV3.node.ts`、`Code/Code.node.ts` | |
| 表达式 | `workflow/src/expression.ts`（610）、`workflow-data-proxy.ts`、`@n8n/expression-runtime`、`@n8n/tournament` | |
| 凭据 | `core/src/credentials.ts`、`core/src/encryption/cipher.ts`、`cli/src/credentials-helper.ts`（122、551）、`.../request-helpers/authentication.ts`（165） | |
| 任务运行器 | `@n8n/task-runner/src/js-task-runner/js-task-runner.ts`（200）、`cli/src/task-runners/task-broker/task-broker.service.ts` | |
| 钩子/持久化 | `cli/src/execution-lifecycle/execution-lifecycle-hooks.ts`、`@n8n/db/src/entities/execution-entity.ts` | |
| 推送 | `cli/src/push/`、`frontend/editor-ui/src/app/push-connection/` | |

**建议的第一个调试练习：** 用 `N8N_LOG_LEVEL=debug` 在本地跑起 `n8n`，发布这个示例工作流，用 `curl` 调用这个 webhook，然后把每一行日志对应到上表中的某个文件。

## 3. 本指南**没有**覆盖的内容

| 领域 | 为什么重要 | 从哪里开始了解 |
|---|---|---|
| **AI 节点**（`@n8n/nodes-langchain`、`supplyData`、`EngineRequest` 子节点调用、智能体/工具） | n8n 里体量庞大、迭代很快的一部分；引擎对此有专门的处理逻辑（`rewireOutputLogTo`、`handleEngineRequest`、工具默认值） | `nodes-langchain`、`workflow-execute.ts` 里的 `handleEngineRequest` |
| **引擎 v2**（`@n8n/engine`） | 其 README 自称是一个"尚未接入 n8n"的脚手架，但运行器里已经有了一个 `engineV2Dispatcher` 接缝 | `packages/@n8n/engine`、`workflow-runner.ts` |
| **子工作流、错误工作流、retry-of** | 执行树、`parentExecution`、`executeErrorWorkflow` | `getLifecycleHooksForSubExecutions`、`execute-error-workflow.ts` |
| **Wait / Form 节点与等待中的 webhook** | 恢复接口（`webhook-waiting`）、`resumeToken`、`WaitTracker` | `waiting-webhooks.ts`、`wait-tracker.ts` |
| **二进制数据** | 存储模式、流式传输、`restoreBinaryDataId` | `core/src/binary-data`、`cli/src/binary-data` |
| **多主进程、Leader 选举、受许可证限制的功能** | 高可用相关；`.ee` 文件需要企业许可证 | `scaling/multi-main-setup.ee.ts`、`LICENSE.md` |
| **项目、RBAC（基于角色的访问控制）、共享、SSO（单点登录）、MFA（多因素认证）** | "谁能做什么"这一层 | `cli/src/permissions.ee.ts`、`@n8n/permissions` |
| **动态（按用户）凭据、凭据解析器** | 近期加入的、具备身份感知能力的执行机制 | `dynamic-credentials-helpers.ts`、`credentials-helper.ts` |
| **评估（Evaluations）、MCP、聊天中枢、数据表** | `cli/src/modules` 和各个 `@n8n/*` 包下较新的功能模块 | `cli/src/modules` |
| **编辑器的内部实现** | 画布、节点详情视图、状态仓库 | `frontend/editor-ui`、`frontend/AGENTS.md` |
| **崩溃执行的恢复机制** | `crashed` 这个状态在重启后究竟是如何被赋予的 | `execution-recovery`（搜索谁用到了 `CRASHABLE_EXECUTION_STATUSES`） |
| **调度器 / 持久化定时触发器** | 触发器代码里新出现的 `N8N_SCHEDULER_ENABLED` 路径 | `workflows/triggers/*`、`core/.../scheduled-task-manager.ts` |

## 4. 方法说明（本指南是怎么写出来的）

本指南遵循*认知心智模型*的顺序——为什么 → 是什么 → 概念地图 → 贯穿示例 → 深度剖析 → 完整走查——研究对象是 `n8n-io/n8n` 在提交 `c1463d0e`（版本 `2.41.0`）处的一个浅克隆仓库。文中出现的每一个路径和函数名都是在那个快照里读到的；凡是没能在代码中核实的说法，正文都会特别标注出来。由于 n8n 迭代很快（尤其是发布流程、表达式引擎和引擎 v2 这几块），在依赖具体行号之前请重新核实一遍。

**返回：** [06-walkthrough.md](06-walkthrough.md) · [总览](00-overview.md)
