/* Mermaid 内置模板库
 * 字段说明：
 *   id          唯一标识，也用作缩略图缓存键
 *   icon        卡片图标（本页没有图标字体，统一用 emoji）
 *   title       模板名称
 *   description 一句话说明
 *   syntax      该图型在 mermaid 中的起始关键字，展示在卡片上
 *   code        载入编辑器的 Mermaid 源码
 * 约定：id 一律用 ASCII，中文只出现在标签文本里，避免非 ASCII 标识符的解析问题。
 */
const MERMAID_TEMPLATES = [
  {
    id: 'flowchart',
    icon: '🔀',
    title: '流程图',
    description: '用菱形判断与分支箭头描述业务流转',
    syntax: 'graph TD',
    code: `graph TD
  A[开始] --> B{用户已登录?}
  B -- 是 --> C[进入首页]
  B -- 否 --> D[跳转登录页]
  D --> E[输入账号密码]
  E --> C
  C --> F([结束])`
  },
  {
    id: 'sequence',
    icon: '💬',
    title: '时序图',
    description: '按时间顺序展示多方调用的消息往来',
    syntax: 'sequenceDiagram',
    code: `sequenceDiagram
  autonumber
  participant U as 用户
  participant W as 前端
  participant S as 服务端
  participant D as 数据库
  U->>W: 提交登录表单
  W->>S: POST /api/login
  S->>D: 查询账号
  D-->>S: 返回用户记录
  alt 密码正确
    S-->>W: 200 + Token
    W-->>U: 跳转首页
  else 密码错误
    S-->>W: 401 未授权
    W-->>U: 提示账号或密码错误
  end`
  },
  {
    id: 'class',
    icon: '🧩',
    title: '类图',
    description: '类、属性、方法以及类之间的关联关系',
    syntax: 'classDiagram',
    code: `classDiagram
  class User {
    +String id
    +String name
    +login() bool
  }
  class Order {
    +String orderNo
    +Date createdAt
    +pay() void
  }
  class Product {
    +String title
    +Number price
  }
  User "1" --> "*" Order : 下单
  Order "*" --> "*" Product : 包含`
  },
  {
    id: 'state',
    icon: '🔁',
    title: '状态图',
    description: '对象在各状态之间的迁移与触发条件',
    syntax: 'stateDiagram-v2',
    code: `stateDiagram-v2
  state "待付款" as Pending
  state "已付款" as Paid
  state "已发货" as Shipped
  state "已完成" as Done
  state "已取消" as Canceled
  [*] --> Pending : 创建订单
  Pending --> Paid : 支付成功
  Pending --> Canceled : 超时未支付
  Paid --> Shipped : 商家发货
  Shipped --> Done : 确认收货
  Done --> [*]
  Canceled --> [*]`
  },
  {
    id: 'er',
    icon: '🗄️',
    title: 'ER 图',
    description: '实体、字段与一对多／多对多关系',
    syntax: 'erDiagram',
    code: `erDiagram
  USER ||--o{ ORDER : "下单"
  ORDER ||--|{ ORDER_ITEM : "包含"
  PRODUCT ||--o{ ORDER_ITEM : "被购买"
  USER {
    string id PK
    string name
    string email
  }
  ORDER {
    string orderNo PK
    decimal amount
    date createdAt
  }
  PRODUCT {
    string sku PK
    string title
    decimal price
  }`
  },
  {
    id: 'gantt',
    icon: '📅',
    title: '甘特图',
    description: '任务排期、阶段划分与里程碑',
    syntax: 'gantt',
    code: `gantt
  title 项目排期示例
  dateFormat YYYY-MM-DD
  axisFormat %m-%d
  section 需求阶段
    需求调研 :done, r1, 2026-03-02, 5d
    需求评审 :done, r2, after r1, 2d
  section 开发阶段
    前端开发 :active, d1, after r2, 10d
    后端开发 :d2, after r2, 12d
  section 测试上线
    联调测试 :t1, after d1, 5d
    上线发布 :milestone, m1, after t1, 0d`
  },
  {
    id: 'pie',
    icon: '🥧',
    title: '饼图',
    description: '展示各部分占整体的比例',
    syntax: 'pie',
    code: `pie showData
  title 流量来源占比
  "搜索引擎" : 42
  "直接访问" : 28
  "社交媒体" : 18
  "其他" : 12`
  },
  {
    id: 'mindmap',
    icon: '🧠',
    title: '思维导图',
    description: '用缩进层级展开主题与子主题',
    syntax: 'mindmap',
    code: `mindmap
  root((产品规划))
    用户端
      注册登录
      个人中心
    管理端
      数据看板
      权限管理
    基础设施
      监控告警
      日志收集`
  },
  {
    id: 'gitgraph',
    icon: '🌿',
    title: 'GIT 图',
    description: '分支、提交与合并的版本演进过程',
    syntax: 'gitGraph',
    code: `gitGraph
  commit id: "初始化"
  branch develop
  commit id: "搭建框架"
  branch feature/login
  commit id: "登录页面"
  commit id: "接口联调"
  checkout develop
  merge feature/login
  commit id: "修复冲突"
  checkout main
  merge develop tag: "v1.0"`
  },
  {
    id: 'kanban',
    icon: '📋',
    title: '看板图',
    description: '按列展示任务流转，可标注负责人与优先级',
    syntax: 'kanban',
    code: `kanban
  todo[待办]
    task1[整理需求文档]@{ assigned: "张三", priority: "High" }
    task2[接口设计]
  doing[进行中]
    task3[登录模块开发]@{ assigned: "李四", priority: "Very High" }
  done[已完成]
    task4[项目立项]@{ ticket: "PROJ-1" }`
  },
  {
    id: 'architecture',
    icon: '🏗️',
    title: '架构图',
    description: '服务、分组与调用方向（标签仅支持英文）',
    syntax: 'architecture-beta',
    // 注意：architecture-beta 的 [标签] 只接受 ASCII，中文会直接报解析错误
    code: `architecture-beta
  group api(cloud)[API Gateway]
  service gateway(server)[Gateway] in api
  service app(server)[App Service] in api
  service db(database)[Database] in api
  service cache(disk)[Cache] in api
  service cdn(internet)[CDN]
  cdn:R --> L:gateway
  gateway:R --> L:app
  app:B --> T:db
  app:R --> L:cache`
  },
  {
    id: 'requirement',
    icon: '📐',
    title: '需求图',
    description: '需求条目与验证、满足、包含等追踪关系',
    syntax: 'requirementDiagram',
    // 中文名称与文本必须带引号，裸写中文会触发词法错误
    code: `requirementDiagram
  requirement "用户登录" {
    id: 1
    text: "用户可通过账号密码登录系统"
    risk: high
    verifymethod: test
  }
  functionalRequirement "密码加密存储" {
    id: 1.1
    text: "密码必须加盐哈希后存储"
    risk: high
    verifymethod: analysis
  }
  element "登录模块" {
    type: module
  }
  "用户登录" - contains -> "密码加密存储"
  "登录模块" - satisfies -> "用户登录"`
  },
  {
    id: 'block',
    icon: '🧱',
    title: '框图',
    description: '手动控制排布的方块图，适合画分层结构',
    syntax: 'block-beta',
    code: `block-beta
  columns 3
  web["前端应用"]:3
  space:3
  api["API 网关"]:3
  db[("主库")] cache[("Redis")] queue[("消息队列")]
  web --> api
  api --> db
  api --> cache
  api --> queue`
  }
];
