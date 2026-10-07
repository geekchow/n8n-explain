// A ~90-line toy that mirrors the *shape* of n8n's WorkflowExecute loop.
// Real code: packages/core/src/execution-engine/workflow-execute.ts (processRunExecutionData).
// Run:  node mini-engine.mjs

// ---- 1. The workflow: plain data (n8n: IWorkflowBase = { nodes, connections }) ----
const workflow = {
  nodes: {
    'Order Webhook': { type: 'webhook' },
    'Add VAT':       { type: 'set',  params: { total: (json) => json.body.amount * 1.2 } }, // stands in for ={{ $json.body.amount * 1.2 }}
    'Create Invoice':{ type: 'http', params: { url: 'https://billing.example.com/invoices' } },
    'Summarize':     { type: 'code', params: { fn: (items) => [{ json: { summary: `Invoice ${items[0].json.invoiceId} for ${items[0].json.total}` } }] } },
  },
  // n8n: IConnections = { [sourceNode]: { main: [ [ { node, type:'main', index } ] ] } }
  connections: {
    'Order Webhook':  { main: [[{ node: 'Add VAT',        index: 0 }]] },
    'Add VAT':        { main: [[{ node: 'Create Invoice', index: 0 }]] },
    'Create Invoice': { main: [[{ node: 'Summarize',      index: 0 }]] },
  },
};

// ---- 2. Node implementations: items in -> items out (n8n: INodeType.execute) ----
const nodeTypes = {
  webhook: async (_node, items) => items,                                   // data was produced by webhook(), engine just passes it on
  set:     async (node, items)  => items.map((it) => ({ json: { ...it.json, total: node.params.total(it.json) } })),
  http:    async (node, items)  => items.map((it) => ({ json: { ...it.json, invoiceId: 'INV-1001', _called: node.params.url } })), // fake HTTP + credential
  code:    async (node, items)  => node.params.fn(items),
};

// ---- 3. Run state (n8n: IRunExecutionData) ----
async function run(workflow, startNode, firstItems) {
  const runData = {};                         // resultData.runData: nodeName -> [taskData per runIndex]
  const stack = [{ node: startNode, data: firstItems, source: null }]; // executionData.nodeExecutionStack

  while (stack.length) {                      // the executionLoop
    const { node: name, data } = stack.pop();
    const node = workflow.nodes[name];
    const startedAt = Date.now();
    const out = await nodeTypes[node.type](node, data);          // runNode()
    (runData[name] ??= []).push({ startTime: startedAt, executionTime: Date.now() - startedAt, data: { main: [out] } });
    console.log(`ran ${name.padEnd(15)} -> ${JSON.stringify(out.map((i) => i.json))}`);

    // enqueue children (n8n: addNodeToBeExecuted; multi-input nodes would wait in waitingExecution)
    for (const conns of workflow.connections[name]?.main ?? [])
      for (const c of conns) stack.push({ node: c.node, data: out, source: { previousNode: name } });
  }
  return { finished: true, data: { resultData: { runData } } };
}

const result = await run(workflow, 'Order Webhook', [{ json: { body: { customer: 'ACME', amount: 100 } } }]);
console.log('\nrunData keys:', Object.keys(result.data.resultData.runData));
