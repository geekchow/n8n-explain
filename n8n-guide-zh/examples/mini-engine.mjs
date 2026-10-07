// 一个约 90 行的玩具实现，模拟 n8n WorkflowExecute 循环的*形状*。
// 对应的真实代码：packages/core/src/execution-engine/workflow-execute.ts（processRunExecutionData）。
// 运行方式：node mini-engine.mjs

// ---- 1. 工作流：就是普通数据（n8n 中对应 IWorkflowBase = { nodes, connections }） ----
const workflow = {
  nodes: {
    'Order Webhook': { type: 'webhook' },
    'Add VAT':       { type: 'set',  params: { total: (json) => json.body.amount * 1.2 } }, // 代表 ={{ $json.body.amount * 1.2 }} 这条表达式
    'Create Invoice':{ type: 'http', params: { url: 'https://billing.example.com/invoices' } },
    'Summarize':     { type: 'code', params: { fn: (items) => [{ json: { summary: `Invoice ${items[0].json.invoiceId} for ${items[0].json.total}` } }] } },
  },
  // n8n 中对应 IConnections = { [源节点]: { main: [ [ { node, type:'main', index } ] ] } }
  connections: {
    'Order Webhook':  { main: [[{ node: 'Add VAT',        index: 0 }]] },
    'Add VAT':        { main: [[{ node: 'Create Invoice', index: 0 }]] },
    'Create Invoice': { main: [[{ node: 'Summarize',      index: 0 }]] },
  },
};

// ---- 2. 节点的实现：数据项进来 -> 数据项出去（n8n 中对应 INodeType.execute） ----
const nodeTypes = {
  webhook: async (_node, items) => items,                                   // 数据是 webhook() 产出的，引擎只是原样传递
  set:     async (node, items)  => items.map((it) => ({ json: { ...it.json, total: node.params.total(it.json) } })),
  http:    async (node, items)  => items.map((it) => ({ json: { ...it.json, invoiceId: 'INV-1001', _called: node.params.url } })), // 伪装的 HTTP 调用 + 凭据
  code:    async (node, items)  => node.params.fn(items),
};

// ---- 3. 运行状态（n8n 中对应 IRunExecutionData） ----
async function run(workflow, startNode, firstItems) {
  const runData = {};                         // resultData.runData：节点名 -> 该节点每个 runIndex 的任务数据
  const stack = [{ node: startNode, data: firstItems, source: null }]; // executionData.nodeExecutionStack

  while (stack.length) {                      // 对应 executionLoop
    const { node: name, data } = stack.pop();
    const node = workflow.nodes[name];
    const startedAt = Date.now();
    const out = await nodeTypes[node.type](node, data);          // 对应 runNode()
    (runData[name] ??= []).push({ startTime: startedAt, executionTime: Date.now() - startedAt, data: { main: [out] } });
    console.log(`ran ${name.padEnd(15)} -> ${JSON.stringify(out.map((i) => i.json))}`);

    // 把子节点入队（n8n 中对应 addNodeToBeExecuted；多输入节点会在 waitingExecution 里等待）
    for (const conns of workflow.connections[name]?.main ?? [])
      for (const c of conns) stack.push({ node: c.node, data: out, source: { previousNode: name } });
  }
  return { finished: true, data: { resultData: { runData } } };
}

const result = await run(workflow, 'Order Webhook', [{ json: { body: { customer: 'ACME', amount: 100 } } }]);
console.log('\nrunData keys:', Object.keys(result.data.resultData.runData));
