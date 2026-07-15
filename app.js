(() => {
  "use strict";

  const STORAGE_KEY = "firmware-release-replica-v1";
  const routes = {
    firmware: { title: "固件列表", group: "device" },
    modules: { title: "模组型号", group: "device" },
    operations: { title: "操作日志", group: "logs" },
    approvals: { title: "审批日志", group: "logs" },
    users: { title: "用户列表", group: "users" },
    roles: { title: "角色权限", group: "users" }
  };

  const productLines = ["IPC", "车载", "NVR", "AI玩具", "婴儿看护", "4G模组", "BK系列"];
  const permissionRows = [
    { menu: "固件管理", page: "固件列表", actions: ["查看固件标识列表", "编辑固件标识", "新增固件标识", "发布固件版本", "删除固件标识", "查看版本列表", "新增固件版本", "编辑固件版本", "删除固件版本", "删除差分文件", "新建差分任务"] },
    { menu: "模组型号", page: "", actions: [] },
    { menu: "日志管理", page: "操作日志", actions: ["查看操作日志"] },
    { menu: "审批日志", page: "", actions: [] },
    { menu: "用户角色", page: "用户列表", actions: ["查看用户列表", "更新用户"] },
    { menu: "角色权限", page: "", actions: ["新增角色", "更新角色", "更新角色权限", "删除角色"] }
  ];

  const featureCatalog = [
    {
      key: "connection",
      name: "连接类型",
      hint: "选择该固件版本支持的连接类型版本",
      options: [
        { value: "ipc-mqtt-v1", label: "IPC MQTT", version: "1", description: "设备使用MQTT连接IPC服务器" },
        { value: "p2p-mqtt-v2", label: "P2P + MQTT", version: "2", description: "设备支持 P2P 与 MQTT 双通道连接" }
      ]
    },
    {
      key: "addMethod",
      name: "新添加方式",
      hint: "支持设备添加与绑定方式管理",
      options: [
        { value: "long-power-4g-v2", label: "长电4G添加-V2", version: "20", description: "支持长电4G设备通过新添加接口第二版本流程绑定（如果配置错误可能导致大批量添加失败或者P2P集群分配异常）。" },
        { value: "standard-v1", label: "标准添加-V1", version: "10", description: "支持标准设备添加与绑定流程" },
        { value: "scan-v3", label: "扫码添加-V3", version: "30", description: "支持通过设备二维码完成添加与绑定" }
      ]
    },
    {
      key: "p2p",
      name: "自研P2P功能",
      hint: "支持P2P连接与远程预览等能力",
      options: [
        { value: "supported-v1", label: "支持", version: "1", description: "设备支持自研p2p功能" },
        { value: "unsupported-v1", label: "不支持", version: "1", description: "设备不启用自研 P2P 功能" }
      ]
    },
    {
      key: "realtimeLog",
      name: "实时日志功能",
      hint: "支持设备运行日志实时上传与查看",
      options: [
        { value: "supported-v1", label: "支持", version: "1", description: "设备支持tcp实时日志功能" },
        { value: "unsupported-v1", label: "不支持", version: "1", description: "设备不启用实时日志上传" }
      ]
    }
  ];

  const associatedFeatureCatalog = [
    { id: "night-vision", name: "夜视模式优化", imageLabel: "夜视" },
    { id: "low-power", name: "低功耗待机", imageLabel: "低功耗" },
    { id: "motion-track", name: "移动侦测跟踪", imageLabel: "跟踪" },
    { id: "voice-intercom", name: "双向语音对讲", imageLabel: "语音" }
  ];

  function configFromCatalog(item, optionValue = item.options[0].value) {
    const option = item.options.find(candidate => candidate.value === optionValue) || item.options[0];
    return { key: item.key, name: item.name, value: option.value, label: option.label, version: option.version, description: option.description };
  }

  const baseVersions = [
    { version: "23.110.211.13", url: "http://doraemon.camera666.com/firmware_VP_OTA_23.110.211.13_20260630_141359_1783931459.bin", size: "7.07", models: "QD20-DK", features: 4, creator: "刘林胶", note: "更新内容：1.修复已知问题 2.增加MQTT重新获取新的尚云uid 3.更新新的升级方式 4.同步最新代码", updated: "2026-07-13 16:30:59", latest: true, reminder: "不提醒" },
    { version: "23.110.211.99", url: "http://doraemon.camera666.com/firmware_VP_OTA_23.110.211.99_20260630_140504_1782876814.bin", size: "7.07", models: "QD20", features: 4, creator: "张元/Alice", note: "-", updated: "2026-07-01 11:33:34", latest: false, reminder: "不提醒" },
    { version: "23.110.211.12", url: "http://doraemon.camera666.com/firmware_VP_OTA_23.110.211.12_20260520_103629_1779516160.bin", size: "7.17", models: "QD20-DK", features: 4, creator: "管理员", note: "1", updated: "2026-05-23 14:02:40", latest: false, reminder: "不提醒" },
    { version: "23.110.211.22", url: "http://doraemon.camera666.com/firmware_VP_OTA_23.110.211.22_20260518_150508_1779154483.bin", size: "6.86", models: "QD20", features: 4, creator: "管理员", note: "1", updated: "2026-05-19 09:34:43", latest: false, reminder: "不提醒" },
    { version: "23.110.211.10", url: "http://doraemon.camera666.com/firmware_VP_OTA_23.110.211.10_20260306_174532_1773372751.bin", size: "7.26", models: "qd20-dk", features: 0, creator: "管理员", note: "1", updated: "2026-03-13 11:32:31", latest: false, reminder: "不提醒" },
    { version: "23.110.211.60", url: "http://doraemon.camera666.com/firmware_VP_OTA_23.110.211.60_20260306_174704_1773283044.bin", size: "7.26", models: "QD20", features: 0, creator: "管理员", note: "1", updated: "2026-03-12 10:37:25", latest: false, reminder: "不提醒" },
    { version: "23.110.211.7", url: "http://doraemon.camera666.com/firmware_23.110.211.7_1768373214.bin", size: "7.29", models: "-", features: 0, creator: "管理员", note: "1", updated: "2026-01-14 14:47:03", latest: false, reminder: "不提醒" },
    { version: "23.110.211.5", url: "http://doraemon.camera666.com/firmware_23.110.211.5_1767084949.bin", size: "7.30", models: "-", features: 0, creator: "管理员", note: "1", updated: "2025-12-30 16:55:58", latest: false, reminder: "不提醒" },
    { version: "23.110.211.4", url: "http://doraemon.camera666.com/firmware_23.110.211.4_1767019121.bin", size: "7.29", models: "-", features: 0, creator: "管理员", note: "1", updated: "2025-12-29 22:38:49", latest: false, reminder: "不提醒" },
    { version: "23.110.211.3", url: "http://doraemon.camera666.com/firmware_23.110.211.3_1766672684.bin", size: "7.30", models: "-", features: 0, creator: "管理员", note: "1", updated: "2025-12-25 22:24:51", latest: false, reminder: "不提醒" },
    { version: "23.110.211.2", url: "http://doraemon.camera666.com/firmware_23.110.211.2_1766658460.bin", size: "7.30", models: "-", features: 0, creator: "管理员", note: "1", updated: "2025-12-25 18:27:41", latest: false, reminder: "不提醒" },
    { version: "23.110.211.100", url: "http://doraemon.camera666.com/firmware_23.110.211.100_1766658425.bin", size: "7.30", models: "-", features: 0, creator: "管理员", note: "1", updated: "2025-12-25 18:27:14", latest: false, reminder: "不提醒" },
    { version: "23.110.211.1", url: "http://doraemon.camera666.com/firmware_23.110.211.1_1764261542.bin", size: "7.20", models: "-", features: 0, creator: "管理员", note: "1", updated: "2025-11-28 00:39:06", latest: false, reminder: "不提醒" }
  ];

  const seed = {
    identifiers: [
      { id: "23.110.211", product: "IPC", created: "2025-11-28 00:37:53", models: "QD20-DK", network: "仅4G", power: "常电", architecture: "新架构", versions: baseVersions },
      ...["23.100.111", "23.210.211", "23.120.211", "23.322.219", "23.220.211", "23.110.315", "23.120.304", "23.202.111", "23.203.111", "22.211.109", "23.303.111", "23.312.211", "22.111.109", "23.100.105", "20.190.350", "23.212.211", "23.422.209", "10.187.123", "23.412.219", "23.200.105", "23.403.119", "23.421.209", "23.320.239", "23.130.113", "26.221.201", "23.110.213", "23.230.111", "20.129.257", "20.322.109"].map((id, index) => ({
        id,
        product: index % 5 === 0 ? "4G模组" : "IPC",
        created: `2026-0${(index % 6) + 1}-${String((index % 25) + 1).padStart(2, "0")} 10:20:00`,
        models: index % 3 === 0 ? "QD20" : "A9-Pro",
        network: index % 4 === 0 ? "WiFi" : "仅4G",
        power: index % 2 ? "低功耗" : "常电",
        architecture: "新架构",
        versions: [{ version: `${id}.1`, url: `http://doraemon.camera666.com/firmware_${id}.1_demo.bin`, size: "7.12", models: index % 3 === 0 ? "QD20" : "A9-Pro", features: 2, creator: "管理员", note: "稳定版本", updated: "2026-06-18 14:30:00", latest: true, reminder: "不提醒" }]
      }))
    ],
    modules: [
      { model: "SY278SEEC", soc: "EC716E", linkedIdentifiers: [], tool: "FotaToolkit_V3.6.4.0", config: "ec716e", created: "2026-04-21 15:44:54" },
      { model: "SY278SAEC", soc: "EC716S", linkedIdentifiers: ["23.110.211"], tool: "FotaToolkit_V3.6.4.0", config: "ec716s", created: "2026-04-21 15:44:54" },
      { model: "SY288SPGL", soc: "EC718PM", linkedIdentifiers: ["23.100.111"], tool: "FotaToolkit_V3.6.4.0", config: "ec718pm", created: "2026-04-21 15:44:54" }
    ],
    operations: [
      ["2026-07-15 09:53:05", "彭志勇", "固件版本", "新增", "20.121.102.33"],
      ["2026-07-15 09:52:31", "彭志勇", "固件版本", "删除", "20.121.102.106"],
      ["2026-07-15 09:52:27", "彭志勇", "固件版本", "删除", "20.121.102.66"],
      ["2026-07-15 09:52:24", "彭志勇", "固件版本", "删除", "20.121.102.67"],
      ["2026-07-14 22:06:22", "阮天丽", "固件申请", "发布", "31.120.200.4"],
      ["2026-07-14 19:47:55", "阮天丽", "固件版本", "新增", "31.120.200.4"],
      ["2026-07-14 18:16:22", "刘林胶", "固件申请", "发布", "23.110.211.13"],
      ["2026-07-14 18:11:13", "凌紫妍", "固件版本", "新增", "21.120.106.3"],
      ["2026-07-14 14:50:15", "李金璨", "固件版本", "新增", "24.910.114.15"],
      ["2026-07-14 14:50:07", "李金璨", "固件版本", "删除", "24.910.114.14"],
      ["2026-07-14 14:40:27", "李金璨", "固件版本", "新增", "24.910.114.14"],
      ["2026-07-14 14:40:16", "李金璨", "固件版本", "删除", "24.910.114.13"],
      ["2026-07-14 11:52:00", "李金璨", "固件版本", "新增", "24.910.114.13"],
      ["2026-07-14 11:36:46", "李金璨", "固件版本", "新增", "24.910.114.12"],
      ["2026-07-14 11:16:02", "李金璨", "固件版本", "删除", "24.910.114.9"]
    ].map(([time, user, module, action, resource]) => ({ time, user, module, action, resource, description: `${action}${module}: [${resource}]` })),
    approvals: [
      ["31.120.200.4", "阮天丽", "2026-07-14 22:06:22", "彭冬柏", "审批通过", "2026-07-14 22:10:30"],
      ["23.110.211.13", "刘林胶", "2026-07-14 18:16:22", "彭冬柏", "审批通过", "2026-07-14 18:41:21"],
      ["23.110.211.13", "刘林胶", "2026-07-13 16:31:03", "-", "审批过期", "2026-07-14 16:59:42"],
      ["23.100.111.3", "彭志勇", "2026-07-13 14:43:07", "彭冬柏", "审批通过", "2026-07-13 16:23:26"],
      ["23.220.211.34", "江锐", "2026-07-13 11:47:19", "彭冬柏", "审批通过", "2026-07-13 12:11:51"],
      ["23.322.219.3", "江锐", "2026-07-13 11:47:06", "彭冬柏", "审批通过", "2026-07-13 12:11:52"],
      ["23.120.211.25", "江锐", "2026-07-13 11:46:46", "彭冬柏", "审批通过", "2026-07-13 12:11:55"],
      ["23.210.211.17", "邓文韬", "2026-07-13 09:51:58", "彭冬柏", "审批通过", "2026-07-13 12:11:58"],
      ["23.221.216.4", "杨婷", "2026-07-11 20:15:12", "彭冬柏", "审批通过", "2026-07-11 20:16:37"],
      ["23.110.315.3", "黄晓纯", "2026-07-11 11:46:34", "彭冬柏", "审批通过", "2026-07-11 12:52:51"],
      ["23.120.304.4", "黄晓纯", "2026-07-09 17:40:18", "彭冬柏", "审批通过", "2026-07-09 18:54:14"],
      ["23.120.211.28", "罗琅仁", "2026-07-09 17:17:11", "彭冬柏", "审批通过", "2026-07-09 18:54:15"]
    ].map(([version, submitter, submitTime, approver, status, approveTime]) => ({ version, event: "发布最新固件版本", submitter, submitTime, approver, status, approveTime, note: "-" })),
    users: [
      ["严国潮", "系统管理员", productLines, "2025-12-24 14:48:27"],
      ["严彬铭", "默认人员", productLines, "2025-12-24 14:48:27"],
      ["严永龙", "默认人员", ["IPC"], "2025-12-24 14:48:27"],
      ["严鹏", "FEA", productLines, "2026-04-23 17:29:37"],
      ["何圣安", "FEA", productLines, "2026-04-23 17:29:37"],
      ["何思虎", "默认人员", productLines, "2025-12-24 14:48:27"],
      ["何思虎", "4G模组权限角色", productLines, "2026-04-27 16:36:35"],
      ["全继科", "FEA", productLines, "2026-04-23 17:29:37"],
      ["凌紫妍", "默认人员", productLines, "2025-12-24 14:48:27"],
      ["刘亮", "4G模组权限角色", productLines, "2026-04-27 16:36:35"],
      ["刘友仁", "默认人员", productLines, "2025-12-24 14:48:27"],
      ["刘坚", "FEA", productLines, "2026-04-23 17:29:37"],
      ["刘川", "默认人员", productLines, "2025-12-24 14:48:27"],
      ["刘成颜", "FEA", ["IPC"], "2026-04-23 17:29:37"],
      ["刘文波", "默认人员", productLines, "2025-12-24 14:48:27"],
      ["刘春美", "FEA", productLines, "2026-04-23 17:29:37"],
      ["刘林胶", "测试人员", ["IPC"], "2025-12-24 14:48:27"],
      ["刘霞", "默认人员", productLines, "2025-12-24 14:48:27"],
      ["刘鹏", "默认人员", productLines, "2025-12-24 14:48:27"]
    ].map(([name, role, lines, created]) => ({ name, role, lines: [...lines], created, approverLines: [], note: role })),
    roles: [
      { name: "系统管理员", users: 16, created: "2025-12-24 14:48:27", note: "系统管理员，拥有固件发布系统所有产线的全部权限", default: true, permissions: {} },
      { name: "产线主管", users: 8, created: "2026-01-08 09:22:10", note: "负责所属产线固件发布与审批", permissions: {} },
      { name: "测试人员", users: 5, created: "2026-01-12 10:10:10", note: "固件测试与版本验证", permissions: {} },
      { name: "默认人员", users: 86, created: "2025-12-24 14:48:27", note: "默认查看权限", permissions: {} },
      { name: "FAE技术支持组长", users: 4, created: "2026-04-23 17:29:37", note: "技术支持组负责人", permissions: {} },
      { name: "FEA", users: 12, created: "2026-04-23 17:29:37", note: "技术支持角色", permissions: {} },
      { name: "4G模组权限角色", users: 6, created: "2026-04-27 16:36:35", note: "4G模组专项权限", permissions: {} }
    ]
  };

  const clone = value => JSON.parse(JSON.stringify(value));

  function normalizeDatabase(data) {
    const identifierIds = new Set(data.identifiers.map(identifier => identifier.id));
    data.identifiers.forEach(identifier => {
      identifier.versions.forEach(version => {
        if (!Array.isArray(version.featureConfigs)) {
          version.featureConfigs = featureCatalog.slice(0, Number(version.features) || 0).map(item => configFromCatalog(item));
        }
        if (!Array.isArray(version.associatedFeatures)) version.associatedFeatures = [];
        version.associatedFeatures = version.associatedFeatures.map(feature => ({
          id: feature.id || associatedFeatureCatalog.find(item => item.name === feature.name)?.id || `legacy-${feature.name}`,
          name: feature.name,
          imageLabel: feature.imageLabel || feature.imageName || "功能"
        }));
        version.features = version.featureConfigs.length;
        if (!version.published && version.latest) version.published = version.version === "23.110.211.13" ? "2026-07-14 18:41:21" : version.updated;
      });
    });
    data.modules.forEach((module, index) => {
      if (!Array.isArray(module.linkedIdentifiers)) {
        module.linkedIdentifiers = Number(module.firmwareCount) ? [index === 1 ? "23.110.211" : "23.100.111"] : [];
      }
      module.linkedIdentifiers = module.linkedIdentifiers.filter(id => identifierIds.has(id));
      delete module.firmwareCount;
      if (!module.linkedAt) module.linkedAt = module.created;
    });
    data.roles.forEach((role, index) => {
      if (!role.code) role.code = index === 0 ? "SYSTEM_ADMIN" : `ROLE_${index + 1}`;
    });
    const roleNames = new Set(data.roles.map(role => role.name));
    const fallbackRole = data.roles.find(role => role.default)?.name || data.roles[0]?.name || "";
    data.users.forEach(user => {
      if (!roleNames.has(user.role)) user.role = fallbackRole;
      if (!Array.isArray(user.lines)) user.lines = [];
      if (!Array.isArray(user.approverLines)) user.approverLines = [];
      if (!Array.isArray(user.changeLogs)) user.changeLogs = [];
      user.approverLines = user.approverLines.filter(line => user.lines.includes(line));
    });
    return data;
  }

  function loadData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return normalizeDatabase(stored ? JSON.parse(stored) : clone(seed));
    } catch (_error) {
      return normalizeDatabase(clone(seed));
    }
  }

  let db = loadData();
  let state = {
    route: routeFromHash(),
    groups: { device: true, logs: true, users: true },
    selectedIdentifier: db.identifiers[0]?.id || "",
    selectedRole: db.roles[0]?.name || "",
    roleTab: "permissions",
    roleEditing: false,
    profileOpen: false,
    loggedOut: false,
    modal: null,
    drawer: null,
    popover: null,
    density: "default",
    firmwarePage: 1,
    modulePage: 1,
    operationPage: 1,
    approvalPage: 1,
    userPage: 1,
    pageSizes: { firmware: 20, modules: 20, operations: 20, approvals: 20, users: 20 },
    columns: { url: true, size: true, models: true, features: true, creator: true, note: true, updated: true },
    filters: { firmware: "", product: "IPC", module: "", operation: "", approval: "", user: "", userLines: [], roleUserLines: [], operationStart: "2026-07-08", operationEnd: "2026-07-15", approvalStart: "2026-07-08", approvalEnd: "2026-07-15" },
    draftFilters: {},
    upload: null,
    errors: {},
    tempPermissions: null
  };

  const app = document.getElementById("app");
  const toastLayer = document.getElementById("toast-layer");
  let lastRenderedDrawer = null;
  let lastRenderedModal = null;
  let animateCurrentDrawer = false;
  let animateCurrentModal = false;

  function routeFromHash() {
    const value = location.hash.replace(/^#\/?/, "").split("?")[0];
    return routes[value] ? value : "firmware";
  }

  function esc(value) {
    return String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
  }

  function now() {
    const date = new Date();
    const pad = value => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); } catch (_error) { /* local preview remains functional */ }
  }

  function toast(message, type = "success") {
    const node = document.createElement("div");
    node.className = `toast ${type}`;
    node.innerHTML = `<strong>${type === "success" ? "完成" : type === "error" ? "错误" : "提示"}</strong><span>${esc(message)}</span>`;
    toastLayer.appendChild(node);
    window.setTimeout(() => node.remove(), 2800);
  }

  function activeIdentifier() {
    return db.identifiers.find(item => item.id === state.selectedIdentifier) || db.identifiers[0];
  }

  function activeRole() {
    return db.roles.find(item => item.name === state.selectedRole) || db.roles[0];
  }

  function filteredIdentifiers() {
    const query = state.filters.firmware.trim().toLowerCase();
    return db.identifiers.filter(item =>
      (!query || item.id.toLowerCase().includes(query) || item.versions.some(version => version.version.toLowerCase().includes(query))) &&
      (!state.filters.product || item.product === state.filters.product)
    );
  }

  function syncSelectedIdentifierToFilters() {
    const identifiers = filteredIdentifiers();
    if (identifiers.length && !identifiers.some(item => item.id === state.selectedIdentifier)) {
      state.selectedIdentifier = identifiers[0].id;
      state.firmwarePage = 1;
    }
  }

  function clampPage(total, pageSize, page) {
    return Math.min(Math.max(1, page), Math.max(1, Math.ceil(total / pageSize)));
  }

  function sameValues(left, right) {
    return left.length === right.length && left.every(value => right.includes(value));
  }

  function addOperation(module, action, resource, user = "汤彦珊") {
    db.operations.unshift({ time: now(), user, module, action, resource, description: `${action}${module}: [${resource}]` });
  }

  function emptyPermissions() {
    const keys = permissionRows.flatMap(row => [
      `menu-${row.menu}`,
      ...(row.page ? [`page-${row.page}`] : []),
      ...row.actions.map(action => `action-${action}`)
    ]);
    return Object.fromEntries(keys.map(key => [key, false]));
  }

  function pagination(total, page, action, pageSizeKey) {
    const pageSize = state.pageSizes[pageSizeKey] || 20;
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const buttons = [];
    const start = Math.max(1, Math.min(page - 3, pages - 6));
    const end = Math.min(pages, start + 6);
    for (let i = start; i <= end; i += 1) {
      buttons.push(`<button class="page-btn ${i === page ? "active" : ""}" data-action="${action}" data-page="${i}" aria-label="第 ${i} 页">${i}</button>`);
    }
    return `<div class="pagination"><span>共 ${total} 条</span><select class="select page-size-select" data-page-size="${pageSizeKey}" aria-label="每页条数">${[10, 20, 30, 40].map(size => `<option value="${size}" ${size === pageSize ? "selected" : ""}>${size}条/页</option>`).join("")}</select><button class="page-btn" data-action="${action}" data-page="${Math.max(1, page - 1)}" ${page <= 1 ? "disabled" : ""} aria-label="上一页">‹</button>${buttons.join("")}<button class="page-btn" data-action="${action}" data-page="${Math.min(pages, page + 1)}" ${page >= pages ? "disabled" : ""} aria-label="下一页">›</button><span>前往</span><input class="field page-jump" data-page-jump="${pageSizeKey}" data-page-action="${action}" data-max-page="${pages}" inputmode="numeric" value="${page}" aria-label="页码"><span>页</span></div>`;
  }

  function menuGroup(group, label, symbol, items) {
    const open = state.groups[group];
    return `<div class="menu-group ${open ? "is-open" : ""}"><button class="menu-group-title" data-action="toggle-group" data-group="${group}" aria-expanded="${open}"><span class="group-icon">${symbol}</span><span>${label}</span><span class="chevron">⌃</span></button><div class="menu-items">${items.map(([route, text]) => `<button class="menu-item ${state.route === route ? "active" : ""}" data-route="${route}">${text}</button>`).join("")}</div></div>`;
  }

  function renderShell() {
    const sameDrawer = Boolean(state.drawer && state.drawer === lastRenderedDrawer);
    const sameModal = Boolean(state.modal && state.modal === lastRenderedModal);
    const previousDrawerScroll = sameDrawer ? app.querySelector(".drawer-body")?.scrollTop ?? 0 : null;
    const previousModalScroll = sameModal ? app.querySelector(".dialog-body")?.scrollTop ?? 0 : null;
    animateCurrentDrawer = Boolean(state.drawer && !sameDrawer);
    animateCurrentModal = Boolean(state.modal && !sameModal);
    if (state.loggedOut) {
      app.innerHTML = `<main class="session-ended"><img src="assets/logo.png" alt="运维系统标志"><h1>会话已退出</h1><button class="btn primary" data-action="login">重新登录</button></main>`;
      document.title = "会话已退出 - 运维系统";
      lastRenderedDrawer = null;
      lastRenderedModal = null;
      return;
    }
    const route = routes[state.route];
    app.innerHTML = `<div class="app-shell">
      <header class="topbar">
        <button class="nav-toggle" data-action="toggle-nav" aria-label="展开菜单">☰</button>
        <div class="brand"><img src="assets/logo.png" alt="运维系统标志"><span>运维系统</span></div>
        <div class="topbar-spacer"></div>
        <div class="system-link"><span>▱</span><span>系统管理</span></div>
        <button class="profile-trigger" data-action="toggle-profile"><img src="assets/avatar.jpg" alt="汤彦珊头像"><span>汤彦珊</span></button>
      </header>
      ${state.profileOpen ? `<div class="profile-menu"><button data-action="profile">个人设置</button><button data-action="logout">退出登录</button></div>` : ""}
      <aside class="sidebar" aria-label="固件发布平台导航">
        <div class="sidebar-title">固件发布平台</div>
        ${menuGroup("device", "设备固件", "◆", [["firmware", "固件列表"], ["modules", "模组型号"]])}
        ${menuGroup("logs", "日志管理", "▣", [["operations", "操作日志"], ["approvals", "审批日志"]])}
        ${menuGroup("users", "用户角色", "◆", [["users", "用户列表"], ["roles", "角色权限"]])}
      </aside>
      <button class="mobile-backdrop" data-action="toggle-nav" aria-label="关闭菜单"></button>
      <main class="content-shell">${renderPage()}</main>
      ${renderOverlay()}
    </div>`;
    document.title = `${route.title} - 固件发布`;
    lastRenderedDrawer = state.drawer;
    lastRenderedModal = state.modal;
    if (previousDrawerScroll !== null) {
      const drawerBody = app.querySelector(".drawer-body");
      if (drawerBody) drawerBody.scrollTop = previousDrawerScroll;
    }
    if (previousModalScroll !== null) {
      const dialogBody = app.querySelector(".dialog-body");
      if (dialogBody) dialogBody.scrollTop = previousModalScroll;
    }
  }

  function renderPage() {
    if (state.route === "firmware") return renderFirmware();
    if (state.route === "modules") return renderModules();
    if (state.route === "operations") return renderOperations();
    if (state.route === "approvals") return renderApprovals();
    if (state.route === "users") return renderUsers();
    return renderRoles();
  }

  function pageHeader(title, tools = "") {
    return `<div class="page-header"><h1 class="page-title">${title}</h1>${tools ? `<div class="page-tools">${tools}</div>` : ""}</div>`;
  }

  function renderFirmware() {
    const identifiers = filteredIdentifiers();
    const selected = identifiers.find(item => item.id === state.selectedIdentifier) || identifiers[0] || null;
    const header = pageHeader("固件列表", `<input class="field search-field" data-filter="firmware" value="${esc(state.filters.firmware)}" placeholder="请输入固件标识或固件版本号" aria-label="搜索固件"><select class="select" data-change="product-filter" aria-label="所属产品线">${productLines.map(line => `<option ${line === state.filters.product ? "selected" : ""}>${line}</option>`).join("")}</select>`);
    if (!selected) {
      return `<section class="page tint-page">${header}<div class="firmware-layout"><aside class="identifier-panel"><h2 class="panel-heading">固件管理</h2><button class="btn panel-action" data-action="add-identifier">⊕ 新增标识</button><div class="muted" style="padding:16px">无匹配标识</div></aside><div class="firmware-main"><div class="empty-state"><div><div class="empty-illustration">▤</div>暂无匹配的固件数据</div></div></div></div></section>`;
    }
    const latest = selected.versions.find(item => item.latest) || selected.versions[0];
    return `<section class="page tint-page">
      ${header}
      <div class="firmware-layout">
        <aside class="identifier-panel"><h2 class="panel-heading">固件管理</h2><button class="btn panel-action" data-action="add-identifier">⊕ 新增标识</button><div class="identifier-list">${identifiers.map(item => `<button class="identifier-item ${item.id === selected.id ? "active" : ""}" data-action="select-identifier" data-id="${esc(item.id)}">${esc(item.id)}</button>`).join("") || `<div class="muted" style="padding:16px">无匹配标识</div>`}</div></aside>
        <div class="firmware-main">
          <div class="summary-band"><div class="summary-head"><h2>${esc(selected.id)}</h2><div class="summary-actions"><button class="btn small" data-action="refresh">↻ 刷新</button><div class="popover-wrap"><button class="btn small" data-action="identifier-actions" aria-expanded="${state.popover === "identifier"}">••• 更多</button>${state.popover === "identifier" ? `<div class="action-popover compact-popover"><button data-action="edit-identifier">编辑</button><button class="danger-item" data-action="delete-identifier">删除</button></div>` : ""}</div></div></div><div class="meta-grid"><span>所属产品线：<strong>${esc(selected.product)}</strong></span><span>创建时间：<strong>${esc(selected.created)}</strong></span><span>关联机型：<strong>${esc(selected.models)}</strong></span><span>网络类型：<strong>${esc(selected.network)}</strong></span><span>电量类型：<strong>${esc(selected.power)}</strong></span><span>架构类型：<strong>${esc(selected.architecture)}</strong></span></div></div>
          <div class="tab-strip"><button class="tab active">固件列表</button></div>
          ${latest ? `<section class="section-block"><h3 class="section-heading">最新发布版本</h3>${renderLatest(latest)}</section>` : ""}
          <section class="section-block"><div class="section-bar"><h3>固件版本列表</h3><div class="section-actions"><div class="popover-wrap"><button class="btn icon-btn" title="行高：${state.density === "default" ? "默认" : state.density === "comfortable" ? "宽松" : "紧凑"}" aria-label="行高：${state.density === "default" ? "默认" : state.density === "comfortable" ? "宽松" : "紧凑"}" data-action="density-menu">☷</button>${state.popover === "density" ? `<div class="action-popover density-popover">${[["default", "默认"], ["comfortable", "宽松"], ["compact", "紧凑"]].map(([value, label]) => `<button class="${state.density === value ? "selected" : ""}" data-action="set-density" data-density="${value}">${label}<span>${state.density === value ? "✓" : ""}</span></button>`).join("")}</div>` : ""}</div><div class="popover-wrap"><button class="btn icon-btn" title="列设置" aria-label="列设置" data-action="column-settings">⚙</button>${state.popover === "columns" ? renderColumnPopover() : ""}</div><button class="btn primary" data-action="add-version">＋ 新增版本</button></div></div>${renderFirmwareTable(selected)}${pagination(selected.versions.length, state.firmwarePage, "firmware-page", "firmware")}</section>
        </div>
      </div>
    </section>`;
  }

  function renderColumnPopover() {
    const labels = { url: "下载地址", size: "文件大小（M）", models: "适用机型", features: "功能集数", creator: "创建人", note: "说明", updated: "更新时间" };
    return `<div class="action-popover column-popover"><strong>列设置</strong><label class="check"><input type="checkbox" checked disabled>固件版本号</label>${Object.entries(labels).map(([key, label]) => `<label class="check"><input type="checkbox" data-column="${key}" ${state.columns[key] ? "checked" : ""}>${label}</label>`).join("")}<label class="check"><input type="checkbox" checked disabled>操作</label></div>`;
  }

  function renderLatest(version) {
    return `<div class="latest-card"><div class="latest-version"><span class="file-mark">V</span><div><strong>${esc(version.version)}</strong><div class="muted" style="margin-top:6px">发布时间：${esc(version.published || version.updated)}</div></div></div><div><span class="latest-label">下载地址</span><span class="ellipsis">${esc(version.url)}</span></div><div><span class="latest-label">文件大小</span><strong>${esc(version.size)}M</strong></div><div><span class="latest-label">提醒方式</span><span class="tag warning">${esc(version.reminder || "不提醒")}</span></div><div><span class="latest-label">适用机型</span><strong>${esc(version.models)}</strong></div><div><span class="latest-label">说明</span><span class="ellipsis">${esc(version.note)}</span></div><button class="btn small" data-action="version-detail" data-version="${esc(version.version)}">详情</button></div>`;
  }

  function renderFirmwareTable(identifier) {
    const columns = state.columns;
    const pageSize = state.pageSizes.firmware;
    const rows = identifier.versions.slice((state.firmwarePage - 1) * pageSize, state.firmwarePage * pageSize);
    const headers = [`<th style="width:155px">固件版本号</th>`, columns.url && `<th style="width:230px">下载地址</th>`, columns.size && `<th style="width:105px">文件大小（M）</th>`, columns.models && `<th style="width:125px">适用机型</th>`, columns.features && `<th style="width:90px">功能集数</th>`, columns.creator && `<th style="width:120px">创建人</th>`, columns.note && `<th style="width:175px">说明</th>`, columns.updated && `<th style="width:170px">更新时间</th>`, `<th style="width:200px">操作</th>`].filter(Boolean).join("");
    return `<div class="table-wrap firmware-table-wrap"><table class="data-table firmware-version-table ${state.density}"><thead><tr>${headers}</tr></thead><tbody>${rows.map(version => `<tr><td><span>${esc(version.version)}</span>${version.latest ? ` <span class="tag success">最新</span>` : ""}</td>${columns.url ? `<td><div class="cell-actions"><span class="cell-truncate" title="${esc(version.url)}">${esc(version.url)}</span><button class="link-btn" title="复制下载地址" data-action="copy" data-copy="${esc(version.url)}">▣</button></div></td>` : ""}${columns.size ? `<td>${esc(version.size)}</td>` : ""}${columns.models ? `<td>${esc(version.models)}</td>` : ""}${columns.features ? `<td>${version.features}</td>` : ""}${columns.creator ? `<td>${esc(version.creator)}</td>` : ""}${columns.note ? `<td class="cell-truncate" title="${esc(version.note)}">${esc(version.note)}</td>` : ""}${columns.updated ? `<td>${esc(version.updated)}</td>` : ""}<td><div class="cell-actions firmware-row-actions"><button class="link-btn" data-action="version-detail" data-version="${esc(version.version)}">详情</button>${version.latest ? "" : `<button class="link-btn" data-action="publish-version" data-version="${esc(version.version)}">发布</button><button class="link-btn" data-action="edit-version" data-version="${esc(version.version)}">编辑</button><button class="link-btn danger-link" data-action="delete-version" data-version="${esc(version.version)}">删除</button>`}</div></td></tr>`).join("")}</tbody></table></div>`;
  }

  function renderModules() {
    const query = state.filters.module.toLowerCase();
    const filtered = db.modules.filter(item => item.model.toLowerCase().includes(query) || item.soc.toLowerCase().includes(query));
    const pageSize = state.pageSizes.modules;
    const rows = filtered.slice((state.modulePage - 1) * pageSize, state.modulePage * pageSize);
    return `<section class="page plain-page">${pageHeader("模组型号")}<div class="filter-bar"><input class="field search-field" data-filter="module" value="${esc(state.filters.module)}" placeholder="请输入模组型号，按enter搜索" aria-label="搜索模组型号"></div><div class="table-wrap"><table class="data-table"><thead><tr><th>模组型号</th><th>SOC型号</th><th>关联固件数</th><th>FOTA工具版本</th><th>配置文件</th><th>创建时间</th></tr></thead><tbody>${rows.map(item => { const count = item.linkedIdentifiers.length; return `<tr><td>${esc(item.model)}</td><td>${esc(item.soc)}</td><td>${count ? `<button class="link-btn" data-action="module-firmware" data-model="${esc(item.model)}">${count}</button>` : "0"}</td><td>${esc(item.tool)}</td><td>${esc(item.config)}</td><td>${esc(item.created)}</td></tr>`; }).join("")}</tbody></table></div>${filtered.length ? pagination(filtered.length, state.modulePage, "module-page", "modules") : `<div class="empty-state"><div><div class="empty-illustration">▤</div>暂无数据</div></div>`}</section>`;
  }

  function renderOperations() {
    const query = state.filters.operation.toLowerCase();
    const filtered = db.operations.filter(item => (!query || item.resource.toLowerCase().includes(query)) && (!state.filters.operationStart || item.time.slice(0, 10) >= state.filters.operationStart) && (!state.filters.operationEnd || item.time.slice(0, 10) <= state.filters.operationEnd));
    const pageSize = state.pageSizes.operations;
    const rows = filtered.slice((state.operationPage - 1) * pageSize, state.operationPage * pageSize);
    return `<section class="page plain-page">${pageHeader("操作日志")}<div class="filter-bar"><input class="field search-field" data-draft="operation" value="${esc(state.draftFilters.operation ?? state.filters.operation)}" placeholder="请输入固件版本号" aria-label="固件版本号"><div class="date-range"><input class="date-field" type="date" data-draft="operationStart" value="${esc(state.draftFilters.operationStart ?? state.filters.operationStart)}" aria-label="开始日期"><span>至</span><input class="date-field" type="date" data-draft="operationEnd" value="${esc(state.draftFilters.operationEnd ?? state.filters.operationEnd)}" aria-label="结束日期"></div><button class="btn primary" data-action="query-operations">查询</button><button class="btn" data-action="reset-operations">重置</button></div><div class="table-wrap"><table class="data-table"><thead><tr><th>操作时间</th><th>操作人</th><th>操作模块</th><th>操作动作</th><th>操作资源</th><th>事件描述</th></tr></thead><tbody>${rows.map(item => `<tr><td>${esc(item.time)}</td><td>${esc(item.user)}</td><td>${esc(item.module)}</td><td>[${esc(item.action)}]</td><td>${esc(item.resource)}</td><td>${esc(item.description)}</td></tr>`).join("")}</tbody></table></div>${pagination(filtered.length, state.operationPage, "operation-page", "operations")}</section>`;
  }

  function renderApprovals() {
    const query = state.filters.approval.toLowerCase();
    const filtered = db.approvals.filter(item => (!query || item.version.toLowerCase().includes(query)) && (!state.filters.approvalStart || item.submitTime.slice(0, 10) >= state.filters.approvalStart) && (!state.filters.approvalEnd || item.submitTime.slice(0, 10) <= state.filters.approvalEnd));
    const pageSize = state.pageSizes.approvals;
    const rows = filtered.slice((state.approvalPage - 1) * pageSize, state.approvalPage * pageSize);
    return `<section class="page plain-page">${pageHeader("审批日志")}<div class="filter-bar"><input class="field search-field" data-draft="approval" value="${esc(state.draftFilters.approval ?? state.filters.approval)}" placeholder="固件版本号" aria-label="固件版本号"><div class="date-range"><input class="date-field" type="date" data-draft="approvalStart" value="${esc(state.draftFilters.approvalStart ?? state.filters.approvalStart)}" aria-label="开始日期"><span>至</span><input class="date-field" type="date" data-draft="approvalEnd" value="${esc(state.draftFilters.approvalEnd ?? state.filters.approvalEnd)}" aria-label="结束日期"></div><button class="btn primary" data-action="query-approvals">查询</button><button class="btn" data-action="reset-approvals">重置</button></div><div class="table-wrap"><table class="data-table"><thead><tr><th>固件版本号</th><th>审批事件</th><th>提交人</th><th>提交时间</th><th>审批人</th><th>审批状态</th><th>审批时间</th><th>说明</th></tr></thead><tbody>${rows.map(item => `<tr><td>${esc(item.version)}</td><td>${esc(item.event)}</td><td>${esc(item.submitter)}</td><td>${esc(item.submitTime)}</td><td>${esc(item.approver)}</td><td><span class="${item.status === "审批通过" ? "tag success" : "tag warning"}">${esc(item.status)}</span></td><td>${esc(item.approveTime)}</td><td>${esc(item.note)}</td></tr>`).join("")}</tbody></table></div>${pagination(filtered.length, state.approvalPage, "approval-page", "approvals")}</section>`;
  }

  function renderUsers() {
    const query = state.filters.user.toLowerCase();
    const lineFilters = state.filters.userLines || [];
    const filtered = db.users.filter(item => (!query || item.name.toLowerCase().includes(query) || item.role.toLowerCase().includes(query)) && (!lineFilters.length || lineFilters.some(line => item.lines.includes(line))));
    const pageSize = state.pageSizes.users;
    const rows = filtered.slice((state.userPage - 1) * pageSize, state.userPage * pageSize);
    const draftLines = state.userLineDraft || lineFilters;
    const linePopover = state.popover === "userLine" ? `<div class="action-popover user-line-popover"><div class="user-line-options">${productLines.map(line => `<label class="check"><input type="checkbox" data-user-line-filter="${esc(line)}" ${draftLines.includes(line) ? "checked" : ""}>${esc(line)}</label>`).join("")}</div><div class="filter-popover-actions"><button class="btn small primary" data-action="apply-user-line-filter">筛选</button><button class="btn small" data-action="reset-user-line-filter">重置</button></div></div>` : "";
    return `<section class="page plain-page">${pageHeader("用户列表")}<div class="filter-bar"><input class="field search-field" data-draft="user" value="${esc(state.draftFilters.user ?? state.filters.user)}" placeholder="请输入用户账号名称，按enter搜索" aria-label="用户账号名称"><button class="btn primary" data-action="query-users">查询</button><button class="btn" data-action="reset-users">重置</button></div><div class="user-table-area"><div class="table-wrap"><table class="data-table"><thead><tr><th style="width:190px">账号名称</th><th style="width:190px">关联角色</th><th>所属产线 <button class="table-filter-btn ${lineFilters.length ? "active" : ""}" data-action="user-line-filter" aria-label="按所属产线过滤">▽</button></th><th style="width:190px">创建时间</th><th style="width:170px">操作</th></tr></thead><tbody>${rows.map(item => `<tr><td>${esc(item.name)}</td><td>${esc(item.role)}</td><td class="cell-truncate" title="${esc(item.lines.join(" / "))}">${esc(item.lines.join(" / "))}</td><td>${esc(item.created)}</td><td><div class="cell-actions"><button class="link-btn" data-action="user-detail" data-user-index="${db.users.indexOf(item)}">详情</button><button class="link-btn" data-action="user-permissions" data-user-index="${db.users.indexOf(item)}">权限配置</button></div></td></tr>`).join("")}</tbody></table></div>${linePopover}</div>${pagination(filtered.length, state.userPage, "user-page", "users")}</section>`;
  }

  function renderRoles() {
    const role = activeRole();
    const associated = db.users.filter(user => user.role === role.name);
    const roleActions = role.default ? "" : `<div class="popover-wrap"><button class="btn small" data-action="role-more" aria-expanded="${state.popover === "role"}">••• 更多</button>${state.popover === "role" ? `<div class="action-popover compact-popover"><button data-action="edit-role">编辑</button><button class="danger-item" data-action="delete-role">删除</button></div>` : ""}</div>`;
    const permissionActions = state.roleTab === "permissions" && !role.default ? `<div class="permission-toolbar"><button class="btn small" data-action="toggle-role-edit">${state.roleEditing ? "取消编辑" : "编辑权限"}</button></div>` : "";
    return `<section class="page tint-page">${pageHeader("角色权限")}<div class="role-layout"><aside class="role-panel"><h2 class="panel-heading">角色列表</h2><button class="btn panel-action" data-action="add-role">⊕ 新增角色</button><div class="role-list">${db.roles.map(item => `<button class="role-item ${item.name === role.name ? "active" : ""}" data-action="select-role" data-role="${esc(item.name)}">${esc(item.name)}${item.default ? `<span class="tag success">默认</span>` : ""}</button>`).join("")}</div></aside><div class="role-main"><div class="summary-band"><div class="summary-head"><h2>${esc(role.name)}</h2>${roleActions}</div><div class="meta-grid"><span>创建时间：<strong>${esc(role.created)}</strong></span><span>关联用户数：<strong>${associated.length}</strong></span><span style="grid-column:span 2">备注：<strong>${esc(role.note)}</strong></span></div></div><div class="tab-strip"><button class="tab ${state.roleTab === "permissions" ? "active" : ""}" data-action="role-tab" data-tab="permissions">角色权限</button><button class="tab ${state.roleTab === "users" ? "active" : ""}" data-action="role-tab" data-tab="users">关联用户</button></div><div class="role-tab-content">${permissionActions}${state.roleTab === "permissions" ? renderPermissionTable(role) : renderAssociatedUsers(associated)}${state.roleEditing ? `<div class="permission-save"><button class="btn" data-action="toggle-role-edit">取消</button><button class="btn primary" data-action="save-role-permissions">保存权限</button></div>` : ""}</div></div></div></section>`;
  }

  function renderPermissionTable(role, editable = state.roleEditing, prefix = "role") {
    const system = role.name === "系统管理员";
    const permissions = prefix === "role" && state.tempPermissions ? state.tempPermissions : role.permissions || {};
    return `<div class="table-wrap"><table class="data-table permission-table"><thead><tr><th style="width:170px">菜单</th><th style="width:230px">页面</th><th>功能操作权限</th></tr></thead><tbody>${permissionRows.map((row, rowIndex) => {
      const menuKey = `menu-${row.menu}`;
      const pageKey = row.page ? `page-${row.page}` : "";
      const checked = key => system || permissions[key] !== false;
      return `<tr><td><label class="check"><input type="checkbox" data-permission="${esc(menuKey)}" data-prefix="${prefix}" ${checked(menuKey) ? "checked" : ""} ${editable && !system ? "" : "disabled"}>${esc(row.menu)}</label></td><td>${row.page ? `<label class="check"><input type="checkbox" data-permission="${esc(pageKey)}" data-prefix="${prefix}" ${checked(pageKey) ? "checked" : ""} ${editable && !system ? "" : "disabled"}>${esc(row.page)}</label>` : "-"}</td><td><div class="check-grid">${row.actions.length ? row.actions.map(action => { const key = `action-${action}`; return `<label class="check"><input type="checkbox" data-permission="${esc(key)}" data-prefix="${prefix}" ${checked(key) ? "checked" : ""} ${editable && !system ? "" : "disabled"}>${esc(action)}</label>`; }).join("") : "-"}</div></td></tr>`;
    }).join("")}</tbody></table></div>`;
  }

  function renderAssociatedUsers(users) {
    const lineFilters = state.filters.roleUserLines || [];
    const filtered = users.filter(user => !lineFilters.length || lineFilters.some(line => user.lines.includes(line)));
    const draftLines = state.roleUserLineDraft || lineFilters;
    const linePopover = state.popover === "roleUserLine" ? `<div class="action-popover role-user-line-popover"><div class="user-line-options">${productLines.map(line => `<label class="check"><input type="checkbox" data-role-user-line-filter="${esc(line)}" ${draftLines.includes(line) ? "checked" : ""}>${esc(line)}</label>`).join("")}</div><div class="filter-popover-actions"><button class="btn small primary" data-action="apply-role-user-line-filter">筛选</button><button class="btn small" data-action="reset-role-user-line-filter">重置</button></div></div>` : "";
    return `<div class="role-user-table-area"><div class="table-wrap"><table class="data-table"><thead><tr><th>账号名称</th><th>所属产线 <button class="table-filter-btn ${lineFilters.length ? "active" : ""}" data-action="role-user-line-filter" aria-label="按所属产线过滤">▽</button></th><th>备注</th></tr></thead><tbody>${filtered.map(user => `<tr><td>${esc(user.name)}</td><td>${esc(user.lines.join(" / "))}</td><td>${esc(user.note || "-")}</td></tr>`).join("")}</tbody></table></div>${linePopover}</div>${filtered.length ? "" : `<div class="empty-state"><div><div class="empty-illustration">▤</div>暂无关联用户</div></div>`}`;
  }

  function renderOverlay() {
    if (!state.modal && !state.drawer) return "";
    if (state.modal && state.drawer) return `<div class="overlay ${animateCurrentDrawer ? "is-entering" : ""}" data-action="overlay-close"></div>${renderDrawer()}<div class="overlay overlay-secondary ${animateCurrentModal ? "is-entering" : ""}" data-action="close-modal"></div>${renderModal()}`;
    if (state.modal) return `<div class="overlay ${animateCurrentModal ? "is-entering" : ""}" data-action="overlay-close"></div>${renderModal()}`;
    return `<div class="overlay ${animateCurrentDrawer ? "is-entering" : ""}" data-action="overlay-close"></div>${renderDrawer()}`;
  }

  function modalFrame(title, body, footer = "", wide = false, nested = false) {
    return `<section class="modal ${wide ? "wide" : ""} ${nested ? "nested-modal" : ""} ${animateCurrentModal ? "is-entering" : ""}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><header class="dialog-header"><h2>${esc(title)}</h2><button class="close-btn" data-action="${nested ? "close-modal" : "close-overlay"}" aria-label="关闭">×</button></header><div class="dialog-body">${body}</div>${footer ? `<footer class="dialog-footer">${footer}</footer>` : ""}</section>`;
  }

  function drawerFrame(title, body, footer = "", narrow = false) {
    return `<section class="drawer ${narrow ? "narrow" : ""} ${animateCurrentDrawer ? "is-entering" : ""}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><header class="drawer-header"><h2>${esc(title)}</h2><button class="close-btn" data-action="close-overlay" aria-label="关闭">×</button></header><div class="drawer-body">${body}</div>${footer ? `<footer class="drawer-footer">${footer}</footer>` : ""}</section>`;
  }

  function errorFor(name) {
    return state.errors[name] ? `<div class="error-text">${esc(state.errors[name])}</div>` : "";
  }

  function renderModal() {
    const modal = state.modal;
    if (modal.type === "addIdentifier") {
      const modelOptions = [...new Set(db.identifiers.map(item => item.models).filter(Boolean))];
      const draft = modal.draft || { id: "", product: "IPC", models: "" };
      return modalFrame("新增固件标识", `<form id="add-identifier-form"><div class="notice">关联绑定机型后不支持二次编辑，请谨慎操作。<span class="notice-help">找不到机型？可直接输入</span></div><div class="form-grid single"><div class="form-field required"><label for="identifier-id">固件标识</label><input id="identifier-id" class="field" name="id" data-modal-draft="id" value="${esc(draft.id)}" placeholder="固件标识为xx.xx.xx，如1.0.0" autocomplete="off">${errorFor("id")}</div><div class="form-field required"><label for="identifier-product">所属产线</label><select id="identifier-product" class="select" name="product" data-modal-draft="product">${productLines.map(line => `<option ${line === draft.product ? "selected" : ""}>${line}</option>`).join("")}</select></div><div class="form-field required"><label for="identifier-models">关联机型</label><input id="identifier-models" class="field" name="models" data-modal-draft="models" value="${esc(draft.models)}" list="identifier-model-options" placeholder="请选择关联机型"><datalist id="identifier-model-options">${modelOptions.map(model => `<option value="${esc(model)}">`).join("")}</datalist>${errorFor("models")}</div></div></form>`, `<button class="btn" data-action="close-overlay">取消</button><button class="btn primary" type="submit" form="add-identifier-form">确认</button>`);
    }
    if (modal.type === "editIdentifier") {
      const item = activeIdentifier();
      return modalFrame("编辑固件标识", `<form id="edit-identifier-form"><div class="notice">关联机型创建后不可二次编辑。</div><div class="form-grid"><div class="form-field"><label>固件标识</label><input class="field" value="${esc(item.id)}" disabled></div><div class="form-field required"><label>所属产线</label><select class="select" name="product">${productLines.map(line => `<option ${line === item.product ? "selected" : ""}>${line}</option>`).join("")}</select></div><div class="form-field required"><label>关联机型</label><input class="field" value="${esc(item.models)}" disabled></div><div class="form-field"><label>网络类型</label><select class="select" name="network"><option ${item.network === "仅4G" ? "selected" : ""}>仅4G</option><option ${item.network === "WiFi" ? "selected" : ""}>WiFi</option><option ${item.network === "4G + WiFi" ? "selected" : ""}>4G + WiFi</option></select></div><div class="form-field"><label>电量类型</label><select class="select" name="power"><option ${item.power === "常电" ? "selected" : ""}>常电</option><option ${item.power === "低功耗" ? "selected" : ""}>低功耗</option></select></div><div class="form-field"><label>架构类型</label><select class="select" name="architecture"><option ${item.architecture === "新架构" ? "selected" : ""}>新架构</option><option ${item.architecture === "旧架构" ? "selected" : ""}>旧架构</option></select></div></div></form>`, `<button class="btn" data-action="close-overlay">取消</button><button class="btn primary" type="submit" form="edit-identifier-form">保存</button>`, true);
    }
    if (modal.type === "publish") {
      return modalFrame("是否确认发布当前固件为最新版本？", `<p class="confirm-copy">是否发布当前【${esc(modal.version)}】固件版本？</p><div class="form-field required"><label for="publish-reminder">APP提醒方式：</label><select id="publish-reminder" class="select" style="width:100%"><option>不提醒</option><option>仅首页提醒</option><option>强提醒</option></select></div>`, `<button class="btn" data-action="close-overlay">取消</button><button class="btn primary" data-action="confirm-publish">确认</button>`);
    }
    if (modal.type === "deleteVersion") {
      return modalFrame("删除固件版本", `<div class="confirm-icon">!</div><p class="confirm-copy">确定删除固件版本【${esc(modal.version)}】吗？删除后不可恢复。</p>`, `<button class="btn" data-action="close-overlay">取消</button><button class="btn danger" data-action="confirm-delete-version">删除</button>`);
    }
    if (modal.type === "deleteIdentifier") {
      return modalFrame("删除固件标识", `<div class="confirm-icon">!</div><p class="confirm-copy">确定删除固件标识【${esc(activeIdentifier().id)}】及其版本记录吗？</p>`, `<button class="btn" data-action="close-overlay">取消</button><button class="btn danger" data-action="confirm-delete-identifier">删除</button>`);
    }
    if (modal.type === "addRole") {
      return renderRoleFormModal("新增角色", null);
    }
    if (modal.type === "editRole") {
      return renderRoleFormModal("编辑角色", activeRole());
    }
    if (modal.type === "moduleFirmware") {
      const module = db.modules.find(item => item.model === modal.model);
      const linked = module.linkedIdentifiers.map(id => db.identifiers.find(item => item.id === id)).filter(Boolean);
      return modalFrame(`${module.model} 关联固件列表`, `<div class="table-wrap"><table class="data-table"><thead><tr><th>固件标识</th><th>所属产线</th><th>APP提醒方式</th><th>关联时间</th></tr></thead><tbody>${linked.map(identifier => `<tr><td>${esc(identifier.id)}</td><td>${esc(identifier.product)}</td><td>-</td><td>${esc(module.linkedAt)}</td></tr>`).join("")}</tbody></table></div>${linked.length ? "" : `<div class="empty-state compact-empty"><div><div class="empty-illustration">▤</div>暂无数据</div></div>`}`, "", true);
    }
    if (modal.type === "featurePicker") {
      return renderFeaturePicker();
    }
    if (modal.type === "deleteRole") {
      return modalFrame("删除角色", `<div class="confirm-icon">!</div><p class="confirm-copy">确定删除角色【${esc(activeRole().name)}】吗？</p>`, `<button class="btn" data-action="close-overlay">取消</button><button class="btn danger" data-action="confirm-delete-role">删除</button>`);
    }
    if (modal.type === "logout") {
      return modalFrame("退出登录", `<p class="confirm-copy">确认退出当前登录账号吗？</p>`, `<button class="btn" data-action="close-overlay">取消</button><button class="btn primary" data-action="confirm-logout">确认</button>`);
    }
    return modalFrame("个人设置", `<div class="profile-summary"><img src="assets/avatar.jpg" alt="汤彦珊头像"><div><h3>汤彦珊</h3><div class="subtle">系统管理员</div></div></div><table class="info-list"><tr><td>安全手机</td><td>192****0364</td></tr><tr><td>邮箱</td><td>未绑定</td></tr><tr><td>密码</td><td>******</td></tr><tr><td>所属角色</td><td>系统管理员</td></tr></table>`, `<button class="btn primary" data-action="close-overlay">关闭</button>`);
  }

  function renderRoleFormModal(title, role) {
    const editing = Boolean(role);
    const draft = state.modal.draft || { name: role?.name || "", code: role?.code || "", note: role?.note === "-" ? "" : role?.note || "" };
    return modalFrame(title, `<form id="${editing ? "edit-role-form" : "add-role-form"}"><div class="form-grid single"><div class="form-field required"><label>角色名称</label><input class="field" name="name" data-modal-draft="name" maxlength="20" value="${esc(draft.name)}" placeholder="请输入角色名称">${errorFor("roleName")}<div class="helper align-right">${draft.name.length} / 20</div></div><div class="form-field required"><label>角色编码</label><input class="field" name="code" data-modal-draft="code" maxlength="20" value="${esc(draft.code)}" ${editing ? "disabled" : ""} placeholder="请输入角色英文编码">${errorFor("roleCode")}<div class="helper align-right">${draft.code.length} / 20</div></div><div class="form-field"><label>备注</label><textarea class="textarea" name="note" data-modal-draft="note" maxlength="200" placeholder="请输入备注">${esc(draft.note)}</textarea><div class="helper align-right">${draft.note.length} / 200</div></div></div></form>`, `<button class="btn" data-action="close-overlay">取消</button><button class="btn primary" type="submit" form="${editing ? "edit-role-form" : "add-role-form"}">${editing ? "保存" : "确认"}</button>`);
  }

  function renderFeaturePicker() {
    const modal = state.modal;
    const availableFeatures = availableAssociatedFeatures();
    const query = String(modal.query || "").trim().toLowerCase();
    const filtered = availableFeatures.filter(feature => !query || feature.name.toLowerCase().includes(query));
    const selectedIds = modal.selectedIds || [];
    const selected = availableFeatures.filter(feature => selectedIds.includes(feature.id));
    return modalFrame("编辑功能关联", `<div class="feature-picker"><div class="feature-picker-main"><div class="picker-toolbar"><label class="check"><input type="checkbox" data-action="toggle-all-features" ${filtered.length && filtered.every(item => selectedIds.includes(item.id)) ? "checked" : ""}>${selectedIds.length}/${availableFeatures.length}项</label><input class="field" data-feature-search value="${esc(modal.query || "")}" placeholder="请输入功能名称，按enter搜索"></div><div class="feature-option-list">${filtered.map(feature => `<label class="feature-option"><input type="checkbox" data-feature-choice="${feature.id}" ${selectedIds.includes(feature.id) ? "checked" : ""}><span class="feature-image-placeholder">${esc(feature.imageLabel)}</span><strong>${esc(feature.name)}</strong></label>`).join("") || `<div class="empty-state compact-empty"><div>无搜索数据</div></div>`}</div></div><aside class="feature-selected"><h3>已选功能（${selected.length}）</h3>${selected.map(feature => `<div class="selected-feature"><span class="feature-image-placeholder">${esc(feature.imageLabel)}</span><span>${esc(feature.name)}</span><button class="link-btn danger-link" data-action="unselect-feature" data-feature-id="${feature.id}">移除</button></div>`).join("") || `<div class="empty-state compact-empty"><div>暂无数据</div></div>`}</aside></div>`, `<button class="btn" data-action="close-modal">取消</button><button class="btn primary" data-action="confirm-feature-picker">确定</button>`, true, true);
  }

  function availableAssociatedFeatures() {
    const current = state.drawer?.associatedFeatures || [];
    return [...associatedFeatureCatalog, ...current.filter(feature => !associatedFeatureCatalog.some(item => item.id === feature.id))];
  }

  function findVersion(version) {
    return activeIdentifier()?.versions.find(item => item.version === version);
  }

  function renderDrawer() {
    const drawer = state.drawer;
    if (drawer.type === "addVersion") return renderVersionFormDrawer("新增固件版本号", null);
    if (drawer.type === "editVersion") return renderVersionFormDrawer("编辑固件版本号", findVersion(drawer.version));
    if (drawer.type === "versionDetail") return renderVersionDetail(findVersion(drawer.version));
    if (drawer.type === "userDetail") return renderUserDetail(db.users[drawer.userIndex]);
    if (drawer.type === "userPermissions") return renderUserPermissions(db.users[drawer.userIndex]);
    return "";
  }

  function renderVersionFormDrawer(title, version) {
    const editing = Boolean(version);
    const upload = state.upload;
    const formDraft = state.drawer.formDraft || { version: version?.version || upload?.version || "", models: version?.models || "", note: version?.note === "-" ? "" : version?.note || "" };
    const generatedVersion = formDraft.version;
    const associatedFeatures = state.drawer?.associatedFeatures || [];
    const configurable = editing || Boolean(upload);
    const existingConfigs = version?.featureConfigs || [];
    const uploadName = editing ? version.url.split("/").pop() : upload?.name;
    const uploadSize = editing ? version.size : upload?.size;
    const uploadCard = uploadName ? `<div class="upload-success"><span class="upload-file-icon">▤</span><div><strong class="ellipsis">${esc(uploadName)}</strong><span>${esc(uploadSize)} MB</span><small>● 上传成功，解析完成</small></div>${editing ? "" : `<label class="link-btn">重新上传<input id="firmware-file" class="hidden" type="file" accept=".bin,.binpkg"></label>`}</div>` : `<label class="btn upload-trigger"><input id="firmware-file" class="hidden" type="file" accept=".bin,.binpkg">⇧ 上传文件</label><div class="helper">支持格式：.bin、.binpkg</div>`;
    const capabilityCards = configurable ? featureCatalog.map(item => {
      const existing = existingConfigs.find(config => config.key === item.key);
      const selected = state.drawer.capabilitySelections?.[item.key] || existing?.value || item.options[0].value;
      const selectedOption = item.options.find(option => option.value === selected) || item.options[0];
      const helpOpen = state.drawer.capabilityHelp === item.key;
      return `<div class="capability-card"><div><div class="capability-name">${esc(item.name)} <span title="${esc(item.hint)}">ⓘ</span></div><div class="capability-hint">${esc(item.hint)}</div></div><div class="capability-control"><button class="btn small" type="button" data-action="capability-help" data-capability="${item.key}">版本说明</button><select class="select" name="capability-${item.key}" aria-label="${esc(item.name)}">${item.options.map(option => `<option value="${esc(option.value)}" ${option.value === selected ? "selected" : ""}>${esc(option.label)}</option>`).join("")}</select></div>${helpOpen ? `<div class="capability-description"><strong>版本 ${esc(selectedOption.version)}</strong><span>${esc(selectedOption.description)}</span></div>` : ""}</div>`;
    }).join("") : "";
    const md5Field = editing ? "" : `<div class="form-field required"><label>MD5值</label><input class="field" value="${esc(upload?.md5 || "")}" readonly placeholder="上传文件后自动生成"></div>`;
    return drawerFrame(title, `<form id="version-form"><input type="hidden" name="mode" value="${editing ? "edit" : "add"}"><input type="hidden" name="version" value="${esc(generatedVersion)}"><div class="form-grid"><div class="form-field required"><label>固件标识</label><input class="field" value="${esc(activeIdentifier().id)}" disabled placeholder="固件标识"></div><div class="form-field required"><label>固件版本号</label><input class="field" value="${esc(generatedVersion)}" disabled placeholder="上传文件后自动生成">${errorFor("version")}</div><div class="form-field required"><label>上传固件包</label>${uploadCard}${errorFor("file")}</div>${md5Field}<div class="form-field required"><label>适用机型</label><input class="field" name="models" data-version-draft="models" maxlength="100" value="${esc(formDraft.models)}" placeholder="请输入适用机型">${errorFor("models")}<div class="helper align-right">${formDraft.models.length} / 100</div></div></div><div class="drawer-section capability-section"><h3>功能集</h3>${configurable ? `<div class="capability-notice">● 提示：当前固件版本【${esc(generatedVersion)}】支持以下功能集配置；请直接选择对应版本后提交。</div><div class="capability-list">${capabilityCards}</div>${errorFor("capabilities")}` : ""}</div><div class="drawer-section"><div class="form-field"><label>说明</label><textarea class="textarea" name="note" data-version-draft="note" maxlength="200" placeholder="请输入当前固件版本优化的功能说明信息">${esc(formDraft.note)}</textarea><div class="helper align-right">${formDraft.note.length} / 200</div></div></div><div class="drawer-section"><div class="section-bar"><h3>关联功能</h3><button class="btn primary small" type="button" data-action="add-associated-feature">＋ 添加功能</button></div><div class="table-wrap"><table class="data-table associated-table"><thead><tr><th>功能项名称</th><th>功能示意图</th><th>操作</th></tr></thead><tbody>${associatedFeatures.map((feature, index) => `<tr><td>${esc(feature.name)}</td><td><span class="feature-image-placeholder">${esc(feature.imageLabel || "功能")}</span></td><td><button class="link-btn danger-link" type="button" data-action="remove-associated-feature" data-feature-index="${index}">删除</button></td></tr>`).join("")}</tbody></table></div>${associatedFeatures.length ? "" : `<div class="empty-state compact-empty"><div><div class="empty-illustration">▤</div>暂无数据</div></div>`}</div></form>`, `<button class="btn" data-action="close-overlay">取消</button><button class="btn primary" type="submit" form="version-form" ${configurable ? "" : "disabled"}>${editing ? "保存" : "完成"}</button>`);
  }

  function renderVersionDetail(version) {
    const tab = state.drawer.tab || "features";
    const featureConfigs = version.featureConfigs || [];
    const associatedFeatures = version.associatedFeatures || [];
    let tabContent = "";
    if (tab === "features") tabContent = featureConfigs.length ? `<div class="table-wrap detail-table-wrap"><table class="data-table detail-content-table feature-config-table"><thead><tr><th>功能集名称</th><th>功能集类型</th><th>版本号</th><th>版本说明</th></tr></thead><tbody>${featureConfigs.map(config => `<tr><td>${esc(config.name)}</td><td>${esc(config.label)}</td><td>${esc(config.version)}</td><td>${esc(config.description)}</td></tr>`).join("")}</tbody></table></div>` : `<div class="empty-state compact-empty"><div><div class="empty-illustration">▤</div>暂无功能集配置</div></div>`;
    if (tab === "related") tabContent = associatedFeatures.length ? `<div class="table-wrap detail-table-wrap"><table class="data-table detail-content-table"><thead><tr><th>功能项名称</th><th>功能示意图</th></tr></thead><tbody>${associatedFeatures.map(feature => `<tr><td>${esc(feature.name)}</td><td><span class="feature-image-placeholder">${esc(feature.imageLabel || "功能")}</span></td></tr>`).join("")}</tbody></table></div>` : `<div class="empty-state compact-empty"><div><div class="empty-illustration">▤</div>暂无数据</div></div>`;
    if (tab === "approvals") {
      const rows = db.approvals.filter(item => item.version === version.version);
      tabContent = rows.length ? `<div class="approval-timeline">${rows.map(row => `<article class="approval-card"><div class="approval-card-head"><div><strong>发布审批</strong><span>${esc(row.submitTime)}</span></div><span class="tag ${row.status === "审批通过" ? "success" : "warning"}">${esc(row.status === "审批通过" ? "已通过" : row.status === "审批过期" ? "已过期" : row.status)}</span></div><div class="approval-meta"><span>提交人<strong>${esc(row.submitter)}</strong></span><span>提交时间<strong>${esc(row.submitTime)}</strong></span><span>审批人<strong>${esc(row.approver)}</strong></span><span>审批时间<strong>${esc(row.approveTime)}</strong></span><span>说明<strong>${esc(row.note)}</strong></span></div></article>`).join("")}</div>` : `<div class="empty-state" style="min-height:180px"><div><div class="empty-illustration">▤</div>暂无审批记录</div></div>`;
    }
    return drawerFrame("固件版本详情", `<div class="detail-hero"><h3>${esc(version.version)} ${version.latest ? `<span class="tag success">最新</span>` : ""}</h3><div class="detail-note"><span>说明</span><strong>${esc(version.note)}</strong></div><div class="detail-stats four"><div class="detail-stat"><span>适用机型</span><strong>${esc(version.models)}</strong></div><div class="detail-stat"><span>APP提醒方式</span><strong>${esc(version.reminder || "不提醒")}</strong></div><div class="detail-stat"><span>功能集</span><strong>${featureConfigs.length} 项</strong></div><div class="detail-stat"><span>发布时间</span><strong>${esc(version.published || version.updated)}</strong></div></div></div><div class="drawer-section detail-basic-section"><h3>基础信息</h3><table class="info-list detail-info-list"><tr><td>固件版本号</td><td>${esc(version.version)}</td></tr><tr><td>固件标识</td><td>${esc(activeIdentifier().id)}</td></tr><tr><td>文件大小</td><td>${esc(version.size)} M</td></tr><tr><td>固件包下载地址</td><td><div class="detail-url"><span>${esc(version.url)}</span><button class="link-btn" title="复制下载地址" data-action="copy" data-copy="${esc(version.url)}">▣</button></div></td></tr><tr><td>创建时间</td><td>${esc(version.updated)}</td></tr><tr><td>创建人</td><td>${esc(version.creator)}</td></tr></table></div><div class="tab-strip detail-tabs"><button class="tab ${tab === "features" ? "active" : ""}" data-action="detail-tab" data-tab="features">功能集配置</button><button class="tab ${tab === "related" ? "active" : ""}" data-action="detail-tab" data-tab="related">关联功能</button><button class="tab ${tab === "approvals" ? "active" : ""}" data-action="detail-tab" data-tab="approvals">审批日志</button></div><div class="detail-tab-content">${tabContent}</div>`);
  }

  function renderUserDetail(user) {
    const changeLogs = user.changeLogs || [];
    return drawerFrame("用户详情", `<div class="detail-hero"><h3>${esc(user.name)}　<span class="tag blue">${esc(user.role)}</span></h3></div><div class="drawer-section"><h3>所属产线</h3><div class="table-wrap"><table class="data-table detail-content-table"><thead><tr><th>产线</th><th>是否审批人</th></tr></thead><tbody>${user.lines.map(line => `<tr><td>${esc(line)}</td><td><label class="toggle"><input type="checkbox" ${user.approverLines.includes(line) ? "checked" : ""} disabled><span></span></label></td></tr>`).join("")}</tbody></table></div></div><div class="form-grid" style="margin-top:20px"><div class="form-field"><label>创建时间</label><strong>${esc(user.created)}</strong></div><div class="form-field"><label>备注</label><strong>${esc(user.note || "-")}</strong></div></div><div class="drawer-section"><h3>权限范围</h3>${renderPermissionTable(db.roles.find(role => role.name === user.role) || db.roles[0], false, "detail")}</div><div class="drawer-section"><h3>变更日志</h3><div class="table-wrap"><table class="data-table detail-content-table"><thead><tr><th>变更时间</th><th>变更人</th><th>变更动作</th><th>变更内容</th></tr></thead><tbody>${changeLogs.map(log => `<tr><td>${esc(log.time)}</td><td>${esc(log.operator)}</td><td>${esc(log.action)}</td><td>${esc(log.content)}</td></tr>`).join("")}</tbody></table></div>${changeLogs.length ? "" : `<div class="empty-state compact-empty"><div><div class="empty-illustration">▤</div>暂无数据</div></div>`}</div>`);
  }

  function renderUserPermissions(user) {
    const draft = state.drawer.userDraft || { lines: [...user.lines], approverLines: [...user.approverLines], note: user.note, role: user.role };
    const selectedRole = db.roles.find(role => role.name === draft.role) || db.roles[0];
    return drawerFrame("权限配置", `<form id="user-permissions-form"><div class="drawer-section" style="margin-top:0"><h3>基本信息</h3><div class="form-grid single"><div class="form-field required"><label>账号名称</label><input class="field" value="${esc(user.name)}" disabled placeholder="请输入账号名称"></div><div class="form-field required"><label>所属产线</label><div class="check-grid line-tags">${productLines.map(line => `<label class="check"><input type="checkbox" data-user-line="${esc(line)}" ${draft.lines.includes(line) ? "checked" : ""}>${esc(line)}</label>`).join("")}</div><div class="table-wrap"><table class="data-table detail-content-table"><thead><tr><th>产线</th><th>是否审批人</th></tr></thead><tbody>${draft.lines.map(line => `<tr><td>${esc(line)}</td><td><label class="toggle"><input type="checkbox" data-approver-line="${esc(line)}" ${draft.approverLines.includes(line) ? "checked" : ""}><span></span></label></td></tr>`).join("")}</tbody></table></div></div><div class="form-field"><label>备注</label><textarea class="textarea" data-user-note maxlength="200" placeholder="请输入备注说明信息，例如成员职责">${esc(draft.note)}</textarea><div class="helper align-right">${draft.note.length} / 200</div></div><div class="form-field required"><label>关联角色</label><select class="select" name="role" data-change="permission-role">${db.roles.map(role => `<option ${role.name === selectedRole.name ? "selected" : ""}>${esc(role.name)}</option>`).join("")}</select></div></div></div><div class="drawer-section"><h3>角色权限预览</h3>${renderPermissionTable(selectedRole, false, "user")}</div></form>`, `<button class="btn" data-action="close-overlay">取 消</button><button class="btn primary" type="submit" form="user-permissions-form">完 成</button>`);
  }

  function closeOverlay() {
    state.modal = null;
    state.drawer = null;
    state.popover = null;
    state.errors = {};
    state.upload = null;
    renderShell();
  }

  function navigate(route) {
    if (!routes[route]) return;
    state.profileOpen = false;
    state.popover = null;
    state.groups[routes[route].group] = true;
    document.body.classList.remove("nav-open");
    if (location.hash !== `#/${route}`) location.hash = `#/${route}`;
    else {
      state.route = route;
      renderShell();
    }
  }

  function cascadePermission(key, checked) {
    if (!state.tempPermissions) state.tempPermissions = clone(activeRole().permissions || {});
    state.tempPermissions[key] = checked;
    if (key.startsWith("menu-")) {
      const menu = key.slice(5);
      permissionRows.filter(row => row.menu === menu).forEach(row => {
        if (row.page) state.tempPermissions[`page-${row.page}`] = checked;
        row.actions.forEach(action => { state.tempPermissions[`action-${action}`] = checked; });
      });
    }
    if (key.startsWith("page-")) {
      const page = key.slice(5);
      const row = permissionRows.find(item => item.page === page);
      row?.actions.forEach(action => { state.tempPermissions[`action-${action}`] = checked; });
      if (checked && row) state.tempPermissions[`menu-${row.menu}`] = true;
      if (!checked && row) syncMenuPermission(row.menu);
    }
    if (checked && key.startsWith("action-")) {
      const action = key.slice(7);
      const row = permissionRows.find(item => item.actions.includes(action));
      if (row) {
        state.tempPermissions[`page-${row.page}`] = true;
        state.tempPermissions[`menu-${row.menu}`] = true;
      }
    }
    if (!checked && key.startsWith("action-")) {
      const action = key.slice(7);
      const row = permissionRows.find(item => item.actions.includes(action));
      if (row && row.actions.every(item => state.tempPermissions[`action-${item}`] === false)) {
        if (row.page) state.tempPermissions[`page-${row.page}`] = false;
        else state.tempPermissions[`menu-${row.menu}`] = false;
      }
      if (row) syncMenuPermission(row.menu);
    }
  }

  function syncMenuPermission(menu) {
    const rows = permissionRows.filter(row => row.menu === menu);
    const hasChildren = rows.some(row => row.page || row.actions.length);
    if (!hasChildren) return;
    const hasEnabledChild = rows.some(row =>
      (row.page && state.tempPermissions[`page-${row.page}`] !== false) ||
      row.actions.some(action => state.tempPermissions[`action-${action}`] !== false)
    );
    state.tempPermissions[`menu-${menu}`] = hasEnabledChild;
  }

  app.addEventListener("click", async event => {
    if (state.profileOpen && !event.target.closest(".profile-menu") && !event.target.closest(".profile-trigger")) {
      state.profileOpen = false;
      app.querySelector(".profile-menu")?.remove();
    }
    const routeButton = event.target.closest("[data-route]");
    if (routeButton) {
      navigate(routeButton.dataset.route);
      return;
    }
    const target = event.target.closest("[data-action]");
    if (!target) {
      if (state.popover && !event.target.closest(".action-popover")) {
        state.popover = null;
        renderShell();
      }
      return;
    }
    const action = target.dataset.action;
    const popoverToggles = ["identifier-actions", "density-menu", "column-settings", "role-more", "user-line-filter", "role-user-line-filter"];
    if (state.popover && !popoverToggles.includes(action) && !event.target.closest(".action-popover")) state.popover = null;

    if (action === "toggle-nav") {
      document.body.classList.toggle("nav-open");
      return;
    }
    if (action === "login") {
      state.loggedOut = false;
      renderShell();
      return;
    }
    if (action === "toggle-group") {
      state.groups[target.dataset.group] = !state.groups[target.dataset.group];
      renderShell();
      return;
    }
    if (action === "close-modal") {
      state.modal = null;
      state.errors = {};
      renderShell();
      return;
    }
    if (action === "toggle-profile") {
      state.profileOpen = !state.profileOpen;
      renderShell();
      return;
    }
    if (action === "profile") {
      state.profileOpen = false;
      state.modal = { type: "profile" };
      renderShell();
      return;
    }
    if (action === "logout") {
      state.profileOpen = false;
      state.modal = { type: "logout" };
      renderShell();
      return;
    }
    if (action === "confirm-logout") {
      state.modal = null;
      state.drawer = null;
      state.loggedOut = true;
      renderShell();
      return;
    }
    if (action === "overlay-close" || action === "close-overlay") {
      closeOverlay();
      return;
    }
    if (action === "select-identifier") {
      state.selectedIdentifier = target.dataset.id;
      state.firmwarePage = 1;
      state.popover = null;
      renderShell();
      return;
    }
    if (action === "add-identifier") {
      state.errors = {};
      state.modal = { type: "addIdentifier", draft: { id: "", product: state.filters.product || "IPC", models: "" } };
      renderShell();
      return;
    }
    if (action === "identifier-actions") {
      state.popover = state.popover === "identifier" ? null : "identifier";
      renderShell();
      return;
    }
    if (action === "edit-identifier") {
      state.popover = null;
      state.modal = { type: "editIdentifier" };
      renderShell();
      return;
    }
    if (action === "delete-identifier") {
      state.popover = null;
      state.modal = { type: "deleteIdentifier" };
      renderShell();
      return;
    }
    if (action === "confirm-delete-identifier") {
      if (db.identifiers.length <= 1) {
        closeOverlay();
        toast("至少保留一个固件标识", "warning");
        return;
      }
      const id = activeIdentifier().id;
      const linkedModules = db.modules.filter(module => module.linkedIdentifiers.includes(id));
      if (linkedModules.length) {
        closeOverlay();
        toast(`该固件标识仍关联模组 ${linkedModules.map(module => module.model).join("、")}，请先解除关联`, "warning");
        return;
      }
      db.identifiers = db.identifiers.filter(item => item.id !== id);
      const remainingInProduct = db.identifiers.find(item => item.product === state.filters.product);
      const replacement = remainingInProduct || db.identifiers[0];
      state.selectedIdentifier = replacement.id;
      state.filters.product = replacement.product;
      state.firmwarePage = 1;
      addOperation("固件标识", "删除", id);
      persist();
      closeOverlay();
      toast(`已删除固件标识 ${id}`);
      return;
    }
    if (action === "refresh") {
      renderShell();
      toast("固件数据已刷新");
      return;
    }
    if (action === "add-version") {
      state.upload = null;
      state.errors = {};
      state.drawer = { type: "addVersion", formDraft: { version: "", models: "", note: "" }, capabilitySelections: {}, associatedFeatures: [] };
      renderShell();
      return;
    }
    if (action === "edit-version") {
      const version = findVersion(target.dataset.version);
      state.errors = {};
      state.drawer = {
        type: "editVersion",
        version: target.dataset.version,
        formDraft: { version: version.version, models: version.models, note: version.note === "-" ? "" : version.note },
        capabilitySelections: Object.fromEntries((version.featureConfigs || []).map(config => [config.key, config.value])),
        associatedFeatures: clone(version.associatedFeatures || [])
      };
      renderShell();
      return;
    }
    if (action === "version-detail") {
      state.drawer = { type: "versionDetail", version: target.dataset.version, tab: "features" };
      renderShell();
      return;
    }
    if (action === "detail-tab") {
      state.drawer.tab = target.dataset.tab;
      renderShell();
      return;
    }
    if (action === "publish-version") {
      state.modal = { type: "publish", version: target.dataset.version };
      renderShell();
      return;
    }
    if (action === "confirm-publish") {
      const identifier = activeIdentifier();
      const version = identifier.versions.find(item => item.version === state.modal.version);
      identifier.versions.forEach(item => { item.latest = item === version; });
      version.reminder = document.getElementById("publish-reminder")?.value || "不提醒";
      const stamp = now();
      version.published = stamp;
      db.approvals.unshift({ version: version.version, event: "发布最新固件版本", submitter: "汤彦珊", submitTime: stamp, approver: "系统自动审批", status: "审批通过", approveTime: stamp, note: "-" });
      addOperation("固件申请", "发布", version.version);
      persist();
      closeOverlay();
      toast(`${version.version} 已发布为最新版本`);
      return;
    }
    if (action === "delete-version") {
      state.modal = { type: "deleteVersion", version: target.dataset.version };
      renderShell();
      return;
    }
    if (action === "confirm-delete-version") {
      const identifier = activeIdentifier();
      const version = state.modal.version;
      if (identifier.versions.find(item => item.version === version)?.latest) {
        closeOverlay();
        toast("最新发布版本不能删除，请先发布其他版本", "warning");
        return;
      }
      identifier.versions = identifier.versions.filter(item => item.version !== version);
      state.firmwarePage = clampPage(identifier.versions.length, state.pageSizes.firmware, state.firmwarePage);
      addOperation("固件版本", "删除", version);
      persist();
      closeOverlay();
      toast(`已删除固件版本 ${version}`);
      return;
    }
    if (action === "density-menu") {
      state.popover = state.popover === "density" ? null : "density";
      renderShell();
      return;
    }
    if (action === "set-density") {
      state.density = target.dataset.density;
      state.popover = null;
      renderShell();
      return;
    }
    if (action === "column-settings") {
      state.popover = state.popover === "columns" ? null : "columns";
      renderShell();
      return;
    }
    if (action === "copy") {
      try {
        await navigator.clipboard.writeText(target.dataset.copy);
      } catch (_error) {
        const temp = document.createElement("textarea");
        temp.value = target.dataset.copy;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand("copy");
        temp.remove();
      }
      toast("下载地址已复制");
      return;
    }
    if (action === "capability-help") {
      state.drawer.capabilityHelp = state.drawer.capabilityHelp === target.dataset.capability ? null : target.dataset.capability;
      renderShell();
      return;
    }
    if (action === "add-associated-feature") {
      state.modal = { type: "featurePicker", query: "", selectedIds: state.drawer.associatedFeatures.map(feature => feature.id) };
      renderShell();
      return;
    }
    if (action === "toggle-all-features") {
      const query = String(state.modal.query || "").trim().toLowerCase();
      const ids = availableAssociatedFeatures().filter(feature => !query || feature.name.toLowerCase().includes(query)).map(feature => feature.id);
      const allSelected = ids.every(id => state.modal.selectedIds.includes(id));
      state.modal.selectedIds = allSelected ? state.modal.selectedIds.filter(id => !ids.includes(id)) : [...new Set([...state.modal.selectedIds, ...ids])];
      renderShell();
      return;
    }
    if (action === "unselect-feature") {
      state.modal.selectedIds = state.modal.selectedIds.filter(id => id !== target.dataset.featureId);
      renderShell();
      return;
    }
    if (action === "confirm-feature-picker") {
      state.drawer.associatedFeatures = availableAssociatedFeatures().filter(feature => state.modal.selectedIds.includes(feature.id)).map(feature => clone(feature));
      state.modal = null;
      renderShell();
      return;
    }
    if (action === "remove-associated-feature") {
      state.drawer.associatedFeatures.splice(Number(target.dataset.featureIndex), 1);
      renderShell();
      return;
    }
    if (action === "module-firmware") {
      state.modal = { type: "moduleFirmware", model: target.dataset.model };
      renderShell();
      return;
    }
    if (action === "query-operations") {
      const start = state.draftFilters.operationStart ?? state.filters.operationStart;
      const end = state.draftFilters.operationEnd ?? state.filters.operationEnd;
      if (start && end && start > end) {
        toast("开始日期不能晚于结束日期", "warning");
        return;
      }
      state.filters.operation = state.draftFilters.operation || "";
      state.filters.operationStart = start;
      state.filters.operationEnd = end;
      state.operationPage = 1;
      renderShell();
      return;
    }
    if (action === "reset-operations") {
      state.filters.operation = "";
      state.filters.operationStart = "2026-07-08";
      state.filters.operationEnd = "2026-07-15";
      delete state.draftFilters.operation;
      delete state.draftFilters.operationStart;
      delete state.draftFilters.operationEnd;
      state.operationPage = 1;
      renderShell();
      return;
    }
    if (action === "query-approvals") {
      const start = state.draftFilters.approvalStart ?? state.filters.approvalStart;
      const end = state.draftFilters.approvalEnd ?? state.filters.approvalEnd;
      if (start && end && start > end) {
        toast("开始日期不能晚于结束日期", "warning");
        return;
      }
      state.filters.approval = state.draftFilters.approval || "";
      state.filters.approvalStart = start;
      state.filters.approvalEnd = end;
      state.approvalPage = 1;
      renderShell();
      return;
    }
    if (action === "reset-approvals") {
      state.filters.approval = "";
      state.filters.approvalStart = "2026-07-08";
      state.filters.approvalEnd = "2026-07-15";
      delete state.draftFilters.approval;
      delete state.draftFilters.approvalStart;
      delete state.draftFilters.approvalEnd;
      state.approvalPage = 1;
      renderShell();
      return;
    }
    if (action === "query-users") {
      state.filters.user = state.draftFilters.user || "";
      state.userPage = 1;
      renderShell();
      return;
    }
    if (action === "reset-users") {
      state.filters.user = "";
      state.filters.userLines = [];
      state.draftFilters.user = "";
      state.userLineDraft = [];
      state.userPage = 1;
      renderShell();
      return;
    }
    if (action === "user-line-filter") {
      state.userLineDraft = [...(state.filters.userLines || [])];
      state.popover = state.popover === "userLine" ? null : "userLine";
      renderShell();
      return;
    }
    if (action === "apply-user-line-filter") {
      state.filters.userLines = [...(state.userLineDraft || [])];
      state.userPage = 1;
      state.popover = null;
      renderShell();
      return;
    }
    if (action === "reset-user-line-filter") {
      state.userLineDraft = [];
      state.filters.userLines = [];
      state.userPage = 1;
      state.popover = null;
      renderShell();
      return;
    }
    if (["firmware-page", "module-page", "operation-page", "approval-page", "user-page"].includes(action)) {
      const key = { "firmware-page": "firmwarePage", "module-page": "modulePage", "operation-page": "operationPage", "approval-page": "approvalPage", "user-page": "userPage" }[action];
      state[key] = Number(target.dataset.page);
      renderShell();
      return;
    }
    if (action === "user-detail") {
      state.drawer = { type: "userDetail", userIndex: Number(target.dataset.userIndex) };
      renderShell();
      return;
    }
    if (action === "user-permissions") {
      const userIndex = Number(target.dataset.userIndex);
      const user = db.users[userIndex];
      state.drawer = { type: "userPermissions", userIndex, userDraft: { lines: [...user.lines], approverLines: [...user.approverLines], note: user.note, role: user.role } };
      renderShell();
      return;
    }
    if (action === "select-role") {
      state.selectedRole = target.dataset.role;
      state.roleEditing = false;
      state.tempPermissions = null;
      state.popover = null;
      state.filters.roleUserLines = [];
      state.roleUserLineDraft = [];
      renderShell();
      return;
    }
    if (action === "role-tab") {
      state.roleTab = target.dataset.tab;
      state.roleEditing = false;
      state.tempPermissions = null;
      state.popover = null;
      renderShell();
      return;
    }
    if (action === "role-user-line-filter") {
      state.roleUserLineDraft = [...(state.filters.roleUserLines || [])];
      state.popover = state.popover === "roleUserLine" ? null : "roleUserLine";
      renderShell();
      return;
    }
    if (action === "apply-role-user-line-filter") {
      state.filters.roleUserLines = [...(state.roleUserLineDraft || [])];
      state.popover = null;
      renderShell();
      return;
    }
    if (action === "reset-role-user-line-filter") {
      state.roleUserLineDraft = [];
      state.filters.roleUserLines = [];
      state.popover = null;
      renderShell();
      return;
    }
    if (action === "toggle-role-edit") {
      state.roleEditing = !state.roleEditing;
      state.tempPermissions = state.roleEditing ? clone(activeRole().permissions || {}) : null;
      renderShell();
      return;
    }
    if (action === "save-role-permissions") {
      activeRole().permissions = clone(state.tempPermissions || {});
      state.roleEditing = false;
      state.tempPermissions = null;
      addOperation("角色权限", "更新", activeRole().name);
      persist();
      renderShell();
      toast("角色权限已保存");
      return;
    }
    if (action === "add-role") {
      state.errors = {};
      state.modal = { type: "addRole", draft: { name: "", code: "", note: "" } };
      renderShell();
      return;
    }
    if (action === "role-more") {
      state.popover = state.popover === "role" ? null : "role";
      renderShell();
      return;
    }
    if (action === "edit-role") {
      state.popover = null;
      state.errors = {};
      const role = activeRole();
      state.modal = { type: "editRole", draft: { name: role.name, code: role.code, note: role.note === "-" ? "" : role.note } };
      renderShell();
      return;
    }
    if (action === "delete-role") {
      state.popover = null;
      state.modal = { type: "deleteRole" };
      renderShell();
      return;
    }
    if (action === "confirm-delete-role") {
      const role = activeRole();
      const associated = db.users.filter(user => user.role === role.name);
      if (associated.length) {
        closeOverlay();
        toast(`该角色仍关联 ${associated.length} 名用户，请先调整用户角色`, "warning");
        return;
      }
      db.roles = db.roles.filter(item => item.name !== role.name);
      state.selectedRole = db.roles[0].name;
      addOperation("角色权限", "删除", role.name);
      persist();
      closeOverlay();
      toast(`已删除角色 ${role.name}`);
    }
  });

  app.addEventListener("input", event => {
    const filter = event.target.dataset.filter;
    const draft = event.target.dataset.draft;
    const versionDraft = event.target.dataset.versionDraft;
    const modalDraft = event.target.dataset.modalDraft;
    if (filter) state.filters[filter] = event.target.value;
    if (draft) state.draftFilters[draft] = event.target.value;
    if (versionDraft && state.drawer?.formDraft) state.drawer.formDraft[versionDraft] = event.target.value;
    if (modalDraft && state.modal?.draft) state.modal.draft[modalDraft] = event.target.value;
    if (event.target.matches("[data-feature-search]") && state.modal?.type === "featurePicker") state.modal.query = event.target.value;
    if (event.target.matches("[data-user-note]") && state.drawer?.userDraft) state.drawer.userDraft.note = event.target.value;
  });

  app.addEventListener("change", event => {
    const target = event.target;
    if (target.dataset.change === "product-filter") {
      state.filters.product = target.value;
      syncSelectedIdentifierToFilters();
      renderShell();
      return;
    }
    if (target.dataset.column) {
      state.columns[target.dataset.column] = target.checked;
      renderShell();
      return;
    }
    if (target.dataset.pageSize) {
      const key = target.dataset.pageSize;
      state.pageSizes[key] = Number(target.value);
      const pageKey = { firmware: "firmwarePage", modules: "modulePage", operations: "operationPage", approvals: "approvalPage", users: "userPage" }[key];
      state[pageKey] = 1;
      renderShell();
      return;
    }
    if (target.dataset.modalDraft && state.modal?.draft) {
      state.modal.draft[target.dataset.modalDraft] = target.value;
      return;
    }
    if (target.dataset.permission && target.dataset.prefix === "role") {
      cascadePermission(target.dataset.permission, target.checked);
      renderShell();
      return;
    }
    if (target.name?.startsWith("capability-") && state.drawer) {
      const key = target.name.slice("capability-".length);
      state.drawer.capabilitySelections[key] = target.value;
      return;
    }
    if (target.dataset.featureChoice && state.modal?.type === "featurePicker") {
      const id = target.dataset.featureChoice;
      state.modal.selectedIds = target.checked ? [...new Set([...state.modal.selectedIds, id])] : state.modal.selectedIds.filter(item => item !== id);
      renderShell();
      return;
    }
    if (target.dataset.userLine && state.drawer?.userDraft) {
      const line = target.dataset.userLine;
      state.drawer.userDraft.lines = target.checked ? [...state.drawer.userDraft.lines, line] : state.drawer.userDraft.lines.filter(item => item !== line);
      state.drawer.userDraft.approverLines = state.drawer.userDraft.approverLines.filter(item => state.drawer.userDraft.lines.includes(item));
      renderShell();
      return;
    }
    if (target.dataset.userLineFilter) {
      const line = target.dataset.userLineFilter;
      state.userLineDraft = target.checked ? [...new Set([...(state.userLineDraft || []), line])] : (state.userLineDraft || []).filter(item => item !== line);
      return;
    }
    if (target.dataset.roleUserLineFilter) {
      const line = target.dataset.roleUserLineFilter;
      state.roleUserLineDraft = target.checked ? [...new Set([...(state.roleUserLineDraft || []), line])] : (state.roleUserLineDraft || []).filter(item => item !== line);
      return;
    }
    if (target.dataset.approverLine && state.drawer?.userDraft) {
      const line = target.dataset.approverLine;
      state.drawer.userDraft.approverLines = target.checked ? [...new Set([...state.drawer.userDraft.approverLines, line])] : state.drawer.userDraft.approverLines.filter(item => item !== line);
      return;
    }
    if (target.dataset.change === "permission-role" && state.drawer?.userDraft) {
      state.drawer.userDraft.role = target.value;
      renderShell();
      return;
    }
    if (target.id === "firmware-file") {
      const file = target.files?.[0];
      if (!file) return;
      const allowed = /\.(bin|binpkg)$/i.test(file.name);
      if (!allowed) {
        state.errors.file = "仅支持 .bin 或 .binpkg 文件";
        renderShell();
        return;
      }
      const matched = file.name.match(/(\d+\.\d+\.\d+\.\d+)/);
      if (matched && matched[1].split(".").slice(0, 3).join(".") !== activeIdentifier().id) {
        state.errors.file = `固件包版本号与当前固件标识 ${activeIdentifier().id} 不一致`;
        state.upload = null;
        renderShell();
        return;
      }
      if (!file.size) {
        state.errors.file = "固件包内容为空，请重新选择文件";
        renderShell();
        return;
      }
      const suffix = String(Date.now()).slice(-2);
      const version = matched?.[1] || `${activeIdentifier().id}.${suffix}`;
      let hash = 0;
      for (const char of `${file.name}-${file.size}-${file.lastModified}`) hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0;
      const md5 = Math.abs(hash).toString(16).padStart(8, "0").repeat(4).slice(0, 32);
      state.upload = { name: file.name, size: (file.size / 1024 / 1024).toFixed(2), version, md5 };
      state.drawer.formDraft.version = version;
      state.drawer.capabilitySelections = Object.fromEntries(featureCatalog.map(item => [item.key, item.options[0].value]));
      delete state.errors.file;
      renderShell();
      return;
    }
  });

  app.addEventListener("keydown", event => {
    if (event.key !== "Enter" || event.target.tagName === "TEXTAREA") return;
    if (event.target.dataset.filter) {
      event.preventDefault();
      if (event.target.dataset.filter === "module") state.modulePage = 1;
      if (event.target.dataset.filter === "firmware") {
        state.firmwarePage = 1;
        syncSelectedIdentifierToFilters();
      }
      renderShell();
    }
    if (event.target.dataset.draft) {
      event.preventDefault();
      const action = state.route === "operations" ? "query-operations" : state.route === "approvals" ? "query-approvals" : "query-users";
      app.querySelector(`[data-action="${action}"]`)?.click();
    }
    if (event.target.dataset.pageJump) {
      event.preventDefault();
      const page = Math.min(Number(event.target.dataset.maxPage), Math.max(1, Number(event.target.value) || 1));
      const key = { "firmware-page": "firmwarePage", "module-page": "modulePage", "operation-page": "operationPage", "approval-page": "approvalPage", "user-page": "userPage" }[event.target.dataset.pageAction];
      state[key] = page;
      renderShell();
    }
    if (event.target.matches("[data-feature-search]")) {
      event.preventDefault();
      renderShell();
    }
  });

  app.addEventListener("submit", event => {
    event.preventDefault();
    const form = event.target;
    const values = new FormData(form);
    state.errors = {};

    if (form.id === "add-identifier-form") {
      const id = String(values.get("id") || "").trim();
      const product = String(values.get("product") || "IPC");
      const models = String(values.get("models") || "").trim();
      state.modal.draft = { id, product, models };
      if (!/^\d+\.\d+\.\d+$/.test(id)) state.errors.id = "请输入三个数字段组成的固件标识，例如 23.110.211";
      if (db.identifiers.some(item => item.id === id)) state.errors.id = "该固件标识已存在";
      if (!models) state.errors.models = "请输入关联机型";
      if (Object.keys(state.errors).length) { renderShell(); return; }
      db.identifiers.unshift({ id, product, created: now(), models, network: "仅4G", power: "常电", architecture: "新架构", versions: [] });
      state.selectedIdentifier = id;
      state.filters.product = product;
      addOperation("固件标识", "新增", id);
      persist();
      closeOverlay();
      toast(`固件标识 ${id} 已创建`);
      return;
    }

    if (form.id === "edit-identifier-form") {
      const item = activeIdentifier();
      item.product = values.get("product");
      item.network = values.get("network");
      item.power = values.get("power");
      item.architecture = values.get("architecture");
      state.filters.product = item.product;
      addOperation("固件标识", "编辑", item.id);
      persist();
      closeOverlay();
      toast("固件标识信息已更新");
      return;
    }

    if (form.id === "version-form") {
      const editing = values.get("mode") === "edit";
      const identifier = activeIdentifier();
      const oldVersion = editing ? findVersion(state.drawer.version) : null;
      const versionName = String(values.get("version") || "").trim();
      const models = String(values.get("models") || "").trim();
      const featureConfigs = featureCatalog.map(item => {
        const optionValue = String(values.get(`capability-${item.key}`) || state.drawer.capabilitySelections?.[item.key] || "");
        return optionValue ? configFromCatalog(item, optionValue) : null;
      });
      if (!editing && !state.upload) state.errors.file = "请先上传固件包";
      if (!versionName) state.errors.version = "缺少固件版本号";
      if (!models) state.errors.models = "请输入适用机型";
      if (!editing && identifier.versions.some(item => item.version === versionName)) state.errors.version = "该版本号已存在";
      if (editing && identifier.versions.some(item => item !== oldVersion && item.version === versionName)) state.errors.version = "该版本号已存在";
      if (featureConfigs.some(config => !config)) state.errors.capabilities = "请完成全部功能集能力配置";
      if (Object.keys(state.errors).length) { renderShell(); return; }
      if (editing) {
        oldVersion.version = versionName;
        oldVersion.models = models;
        oldVersion.note = String(values.get("note") || "-").trim() || "-";
        oldVersion.featureConfigs = featureConfigs;
        oldVersion.associatedFeatures = clone(state.drawer.associatedFeatures || []);
        oldVersion.features = featureConfigs.length;
        oldVersion.updated = now();
        addOperation("固件版本", "编辑", versionName);
      } else {
        identifier.versions.unshift({ version: versionName, url: `http://doraemon.camera666.com/${state.upload.name}`, size: state.upload.size, md5: state.upload.md5, models, features: featureConfigs.length, featureConfigs, associatedFeatures: clone(state.drawer.associatedFeatures || []), creator: "汤彦珊", note: String(values.get("note") || "-").trim() || "-", updated: now(), latest: false, reminder: "不提醒" });
        addOperation("固件版本", "新增", versionName);
      }
      persist();
      closeOverlay();
      toast(editing ? "固件版本已更新" : `固件版本 ${versionName} 已新增`);
      return;
    }

    if (form.id === "user-permissions-form") {
      const user = db.users[state.drawer.userIndex];
      const draft = state.drawer.userDraft;
      const lines = draft.lines;
      if (!lines.length) { toast("请至少选择一条所属产线", "warning"); return; }
      const approverLines = draft.approverLines.filter(line => lines.includes(line));
      const note = String(draft.note || "").trim();
      const changes = [];
      if (!sameValues(user.lines, lines)) changes.push(`所属产线：${user.lines.join(" / ") || "无"} → ${lines.join(" / ")}`);
      if (!sameValues(user.approverLines, approverLines)) changes.push(`审批产线：${user.approverLines.join(" / ") || "无"} → ${approverLines.join(" / ") || "无"}`);
      if (user.role !== draft.role) changes.push(`关联角色：${user.role} → ${draft.role}`);
      if ((user.note || "") !== note) changes.push(`备注：${user.note || "无"} → ${note || "无"}`);
      user.lines = [...lines];
      user.approverLines = approverLines;
      user.note = note;
      user.role = draft.role;
      if (changes.length) {
        user.changeLogs.unshift({ time: now(), operator: "汤彦珊", action: "更新权限", content: changes.join("；") });
      }
      state.userPage = 1;
      if (changes.length) addOperation("用户权限", "更新", user.name);
      persist();
      closeOverlay();
      toast(changes.length ? `${user.name} 的权限配置已保存` : "未检测到权限配置变更", changes.length ? "success" : "warning");
      return;
    }

    if (form.id === "add-role-form") {
      const name = String(values.get("name") || "").trim();
      const code = String(values.get("code") || "").trim();
      const note = String(values.get("note") || "").trim();
      state.modal.draft = { name, code, note };
      if (!name) state.errors.roleName = "请输入角色名称";
      if (db.roles.some(role => role.name === name)) state.errors.roleName = "角色名称已存在";
      if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(code)) state.errors.roleCode = "请输入以字母开头的英文编码，可包含数字和下划线";
      if (db.roles.some(role => role.code.toLowerCase() === code.toLowerCase())) state.errors.roleCode = "角色编码已存在";
      if (Object.keys(state.errors).length) { renderShell(); return; }
      db.roles.push({ name, code, users: 0, created: now(), note: note || "-", permissions: emptyPermissions() });
      state.selectedRole = name;
      addOperation("角色权限", "新增", name);
      persist();
      closeOverlay();
      toast(`角色 ${name} 已创建`);
      return;
    }

    if (form.id === "edit-role-form") {
      const role = activeRole();
      const oldName = role.name;
      const name = String(values.get("name") || "").trim();
      const note = String(values.get("note") || "").trim();
      state.modal.draft = { name, code: role.code, note };
      if (!name) state.errors.roleName = "请输入角色名称";
      if (db.roles.some(item => item !== role && item.name === name)) state.errors.roleName = "角色名称已存在";
      if (Object.keys(state.errors).length) { renderShell(); return; }
      role.name = name;
      role.note = note || "-";
      db.users.forEach(user => {
        if (user.role !== oldName) return;
        user.role = name;
        user.changeLogs.unshift({ time: now(), operator: "汤彦珊", action: "角色更新", content: `关联角色：${oldName} → ${name}` });
      });
      state.selectedRole = name;
      addOperation("角色权限", "更新", name);
      persist();
      closeOverlay();
      toast(`角色 ${name} 已更新`);
    }
  });

  window.addEventListener("hashchange", () => {
    state.route = routeFromHash();
    state.modal = null;
    state.drawer = null;
    renderShell();
  });

  window.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    if (state.modal && state.drawer) {
      state.modal = null;
      state.errors = {};
      renderShell();
      return;
    }
    if (state.modal || state.drawer) closeOverlay();
  });

  renderShell();
})();
