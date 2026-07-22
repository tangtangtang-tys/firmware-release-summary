(() => {
  "use strict";

  const STORAGE_KEY = "firmware-release-replica-v12-rollback-ding-recall";
  const routes = {
    firmware: { title: "固件列表", group: "device" },
    modules: { title: "模组型号", group: "device" },
    operations: { title: "操作日志", group: "logs" },
    approvals: { title: "审批日志", group: "logs" },
    users: { title: "用户列表", group: "users" },
    roles: { title: "角色权限", group: "users" }
  };

  const productLines = ["IPC", "车载", "NVR", "AI玩具", "婴儿看护", "4G模组", "BK系列"];
  const demoBoundDeviceCounts = { "23.110.211": 528, "25.922.219": 1264 };
  const permissionRows = [
    { menu: "固件管理", page: "固件列表", actions: ["查看固件标识列表", "编辑固件标识", "新增固件标识", "发布固件版本", "回滚固件版本", "维护APP更新说明", "管理DING接收人模板", "发送DING", "撤回DING", "查看发布日志", "查看DING记录", "删除固件标识", "查看版本列表", "新增固件版本", "编辑固件版本", "删除固件版本", "查看在线差分", "新建差分任务", "查看差分包", "下载差分包", "删除差分文件"] },
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

  const localeCatalog = [
    { locale: "de-DE", label: "Deutsch" },
    { locale: "fr-FR", label: "Français" },
    { locale: "es-ES", label: "Español" },
    { locale: "pt-BR", label: "Português (Brasil)" },
    { locale: "ja-JP", label: "日本語" },
    { locale: "ko-KR", label: "한국어" }
  ];

  const compactAppNoteLanguages = ["zh", "ja", "ko"];

  const reminderPolicies = [
    { value: "none", label: "不提醒", hint: "APP 不主动展示更新提醒" },
    { value: "weak", label: "弱提醒", hint: "设备设置入口显示更新红点" },
    { value: "strong", label: "强提醒", hint: "设备卡片下方展示升级横幅" },
    { value: "forced-dialog", label: "强制提醒", hint: "进入页面持续展示升级弹窗" }
  ];

  const dingOrganizationTree = [
    {
      id: "org-device", type: "organization", name: "设备研发中心", children: [
        { id: "dept-firmware", type: "department", name: "固件研发组", children: [
          { id: "user-fw-liu", type: "user", name: "刘林胶", role: "固件负责人" },
          { id: "user-fw-zhang", type: "user", name: "张元", role: "固件开发" },
          { id: "user-fw-tang", type: "user", name: "汤彦珊", role: "发布管理员" },
          { id: "user-fw-huang", type: "user", name: "黄晓纯", role: "固件开发" },
          { id: "user-fw-jiang", type: "user", name: "江锐", role: "固件开发" },
          { id: "user-fw-deng", type: "user", name: "邓文韬", role: "固件开发" },
          { id: "user-fw-luo", type: "user", name: "罗琅仁", role: "固件开发" },
          { id: "user-fw-li", type: "user", name: "李金璨", role: "固件开发" }
        ] },
        { id: "dept-test", type: "department", name: "设备测试组", children: [
          { id: "user-test-ling", type: "user", name: "凌紫妍", role: "测试负责人" },
          { id: "user-test-peng", type: "user", name: "彭志勇", role: "测试工程师" },
          { id: "user-test-ruan", type: "user", name: "阮天丽", role: "测试工程师" },
          { id: "user-test-yan", type: "user", name: "严鹏", role: "测试工程师" },
          { id: "user-test-he", type: "user", name: "何圣安", role: "测试工程师" },
          { id: "user-test-quan", type: "user", name: "全继科", role: "测试工程师" }
        ] }
      ]
    },
    {
      id: "org-product", type: "organization", name: "产品与平台中心", children: [
        { id: "dept-ipc-product", type: "department", name: "IPC 产品线", children: [
          { id: "user-line-owner", type: "user", name: "彭冬柏", role: "IPC 产品线负责人" },
          { id: "user-ipc-lin", type: "user", name: "林嘉怡", role: "产品经理" },
          { id: "user-ipc-wu", type: "user", name: "吴泽宇", role: "项目经理" }
        ] },
        { id: "dept-platform-ops", type: "department", name: "平台运维组", children: [
          { id: "user-ops", type: "user", name: "严国潮", role: "平台运维负责人" },
          { id: "user-ops-chen", type: "user", name: "陈子昂", role: "运维工程师" },
          { id: "user-ops-zhou", type: "user", name: "周云帆", role: "运维工程师" }
        ] }
      ]
    }
  ];
  const dingDirectory = flattenDingTree(dingOrganizationTree);

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

  function differentialDemoIdentifier() {
    const versionSuffixes = ["234", "2421", "242", "241", "2337", "2336", "2335", "2334", "2333", "2332", "233", "2321", "232", "231"];
    const versions = versionSuffixes.map((suffix, index) => ({
      version: `25.922.219.${suffix}`,
      url: `http://doraemon.camera666.com/firmware_25.922.219.${suffix}.bin`,
      size: (4.92 + (index % 5) * 0.02).toFixed(2),
      models: "SY278SAEC", features: 2, creator: "管理员",
      note: index === 0 ? "4G 模组稳定版本" : "4G 模组历史版本",
      updated: index === 0 ? "2026-05-28 18:35:20" : `2026-05-${String(Math.max(1, 27 - index)).padStart(2, "0")} 14:13:53`,
      latest: index === 0, reminder: "不提醒"
    }));
    const taskRows = [
      ["T234", "234", ["2421"], "2026-05-28 18:42:37", "2026-05-28 18:41:34"],
      ["T242", "242", ["2421"], "2026-05-25 14:14:53"],
      ["T2421", "2421", ["242"], "2026-05-25 14:13:53"],
      ["T241", "241", ["242"], "2026-05-23 15:01:53"],
      ["T242", "242", ["234", "241"], "2026-05-23 15:01:09"],
      ["234T241", "241", ["234"], "2026-05-22 17:17:52"],
      ["241T234", "234", ["241"], "2026-05-22 17:16:53"],
      ["234T2337", "2337", ["234"], "2026-05-21 19:16:52"],
      ["2337T234", "234", ["2337"], "2026-05-21 19:14:54"],
      ["231232TO2337", "2337", ["232", "231"], "2026-05-19 18:43:09"],
      ["2337TO2336", "2336", ["2337"], "2026-05-19 14:05:52"],
      ["2336TO2337", "2337", ["2336"], "2026-05-19 14:04:52"],
      ["2335TO2334", "2335", ["2334"], "2026-05-19 11:22:52"],
      ["2334TO2335", "2334", ["2335"], "2026-05-19 11:21:52"],
      ["233TT2334", "2334", ["233"], "2026-05-18 18:53:52"],
      ["2334TT233", "233", ["2334"], "2026-05-18 18:52:52"],
      ["233TT2333", "233", ["2333"], "2026-05-18 18:19:52"],
      ["2333TT233", "2333", ["233"], "2026-05-18 18:18:52"],
      ["2332TT233", "233", ["2332"], "2026-05-18 17:32:52"],
      ["233TT2332", "2332", ["233"], "2026-05-18 17:31:52"],
      ["2321TO233", "233", ["2321"], "2026-05-17 20:18:52"],
      ["233TO2321", "2321", ["233"], "2026-05-17 20:17:52"],
      ["232TO2321", "2321", ["232"], "2026-05-16 16:21:52"],
      ["2321TO232", "232", ["2321"], "2026-05-16 16:20:52"],
      ["231TO232", "232", ["231"], "2026-05-15 19:56:53"],
      ["232TO231", "231", ["232"], "2026-04-29 19:28:50"],
      ["2337TO232", "232", ["2337"], "2026-05-15 18:38:52"],
      ["2337TO2321", "2321", ["2337"], "2026-05-15 18:37:52"],
      ["2336TO2335", "2335", ["2336"], "2026-05-14 17:12:52"],
      ["2335TO2336", "2336", ["2335"], "2026-05-14 17:11:52"],
      ["2334TO2333", "2333", ["2334"], "2026-05-13 16:42:52"],
      ["2333TO2334", "2334", ["2333"], "2026-05-13 16:41:52"],
      ["2332TO2333", "2333", ["2332"], "2026-05-12 15:32:52"],
      ["233TO2331", "233", ["231"], "2026-05-11 14:22:52"],
      ["231TO233", "233", ["231"], "2026-05-10 13:12:52"]
    ];
    const differentialTasks = taskRows.map(([name, target, sources, completedAt, createdAt], index) => {
      const targetVersion = `25.922.219.${target}`;
      const sourceVersions = sources.map(source => `25.922.219.${source}`);
      const id = `DIFF-TASK-${index + 1}`;
      const items = sourceVersions.map((sourceVersion, itemIndex) => ({ id: `${id}-${itemIndex + 1}`, sourceVersion, targetVersion, moduleModel: "SY278SAEC", status: "已完成", failureReason: "-", packageName: `diff_${sourceVersion}_to_${targetVersion}_${1779000000 + index * 10 + itemIndex}.par` }));
      return { id, name, targetVersion, sourceVersions, moduleModel: "SY278SAEC", status: "已完成", successRate: "100.0%", packageCount: items.length, createdAt: createdAt || completedAt.replace(/:\d\d$/, ":34"), completedAt, items };
    });
    const packageRows = [
      ["2421", "2026-05-25 14:13:53", ["242"]],
      ["242", "2026-05-25 14:14:53", ["2421", "234", "241"]],
      ["241", "2026-05-23 15:01:53", ["242", "234"]],
      ["234", "2026-05-28 18:42:37", ["242", "241", "2337"]],
      ["2336", "2026-05-19 14:05:52", ["2337"]],
      ["2337", "2026-05-21 19:16:52", ["234", "232", "231", "2336"]],
      ["2321", "2026-05-15 19:57:52", ["2337"]],
      ["231", "2026-04-29 19:28:50", ["232"]],
      ["232", "2026-05-15 19:56:53", ["231", "2337"]]
    ];
    const differentialPackages = packageRows.map(([target, updatedAt, sources], groupIndex) => ({
      targetVersion: `25.922.219.${target}`, updatedAt,
      items: sources.map((source, itemIndex) => ({ id: `DIFF-PACKAGE-${target}-${itemIndex + 1}`, sourceVersion: `25.922.219.${source}`, sizeKb: (5 + itemIndex / 10).toFixed(1), name: `diff_25.922.219.${source}_to_25.922.219.${target}_${1779689617 + groupIndex * 100 + itemIndex}.par`, createdAt: updatedAt }))
    }));
    return {
      id: "25.922.219", product: "4G模组", created: "2026-04-21 18:36:18", models: "SY278SAEC", network: "仅4G", power: "常电", architecture: "新架构", versions, differentialTasks, differentialPackages
    };
  }

  const seed = {
    identifiers: [
      { id: "23.110.211", product: "IPC", created: "2025-11-28 00:37:53", models: "QD20-DK", network: "仅4G", power: "常电", architecture: "新架构", versions: baseVersions },
      { id: "25.921.219", product: "4G模组", created: "2026-04-21 18:20:12", models: "SY278SAEC", network: "仅4G", power: "常电", architecture: "新架构", versions: [] },
      differentialDemoIdentifier(),
      ...["23.100.111", "23.210.211", "23.120.211", "23.322.219", "23.220.211", "23.110.315", "23.120.304", "23.202.111", "23.203.111", "22.211.109", "23.303.111", "23.312.211", "22.111.109", "23.100.105", "20.190.350", "23.212.211", "23.422.209", "10.187.123", "23.412.219", "23.200.105", "23.403.119", "23.421.209", "23.320.239", "23.130.113", "26.221.201", "23.110.213", "23.230.111", "20.129.257", "20.322.109"].map((id, index) => ({
        id,
        product: "IPC",
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
    ].map(([version, submitter, submitTime, approver, status, approveTime]) => ({ version, event: "发布当前固件版本", submitter, submitTime, approver, status, approveTime, note: "-" })),
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

  function initialLifecycleEvents(identifier, legacyCurrent, legacyRollbackTarget, identifierIndex) {
    if (identifier.id === "23.110.211") {
      return [
        { id: "EVT-1313-01", flowId: "FLOW-PUB-20260714-1313", flowType: "publish", flowStatus: "active", fromVersion: "23.110.211.12", toVersion: "23.110.211.13", stage: "approval", title: "提交发布审批", time: "2026-07-14 18:16:22", operator: "刘林胶", operatorType: "用户", result: "success", summary: "审批快照已锁定，审批期间当前发布版本保持不变" },
        { id: "EVT-1313-02", flowId: "FLOW-PUB-20260714-1313", flowType: "publish", flowStatus: "active", fromVersion: "23.110.211.12", toVersion: "23.110.211.13", stage: "approval", title: "发布审批通过", time: "2026-07-14 18:41:18", operator: "彭冬柏", operatorType: "钉钉审批", result: "success", summary: "审批回调与版本快照校验通过" },
        { id: "EVT-1313-03", flowId: "FLOW-PUB-20260714-1313", flowType: "publish", flowStatus: "active", fromVersion: "23.110.211.12", toVersion: "23.110.211.13", stage: "release", title: "当前发布版本切换", time: "2026-07-14 18:41:21", operator: "发布服务", operatorType: "系统", result: "success", summary: "23.110.211.12 -> 23.110.211.13，系统内仅保留一个当前发布版本" },
        { id: "EVT-1499-01", flowId: "FLOW-PUB-20260714-1499", flowType: "publish", flowStatus: "rejected", fromVersion: "23.110.211.12", toVersion: "23.110.211.99", stage: "approval", title: "提交发布审批", time: "2026-07-14 16:20:05", operator: "张元/Alice", operatorType: "用户", result: "success", summary: "目标版本 23.110.211.99，当前发布版本保持不变" },
        { id: "EVT-1499-02", flowId: "FLOW-PUB-20260714-1499", flowType: "publish", flowStatus: "rejected", fromVersion: "23.110.211.12", toVersion: "23.110.211.99", stage: "approval", title: "发布审批驳回", time: "2026-07-14 16:50:42", operator: "彭冬柏", operatorType: "钉钉审批", result: "rejected", summary: "适用机型范围与本次发布计划不一致，版本未生效" },
        { id: "EVT-1422-01", flowId: "FLOW-PUB-20260714-1422", flowType: "publish", flowStatus: "failed", fromVersion: "23.110.211.12", toVersion: "23.110.211.22", stage: "approval", title: "提交发布审批", time: "2026-07-14 14:00:10", operator: "汤彦珊", operatorType: "用户", result: "success", summary: "审批快照已锁定，目标版本 23.110.211.22" },
        { id: "EVT-1422-02", flowId: "FLOW-PUB-20260714-1422", flowType: "publish", flowStatus: "failed", fromVersion: "23.110.211.12", toVersion: "23.110.211.22", stage: "approval", title: "发布审批通过", time: "2026-07-14 14:06:20", operator: "彭冬柏", operatorType: "钉钉审批", result: "success", summary: "审批回调与版本快照校验通过" },
        { id: "EVT-1422-03", flowId: "FLOW-PUB-20260714-1422", flowType: "publish", flowStatus: "failed", fromVersion: "23.110.211.12", toVersion: "23.110.211.22", stage: "release", title: "版本发布失败", time: "2026-07-14 14:06:23", operator: "发布服务", operatorType: "系统", result: "failed", summary: "固件包完整性复检失败，发布事务已整体回退，当前版本未变化" },
        { id: "EVT-1212-01", flowId: "FLOW-PUB-20260523-1212", flowType: "publish", flowStatus: "superseded", fromVersion: "23.110.211.10", toVersion: "23.110.211.12", stage: "approval", title: "发布审批通过", time: "2026-05-23 15:20:11", operator: "IPC 产品线负责人", operatorType: "钉钉审批", result: "success", summary: "审批通过并触发版本状态切换" },
        { id: "EVT-1212-02", flowId: "FLOW-PUB-20260523-1212", flowType: "publish", flowStatus: "superseded", fromVersion: "23.110.211.10", toVersion: "23.110.211.12", stage: "release", title: "版本发布成功", time: "2026-05-23 15:20:16", operator: "发布服务", operatorType: "系统", result: "success", summary: "当前发布版本切换成功，后续已被 23.110.211.13 替代" },
        { id: "EVT-0099-01", flowId: "FLOW-PUB-20260701-0099", flowType: "publish", flowStatus: "rejected", fromVersion: "23.110.211.12", toVersion: "23.110.211.99", stage: "approval", title: "提交发布审批", time: "2026-07-01 11:40:00", operator: "张元/Alice", operatorType: "用户", result: "success", summary: "目标版本 23.110.211.99，审批期间未改变当前发布版本" },
        { id: "EVT-0099-02", flowId: "FLOW-PUB-20260701-0099", flowType: "publish", flowStatus: "rejected", fromVersion: "23.110.211.12", toVersion: "23.110.211.99", stage: "approval", title: "发布审批驳回", time: "2026-07-01 14:06:50", operator: "彭冬柏", operatorType: "钉钉审批", result: "rejected", summary: "适用机型范围与本次发布计划不一致，版本未生效" }
      ];
    }
    const flowId = `FLOW-PUB-INIT-${identifierIndex + 1}`;
    return legacyCurrent ? [
      { id: `${flowId}-01`, flowId, flowType: "publish", flowStatus: "active", fromVersion: legacyRollbackTarget?.version || null, toVersion: legacyCurrent.version, stage: "release", title: "版本发布成功", time: legacyCurrent.published || legacyCurrent.updated, operator: "发布服务", operatorType: "系统", result: "success", summary: `当前发布版本已切换为 ${legacyCurrent.version}` }
    ] : [];
  }

  function normalizeDatabase(data) {
    if (!Array.isArray(data.dingNotices)) data.dingNotices = [];
    data.dingNotices.forEach(notice => {
      if (!notice.recallStatus) notice.recallStatus = "not_requested";
      if (!Number.isFinite(Number(notice.recallAttempts))) notice.recallAttempts = 0;
      if (!notice.recalledAt) notice.recalledAt = "-";
      if (!notice.recalledBy) notice.recalledBy = "-";
      if (!notice.recallReason) notice.recallReason = "";
      if (!notice.recallFailureReason) notice.recallFailureReason = "";
    });
    if (!data.identifiers.some(identifier => identifier.id === "25.922.219")) data.identifiers.push(differentialDemoIdentifier());
    const identifierIds = new Set(data.identifiers.map(identifier => identifier.id));
    data.identifiers.forEach((identifier, identifierIndex) => {
      const legacyCurrent = identifier.versions.find(version => version.version === identifier.currentVersion) || identifier.versions.find(version => version.latest) || identifier.versions[0] || null;
      const legacyRollbackTarget = identifier.versions.find(version => version !== legacyCurrent && version.models === legacyCurrent?.models) || identifier.versions.find(version => version !== legacyCurrent) || null;
      if (!Number.isFinite(Number(identifier.boundDeviceCount))) identifier.boundDeviceCount = demoBoundDeviceCounts[identifier.id] || 160 + (identifierIndex * 73) % 640;
      identifier.boundDeviceCount = Number(identifier.boundDeviceCount);
      identifier.versions.forEach((version, versionIndex) => {
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
        if (!version.platformReleaseNotes) version.platformReleaseNotes = version.note && version.note !== "-" ? version.note : "稳定性优化与已知问题修复";
        if (!version.appReleaseNotes || typeof version.appReleaseNotes !== "object") {
          version.appReleaseNotes = {
            "zh-CN": version.note && version.note !== "-" ? version.note : "提升设备连接稳定性并修复已知问题。",
            "en-US": "Improve device connection stability and fix known issues."
          };
        }
        if (!Array.isArray(version.noteRevisions)) version.noteRevisions = [];
        if (!version.status) {
          if (version === legacyCurrent) version.status = "current";
          else if (version === legacyRollbackTarget) version.status = "historical";
          else version.status = "unpublished";
        }
        version.latest = version.status === "current";
        if (!version.created) version.created = version.updated;
        if (!version.recordVersion) version.recordVersion = 1;
        if (!Number.isFinite(Number(version.associatedDeviceCount))) version.associatedDeviceCount = associatedDeviceCount(identifier, version.models);
        version.associatedDeviceCount = Number(version.associatedDeviceCount);
      });
      if (!identifier.currentVersion && legacyCurrent) identifier.currentVersion = legacyCurrent.version;
      if (identifier.rollbackTargetVersion === undefined) identifier.rollbackTargetVersion = legacyRollbackTarget?.version || null;
      if (identifier.rollbackAvailable === undefined) identifier.rollbackAvailable = Boolean(legacyCurrent && legacyRollbackTarget);
      if (!Array.isArray(identifier.releaseEvents)) identifier.releaseEvents = [];
      if (!identifier.releaseEvents.length && legacyCurrent) {
        identifier.releaseEvents.push({
          id: `REL-INIT-${identifierIndex + 1}`,
          action: "publish",
          fromVersion: legacyRollbackTarget?.version || null,
          toVersion: legacyCurrent.version,
          status: "active",
          reminderPolicy: legacyCurrent.reminder === "不提醒" ? "none" : "weak",
          rollbackTargetVersion: legacyRollbackTarget?.version || null,
          rollbackAvailable: Boolean(legacyRollbackTarget),
          effectiveAt: legacyCurrent.published || legacyCurrent.updated,
          operator: legacyCurrent.creator || "管理员"
        });
      }
      if (identifier.activeApproval === undefined) identifier.activeApproval = null;
      if (!identifier.dingDefaults) identifier.dingDefaults = { scopes: ["dept-firmware", "user-line-owner"], source: "product" };
      identifier.dingDefaults.scopes = normalizeDingScopeIds(identifier.dingDefaults.scopes || []);
      delete identifier.dingDefaults.enabled;
      if (!Array.isArray(identifier.lifecycleEvents)) identifier.lifecycleEvents = initialLifecycleEvents(identifier, legacyCurrent, legacyRollbackTarget, identifierIndex);
      identifier.releaseEvents.forEach(event => {
        if (!event.flowId) {
          event.flowId = identifier.lifecycleEvents.find(item => item.flowStatus === "active" && item.toVersion === event.toVersion)?.flowId || `FLOW-LEGACY-${identifierIndex + 1}-${event.toVersion}`;
        }
      });
      const canonicalActiveEvent = identifier.releaseEvents.find(event => event.status === "active" && event.toVersion === identifier.currentVersion) || identifier.releaseEvents.find(event => event.status === "active");
      identifier.releaseEvents.forEach(event => {
        if (canonicalActiveEvent && event.id !== canonicalActiveEvent.id && event.status === "active") {
          event.status = canonicalActiveEvent.action === "rollback" && canonicalActiveEvent.fromVersion === event.toVersion ? "rolled_back" : "superseded";
        }
      });
      if (canonicalActiveEvent) {
        identifier.lifecycleEvents.forEach(event => {
          const linkedRelease = identifier.releaseEvents.find(item => item.flowId === event.flowId);
          if (event.flowId === canonicalActiveEvent.flowId) event.flowStatus = "active";
          else if (event.flowStatus === "active") event.flowStatus = linkedRelease?.status || (event.flowType === "rollback" ? "completed" : "superseded");
        });
      }
      if (!Array.isArray(identifier.differentialTasks)) identifier.differentialTasks = [];
      if (!Array.isArray(identifier.differentialPackages)) identifier.differentialPackages = [];
      identifier.versions.forEach(version => {
        if (version.version === identifier.currentVersion) { version.status = "current"; version.latest = true; }
        else if (version.status === "current") { version.status = "historical"; version.latest = false; }
      });
      if (!identifier.versions.some(version => version.version === identifier.rollbackTargetVersion)) {
        identifier.rollbackTargetVersion = null;
        identifier.rollbackAvailable = false;
      }
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
    data.identifiers.forEach(identifier => {
      if (identifier.activeApproval && !data.approvals.some(approval => approval.id === identifier.activeApproval.approvalId && approval.status === "审批中")) identifier.activeApproval = null;
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
    firmwareTab: "firmware",
    roleEditing: false,
    profileOpen: false,
    loggedOut: false,
    modal: null,
    drawer: null,
    popover: null,
    density: "default",
    firmwarePage: 1,
    differentialTaskPage: 1,
    differentialPackagePage: 1,
    modulePage: 1,
    operationPage: 1,
    approvalPage: 1,
    userPage: 1,
    pageSizes: { firmware: 20, differentialTasks: 20, differentialPackages: 20, modules: 20, operations: 20, approvals: 20, users: 20 },
    columns: { url: true, size: true, models: true, devices: true, features: true, creator: true, note: true, updated: true },
    filters: { firmware: "", product: "IPC", lifecycleQuery: "", lifecycleRange: "7d", lifecycleStart: "", lifecycleEnd: "", differentialTask: "", differentialTaskStatus: "", differentialPackage: "", module: "", operation: "", approval: "", user: "", userLines: [], roleUserLines: [], operationStart: "2026-07-08", operationEnd: "2026-07-15", approvalStart: "2026-07-08", approvalEnd: "2026-07-15" },
    draftFilters: {},
    upload: null,
    errors: {},
    tempPermissions: null,
    expandedDifferentialPackages: [],
    expandedLifecycleFlows: [lifecycleFlows(db.identifiers[0]?.lifecycleEvents || []).find(flow => flow.flowStatus === "active")?.flowId].filter(Boolean)
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
      state.selectedIdentifier = (state.filters.product === "4G模组" ? identifiers.find(item => item.id === "25.922.219") : null)?.id || identifiers[0].id;
      state.firmwareTab = "firmware";
      state.firmwarePage = 1;
      state.differentialTaskPage = 1;
      state.differentialPackagePage = 1;
      state.expandedDifferentialPackages = [];
      state.expandedLifecycleFlows = [lifecycleFlows(activeIdentifier().lifecycleEvents || []).find(flow => flow.flowStatus === "active")?.flowId].filter(Boolean);
    }
  }

  function clampPage(total, pageSize, page) {
    return Math.min(Math.max(1, page), Math.max(1, Math.ceil(total / pageSize)));
  }

  function sameValues(left, right) {
    return left.length === right.length && left.every(value => right.includes(value));
  }

  function modelValues(value) {
    return String(value || "").split(/[,，/]/).map(item => item.trim().toLowerCase()).filter(Boolean);
  }

  function associatedDeviceCount(identifier, models) {
    const total = Number(identifier?.boundDeviceCount || 0);
    const identifierModels = modelValues(identifier?.models);
    const versionModels = modelValues(models);
    if (!total || !versionModels.length || versionModels.includes("-")) return 0;
    if (versionModels.some(model => identifierModels.includes(model))) return total;
    const partiallyMatched = versionModels.some(model => identifierModels.some(identifierModel => model.includes(identifierModel) || identifierModel.includes(model)));
    return partiallyMatched ? Math.round(total * 0.62) : 0;
  }

  function formatDeviceCount(value) {
    return Number(value || 0).toLocaleString("zh-CN");
  }

  function targetCoversModels(current, target) {
    const targetModels = modelValues(target?.models);
    return modelValues(current?.models).every(model => targetModels.includes(model));
  }

  function versionStatusLabel(status) {
    return ({ unpublished: "未发布", approval: "发布审批中", current: "当前发布", historical: "历史发布", withdrawn: "已撤销" })[status] || "未发布";
  }

  function reminderLabel(value) {
    return reminderPolicies.find(item => item.value === value)?.label || value || "不提醒";
  }

  function localeName(locale) {
    if (locale === "zh-CN") return "简体中文";
    if (locale === "en-US") return "English";
    return localeCatalog.find(item => item.locale === locale)?.label || locale;
  }

  function appNoteLimit(locale) {
    return compactAppNoteLanguages.includes(String(locale || "").split("-")[0].toLowerCase()) ? 80 : 160;
  }

  function appNoteWithinLimit(locale, content) {
    return String(content || "").length <= appNoteLimit(locale);
  }

  function appNoteForLocale(version, locale) {
    const notes = version?.appReleaseNotes || {};
    return notes[locale] || notes["en-US"] || notes["zh-CN"] || "";
  }

  function previewSnippet(content, length) {
    const value = String(content || "").trim();
    return value.length > length ? `${value.slice(0, length)}…` : value;
  }

  function currentVersion(identifier = activeIdentifier()) {
    return identifier?.versions.find(version => version.version === identifier.currentVersion) || identifier?.versions.find(version => version.status === "current") || null;
  }

  function rollbackTarget(identifier = activeIdentifier()) {
    return identifier?.versions.find(version => version.version === identifier.rollbackTargetVersion) || null;
  }

  function activeRelease(identifier = activeIdentifier()) {
    return identifier?.releaseEvents.find(event => event.status === "active") || identifier?.releaseEvents[0] || null;
  }

  function releaseEventsForVersion(version, identifier = activeIdentifier()) {
    return (identifier?.releaseEvents || []).filter(event => event.fromVersion === version.version || event.toVersion === version.version);
  }

  function dingRecordsForVersion(version, identifier = activeIdentifier()) {
    const releaseIds = new Set(releaseEventsForVersion(version, identifier).map(event => event.id));
    return db.dingNotices.filter(notice => notice.firmwareId === identifier.id && releaseIds.has(notice.releaseId));
  }

  function flattenDingTree(nodes) {
    return nodes.flatMap(node => [node, ...flattenDingTree(node.children || [])]);
  }

  function dingNodeById(id) {
    return dingDirectory.find(node => node.id === id);
  }

  function dingLeafUsers(node) {
    if (!node) return [];
    if (node.type === "user") return [node];
    return (node.children || []).flatMap(dingLeafUsers);
  }

  function normalizeDingScopeIds(scopeIds = []) {
    return [...new Set(scopeIds.flatMap(id => dingLeafUsers(dingNodeById(id)).map(user => user.id)))];
  }

  function dingExpandedNodeIds() {
    return dingDirectory.filter(node => node.type !== "user").map(node => node.id);
  }

  function selectedDingScopes(modal = state.modal) {
    const selectedIds = normalizeDingScopeIds(modal?.dingScopes || []);
    return dingDirectory.filter(item => item.type === "user" && selectedIds.includes(item.id));
  }

  function resolveDingRecipients(scopeIds) {
    return [...new Set(normalizeDingScopeIds(scopeIds).map(id => dingNodeById(id)?.name).filter(Boolean))];
  }

  function dingRecipientCount(modal = state.modal) {
    return resolveDingRecipients(modal?.dingScopes || []).length;
  }

  function dingNodeSelection(node, modal) {
    const selectedIds = new Set(normalizeDingScopeIds(modal?.dingScopes || []));
    const leafIds = dingLeafUsers(node).map(user => user.id);
    const selectedCount = leafIds.filter(id => selectedIds.has(id)).length;
    return { leafIds, checked: Boolean(leafIds.length && selectedCount === leafIds.length), partial: selectedCount > 0 && selectedCount < leafIds.length };
  }

  function dingTreeNodeMatches(node, query) {
    if (!query) return true;
    const ownText = `${node.name} ${node.role || ""}`.toLowerCase();
    return ownText.includes(query) || (node.children || []).some(child => dingTreeNodeMatches(child, query));
  }

  function renderDingTreeNode(node, modal, depth = 0) {
    const query = String(modal.dingTreeQuery || "").trim().toLowerCase();
    if (!dingTreeNodeMatches(node, query)) return "";
    const children = node.children || [];
    const expandable = children.length > 0;
    const expanded = Boolean(query || (modal.dingExpanded || []).includes(node.id));
    const selection = dingNodeSelection(node, modal);
    const memberCount = dingLeafUsers(node).length;
    const meta = node.type === "user" ? node.role : `${memberCount} 人`;
    return `<div class="ding-tree-node" style="--ding-depth:${depth}"><div class="ding-tree-row ${node.type}">${expandable ? `<button type="button" class="ding-tree-toggle" data-action="toggle-ding-tree-node" data-node-id="${esc(node.id)}" aria-label="${expanded ? "收起" : "展开"}${esc(node.name)}" aria-expanded="${expanded}">${expanded ? "⌄" : "›"}</button>` : `<span class="ding-tree-spacer"></span>`}<label class="ding-tree-check"><input type="checkbox" data-ding-node="${esc(node.id)}" ${selection.checked ? "checked" : ""} ${selection.partial ? `data-partial="true"` : ""}><span class="ding-node-icon ${node.type}">${node.type === "organization" ? "组" : node.type === "department" ? "部" : esc(node.name.slice(0, 1))}</span><span class="ding-node-copy"><strong>${esc(node.name)}</strong><small>${esc(meta)}</small></span></label></div>${expandable && expanded ? `<div class="ding-tree-children">${children.map(child => renderDingTreeNode(child, modal, depth + 1)).join("")}</div>` : ""}</div>`;
  }

  function releaseId(prefix = "REL") {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  }

  function dingRecordForEvent(event) {
    return event ? db.dingNotices.find(notice => notice.releaseId === event.id) : null;
  }

  function dingRecallLabel(notice) {
    if (!notice) return "-";
    return ({ not_requested: "未撤回", recalling: "撤回中", recalled: "已撤回", recall_failed: "撤回失败", partial_recalled: "部分撤回" })[notice.recallStatus] || notice.recallStatus;
  }

  function dingDisplayLabel(notice) {
    if (!notice) return "未发送";
    if (notice.recallStatus === "recalling") return "撤回中";
    if (notice.recallStatus === "recalled") return "已撤回";
    if (notice.recallStatus === "partial_recalled") return "部分撤回";
    if (notice.recallStatus === "recall_failed") return "撤回失败";
    return ({ sent: "发送成功", sending: "发送中", partial_failed: "部分失败", failed: "发送失败" })[notice.status] || notice.status;
  }

  function canRecallDing(notice) {
    return Boolean(notice && ["sent", "partial_failed"].includes(notice.status) && ["not_requested", "recall_failed", "partial_recalled"].includes(notice.recallStatus));
  }

  function sourcePublishEventForRollback(identifier, rollbackEvent) {
    if (!identifier || rollbackEvent?.action !== "rollback") return null;
    return identifier.releaseEvents.find(event => event.id === rollbackEvent.sourceReleaseId)
      || identifier.releaseEvents.find(event => event.action === "publish" && event.toVersion === rollbackEvent.fromVersion && event.status === "rolled_back")
      || null;
  }

  function sourceDingForRollback(identifier, rollbackEvent) {
    return dingRecordForEvent(sourcePublishEventForRollback(identifier, rollbackEvent));
  }

  function canSendDing(identifier, event) {
    const currentEvent = activeRelease(identifier);
    return Boolean(event && event.action === "publish" && currentEvent?.id === event.id && event.status === "active" && event.toVersion === identifier.currentVersion && !identifier.activeApproval && !dingRecordForEvent(event));
  }

  function createDingRecord(identifier, event, config) {
    if (!canSendDing(identifier, event)) return null;
    const normalizedScopeIds = normalizeDingScopeIds(config.dingScopes || []);
    const recipients = resolveDingRecipients(normalizedScopeIds);
    if (!recipients.length) return null;
    const version = identifier.versions.find(item => item.version === event.toVersion);
    const noticeType = "publish";
    const notice = {
      id: releaseId("DING"), releaseId: event.id, firmwareId: identifier.id, version: event.toVersion,
      noticeType, status: "sending", kind: "task", scopes: normalizedScopeIds,
      recipients,
      messageSnapshot: `[固件发布] ${identifier.id} ${event.fromVersion || "首次发布"} -> ${event.toVersion}\n${version?.platformReleaseNotes || event.reason || "-"}\n功能集：${version?.featureConfigs?.length || 0} 项`,
      createdAt: now(), sentAt: "-", attemptCount: 1, failureReason: "",
      recallStatus: "not_requested", recallAttempts: 0, recalledAt: "-", recalledBy: "-", recallReason: "", recallFailureReason: ""
    };
    db.dingNotices.unshift(notice);
    return notice;
  }

  function addDingHistoryEvent(identifier, event, notice, flowType) {
    const result = notice.status === "sent" ? "success" : notice.status === "partial_failed" ? "partial" : "failed";
    const summary = notice.status === "sent" ? `实际接收 ${notice.recipients.length} 人；该事件不可再次发送` : notice.failureReason || "DING 发送失败；该事件不可重试或补发";
    addLifecycleEvent(identifier, { flowId: event.flowId, flowType: "publish", flowStatus: "active", fromVersion: event.fromVersion, toVersion: event.toVersion, stage: "notification", title: "发布 DING 发送结果", operator: "DING 任务", operatorType: "系统", result, summary });
  }

  function finalizeDingRecord(noticeId, succeeded = true, failureReason = "") {
    const notice = db.dingNotices.find(item => item.id === noticeId);
    if (!notice || notice.status !== "sending") return;
    const identifier = db.identifiers.find(item => item.id === notice.firmwareId);
    const event = identifier?.releaseEvents.find(item => item.id === notice.releaseId);
    if (!identifier || !event) return;
    notice.status = succeeded ? "sent" : "failed";
    notice.sentAt = now();
    notice.failureReason = succeeded ? "" : failureReason || "钉钉接口返回发送失败";
    addDingHistoryEvent(identifier, event, notice, "publish");
    addOperation("DING 通知", succeeded ? "发送成功" : "发送失败", `${identifier.id} ${event.toVersion}`);
    persist();
    renderShell();
    toast(succeeded ? `DING 已发送给 ${notice.recipients.length} 人` : "DING 发送失败，该事件不可再次发送", succeeded ? "success" : "error");
  }

  function finalizeDingRecall(noticeId, succeeded = true, failureReason = "") {
    const notice = db.dingNotices.find(item => item.id === noticeId);
    if (!notice || notice.recallStatus !== "recalling") return;
    const identifier = db.identifiers.find(item => item.id === notice.firmwareId);
    const event = identifier?.releaseEvents.find(item => item.id === notice.releaseId);
    if (!identifier || !event) return;
    notice.recallStatus = succeeded ? "recalled" : "recall_failed";
    notice.recalledAt = succeeded ? now() : "-";
    notice.recalledBy = "汤彦珊";
    notice.recallFailureReason = succeeded ? "" : failureReason || "钉钉接口返回撤回失败";
    addLifecycleEvent(identifier, { flowId: event.flowId, flowType: "publish", flowStatus: event.status, fromVersion: event.fromVersion, toVersion: event.toVersion, stage: "notification", title: succeeded ? "发布 DING 已撤回" : "发布 DING 撤回失败", operator: "汤彦珊", operatorType: "用户", result: succeeded ? "success" : "failed", summary: succeeded ? `撤回原因：${notice.recallReason}；原发送记录与接收人快照继续保留` : `${notice.recallFailureReason}；固件发布或回滚状态不受影响` });
    addOperation("DING 通知", succeeded ? "撤回成功" : "撤回失败", `${identifier.id} ${notice.version}`);
    persist();
    renderShell();
    toast(succeeded ? "原发布 DING 已撤回" : "DING 撤回失败，可针对同一消息重试", succeeded ? "success" : "error");
  }

  function approvalById(id) {
    return db.approvals.find(item => item.id === id);
  }

  function addOperation(module, action, resource, user = "汤彦珊") {
    db.operations.unshift({ time: now(), user, module, action, resource, description: `${action}${module}: [${resource}]` });
  }

  function addLifecycleEvent(identifier, event) {
    if (!Array.isArray(identifier.lifecycleEvents)) identifier.lifecycleEvents = [];
    identifier.lifecycleEvents.unshift({ id: releaseId("EVT"), operatorType: "用户", result: "success", time: now(), ...event });
  }

  function setLifecycleFlowStatus(identifier, flowId, flowStatus) {
    if (!flowId || !Array.isArray(identifier.lifecycleEvents)) return;
    identifier.lifecycleEvents.forEach(event => {
      if (event.flowId === flowId) event.flowStatus = flowStatus;
    });
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
    app.querySelectorAll('input[data-ding-node][data-partial="true"]').forEach(input => { input.indeterminate = true; });
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

  function renderIdentifierMeta(identifier) {
    if (identifier.product === "4G模组") {
      return `<div class="meta-grid four-g-meta"><span>所属产品线：<strong>${esc(identifier.product)}</strong></span><span>创建时间：<strong>${esc(identifier.created)}</strong></span><span>模组型号：<strong>${esc(identifier.models)}</strong></span><span title="固件标识下去重后的绑定设备总数">绑定设备数：<strong>${formatDeviceCount(identifier.boundDeviceCount)} 台</strong></span></div>`;
    }
    return `<div class="meta-grid"><span>所属产品线：<strong>${esc(identifier.product)}</strong></span><span>创建时间：<strong>${esc(identifier.created)}</strong></span><span>关联机型：<strong>${esc(identifier.models)}</strong></span><span title="固件标识下去重后的绑定设备总数">绑定设备数：<strong>${formatDeviceCount(identifier.boundDeviceCount)} 台</strong></span><span>网络类型：<strong>${esc(identifier.network)}</strong></span><span>电量类型：<strong>${esc(identifier.power)}</strong></span><span>架构类型：<strong>${esc(identifier.architecture)}</strong></span><span>DING 接收模板：<strong>${resolveDingRecipients(identifier.dingDefaults.scopes).length} 人</strong></span></div>`;
  }

  function renderFirmware() {
    const identifiers = filteredIdentifiers();
    const selected = identifiers.find(item => item.id === state.selectedIdentifier) || identifiers[0] || null;
    const header = pageHeader("固件列表", `<input class="field search-field" data-filter="firmware" value="${esc(state.filters.firmware)}" placeholder="请输入固件标识或固件版本号" aria-label="搜索固件"><select class="select" data-change="product-filter" aria-label="所属产品线">${productLines.map(line => `<option ${line === state.filters.product ? "selected" : ""}>${line}</option>`).join("")}</select>`);
    if (!selected) {
      return `<section class="page tint-page">${header}<div class="firmware-layout"><aside class="identifier-panel"><h2 class="panel-heading">固件管理</h2><button class="btn panel-action" data-action="add-identifier">⊕ 新增标识</button><div class="muted" style="padding:16px">无匹配标识</div></aside><div class="firmware-main"><div class="empty-state"><div><div class="empty-illustration">▤</div>暂无匹配的固件数据</div></div></div></div></section>`;
    }
    const latest = currentVersion(selected);
    const pendingApproval = selected.activeApproval ? approvalById(selected.activeApproval.approvalId) : null;
    return `<section class="page tint-page">
      ${header}
      <div class="firmware-layout ${selected.product === "4G模组" && state.firmwareTab !== "firmware" ? "differential-layout" : ""}">
        <aside class="identifier-panel"><h2 class="panel-heading">固件管理</h2><button class="btn panel-action" data-action="add-identifier">⊕ 新增标识</button><div class="identifier-list">${identifiers.map(item => `<button class="identifier-item ${item.id === selected.id ? "active" : ""}" data-action="select-identifier" data-id="${esc(item.id)}">${esc(item.id)}</button>`).join("") || `<div class="muted" style="padding:16px">无匹配标识</div>`}</div></aside>
        <div class="firmware-main ${selected.product === "4G模组" && state.firmwareTab !== "firmware" ? "differential-main" : ""}">
          <div class="summary-band ${selected.product === "4G模组" ? "four-g-summary" : ""}"><div class="summary-head"><h2>${esc(selected.id)}</h2><div class="summary-actions"><button class="btn small" data-action="refresh">↻ 刷新</button><div class="popover-wrap"><button class="btn small" data-action="identifier-actions" aria-expanded="${state.popover === "identifier"}">••• 更多</button>${state.popover === "identifier" ? `<div class="action-popover compact-popover"><button data-action="edit-identifier">编辑</button><button data-action="ding-defaults">DING 接收人模板</button><button class="danger-item" data-action="delete-identifier">删除</button></div>` : ""}</div></div></div>${renderIdentifierMeta(selected)}</div>
          ${pendingApproval ? `<div class="approval-banner"><div><strong>${pendingApproval.event === "撤销并回滚固件版本" ? "回滚审批中" : "发布审批中"}</strong><span>${esc(pendingApproval.version)} · 提交人 ${esc(pendingApproval.submitter)} · ${esc(pendingApproval.submitTime)}</span></div><button class="btn small primary" data-action="view-active-approval">查看审批</button></div>` : ""}
          <div class="tab-strip firmware-tabs"><button class="tab ${state.firmwareTab === "firmware" ? "active" : ""}" data-action="firmware-subtab" data-tab="firmware">固件列表</button><button class="tab ${state.firmwareTab === "lifecycle" ? "active" : ""}" data-action="firmware-subtab" data-tab="lifecycle">发布日志</button>${selected.product === "4G模组" ? `<button class="tab ${state.firmwareTab === "onlineDifferential" ? "active" : ""}" data-action="firmware-subtab" data-tab="onlineDifferential">在线差分</button><button class="tab ${state.firmwareTab === "differentialPackages" ? "active" : ""}" data-action="firmware-subtab" data-tab="differentialPackages">差分包列表</button>` : ""}</div>
          ${renderFirmwareTabContent(selected, latest)}
        </div>
      </div>
    </section>`;
  }

  function renderFirmwareTabContent(identifier, latest) {
    if (state.firmwareTab === "lifecycle") return renderLifecycle(identifier);
    if (identifier.product !== "4G模组" || state.firmwareTab === "firmware") {
      return `${latest ? `<section class="section-block"><h3 class="section-heading">当前发布版本</h3>${renderLatest(identifier, latest)}</section>` : ""}<section class="section-block"><div class="section-bar"><h3>固件版本列表</h3><div class="section-actions"><div class="popover-wrap"><button class="btn icon-btn" title="行高：${state.density === "default" ? "默认" : state.density === "comfortable" ? "宽松" : "紧凑"}" aria-label="行高：${state.density === "default" ? "默认" : state.density === "comfortable" ? "宽松" : "紧凑"}" data-action="density-menu">☷</button>${state.popover === "density" ? `<div class="action-popover density-popover">${[["default", "默认"], ["comfortable", "宽松"], ["compact", "紧凑"]].map(([value, label]) => `<button class="${state.density === value ? "selected" : ""}" data-action="set-density" data-density="${value}">${label}<span>${state.density === value ? "✓" : ""}</span></button>`).join("")}</div>` : ""}</div><div class="popover-wrap"><button class="btn icon-btn" title="列设置" aria-label="列设置" data-action="column-settings">⚙</button>${state.popover === "columns" ? renderColumnPopover() : ""}</div><button class="btn primary" data-action="add-version">＋ 新增版本</button></div></div>${renderFirmwareTable(identifier)}${pagination(identifier.versions.length, state.firmwarePage, "firmware-page", "firmware")}</section>`;
    }
    if (state.firmwareTab === "onlineDifferential") return renderOnlineDifferential(identifier);
    return renderDifferentialPackages(identifier);
  }

  function lifecycleStageLabel(stage) {
    return ({ approval: "钉钉审批", release: "发布生效", notification: "DING 通知", rollback: "回滚生效" })[stage] || stage;
  }

  function lifecycleResultLabel(result) {
    return ({ success: "成功", active: "当前生效", partial: "部分失败", failed: "失败", rejected: "已驳回", skipped: "不发送" })[result] || result;
  }

  function lifecycleResultClass(result) {
    return result === "success" || result === "active" ? "success" : result === "failed" || result === "rejected" ? "danger" : "warning";
  }

  function lifecycleFlowLabel(flow) {
    if (flow.flowType === "rollback") return "版本回滚";
    return "版本发布";
  }

  function lifecycleFlowStatusLabel(status) {
    return ({ active: "当前生效", superseded: "历史发布", pending: "审批中", rejected: "审批驳回", failed: "发布失败", rolled_back: "已回滚", completed: "已完成" })[status] || status;
  }

  function lifecycleFlowStatusClass(status) {
    return status === "active" || status === "completed" ? "success" : status === "rejected" || status === "failed" || status === "rolled_back" ? "danger" : "blue";
  }

  function lifecycleFilteredEvents(identifier) {
    const query = state.filters.lifecycleQuery.trim().toLowerCase();
    const events = [...(identifier.lifecycleEvents || [])];
    if (!query) return events.sort((left, right) => right.time.localeCompare(left.time));
    const matchingFlowIds = new Set(events.filter(event => {
      const haystack = [event.flowId, event.fromVersion, event.toVersion, event.title, event.summary, event.operator].join(" ").toLowerCase();
      return haystack.includes(query);
    }).map(event => event.flowId));
    return events.filter(event => matchingFlowIds.has(event.flowId)).sort((left, right) => right.time.localeCompare(left.time));
  }

  function lifecycleEventSequence(event) {
    if (Number.isFinite(Number(event.sequence))) return Number(event.sequence);
    if (event.stage === "notification") return 40;
    if (["release", "rollback"].includes(event.stage)) return 30;
    if (event.stage === "approval" && (event.title.includes("通过") || event.title.includes("驳回"))) return 20;
    if (event.stage === "approval") return 10;
    return 50;
  }

  function compareLifecycleEvents(left, right) {
    const timeOrder = String(left.time).localeCompare(String(right.time));
    if (timeOrder) return timeOrder;
    const sequenceOrder = lifecycleEventSequence(left) - lifecycleEventSequence(right);
    if (sequenceOrder) return sequenceOrder;
    return String(left.id || "").localeCompare(String(right.id || ""));
  }

  function lifecycleFlows(events) {
    const flows = new Map();
    events.forEach(event => {
      if (!flows.has(event.flowId)) flows.set(event.flowId, { flowId: event.flowId, flowType: event.flowType, flowStatus: event.flowStatus, fromVersion: event.fromVersion, toVersion: event.toVersion, events: [] });
      flows.get(event.flowId).events.push(event);
    });
    return [...flows.values()].map(flow => {
      const orderedEvents = [...flow.events].sort(compareLifecycleEvents);
      const effectiveEvent = orderedEvents.find(event => ["release", "rollback"].includes(event.stage)) || orderedEvents[orderedEvents.length - 1];
      return { ...flow, events: orderedEvents, startTime: orderedEvents[0]?.time, endTime: orderedEvents[orderedEvents.length - 1]?.time, effectiveTime: effectiveEvent?.time || "" };
    }).sort((left, right) => right.effectiveTime.localeCompare(left.effectiveTime));
  }

  function formatLocalDate(date) {
    const pad = value => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  function lifecycleFlowInRange(flow) {
    const eventDate = String(flow.effectiveTime || "").slice(0, 10);
    if (!eventDate || state.filters.lifecycleRange === "all") return true;
    const today = new Date();
    const todayValue = formatLocalDate(today);
    if (state.filters.lifecycleRange === "today") return eventDate === todayValue;
    if (state.filters.lifecycleRange === "7d") {
      const start = new Date(today);
      start.setDate(start.getDate() - 6);
      return eventDate >= formatLocalDate(start) && eventDate <= todayValue;
    }
    const startValue = state.filters.lifecycleStart;
    const endValue = state.filters.lifecycleEnd;
    return (!startValue || eventDate >= startValue) && (!endValue || eventDate <= endValue);
  }

  function lifecycleDisplayStatus(identifier, flow) {
    const releaseEvent = identifier.releaseEvents.find(event => event.flowId === flow.flowId);
    if (releaseEvent?.action === "rollback" && releaseEvent.status === "superseded") return "completed";
    return releaseEvent?.status || flow.flowStatus;
  }

  function lifecycleDateGroups(flows, identifier) {
    const groups = new Map();
    flows.forEach(flow => {
      const date = String(flow.effectiveTime || "-").split(" ")[0];
      if (!groups.has(date)) groups.set(date, { date, flows: [], publishCount: 0, rollbackCount: 0, exceptionCount: 0 });
      const group = groups.get(date);
      const releaseEvent = identifier.releaseEvents.find(event => event.flowId === flow.flowId);
      const notice = dingRecordForEvent(releaseEvent);
      const status = lifecycleDisplayStatus(identifier, flow);
      group.flows.push(flow);
      if (flow.flowType === "rollback" && flow.events.some(event => event.stage === "rollback" && event.result === "success")) group.rollbackCount += 1;
      if (flow.flowType === "publish" && flow.events.some(event => event.stage === "release" && event.result === "success")) group.publishCount += 1;
      if (["rejected", "failed"].includes(status) || ["failed", "partial_failed"].includes(notice?.status) || notice?.recallStatus === "recall_failed") group.exceptionCount += 1;
    });
    return [...groups.values()];
  }

  function weekdayLabel(date) {
    const day = new Date(`${date}T00:00:00`).getDay();
    return ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][day] || "";
  }

  function renderLifecycle(identifier) {
    const allEvents = identifier.lifecycleEvents || [];
    const events = lifecycleFilteredEvents(identifier);
    const flows = lifecycleFlows(events).filter(lifecycleFlowInRange);
    const releaseCount = new Set(allEvents.filter(event => event.flowType === "publish" && ["superseded", "rolled_back"].includes(event.flowStatus)).map(event => event.flowId)).size;
    const rollbackCount = new Set(allEvents.filter(event => event.flowType === "rollback" && event.stage === "rollback" && event.result === "success").map(event => event.flowId)).size;
    const current = currentVersion(identifier);
    const filtersActive = Boolean(state.filters.lifecycleQuery || state.filters.lifecycleRange !== "7d" || state.filters.lifecycleStart || state.filters.lifecycleEnd);
    const rangeOptions = [["today", "今天"], ["7d", "近 7 天"], ["all", "全部"], ["custom", "自定义"]];
    const rangeControl = `<div class="release-range-control"><div class="segmented-control release-range-segments">${rangeOptions.map(([value, label]) => `<button class="${state.filters.lifecycleRange === value ? "active" : ""}" data-action="set-lifecycle-range" data-range="${value}">${label}</button>`).join("")}</div>${state.filters.lifecycleRange === "custom" ? `<div class="release-custom-range"><input type="date" class="field" data-filter="lifecycleStart" value="${esc(state.filters.lifecycleStart)}" aria-label="发布日志开始日期"><span>至</span><input type="date" class="field" data-filter="lifecycleEnd" value="${esc(state.filters.lifecycleEnd)}" aria-label="发布日志结束日期"></div>` : ""}</div>`;
    return `<section class="lifecycle-section"><div class="lifecycle-overview release-log-overview"><div class="lifecycle-overview-copy"><h3>发布日志</h3></div><div class="lifecycle-stats release-log-stats"><div><span>当前发布</span><strong>${esc(current?.version || "-")}</strong></div><div><span>历史发布</span><strong>${releaseCount} 次</strong></div><div><span>历史回滚</span><strong>${rollbackCount} 次</strong></div></div></div><div class="lifecycle-toolbar release-log-toolbar"><div class="lifecycle-filters"><input class="field lifecycle-search" data-filter="lifecycleQuery" value="${esc(state.filters.lifecycleQuery)}" placeholder="搜索版本号、链路编号或操作人" aria-label="搜索发布日志"><button class="btn" data-action="apply-lifecycle-filter">查询</button>${filtersActive ? `<button class="btn" data-action="reset-lifecycle-filter">重置</button>` : ""}</div>${rangeControl}</div>${flows.length ? renderLifecycleTimeline(flows, identifier) : `<div class="empty-state lifecycle-empty"><div><div class="empty-illustration">▤</div>没有符合条件的发布日志</div></div>`}</section>`;
  }

  function renderLifecycleStep(event, mainDate, isLast) {
    const [eventDate = "", eventClock = "-"] = String(event.time || "-").split(" ");
    const timeLabel = eventDate && eventDate !== mainDate ? `${eventDate} ${eventClock}` : eventClock;
    const showStatus = event.result !== "success";
    return `<div class="release-log-event"><time datetime="${esc(event.time)}">${esc(timeLabel)}</time><div class="release-log-event-marker"><span class="event-dot ${lifecycleResultClass(event.result)}"></span>${isLast ? "" : `<i></i>`}</div><div class="release-log-event-content"><div><strong>${esc(event.title)}</strong>${showStatus ? `<span class="tag ${lifecycleResultClass(event.result)}">${lifecycleResultLabel(event.result)}</span>` : ""}</div><p>${esc(event.summary)}</p><small>${lifecycleStageLabel(event.stage)} · ${esc(event.operator)}（${esc(event.operatorType)}）</small></div></div>`;
  }

  function renderLifecycleEntry(flow, flowIndex, flowCount, identifier) {
      const approvalEvents = flow.events.filter(event => event.stage === "approval");
      const approvalLabel = approvalEvents.some(event => event.result === "rejected") ? "已驳回" : approvalEvents.some(event => event.title.includes("通过")) ? "已通过" : approvalEvents.length ? "审批中" : "无记录";
      const approvalClass = approvalLabel === "已驳回" ? "danger-text" : approvalLabel === "已通过" ? "success-text" : "";
      const releaseEvent = identifier.releaseEvents.find(event => event.flowId === flow.flowId);
      const notice = dingRecordForEvent(releaseEvent);
      const displayFlowStatus = lifecycleDisplayStatus(identifier, flow);
      const notificationLabel = releaseEvent?.action === "rollback" ? "不适用" : releaseEvent ? dingDisplayLabel(notice) : "不适用";
      const notificationIssue = Boolean(notice && (["failed", "partial_failed"].includes(notice.status) || notice.recallStatus === "recall_failed"));
      const transition = flow.toVersion ? `${flow.fromVersion || "首次发布"} → ${flow.toVersion}` : "标识初始化";
      const expanded = state.expandedLifecycleFlows.includes(flow.flowId);
      const effectiveEvent = flow.events.find(event => ["release", "rollback"].includes(event.stage)) || flow.events[flow.events.length - 1];
      const [timelineDate = "-", timelineClock = ""] = String(effectiveEvent?.time || "-").split(" ");
      const coreEvents = flow.events.filter(event => event.stage !== "notification");
      const notificationEvents = flow.events.filter(event => event.stage === "notification");
      let optionalNotification = "";
      if (releaseEvent) {
        if (releaseEvent.action === "rollback") {
          const sourceNotice = sourceDingForRollback(identifier, releaseEvent);
          const sourceSummary = !sourceNotice ? "原发布事件未发送 DING，无需处理通知"
            : sourceNotice.recallStatus === "recalled" ? "原发布 DING 已撤回，原发送事实和接收人快照继续保留"
              : canRecallDing(sourceNotice) ? `原发布 DING 当前状态：${dingDisplayLabel(sourceNotice)}；可在当前发布版本中独立撤回`
                : `原发布 DING 当前状态：${dingDisplayLabel(sourceNotice)}；当前无需或无法撤回`;
          optionalNotification = `<div class="release-log-optional"><div class="release-log-optional-label"><span>通知边界</span></div><div class="release-log-ding-empty"><strong>回滚不触发 DING</strong><span>${esc(sourceSummary)}</span></div></div>`;
        } else if (notificationEvents.length) {
          optionalNotification = `<div class="release-log-optional"><div class="release-log-optional-label"><span>可选后置通知</span></div>${notificationEvents.map((event, index) => renderLifecycleStep(event, timelineDate, index === notificationEvents.length - 1)).join("")}</div>`;
        } else if (notice?.status === "sending") {
          optionalNotification = `<div class="release-log-optional"><div class="release-log-optional-label"><span>可选后置通知</span></div><div class="release-log-ding-pending"><time>${esc(String(notice.createdAt).split(" ")[1] || notice.createdAt)}</time><span class="event-dot warning"></span><div><strong>DING 正在发送</strong><p>已锁定 ${notice.recipients.length} 名实际接收人，任务创建后不可再次发送</p></div></div></div>`;
        } else if (!notice) {
          optionalNotification = `<div class="release-log-optional"><div class="release-log-optional-label"><span>可选后置通知</span></div><div class="release-log-ding-empty"><strong>DING 尚未发送</strong><span>${displayFlowStatus === "active" ? "可在固件列表的当前发布版本中独立发送一次" : "该事件已结束，不再开放发送入口"}</span></div></div>`;
        }
      }
      const eventChain = expanded ? `<div class="release-log-event-chain"><div class="release-log-core-events">${coreEvents.map((event, index) => renderLifecycleStep(event, timelineDate, index === coreEvents.length - 1)).join("")}</div>${optionalNotification}</div>` : "";
      return `<article class="release-timeline-entry ${displayFlowStatus} ${expanded ? "is-expanded" : ""}"><time class="release-timeline-time" datetime="${esc(effectiveEvent?.time || "")}"><strong>${esc(timelineClock)}</strong></time><div class="release-timeline-marker"><span class="${lifecycleFlowStatusClass(displayFlowStatus)}"></span>${flowIndex < flowCount - 1 ? `<i></i>` : ""}</div><div class="release-timeline-content"><div class="release-log-row"><button class="release-log-item" data-action="toggle-lifecycle-flow" data-flow-id="${esc(flow.flowId)}" aria-expanded="${expanded}"><span class="release-log-main"><span><span class="release-log-kind ${flow.flowType}">${flow.flowType === "rollback" ? "回滚" : "发布"}</span><strong>${esc(transition)}</strong><span class="tag ${lifecycleFlowStatusClass(displayFlowStatus)}">${lifecycleFlowStatusLabel(displayFlowStatus)}</span></span><small>${esc(flow.flowId)}</small></span><span class="release-log-results"><span class="release-log-result ${approvalClass}"><span>审批</span><strong>${approvalLabel}</strong></span><span class="release-log-result ${notificationIssue ? "danger-text" : ""}"><span>DING</span><strong>${notificationLabel}</strong></span></span><span class="release-log-chevron" aria-hidden="true">${expanded ? "⌄" : "›"}</span></button></div>${eventChain}</div></article>`;
  }

  function renderLifecycleTimeline(flows, identifier) {
    const groups = lifecycleDateGroups(flows, identifier);
    const todayValue = formatLocalDate(new Date());
    return `<div class="release-date-groups">${groups.map(group => {
      const summary = [`${group.flows.length} 条记录`, `${group.publishCount} 次发布`, `${group.rollbackCount} 次回滚`];
      return `<section class="release-date-group"><header class="release-date-header"><div><strong>${esc(group.date)}</strong><span>${group.date === todayValue ? "今天 · " : ""}${esc(weekdayLabel(group.date))}</span></div><div class="release-date-summary">${summary.map(item => `<span>${esc(item)}</span>`).join("")}${group.exceptionCount ? `<span class="has-exception">${group.exceptionCount} 个异常</span>` : ""}</div></header><div class="lifecycle-timeline release-log-list">${group.flows.map((flow, index) => renderLifecycleEntry(flow, index, group.flows.length, identifier)).join("")}</div></section>`;
    }).join("")}</div>`;
  }

  function renderOnlineDifferential(identifier) {
    const query = state.filters.differentialTask.trim().toLowerCase();
    const status = state.filters.differentialTaskStatus;
    const filtered = identifier.differentialTasks.filter(task => (!query || task.name.toLowerCase().includes(query)) && (!status || task.status === status));
    const pageSize = state.pageSizes.differentialTasks;
    state.differentialTaskPage = clampPage(filtered.length, pageSize, state.differentialTaskPage);
    const rows = filtered.slice((state.differentialTaskPage - 1) * pageSize, state.differentialTaskPage * pageSize);
    const statuses = ["差分中", "已完成", "差分失败"];
    const statusPopover = state.popover === "differentialStatus" ? `<div class="action-popover differential-status-popover">${statuses.map(item => `<button class="${status === item ? "selected" : ""}" data-action="set-differential-status" data-status="${item}"><span>${esc(item)}</span><span>${status === item ? "✓" : ""}</span></button>`).join("")}<button data-action="set-differential-status" data-status=""><span>全部状态</span><span>${status ? "" : "✓"}</span></button></div>` : "";
    return `<section class="section-block differential-section"><div class="differential-toolbar"><input class="field search-field differential-search" data-filter="differentialTask" value="${esc(state.filters.differentialTask)}" placeholder="请输入差分任务名称" aria-label="差分任务名称"><button class="btn primary" data-action="add-differential-task">＋ 差分任务</button></div><div class="table-wrap differential-task-table-wrap"><table class="data-table differential-task-table"><thead><tr><th>差分任务名称</th><th>目标版本</th><th>源版本</th><th>状态 <span class="popover-wrap"><button class="table-filter-btn ${status ? "active" : ""}" data-action="differential-status-filter" aria-label="按状态过滤">▽</button>${statusPopover}</span></th><th>成功率</th><th>差分包</th><th>任务完成时间</th><th>操作</th></tr></thead><tbody>${rows.map(task => `<tr><td>${esc(task.name)}</td><td class="cell-truncate" title="${esc(task.targetVersion)}">${esc(task.targetVersion)}</td><td title="${esc(task.sourceVersions.join(", "))}" class="cell-truncate">${esc(task.sourceVersions.join(", "))}</td><td><span class="tag ${task.status === "已完成" ? "success" : task.status === "差分失败" ? "danger" : "warning"}">${esc(task.status)}</span></td><td>${esc(task.successRate)}</td><td>${task.packageCount}</td><td>${esc(task.completedAt || "-")}</td><td><button class="link-btn" data-action="differential-task-detail" data-task-id="${esc(task.id)}">详情</button></td></tr>`).join("")}</tbody></table></div>${rows.length ? pagination(filtered.length, state.differentialTaskPage, "differential-task-page", "differentialTasks") : `<div class="empty-state differential-empty"><div><div class="empty-illustration">▤</div>暂无差分任务</div></div>`}</section>`;
  }

  function renderDifferentialPackages(identifier) {
    const query = state.filters.differentialPackage.trim().toLowerCase();
    const filtered = identifier.differentialPackages.filter(group => !query || group.targetVersion.toLowerCase().includes(query));
    const pageSize = state.pageSizes.differentialPackages;
    state.differentialPackagePage = clampPage(filtered.length, pageSize, state.differentialPackagePage);
    const rows = filtered.slice((state.differentialPackagePage - 1) * pageSize, state.differentialPackagePage * pageSize);
    const body = rows.map(group => {
      const expanded = state.expandedDifferentialPackages.includes(group.targetVersion);
      return `<tr class="differential-summary-row"><td><button class="expand-btn" data-action="toggle-differential-package" data-target-version="${esc(group.targetVersion)}" aria-label="${expanded ? "收起" : "展开"}">${expanded ? "⌄" : "›"}</button></td><td>${esc(group.targetVersion)}</td><td>${group.items.length}</td><td>${esc(group.updatedAt)}</td></tr>${expanded ? `<tr class="differential-detail-row"><td colspan="4"><div class="differential-package-detail"><h4>支持升级到该版本的源固件明细（共 ${group.items.length} 个）</h4><div class="table-wrap"><table class="data-table differential-package-detail-table"><thead><tr><th>源版本</th><th>差分包大小（KB）</th><th>差分包名称</th><th>操作</th></tr></thead><tbody>${group.items.map(item => `<tr><td>${esc(item.sourceVersion)}</td><td>${esc(item.sizeKb)}</td><td title="${esc(item.name)}" class="cell-truncate">${esc(item.name)}</td><td><div class="cell-actions"><button class="link-btn" data-action="download-differential-package" data-package-id="${esc(item.id)}">差分包下载</button><button class="link-btn danger-link" data-action="delete-differential-package" data-package-id="${esc(item.id)}" data-target-version="${esc(group.targetVersion)}">删除</button></div></td></tr>`).join("")}</tbody></table></div></div></td></tr>` : ""}`;
    }).join("");
    return `<section class="section-block differential-section"><div class="differential-toolbar"><input class="field search-field differential-search" data-filter="differentialPackage" value="${esc(state.filters.differentialPackage)}" placeholder="请输入目标版本号" aria-label="目标版本号"></div><div class="table-wrap"><table class="data-table differential-package-table"><thead><tr><th class="expand-column"></th><th>目标版本</th><th>差分包数</th><th>更新时间</th></tr></thead><tbody>${body}</tbody></table></div>${rows.length ? pagination(filtered.length, state.differentialPackagePage, "differential-package-page", "differentialPackages") : `<div class="empty-state differential-empty"><div><div class="empty-illustration">▤</div>暂无差分包</div></div>`}</section>`;
  }

  function renderColumnPopover() {
    const labels = { url: "下载地址", size: "文件大小（M）", models: "适用机型", devices: "关联设备数", features: "功能集数", creator: "创建人", note: "平台发布说明", updated: "更新时间" };
    return `<div class="action-popover column-popover"><strong>列设置</strong><label class="check"><input type="checkbox" checked disabled>固件版本号</label>${Object.entries(labels).map(([key, label]) => `<label class="check"><input type="checkbox" data-column="${key}" ${state.columns[key] ? "checked" : ""}>${label}</label>`).join("")}<label class="check"><input type="checkbox" checked disabled>操作</label></div>`;
  }

  function renderDingRecordActions(notice) {
    if (!notice) return "";
    const recallAction = canRecallDing(notice) ? `<button class="link-btn danger-link" data-action="recall-ding" data-notice-id="${esc(notice.id)}">${notice.recallStatus === "recall_failed" || notice.recallStatus === "partial_recalled" ? "重试撤回" : "撤回 DING"}</button>` : "";
    return `${recallAction}<button class="link-btn" data-action="view-ding-record" data-notice-id="${esc(notice.id)}">查看记录</button>`;
  }

  function renderLatest(identifier, version) {
    const event = activeRelease(identifier);
    const previous = rollbackTarget(identifier);
    const notice = dingRecordForEvent(event);
    const isRollback = event?.action === "rollback";
    const dingLabel = isRollback ? "不适用" : dingDisplayLabel(notice);
    const dingAction = isRollback ? "" : canSendDing(identifier, event)
      ? `<button class="link-btn" data-action="send-ding" data-release-id="${esc(event.id)}">发送 DING</button>`
      : notice?.status === "sending" || notice?.recallStatus === "recalling" ? "" : renderDingRecordActions(notice);
    const sourceNotice = isRollback ? sourceDingForRollback(identifier, event) : null;
    const sourceEvent = isRollback ? sourcePublishEventForRollback(identifier, event) : null;
    const rollbackNotice = sourceNotice ? `<div class="rollback-ding-followup ${sourceNotice.recallStatus === "recalled" ? "resolved" : sourceNotice.recallStatus === "recall_failed" ? "error" : ""}"><div><span>原发布 DING</span><strong>${esc(dingDisplayLabel(sourceNotice))}</strong><small>${esc(sourceEvent?.toVersion || event.fromVersion)} 的发布通知；回滚不会自动发送或撤回 DING</small></div><div class="rollback-ding-actions">${sourceNotice.recallStatus === "recalling" ? `<span class="muted">正在撤回，请稍候</span>` : renderDingRecordActions(sourceNotice)}</div></div>` : "";
    return `<div class="current-release-card"><div class="current-release-head"><div class="latest-version"><span class="file-mark">V</span><div><strong>${esc(version.version)}</strong><div class="muted">${isRollback ? `由 ${esc(event.fromVersion)} 回滚恢复` : previous ? `上一个发布版本 ${esc(previous.version)}` : "首次发布"}</div></div></div><div class="current-release-actions"><button class="btn small" data-action="version-detail" data-version="${esc(version.version)}">详情</button>${identifier.rollbackAvailable && previous ? `<button class="btn small danger" data-action="start-rollback" ${identifier.activeApproval ? "disabled" : ""}>撤销并回滚</button>` : `<button class="btn small" disabled title="当前没有可用的一次性回滚目标">不可回滚</button>`}</div></div><div class="current-release-grid"><div><span>生效时间</span><strong>${esc(event?.effectiveAt || version.published || version.updated)}</strong></div><div><span>APP 提醒方式</span><strong>${esc(reminderLabel(event?.reminderPolicy))}</strong></div><div><span>适用机型</span><strong>${esc(version.models)}</strong></div><div class="current-release-ding"><span>DING 状态</span><div><strong>${esc(dingLabel)}</strong>${dingAction}</div></div><div><span>文件大小</span><strong>${esc(version.size)} M</strong></div><div class="release-url"><span>下载地址</span><strong title="${esc(version.url)}">${esc(version.url)}</strong><div class="release-url-actions"><button class="link-btn" data-action="copy" data-copy="${esc(version.url)}" title="复制下载地址" aria-label="复制下载地址">▣</button><a class="link-btn" href="${esc(version.url)}" download title="下载固件" aria-label="下载固件">⇩</a></div></div></div>${rollbackNotice}</div>`;
  }

  function renderFirmwareTable(identifier) {
    const columns = state.columns;
    const pageSize = state.pageSizes.firmware;
    const rows = identifier.versions.slice((state.firmwarePage - 1) * pageSize, state.firmwarePage * pageSize);
    const headers = [`<th style="width:150px">固件版本号</th>`, columns.url && `<th style="width:230px">下载地址</th>`, columns.size && `<th style="width:105px">文件大小（M）</th>`, columns.models && `<th style="width:125px">适用机型</th>`, columns.devices && `<th style="width:110px" title="符合该版本适用机型的绑定设备数">关联设备数</th>`, columns.features && `<th style="width:90px">功能集数</th>`, columns.creator && `<th style="width:120px">创建人</th>`, columns.note && `<th style="width:190px">平台发布说明</th>`, columns.updated && `<th style="width:170px">更新时间</th>`, `<th style="width:200px">操作</th>`].filter(Boolean).join("");
    return `<div class="table-wrap firmware-table-wrap"><table class="data-table firmware-version-table ${state.density}"><thead><tr>${headers}</tr></thead><tbody>${rows.map(version => { const canEdit = version.status === "unpublished"; return `<tr><td>${esc(version.version)}</td>${columns.url ? `<td><div class="cell-actions"><span class="cell-truncate" title="${esc(version.url)}">${esc(version.url)}</span><button class="link-btn" title="复制下载地址" data-action="copy" data-copy="${esc(version.url)}">▣</button></div></td>` : ""}${columns.size ? `<td>${esc(version.size)}</td>` : ""}${columns.models ? `<td>${esc(version.models)}</td>` : ""}${columns.devices ? `<td>${formatDeviceCount(version.associatedDeviceCount)}</td>` : ""}${columns.features ? `<td>${version.features}</td>` : ""}${columns.creator ? `<td>${esc(version.creator)}</td>` : ""}${columns.note ? `<td class="cell-truncate" title="${esc(version.platformReleaseNotes)}">${esc(version.platformReleaseNotes)}</td>` : ""}${columns.updated ? `<td>${esc(version.updated)}</td>` : ""}<td><div class="cell-actions firmware-row-actions"><button class="link-btn" data-action="version-detail" data-version="${esc(version.version)}">详情</button>${canEdit ? `<button class="link-btn" data-action="publish-version" data-version="${esc(version.version)}" ${identifier.activeApproval ? "disabled" : ""}>发布</button><button class="link-btn" data-action="edit-version" data-version="${esc(version.version)}">编辑</button><button class="link-btn danger-link" data-action="delete-version" data-version="${esc(version.version)}">删除</button>` : ""}</div></td></tr>`; }).join("")}</tbody></table></div>`;
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
    if (state.modal && state.drawer) return `<div class="overlay drawer-overlay ${animateCurrentDrawer ? "is-entering" : ""}" data-action="overlay-close"></div>${renderDrawer()}<div class="overlay overlay-secondary ${animateCurrentModal ? "is-entering" : ""}" data-action="close-modal"></div>${renderModal()}`;
    if (state.modal) return `<div class="overlay ${animateCurrentModal ? "is-entering" : ""}" data-action="overlay-close"></div>${renderModal()}`;
    return `<div class="overlay drawer-overlay ${animateCurrentDrawer ? "is-entering" : ""}" data-action="overlay-close"></div>${renderDrawer()}`;
  }

  function modalFrame(title, body, footer = "", wide = false, nested = false) {
    return `<section class="modal ${wide ? "wide" : ""} ${body.includes('class="ding-config"') ? "ding-modal" : ""} ${body.includes('class="app-reminder-layout"') ? "release-modal" : ""} ${nested ? "nested-modal" : ""} ${animateCurrentModal ? "is-entering" : ""}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><header class="dialog-header"><h2>${esc(title)}</h2><button class="close-btn" data-action="${nested ? "close-modal" : "close-overlay"}" aria-label="关闭">×</button></header><div class="dialog-body">${body}</div>${footer ? `<footer class="dialog-footer">${footer}</footer>` : ""}</section>`;
  }

  function drawerFrame(title, body, footer = "", narrow = false) {
    return `<section class="drawer ${narrow ? "narrow" : ""} ${animateCurrentDrawer ? "is-entering" : ""}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><header class="drawer-header"><h2>${esc(title)}</h2><button class="close-btn" data-action="close-overlay" aria-label="关闭">×</button></header><div class="drawer-body">${body}</div>${footer ? `<footer class="drawer-footer">${footer}</footer>` : ""}</section>`;
  }

  function errorFor(name) {
    return state.errors[name] ? `<div class="error-text">${esc(state.errors[name])}</div>` : "";
  }

  function renderReminderOptions(selected, field = "reminderPolicy") {
    return `<div class="reminder-options">${reminderPolicies.map(item => `<label class="reminder-option ${selected === item.value ? "selected" : ""}"><input type="radio" name="${field}" data-modal-field="${field}" value="${item.value}" ${selected === item.value ? "checked" : ""}><span><strong>${esc(item.label)}</strong><small>${esc(item.hint)}</small></span></label>`).join("")}</div>`;
  }

  function renderAppReminderPreview(modal, version) {
    const locales = Object.keys(version.appReleaseNotes || {});
    const activeLocale = locales.includes(modal.previewLocale) ? modal.previewLocale : locales[0] || "zh-CN";
    const note = appNoteForLocale(version, activeLocale);
    const limit = appNoteLimit(activeLocale);
    const policy = modal.reminderPolicy || "unselected";
    const useChineseUi = activeLocale.toLowerCase().startsWith("zh");
    const ui = useChineseUi ? {
      appTitle: "观看台", deviceName: "无GPS", strong: "发现新的固件版本，请尽快升级", forced: "发现新固件", update: "立即升级", choose: "选择提醒方式后查看效果"
    } : {
      appTitle: "Devices", deviceName: "No GPS", strong: "New firmware available. Update soon", forced: "New firmware available", update: "Update now", choose: "Select a reminder type to preview"
    };
    const localeOptions = locales.map(locale => `<option value="${esc(locale)}" ${locale === activeLocale ? "selected" : ""}>${esc(localeName(locale))} · ${esc(locale)}</option>`).join("");
    const strongBanner = policy === "strong" ? `<div class="app-strong-banner"><span>${esc(ui.strong)}</span><b>›</b></div>` : "";
    const forcedDialog = policy === "forced-dialog" ? `<div class="app-forced-layer"><div class="app-forced-dialog"><strong>${esc(ui.forced)}</strong><p>${esc(previewSnippet(note, useChineseUi ? 52 : 96))}</p><span class="app-update-button">${esc(ui.update)}</span></div></div>` : "";
    const chooseHint = policy === "unselected" ? `<div class="app-preview-prompt">${esc(ui.choose)}</div>` : "";
    const policyHint = policy === "none" ? "无主动提示，仅保留设备设置入口" : policy === "weak" ? "设置入口红点" : policy === "strong" ? "设备卡片升级横幅" : policy === "forced-dialog" ? "持续升级弹窗" : "待选择";
    return `<aside class="app-simulator"><div class="app-simulator-head"><div><strong>APP 效果预览</strong><span>${esc(policyHint)}</span></div><select class="select" data-modal-field="previewLocale" aria-label="切换APP预览语言">${localeOptions}</select></div><div class="app-phone"><div class="app-phone-notch"></div><div class="app-phone-screen"><div class="app-status"><strong>17:14</strong><span>▮▮▮ 4G <b>86%</b></span></div><div class="app-screen-head"><strong>${esc(ui.appTitle)}</strong><span>◉　⌕　☷　▣</span></div><div class="app-device-card"><div class="app-device-main"><img src="assets/app-device-camera.png" alt="摄像机设备"><span><strong>${esc(ui.deviceName)}</strong><small>DCDG0012000GUFQ</small></span><b>›</b></div><div class="app-device-actions"><span>•••</span><span>SIM</span><span class="app-setting-icon">⚙${policy === "weak" ? `<i></i>` : ""}</span><span>♲</span></div>${strongBanner}${forcedDialog}</div>${chooseHint}<div class="app-bottom-nav"><span>▧<small>相册</small></span><strong>⌂</strong><span>♟<small>个人中心</small></span></div></div></div><div class="app-preview-copy"><div><strong>版本发布说明</strong><span class="${note.length > limit ? "over-limit" : ""}">${note.length} / ${limit}</span></div><p>${esc(note || "暂未配置当前语言的版本发布说明")}</p></div><small class="app-preview-disclaimer">仅预览提醒样式，不代表 APP 已分发或设备已执行升级</small></aside>`;
  }

  function renderReleaseSnapshot(current, target) {
    const currentConfigs = new Map((current?.featureConfigs || []).map(config => [config.key, config]));
    const targetConfigs = target.featureConfigs || [];
    const rows = targetConfigs.map(config => {
      const previous = currentConfigs.get(config.key);
      const changed = !previous || previous.value !== config.value || previous.version !== config.version;
      const previousValue = previous ? `${previous.label} V${previous.version}` : "未配置";
      const targetValue = `${config.label} V${config.version}`;
      return `<div class="feature-snapshot-row ${changed ? "changed" : ""}"><span>${esc(config.name)}</span><strong>${changed ? `${esc(previousValue)} <b>→</b> ${esc(targetValue)}` : esc(targetValue)}</strong><em>${changed ? "有变化" : "无变化"}</em></div>`;
    });
    const changedCount = targetConfigs.filter(config => {
      const previous = currentConfigs.get(config.key);
      return !previous || previous.value !== config.value || previous.version !== config.version;
    }).length;
    return `<section class="publish-snapshot"><div class="publish-snapshot-head"><div><h3>发布内容快照</h3><span>提交后与提醒策略一起进入审批快照</span></div><strong>功能集 ${targetConfigs.length} 项 · ${changedCount} 项变化</strong></div><div class="publish-summary-grid"><span>预计影响设备<strong>${formatDeviceCount(target.associatedDeviceCount)} 台</strong></span><span>适用机型<strong>${esc(target.models)}</strong></span><span>平台发布说明<strong>${esc(target.platformReleaseNotes)}</strong></span></div><div class="feature-snapshot"><div class="feature-snapshot-head"><span>功能集能力</span><strong>当前版本 → 目标版本</strong><em>结果</em></div>${rows.join("") || `<div class="feature-snapshot-empty">目标版本暂未配置功能集能力</div>`}</div></section>`;
  }

  function renderDingConfiguration(modal) {
    const selectedMembers = selectedDingScopes(modal);
    const count = dingRecipientCount(modal);
    const memberList = selectedMembers.length ? selectedMembers.map(member => `<div class="ding-selected-member"><span class="ding-member-avatar">${esc(member.name.slice(0, 1))}</span><span><strong>${esc(member.name)}</strong><small>${esc(member.role || "成员")}</small></span><button type="button" data-action="remove-ding-member" data-member-id="${esc(member.id)}" title="移除${esc(member.name)}" aria-label="移除${esc(member.name)}">×</button></div>`).join("") : `<div class="ding-selected-empty">暂未选择接收成员</div>`;
    const previewTitle = modal.type === "dingDefaults" ? "接收人模板预览" : "最终 DING 消息预览";
    return `<div class="ding-config"><div class="ding-scope-grid"><section class="ding-tree-panel"><div class="ding-tree-heading"><div><h4>选择接收范围</h4><span>可按组织、部门或成员选择</span></div><button type="button" class="link-btn" data-action="clear-ding-members" ${count ? "" : "disabled"}>清空</button></div><div class="ding-tree-search"><span>⌕</span><input class="field" data-ding-tree-query value="${esc(modal.dingTreeQuery || "")}" placeholder="搜索部门或成员" aria-label="搜索钉钉组织成员"></div><div class="ding-tree" role="tree">${dingOrganizationTree.map(node => renderDingTreeNode(node, modal)).join("") || `<div class="ding-tree-empty">没有匹配的部门或成员</div>`}</div>${errorFor("dingScopes")}</section><aside class="ding-preview"><div class="ding-selected-heading"><div><span>已选成员</span><strong>${count} 人</strong></div><small>成员已按账号去重</small></div><div class="ding-selected-list">${memberList}</div><div class="ding-message-preview"><div class="ding-message-preview-head"><span>${previewTitle}</span><small>发送时保存接收人快照</small></div><strong>[固件发布] ${esc(activeIdentifier().id)} ${esc(modal.version || modal.targetVersion || "")}</strong><p>${esc(modal.platformReleaseNotes || "发送时自动读取对应版本的平台发布说明")}</p></div></aside></div></div>`;
  }

  function renderDingSendModal(modal) {
    const identifier = activeIdentifier();
    const event = identifier.releaseEvents.find(item => item.id === modal.releaseId);
    const version = identifier.versions.find(item => item.version === event?.toVersion);
    if (!event || !version) return modalFrame("发送 DING", `<div class="empty-state"><div>当前发布事件不存在或已失效</div></div>`, `<button class="btn" data-action="close-overlay">关闭</button>`);
    const typeLabel = "发布";
    const featureSummary = (version.featureConfigs || []).map(item => `${item.name}：${item.label} V${item.version}`).join("；") || "未配置功能集能力";
    if (modal.confirmStep) {
      const recipients = resolveDingRecipients(modal.dingScopes || []);
      return modalFrame("确认发送 DING", `<div class="ding-final-confirm"><div class="confirm-icon">!</div><h3>请再次确认本次 DING</h3><p>发送任务创建后不可重试或补发；发送成功后可由有权限人员独立撤回。</p><div class="ding-confirm-grid"><span>事件类型<strong>${typeLabel}</strong></span><span>版本变化<strong>${esc(event.fromVersion || "首次发布")} → ${esc(event.toVersion)}</strong></span><span>生效时间<strong>${esc(event.effectiveAt)}</strong></span><span>实际接收人<strong>${recipients.length} 人</strong></span></div><div class="ding-confirm-recipients"><span>接收人快照</span><p>${esc(recipients.join("、"))}</p></div><div class="ding-confirm-message"><strong>[固件${typeLabel}] ${esc(identifier.id)} ${esc(event.toVersion)}</strong><p>${esc(version.platformReleaseNotes)}</p><small>${esc(featureSummary)}</small></div></div>`, `<button class="btn" data-action="back-ding-send">返回修改</button><button class="btn primary" data-action="confirm-ding-send">确认并发送</button>`, true);
    }
    return modalFrame(`发送${typeLabel} DING`, `<div class="ding-send-context"><div><span>生效事件</span><strong>${typeLabel}</strong></div><div><span>版本变化</span><strong>${esc(event.fromVersion || "首次发布")} → ${esc(event.toVersion)}</strong></div><div><span>生效时间</span><strong>${esc(event.effectiveAt)}</strong></div><div><span>功能集</span><strong>${version.featureConfigs?.length || 0} 项能力</strong></div></div><div class="ding-send-note"><span>平台发布说明</span><p>${esc(version.platformReleaseNotes)}</p></div><div class="ding-feature-summary"><span>功能集信息</span><p>${esc(featureSummary)}</p></div>${renderDingConfiguration(modal)}<div class="ding-once-warning">该发布事件仅可创建一次 DING 发送任务；发送成功或失败后均不可重试或补发。发送成功后可按权限独立撤回。</div>`, `<button class="btn" data-action="close-overlay">取消</button><button class="btn primary" data-action="review-ding-send">下一步：确认发送</button>`, true);
  }

  function renderDingRecordModal(modal) {
    const notice = db.dingNotices.find(item => item.id === modal.noticeId);
    if (!notice) return modalFrame("DING 记录", `<div class="empty-state"><div>记录不存在</div></div>`, `<button class="btn" data-action="close-overlay">关闭</button>`);
    const statusLabel = ({ sending: "发送中", sent: "发送成功", failed: "发送失败", partial_failed: "部分失败" })[notice.status] || notice.status;
    const recallDetails = notice.recallStatus !== "not_requested" ? `<div class="ding-recall-audit"><div><span>撤回状态</span><strong>${esc(dingRecallLabel(notice))}</strong></div><div><span>撤回人</span><strong>${esc(notice.recalledBy)}</strong></div><div><span>撤回时间</span><strong>${esc(notice.recalledAt)}</strong></div><div><span>撤回原因</span><strong>${esc(notice.recallReason || "-")}</strong></div>${notice.recallFailureReason ? `<p>${esc(notice.recallFailureReason)}</p>` : ""}</div>` : "";
    const terminalNote = ["sent", "partial_failed"].includes(notice.status) ? "发送任务不支持重发或补发；撤回只影响钉钉消息，不改变固件发布和回滚状态。" : "发送任务已终态，不支持重试或补发。";
    const closeAction = state.drawer ? "close-modal" : "close-overlay";
    return modalFrame("DING 发送记录", `<div class="ding-record-detail"><div class="ding-record-status ${notice.status} ${notice.recallStatus}"><span>当前状态</span><strong>${esc(dingDisplayLabel(notice))}</strong></div><div class="ding-confirm-grid"><span>通知类型<strong>发布 DING</strong></span><span>固件版本<strong>${esc(notice.version)}</strong></span><span>发送结果<strong>${esc(statusLabel)}</strong></span><span>发送时间<strong>${esc(notice.sentAt)}</strong></span></div><div class="ding-confirm-recipients"><span>实际接收人快照 · ${notice.recipients.length} 人</span><p>${esc(notice.recipients.join("、") || "-")}</p></div><div class="ding-confirm-message"><span>消息快照</span><p>${esc(notice.messageSnapshot)}</p></div>${recallDetails}<div class="ding-terminal-note">${terminalNote}</div></div>`, `<button class="btn" data-action="${closeAction}">关闭</button>${canRecallDing(notice) ? `<button class="btn danger" data-action="recall-ding" data-notice-id="${esc(notice.id)}">${notice.recallStatus === "recall_failed" || notice.recallStatus === "partial_recalled" ? "重试撤回" : "撤回 DING"}</button>` : ""}`, true, Boolean(state.drawer));
  }

  function renderDingRecallModal(modal) {
    const notice = db.dingNotices.find(item => item.id === modal.noticeId);
    const nested = Boolean(state.drawer);
    const dismissAction = nested ? "close-modal" : "close-overlay";
    if (!notice) return modalFrame("撤回 DING", `<div class="empty-state"><div>原发布 DING 记录不存在</div></div>`, `<button class="btn" data-action="${dismissAction}">关闭</button>`, false, nested);
    if (!canRecallDing(notice)) return modalFrame("撤回 DING", `<div class="empty-state"><div>当前 DING 状态不允许撤回</div></div>`, `<button class="btn" data-action="${dismissAction}">关闭</button>`, false, nested);
    if (modal.confirmStep) {
      return modalFrame("确认撤回原发布 DING", `<div class="ding-final-confirm ding-recall-confirm"><div class="confirm-icon">!</div><h3>确认撤回这条发布通知？</h3><p>撤回后不能恢复，但已阅读的内容无法从接收人的认知中消除。</p><div class="ding-confirm-grid"><span>固件版本<strong>${esc(notice.version)}</strong></span><span>实际接收人<strong>${notice.recipients.length} 人</strong></span><span>发送时间<strong>${esc(notice.sentAt)}</strong></span><span>撤回尝试<strong>第 ${notice.recallAttempts + 1} 次</strong></span></div><div class="ding-confirm-message"><span>撤回原因</span><p>${esc(modal.reason)}</p></div><div class="ding-once-warning">本操作只撤回钉钉消息，不会撤销固件发布、回滚结果、审批记录或 APP 提醒策略。</div></div>`, `<button class="btn" data-action="back-ding-recall">返回修改</button><button class="btn danger" data-action="confirm-ding-recall">确认撤回</button>`, true, nested);
    }
    return modalFrame("撤回原发布 DING", `<div class="ding-recall-summary"><div><span>固件版本</span><strong>${esc(notice.version)}</strong></div><div><span>发送状态</span><strong>${esc(({ sent: "发送成功", partial_failed: "部分失败" })[notice.status] || notice.status)}</strong></div><div><span>发送时间</span><strong>${esc(notice.sentAt)}</strong></div><div><span>接收人数</span><strong>${notice.recipients.length} 人</strong></div></div><div class="ding-confirm-message"><span>原消息快照</span><p>${esc(notice.messageSnapshot)}</p></div><div class="form-field required ding-recall-reason"><label>撤回原因</label><textarea class="textarea" data-modal-field="reason" maxlength="300" placeholder="请说明撤回原因，例如版本已回滚、通知内容有误或接收范围错误">${esc(modal.reason || "")}</textarea>${errorFor("recallReason")}<div class="helper align-right">${(modal.reason || "").length} / 300</div></div><div class="rollback-risk">撤回不会影响已经完成的固件发布或回滚；已阅读的接收人仍可能知道原通知内容。</div>`, `<button class="btn" data-action="${dismissAction}">取消</button><button class="btn danger" data-action="review-ding-recall">下一步：确认撤回</button>`, true, nested);
  }

  function renderRollbackResultModal(modal) {
    const notice = db.dingNotices.find(item => item.id === modal.noticeId);
    const noticeBlock = notice ? `<div class="rollback-result-notice"><div><span>原发布 DING</span><strong>${esc(dingDisplayLabel(notice))}</strong></div><p>回滚不会自动撤回原发布通知。${canRecallDing(notice) ? "该消息当前仍可独立撤回。" : "当前状态无需或无法撤回。"}</p></div>` : `<div class="rollback-result-notice resolved"><div><span>原发布 DING</span><strong>未发送</strong></div><p>没有需要处理的原发布通知。</p></div>`;
    return modalFrame("固件回滚成功", `<div class="approval-submit-result rollback-result"><div class="approval-result-icon">✓</div><h3>${esc(modal.version)} 已恢复为当前发布版本</h3><p>版本回滚事务已经完成，回滚事件不会创建新的 DING 通知。</p><div class="rollback-result-grid"><span>固件回滚<strong>成功</strong></span><span>回滚 DING<strong>不触发</strong></span></div>${noticeBlock}</div>`, `<button class="btn" data-action="close-overlay">完成</button>${notice && canRecallDing(notice) ? `<button class="btn danger" data-action="recall-ding" data-notice-id="${esc(notice.id)}">撤回原发布 DING</button>` : ""}`, true);
  }

  function renderApprovalSimulation(modal) {
    const approval = approvalById(modal.approvalId);
    const rollback = approval.event === "撤销并回滚固件版本";
    const dingBoundary = rollback ? "回滚事件不会触发 DING；回滚成功后仅提示是否撤回原发布 DING。" : "发布成功后可在当前发布版本中独立发送一次 DING。";
    return modalFrame(rollback ? "回滚审批已提交" : "发布审批已提交", `<div class="approval-submit-result"><div class="approval-result-icon">✓</div><h3>审批单已进入钉钉审批</h3><p>当前发布版本保持不变，审批通过后平台会重新校验快照并执行${rollback ? "回滚" : "发布"}事务。${dingBoundary}</p><div class="approval-snapshot"><span>审批事件<strong>${esc(approval.event)}</strong></span><span>目标版本<strong>${esc(approval.version)}</strong></span><span>APP 提醒<strong>${esc(reminderLabel(approval.reminderPolicy))}</strong></span><span>APP 说明<strong>${Object.keys(approval.appReleaseNotes || {}).length} 种语言</strong></span><span>功能集<strong>${(approval.featureConfigs || []).length} 项能力</strong></span><span>提交人<strong>${esc(approval.submitter)}</strong></span><span>提交时间<strong>${esc(approval.submitTime)}</strong></span></div><div class="prototype-simulation-note">原型审批模拟</div></div>`, `<button class="btn danger" data-action="simulate-approval-reject">模拟审批驳回</button><button class="btn primary" data-action="simulate-approval-approve">模拟审批通过</button>`, true);
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
    if (modal.type === "dingDefaults") {
      return modalFrame("DING 接收人模板", `<div class="notice">模板只在独立发送发布 DING 时预填接收人，不会随发布或回滚自动发送；发送前仍需确认实际接收范围。</div>${renderDingConfiguration(modal)}`, `<button class="btn" data-action="close-overlay">取消</button><button class="btn primary" data-action="save-ding-defaults">保存接收人模板</button>`, true);
    }
    if (modal.type === "sendDing") {
      return renderDingSendModal(modal);
    }
    if (modal.type === "dingRecord") {
      return renderDingRecordModal(modal);
    }
    if (modal.type === "recallDing") {
      return renderDingRecallModal(modal);
    }
    if (modal.type === "rollbackResult") {
      return renderRollbackResultModal(modal);
    }
    if (modal.type === "addDifferentialTask") {
      const identifier = activeIdentifier();
      const targetVersion = modal.targetVersion || "";
      const availableSources = identifier.versions.filter(version => version.version !== targetVersion);
      const sourceSummary = (modal.sourceVersions || []).length ? modal.sourceVersions.join(", ") : "请选择源版本";
      const sourceOptions = modal.sourceOpen ? `<div class="differential-source-dropdown">${availableSources.map(version => `<label class="check"><input type="checkbox" data-differential-source="${esc(version.version)}" ${(modal.sourceVersions || []).includes(version.version) ? "checked" : ""}>${esc(version.version)}</label>`).join("") || `<span class="muted">没有可选的源版本</span>`}</div>` : "";
      return modalFrame("新增差分任务", `<form id="differential-task-form" class="differential-task-form"><div class="form-field required"><label for="differential-task-name">差分任务名称</label><div class="field-control"><input id="differential-task-name" class="field" name="name" data-modal-field="name" maxlength="50" value="${esc(modal.name || "")}" placeholder="如：xx旧版本升级至xx新版本包的差分任务" autocomplete="off">${errorFor("differentialTaskName")}<div class="helper align-right">${(modal.name || "").length} / 50</div></div></div><div class="form-field required"><label for="differential-target-version">目标版本</label><div class="field-control"><select id="differential-target-version" class="select" name="targetVersion" data-modal-field="targetVersion"><option value="">请选择目标版本</option>${identifier.versions.map(version => `<option value="${esc(version.version)}" ${version.version === targetVersion ? "selected" : ""}>${esc(version.version)}</option>`).join("")}</select>${errorFor("differentialTargetVersion")}</div></div><div class="form-field required"><label>源版本</label><div class="field-control differential-source-control"><button class="multi-select-trigger ${(modal.sourceVersions || []).length ? "has-value" : ""}" type="button" data-action="toggle-differential-sources" aria-expanded="${Boolean(modal.sourceOpen)}"><span title="${esc(sourceSummary)}">${esc(sourceSummary)}</span><span class="select-chevron">⌄</span></button>${sourceOptions}${errorFor("differentialSourceVersions")}</div></div><div class="form-field"><label for="differential-module-model">模组型号</label><div class="field-control"><input id="differential-module-model" class="field" value="${esc(identifier.models)}" placeholder="根据固件标识自动带出" disabled></div></div></form>`, `<button class="btn" data-action="close-overlay">取 消</button><button class="btn primary" type="submit" form="differential-task-form">确 认</button>`);
    }
    if (modal.type === "publish") {
      const identifier = activeIdentifier();
      const targetVersion = findVersion(modal.version);
      const current = currentVersion(identifier);
      return modalFrame("提交固件发布审批", `<div class="release-impact"><div><span>当前发布版本</span><strong>${esc(current?.version || "-")}</strong></div><div class="impact-arrow">→</div><div><span>目标发布版本</span><strong>${esc(targetVersion.version)}</strong></div></div><div class="app-reminder-layout"><section class="app-reminder-choice"><div class="section-label required">APP 提醒方式</div>${renderReminderOptions(modal.reminderPolicy)}${errorFor("reminderPolicy")}</section>${renderAppReminderPreview(modal, targetVersion)}</div>${renderReleaseSnapshot(current, targetVersion)}<div class="approval-boundary-note">本审批只决定版本发布与 APP 提醒策略，不包含 DING 通知。发布生效后可在固件列表的当前发布版本中独立发送一次 DING。</div>`, `<button class="btn" data-action="close-overlay">取消</button><button class="btn primary" data-action="confirm-publish">提交发布审批</button>`, true);
    }
    if (modal.type === "rollback") {
      const identifier = activeIdentifier();
      const current = currentVersion(identifier);
      const targetVersion = rollbackTarget(identifier);
      const currentLocales = Object.keys(current.appReleaseNotes || {});
      const targetLocales = Object.keys(targetVersion.appReleaseNotes || {});
      const activeEvent = activeRelease(identifier);
      const originalNotice = dingRecordForEvent(activeEvent);
      const dingRisk = originalNotice ? `<div class="rollback-ding-risk"><div><span>原发布 DING</span><strong>${esc(dingDisplayLabel(originalNotice))}</strong></div><p>${canRecallDing(originalNotice) ? "回滚成功后原发布通知仍然有效，系统会提示是否独立撤回；不会自动撤回。" : "当前原发布通知无需或无法撤回，回滚流程不会改变其记录。"}</p></div>` : `<div class="rollback-ding-risk resolved"><div><span>原发布 DING</span><strong>未发送</strong></div><p>回滚成功后无需处理通知，且不会产生新的回滚 DING。</p></div>`;
      return modalFrame("撤销并回滚版本", `<div class="rollback-heading"><strong>当前版本 ${esc(current.version)} 将被撤销</strong><span>审批通过后恢复至唯一回滚目标 ${esc(targetVersion.version)}</span></div><div class="rollback-compare"><div class="compare-head"><span>对比项</span><strong>当前发布版本</strong><strong>回滚目标版本</strong><span>变化</span></div>${[["固件版本号", current.version, targetVersion.version, "切换目标"], ["版本状态", "当前发布", "历史发布", "恢复生效"], ["适用机型", current.models, targetVersion.models, current.models === targetVersion.models ? "无变化" : "存在差异"], ["功能集配置", `${current.featureConfigs.length} 项`, `${targetVersion.featureConfigs.length} 项`, current.featureConfigs.length === targetVersion.featureConfigs.length ? "无变化" : "存在差异"], ["APP 说明", `${currentLocales.length} 种语言`, `${targetLocales.length} 种语言`, sameValues(currentLocales, targetLocales) ? "无变化" : "覆盖变化"]].map(row => `<div class="compare-row"><span>${esc(row[0])}</span><strong>${esc(row[1])}</strong><strong>${esc(row[2])}</strong><em class="${row[3].includes("差异") || row[3].includes("变化") ? "changed" : ""}">${esc(row[3])}</em></div>`).join("")}</div><div class="rollback-risk">平台切换目标版本不等于设备立即执行版本更新。只有兼容且符合范围的设备，才会按本次 APP 提醒策略展示恢复提示。</div>${dingRisk}<div class="form-field required"><label>本次 APP 提醒方式</label>${renderReminderOptions(modal.reminderPolicy)}${errorFor("reminderPolicy")}</div><div class="form-field required"><label>回滚原因</label><textarea class="textarea" data-modal-field="reason" maxlength="500" placeholder="请说明问题表现、影响范围、回滚原因及后续处理计划">${esc(modal.reason || "")}</textarea>${errorFor("rollbackReason")}<div class="helper align-right">${(modal.reason || "").length} / 500</div></div><div class="approval-boundary-note">回滚审批不包含 DING 通知，回滚生效后也不会创建回滚 DING。原发布 DING 如仍可撤回，将作为独立操作提示处理。</div>`, `<button class="btn" data-action="close-overlay">取消</button><button class="btn primary" data-action="confirm-rollback">提交回滚审批</button>`, true);
    }
    if (modal.type === "approvalSimulation") {
      return renderApprovalSimulation(modal);
    }
    if (modal.type === "deleteVersion") {
      return modalFrame("删除固件版本", `<div class="confirm-icon">!</div><p class="confirm-copy">确定删除固件版本【${esc(modal.version)}】吗？删除后不可恢复。</p>`, `<button class="btn" data-action="close-overlay">取消</button><button class="btn danger" data-action="confirm-delete-version">删除</button>`);
    }
    if (modal.type === "deleteIdentifier") {
      return modalFrame("删除固件标识", `<div class="confirm-icon">!</div><p class="confirm-copy">确定删除固件标识【${esc(activeIdentifier().id)}】及其版本记录吗？</p>`, `<button class="btn" data-action="close-overlay">取消</button><button class="btn danger" data-action="confirm-delete-identifier">删除</button>`);
    }
    if (modal.type === "deleteDifferentialPackage") {
      return modalFrame("警告提示", `<div class="confirm-icon">!</div><p class="confirm-copy">删除后，该差分包将在后续 OTA 任务不可再选择使用；已创建任务不受影响。是否确认删除？</p>`, `<button class="btn" data-action="close-overlay">取消</button><button class="btn primary" data-action="confirm-delete-differential-package">确定</button>`);
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
      return modalFrame(`${module.model} 关联固件列表`, `<div class="table-wrap"><table class="data-table"><thead><tr><th>固件标识</th><th>所属产线</th><th>APP 提醒方式</th><th>关联时间</th></tr></thead><tbody>${linked.map(identifier => `<tr><td>${esc(identifier.id)}</td><td>${esc(identifier.product)}</td><td>-</td><td>${esc(module.linkedAt)}</td></tr>`).join("")}</tbody></table></div>${linked.length ? "" : `<div class="empty-state compact-empty"><div><div class="empty-illustration">▤</div>暂无数据</div></div>`}`, "", true);
    }
    if (modal.type === "featurePicker") {
      return renderFeaturePicker();
    }
    if (modal.type === "editAppNotes") {
      const notes = modal.notesDraft;
      const available = localeCatalog.filter(item => !(item.locale in notes));
      return modalFrame("维护 APP 更新说明", `<div class="revision-warning">已发布文案修改无需重新审批，但会生成不可覆盖的修订记录并立即失效 APP 升级检查缓存。中文、日文、韩文最多80字，其他语言最多160个字符。</div><div class="revision-note-list">${Object.entries(notes).map(([locale, content]) => `<div class="revision-note-item"><div><strong>${esc(localeName(locale))}</strong><span>${esc(locale)} ${["zh-CN", "en-US"].includes(locale) ? "· 必填" : "· 选填"}</span></div>${["zh-CN", "en-US"].includes(locale) ? "" : `<button class="link-btn danger-link" data-action="remove-revision-locale" data-locale="${locale}">删除</button>`}<textarea class="textarea" data-revision-locale="${locale}" maxlength="${appNoteLimit(locale)}">${esc(content)}</textarea>${errorFor(`revision-${locale}`)}<div class="helper align-right">${content.length} / ${appNoteLimit(locale)}</div></div>`).join("")}</div>${available.length ? `<div class="form-field"><label>添加其他语言</label><select class="select" data-change="add-revision-locale"><option value="">请选择 Locale</option>${available.map(item => `<option value="${item.locale}">${esc(item.label)} · ${item.locale}</option>`).join("")}</select></div>` : ""}<div class="form-field required"><label>修改原因</label><textarea class="textarea" data-revision-reason maxlength="200" placeholder="请说明翻译修正、措辞优化或其他修改原因">${esc(modal.reason || "")}</textarea>${errorFor("revisionReason")}</div>`, `<button class="btn" data-action="close-modal">取消</button><button class="btn primary" data-action="save-app-notes">保存修订</button>`, true, true);
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
    if (drawer.type === "differentialTaskDetail") return renderDifferentialTaskDetail(drawer.taskId);
    if (drawer.type === "userDetail") return renderUserDetail(db.users[drawer.userIndex]);
    if (drawer.type === "userPermissions") return renderUserPermissions(db.users[drawer.userIndex]);
    return "";
  }

  function renderDifferentialTaskDetail(taskId) {
    const task = activeIdentifier().differentialTasks.find(item => item.id === taskId);
    if (!task) return "";
    return drawerFrame("差分任务详情", `<div class="differential-task-summary"><div><strong>${esc(task.name)}</strong><span class="tag ${task.status === "已完成" ? "success" : task.status === "差分失败" ? "danger" : "warning"}">${esc(task.status)}</span></div><p><span>创建时间：</span>${esc(task.createdAt)}</p></div><div class="drawer-section differential-task-table-section"><div class="table-wrap"><table class="data-table differential-task-detail-table"><thead><tr><th>源版本</th><th>目标版本</th><th>模组型号</th><th>差分状态</th><th>失败原因</th><th>操作</th></tr></thead><tbody>${task.items.map(item => `<tr><td>${esc(item.sourceVersion)}</td><td>${esc(item.targetVersion)}</td><td>${esc(item.moduleModel)}</td><td><span class="tag ${item.status === "已完成" ? "success" : item.status === "差分失败" ? "danger" : "warning"}">${esc(item.status)}</span></td><td>${esc(item.failureReason || "-")}</td><td>${item.status === "已完成" ? `<button class="link-btn" data-action="download-differential-package" data-package-name="${esc(item.packageName)}">差分包下载</button>` : "-"}</td></tr>`).join("")}</tbody></table></div></div>`);
  }

  function renderVersionFormDrawer(title, version) {
    const editing = Boolean(version);
    const upload = state.upload;
    const formDraft = state.drawer.formDraft || { version: version?.version || upload?.version || "", models: version?.models || "", note: version?.note === "-" ? "" : version?.note || "" };
    const generatedVersion = formDraft.version;
    const associatedFeatures = state.drawer?.associatedFeatures || [];
    const appReleaseNotes = state.drawer.appReleaseNotes || clone(version?.appReleaseNotes || { "zh-CN": "", "en-US": "" });
    const activeLocale = state.drawer.activeLocale || "zh-CN";
    const activeLocaleLabel = activeLocale === "zh-CN" ? "简体中文" : activeLocale === "en-US" ? "English" : localeCatalog.find(item => item.locale === activeLocale)?.label || activeLocale;
    const availableLocales = localeCatalog.filter(item => !(item.locale in appReleaseNotes));
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
    return drawerFrame(title, `<form id="version-form"><input type="hidden" name="mode" value="${editing ? "edit" : "add"}"><input type="hidden" name="version" value="${esc(generatedVersion)}"><div class="form-grid"><div class="form-field required"><label>固件标识</label><input class="field" value="${esc(activeIdentifier().id)}" disabled placeholder="固件标识"></div><div class="form-field required"><label>固件版本号</label><input class="field" value="${esc(generatedVersion)}" disabled placeholder="上传文件后自动生成">${errorFor("version")}</div><div class="form-field required"><label>上传固件包</label>${uploadCard}${errorFor("file")}</div>${md5Field}<div class="form-field required"><label>适用机型</label><input class="field" name="models" data-version-draft="models" maxlength="100" value="${esc(formDraft.models)}" placeholder="请输入适用机型">${errorFor("models")}<div class="helper align-right">${formDraft.models.length} / 100</div></div></div><div class="drawer-section capability-section"><h3>功能集</h3>${configurable ? `<div class="capability-notice">● 提示：当前固件版本【${esc(generatedVersion)}】支持以下功能集配置；请直接选择对应版本后提交。</div><div class="capability-list">${capabilityCards}</div>${errorFor("capabilities")}` : ""}</div><div class="drawer-section"><div class="form-field required"><label>平台发布说明</label><textarea class="textarea release-note-textarea" name="platformNote" data-version-draft="note" maxlength="500" placeholder="请填写主要变更、修复问题、影响范围、测试情况和已知风险">${esc(formDraft.note)}</textarea>${errorFor("platformNote")}<div class="helper align-right">${formDraft.note.length} / 500</div></div></div><div class="drawer-section"><div class="section-bar"><div><h3>APP 固件版本更新说明</h3><span class="subtle">简体中文和 English 固定必填；中日韩80字，其他语言160字符</span></div>${availableLocales.length ? `<select class="select locale-add-select" data-change="add-locale"><option value="">＋ 添加语言</option>${availableLocales.map(item => `<option value="${item.locale}">${esc(item.label)} · ${item.locale}</option>`).join("")}</select>` : ""}</div>${errorFor("appNotes")}<div class="locale-editor"><aside class="locale-list">${Object.keys(appReleaseNotes).map(locale => `<button type="button" class="locale-item ${locale === activeLocale ? "active" : ""}" data-action="select-locale" data-locale="${locale}"><span>${esc(localeName(locale))}</span><small>${esc(locale)}</small>${["zh-CN", "en-US"].includes(locale) ? `<em>必填</em>` : `<em class="optional">选填</em>`}</button>`).join("")}</aside><div class="locale-writing"><div class="locale-writing-head"><div><strong>${esc(activeLocaleLabel)}</strong><span>Locale：${esc(activeLocale)}</span></div>${["zh-CN", "en-US"].includes(activeLocale) ? "" : `<button type="button" class="link-btn danger-link" data-action="remove-locale" data-locale="${activeLocale}">删除语言</button>`}</div><textarea class="textarea locale-textarea" data-app-note="${esc(activeLocale)}" maxlength="${appNoteLimit(activeLocale)}" placeholder="请输入面向 APP 用户的固件更新说明">${esc(appReleaseNotes[activeLocale] || "")}</textarea>${errorFor(`locale-${activeLocale}`)}<div class="helper align-right">${(appReleaseNotes[activeLocale] || "").length} / ${appNoteLimit(activeLocale)}</div></div></div></div><div class="drawer-section"><div class="section-bar"><h3>关联功能</h3><button class="btn primary small" type="button" data-action="add-associated-feature">＋ 添加功能</button></div><div class="table-wrap"><table class="data-table associated-table"><thead><tr><th>功能项名称</th><th>功能示意图</th><th>操作</th></tr></thead><tbody>${associatedFeatures.map((feature, index) => `<tr><td>${esc(feature.name)}</td><td><span class="feature-image-placeholder">${esc(feature.imageLabel || "功能")}</span></td><td><button class="link-btn danger-link" type="button" data-action="remove-associated-feature" data-feature-index="${index}">删除</button></td></tr>`).join("")}</tbody></table></div>${associatedFeatures.length ? "" : `<div class="empty-state compact-empty"><div><div class="empty-illustration">▤</div>暂无数据</div></div>`}</div></form>`, `<button class="btn" data-action="close-overlay">取消</button><button class="btn primary" type="submit" form="version-form" ${configurable ? "" : "disabled"}>${editing ? "保存" : "确认创建"}</button>`);
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
    if (tab === "appNotes") {
      const maintainable = !activeIdentifier().activeApproval && (version.status === "current" || activeIdentifier().rollbackTargetVersion === version.version);
      const revisions = version.noteRevisions || [];
      tabContent = `<div class="detail-section-toolbar"><div><strong>APP 固件版本更新说明</strong><span>共 ${Object.keys(version.appReleaseNotes || {}).length} 种语言，未匹配时使用 en-US</span></div>${maintainable ? `<button class="btn small primary" data-action="maintain-app-notes" data-version="${esc(version.version)}">维护文案</button>` : ""}</div><div class="table-wrap"><table class="data-table detail-content-table app-note-table"><thead><tr><th>语言</th><th>Locale</th><th>更新说明</th></tr></thead><tbody>${Object.entries(version.appReleaseNotes || {}).map(([locale, content]) => `<tr><td>${esc(locale === "zh-CN" ? "简体中文" : locale === "en-US" ? "English" : localeCatalog.find(item => item.locale === locale)?.label || locale)}</td><td>${esc(locale)}</td><td>${esc(content)}</td></tr>`).join("")}</tbody></table></div><div class="revision-list"><h4>文案修订记录</h4>${revisions.map(item => `<article><div><strong>${esc(item.operator)}</strong><span>${esc(item.time)}</span></div><p>${esc(item.reason)}</p><small>修订版本 R${item.recordVersion}</small></article>`).join("") || `<div class="empty-state compact-empty"><div>暂无修订记录</div></div>`}</div>`;
    }
    if (tab === "releases") {
      const records = releaseEventsForVersion(version);
      tabContent = records.length ? `<div class="release-event-list">${records.map(event => `<article><div class="release-event-mark ${event.action}">${event.action === "rollback" ? "回" : "发"}</div><div><strong>${event.action === "rollback" ? "回滚恢复" : "正常发布"} · ${esc(event.fromVersion || "-")} → ${esc(event.toVersion)}</strong><span>${esc(event.effectiveAt)} · ${esc(event.operator)} · ${esc(reminderLabel(event.reminderPolicy))}</span><small>发布标识 ${esc(event.id)} · ${event.status === "active" ? "当前生效" : event.status === "rolled_back" ? "已回滚" : "历史事件"}</small></div></article>`).join("")}</div>` : `<div class="empty-state"><div><div class="empty-illustration">▤</div>暂无发布记录</div></div>`;
    }
    if (tab === "ding") {
      const notices = dingRecordsForVersion(version);
      tabContent = notices.length ? `<div class="table-wrap"><table class="data-table detail-content-table ding-record-table"><thead><tr><th>通知类型</th><th>发送结果</th><th>撤回状态</th><th>实际接收人快照</th><th>发送时间</th><th>操作</th></tr></thead><tbody>${notices.map(notice => `<tr><td>发布 DING</td><td><span class="tag ${notice.status === "sent" ? "success" : ["failed", "partial_failed"].includes(notice.status) ? "danger" : "warning"}">${esc(({ sending: "发送中", sent: "发送成功", failed: "发送失败", partial_failed: "部分失败" })[notice.status] || notice.status)}</span>${notice.failureReason ? `<small class="ding-failure">${esc(notice.failureReason)}</small>` : ""}</td><td><span class="tag ${notice.recallStatus === "recalled" ? "success" : notice.recallStatus === "recall_failed" ? "danger" : ""}">${esc(dingRecallLabel(notice))}</span></td><td>${esc(notice.recipients.join(" / ") || "-")}</td><td>${esc(notice.sentAt)}</td><td><div class="cell-actions">${canRecallDing(notice) ? `<button class="link-btn danger-link" data-action="recall-ding" data-notice-id="${esc(notice.id)}">${notice.recallStatus === "recall_failed" ? "重试撤回" : "撤回"}</button>` : ""}<button class="link-btn" data-action="view-ding-record" data-notice-id="${esc(notice.id)}">查看</button></div></td></tr>`).join("")}</tbody></table></div>` : `<div class="empty-state"><div><div class="empty-illustration">▤</div>暂无 DING 记录</div></div>`;
    }
    const event = releaseEventsForVersion(version)[0];
    return drawerFrame("固件版本详情", `<div class="detail-hero"><h3>${esc(version.version)} <span class="tag ${version.status === "current" ? "success" : version.status === "withdrawn" ? "danger" : ""}">${esc(versionStatusLabel(version.status))}</span></h3><div class="detail-note"><span>平台发布说明</span><strong>${esc(version.platformReleaseNotes)}</strong></div><div class="detail-stats four"><div class="detail-stat"><span>适用机型</span><strong>${esc(version.models)}</strong></div><div class="detail-stat"><span>APP 提醒方式</span><strong>${esc(reminderLabel(event?.reminderPolicy) || version.reminder || "不提醒")}</strong></div><div class="detail-stat"><span>APP 说明</span><strong>${Object.keys(version.appReleaseNotes || {}).length} 种语言</strong></div><div class="detail-stat"><span>生效时间</span><strong>${esc(event?.effectiveAt || version.published || "未发布")}</strong></div></div></div><div class="drawer-section detail-basic-section"><h3>基础信息</h3><table class="info-list detail-info-list"><tr><td>固件版本号</td><td>${esc(version.version)}</td></tr><tr><td>固件标识</td><td>${esc(activeIdentifier().id)}</td></tr><tr><td>文件大小</td><td>${esc(version.size)} M</td></tr><tr><td>固件包下载地址</td><td><div class="detail-url"><span>${esc(version.url)}</span><button class="link-btn" title="复制下载地址" data-action="copy" data-copy="${esc(version.url)}">▣</button></div></td></tr><tr><td>创建时间</td><td>${esc(version.created || version.updated)}</td></tr><tr><td>创建人</td><td>${esc(version.creator)}</td></tr></table></div><div class="tab-strip detail-tabs"><button class="tab ${tab === "features" ? "active" : ""}" data-action="detail-tab" data-tab="features">功能集配置</button><button class="tab ${tab === "appNotes" ? "active" : ""}" data-action="detail-tab" data-tab="appNotes">APP 更新说明</button><button class="tab ${tab === "related" ? "active" : ""}" data-action="detail-tab" data-tab="related">关联功能</button><button class="tab ${tab === "releases" ? "active" : ""}" data-action="detail-tab" data-tab="releases">发布记录</button><button class="tab ${tab === "approvals" ? "active" : ""}" data-action="detail-tab" data-tab="approvals">审批日志</button><button class="tab ${tab === "ding" ? "active" : ""}" data-action="detail-tab" data-tab="ding">DING 记录</button></div><div class="detail-tab-content">${tabContent}</div>`);
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

  function submitReleaseApproval(type, config) {
    const identifier = activeIdentifier();
    if (identifier.activeApproval) {
      toast("当前固件标识已有生效审批，请先处理现有审批", "warning");
      return null;
    }
    const isRollback = type === "rollback";
    const target = isRollback ? rollbackTarget(identifier) : findVersion(config.version);
    const current = currentVersion(identifier);
    const sourceEvent = isRollback ? activeRelease(identifier) : null;
    const sourceNotice = isRollback ? dingRecordForEvent(sourceEvent) : null;
    const flowId = releaseId(isRollback ? "FLOW-ROLLBACK" : "FLOW-PUB");
    const approval = {
      id: releaseId("APR"),
      version: target.version,
      event: isRollback ? "撤销并回滚固件版本" : "发布当前固件版本",
      submitter: "汤彦珊",
      submitTime: now(),
      approver: "-",
      status: "审批中",
      approveTime: "-",
      note: isRollback ? config.reason : target.platformReleaseNotes,
      type,
      firmwareId: identifier.id,
      fromVersion: current?.version || null,
      toVersion: target.version,
      reminderPolicy: config.reminderPolicy,
      platformReleaseNotes: target.platformReleaseNotes,
      appReleaseNotes: clone(target.appReleaseNotes || {}),
      featureConfigs: clone(target.featureConfigs || []),
      reason: config.reason || "",
      snapshotRecordVersion: target.recordVersion,
      sourceReleaseId: sourceEvent?.id || null,
      sourceNoticeId: sourceNotice?.id || null
      , flowId
    };
    db.approvals.unshift(approval);
    identifier.activeApproval = { approvalId: approval.id, type, version: target.version };
    if (!isRollback) target.status = "approval";
    addOperation(isRollback ? "固件回滚" : "固件申请", "提交审批", target.version);
    addLifecycleEvent(identifier, { flowId, flowType: isRollback ? "rollback" : "publish", flowStatus: "pending", fromVersion: current?.version || null, toVersion: target.version, stage: "approval", title: isRollback ? "提交回滚审批" : "提交发布审批", operator: approval.submitter, result: "success", summary: `审批快照已锁定，目标版本 ${target.version}` });
    state.expandedLifecycleFlows = [flowId];
    persist();
    return approval;
  }

  function executeApprovedRelease(approval) {
    const identifier = db.identifiers.find(item => item.id === approval.firmwareId);
    if (!identifier || identifier.activeApproval?.approvalId !== approval.id) return { ok: false, message: "审批已失效，当前固件状态已发生变化" };
    const target = identifier.versions.find(version => version.version === approval.toVersion);
    const current = currentVersion(identifier);
    if (!target || target.recordVersion !== approval.snapshotRecordVersion) return { ok: false, message: "目标版本已发生变化，原审批快照失效" };
    const stamp = now();
    addLifecycleEvent(identifier, { flowId: approval.flowId || releaseId("FLOW"), flowType: approval.type === "rollback" ? "rollback" : "publish", flowStatus: "active", fromVersion: approval.fromVersion, toVersion: approval.toVersion, stage: "approval", title: approval.type === "rollback" ? "回滚审批通过" : "发布审批通过", time: stamp, operator: "IPC 产品线负责人", operatorType: "钉钉审批", result: "success", summary: "审批回调与版本快照校验通过" });
    if (approval.type === "publish") {
      if (target.status !== "approval" || current?.version !== approval.fromVersion) return { ok: false, message: "当前发布版本已变化，原发布审批失效" };
      identifier.versions.forEach(version => { version.latest = false; if (version.status === "current") version.status = "historical"; });
      target.status = "current";
      target.latest = true;
      target.published = stamp;
      target.reminder = reminderLabel(approval.reminderPolicy);
      const previousEvent = activeRelease(identifier);
      if (previousEvent) {
        previousEvent.status = "superseded";
        previousEvent.rollbackAvailable = false;
        setLifecycleFlowStatus(identifier, previousEvent.flowId, previousEvent.action === "rollback" ? "completed" : "superseded");
      }
      const event = { id: releaseId("REL"), flowId: approval.flowId, action: "publish", fromVersion: current?.version || null, toVersion: target.version, status: "active", reminderPolicy: approval.reminderPolicy, rollbackTargetVersion: current?.version || null, rollbackAvailable: Boolean(current), effectiveAt: stamp, operator: approval.submitter, approvalId: approval.id };
      identifier.releaseEvents.unshift(event);
      identifier.currentVersion = target.version;
      identifier.rollbackTargetVersion = current?.version || null;
      identifier.rollbackAvailable = Boolean(current);
      addOperation("固件申请", "发布", target.version);
      addLifecycleEvent(identifier, { flowId: approval.flowId, flowType: "publish", flowStatus: "active", fromVersion: current?.version || null, toVersion: target.version, stage: "release", title: "当前发布版本切换", time: stamp, operator: "发布服务", operatorType: "系统", result: "success", summary: `${current?.version || "首次发布"} -> ${target.version}，生成 ${event.id}` });
    } else {
      if (!identifier.rollbackAvailable || current?.version !== approval.fromVersion || identifier.rollbackTargetVersion !== target.version) return { ok: false, message: "唯一回滚目标已变化，原回滚审批失效" };
      current.status = "withdrawn";
      current.latest = false;
      target.status = "current";
      target.latest = true;
      target.reminder = reminderLabel(approval.reminderPolicy);
      const previousEvent = activeRelease(identifier);
      if (previousEvent) {
        previousEvent.status = "rolled_back";
        previousEvent.rollbackAvailable = false;
        setLifecycleFlowStatus(identifier, previousEvent.flowId, "rolled_back");
      }
      const event = { id: releaseId("ROLLBACK"), flowId: approval.flowId, action: "rollback", fromVersion: current.version, toVersion: target.version, status: "active", reminderPolicy: approval.reminderPolicy, rollbackTargetVersion: null, rollbackAvailable: false, effectiveAt: stamp, operator: approval.submitter, approvalId: approval.id, reason: approval.reason, sourceReleaseId: previousEvent?.id || approval.sourceReleaseId || null };
      identifier.releaseEvents.unshift(event);
      identifier.currentVersion = target.version;
      identifier.rollbackTargetVersion = null;
      identifier.rollbackAvailable = false;
      addOperation("固件回滚", "回滚生效", `${current.version} → ${target.version}`);
      addLifecycleEvent(identifier, { flowId: approval.flowId, flowType: "rollback", flowStatus: "active", fromVersion: current.version, toVersion: target.version, stage: "rollback", title: "回滚版本切换成功", time: stamp, operator: "发布服务", operatorType: "系统", result: "success", summary: `${current.version} -> ${target.version}，原发布链路已关闭回滚入口` });
    }
    identifier.activeApproval = null;
    approval.status = "审批通过";
    approval.approver = "IPC 产品线负责人";
    approval.approveTime = stamp;
    persist();
    const sourceNoticeId = approval.type === "rollback" ? (approval.sourceNoticeId || db.dingNotices.find(notice => notice.releaseId === approval.sourceReleaseId)?.id || null) : null;
    return { ok: true, version: target.version, type: approval.type, sourceNoticeId };
  }

  function rejectReleaseApproval(approval) {
    const identifier = db.identifiers.find(item => item.id === approval.firmwareId);
    const target = identifier?.versions.find(version => version.version === approval.toVersion);
    if (approval.type === "publish" && target?.status === "approval") target.status = "unpublished";
    if (identifier?.activeApproval?.approvalId === approval.id) identifier.activeApproval = null;
    approval.status = "审批驳回";
    approval.approver = "IPC 产品线负责人";
    approval.approveTime = now();
    approval.note = approval.reason || "当前发布风险未确认，审批驳回";
    addOperation(approval.type === "rollback" ? "固件回滚" : "固件申请", "审批驳回", approval.version);
    if (identifier) addLifecycleEvent(identifier, { flowId: approval.flowId || releaseId("FLOW"), flowType: approval.type === "rollback" ? "rollback" : "publish", flowStatus: "rejected", fromVersion: approval.fromVersion, toVersion: approval.toVersion, stage: "approval", title: approval.type === "rollback" ? "回滚审批驳回" : "发布审批驳回", operator: "IPC 产品线负责人", operatorType: "钉钉审批", result: "rejected", summary: approval.note });
    persist();
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
      state.firmwareTab = "firmware";
      state.filters.lifecycleQuery = "";
      state.firmwarePage = 1;
      state.differentialTaskPage = 1;
      state.differentialPackagePage = 1;
      state.expandedDifferentialPackages = [];
      state.expandedLifecycleFlows = [lifecycleFlows(activeIdentifier().lifecycleEvents || []).find(flow => flow.flowStatus === "active")?.flowId].filter(Boolean);
      state.popover = null;
      renderShell();
      return;
    }
    if (action === "firmware-subtab") {
      const tab = target.dataset.tab;
      if (!["firmware", "lifecycle"].includes(tab) && activeIdentifier().product !== "4G模组") return;
      state.firmwareTab = tab;
      state.popover = null;
      renderShell();
      return;
    }
    if (action === "set-lifecycle-range") {
      state.filters.lifecycleRange = target.dataset.range;
      if (state.filters.lifecycleRange !== "custom") {
        state.filters.lifecycleStart = "";
        state.filters.lifecycleEnd = "";
      }
      const firstVisible = lifecycleFlows(lifecycleFilteredEvents(activeIdentifier())).filter(lifecycleFlowInRange)[0];
      state.expandedLifecycleFlows = firstVisible ? [firstVisible.flowId] : [];
      renderShell();
      return;
    }
    if (action === "apply-lifecycle-filter") {
      if (state.filters.lifecycleRange === "custom" && state.filters.lifecycleStart && state.filters.lifecycleEnd && state.filters.lifecycleStart > state.filters.lifecycleEnd) {
        toast("开始日期不能晚于结束日期", "warning");
        return;
      }
      const firstMatch = lifecycleFlows(lifecycleFilteredEvents(activeIdentifier())).filter(lifecycleFlowInRange)[0];
      state.expandedLifecycleFlows = firstMatch ? [firstMatch.flowId] : [];
      renderShell();
      return;
    }
    if (action === "reset-lifecycle-filter") {
      state.filters.lifecycleQuery = "";
      state.filters.lifecycleRange = "7d";
      state.filters.lifecycleStart = "";
      state.filters.lifecycleEnd = "";
      state.expandedLifecycleFlows = [lifecycleFlows(activeIdentifier().lifecycleEvents || []).filter(lifecycleFlowInRange).find(flow => flow.flowStatus === "active")?.flowId].filter(Boolean);
      renderShell();
      return;
    }
    if (action === "toggle-lifecycle-flow") {
      const flowId = target.dataset.flowId;
      state.expandedLifecycleFlows = state.expandedLifecycleFlows.includes(flowId) ? [] : [flowId];
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
    if (action === "ding-defaults") {
      const defaults = activeIdentifier().dingDefaults;
      state.popover = null;
      state.errors = {};
      state.modal = { type: "dingDefaults", version: "接收人模板", dingScopes: normalizeDingScopeIds(defaults.scopes), dingExpanded: dingExpandedNodeIds(), dingTreeQuery: "", platformReleaseNotes: "发送时自动读取对应版本的平台发布说明" };
      renderShell();
      return;
    }
    if (action === "save-ding-defaults") {
      if (!state.modal.dingScopes.length) { state.errors.dingScopes = "请至少选择一个模板接收成员"; renderShell(); return; }
      activeIdentifier().dingDefaults = { scopes: normalizeDingScopeIds(state.modal.dingScopes), source: "identifier" };
      addOperation("DING 接收人模板", "更新", activeIdentifier().id);
      persist();
      closeOverlay();
      toast("DING 接收人模板已保存");
      return;
    }
    if (action === "send-ding") {
      const identifier = activeIdentifier();
      const event = identifier.releaseEvents.find(item => item.id === target.dataset.releaseId);
      if (!canSendDing(identifier, event)) { toast("仅当前生效且未创建任务的正常发布事件可以发送 DING", "warning"); return; }
      const version = identifier.versions.find(item => item.version === event.toVersion);
      state.errors = {};
      state.modal = { type: "sendDing", releaseId: event.id, version: event.toVersion, dingScopes: normalizeDingScopeIds(identifier.dingDefaults.scopes), dingExpanded: dingExpandedNodeIds(), dingTreeQuery: "", platformReleaseNotes: version?.platformReleaseNotes || "" };
      renderShell();
      return;
    }
    if (action === "review-ding-send") {
      if (!state.modal.dingScopes.length) { state.errors.dingScopes = "请至少选择一名实际接收人"; renderShell(); return; }
      state.modal.confirmStep = true;
      renderShell();
      return;
    }
    if (action === "back-ding-send") {
      state.modal.confirmStep = false;
      renderShell();
      return;
    }
    if (action === "confirm-ding-send") {
      const identifier = activeIdentifier();
      const event = identifier.releaseEvents.find(item => item.id === state.modal.releaseId);
      if (!canSendDing(identifier, event)) { closeOverlay(); toast("当前发布事件已失效、进入审批或已经创建过 DING 任务", "warning"); return; }
      const notice = createDingRecord(identifier, event, state.modal);
      if (!notice) { state.errors.dingScopes = "接收人无效，请返回重新选择"; state.modal.confirmStep = false; renderShell(); return; }
      addOperation("DING 通知", "创建发送任务", `${identifier.id} ${event.toVersion}`);
      persist();
      closeOverlay();
      toast("DING 发送任务已创建，正在发送");
      window.setTimeout(() => finalizeDingRecord(notice.id), 900);
      return;
    }
    if (action === "view-ding-record") {
      const notice = db.dingNotices.find(item => item.id === target.dataset.noticeId);
      if (!notice) { toast("DING 记录不存在", "warning"); return; }
      state.modal = { type: "dingRecord", noticeId: notice.id };
      renderShell();
      return;
    }
    if (action === "recall-ding") {
      const notice = db.dingNotices.find(item => item.id === target.dataset.noticeId);
      if (!notice || !canRecallDing(notice)) { toast("当前 DING 状态不允许撤回", "warning"); return; }
      state.errors = {};
      state.modal = { type: "recallDing", noticeId: notice.id, reason: notice.recallStatus === "recall_failed" ? notice.recallReason : "", confirmStep: false };
      renderShell();
      return;
    }
    if (action === "review-ding-recall") {
      state.errors = {};
      if (!String(state.modal.reason || "").trim()) state.errors.recallReason = "请填写撤回原因";
      if (Object.keys(state.errors).length) { renderShell(); return; }
      state.modal.reason = state.modal.reason.trim();
      state.modal.confirmStep = true;
      renderShell();
      return;
    }
    if (action === "back-ding-recall") {
      state.modal.confirmStep = false;
      renderShell();
      return;
    }
    if (action === "confirm-ding-recall") {
      const notice = db.dingNotices.find(item => item.id === state.modal.noticeId);
      if (!notice || !canRecallDing(notice)) { closeOverlay(); toast("DING 状态已变化，无法撤回", "warning"); return; }
      notice.recallStatus = "recalling";
      notice.recallAttempts += 1;
      notice.recallReason = String(state.modal.reason || "").trim();
      notice.recalledBy = "汤彦珊";
      notice.recallFailureReason = "";
      addOperation("DING 通知", "提交撤回", `${notice.firmwareId} ${notice.version}`);
      persist();
      state.modal = null;
      state.errors = {};
      renderShell();
      toast("DING 撤回请求已提交，正在处理");
      window.setTimeout(() => finalizeDingRecall(notice.id), 900);
      return;
    }
    if (action === "toggle-ding-tree-node") {
      const nodeId = target.dataset.nodeId;
      state.modal.dingExpanded = (state.modal.dingExpanded || []).includes(nodeId) ? state.modal.dingExpanded.filter(id => id !== nodeId) : [...(state.modal.dingExpanded || []), nodeId];
      renderShell();
      return;
    }
    if (action === "clear-ding-members") {
      state.modal.dingScopes = [];
      renderShell();
      return;
    }
    if (action === "remove-ding-member") {
      state.modal.dingScopes = normalizeDingScopeIds(state.modal.dingScopes).filter(id => id !== target.dataset.memberId);
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
    if (action === "add-differential-task") {
      const identifier = activeIdentifier();
      if (identifier.product !== "4G模组") return;
      if (identifier.versions.length < 2) { toast("至少需要两个固件版本才能创建差分任务", "warning"); return; }
      state.errors = {};
      state.modal = { type: "addDifferentialTask", name: "", targetVersion: "", sourceVersions: [], sourceOpen: false };
      renderShell();
      return;
    }
    if (action === "toggle-differential-sources") {
      if (state.modal?.type !== "addDifferentialTask") return;
      state.modal.sourceOpen = !state.modal.sourceOpen;
      renderShell();
      return;
    }
    if (action === "differential-task-detail") {
      state.drawer = { type: "differentialTaskDetail", taskId: target.dataset.taskId };
      renderShell();
      return;
    }
    if (action === "differential-status-filter") {
      state.popover = state.popover === "differentialStatus" ? null : "differentialStatus";
      renderShell();
      return;
    }
    if (action === "set-differential-status") {
      state.filters.differentialTaskStatus = target.dataset.status || "";
      state.differentialTaskPage = 1;
      state.popover = null;
      renderShell();
      return;
    }
    if (action === "toggle-differential-package") {
      const version = target.dataset.targetVersion;
      state.expandedDifferentialPackages = state.expandedDifferentialPackages.includes(version) ? state.expandedDifferentialPackages.filter(item => item !== version) : [...state.expandedDifferentialPackages, version];
      renderShell();
      return;
    }
    if (action === "download-differential-package") {
      const identifier = activeIdentifier();
      const packageItem = identifier.differentialPackages.flatMap(group => group.items).find(item => item.id === target.dataset.packageId);
      const name = target.dataset.packageName || packageItem?.name || "差分包";
      addOperation("差分包", "下载", name);
      persist();
      toast(`差分包 ${name} 已开始下载`);
      return;
    }
    if (action === "delete-differential-package") {
      state.modal = { type: "deleteDifferentialPackage", packageId: target.dataset.packageId, targetVersion: target.dataset.targetVersion };
      renderShell();
      return;
    }
    if (action === "confirm-delete-differential-package") {
      const identifier = activeIdentifier();
      const group = identifier.differentialPackages.find(item => item.targetVersion === state.modal.targetVersion);
      const packageItem = group?.items.find(item => item.id === state.modal.packageId);
      if (!group || !packageItem) { closeOverlay(); toast("差分包已不存在", "warning"); return; }
      group.items = group.items.filter(item => item.id !== packageItem.id);
      if (!group.items.length) {
        identifier.differentialPackages = identifier.differentialPackages.filter(item => item !== group);
        state.expandedDifferentialPackages = state.expandedDifferentialPackages.filter(item => item !== group.targetVersion);
      } else {
        group.updatedAt = now();
      }
      state.differentialPackagePage = clampPage(identifier.differentialPackages.length, state.pageSizes.differentialPackages, state.differentialPackagePage);
      addOperation("差分包", "删除", packageItem.name);
      persist();
      closeOverlay();
      toast("差分包已删除");
      return;
    }
    if (action === "add-version") {
      state.upload = null;
      state.errors = {};
      state.drawer = { type: "addVersion", formDraft: { version: "", models: "", note: "" }, capabilitySelections: {}, associatedFeatures: [], appReleaseNotes: { "zh-CN": "", "en-US": "" }, activeLocale: "zh-CN" };
      renderShell();
      return;
    }
    if (action === "edit-version") {
      const version = findVersion(target.dataset.version);
      if (!version || version.status !== "unpublished") { toast("只有未发布版本可以编辑", "warning"); return; }
      state.errors = {};
      state.drawer = {
        type: "editVersion",
        version: target.dataset.version,
        formDraft: { version: version.version, models: version.models, note: version.platformReleaseNotes || (version.note === "-" ? "" : version.note) },
        capabilitySelections: Object.fromEntries((version.featureConfigs || []).map(config => [config.key, config.value])),
        associatedFeatures: clone(version.associatedFeatures || []),
        appReleaseNotes: clone(version.appReleaseNotes || { "zh-CN": "", "en-US": "" }),
        activeLocale: "zh-CN"
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
    if (action === "maintain-app-notes") {
      if (activeIdentifier().activeApproval) { toast("审批期间版本文案已锁定", "warning"); return; }
      const version = findVersion(target.dataset.version);
      state.errors = {};
      state.modal = { type: "editAppNotes", version: version.version, notesDraft: clone(version.appReleaseNotes), reason: "" };
      renderShell();
      return;
    }
    if (action === "remove-revision-locale") {
      const locale = target.dataset.locale;
      if (!["zh-CN", "en-US"].includes(locale)) delete state.modal.notesDraft[locale];
      renderShell();
      return;
    }
    if (action === "save-app-notes") {
      const version = findVersion(state.modal.version);
      const notes = Object.fromEntries(Object.entries(state.modal.notesDraft).map(([locale, content]) => [locale, String(content || "").trim()]));
      state.errors = {};
      Object.entries(notes).forEach(([locale, content]) => {
        if (!content) state.errors[`revision-${locale}`] = `${locale} 更新说明不能为空`;
        if (!appNoteWithinLimit(locale, content)) state.errors[`revision-${locale}`] = `${locale} 更新说明不能超过 ${appNoteLimit(locale)} 个字符`;
        if (/<\/?[a-z][\s\S]*>|<script/i.test(content)) state.errors[`revision-${locale}`] = "更新说明不允许包含 HTML 或脚本内容";
      });
      if (!notes["zh-CN"] || !notes["en-US"]) state.errors.revisionRequired = "简体中文和 English 必须保留";
      if (!String(state.modal.reason || "").trim()) state.errors.revisionReason = "请填写修改原因";
      if (Object.keys(state.errors).length) { renderShell(); return; }
      const before = clone(version.appReleaseNotes);
      version.appReleaseNotes = clone(notes);
      version.recordVersion += 1;
      version.noteRevisions.unshift({ time: now(), operator: "汤彦珊", reason: state.modal.reason.trim(), before, after: clone(notes), recordVersion: version.recordVersion });
      addOperation("APP 更新说明", "修订", version.version);
      persist();
      state.modal = null;
      state.errors = {};
      renderShell();
      toast(version.status === "current" ? "APP 更新说明已修订，升级检查缓存已失效" : "回滚目标文案已修订，将在版本重新生效时使用");
      return;
    }
    if (action === "publish-version") {
      const identifier = activeIdentifier();
      const version = findVersion(target.dataset.version);
      if (identifier.activeApproval) {
        toast("当前固件标识已有发布或回滚审批", "warning");
        return;
      }
      if (version.status !== "unpublished") {
        toast("只有未发布版本可以提交发布审批", "warning");
        return;
      }
      const overLimitLocale = Object.entries(version.appReleaseNotes || {}).find(([locale, content]) => !appNoteWithinLimit(locale, content));
      if (overLimitLocale) {
        toast(`${overLimitLocale[0]} 更新说明超过 ${appNoteLimit(overLimitLocale[0])} 个字符，请先维护文案`, "warning");
        return;
      }
      state.errors = {};
      state.modal = { type: "publish", version: target.dataset.version, reminderPolicy: "", previewLocale: "zh-CN", platformReleaseNotes: version.platformReleaseNotes };
      renderShell();
      return;
    }
    if (action === "confirm-publish") {
      state.errors = {};
      if (!state.modal.reminderPolicy) state.errors.reminderPolicy = "请选择本次 APP 提醒方式";
      if (Object.keys(state.errors).length) { renderShell(); return; }
      const approval = submitReleaseApproval("publish", state.modal);
      if (!approval) return;
      state.modal = { type: "approvalSimulation", approvalId: approval.id };
      renderShell();
      return;
    }
    if (action === "start-rollback") {
      const identifier = activeIdentifier();
      const targetVersion = rollbackTarget(identifier);
      if (identifier.activeApproval) { toast("当前固件标识已有发布或回滚审批", "warning"); return; }
      if (!identifier.rollbackAvailable || !targetVersion) { toast("当前发布事件没有可用的一次性回滚目标", "warning"); return; }
      const activeNotice = dingRecordForEvent(activeRelease(identifier));
      if (activeNotice?.status === "sending") { toast("原发布 DING 正在发送，请等待发送结果后再发起回滚", "warning"); return; }
      if (activeNotice?.recallStatus === "recalling") { toast("原发布 DING 正在撤回，请等待撤回结果后再发起回滚", "warning"); return; }
      if (!targetCoversModels(currentVersion(identifier), targetVersion)) { toast("回滚目标未覆盖当前版本全部适用机型", "warning"); return; }
      if (!targetVersion.appReleaseNotes?.["zh-CN"] || !targetVersion.appReleaseNotes?.["en-US"]) { toast("回滚目标缺少有效的中英文 APP 更新说明", "warning"); return; }
      const overLimitLocale = Object.entries(targetVersion.appReleaseNotes || {}).find(([locale, content]) => !appNoteWithinLimit(locale, content));
      if (overLimitLocale) { toast(`回滚目标 ${overLimitLocale[0]} 更新说明超过 ${appNoteLimit(overLimitLocale[0])} 个字符`, "warning"); return; }
      state.errors = {};
      state.modal = { type: "rollback", version: currentVersion(identifier).version, targetVersion: targetVersion.version, reminderPolicy: "", reason: "", platformReleaseNotes: targetVersion.platformReleaseNotes };
      renderShell();
      return;
    }
    if (action === "confirm-rollback") {
      state.errors = {};
      if (!state.modal.reminderPolicy) state.errors.reminderPolicy = "请选择本次 APP 提醒方式";
      if (!String(state.modal.reason || "").trim()) state.errors.rollbackReason = "请填写回滚原因";
      if (Object.keys(state.errors).length) { renderShell(); return; }
      const approval = submitReleaseApproval("rollback", state.modal);
      if (!approval) return;
      state.modal = { type: "approvalSimulation", approvalId: approval.id };
      renderShell();
      return;
    }
    if (action === "view-active-approval") {
      const approvalId = activeIdentifier().activeApproval?.approvalId;
      if (!approvalId || !approvalById(approvalId)) { toast("当前没有进行中的审批", "warning"); return; }
      state.modal = { type: "approvalSimulation", approvalId };
      renderShell();
      return;
    }
    if (action === "simulate-approval-approve") {
      const approval = approvalById(state.modal.approvalId);
      const result = executeApprovedRelease(approval);
      if (!result.ok) {
        approval.status = "已失效";
        approval.approveTime = now();
        activeIdentifier().activeApproval = null;
        persist();
        closeOverlay();
        toast(result.message, "error");
        return;
      }
      if (result.type === "rollback") {
        state.modal = { type: "rollbackResult", version: result.version, noticeId: result.sourceNoticeId };
        state.drawer = null;
        state.errors = {};
        renderShell();
      } else {
        closeOverlay();
        toast(`${result.version} 已成为当前发布版本`);
      }
      return;
    }
    if (action === "simulate-approval-reject") {
      const approval = approvalById(state.modal.approvalId);
      rejectReleaseApproval(approval);
      closeOverlay();
      toast("审批已驳回，当前发布版本保持不变", "warning");
      return;
    }
    if (action === "delete-version") {
      const version = findVersion(target.dataset.version);
      if (!version || version.status !== "unpublished") { toast("只有未发布版本可以删除", "warning"); return; }
      state.modal = { type: "deleteVersion", version: target.dataset.version };
      renderShell();
      return;
    }
    if (action === "confirm-delete-version") {
      const identifier = activeIdentifier();
      const version = state.modal.version;
      const targetVersion = identifier.versions.find(item => item.version === version);
      if (targetVersion?.status !== "unpublished") {
        closeOverlay();
        toast("只有未发布版本可以删除", "warning");
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
    if (action === "select-locale") {
      state.drawer.activeLocale = target.dataset.locale;
      renderShell();
      return;
    }
    if (action === "remove-locale") {
      const locale = target.dataset.locale;
      if (["zh-CN", "en-US"].includes(locale)) return;
      delete state.drawer.appReleaseNotes[locale];
      state.drawer.activeLocale = "zh-CN";
      delete state.errors[`locale-${locale}`];
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
    if (["firmware-page", "differential-task-page", "differential-package-page", "module-page", "operation-page", "approval-page", "user-page"].includes(action)) {
      const key = { "firmware-page": "firmwarePage", "differential-task-page": "differentialTaskPage", "differential-package-page": "differentialPackagePage", "module-page": "modulePage", "operation-page": "operationPage", "approval-page": "approvalPage", "user-page": "userPage" }[action];
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
    if (event.target.matches("[data-ding-tree-query]") && state.modal) {
      const value = event.target.value;
      state.modal.dingTreeQuery = value;
      renderShell();
      const search = app.querySelector("[data-ding-tree-query]");
      if (search) {
        search.focus();
        search.setSelectionRange(value.length, value.length);
      }
      return;
    }
    const filter = event.target.dataset.filter;
    const draft = event.target.dataset.draft;
    const versionDraft = event.target.dataset.versionDraft;
    const modalDraft = event.target.dataset.modalDraft;
    if (filter) {
      state.filters[filter] = event.target.value;
      if (filter === "differentialTask") state.differentialTaskPage = 1;
      if (filter === "differentialPackage") state.differentialPackagePage = 1;
    }
    if (draft) state.draftFilters[draft] = event.target.value;
    if (versionDraft && state.drawer?.formDraft) state.drawer.formDraft[versionDraft] = event.target.value;
    if (modalDraft && state.modal?.draft) state.modal.draft[modalDraft] = event.target.value;
    if (event.target.dataset.modalField && state.modal) state.modal[event.target.dataset.modalField] = event.target.value;
    if (event.target.dataset.modalField === "name" && state.modal?.type === "addDifferentialTask") {
      delete state.errors.differentialTaskName;
      event.target.closest(".form-field")?.querySelector(".error-text")?.remove();
      const counter = event.target.closest(".form-field")?.querySelector(".helper.align-right");
      if (counter) counter.textContent = `${event.target.value.length} / 50`;
    }
    if (event.target.dataset.revisionLocale && state.modal?.notesDraft) {
      const locale = event.target.dataset.revisionLocale;
      state.modal.notesDraft[locale] = event.target.value;
      const counter = event.target.closest(".revision-note-item")?.querySelector(".helper.align-right");
      if (counter) counter.textContent = `${event.target.value.length} / ${appNoteLimit(locale)}`;
    }
    if (event.target.matches("[data-revision-reason]") && state.modal) state.modal.reason = event.target.value;
    if (event.target.matches("[data-feature-search]") && state.modal?.type === "featurePicker") state.modal.query = event.target.value;
    if (event.target.matches("[data-user-note]") && state.drawer?.userDraft) state.drawer.userDraft.note = event.target.value;
    if (event.target.dataset.appNote && state.drawer?.appReleaseNotes) {
      const locale = event.target.dataset.appNote;
      state.drawer.appReleaseNotes[locale] = event.target.value;
      const counter = event.target.closest(".locale-writing")?.querySelector(".helper.align-right");
      if (counter) counter.textContent = `${event.target.value.length} / ${appNoteLimit(locale)}`;
    }
  });

  app.addEventListener("change", event => {
    const target = event.target;
    if (target.dataset.differentialSource && state.modal?.type === "addDifferentialTask") {
      const version = target.dataset.differentialSource;
      state.modal.sourceVersions = target.checked ? [...new Set([...(state.modal.sourceVersions || []), version])] : (state.modal.sourceVersions || []).filter(item => item !== version);
      delete state.errors.differentialSourceVersions;
      renderShell();
      return;
    }
    if (target.dataset.modalField && state.modal) {
      state.modal[target.dataset.modalField] = target.type === "checkbox" ? target.checked : target.value;
      if (target.dataset.modalField === "reminderPolicy") delete state.errors.reminderPolicy;
      if (target.dataset.modalField === "targetVersion" && state.modal.type === "addDifferentialTask") {
        state.modal.sourceVersions = (state.modal.sourceVersions || []).filter(version => version !== target.value);
        state.modal.sourceOpen = false;
        delete state.errors.differentialTargetVersion;
      }
      renderShell();
      return;
    }
    if (target.dataset.dingScope && state.modal) {
      const scope = target.dataset.dingScope;
      state.modal.dingScopes = target.checked ? [...new Set([...(state.modal.dingScopes || []), scope])] : (state.modal.dingScopes || []).filter(item => item !== scope);
      renderShell();
      return;
    }
    if (target.dataset.dingNode && state.modal) {
      const node = dingNodeById(target.dataset.dingNode);
      const leafIds = dingLeafUsers(node).map(user => user.id);
      const selected = new Set(normalizeDingScopeIds(state.modal.dingScopes));
      leafIds.forEach(id => target.checked ? selected.add(id) : selected.delete(id));
      state.modal.dingScopes = [...selected];
      delete state.errors.dingScopes;
      renderShell();
      return;
    }
    if (target.dataset.change === "product-filter") {
      state.filters.product = target.value;
      syncSelectedIdentifierToFilters();
      state.firmwareTab = "firmware";
      state.differentialTaskPage = 1;
      state.differentialPackagePage = 1;
      state.expandedDifferentialPackages = [];
      renderShell();
      return;
    }
    if (target.dataset.change === "add-locale" && target.value && state.drawer?.appReleaseNotes) {
      state.drawer.appReleaseNotes[target.value] = "";
      state.drawer.activeLocale = target.value;
      renderShell();
      return;
    }
    if (target.dataset.change === "add-revision-locale" && target.value && state.modal?.notesDraft) {
      state.modal.notesDraft[target.value] = "";
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
      const pageKey = { firmware: "firmwarePage", differentialTasks: "differentialTaskPage", differentialPackages: "differentialPackagePage", modules: "modulePage", operations: "operationPage", approvals: "approvalPage", users: "userPage" }[key];
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
      const key = { "firmware-page": "firmwarePage", "differential-task-page": "differentialTaskPage", "differential-package-page": "differentialPackagePage", "module-page": "modulePage", "operation-page": "operationPage", "approval-page": "approvalPage", "user-page": "userPage" }[event.target.dataset.pageAction];
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
      db.identifiers.unshift({ id, product, created: now(), models, network: "仅4G", power: "常电", architecture: "新架构", versions: [], differentialTasks: [], differentialPackages: [], currentVersion: null, rollbackTargetVersion: null, rollbackAvailable: false, releaseEvents: [], activeApproval: null, dingDefaults: { scopes: ["dept-firmware", "user-line-owner"], source: "product" } });
      state.selectedIdentifier = id;
      state.filters.product = product;
      state.firmwareTab = "firmware";
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

    if (form.id === "differential-task-form") {
      const identifier = activeIdentifier();
      const name = String(state.modal.name || values.get("name") || "").trim();
      const targetVersion = String(state.modal.targetVersion || values.get("targetVersion") || "");
      const versionNames = new Set(identifier.versions.map(version => version.version));
      const sourceVersions = [...new Set(state.modal.sourceVersions || [])].filter(version => version !== targetVersion && versionNames.has(version));
      state.modal.name = name;
      state.modal.targetVersion = targetVersion;
      state.modal.sourceVersions = sourceVersions;
      if (!name) state.errors.differentialTaskName = "请输入差分任务名称";
      if (name.length > 50) state.errors.differentialTaskName = "差分任务名称不能超过 50 个字符";
      if (!targetVersion || !versionNames.has(targetVersion)) state.errors.differentialTargetVersion = "请选择有效的目标版本";
      if (!sourceVersions.length) state.errors.differentialSourceVersions = "请至少选择一个源版本";
      if (Object.keys(state.errors).length) { renderShell(); return; }
      const stamp = now();
      const epoch = Math.floor(Date.now() / 1000);
      const taskId = releaseId("DIFF-TASK");
      const items = sourceVersions.map((sourceVersion, index) => ({
        id: `${taskId}-${index + 1}`, sourceVersion, targetVersion, moduleModel: identifier.models, status: "已完成", failureReason: "-", packageName: `diff_${sourceVersion}_to_${targetVersion}_${epoch + index}.par`
      }));
      identifier.differentialTasks.unshift({ id: taskId, name, targetVersion, sourceVersions, moduleModel: identifier.models, status: "已完成", successRate: "100.0%", packageCount: items.length, createdAt: stamp, completedAt: stamp, items });
      let group = identifier.differentialPackages.find(item => item.targetVersion === targetVersion);
      if (!group) {
        group = { targetVersion, updatedAt: stamp, items: [] };
        identifier.differentialPackages.unshift(group);
      }
      items.forEach((item, index) => {
        const existing = group.items.find(packageItem => packageItem.sourceVersion === item.sourceVersion);
        const nextPackage = { id: releaseId("DIFF-PACKAGE"), sourceVersion: item.sourceVersion, sizeKb: (5 + index / 10).toFixed(1), name: item.packageName, createdAt: stamp };
        if (existing) Object.assign(existing, nextPackage);
        else group.items.push(nextPackage);
      });
      group.updatedAt = stamp;
      state.differentialTaskPage = 1;
      addOperation("在线差分", "新增任务", name);
      persist();
      closeOverlay();
      toast(`差分任务 ${name} 已创建并完成`);
      return;
    }

    if (form.id === "version-form") {
      const editing = values.get("mode") === "edit";
      const identifier = activeIdentifier();
      const oldVersion = editing ? findVersion(state.drawer.version) : null;
      const versionName = String(values.get("version") || "").trim();
      const models = String(values.get("models") || "").trim();
      const platformReleaseNotes = String(values.get("platformNote") || "").trim();
      const appReleaseNotes = Object.fromEntries(Object.entries(state.drawer.appReleaseNotes || {}).map(([locale, content]) => [locale, String(content || "").trim()]));
      const featureConfigs = featureCatalog.map(item => {
        const optionValue = String(values.get(`capability-${item.key}`) || state.drawer.capabilitySelections?.[item.key] || "");
        return optionValue ? configFromCatalog(item, optionValue) : null;
      });
      if (!editing && !state.upload) state.errors.file = "请先上传固件包";
      if (!versionName) state.errors.version = "缺少固件版本号";
      if (!models) state.errors.models = "请输入适用机型";
      if (!platformReleaseNotes) state.errors.platformNote = "请填写平台发布说明";
      if (!editing && identifier.versions.some(item => item.version === versionName)) state.errors.version = "该版本号已存在";
      if (editing && identifier.versions.some(item => item !== oldVersion && item.version === versionName)) state.errors.version = "该版本号已存在";
      if (featureConfigs.some(config => !config)) state.errors.capabilities = "请完成全部功能集能力配置";
      Object.entries(appReleaseNotes).forEach(([locale, content]) => {
        if (!content) state.errors[`locale-${locale}`] = `${locale} 更新说明不能为空`;
        if (!appNoteWithinLimit(locale, content)) state.errors[`locale-${locale}`] = `${locale} 更新说明不能超过 ${appNoteLimit(locale)} 个字符`;
        if (/<\/?[a-z][\s\S]*>|<script/i.test(content)) state.errors[`locale-${locale}`] = "更新说明不允许包含 HTML 或脚本内容";
      });
      if (!("zh-CN" in appReleaseNotes) || !("en-US" in appReleaseNotes) || Object.keys(state.errors).some(key => key.startsWith("locale-"))) state.errors.appNotes = "请完成全部 APP 多语言更新说明";
      if (Object.keys(state.errors).length) { renderShell(); return; }
      if (editing) {
        oldVersion.version = versionName;
        oldVersion.models = models;
        oldVersion.note = platformReleaseNotes;
        oldVersion.platformReleaseNotes = platformReleaseNotes;
        oldVersion.appReleaseNotes = clone(appReleaseNotes);
        oldVersion.featureConfigs = featureConfigs;
        oldVersion.associatedFeatures = clone(state.drawer.associatedFeatures || []);
        oldVersion.features = featureConfigs.length;
        oldVersion.updated = now();
        oldVersion.associatedDeviceCount = associatedDeviceCount(identifier, models);
        oldVersion.recordVersion += 1;
        addOperation("固件版本", "编辑", versionName);
      } else {
        identifier.versions.unshift({ version: versionName, url: `http://doraemon.camera666.com/${state.upload.name}`, size: state.upload.size, md5: state.upload.md5, models, associatedDeviceCount: associatedDeviceCount(identifier, models), features: featureConfigs.length, featureConfigs, associatedFeatures: clone(state.drawer.associatedFeatures || []), creator: "汤彦珊", note: platformReleaseNotes, platformReleaseNotes, appReleaseNotes: clone(appReleaseNotes), noteRevisions: [], created: now(), updated: now(), latest: false, status: "unpublished", reminder: "不提醒", recordVersion: 1 });
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
