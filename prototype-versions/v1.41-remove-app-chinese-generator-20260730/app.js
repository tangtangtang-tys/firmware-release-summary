(() => {
  "use strict";

  const STORAGE_KEY = "firmware-release-replica-v16";
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
    { menu: "固件管理", page: "固件列表", actions: ["查看固件标识列表", "编辑固件标识", "新增固件标识", "发布固件版本", "回滚固件版本", "下架当前发布版本", "维护APP更新说明", "查看发布日志", "删除固件标识", "查看版本列表", "新增固件版本", "编辑固件版本", "删除固件版本", "查看在线差分", "新建差分任务", "查看差分包", "下载差分包", "删除差分文件"] },
    { menu: "固件管理", page: "模组型号", actions: ["查看模组型号"] },
    { menu: "日志管理", page: "操作日志", actions: ["查看操作日志"] },
    { menu: "日志管理", page: "审批日志", actions: ["查看审批日志"] },
    { menu: "用户角色", page: "用户列表", actions: ["查看用户列表", "更新用户"] },
    { menu: "用户角色", page: "角色权限", actions: ["查看角色权限", "新增角色", "更新角色", "更新角色权限", "删除角色"] }
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
    {
      id: "motion-track", product: "IPC", name: "移动侦测", identifier: "motion_detection", category: "智能分析", firmwarePolicy: "固件必配", imageLabel: "侦测",
      versions: [
        { id: "motion-v3", code: "V3", status: "testing", createdAt: "2026-07-24 11:21:05", description: "新增复杂场景目标过滤，功能版本测试中" },
        { id: "motion-v2", code: "V2", status: "published", latest: true, releasedAt: "2026-07-15 16:40:20", description: "支持移动事件检测、区域配置与灵敏度控制" },
        { id: "motion-v1", code: "V1", status: "disabled", releasedAt: "2026-05-18 11:32:10", description: "历史移动侦测协议，仅保留既有固件关联" }
      ]
    },
    {
      id: "night-vision", product: "IPC", name: "夜视模式", identifier: "night_vision", category: "图像能力", firmwarePolicy: "固件必配", imageLabel: "夜视",
      versions: [
        { id: "night-v4", code: "V4", status: "published", latest: true, releasedAt: "2026-07-18 14:12:30", description: "支持全彩、红外与智能夜视模式切换" },
        { id: "night-v3", code: "V3", status: "published", releasedAt: "2026-06-12 10:08:16", description: "支持全彩与红外夜视模式" },
        { id: "night-v2", code: "V2", status: "disabled", releasedAt: "2026-03-20 09:30:00", description: "历史红外夜视版本" }
      ]
    },
    {
      id: "low-power", product: "IPC", name: "低功耗待机", identifier: "low_power_standby", category: "设备能力", firmwarePolicy: "可选能力", imageLabel: "低功耗",
      versions: [
        { id: "power-v2", code: "V2", status: "published", latest: true, releasedAt: "2026-07-08 09:45:12", description: "优化休眠唤醒与低电量保护策略" },
        { id: "power-v1", code: "V1", status: "published", releasedAt: "2026-04-11 15:20:36", description: "基础低功耗待机能力" }
      ]
    },
    {
      id: "voice-intercom", product: "IPC", name: "双向语音对讲", identifier: "voice_intercom", category: "音频能力", firmwarePolicy: "固件必配", imageLabel: "语音",
      versions: [
        { id: "voice-v3", code: "V3", status: "published", latest: true, releasedAt: "2026-07-10 17:06:22", description: "支持回声消除与弱网语音优化" },
        { id: "voice-v2", code: "V2", status: "published", releasedAt: "2026-05-09 13:15:40", description: "支持基础双向语音对讲" }
      ]
    },
    {
      id: "device-share", product: "IPC", name: "设备分享", identifier: "device_share", category: "设备管理", firmwarePolicy: "可选能力", imageLabel: "分享",
      versions: [
        { id: "share-v2", code: "V2", status: "published", latest: true, releasedAt: "2026-06-28 10:30:18", description: "支持分享权限与有效期控制" }
      ]
    },
    {
      id: "pet-detection", product: "IPC", name: "宠物识别", identifier: "pet_detection", category: "智能分析", firmwarePolicy: "可选能力", imageLabel: "宠物",
      versions: [
        { id: "pet-v1", code: "V1", status: "testing", createdAt: "2026-07-26 16:18:05", description: "首个功能版本，当前处于测试阶段" }
      ]
    },
    { id: "vehicle-positioning", product: "车载", name: "车辆定位", identifier: "vehicle_positioning", category: "定位能力", firmwarePolicy: "固件必配", imageLabel: "定位", versions: [{ id: "vehicle-v2", code: "V2", status: "published", latest: true, releasedAt: "2026-07-02 13:40:00", description: "支持 GPS 与基站融合定位" }] },
    { id: "nvr-channel", product: "NVR", name: "通道管理", identifier: "nvr_channel", category: "设备管理", firmwarePolicy: "固件必配", imageLabel: "通道", versions: [{ id: "channel-v3", code: "V3", status: "published", latest: true, releasedAt: "2026-06-30 11:25:00", description: "支持多通道动态管理" }] },
    { id: "toy-dialog", product: "AI玩具", name: "智能对话", identifier: "ai_dialog", category: "交互能力", firmwarePolicy: "固件必配", imageLabel: "对话", versions: [{ id: "dialog-v2", code: "V2", status: "published", latest: true, releasedAt: "2026-07-12 15:10:00", description: "支持多轮对话与打断" }] },
    { id: "baby-cry", product: "婴儿看护", name: "哭声检测", identifier: "baby_cry_detection", category: "智能分析", firmwarePolicy: "固件必配", imageLabel: "哭声", versions: [{ id: "cry-v2", code: "V2", status: "published", latest: true, releasedAt: "2026-07-05 10:20:00", description: "支持哭声识别与事件通知" }] },
    { id: "cellular-wakeup", product: "4G模组", name: "4G 远程唤醒", identifier: "cellular_wakeup", category: "连接能力", firmwarePolicy: "固件必配", imageLabel: "4G", versions: [{ id: "wakeup-v2", code: "V2", status: "published", latest: true, releasedAt: "2026-07-09 09:50:00", description: "支持低功耗场景下远程唤醒" }] },
    { id: "bk-bluetooth", product: "BK系列", name: "蓝牙配网", identifier: "bluetooth_provisioning", category: "连接能力", firmwarePolicy: "固件必配", imageLabel: "蓝牙", versions: [{ id: "bluetooth-v3", code: "V3", status: "published", latest: true, releasedAt: "2026-07-11 14:35:00", description: "支持新版蓝牙配网协议" }] }
  ];

  function featureSourcesForProduct(product) {
    return associatedFeatureCatalog.filter(feature => feature.product === product);
  }

  function isRequiredFeature(feature) {
    const source = sourceFeatureBySnapshot(feature);
    return (source?.firmwarePolicy || feature?.firmwarePolicy) === "固件必配";
  }

  function requiredFeatureSourcesForProduct(product) {
    return featureSourcesForProduct(product).filter(isRequiredFeature);
  }

  function optionalFeatureSourcesForProduct(product) {
    return featureSourcesForProduct(product).filter(feature => !isRequiredFeature(feature));
  }

  function eligibleFeatureVersions(feature) {
    return (feature?.versions || []).filter(version => version.status === "published");
  }

  function defaultFeatureVersion(feature) {
    const eligible = eligibleFeatureVersions(feature);
    return eligible.find(version => version.latest) || eligible[0] || null;
  }

  function featureVersionStatusLabel(version) {
    if (!version) return "版本不存在";
    if (version.status === "testing") return "测试中";
    if (version.status === "disabled") return "已停用";
    return version.latest ? "最新可用" : "已发布";
  }

  function sourceFeatureBySnapshot(snapshot) {
    return associatedFeatureCatalog.find(feature => feature.id === snapshot?.id || feature.identifier === snapshot?.identifier || feature.name === snapshot?.name);
  }

  function sourceFeatureVersion(feature, snapshot) {
    return feature?.versions?.find(version => version.id === snapshot?.featureVersionId || version.code === snapshot?.version) || null;
  }

  function associatedFeatureSnapshot(feature, versionId, previous = null) {
    const version = feature.versions.find(item => item.id === versionId);
    if (!version) return null;
    return {
      id: feature.id,
      name: feature.name,
      identifier: feature.identifier,
      product: feature.product,
      category: feature.category,
      firmwarePolicy: feature.firmwarePolicy,
      imageLabel: feature.imageLabel,
      featureVersionId: version.id,
      version: version.code,
      versionDescription: version.description,
      versionStatus: version.status,
      versionStatusLabel: featureVersionStatusLabel(version),
      sourceUpdatedAt: version.releasedAt || version.createdAt || "-",
      selectedAt: previous?.featureVersionId === version.id ? previous.selectedAt || now() : now()
    };
  }

  function normalizeAssociatedFeatureSnapshot(snapshot, product) {
    const source = sourceFeatureBySnapshot(snapshot);
    if (!source) {
      return {
        id: snapshot.id || `legacy-${snapshot.name}`,
        name: snapshot.name || "未知功能点",
        identifier: snapshot.identifier || "-",
        product: snapshot.product || product,
        category: snapshot.category || "未分类",
        firmwarePolicy: snapshot.firmwarePolicy || "历史配置",
        imageLabel: snapshot.imageLabel || snapshot.imageName || "功能",
        featureVersionId: snapshot.featureVersionId || "",
        version: snapshot.version || "-",
        versionDescription: snapshot.versionDescription || "历史功能点快照",
        versionStatus: snapshot.versionStatus || "unknown",
        versionStatusLabel: snapshot.versionStatusLabel || "来源已失效",
        sourceUpdatedAt: snapshot.sourceUpdatedAt || "-",
        selectedAt: snapshot.selectedAt || "-"
      };
    }
    const selectedVersion = sourceFeatureVersion(source, snapshot) || defaultFeatureVersion(source);
    if (!selectedVersion) return { ...snapshot, id: source.id, name: snapshot.name || source.name, identifier: snapshot.identifier || source.identifier, product: source.product, category: source.category, firmwarePolicy: source.firmwarePolicy, imageLabel: source.imageLabel };
    const normalized = associatedFeatureSnapshot(source, selectedVersion.id, snapshot);
    return {
      ...normalized,
      name: snapshot.name || normalized.name,
      identifier: snapshot.identifier || normalized.identifier,
      category: snapshot.category || normalized.category,
      versionDescription: snapshot.versionDescription || normalized.versionDescription,
      selectedAt: snapshot.selectedAt || normalized.selectedAt
    };
  }

  function ensureRequiredFeatureSnapshots(features, product) {
    const existing = new Map();
    (features || []).forEach(feature => {
      if (feature?.id && !existing.has(feature.id)) existing.set(feature.id, feature);
    });
    const required = requiredFeatureSourcesForProduct(product).map(source => {
      const previous = existing.get(source.id);
      existing.delete(source.id);
      if (previous) return normalizeAssociatedFeatureSnapshot(previous, product);
      const version = defaultFeatureVersion(source);
      return version ? associatedFeatureSnapshot(source, version.id) : null;
    }).filter(Boolean);
    const optional = [];
    (features || []).forEach(feature => {
      if (!feature?.id || !existing.has(feature.id)) return;
      existing.delete(feature.id);
      optional.push(normalizeAssociatedFeatureSnapshot(feature, product));
    });
    return [...required, ...optional];
  }

  function featureAssociationIssue(association, product) {
    const source = sourceFeatureBySnapshot(association);
    if (!source) return `${association?.name || "功能点"} 已不在机型平台功能目录中`;
    if (source.product !== product) return `${source.name} 不属于当前产品线 ${product}`;
    const version = sourceFeatureVersion(source, association);
    if (!version) return `${source.name} 的关联版本已不存在`;
    if (version.status === "testing") return `${source.name} ${version.code} 仍在测试中`;
    if (version.status === "disabled") return `${source.name} ${version.code} 已停用`;
    if (version.status !== "published") return `${source.name} ${version.code} 暂不可用于固件关联`;
    return "";
  }

  function featureConfigurationError(features, product) {
    const ids = new Set();
    for (const feature of features || []) {
      if (ids.has(feature.id)) return `${feature.name} 不能重复配置`;
      ids.add(feature.id);
      const issue = featureAssociationIssue(feature, product);
      if (issue) return issue;
    }
    for (const required of requiredFeatureSourcesForProduct(product)) {
      if (!ids.has(required.id)) return `缺少固件必配功能：${required.name}`;
    }
    return "";
  }

  function featureAssociationChangeSummary(before = [], after = []) {
    const previous = new Map(before.map(feature => [feature.id, feature]));
    const next = new Map(after.map(feature => [feature.id, feature]));
    const added = [...next.keys()].filter(id => !previous.has(id));
    const removed = [...previous.keys()].filter(id => !next.has(id));
    const switched = [...next.keys()].filter(id => previous.has(id) && previous.get(id).featureVersionId !== next.get(id).featureVersionId);
    const parts = [];
    if (added.length) parts.push(`新增 ${added.length} 项`);
    if (removed.length) parts.push(`移除 ${removed.length} 项`);
    if (switched.length) parts.push(`切换版本 ${switched.length} 项`);
    return parts.join("、") || "功能点配置无变化";
  }

  const localeCatalog = [
    { locale: "zh", label: "简体中文", required: true, limit: 80 },
    { locale: "en", label: "英文", required: true, limit: 160 },
    { locale: "zh_FT", label: "繁体中文", limit: 80 },
    { locale: "vi", label: "越南语", limit: 160 },
    { locale: "th", label: "泰语", limit: 160 },
    { locale: "ja", label: "日语", limit: 80 },
    { locale: "ko", label: "韩语", limit: 80 },
    { locale: "ru", label: "俄语", limit: 160 },
    { locale: "de", label: "德语", limit: 160 },
    { locale: "fr", label: "法语", limit: 160 },
    { locale: "es", label: "西班牙语", limit: 160 },
    { locale: "it", label: "意大利语", limit: 160 },
    { locale: "nl", label: "荷兰语", limit: 160 },
    { locale: "pl", label: "波兰语", limit: 160 },
    { locale: "pt", label: "葡萄牙语", limit: 160 }
  ];
  const defaultLocaleIds = localeCatalog.map(item => item.locale);
  const requiredLocaleIds = localeCatalog.filter(item => item.required).map(item => item.locale);

  function canonicalLocale(locale) {
    const normalized = String(locale || "").trim().replace(/_/g, "-").toLowerCase();
    if (["zh-ft", "zh-tw", "zh-hk", "zh-hant", "zh-mo"].includes(normalized)) return "zh_FT";
    if (["zh", "zh-cn", "zh-hans", "zh-sg"].includes(normalized)) return "zh";
    const base = normalized.split("-")[0];
    return defaultLocaleIds.includes(base) ? base : null;
  }

  function normalizeAppNotes(notes = {}) {
    const normalized = {};
    Object.entries(notes || {}).forEach(([locale, content]) => {
      const canonical = canonicalLocale(locale);
      if (canonical && !(canonical in normalized)) normalized[canonical] = content;
    });
    Object.entries(notes || {}).forEach(([locale, content]) => {
      if (defaultLocaleIds.includes(locale)) normalized[locale] = content;
    });
    return normalized;
  }

  const appNoteStatusLabels = {
    unconfigured: "未适配",
    pending: "待翻译",
    translating: "翻译中",
    ai_draft: "AI草稿",
    confirmed: "已确认",
    stale: "需更新",
    error: "异常"
  };

  function normalizeAppNoteMeta(meta = {}, notes = {}, defaultTargets = []) {
    const normalizedNotes = normalizeAppNotes(notes);
    const hasStoredMeta = meta && typeof meta === "object" && Object.keys(meta).length > 0;
    const enabledLocales = new Set(["zh", "en"]);
    if (hasStoredMeta) (meta.enabledLocales || []).forEach(locale => {
      const canonical = canonicalLocale(locale);
      if (canonical) enabledLocales.add(canonical);
    });
    if (!hasStoredMeta) Object.entries(normalizedNotes).forEach(([locale, content]) => {
      if (String(content || "").trim()) enabledLocales.add(locale);
    });
    if (!hasStoredMeta) defaultTargets.forEach(locale => {
      const canonical = canonicalLocale(locale);
      if (canonical && canonical !== "zh") enabledLocales.add(canonical);
    });
    const sourceText = String(meta.sourceText ?? normalizedNotes.zh ?? "");
    const sourceRevision = Math.max(1, Number(meta.sourceRevision) || 1);
    const statuses = {};
    const origins = {};
    const sourceRevisions = {};
    defaultLocaleIds.forEach(locale => {
      const content = String(normalizedNotes[locale] || "").trim();
      const enabled = enabledLocales.has(locale);
      const storedStatus = meta.statuses?.[locale];
      statuses[locale] = storedStatus || (content ? "confirmed" : enabled ? "pending" : "unconfigured");
      if (locale === "zh") statuses[locale] = content ? "confirmed" : "pending";
      origins[locale] = meta.origins?.[locale] || (content ? "legacy" : "none");
      sourceRevisions[locale] = Number(meta.sourceRevisions?.[locale]) || (content ? sourceRevision : 0);
    });
    return {
      sourceRevision,
      sourceText,
      enabledLocales: defaultLocaleIds.filter(locale => enabledLocales.has(locale)),
      statuses,
      origins,
      sourceRevisions,
      translationJob: meta.translationJob || null
    };
  }

  const reminderPolicies = [
    { value: "none", label: "不提醒", hint: "APP 不主动展示更新提醒" },
    { value: "weak", label: "弱提醒", hint: "设备设置入口显示更新红点" },
    { value: "strong", label: "强提醒", hint: "设备卡片下方展示升级横幅" },
    { value: "forced-dialog", label: "强制提醒", hint: "进入页面持续展示升级弹窗" }
  ];
  const delistReasonTypes = ["固件质量问题", "设备兼容性问题", "升级链路异常", "发布配置错误", "误发布", "安全或合规风险", "业务策略调整", "其他原因"];

  const prototypeRuleCatalog = {
    identifier: {
      title: "固件标识与影响范围规则",
      code: "FID",
      fr: "FR-01、FR-02、FR-18",
      rules: [
        ["FID-R01", "新增固件标识", "数据", "固件标识、所属产品线和关联机型必须完整且固件标识唯一", "创建后形成版本集合的唯一业务归属"],
        ["FID-R02", "编辑固件标识", "状态", "创建成功后不得修改关联机型，其他字段按权限开放", "历史版本与设备范围口径不漂移"],
        ["FID-R03", "查看标识概览", "数据", "绑定设备数按标识关联机型去重统计，无设备时展示 0", "可判断标识整体影响规模"],
        ["FID-R04", "查看版本列表", "数据", "关联设备数按版本适用机型去重统计", "列表与审批预计影响设备口径一致"],
        ["FID-R05", "查看模组关联固件", "交互", "关联固件数大于零时可返回固件列表并带入筛选", "从模组维度形成查询闭环"],
        ["FID-R06", "无关联数据", "结果", "数量为零时只展示 0，不提供无效跳转", "区分零值、未知值和不可操作状态"]
      ]
    },
    version: {
      title: "固件版本创建与编辑规则",
      code: "VER",
      fr: "FR-03、FR-04、FR-05、FR-07",
      rules: [
        ["VER-R01", "上传固件包", "前置", "仅接收 .bin、.binpkg，解析成功后才能继续配置", "失败文件不能形成版本记录"],
        ["VER-R02", "移除功能集配置", "范围", "新增和编辑固件版本时不展示功能集配置，且不参与保存校验", "新版本不写入功能集，历史版本配置保持不变"],
        ["VER-R03", "加载功能点", "数据", "按当前固件标识所属产品线读取机型平台功能管理目录；固件必配功能自动加载且不可移除", "不展示其他产品线功能源，用户只需选择可选功能"],
        ["VER-R04", "保存新版本", "数据", "版本号唯一且适用机型、平台说明、中英文 APP 说明完整", "校验通过后保存为未发布版本"],
        ["VER-R05", "编辑非当前版本", "权限", "未发布、历史发布和已撤回版本可编辑，审批目标锁定", "编辑范围与版本状态一致"],
        ["VER-R06", "编辑版本内容", "状态", "不得修改版本号或替换固件包", "历史制品和引用关系稳定"],
        ["VER-R07", "保存历史修订", "审计", "递增 recordVersion 并保留修改前内容", "历史修订不可覆盖且可追溯"],
        ["VER-R08", "删除版本", "权限", "仅未发布版本可删除", "已形成业务事实的版本不被移除"],
        ["VER-R09", "默认功能版本", "交互", "固件必配功能自动关联最新已发布可用版本；勾选可选功能后同样默认带出最新版本", "测试中的最新工作版本不会被误关联"],
        ["VER-R10", "切换功能版本", "交互", "支持切换其他已发布可用版本，测试中和已停用版本不可新选", "功能版本选择范围与源平台状态一致"],
        ["VER-R11", "保存功能点快照", "数据", "保存功能标识、名称、分类、版本、说明和来源更新时间快照", "源平台后续变化不追溯改写固件历史"],
        ["VER-R12", "功能版本失效", "状态", "历史快照继续展示，正常发布前必须切换至仍可关联的版本", "历史可追溯且新发布不引用失效版本"],
        ["VER-R13", "固件包摘要", "交互", "上传前只展示上传入口；解析后集中展示文件、版本、MD5 和大小", "不使用空只读字段占用首屏空间"],
        ["VER-R14", "适用机型范围", "数据", "从当前固件标识绑定机型中选择；编辑历史版本时允许保留原值", "不能任意录入其他机型，历史数据不被强制改写"],
        ["VER-R15", "统一功能入口", "交互", "添加可选功能与切换功能版本统一在“配置功能”弹窗完成", "主表不重复提供逐行配置入口"],
        ["VER-R16", "渐进多语言", "交互", "默认只展示简体中文，执行翻译或主动查看时展开完整语言列表", "首屏聚焦必填内容，已有翻译仍可完整维护"],
        ["VER-R17", "未保存退出", "交互", "表单存在真实修改时，关闭、取消、遮罩与 Esc 均需二次确认", "避免误操作丢失已填写内容"]
      ]
    },
    locale: {
      title: "APP 多语言更新说明规则",
      code: "LOC",
      fr: "FR-06、FR-08、FR-09、FR-21",
      rules: [
        ["LOC-R01", "进入语言配置", "交互", "固定展示 15 种中文语言名称并支持纵向滚动", "无需增删语言即可访问全部配置"],
        ["LOC-R02", "保存版本", "前置", "简体中文 zh 和英文 en 必填，其他语言选填", "缺失时阻止保存并定位首个错误"],
        ["LOC-R03", "输入更新说明", "数据", "中文、繁中、日语、韩语上限 80 字，其他语言 160 字", "超限内容不进入版本或审批快照"],
        ["LOC-R04", "切换语言", "交互", "保留未保存内容、抽屉状态和列表滚动位置", "连续配置不丢失输入或重开容器"],
        ["LOC-R05", "APP 获取说明", "结果", "语言未配置或非法时统一使用英文说明", "APP 始终获得可展示内容"],
        ["LOC-R06", "保存选填语言", "数据", "空选填语言不写入版本和审批快照", "不生成无意义空字段"],
        ["LOC-R07", "维护当前版本文案", "审计", "仅通过独立入口修改，填写原因并递增 recordVersion", "文案生效但不改变原审批事实"],
        ["LOC-R08", "读取旧 Locale", "兼容", "旧语言码映射到固定目录，历史快照不改写", "新旧数据可用且历史事实不变"],
        ["LOC-R09", "设置翻译源", "数据", "简体中文是唯一 AI 翻译源，每次变更生成新的源文案修订", "译文与中文来源可追溯"],
        ["LOC-R10", "选择适配语言", "交互", "英文始终启用且不可取消，其他语言可多选并记忆到固件标识", "后续版本可复用语言范围"],
        ["LOC-R11", "AI 一键翻译", "交互", "按已启用语言批量生成 AI 草稿，部分失败不覆盖成功结果", "用户只需处理异常项"],
        ["LOC-R12", "确认 AI 草稿", "前置", "AI 草稿必须批量或逐项确认后才能进入发布快照", "发布内容经过人工确认"],
        ["LOC-R13", "更新中文源文案", "状态", "中文变化后旧译文标记为需更新但不删除", "历史内容保留且不会误作为最新翻译"],
        ["LOC-R14", "保护人工译文", "数据", "一键翻译默认不覆盖人工确认内容，仅显式重译当前语言时允许替换", "人工校对结果不丢失"],
        ["LOC-R15", "发布多语言文案", "前置", "简体中文、英文及全部启用语言必须已确认且未超限", "未适配语言统一使用英文兜底"]
      ]
    },
    reminder: {
      title: "APP 提醒策略规则",
      code: "REM",
      fr: "FR-06、FR-09、FR-10、FR-12、FR-14",
      rules: [
        ["REM-R01", "提交发布审批", "前置", "必须选择不提醒、弱提醒、强提醒或强制提醒", "未选择时阻止提交"],
        ["REM-R02", "提交回滚审批", "前置", "回滚必须重新选择提醒方式，不继承原事件", "恢复版本与本次触达策略绑定"],
        ["REM-R03", "切换提醒策略", "交互", "右侧 APP 模拟器实时展示对应效果", "提交前确认 APP 最终表现"],
        ["REM-R04", "切换预览语言", "交互", "支持全部 15 种语言并标识英文兜底", "提醒样式与语言内容可组合核对"],
        ["REM-R05", "保存提醒策略", "数据", "策略写入本次发布或回滚事件", "同一版本多次发布的记录互不污染"]
      ]
    },
    publish: {
      title: "正常发布规则",
      code: "PUB",
      fr: "FR-04、FR-06、FR-07、FR-10、FR-11、FR-13、FR-19、FR-20",
      rules: [
        ["PUB-R01", "展示发布入口", "状态", "除当前正式版本外均支持发布，审批目标打开已有审批", "不重复创建审批且入口明确"],
        ["PUB-R02", "点击发布", "权限", "按页面、操作、数据范围、版本状态和审批锁顺序校验", "不满足时阻止并说明原因"],
        ["PUB-R03", "提交审批", "前置", "校验固件包、功能点版本、启用语言、提醒策略和审批并发", "仅完整且无冲突的版本进入审批"],
        ["PUB-R04", "创建审批", "数据", "冻结 recordVersion、影响设备、功能点版本、说明和提醒方式", "审批内容与执行内容一一对应"],
        ["PUB-R05", "审批期间", "状态", "当前版本继续生效，目标版本及其内容锁定", "审批不会提前改变线上版本"],
        ["PUB-R06", "审批通过", "前置", "服务端复检当前指针、目标、固件包、功能点来源状态和快照版本号", "条件变化时审批失效"],
        ["PUB-R07", "执行发布", "结果", "同一事务切换唯一当前版本并生成发布事件和回滚目标", "始终只有一个当前正式版本"],
        ["PUB-R08", "执行失败", "异常", "整体回退且当前版本不变，不自动重试", "不产生双当前或半条事件"],
        ["PUB-R09", "审批驳回或失效", "状态", "恢复目标提交前真实状态并解除锁定", "历史、已撤回和未发布状态不被误改"],
        ["PUB-R10", "发布完成", "结果", "返回唯一当前版本、提醒策略和发布事件", "发布结果完整且可追溯"]
      ]
    },
    rollback: {
      title: "固件回滚规则",
      code: "RBK",
      fr: "FR-09、FR-12、FR-13、FR-19、FR-20",
      rules: [
        ["RBK-R01", "展示回滚入口", "状态", "仅当前正常发布事件存在唯一前序且未回滚时展示", "不能任意选择历史版本或连续回滚"],
        ["RBK-R02", "点击撤销并回滚", "前置", "当前版本存在唯一前序版本且无有效审批", "避免重复审批或错误选择目标"],
        ["RBK-R03", "填写回滚信息", "交互", "展示关键差异，重新选择提醒并填写最多 500 字原因", "明确恢复目标和影响"],
        ["RBK-R04", "提交回滚", "权限", "所有回滚统一创建钉钉审批", "高风险切换具有审批依据"],
        ["RBK-R05", "审批期间", "状态", "当前版本继续生效，同一标识发布与回滚锁定", "线上状态在审批结束前不变化"],
        ["RBK-R06", "审批通过", "前置", "复检当前指针、唯一目标、固件包和审批快照", "条件变化时不执行错误恢复"],
        ["RBK-R07", "执行回滚", "结果", "原子恢复前序版本，问题版本标记已撤回并关闭入口", "形成唯一可追溯的恢复结果"],
        ["RBK-R08", "执行失败", "异常", "整体回退且当前版本不变，不自动重试", "不留下部分恢复状态"],
        ["RBK-R09", "回滚完成", "结果", "返回恢复后的当前版本并记录完整回滚事件", "回滚结果清晰且可追溯"]
      ]
    },
    detail: {
      title: "当前版本与版本详情规则",
      code: "DET",
      fr: "FR-08、FR-12、FR-13、FR-15、FR-20",
      rules: [
        ["DET-R01", "查看当前版本", "数据", "聚合版本、来源、生效、提醒、机型和文件信息", "无需跨页面判断当前状态"],
        ["DET-R02", "当前版本操作", "状态", "只展示当前可用的详情、回滚和下架操作", "已下架能力不保留空入口"],
        ["DET-R03", "打开版本详情", "交互", "同一详情抽屉承载六类页签", "关联记录保持同一版本上下文"],
        ["DET-R04", "切换详情页签", "交互", "只替换抽屉内部内容，不关闭或重开", "切换稳定且不丢失位置"],
        ["DET-R05", "查看详情记录", "数据", "使用版本和事件关联标识查询", "不串联其他版本或事件数据"]
      ]
    },
    releaseLog: {
      title: "发布日志规则",
      code: "RLG",
      fr: "FR-14、FR-20",
      rules: [
        ["RLG-R01", "进入发布日志", "数据", "按日期分组，同日多个发布、回滚或下架事件独立展示", "高频操作时链路仍可区分"],
        ["RLG-R02", "查看事件摘要", "数据", "默认展示版本变化、状态、生效时间和操作人", "首屏只呈现焦点信息"],
        ["RLG-R03", "展开事件", "交互", "当前页面按时间节点展开审批、执行和结果", "无需跳转即可理解链路"],
        ["RLG-R04", "查询事件", "交互", "支持版本号、操作人和时间组合查询", "快速定位具体事件"],
        ["RLG-R05", "页面操作边界", "权限", "发布日志保持只读，不提供业务写操作", "历史追溯页不承担执行职责"],
        ["RLG-R06", "事件命名", "交互", "模块统一命名为发布日志", "页面名称与数据范围一致"]
      ]
    },
    differential: {
      title: "4G 模组在线差分规则",
      code: "DIF",
      fr: "FR-16、FR-17、FR-19、FR-20",
      rules: [
        ["DIF-R01", "展示差分页签", "权限", "仅 4G 模组产品线及授权角色可见", "其他产品线无无效入口"],
        ["DIF-R02", "新建差分任务", "前置", "名称不超过 50 字，目标单选，源版本多选", "输入结构明确且可校验"],
        ["DIF-R03", "选择版本", "数据", "源版本不得包含目标，模组型号自动带出", "避免自差分和型号错配"],
        ["DIF-R04", "查看任务结果", "数据", "展示状态、成功率、包数和逐源失败原因", "可判断每条差分结果"],
        ["DIF-R05", "差分任务失败", "状态", "不在原任务上重试，需要新建任务", "历史输入和失败事实不覆盖"],
        ["DIF-R06", "查看差分包", "交互", "按目标版本聚合并下拉展示源版本明细", "多包数据清晰可追溯"],
        ["DIF-R07", "删除差分包", "前置", "删除前二次确认，删除后新 OTA 任务不可选择", "防止误删并明确后续影响"],
        ["DIF-R08", "已引用差分包", "结果", "删除不影响 OTA 已创建任务", "既有任务执行事实稳定"]
      ]
    },
    audit: {
      title: "权限与审计规则",
      code: "AUD",
      fr: "FR-19、FR-20、FR-22",
      rules: [
        ["AUD-R01", "执行写操作", "权限", "服务端按页面、操作、数据范围、版本状态和审批锁校验", "前端隐藏按钮不是安全边界"],
        ["AUD-R02", "权限不足或状态冲突", "审计", "阻止操作并记录操作人、资源、结果和原因", "失败及被阻止行为可追溯"],
        ["AUD-R03", "版本操作", "审计", "版本、发布、回滚、文案和差分操作全部记录", "关键事实无审计空白"],
        ["AUD-R04", "角色与用户配置", "审计", "记录变更前后角色、数据范围、审批范围和操作人", "权限变化具有完整依据"],
        ["AUD-R05", "记录审批状态", "数据", "发布、回滚和下架覆盖审批中、通过、驳回和失效", "审批结果可查询并关联事件"],
        ["AUD-R06", "跨日志查询", "数据", "使用固件、版本、审批、流程和发布标识关联", "三类日志可互相追溯"],
        ["AUD-R07", "提供模拟数据", "验收", "七类角色、不同产线、正反向权限和日志状态均有 mock", "可直接验证授权边界"]
      ]
    },
    concurrency: {
      title: "并发、幂等与异常规则",
      code: "CON",
      fr: "FR-06、FR-07、FR-10、FR-11、FR-12、FR-13、FR-21",
      rules: [
        ["CON-R01", "同一标识已有审批", "并发", "阻止创建第二张发布、回滚或下架审批", "同一标识只有一条有效审批链路"],
        ["CON-R02", "重复点击审批目标发布", "幂等", "打开已有审批，不重复提交", "不产生重复审批单"],
        ["CON-R03", "审批期间目标被修改", "异常", "目标锁定，检测到异常修改则审批失效", "执行内容不偏离快照"],
        ["CON-R04", "审批通过时当前版本变化", "异常", "复检失败并使审批失效", "不覆盖新形成的当前版本"],
        ["CON-R05", "发布或回滚部分失败", "事务", "整体回滚", "不留下双当前或半条事件"],
        ["CON-R06", "历史或已撤回版本审批驳回", "状态", "恢复提交前真实状态", "不统一降级为未发布"],
        ["CON-R07", "APP 语言未配置", "兜底", "统一使用英文说明", "APP 始终有可用内容"],
        ["CON-R08", "旧 Locale 数据", "兼容", "映射到固定目录且历史快照不改写", "新旧版本兼容且历史不变"]
      ]
    },
    delist: {
      title: "当前发布版本下架规则",
      code: "DEL",
      fr: "FR-23、FR-24、FR-25",
      rules: [
        ["DEL-R01", "展示下架入口", "状态", "仅当前正式发布版本展示下架入口", "历史、未发布和已下架版本不能直接下架"],
        ["DEL-R02", "点击下架", "前置", "校验当前版本、审批锁和下架资格", "避免并发操作造成状态冲突"],
        ["DEL-R03", "展示影响快照", "数据", "展示当前版本、机型、设备数、生效时间和结果边界", "提交前明确下架对象与影响"],
        ["DEL-R04", "填写下架原因", "交互", "原因类型单选，具体说明必填 10 至 500 字", "形成结构化且可审计的下架依据"],
        ["DEL-R05", "提交下架审批", "审批", "所有下架统一创建钉钉审批", "高风险停止分发具有审批依据"],
        ["DEL-R06", "审批期间", "状态", "当前版本继续生效，同一标识其他发布、回滚和下架锁定", "审批结束前线上状态不变化"],
        ["DEL-R07", "审批通过", "前置", "复检当前版本、记录版本及审批快照后原子执行", "条件变化时审批失效且不清空当前版本"],
        ["DEL-R08", "下架成功", "结果", "清空当前发布指针但保留固件包，不自动恢复历史版本", "允许明确的暂无当前发布版本状态"],
        ["DEL-R09", "记录下架结果", "审计", "记录审批、执行结果、原因和当前版本变化", "下架事实完整可追溯"],
        ["DEL-R10", "重新发布已下架版本", "状态", "已下架版本允许编辑、查看和重新发起发布审批，不允许删除", "版本可再次使用且历史事实不被删除"]
      ]
    }
  };

  function configFromCatalog(item, optionValue = item.options[0].value) {
    const option = item.options.find(candidate => candidate.value === optionValue) || item.options[0];
    return { key: item.key, name: item.name, value: option.value, label: option.label, version: option.version, description: option.description };
  }

  const baseVersions = [
    { version: "23.110.211.13", url: "http://doraemon.camera666.com/firmware_VP_OTA_23.110.211.13_20260630_141359_1783931459.bin", size: "7.07", models: "QD20-DK", features: 4, creator: "刘林胶", note: "更新内容：1.修复已知问题 2.增加MQTT重新获取新的尚云uid 3.更新新的升级方式 4.同步最新代码", updated: "2026-07-13 16:30:59", latest: true, reminder: "不提醒" },
    { version: "23.110.211.99", url: "http://doraemon.camera666.com/firmware_VP_OTA_23.110.211.99_20260630_140504_1782876814.bin", size: "7.07", models: "QD20", features: 4, featureConfigs: featureCatalog.map(item => configFromCatalog(item)), creator: "张元/Alice", note: "弱网稳定性优化与升级链路修复", platformReleaseNotes: "弱网稳定性优化与升级链路修复", appReleaseNotes: { zh: "提升弱网环境下的连接稳定性。", en: "Improve connection stability on weak networks." }, updated: "2026-07-21 15:56:20", latest: false, status: "unpublished", reminder: "弱提醒", recordVersion: 1 },
    { version: "23.110.211.12", url: "http://doraemon.camera666.com/firmware_VP_OTA_23.110.211.12_20260520_103629_1779516160.bin", size: "7.17", models: "QD20-DK", features: 4, creator: "管理员", note: "1", updated: "2026-05-23 14:02:40", latest: false, reminder: "不提醒" },
    { version: "23.110.211.22", url: "http://doraemon.camera666.com/firmware_VP_OTA_23.110.211.22_20260518_150508_1779154483.bin", size: "6.86", models: "QD20", features: 4, creator: "管理员", note: "1", updated: "2026-05-19 09:34:43", latest: false, reminder: "不提醒" },
    { version: "23.110.211.10", url: "http://doraemon.camera666.com/firmware_VP_OTA_23.110.211.10_20260306_174532_1773372751.bin", size: "7.26", models: "qd20-dk", features: 0, creator: "管理员", note: "1", updated: "2026-03-13 11:32:31", latest: false, reminder: "不提醒" },
    { version: "23.110.211.60", url: "http://doraemon.camera666.com/firmware_VP_OTA_23.110.211.60_20260306_174704_1773283044.bin", size: "7.26", models: "QD20", features: 4, creator: "管理员", note: "已撤回版本，保留用于问题复盘", updated: "2026-07-21 16:12:06", latest: false, status: "withdrawn", reminder: "不提醒", recordVersion: 2 },
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
      ["2026-07-21 16:18:42", "汤彦珊", "系统管理员", "固件版本", "编辑", "23.110.211.12", "成功", "编辑历史版本元数据，修订记录由 R1 更新为 R2"],
      ["2026-07-21 16:12:06", "刘林胶", "测试人员", "固件版本", "编辑", "23.110.211.60", "成功", "编辑已撤回版本的功能集和 APP 更新说明"],
      ["2026-07-21 16:08:31", "刘林胶", "测试人员", "固件版本", "编辑", "23.110.211.13", "阻止", "当前正式发布版本不可执行完整编辑，请使用 APP 更新说明维护入口"],
      ["2026-07-21 15:56:20", "彭冬柏", "产线主管", "固件申请", "提交审批", "23.110.211.99", "成功", "已锁定版本快照 R1，审批期间目标版本不可编辑"],
      ["2026-07-21 15:40:18", "严国潮", "系统管理员", "角色权限", "更新", "测试人员", "成功", "授予新增、编辑固件版本权限；发布与回滚权限保持关闭"],
      ["2026-07-21 15:32:44", "严国潮", "系统管理员", "用户权限", "更新", "刘林胶", "成功", "关联角色由默认人员调整为测试人员，适用范围为 IPC"],
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
    ].map(([time, user, roleOrModule, moduleOrAction, actionOrResource, resourceOrResult, resultOrDescription, description]) => {
      const detailed = Boolean(description);
      const role = detailed ? roleOrModule : "测试人员";
      const module = detailed ? moduleOrAction : roleOrModule;
      const action = detailed ? actionOrResource : moduleOrAction;
      const resource = detailed ? resourceOrResult : actionOrResource;
      const result = detailed ? resultOrDescription : "成功";
      return { time, user, role, module, action, resource, result, description: detailed ? description : `${action}${module}: [${resource}]` };
    }),
    approvals: [
      ["23.110.211.99", "正常发布", "彭冬柏", "2026-07-21 15:56:20", "IPC 产品线负责人", "审批驳回", "2026-07-21 16:08:20", "测试范围未覆盖完整，目标版本保持未发布"],
      ["23.110.211.12", "版本回滚", "汤彦珊", "2026-07-21 14:20:08", "彭冬柏", "审批通过", "2026-07-21 14:28:36", "线上连接异常，恢复上一个稳定版本"],
      ["23.110.211.60", "正常发布", "刘林胶", "2026-07-20 18:05:12", "彭冬柏", "审批驳回", "2026-07-20 18:16:04", "测试报告缺少弱网场景验证"],
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
    ].map(([version, eventOrSubmitter, submitterOrTime, submitTimeOrApprover, approverOrStatus, statusOrTime, approveTimeOrNote, note]) => {
      const detailed = Boolean(note);
      const approval = detailed
        ? { version, event: eventOrSubmitter, submitter: submitterOrTime, submitTime: submitTimeOrApprover, approver: approverOrStatus, status: statusOrTime, approveTime: approveTimeOrNote, note }
        : { version, event: "正常发布", submitter: eventOrSubmitter, submitTime: submitterOrTime, approver: submitTimeOrApprover, status: approverOrStatus, approveTime: statusOrTime, note: "-" };
      if (version === "23.110.211.99" && approval.status === "审批中") {
        return { ...approval, id: "APR-MOCK-PUB-2399", type: "publish", firmwareId: "23.110.211", fromVersion: "23.110.211.13", toVersion: version, reminderPolicy: "weak", platformReleaseNotes: "弱网稳定性优化与升级链路修复", appReleaseNotes: { "zh-CN": "提升弱网环境下的连接稳定性。", "en-US": "Improve connection stability on weak networks." }, featureConfigs: featureCatalog.map(item => configFromCatalog(item)), reason: "", snapshotRecordVersion: 1, previousTargetStatus: "unpublished", flowId: "FLOW-MOCK-PUB-2399" };
      }
      return approval;
    }),
    users: [
      ["严国潮", "系统管理员", productLines, "2025-12-24 14:48:27"],
      ["彭冬柏", "产线主管", ["IPC", "4G模组"], "2026-01-08 09:22:10"],
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
    ].map(([name, role, lines, created]) => ({ name, role, lines: [...lines], created, approverLines: role === "产线主管" ? [...lines] : [], note: role })),
    roles: [
      { name: "系统管理员", users: 16, created: "2025-12-24 14:48:27", note: "全部产线与全部管理权限", default: true, scope: "全部产线", permissions: {} },
      { name: "产线主管", users: 8, created: "2026-01-08 09:22:10", note: "负责所属产线发布、回滚、下架、通知与审批查看", scope: "用户所属产线", permissions: {} },
      { name: "测试人员", users: 5, created: "2026-01-12 10:10:10", note: "维护待发布、历史及已撤回版本，不具备发布和回滚权限", scope: "用户所属产线", permissions: {} },
      { name: "默认人员", users: 86, created: "2025-12-24 14:48:27", note: "只读查看固件与模组信息", scope: "用户所属产线", permissions: {} },
      { name: "FAE技术支持组长", users: 4, created: "2026-04-23 17:29:37", note: "查看版本、发布日志与操作日志", scope: "用户所属产线", permissions: {} },
      { name: "FEA", users: 12, created: "2026-04-23 17:29:37", note: "只读查询版本和差分包", scope: "用户所属产线", permissions: {} },
      { name: "4G模组权限角色", users: 6, created: "2026-04-27 16:36:35", note: "维护 4G 模组版本、在线差分与差分包", scope: "仅 4G 模组", permissions: {} }
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
    if (!data.identifiers.some(identifier => identifier.id === "25.922.219")) data.identifiers.push(differentialDemoIdentifier());
    const identifierIds = new Set(data.identifiers.map(identifier => identifier.id));
    data.identifiers.forEach((identifier, identifierIndex) => {
      const legacyCurrent = identifier.versions.find(version => version.version === identifier.currentVersion) || identifier.versions.find(version => version.latest) || identifier.versions[0] || null;
      const legacyRollbackTarget = identifier.versions.find(version => version !== legacyCurrent && version.models === legacyCurrent?.models) || identifier.versions.find(version => version !== legacyCurrent) || null;
      if (!Number.isFinite(Number(identifier.boundDeviceCount))) identifier.boundDeviceCount = demoBoundDeviceCounts[identifier.id] || 160 + (identifierIndex * 73) % 640;
      identifier.boundDeviceCount = Number(identifier.boundDeviceCount);
      if (!Array.isArray(identifier.aiTranslationLocales)) identifier.aiTranslationLocales = ["en"];
      identifier.aiTranslationLocales = defaultLocaleIds.filter(locale => locale !== "zh" && new Set(["en", ...identifier.aiTranslationLocales.map(canonicalLocale).filter(Boolean)]).has(locale));
      identifier.versions.forEach((version, versionIndex) => {
        if (!Array.isArray(version.featureConfigs)) {
          version.featureConfigs = featureCatalog.slice(0, Number(version.features) || 0).map(item => configFromCatalog(item));
        }
        if (!Array.isArray(version.associatedFeatures)) version.associatedFeatures = [];
        version.associatedFeatures = version.associatedFeatures.map(feature => normalizeAssociatedFeatureSnapshot(feature, identifier.product));
        version.features = version.featureConfigs.length;
        if (!version.published && version.latest) version.published = version.version === "23.110.211.13" ? "2026-07-14 18:41:21" : version.updated;
        if (!version.platformReleaseNotes) version.platformReleaseNotes = version.note && version.note !== "-" ? version.note : "稳定性优化与已知问题修复";
        if (!version.appReleaseNotes || typeof version.appReleaseNotes !== "object") {
          version.appReleaseNotes = {
            zh: version.note && version.note !== "-" ? version.note : "提升设备连接稳定性并修复已知问题。",
            en: "Improve device connection stability and fix known issues."
          };
        }
        version.appReleaseNotes = normalizeAppNotes(version.appReleaseNotes);
        version.appNoteMeta = normalizeAppNoteMeta(version.appNoteMeta, version.appReleaseNotes);
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
      if (identifier.currentVersion === undefined && legacyCurrent) identifier.currentVersion = legacyCurrent.version;
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
      if (identifier.lastDelisted === undefined) identifier.lastDelisted = null;
      if (!Array.isArray(identifier.lifecycleEvents)) identifier.lifecycleEvents = initialLifecycleEvents(identifier, legacyCurrent, legacyRollbackTarget, identifierIndex);
      identifier.releaseEvents.forEach(event => {
        if (!event.flowId) {
          event.flowId = identifier.lifecycleEvents.find(item => item.flowStatus === "active" && item.toVersion === event.toVersion)?.flowId || `FLOW-LEGACY-${identifierIndex + 1}-${event.toVersion}`;
        }
      });
      const canonicalActiveEvent = identifier.currentVersion
        ? identifier.releaseEvents.find(event => event.status === "active" && event.toVersion === identifier.currentVersion) || identifier.releaseEvents.find(event => event.status === "active")
        : null;
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
      if (!identifier.currentVersion || !identifier.versions.some(version => version.version === identifier.rollbackTargetVersion)) {
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
      if (!role.scope) role.scope = role.name === "系统管理员" ? "全部产线" : role.name === "4G模组权限角色" ? "仅 4G 模组" : "用户所属产线";
      if (!role.permissions || !Object.keys(role.permissions).length) role.permissions = permissionPresetForRole(role.name);
    });
    const roleNames = new Set(data.roles.map(role => role.name));
    const fallbackRole = data.roles.find(role => role.default)?.name || data.roles[0]?.name || "";
    data.users.forEach(user => {
      if (!roleNames.has(user.role)) user.role = fallbackRole;
      if (!Array.isArray(user.lines)) user.lines = [];
      if (!Array.isArray(user.approverLines)) user.approverLines = [];
      if (!Array.isArray(user.changeLogs)) user.changeLogs = [];
      if (!user.changeLogs.length && user.name === "刘林胶") {
        user.changeLogs = [
          { time: "2026-07-21 15:32:44", operator: "严国潮", action: "更新角色", content: "关联角色：默认人员 → 测试人员；所属产线：IPC" },
          { time: "2026-07-18 10:20:16", operator: "严国潮", action: "更新范围", content: "移除 4G 模组，仅保留 IPC 产线数据范围" }
        ];
      }
      user.approverLines = user.approverLines.filter(line => user.lines.includes(line));
    });
    data.operations.forEach(item => {
      if (!item.role) item.role = data.users.find(user => user.name === item.user)?.role || "系统管理员";
      if (!item.result) item.result = /失败|阻止|驳回/.test(`${item.action}${item.description}`) ? "失败" : "成功";
    });
    data.identifiers.forEach(identifier => {
      if (identifier.activeApproval && !data.approvals.some(approval => approval.id === identifier.activeApproval.approvalId && approval.status === "审批中")) identifier.activeApproval = null;
    });
    data.approvals.forEach(approval => {
      if (approval.type === "publish" && !approval.previousTargetStatus) approval.previousTargetStatus = "unpublished";
      if (approval.status !== "审批中" || !approval.firmwareId || !approval.toVersion) return;
      const identifier = data.identifiers.find(item => item.id === approval.firmwareId);
      const target = identifier?.versions.find(version => version.version === approval.toVersion);
      if (!target || Number(target.recordVersion) !== Number(approval.snapshotRecordVersion)) return;
      if ((!Array.isArray(approval.featureConfigs) || !approval.featureConfigs.length) && target.featureConfigs.length) approval.featureConfigs = clone(target.featureConfigs);
      if (!Array.isArray(approval.associatedFeatures)) approval.associatedFeatures = clone(target.associatedFeatures || []);
      if (!approval.appReleaseNotes || !Object.keys(approval.appReleaseNotes).length) approval.appReleaseNotes = activeAppNotes(target.appReleaseNotes || {}, target.appNoteMeta || {});
      if (!approval.appNoteMeta) approval.appNoteMeta = clone(target.appNoteMeta || {});
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
  const defaultAuditRange = recentDateRange();
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
    rulePanel: null,
    ruleId: null,
    ruleAnchor: null,
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
    filters: { firmware: "", product: "IPC", lifecycleQuery: "", lifecycleRange: "7d", lifecycleStart: "", lifecycleEnd: "", differentialTask: "", differentialTaskStatus: "", differentialPackage: "", module: "", operation: "", approval: "", user: "", userLines: [], roleUserLines: [], operationStart: defaultAuditRange.start, operationEnd: defaultAuditRange.end, approvalStart: defaultAuditRange.start, approvalEnd: defaultAuditRange.end },
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

  function findPrototypeRule(context, ruleId) {
    const group = prototypeRuleCatalog[context];
    if (!group) return null;
    return group.rules.find(rule => rule[0] === ruleId) || null;
  }

  const prototypeRuleSequence = Object.values(prototypeRuleCatalog)
    .flatMap(group => group.rules.map(rule => rule[0]));

  function rulePinNumber(ruleId) {
    const index = prototypeRuleSequence.indexOf(ruleId);
    return index >= 0 ? index + 1 : "?";
  }

  function rulePinButton(context, ruleId, index = 0) {
    const rule = findPrototypeRule(context, ruleId);
    if (!rule) return "";
    const selected = state.rulePanel === context && state.ruleId === ruleId;
    const [, operation, , requirement] = rule;
    return `<button class="rule-annotation ${selected ? "active" : ""}" style="--rule-pin-offset:${-10 - index * 18}px" type="button" data-action="open-rule-panel" data-rule-context="${esc(context)}" data-rule-id="${esc(ruleId)}" title="${esc(`${ruleId} · ${operation}：${requirement}`)}" aria-label="查看批注 ${esc(ruleId)}：${esc(operation)}" aria-expanded="${selected}">${rulePinNumber(ruleId)}</button>`;
  }

  function rulePoint(context) {
    const group = prototypeRuleCatalog[context];
    return group?.rules[0] ? ruleAnnotation(context, group.rules[0][0]) : "";
  }

  function ruleAnnotation(context, ruleId) {
    const pin = rulePinButton(context, ruleId);
    return pin ? `<span class="rule-annotation-group" aria-label="当前操作批注">${pin}</span>` : "";
  }

  function ruleAnnotations(items, className = "") {
    const valid = items.filter(([context, ruleId]) => findPrototypeRule(context, ruleId));
    return valid.length ? `<span class="rule-annotation-group ${esc(className)}" aria-label="当前操作批注，共 ${valid.length} 条">${valid.map(([context, ruleId], index) => rulePinButton(context, ruleId, index)).join("")}</span>` : "";
  }

  function annotatedLabel(label, items, className = "") {
    return `<span class="annotated-label ${esc(className)}"><span>${esc(label)}</span>${ruleAnnotations(items)}</span>`;
  }

  function rulePointGroup(contexts) {
    const valid = [...new Set(contexts.filter(context => prototypeRuleCatalog[context]))];
    return valid.length ? `<div class="rule-point-group" aria-label="本操作关联需求规则">${valid.map(rulePoint).join("")}</div>` : "";
  }

  function ruleContextBar(contexts) {
    return "";
  }

  function renderRulePanel() {
    const group = prototypeRuleCatalog[state.rulePanel];
    const selectedRule = group && state.ruleId ? findPrototypeRule(state.rulePanel, state.ruleId) : null;
    if (!group || !selectedRule) return "";
    const [code, operation, type, requirement, expected] = selectedRule;
    const anchor = state.ruleAnchor || { left: 12, top: 12 };
    return `<aside class="rule-popover" role="dialog" aria-modal="false" aria-label="批注 ${esc(code)}" style="left:${anchor.left}px;top:${anchor.top}px"><header><span class="rule-popover-pin" aria-hidden="true">${rulePinNumber(code)}</span><div><strong>${esc(code)}</strong><span>${esc(group.title)}</span></div><button class="close-btn" data-action="close-rule-panel" aria-label="关闭批注">×</button></header><div class="rule-popover-body"><span class="rule-popover-type">${esc(type)}</span><dl><div><dt>操作节点</dt><dd>${esc(operation)}</dd></div><div><dt>规则要求</dt><dd>${esc(requirement)}</dd></div><div><dt>预期结果</dt><dd>${esc(expected)}</dd></div></dl></div></aside>`;
  }

  function calculateRulePopoverPosition(anchorRect) {
    const gutter = 12;
    const width = Math.min(356, window.innerWidth - gutter * 2);
    const estimatedHeight = Math.min(340, window.innerHeight - gutter * 2);
    let left = anchorRect.right + 10;
    if (left + width > window.innerWidth - gutter) left = anchorRect.left - width - 10;
    left = Math.max(gutter, Math.min(left, window.innerWidth - width - gutter));
    const top = Math.max(gutter, Math.min(anchorRect.top - 16, window.innerHeight - estimatedHeight - gutter));
    return { left: Math.round(left), top: Math.round(top) };
  }

  function positionRulePopover(anchorRect) {
    const popover = app.querySelector(".rule-popover");
    if (!popover) return;
    const gutter = 12;
    const rect = popover.getBoundingClientRect();
    let left = anchorRect.right + 10;
    if (left + rect.width > window.innerWidth - gutter) left = anchorRect.left - rect.width - 10;
    left = Math.max(gutter, Math.min(left, window.innerWidth - rect.width - gutter));
    let top = anchorRect.top - 16;
    if (top + rect.height > window.innerHeight - gutter) top = window.innerHeight - rect.height - gutter;
    top = Math.max(gutter, top);
    popover.style.left = `${Math.round(left)}px`;
    popover.style.top = `${Math.round(top)}px`;
    state.ruleAnchor = { left: Math.round(left), top: Math.round(top) };
  }

  function dismissRulePopover() {
    state.rulePanel = null;
    state.ruleId = null;
    state.ruleAnchor = null;
    app.querySelector(".rule-popover")?.remove();
    app.querySelectorAll(".rule-annotation.active").forEach(item => {
      item.classList.remove("active");
      item.setAttribute("aria-expanded", "false");
    });
  }

  function now() {
    const date = new Date();
    const pad = value => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  function recentDateRange(days = 7) {
    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - Math.max(0, days - 1));
    return { start: formatLocalDate(start), end: formatLocalDate(end) };
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

  function versionEditEligibility(identifier, version) {
    if (!version) return { allowed: false, reason: "固件版本不存在" };
    if (version.status === "current" || identifier.currentVersion === version.version) {
      return { allowed: false, reason: "当前正式发布版本不可完整编辑，请在详情中维护 APP 更新说明" };
    }
    const approvalLocksVersion = version.status === "approval" || identifier.activeApproval?.version === version.version;
    if (approvalLocksVersion) return { allowed: false, reason: "该版本正在审批，审批快照已锁定" };
    return { allowed: true, reason: "" };
  }

  function canEditVersion(identifier, version) {
    return versionEditEligibility(identifier, version).allowed;
  }

  function versionPublishEligibility(identifier, version) {
    if (!version) return { allowed: false, reason: "固件版本不存在" };
    if (version.status === "current" || identifier.currentVersion === version.version) {
      return { allowed: false, reason: "当前正式发布版本无需重复发布" };
    }
    return { allowed: true, reason: "" };
  }

  function publishableVersions(identifier) {
    const lastDelistedVersion = identifier.lastDelisted?.version;
    return identifier.versions
      .filter(version => versionPublishEligibility(identifier, version).allowed)
      .sort((left, right) => {
        const leftIsLastDelisted = left.version === lastDelistedVersion;
        const rightIsLastDelisted = right.version === lastDelistedVersion;
        if (leftIsLastDelisted !== rightIsLastDelisted) return leftIsLastDelisted ? -1 : 1;
        return String(right.updated || "").localeCompare(String(left.updated || ""));
      });
  }

  function beginPublishVersion(identifier, version) {
    const eligibility = versionPublishEligibility(identifier, version);
    if (!eligibility.allowed) {
      toast(eligibility.reason, "warning");
      return false;
    }
    if (identifier.activeApproval) {
      if (identifier.activeApproval.type === "publish" && identifier.activeApproval.version === version.version) {
        state.modal = { type: "approvalSimulation", approvalId: identifier.activeApproval.approvalId };
        return true;
      }
      toast("当前固件标识已有发布、回滚或下架审批", "warning");
      return false;
    }
    const noteError = appNoteConfigurationError(version.appReleaseNotes, normalizeAppNoteMeta(version.appNoteMeta, version.appReleaseNotes));
    if (noteError) {
      toast(`${noteError.message}，请先编辑版本`, "warning");
      return false;
    }
    const featureError = featureConfigurationError(version.associatedFeatures || [], identifier.product);
    if (featureError) {
      toast(`${featureError}，请先更新功能点配置`, "warning");
      return false;
    }
    state.errors = {};
    state.modal = { type: "publish", version: version.version, reminderPolicy: "", previewLocale: "zh", platformReleaseNotes: version.platformReleaseNotes };
    return true;
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

  function versionModelOptions(identifier, currentValue = "") {
    const values = String(identifier?.models || "").split(/[,，/]/).map(item => item.trim()).filter(Boolean);
    if (currentValue && !values.some(item => item.toLowerCase() === String(currentValue).toLowerCase())) values.unshift(currentValue);
    return [...new Set(values)];
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

  function versionStatusLabel(status) {
    return ({ unpublished: "未发布", approval: "发布审批中", current: "当前发布", historical: "历史发布", withdrawn: "已撤销", delisted: "已下架" })[status] || "未发布";
  }

  function reminderLabel(value) {
    return reminderPolicies.find(item => item.value === value)?.label || value || "不提醒";
  }

  function localeName(locale) {
    const canonical = canonicalLocale(locale);
    return localeCatalog.find(item => item.locale === canonical)?.label || locale;
  }

  function appNoteDraft(notes = {}) {
    return { ...Object.fromEntries(defaultLocaleIds.map(locale => [locale, ""])), ...normalizeAppNotes(clone(notes || {})) };
  }

  function isRequiredLocale(locale) {
    return requiredLocaleIds.includes(locale);
  }

  function configuredAppNotes(notes = {}) {
    return Object.fromEntries(Object.entries(normalizeAppNotes(notes))
      .map(([locale, content]) => [locale, String(content || "").trim()])
      .filter(([locale, content]) => content || isRequiredLocale(locale)));
  }

  function configuredDefaultLocaleCount(notes = {}) {
    return defaultLocaleIds.filter(locale => String(notes[locale] || "").trim()).length;
  }

  function activeAppNoteEditorHost() {
    if (state.modal?.type === "editAppNotes") return { container: state.modal, notesKey: "notesDraft", metaKey: "appNoteMeta" };
    if (["addVersion", "editVersion"].includes(state.drawer?.type)) return { container: state.drawer, notesKey: "appReleaseNotes", metaKey: "appNoteMeta" };
    return null;
  }

  function markVersionDrawerDirty() {
    if (["addVersion", "editVersion"].includes(state.drawer?.type)) state.drawer.dirty = true;
  }

  function appNoteMetaForHost(host = activeAppNoteEditorHost()) {
    if (!host) return null;
    host.container[host.notesKey] = appNoteDraft(host.container[host.notesKey]);
    host.container[host.metaKey] = normalizeAppNoteMeta(host.container[host.metaKey], host.container[host.notesKey]);
    return host.container[host.metaKey];
  }

  function enabledAppNoteLocales(meta = {}) {
    const enabled = new Set(["zh", "en", ...(meta.enabledLocales || [])]);
    return defaultLocaleIds.filter(locale => enabled.has(locale));
  }

  function activeAppNotes(notes = {}, meta = {}) {
    const normalized = normalizeAppNotes(notes);
    return Object.fromEntries(enabledAppNoteLocales(meta)
      .map(locale => [locale, String(normalized[locale] || "").trim()])
      .filter(([, content]) => content));
  }

  function appNoteConfigurationError(notes = {}, meta = {}) {
    const normalized = appNoteDraft(notes);
    for (const locale of enabledAppNoteLocales(meta)) {
      const content = String(normalized[locale] || "").trim();
      if (!content) return { locale, message: `${localeName(locale)}更新说明尚未完成` };
      if (!appNoteWithinLimit(locale, content)) return { locale, message: `${localeName(locale)}更新说明超过 ${appNoteLimit(locale)} 个字符` };
      if (/<\/?[a-z][\s\S]*>|<script/i.test(content)) return { locale, message: `${localeName(locale)}更新说明不允许包含 HTML 或脚本内容` };
      if (meta.statuses?.[locale] !== "confirmed") {
        return { locale, message: `${localeName(locale)}处于“${appNoteStatusLabels[meta.statuses?.[locale]] || "待确认"}”状态，请处理后再继续` };
      }
    }
    return null;
  }

  function clearAppNoteErrors(locales = defaultLocaleIds) {
    delete state.errors.appNotes;
    delete state.errors.revisionRequired;
    locales.forEach(locale => {
      delete state.errors[`locale-${locale}`];
      delete state.errors[`revision-${locale}`];
    });
  }

  function updateSourceNoteMeta(meta, notes, nextText) {
    const value = String(nextText || "");
    if (value === meta.sourceText) return;
    meta.sourceRevision = Math.max(1, Number(meta.sourceRevision) || 1) + 1;
    meta.sourceText = value;
    meta.statuses.zh = value.trim() ? "confirmed" : "pending";
    meta.origins.zh = "manual";
    meta.sourceRevisions.zh = meta.sourceRevision;
    enabledAppNoteLocales(meta).filter(locale => locale !== "zh").forEach(locale => {
      if (String(notes[locale] || "").trim()) meta.statuses[locale] = "stale";
      else meta.statuses[locale] = "pending";
    });
  }

  function updateManualLocaleMeta(meta, notes, locale) {
    if (locale === "zh") return;
    if (!meta.enabledLocales.includes(locale)) meta.enabledLocales.push(locale);
    meta.enabledLocales = defaultLocaleIds.filter(item => new Set(meta.enabledLocales).has(item));
    const hasContent = Boolean(String(notes[locale] || "").trim());
    meta.statuses[locale] = hasContent ? "confirmed" : "pending";
    meta.origins[locale] = hasContent ? "manual" : "none";
    meta.sourceRevisions[locale] = hasContent ? meta.sourceRevision : 0;
  }

  function syncAppNoteDraftFeedback(notes, locale, meta) {
    if (meta) defaultLocaleIds.forEach(item => {
      const status = app.querySelector(`.locale-item[data-locale="${item}"] em`);
      if (!status) return;
      const value = meta.statuses?.[item] || "unconfigured";
      status.textContent = appNoteStatusLabels[value] || value;
      status.className = `locale-status ${value}`;
    });
    const currentState = app.querySelector(".locale-current-state");
    if (currentState && meta) {
      const value = meta.statuses?.[locale] || "unconfigured";
      currentState.textContent = appNoteStatusLabels[value] || value;
      currentState.className = `locale-current-state ${value}`;
    }
    const summary = app.querySelector(".app-note-section-bar .subtle");
    if (summary && meta) summary.textContent = `已配置 ${configuredDefaultLocaleCount(notes)} / ${defaultLocaleIds.length} 种语言 · 英文兜底`;
    const action = app.querySelector('[data-action="ai-translate-notes"]');
    if (action && meta) action.textContent = `AI 一键翻译（${Math.max(0, enabledAppNoteLocales(meta).length - 1)}种）`;
  }

  function appNoteLimit(locale) {
    const canonical = canonicalLocale(locale);
    return localeCatalog.find(item => item.locale === canonical)?.limit || 160;
  }

  function appNoteWithinLimit(locale, content) {
    return String(content || "").length <= appNoteLimit(locale);
  }

  function appNoteForLocale(version, locale) {
    const notes = normalizeAppNotes(version?.appReleaseNotes || {});
    const meta = normalizeAppNoteMeta(version?.appNoteMeta, notes);
    const canonical = canonicalLocale(locale) || "en";
    const enabled = enabledAppNoteLocales(meta).includes(canonical);
    return {
      content: enabled && notes[canonical] ? notes[canonical] : notes.en || notes.zh || "",
      fallback: (!enabled || !notes[canonical]) && canonical !== "en" && Boolean(notes.en),
      sourceLocale: enabled && notes[canonical] ? canonical : notes.en ? "en" : "zh"
    };
  }

  const mockAiTranslations = {
    en: "Improve connection stability on weak networks and fix known issues.",
    zh_FT: "提升弱網環境下的連接穩定性，並修復已知問題。",
    vi: "Cai thien do on dinh ket noi trong moi truong mang yeu va khac phuc cac su co da biet.",
    th: "ปรับปรุงความเสถียรของการเชื่อมต่อในเครือข่ายที่อ่อนและแก้ไขปัญหาที่ทราบ",
    ja: "弱いネットワーク環境での接続安定性を向上し、既知の問題を修正しました。",
    ko: "약한 네트워크 환경에서 연결 안정성을 개선하고 알려진 문제를 수정했습니다.",
    ru: "Повышена стабильность соединения при слабом сигнале сети и исправлены известные проблемы.",
    de: "Verbesserte Verbindungsstabilitat bei schwachen Netzwerken und Behebung bekannter Probleme.",
    fr: "Amelioration de la stabilite de la connexion sur les reseaux faibles et correction des problemes connus.",
    es: "Mejora de la estabilidad de la conexion en redes debiles y correccion de problemas conocidos.",
    it: "Migliorata la stabilita della connessione su reti deboli e risolti i problemi noti.",
    nl: "Verbeterde verbindingsstabiliteit bij zwakke netwerken en bekende problemen opgelost.",
    pl: "Poprawiono stabilnosc polaczenia w slabych sieciach i usunieto znane problemy.",
    pt: "Melhoria da estabilidade da conexao em redes fracas e correcao de problemas conhecidos."
  };

  const mockAiTranslationScenarios = {
    feature: {
      en: "Add new device capabilities and improve the related interaction experience.",
      zh_FT: "新增裝置功能，並優化相關互動體驗。",
      vi: "Bo sung cac tinh nang moi cho thiet bi va cai thien trai nghiem tuong tac lien quan.",
      th: "เพิ่มความสามารถใหม่ให้กับอุปกรณ์และปรับปรุงประสบการณ์การใช้งานที่เกี่ยวข้อง",
      ja: "デバイスの新機能を追加し、関連する操作体験を改善しました。",
      ko: "새로운 기기 기능을 추가하고 관련 사용 경험을 개선했습니다.",
      ru: "Добавлены новые функции устройства и улучшено взаимодействие с ними.",
      de: "Neue Geratefunktionen wurden hinzugefugt und die zugehorige Bedienung verbessert.",
      fr: "Ajout de nouvelles fonctions de l'appareil et amelioration de l'experience associee.",
      es: "Se agregaron nuevas funciones del dispositivo y se mejoro la experiencia relacionada.",
      it: "Aggiunte nuove funzioni del dispositivo e migliorata l'esperienza correlata.",
      nl: "Nieuwe apparaatfuncties toegevoegd en de bijbehorende bediening verbeterd.",
      pl: "Dodano nowe funkcje urzadzenia i ulepszono zwiazana z nimi obsluge.",
      pt: "Foram adicionados novos recursos ao dispositivo e a experiencia relacionada foi aprimorada."
    },
    performance: {
      en: "Improve device response speed, reduce power consumption, and optimize overall performance.",
      zh_FT: "提升裝置回應速度、降低功耗，並優化整體效能。",
      vi: "Tang toc do phan hoi cua thiet bi, giam muc tieu thu dien va toi uu hieu suat tong the.",
      th: "เพิ่มความเร็วในการตอบสนองของอุปกรณ์ ลดการใช้พลังงาน และปรับปรุงประสิทธิภาพโดยรวม",
      ja: "デバイスの応答速度を向上し、消費電力を抑えて全体的な性能を最適化しました。",
      ko: "기기 응답 속도를 높이고 전력 소비를 줄여 전반적인 성능을 최적화했습니다.",
      ru: "Повышена скорость отклика устройства, снижено энергопотребление и оптимизирована производительность.",
      de: "Die Reaktionsgeschwindigkeit wurde erhoht, der Energieverbrauch gesenkt und die Gesamtleistung optimiert.",
      fr: "Amelioration de la reactivite, reduction de la consommation d'energie et optimisation des performances.",
      es: "Se mejoro la velocidad de respuesta, se redujo el consumo de energia y se optimizo el rendimiento.",
      it: "Migliorata la velocita di risposta, ridotto il consumo energetico e ottimizzate le prestazioni.",
      nl: "De reactiesnelheid is verbeterd, het energieverbruik verlaagd en de prestaties geoptimaliseerd.",
      pl: "Poprawiono szybkosc reakcji, zmniejszono zuzycie energii i zoptymalizowano wydajnosc.",
      pt: "A velocidade de resposta foi melhorada, o consumo de energia reduzido e o desempenho otimizado."
    },
    fix: {
      en: "Fix known issues and improve firmware reliability and user experience.",
      zh_FT: "修復已知問題，提升韌體可靠性與使用體驗。",
      vi: "Khac phuc cac su co da biet va cai thien do tin cay cua firmware cung trai nghiem nguoi dung.",
      th: "แก้ไขปัญหาที่ทราบและปรับปรุงความน่าเชื่อถือของเฟิร์มแวร์และประสบการณ์ใช้งาน",
      ja: "既知の問題を修正し、ファームウェアの信頼性と使用体験を改善しました。",
      ko: "알려진 문제를 수정하고 펌웨어 안정성과 사용 경험을 개선했습니다.",
      ru: "Исправлены известные проблемы, повышена надежность прошивки и улучшено удобство использования.",
      de: "Bekannte Probleme wurden behoben und Zuverlassigkeit sowie Benutzererfahrung verbessert.",
      fr: "Correction des problemes connus et amelioration de la fiabilite du micrologiciel.",
      es: "Se corrigieron problemas conocidos y se mejoro la fiabilidad del firmware y la experiencia de uso.",
      it: "Risolti i problemi noti e migliorate l'affidabilita del firmware e l'esperienza d'uso.",
      nl: "Bekende problemen opgelost en de betrouwbaarheid van de firmware verbeterd.",
      pl: "Usunieto znane problemy oraz poprawiono niezawodnosc oprogramowania i wygode uzytkowania.",
      pt: "Problemas conhecidos foram corrigidos e a confiabilidade do firmware foi aprimorada."
    }
  };

  const mockAiExactTranslations = {
    "测试": {
      en: "Test.", zh_FT: "測試。", vi: "Thử nghiệm.", th: "ทดสอบ", ja: "テストします。", ko: "테스트합니다.",
      ru: "Тест.", de: "Test.", fr: "Test.", es: "Prueba.", it: "Test.", nl: "Test.", pl: "Test.", pt: "Teste."
    },
    "测试一下": {
      en: "Test it.", zh_FT: "測試一下。", vi: "Thử nghiệm một chút.", th: "ทดสอบสักหน่อย", ja: "少しテストします。", ko: "테스트해 봅니다.",
      ru: "Проверить работу.", de: "Kurz testen.", fr: "Faire un test.", es: "Hacer una prueba.", it: "Fare una prova.", nl: "Even testen.", pl: "Przetestujmy.", pt: "Fazer um teste."
    }
  };

  const mockAiFallbackPrefixes = {
    en: "Translation preview", zh_FT: "翻譯預覽", vi: "Bản dịch xem trước", th: "ตัวอย่างคำแปล", ja: "翻訳プレビュー", ko: "번역 미리보기",
    ru: "Предпросмотр перевода", de: "Ubersetzungsvorschau", fr: "Apercu de la traduction", es: "Vista previa de traduccion", it: "Anteprima della traduzione",
    nl: "Vertaalvoorbeeld", pl: "Podglad tlumaczenia", pt: "Previa da traducao"
  };

  function normalizeMockAiSource(source) {
    return String(source || "").trim().replace(/[。！？!?；;，,]+$/g, "").trim();
  }

  function mockAiTranslationScenario(source) {
    if (/新增|增加|支持|上线|功能|能力/.test(source)) return "feature";
    if (/性能|速度|响应|启动|功耗|耗电|续航|流畅/.test(source)) return "performance";
    if (/连接|网络|弱网|离线|断连|稳定/.test(source)) return "stability";
    if (/修复|修正|解决|问题|异常|缺陷|故障|bug/i.test(source)) return "fix";
    return null;
  }

  function mockAiTranslation(source, locale) {
    const normalizedSource = normalizeMockAiSource(source);
    const exactTranslation = mockAiExactTranslations[normalizedSource]?.[locale];
    const scenario = mockAiTranslationScenario(source);
    const catalog = scenario === "stability" ? mockAiTranslations : mockAiTranslationScenarios[scenario];
    const translation = exactTranslation || catalog?.[locale] || `${mockAiFallbackPrefixes[locale] || localeName(locale)}：${String(source || "").trim()}`;
    const limit = appNoteLimit(locale);
    return translation.length > limit ? `${translation.slice(0, Math.max(0, limit - 1))}…` : translation;
  }

  async function runMockAiTranslation(locales, forceLocale = null) {
    const host = activeAppNoteEditorHost();
    const meta = appNoteMetaForHost(host);
    if (!host || !meta) return;
    const notes = host.container[host.notesKey];
    const source = String(notes.zh || "").trim();
    if (!source) { toast("请先填写简体中文更新说明", "warning"); return; }
    const targets = [...new Set(locales)].filter(locale => locale !== "zh" && enabledAppNoteLocales(meta).includes(locale));
    const protectedLocales = targets.filter(locale => forceLocale !== locale && meta.origins[locale] === "manual");
    const writable = targets.filter(locale => forceLocale === locale || meta.origins[locale] !== "manual");
    if (!writable.length) { toast(`已保留 ${protectedLocales.length} 种人工译文；如需覆盖，请进入对应语言点击“重新翻译”`, "warning"); return; }
    const jobId = `AI-${Date.now()}`;
    const sourceRevision = meta.sourceRevision;
    meta.translationJob = { id: jobId, sourceRevision, locales: writable };
    writable.forEach(locale => { meta.statuses[locale] = "translating"; });
    host.container.translationTargetsOpen = false;
    host.container.appNotesExpanded = true;
    markVersionDrawerDirty();
    renderShell();
    await new Promise(resolve => window.setTimeout(resolve, 650));
    const currentHost = activeAppNoteEditorHost();
    const currentMeta = appNoteMetaForHost(currentHost);
    if (!currentHost || !currentMeta || currentMeta.translationJob?.id !== jobId) return;
    if (currentMeta.sourceRevision !== sourceRevision) {
      writable.forEach(locale => { currentMeta.statuses[locale] = "stale"; });
      currentMeta.translationJob = null;
      renderShell();
      toast("中文源文案已变化，本次翻译结果未写入", "warning");
      return;
    }
    writable.forEach(locale => {
      currentHost.container[currentHost.notesKey][locale] = mockAiTranslation(source, locale);
      currentMeta.statuses[locale] = "ai_draft";
      currentMeta.origins[locale] = "ai";
      currentMeta.sourceRevisions[locale] = sourceRevision;
    });
    clearAppNoteErrors(writable);
    currentMeta.translationJob = null;
    renderShell();
    toast(`已根据最新中文生成 ${writable.length} 种语言的 AI 草稿${protectedLocales.length ? `，保留 ${protectedLocales.length} 种人工译文` : ""}`);
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
    if (!identifier?.currentVersion) return null;
    return identifier.releaseEvents.find(event => event.status === "active" && event.toVersion === identifier.currentVersion)
      || identifier.releaseEvents.find(event => event.status === "active")
      || null;
  }

  function releaseEventsForVersion(version, identifier = activeIdentifier()) {
    return (identifier?.releaseEvents || []).filter(event => event.fromVersion === version.version || event.toVersion === version.version);
  }

  function releaseId(prefix = "REL") {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  }

  function sourcePublishEventForRollback(identifier, rollbackEvent) {
    if (!identifier || rollbackEvent?.action !== "rollback") return null;
    return identifier.releaseEvents.find(event => event.id === rollbackEvent.sourceReleaseId)
      || identifier.releaseEvents.find(event => event.action === "publish" && event.toVersion === rollbackEvent.fromVersion && event.status === "rolled_back")
      || null;
  }

  function approvalById(id) {
    return db.approvals.find(item => item.id === id);
  }

  function addOperation(module, action, resource, user = "汤彦珊", result = "成功", description = "") {
    const role = db.users.find(item => item.name === user)?.role || "系统管理员";
    db.operations.unshift({ time: now(), user, role, module, action, resource, result, description: description || `${action}${module}: [${resource}]` });
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

  function permissionsFromActions(actions = [], pages = []) {
    const permissions = emptyPermissions();
    const enabledActions = new Set(actions);
    const enabledPages = new Set(pages);
    permissionRows.forEach(row => {
      const pageEnabled = enabledPages.has(row.page) || row.actions.some(action => enabledActions.has(action));
      if (pageEnabled) {
        permissions[`menu-${row.menu}`] = true;
        if (row.page) permissions[`page-${row.page}`] = true;
      }
      row.actions.forEach(action => {
        if (enabledActions.has(action)) permissions[`action-${action}`] = true;
      });
    });
    return permissions;
  }

  function permissionPresetForRole(roleName) {
    const firmwareRead = ["查看固件标识列表", "查看版本列表", "查看发布日志", "查看模组型号"];
    const presets = {
      "系统管理员": permissionRows.flatMap(row => row.actions),
      "产线主管": [...firmwareRead, "编辑固件标识", "发布固件版本", "回滚固件版本", "下架当前发布版本", "维护APP更新说明", "查看操作日志", "查看审批日志"],
      "测试人员": [...firmwareRead, "新增固件版本", "编辑固件版本", "删除固件版本", "查看在线差分", "查看差分包", "下载差分包"],
      "默认人员": firmwareRead,
      "FAE技术支持组长": [...firmwareRead, "查看在线差分", "查看差分包", "下载差分包", "查看操作日志"],
      "FEA": [...firmwareRead, "查看差分包", "下载差分包"],
      "4G模组权限角色": [...firmwareRead, "新增固件版本", "编辑固件版本", "删除固件版本", "查看在线差分", "新建差分任务", "查看差分包", "下载差分包", "删除差分文件"]
    };
    const actions = presets[roleName] || firmwareRead;
    return permissionsFromActions(actions);
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
    state.rulePanel = null;
    state.ruleId = null;
    state.ruleAnchor = null;
    const sameDrawer = Boolean(state.drawer && state.drawer === lastRenderedDrawer);
    const sameModal = Boolean(state.modal && state.modal === lastRenderedModal);
    const previousDrawerScroll = sameDrawer ? app.querySelector(".drawer-body")?.scrollTop ?? 0 : null;
    const previousModalScroll = sameModal ? app.querySelector(".dialog-body")?.scrollTop ?? 0 : null;
    const previousLocaleScroll = sameDrawer || sameModal ? app.querySelector(".locale-list")?.scrollTop ?? 0 : null;
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
    const localeList = app.querySelector(".locale-list");
    if (localeList) {
      if (previousLocaleScroll !== null) localeList.scrollTop = previousLocaleScroll;
      const activeLocaleItem = localeList.querySelector(".locale-item.active");
      if (activeLocaleItem) {
        const listRect = localeList.getBoundingClientRect();
        const itemRect = activeLocaleItem.getBoundingClientRect();
        if (itemRect.top < listRect.top) localeList.scrollTop -= listRect.top - itemRect.top;
        else if (itemRect.bottom > listRect.bottom) localeList.scrollTop += itemRect.bottom - listRect.bottom;
      }
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

  function pageHeader(title, tools = "", ruleContext = "") {
    return `<div class="page-header"><div class="page-title-row"><h1 class="page-title">${title}</h1>${ruleContext ? rulePoint(ruleContext) : ""}</div>${tools ? `<div class="page-tools">${tools}</div>` : ""}</div>`;
  }

  function renderIdentifierMeta(identifier) {
    if (identifier.product === "4G模组") {
      return `<div class="meta-grid four-g-meta"><span>所属产品线：<strong>${esc(identifier.product)}</strong></span><span>创建时间：<strong>${esc(identifier.created)}</strong></span><span>模组型号：<strong>${esc(identifier.models)}</strong></span><span title="固件标识下去重后的绑定设备总数">${annotatedLabel("绑定设备数", [["identifier", "FID-R03"]])}：<strong>${formatDeviceCount(identifier.boundDeviceCount)} 台</strong></span></div>`;
    }
    return `<div class="meta-grid"><span>所属产品线：<strong>${esc(identifier.product)}</strong></span><span>创建时间：<strong>${esc(identifier.created)}</strong></span><span>关联机型：<strong>${esc(identifier.models)}</strong></span><span title="固件标识下去重后的绑定设备总数">${annotatedLabel("绑定设备数", [["identifier", "FID-R03"]])}：<strong>${formatDeviceCount(identifier.boundDeviceCount)} 台</strong></span><span>网络类型：<strong>${esc(identifier.network)}</strong></span><span>电量类型：<strong>${esc(identifier.power)}</strong></span><span>架构类型：<strong>${esc(identifier.architecture)}</strong></span></div>`;
  }

  function renderFirmware() {
    const identifiers = filteredIdentifiers();
    const selected = identifiers.find(item => item.id === state.selectedIdentifier) || identifiers[0] || null;
    const header = pageHeader("固件列表", `<input class="field search-field" data-filter="firmware" value="${esc(state.filters.firmware)}" placeholder="请输入固件标识或固件版本号" aria-label="搜索固件"><select class="select" data-change="product-filter" aria-label="所属产品线">${productLines.map(line => `<option ${line === state.filters.product ? "selected" : ""}>${line}</option>`).join("")}</select>`);
    if (!selected) {
      return `<section class="page tint-page">${header}<div class="firmware-layout"><aside class="identifier-panel"><h2 class="panel-heading">固件管理</h2><div class="panel-action-with-rule"><button class="btn panel-action" data-action="add-identifier">⊕ 新增标识</button>${ruleAnnotation("identifier", "FID-R01")}</div><div class="muted" style="padding:16px">无匹配标识</div></aside><div class="firmware-main"><div class="empty-state"><div><div class="empty-illustration">▤</div>暂无匹配的固件数据</div></div></div></div></section>`;
    }
    const latest = currentVersion(selected);
    const pendingApproval = selected.activeApproval ? approvalById(selected.activeApproval.approvalId) : null;
    return `<section class="page tint-page">
      ${header}
      <div class="firmware-layout ${selected.product === "4G模组" && state.firmwareTab !== "firmware" ? "differential-layout" : ""}">
        <aside class="identifier-panel"><h2 class="panel-heading">固件管理</h2><div class="panel-action-with-rule"><button class="btn panel-action" data-action="add-identifier">⊕ 新增标识</button>${ruleAnnotation("identifier", "FID-R01")}</div><div class="identifier-list">${identifiers.map(item => `<button class="identifier-item ${item.id === selected.id ? "active" : ""}" data-action="select-identifier" data-id="${esc(item.id)}">${esc(item.id)}</button>`).join("") || `<div class="muted" style="padding:16px">无匹配标识</div>`}</div></aside>
        <div class="firmware-main ${selected.product === "4G模组" && state.firmwareTab !== "firmware" ? "differential-main" : ""}">
          <div class="summary-band ${selected.product === "4G模组" ? "four-g-summary" : ""}"><div class="summary-head"><div class="module-title-row"><h2>${esc(selected.id)}</h2></div><div class="summary-actions"><button class="btn small" data-action="refresh">↻ 刷新</button><div class="action-with-rules"><div class="popover-wrap"><button class="btn small" data-action="identifier-actions" aria-expanded="${state.popover === "identifier"}">••• 更多</button>${state.popover === "identifier" ? `<div class="action-popover compact-popover"><button data-action="edit-identifier">编辑</button><button class="danger-item" data-action="delete-identifier">删除</button></div>` : ""}</div>${ruleAnnotation("identifier", "FID-R02")}</div></div></div>${renderIdentifierMeta(selected)}</div>
          ${pendingApproval ? `<div class="approval-banner"><div><strong>${pendingApproval.type === "rollback" ? "回滚审批中" : pendingApproval.type === "delist" ? "下架审批中" : "发布审批中"}</strong><span>${esc(pendingApproval.version)} · 提交人 ${esc(pendingApproval.submitter)} · ${esc(pendingApproval.submitTime)}</span></div><button class="btn small primary" data-action="view-active-approval">查看审批</button></div>` : ""}
          <div class="tab-strip firmware-tabs"><button class="tab ${state.firmwareTab === "firmware" ? "active" : ""}" data-action="firmware-subtab" data-tab="firmware">固件列表</button><button class="tab ${state.firmwareTab === "lifecycle" ? "active" : ""}" data-action="firmware-subtab" data-tab="lifecycle">发布日志</button>${selected.product === "4G模组" ? `<button class="tab ${state.firmwareTab === "onlineDifferential" ? "active" : ""}" data-action="firmware-subtab" data-tab="onlineDifferential">在线差分</button><button class="tab ${state.firmwareTab === "differentialPackages" ? "active" : ""}" data-action="firmware-subtab" data-tab="differentialPackages">差分包列表</button>` : ""}</div>
          ${renderFirmwareTabContent(selected, latest)}
        </div>
      </div>
    </section>`;
  }

  function renderFirmwareTabContent(identifier, latest) {
    if (state.firmwareTab === "lifecycle") return renderLifecycle(identifier);
    if (identifier.product !== "4G模组" || state.firmwareTab === "firmware") {
      return `<section class="section-block"><div class="module-title-row section-heading-row"><h3 class="section-heading">当前发布版本</h3>${ruleAnnotations([["detail", "DET-R01"], ["delist", "DEL-R08"]])}</div>${latest ? renderLatest(identifier, latest) : renderNoCurrentRelease(identifier)}</section><section class="section-block firmware-version-section"><div class="section-bar"><div class="module-title-row"><h3>固件版本列表</h3>${ruleAnnotation("identifier", "FID-R04")}</div><div class="section-actions"><div class="popover-wrap"><button class="btn icon-btn" title="行高：${state.density === "default" ? "默认" : state.density === "comfortable" ? "宽松" : "紧凑"}" aria-label="行高：${state.density === "default" ? "默认" : state.density === "comfortable" ? "宽松" : "紧凑"}" data-action="density-menu">☷</button>${state.popover === "density" ? `<div class="action-popover density-popover">${[["default", "默认"], ["comfortable", "宽松"], ["compact", "紧凑"]].map(([value, label]) => `<button class="${state.density === value ? "selected" : ""}" data-action="set-density" data-density="${value}">${label}<span>${state.density === value ? "✓" : ""}</span></button>`).join("")}</div>` : ""}</div><div class="popover-wrap"><button class="btn icon-btn" title="列设置" aria-label="列设置" data-action="column-settings">⚙</button>${state.popover === "columns" ? renderColumnPopover() : ""}</div><span class="action-with-rules"><button class="btn primary" data-action="add-version">＋ 新增版本</button>${ruleAnnotations([["version", "VER-R01"], ["version", "VER-R04"]])}</span></div></div>${renderFirmwareTable(identifier)}${pagination(identifier.versions.length, state.firmwarePage, "firmware-page", "firmware")}</section>`;
    }
    if (state.firmwareTab === "onlineDifferential") return renderOnlineDifferential(identifier);
    return renderDifferentialPackages(identifier);
  }

  function lifecycleStageLabel(stage) {
    return ({ approval: "钉钉审批", release: "发布生效", rollback: "回滚生效", delist: "下架生效", cache: "升级检查" })[stage] || stage;
  }

  function lifecycleResultLabel(result) {
    return ({ success: "成功", active: "当前生效", partial: "部分失败", failed: "失败", rejected: "已驳回", skipped: "不发送" })[result] || result;
  }

  function lifecycleResultClass(result) {
    return result === "success" || result === "active" ? "success" : result === "failed" || result === "rejected" ? "danger" : "warning";
  }

  function lifecycleFlowLabel(flow) {
    if (flow.flowType === "rollback") return "版本回滚";
    if (flow.flowType === "delist") return "版本下架";
    return "版本发布";
  }

  function lifecycleFlowStatusLabel(status) {
    return ({ active: "当前生效", superseded: "历史发布", pending: "审批中", rejected: "审批驳回", failed: "发布失败", rolled_back: "已回滚", delisted: "已下架", completed: "已完成" })[status] || status;
  }

  function lifecycleFlowStatusClass(status) {
    return status === "active" || status === "completed" ? "success" : status === "rejected" || status === "failed" || status === "rolled_back" || status === "delisted" ? "danger" : "blue";
  }

  function lifecycleFilteredEvents(identifier) {
    const query = state.filters.lifecycleQuery.trim().toLowerCase();
    const events = [...(identifier.lifecycleEvents || [])];
    if (!query) return events.sort((left, right) => right.time.localeCompare(left.time));
    const matchingFlowIds = new Set(events.filter(event => {
      const haystack = [event.fromVersion, event.toVersion, event.title, event.summary, event.operator].join(" ").toLowerCase();
      return haystack.includes(query);
    }).map(event => event.flowId));
    return events.filter(event => matchingFlowIds.has(event.flowId)).sort((left, right) => right.time.localeCompare(left.time));
  }

  function lifecycleEventSequence(event) {
    if (Number.isFinite(Number(event.sequence))) return Number(event.sequence);
    if (["release", "rollback", "delist"].includes(event.stage)) return 30;
    if (event.stage === "cache") return 40;
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
      const effectiveEvent = orderedEvents.find(event => ["release", "rollback", "delist"].includes(event.stage)) || orderedEvents[orderedEvents.length - 1];
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
      const status = lifecycleDisplayStatus(identifier, flow);
      group.flows.push(flow);
      if (flow.flowType === "rollback" && flow.events.some(event => event.stage === "rollback" && event.result === "success")) group.rollbackCount += 1;
      if (flow.flowType === "delist" && flow.events.some(event => event.stage === "delist" && event.result === "success")) group.delistCount = (group.delistCount || 0) + 1;
      if (flow.flowType === "publish" && flow.events.some(event => event.stage === "release" && event.result === "success")) group.publishCount += 1;
      if (["rejected", "failed"].includes(status)) group.exceptionCount += 1;
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
    const releaseCount = new Set(allEvents.filter(event => event.flowType === "publish" && ["superseded", "rolled_back", "delisted"].includes(event.flowStatus)).map(event => event.flowId)).size;
    const rollbackCount = new Set(allEvents.filter(event => event.flowType === "rollback" && event.stage === "rollback" && event.result === "success").map(event => event.flowId)).size;
    const delistCount = new Set(allEvents.filter(event => event.flowType === "delist" && event.stage === "delist" && event.result === "success").map(event => event.flowId)).size;
    const current = currentVersion(identifier);
    const filtersActive = Boolean(state.filters.lifecycleQuery || state.filters.lifecycleRange !== "7d" || state.filters.lifecycleStart || state.filters.lifecycleEnd);
    const rangeOptions = [["today", "今天"], ["7d", "近 7 天"], ["all", "全部"], ["custom", "自定义"]];
    const rangeControl = `<div class="release-range-control"><div class="segmented-control release-range-segments">${rangeOptions.map(([value, label]) => `<button class="${state.filters.lifecycleRange === value ? "active" : ""}" data-action="set-lifecycle-range" data-range="${value}">${label}</button>`).join("")}</div>${state.filters.lifecycleRange === "custom" ? `<div class="release-custom-range"><input type="date" class="field" data-filter="lifecycleStart" value="${esc(state.filters.lifecycleStart)}" aria-label="发布日志开始日期"><span>至</span><input type="date" class="field" data-filter="lifecycleEnd" value="${esc(state.filters.lifecycleEnd)}" aria-label="发布日志结束日期"></div>` : ""}</div>`;
    return `<section class="lifecycle-section"><div class="lifecycle-overview release-log-overview"><div class="lifecycle-overview-copy"><div class="module-title-row"><h3>发布日志</h3>${ruleAnnotations([["releaseLog", "RLG-R01"], ["releaseLog", "RLG-R06"]])}</div></div><div class="lifecycle-stats release-log-stats"><div><span>当前发布</span><strong>${esc(current?.version || "暂无")}</strong></div><div><span>历史发布</span><strong>${releaseCount} 次</strong></div><div><span>历史回滚</span><strong>${rollbackCount} 次</strong></div><div><span>历史下架</span><strong>${delistCount} 次</strong></div></div></div><div class="lifecycle-toolbar release-log-toolbar"><div class="lifecycle-filters"><input class="field lifecycle-search" data-filter="lifecycleQuery" value="${esc(state.filters.lifecycleQuery)}" placeholder="搜索版本号或操作人" aria-label="搜索发布日志"><span class="action-with-rules"><button class="btn" data-action="apply-lifecycle-filter">查询</button>${ruleAnnotation("releaseLog", "RLG-R04")}</span>${filtersActive ? `<button class="btn" data-action="reset-lifecycle-filter">重置</button>` : ""}</div>${rangeControl}</div>${flows.length ? renderLifecycleTimeline(flows, identifier) : `<div class="empty-state lifecycle-empty"><div><div class="empty-illustration">▤</div>没有符合条件的发布日志</div></div>`}</section>`;
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
      const displayFlowStatus = lifecycleDisplayStatus(identifier, flow);
      const transition = flow.flowType === "delist" ? `${flow.fromVersion} → 暂无当前版本` : flow.toVersion ? `${flow.fromVersion || "首次发布"} → ${flow.toVersion}` : "标识初始化";
      const expanded = state.expandedLifecycleFlows.includes(flow.flowId);
      const effectiveEvent = flow.events.find(event => ["release", "rollback", "delist"].includes(event.stage)) || flow.events[flow.events.length - 1];
      const [timelineDate = "-", timelineClock = ""] = String(effectiveEvent?.time || "-").split(" ");
      const eventChain = expanded ? `<div class="release-log-event-chain"><div class="release-log-core-events">${flow.events.map((event, index) => renderLifecycleStep(event, timelineDate, index === flow.events.length - 1)).join("")}</div></div>` : "";
      return `<article class="release-timeline-entry ${displayFlowStatus} ${expanded ? "is-expanded" : ""}"><time class="release-timeline-time" datetime="${esc(effectiveEvent?.time || "")}"><strong>${esc(timelineClock)}</strong></time><div class="release-timeline-marker"><span class="${lifecycleFlowStatusClass(displayFlowStatus)}"></span>${flowIndex < flowCount - 1 ? `<i></i>` : ""}</div><div class="release-timeline-content"><div class="release-log-row"><button class="release-log-item" data-action="toggle-lifecycle-flow" data-flow-id="${esc(flow.flowId)}" aria-expanded="${expanded}"><span class="release-log-main"><span><span class="release-log-kind ${flow.flowType}">${flow.flowType === "rollback" ? "回滚" : flow.flowType === "delist" ? "下架" : "发布"}</span><strong>${esc(transition)}</strong><span class="tag ${lifecycleFlowStatusClass(displayFlowStatus)}">${lifecycleFlowStatusLabel(displayFlowStatus)}</span></span></span><span class="release-log-results"><span class="release-log-result ${approvalClass}"><span>审批</span><strong>${approvalLabel}</strong></span></span><span class="release-log-chevron" aria-hidden="true">${expanded ? "⌄" : "›"}</span></button>${ruleAnnotations([["releaseLog", "RLG-R02"], ["releaseLog", "RLG-R03"]], "release-entry-rules")}</div>${eventChain}</div></article>`;
  }

  function renderLifecycleTimeline(flows, identifier) {
    const groups = lifecycleDateGroups(flows, identifier);
    const todayValue = formatLocalDate(new Date());
    return `<div class="release-date-groups">${groups.map(group => {
      const summary = [`${group.flows.length} 条记录`, `${group.publishCount} 次发布`, `${group.rollbackCount} 次回滚`, `${group.delistCount || 0} 次下架`];
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
    return `<section class="section-block differential-section"><div class="differential-toolbar"><input class="field search-field differential-search" data-filter="differentialTask" value="${esc(state.filters.differentialTask)}" placeholder="请输入差分任务名称" aria-label="差分任务名称"><div class="differential-rule-actions"><span class="action-with-rules"><button class="btn primary" data-action="add-differential-task">＋ 差分任务</button>${ruleAnnotation("differential", "DIF-R02")}</span></div></div><div class="table-wrap differential-task-table-wrap"><table class="data-table differential-task-table"><thead><tr><th>差分任务名称</th><th><span class="table-rule-header">目标版本${ruleAnnotation("differential", "DIF-R03")}</span></th><th>源版本</th><th><span class="table-rule-header">状态${ruleAnnotation("differential", "DIF-R04")}</span> <span class="popover-wrap"><button class="table-filter-btn ${status ? "active" : ""}" data-action="differential-status-filter" aria-label="按状态过滤">▽</button>${statusPopover}</span></th><th>成功率</th><th>差分包</th><th>任务完成时间</th><th><span class="table-rule-header">操作${ruleAnnotation("differential", "DIF-R04")}</span></th></tr></thead><tbody>${rows.map(task => `<tr><td>${esc(task.name)}</td><td class="cell-truncate" title="${esc(task.targetVersion)}">${esc(task.targetVersion)}</td><td title="${esc(task.sourceVersions.join(", "))}" class="cell-truncate">${esc(task.sourceVersions.join(", "))}</td><td><span class="tag ${task.status === "已完成" ? "success" : task.status === "差分失败" ? "danger" : "warning"}">${esc(task.status)}</span></td><td>${esc(task.successRate)}</td><td>${task.packageCount}</td><td>${esc(task.completedAt || "-")}</td><td><button class="link-btn" data-action="differential-task-detail" data-task-id="${esc(task.id)}">详情</button></td></tr>`).join("")}</tbody></table></div>${rows.length ? pagination(filtered.length, state.differentialTaskPage, "differential-task-page", "differentialTasks") : `<div class="empty-state differential-empty"><div><div class="empty-illustration">▤</div>暂无差分任务</div></div>`}</section>`;
  }

  function renderDifferentialPackages(identifier) {
    const query = state.filters.differentialPackage.trim().toLowerCase();
    const filtered = identifier.differentialPackages.filter(group => !query || group.targetVersion.toLowerCase().includes(query));
    const pageSize = state.pageSizes.differentialPackages;
    state.differentialPackagePage = clampPage(filtered.length, pageSize, state.differentialPackagePage);
    const rows = filtered.slice((state.differentialPackagePage - 1) * pageSize, state.differentialPackagePage * pageSize);
    const body = rows.map(group => {
      const expanded = state.expandedDifferentialPackages.includes(group.targetVersion);
      return `<tr class="differential-summary-row"><td><span class="action-with-rules"><button class="expand-btn" data-action="toggle-differential-package" data-target-version="${esc(group.targetVersion)}" aria-label="${expanded ? "收起" : "展开"}">${expanded ? "⌄" : "›"}</button>${ruleAnnotation("differential", "DIF-R06")}</span></td><td>${esc(group.targetVersion)}</td><td>${group.items.length}</td><td>${esc(group.updatedAt)}</td></tr>${expanded ? `<tr class="differential-detail-row"><td colspan="4"><div class="differential-package-detail"><h4>${annotatedLabel(`支持升级到该版本的源固件明细（共 ${group.items.length} 个）`, [["differential", "DIF-R06"]])}</h4><div class="table-wrap"><table class="data-table differential-package-detail-table"><thead><tr><th>源版本</th><th>差分包大小（KB）</th><th>差分包名称</th><th>操作</th></tr></thead><tbody>${group.items.map(item => `<tr><td>${esc(item.sourceVersion)}</td><td>${esc(item.sizeKb)}</td><td title="${esc(item.name)}" class="cell-truncate">${esc(item.name)}</td><td><div class="cell-actions"><button class="link-btn" data-action="download-differential-package" data-package-id="${esc(item.id)}">差分包下载</button><span class="action-with-rules"><button class="link-btn danger-link" data-action="delete-differential-package" data-package-id="${esc(item.id)}" data-target-version="${esc(group.targetVersion)}">删除</button>${ruleAnnotations([["differential", "DIF-R07"], ["differential", "DIF-R08"]])}</span></div></td></tr>`).join("")}</tbody></table></div></div></td></tr>` : ""}`;
    }).join("");
    return `<section class="section-block differential-section"><div class="differential-toolbar"><input class="field search-field differential-search" data-filter="differentialPackage" value="${esc(state.filters.differentialPackage)}" placeholder="请输入目标版本号" aria-label="目标版本号">${ruleAnnotation("differential", "DIF-R06")}</div><div class="table-wrap"><table class="data-table differential-package-table"><thead><tr><th class="expand-column"></th><th>目标版本</th><th>差分包数</th><th>更新时间</th></tr></thead><tbody>${body}</tbody></table></div>${rows.length ? pagination(filtered.length, state.differentialPackagePage, "differential-package-page", "differentialPackages") : `<div class="empty-state differential-empty"><div><div class="empty-illustration">▤</div>暂无差分包</div></div>`}</section>`;
  }

  function renderColumnPopover() {
    const labels = { url: "下载地址", size: "文件大小（M）", models: "适用机型", devices: "关联设备数", features: "功能点数", creator: "创建人", note: "平台发布说明", updated: "更新时间" };
    return `<div class="action-popover column-popover"><strong>列设置</strong><label class="check"><input type="checkbox" checked disabled>固件版本号</label>${Object.entries(labels).map(([key, label]) => `<label class="check"><input type="checkbox" data-column="${key}" ${state.columns[key] ? "checked" : ""}>${label}</label>`).join("")}<label class="check"><input type="checkbox" checked disabled>操作</label></div>`;
  }

  function renderNoCurrentRelease(identifier) {
    const summary = identifier.lastDelisted;
    if (!summary) return `<div class="no-current-release"><div><strong>暂无当前发布版本</strong><span>请从下方固件版本列表选择版本并发起发布审批</span></div><button class="btn small primary" data-action="focus-publishable-versions">选择版本发布</button></div>`;
    const version = identifier.versions.find(item => item.version === summary.version);
    return `<div class="no-current-release delisted-summary"><div class="no-current-main"><span class="empty-current-icon">!</span><div><strong>暂无当前发布版本</strong><span>最近下架 ${esc(summary.version)} · ${esc(summary.time)}</span><small>下架原因：${esc(summary.reasonType)} · ${esc(summary.reason)}</small></div></div><div class="no-current-actions"><span class="action-with-rules"><button class="btn small" data-action="version-detail" data-version="${esc(version?.version || summary.version)}">查看版本详情</button>${ruleAnnotation("delist", "DEL-R10")}</span><button class="btn small primary" data-action="focus-publishable-versions">选择版本发布</button></div></div>`;
  }

  function renderLatest(identifier, version) {
    const event = activeRelease(identifier);
    const previous = rollbackTarget(identifier);
    const isRollback = event?.action === "rollback";
    const detailAction = `<span class="action-with-rules"><button class="btn small" data-action="version-detail" data-version="${esc(version.version)}">详情</button>${ruleAnnotation("detail", "DET-R03")}</span>`;
    const rollbackAction = identifier.rollbackAvailable && previous
      ? `<span class="action-with-rules"><button class="btn small danger" data-action="start-rollback" ${identifier.activeApproval ? "disabled" : ""}>撤销并回滚</button>${ruleAnnotations([["rollback", "RBK-R01"], ["rollback", "RBK-R02"]])}</span>`
      : `<span class="action-with-rules"><button class="btn small" disabled title="当前没有可用的一次性回滚目标">不可回滚</button>${ruleAnnotation("rollback", "RBK-R01")}</span>`;
    const delistAction = `<span class="action-with-rules"><button class="btn small danger-outline" data-action="start-delist" ${identifier.activeApproval ? "disabled" : ""}>下架</button>${ruleAnnotation("delist", "DEL-R01")}</span>`;
    const pendingDelist = identifier.activeApproval?.type === "delist";
    return `<div class="current-release-card"><div class="current-release-head"><div class="latest-version"><span class="file-mark">V</span><div><strong>${esc(version.version)}</strong><div class="muted">${pendingDelist ? "当前发布 · 下架审批中" : isRollback ? `由 ${esc(event.fromVersion)} 回滚恢复` : previous ? `上一个发布版本 ${esc(previous.version)}` : "首次发布"}</div></div></div><div class="current-release-actions">${detailAction}${pendingDelist ? `<span class="action-with-rules"><button class="btn small primary" data-action="view-active-approval">查看下架审批</button>${ruleAnnotation("delist", "DEL-R06")}</span>` : `${rollbackAction}${delistAction}`}</div></div><div class="current-release-grid"><div><span>生效时间</span><strong>${esc(event?.effectiveAt || version.published || version.updated)}</strong></div><div><span>APP 提醒方式</span><strong>${esc(reminderLabel(event?.reminderPolicy))}</strong></div><div><span>适用机型</span><strong>${esc(version.models)}</strong></div><div><span>文件大小</span><strong>${esc(version.size)} M</strong></div><div class="release-url"><span>下载地址</span><strong title="${esc(version.url)}">${esc(version.url)}</strong><div class="release-url-actions"><button class="link-btn" data-action="copy" data-copy="${esc(version.url)}" title="复制下载地址" aria-label="复制下载地址">▣</button><a class="link-btn" href="${esc(version.url)}" download title="下载固件" aria-label="下载固件">⇩</a></div></div></div></div>`;
  }

  function renderFirmwareTable(identifier) {
    const columns = state.columns;
    const pageSize = state.pageSizes.firmware;
    const rows = identifier.versions.slice((state.firmwarePage - 1) * pageSize, state.firmwarePage * pageSize);
    const headers = [`<th style="width:150px">固件版本号</th>`, columns.url && `<th style="width:230px">下载地址</th>`, columns.size && `<th style="width:105px">文件大小（M）</th>`, columns.models && `<th style="width:125px">适用机型</th>`, columns.devices && `<th style="width:145px" title="符合该版本适用机型的绑定设备数"><span class="table-rule-header">关联设备数${ruleAnnotation("identifier", "FID-R04")}</span></th>`, columns.features && `<th style="width:90px">功能点数</th>`, columns.creator && `<th style="width:120px">创建人</th>`, columns.note && `<th style="width:190px">平台发布说明</th>`, columns.updated && `<th style="width:170px">更新时间</th>`, `<th style="width:220px"><span class="table-rule-header table-operation-rules">操作${ruleAnnotations([["detail", "DET-R03"], ["publish", "PUB-R01"], ["publish", "PUB-R02"], ["version", "VER-R05"], ["version", "VER-R08"]])}</span></th>`].filter(Boolean).join("");
    return `<div class="table-wrap firmware-table-wrap"><table class="data-table firmware-version-table ${state.density}"><thead><tr>${headers}</tr></thead><tbody>${rows.map(version => {
      const editable = canEditVersion(identifier, version);
      const publishable = versionPublishEligibility(identifier, version).allowed;
      const deletable = version.status === "unpublished";
      const detail = `<button class="link-btn" data-action="version-detail" data-version="${esc(version.version)}">详情</button>`;
      const publish = publishable ? version.status === "delisted"
        ? `<span class="action-with-rules"><button class="link-btn" data-action="publish-version" data-version="${esc(version.version)}">发布</button>${ruleAnnotation("delist", "DEL-R10")}</span>`
        : `<button class="link-btn" data-action="publish-version" data-version="${esc(version.version)}">发布</button>` : "";
      const edit = editable ? `<button class="link-btn" data-action="edit-version" data-version="${esc(version.version)}">编辑</button>` : "";
      const remove = deletable ? `<button class="link-btn danger-link" data-action="delete-version" data-version="${esc(version.version)}">删除</button>` : "";
      return `<tr><td>${esc(version.version)}</td>${columns.url ? `<td><div class="cell-actions"><span class="cell-truncate" title="${esc(version.url)}">${esc(version.url)}</span><button class="link-btn" title="复制下载地址" data-action="copy" data-copy="${esc(version.url)}">▣</button></div></td>` : ""}${columns.size ? `<td>${esc(version.size)}</td>` : ""}${columns.models ? `<td>${esc(version.models)}</td>` : ""}${columns.devices ? `<td>${formatDeviceCount(version.associatedDeviceCount)}</td>` : ""}${columns.features ? `<td>${version.associatedFeatures?.length || 0}</td>` : ""}${columns.creator ? `<td>${esc(version.creator)}</td>` : ""}${columns.note ? `<td class="cell-truncate" title="${esc(version.platformReleaseNotes)}">${esc(version.platformReleaseNotes)}</td>` : ""}${columns.updated ? `<td>${esc(version.updated)}</td>` : ""}<td><div class="cell-actions firmware-row-actions">${detail}${publish}${edit}${remove}</div></td></tr>`;
    }).join("")}</tbody></table></div>`;
  }

  function renderModules() {
    const query = state.filters.module.toLowerCase();
    const filtered = db.modules.filter(item => item.model.toLowerCase().includes(query) || item.soc.toLowerCase().includes(query));
    const pageSize = state.pageSizes.modules;
    const rows = filtered.slice((state.modulePage - 1) * pageSize, state.modulePage * pageSize);
    return `<section class="page plain-page">${pageHeader("模组型号")}<div class="filter-bar"><input class="field search-field" data-filter="module" value="${esc(state.filters.module)}" placeholder="请输入模组型号，按enter搜索" aria-label="搜索模组型号"></div><div class="table-wrap"><table class="data-table"><thead><tr><th>模组型号</th><th>SOC型号</th><th><span class="table-rule-header">关联固件数${ruleAnnotations([["identifier", "FID-R05"], ["identifier", "FID-R06"]])}</span></th><th>FOTA工具版本</th><th>配置文件</th><th>创建时间</th></tr></thead><tbody>${rows.map(item => { const count = item.linkedIdentifiers.length; return `<tr><td>${esc(item.model)}</td><td>${esc(item.soc)}</td><td>${count ? `<span class="action-with-rules"><button class="link-btn" data-action="module-firmware" data-model="${esc(item.model)}">${count}</button>${ruleAnnotation("identifier", "FID-R05")}</span>` : `<span class="action-with-rules">0${ruleAnnotation("identifier", "FID-R06")}</span>`}</td><td>${esc(item.tool)}</td><td>${esc(item.config)}</td><td>${esc(item.created)}</td></tr>`; }).join("")}</tbody></table></div>${filtered.length ? pagination(filtered.length, state.modulePage, "module-page", "modules") : `<div class="empty-state"><div><div class="empty-illustration">▤</div>暂无数据</div></div>`}</section>`;
  }

  function renderOperations() {
    const query = state.filters.operation.toLowerCase();
    const filtered = db.operations.filter(item => (!query || item.resource.toLowerCase().includes(query)) && (!state.filters.operationStart || item.time.slice(0, 10) >= state.filters.operationStart) && (!state.filters.operationEnd || item.time.slice(0, 10) <= state.filters.operationEnd));
    const pageSize = state.pageSizes.operations;
    const rows = filtered.slice((state.operationPage - 1) * pageSize, state.operationPage * pageSize);
    return `<section class="page plain-page">${pageHeader("操作日志")}<div class="filter-bar"><input class="field search-field" data-draft="operation" value="${esc(state.draftFilters.operation ?? state.filters.operation)}" placeholder="请输入固件版本号" aria-label="固件版本号"><div class="date-range"><input class="date-field" type="date" data-draft="operationStart" value="${esc(state.draftFilters.operationStart ?? state.filters.operationStart)}" aria-label="开始日期"><span>至</span><input class="date-field" type="date" data-draft="operationEnd" value="${esc(state.draftFilters.operationEnd ?? state.filters.operationEnd)}" aria-label="结束日期"></div><span class="action-with-rules"><button class="btn primary" data-action="query-operations">查询</button>${ruleAnnotation("audit", "AUD-R06")}</span><button class="btn" data-action="reset-operations">重置</button></div><div class="table-wrap"><table class="data-table audit-table"><thead><tr><th>操作时间</th><th>操作人</th><th>角色</th><th>操作模块</th><th>操作动作</th><th>操作资源</th><th><span class="table-rule-header">结果${ruleAnnotation("audit", "AUD-R02")}</span></th><th><span class="table-rule-header">事件描述${ruleAnnotation("audit", "AUD-R03")}</span></th></tr></thead><tbody>${rows.map(item => `<tr><td>${esc(item.time)}</td><td>${esc(item.user)}</td><td>${esc(item.role)}</td><td>${esc(item.module)}</td><td>${esc(item.action)}</td><td>${esc(item.resource)}</td><td><span class="tag ${item.result === "成功" ? "success" : "danger"}">${esc(item.result)}</span></td><td class="audit-description">${esc(item.description)}</td></tr>`).join("")}</tbody></table></div>${pagination(filtered.length, state.operationPage, "operation-page", "operations")}</section>`;
  }

  function renderApprovals() {
    const query = state.filters.approval.toLowerCase();
    const filtered = db.approvals.filter(item => (!query || item.version.toLowerCase().includes(query)) && (!state.filters.approvalStart || item.submitTime.slice(0, 10) >= state.filters.approvalStart) && (!state.filters.approvalEnd || item.submitTime.slice(0, 10) <= state.filters.approvalEnd));
    const pageSize = state.pageSizes.approvals;
    const rows = filtered.slice((state.approvalPage - 1) * pageSize, state.approvalPage * pageSize);
    return `<section class="page plain-page">${pageHeader("审批日志")}<div class="filter-bar"><input class="field search-field" data-draft="approval" value="${esc(state.draftFilters.approval ?? state.filters.approval)}" placeholder="固件版本号" aria-label="固件版本号"><div class="date-range"><input class="date-field" type="date" data-draft="approvalStart" value="${esc(state.draftFilters.approvalStart ?? state.filters.approvalStart)}" aria-label="开始日期"><span>至</span><input class="date-field" type="date" data-draft="approvalEnd" value="${esc(state.draftFilters.approvalEnd ?? state.filters.approvalEnd)}" aria-label="结束日期"></div><span class="action-with-rules"><button class="btn primary" data-action="query-approvals">查询</button>${ruleAnnotation("audit", "AUD-R06")}</span><button class="btn" data-action="reset-approvals">重置</button></div><div class="table-wrap"><table class="data-table"><thead><tr><th>固件版本号</th><th>审批类型</th><th>提交人</th><th>提交时间</th><th>审批人</th><th><span class="table-rule-header">审批状态${ruleAnnotation("audit", "AUD-R05")}</span></th><th>审批时间</th><th>说明</th></tr></thead><tbody>${rows.map(item => { const statusClass = item.status === "审批通过" ? "success" : /驳回|失效|过期/.test(item.status) ? "danger" : "warning"; return `<tr><td>${esc(item.version)}</td><td>${esc(item.event)}</td><td>${esc(item.submitter)}</td><td>${esc(item.submitTime)}</td><td>${esc(item.approver)}</td><td><span class="tag ${statusClass}">${esc(item.status)}</span></td><td>${esc(item.approveTime)}</td><td>${esc(item.note)}</td></tr>`; }).join("")}</tbody></table></div>${pagination(filtered.length, state.approvalPage, "approval-page", "approvals")}</section>`;
  }

  function renderUsers() {
    const query = state.filters.user.toLowerCase();
    const lineFilters = state.filters.userLines || [];
    const filtered = db.users.filter(item => (!query || item.name.toLowerCase().includes(query) || item.role.toLowerCase().includes(query)) && (!lineFilters.length || lineFilters.some(line => item.lines.includes(line))));
    const pageSize = state.pageSizes.users;
    const rows = filtered.slice((state.userPage - 1) * pageSize, state.userPage * pageSize);
    const draftLines = state.userLineDraft || lineFilters;
    const linePopover = state.popover === "userLine" ? `<div class="action-popover user-line-popover"><div class="user-line-options">${productLines.map(line => `<label class="check"><input type="checkbox" data-user-line-filter="${esc(line)}" ${draftLines.includes(line) ? "checked" : ""}>${esc(line)}</label>`).join("")}</div><div class="filter-popover-actions"><button class="btn small primary" data-action="apply-user-line-filter">筛选</button><button class="btn small" data-action="reset-user-line-filter">重置</button></div></div>` : "";
    return `<section class="page plain-page">${pageHeader("用户列表")}<div class="filter-bar"><input class="field search-field" data-draft="user" value="${esc(state.draftFilters.user ?? state.filters.user)}" placeholder="请输入用户账号名称，按enter搜索" aria-label="用户账号名称"><button class="btn primary" data-action="query-users">查询</button><button class="btn" data-action="reset-users">重置</button></div><div class="user-table-area"><div class="table-wrap"><table class="data-table"><thead><tr><th style="width:190px">账号名称</th><th style="width:190px">关联角色</th><th>所属产线 <button class="table-filter-btn ${lineFilters.length ? "active" : ""}" data-action="user-line-filter" aria-label="按所属产线过滤">▽</button></th><th style="width:190px">创建时间</th><th style="width:245px">操作</th></tr></thead><tbody>${rows.map(item => `<tr><td>${esc(item.name)}</td><td>${esc(item.role)}</td><td class="cell-truncate" title="${esc(item.lines.join(" / "))}">${esc(item.lines.join(" / "))}</td><td>${esc(item.created)}</td><td><div class="cell-actions"><button class="link-btn" data-action="user-detail" data-user-index="${db.users.indexOf(item)}">详情</button><span class="action-with-rules"><button class="link-btn" data-action="user-permissions" data-user-index="${db.users.indexOf(item)}">权限配置</button>${ruleAnnotation("audit", "AUD-R04")}</span></div></td></tr>`).join("")}</tbody></table></div>${linePopover}</div>${pagination(filtered.length, state.userPage, "user-page", "users")}</section>`;
  }

  function renderRoles() {
    const role = activeRole();
    const associated = db.users.filter(user => user.role === role.name);
    const roleActions = role.default ? "" : `<div class="popover-wrap"><button class="btn small" data-action="role-more" aria-expanded="${state.popover === "role"}">••• 更多</button>${state.popover === "role" ? `<div class="action-popover compact-popover"><button data-action="edit-role">编辑</button><button class="danger-item" data-action="delete-role">删除</button></div>` : ""}</div>`;
    const permissionActions = state.roleTab === "permissions" && !role.default ? `<div class="permission-toolbar"><span class="action-with-rules"><button class="btn small" data-action="toggle-role-edit">${state.roleEditing ? "取消编辑" : "编辑权限"}</button>${ruleAnnotations([["audit", "AUD-R01"], ["audit", "AUD-R04"]])}</span></div>` : "";
    const grantedCount = role.name === "系统管理员" ? permissionRows.flatMap(row => row.actions).length : Object.entries(role.permissions || {}).filter(([key, enabled]) => key.startsWith("action-") && enabled).length;
    return `<section class="page tint-page">${pageHeader("角色权限")}<div class="role-layout"><aside class="role-panel"><h2 class="panel-heading">角色列表</h2><div class="panel-action-with-rule"><button class="btn panel-action" data-action="add-role">⊕ 新增角色</button>${ruleAnnotation("audit", "AUD-R04")}</div><div class="role-list">${db.roles.map(item => `<button class="role-item ${item.name === role.name ? "active" : ""}" data-action="select-role" data-role="${esc(item.name)}">${esc(item.name)}${item.default ? `<span class="tag success">默认</span>` : ""}</button>`).join("")}</div></aside><div class="role-main"><div class="summary-band"><div class="summary-head"><h2>${esc(role.name)}</h2><span class="action-with-rules">${roleActions}${roleActions ? ruleAnnotation("audit", "AUD-R04") : ""}</span></div><div class="meta-grid role-meta-grid"><span>数据范围：<strong>${esc(role.scope || "用户所属产线")}</strong></span><span>关联用户数：<strong>${associated.length}</strong></span><span>已授权操作：<strong>${grantedCount} 项</strong></span><span>创建时间：<strong>${esc(role.created)}</strong></span><span class="role-note">备注：<strong>${esc(role.note)}</strong></span></div></div><div class="tab-strip"><button class="tab ${state.roleTab === "permissions" ? "active" : ""}" data-action="role-tab" data-tab="permissions">角色权限</button><button class="tab ${state.roleTab === "users" ? "active" : ""}" data-action="role-tab" data-tab="users">关联用户</button></div><div class="role-tab-content">${permissionActions}${state.roleTab === "permissions" ? renderPermissionTable(role) : renderAssociatedUsers(associated)}${state.roleEditing ? `<div class="permission-save"><button class="btn" data-action="toggle-role-edit">取消</button><span class="action-with-rules"><button class="btn primary" data-action="save-role-permissions">保存权限</button>${ruleAnnotation("audit", "AUD-R04")}</span></div>` : ""}</div></div></div></section>`;
  }

  function renderPermissionTable(role, editable = state.roleEditing, prefix = "role") {
    const system = role.name === "系统管理员";
    const permissions = prefix === "role" && state.tempPermissions ? state.tempPermissions : role.permissions || {};
    return `<div class="table-wrap"><table class="data-table permission-table"><thead><tr><th style="width:170px">菜单</th><th style="width:230px">页面</th><th>功能操作权限</th></tr></thead><tbody>${permissionRows.map((row, rowIndex) => {
      const menuKey = `menu-${row.menu}`;
      const pageKey = row.page ? `page-${row.page}` : "";
      const checked = key => system || permissions[key] === true;
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

  function frameRuleItems(title, frameType) {
    const exact = {
      "新增固件标识": [["identifier", "FID-R01"]],
      "编辑固件标识": [["identifier", "FID-R02"]],
      "新增差分任务": [["differential", "DIF-R02"], ["differential", "DIF-R03"]],
      "选择发布版本": [["publish", "PUB-R01"], ["publish", "PUB-R02"], ["delist", "DEL-R10"]],
      "提交固件发布审批": [["publish", "PUB-R03"], ["reminder", "REM-R01"]],
      "撤销并回滚版本": [["rollback", "RBK-R03"], ["rollback", "RBK-R04"]],
      "下架当前发布版本": [["delist", "DEL-R03"], ["delist", "DEL-R04"], ["delist", "DEL-R05"]],
      "发布审批已提交": [["publish", "PUB-R05"]],
      "回滚审批已提交": [["rollback", "RBK-R05"]],
      "下架审批已提交": [["delist", "DEL-R06"], ["delist", "DEL-R07"]],
      "固件版本下架成功": [["delist", "DEL-R08"], ["delist", "DEL-R09"]],
      "删除固件版本": [["version", "VER-R08"]],
      "警告提示": [["differential", "DIF-R07"], ["differential", "DIF-R08"]],
      "新增角色": [["audit", "AUD-R04"]],
      "编辑角色": [["audit", "AUD-R04"]],
      "编辑功能关联": [["version", "VER-R03"]],
      "维护 APP 更新说明": [["locale", "LOC-R07"]],
      "新增固件版本": [["version", "VER-R04"], ["version", "VER-R17"]],
      "编辑固件版本": [["version", "VER-R07"], ["version", "VER-R17"]],
      "固件版本详情": [["detail", "DET-R03"], ["detail", "DET-R04"]],
      "差分任务详情": [["differential", "DIF-R04"]],
      "用户详情": [["audit", "AUD-R07"]],
      "权限配置": [["audit", "AUD-R04"]]
    };
    if (exact[title]) return exact[title];
    if (title.endsWith("关联固件列表")) return [["identifier", "FID-R05"]];
    return frameType === "drawer" ? [] : [];
  }

  function modalFrame(title, body, footer = "", wide = false, nested = false) {
    return `<section class="modal ${wide ? "wide" : ""} ${body.includes('class="app-reminder-layout"') ? "release-modal" : ""} ${body.includes('class="feature-picker"') ? "feature-modal" : ""} ${nested ? "nested-modal" : ""} ${animateCurrentModal ? "is-entering" : ""}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><header class="dialog-header"><div class="frame-title-with-rules"><h2>${esc(title)}</h2>${ruleAnnotations(frameRuleItems(title, "modal"))}</div><button class="close-btn" data-action="${nested ? "close-modal" : "close-overlay"}" aria-label="关闭">×</button></header><div class="dialog-body">${body}</div>${footer ? `<footer class="dialog-footer">${footer}</footer>` : ""}</section>`;
  }

  function drawerFrame(title, body, footer = "", narrow = false) {
    return `<section class="drawer ${narrow ? "narrow" : ""} ${animateCurrentDrawer ? "is-entering" : ""}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><header class="drawer-header"><div class="frame-title-with-rules"><h2>${esc(title)}</h2>${ruleAnnotations(frameRuleItems(title, "drawer"))}</div><button class="close-btn" data-action="close-overlay" aria-label="关闭">×</button></header><div class="drawer-body">${body}</div>${footer ? `<footer class="drawer-footer">${footer}</footer>` : ""}</section>`;
  }

  function errorFor(name) {
    return state.errors[name] ? `<div class="error-text">${esc(state.errors[name])}</div>` : "";
  }

  function renderReminderOptions(selected, field = "reminderPolicy") {
    return `<div class="reminder-options">${reminderPolicies.map(item => `<label class="reminder-option ${selected === item.value ? "selected" : ""}"><input type="radio" name="${field}" data-modal-field="${field}" value="${item.value}" ${selected === item.value ? "checked" : ""}><span><strong>${esc(item.label)}</strong><small>${esc(item.hint)}</small></span></label>`).join("")}</div>`;
  }

  function renderAppReminderPreview(modal, version) {
    const notes = normalizeAppNotes(version.appReleaseNotes || {});
    const activeLocale = defaultLocaleIds.includes(modal.previewLocale) ? modal.previewLocale : "zh";
    const previewNote = appNoteForLocale(version, activeLocale);
    const note = previewNote.content;
    const limit = appNoteLimit(previewNote.sourceLocale);
    const policy = modal.reminderPolicy || "unselected";
    const useChineseUi = activeLocale === "zh" || activeLocale === "zh_FT";
    const ui = useChineseUi ? {
      appTitle: "观看台", deviceName: "无GPS", strong: "发现新的固件版本，请尽快升级", forced: "发现新固件", update: "立即升级", choose: "选择提醒方式后查看效果"
    } : {
      appTitle: "Devices", deviceName: "No GPS", strong: "New firmware available. Update soon", forced: "New firmware available", update: "Update now", choose: "Select a reminder type to preview"
    };
    const localeOptions = localeCatalog.map(item => `<option value="${esc(item.locale)}" ${item.locale === activeLocale ? "selected" : ""}>${esc(item.label)} · ${esc(item.locale)}${!notes[item.locale] && item.locale !== "en" ? "（英文兜底）" : ""}</option>`).join("");
    const strongBanner = policy === "strong" ? `<div class="app-strong-banner"><span>${esc(ui.strong)}</span><b>›</b></div>` : "";
    const forcedDialog = policy === "forced-dialog" ? `<div class="app-forced-layer"><div class="app-forced-dialog"><strong>${esc(ui.forced)}</strong><p>${esc(previewSnippet(note, useChineseUi ? 52 : 96))}</p><span class="app-update-button">${esc(ui.update)}</span></div></div>` : "";
    const chooseHint = policy === "unselected" ? `<div class="app-preview-prompt">${esc(ui.choose)}</div>` : "";
    const policyHint = policy === "none" ? "无主动提示，仅保留设备设置入口" : policy === "weak" ? "设置入口红点" : policy === "strong" ? "设备卡片升级横幅" : policy === "forced-dialog" ? "持续升级弹窗" : "待选择";
    return `<aside class="app-simulator"><div class="app-simulator-head"><div><strong>${annotatedLabel("APP 效果预览", [["reminder", "REM-R03"]])}</strong><span>${esc(policyHint)}</span></div><span class="action-with-rules"><select class="select" data-modal-field="previewLocale" aria-label="切换APP预览语言">${localeOptions}</select>${ruleAnnotations([["reminder", "REM-R04"], ["concurrency", "CON-R11"]])}</span></div><div class="app-phone"><div class="app-phone-notch"></div><div class="app-phone-screen"><div class="app-status"><strong>17:14</strong><span>▮▮▮ 4G <b>86%</b></span></div><div class="app-screen-head"><strong>${esc(ui.appTitle)}</strong><span>◉　⌕　☷　▣</span></div><div class="app-device-card"><div class="app-device-main"><img src="assets/app-device-camera.png" alt="摄像机设备"><span><strong>${esc(ui.deviceName)}</strong><small>DCDG0012000GUFQ</small></span><b>›</b></div><div class="app-device-actions"><span>•••</span><span>SIM</span><span class="app-setting-icon">⚙${policy === "weak" ? `<i></i>` : ""}</span><span>♲</span></div>${strongBanner}${forcedDialog}</div>${chooseHint}<div class="app-bottom-nav"><span>▧<small>相册</small></span><strong>⌂</strong><span>♟<small>个人中心</small></span></div></div></div><div class="app-preview-copy"><div><strong>版本发布说明${previewNote.fallback ? `<em>英文兜底</em>` : ""}</strong><span class="${note.length > limit ? "over-limit" : ""}">${note.length} / ${limit}</span></div><p>${esc(note || "暂未配置版本发布说明")}</p></div><small class="app-preview-disclaimer">仅预览提醒样式，不代表 APP 已分发或设备已执行升级</small></aside>`;
  }

  function renderReleaseSnapshot(current, target) {
    const currentFeatures = new Map((current?.associatedFeatures || []).map(feature => [feature.id, feature]));
    const targetFeatures = new Map((target.associatedFeatures || []).map(feature => [feature.id, feature]));
    const ids = [...new Set([...currentFeatures.keys(), ...targetFeatures.keys()])];
    const rows = ids.map(id => {
      const previous = currentFeatures.get(id);
      const next = targetFeatures.get(id);
      const changed = !previous || !next || previous.featureVersionId !== next.featureVersionId;
      const previousValue = previous ? previous.version : "未配置";
      const targetValue = next ? next.version : "未配置";
      return `<div class="feature-snapshot-row ${changed ? "changed" : ""}"><span>${esc(next?.name || previous?.name || id)}</span><strong>${changed ? `${esc(previousValue)} <b>→</b> ${esc(targetValue)}` : esc(targetValue)}</strong><em>${changed ? next ? previous ? "版本变化" : "新增" : "移除" : "无变化"}</em></div>`;
    });
    const changedCount = ids.filter(id => currentFeatures.get(id)?.featureVersionId !== targetFeatures.get(id)?.featureVersionId).length;
    return `<section class="publish-snapshot"><div class="publish-snapshot-head"><div><h3>${annotatedLabel("发布内容快照", [["publish", "PUB-R04"]])}</h3><span>提交后与提醒策略一起进入审批快照</span></div><strong>功能点 ${targetFeatures.size} 项 · ${changedCount} 项变化</strong></div><div class="publish-summary-grid"><span>${annotatedLabel("预计影响设备", [["identifier", "FID-R04"]])}<strong>${formatDeviceCount(target.associatedDeviceCount)} 台</strong></span><span>适用机型<strong>${esc(target.models)}</strong></span><span>平台发布说明<strong>${esc(target.platformReleaseNotes)}</strong></span></div><div class="feature-snapshot"><div class="feature-snapshot-head"><span>功能点</span><strong>当前版本 → 目标版本</strong><em>结果</em></div>${rows.join("") || `<div class="feature-snapshot-empty">目标版本未配置功能点</div>`}</div></section>`;
  }

  function renderRollbackResultModal(modal) {
    return modalFrame("固件回滚成功", `<div class="approval-submit-result rollback-result"><div class="approval-result-icon">✓</div><h3>${esc(modal.version)} 已恢复为当前发布版本</h3></div>`, `<button class="btn primary" data-action="close-overlay">完成</button>`, true);
  }

  function renderDelistResultModal(modal) {
    return modalFrame("固件版本下架成功", `<div class="approval-submit-result delist-result"><div class="approval-result-icon">✓</div><h3>${esc(modal.version)} 已停止作为当前发布版本</h3><p>当前状态为“暂无当前发布版本”，固件包和已升级设备不受影响。</p></div>`, `<button class="btn primary" data-action="close-overlay">完成</button>`, true);
  }

  function renderApprovalSimulation(modal) {
    const approval = approvalById(modal.approvalId);
    const rollback = approval.type === "rollback";
    const delist = approval.type === "delist";
    const actionLabel = delist ? "下架" : rollback ? "回滚" : "发布";
    const snapshot = delist
      ? `<div class="approval-snapshot"><span>审批事件<strong>${esc(approval.event)}</strong></span><span>下架版本<strong>${esc(approval.version)}</strong></span><span>关联设备快照<strong>${formatDeviceCount(approval.associatedDeviceCount)} 台</strong></span><span>适用机型<strong>${esc(approval.models)}</strong></span><span>下架原因<strong>${esc(approval.reasonType)}</strong></span><span>提交人<strong>${esc(approval.submitter)}</strong></span><span>提交时间<strong>${esc(approval.submitTime)}</strong></span><span>具体说明<strong>${esc(approval.reason)}</strong></span></div>`
      : `<div class="approval-snapshot"><span>审批事件<strong>${esc(approval.event)}</strong></span><span>目标版本<strong>${esc(approval.version)}</strong></span><span>APP 提醒<strong>${esc(reminderLabel(approval.reminderPolicy))}</strong></span><span>APP 说明<strong>${Object.keys(approval.appReleaseNotes || {}).length} 种语言</strong></span><span>功能点<strong>${(approval.associatedFeatures || []).length} 项配置</strong></span><span>提交人<strong>${esc(approval.submitter)}</strong></span><span>提交时间<strong>${esc(approval.submitTime)}</strong></span></div>`;
    return modalFrame(delist ? "下架审批已提交" : rollback ? "回滚审批已提交" : "发布审批已提交", `${ruleContextBar([delist ? "delist" : rollback ? "rollback" : "publish", "concurrency"])}<div class="approval-submit-result"><div class="approval-result-icon">✓</div><h3>审批单已进入钉钉审批</h3><p>当前发布版本保持不变，审批通过后平台会重新校验快照并执行${actionLabel}事务。</p>${snapshot}<div class="prototype-simulation-note">原型审批模拟</div></div>`, `<button class="btn danger" data-action="simulate-approval-reject">模拟审批驳回</button><button class="btn primary" data-action="simulate-approval-approve">模拟审批通过</button>`, true);
  }

  function renderModal() {
    const modal = state.modal;
    if (modal.type === "discardVersionChanges") {
      return modalFrame("放弃未保存的修改？", `<p class="confirm-copy">当前版本信息尚未保存，关闭后本次修改将丢失。</p>`, `<button class="btn" data-action="close-modal">继续编辑</button><button class="btn danger" data-action="confirm-discard-version">放弃修改</button>`, false, true);
    }
    if (modal.type === "addIdentifier") {
      const modelOptions = [...new Set(db.identifiers.map(item => item.models).filter(Boolean))];
      const draft = modal.draft || { id: "", product: "IPC", models: "" };
      return modalFrame("新增固件标识", `${ruleContextBar(["identifier"])}<form id="add-identifier-form"><div class="notice">关联绑定机型后不支持二次编辑，请谨慎操作。<span class="notice-help">找不到机型？可直接输入</span></div><div class="form-grid single"><div class="form-field required"><label for="identifier-id">固件标识</label><input id="identifier-id" class="field" name="id" data-modal-draft="id" value="${esc(draft.id)}" placeholder="固件标识为xx.xx.xx，如1.0.0" autocomplete="off">${errorFor("id")}</div><div class="form-field required"><label for="identifier-product">所属产线</label><select id="identifier-product" class="select" name="product" data-modal-draft="product">${productLines.map(line => `<option ${line === draft.product ? "selected" : ""}>${line}</option>`).join("")}</select></div><div class="form-field required"><label for="identifier-models">关联机型</label><input id="identifier-models" class="field" name="models" data-modal-draft="models" value="${esc(draft.models)}" list="identifier-model-options" placeholder="请选择关联机型"><datalist id="identifier-model-options">${modelOptions.map(model => `<option value="${esc(model)}">`).join("")}</datalist>${errorFor("models")}</div></div></form>`, `<button class="btn" data-action="close-overlay">取消</button><button class="btn primary" type="submit" form="add-identifier-form">确认</button>`);
    }
    if (modal.type === "editIdentifier") {
      const item = activeIdentifier();
      return modalFrame("编辑固件标识", `${ruleContextBar(["identifier"])}<form id="edit-identifier-form"><div class="notice">关联机型创建后不可二次编辑。</div><div class="form-grid"><div class="form-field"><label>固件标识</label><input class="field" value="${esc(item.id)}" disabled></div><div class="form-field required"><label>所属产线</label><select class="select" name="product">${productLines.map(line => `<option ${line === item.product ? "selected" : ""}>${line}</option>`).join("")}</select></div><div class="form-field required"><label>关联机型</label><input class="field" value="${esc(item.models)}" disabled></div><div class="form-field"><label>网络类型</label><select class="select" name="network"><option ${item.network === "仅4G" ? "selected" : ""}>仅4G</option><option ${item.network === "WiFi" ? "selected" : ""}>WiFi</option><option ${item.network === "4G + WiFi" ? "selected" : ""}>4G + WiFi</option></select></div><div class="form-field"><label>电量类型</label><select class="select" name="power"><option ${item.power === "常电" ? "selected" : ""}>常电</option><option ${item.power === "低功耗" ? "selected" : ""}>低功耗</option></select></div><div class="form-field"><label>架构类型</label><select class="select" name="architecture"><option ${item.architecture === "新架构" ? "selected" : ""}>新架构</option><option ${item.architecture === "旧架构" ? "selected" : ""}>旧架构</option></select></div></div></form>`, `<button class="btn" data-action="close-overlay">取消</button><button class="btn primary" type="submit" form="edit-identifier-form">保存</button>`, true);
    }
    if (modal.type === "rollbackResult") {
      return renderRollbackResultModal(modal);
    }
    if (modal.type === "delistResult") {
      return renderDelistResultModal(modal);
    }
    if (modal.type === "addDifferentialTask") {
      const identifier = activeIdentifier();
      const targetVersion = modal.targetVersion || "";
      const availableSources = identifier.versions.filter(version => version.version !== targetVersion);
      const sourceSummary = (modal.sourceVersions || []).length ? modal.sourceVersions.join(", ") : "请选择源版本";
      const sourceOptions = modal.sourceOpen ? `<div class="differential-source-dropdown">${availableSources.map(version => `<label class="check"><input type="checkbox" data-differential-source="${esc(version.version)}" ${(modal.sourceVersions || []).includes(version.version) ? "checked" : ""}>${esc(version.version)}</label>`).join("") || `<span class="muted">没有可选的源版本</span>`}</div>` : "";
      return modalFrame("新增差分任务", `${ruleContextBar(["differential"])}<form id="differential-task-form" class="differential-task-form"><div class="form-field required"><label for="differential-task-name">差分任务名称</label><div class="field-control"><input id="differential-task-name" class="field" name="name" data-modal-field="name" maxlength="50" value="${esc(modal.name || "")}" placeholder="如：xx旧版本升级至xx新版本包的差分任务" autocomplete="off">${errorFor("differentialTaskName")}<div class="helper align-right">${(modal.name || "").length} / 50</div></div></div><div class="form-field required"><label for="differential-target-version">目标版本</label><div class="field-control"><select id="differential-target-version" class="select" name="targetVersion" data-modal-field="targetVersion"><option value="">请选择目标版本</option>${identifier.versions.map(version => `<option value="${esc(version.version)}" ${version.version === targetVersion ? "selected" : ""}>${esc(version.version)}</option>`).join("")}</select>${errorFor("differentialTargetVersion")}</div></div><div class="form-field required"><label>源版本</label><div class="field-control differential-source-control"><button class="multi-select-trigger ${(modal.sourceVersions || []).length ? "has-value" : ""}" type="button" data-action="toggle-differential-sources" aria-expanded="${Boolean(modal.sourceOpen)}"><span title="${esc(sourceSummary)}">${esc(sourceSummary)}</span><span class="select-chevron">⌄</span></button>${sourceOptions}${errorFor("differentialSourceVersions")}</div></div><div class="form-field"><label for="differential-module-model">模组型号</label><div class="field-control"><input id="differential-module-model" class="field" value="${esc(identifier.models)}" placeholder="根据固件标识自动带出" disabled></div></div></form>`, `<button class="btn" data-action="close-overlay">取 消</button><button class="btn primary" type="submit" form="differential-task-form">确 认</button>`);
    }
    if (modal.type === "selectPublishVersion") {
      const identifier = activeIdentifier();
      const versions = publishableVersions(identifier);
      const activeApproval = identifier.activeApproval;
      const rows = versions.map(version => {
        const blocked = Boolean(activeApproval && (activeApproval.type !== "publish" || activeApproval.version !== version.version));
        const approvalTarget = activeApproval?.type === "publish" && activeApproval.version === version.version;
        const recentlyDelisted = identifier.lastDelisted?.version === version.version;
        return `<label class="publish-version-option ${modal.selectedVersion === version.version ? "selected" : ""} ${blocked ? "disabled" : ""}"><input type="radio" name="publishVersion" data-modal-field="selectedVersion" value="${esc(version.version)}" ${modal.selectedVersion === version.version ? "checked" : ""} ${blocked ? "disabled" : ""}><span class="publish-version-copy"><span class="publish-version-head"><strong>${esc(version.version)}</strong><em>${approvalTarget ? "发布审批中" : recentlyDelisted ? "最近下架" : versionStatusLabel(version.status)}</em></span><span class="publish-version-meta"><span>适用机型 <strong>${esc(version.models || "-")}</strong></span><span>关联设备 <strong>${formatDeviceCount(version.associatedDeviceCount)} 台</strong></span><span>更新时间 <strong>${esc(version.updated || "-")}</strong></span></span><small>${esc(version.platformReleaseNotes || "暂无平台发布说明")}</small></span></label>`;
      }).join("");
      const approvalNote = activeApproval ? `<div class="approval-lock-note"><strong>当前已有${activeApproval.type === "publish" ? "发布" : activeApproval.type === "rollback" ? "回滚" : "下架"}审批</strong><span>${activeApproval.type === "publish" ? `只能继续处理版本 ${esc(activeApproval.version)} 的已有审批，不能重复创建审批单。` : "审批结束前不能发起新的版本发布。"}</span></div>` : "";
      const body = versions.length ? `<div class="publish-version-picker"><div class="publish-version-picker-head"><div><strong>请选择要正式发布的固件版本</strong><span>当前发布版本：${esc(currentVersion(identifier)?.version || "暂无")}</span></div><span>共 ${versions.length} 个可发布版本</span></div>${approvalNote}<div class="publish-version-list">${rows}</div></div>` : `<div class="empty-state"><div><div class="empty-illustration">▤</div>当前没有可发布的固件版本</div></div>`;
      return modalFrame("选择发布版本", body, `<button class="btn" data-action="close-overlay">取消</button><span class="action-with-rules"><button class="btn primary" data-action="continue-publish-selection" ${modal.selectedVersion ? "" : "disabled"}>下一步：配置发布</button>${ruleAnnotation("publish", "PUB-R02")}</span>`, true);
    }
    if (modal.type === "publish") {
      const identifier = activeIdentifier();
      const targetVersion = findVersion(modal.version);
      const current = currentVersion(identifier);
      return modalFrame("提交固件发布审批", `<div class="release-impact"><div><span>当前发布版本</span><strong>${esc(current?.version || "-")}</strong></div><div class="impact-arrow">→</div><div><span>${annotatedLabel("目标发布版本", [["publish", "PUB-R03"]])}</span><strong>${esc(targetVersion.version)}</strong></div></div><div class="app-reminder-layout"><div class="publish-primary-column"><section class="app-reminder-choice"><div class="field-rule-row"><div class="section-label required">APP 提醒方式</div>${ruleAnnotations([["reminder", "REM-R01"], ["reminder", "REM-R03"]])}</div>${renderReminderOptions(modal.reminderPolicy)}${errorFor("reminderPolicy")}</section>${renderReleaseSnapshot(current, targetVersion)}<div class="approval-boundary-note">${annotatedLabel("审批边界", [["publish", "PUB-R10"]])}：本审批决定版本发布与 APP 提醒策略；审批通过后平台会复检快照并执行版本切换。</div></div>${renderAppReminderPreview(modal, targetVersion)}</div>`, `<button class="btn" data-action="close-overlay">取消</button><span class="action-with-rules"><button class="btn primary" data-action="confirm-publish">提交发布审批</button>${ruleAnnotations([["publish", "PUB-R03"], ["concurrency", "CON-R01"]])}</span>`, true);
    }
    if (modal.type === "rollback") {
      const identifier = activeIdentifier();
      const current = currentVersion(identifier);
      const targetVersion = rollbackTarget(identifier);
      const currentLocales = Object.keys(current.appReleaseNotes || {});
      const targetLocales = Object.keys(targetVersion.appReleaseNotes || {});
      return modalFrame("撤销并回滚版本", `<div class="rollback-heading"><strong>${annotatedLabel(`当前版本 ${current.version} 将被撤销`, [["rollback", "RBK-R01"], ["rollback", "RBK-R02"]])}</strong><span>审批通过后恢复至唯一回滚目标 ${esc(targetVersion.version)}</span></div><div class="rollback-compare"><div class="compare-head"><span>${annotatedLabel("对比项", [["rollback", "RBK-R03"]])}</span><strong>当前发布版本</strong><strong>回滚目标版本</strong><span>变化</span></div>${[["固件版本号", current.version, targetVersion.version, "切换目标"], ["版本状态", "当前发布", "历史发布", "恢复生效"], ["适用机型", current.models, targetVersion.models, current.models === targetVersion.models ? "无变化" : "存在差异"], ["功能点配置", `${current.associatedFeatures.length} 项`, `${targetVersion.associatedFeatures.length} 项`, current.associatedFeatures.length === targetVersion.associatedFeatures.length ? "无变化" : "存在差异"], ["APP 说明", `${currentLocales.length} 种语言`, `${targetLocales.length} 种语言`, sameValues(currentLocales, targetLocales) ? "无变化" : "覆盖变化"]].map(row => `<div class="compare-row"><span>${esc(row[0])}</span><strong>${esc(row[1])}</strong><strong>${esc(row[2])}</strong><em class="${row[3].includes("差异") || row[3].includes("变化") ? "changed" : ""}">${esc(row[3])}</em></div>`).join("")}</div><div class="form-field required"><div class="field-rule-row"><label>本次 APP 提醒方式</label>${ruleAnnotations([["reminder", "REM-R02"], ["reminder", "REM-R03"]])}</div>${renderReminderOptions(modal.reminderPolicy)}${errorFor("reminderPolicy")}</div><div class="form-field required"><div class="field-rule-row"><label>回滚原因</label>${ruleAnnotation("rollback", "RBK-R03")}</div><textarea class="textarea" data-modal-field="reason" maxlength="500" placeholder="请说明问题表现、影响范围、回滚原因及后续处理计划">${esc(modal.reason || "")}</textarea>${errorFor("rollbackReason")}<div class="helper align-right">${(modal.reason || "").length} / 500</div></div>`, `<button class="btn" data-action="close-overlay">取消</button><span class="action-with-rules"><button class="btn primary" data-action="confirm-rollback">提交回滚审批</button>${ruleAnnotations([["rollback", "RBK-R04"], ["concurrency", "CON-R01"]])}</span>`, true);
    }
    if (modal.type === "delist") {
      const identifier = activeIdentifier();
      const current = currentVersion(identifier);
      const event = activeRelease(identifier);
      if (!current || !event) return modalFrame("下架当前发布版本", `<div class="empty-state"><div>当前发布版本已变化，请关闭后刷新</div></div>`, `<button class="btn" data-action="close-overlay">关闭</button>`);
      return modalFrame("下架当前发布版本", `<div class="delist-impact-grid"><div><span>当前发布版本</span><strong>${esc(current.version)}</strong></div><div><span>适用机型</span><strong>${esc(current.models)}</strong></div><div><span>关联设备数</span><strong>${formatDeviceCount(current.associatedDeviceCount)} 台</strong></div><div><span>生效时间</span><strong>${esc(event.effectiveAt || current.published || current.updated)}</strong></div><div><span>固件包处理</span><strong>保留原文件</strong></div><div><span>下架后状态</span><strong>暂无当前发布版本</strong></div></div><div class="delist-boundary"><strong>${annotatedLabel("下架结果边界", [["delist", "DEL-R03"]])}</strong><span>停止将该版本作为当前发布版本；不删除固件包，不影响已升级设备，也不自动停止 OTA 已有任务。</span></div><div class="form-field required"><div class="field-rule-row"><label>下架原因类型</label>${ruleAnnotation("delist", "DEL-R04")}</div><div class="delist-reason-options">${delistReasonTypes.map(reason => `<label class="delist-reason-option ${modal.reasonType === reason ? "selected" : ""}"><input type="radio" name="delistReasonType" data-modal-field="reasonType" value="${esc(reason)}" ${modal.reasonType === reason ? "checked" : ""}><span>${esc(reason)}</span></label>`).join("")}</div>${errorFor("delistReasonType")}</div><div class="form-field required"><label>具体说明</label><textarea class="textarea" data-modal-field="reason" maxlength="500" placeholder="请说明问题表现、影响范围及后续处理计划">${esc(modal.reason || "")}</textarea>${errorFor("delistReason")}<div class="helper align-right">${(modal.reason || "").length} / 500（至少 10 字）</div></div>`, `<button class="btn" data-action="close-overlay">取消</button><span class="action-with-rules"><button class="btn danger" data-action="confirm-delist">提交下架审批</button>${ruleAnnotations([["delist", "DEL-R05"], ["concurrency", "CON-R01"]])}</span>`, true);
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
      const notes = appNoteDraft(modal.notesDraft);
      return modalFrame("维护 APP 更新说明", `${ruleContextBar(["locale"])}<div class="revision-warning">已发布文案修改无需重新审批，但会生成不可覆盖的修订记录并立即失效 APP 升级检查缓存。未启用语言由 APP 使用英文说明兜底。</div>${renderAppNoteEditor(notes, modal.activeLocale || "zh", "revision", modal.appNoteMeta)}<div class="form-field required revision-reason-field"><label>修改原因</label><textarea class="textarea" data-revision-reason maxlength="200" placeholder="请说明翻译修正、措辞优化或其他修改原因">${esc(modal.reason || "")}</textarea>${errorFor("revisionReason")}</div>`, `<button class="btn" data-action="close-modal">取消</button><button class="btn primary" data-action="save-app-notes">保存修订</button>`, true, true);
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
    return modalFrame(title, `${ruleContextBar(["audit"])}<form id="${editing ? "edit-role-form" : "add-role-form"}"><div class="form-grid single"><div class="form-field required"><label>角色名称</label><input class="field" name="name" data-modal-draft="name" maxlength="20" value="${esc(draft.name)}" placeholder="请输入角色名称">${errorFor("roleName")}<div class="helper align-right">${draft.name.length} / 20</div></div><div class="form-field required"><label>角色编码</label><input class="field" name="code" data-modal-draft="code" maxlength="20" value="${esc(draft.code)}" ${editing ? "disabled" : ""} placeholder="请输入角色英文编码">${errorFor("roleCode")}<div class="helper align-right">${draft.code.length} / 20</div></div><div class="form-field"><label>备注</label><textarea class="textarea" name="note" data-modal-draft="note" maxlength="200" placeholder="请输入备注">${esc(draft.note)}</textarea><div class="helper align-right">${draft.note.length} / 200</div></div></div></form>`, `<button class="btn" data-action="close-overlay">取消</button><button class="btn primary" type="submit" form="${editing ? "edit-role-form" : "add-role-form"}">${editing ? "保存" : "确认"}</button>`);
  }

  function renderFeaturePicker() {
    const modal = state.modal;
    const identifier = activeIdentifier();
    const availableFeatures = availableAssociatedFeatures();
    const query = String(modal.query || "").trim().toLowerCase();
    const categories = [...new Set(availableFeatures.map(feature => feature.category))];
    const category = modal.featureCategory || "";
    const filtered = availableFeatures.filter(feature =>
      (!query || `${feature.name} ${feature.identifier} ${feature.category}`.toLowerCase().includes(query)) &&
      (!category || feature.category === category)
    );
    const requiredSources = requiredFeatureSourcesForProduct(identifier.product);
    const requiredIds = new Set(requiredSources.map(feature => feature.id));
    const optionalSources = optionalFeatureSourcesForProduct(identifier.product);
    const selectedIds = [...new Set([...requiredIds, ...(modal.selectedIds || [])])];
    const currentSnapshots = state.drawer?.associatedFeatures || [];
    const selected = selectedIds.map(id => availableFeatures.find(feature => feature.id === id) || sourceFeatureBySnapshot(currentSnapshots.find(feature => feature.id === id)) || currentSnapshots.find(feature => feature.id === id)).filter(Boolean);
    const selectableFiltered = filtered.filter(feature => !requiredIds.has(feature.id) && (defaultFeatureVersion(feature) || selectedIds.includes(feature.id)));
    const allSelected = selectableFiltered.length && selectableFiltered.every(feature => selectedIds.includes(feature.id));
    const optionList = filtered.map(feature => {
      const eligible = eligibleFeatureVersions(feature);
      const checked = selectedIds.includes(feature.id);
      const unavailable = !eligible.length;
      const required = requiredIds.has(feature.id);
      const control = required ? `<span class="required-feature-lock" title="固件必配功能由系统自动配置">✓</span>` : `<input type="checkbox" data-feature-choice="${esc(feature.id)}" ${checked ? "checked" : ""} ${unavailable && !checked ? "disabled" : ""}>`;
      const status = required ? "已自动配置" : feature.firmwarePolicy;
      const tagClass = required ? "required-policy" : "";
      const content = `${control}<span class="feature-image-placeholder">${esc(feature.imageLabel)}</span><span class="feature-source-copy"><strong>${esc(feature.name)}</strong><small>${esc(feature.identifier)} · ${esc(feature.category)}</small><em class="${tagClass}">${esc(status)}</em></span><span class="feature-source-version"><strong>${eligible.length ? `${eligible.length} 个可用版本` : "暂无可关联版本"}</strong><small>${esc(defaultFeatureVersion(feature)?.code || featureVersionStatusLabel(feature.versions[0]))}</small></span>`;
      return required ? `<div class="feature-source-option selected required-feature">${content}</div>` : `<label class="feature-source-option ${checked ? "selected" : ""} ${unavailable ? "unavailable" : ""}">${content}</label>`;
    }).join("");
    const selectedList = selected.map(feature => {
      const source = associatedFeatureCatalog.find(item => item.id === feature.id);
      const previous = currentSnapshots.find(item => item.id === feature.id);
      const required = isRequiredFeature(source || feature);
      if (!source) return `<article class="selected-feature-version invalid"><div class="selected-feature-head"><div><strong>${esc(feature.name || "未知功能点")}</strong><small>${esc(feature.identifier || "来源已失效")}</small></div>${required ? `<span class="required-config-badge">固件必配</span>` : `<button class="link-btn danger-link" data-action="unselect-feature" data-feature-id="${esc(feature.id)}">移除</button>`}</div><div class="feature-version-error">该功能点已不在机型平台功能目录中${required ? "，请联系机型平台管理员恢复功能源" : "，请移除后再发布"}</div></article>`;
      const selectedVersionId = modal.versionSelections?.[source.id] || previous?.featureVersionId || defaultFeatureVersion(source)?.id || "";
      const selectedVersion = source.versions.find(version => version.id === selectedVersionId) || null;
      const draftSnapshot = selectedVersion ? associatedFeatureSnapshot(source, selectedVersion.id, previous) : { id: source.id, name: source.name };
      const issue = featureAssociationIssue(draftSnapshot, identifier.product);
      const versionOptions = source.versions.map(version => {
        const selectable = version.status === "published";
        const date = version.releasedAt || version.createdAt || "-";
        return `<option value="${esc(version.id)}" ${version.id === selectedVersionId ? "selected" : ""} ${selectable ? "" : "disabled"}>${esc(version.code)} · ${esc(featureVersionStatusLabel(version))} · ${esc(date)}</option>`;
      }).join("");
      return `<article class="selected-feature-version ${required ? "required" : ""} ${issue ? "invalid" : ""}"><div class="selected-feature-head"><div><strong>${esc(source.name)}</strong><small>${esc(source.identifier)} · ${esc(source.category)}</small></div>${required ? `<span class="required-config-badge">固件必配</span>` : `<button class="link-btn danger-link" data-action="unselect-feature" data-feature-id="${esc(source.id)}">移除</button>`}</div><div class="feature-version-control"><div><label>配置版本 ${ruleAnnotations([["version", "VER-R09"], ["version", "VER-R10"]])}</label><select class="select" data-feature-version data-feature-id="${esc(source.id)}" aria-label="${esc(source.name)}配置版本">${versionOptions}</select></div><span class="tag ${issue ? "danger" : "success"}">${esc(featureVersionStatusLabel(selectedVersion))}</span></div><p>${esc(selectedVersion?.description || "请选择可用于固件关联的功能版本")}</p>${issue ? `<div class="feature-version-error">${esc(issue)}，请切换其他可用版本</div>` : `<small class="feature-version-source">来源更新时间 ${esc(selectedVersion?.releasedAt || selectedVersion?.createdAt || "-")}</small>`}</article>`;
    }).join("");
    const selectedOptionalCount = selectedIds.filter(id => !requiredIds.has(id)).length;
    const body = `${ruleContextBar(["version"])}<div class="feature-source-context"><div><span>功能来源</span><strong>机型平台 · 功能管理</strong></div><div><span>当前产品线</span><strong>${esc(identifier.product)}</strong></div><div><span>功能范围</span><strong>必配 ${requiredSources.length} 项 · 可选 ${optionalSources.length} 项</strong></div>${ruleAnnotation("version", "VER-R03")}</div><div class="feature-picker"><section class="feature-picker-main"><div class="picker-toolbar"><label class="check"><input type="checkbox" data-action="toggle-all-features" ${allSelected ? "checked" : ""} ${selectableFiltered.length ? "" : "disabled"}>可选 ${selectedOptionalCount} / ${optionalSources.length}</label><input class="field" data-feature-search value="${esc(modal.query || "")}" placeholder="搜索功能名称或功能标识，按 Enter"><select class="select" data-modal-field="featureCategory" aria-label="功能分类"><option value="">全部分类</option>${categories.map(item => `<option value="${esc(item)}" ${category === item ? "selected" : ""}>${esc(item)}</option>`).join("")}</select></div><div class="feature-source-list">${optionList || `<div class="empty-state compact-empty"><div>当前产品线下暂无匹配功能点</div></div>`}</div></section><aside class="feature-selected"><div class="feature-selected-title"><div><h3>功能配置（${selected.length}）</h3><span>必配功能已自动加载；所有功能均可切换其他已发布版本</span></div>${ruleAnnotation("version", "VER-R11")}</div><div class="selected-feature-list">${selectedList || `<div class="empty-state compact-empty"><div>当前暂无可配置功能点</div></div>`}</div>${errorFor("featurePicker")}</aside></div>`;
    return modalFrame("选择并配置功能点", body, `<button class="btn" data-action="close-modal">取消</button><button class="btn primary" data-action="confirm-feature-picker">确认配置（必配 ${requiredSources.length} · 可选 ${selectedOptionalCount}）</button>`, true, true);
  }

  function availableAssociatedFeatures() {
    return featureSourcesForProduct(activeIdentifier().product);
  }

  function findVersion(version) {
    return activeIdentifier()?.versions.find(item => item.version === version);
  }

  function renderDrawer() {
    const drawer = state.drawer;
    if (drawer.type === "addVersion") return renderVersionFormDrawer("新增固件版本", null);
    if (drawer.type === "editVersion") return renderVersionFormDrawer("编辑固件版本", findVersion(drawer.version));
    if (drawer.type === "versionDetail") return renderVersionDetail(findVersion(drawer.version));
    if (drawer.type === "differentialTaskDetail") return renderDifferentialTaskDetail(drawer.taskId);
    if (drawer.type === "userDetail") return renderUserDetail(db.users[drawer.userIndex]);
    if (drawer.type === "userPermissions") return renderUserPermissions(db.users[drawer.userIndex]);
    return "";
  }

  function renderDifferentialTaskDetail(taskId) {
    const task = activeIdentifier().differentialTasks.find(item => item.id === taskId);
    if (!task) return "";
    return drawerFrame("差分任务详情", `${ruleContextBar(["differential"])}<div class="differential-task-summary"><div><strong>${esc(task.name)}</strong><span class="tag ${task.status === "已完成" ? "success" : task.status === "差分失败" ? "danger" : "warning"}">${esc(task.status)}</span></div><p><span>创建时间：</span>${esc(task.createdAt)}</p></div><div class="drawer-section differential-task-table-section"><div class="table-wrap"><table class="data-table differential-task-detail-table"><thead><tr><th>源版本</th><th>目标版本</th><th>模组型号</th><th>差分状态</th><th>失败原因</th><th>操作</th></tr></thead><tbody>${task.items.map(item => `<tr><td>${esc(item.sourceVersion)}</td><td>${esc(item.targetVersion)}</td><td>${esc(item.moduleModel)}</td><td><span class="tag ${item.status === "已完成" ? "success" : item.status === "差分失败" ? "danger" : "warning"}">${esc(item.status)}</span></td><td>${esc(item.failureReason || "-")}</td><td>${item.status === "已完成" ? `<button class="link-btn" data-action="download-differential-package" data-package-name="${esc(item.packageName)}">差分包下载</button>` : "-"}</td></tr>`).join("")}</tbody></table></div></div>`);
  }

  function renderAppNoteEditor(notes, activeLocale, mode = "version", suppliedMeta = null) {
    const selectedLocale = defaultLocaleIds.includes(activeLocale) ? activeLocale : "zh";
    const selectedContent = notes[selectedLocale] || "";
    const revision = mode === "revision";
    const host = activeAppNoteEditorHost();
    const meta = suppliedMeta || appNoteMetaForHost(host) || normalizeAppNoteMeta({}, notes);
    const enabledLocales = enabledAppNoteLocales(meta);
    const enabledCount = enabledLocales.length;
    const translating = Boolean(meta.translationJob);
    const hasAiDraft = enabledLocales.some(locale => meta.statuses[locale] === "ai_draft");
    const expanded = revision || Boolean(host?.container.appNotesExpanded) || hasAiDraft;
    const targetsOpen = Boolean(host?.container.translationTargetsOpen);
    const selectAction = revision ? "select-revision-locale" : "select-locale";
    const inputAttribute = revision ? "data-revision-locale" : "data-app-note";
    const errorPrefix = revision ? "revision" : "locale";
    const list = localeCatalog.map(item => {
      const status = meta.statuses[item.locale] || "unconfigured";
      const enabled = enabledLocales.includes(item.locale);
      return `<button type="button" class="locale-item ${item.locale === selectedLocale ? "active" : ""} ${enabled ? "enabled" : ""}" data-action="${selectAction}" data-locale="${esc(item.locale)}"><span>${esc(item.label)}</span><small>${esc(item.locale)}${item.locale === "en" ? " · 兜底" : ""}</small><em class="locale-status ${esc(status)}">${esc(appNoteStatusLabels[status] || status)}</em></button>`;
    }).join("");
    const targetOptions = localeCatalog.filter(item => item.locale !== "zh").map(item => {
      const checked = enabledLocales.includes(item.locale);
      return `<label class="translation-target-option ${item.locale === "en" ? "required-target" : ""}"><input type="checkbox" data-translation-target="${esc(item.locale)}" ${checked ? "checked" : ""} ${item.locale === "en" ? "disabled" : ""}><span><strong>${esc(item.label)}</strong><small>${esc(item.locale)}${item.locale === "en" ? " · 默认兜底" : ""}</small></span></label>`;
    }).join("");
    const targetPopover = targetsOpen ? `<div class="translation-target-popover"><div class="translation-target-head"><div><strong>选择适配语言</strong><span>英文始终启用</span></div><div><button class="link-btn" type="button" data-action="select-all-translation-targets">全选</button><button class="link-btn" type="button" data-action="clear-translation-targets">清除选填</button></div></div><div class="translation-target-list">${targetOptions}</div></div>` : "";
    const currentStatus = meta.statuses[selectedLocale] || "unconfigured";
    const currentActions = selectedLocale === "zh" ? "" : `<div class="locale-writing-actions"><button class="btn small" type="button" data-action="ai-retranslate-locale" data-locale="${esc(selectedLocale)}" ${!enabledLocales.includes(selectedLocale) || translating ? "disabled" : ""}>重新翻译</button>${currentStatus === "ai_draft" ? `<button class="btn small primary" type="button" data-action="confirm-locale-note" data-locale="${esc(selectedLocale)}">确认当前</button>` : ""}</div>`;
    const configuredCount = configuredDefaultLocaleCount(notes);
    const headerRules = revision ? ruleAnnotation("locale", "LOC-R11") : ruleAnnotations([["locale", "LOC-R11"], ["version", "VER-R16"]]);
    const header = `<div class="section-bar app-note-section-bar"><div><h3>${annotatedLabel("APP 固件版本更新说明", [["locale", "LOC-R09"]])}</h3><span class="subtle">已配置 ${configuredCount} / ${defaultLocaleIds.length} 种语言 · 英文兜底</span></div><div class="app-note-ai-actions"><div class="split-action"><button class="btn primary" type="button" data-action="ai-translate-notes" ${translating ? "disabled" : ""}>${translating ? "AI 翻译中..." : `AI 一键翻译（${Math.max(0, enabledCount - 1)}种）`}</button><button class="btn primary split-toggle" type="button" data-action="toggle-translation-targets" aria-label="选择适配语言" aria-expanded="${targetsOpen}" ${translating ? "disabled" : ""}>⌄</button>${targetPopover}</div>${hasAiDraft ? `<button class="btn" type="button" data-action="confirm-ai-notes">全部确认</button>` : ""}${revision ? "" : `<button class="link-btn app-note-expand" type="button" data-action="toggle-app-notes-expanded">${expanded ? "收起语言列表" : "查看全部语言"}</button>`}${headerRules}</div></div>${errorFor(revision ? "revisionRequired" : "appNotes")}`;
    if (!expanded) {
      const sourceContent = notes.zh || "";
      const sourceStatus = meta.statuses.zh || "pending";
      return `${header}<div class="app-note-compact"><div class="app-note-compact-head"><div><strong>简体中文</strong><span>AI 翻译源</span></div><em class="locale-status ${esc(sourceStatus)}">${esc(appNoteStatusLabels[sourceStatus] || sourceStatus)}</em></div><textarea class="textarea app-note-source-textarea" data-app-note="zh" maxlength="${appNoteLimit("zh")}" placeholder="请输入简体中文更新说明">${esc(sourceContent)}</textarea>${errorFor("locale-zh")}<div class="helper align-right">${sourceContent.length} / ${appNoteLimit("zh")}</div></div>`;
    }
    return `${header}<div class="locale-editor ${revision ? "revision-locale-editor" : ""}"><div class="locale-list-wrap"><div class="locale-list-rule">${ruleAnnotation("locale", "LOC-R01")}</div><aside class="locale-list" aria-label="APP 更新说明语言">${list}</aside></div><div class="locale-writing"><div class="locale-writing-head"><div><strong>${esc(localeName(selectedLocale))}</strong><span>${selectedLocale === "zh" ? "AI 翻译源" : selectedLocale === "en" ? "必填 · 默认兜底" : enabledLocales.includes(selectedLocale) ? "已启用" : "未启用"}</span></div><div class="locale-head-actions">${currentActions}${ruleAnnotation("locale", "LOC-R03")}</div></div><textarea class="textarea locale-textarea" ${inputAttribute}="${esc(selectedLocale)}" maxlength="${appNoteLimit(selectedLocale)}" placeholder="${selectedLocale === "zh" ? "请输入简体中文更新说明" : enabledLocales.includes(selectedLocale) ? "请输入或检查翻译内容" : "该语言尚未启用"}" ${translating || !enabledLocales.includes(selectedLocale) ? "disabled" : ""}>${esc(selectedContent)}</textarea>${errorFor(`${errorPrefix}-${selectedLocale}`)}<div class="locale-writing-foot"><div></div><div class="helper align-right">${selectedContent.length} / ${appNoteLimit(selectedLocale)}</div></div></div></div>`;
  }

  function renderVersionFormDrawer(title, version) {
    const editing = Boolean(version);
    const upload = state.upload;
    const formDraft = state.drawer.formDraft || { version: version?.version || upload?.version || "", models: version?.models || "", note: version?.note === "-" ? "" : version?.note || "" };
    const generatedVersion = formDraft.version;
    const identifier = activeIdentifier();
    const associatedFeatures = ensureRequiredFeatureSnapshots(state.drawer?.associatedFeatures || [], activeIdentifier().product);
    state.drawer.associatedFeatures = associatedFeatures;
    const appReleaseNotes = appNoteDraft(state.drawer.appReleaseNotes || version?.appReleaseNotes);
    const activeLocale = state.drawer.activeLocale || "zh";
    const configurable = editing || Boolean(upload);
    const uploadName = editing ? String(version.url || "").split("/").pop() : upload?.name;
    const uploadSize = editing ? version.size : upload?.size;
    const packageVersion = editing ? version.version : upload?.version;
    const packageMd5 = editing ? version.md5 : upload?.md5;
    const modelOptions = versionModelOptions(identifier, formDraft.models);
    const packagePanel = uploadName ? `<div class="package-summary"><div class="package-summary-file"><span class="upload-file-icon">▤</span><div><strong class="ellipsis">${esc(uploadName)}</strong><span>${editing ? "已保存固件包" : "固件包解析完成"}</span></div>${editing ? "" : `<label class="link-btn">重新上传<input id="firmware-file" class="hidden" type="file" accept=".bin,.binpkg"></label>`}</div><div class="package-meta-grid"><div><span>固件版本号</span><strong>${esc(packageVersion || "-")}</strong></div><div><span>MD5</span><strong title="${esc(packageMd5 || "-")}">${esc(packageMd5 || "-")}</strong></div><div><span>文件大小</span><strong>${esc(uploadSize || "-")} MB</strong></div></div></div>` : `<div class="package-upload-panel"><div><strong>上传固件包</strong><span>支持 .bin、.binpkg，上传后自动解析版本号与 MD5</span></div><label class="btn primary upload-trigger"><input id="firmware-file" class="hidden" type="file" accept=".bin,.binpkg">上传文件</label></div>`;
    const requiredCount = associatedFeatures.filter(isRequiredFeature).length;
    const optionalCount = Math.max(0, associatedFeatures.length - requiredCount);
    const featurePointRows = associatedFeatures.map(feature => {
      const issue = featureAssociationIssue(feature, activeIdentifier().product);
      const source = sourceFeatureBySnapshot(feature);
      const liveVersion = sourceFeatureVersion(source, feature);
      const required = isRequiredFeature(feature);
      return `<tr><td><div class="feature-point-name"><span class="feature-image-placeholder">${esc(feature.imageLabel || "功能")}</span><span><strong>${esc(feature.name)}</strong><small>${esc(feature.identifier || "-")} · ${esc(feature.category || "-")}</small></span></div></td><td><strong>${esc(feature.version || "-")}</strong><small class="table-subline">${esc(feature.versionDescription || "-")}</small></td><td><span class="tag ${required ? "blue" : ""}">${required ? "必配" : "可选"}</span></td><td><span class="tag ${issue ? "danger" : "success"}">${esc(issue ? featureVersionStatusLabel(liveVersion) : "可用")}</span>${issue ? `<small class="table-subline danger-text">${esc(issue)}</small>` : ""}</td></tr>`;
    }).join("");
    const formBody = `<form id="version-form" class="version-form">
      <input type="hidden" name="mode" value="${editing ? "edit" : "add"}">
      <input type="hidden" name="version" value="${esc(generatedVersion)}">
      <section class="version-form-section package-section">
        <div class="version-section-head"><div><h3>固件包与适用范围</h3><p>${esc(identifier.id)} · ${esc(identifier.product)}</p></div>${ruleAnnotations([["version", "VER-R01"], ["version", "VER-R06"], ["version", "VER-R13"]])}</div>
        <div class="package-scope-grid"><div>${packagePanel}${errorFor("file")}${errorFor("version")}</div><div class="form-field required version-model-field"><div class="field-rule-row"><label>适用机型</label>${ruleAnnotation("version", "VER-R14")}</div><select class="select" name="models" data-version-draft="models">${modelOptions.map(model => `<option value="${esc(model)}" ${model === formDraft.models ? "selected" : ""}>${esc(model)}</option>`).join("")}</select>${errorFor("models")}</div></div>
      </section>
      <section class="version-form-section feature-point-section">
        <div class="version-section-head"><div><h3>${annotatedLabel("功能配置", [["version", "VER-R03"]])}</h3><p>必配 ${requiredCount} 项 · 可选 ${optionalCount} 项</p></div><span class="action-with-rules"><button class="btn primary small" type="button" data-action="add-associated-feature">配置功能</button>${ruleAnnotation("version", "VER-R15")}</span></div>
        ${errorFor("associatedFeatures")}<div class="table-wrap"><table class="data-table associated-table compact-feature-table"><thead><tr><th>功能名称</th><th>配置版本</th><th>类型</th><th>状态</th></tr></thead><tbody>${featurePointRows}</tbody></table></div>${associatedFeatures.length ? "" : `<div class="empty-state compact-empty"><div>当前产品线暂无可配置功能</div></div>`}
      </section>
      <section class="version-form-section release-copy-section">
        <div class="version-section-head"><div><h3>发布说明</h3><p>维护平台记录与 APP 用户可见文案</p></div>${ruleAnnotation("version", "VER-R04")}</div>
        <div class="form-field required platform-note-field"><label>平台发布说明</label><textarea class="textarea release-note-textarea" name="platformNote" data-version-draft="note" maxlength="500" placeholder="填写主要变更、修复问题和影响范围">${esc(formDraft.note)}</textarea>${errorFor("platformNote")}<div class="helper align-right">${formDraft.note.length} / 500</div></div>
        <div class="app-note-block">${renderAppNoteEditor(appReleaseNotes, activeLocale)}</div>
      </section>
    </form>`;
    const saveLabel = editing ? `保存并生成 R${Number(version.recordVersion || 1) + 1}` : "创建版本";
    return drawerFrame(title, formBody, `<button class="btn" data-action="close-overlay">取消</button><span class="action-with-rules"><button class="btn primary" type="submit" form="version-form" ${configurable ? "" : "disabled"}>${saveLabel}</button>${ruleAnnotation("version", editing ? "VER-R07" : "VER-R04")}</span>`);
  }

  function renderVersionDetail(version) {
    const tab = state.drawer.tab || "related";
    const featureConfigs = version.featureConfigs || [];
    const associatedFeatures = version.associatedFeatures || [];
    let tabContent = "";
    if (tab === "features") tabContent = featureConfigs.length ? `<div class="table-wrap detail-table-wrap"><table class="data-table detail-content-table feature-config-table"><thead><tr><th>功能集名称</th><th>功能集类型</th><th>版本号</th><th>版本说明</th></tr></thead><tbody>${featureConfigs.map(config => `<tr><td>${esc(config.name)}</td><td>${esc(config.label)}</td><td>${esc(config.version)}</td><td>${esc(config.description)}</td></tr>`).join("")}</tbody></table></div>` : `<div class="empty-state compact-empty"><div><div class="empty-illustration">▤</div>暂无功能集配置</div></div>`;
    if (tab === "related") tabContent = associatedFeatures.length ? `<div class="table-wrap detail-table-wrap"><table class="data-table detail-content-table feature-point-detail-table"><thead><tr><th>功能名称</th><th>功能标识</th><th>功能分类</th><th>配置版本</th><th>版本说明</th><th>来源状态</th></tr></thead><tbody>${associatedFeatures.map(feature => { const source = sourceFeatureBySnapshot(feature); const liveVersion = sourceFeatureVersion(source, feature); const issue = featureAssociationIssue(feature, activeIdentifier().product); return `<tr><td><div class="feature-point-name"><span class="feature-image-placeholder">${esc(feature.imageLabel || "功能")}</span><strong>${esc(feature.name)}</strong></div></td><td>${esc(feature.identifier || "-")}</td><td>${esc(feature.category || "-")}</td><td><strong>${esc(feature.version || "-")}</strong><small class="table-subline">${esc(feature.sourceUpdatedAt || "-")}</small></td><td>${esc(feature.versionDescription || "-")}</td><td><span class="tag ${issue ? "danger" : "success"}">${esc(issue ? featureVersionStatusLabel(liveVersion) : "可用于关联")}</span>${issue ? `<small class="table-subline danger-text">${esc(issue)}</small>` : ""}</td></tr>`; }).join("")}</tbody></table></div>` : `<div class="empty-state compact-empty"><div><div class="empty-illustration">▤</div>暂无功能点配置</div></div>`;
    if (tab === "approvals") {
      const rows = db.approvals.filter(item => item.version === version.version);
      tabContent = rows.length ? `<div class="approval-timeline">${rows.map(row => `<article class="approval-card"><div class="approval-card-head"><div><strong>发布审批</strong><span>${esc(row.submitTime)}</span></div><span class="tag ${row.status === "审批通过" ? "success" : "warning"}">${esc(row.status === "审批通过" ? "已通过" : row.status === "审批过期" ? "已过期" : row.status)}</span></div><div class="approval-meta"><span>提交人<strong>${esc(row.submitter)}</strong></span><span>提交时间<strong>${esc(row.submitTime)}</strong></span><span>审批人<strong>${esc(row.approver)}</strong></span><span>审批时间<strong>${esc(row.approveTime)}</strong></span><span>说明<strong>${esc(row.note)}</strong></span></div></article>`).join("")}</div>` : `<div class="empty-state" style="min-height:180px"><div><div class="empty-illustration">▤</div>暂无审批记录</div></div>`;
    }
    if (tab === "appNotes") {
      const maintainable = !activeIdentifier().activeApproval && version.status === "current";
      const revisions = version.noteRevisions || [];
      const activeNotes = activeAppNotes(version.appReleaseNotes || {}, version.appNoteMeta || {});
      tabContent = `<div class="detail-section-toolbar"><div><strong>APP 固件版本更新说明</strong><span>已启用 ${Object.keys(activeNotes).length} 种语言，未匹配时使用英文说明</span></div>${maintainable ? `<button class="btn small primary" data-action="maintain-app-notes" data-version="${esc(version.version)}">维护文案</button>` : ""}</div><div class="table-wrap"><table class="data-table detail-content-table app-note-table"><thead><tr><th>语言</th><th>Locale</th><th>更新说明</th></tr></thead><tbody>${Object.entries(activeNotes).map(([locale, content]) => `<tr><td>${esc(localeName(locale))}</td><td>${esc(locale)}</td><td>${esc(content)}</td></tr>`).join("")}</tbody></table></div><div class="revision-list"><h4>文案修订记录</h4>${revisions.map(item => `<article><div><strong>${esc(item.operator)}</strong><span>${esc(item.time)}</span></div><p>${esc(item.reason)}</p><small>修订版本 R${item.recordVersion}</small></article>`).join("") || `<div class="empty-state compact-empty"><div>暂无修订记录</div></div>`}</div>`;
    }
    if (tab === "releases") {
      const records = releaseEventsForVersion(version);
      tabContent = records.length ? `<div class="release-event-list">${records.map(event => `<article><div class="release-event-mark ${event.action}">${event.action === "rollback" ? "回" : "发"}</div><div><strong>${event.action === "rollback" ? "回滚恢复" : "正常发布"} · ${esc(event.fromVersion || "-")} → ${esc(event.toVersion)}</strong><span>${esc(event.effectiveAt)} · ${esc(event.operator)} · ${esc(reminderLabel(event.reminderPolicy))}</span><small>发布标识 ${esc(event.id)} · ${event.status === "active" ? "当前生效" : event.status === "rolled_back" ? "已回滚" : "历史事件"}</small></div></article>`).join("")}</div>` : `<div class="empty-state"><div><div class="empty-illustration">▤</div>暂无发布记录</div></div>`;
    }
    const event = releaseEventsForVersion(version)[0];
    return drawerFrame("固件版本详情", `${ruleContextBar(["detail", tab === "appNotes" ? "locale" : "detail"])}<div class="detail-hero"><h3>${esc(version.version)} <span class="tag ${version.status === "current" ? "success" : version.status === "withdrawn" ? "danger" : ""}">${esc(versionStatusLabel(version.status))}</span></h3><div class="detail-note"><span>平台发布说明</span><strong>${esc(version.platformReleaseNotes)}</strong></div><div class="detail-stats four"><div class="detail-stat"><span>适用机型</span><strong>${esc(version.models)}</strong></div><div class="detail-stat"><span>APP 提醒方式</span><strong>${esc(reminderLabel(event?.reminderPolicy) || version.reminder || "不提醒")}</strong></div><div class="detail-stat"><span>功能点</span><strong>${associatedFeatures.length} 项配置</strong></div><div class="detail-stat"><span>生效时间</span><strong>${esc(event?.effectiveAt || version.published || "未发布")}</strong></div></div></div><div class="drawer-section detail-basic-section"><h3>基础信息</h3><table class="info-list detail-info-list"><tr><td>固件版本号</td><td>${esc(version.version)}</td></tr><tr><td>固件标识</td><td>${esc(activeIdentifier().id)}</td></tr><tr><td>文件大小</td><td>${esc(version.size)} M</td></tr><tr><td>固件包下载地址</td><td><div class="detail-url"><span>${esc(version.url)}</span><button class="link-btn" title="复制下载地址" data-action="copy" data-copy="${esc(version.url)}">▣</button></div></td></tr><tr><td>创建时间</td><td>${esc(version.created || version.updated)}</td></tr><tr><td>创建人</td><td>${esc(version.creator)}</td></tr></table></div><div class="tab-strip detail-tabs"><button class="tab ${tab === "related" ? "active" : ""}" data-action="detail-tab" data-tab="related">功能点配置</button><button class="tab ${tab === "appNotes" ? "active" : ""}" data-action="detail-tab" data-tab="appNotes">APP 更新说明</button>${featureConfigs.length ? `<button class="tab ${tab === "features" ? "active" : ""}" data-action="detail-tab" data-tab="features">历史功能集快照</button>` : ""}<button class="tab ${tab === "releases" ? "active" : ""}" data-action="detail-tab" data-tab="releases">发布记录</button><button class="tab ${tab === "approvals" ? "active" : ""}" data-action="detail-tab" data-tab="approvals">审批日志</button></div><div class="detail-tab-content">${tabContent}</div>`);
  }

  function renderUserDetail(user) {
    const changeLogs = user.changeLogs || [];
    return drawerFrame("用户详情", `${ruleContextBar(["audit"])}<div class="detail-hero"><h3>${esc(user.name)}　<span class="tag blue">${esc(user.role)}</span></h3></div><div class="drawer-section"><h3>所属产线</h3><div class="table-wrap"><table class="data-table detail-content-table"><thead><tr><th>产线</th><th>是否审批人</th></tr></thead><tbody>${user.lines.map(line => `<tr><td>${esc(line)}</td><td><label class="toggle"><input type="checkbox" ${user.approverLines.includes(line) ? "checked" : ""} disabled><span></span></label></td></tr>`).join("")}</tbody></table></div></div><div class="form-grid" style="margin-top:20px"><div class="form-field"><label>创建时间</label><strong>${esc(user.created)}</strong></div><div class="form-field"><label>备注</label><strong>${esc(user.note || "-")}</strong></div></div><div class="drawer-section"><h3>权限范围</h3>${renderPermissionTable(db.roles.find(role => role.name === user.role) || db.roles[0], false, "detail")}</div><div class="drawer-section"><h3>变更日志</h3><div class="table-wrap"><table class="data-table detail-content-table"><thead><tr><th>变更时间</th><th>变更人</th><th>变更动作</th><th>变更内容</th></tr></thead><tbody>${changeLogs.map(log => `<tr><td>${esc(log.time)}</td><td>${esc(log.operator)}</td><td>${esc(log.action)}</td><td>${esc(log.content)}</td></tr>`).join("")}</tbody></table></div>${changeLogs.length ? "" : `<div class="empty-state compact-empty"><div><div class="empty-illustration">▤</div>暂无数据</div></div>`}</div>`);
  }

  function renderUserPermissions(user) {
    const draft = state.drawer.userDraft || { lines: [...user.lines], approverLines: [...user.approverLines], note: user.note, role: user.role };
    const selectedRole = db.roles.find(role => role.name === draft.role) || db.roles[0];
    return drawerFrame("权限配置", `${ruleContextBar(["audit"])}<form id="user-permissions-form"><div class="drawer-section" style="margin-top:0"><h3>基本信息</h3><div class="form-grid single"><div class="form-field required"><label>账号名称</label><input class="field" value="${esc(user.name)}" disabled placeholder="请输入账号名称"></div><div class="form-field required"><label>所属产线</label><div class="check-grid line-tags">${productLines.map(line => `<label class="check"><input type="checkbox" data-user-line="${esc(line)}" ${draft.lines.includes(line) ? "checked" : ""}>${esc(line)}</label>`).join("")}</div><div class="table-wrap"><table class="data-table detail-content-table"><thead><tr><th>产线</th><th>是否审批人</th></tr></thead><tbody>${draft.lines.map(line => `<tr><td>${esc(line)}</td><td><label class="toggle"><input type="checkbox" data-approver-line="${esc(line)}" ${draft.approverLines.includes(line) ? "checked" : ""}><span></span></label></td></tr>`).join("")}</tbody></table></div></div><div class="form-field"><label>备注</label><textarea class="textarea" data-user-note maxlength="200" placeholder="请输入备注说明信息，例如成员职责">${esc(draft.note)}</textarea><div class="helper align-right">${draft.note.length} / 200</div></div><div class="form-field required"><label>关联角色</label><select class="select" name="role" data-change="permission-role">${db.roles.map(role => `<option ${role.name === selectedRole.name ? "selected" : ""}>${esc(role.name)}</option>`).join("")}</select></div></div></div><div class="drawer-section"><h3>角色权限预览</h3>${renderPermissionTable(selectedRole, false, "user")}</div></form>`, `<button class="btn" data-action="close-overlay">取 消</button><button class="btn primary" type="submit" form="user-permissions-form">完 成</button>`);
  }

  function closeOverlay() {
    state.modal = null;
    state.drawer = null;
    state.popover = null;
    state.errors = {};
    state.upload = null;
    renderShell();
  }

  function requestCloseOverlay() {
    if (["addVersion", "editVersion"].includes(state.drawer?.type) && state.drawer.dirty && !state.modal) {
      state.modal = { type: "discardVersionChanges" };
      renderShell();
      return;
    }
    closeOverlay();
  }

  function navigate(route) {
    if (!routes[route]) return;
    state.profileOpen = false;
    state.popover = null;
    state.rulePanel = null;
    state.ruleId = null;
    state.ruleAnchor = null;
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
    const isDelist = type === "delist";
    const current = currentVersion(identifier);
    const target = isDelist ? current : isRollback ? rollbackTarget(identifier) : findVersion(config.version);
    const sourceEvent = isRollback || isDelist ? activeRelease(identifier) : null;
    if (!target || (isDelist && (!current || !sourceEvent))) {
      toast(isDelist ? "当前没有可下架的正式发布版本" : "审批目标版本不存在", "warning");
      return null;
    }
    if (!isDelist) {
      const noteError = appNoteConfigurationError(target.appReleaseNotes, normalizeAppNoteMeta(target.appNoteMeta, target.appReleaseNotes));
      if (noteError) {
        toast(`${noteError.message}，无法提交审批`, "warning");
        return null;
      }
    }
    if (type === "publish") {
      const featureError = featureConfigurationError(target.associatedFeatures || [], identifier.product);
      if (featureError) {
        toast(`${featureError}，无法提交发布审批`, "warning");
        return null;
      }
    }
    const flowId = releaseId(isDelist ? "FLOW-DELIST" : isRollback ? "FLOW-ROLLBACK" : "FLOW-PUB");
    const approval = {
      id: releaseId("APR"),
      version: target.version,
      event: isDelist ? "下架当前发布版本" : isRollback ? "撤销并回滚固件版本" : "发布当前固件版本",
      submitter: "汤彦珊",
      submitTime: now(),
      approver: "-",
      status: "审批中",
      approveTime: "-",
      note: isDelist ? `${config.reasonType}：${config.reason}` : isRollback ? config.reason : target.platformReleaseNotes,
      type,
      firmwareId: identifier.id,
      fromVersion: current?.version || null,
      toVersion: isDelist ? null : target.version,
      reminderPolicy: isDelist ? null : config.reminderPolicy,
      platformReleaseNotes: target.platformReleaseNotes,
      appReleaseNotes: activeAppNotes(target.appReleaseNotes || {}, target.appNoteMeta || {}),
      appNoteMeta: clone(normalizeAppNoteMeta(target.appNoteMeta, target.appReleaseNotes)),
      featureConfigs: clone(target.featureConfigs || []),
      associatedFeatures: clone(target.associatedFeatures || []),
      reason: config.reason || "",
      reasonType: config.reasonType || "",
      models: target.models,
      associatedDeviceCount: target.associatedDeviceCount,
      snapshotRecordVersion: target.recordVersion,
      previousTargetStatus: isRollback || isDelist ? null : target.status,
      sourceReleaseId: sourceEvent?.id || null,
      flowId
    };
    db.approvals.unshift(approval);
    identifier.activeApproval = { approvalId: approval.id, type, version: target.version };
    if (!isRollback && !isDelist) target.status = "approval";
    addOperation(isDelist ? "固件下架" : isRollback ? "固件回滚" : "固件申请", "提交审批", target.version, "汤彦珊", "成功", isDelist ? `${config.reasonType}；当前版本在审批期间继续生效` : "");
    addLifecycleEvent(identifier, { flowId, flowType: isDelist ? "delist" : isRollback ? "rollback" : "publish", flowStatus: "pending", fromVersion: current?.version || null, toVersion: isDelist ? null : target.version, stage: "approval", title: isDelist ? "提交下架审批" : isRollback ? "提交回滚审批" : "提交发布审批", operator: approval.submitter, result: "success", summary: isDelist ? `已锁定 ${target.version} R${target.recordVersion} 及影响范围快照，审批期间当前版本继续生效` : `审批快照已锁定，目标版本 ${target.version}` });
    state.expandedLifecycleFlows = [flowId];
    persist();
    return approval;
  }

  function executeApprovedRelease(approval) {
    const identifier = db.identifiers.find(item => item.id === approval.firmwareId);
    if (!identifier || identifier.activeApproval?.approvalId !== approval.id) return { ok: false, message: "审批已失效，当前固件状态已发生变化" };
    const current = currentVersion(identifier);
    const stamp = now();
    if (approval.type === "delist") {
      const target = identifier.versions.find(version => version.version === approval.fromVersion);
      const sourceEvent = activeRelease(identifier);
      if (!target || current?.version !== approval.fromVersion || target.status !== "current") return { ok: false, message: "当前发布版本已变化，原下架审批失效" };
      if (Number(target.recordVersion) !== Number(approval.snapshotRecordVersion)) return { ok: false, message: "当前版本记录已发生变化，原下架审批快照失效" };
      if (!sourceEvent || sourceEvent.id !== approval.sourceReleaseId || sourceEvent.status !== "active") return { ok: false, message: "当前发布事件已变化，原下架审批失效" };
      addLifecycleEvent(identifier, { flowId: approval.flowId, flowType: "delist", flowStatus: "completed", fromVersion: target.version, toVersion: null, stage: "approval", title: "下架审批通过", time: stamp, operator: "IPC 产品线负责人", operatorType: "钉钉审批", result: "success", summary: "审批回调、当前版本及影响范围快照复检通过" });
      target.status = "delisted";
      target.latest = false;
      sourceEvent.status = "delisted";
      sourceEvent.rollbackAvailable = false;
      setLifecycleFlowStatus(identifier, sourceEvent.flowId, "delisted");
      const delistEvent = { id: releaseId("DELIST"), flowId: approval.flowId, action: "delist", fromVersion: target.version, toVersion: null, status: "delisted", effectiveAt: stamp, operator: approval.submitter, approvalId: approval.id, reasonType: approval.reasonType, reason: approval.reason, sourceReleaseId: sourceEvent.id };
      identifier.releaseEvents.unshift(delistEvent);
      identifier.currentVersion = null;
      identifier.rollbackTargetVersion = null;
      identifier.rollbackAvailable = false;
      identifier.activeApproval = null;
      identifier.lastDelisted = { version: target.version, time: stamp, reasonType: approval.reasonType, reason: approval.reason, sourceReleaseId: sourceEvent.id, approvalId: approval.id };
      approval.status = "审批通过";
      approval.approver = "IPC 产品线负责人";
      approval.approveTime = stamp;
      addOperation("固件下架", "下架生效", target.version, "发布服务", "成功", `${approval.reasonType}；当前发布版本已清空，固件包保留`);
      addLifecycleEvent(identifier, { flowId: approval.flowId, flowType: "delist", flowStatus: "completed", fromVersion: target.version, toVersion: null, stage: "delist", title: "停止提供当前发布版本", time: stamp, operator: "发布服务", operatorType: "系统", result: "success", summary: `${target.version} → 暂无当前发布版本；固件包与已升级设备不受影响` });
      addLifecycleEvent(identifier, { flowId: approval.flowId, flowType: "delist", flowStatus: "completed", fromVersion: target.version, toVersion: null, stage: "cache", title: "升级检查缓存失效", time: stamp, operator: "发布服务", operatorType: "系统", result: "success", summary: "新发起的升级检查不再返回该版本；OTA 已有任务不在本平台承诺停止" });
      persist();
      return { ok: true, version: target.version, type: "delist" };
    }
    const target = identifier.versions.find(version => version.version === approval.toVersion);
    if (!target || target.recordVersion !== approval.snapshotRecordVersion) return { ok: false, message: "目标版本已发生变化，原审批快照失效" };
    if (approval.type === "publish") {
      if (target.status !== "approval" || (current?.version || null) !== (approval.fromVersion || null)) return { ok: false, message: "当前发布版本已变化，原发布审批失效" };
      const featureError = featureConfigurationError(approval.associatedFeatures || [], identifier.product);
      if (featureError) return { ok: false, message: `${featureError}，原发布审批失效` };
      addLifecycleEvent(identifier, { flowId: approval.flowId || releaseId("FLOW"), flowType: "publish", flowStatus: "active", fromVersion: approval.fromVersion, toVersion: approval.toVersion, stage: "approval", title: "发布审批通过", time: stamp, operator: "IPC 产品线负责人", operatorType: "钉钉审批", result: "success", summary: "审批回调与版本快照校验通过" });
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
      addLifecycleEvent(identifier, { flowId: approval.flowId || releaseId("FLOW"), flowType: "rollback", flowStatus: "active", fromVersion: approval.fromVersion, toVersion: approval.toVersion, stage: "approval", title: "回滚审批通过", time: stamp, operator: "IPC 产品线负责人", operatorType: "钉钉审批", result: "success", summary: "审批回调与版本快照校验通过" });
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
    return { ok: true, version: target.version, type: approval.type };
  }

  function restorePublishApprovalTarget(approval) {
    if (approval?.type !== "publish") return;
    const identifier = db.identifiers.find(item => item.id === approval.firmwareId);
    const target = identifier?.versions.find(version => version.version === approval.toVersion);
    if (target?.status === "approval") target.status = approval.previousTargetStatus || "unpublished";
  }

  function rejectReleaseApproval(approval) {
    const identifier = db.identifiers.find(item => item.id === approval.firmwareId);
    restorePublishApprovalTarget(approval);
    if (identifier?.activeApproval?.approvalId === approval.id) identifier.activeApproval = null;
    approval.status = "审批驳回";
    approval.approver = "IPC 产品线负责人";
    approval.approveTime = now();
    approval.note = approval.type === "delist" ? `${approval.reasonType}：${approval.reason}` : approval.reason || "当前发布风险未确认，审批驳回";
    addOperation(approval.type === "delist" ? "固件下架" : approval.type === "rollback" ? "固件回滚" : "固件申请", "审批驳回", approval.version, "彭冬柏", "成功", approval.note);
    if (identifier) addLifecycleEvent(identifier, { flowId: approval.flowId || releaseId("FLOW"), flowType: approval.type === "delist" ? "delist" : approval.type === "rollback" ? "rollback" : "publish", flowStatus: "rejected", fromVersion: approval.fromVersion, toVersion: approval.toVersion, stage: "approval", title: approval.type === "delist" ? "下架审批驳回" : approval.type === "rollback" ? "回滚审批驳回" : "发布审批驳回", operator: "IPC 产品线负责人", operatorType: "钉钉审批", result: "rejected", summary: approval.note });
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
      const noteHost = activeAppNoteEditorHost();
      if (noteHost?.container.translationTargetsOpen && !event.target.closest(".translation-target-popover")) {
        noteHost.container.translationTargetsOpen = false;
        renderShell();
        return;
      }
      if (state.rulePanel && !event.target.closest(".rule-popover")) dismissRulePopover();
      if (state.popover && !event.target.closest(".action-popover")) {
        state.popover = null;
        renderShell();
      }
      return;
    }
    const action = target.dataset.action;
    if (state.rulePanel && action !== "open-rule-panel" && action !== "close-rule-panel") dismissRulePopover();
    const popoverToggles = ["identifier-actions", "density-menu", "column-settings", "role-more", "user-line-filter", "role-user-line-filter"];
    if (state.popover && !popoverToggles.includes(action) && !event.target.closest(".action-popover")) state.popover = null;

    if (action === "open-rule-panel") {
      const context = target.dataset.ruleContext;
      const ruleId = target.dataset.ruleId || prototypeRuleCatalog[context]?.rules[0]?.[0];
      if (!findPrototypeRule(context, ruleId)) return;
      const anchorRect = target.getBoundingClientRect();
      app.querySelectorAll(".rule-annotation.active").forEach(item => {
        item.classList.remove("active");
        item.setAttribute("aria-expanded", "false");
      });
      state.rulePanel = context;
      state.ruleId = ruleId;
      state.ruleAnchor = calculateRulePopoverPosition(anchorRect);
      target.classList.add("active");
      target.setAttribute("aria-expanded", "true");
      app.querySelector(".rule-popover")?.remove();
      app.querySelector(".app-shell")?.insertAdjacentHTML("beforeend", renderRulePanel());
      positionRulePopover(anchorRect);
      return;
    }
    if (action === "close-rule-panel") {
      dismissRulePopover();
      return;
    }

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
      requestCloseOverlay();
      return;
    }
    if (action === "confirm-discard-version") {
      if (state.drawer) state.drawer.dirty = false;
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
    if (action === "focus-publishable-versions") {
      const identifier = activeIdentifier();
      const versions = publishableVersions(identifier);
      if (!versions.length) {
        toast("当前没有可发布的固件版本", "warning");
        return;
      }
      const approvalTarget = identifier.activeApproval?.type === "publish"
        ? versions.find(version => version.version === identifier.activeApproval.version)
        : null;
      const preferred = approvalTarget || versions.find(version => version.version === identifier.lastDelisted?.version) || versions[0];
      state.errors = {};
      state.modal = { type: "selectPublishVersion", selectedVersion: preferred?.version || "" };
      renderShell();
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
      const defaultTargets = activeIdentifier().aiTranslationLocales || ["en"];
      state.drawer = { type: "addVersion", formDraft: { version: "", models: activeIdentifier().models || "", note: "" }, associatedFeatures: ensureRequiredFeatureSnapshots([], activeIdentifier().product), appReleaseNotes: appNoteDraft(), appNoteMeta: normalizeAppNoteMeta({}, {}, defaultTargets), activeLocale: "zh", appNotesExpanded: false, translationTargetsOpen: false, dirty: false };
      renderShell();
      return;
    }
    if (action === "edit-version") {
      const identifier = activeIdentifier();
      const version = findVersion(target.dataset.version);
      const eligibility = versionEditEligibility(identifier, version);
      if (!eligibility.allowed) {
        if (version) addOperation("固件版本", "编辑", version.version, "汤彦珊", "阻止", eligibility.reason);
        if (version) persist();
        toast(eligibility.reason, "warning");
        return;
      }
      state.errors = {};
      state.drawer = {
        type: "editVersion",
        version: target.dataset.version,
        formDraft: { version: version.version, models: version.models, note: version.platformReleaseNotes || (version.note === "-" ? "" : version.note) },
        associatedFeatures: ensureRequiredFeatureSnapshots(clone(version.associatedFeatures || []), identifier.product),
        appReleaseNotes: appNoteDraft(version.appReleaseNotes),
        appNoteMeta: normalizeAppNoteMeta(version.appNoteMeta, version.appReleaseNotes),
        appNotesExpanded: false,
        translationTargetsOpen: false,
        activeLocale: "zh",
        dirty: false
      };
      renderShell();
      return;
    }
    if (action === "version-detail") {
      state.drawer = { type: "versionDetail", version: target.dataset.version, tab: "related" };
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
      state.modal = { type: "editAppNotes", version: version.version, notesDraft: appNoteDraft(version.appReleaseNotes), appNoteMeta: normalizeAppNoteMeta(version.appNoteMeta, version.appReleaseNotes), activeLocale: "zh", reason: "", translationTargetsOpen: false };
      renderShell();
      return;
    }
    if (action === "save-app-notes") {
      const version = findVersion(state.modal.version);
      const draftNotes = appNoteDraft(state.modal.notesDraft);
      const meta = normalizeAppNoteMeta(state.modal.appNoteMeta, draftNotes);
      const notes = configuredAppNotes(draftNotes);
      state.errors = {};
      const noteError = appNoteConfigurationError(draftNotes, meta);
      if (noteError) {
        state.errors[`revision-${noteError.locale}`] = noteError.message;
        state.errors.revisionRequired = "请完成全部启用语言并确认 AI 草稿";
      }
      if (!String(state.modal.reason || "").trim()) state.errors.revisionReason = "请填写修改原因";
      if (Object.keys(state.errors).length) {
        const firstLocaleError = Object.keys(state.errors).find(key => key.startsWith("revision-") && key !== "revisionRequired" && key !== "revisionReason");
        if (firstLocaleError) state.modal.activeLocale = firstLocaleError.slice("revision-".length);
        renderShell();
        return;
      }
      const before = { appReleaseNotes: clone(version.appReleaseNotes), appNoteMeta: clone(version.appNoteMeta || {}) };
      version.appReleaseNotes = clone(notes);
      version.appNoteMeta = clone(meta);
      version.appNoteMeta.sourceText = notes.zh;
      activeIdentifier().aiTranslationLocales = enabledAppNoteLocales(meta).filter(locale => locale !== "zh");
      version.recordVersion += 1;
      version.noteRevisions.unshift({ time: now(), operator: "汤彦珊", reason: state.modal.reason.trim(), before, after: { appReleaseNotes: clone(notes), appNoteMeta: clone(meta) }, recordVersion: version.recordVersion });
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
      if (beginPublishVersion(identifier, version)) renderShell();
      return;
    }
    if (action === "continue-publish-selection") {
      const identifier = activeIdentifier();
      const version = findVersion(state.modal?.selectedVersion);
      if (!version) {
        toast("请选择需要发布的固件版本", "warning");
        return;
      }
      if (beginPublishVersion(identifier, version)) renderShell();
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
    if (action === "start-delist") {
      const identifier = activeIdentifier();
      const current = currentVersion(identifier);
      const event = activeRelease(identifier);
      if (!current || !event || current.status !== "current") { toast("当前没有可下架的正式发布版本", "warning"); return; }
      if (identifier.activeApproval) { toast("当前固件标识已有发布、回滚或下架审批", "warning"); return; }
      state.errors = {};
      state.modal = { type: "delist", version: current.version, reasonType: "", reason: "", sourceReleaseId: event.id };
      renderShell();
      return;
    }
    if (action === "confirm-delist") {
      state.errors = {};
      const reason = String(state.modal.reason || "").trim();
      if (!state.modal.reasonType) state.errors.delistReasonType = "请选择下架原因类型";
      if (reason.length < 10) state.errors.delistReason = "具体说明至少填写 10 个字符";
      if (reason.length > 500) state.errors.delistReason = "具体说明不能超过 500 个字符";
      if (Object.keys(state.errors).length) { renderShell(); return; }
      state.modal.reason = reason;
      const approval = submitReleaseApproval("delist", state.modal);
      if (!approval) return;
      state.modal = { type: "approvalSimulation", approvalId: approval.id };
      renderShell();
      return;
    }
    if (action === "start-rollback") {
      const identifier = activeIdentifier();
      const targetVersion = rollbackTarget(identifier);
      if (identifier.activeApproval) { toast("当前固件标识已有发布、回滚或下架审批", "warning"); return; }
      if (!identifier.rollbackAvailable || !targetVersion) { toast("当前发布事件没有可用的一次性回滚目标", "warning"); return; }
      if (!targetVersion.appReleaseNotes?.zh || !targetVersion.appReleaseNotes?.en) { toast("回滚目标缺少有效的中英文 APP 更新说明", "warning"); return; }
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
        restorePublishApprovalTarget(approval);
        approval.status = "已失效";
        approval.approveTime = now();
        approval.note = result.message;
        const invalidIdentifier = db.identifiers.find(item => item.id === approval.firmwareId);
        addOperation(approval.type === "delist" ? "固件下架" : approval.type === "rollback" ? "固件回滚" : "固件申请", "审批执行失效", approval.version, "发布服务", "阻止", result.message);
        if (invalidIdentifier) addLifecycleEvent(invalidIdentifier, { flowId: approval.flowId, flowType: approval.type === "delist" ? "delist" : approval.type === "rollback" ? "rollback" : "publish", flowStatus: "failed", fromVersion: approval.fromVersion, toVersion: approval.toVersion, stage: "approval", title: "审批执行失效", operator: "发布服务", operatorType: "系统", result: "failed", summary: result.message });
        activeIdentifier().activeApproval = null;
        persist();
        closeOverlay();
        toast(result.message, "error");
        return;
      }
      if (result.type === "delist") {
        state.modal = { type: "delistResult", version: result.version };
        state.drawer = null;
        state.errors = {};
        renderShell();
      } else if (result.type === "rollback") {
        state.modal = { type: "rollbackResult", version: result.version };
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
      toast(approval?.type === "delist" ? "下架审批已驳回，当前发布版本继续生效" : "审批已驳回，当前发布版本保持不变", "warning");
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
    if (action === "select-locale") {
      state.drawer.activeLocale = target.dataset.locale;
      renderShell();
      return;
    }
    if (action === "select-revision-locale") {
      state.modal.activeLocale = target.dataset.locale;
      renderShell();
      return;
    }
    if (action === "toggle-translation-targets") {
      const host = activeAppNoteEditorHost();
      if (!host) return;
      host.container.translationTargetsOpen = !host.container.translationTargetsOpen;
      renderShell();
      return;
    }
    if (action === "toggle-app-notes-expanded") {
      if (!["addVersion", "editVersion"].includes(state.drawer?.type)) return;
      state.drawer.appNotesExpanded = !state.drawer.appNotesExpanded;
      renderShell();
      return;
    }
    if (action === "select-all-translation-targets" || action === "clear-translation-targets") {
      const host = activeAppNoteEditorHost();
      const meta = appNoteMetaForHost(host);
      if (!host || !meta) return;
      const next = action === "select-all-translation-targets" ? defaultLocaleIds : ["zh", "en"];
      meta.enabledLocales = [...next];
      defaultLocaleIds.forEach(locale => {
        if (next.includes(locale)) {
          const content = String(host.container[host.notesKey][locale] || "").trim();
          if (!content) meta.statuses[locale] = "pending";
          else if (locale === "zh" || Number(meta.sourceRevisions[locale]) === Number(meta.sourceRevision)) meta.statuses[locale] = "confirmed";
          else meta.statuses[locale] = "stale";
        } else if (locale !== "zh" && locale !== "en") meta.statuses[locale] = "unconfigured";
      });
      markVersionDrawerDirty();
      renderShell();
      return;
    }
    if (action === "ai-translate-notes") {
      const host = activeAppNoteEditorHost();
      const meta = appNoteMetaForHost(host);
      if (!host || !meta) return;
      await runMockAiTranslation(enabledAppNoteLocales(meta).filter(locale => locale !== "zh"));
      return;
    }
    if (action === "ai-retranslate-locale") {
      await runMockAiTranslation([target.dataset.locale], target.dataset.locale);
      return;
    }
    if (action === "confirm-ai-notes" || action === "confirm-locale-note") {
      const host = activeAppNoteEditorHost();
      const meta = appNoteMetaForHost(host);
      if (!host || !meta) return;
      const locales = action === "confirm-ai-notes" ? enabledAppNoteLocales(meta) : [target.dataset.locale];
      const drafts = locales.filter(locale => meta.statuses[locale] === "ai_draft");
      drafts.forEach(locale => {
        meta.statuses[locale] = "confirmed";
        meta.sourceRevisions[locale] = meta.sourceRevision;
      });
      clearAppNoteErrors(drafts);
      markVersionDrawerDirty();
      renderShell();
      toast(drafts.length ? `已确认 ${drafts.length} 种语言` : "没有待确认的 AI 草稿", drafts.length ? "success" : "warning");
      return;
    }
    if (action === "add-associated-feature") {
      state.drawer.associatedFeatures = ensureRequiredFeatureSnapshots(state.drawer.associatedFeatures || [], activeIdentifier().product);
      state.modal = {
        type: "featurePicker",
        query: "",
        featureCategory: "",
        selectedIds: state.drawer.associatedFeatures.map(feature => feature.id),
        versionSelections: Object.fromEntries(state.drawer.associatedFeatures.map(feature => [feature.id, feature.featureVersionId || defaultFeatureVersion(sourceFeatureBySnapshot(feature))?.id || ""]))
      };
      renderShell();
      return;
    }
    if (action === "toggle-all-features") {
      const query = String(state.modal.query || "").trim().toLowerCase();
      const category = state.modal.featureCategory || "";
      const matches = availableAssociatedFeatures().filter(feature =>
        (!query || `${feature.name} ${feature.identifier} ${feature.category}`.toLowerCase().includes(query)) &&
        (!category || feature.category === category) &&
        defaultFeatureVersion(feature) && !isRequiredFeature(feature)
      );
      const ids = matches.map(feature => feature.id);
      const allSelected = ids.every(id => state.modal.selectedIds.includes(id));
      state.modal.selectedIds = allSelected ? state.modal.selectedIds.filter(id => !ids.includes(id)) : [...new Set([...state.modal.selectedIds, ...ids])];
      if (!allSelected) matches.forEach(feature => {
        if (!state.modal.versionSelections[feature.id]) state.modal.versionSelections[feature.id] = defaultFeatureVersion(feature)?.id || "";
      });
      delete state.errors.featurePicker;
      renderShell();
      return;
    }
    if (action === "unselect-feature") {
      const feature = associatedFeatureCatalog.find(item => item.id === target.dataset.featureId);
      if (isRequiredFeature(feature)) {
        toast("固件必配功能由系统自动配置，不支持移除", "warning");
        return;
      }
      state.modal.selectedIds = state.modal.selectedIds.filter(id => id !== target.dataset.featureId);
      delete state.errors.featurePicker;
      renderShell();
      return;
    }
    if (action === "confirm-feature-picker") {
      const current = state.drawer.associatedFeatures || [];
      const requiredIds = requiredFeatureSourcesForProduct(activeIdentifier().product).map(feature => feature.id);
      const selectedIds = [...new Set([...requiredIds, ...state.modal.selectedIds])];
      const snapshots = selectedIds.map(id => {
        const source = associatedFeatureCatalog.find(feature => feature.id === id);
        const previous = current.find(feature => feature.id === id);
        return source ? associatedFeatureSnapshot(source, state.modal.versionSelections[id], previous) : previous || null;
      }).filter(Boolean);
      const completedSnapshots = ensureRequiredFeatureSnapshots(snapshots, activeIdentifier().product);
      const featureError = featureConfigurationError(completedSnapshots, activeIdentifier().product);
      if (featureError) {
        state.errors.featurePicker = featureError;
        renderShell();
        return;
      }
      state.drawer.associatedFeatures = completedSnapshots;
      markVersionDrawerDirty();
      state.modal = null;
      delete state.errors.featurePicker;
      renderShell();
      return;
    }
    if (action === "remove-associated-feature") {
      const index = Number(target.dataset.featureIndex);
      const feature = state.drawer.associatedFeatures[index];
      if (isRequiredFeature(feature)) {
        toast("固件必配功能不支持删除，可更换关联版本", "warning");
        return;
      }
      state.drawer.associatedFeatures.splice(index, 1);
      markVersionDrawerDirty();
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
      const range = recentDateRange();
      state.filters.operation = "";
      state.filters.operationStart = range.start;
      state.filters.operationEnd = range.end;
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
      const range = recentDateRange();
      state.filters.approval = "";
      state.filters.approvalStart = range.start;
      state.filters.approvalEnd = range.end;
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
      const changedRole = activeRole();
      activeRole().permissions = clone(state.tempPermissions || {});
      state.roleEditing = false;
      state.tempPermissions = null;
      const grantedCount = Object.entries(changedRole.permissions).filter(([key, enabled]) => key.startsWith("action-") && enabled).length;
      addOperation("角色权限", "更新", changedRole.name, "汤彦珊", "成功", `角色权限已更新，当前授权 ${grantedCount} 项操作`);
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
    if (filter) {
      state.filters[filter] = event.target.value;
      if (filter === "differentialTask") state.differentialTaskPage = 1;
      if (filter === "differentialPackage") state.differentialPackagePage = 1;
    }
    if (draft) state.draftFilters[draft] = event.target.value;
    if (versionDraft && state.drawer?.formDraft) {
      state.drawer.formDraft[versionDraft] = event.target.value;
      markVersionDrawerDirty();
    }
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
      const meta = appNoteMetaForHost();
      if (locale === "zh") updateSourceNoteMeta(meta, state.modal.notesDraft, event.target.value);
      else updateManualLocaleMeta(meta, state.modal.notesDraft, locale);
      clearAppNoteErrors([locale]);
      event.target.closest(".locale-writing")?.querySelector(".error-text")?.remove();
      const counter = event.target.closest(".locale-writing")?.querySelector(".helper.align-right");
      if (counter) counter.textContent = `${event.target.value.length} / ${appNoteLimit(locale)}`;
      syncAppNoteDraftFeedback(state.modal.notesDraft, locale, meta);
    }
    if (event.target.matches("[data-revision-reason]") && state.modal) state.modal.reason = event.target.value;
    if (event.target.matches("[data-feature-search]") && state.modal?.type === "featurePicker") state.modal.query = event.target.value;
    if (event.target.matches("[data-user-note]") && state.drawer?.userDraft) state.drawer.userDraft.note = event.target.value;
    if (event.target.dataset.appNote && state.drawer?.appReleaseNotes) {
      const locale = event.target.dataset.appNote;
      state.drawer.appReleaseNotes[locale] = event.target.value;
      const meta = appNoteMetaForHost();
      if (locale === "zh") updateSourceNoteMeta(meta, state.drawer.appReleaseNotes, event.target.value);
      else updateManualLocaleMeta(meta, state.drawer.appReleaseNotes, locale);
      clearAppNoteErrors([locale]);
      event.target.closest(".locale-writing")?.querySelector(".error-text")?.remove();
      const counter = event.target.closest(".locale-writing")?.querySelector(".helper.align-right");
      if (counter) counter.textContent = `${event.target.value.length} / ${appNoteLimit(locale)}`;
      syncAppNoteDraftFeedback(state.drawer.appReleaseNotes, locale, meta);
      markVersionDrawerDirty();
    }
  });

  app.addEventListener("change", event => {
    const target = event.target;
    if (target.dataset.featureVersion !== undefined && state.modal?.type === "featurePicker") {
      state.modal.versionSelections[target.dataset.featureId] = target.value;
      delete state.errors.featurePicker;
      renderShell();
      return;
    }
    if (target.dataset.translationTarget) {
      const host = activeAppNoteEditorHost();
      const meta = appNoteMetaForHost(host);
      if (!host || !meta) return;
      const locale = target.dataset.translationTarget;
      const selected = new Set(meta.enabledLocales || []);
      if (target.checked) selected.add(locale);
      else if (locale !== "en") selected.delete(locale);
      selected.add("zh");
      selected.add("en");
      meta.enabledLocales = defaultLocaleIds.filter(item => selected.has(item));
      markVersionDrawerDirty();
      const content = String(host.container[host.notesKey][locale] || "").trim();
      if (!target.checked) meta.statuses[locale] = "unconfigured";
      else if (!content) meta.statuses[locale] = "pending";
      else if (Number(meta.sourceRevisions[locale]) === Number(meta.sourceRevision)) meta.statuses[locale] = "confirmed";
      else meta.statuses[locale] = "stale";
      clearAppNoteErrors([locale]);
      renderShell();
      return;
    }
    if (target.dataset.versionDraft && state.drawer?.formDraft) {
      state.drawer.formDraft[target.dataset.versionDraft] = target.value;
      markVersionDrawerDirty();
      return;
    }
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
    if (target.dataset.featureChoice && state.modal?.type === "featurePicker") {
      const id = target.dataset.featureChoice;
      const source = associatedFeatureCatalog.find(feature => feature.id === id);
      if (isRequiredFeature(source)) {
        target.checked = true;
        toast("固件必配功能已自动配置，无须勾选", "warning");
        return;
      }
      state.modal.selectedIds = target.checked ? [...new Set([...state.modal.selectedIds, id])] : state.modal.selectedIds.filter(item => item !== id);
      if (target.checked && !state.modal.versionSelections[id]) {
        state.modal.versionSelections[id] = defaultFeatureVersion(source)?.id || "";
      }
      delete state.errors.featurePicker;
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
      markVersionDrawerDirty();
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
      db.identifiers.unshift({ id, product, created: now(), models, network: "仅4G", power: "常电", architecture: "新架构", versions: [], differentialTasks: [], differentialPackages: [], currentVersion: null, rollbackTargetVersion: null, rollbackAvailable: false, releaseEvents: [], activeApproval: null, aiTranslationLocales: ["en"] });
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
      if (editing) {
        const eligibility = versionEditEligibility(identifier, oldVersion);
        if (!eligibility.allowed) {
          closeOverlay();
          addOperation("固件版本", "编辑", oldVersion?.version || state.drawer.version, "汤彦珊", "阻止", eligibility.reason);
          persist();
          toast(eligibility.reason, "warning");
          return;
        }
      }
      const versionName = editing ? oldVersion.version : String(values.get("version") || "").trim();
      const models = String(values.get("models") || "").trim();
      const platformReleaseNotes = String(values.get("platformNote") || "").trim();
      const appReleaseNoteDraft = appNoteDraft(state.drawer.appReleaseNotes);
      const appReleaseNotes = configuredAppNotes(appReleaseNoteDraft);
      const appNoteMeta = normalizeAppNoteMeta(state.drawer.appNoteMeta, appReleaseNoteDraft);
      const featureConfigs = editing ? clone(oldVersion.featureConfigs || []) : [];
      state.drawer.associatedFeatures = ensureRequiredFeatureSnapshots(state.drawer.associatedFeatures || [], identifier.product);
      if (!editing && !state.upload) state.errors.file = "请先上传固件包";
      if (!versionName) state.errors.version = "缺少固件版本号";
      if (!models) state.errors.models = "请输入适用机型";
      if (!platformReleaseNotes) state.errors.platformNote = "请填写平台发布说明";
      if (!editing && identifier.versions.some(item => item.version === versionName)) state.errors.version = "该版本号已存在";
      if (editing && identifier.versions.some(item => item !== oldVersion && item.version === versionName)) state.errors.version = "该版本号已存在";
      const noteError = appNoteConfigurationError(appReleaseNoteDraft, appNoteMeta);
      if (noteError) {
        state.errors[`locale-${noteError.locale}`] = noteError.message;
        state.errors.appNotes = "请完成全部启用语言并确认 AI 草稿";
      }
      const featureError = featureConfigurationError(state.drawer.associatedFeatures, identifier.product);
      if (featureError) state.errors.associatedFeatures = featureError;
      if (Object.keys(state.errors).length) {
        const firstLocaleError = Object.keys(state.errors).find(key => key.startsWith("locale-"));
        if (firstLocaleError) {
          state.drawer.activeLocale = firstLocaleError.slice("locale-".length);
          state.drawer.appNotesExpanded = true;
        }
        renderShell();
        return;
      }
      if (editing) {
        const before = {
          models: oldVersion.models,
          platformReleaseNotes: oldVersion.platformReleaseNotes,
          appReleaseNotes: clone(oldVersion.appReleaseNotes || {}),
          appNoteMeta: clone(oldVersion.appNoteMeta || {}),
          featureConfigs: clone(oldVersion.featureConfigs || []),
          associatedFeatures: clone(oldVersion.associatedFeatures || [])
        };
        oldVersion.models = models;
        oldVersion.note = platformReleaseNotes;
        oldVersion.platformReleaseNotes = platformReleaseNotes;
        oldVersion.appReleaseNotes = clone(appReleaseNotes);
        oldVersion.appNoteMeta = clone(appNoteMeta);
        oldVersion.appNoteMeta.sourceText = appReleaseNotes.zh;
        oldVersion.featureConfigs = featureConfigs;
        oldVersion.associatedFeatures = clone(state.drawer.associatedFeatures || []);
        oldVersion.features = featureConfigs.length;
        oldVersion.updated = now();
        oldVersion.associatedDeviceCount = associatedDeviceCount(identifier, models);
        oldVersion.recordVersion = Number(oldVersion.recordVersion || 1) + 1;
        if (!Array.isArray(oldVersion.editRevisions)) oldVersion.editRevisions = [];
        oldVersion.editRevisions.unshift({ time: now(), operator: "汤彦珊", recordVersion: oldVersion.recordVersion, before });
        const featureChange = featureAssociationChangeSummary(before.associatedFeatures, oldVersion.associatedFeatures);
        addOperation("固件版本", "编辑", versionName, "汤彦珊", "成功", `编辑${versionStatusLabel(oldVersion.status)}元数据，生成修订记录 R${oldVersion.recordVersion}；功能点：${featureChange}`);
      } else {
        identifier.versions.unshift({ version: versionName, url: `http://doraemon.camera666.com/${state.upload.name}`, size: state.upload.size, md5: state.upload.md5, models, associatedDeviceCount: associatedDeviceCount(identifier, models), features: featureConfigs.length, featureConfigs, associatedFeatures: clone(state.drawer.associatedFeatures || []), creator: "汤彦珊", note: platformReleaseNotes, platformReleaseNotes, appReleaseNotes: clone(appReleaseNotes), appNoteMeta: clone(appNoteMeta), noteRevisions: [], created: now(), updated: now(), latest: false, status: "unpublished", reminder: "不提醒", recordVersion: 1 });
        addOperation("固件版本", "新增", versionName, "汤彦珊", "成功", `功能点配置 ${(state.drawer.associatedFeatures || []).length} 项`);
      }
      identifier.aiTranslationLocales = enabledAppNoteLocales(appNoteMeta).filter(locale => locale !== "zh");
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
      db.roles.push({ name, code, users: 0, created: now(), note: note || "-", scope: "用户所属产线", permissions: emptyPermissions() });
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
    if (state.rulePanel) {
      dismissRulePopover();
      return;
    }
    if (state.modal && state.drawer) {
      state.modal = null;
      state.errors = {};
      renderShell();
      return;
    }
    if (state.modal || state.drawer) requestCloseOverlay();
  });

  renderShell();
})();
