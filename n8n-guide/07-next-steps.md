# 07 — Next Steps

> **Where you are:** the last file. **After this file** you have exercises that test your model, a map of source entry points, and an explicit list of what this guide did *not* cover.

Abbreviations: **AI** (Artificial Intelligence), **MCP** (Model Context Protocol), **DB** (Database), **HTTP** (Hypertext Transfer Protocol), **UI** (User Interface), **ID** (Identifier).

---

## 1. Exercises (predict first, then check in the source)

| # | Question | Where to look |
|---|---|---|
| 1 | Change Ada's workflow so `Add VAT` and a second node both connect from `Order Webhook`, and both feed a **Merge** node. In what order do they run? When does Merge run? | [Engine dive §4](05-deep-dives/06-execution-engine.md), `addNodeToBeExecuted` (`workflow-execute.ts` l.444) |
| 2 | Set `Create Invoice` to `retryOnFail` with `maxTries: 10`. How many tries happen? | `getRetryParams` l.1805 (clamped to 2–5) |
| 3 | Two workflows both use a Webhook node with path `orders` and method POST. Which publish fails, and where? | `WebhookService.storeWebhook`, `WebhookPathTakenError` |
| 4 | Turn off "save successful executions" for Ada's workflow. What still gets written, and what gets deleted? | `hookFunctionsSaveWorker` (`execution-lifecycle-hooks.ts` l.713) and the main-side hook in `getLifecycleHooksForScalingMain` |
| 5 | Kill a worker mid-run. What status does the execution end with, and who sets it? | `CRASHABLE_EXECUTION_STATUSES` (`workflow/src/execution-status.ts`), `JobProcessor.processJob` guard for `crashed` |
| 6 | Add a **Wait** node after `Create Invoice` (resume on webhook). What is stored, and how does the engine avoid running Wait twice on resume? | `handleWaitingState` (l.1500), `waitTill`, `resumeToken` |
| 7 | Set `N8N_EXPRESSION_ENGINE=legacy`. What guarantees do you lose? | [Expression dive](05-deep-dives/08-expression-engine.md), `expression-engine.config.ts` |
| 8 | Extend `examples/mini-engine.mjs` with a two-input **Merge** that waits for both inputs. Which structure do you need? | `waitingExecution` in `IRunExecutionData` |
| 9 | Write a tiny declarative or programmatic custom node and load it from a custom directory. | `CustomDirectoryLoader`, `packages/@n8n/create-node`, `node-cli` |

## 2. Source entry points (a reading order that mirrors the guide)

| Topic | File (under `packages/`) | Start at |
|---|---|---|
| Vocabulary | `workflow/src/interfaces.ts` | `INode` (1730), `IConnections` (509), `INodeExecutionData` (1844), `INodeType` (2559), `ITaskData` (3591) |
| Graph wrapper | `workflow/src/workflow.ts` | constructor, `setConnections`, `getParentNodes` |
| Run state | `workflow/src/run-execution-data/run-execution-data.v1.ts` | `IRunExecutionDataV1` |
| Publish | `cli/src/workflows/workflows.controller.ts` (441) → `workflow.service.ts` `activateWorkflow` → `cli/src/active-workflow-manager.ts` (539 `add`) | |
| Webhook rows | `cli/src/webhooks/webhook.service.ts` | `storeWebhook` (214), `getNodeWebhooks` (372), `runWebhook` (646) |
| Ingress | `cli/src/webhooks/live-webhooks.ts`, `webhook-helpers.ts` (`executeWebhook` 804) | |
| Runner | `cli/src/workflow-runner.ts` (407 `run`, 569 `runMainProcess`, 740 `enqueueExecution`), `active-executions.ts` | |
| Queue | `cli/src/scaling/scaling.service.ts`, `job-processor.ts` (121), `commands/worker.ts` | |
| Engine | `core/src/execution-engine/workflow-execute.ts` | `processRunExecutionData` (2226), `runNode` (1349), `addNodeToBeExecuted` (444) |
| Node contexts | `core/src/execution-engine/node-execution-context/execute-context.ts` | constructor, `helpers` |
| Node loading | `cli/src/load-nodes-and-credentials.ts` (78), `cli/src/node-types.ts` | |
| Sample nodes | `nodes-base/nodes/Webhook/Webhook.node.ts`, `Set/v2/SetV2.node.ts`, `HttpRequest/V3/HttpRequestV3.node.ts`, `Code/Code.node.ts` | |
| Expressions | `workflow/src/expression.ts` (610), `workflow-data-proxy.ts`, `@n8n/expression-runtime`, `@n8n/tournament` | |
| Credentials | `core/src/credentials.ts`, `core/src/encryption/cipher.ts`, `cli/src/credentials-helper.ts` (122, 551), `.../request-helpers/authentication.ts` (165) | |
| Task runner | `@n8n/task-runner/src/js-task-runner/js-task-runner.ts` (200), `cli/src/task-runners/task-broker/task-broker.service.ts` | |
| Hooks/persistence | `cli/src/execution-lifecycle/execution-lifecycle-hooks.ts`, `@n8n/db/src/entities/execution-entity.ts` | |
| Push | `cli/src/push/`, `frontend/editor-ui/src/app/push-connection/` | |

**Suggested first debugging exercise:** run `n8n` locally with `N8N_LOG_LEVEL=debug`, publish the example workflow, `curl` the webhook, and match each log line to a file in the table above.

## 3. What this guide did **not** cover

| Area | Why it matters | Where to start |
|---|---|---|
| **AI nodes** (`@n8n/nodes-langchain`, `supplyData`, `EngineRequest` sub-node calls, agents/tools) | A large and fast-moving part of n8n; the engine has special handling (`rewireOutputLogTo`, `handleEngineRequest`, tool defaults) | `nodes-langchain`, `workflow-execute.ts` `handleEngineRequest` |
| **Engine v2** (`@n8n/engine`) | Described in its README as a scaffold "not yet wired into n8n", yet the runner already has an `engineV2Dispatcher` seam | `packages/@n8n/engine`, `workflow-runner.ts` |
| **Sub-workflows, error workflows, retry-of** | Execution trees, `parentExecution`, `executeErrorWorkflow` | `getLifecycleHooksForSubExecutions`, `execute-error-workflow.ts` |
| **Wait / Form nodes and waiting webhooks** | Resume endpoints (`webhook-waiting`), `resumeToken`, `WaitTracker` | `waiting-webhooks.ts`, `wait-tracker.ts` |
| **Binary data** | Storage modes, streaming, `restoreBinaryDataId` | `core/src/binary-data`, `cli/src/binary-data` |
| **Multi-main, leader election, license-gated features** | High availability; `.ee` files require an enterprise license | `scaling/multi-main-setup.ee.ts`, `LICENSE.md` |
| **Projects, RBAC, sharing, SSO, MFA** | The *who may do what* layer | `cli/src/permissions.ee.ts`, `@n8n/permissions` |
| **Dynamic (per-user) credentials, credential resolvers** | Recently added identity-aware execution | `dynamic-credentials-helpers.ts`, `credentials-helper.ts` |
| **Evaluations, MCP, chat hub, data tables** | Newer feature modules under `cli/src/modules` and `@n8n/*` | `cli/src/modules` |
| **The editor's internals** | Canvas, node detail view, stores | `frontend/editor-ui`, `frontend/AGENTS.md` |
| **Recovery of crashed executions** | Exactly how `crashed` is assigned after restart | `execution-recovery` (search `CRASHABLE_EXECUTION_STATUSES` users) |
| **Scheduler / durable schedule triggers** | New `N8N_SCHEDULER_ENABLED` path in the trigger code | `workflows/triggers/*`, `core/.../scheduled-task-manager.ts` |

## 4. Method note (how this guide was built)

The guide follows the *cognitive mental model* order — Why → What → Concept map → Running example → Depth dives → Walkthrough — using a shallow clone of `n8n-io/n8n` at commit `c1463d0e` (version `2.41.0`). Every path and function name was read in that snapshot; where a statement was not verified in code it is marked as such in the text. Because n8n changes quickly (notably around publishing, expression engines and engine v2), re-verify line numbers before relying on them.

**Back:** [06-walkthrough.md](06-walkthrough.md) · [Overview](00-overview.md)
