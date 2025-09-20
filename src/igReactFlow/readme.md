## Node Type Synchronization

In our data model we have two related fields:

- `IgReactFlowNode.type` → stored in the **node** table.
- `IgReactFlowNodeData.nodeType` → stored in the **node data** table.

Both represent the node's "type". To keep them **always in sync**, we enforce this rule at the **service layer**.

### How Synchronization Works

- **On Create (`mapNodeCreate`)**
  - Whenever a new node is created, we also create its data record.
  - At this point, we explicitly copy `node.type` into `node.data.nodeType`.

- **On Update (`mapNodeUpdate`)**
  - When updating a node, we use Prisma's `upsert` for `data`.
  - Both in the `create` and `update` branches, `nodeType` is set to `node.type`.
  - All scalar fields in `data` updates use `{ set: ... }` to avoid overwriting other fields.
  - This ensures that if a node's `type` changes, the `nodeType` inside `data` is updated in the **same transaction**.

- **Transactions**
  - Bulk operations like `upsertNodes` run inside a single `this.prismaService.$transaction([...])`.
  - This guarantees atomic updates so that `type` and `nodeType` can never diverge during service-level writes.

### Why Service-Level Sync?

- This keeps our schema simple and Prisma-friendly.
- No database triggers or generated columns are required.
- As long as all writes happen through this service, the two fields will **always remain consistent**.

### Caveat

If the database is modified **outside of this service** (e.g. via raw SQL, another script, or direct Prisma usage), the two fields can desync.  
If absolute enforcement at the database level is ever needed, we could add:
- A **generated column** (`nodeType` derived from `node.type`), or
- A **trigger** to propagate updates.

For now, our application-level enforcement is sufficient and keeps the developer experience smooth.
