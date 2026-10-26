(() => {
  "use strict";

  const STORAGE_KEY = "firmware-release-replica-v16";
  const routes = {
    firmware: { title: "固件列表", group: "device" },
    modules: { title: "模组型号", group: "device" },
    operations: { title: "操作日志", group: "logs" },
    approvals: { title: "审批日志", group: "logs" },
    approvalCenter: { title: "审批中心", group: "approval" },
    users: { title: "用户列表", group: "users" },
    roles: { title: "角色权限", group: "users" },
    approvalPolicies: { title: "审批配置", group: "users" }
  };

  const productLines = ["IPC", "车载", "NVR", "AI玩具", "婴儿看护", "4G模组", "BK系列"];
  const demoBoundDeviceCounts = { "23.110.211": 528, "25.922.219": 1264 };
  const permissionRows = [
    { menu: "固件管理", page: "固件列表", actions: ["查看固件标识列表", "编辑固件标识", "新增固件标识", "发布固件版本", "回滚固件版本", "下架当前发布版本", "维护APP更新说明", "查看发布日志", "删除固件标识", "查看版本列表", "新增固件版本", "编辑固件版本", "删除固件版本", "查看在线差分", "新建差分任务", "查看差分包", "下载差分包", "删除差分文件"] },
    { menu: "固件管理", page: "模组型号", actions: ["查看模组型号"] },
    { menu: "审批工作台", page: "审批中心", actions: ["查看审批中心", "处理当前审批", "撤回我的审批", "查看异常中心"] },
    { menu: "日志管理", page: "操作日志", actions: ["查看操作日志"] },
    { menu: "日志管理", page: "审批日志", actions: ["查看审批日志"] },
    { menu: "系统管理", page: "用户列表", actions: ["查看用户列表", "更新用户"] },
    { menu: "系统管理", page: "角色权限", actions: ["查看角色权限", "新增角色", "更新角色", "更新角色权限", "删除角色"] },
    { menu: "系统管理", page: "审批配置", actions: ["查看审批流程配置", "新建审批方案", "编辑审批方案", "查看审批方案版本记录"] }
  ];
  const systemAdminOnlyActions = new Set();

  const releaseMaterialRules = {
    testReport: { label: "测试报告", extensions: ["pdf", "doc", "docx", "xls", "xlsx"], maxFiles: 5, maxSizeMb: 50 },
    meetingMinutes: { label: "会议纪要", extensions: ["pdf", "doc", "docx", "xls", "xlsx"], maxFiles: 5, maxSizeMb: 50 }
  };

  const withdrawalReasonOptions = [
    ["info_error", "申请信息或影响范围填写错误"],
    ["materials_update", "测试报告、会议纪要等材料需要补充或更新"],
    ["firmware_issue", "固件或功能发现问题，暂缓本次操作"],
    ["state_changed", "当前版本或操作目标状态已发生变化"],
    ["plan_changed", "发布计划、发布时间窗口或业务需求调整"],
    ["duplicate", "重复提交，已有其他审批单替代"],
    ["other", "其他"]
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
      id: "motion-track", product: "IPC", name: "网络功能", identifier: "network_feature", category: "设备基本信息", description: "设备网络能力 · 设备基本信息类", firmwarePolicy: "固件必配", imageLabel: "◎",
      versions: [
        { id: "motion-v3", code: "V3", status: "testing", createdAt: "2026-07-24 11:21:05", description: "新增网络策略配置，功能版本测试中" },
        { id: "motion-v2", code: "V2", status: "published", releasedAt: "2026-07-15 16:40:20", description: "支持基础网络连接与网络状态管理" },
        { id: "motion-v1", code: "V1", status: "published", latest: true, releasedAt: "2026-05-18 11:32:10", description: "支持设备基础网络能力配置" }
      ]
    },
    {
      id: "night-vision", product: "IPC", name: "连接类型", identifier: "connection_type", category: "设备基本信息", description: "设备连接服务器协议类型 · 设备基本信息类", firmwarePolicy: "固件必配", imageLabel: "▣",
      versions: [
        { id: "night-v4", code: "V2", status: "published", releasedAt: "2026-07-18 14:12:30", description: "支持 MQTT 与 P2P 双通道连接" },
        { id: "night-v3", code: "V1", status: "published", latest: true, releasedAt: "2026-06-12 10:08:16", description: "支持设备连接服务器的基础协议类型" },
        { id: "night-v2", code: "V0", status: "disabled", releasedAt: "2026-03-20 09:30:00", description: "历史连接协议，仅保留既有固件关联" }
      ]
    },
    {
      id: "low-power", product: "IPC", name: "远程拍照", identifier: "remote_photo", category: "设备基本信息", description: "设备是否支持远程拍照功能配置", firmwarePolicy: "可选能力", imageLabel: "●",
      versions: [
        { id: "power-v0", code: "V0", status: "published", releasedAt: "2026-03-11 09:45:12", description: "基础版本，支持设备遥控拍照功能，适用于基础拍照场景。" },
        { id: "power-v2", code: "V1", status: "published", releasedAt: "2026-04-11 15:20:36", description: "支持远程拍照及定时拍照功能，适用于需要远程获取设备图片的场景。" },
        { id: "power-v3", code: "V3", status: "published", latest: true, releasedAt: "2026-07-08 09:45:12", description: "提供更完整的远程拍照配置能力，支持多种拍照策略，适用于高级拍照业务场景。" }
      ]
    },
    {
      id: "voice-intercom", product: "IPC", name: "新添加方式", identifier: "add_method", category: "设备基本信息", description: "设备支持的新添加绑定方式 · 设备基本信息类", firmwarePolicy: "可选能力", imageLabel: "+",
      versions: [
        { id: "voice-v3", code: "V3", status: "published", latest: true, releasedAt: "2026-07-10 17:06:22", description: "支持设备通过新添加接口完成绑定与分配。" },
        { id: "voice-v2", code: "V1", status: "published", releasedAt: "2026-05-09 13:15:40", description: "支持标准设备添加与绑定流程。" }
      ]
    },
    {
      id: "device-share", product: "IPC", name: "P2P功能", identifier: "p2p", category: "设备基本信息", description: "设备支持的 P2P 方式配置 · P2P", firmwarePolicy: "可选能力", imageLabel: "↗",
      versions: [
        { id: "share-v2", code: "V1", status: "published", latest: true, releasedAt: "2026-06-28 10:30:18", description: "设备支持自研 P2P 连接与远程预览能力。" }
      ]
    },
    {
      id: "pet-detection", product: "IPC", name: "实时日志功能", identifier: "realtime_log", category: "设备运维类", description: "设备与服务器实时日志功能 · 设备运维类", firmwarePolicy: "可选能力", imageLabel: "▤",
      versions: [
        { id: "pet-v1", code: "V1", status: "published", latest: true, releasedAt: "2026-07-26 16:18:05", description: "支持设备运行日志实时上传与查看。" }
      ]
    },
    { id: "ipc-other", product: "IPC", name: "其他功能", identifier: "other_feature", category: "其他能力", description: "当前固件版本 V3.2.1 暂不支持此功能", firmwarePolicy: "可选能力", supported: false, imageLabel: "⊘", versions: [] },
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

  function configurableFeatureVersions(feature) {
    return (feature?.versions || []).filter(version => ["published", "testing"].includes(version.status));
  }

  function defaultFeatureVersion(feature) {
    const eligible = eligibleFeatureVersions(feature);
    return eligible.find(version => version.latest) || eligible[0] || null;
  }

  function defaultConfigurableFeatureVersion(feature) {
    return defaultFeatureVersion(feature) || configurableFeatureVersions(feature).find(version => version.latest) || configurableFeatureVersions(feature)[0] || null;
  }

  function featureVersionStatusLabel(version) {
    if (!version) return "版本不存在";
    if (version.status === "testing") return "测试中";
    if (version.status === "disabled") return "已停用";
    return version.latest ? "最新可用" : "已发布";
  }

  function featureVersionDisplayStatus(snapshot) {
    const liveVersion = sourceFeatureVersion(sourceFeatureBySnapshot(snapshot), snapshot);
    const status = liveVersion?.status || snapshot?.versionStatus || "unknown";
    return {
      label: liveVersion ? featureVersionStatusLabel(liveVersion) : snapshot?.versionStatusLabel || "版本不存在",
      className: status === "published" ? "success" : status === "testing" ? "warning" : "danger"
    };
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
        name: snapshot.name || "未知功能项",
        identifier: snapshot.identifier || "-",
        product: snapshot.product || product,
        category: snapshot.category || "未分类",
        firmwarePolicy: snapshot.firmwarePolicy || "历史配置",
        imageLabel: snapshot.imageLabel || snapshot.imageName || "功能",
        featureVersionId: snapshot.featureVersionId || "",
        version: snapshot.version || "-",
        versionDescription: snapshot.versionDescription || "历史功能项快照",
        versionStatus: snapshot.versionStatus || "unknown",
        versionStatusLabel: snapshot.versionStatusLabel || "来源已失效",
        sourceUpdatedAt: snapshot.sourceUpdatedAt || "-",
        selectedAt: snapshot.selectedAt || "-"
      };
    }
    const selectedVersion = sourceFeatureVersion(source, snapshot) || defaultConfigurableFeatureVersion(source);
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

  function migrateLegacyAssociatedFeatures(version, product) {
    const legacyCount = Math.max(
      Number(version?.features) || 0,
      Array.isArray(version?.featureConfigs) ? version.featureConfigs.length : 0
    );
    if (!legacyCount) return [];
    const required = requiredFeatureSourcesForProduct(product);
    const optional = optionalFeatureSourcesForProduct(product);
    const sources = [...required, ...optional].slice(0, Math.max(required.length, legacyCount));
    return sources.map(source => {
      const featureVersion = defaultFeatureVersion(source);
      return featureVersion ? associatedFeatureSnapshot(source, featureVersion.id) : null;
    }).filter(Boolean);
  }

  function defaultFeatureBaseline(product) {
    return requiredFeatureSourcesForProduct(product).map(source => {
      const featureVersion = defaultFeatureVersion(source);
      return featureVersion ? associatedFeatureSnapshot(source, featureVersion.id) : null;
    }).filter(Boolean);
  }

  function configuredFeatureBaseline(identifier, preferredVersion = null) {
    const hasFeatures = version => Array.isArray(version?.associatedFeatures) && version.associatedFeatures.length > 0;
    const current = identifier.versions.find(version => version.version === identifier.currentVersion)
      || identifier.versions.find(version => version.status === "current" || version.latest);
    const recentConfigured = [...identifier.versions]
      .filter(hasFeatures)
      .sort((left, right) => String(right.updated || right.created || "").localeCompare(String(left.updated || left.created || "")))[0];
    const source = [preferredVersion, current, recentConfigured].find(hasFeatures) || null;
    return {
      source,
      features: source
        ? source.associatedFeatures.map(feature => normalizeAssociatedFeatureSnapshot(feature, identifier.product))
        : defaultFeatureBaseline(identifier.product),
      type: source ? (source === current ? "current" : "recent") : "product-default"
    };
  }

  function featureAssociationIssue(association, product) {
    const source = sourceFeatureBySnapshot(association);
    if (!source) return `${association?.name || "功能项"} 已不在机型平台功能目录中`;
    if (source.product !== product) return `${source.name} 不属于当前产品线 ${product}`;
    const version = sourceFeatureVersion(source, association);
    if (!version) return `${source.name} 的关联版本已不存在`;
    if (version.status === "testing") return `${source.name} ${version.code} 仍在测试中`;
    if (version.status === "disabled") return `${source.name} ${version.code} 已停用`;
    if (version.status !== "published") return `${source.name} ${version.code} 暂不可用于固件关联`;
    return "";
  }

  function featureConfigurationError(features, product, options = {}) {
    const ids = new Set();
    for (const feature of features || []) {
      if (ids.has(feature.id)) return `${feature.name} 不能重复配置`;
      ids.add(feature.id);
      const issue = featureAssociationIssue(feature, product);
      if (options.allowTesting && /仍在测试中$/.test(issue)) continue;
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
    return parts.join("、") || "功能项配置无变化";
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
        ["VER-R03", "加载功能项", "数据", "按当前固件标识所属产品线读取机型平台功能管理目录；固件必配功能自动加载且不可移除", "不展示其他产品线功能源，用户只需选择可选功能"],
        ["VER-R04", "保存新版本", "数据", "版本号唯一且适用机型、平台说明、中英文 APP 说明完整", "校验通过后保存为未发布版本"],
        ["VER-R05", "编辑非当前版本", "权限", "未发布、历史发布和已撤回版本可编辑，审批目标锁定", "编辑范围与版本状态一致"],
        ["VER-R06", "编辑版本内容", "状态", "不得修改版本号或替换固件包", "历史制品和引用关系稳定"],
        ["VER-R07", "保存历史修订", "审计", "递增 recordVersion 并保留修改前内容", "历史修订不可覆盖且可追溯"],
        ["VER-R08", "删除版本", "权限", "仅未发布版本可删除", "已形成业务事实的版本不被移除"],
        ["VER-R09", "默认功能版本", "交互", "固件必配功能自动关联最新已发布可用版本；勾选可选功能后默认带出最新可配置版本", "测试中版本可用于 OTA 验证配置，不会被直接发布"],
        ["VER-R10", "切换功能版本", "交互", "支持切换其他已发布或测试中版本；已停用版本不可新选", "测试版本可用于 OTA 验证，正式发布时仍需切换为已发布版本"],
        ["VER-R11", "保存功能项快照", "数据", "保存功能项名称、分类、版本、状态和说明快照", "源平台后续变化不追溯改写固件历史"],
        ["VER-R12", "功能版本失效", "状态", "历史快照继续展示，正常发布前必须切换至仍可关联的版本", "历史可追溯且新发布不引用失效版本"],
        ["VER-R13", "固件包摘要", "交互", "上传前只展示上传入口；解析后集中展示文件、版本、MD5 和大小", "不使用空只读字段占用首屏空间"],
        ["VER-R14", "适用机型范围", "数据", "从当前固件标识绑定机型中选择；编辑历史版本时允许保留原值", "不能任意录入其他机型，历史数据不被强制改写"],
        ["VER-R15", "统一功能入口", "交互", "添加可选功能与切换功能版本统一在“配置功能”弹窗完成", "主表不重复提供逐行配置入口"],
        ["VER-R16", "固定语言工作台", "交互", "新增、编辑与说明维护默认展示全部 15 种语言目录，左侧独立滚动，右侧编辑当前语言", "无需额外展开即可查看配置状态并连续切换语言"],
        ["VER-R17", "未保存退出", "交互", "表单存在真实修改时，关闭、取消、遮罩与 Esc 均需二次确认", "避免误操作丢失已填写内容"],
        ["VER-R18", "继承功能配置", "数据", "新增版本优先继承当前正式发布版本；无当前版本时继承最近配置完整版本；仍无基线时加载产品线必配功能", "新版本默认具备可用功能配置且继承来源可追溯"]
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
        ["PUB-R03", "提交审批", "前置", "校验固件包、功能项版本、启用语言、提醒策略和审批并发", "仅完整且无冲突的版本进入审批"],
        ["PUB-R04", "创建审批", "数据", "冻结 recordVersion、影响设备、功能项版本、说明和提醒方式", "审批内容与执行内容一一对应"],
        ["PUB-R05", "审批期间", "状态", "当前版本继续生效，目标版本及其内容锁定", "审批不会提前改变线上版本"],
        ["PUB-R06", "已通过", "前置", "服务端复检当前指针、目标、固件包、功能项来源状态和快照版本号", "条件变化时审批失效"],
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
        ["RBK-R04", "提交回滚", "权限", "所有回滚统一创建平台审批", "高风险切换具有审批依据"],
        ["RBK-R05", "审批期间", "状态", "当前版本继续生效，同一标识发布与回滚锁定", "线上状态在审批结束前不变化"],
        ["RBK-R06", "已通过", "前置", "复检当前指针、唯一目标、固件包和审批快照", "条件变化时不执行错误恢复"],
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
        ["DET-R01", "查看当前版本", "数据", "聚合版本、状态、影响设备、生效、提醒、机型和固件包信息", "无需跨页面判断当前状态"],
        ["DET-R02", "当前版本操作", "状态", "只展示当前可用的详情、回滚和下架操作", "已下架能力不保留空入口"],
        ["DET-R03", "打开版本详情", "交互", "同一详情抽屉承载功能项、APP 更新说明、发布记录和审批日志四类页签", "关联记录保持同一版本上下文"],
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
        ["DEL-R05", "提交下架审批", "审批", "所有下架统一创建平台审批", "高风险停止分发具有审批依据"],
        ["DEL-R06", "审批期间", "状态", "当前版本继续生效，同一标识其他发布、回滚和下架锁定", "审批结束前线上状态不变化"],
        ["DEL-R07", "已通过", "前置", "复检当前版本、记录版本及审批快照后原子执行", "条件变化时审批失效且不清空当前版本"],
        ["DEL-R08", "下架成功", "结果", "清空当前发布指针但保留固件包，不自动恢复历史版本", "允许明确的暂无当前发布版本状态"],
        ["DEL-R09", "记录下架结果", "审计", "记录审批、执行结果、原因和当前版本变化", "下架事实完整可追溯"],
        ["DEL-R10", "重新发布已下架版本", "状态", "已下架版本允许编辑、查看和重新发起发布审批，不允许删除", "版本可再次使用且历史事实不被删除"]
      ]
    },
    policy: {
      title: "审批配置规则",
      code: "POL",
      fr: "FR-26、FR-27、FR-28、FR-29",
      rules: [
        ["POL-R01", "查看审批配置", "范围", "按产品线查看审批方案及发布、回滚、下架三类操作覆盖情况", "当前页面只呈现所选产品线的有效配置口径"],
        ["POL-R02", "新建审批方案", "权限", "仅具备新建审批方案权限的角色可创建方案，所属产品线由当前页面上下文确定", "方案保存后生成唯一方案和 V1 版本"],
        ["POL-R03", "编辑审批方案", "权限", "编辑只修改后续新申请使用的方案，不改变已经提交审批的节点快照", "保存修改后生成新的方案版本并保留历史版本"],
        ["POL-R04", "绑定审批操作", "数据", "每个产品线的发布、回滚和下架分别对应一个固定审批方案，不支持跨操作复用", "从页面上下文确定操作，避免重复覆盖和误配置"],
        ["POL-R05", "维护审批节点", "交互", "支持 1–5 级串行节点，节点内多人或签，页面顺序即实际流转顺序，可添加或删除节点", "提交审批时按当前方案顺序依次激活节点"],
        ["POL-R06", "选择审批人", "前置", "审批人必须是该产品线下的启用平台用户，同一方案内不可重复配置", "无效用户不能进入新的审批方案"],
        ["POL-R07", "人工催办", "通知", "普通审批中心仅“我发起的”可对当前未完成节点按需催办；系统管理员保留后台兜底", "再次发送钉钉通知给当前节点未处理审批人；同一节点 30 分钟内最多一次"],
        ["POL-R08", "配置终态抄送", "通知", "抄送人只接收审批驳回、正式发布成功或发布失败结果，不参与审批处理", "撤回同样发送结果通知"],
        ["POL-R09", "保存方案版本", "审计", "新建保存生成 V1，编辑保存生成递增版本，并保留完整快照、变更说明和变更人时间", "历史审批继续使用提交时冻结的原方案版本"],
        ["POL-R10", "保存后立即生效", "状态", "审批方案首次保存成功后默认处于已启用状态，作为对应操作的当前生效版本", "后续新申请读取已启用的最新版本，在途审批不被改写"],
        ["POL-R11", "查看版本记录", "交互", "版本记录以只读抽屉展示版本列表、完整快照、审批节点、抄送人员和版本变化", "历史版本可追溯但不能直接编辑"],
        ["POL-R12", "预览审批模板", "交互", "根据当前固定审批操作展示对应平台审批任务，动态字段由固件申请带入", "保存前可核对业务字段与审批链路表现"]
      ]
    }
  };

  function configFromCatalog(item, optionValue = item.options[0].value) {
    const option = item.options.find(candidate => candidate.value === optionValue) || item.options[0];
    return { key: item.key, name: item.name, value: option.value, label: option.label, version: option.version, description: option.description };
  }

  const demoAppNoteRevisions = {
    "23.110.211/23.110.211.99": [
      {
        time: "2026-09-08 11:08:15",
        operator: "张元/Alice",
        reason: "补充弱网重连场景说明，并统一中英文升级文案表述。",
        before: {
          appReleaseNotes: {
            zh: "优化设备连接稳定性。",
            en: "Improve device connection stability."
          }
        },
        after: {
          appReleaseNotes: {
            zh: "提升弱网环境下的连接稳定性。",
            en: "Improve connection stability on weak networks."
          }
        },
        recordVersion: 2
      }
    ]
  };

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
      ["23.110.211.99", "正常发布", "彭冬柏", "2026-07-21 15:56:20", "IPC 产品线负责人", "已驳回", "2026-07-21 16:08:20", "测试范围未覆盖完整，目标版本保持未发布"],
      ["23.110.211.12", "版本回滚", "汤彦珊", "2026-07-21 14:20:08", "彭冬柏", "已通过", "2026-07-21 14:28:36", "线上连接异常，恢复上一个稳定版本"],
      ["23.110.211.60", "正常发布", "刘林胶", "2026-07-20 18:05:12", "彭冬柏", "已驳回", "2026-07-20 18:16:04", "测试报告缺少弱网场景验证"],
      ["31.120.200.4", "阮天丽", "2026-07-14 22:06:22", "彭冬柏", "已通过", "2026-07-14 22:10:30"],
      ["23.110.211.13", "刘林胶", "2026-07-14 18:16:22", "彭冬柏", "已通过", "2026-07-14 18:41:21"],
      ["23.110.211.13", "刘林胶", "2026-07-13 16:31:03", "-", "已撤回", "2026-07-14 16:59:42"],
      ["23.100.111.3", "彭志勇", "2026-07-13 14:43:07", "彭冬柏", "已通过", "2026-07-13 16:23:26"],
      ["23.220.211.34", "江锐", "2026-07-13 11:47:19", "彭冬柏", "已通过", "2026-07-13 12:11:51"],
      ["23.322.219.3", "江锐", "2026-07-13 11:47:06", "彭冬柏", "已通过", "2026-07-13 12:11:52"],
      ["23.120.211.25", "江锐", "2026-07-13 11:46:46", "彭冬柏", "已通过", "2026-07-13 12:11:55"],
      ["23.210.211.17", "邓文韬", "2026-07-13 09:51:58", "彭冬柏", "已通过", "2026-07-13 12:11:58"],
      ["23.221.216.4", "杨婷", "2026-07-11 20:15:12", "彭冬柏", "已通过", "2026-07-11 20:16:37"],
      ["23.110.315.3", "黄晓纯", "2026-07-11 11:46:34", "彭冬柏", "已通过", "2026-07-11 12:52:51"],
      ["23.120.304.4", "黄晓纯", "2026-07-09 17:40:18", "彭冬柏", "已通过", "2026-07-09 18:54:14"],
      ["23.120.211.28", "罗琅仁", "2026-07-09 17:17:11", "彭冬柏", "已通过", "2026-07-09 18:54:15"]
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
    approvalPolicies: [],
    notifications: [],
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
      { name: "产线主管", users: 8, created: "2026-01-08 09:22:10", note: "负责所属产线发布、回滚、下架、通知与审批处理", scope: "用户所属产线", permissions: {} },
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
        { id: "EVT-1313-02", flowId: "FLOW-PUB-20260714-1313", flowType: "publish", flowStatus: "active", fromVersion: "23.110.211.12", toVersion: "23.110.211.13", stage: "approval", title: "发布审批通过", time: "2026-07-14 18:41:18", operator: "彭冬柏", operatorType: "平台审批", result: "success", summary: "审批回调与版本快照校验通过" },
        { id: "EVT-1313-03", flowId: "FLOW-PUB-20260714-1313", flowType: "publish", flowStatus: "active", fromVersion: "23.110.211.12", toVersion: "23.110.211.13", stage: "release", title: "当前发布版本切换", time: "2026-07-14 18:41:21", operator: "发布服务", operatorType: "系统", result: "success", summary: "23.110.211.12 -> 23.110.211.13，系统内仅保留一个当前发布版本" },
        { id: "EVT-1499-01", flowId: "FLOW-PUB-20260714-1499", flowType: "publish", flowStatus: "rejected", fromVersion: "23.110.211.12", toVersion: "23.110.211.99", stage: "approval", title: "提交发布审批", time: "2026-07-14 16:20:05", operator: "张元/Alice", operatorType: "用户", result: "success", summary: "目标版本 23.110.211.99，当前发布版本保持不变" },
        { id: "EVT-1499-02", flowId: "FLOW-PUB-20260714-1499", flowType: "publish", flowStatus: "rejected", fromVersion: "23.110.211.12", toVersion: "23.110.211.99", stage: "approval", title: "发布审批驳回", time: "2026-07-14 16:50:42", operator: "彭冬柏", operatorType: "平台审批", result: "rejected", summary: "适用机型范围与本次发布计划不一致，版本未生效" },
        { id: "EVT-1422-01", flowId: "FLOW-PUB-20260714-1422", flowType: "publish", flowStatus: "failed", fromVersion: "23.110.211.12", toVersion: "23.110.211.22", stage: "approval", title: "提交发布审批", time: "2026-07-14 14:00:10", operator: "汤彦珊", operatorType: "用户", result: "success", summary: "审批快照已锁定，目标版本 23.110.211.22" },
        { id: "EVT-1422-02", flowId: "FLOW-PUB-20260714-1422", flowType: "publish", flowStatus: "failed", fromVersion: "23.110.211.12", toVersion: "23.110.211.22", stage: "approval", title: "发布审批通过", time: "2026-07-14 14:06:20", operator: "彭冬柏", operatorType: "平台审批", result: "success", summary: "审批回调与版本快照校验通过" },
        { id: "EVT-1422-03", flowId: "FLOW-PUB-20260714-1422", flowType: "publish", flowStatus: "failed", fromVersion: "23.110.211.12", toVersion: "23.110.211.22", stage: "release", title: "版本发布失败", time: "2026-07-14 14:06:23", operator: "发布服务", operatorType: "系统", result: "failed", summary: "固件包完整性复检失败，发布事务已整体回退，当前版本未变化" },
        { id: "EVT-1212-01", flowId: "FLOW-PUB-20260523-1212", flowType: "publish", flowStatus: "superseded", fromVersion: "23.110.211.10", toVersion: "23.110.211.12", stage: "approval", title: "发布审批通过", time: "2026-05-23 15:20:11", operator: "IPC 产品线负责人", operatorType: "平台审批", result: "success", summary: "审批通过并触发版本状态切换" },
        { id: "EVT-1212-02", flowId: "FLOW-PUB-20260523-1212", flowType: "publish", flowStatus: "superseded", fromVersion: "23.110.211.10", toVersion: "23.110.211.12", stage: "release", title: "版本发布成功", time: "2026-05-23 15:20:16", operator: "发布服务", operatorType: "系统", result: "success", summary: "当前发布版本切换成功，后续已被 23.110.211.13 替代" },
        { id: "EVT-0099-01", flowId: "FLOW-PUB-20260701-0099", flowType: "publish", flowStatus: "rejected", fromVersion: "23.110.211.12", toVersion: "23.110.211.99", stage: "approval", title: "提交发布审批", time: "2026-07-01 11:40:00", operator: "张元/Alice", operatorType: "用户", result: "success", summary: "目标版本 23.110.211.99，审批期间未改变当前发布版本" },
        { id: "EVT-0099-02", flowId: "FLOW-PUB-20260701-0099", flowType: "publish", flowStatus: "rejected", fromVersion: "23.110.211.12", toVersion: "23.110.211.99", stage: "approval", title: "发布审批驳回", time: "2026-07-01 14:06:50", operator: "彭冬柏", operatorType: "平台审批", result: "rejected", summary: "适用机型范围与本次发布计划不一致，版本未生效" }
      ];
    }
    const flowId = `FLOW-PUB-INIT-${identifierIndex + 1}`;
    return legacyCurrent ? [
      { id: `${flowId}-01`, flowId, flowType: "publish", flowStatus: "active", fromVersion: legacyRollbackTarget?.version || null, toVersion: legacyCurrent.version, stage: "release", title: "版本发布成功", time: legacyCurrent.published || legacyCurrent.updated, operator: "发布服务", operatorType: "系统", result: "success", summary: `当前发布版本已切换为 ${legacyCurrent.version}` }
    ] : [];
  }

  function backfillAppNoteRevisions(version) {
    if (!Array.isArray(version.editRevisions) || !version.editRevisions.length) return;
    const edits = version.editRevisions
      .filter(item => Number(item?.recordVersion) > 0 && item?.before?.appReleaseNotes && typeof item.before.appReleaseNotes === "object")
      .slice()
      .sort((left, right) => Number(left.recordVersion) - Number(right.recordVersion));
    if (!edits.length) return;

    const existingRecordVersions = new Set((version.noteRevisions || []).map(item => Number(item.recordVersion)));
    const currentSnapshot = { appReleaseNotes: version.appReleaseNotes, appNoteMeta: version.appNoteMeta };
    edits.forEach((edit, index) => {
      const recordVersion = Number(edit.recordVersion);
      const beforeSnapshot = edit.before;
      const afterSnapshot = edits[index + 1]?.before || currentSnapshot;
      const changedLocales = changedAppNoteLocales(beforeSnapshot.appReleaseNotes, afterSnapshot.appReleaseNotes);
      const previousEnabledLocales = enabledAppNoteLocales(normalizeAppNoteMeta(beforeSnapshot.appNoteMeta, beforeSnapshot.appReleaseNotes));
      const nextEnabledLocales = enabledAppNoteLocales(normalizeAppNoteMeta(afterSnapshot.appNoteMeta, afterSnapshot.appReleaseNotes));
      const enabledLocalesChanged = !sameValues(previousEnabledLocales, nextEnabledLocales);
      if ((!changedLocales.length && !enabledLocalesChanged) || existingRecordVersions.has(recordVersion)) return;

      const changedCopy = changedLocales.map(localeName).join("、");
      version.noteRevisions.push({
        time: edit.time || version.updated || version.created || "-",
        operator: edit.operator || version.creator || "管理员",
        reason: changedCopy
          ? `通过固件版本编辑同步更新${changedCopy}文案${enabledLocalesChanged ? "及适配语言范围" : ""}`
          : "通过固件版本编辑调整文案适配语言范围",
        before: {
          appReleaseNotes: clone(normalizeAppNotes(beforeSnapshot.appReleaseNotes)),
          appNoteMeta: clone(normalizeAppNoteMeta(beforeSnapshot.appNoteMeta, beforeSnapshot.appReleaseNotes))
        },
        after: {
          appReleaseNotes: clone(normalizeAppNotes(afterSnapshot.appReleaseNotes)),
          appNoteMeta: clone(normalizeAppNoteMeta(afterSnapshot.appNoteMeta, afterSnapshot.appReleaseNotes))
        },
        recordVersion
      });
      existingRecordVersions.add(recordVersion);
    });
    version.noteRevisions.sort((left, right) => Number(right.recordVersion) - Number(left.recordVersion));
  }

  function normalizeApprovalPolicyAssignments(data) {
    const source = Array.isArray(data.approvalPolicies) ? data.approvalPolicies : [];
    const operationLabels = { publish: "正常发布", rollback: "版本回滚", delist: "版本下架" };
    const supportedOperations = new Set(Object.keys(operationLabels));
    const split = [];
    source.forEach((policy, policyIndex) => {
      const operations = [...new Set((policy.operation ? [policy.operation] : policy.operations || []).filter(operation => supportedOperations.has(operation)))];
      const legacyStatus = policy.status === "disabled" ? "disabled" : "enabled";
      (operations.length ? operations : ["publish"]).forEach((operation, index) => {
        const item = index === 0 ? policy : clone(policy);
        const baseId = policy.id || `POLICY-${String(policyIndex + 1).padStart(4, "0")}`;
        const id = index === 0 ? baseId : `${baseId}-${operation.toUpperCase()}`;
        const versionNumber = Number(policy.versionNumber || String(policy.policyVersion || "").match(/V(\d+)$/)?.[1] || 1);
        item.id = id;
        item.operation = operation;
        item.operations = [operation];
        item.name = index === 0 && operations.length === 1 ? policy.name : `${policy.productLine || productLines[0]} ${operationLabels[operation]}审批`;
        item.policyVersion = `${id}-V${versionNumber}`;
        item.status = legacyStatus;
        item._legacyOperationCount = operations.length;
        item._legacyStatus = legacyStatus;
        item.history = (Array.isArray(policy.history) ? policy.history : []).map(version => ({
          ...version,
          policyVersion: `${id}-V${Number(version.policyVersion?.match(/V(\d+)$/)?.[1] || versionNumber)}`,
          name: index === 0 && operations.length === 1 ? (version.name || item.name) : item.name,
          operations: [operation],
          status: legacyStatus
        }));
        split.push(item);
      });
    });
    const unique = new Map();
    split.forEach(policy => {
      const key = `${policy.productLine || productLines[0]}::${policy.operation || policy.operations?.[0] || "publish"}`;
      const current = unique.get(key);
      const candidateSpecificity = Number(policy._legacyOperationCount || 1);
      const currentSpecificity = Number(current?._legacyOperationCount || 1);
      const candidateWins = !current
        || candidateSpecificity < currentSpecificity
        || (candidateSpecificity === currentSpecificity && policy._legacyStatus === "enabled" && current._legacyStatus !== "enabled")
        || (candidateSpecificity === currentSpecificity && policy._legacyStatus === current._legacyStatus && String(policy.updatedAt || "") > String(current.updatedAt || ""));
      if (candidateWins) unique.set(key, policy);
    });
    data.approvalPolicies = [...unique.values()].map(policy => {
      delete policy._legacyOperationCount;
      delete policy._legacyStatus;
      return policy;
    });
  }

  function normalizeDatabase(data) {
    if (!Array.isArray(data.approvalPolicies)) data.approvalPolicies = [];
    if (!Array.isArray(data.notifications)) data.notifications = [];
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
        const storedAssociatedFeatures = Array.isArray(version.associatedFeatures)
          ? version.associatedFeatures.map(feature => normalizeAssociatedFeatureSnapshot(feature, identifier.product))
          : [];
        version.associatedFeatures = storedAssociatedFeatures.length
          ? storedAssociatedFeatures
          : migrateLegacyAssociatedFeatures(version, identifier.product);
        version.features = version.associatedFeatures.length;
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
        const demoRevisions = demoAppNoteRevisions[`${identifier.id}/${version.version}`];
        if (!version.noteRevisions.length && demoRevisions) {
          if (!version.created) version.created = version.updated;
          version.noteRevisions = clone(demoRevisions);
          const latestDemoRevisionTime = demoRevisions[0]?.time;
          if (latestDemoRevisionTime && String(latestDemoRevisionTime) > String(version.updated || "")) version.updated = latestDemoRevisionTime;
        }
        backfillAppNoteRevisions(version);
        if (!version.status) {
          if (version === legacyCurrent) version.status = "current";
          else if (version === legacyRollbackTarget) version.status = "historical";
          else version.status = "unpublished";
        }
        version.latest = version.status === "current";
        if (!version.created) version.created = version.updated;
        const latestNoteRevision = version.noteRevisions.reduce((latest, item) => Math.max(latest, Number(item.recordVersion) || 0), 0);
        version.recordVersion = Math.max(Number(version.recordVersion) || 1, latestNoteRevision);
        if (!Number.isFinite(Number(version.associatedDeviceCount))) version.associatedDeviceCount = associatedDeviceCount(identifier, version.models);
        version.associatedDeviceCount = Number(version.associatedDeviceCount);
      });
      if (identifier.currentVersion === undefined && legacyCurrent) identifier.currentVersion = legacyCurrent.version;
      const baseline = configuredFeatureBaseline(identifier, legacyCurrent);
      identifier.versions.forEach(version => {
        if (version.associatedFeatures.length) {
          if (!version.featureConfigOrigin) version.featureConfigOrigin = "existing";
          return;
        }
        version.associatedFeatures = clone(baseline.features);
        version.features = version.associatedFeatures.length;
        version.featureConfigOrigin = baseline.source ? "baseline-inherited" : "product-default";
        version.featureConfigSourceVersion = baseline.source?.version || null;
      });
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
      // 既有本地示例可能保存了旧版空权限。产线主管承担审批人和发起人职责，
      // 仅补齐缺失项，不覆盖管理员已经明确关闭的自定义权限。
      if (role.name === "产线主管") {
        ["查看审批中心", "处理当前审批", "撤回我的审批", "查看异常中心"].forEach(action => {
          if (role.permissions[`action-${action}`] === undefined) role.permissions[`action-${action}`] = true;
        });
        if (role.permissions["page-审批中心"] === undefined) role.permissions["page-审批中心"] = true;
        if (role.permissions["menu-审批工作台"] === undefined) role.permissions["menu-审批工作台"] = true;
      }
      const legacyExceptionAction = `action-${["查看", "异常", "任务"].join("")}`;
      if (role.permissions["action-查看异常中心"] === undefined && role.permissions[legacyExceptionAction] !== undefined) role.permissions["action-查看异常中心"] = role.permissions[legacyExceptionAction];
      delete role.permissions[legacyExceptionAction];
      if (role.permissions["menu-系统管理"] === undefined) role.permissions["menu-系统管理"] = Boolean(role.permissions["menu-用户角色"]);
      if (role.permissions["page-审批配置"] === undefined) role.permissions["page-审批配置"] = Boolean(role.permissions["page-审批流程配置"]);
      if (role.permissions["page-审批配置"] && role.permissions["action-查看审批流程配置"] === undefined) role.permissions["action-查看审批流程配置"] = true;
      if (role.permissions["action-维护审批流程配置"]) {
        ["查看审批流程配置", "新建审批方案", "编辑审批方案", "查看审批方案版本记录"].forEach(action => { role.permissions[`action-${action}`] = true; });
      }
      delete role.permissions["action-启用/停用审批方案"];
      delete role.permissions["action-替换在途审批人"];
      delete role.permissions["action-维护审批流程配置"];
    });
    const roleNames = new Set(data.roles.map(role => role.name));
    const fallbackRole = data.roles.find(role => role.default)?.name || data.roles[0]?.name || "";
    data.users.forEach(user => {
      if (!roleNames.has(user.role)) user.role = fallbackRole;
      if (!Array.isArray(user.lines)) user.lines = [];
      if (!Array.isArray(user.approverLines)) user.approverLines = [];
      if (!Array.isArray(user.changeLogs)) user.changeLogs = [];
      if (!user.userId) user.userId = `USR-${String(data.users.indexOf(user) + 1).padStart(4, "0")}`;
      if (!user.status) user.status = "active";
      if (!user.changeLogs.length && user.name === "刘林胶") {
        user.changeLogs = [
          { time: "2026-07-21 15:32:44", operator: "严国潮", action: "更新角色", content: "关联角色：默认人员 → 测试人员；所属产线：IPC" },
          { time: "2026-07-18 10:20:16", operator: "严国潮", action: "更新范围", content: "移除 4G 模组，仅保留 IPC 产线数据范围" }
        ];
      }
      user.approverLines = user.approverLines.filter(line => user.lines.includes(line));
    });
    if (!data.approvalPolicies.length) {
      const firstApprover = data.users.find(user => user.status === "active" && user.lines.includes("IPC") && user.name === "彭冬柏") || data.users.find(user => user.status === "active" && user.lines.includes("IPC"));
      const secondApprover = data.users.find(user => user.status === "active" && user.lines.includes("IPC") && user.userId !== firstApprover?.userId);
      if (firstApprover && secondApprover) {
        data.approvalPolicies.push({
          id: "POLICY-IPC-FORMAL",
          productLine: "IPC",
          name: "IPC 正式发布审批",
          description: "正式发布采用 1–5 级串行审批，可按需增删审批节点",
          operations: ["publish"],
          nodes: [
            { sequence: 1, type: "generic", approverUserId: firstApprover.userId, approverName: firstApprover.name },
            { sequence: 2, type: "generic", approverUserId: secondApprover.userId, approverName: secondApprover.name }
          ],
          copyUserIds: [firstApprover.userId],
          status: "enabled",
          versionNumber: 1,
          policyVersion: "POLICY-IPC-FORMAL-V1",
          createdAt: now(),
          updatedAt: now(),
          updatedBy: "系统预置",
          history: []
        });
        data.approvalPolicies.push({
          id: "POLICY-IPC-CHANGE",
          productLine: "IPC",
          name: "IPC 回滚与下架审批",
          description: "回滚和下架共用通用审批方案，可按需拆分",
          operations: ["rollback", "delist"],
          nodes: [{ sequence: 1, type: "generic", approverUserId: firstApprover.userId, approverName: firstApprover.name }],
          copyUserIds: [firstApprover.userId],
          status: "enabled",
          versionNumber: 1,
          policyVersion: "POLICY-IPC-CHANGE-V1",
          createdAt: now(),
          updatedAt: now(),
          updatedBy: "系统预置",
          history: []
        });
      }
    }
    normalizeApprovalPolicyAssignments(data);
    data.approvalPolicies.forEach((policy, policyIndex) => {
      if (!policy.id) policy.id = `POLICY-${String(policyIndex + 1).padStart(4, "0")}`;
      if (!policy.productLine) policy.productLine = policy.product || productLines[0];
      if (policy.description == null) policy.description = "";
      if (policy.name === "IPC 正式发布质量审批") policy.name = "IPC 正式发布审批";
      if (policy.description === "正式发布固定由项目经理审核后进入质量代表确认") policy.description = "正式发布采用 1–5 级串行审批，可按需增删审批节点";
      policy.operation = policy.operation || policy.operations?.[0] || "publish";
      policy.operations = [policy.operation];
      if (!Array.isArray(policy.nodes) || !policy.nodes.length) policy.nodes = [];
      policy.levelCount = Math.min(5, Math.max(1, Number(policy.levelCount || policy.nodes.length || 1)));
      policy.nodes = policy.nodes.slice(0, 5).map((node, index) => {
        const approver = data.users.find(user => user.name === node.approverName) || data.users.find(user => user.userId === node.approverUserId);
        return {
          ...node,
          sequence: index + 1,
          type: "generic",
          approverUserId: node.approverUserId || approver?.userId || "",
          approverName: node.approverName || approver?.name || ""
        };
      });
      policy.levelCount = policy.nodes.length || policy.levelCount;
      if (!policy.policyVersion) policy.policyVersion = `${policy.id}-V1`;
      if (!Number.isFinite(Number(policy.versionNumber))) policy.versionNumber = Number(String(policy.policyVersion).match(/V(\d+)$/)?.[1] || 1);
      policy.status = policy.status === "disabled" ? "disabled" : "enabled";
      if (!Array.isArray(policy.copyUserIds)) policy.copyUserIds = [];
      policy.copyUserIds = [...new Set(policy.copyUserIds)].filter(userId => data.users.some(user => user.userId === userId && user.status === "active" && user.lines.includes(policy.productLine)));
      if (!policy.createdAt) policy.createdAt = now();
      if (!policy.updatedAt) policy.updatedAt = policy.createdAt;
      if (!Array.isArray(policy.history)) policy.history = [];
      policy.history = policy.history.map(version => ({ ...version, policyVersion: version.policyVersion || `${policy.id}-V${policy.versionNumber}`, name: version.name || policy.name, description: version.description ?? policy.description, status: version.status === "disabled" ? "disabled" : "enabled", operation: policy.operation, operations: [policy.operation], changeReason: version.changeReason || "历史版本迁移", copyUserIds: Array.isArray(version.copyUserIds) ? [...new Set(version.copyUserIds)] : [...policy.copyUserIds] }));
      if (!policy.history.length) policy.history.push({ policyVersion: policy.policyVersion, name: policy.name, description: policy.description, status: "enabled", operation: policy.operation, operations: [policy.operation], changeReason: "历史版本迁移", nodes: clone(policy.nodes), copyUserIds: [...policy.copyUserIds], updatedAt: policy.updatedAt, updatedBy: policy.updatedBy || "系统迁移" });
    });
    data.operations.forEach(item => {
      if (!item.role) item.role = data.users.find(user => user.name === item.user)?.role || "系统管理员";
      if (!item.result) item.result = /失败|阻止|驳回/.test(`${item.action}${item.description}`) ? "失败" : "成功";
    });
    data.identifiers.forEach(identifier => {
      if (identifier.activeApproval && !data.approvals.some(approval => approval.id === identifier.activeApproval.approvalId && (approval.status === "审批中" || ["执行中", "执行失败", "补偿中"].includes(approval.executionStatus)))) identifier.activeApproval = null;
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
    data.approvals.forEach((approval, approvalIndex) => {
      if (!approval.productLine) approval.productLine = data.identifiers.find(identifier => identifier.id === approval.firmwareId || String(approval.version || "").startsWith(`${identifier.id}.`))?.product || "-";
      if (!Array.isArray(approval.tasks) || !approval.tasks.length) {
        const legacyUser = data.users.find(user => user.name === approval.approver);
        approval.tasks = [{
          sequence: 1,
          approverUserId: legacyUser?.userId || "",
          approverNameSnapshot: approval.approver || "-",
          status: approval.status === "已通过" ? "已通过" : approval.status === "已驳回" ? "已驳回" : approval.status === "审批中" ? "审批中" : "已结束",
          startedAt: approval.submitTime || "-",
          deadlineAt: "-",
          completedAt: approval.approveTime || "-",
          replacementHistory: []
        }];
      }
      approval.policyVersion = approval.policyVersion || "LEGACY";
      approval.policyId = approval.policyId || "LEGACY";
      approval.currentTaskIndex = Number.isFinite(Number(approval.currentTaskIndex)) ? Number(approval.currentTaskIndex) : Math.max(0, approval.tasks.findIndex(task => task.status === "审批中"));
      approval.approvalStatus = approval.approvalStatus || approval.status || "审批中";
      approval.executionStatus = approval.executionStatus || (approval.status === "已通过" ? "执行成功" : approval.status === "审批中" ? "未执行" : "不适用");
      approval.instanceNo = approval.instanceNo || `APR-${String(approvalIndex + 1).padStart(4, "0")}`;
      if (!Array.isArray(approval.testReportFiles)) approval.testReportFiles = [];
      if (!Array.isArray(approval.meetingMinutesFiles)) approval.meetingMinutesFiles = [];
      if (!Array.isArray(approval.copyUserIds)) approval.copyUserIds = [];
      if (!Array.isArray(approval.notificationStatus)) approval.notificationStatus = [];
      approval.tasks = approval.tasks.map((task, index) => {
        const { timeoutUnit: _timeoutUnit, timeoutValue: _timeoutValue, timeoutHours: _timeoutHours, ...cleanTask } = task;
        return { ...cleanTask, type: task.type || approvalNodeTypeFor(approval.type, index + 1), deadlineAt: "-" };
      });
    });
    ensureApprovalCenterData(data);
    return data;
  }

  function loadData() {
    let data;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      data = normalizeDatabase(stored ? JSON.parse(stored) : clone(seed));
    } catch (_error) {
      data = normalizeDatabase(clone(seed));
    }
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (_error) { /* local preview remains functional */ }
    return data;
  }

  let db = loadData();
  const runtimeMaterialPreviews = new Map();
  const defaultAuditRange = recentDateRange();
  let state = {
    route: routeFromHash(),
    groups: { device: true, approval: true, logs: true, users: true },
    center: { view: "todo", exceptionScope: "todo", viewerId: db.users.find(user => user.name === "彭冬柏")?.userId || db.users.find(user => user.name === "严国潮")?.userId || "", selectedId: null, detailTab: "business", sort: "priority", autoNext: true, moreFilters: false, filters: centerDefaultFilters() },
    selectedPolicyProductLine: productLines[0],
    selectedPolicyOperation: "",
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
    approvalPolicyPage: 1,
    userPage: 1,
    pageSizes: { firmware: 20, differentialTasks: 20, differentialPackages: 20, modules: 20, operations: 20, approvals: 20, approvalPolicies: 10, users: 20 },
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

  function withdrawalReasonLabel(code) {
    return withdrawalReasonOptions.find(item => item[0] === code)?.[1] || "";
  }

  function withdrawalReasonText(code, note = "") {
    const label = withdrawalReasonLabel(code);
    const detail = code === "other" ? String(note || "").trim() : "";
    return detail ? `${label || "其他"}：${detail}` : label;
  }

  function withdrawalReasonError(code, note = "") {
    if (!code) return "请选择撤回原因";
    if (code === "other" && !String(note || "").trim()) return "选择“其他”时请填写补充说明";
    return "";
  }

  function renderWithdrawalReasonFields(codeField, noteField, code = "", note = "", error = "") {
    const groupName = `${codeField}-group`;
    const showNote = code === "other";
    return `<div class="form-field required withdrawal-reason-field"><label>撤回原因</label><div class="withdrawal-reason-options" role="radiogroup" aria-label="撤回原因">${withdrawalReasonOptions.map(([value, label]) => `<label class="withdrawal-reason-option ${code === value ? "selected" : ""}"><input type="radio" name="${groupName}" data-modal-field="${codeField}" value="${value}" ${code === value ? "checked" : ""}><span>${esc(label)}</span></label>`).join("")}</div>${error}</div><div class="form-field withdrawal-reason-note ${showNote ? "" : "is-hidden"}"><label>补充说明 <span class="optional-label">（选择“其他”时必填）</span></label><textarea class="textarea" data-modal-field="${noteField}" maxlength="300" placeholder="可补充本次撤回的背景和后续安排">${esc(note || "")}</textarea></div>`;
  }

  function approvalCenterPath(approval) {
    return approval?.id ? `#/approvalCenter?approvalId=${encodeURIComponent(approval.id)}` : "#/approvalCenter";
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

  function now() { return formatDateTime(new Date()); }

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
    const reapplyMetadata = state.modal?.reapplySourceId ? { reapplySourceId: state.modal.reapplySourceId, reapplyViewerId: state.modal.reapplyViewerId } : {};
    const eligibility = versionPublishEligibility(identifier, version);
    if (!eligibility.allowed) {
      toast(eligibility.reason, "warning");
      return false;
    }
    if (identifier.activeApproval) {
      if (identifier.activeApproval.type === "publish" && identifier.activeApproval.version === version.version) {
        openApprovalDetail(identifier.activeApproval.approvalId);
        return true;
      }
      toast("当前固件标识已有发布、回滚或下架审批", "warning");
      return false;
    }
    const policy = activeApprovalPolicy(identifier.product, "publish");
    if (!policy) {
      toast("当前产品线未启用正式发布审批方案，暂不能提交正式发布", "warning");
      return false;
    }
    const noteError = appNoteConfigurationError(version.appReleaseNotes, normalizeAppNoteMeta(version.appNoteMeta, version.appReleaseNotes));
    if (noteError) {
      toast(`${noteError.message}，请先编辑版本`, "warning");
      return false;
    }
    const featureError = featureConfigurationError(version.associatedFeatures || [], identifier.product);
    if (featureError) {
      toast(`${featureError}，请先更新功能项配置`, "warning");
      return false;
    }
    state.errors = {};
    state.modal = { type: "publish", version: version.version, reminderPolicy: "", previewLocale: "zh", platformReleaseNotes: version.platformReleaseNotes, testReportFiles: [], ...reapplyMetadata };
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

  function changedAppNoteLocales(before = {}, after = {}) {
    const previous = normalizeAppNotes(before);
    const next = normalizeAppNotes(after);
    return defaultLocaleIds.filter(locale => String(previous[locale] || "").trim() !== String(next[locale] || "").trim());
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

  function activeApprovalDetail() {
    if (state.drawer?.type === "approvalSimulation") return state.drawer;
    if (state.modal?.type === "approvalSimulation") return state.modal;
    return null;
  }

  function openApprovalDetail(approvalId, options = {}) {
    state.modal = null;
    state.drawer = {
      type: "approvalSimulation",
      approvalId,
      ...(options.viewerId ? { viewerId: options.viewerId } : {}),
      ...(options.reminderScope ? { reminderScope: options.reminderScope } : {}),
      ...(options.returnDrawer ? { returnDrawer: clone(options.returnDrawer) } : {})
    };
  }

  function restoreApprovalDetail(approvalId, viewerId) {
    if (state.drawer?.type === "approvalSimulation") {
      state.drawer.approvalId = approvalId;
      state.drawer.viewerId = viewerId;
      state.drawer.viewerPickerOpen = false;
      state.modal = null;
      return;
    }
    openApprovalDetail(approvalId, { viewerId });
  }

  const approvalOperationCatalog = [
    { value: "publish", label: "正常发布" },
    { value: "rollback", label: "版本回滚" },
    { value: "delist", label: "版本下架" }
  ];

  function approvalOperationLabel(value) {
    return approvalOperationCatalog.find(item => item.value === value)?.label || value;
  }

  function approvalPolicyCandidates(productLine) {
    return db.users.filter(user => user.status === "active" && user.lines.includes(productLine));
  }

  function approvalPoliciesForLine(productLine) {
    return db.approvalPolicies.filter(policy => policy.productLine === productLine);
  }

  function policyOperation(policy) {
    return policy?.operation || policy?.operations?.[0] || "";
  }

  function activeApprovalPolicy(productLine, operation) {
    return db.approvalPolicies.find(policy => policy.productLine === productLine && policyOperation(policy) === operation && policy.status !== "disabled") || null;
  }

  function anyApprovalPolicy(productLine, operation) {
    return db.approvalPolicies.find(policy => policy.productLine === productLine && policyOperation(policy) === operation) || null;
  }

  function policyCoverage(productLine, operation) {
    const policy = anyApprovalPolicy(productLine, operation);
    if (!policy) return { status: "unconfigured", label: "未配置", policies: [] };
    if (policy.status === "disabled") return { status: "disabled", label: "已停用", policies: [policy] };
    return { status: "configured", label: `${policy.levelCount} 级串行`, policies: [policy] };
  }

  function formatDateTime(date) {
    const parts = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).formatToParts(date).map(part => [part.type, part.value]));
    return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
  }

  function currentApprovalTask(approval) {
    if (!Array.isArray(approval?.tasks)) return null;
    return approval.tasks.find(task => task.status === "审批中") || null;
  }

  // Formal publish keeps the approved business roles visible in the prototype;
  // custom policies continue to use their configured user role/level label.
  function approvalTaskRoleLabel(approval, task) {
    if (!task) return "通用审批人";
    if (task.type === "projectManager") return "项目经理";
    if (["qualityRepresentative", "qualityEngineer"].includes(task.type)) return "质量工程师";
    if (approval?.type === "publish" && approval.policyId === "POLICY-IPC-FORMAL") {
      if (task.sequence === 1) return "项目经理";
      if (task.sequence === 2) return "质量工程师";
    }
    const user = db.users.find(item => item.userId === task.approverUserId);
    return user?.role || approvalNodeTypeLabel(task.type, task.sequence);
  }

  function approvalViewerOptions(approval) {
    if (!approval) return [];
    const options = [];
    const indexed = new Map();
    const addViewer = ({ user, fallbackId, fallbackName, fallbackRole, relation }) => {
      const userId = user?.userId || fallbackId || "";
      const name = user?.name || fallbackName || "历史用户";
      const viewerId = userId || `viewer:${name}`;
      let option = indexed.get(viewerId);
      if (!option) {
        option = {
          viewerId,
          userId,
          name,
          role: fallbackRole || user?.role || "平台用户",
          status: user?.status || "active",
          relationships: []
        };
        indexed.set(viewerId, option);
        options.push(option);
      }
      if (relation && !option.relationships.some(item => item.kind === relation.kind && item.sequence === relation.sequence)) option.relationships.push(relation);
    };

    const submitterUser = db.users.find(user => user.name === approval.submitter);
    addViewer({
      user: submitterUser,
      fallbackId: `submitter:${approval.submitter || "unknown"}`,
      fallbackName: approval.submitter || "历史发起人",
      fallbackRole: approval.submitter === "汤彦珊" ? "系统管理员" : "发布申请人",
      relation: { kind: "submitter", label: "发起人" }
    });

    (approval.tasks || []).forEach(task => taskPeople(task).forEach(person => {
      const user = db.users.find(item => item.userId === person.userId) || db.users.find(item => item.name === person.name);
      const taskRole = approvalTaskRoleLabel(approval, task);
      addViewer({
        user,
        fallbackId: person.userId || `task:${task.sequence}:${person.name}`,
        fallbackName: person.name,
        fallbackRole: taskRole,
        relation: { kind: "approver", sequence: task.sequence, label: `${taskRole} · 第 ${task.sequence} 级`, status: task.status }
      });
    }));

    (approval.copyUserIds || []).forEach(userId => {
      const user = db.users.find(item => item.userId === userId);
      addViewer({ user, fallbackId: userId, fallbackName: userId, fallbackRole: "平台用户", relation: { kind: "copy", label: "结果抄送人" } });
    });

    const administrator = db.users.find(user => user.role === "系统管理员" && user.status === "active" && user.name !== approval.submitter)
      || db.users.find(user => user.role === "系统管理员" && user.status === "active");
    if (administrator) addViewer({ user: administrator, relation: { kind: "administrator", label: "系统管理员" } });
    return options;
  }

  function approvalViewerContext(approval, requestedViewerId) {
    const options = approvalViewerOptions(approval);
    const requestedSubmitter = String(requestedViewerId || "").startsWith("submitter:")
      ? options.find(option => option.name === requestedViewerId.slice("submitter:".length) && option.relationships.some(item => item.kind === "submitter"))
      : null;
    const viewer = options.find(option => option.viewerId === requestedViewerId)
      || requestedSubmitter
      || (requestedViewerId ? { ...(db.users.find(user => user.userId === requestedViewerId) || {}), viewerId: requestedViewerId, relationships: [] } : null)
      || options.find(option => option.relationships.some(item => item.kind === "submitter"))
      || options[0]
      || { viewerId: "", userId: "", name: "未知用户", role: "平台用户", relationships: [] };
    const activeTask = currentApprovalTask(approval);
    const matchesTask = task => Boolean(task) && taskPeople(task).some(person => (viewer.userId && person.userId === viewer.userId) || (!person.userId && person.name === viewer.name));

    const isSubmitter = viewer.relationships.some(item => item.kind === "submitter");
    const isAdmin = viewer.role === "系统管理员" || viewer.relationships.some(item => item.kind === "administrator");
    const isTaskApprover = (approval?.tasks || []).some(matchesTask);
    const isCurrentApprover = viewer.status === "active" && approval?.approvalStatus === "审批中" && activeTask?.status === "审批中" && matchesTask(activeTask);
    const isCopyUser = viewer.relationships.some(item => item.kind === "copy");
    const canDecide = isCurrentApprover && !isSubmitter;
    const canUploadMinutes = canDecide && approval?.type === "publish" && activeTask?.sequence === 1;
    const canRemind = approval?.approvalStatus === "审批中" && activeTask?.status === "审批中" && (isSubmitter || isAdmin);
    return {
      options,
      viewer,
      activeTask,
      isSubmitter,
      isAdmin,
      isTaskApprover,
      isCurrentApprover,
      isCopyUser,
      canWithdraw: isSubmitter && approval?.approvalStatus === "审批中",
      canDecide,
      canUploadMinutes,
      canRemind,
      canSimulateTimeout: false
    };
  }

  function approvalViewerPermissionMessage(approval, context) {
    if (context.canUploadMinutes) return `你是当前${approvalTaskRoleLabel(approval, context.activeTask)}（第 1 级审批人），需先上传会议纪要，再完成本节点审批。`;
    if (context.canDecide) return "你是当前审批人，可审批通过或驳回；会议纪要已转为只读审计材料。";
    if (context.canWithdraw && context.canRemind) return "你是本次申请的发起人，可催办当前审批人或撤回申请，但不能审批自己的申请。";
    if (context.canWithdraw) return "你是本次申请的发起人，可撤回申请，但催办仅在审批中心“我发起的”提供。";
    if (context.canRemind && context.isAdmin && !context.isSubmitter) return "系统管理员仅在后台异常场景代发当前节点催办；审批结果仍以平台处理为准。";
    if (context.canRemind) return "你是本次申请的发起人，可在“我发起的”催办当前审批人；审批结果仍以平台处理为准。";
    if (context.isCopyUser && approval?.approvalStatus !== "审批中") return "你是本次审批的结果抄送人，可查看终态结果、审计材料和审批流转。";
    if (context.isCopyUser) return "你是结果抄送人，当前可只读查看进度，审批终态产生后将收到结果通知。";
    if (context.isTaskApprover) return "当前尚未轮到你处理，或你负责的节点已完成；当前详情为只读状态。";
    if (context.isAdmin && context.isSubmitter) return "你是本次申请的发起人；即使同时具备管理员角色，也不能审批或处置自己的申请。";
    return "当前账号仅可查看本次审批详情，无可执行操作。";
  }

  function renderApprovalViewerSwitch(approval, modal, context) {
    const viewer = context.viewer;
    const relationshipTags = viewer.relationships.map(item => `<span>${esc(item.label)}</span>`).join("");
    const optionRows = context.options.map(option => {
      const selected = option.viewerId === viewer.viewerId;
      const labels = option.relationships.map(item => item.label).join("·");
      return `<button type="button" class="approval-viewer-option ${selected ? "selected" : ""}" data-action="select-approval-viewer" data-viewer-id="${esc(option.viewerId)}" role="option" aria-selected="${selected}"><span class="approval-viewer-avatar">${esc(String(option.name || "用").slice(0, 1))}</span><span><strong>${esc(option.name)}</strong><small>${esc(option.role)} · ${esc(option.userId || "虚拟账号")}</small><em>${esc(labels)}</em></span>${selected ? `<i aria-hidden="true">✓</i>` : ""}</button>`;
    }).join("");
    return `<section class="approval-viewer-bar"><div class="approval-viewer-current"><span class="approval-viewer-avatar">${esc(String(viewer.name || "用").slice(0, 1))}</span><div><small>当前模拟账号</small><strong>${esc(viewer.name)} <em>${esc(viewer.role)}</em></strong><div class="approval-viewer-relations">${relationshipTags}</div></div></div><div class="approval-viewer-switch ${modal.viewerPickerOpen ? "open" : ""}"><button type="button" class="btn approval-viewer-trigger" data-action="toggle-approval-viewer" aria-haspopup="listbox" aria-expanded="${Boolean(modal.viewerPickerOpen)}">切换模拟账号 <span aria-hidden="true">⌄</span></button>${modal.viewerPickerOpen ? `<div class="approval-viewer-popover" role="listbox"><div class="approval-viewer-popover-head"><strong>选择查看身份</strong><span>切换后仅改变可见内容与可操作范围</span></div><div class="approval-viewer-options">${optionRows}</div></div>` : ""}</div><div class="approval-viewer-permission"><strong>身份权限</strong><span>${esc(approvalViewerPermissionMessage(approval, context))}</span></div></section>`;
  }

  function approvalNodeTypeFor(operation, sequence) {
    return "generic";
  }

  function approvalNodeTypeLabel(type, sequence = 0) {
    if (type === "projectManager") return "项目经理";
    if (type === "qualityRepresentative") return "质量代表";
    return sequence ? `第 ${sequence} 级审批人` : "通用审批人";
  }

  function materialFileSnapshot(file) {
    const id = releaseId("MAT");
    const name = String(file.name || "文件");
    const type = String(file.type || "");
    if (file && typeof URL !== "undefined" && typeof URL.createObjectURL === "function") {
      try { runtimeMaterialPreviews.set(id, { url: URL.createObjectURL(file), type, name }); } catch (_error) { /* preview remains metadata-only */ }
    }
    return { id, name, size: Number(file.size || 0), sizeMb: (Number(file.size || 0) / 1024 / 1024).toFixed(2), type, uploadedAt: now() };
  }

  function materialValidation(files, rule) {
    const list = Array.isArray(files) ? files : [];
    if (list.length > rule.maxFiles) return `${rule.label}最多上传 ${rule.maxFiles} 个文件`;
    for (const file of list) {
      const extension = String(file.name || "").split(".").pop()?.toLowerCase() || "";
      if (!rule.extensions.includes(extension)) return `${rule.label}仅支持 ${rule.extensions.map(item => `.${item}`).join("、")} 格式`;
      if (Number(file.size || 0) > rule.maxSizeMb * 1024 * 1024) return `${rule.label}单个文件不能超过 ${rule.maxSizeMb} MB`;
    }
    return "";
  }

  function materialListLabel(files) {
    return Array.isArray(files) && files.length ? files.map(file => file.name).join("、") : "未上传";
  }

  function approvalDisplayApprover(approval) {
    if (!Array.isArray(approval.tasks)) return approval.approver || "-";
    const currentTask = currentApprovalTask(approval);
    if (currentTask) return `${currentTask.approverNameSnapshot}（${approvalTaskRoleLabel(approval, currentTask)}）`;
    const handled = approval.tasks.filter(task => ["已通过", "已驳回"].includes(task.status));
    return handled.length ? handled.map(task => task.approverNameSnapshot).join(" → ") : approval.approver || "-";
  }

  function normalizeApprovalPolicyDraftNodes(draft) {
    let nodes = Array.isArray(draft.nodes) ? draft.nodes.slice(0, 5) : [];
    if (!nodes.length) nodes.push({ sequence: 1, type: "generic", approverUserId: "", approverName: "" });
    draft.nodes = nodes.map((node, index) => {
      const { timeoutUnit: _timeoutUnit, timeoutValue: _timeoutValue, timeoutHours: _timeoutHours, ...cleanNode } = node;
      return {
        ...cleanNode,
        sequence: index + 1,
        type: "generic",
        approverUserIds: nodeApproverIds(node)
      };
    });
    draft.levelCount = draft.nodes.length;
    return draft.nodes;
  }

  function clearApprovalPolicyNodeErrors() {
    Object.keys(state.errors).forEach(key => {
      if (key === "policyNodes" || key.startsWith("policyNode")) delete state.errors[key];
    });
  }

  function markApprovalPolicyDirty() {
    if (state.drawer?.type !== "approvalPolicy") return;
    state.drawer.dirty = true;
    const saveButton = app.querySelector('[data-action="save-approval-policy"]');
    if (saveButton) saveButton.disabled = false;
    const version = app.querySelector("[data-policy-version]");
    if (version && state.drawer.policyId && !version.textContent.includes("有未保存修改")) version.textContent += " · 有未保存修改";
  }

  function approvalPolicyNodeIssue(policy) {
    if (!String(policy?.name || "").trim()) return "未填写审批方案名称";
    if (!Array.isArray(policy?.operations) || !policy.operations.length) return "未配置审批操作范围";
    const nodes = Array.isArray(policy?.nodes) ? policy.nodes : [];
    if (!nodes.length || nodes.length > 5) return "审批节点数量须为 1–5 级";
    const seen = new Set();
    for (const node of nodes) {
      const ids = nodeApproverIds(node);
      if (!ids.length) return "每级至少选择一位审批人";
      for (const id of ids) {
        const user = db.users.find(item => item.userId === id);
        if (!user || user.status !== "active" || !user.lines.includes(policy.productLine)) return "存在已停用或不属于该产品线的审批人";
        if (seen.has(id)) return "同一审批人不能跨节点重复配置";
        seen.add(id);
      }
    }

    return "";
  }

  function saveApprovalPolicy() {
    const drawer = state.drawer;
    if (drawer?.type !== "approvalPolicy") return false;
    const draft = drawer.policyDraft;
    state.errors = {};
    const nodes = normalizeApprovalPolicyDraftNodes(draft);
    const existing = drawer.policyId ? db.approvalPolicies.find(policy => policy.id === drawer.policyId) : null;
    let savedPolicy = existing;
    if (existing && !drawer.dirty) {
      toast("未检测到审批方案变更", "warning");
      return false;
    }
    draft.name = String(draft.name || "").trim();
    if (!draft.name) state.errors.policyName = "请输入审批方案名称";
    if (String(draft.description || "").length > 200) state.errors.policyDescription = "方案说明不能超过 200 个字符";
    draft.operation = draft.operation || draft.operations?.[0] || "";
    draft.operations = draft.operation ? [draft.operation] : [];
    if (!approvalOperationCatalog.some(item => item.value === draft.operation)) state.errors.policyOperations = "未确定审批操作";
    const duplicatePolicy = db.approvalPolicies.find(policy => policy.id !== existing?.id && policy.productLine === draft.productLine && policyOperation(policy) === draft.operation);
    if (duplicatePolicy) state.errors.policyOperations = `该产品线的${approvalOperationLabel(draft.operation)}已有审批方案，请编辑现有方案`;
    if (!nodes.length || nodes.length > 5) state.errors.policyNodes = "审批节点数量须为 1–5 级";
    const changeReason = String(draft.changeReason || "").trim();
    if (existing && !changeReason) state.errors.policyChangeReason = "请填写本次版本变更说明";
    const configuredApprovers = new Map();
    nodes.forEach((node, index) => {
      const ids = nodeApproverIds(node);
      if (!ids.length) state.errors[`policyNode${index}`] = "每级至少选择一位启用平台用户";
      ids.forEach(id => {
        const user = db.users.find(item => item.userId === id);
        if (!user || user.status !== "active" || !user.lines.includes(draft.productLine)) state.errors[`policyNode${index}`] = "请选择该产品线下的启用平台用户";
        if (configuredApprovers.has(id)) {
          state.errors[`policyNode${configuredApprovers.get(id)}`] = "同一审批人不能跨节点重复";
          state.errors[`policyNode${index}`] = "同一审批人不能跨节点重复";
        } else configuredApprovers.set(id, index);
      });
    });

    if (Object.keys(state.errors).length) {
      renderShell();
      return false;
    }
    const stamp = now();
    const resolvedNodes = nodes.map((node, index) => {
      return setNodeApprovers({ sequence: index + 1, type: "generic" }, nodeApproverIds(node));
    });

    if (existing) {
      existing.versionNumber = Number(existing.versionNumber || 1) + 1;
      Object.assign(existing, {
        name: draft.name,
        description: String(draft.description || "").trim(),
        operation: draft.operation,
        operations: [draft.operation],
        levelCount: draft.levelCount,
        nodes: resolvedNodes,
        copyUserIds: [...new Set(draft.copyUserIds || [])],
        status: "enabled",
        policyVersion: `${existing.id}-V${existing.versionNumber}`,
        updatedAt: stamp,
        updatedBy: "汤彦珊"
      });
      existing.history.unshift({ policyVersion: existing.policyVersion, name: existing.name, description: existing.description, status: existing.status, operation: existing.operation, operations: [existing.operation], nodes: clone(existing.nodes), copyUserIds: clone(existing.copyUserIds), changeReason, updatedAt: stamp, updatedBy: "汤彦珊" });
      addOperation("审批配置", "更新", existing.name, "汤彦珊", "成功", `${existing.policyVersion}；${approvalOperationLabel(existing.operation)}；${changeReason}`);
    } else {
      const id = releaseId(`POLICY-${draft.productLine}`);
      const policy = {
        id,
        productLine: draft.productLine,
        name: draft.name,
        description: String(draft.description || "").trim(),
        operation: draft.operation,
        operations: [draft.operation],
        levelCount: draft.levelCount,
        nodes: resolvedNodes,
        copyUserIds: [...new Set(draft.copyUserIds || [])],
        status: "enabled",
        versionNumber: 1,
        policyVersion: `${id}-V1`,
        createdAt: stamp,
        updatedAt: stamp,
        updatedBy: "汤彦珊",
        history: []
      };
      policy.history.push({ policyVersion: policy.policyVersion, name: policy.name, description: policy.description, status: policy.status, operation: policy.operation, operations: [policy.operation], nodes: clone(policy.nodes), copyUserIds: clone(policy.copyUserIds), changeReason: changeReason || "首次配置", updatedAt: stamp, updatedBy: "汤彦珊" });
      db.approvalPolicies.unshift(policy);
      savedPolicy = policy;
      addOperation("审批配置", "新增", policy.name, "汤彦珊", "成功", `${policy.policyVersion}；${approvalOperationLabel(policy.operation)}；首次配置`);
    }
    persist();
    state.drawer = null;
    state.modal = {
      type: "approvalPolicySaved",
      policyId: savedPolicy?.id || "",
      policyVersion: savedPolicy?.policyVersion || "",
      status: savedPolicy?.status === "disabled" ? "disabled" : "enabled",
      operation: savedPolicy?.operation || draft.operation
    };
    renderShell();
    return true;
  }

  function addOperation(module, action, resource, user = "汤彦珊", result = "成功", description = "") {
    const role = db.users.find(item => item.name === user)?.role || "系统管理员";
    db.operations.unshift({ time: now(), user, role, module, action, resource, result, description: description || `${action}${module}: [${resource}]` });
  }

  function recordApprovalNotification(approval, event, recipients = [], result = "sent", metadata = {}) {
    if (!approval) return;
    const names = [...new Set(recipients.filter(Boolean))];
    if (!names.length) return;
    const notification = { id: releaseId("NTF"), approvalId: approval.id, instanceNo: approval.instanceNo, event, channel: "钉钉", recipients: names, result, time: now(), taskSequence: currentApprovalTask(approval)?.sequence || null, ...metadata, platformPath: approvalCenterPath(approval) };
    db.notifications.unshift(notification);
    approval.notificationStatus = Array.isArray(approval.notificationStatus) ? approval.notificationStatus : [];
    approval.notificationStatus.unshift(clone(notification));
    return notification;
  }

  function terminalApprovalRecipients(approval) {
    const users = new Set([approval.submitter, ...(approval.copyUserIds || []).map(userId => db.users.find(user => user.userId === userId)?.name)].filter(Boolean));
    return [...users];
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
      "产线主管": [...firmwareRead, "编辑固件标识", "发布固件版本", "回滚固件版本", "下架当前发布版本", "维护APP更新说明", "查看审批中心", "处理当前审批", "撤回我的审批", "查看异常中心", "查看操作日志", "查看审批日志"],
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
    const itemMarkup = items.map(([route, text]) => {
      const hasTodo = route === "approvalCenter" && centerHasTodo();
      return `<button class="menu-item ${state.route === route ? "active" : ""}" data-route="${route}"><span>${text}</span>${hasTodo ? '<i class="menu-item-unread" aria-label="有待处理审批"></i>' : ""}</button>`;
    }).join("");
    return `<div class="menu-group ${open ? "is-open" : ""}"><button class="menu-group-title" data-action="toggle-group" data-group="${group}" aria-expanded="${open}"><span class="group-icon">${symbol}</span><span>${label}</span><span class="chevron">⌃</span></button><div class="menu-items">${itemMarkup}</div></div>`;
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
    const topbarPolicyLine = state.route === "approvalPolicies"
      ? `<div class="topbar-policy-line"><span>当前产品线：</span><select class="topbar-policy-select" data-change="approval-top-product-line" aria-label="当前产品线">${productLines.map(line => `<option value="${esc(line)}" ${line === (state.selectedPolicyProductLine || productLines[0]) ? "selected" : ""}>${esc(line)}</option>`).join("")}</select></div>`
      : "";
    app.innerHTML = `<div class="app-shell">
      <header class="topbar">
        <button class="nav-toggle" data-action="toggle-nav" aria-label="展开菜单">☰</button>
        <div class="brand"><img src="assets/logo.png" alt="固件发布平台标志"><span>固件发布平台</span></div>
        <div class="topbar-spacer"></div>
        ${topbarPolicyLine}
        <label class="topbar-search"><span aria-hidden="true">⌕</span><input type="search" placeholder="搜索功能、产品、版本号..." aria-label="搜索功能、产品、版本号"></label>
        <button class="topbar-icon" type="button" aria-label="查看审批待办" data-route="approvalCenter"><span>♧</span><i>${centerRows("todo", false).length}</i></button>
        <button class="topbar-icon" type="button" aria-label="帮助">?</button>
        <span class="topbar-divider" aria-hidden="true"></span>
        <button class="profile-trigger" data-action="toggle-profile"><img src="assets/avatar.jpg" alt="当前账号头像"><span>${state.route === "approvalCenter" ? esc(centerIdentity().name) : "张三"}</span><b aria-hidden="true">⌄</b></button>
      </header>
      ${state.profileOpen ? `<div class="profile-menu"><button data-action="profile">个人设置</button><button data-action="logout">退出登录</button></div>` : ""}
      <aside class="sidebar" aria-label="固件发布平台导航">
        ${menuGroup("device", "设备固件", "◆", [["firmware", "固件列表"], ["modules", "模组型号"]])}
        ${menuGroup("approval", "审批工作台", "✓", [["approvalCenter", "审批中心"]])}
        ${menuGroup("logs", "日志管理", "▣", [["operations", "操作日志"], ["approvals", "审批日志"]])}
        ${menuGroup("users", "系统管理", "◆", [["users", "用户列表"], ["roles", "角色权限"], ["approvalPolicies", "审批配置"]])}
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
    positionFeaturePickerFloating();
  }

  function positionFeaturePickerFloating() {
    if (state.modal?.type !== "featurePicker") return;
    const featureId = state.modal.versionOpen || state.modal.infoOpen;
    if (!featureId) return;
    const floating = app.querySelector(`[data-floating-menu][data-feature-id="${CSS.escape(featureId)}"]`);
    const anchor = app.querySelector(`[data-action="${state.modal.versionOpen ? "toggle-feature-version-menu" : "toggle-feature-version-info"}"][data-feature-id="${CSS.escape(featureId)}"]`);
    if (!floating || !anchor) return;
    const anchorRect = anchor.getBoundingClientRect();
    const floatingRect = floating.getBoundingClientRect();
    const modalRect = app.querySelector(".modal.feature-modal")?.getBoundingClientRect();
    const gap = 6;
    const margin = 12;
    let left = anchorRect.left;
    if (left + floatingRect.width > window.innerWidth - margin) left = window.innerWidth - floatingRect.width - margin;
    left = Math.max(margin, left);
    let top = anchorRect.bottom + gap;
    if (top + floatingRect.height > window.innerHeight - margin) top = Math.max(margin, anchorRect.top - floatingRect.height - gap);
    const originLeft = modalRect?.left || 0;
    const originTop = modalRect?.top || 0;
    floating.style.left = `${left - originLeft}px`;
    floating.style.top = `${top - originTop}px`;
    if (state.modal.versionOpen) floating.style.minWidth = `${Math.max(anchorRect.width, 300)}px`;
  }

  function renderPage() {
    if (state.route === "firmware") return renderFirmware();
    if (state.route === "modules") return renderModules();
    if (state.route === "operations") return renderOperations();
    if (state.route === "approvals") return renderApprovals();
    if (state.route === "approvalCenter") return renderApprovalCenter();
    if (state.route === "users") return renderUsers();
    if (state.route === "roles") return renderRoles();
    return renderApprovalPolicies();
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
    const pendingTask = currentApprovalTask(pendingApproval);
    return `<section class="page tint-page">
      ${header}
      <div class="firmware-layout ${selected.product === "4G模组" && state.firmwareTab !== "firmware" ? "differential-layout" : ""}">
        <aside class="identifier-panel"><h2 class="panel-heading">固件管理</h2><div class="panel-action-with-rule"><button class="btn panel-action" data-action="add-identifier">⊕ 新增标识</button>${ruleAnnotation("identifier", "FID-R01")}</div><div class="identifier-list">${identifiers.map(item => `<button class="identifier-item ${item.id === selected.id ? "active" : ""}" data-action="select-identifier" data-id="${esc(item.id)}">${esc(item.id)}</button>`).join("") || `<div class="muted" style="padding:16px">无匹配标识</div>`}</div></aside>
        <div class="firmware-main ${selected.product === "4G模组" && state.firmwareTab !== "firmware" ? "differential-main" : ""}">
          <div class="summary-band ${selected.product === "4G模组" ? "four-g-summary" : ""}"><div class="summary-head"><div class="module-title-row"><h2>${esc(selected.id)}</h2></div><div class="summary-actions"><button class="btn small" data-action="refresh">↻ 刷新</button><div class="action-with-rules"><div class="popover-wrap"><button class="btn small" data-action="identifier-actions" aria-expanded="${state.popover === "identifier"}">••• 更多</button>${state.popover === "identifier" ? `<div class="action-popover compact-popover"><button data-action="edit-identifier">编辑</button><button class="danger-item" data-action="delete-identifier">删除</button></div>` : ""}</div>${ruleAnnotation("identifier", "FID-R02")}</div></div></div>${renderIdentifierMeta(selected)}</div>
          ${pendingApproval ? `<div class="approval-banner ${pendingApproval.executionStatus === "执行失败" ? "execution-failed" : ""}"><div><strong>${pendingApproval.executionStatus === "执行失败" ? `${approvalOperationLabel(pendingApproval.type)}执行失败` : `等待${approvalTaskRoleLabel(pendingApproval, pendingTask)}处理`}</strong><span>${esc(pendingApproval.version)} · ${pendingApproval.executionStatus === "执行失败" ? "执行未完成，须重新发起审批" : `${esc(pendingTask?.approverNameSnapshot || pendingApproval.approver)} · 发起人可在审批中心按需催办`} · ${esc(pendingApproval.submitTime)}</span></div><button class="btn small primary" data-action="view-active-approval">${pendingApproval.executionStatus === "执行失败" ? "处理异常" : "查看审批"}</button></div>` : ""}
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
    return ({ approval: "平台审批", release: "发布生效", rollback: "回滚生效", delist: "下架生效", cache: "升级检查" })[stage] || stage;
  }

  function lifecycleResultLabel(result) {
    return ({ success: "成功", active: "当前生效", partial: "部分失败", failed: "失败", rejected: "已驳回", withdrawn: "已撤回", skipped: "不发送" })[result] || result;
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
    return ({ active: "当前生效", superseded: "历史发布", pending: "审批中", rejected: "已驳回", withdrawn: "已撤回", failed: "发布失败", execution_failed: "执行失败", rolled_back: "已回滚", delisted: "已下架", completed: "已完成" })[status] || status;
  }

  function lifecycleFlowStatusClass(status) {
    return status === "active" || status === "completed" ? "success" : status === "rejected" || status === "failed" || status === "execution_failed" || status === "rolled_back" || status === "delisted" ? "danger" : "blue";
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
      if (["rejected", "failed", "execution_failed"].includes(status)) group.exceptionCount += 1;
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
      const approvalLabel = approvalEvents.some(event => event.result === "withdrawn") ? "已撤回" : approvalEvents.some(event => event.result === "rejected") ? "已驳回" : approvalEvents.some(event => event.title.includes("通过")) ? "已通过" : approvalEvents.length ? "审批中" : "无记录";
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
    const labels = { url: "下载地址", size: "文件大小（M）", models: "适用机型", devices: "关联设备数", features: "功能项数", creator: "创建人", note: "平台发布说明", updated: "更新时间" };
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
    const headers = [`<th style="width:150px">固件版本号</th>`, columns.url && `<th style="width:230px">下载地址</th>`, columns.size && `<th style="width:105px">文件大小（M）</th>`, columns.models && `<th style="width:125px">适用机型</th>`, columns.devices && `<th style="width:145px" title="符合该版本适用机型的绑定设备数"><span class="table-rule-header">关联设备数${ruleAnnotation("identifier", "FID-R04")}</span></th>`, columns.features && `<th style="width:90px">功能项数</th>`, columns.creator && `<th style="width:120px">创建人</th>`, columns.note && `<th style="width:190px">平台发布说明</th>`, columns.updated && `<th style="width:170px">更新时间</th>`, `<th style="width:220px"><span class="table-rule-header table-operation-rules">操作${ruleAnnotations([["detail", "DET-R03"], ["publish", "PUB-R01"], ["publish", "PUB-R02"], ["version", "VER-R05"], ["version", "VER-R08"]])}</span></th>`].filter(Boolean).join("");
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

  // Approval center shares policy snapshots and mutations with firmware approval details.
  function nodeApproverIds(node) {
    return [...new Set(Array.isArray(node?.approverUserIds) ? node.approverUserIds : [node?.approverUserId].filter(Boolean))];
  }

  function setNodeApprovers(node, ids, data = db) {
    node.approverUserIds = [...new Set(ids)];
    node.approverNames = node.approverUserIds.map(id => data.users.find(user => user.userId === id)?.name || id);
    node.approverUserId = node.approverUserIds[0] || "";
    node.approverName = node.approverNames.join("、");
    node.decisionMode = "OR";
    return node;
  }

  function taskPeople(task, data = db) {
    if (!task) return [];
    if (Array.isArray(task.approvers) && task.approvers.length) return task.approvers;
    const ids = nodeApproverIds(task);
    return ids.length ? ids.map(id => ({ userId: id, name: data.users.find(user => user.userId === id)?.name || task.approverNameSnapshot || id })) : [{ userId: "", name: task.approverNameSnapshot || "历史审批人" }];
  }

  function taskNames(task) { return taskPeople(task).map(person => person.name); }
  function approvalInstant(value) { return value && value !== "-" ? Date.parse(`${String(value).replace(" ", "T")}+08:00`) : NaN; }
  function centerUser(viewerId) {
    return db.users.find(user => user.userId === viewerId) || (viewerId === "submitter:汤彦珊"
      ? { userId: viewerId, name: "汤彦珊", role: "发起人", status: "active", lines: productLines }
      : { userId: viewerId, name: "未知用户", role: "", status: "disabled", lines: [] });
  }
  function centerIdentity() { return centerUser(state.center.viewerId); }
  function centerIsAdmin(user = centerIdentity()) { return user.status === "active" && (user.role === "系统管理员" || db.roles.find(role => role.name === user.role)?.code === "SYSTEM_ADMIN"); }
  function centerOperationAllowed(approval, user = centerIdentity()) {
    if (user.status !== "active" || !(user.lines || []).includes(approval.productLine)) return false;
    if (approval.submitter === user.name) return true;
    const action = { publish: "发布固件版本", rollback: "回滚固件版本", delist: "下架当前发布版本" }[approval.type];
    const permissions = db.roles.find(role => role.name === user.role)?.permissions || {};
    return permissions["page-固件列表"] === true && permissions[`action-${action}`] === true;
  }
  function centerContext(approval) { return approvalViewerContext(approval, state.center.viewerId); }
  const manualReminderCooldownMinutes = 30;
  function approvalReminderState(approval) {
    const task = currentApprovalTask(approval);
    if (!task || approval?.approvalStatus !== "审批中") return { task: null, allowed: false, remainingMinutes: 0 };
    const lastAt = approvalInstant(task.lastReminderAt);
    const elapsed = Number.isFinite(lastAt) ? (Date.now() - lastAt) / 60000 : Infinity;
    const remainingMinutes = Math.max(0, Math.ceil(manualReminderCooldownMinutes - elapsed));
    return { task, allowed: remainingMinutes === 0, remainingMinutes };
  }
  function sendApprovalReminder(approval, actorName) {
    const reminder = approvalReminderState(approval);
    if (!reminder.task) return { ok: false, message: "当前没有可催办的审批节点" };
    if (!reminder.allowed) return { ok: false, message: `请 ${reminder.remainingMinutes} 分钟后再催办` };
    const recipients = taskNames(reminder.task);
    if (!recipients.length) return { ok: false, message: "当前节点没有待通知的审批人" };
    const stamp = now();
    reminder.task.lastReminderAt = stamp;
    reminder.task.lastReminderBy = actorName;
    reminder.task.reminderCount = Number(reminder.task.reminderCount || 0) + 1;
    recordApprovalNotification(approval, `人工催办：第 ${reminder.task.sequence} 级审批`, recipients, "sent", { kind: "manual_reminder", actor: actorName, taskSequence: reminder.task.sequence });
    addOperation("审批通知", "催办当前节点", approval.instanceNo || approval.id, actorName, "成功", `已向 ${recipients.join("、")} 发送钉钉催办通知`);
    persist();
    return { ok: true, recipients, remainingMinutes: manualReminderCooldownMinutes };
  }
  function centerCanRemind(approval, user = centerIdentity()) {
    if (!approval || approval.approvalStatus !== "审批中" || !centerReadable(approval)) return false;
    return approval.submitter === user.name || centerIsAdmin(user);
  }
  // The approval center only exposes manual reminders from the submitter's own queue.
  // Keep centerCanRemind as the permission check so privileged back-end paths remain
  // available, while reviewer, copy and exception queues stay focused on their work.
  function centerCanShowReminder(approval, view = state.center.view, user = centerIdentity()) {
    return view === "mine" && centerCanRemind(approval, user);
  }
  function renderCenterReminderAction(approval, placement = "inline") {
    if (!centerCanShowReminder(approval)) return "";
    const reminder = approvalReminderState(approval);
    const label = reminder.allowed ? "催办" : `已催办 · ${reminder.remainingMinutes} 分钟后可再次催办`;
    return `<button type="button" class="ac-remind-action ${placement}" data-action="center-remind" data-approval-id="${esc(approval.id)}" ${reminder.allowed ? "" : "disabled"} title="${reminder.allowed ? "再次通知当前节点未处理审批人" : label}">${label}</button>`;
  }
  function centerReadable(approval) {
    const user = centerIdentity();
    if (user.status !== "active") return false;
    const inProductLine = (user.lines || []).includes(approval.productLine);
    // A submitter must retain read/withdraw access to their own in-flight and
    // historical approvals even after a product-line scope change. Approver,
    // copy and administrator access remains subject to the current scope.
    return approval.submitter === user.name
      || centerIsAdmin(user)
      || (inProductLine && ((approval.tasks || []).some(task => taskPeople(task).some(person => person.userId === user.userId)) || (approval.copyUserIds || []).includes(user.userId)));
  }
  function centerBusinessException(approval) {
    if (approval.executionStatus === "执行失败") return { key: "execution", label: "执行失败", reason: approval.executionMessage || "业务执行未完成，旧审批不可重试。" };
    if (approval.approvalStatus === "已失效") return { key: "invalid", label: "已失效", reason: approval.terminalReason || "执行前校验未通过，本次操作未执行。" };
    return null;
  }
  function centerRelatedReapplication(approval) {
    return db.approvals.find(item => item.relatedApprovalId === approval.id)
      || (approval.relatedApprovalIds || []).map(id => approvalById(id)).find(Boolean);
  }
  function centerCanReapply(approval, user = centerIdentity()) {
    return Boolean(approval) && (approval.executionStatus === "执行失败" || ["已失效", "已撤回", "已驳回"].includes(approval.approvalStatus))
      && !centerRelatedReapplication(approval) && centerOperationAllowed(approval, user) && !centerReapplyPolicyIssue(approval, user) && (approval.submitter === user.name || centerIsAdmin(user));
  }
  function centerFailedNotifications(approval, pendingOnly = false) {
    return (approval.notificationStatus || []).filter(item => item.result === "failed" && (!pendingOnly || !(approval.notificationStatus || []).some(retry => retry.retryOf === item.id && ["sent", "read"].includes(retry.result))));
  }
  function centerCanResend(approval, user = centerIdentity()) {
    const permissions = db.roles.find(role => role.name === user.role)?.permissions || {};
    return centerIsAdmin(user) && (user.lines || []).includes(approval.productLine) && permissions["page-审批中心"] === true
      && permissions["action-查看异常中心"] === true && centerFailedNotifications(approval, true).length > 0;
  }
  function centerExceptions(approval) {
    const business = centerBusinessException(approval), related = centerRelatedReapplication(approval);
    const result = business ? [{ ...business, pending: !related, canHandle: centerCanReapply(approval), owner: "原发起人 / 具备对应操作权限的管理员", next: related ? `已关联新申请 ${related.instanceNo || related.id}，请跟进新申请结果` : (centerReapplyPolicyIssue(approval) || "继续该操作时，重新核对并发起申请") }] : [];
    const failed = centerFailedNotifications(approval), pending = centerFailedNotifications(approval, true);
    if (failed.length) result.push({ key: "notification", label: "通知发送失败", reason: pending.length ? `${pending.length} 条通知尚未补发；审批和执行结果不受影响。` : "失败通知已补发，原失败记录保留。", pending: pending.length > 0, canHandle: centerCanResend(approval), owner: "系统管理员", next: pending.length ? "按当前审批进度补发有效通知" : "已补发，无需再次处理" });
    return result;
  }
  function centerHasException(approval) { return Boolean(centerBusinessException(approval)) || centerFailedNotifications(approval).length > 0; }
  function centerHasActionableException(approval) { return centerExceptions(approval).some(item => item.pending && item.canHandle); }
  function renderCenterExceptionSummary(approval, compact = false) {
    const exceptions = centerExceptions(approval);
    if (!exceptions.length) return "";
    if (compact) return `<div class="ac-row-exception">${exceptions.map(item => `<span class="ac-exception-label ${item.pending ? "" : "handled"}">${esc(item.label)}</span>`).join("")}<small>${esc(exceptions.filter(item => item.pending).map(item => `待${item.owner}跟进`).join("；") || "已跟进 · 历史异常保留")}</small></div>`;
    return `<section class="ac-exception-summary" aria-label="异常原因与处理责任">${exceptions.map(item => `<article class="${item.pending ? "" : "handled"}"><div><strong>${esc(item.label)}</strong><span>${item.pending ? (item.canHandle ? "待你处理" : "待责任人跟进") : "已跟进"}</span></div><p>${esc(item.reason)}</p><dl><dt>处理责任</dt><dd>${esc(item.owner)}</dd><dt>下一步</dt><dd>${esc(item.next)}</dd></dl></article>`).join("")}</section>`;
  }

  function ensureApprovalCenterData(data) {
    const statuses = { "审批通过": "已通过", "审批驳回": "已驳回", "审批已撤回": "已撤回", "审批过期": "已撤回", "已超时终止": "已撤回", "已失效（复检失败）": "已失效", "已失效（超时）": "已撤回" };
    data.approvalPolicies.forEach(policy => policy.nodes.forEach(node => setNodeApprovers(node, nodeApproverIds(node), data)));
    data.approvals.forEach((approval, index) => {
      approval.id ||= `APR-HISTORY-${index + 1}`;
      approval.type ||= /回滚/.test(approval.event) ? "rollback" : /下架/.test(approval.event) ? "delist" : "publish";
      approval.approvalStatus = statuses[approval.approvalStatus] || approval.approvalStatus;
      approval.status = approval.approvalStatus;
      if (approval.executionStatus === "不适用") approval.executionStatus = "未执行";
      approval.readBy ||= [];
      (approval.notificationStatus || []).forEach((notification, index) => {
        notification.id ||= `${approval.id}-NTF-${index + 1}`;
        notification.channel ||= "钉钉";
        notification.platformPath ||= approvalCenterPath(approval);
      });
      approval.tasks.forEach(task => {
        if (task.status === "已超时") task.status = "已关闭";
        task.deadlineAt = "-";
        delete task.timedOutAt;
        task.approvers = taskPeople(task, data);
      });
      if (approval.prototypeSample && approval.type === "delist") approval.fromVersion = approval.version;
    });
    const demoVersion = 4;
    if (data.approvalCenterDemoVersion >= demoVersion) return;
    const lead = data.users.find(user => user.name === "彭冬柏");
    const peer = data.users.find(user => user.name === "刘林胶");
    const final = data.users.find(user => user.name === "严国潮");
    if (!lead || !peer || !final) return;
    const demoSubmitter = index => [10, 11, 20, 22].includes(index) ? final : index >= 14 && index <= 17 ? lead : data.users.find(user => user.name === ["汤彦珊", "凌紫妍", "刘春美"][index % 3]);
    const applyDemoOwnership = approval => {
      const match = String(approval.id || "").match(/^APR-CENTER-DEMO-(\d+)$/);
      if (!match) return;
      const index = Number(match[1]) - 1;
      if (index < 0 || index >= 24) return;
      const submitter = demoSubmitter(index);
      approval.submitter = submitter?.name || ["汤彦珊", "凌紫妍", "刘春美"][index % 3];
      approval.submitterUserId = submitter?.userId || "";
      if ([19, 23].includes(index)) approval.copyUserIds = [...new Set([...(approval.copyUserIds || []), final.userId])];
    };
    // Existing previews receive the same ownership coverage without resetting decisions or deadlines.
    if (data.approvalCenterDemoVersion >= 1) {
      data.approvals.forEach(applyDemoOwnership);
      data.approvalCenterDemoVersion = demoVersion;
      return;
    }
    const dateAt = offset => formatDateTime(new Date(Date.now() + offset * 60000));
    for (let i = 0; i < 24; i++) {
      const type = ["publish", "rollback", "delist"][i % 3];
      const operationLabel = { publish: "正常发布", rollback: "版本回滚", delist: "版本下架" }[type];
      const leadOwned = i >= 14 && i <= 17;
      const submitter = demoSubmitter(i);
      const terminal = i >= 18;
      const status = terminal ? ["已通过", "已失效", "已撤回", "已驳回", "已撤回", "已通过"][i - 18] : "审批中";
      const version = `23.110.${310 + i}.${type === "rollback" ? 7 : 8}`;
      const people = leadOwned ? [{ userId: final.userId, name: final.name }] : [{ userId: lead.userId, name: lead.name }, { userId: peer.userId, name: peer.name }];
      const second = { sequence: 2, type: "generic", approverUserId: final.userId, approverNameSnapshot: final.name, approvers: [{ userId: final.userId, name: final.name }], status: "未激活", startedAt: "-", deadlineAt: "-", completedAt: "-" };
      const task = { sequence: 1, type: "generic", approverUserId: people[0].userId, approverNameSnapshot: people.map(person => person.name).join("、"), approvers: people, status: terminal ? status : "审批中", startedAt: dateAt(-60), deadlineAt: "-", completedAt: terminal ? dateAt(-20) : "-" };
      if (terminal) { task.handledBy = people[0].name; second.status = status === "已通过" ? "已通过" : "已关闭"; second.completedAt = dateAt(-15); }
      const approval = {
        id: `APR-CENTER-DEMO-${i + 1}`, instanceNo: `APR-${new Date().getFullYear()}-${String(1024 + i).padStart(4, "0")}`, prototypeSample: true,
        version, firmwareId: `23.110.${310 + i}`, type, event: operationLabel, productLine: i % 5 === 4 ? "4G模组" : "IPC",
        submitter: submitter?.name || ["汤彦珊", "凌紫妍", "刘春美"][i % 3], submitterUserId: submitter?.userId || "", submitTime: dateAt(-65 - i * 8), status, approvalStatus: status,
        executionStatus: i === 18 ? "执行失败" : i === 23 ? "执行成功" : "未执行", executionMessage: i === 18 ? "固件执行事务未完成，已回退；须重新发起审批。" : "",
        terminalReason: i === 19 ? "当前版本指针已变化，执行前复检未通过。" : i === 20 ? "原审批已关闭，发起人可重新核对后发起。" : i === 21 ? "测试范围未覆盖弱网恢复场景。" : i === 22 ? "发布计划调整，发起人主动撤回。" : "",
        fromVersion: type === "delist" ? version : `23.110.${310 + i}.${type === "rollback" ? 8 : 7}`, toVersion: type === "delist" ? null : version,
        reason: ["修复弱网重连异常，优化设备连接稳定性。", "线上连接成功率异常，恢复上一稳定版本。", "设备兼容性验证未达标，停止新升级检查返回。 "][i % 3],
        platformReleaseNotes: "优化连接稳定性，修复设备偶发离线问题。", models: i % 5 === 4 ? "EC200U / EC800M" : "D1 / C9S", associatedDeviceCount: [528, 3200, 1264, 218, 840, 16000][i % 6],
        reminderPolicy: "weak", snapshotRecordVersion: 3, policyVersion: `IPC-${type.toUpperCase()}-V2`, policyNameSnapshot: `${operationLabel}审批`, currentTaskIndex: 0, tasks: i % 3 === 0 ? [task, second] : [task],
        testReportFiles: [{ name: "固件回归测试报告.pdf", sizeMb: "2.40", uploadedAt: dateAt(-90) }], meetingMinutesFiles: [{ name: "发版评审会议纪要.pdf", sizeMb: "0.86", uploadedAt: dateAt(-80) }],
        copyUserIds: [lead.userId, ...([19, 23].includes(i) ? [final.userId] : [])], readBy: [], notificationStatus: [{ event: terminal ? "审批结果通知" : "当前节点已激活", recipients: people.map(person => person.name), result: i === 23 ? "failed" : "sent", time: dateAt(-60) }], approveTime: terminal ? dateAt(-15) : "-"
      };
      data.approvals.push(approval);
    }
    data.approvalCenterDemoVersion = demoVersion;
  }

  function closeApprovalInstance(approval, status, reason, actor = "审批服务") {
    const task = currentApprovalTask(approval);
    const currentNames = taskNames(task);
    const stamp = now();
    (approval.tasks || []).forEach(item => {
      if (["审批中", "已超时", "未激活"].includes(item.status)) {
        item.status = item === task ? status : "已关闭";
        item.completedAt = stamp;
        item.handledBy = actor;
        item.decisionNote = reason;
        item.siblingClosed = true;
      }
    });
    restorePublishApprovalTarget(approval);
    const identifier = db.identifiers.find(item => item.id === approval.firmwareId);
    if (identifier?.activeApproval?.approvalId === approval.id) identifier.activeApproval = null;
    approval.status = approval.approvalStatus = status;
    approval.executionStatus = "未执行";
    approval.terminalReason = reason;
    approval.approveTime = stamp;
    approval.remindersStopped = true;
    recordApprovalNotification(approval, status, [...terminalApprovalRecipients(approval), ...currentNames], "sent", { reason, reasonCode: approval.withdrawalReasonCode || (status === "已驳回" ? "rejection" : "") });
    addOperation("固件审批", status, approval.version, actor, "成功", reason);
    if (identifier) {
      const flowStatus = status === "已撤回" ? "withdrawn" : status === "已驳回" ? "rejected" : "failed";
      setLifecycleFlowStatus(identifier, approval.flowId, flowStatus);
      addLifecycleEvent(identifier, { flowId: approval.flowId, flowType: approval.type, flowStatus, title: status, operator: actor, operatorType: "平台审批", stage: "approval", summary: reason });
    }
    persist();
    return { ok: true };
  }

  // “已处理”记录的是当前用户实际完成过的节点动作，而不是整单最终结果。
  // 多级审批中，第一级通过后整单仍为“审批中”，但该节点已经完成，必须进入
  // 审批人的已处理列表；否则审批人无法回看自己的处理记录。业务异常仍由异常
  // 中心承接，避免把执行失败、已失效或通知失败误显示为正常已处理。
  function centerHandledTask(approval, user = centerIdentity()) {
    return (approval?.tasks || []).find(task => task.handledBy === user.name
      && ["已通过", "已驳回"].includes(task.status)
      && task.completedAt && task.completedAt !== "-");
  }

  function centerHandledByUser(approval, user = centerIdentity()) {
    return Boolean(centerHandledTask(approval, user));
  }

  function centerHandled(approval, user = centerIdentity()) {
    return centerHandledByUser(approval, user) && !centerHasException(approval);
  }

  function centerHandledToday(approval, user = centerIdentity()) {
    const today = now().slice(0, 10);
    return centerHandled(approval, user)
      && (approval.tasks || []).some(task => task.handledBy === user.name
        && ["已通过", "已驳回"].includes(task.status)
        && String(task.completedAt).startsWith(today));
  }

  function centerDefaultFilters() {
    return { query: "", line: "", operation: "", targetVersion: "", submitter: "", policy: "", large: false };
  }

  function centerRows(view = state.center.view, filtered = true, exceptionScope = state.center.exceptionScope) {
    const user = centerIdentity();
    const filters = state.center.filters;
    return db.approvals.filter(approval => {
      if (!centerReadable(approval)) return false;
      if (view === "todo" && !centerContext(approval).canDecide) return false;
      if (view === "mine" && approval.submitter !== user.name) return false;
      if (view === "done" && !centerHandled(approval)) return false;
      if (view === "copy" && (!(approval.copyUserIds || []).includes(user.userId) || approval.approvalStatus === "审批中")) return false;
      if (view === "exceptions" && !(exceptionScope === "all" && centerIsAdmin(user) ? centerHasException(approval) : centerHasActionableException(approval))) return false;
      if (!filtered) return true;
      const query = filters.query.toLowerCase().trim();
      const target = String(filters.targetVersion || "").trim().toLowerCase();
      return (!query || `${approval.version} ${approval.instanceNo} ${approval.submitter} ${approval.firmwareId}`.toLowerCase().includes(query))
        && (!filters.line || approval.productLine === filters.line) && (!filters.operation || approval.type === filters.operation)
        && (!target || String(approval.toVersion || approval.version || "").toLowerCase().includes(target))
        && (!filters.submitter || approval.submitter === filters.submitter) && (!filters.policy || approval.policyVersion === filters.policy)
        && (!filters.large || Number(approval.associatedDeviceCount) >= 1000);
    }).sort((a, b) => {
      if (state.center.sort === "oldest") return String(a.submitTime).localeCompare(String(b.submitTime));
      return Number(b.approvalStatus === "审批中") - Number(a.approvalStatus === "审批中") || Number(b.associatedDeviceCount || 0) - Number(a.associatedDeviceCount || 0) || String(a.submitTime).localeCompare(String(b.submitTime));
    });
  }

  function centerHasTodo() {
    return centerRows("todo", false).length > 0;
  }

  function centerStatusTag(approval, includeExecution = false) {
    const status = approval.approvalStatus;
    const secondary = centerHasException(approval) && status === "已通过";
    const executionFailed = approval.executionStatus === "执行失败";
    const label = includeExecution && executionFailed ? "执行失败" : secondary ? "审批已通过" : esc(status);
    const statusClass = includeExecution && executionFailed ? "closed" : status === "审批中" ? "pending" : status === "已通过" ? (secondary ? "" : "success") : "closed";
    return `<span class="ac-status ${statusClass}" data-approval-status="${esc(status || "")}">${label}</span>`;
  }

  function reminderPolicyTag(approval) {
    const policy = reminderPolicies.find(item => item.value === approval?.reminderPolicy) || reminderPolicies[0];
    const hint = approval?.type === "delist" ? "下架操作不触发 APP 升级提醒" : policy.hint;
    return `<span class="ac-reminder-tag ${esc(policy.value)}" title="${esc(hint)}">${esc(policy.label)}</span>`;
  }

  function renderCenterExceptionScopes() {
    if (state.center.view !== "exceptions") return "";
    const pending = centerRows("exceptions", false, "todo").length;
    return `<div class="ac-exception-scopes"><div role="tablist" aria-label="异常处理范围"><button role="tab" aria-selected="${state.center.exceptionScope !== "all"}" data-action="center-exception-scope" data-scope="todo">待我处理 <span>${pending}</span></button>${centerIsAdmin() ? `<button role="tab" aria-selected="${state.center.exceptionScope === "all"}" data-action="center-exception-scope" data-scope="all">全部异常 <span>${centerRows("exceptions", false, "all").length}</span></button>` : ""}</div><p>${state.center.exceptionScope === "all" && centerIsAdmin() ? "展示权限范围内的异常及跟进结果，历史业务状态保留。" : "仅展示当前身份可跟进的异常；按审批单去重，已读不影响数量。"}</p></div>`;
  }

  function renderCenterFilters() {
    const center = state.center, filters = center.filters;
    const readable = db.approvals.filter(centerReadable);
    const submitters = [...new Set(readable.map(item => item.submitter).filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh-CN"));
    const policies = [...new Map(readable.filter(item => item.policyVersion).map(item => [item.policyVersion, item])).values()];
    const extraCount = [filters.targetVersion, filters.submitter, filters.policy].filter(Boolean).length;
    const option = (value, label, current) => `<option value="${esc(value)}" ${value === current ? "selected" : ""}>${esc(label)}</option>`;
    return `<div class="ac-filters"><div class="ac-filter-primary"><input class="field" aria-label="搜索审批单" data-center-query value="${esc(center.draftQuery ?? filters.query)}" placeholder="搜索版本号、审批单或提交人"><select class="select" aria-label="筛选产品线" data-center-filter="line"><option value="">全部产品线</option>${productLines.filter(line => (centerIdentity().lines || []).includes(line)).map(line => option(line, line, filters.line)).join("")}</select><select class="select" aria-label="筛选操作类型" data-center-filter="operation"><option value="">全部操作</option>${approvalOperationCatalog.map(item => option(item.value, item.label, filters.operation)).join("")}</select><button class="btn primary" data-action="center-search">查询</button><button class="link-btn" data-action="center-reset">重置</button><button class="link-btn ac-more-filters" data-action="center-toggle-filters" aria-expanded="${center.moreFilters}" aria-controls="ac-extra-filters">${center.moreFilters ? "收起条件" : "更多条件"}${extraCount ? `（${extraCount}）` : ""} ${center.moreFilters ? "⌃" : "⌄"}</button><label class="check"><input type="checkbox" data-center-filter="large" ${filters.large ? "checked" : ""}>影响 ≥ 1,000 台</label></div>${center.moreFilters ? `<div id="ac-extra-filters" class="ac-filter-extra"><label>操作版本<input class="field" aria-label="筛选操作版本" data-center-target value="${esc(center.draftTargetVersion ?? filters.targetVersion)}" placeholder="发布/回滚目标或下架版本"></label><label>提交人<select class="select" aria-label="筛选提交人" data-center-filter="submitter"><option value="">全部提交人</option>${submitters.map(name => option(name, name, filters.submitter)).join("")}</select></label><label>审批方案版本<select class="select" aria-label="筛选审批方案版本" data-center-filter="policy"><option value="">全部方案版本</option>${policies.map(item => option(item.policyVersion, `${item.policyNameSnapshot || "历史审批方案"} · ${item.policyVersion}`, filters.policy)).join("")}</select></label></div>` : ""}</div>`;
  }

  function renderCenterRowNode(approval) {
    const task = currentApprovalTask(approval);
    return task && approval.approvalStatus === "审批中" ? `<div class="ac-row-node"><span>第 ${task.sequence} / ${(approval.tasks || []).length} 级</span><span>${taskPeople(task).length} 人或签</span><small title="${esc(taskNames(task).join("、"))}">${esc(taskNames(task).join("、"))}</small></div>` : "";
  }

  function centerReapplyPolicyIssue(approval, user = centerIdentity()) {
    const policy = activeApprovalPolicy(approval.productLine, approval.type);
    if (!policy) return "当前操作没有启用的审批方案，请联系管理员配置后再发起。";
    const issue = approvalPolicyNodeIssue(policy);
    if (issue) return `当前审批方案不可用：${issue}`;
    if (policy.nodes.some(node => nodeApproverIds(node).some(id => db.users.find(person => person.userId === id)?.name === user.name))) return "当前审批方案包含你本人，不能审批自己的申请。请先调整后续申请的审批配置。";
    return "";
  }

  function submitCenterSampleReapplication(modal) {
    const approval = approvalById(modal.approvalId), user = centerIdentity();
    state.errors = {};
    if (!centerCanReapply(approval)) return { ok: false, message: "权限或跟进状态已变化，请刷新后查看最新结果。" };
    const policyIssue = centerReapplyPolicyIssue(approval);
    if (policyIssue) return { ok: false, message: policyIssue };
    if (db.approvals.some(item => item.firmwareId === approval.firmwareId && (item.approvalStatus === "审批中" || item.executionStatus === "执行中"))) return { ok: false, message: "当前固件标识已有审批或执行任务，请先处理现有任务。" };
    if (approval.type !== "delist" && !String(modal.newTargetVersion || "").trim()) state.errors.newTargetVersion = "请重新填写目标版本";
    if (approval.type !== "publish" && !String(modal.newCurrentVersion || "").trim()) state.errors.newCurrentVersion = "请核对并填写当前发布版本";
    if (approval.type !== "delist" && modal.newCurrentVersion && modal.newCurrentVersion.trim() === String(modal.newTargetVersion || "").trim()) state.errors.newTargetVersion = "目标版本不能与当前版本相同";
    if (String(modal.newDeviceCount || "").trim() === "" || !Number.isSafeInteger(Number(modal.newDeviceCount)) || Number(modal.newDeviceCount) < 0) state.errors.newDeviceCount = "请填写当前影响设备数（非负整数）";
    if (!String(modal.newModels || "").trim()) state.errors.newModels = "请核对并填写适用机型";
    if (!String(modal.newReason || "").trim()) state.errors.newReason = "请填写本次申请原因";
    if (approval.type !== "delist" && !modal.reminderPolicy) state.errors.reminderPolicy = "请选择本次 APP 提醒方式";
    if (approval.type === "publish") {
      const issue = materialValidation(modal.testReportFiles || [], releaseMaterialRules.testReport);
      if (issue || !modal.testReportFiles?.length) state.errors.newTestReport = issue || "请为新申请重新上传测试报告";
    }
    if (!modal.rechecked) state.errors.rechecked = "请确认已核对本次申请内容";
    if (Object.keys(state.errors).length) return { ok: false, message: "请完成新申请的业务信息核对。" };
    const policy = activeApprovalPolicy(approval.productLine, approval.type), stamp = now();
    const tasks = policy.nodes.map((node, index) => ({ sequence: index + 1, type: "generic", approverUserId: nodeApproverIds(node)[0], approverNameSnapshot: node.approverName, approvers: nodeApproverIds(node).map(id => ({ userId: id, name: db.users.find(person => person.userId === id)?.name || id })), status: index ? "未激活" : "审批中", startedAt: index ? "-" : stamp, deadlineAt: "-", completedAt: "-" }));
    const next = { id: releaseId("APR-DEMO"), prototypeSample: true, firmwareId: approval.firmwareId, type: approval.type, event: approvalOperationLabel(approval.type), productLine: approval.productLine, submitter: user.name, submitterUserId: user.userId, submitTime: stamp, approvalStatus: "审批中", status: "审批中", executionStatus: "未执行", approveTime: "-", version: (approval.type === "delist" ? modal.newCurrentVersion : modal.newTargetVersion).trim(), fromVersion: String(modal.newCurrentVersion || "").trim() || null, toVersion: approval.type === "delist" ? null : modal.newTargetVersion.trim(), associatedDeviceCount: Number(modal.newDeviceCount), models: modal.newModels.trim(), reason: modal.newReason.trim(), platformReleaseNotes: modal.newReason.trim(), reminderPolicy: approval.type === "delist" ? null : modal.reminderPolicy, testReportFiles: clone(modal.testReportFiles || []), meetingMinutesFiles: [], policyId: policy.id, policyVersion: policy.policyVersion, policyNameSnapshot: policy.name, copyUserIds: clone(policy.copyUserIds || []), currentTaskIndex: 0, tasks, notificationStatus: [], readBy: [], relatedApprovalId: approval.id, snapshotRecordVersion: 1 };
    next.instanceNo = next.id;
    approval.relatedApprovalIds = [...new Set([...(approval.relatedApprovalIds || []), next.id])];
    db.approvals.unshift(next);
    recordApprovalNotification(next, "第 1 级节点已激活", taskNames(tasks[0]));
    addOperation("固件审批", "重新发起", next.instanceNo, user.name, "成功", `核对新申请内容；关联原审批 ${approval.instanceNo}；采用当前方案 ${policy.policyVersion}`);
    persist();
    return { ok: true, approval: next };
  }

  function renderApprovalCenter() {
    const center = state.center;
    const user = centerIdentity();
    const rows = centerRows();
    const selected = db.approvals.find(item => item.id === center.selectedId && centerReadable(item));
    const todo = centerRows("todo", false), exceptions = centerRows("exceptions", false, "todo");
    const processed = centerRows("done", false).length;
    const processedToday = db.approvals.filter(approval => centerReadable(approval) && centerHandledToday(approval)).length;
    const counts = { todo: todo.length, mine: centerRows("mine", false).length, copy: centerRows("copy", false).length, exceptions: exceptions.length };
    const list = rows.map(approval => {
      const read = (approval.readBy || []).includes(user.userId);
      const task = currentApprovalTask(approval);
      const taskMeta = task ? `第 ${task.sequence}/${(approval.tasks || []).length} 级 · ${taskPeople(task).length} 人或签` : "审批已结束";
      const reason = center.view === "exceptions" ? centerExceptions(approval).map(item => item.reason).join(" ") : (approval.reason || approval.note || approval.platformReleaseNotes || "查看业务信息");
      const isMine = center.view === "mine";
      const unreadMark = !isMine && !read ? '<i class="ac-unread" aria-label="未读"></i>' : "";
      const rowMeta = isMine
        ? `<div class="ac-row-meta ac-row-meta-mine"><span class="ac-row-status">${centerStatusTag(approval)}</span>${renderCenterReminderAction(approval, "row")}</div>`
        : `<div class="ac-row-meta"><span>${esc(taskMeta)}</span><i aria-hidden="true">|</i><span>影响 ${formatDeviceCount(approval.associatedDeviceCount || 0)} 台</span><i aria-hidden="true">|</i><span>${esc(approval.submitter)}</span></div>`;
      return `<article class="ac-queue-row ${selected?.id === approval.id ? "selected" : ""}"><div class="ac-queue-main"><button class="ac-queue-open" data-action="center-open" data-approval-id="${esc(approval.id)}" aria-pressed="${selected?.id === approval.id}"><div class="ac-row-top"><span class="ac-operation ${approval.type}">${esc(approvalOperationLabel(approval.type))}</span><span class="ac-product-line">${esc(approval.productLine)}</span>${unreadMark}<time>${esc(approval.submitTime.slice(5, 16))}</time></div><strong class="ac-row-version">${esc(approval.version)}</strong>${center.view === "exceptions" ? renderCenterExceptionSummary(approval, true) : ""}${center.view === "exceptions" ? `<p>${esc(reason)}</p><div class="ac-row-results">审批：${esc(approval.approvalStatus)} · 执行：${esc(approval.executionStatus)}</div>` : ""}<span class="ac-row-arrow" aria-hidden="true">›</span></button>${rowMeta}</div></article>`;
    }).join("");
    return `<section class="page approval-center-page"><header class="ac-page-head"><div><span class="ac-eyebrow">固件操作审批</span><h1>审批中心</h1></div><div class="ac-head-actions"><label>预览身份<select class="select" aria-label="审批中心预览身份" data-center-control="viewerId">${db.users.filter(item => item.status === "active").map(item => `<option value="${esc(item.userId)}" ${item.userId === user.userId ? "selected" : ""}>${esc(item.name)} · ${esc(item.role)}</option>`).join("")}<option value="submitter:汤彦珊" ${user.name === "汤彦珊" ? "selected" : ""}>汤彦珊 · 发起人</option></select></label><button class="btn" data-action="center-refresh">↻ 刷新</button>${centerIsAdmin(user) ? '<button class="btn" data-action="center-reset-demo">↺ 重置示例数据</button>' : ""}</div></header><div class="ac-workspace"><div class="ac-tabs" role="tablist">${[["todo", "待我处理"], ["mine", "我发起的"], ["copy", "抄送我的"], ["exceptions", "异常中心"], ["done", "已处理"]].map(([view, label]) => `<button role="tab" aria-selected="${center.view === view}" class="${center.view === view ? "active" : ""}" data-action="center-view" data-view="${view}">${label}<span>${view === "done" ? processed : counts[view]}</span></button>`).join("")}<button class="ac-notify-rules" data-action="center-rules">◷ 催办规则</button></div>${renderCenterExceptionScopes()}${renderCenterFilters()}<div class="ac-workbench ${selected ? "has-selection" : ""}"><aside class="ac-queue"><div class="ac-queue-toolbar"><span>共 <b>${rows.length}</b> 条</span><select aria-label="审批排序" data-center-control="sort"><option value="priority" ${center.sort === "priority" ? "selected" : ""}>优先处理</option><option value="oldest" ${center.sort === "oldest" ? "selected" : ""}>最早提交</option></select></div><div class="ac-queue-scroll">${list || `<div class="ac-empty"><span>✓</span><strong>${center.view === "exceptions" ? (center.exceptionScope === "all" ? "当前没有匹配的异常记录" : "当前没有匹配的待处理异常") : "当前没有匹配的审批"}</strong><p>${center.view === "exceptions" ? "调整筛选条件，或查看其他视图。" : "调整筛选条件，或切换其他视图。"}</p></div>`}</div><div class="ac-queue-foot">${center.view === "exceptions" ? "异常跟进与审批结果独立记录 · 已读不会清除异常" : center.view === "mine" ? "节点内任一人通过即可流转 · 发起人可按需催办" : center.view === "done" ? "展示本人已通过/驳回且无业务异常的审批；历史记录持续保留" : "节点内任一人通过即可流转 · 当前视图仅展示处理任务"}</div></aside><main class="ac-detail" aria-label="审批详情">${selected ? renderCenterDetail(selected) : `<div class="ac-empty ac-detail-empty"><span>▤</span><strong>${center.view === "exceptions" ? "选择一条异常查看原因与下一步" : "选择一条审批开始处理"}</strong><p>${center.view === "exceptions" ? "按处理责任跟进，审批与执行状态分别保留。" : "先核对业务影响，再提交审批结果。<br>已读状态不会改变审批进度。"}</p>${rows.length ? `<button class="btn primary" data-action="center-open" data-approval-id="${esc(rows[0].id)}">${center.view === "exceptions" ? "查看第一条异常" : "开始处理第一条"} →</button>` : ""}</div>`}</main></div></div><p class="ac-prototype-note">当前为本地交互演示；审批状态保存在本浏览器，不会向钉钉发送消息或执行线上固件操作。</p></section>`;
  }

  function renderCenterFlow(approval) {
    const tasks = Array.isArray(approval?.tasks) ? approval.tasks : [];
    const total = tasks.length || 1;
    const taskCards = tasks.map(task => {
      const people = taskPeople(task);
      const active = task.status === "审批中";
      const complete = task.status === "已通过";
      const names = people.map(person => person.name).join("、") || task.approverNameSnapshot || "待配置审批人";
      const role = approvalTaskRoleLabel(approval, task);
      const peopleRows = people.map(person => {
        const handled = task.handledBy && task.handledBy === person.name;
        const personStatus = task.status === "审批中" ? "待审批" : task.status === "已驳回" ? (handled ? "已驳回" : "已关闭") : task.status === "已通过" ? "已通过" : task.status === "已关闭" ? "已关闭" : "待处理";
        const statusClass = personStatus === "已通过" ? "success" : personStatus === "已驳回" ? "danger" : personStatus === "待审批" ? "blue" : "muted";
        const personTime = task.completedAt && task.completedAt !== "-" ? task.completedAt : task.startedAt || "-";
        const personNote = handled ? (task.decisionNote || task.decision || "-") : (task.status === "审批中" ? "-" : "已由其他审批人处理");
        const personUser = db.users.find(user => user.userId === person.userId);
        return `<div class="ac-flow-person-row"><div class="ac-flow-person"><span class="ac-avatar">${esc((person.name || "").slice(0, 1))}</span><span><strong>${esc(person.name || "历史审批人")}</strong><small>${esc(personUser?.role || role)}</small></span></div><div class="ac-flow-person-result"><span class="ac-flow-status-tag ${statusClass}">${esc(personStatus)}</span><time>${esc(personTime)}</time></div><span class="ac-flow-person-note">${esc(personNote)}</span></div>`;
      }).join("");
      return `<article class="ac-flow-node-card ${active ? "active" : complete ? "complete" : "pending"}"><header><div><strong>第 ${task.sequence} / ${total} 级 · ${people.length} 人或签</strong>${active ? '<span class="ac-flow-current-tag">当前节点</span>' : ""}</div><span class="ac-flow-node-names" title="${esc(names)}">${esc(names)}</span></header><div class="ac-flow-person-head"><span>审批人</span><span>审批结果</span><span>审批意见</span></div>${peopleRows || '<div class="ac-flow-person-empty">待配置审批人</div>'}</article>`;
    }).join("");
    const completed = approval.approvalStatus !== "审批中";
    const completionLabel = approval.executionStatus && approval.executionStatus !== "未执行" && approval.executionStatus !== "不适用" ? `审批完成 · ${approval.executionStatus}` : "审批完成";
    const completionTime = approval.approveTime && approval.approveTime !== "-" ? approval.approveTime : "-";
    return `<div class="ac-flow-timeline">${taskCards || '<div class="ac-flow-person-empty">暂无审批节点</div>'}<div class="ac-flow-completion ${completed ? "complete" : "pending"}"><span class="ac-flow-completion-dot">${completed ? "✓" : ""}</span><strong>${esc(completionLabel)}</strong><time>${esc(completionTime)}</time></div></div>`;
  }

  function renderCenterDetail(approval) {
    const task = currentApprovalTask(approval), context = centerContext(approval);
    const members = taskPeople(task);
    const materialFiles = [
      ...(approval.testReportFiles || []).map((file, index) => ({ file, kind: "testReport", index })),
      ...(approval.meetingMinutesFiles || []).map((file, index) => ({ file, kind: "meetingMinutes", index }))
    ];
    const materialIcon = file => /pdf$/i.test(file.name || "") ? "PDF" : /xlsx?$/i.test(file.name || "") ? "X" : /docx?$/i.test(file.name || "") ? "W" : "FILE";
    const icon = name => ({
      business: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5"/></svg>',
      materials: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 12 6.7-6.7a3 3 0 0 1 4.3 4.3l-8.2 8.2a4 4 0 0 1-5.7-5.7l8.2-8.2"/></svg>',
      flow: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/></svg>',
      eye: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12s3.4-6 9-6 9 6 9 6-3.4 6-9 6-9-6-9-6Z"/><circle cx="12" cy="12" r="2.5"/></svg>',
      download: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11m0 0 4-4m-4 4-4-4M5 20h14"/></svg>'
    }[name] || "");
    const businessFields = [
      ["所属产品线", approval.productLine],
      ["适用机型", approval.models || "-"],
      ["预计影响设备", `${formatDeviceCount(approval.associatedDeviceCount || 0)} 台`],
      ["APP 提醒策略", reminderPolicyTag(approval), true]
    ];
    const materialMarkup = materialFiles.length ? materialFiles.map(({ file, kind, index }) => `<div class="ac-material-row"><div class="ac-material-name"><span class="ac-material-file-icon ${materialIcon(file).toLowerCase()}">${materialIcon(file)}</span><strong>${esc(file.name)}</strong></div><span>${esc(file.sizeMb || "—")} MB</span><span>${esc(file.uploadedAt || "—")}</span><span class="ac-material-actions"><button class="link-btn" data-action="preview-approval-material" data-material-kind="${kind}" data-material-index="${index}">${icon("eye")}预览</button><button class="link-btn" data-action="download-approval-material" data-material-kind="${kind}" data-material-index="${index}">${icon("download")}下载</button></span></div>`).join("") : '<div class="ac-material-empty">暂无审批材料</div>';
    const flowMarkup = renderCenterFlow(approval);
    const reason = approval.reason || approval.note || approval.platformReleaseNotes || "—";
    const reminder = approvalReminderState(approval);
    const relatedIds = [...new Set([approval.relatedApprovalId, ...(approval.relatedApprovalIds || [])].filter(Boolean))];
    const relatedLinks = relatedIds.map(id => approvalById(id)).filter(item => item && centerReadable(item)).map(item => `<button class="link-btn" data-action="center-open" data-approval-id="${esc(item.id)}">${item.id === approval.relatedApprovalId ? "原审批" : "重新发起的审批"}：${esc(item.instanceNo || item.id)} →</button>`).join("");
    return `<div class="ac-reference-detail"><header class="ac-detail-head"><button class="link-btn ac-mobile-back" data-action="center-back">← 返回队列</button><div class="ac-detail-kicker"><span class="ac-detail-operation"><b class="ac-operation ${approval.type}">${esc(approvalOperationLabel(approval.type))}</b><span class="ac-product-line">${esc(approval.productLine)}</span></span>${centerStatusTag(approval)}</div><h2>${esc(approval.version)}</h2><div class="ac-detail-meta"><span>审批编号：${esc(approval.instanceNo || approval.id)}</span><i>｜</i><span>发起人：${esc(approval.submitter)}</span><i>｜</i><span>提交时间：${esc(approval.submitTime)}</span></div></header>${!task && approval.terminalReason ? `<div class="ac-terminal-message"><strong>${esc(approval.terminalReason)}</strong></div>` : ""}<div class="ac-detail-scroll ac-reference-scroll"><section class="ac-reference-section ac-business-section"><h3>${icon("business")}业务信息</h3><div class="ac-reference-fields">${businessFields.map(([label, value, raw]) => `<div><span>${esc(label)}</span><strong>${raw ? value : esc(value)}</strong></div>`).join("")}</div><div class="ac-reference-reason"><h4>发布说明</h4><p>${esc(reason)}</p></div></section><section class="ac-reference-section ac-materials-section"><h3>${icon("materials")}审批材料</h3><div class="ac-material-head"><span>文件名称</span><span>文件大小</span><span>上传时间</span><span>操作</span></div>${materialMarkup}</section><section class="ac-reference-section ac-flow-section"><h3>${icon("flow")}审批流转<button class="ac-flow-collapse" type="button" aria-label="收起审批流转">⌃</button></h3>${flowMarkup}</section>${relatedLinks ? `<section class="ac-related"><h3>关联审批记录</h3>${relatedLinks}</section>` : ""}</div><footer class="ac-decision-footer"><div><strong>${context.canDecide ? "请核对影响范围后提交" : context.canWithdraw ? "当前申请尚未完成，可主动撤回" : "当前记录只读"}</strong><small>${context.canDecide ? "一条审批对应一次独立业务操作" : "审批和执行状态独立记录"}</small></div><div class="ac-decision-actions">${context.canDecide ? `<button class="btn danger" data-action="center-decision" data-decision="reject">驳回</button><button class="btn primary" data-action="center-decision" data-decision="approve">通过</button>` : ""}${context.canWithdraw ? '<button class="btn danger" data-action="center-decision" data-decision="withdraw">撤回申请</button>' : ""}${centerCanShowReminder(approval) ? `<button class="btn" data-action="center-remind" ${!reminder.allowed ? "disabled" : ""}>${reminder.allowed ? "催办审批人" : `已催办 · ${reminder.remainingMinutes} 分钟后可再次催办`}</button>` : ""}${centerCanReapply(approval) ? '<button class="btn primary" data-action="center-reapply">核对并重新发起</button>' : ""}${centerCanResend(approval) ? '<button class="btn" data-action="center-resend">补发当前通知</button>' : ""}<button class="btn" data-action="center-next">下一条 →</button></div></footer></div>`;
  }

  function renderCenterModal(modal) {
    if (modal.type === "centerResetDemo") return modalFrame("重置审批中心示例数据", `<div class="ac-reset-demo-confirm"><div class="confirm-icon">↺</div><h3>确认重新生成审批中心示例？</h3><p>将按当前时间重新生成 24 条系统预置的审批示例，包含待办与历史异常。原预置示例的审批操作和已读状态将被重置。</p><ul><li>审批不设截止时间，仅发起人可在“我发起的”中催办。</li><li>你新建的模拟审批、固件版本、审批配置和其他业务数据会保留。</li></ul></div>`, '<button class="btn" data-action="close-modal">取消</button><button class="btn primary" data-action="center-confirm-reset-demo">确认重置</button>');
    if (modal.type === "centerReapplyDraft") {
      const approval = approvalById(modal.approvalId);
      if (!approval) return modalFrame("重新发起申请", "原审批记录不存在，请刷新后重试。", '<button class="btn" data-action="close-overlay">关闭</button>');
      const policy = activeApprovalPolicy(approval.productLine, approval.type), issue = centerReapplyPolicyIssue(approval);
      const input = (key, label, type = "text") => `<div class="form-field ${key === "newCurrentVersion" && approval.type === "publish" ? "" : "required"}"><label for="reapply-${key}">${label}</label><input id="reapply-${key}" class="field" type="${type}" ${type === "number" ? 'min="0" step="1"' : 'maxlength="120"'} data-modal-field="${key}" value="${esc(modal[key] ?? "")}">${errorFor(key)}</div>`;
      const reference = `<div class="ac-reapply-reference"><strong>原申请仅供参考 · ${esc(approval.instanceNo)}</strong><p>${esc(approvalOperationLabel(approval.type))} · ${esc(approval.productLine)} · 原目标 ${esc(approval.version)} · 原影响 ${formatDeviceCount(approval.associatedDeviceCount)} 台</p><p>本次发起人：${esc(centerIdentity().name)}${centerIdentity().name !== approval.submitter ? ` · 原发起人：${esc(approval.submitter)}` : ""}</p></div>`;
      const currentPolicy = `<div class="ac-reapply-policy"><strong>当前审批方案</strong><p>${esc(policy ? `${policy.name} · ${policy.policyVersion} · ${policy.nodes.length} 级串行` : "未配置")}</p>${issue ? `<p class="error-text">${esc(issue)}</p>` : '<p>提交时重新读取当前方案和审批人，不沿用旧审批节点。</p>'}</div>`;
      const sampleForm = approval.prototypeSample ? `<p class="ac-muted">此记录使用示例固件，请填写本次核对的示例业务数据。新申请仅在本地演示，原申请材料与数据不会自动带入。</p><div class="form-grid ac-reapply-fields">${input("newCurrentVersion", approval.type === "publish" ? "当前版本（首次发布可留空）" : "当前发布版本")}${approval.type !== "delist" ? input("newTargetVersion", approval.type === "rollback" ? "唯一前序回滚目标" : "目标版本") : ""}${input("newDeviceCount", "当前影响设备数", "number")}${input("newModels", "适用机型")}</div>${approval.type !== "delist" ? `<div class="form-field required"><label>本次 APP 提醒方式</label>${renderReminderOptions(modal.reminderPolicy)}${errorFor("reminderPolicy")}</div>` : ""}<div class="form-field required"><label for="reapply-reason">本次申请原因</label><textarea id="reapply-reason" class="textarea" data-modal-field="newReason" maxlength="500" placeholder="结合当前业务情况重新填写">${esc(modal.newReason || "")}</textarea>${errorFor("newReason")}</div>${approval.type === "publish" ? `<div class="form-field required"><label for="center-reapply-test-report">本次测试报告</label><input id="center-reapply-test-report" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" multiple><p class="ac-muted">${esc((modal.testReportFiles || []).map(file => file.name).join("、") || "请重新上传，原材料仅在旧审批中保留。")}</p>${errorFor("newTestReport")}</div>` : ""}<label class="check ac-reapply-check"><input type="checkbox" data-modal-field="rechecked" ${modal.rechecked ? "checked" : ""}>已核对本次版本、影响范围、材料与当前审批方案</label>${errorFor("rechecked")}` : '<p class="ac-muted">继续后进入当前固件的申请表，重新选择目标、核对影响范围并补充材料；只有新申请提交成功，才关联原审批并更新异常跟进结果。</p>';
      return modalFrame("重新发起申请 · 核对草稿", `${reference}${currentPolicy}${sampleForm}`, `<button class="btn" data-action="close-overlay">取消</button><button class="btn primary" data-action="${approval.prototypeSample ? "center-submit-reapply" : "center-continue-reapply"}" ${issue ? "disabled" : ""}>${approval.prototypeSample ? "提交新的示例审批" : "进入当前申请表"}</button>`, true);
    }
    if (modal.type === "centerRules") return modalFrame("审批通知与催办", `<div class="ac-rules"><p><b>节点激活</b>立即通知当前节点全部审批人。</p><p><b>人工催办</b>只在“我发起的”列表、详情中提供；点击后再次发送钉钉通知给当前节点未处理审批人。待我处理、抄送我的和异常中心不展示催办入口；系统管理员保留后台兜底权限。</p><p><b>催办冷却</b>同一节点 30 分钟内最多发送一次，避免重复打扰。</p><p><b>审批状态</b>不设截止时间，审批保持“审批中”，通过、驳回或发起人撤回后结束。</p><p><b>锁定释放</b>通过、驳回或撤回后释放业务锁；钉钉消息是否已读不改变平台审批状态。</p><small>本期审批中心不展示通知记录；实际钉钉发送与回执由通知服务处理。</small></div>`, '<button class="btn primary" data-action="close-modal">知道了</button>');
    if (modal.type === "centerDecision") {
      const approval = approvalById(modal.approvalId);
      const label = { approve: "通过", reject: "驳回", withdraw: "撤回" }[modal.decision];
      const decisionNotice = modal.decision === "withdraw" ? "" : `<div class="notice">${modal.decision === "approve" ? "通过后同级其他待办立即关闭；全部节点通过后自动进行执行前复检。" : "驳回将终止整个审批，并关闭当前节点的全部待办。"}</div>`;
      const autoNext = modal.decision === "withdraw" ? "" : `<label class="check"><input type="checkbox" data-center-auto-next ${state.center.autoNext ? "checked" : ""}>完成后进入下一条有效待办</label>`;
      const reasonFields = modal.decision === "withdraw"
        ? renderWithdrawalReasonFields("centerReasonCode", "centerReasonNote", modal.centerReasonCode, modal.centerReasonNote, errorFor("centerReason"))
        : `<div class="form-field ${modal.decision !== "approve" ? "required" : ""}"><label>${modal.decision === "approve" ? "审批意见（选填）" : `${label}原因`}</label><textarea class="textarea" data-modal-field="centerReason" maxlength="300" placeholder="${modal.decision === "approve" ? "可填写审核结论" : "请填写原因"}">${esc(modal.centerReason || "")}</textarea>${errorFor("centerReason")}</div>`;
      return modalFrame(`${label}审批`, `<div class="ac-confirm-summary"><span>${esc(approvalOperationLabel(approval.type))} · ${esc(approval.productLine)}</span><h3>${esc(approval.version)}</h3><p>预计影响 ${formatDeviceCount(approval.associatedDeviceCount || 0)} 台设备</p></div>${decisionNotice}${reasonFields}${autoNext}`, `<button class="btn" data-action="close-modal">取消</button><button class="btn ${modal.decision === "approve" ? "primary" : "danger"}" data-action="center-confirm">确认${label}</button>`);
    }
    return "";
  }

  function centerSelect(id) {
    const approval = approvalById(id);
    if (!approval || !centerReadable(approval)) return false;
    state.center.selectedId = id;
    state.center.detailTab = "business";
    approval.readBy ||= [];
    if (!approval.readBy.includes(centerIdentity().userId)) approval.readBy.push(centerIdentity().userId);
    persist();
    return true;
  }
  function centerEnsureDefaultSelection() {
    if (state.route !== "approvalCenter") return false;
    const rows = centerRows();
    const current = state.center.selectedId && approvalById(state.center.selectedId);
    if (current && rows.some(item => item.id === current.id)) return true;
    const first = rows[0];
    state.center.selectedId = null;
    return first ? centerSelect(first.id) : false;
  }
  function openApprovalDeepLink() {
    if (state.route !== "approvalCenter") return;
    const id = new URLSearchParams(location.hash.split("?")[1] || "").get("approvalId");
    if (id && !centerSelect(id)) {
      state.center.selectedId = null;
      toast("审批记录不存在或当前身份无查看权限", "warning");
      return;
    }
    if (!id) centerEnsureDefaultSelection();
  }
  function centerNext(previousIds = centerRows().map(item => item.id), currentId = state.center.selectedId) {
    const valid = centerRows();
    const remaining = valid.filter(item => item.id !== currentId);
    const oldIndex = previousIds.indexOf(currentId);
    const nextId = previousIds.slice(oldIndex + 1).find(id => remaining.some(item => item.id === id)) || remaining[0]?.id;
    if (nextId) centerSelect(nextId); else state.center.selectedId = null;
    return nextId;
  }

  function handleApprovalCenterAction(action, target) {
    if (!action.startsWith("center-")) return false;
    const center = state.center;
    if (action === "center-open") { state.modal = null; centerSelect(target.dataset.approvalId); }
    if (action === "center-view") { center.view = target.dataset.view; center.selectedId = null; }
    if (action === "center-exception-scope") { center.exceptionScope = target.dataset.scope === "all" && centerIsAdmin() ? "all" : "todo"; center.selectedId = null; }
    if (action === "center-view" && center.view === "exceptions") { center.exceptionScope = "todo"; center.filters.urgent = false; }
    if (["center-view", "center-exception-scope"].includes(action)) centerEnsureDefaultSelection();
    if (action === "center-stat") {
      center.view = target.dataset.view;
      if (center.view === "exceptions") center.exceptionScope = "todo";
      center.filters = centerDefaultFilters();
      center.draftQuery = "";
      center.draftTargetVersion = "";
      center.selectedId = null;
      centerEnsureDefaultSelection();
    }
    if (action === "center-toggle-filters") center.moreFilters = !center.moreFilters;
    if (action === "center-search") { center.filters.query = center.draftQuery ?? center.filters.query; center.filters.targetVersion = center.draftTargetVersion ?? center.filters.targetVersion; center.selectedId = null; centerEnsureDefaultSelection(); }
    if (action === "center-reset") { center.filters = centerDefaultFilters(); center.draftQuery = ""; center.draftTargetVersion = ""; center.selectedId = null; centerEnsureDefaultSelection(); }
    if (action === "center-refresh") { db = loadData(); centerEnsureDefaultSelection(); toast("审批状态已刷新"); }
    if (action === "center-reset-demo") {
      if (!centerIsAdmin()) { toast("仅系统管理员可以重置审批中心示例", "warning"); return true; }
      state.modal = { type: "centerResetDemo" };
    }
    if (action === "center-confirm-reset-demo") {
      if (state.modal?.type !== "centerResetDemo") return true;
      if (!centerIsAdmin()) { state.modal = null; renderShell(); toast("仅系统管理员可以重置审批中心示例", "warning"); return true; }
      db = loadData();
      if (!centerIsAdmin()) { state.modal = null; renderShell(); toast("当前身份已无重置权限，请刷新后重试", "warning"); return true; }
      db.approvals = db.approvals.filter(item => !String(item.id).startsWith("APR-CENTER-DEMO-"));
      delete db.approvalCenterDemoVersion;
      db = normalizeDatabase(db);
      persist();
      center.view = "todo";
      center.exceptionScope = "todo";
      center.selectedId = null;
      center.detailTab = "business";
      center.filters = centerDefaultFilters();
      center.draftQuery = "";
      center.draftTargetVersion = "";
      center.moreFilters = false;
      centerEnsureDefaultSelection();
      state.modal = null;
      state.errors = {};
      renderShell();
      toast("审批中心示例已按当前时间重新生成");
      return true;
    }
    if (action === "center-back") center.selectedId = null;
    if (action === "center-next") { if (!centerNext()) toast("当前队列已处理完毕"); }
    if (action === "center-rules") state.modal = { type: "centerRules" };
    if (action === "center-detail-tab" && ["business", "materials", "flow"].includes(target.dataset.tab)) center.detailTab = target.dataset.tab;
    if (action === "center-full-detail") openApprovalDetail(target.dataset.approvalId, { viewerId: center.viewerId, reminderScope: center.view === "mine" ? "mine" : "" });
    if (action === "center-remind") {
      db = loadData();
      const approval = approvalById(target.dataset.approvalId || center.selectedId);
      if (approval) center.selectedId = approval.id;
      if (!centerCanShowReminder(approval)) { renderShell(); toast("催办仅在“我发起的”中提供", "warning"); return true; }
      const result = sendApprovalReminder(approval, centerIdentity().name);
      renderShell();
      toast(result.ok ? `已向 ${result.recipients.join("、")} 发送钉钉催办通知` : result.message, result.ok ? "success" : "warning");
      return true;
    }
    if (action === "center-decision") {
      const approval = approvalById(center.selectedId), context = centerContext(approval), task = currentApprovalTask(approval);
      if (target.dataset.decision === "withdraw" ? !context.canWithdraw : !context.canDecide) { toast("当前任务已处理或当前身份没有操作权限", "warning"); return true; }
      state.errors = {};
      state.modal = { type: "centerDecision", approvalId: approval.id, decision: target.dataset.decision, expectedSequence: task?.sequence, centerReason: "", centerReasonCode: "", centerReasonNote: "" };
    }
    if (action === "center-confirm") {
      const modal = state.modal;
      if (modal?.type !== "centerDecision") return true;
      db = loadData();
      const approval = approvalById(modal.approvalId), context = centerContext(approval), task = currentApprovalTask(approval);
      if ((modal.decision === "withdraw" ? !context.canWithdraw : !context.canDecide) || task?.sequence !== modal.expectedSequence) { state.modal = null; renderShell(); toast("当前节点已处理或审批已结束，请查看最新结果", "warning"); return true; }
      let reason = String(modal.centerReason || "").trim();
      if (modal.decision === "withdraw") {
        const reasonError = withdrawalReasonError(modal.centerReasonCode, modal.centerReasonNote);
        if (reasonError) { state.errors.centerReason = reasonError; renderShell(); return true; }
        reason = withdrawalReasonText(modal.centerReasonCode, modal.centerReasonNote);
      } else if (modal.decision !== "approve" && !reason) { state.errors.centerReason = "请填写原因"; renderShell(); return true; }
      const queue = centerRows().map(item => item.id);
      let result;
      if (modal.decision === "approve") {
        result = approveCurrentApprovalTask(approval, { note: reason, viewerId: center.viewerId, expectedSequence: modal.expectedSequence });
        if (result.ok && result.complete) result = finishApprovalExecution(approval);
      } else if (modal.decision === "reject") result = rejectReleaseApproval(approval, reason, centerIdentity().name);
      else result = withdrawReleaseApproval(approval, reason, { code: modal.centerReasonCode, label: withdrawalReasonLabel(modal.centerReasonCode), note: modal.centerReasonNote });
      if (!result?.ok) { renderShell(); toast(result?.message || "操作未完成", "warning"); return true; }
      state.modal = null;
      state.errors = {};
      if (center.autoNext && approval.approvalStatus === "审批中") centerNext(queue, approval.id);
      renderShell();
      toast(modal.decision === "approve" && result.outcome === "stale" ? `审批已失效：${approval.executionMessage}` : modal.decision === "approve" && result.outcome === "execution-failed" ? `审批已通过，但执行失败：${approval.executionMessage}；须重新发起审批` : modal.decision === "approve" ? (approval.approvalStatus === "已通过" ? `审批已通过 · ${approval.executionStatus}` : "本节点已通过，下一节点已激活") : modal.decision === "reject" ? "审批已驳回，同级待办已关闭" : "申请已撤回，提醒已停止");
      return true;
    }
    if (action === "center-reapply") {
      db = loadData();
      const approval = approvalById(center.selectedId);
      if (!centerCanReapply(approval)) { renderShell(); toast("当前身份没有重新发起权限，或该异常已有后续申请", "warning"); return true; }
      state.errors = {};
      state.modal = { type: "centerReapplyDraft", approvalId: approval.id, newCurrentVersion: "", newTargetVersion: "", newDeviceCount: "", newModels: "", newReason: "", reminderPolicy: "", testReportFiles: [], rechecked: false };
    }
    if (action === "center-submit-reapply") {
      const modal = state.modal;
      if (modal?.type !== "centerReapplyDraft") return true;
      db = loadData();
      const result = submitCenterSampleReapplication(modal);
      if (!result.ok) { renderShell(); toast(result.message, "warning"); return true; }
      state.modal = null; centerSelect(result.approval.id);
      renderShell(); toast("新申请已提交；原异常已关联新申请，原审批结果保留"); return true;
    }
    if (action === "center-continue-reapply") {
      const modal = state.modal;
      if (modal?.type !== "centerReapplyDraft") return true;
      db = loadData();
      const approval = approvalById(modal.approvalId);
      if (!centerCanReapply(approval)) { state.modal = null; renderShell(); toast("权限或跟进状态已变化，请重新查看", "warning"); return true; }
      const identifier = db.identifiers.find(item => item.id === approval.firmwareId);
      if (!identifier || identifier.activeApproval) { toast("固件标识不存在或已有生效审批，请先查看当前固件状态", "warning"); return true; }
      state.selectedIdentifier = identifier.id;
      const metadata = { reapplySourceId: approval.id, reapplyViewerId: center.viewerId };
      if (approval.type === "publish") state.modal = { type: "selectPublishVersion", selectedVersion: "", ...metadata };
      else if (approval.type === "rollback") {
        const current = currentVersion(identifier), targetVersion = rollbackTarget(identifier);
        if (!current || !targetVersion || !identifier.rollbackAvailable) { toast("当前发布事件没有可用的唯一前序回滚目标", "warning"); return true; }
        state.modal = { type: "rollback", version: current.version, targetVersion: targetVersion.version, reminderPolicy: "", reason: "", platformReleaseNotes: targetVersion.platformReleaseNotes, ...metadata };
      } else {
        const current = currentVersion(identifier), event = activeRelease(identifier);
        if (!current || !event) { toast("当前没有可下架的正式发布版本", "warning"); return true; }
        state.modal = { type: "delist", version: current.version, sourceReleaseId: event.id, reasonType: "", reason: "", ...metadata };
      }
    }
    if (action === "center-resend") {
      db = loadData();
      const approval = approvalById(center.selectedId);
      if (!approval || !centerCanResend(approval)) { renderShell(); toast("当前身份不能补发，或通知已由其他管理员处理", "warning"); return true; }
      const task = currentApprovalTask(approval), pending = centerFailedNotifications(approval, true);
      const active = approval.approvalStatus === "审批中" && task;
      const recipients = active ? [...taskNames(task), approval.submitter] : terminalApprovalRecipients(approval);
      pending.forEach(item => recordApprovalNotification(approval, active ? `第 ${task.sequence} 级当前待办补发` : `当前结果补发：${approval.approvalStatus} · ${approval.executionStatus}`, recipients, "sent", { retryOf: item.id }));
      addOperation("审批通知", "补发当前通知", approval.instanceNo, centerIdentity().name, "成功", `本地示例补发 ${pending.length} 条，原失败记录保留；审批事实不变`); persist(); toast("已补发当前有效通知，原失败记录与业务结果保留");
    }
    renderShell();
    return true;
  }

  function finishApprovalExecution(approval) {
    if (approval.executionStatus === "执行成功") return { ok: true, version: approval.version, type: approval.type };
    if (approval.approvalStatus !== "已通过") return { ok: false, message: "审批尚未通过，不能执行" };
    const result = approval.prototypeSample ? { ok: true, version: approval.version, type: approval.type } : executeApprovedRelease(approval);
    if (result.ok && approval.prototypeSample) {
      approval.executionStatus = "执行成功";
      recordApprovalNotification(approval, "审批通过，示例执行成功", terminalApprovalRecipients(approval));
    } else if (!result.ok) {
      const reason = result.message || "业务执行未完成";
      if (result.kind === "stale") {
        // A failed pre-execution recheck invalidates the approval. Nothing is executed.
        closeApprovalInstance(approval, "已失效", reason);
        approval.executionMessage = reason;
      } else {
        // An execution transaction failure is a different terminal outcome: the approval
        // remains approved, while the business operation is recorded as failed and must
        // be re-submitted after a fresh data check.
        const task = currentApprovalTask(approval);
        const identifier = db.identifiers.find(item => item.id === approval.firmwareId);
        const actor = taskNames(task)[0] || approval.approver || "发布服务";
        restorePublishApprovalTarget(approval);
        if (identifier?.activeApproval?.approvalId === approval.id) identifier.activeApproval = null;
        approval.status = approval.approvalStatus = "已通过";
        approval.executionStatus = "执行失败";
        approval.executionMessage = reason;
        approval.terminalReason = "审批已通过，但业务执行失败；须重新核对后发起新的审批。";
        approval.approveTime ||= now();
        approval.remindersStopped = true;
        recordApprovalNotification(approval, "审批通过但执行失败", terminalApprovalRecipients(approval), "sent", { reason });
        addOperation("固件审批", "执行失败", approval.version, actor, "失败", reason);
        if (identifier) {
          setLifecycleFlowStatus(identifier, approval.flowId, "execution_failed");
          addLifecycleEvent(identifier, { flowId: approval.flowId, flowType: approval.type, flowStatus: "execution_failed", title: "业务执行失败", operator: "发布服务", operatorType: "系统", stage: "execution", result: "failed", summary: `${reason}；旧审批保留为已通过，须重新发起审批` });
        }
      }
    }
    persist();
    return { ...result, ok: true, executionOk: result.ok, outcome: result.ok ? "success" : result.kind === "stale" ? "stale" : "execution-failed" };
  }

  function renderApprovals() {
    const query = state.filters.approval.toLowerCase();
    const filtered = db.approvals.filter(item => (!query || item.version.toLowerCase().includes(query)) && (!state.filters.approvalStart || item.submitTime.slice(0, 10) >= state.filters.approvalStart) && (!state.filters.approvalEnd || item.submitTime.slice(0, 10) <= state.filters.approvalEnd));
    const pageSize = state.pageSizes.approvals;
    const rows = filtered.slice((state.approvalPage - 1) * pageSize, state.approvalPage * pageSize);
    return `<section class="page plain-page">${pageHeader("审批日志")}<div class="filter-bar"><input class="field search-field" data-draft="approval" value="${esc(state.draftFilters.approval ?? state.filters.approval)}" placeholder="固件版本号" aria-label="固件版本号"><div class="date-range"><input class="date-field" type="date" data-draft="approvalStart" value="${esc(state.draftFilters.approvalStart ?? state.filters.approvalStart)}" aria-label="开始日期"><span>至</span><input class="date-field" type="date" data-draft="approvalEnd" value="${esc(state.draftFilters.approvalEnd ?? state.filters.approvalEnd)}" aria-label="结束日期"></div><span class="action-with-rules"><button class="btn primary" data-action="query-approvals">查询</button>${ruleAnnotation("audit", "AUD-R06")}</span><button class="btn" data-action="reset-approvals">重置</button></div><div class="table-wrap"><table class="data-table approval-log-table"><thead><tr><th>固件版本号</th><th>审批类型</th><th>产品线</th><th>策略版本</th><th>提交人 / 时间</th><th>当前审批人 / 节点</th><th><span class="table-rule-header">审批状态${ruleAnnotation("audit", "AUD-R05")}</span></th><th>执行状态</th><th>操作</th></tr></thead><tbody>${rows.map(item => { const approvalStatus = item.approvalStatus || item.status; const statusClass = approvalStatus === "已通过" ? "success" : /驳回|撤回|失效|过期|超时/.test(approvalStatus) ? "danger" : "warning"; const executionClass = item.executionStatus === "执行成功" ? "success" : /失败|终止/.test(item.executionStatus) ? "danger" : "warning"; return `<tr><td><strong>${esc(item.version)}</strong></td><td>${esc(item.event)}</td><td>${esc(item.productLine || item.firmwareId?.split(".").slice(0, 3).join(".") || "-")}</td><td>${esc(item.policyVersion || "LEGACY")}</td><td>${esc(item.submitter)}<small class="table-subline">${esc(item.submitTime)}</small></td><td>${esc(approvalDisplayApprover(item))}<small class="table-subline">${(item.tasks || []).length} 级串行</small></td><td><span class="tag ${statusClass}">${esc(approvalStatus)}</span></td><td><span class="tag ${executionClass}">${esc(item.executionStatus || "-")}</span></td><td>${item.id ? `<button class="link-btn" data-action="open-approval-log" data-approval-id="${esc(item.id)}">详情</button>` : "-"}</td></tr>`; }).join("")}</tbody></table></div>${pagination(filtered.length, state.approvalPage, "approval-page", "approvals")}</section>`;
  }

  function renderUsers() {
    const query = state.filters.user.toLowerCase();
    const lineFilters = state.filters.userLines || [];
    const filtered = db.users.filter(item => (!query || item.name.toLowerCase().includes(query) || item.role.toLowerCase().includes(query)) && (!lineFilters.length || lineFilters.some(line => item.lines.includes(line))));
    const pageSize = state.pageSizes.users;
    const rows = filtered.slice((state.userPage - 1) * pageSize, state.userPage * pageSize);
    const draftLines = state.userLineDraft || lineFilters;
    const linePopover = state.popover === "userLine" ? `<div class="action-popover user-line-popover"><div class="user-line-options">${productLines.map(line => `<label class="check"><input type="checkbox" data-user-line-filter="${esc(line)}" ${draftLines.includes(line) ? "checked" : ""}>${esc(line)}</label>`).join("")}</div><div class="filter-popover-actions"><button class="btn small primary" data-action="apply-user-line-filter">筛选</button><button class="btn small" data-action="reset-user-line-filter">重置</button></div></div>` : "";
    return `<section class="page plain-page">${pageHeader("用户列表")}<div class="filter-bar"><input class="field search-field" data-draft="user" value="${esc(state.draftFilters.user ?? state.filters.user)}" placeholder="请输入用户账号名称，按enter搜索" aria-label="用户账号名称"><button class="btn primary" data-action="query-users">查询</button><button class="btn" data-action="reset-users">重置</button></div><div class="user-table-area"><div class="table-wrap"><table class="data-table"><thead><tr><th style="width:190px">账号名称</th><th style="width:150px">用户 ID</th><th style="width:170px">关联角色</th><th>所属产线 <button class="table-filter-btn ${lineFilters.length ? "active" : ""}" data-action="user-line-filter" aria-label="按所属产线过滤">▽</button></th><th style="width:100px">账号状态</th><th style="width:190px">创建时间</th><th style="width:245px">操作</th></tr></thead><tbody>${rows.map(item => `<tr><td>${esc(item.name)}</td><td>${esc(item.userId)}</td><td>${esc(item.role)}</td><td class="cell-truncate" title="${esc(item.lines.join(" / "))}">${esc(item.lines.join(" / "))}</td><td><span class="tag ${item.status === "active" ? "success" : ""}">${item.status === "active" ? "启用" : "停用"}</span></td><td>${esc(item.created)}</td><td><div class="cell-actions"><button class="link-btn" data-action="user-detail" data-user-index="${db.users.indexOf(item)}">详情</button><span class="action-with-rules"><button class="link-btn" data-action="user-permissions" data-user-index="${db.users.indexOf(item)}">权限配置</button>${ruleAnnotation("audit", "AUD-R04")}</span></div></td></tr>`).join("")}</tbody></table></div>${linePopover}</div>${pagination(filtered.length, state.userPage, "user-page", "users")}</section>`;
  }

  function newApprovalPolicyDraft(productLine, operation = "publish") {
    const operationLabel = approvalOperationLabel(operation);
    return {
      name: `${productLine} ${operationLabel}审批`,
      productLine,
      operation,
      description: "",
      operations: [operation],
      levelCount: 1,
      status: "enabled",
      copyUserIds: [],
      changeReason: "",
      nodes: [{ sequence: 1, type: "generic", approverUserId: "", approverName: "" }]
    };
  }

  function approvalPolicyIcon(operation) {
    const paths = {
      publish: '<path class="policy-preview-publish-shape" d="M20.8 3.4c-4.2.1-8.3 1.8-11.1 4.7l-3.4 3.4 4.2 1.9 1.9 4.2 3.4-3.4c2.9-2.8 4.6-6.9 4.7-11.1Z"/><path class="policy-preview-publish-shape" d="m8.8 16.7-2.7 2.7-.6-3.3-3.3-.6 2.7-2.7 3.9 1.4z"/><circle class="policy-preview-publish-hole" cx="16.4" cy="7.7" r="1.6"/>',
      rollback: '<path d="M9 7H4V2"/><path d="M4 7a8 8 0 1 1-1.2 6.8"/>',
      delist: '<path d="M5 7h14M9 7V4h6v3m-8 0 .8 12h6.4L15 7M10 10v6m4-6v6"/>'
    };
    return `<svg class="policy-preview-icon-${esc(operation || "publish")}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths[operation] || paths.publish}</svg>`;
  }

  function approvalEmptyIcon() {
    return '<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><path d="M19 11h23l10 10v29H19z"/><path d="M42 11v11h10M28 31h16M28 39h12"/><circle cx="46" cy="48" r="10"/><path d="M46 43v10M41 48h10"/></svg>';
  }

  function approvalGuideIcon() {
    return '<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><rect x="7" y="5" width="18" height="22" rx="2"/><path d="M11 11h10M11 16h8M11 21h5"/><path d="m22 20 2 2 4-5"/></svg>';
  }

  function policyFlowNodes(policy) {
    const nodes = Array.isArray(policy?.nodes) ? policy.nodes : [];
    if (!nodes.length) return '<span class="policy-flow-empty">暂未配置审批人</span>';
    return nodes.map((node, index) => {
      const name = node.approverName || `第${index + 1}级`;
      const initials = name.slice(0, 1);
      const nodeClass = ["amber", "blue", "purple", "pink", "indigo"][index % 5];
      return `${index ? '<span class="policy-flow-arrow" aria-hidden="true">→</span>' : ""}<span class="policy-flow-node"><span class="policy-flow-avatar ${nodeClass}">${esc(initials)}</span><span>${esc(name)}</span></span>`;
    }).join("");
  }

  function renderApprovalPolicies() {
    const productLine = state.selectedPolicyProductLine || productLines[0];
    const coverages = approvalOperationCatalog.map(operation => ({ operation: operation.value, operationLabel: operation.label, coverage: policyCoverage(productLine, operation.value) }));
    const lineItems = productLines.map(line => `<button class="policy-line-item ${line === productLine ? "active" : ""}" data-action="select-policy-line" data-product-line="${esc(line)}"><span>${esc(line)}</span></button>`).join("");
    const operationCards = coverages.map(item => {
      const coverage = item.coverage;
      const configured = coverage.status === "configured";
      const disabled = coverage.status === "disabled";
      const policy = coverage.policies[0];
      const cardStatus = configured ? "已启用" : disabled ? "已停用" : "未配置";
      const versionCode = policy ? policy.policyVersion.replace(`${policy.id}-`, "") : "--";
      const operationDescription = item.operation === "publish" ? "发布固件版本到线上设备" : item.operation === "rollback" ? "将设备版本回退到历史版本" : "下架已发布的固件版本";
      const actions = configured || disabled
        ? `<div class="policy-card-actions"><span class="action-with-rules"><button type="button" class="btn small" data-action="policy-version-history" data-policy-id="${esc(policy.id)}">版本记录</button>${ruleAnnotation("policy", "POL-R11")}</span><span class="action-with-rules"><button type="button" class="btn small ${disabled ? "primary" : ""}" data-action="toggle-approval-policy" data-policy-id="${esc(policy.id)}">${disabled ? "启用" : "停用"}</button>${ruleAnnotation("policy", "POL-R10")}</span><span class="action-with-rules"><button type="button" class="btn small primary" data-action="edit-approval-policy" data-policy-id="${esc(policy.id)}">编辑配置</button>${ruleAnnotation("policy", "POL-R03")}</span></div>`
        : "";
      const statusClass = configured ? "configured" : disabled ? "disabled" : "unconfigured";
      const operationColumn = `<div class="policy-row-operation"><span class="policy-operation-icon" aria-hidden="true">${approvalPolicyIcon(item.operation)}</span><div class="policy-row-operation-copy"><h3>${annotatedLabel(item.operationLabel, [["policy", "POL-R04"]])}</h3><p>${operationDescription}</p></div></div><span class="policy-card-status ${statusClass}"><i aria-hidden="true"></i>${cardStatus}</span>`;
      const configuredColumns = configured || disabled
        ? `<div class="policy-row-scheme"><div class="policy-row-column-head"><strong>${annotatedLabel("当前审批方案", [["policy", "POL-R04"]])}</strong></div><div class="policy-scheme-box"><strong>${esc(policy.name || "未命名方案")}</strong><dl><div><dt>方案说明</dt><dd title="${esc(policy.description || `用于${productLine}${item.operationLabel}的审批流程`)}">${esc(policy.description || `用于${productLine}${item.operationLabel}的审批流程`)}</dd></div></dl></div></div><div class="policy-row-flow"><div class="policy-row-column-head"><strong>${annotatedLabel(`审批流程（${policy.levelCount || policy.nodes?.length || 0}级）`, [["policy", "POL-R05"]])}</strong></div><div class="policy-flow">${policyFlowNodes(policy)}</div></div><div class="policy-row-version"><div class="policy-row-column-head"><strong>${annotatedLabel("版本信息", [["policy", "POL-R09"], ["policy", "POL-R11"]])}</strong></div><div class="policy-version-meta"><div><span>当前版本</span><strong>${esc(versionCode)}</strong></div><div><span>更新时间</span><strong>${esc(policy.updatedAt || "--")}</strong></div><div><span>更新人</span><strong>${esc(policy.updatedBy || "--")}</strong></div></div></div>`
        : `<div class="policy-row-unconfigured"><div class="policy-empty-icon">${approvalEmptyIcon()}</div><div class="policy-empty-copy"><strong>尚未配置审批方案</strong><p>配置后，${item.operationLabel}需审批通过才能执行</p><p>未配置时禁止提交，请先配置有效审批方案。</p></div><span class="action-with-rules"><button type="button" class="btn primary policy-config-btn" data-action="new-approval-policy" data-operation="${esc(item.operation)}">去配置</button>${ruleAnnotation("policy", "POL-R02")}</span></div>`;
      return `<article class="policy-operation-card policy-operation-row ${item.operation} ${coverage.status}" data-policy-operation-card="${esc(item.operation)}"><div class="policy-card-hero">${operationColumn}</div><div class="policy-card-body">${configuredColumns}</div>${actions}</article>`;
    }).join("");
    const guideItems = [
      "每个操作只能配置一套审批方案，不支持多个操作共用方案。",
      "首次保存方案后默认处于已启用状态，后续新申请将按当前方案进入审批。",
      "修改方案配置会生成新的版本，历史版本可在版本记录中查看。",
      "停用方案后阻断新申请；在途审批使用原快照继续流转，历史记录保留。"
    ];
    return `<section class="page policy-page"><div class="policy-layout"><aside class="policy-line-panel" aria-label="产品线"><h2>${annotatedLabel("产品线", [["policy", "POL-R01"]])}</h2><div class="policy-line-list">${lineItems}</div></aside><main class="policy-main"><header class="policy-overview"><div class="policy-overview-copy"><div class="policy-title-row"><h1>${annotatedLabel("审批配置", [["policy", "POL-R01"]])}</h1><span class="policy-product-line-tag" aria-label="当前产品线：${esc(productLine)}">${esc(productLine)}</span></div><p>发布、回滚、下架均需审批；未配置或已停用时禁止提交。</p></div></header><section class="policy-operation-section policy-operation-only-section"><div class="policy-operation-cards">${operationCards}</div><section class="policy-usage-guide"><div class="policy-guide-mark">${approvalGuideIcon()}</div><div class="policy-guide-copy"><h2>${annotatedLabel("使用说明", [["policy", "POL-R01"]])}</h2><ol>${guideItems.map(item => `<li>${esc(item)}</li>`).join("")}</ol></div><div class="policy-guide-illustration" aria-hidden="true"><span class="guide-document">▤</span><span class="guide-shield">✓</span><span class="guide-hill hill-a"></span><span class="guide-hill hill-b"></span></div></section></section></main></div></section>`;
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
      return `<tr><td><label class="check"><input type="checkbox" data-permission="${esc(menuKey)}" data-prefix="${prefix}" ${checked(menuKey) ? "checked" : ""} ${editable && !system ? "" : "disabled"}>${esc(row.menu)}</label></td><td>${row.page ? `<label class="check"><input type="checkbox" data-permission="${esc(pageKey)}" data-prefix="${prefix}" ${checked(pageKey) ? "checked" : ""} ${editable && !system ? "" : "disabled"}>${esc(row.page)}</label>` : "-"}</td><td><div class="check-grid">${row.actions.length ? row.actions.map(action => { const key = `action-${action}`; const adminOnly = systemAdminOnlyActions.has(action); return `<label class="check ${adminOnly ? "admin-only-permission" : ""}" ${adminOnly ? `title="仅系统管理员可执行"` : ""}><input type="checkbox" data-permission="${esc(key)}" data-prefix="${prefix}" ${system || (!adminOnly && checked(key)) ? "checked" : ""} ${editable && !system && !adminOnly ? "" : "disabled"}>${esc(action)}${adminOnly ? `<small>管理员专属</small>` : ""}</label>`; }).join("") : "-"}</div></td></tr>`;
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
      "选择配置功能": [["version", "VER-R03"], ["version", "VER-R09"], ["version", "VER-R10"]],
      "警告提示": [["differential", "DIF-R07"], ["differential", "DIF-R08"]],
      "新增角色": [["audit", "AUD-R04"]],
      "编辑角色": [["audit", "AUD-R04"]],
      "编辑功能关联": [["version", "VER-R03"]],
      "维护 APP 更新说明": [["locale", "LOC-R07"]],
      "新增固件版本": [["version", "VER-R04"], ["version", "VER-R17"]],
      "编辑固件版本": [["version", "VER-R07"], ["version", "VER-R17"]],
      "新建审批方案": [["policy", "POL-R02"], ["policy", "POL-R04"], ["policy", "POL-R05"]],
      "编辑审批方案": [["policy", "POL-R03"], ["policy", "POL-R09"]],
      "方案版本记录": [["policy", "POL-R11"]],
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
    const featureModal = body.includes("feature-picker-modal");
    const approvalDetailModal = /审批详情$/.test(title);
    // Any modal opened above a drawer must sit above the drawer's secondary mask.
    const nestedModal = nested || Boolean(state.drawer);
    return `<section class="modal ${wide ? "wide" : ""} ${approvalDetailModal ? "approval-detail-modal" : ""} ${body.includes('class="app-reminder-layout"') ? "release-modal" : ""} ${featureModal ? "feature-modal" : ""} ${nestedModal ? "nested-modal" : ""} ${animateCurrentModal ? "is-entering" : ""}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><header class="dialog-header"><div class="frame-title-with-rules"><h2>${esc(title)}</h2>${featureModal ? "" : ruleAnnotations(frameRuleItems(title, "modal"))}</div><button class="close-btn" data-action="${nestedModal ? "close-modal" : "close-overlay"}" aria-label="关闭">×</button></header><div class="dialog-body">${body}</div>${footer ? `<footer class="dialog-footer">${footer}</footer>` : ""}</section>`;
  }

  function drawerFrame(title, body, footer = "", narrow = false, options = {}) {
    const approvalDetail = /审批详情$/.test(title);
    const backButton = options.backAction ? `<button type="button" class="drawer-back-button" data-action="${esc(options.backAction)}" aria-label="${esc(options.backLabel || "返回审批日志")}" title="${esc(options.backLabel || "返回审批日志")}">‹</button>` : "";
    const subtitle = options.subtitle ? `<span class="drawer-title-meta">${esc(options.subtitle)}</span>` : "";
    return `<section class="drawer ${narrow ? "narrow" : ""} ${approvalDetail ? "approval-detail-drawer" : ""} ${animateCurrentDrawer ? "is-entering" : ""}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><header class="drawer-header"><div class="drawer-header-main">${backButton}<div class="frame-title-with-rules"><h2>${esc(title)}</h2>${subtitle}${ruleAnnotations(frameRuleItems(title, "drawer"))}</div></div><button class="close-btn" data-action="close-overlay" aria-label="关闭">×</button></header><div class="drawer-body">${body}</div>${footer ? `<footer class="drawer-footer">${footer}</footer>` : ""}</section>`;
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
      return `<div class="feature-snapshot-row ${changed ? "changed" : ""}"><span>${esc(next?.name || previous?.name || id)}</span><strong>${changed ? `${esc(previousValue)} <b>→</b> ${esc(targetValue)}` : esc(targetValue)}</strong><p>${esc(next?.versionDescription || previous?.versionDescription || "-")}</p><em>${changed ? next ? previous ? "版本变化" : "新增" : "移除" : "无变化"}</em></div>`;
    });
    const changedCount = ids.filter(id => currentFeatures.get(id)?.featureVersionId !== targetFeatures.get(id)?.featureVersionId).length;
    return `<section class="publish-snapshot"><div class="publish-snapshot-head"><div><h3>${annotatedLabel("发布内容快照", [["publish", "PUB-R04"]])}</h3><span>提交后与提醒策略一起进入审批快照</span></div><strong>功能项 ${targetFeatures.size} 项 · ${changedCount} 项变化</strong></div><div class="publish-summary-grid"><span>${annotatedLabel("预计影响设备", [["identifier", "FID-R04"]])}<strong>${formatDeviceCount(target.associatedDeviceCount)} 台</strong></span><span>适用机型<strong>${esc(target.models)}</strong></span><span>平台发布说明<strong>${esc(target.platformReleaseNotes)}</strong></span></div><div class="feature-snapshot"><div class="feature-snapshot-head"><span>功能项</span><strong>当前版本 → 目标版本</strong><p>版本说明</p><em>结果</em></div>${rows.join("") || `<div class="feature-snapshot-empty">目标版本未配置功能项</div>`}</div></section>`;
  }

  function renderMaterialUploadField(fieldId, files, rule, errorKey, readonly = false, materialKind = errorKey) {
    const list = Array.isArray(files) ? files : [];
    const rows = list.length ? `<div class="approval-material-list">${list.map((file, index) => `<div class="approval-material-item"><span class="approval-material-icon">▤</span><div><strong title="${esc(file.name)}">${esc(file.name)}</strong><small>${esc(file.sizeMb || ((Number(file.size || 0) / 1024 / 1024).toFixed(2)))} MB · ${esc(file.uploadedAt || "已随审批快照保存")}</small></div><div class="approval-material-actions"><button class="link-btn" type="button" data-action="preview-approval-material" data-material-kind="${esc(materialKind)}" data-material-index="${index}">预览</button>${readonly ? "" : `<button class="link-btn danger-link" type="button" data-action="remove-approval-material" data-material-kind="${esc(materialKind)}" data-material-index="${index}">移除</button>`}</div></div>`).join("")}</div>` : `<div class="approval-material-empty">尚未上传${rule.label}</div>`;
    return `<section class="approval-material-upload ${readonly ? "readonly" : ""}"><div class="field-rule-row"><div><strong>${esc(rule.label)}</strong><span>支持 PDF、DOC/DOCX、XLS/XLSX；最多 ${rule.maxFiles} 个，单个不超过 ${rule.maxSizeMb} MB</span></div>${readonly ? `<span class="tag blue">快照只读</span>` : `<label class="btn small"><input id="${fieldId}" class="hidden" type="file" multiple accept=".${rule.extensions.join(',.')}">上传附件</label>`}</div>${rows}${errorKey ? errorFor(errorKey) : ""}</section>`;
  }

  function renderRollbackResultModal(modal) {
    return modalFrame("固件回滚成功", `<div class="approval-submit-result rollback-result"><div class="approval-result-icon">✓</div><h3>${esc(modal.version)} 已恢复为当前发布版本</h3></div>`, `<button class="btn primary" data-action="close-overlay">完成</button>`, true);
  }

  function renderDelistResultModal(modal) {
    return modalFrame("固件版本下架成功", `<div class="approval-submit-result delist-result"><div class="approval-result-icon">✓</div><h3>${esc(modal.version)} 已停止作为当前发布版本</h3><p>当前状态为“暂无当前发布版本”，固件包和已升级设备不受影响。</p></div>`, `<button class="btn primary" data-action="close-overlay">完成</button>`, true);
  }

  function materialExtension(file) {
    return String(file?.name || "").split(".").pop()?.toLowerCase() || "";
  }

  function materialPreviewFile(request) {
    const approval = request.approvalId ? approvalById(request.approvalId) : null;
    const files = request.materialKind === "meetingMinutes"
      ? approval?.meetingMinutesFiles
      : approval?.testReportFiles || (state.modal?.type === "publish" ? state.modal.testReportFiles : []);
    return files?.[Number(request.materialIndex)] || null;
  }

  function materialPreviewBody(file) {
    const runtime = file?.id ? runtimeMaterialPreviews.get(file.id) : null;
    const extension = materialExtension(file);
    const type = runtime?.type || file?.type || (extension === "pdf" ? "application/pdf" : "");
    if (runtime?.url && type === "application/pdf") {
      return `<div class="material-preview-frame"><iframe src="${esc(runtime.url)}" title="${esc(file.name)}" loading="lazy"></iframe></div>`;
    }
    if (runtime?.url && type.startsWith("image/")) {
      return `<div class="material-preview-image"><img src="${esc(runtime.url)}" alt="${esc(file.name)}"></div>`;
    }
    const sampleTitle = extension === "pdf" ? "PDF 示例预览" : "附件信息预览";
    const sampleHint = runtime?.url ? "当前格式无法在浏览器内直接排版，仍可下载原文件查看。" : file?.id ? "原文件内容未随浏览器刷新保留，请重新上传后预览。" : "这是示例审批材料的结构化预览；实际上传文件可在当前会话中打开。";
    return `<div class="material-preview-paper"><header><span>${esc(sampleTitle)}</span><em>${file?.id && !runtime?.url ? "需要重新上传" : "本地交互演示"}</em></header><div class="material-preview-paper-title">${esc(file?.name || "审批材料")}</div><div class="material-preview-meta"><span>材料类型<strong>${esc(type || extension.toUpperCase() || "附件")}</strong></span><span>文件大小<strong>${esc(file?.sizeMb || "—")} MB</strong></span><span>上传时间<strong>${esc(file?.uploadedAt || "—")}</strong></span></div><div class="material-preview-copy"><strong>${extension === "pdf" ? "材料摘要" : "查看说明"}</strong><p>${esc(sampleHint)}</p><p>${extension === "pdf" ? "审批人可在此核对材料标题、版本、影响范围和结论摘要。" : "审批人可下载文件后使用本地办公软件查看完整内容。"}</p></div>${runtime?.url ? `<a class="btn primary material-preview-download" href="${esc(runtime.url)}" download="${esc(file.name)}">下载原文件</a>` : ""}</div>`;
  }

  function renderMaterialPreviewModal(modal) {
    const request = modal.type === "materialPreview" ? modal : modal.materialPreview;
    const file = materialPreviewFile(request || {});
    if (!file) return modalFrame("材料预览", `<div class="empty-state compact-empty"><div>附件记录不存在，请刷新后重试。</div></div>`, `<button class="btn primary" data-action="close-modal">关闭</button>`, true, true);
    return modalFrame(`材料预览 · ${file.name}`, materialPreviewBody(file), `<button class="btn primary" data-action="close-modal">关闭</button>`, true, true);
  }

  function renderApprovalSimulation(modal) {
    const approval = approvalById(modal.approvalId);
    const drawerOptions = modal.returnDrawer ? { backAction: "back-to-version-approvals", backLabel: "返回审批日志" } : {};
    if (!approval) return drawerFrame("审批详情", `<div class="empty-state compact-empty"><div>审批记录已不存在</div></div>`, `<button class="btn primary" data-action="close-overlay">关闭</button>`, false, drawerOptions);
    const rollback = approval.type === "rollback";
    const delist = approval.type === "delist";
    const publish = approval.type === "publish";
    const actionLabel = delist ? "下架" : rollback ? "回滚" : "发布";
    const viewerContext = approvalViewerContext(approval, modal.viewerId);
    const canRemind = modal.reminderScope === "mine" && viewerContext.canRemind && viewerContext.isSubmitter;
    const detailViewerContext = { ...viewerContext, canRemind };
    const viewerBar = renderApprovalViewerSwitch(approval, modal, detailViewerContext);
    const snapshot = delist
      ? `<div class="approval-snapshot"><span>审批事件<strong>${esc(approval.event)}</strong></span><span>下架版本<strong>${esc(approval.version)}</strong></span><span>关联设备快照<strong>${formatDeviceCount(approval.associatedDeviceCount)} 台</strong></span><span>适用机型<strong>${esc(approval.models)}</strong></span><span>下架原因<strong>${esc(approval.reasonType)}</strong></span><span>提交人<strong>${esc(approval.submitter)}</strong></span><span>提交时间<strong>${esc(approval.submitTime)}</strong></span><span>具体说明<strong>${esc(approval.reason)}</strong></span></div>`
      : `<div class="approval-snapshot"><span>审批事件<strong>${esc(approval.event)}</strong></span><span>目标版本<strong>${esc(approval.version)}</strong></span><span>APP 提醒<strong>${esc(reminderLabel(approval.reminderPolicy))}</strong></span><span>APP 说明<strong>${Object.keys(approval.appReleaseNotes || {}).length} 种语言</strong></span><span>功能项<strong>${(approval.associatedFeatures || []).length} 项配置</strong></span><span>提交人<strong>${esc(approval.submitter)}</strong></span><span>提交时间<strong>${esc(approval.submitTime)}</strong></span></div>`;
    const tasks = approval.tasks || [];
    const activeTask = currentApprovalTask(approval);
    const taskRows = tasks.map(task => {
      const statusClass = task.status === "已通过" ? "success" : task.status === "已驳回" ? "danger" : task.status === "审批中" ? "blue" : "";
      const active = task.status === "审批中";
      const timing = task.status === "审批中" ? (canRemind ? "发起人可按需催办当前节点" : "等待当前节点处理") : task.completedAt && task.completedAt !== "-" ? esc(task.completedAt) : "等待上一级通过";
      const decision = task.decision ? `<small class="approval-task-decision">${esc(task.decision)}${task.decisionNote ? `：${task.decisionNote}` : ""}</small>` : "";
      const people = taskPeople(task);
      const names = people.map(person => person.name).join("、") || task.approverNameSnapshot || "历史审批人";
      const ids = people.map(person => person.userId).filter(Boolean).join("、") || "历史用户";
      return `<div class="approval-task-row ${active ? "active" : ""}"><span class="approval-task-index">${task.sequence}</span><div><span class="approval-node-role">${esc(approvalTaskRoleLabel(approval, task))}</span><strong>${esc(names)}</strong><small>${esc(ids)} · ${people.length} 人或签</small>${decision}</div><div><span class="tag ${statusClass}">${esc(task.status)}</span><small>${timing}</small></div><span></span></div>`;
    }).join("");
    const executionClass = approval.executionStatus === "执行成功" ? "success" : approval.executionStatus === "执行失败" || approval.executionStatus === "已终止" ? "danger" : "warning";
    const headerCopy = approval.executionStatus === "执行失败" ? "业务执行失败，须重新发起审批" : approval.approvalStatus === "审批中" ? `等待${approvalTaskRoleLabel(approval, activeTask)}处理` : `${approval.approvalStatus} · ${approval.executionStatus}`;
    const failureNotice = approval.executionStatus === "执行失败" ? `<div class="execution-failure-notice"><strong>审批已通过，业务执行未完成</strong><span>${esc(approval.executionMessage || "版本状态复检或发布事务执行失败")}。旧审批记录只读保留，须重新发起审批。</span></div>` : "";
    const canEditMinutes = viewerContext.canUploadMinutes;
    const materials = publish ? `<section class="approval-audit-materials" data-approval-section="materials"><div class="policy-section-head"><div><h3>审计材料</h3><span>提交后形成只读快照；材料变更需撤回并重新发起审批</span></div><span class="approval-section-count">${(approval.testReportFiles || []).length + (approval.meetingMinutesFiles || []).length} 个附件</span></div>${renderMaterialUploadField("approval-test-report-readonly", approval.testReportFiles || [], releaseMaterialRules.testReport, "", true, "testReport")}${renderMaterialUploadField("meeting-minutes-file", approval.meetingMinutesFiles || [], releaseMaterialRules.meetingMinutes, "meetingMinutes", !canEditMinutes, "meetingMinutes")}</section>` : "";
    const decisionPanel = viewerContext.canDecide ? `<section class="approval-decision-panel" data-approval-section="decision"><div class="approval-decision-heading"><div><span>当前待你审批的节点</span><strong>${esc(approvalTaskRoleLabel(approval, activeTask))} · ${esc(activeTask?.approverNameSnapshot || "-")}</strong></div><span class="tag blue">${esc(activeTask?.status || "审批中")}</span></div><div class="approval-decision-help"><span class="approval-decision-help-icon">i</span><span>请先核对审计材料，再提交审批结果。审批通过时意见可不填，驳回时必须填写原因。</span></div><div class="form-field"><label>审批意见 <span class="optional-label">（审批通过时选填）</span></label><textarea class="textarea" data-modal-field="approvalNote" maxlength="300" placeholder="可填写审核结论或补充说明">${esc(modal.approvalNote || "")}</textarea><div class="helper align-right">${String(modal.approvalNote || "").length} / 300</div></div><div class="form-field required"><label>驳回原因</label><textarea class="textarea" data-modal-field="rejectionReason" maxlength="300" placeholder="点击审批驳回时必填">${esc(modal.rejectionReason || "")}</textarea>${errorFor("rejectionReason")}<div class="helper align-right">${String(modal.rejectionReason || "").length} / 300</div></section>` : "";
    const footerActions = [`<button class="btn" data-action="close-overlay">关闭</button>`];
    if (viewerContext.canWithdraw) footerActions.push(`<button class="btn danger-outline" data-action="request-withdraw-approval">撤回申请</button>`);
    if (canRemind) {
      const reminder = approvalReminderState(approval);
      footerActions.push(`<button class="btn" data-action="remind-approval" ${reminder.allowed ? "" : "disabled"}>${reminder.allowed ? "催办审批人" : `已催办 · ${reminder.remainingMinutes} 分钟后可再次催办`}</button>`);
    }
    if (viewerContext.canDecide) {
      const missingMinutes = publish && activeTask?.sequence === 1 && !(approval.meetingMinutesFiles || []).length;
      footerActions.push(`<button class="btn danger" data-action="simulate-approval-reject">审批驳回</button>`);
      footerActions.push(`<button class="btn primary" data-action="simulate-approval-approve" ${missingMinutes ? "disabled" : ""}>审批通过</button>`);
    }
    const approvalClass = approval.approvalStatus === "已通过" ? "success" : /驳回|撤回/.test(approval.approvalStatus) ? "danger" : "blue";
    const sectionNav = `<nav class="approval-section-nav" aria-label="审批详情分区"><span>快速定位</span>${publish ? `<button type="button" data-action="approval-scroll-section" data-target="materials">审计材料</button>` : ""}<button type="button" data-action="approval-scroll-section" data-target="flow">审批流转</button>${viewerContext.canDecide ? `<button type="button" data-action="approval-scroll-section" data-target="decision">填写审批</button>` : ""}</nav>`;
    const focusStrip = activeTask ? `<div class="approval-focus-strip"><span class="approval-focus-kicker">当前处理节点</span><div><strong>${esc(approvalTaskRoleLabel(approval, activeTask))} · ${esc(activeTask.approverNameSnapshot || "-")}</strong><small>第 ${activeTask.sequence} 级 · ${canRemind ? "发起人可按需催办" : "等待当前节点处理"}</small></div><span class="tag blue">${esc(activeTask.status)}</span></div>` : `<div class="approval-focus-strip terminal"><span class="approval-focus-kicker">审批结果</span><div><strong>${esc(approval.approvalStatus)}</strong><small>${esc(approval.executionStatus)} · ${esc(approval.approveTime && approval.approveTime !== "-" ? approval.approveTime : approval.submitTime)}</small></div><span class="tag ${approvalClass}">${esc(approval.approvalStatus)}</span></div>`;
    const footerHint = viewerContext.canDecide
      ? `<strong>当前节点：${esc(approvalTaskRoleLabel(approval, activeTask))}</strong><span>${publish && activeTask?.sequence === 1 && !(approval.meetingMinutesFiles || []).length ? "请先上传会议纪要附件" : "确认审批结果后提交"}</span>`
      : `<strong>${esc(approval.instanceNo || approval.id)}</strong><span>${viewerContext.canWithdraw && canRemind ? "可催办或撤回本次申请" : viewerContext.canWithdraw ? "可撤回本次申请" : canRemind ? "可催办当前节点" : "当前为只读查看"}</span>`;
    const footer = `<div class="approval-footer-context">${footerHint}</div><div class="approval-footer-actions">${footerActions.join("")}</div>`;
    const replacementBoundary = `<div class="approval-replacement-boundary locked"><strong>审批节点快照已锁定</strong><span>节点内任一人通过即可流转；发起人不可自审；本期不支持重新分派、审批人替换或临时代理。</span></div>`;
    return drawerFrame(`${actionLabel}审批详情`, `${ruleContextBar([delist ? "delist" : rollback ? "rollback" : "publish", "concurrency"])}${viewerBar}${focusStrip}${sectionNav}<div class="approval-instance-head"><div><span>${esc(approval.policyNameSnapshot || "历史审批方案")} · ${esc(approval.instanceNo || approval.id)}</span><h3>${esc(headerCopy)}</h3></div><div><span class="tag ${approvalClass}">${esc(approval.approvalStatus)}</span><span class="tag ${executionClass}">${esc(approval.executionStatus)}</span></div></div>${failureNotice}${snapshot}${materials}<section class="approval-task-section" data-approval-section="flow"><div class="policy-section-head"><div><h3>审批流转</h3><span>${esc(approval.policyVersion)} · ${tasks.length} 级串行 · 节点快照已冻结</span></div></div>${replacementBoundary}<div class="approval-task-list">${taskRows}</div></section>${decisionPanel}<div class="prototype-simulation-note">角色切换仅用于原型权限演示；钉钉通知仅作为外部提醒，不在审批详情中展示通知记录。</div>`, footer, false, drawerOptions);
  }

  function renderModal() {
    const modal = state.modal;
    if (modal.type === "materialPreview" || modal.materialPreview) return renderMaterialPreviewModal(modal);
    if (["centerDecision", "centerRules", "centerReapplyDraft", "centerResetDemo"].includes(modal.type)) return renderCenterModal(modal);
    if (modal.type === "approvalPolicyToggle") {
      const policy = db.approvalPolicies.find(item => item.id === modal.policyId);
      if (!policy) return modalFrame("审批方案状态变更", `<div class="empty-state compact-empty"><div>审批方案已不存在，请刷新后重试。</div></div>`, `<button class="btn primary" data-action="close-overlay">关闭</button>`);
      const enabling = modal.nextStatus === "enabled";
      const operationLabel = approvalOperationLabel(policyOperation(policy));
      const title = enabling ? "启用审批方案" : "停用审批方案";
      const summary = `<div class="confirm-summary"><span>审批操作<strong>${esc(operationLabel)}</strong></span><span>当前版本<strong>${esc(policy.policyVersion || "-")}</strong></span><span>变更后状态<strong>${enabling ? "已启用" : "已停用"}</strong></span></div>`;
      const copy = enabling
        ? "启用后，该产品线的对应操作将进入审批流程；后续新发起的请求会读取当前版本配置，已受理的请求继续按受理时的执行路径处理。"
        : "停用后，该产品线对应操作的新申请将被阻断；已受理的审批继续使用提交时的方案快照，历史记录保留。";
      return modalFrame(title, `<div class="approval-policy-confirm ${enabling ? "warning-state" : "danger-state"}"><div class="confirm-icon">!</div><h3>${enabling ? "确认启用当前审批方案？" : "确认停用当前审批方案？"}</h3><p>${copy}</p>${summary}</div>`, `<button class="btn" data-action="close-overlay">取消</button><button class="btn ${enabling ? "primary" : "danger"}" data-action="confirm-approval-policy-toggle">${enabling ? "确认启用" : "确认停用"}</button>`);
    }
    if (modal.type === "approvalPolicySaved") {
      const policy = db.approvalPolicies.find(item => item.id === modal.policyId);
      const operationLabel = approvalOperationLabel(modal.operation || policy?.operation);
      const enabled = modal.status === "enabled";
      const statusText = enabled ? "已启用" : "已停用";
      const statusCopy = enabled
        ? "方案将保持已启用，新发起的审批请求将使用该版本配置。"
        : "方案当前为已停用，启用后新发起的审批请求将使用该版本配置。";
      const summary = `<div class="confirm-summary"><span>审批操作<strong>${esc(operationLabel)}</strong></span><span>保存版本<strong>${esc(modal.policyVersion || "-")}</strong></span><span>当前状态<strong>${statusText}</strong></span></div>`;
      return modalFrame("审批方案保存成功", `<div class="approval-policy-confirm success-state"><div class="confirm-icon">✓</div><h3>配置已保存并生成新版本</h3><p>${statusCopy}</p>${summary}</div>`, `<button class="btn primary" data-action="close-overlay">我知道了</button>`);
    }
    if (modal.type === "withdrawApproval") {
      const approval = approvalById(modal.approvalId);
      if (!approval || approval.approvalStatus !== "审批中") return modalFrame("撤回审批申请", `<div class="empty-state compact-empty"><div>该审批已结束，不能撤回</div></div>`, `<button class="btn primary" data-action="close-overlay">关闭</button>`);
      return modalFrame("撤回审批申请", `<div class="withdraw-approval-summary"><span>审批单<strong>${esc(approval.instanceNo || approval.id)}</strong></span><span>固件版本<strong>${esc(approval.version)}</strong></span><span>当前节点<strong>${esc(approvalTaskRoleLabel(approval, currentApprovalTask(approval)))}</strong></span></div>${renderWithdrawalReasonFields("withdrawalReasonCode", "withdrawalReasonNote", modal.withdrawalReasonCode, modal.withdrawalReasonNote, errorFor("withdrawalReason"))}`, `<button class="btn" data-action="cancel-withdraw-approval">取消</button><button class="btn danger" data-action="confirm-withdraw-approval">确认撤回</button>`);
    }
    if (modal.type === "discardVersionChanges") {
      return modalFrame("放弃未保存的修改？", `<p class="confirm-copy">当前版本信息尚未保存，关闭后本次修改将丢失。</p>`, `<button class="btn" data-action="close-modal">继续编辑</button><button class="btn danger" data-action="confirm-discard-version">放弃修改</button>`, false, true);
    }
    if (modal.type === "discardApprovalPolicyChanges") {
      return modalFrame("放弃未保存的修改？", `<p class="confirm-copy">审批方案存在未保存的修改，关闭后本次配置将丢失。</p>`, `<button class="btn" data-action="close-modal">继续编辑</button><button class="btn danger" data-action="confirm-discard-version">放弃修改</button>`, false, true);
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
      const policy = activeApprovalPolicy(identifier.product, "publish");
      const approverSummary = policy?.nodes?.map((node, index) => `${index + 1}. ${node.approverName || "待配置"}`).join(" → ") || "未配置";
      return modalFrame("提交固件发布审批", `<div class="release-impact"><div><span>当前发布版本</span><strong>${esc(current?.version || "-")}</strong></div><div class="impact-arrow">→</div><div><span>${annotatedLabel("目标发布版本", [["publish", "PUB-R03"]])}</span><strong>${esc(targetVersion.version)}</strong></div></div><div class="formal-release-boundary"><strong>正式发布需完成审批与材料审计</strong><span>提交后测试报告进入不可替换的审批快照；第 1 级审批节点须上传会议纪要，各级按方案顺序全部通过后自动正式发布。</span></div><div class="release-approval-summary"><span>审批顺序<strong>${esc(approverSummary)}</strong></span><span>终态抄送<strong>${policy?.copyUserIds?.length ? `${policy.copyUserIds.length} 位用户` : "未配置"}</strong></span></div>${renderMaterialUploadField("test-report-file", modal.testReportFiles || [], releaseMaterialRules.testReport, "testReport")}<div class="app-reminder-layout"><div class="publish-primary-column"><section class="app-reminder-choice"><div class="field-rule-row"><div class="section-label required">APP 提醒方式</div>${ruleAnnotations([["reminder", "REM-R01"], ["reminder", "REM-R03"]])}</div>${renderReminderOptions(modal.reminderPolicy)}${errorFor("reminderPolicy")}</section>${renderReleaseSnapshot(current, targetVersion)}</div>${renderAppReminderPreview(modal, targetVersion)}</div>`, `<button class="btn" data-action="close-overlay">取消</button><span class="action-with-rules"><button class="btn primary" data-action="confirm-publish">提交发布审批</button>${ruleAnnotations([["publish", "PUB-R03"], ["concurrency", "CON-R01"]])}</span>`, true);
    }
    if (modal.type === "rollback") {
      const identifier = activeIdentifier();
      const current = currentVersion(identifier);
      const targetVersion = rollbackTarget(identifier);
      const currentLocales = Object.keys(current.appReleaseNotes || {});
      const targetLocales = Object.keys(targetVersion.appReleaseNotes || {});
      return modalFrame("撤销并回滚版本", `<div class="rollback-heading"><strong>${annotatedLabel(`当前版本 ${current.version} 将被撤销`, [["rollback", "RBK-R01"], ["rollback", "RBK-R02"]])}</strong><span>审批通过后恢复至唯一回滚目标 ${esc(targetVersion.version)}</span></div><div class="rollback-compare"><div class="compare-head"><span>${annotatedLabel("对比项", [["rollback", "RBK-R03"]])}</span><strong>当前发布版本</strong><strong>回滚目标版本</strong><span>变化</span></div>${[["固件版本号", current.version, targetVersion.version, "切换目标"], ["版本状态", "当前发布", "历史发布", "恢复生效"], ["适用机型", current.models, targetVersion.models, current.models === targetVersion.models ? "无变化" : "存在差异"], ["功能项配置", `${current.associatedFeatures.length} 项`, `${targetVersion.associatedFeatures.length} 项`, current.associatedFeatures.length === targetVersion.associatedFeatures.length ? "无变化" : "存在差异"], ["APP 说明", `${currentLocales.length} 种语言`, `${targetLocales.length} 种语言`, sameValues(currentLocales, targetLocales) ? "无变化" : "覆盖变化"]].map(row => `<div class="compare-row"><span>${esc(row[0])}</span><strong>${esc(row[1])}</strong><strong>${esc(row[2])}</strong><em class="${row[3].includes("差异") || row[3].includes("变化") ? "changed" : ""}">${esc(row[3])}</em></div>`).join("")}</div><div class="form-field required"><div class="field-rule-row"><label>本次 APP 提醒方式</label>${ruleAnnotations([["reminder", "REM-R02"], ["reminder", "REM-R03"]])}</div>${renderReminderOptions(modal.reminderPolicy)}${errorFor("reminderPolicy")}</div><div class="form-field required"><div class="field-rule-row"><label>回滚原因</label>${ruleAnnotation("rollback", "RBK-R03")}</div><textarea class="textarea" data-modal-field="reason" maxlength="500" placeholder="请说明问题表现、影响范围、回滚原因及后续处理计划">${esc(modal.reason || "")}</textarea>${errorFor("rollbackReason")}<div class="helper align-right">${(modal.reason || "").length} / 500</div></div>`, `<button class="btn" data-action="close-overlay">取消</button><span class="action-with-rules"><button class="btn primary" data-action="confirm-rollback">提交回滚审批</button>${ruleAnnotations([["rollback", "RBK-R04"], ["concurrency", "CON-R01"]])}</span>`, true);
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
    const allSources = availableAssociatedFeatures();
    const query = String(modal.query || "").trim().toLowerCase();
    const category = String(modal.featureCategory || "");
    const categoryOptions = [...new Set(allSources.map(feature => feature.category).filter(Boolean))].sort((left, right) => left.localeCompare(right, "zh-CN"));
    const matchesFilter = feature => {
      const searchable = `${feature.name} ${feature.identifier} ${feature.category || ""} ${feature.description || ""}`.toLowerCase();
      return (!query || searchable.includes(query)) && (!category || feature.category === category);
    };
    const requiredSources = requiredFeatureSourcesForProduct(identifier.product).filter(matchesFilter);
    const allRequiredIds = new Set(requiredFeatureSourcesForProduct(identifier.product).map(feature => feature.id));
    const optionalSources = optionalFeatureSourcesForProduct(identifier.product).filter(matchesFilter);
    const selectedIds = [...new Set([...allRequiredIds, ...(modal.selectedIds || [])])];
    const currentSnapshots = state.drawer?.associatedFeatures || [];
    const firmwareVersion = state.drawer?.formDraft?.version || state.upload?.version || "待解析";
    const versionSelections = modal.versionSelections || {};
    const hasSelection = id => Object.prototype.hasOwnProperty.call(versionSelections, id);
    const selectionFor = (source, previous = null) => hasSelection(source.id)
      ? versionSelections[source.id]
      : previous?.featureVersionId || defaultConfigurableFeatureVersion(source)?.id || "";
    const sourceFor = feature => associatedFeatureCatalog.find(item => item.id === feature?.id) || sourceFeatureBySnapshot(feature);
    const selected = selectedIds.map(id => availableAssociatedFeatures().find(feature => feature.id === id) || sourceFor(currentSnapshots.find(feature => feature.id === id)) || currentSnapshots.find(feature => feature.id === id)).filter(Boolean);
    const selectedOptionalCount = selected.filter(feature => !allRequiredIds.has(feature.id)).length;
    const selectedRequiredCount = selected.filter(feature => allRequiredIds.has(feature.id)).length;
    const selectedCount = selected.length;
    const missingVersionFeatures = selected.filter(feature => {
      const source = sourceFor(feature);
      const previous = currentSnapshots.find(item => item.id === feature.id);
      return !source || !selectionFor(source, previous) || !configurableFeatureVersions(source).length;
    });
    const canConfirm = missingVersionFeatures.length === 0 && selected.every(feature => {
      const source = sourceFor(feature);
      const previous = currentSnapshots.find(item => item.id === feature.id);
      const selectedVersionId = source ? selectionFor(source, previous) : "";
      const version = source?.versions?.find(item => item.id === selectedVersionId);
      if (!source || !version) return false;
      const issue = featureAssociationIssue(associatedFeatureSnapshot(source, version.id, previous), identifier.product);
      return !issue || version.status === "testing";
    });

    const versionStatusLabelForPicker = version => version?.status === "testing" ? "测试中" : version ? "已发布" : "";
    const versionStatusClass = version => version?.status === "testing" ? "warning" : "success";
    const renderVersionMenu = (source, selectedVersionId) => {
      if (modal.versionOpen !== source.id) return "";
      const options = (source.versions || []).map(version => {
        const selectable = ["published", "testing"].includes(version.status);
        return `<button type="button" class="feature-version-option ${version.id === selectedVersionId ? "selected" : ""} ${selectable ? "" : "disabled"}" data-action="select-feature-version" data-feature-id="${esc(source.id)}" data-version-id="${esc(version.id)}" ${selectable ? "" : "disabled"}><span class="feature-version-radio" aria-hidden="true"></span><span class="feature-version-option-copy"><span class="feature-version-option-head"><strong>${esc(version.code)}</strong><span class="tag ${versionStatusClass(version)}">${esc(versionStatusLabelForPicker(version))}</span></span><small>${esc(version.description || "暂无版本说明")}</small></span></button>`;
      }).join("");
      return `<div class="feature-version-menu" data-floating-menu="version" data-feature-id="${esc(source.id)}">${options || `<div class="feature-version-menu-empty">暂无可用版本</div>`}</div>`;
    };
    const renderVersionInfo = (source, selectedVersion) => {
      if (modal.infoOpen !== source.id || !selectedVersion) return "";
      return `<aside class="feature-version-info-popover" data-floating-menu="info" data-feature-id="${esc(source.id)}"><div class="feature-version-info-head"><strong>${esc(selectedVersion.code)}</strong><span class="tag ${versionStatusClass(selectedVersion)}">${esc(versionStatusLabelForPicker(selectedVersion))}</span></div><div class="feature-version-info-body"><strong>版本说明</strong><p>${esc(selectedVersion.description || "暂无版本说明")}</p></div><button type="button" class="link-btn feature-version-switch" data-action="switch-feature-version" data-feature-id="${esc(source.id)}">切换版本 <span aria-hidden="true">→</span></button></aside>`;
    };
    const renderRow = (feature, required = false) => {
      const checked = selectedIds.includes(feature.id);
      const configurable = configurableFeatureVersions(feature);
      const unsupported = feature.supported === false || configurable.length === 0;
      const previous = currentSnapshots.find(item => item.id === feature.id);
      const selectedVersionId = selectionFor(feature, previous);
      const selectedVersion = feature.versions?.find(version => version.id === selectedVersionId) || null;
      const missingVersion = checked && !selectedVersion;
      const selectedSnapshot = selectedVersion ? associatedFeatureSnapshot(feature, selectedVersion.id, previous) : null;
      const issue = selectedSnapshot ? featureAssociationIssue(selectedSnapshot, identifier.product) : "";
      const testingOnly = selectedVersion?.status === "testing" && /仍在测试中$/.test(issue);
      const blockingIssue = missingVersion ? "请选择功能版本" : testingOnly ? "" : issue;
      const title = unsupported ? (feature.unsupportedReason || `当前固件版本 ${firmwareVersion} 暂不支持此功能`) : "";
      const description = unsupported ? title : (feature.description || `${feature.category || "功能"} · 功能配置`);
      const control = `<input type="checkbox" data-feature-choice="${esc(feature.id)}" ${checked ? "checked" : ""} ${required || unsupported ? "disabled" : ""} aria-label="${esc(feature.name)}">`;
      const tag = unsupported ? `<span class="tag danger">不支持</span>` : required ? `<span class="tag blue">必配</span>` : "";
      const versionControl = checked && !unsupported ? `<div class="feature-config-controls"><div class="feature-version-field"><span>功能版本</span><div class="feature-version-select-wrap"><button type="button" class="feature-version-trigger ${missingVersion ? "invalid" : ""}" data-action="toggle-feature-version-menu" data-feature-id="${esc(feature.id)}" aria-expanded="${modal.versionOpen === feature.id}"><span>${selectedVersion ? esc(selectedVersion.code) : "请选择版本"}</span>${selectedVersion ? `<span class="tag ${versionStatusClass(selectedVersion)}">${esc(versionStatusLabelForPicker(selectedVersion))}</span>` : ""}<span class="feature-version-chevron" aria-hidden="true">⌄</span></button>${renderVersionMenu(feature, selectedVersionId)}</div>${missingVersion ? `<div class="feature-version-error">请选择功能版本</div>` : blockingIssue ? `<div class="feature-version-error">${esc(blockingIssue)}</div>` : ""}</div>${selectedVersion ? `<button type="button" class="link-btn feature-version-info-link" data-action="toggle-feature-version-info" data-feature-id="${esc(feature.id)}" aria-expanded="${modal.infoOpen === feature.id}">查看版本说明</button>${renderVersionInfo(feature, selectedVersion)}` : ""}</div>` : "";
      return `<article class="feature-config-row ${checked ? "selected" : ""} ${required ? "required" : ""} ${unsupported ? "unsupported" : ""} ${blockingIssue ? "invalid" : ""}" title="${esc(title)}"><div class="feature-config-check">${control}</div><span class="feature-config-icon">${esc(feature.imageLabel || "功能")}</span><div class="feature-config-copy"><div class="feature-config-name"><strong>${esc(feature.name)}</strong>${tag}</div><small>${esc(description)}</small></div>${versionControl}</article>`;
    };
    const group = (title, note, features, required, totalCount) => `<section class="feature-config-group"><div class="feature-config-group-head"><h3>${esc(title)} <span>（${features.length}${features.length !== totalCount ? ` / ${totalCount}` : ""}）</span></h3><span>${esc(note)}</span></div><div class="feature-config-group-list">${features.map(feature => renderRow(feature, required)).join("") || `<div class="feature-config-empty">暂无匹配的功能配置</div>`}</div></section>`;
    const filters = `<div class="feature-config-filters"><label class="feature-config-category"><span class="sr-only">功能分类</span><select class="select" data-feature-category aria-label="功能分类"><option value="">全部分类</option>${categoryOptions.map(item => `<option value="${esc(item)}" ${item === category ? "selected" : ""}>${esc(item)}</option>`).join("")}</select></label><label class="feature-config-search"><span class="feature-config-search-icon" aria-hidden="true"></span><span class="sr-only">搜索功能名称或标识</span><input class="field" data-feature-search value="${esc(modal.query || "")}" placeholder="搜索功能名称或标识" aria-label="搜索功能名称或标识"></label></div>`;
    const body = `<div class="feature-config-shell feature-picker-modal"><div class="feature-config-intro"><div class="feature-config-meta"><span>产品线：<strong>${esc(identifier.product)}</strong></span><span>固件版本：<strong>${esc(firmwareVersion)}</strong></span></div><div class="feature-config-tip"><span class="feature-config-tip-icon" aria-hidden="true">!</span><span>当前固件版本支持以下功能配置，请选择对应功能版本。</span></div>${filters}</div><div class="feature-config-list">${group("必配功能", "以下功能为系统必配功能，不可取消", requiredSources, true, requiredFeatureSourcesForProduct(identifier.product).length)}${group("可选功能", "根据实际业务需要选择", optionalSources, false, optionalFeatureSourcesForProduct(identifier.product).length)}</div></div>`;
    const footer = `<div class="feature-config-footer-summary"><span>已选择 <strong>${selectedCount}</strong> 项</span><i></i><span>必配 <strong>${selectedRequiredCount}</strong> 项</span><i></i><span>可选 <strong>${selectedOptionalCount}</strong> 项</span>${missingVersionFeatures.length ? `<em>! 还有 ${missingVersionFeatures.length} 个功能未选择版本</em>` : ""}</div><div class="feature-config-footer-actions"><button class="btn" data-action="close-modal">取消</button><button class="btn primary" data-action="confirm-feature-picker" ${canConfirm ? "" : "disabled"}>确认配置</button></div>`;
    return modalFrame("选择配置功能", body, footer, true, true);
  }

  function availableAssociatedFeatures() {
    return featureSourcesForProduct(activeIdentifier().product);
  }

  function findVersion(version) {
    return activeIdentifier()?.versions.find(item => item.version === version);
  }

  function policyHistoryStatusLabel(status) {
    return status === "enabled" ? "已启用" : "已停用";
  }

  function policyHistoryStatusClass(status) {
    return status === "enabled" ? "success" : "";
  }

  function policyHistoryVersionCode(policyVersion) {
    return String(policyVersion || "").match(/V\d+$/)?.[0] || "历史版本";
  }

  function policyHistoryDateLabel(value) {
    return String(value || "-").replace(/:\d{2}$/, "");
  }

  function policyHistoryTimeoutLabel(node) {
    return "按需催办";
  }

  function policyHistoryUserName(userId) {
    const user = db.users.find(item => item.userId === userId);
    return user ? `${user.name} · ${user.role}` : userId || "未选择";
  }

  function policyHistoryChanges(previous, current) {
    if (!previous) return ["初始版本，无上一版本可对比"];
    const changes = [];
    if ((previous.name || "") !== (current.name || "")) changes.push(`方案名称：${previous.name || "未填写"} → ${current.name || "未填写"}`);
    if ((previous.description || "") !== (current.description || "")) changes.push("方案说明已更新");
    if (current.changeReason) changes.push(`变更说明：${current.changeReason}`);
    const previousNodes = previous.nodes || [];
    const currentNodes = current.nodes || [];
    if (previousNodes.length !== currentNodes.length) changes.push(`审批级数：${previousNodes.length} 级 → ${currentNodes.length} 级`);
    const nodeChanges = currentNodes.reduce((count, node, index) => {
      const oldNode = previousNodes[index];
      if (!oldNode) return count + 1;
      const approverChanged = (oldNode.approverUserId || oldNode.approverName || "") !== (node.approverUserId || node.approverName || "");
      return count + (approverChanged ? 1 : 0);
    }, 0);
    if (nodeChanges) changes.push(`${nodeChanges} 个审批节点配置已调整`);
    const previousCopy = new Set(previous.copyUserIds || []);
    const currentCopy = new Set(current.copyUserIds || []);
    if (previousCopy.size !== currentCopy.size || [...previousCopy].some(userId => !currentCopy.has(userId))) changes.push(`终态抄送人员：${previousCopy.size} 人 → ${currentCopy.size} 人`);
    return changes.length ? changes : ["审批配置无变化，仅生成新的版本记录"];
  }

  function renderApprovalPolicyDetailDrawer(drawer) {
    const policy = db.approvalPolicies.find(item => item.id === drawer.policyId);
    if (!policy) return drawerFrame("审批方案详情", `<div class="empty-state compact-empty"><div>审批方案已不存在</div></div>`, `<button class="btn primary" data-action="close-overlay">关闭</button>`);
    const operation = policyOperation(policy);
    const versionCode = policy.policyVersion.replace(`${policy.id}-`, "");
    const approvers = (policy.nodes || []).map(node => node.approverName || policyHistoryUserName(node.approverUserId));
    const copyUsers = (policy.copyUserIds || []).map(userId => policyHistoryUserName(userId));
    const nodes = (policy.nodes || []).map((node, index) => `<article class="policy-detail-node"><span>${index + 1}</span><div><strong>${esc(node.approverName || policyHistoryUserName(node.approverUserId))}</strong><small>${esc(policyHistoryUserName(node.approverUserId))}</small></div><em>${esc(policyHistoryTimeoutLabel(node))}</em></article>`).join("") || `<div class="policy-history-empty">未配置审批节点</div>`;
    const policyStatusLabel = policy.status === "disabled" ? "已停用" : "已启用";
    const policyStatusClass = policy.status === "disabled" ? "" : "success";
    const body = `<div class="policy-detail-shell"><div class="policy-detail-summary"><div class="policy-detail-summary-icon ${esc(operation)}" aria-hidden="true">${operation === "publish" ? "↗" : operation === "rollback" ? "↻" : "▣"}</div><div><span>当前方案</span><h3>${esc(policy.name)}</h3><p>${esc(policy.description || "未填写方案说明")}</p></div><span class="tag ${policyStatusClass}">${esc(versionCode)} · ${policyStatusLabel}</span></div><section class="policy-detail-section"><div class="policy-detail-section-head"><div><h4>方案范围</h4><span>该方案仅用于当前产品线的这一项审批操作</span></div></div><div class="policy-detail-info-grid"><div><span>所属产品线</span><strong>${esc(policy.productLine)}</strong></div><div><span>审批操作</span><strong>${esc(approvalOperationLabel(operation))}</strong></div><div><span>审批级数</span><strong>${(policy.nodes || []).length} 级串行</strong></div><div><span>最近更新</span><strong>${esc(policy.updatedAt || "-")}</strong></div></div></section><section class="policy-detail-section"><div class="policy-detail-section-head"><div><h4>审批节点</h4><span>按实际流转顺序展示审批人；当前节点未处理时可人工催办</span></div><strong>${approvers.length} 级</strong></div><div class="policy-detail-node-list">${nodes}</div></section><section class="policy-detail-section"><div class="policy-detail-section-head"><div><h4>终态结果抄送</h4><span>审批结束后通知，不参与审批处理</span></div><strong>${copyUsers.length} 人</strong></div>${copyUsers.length ? `<div class="policy-detail-copy-list">${copyUsers.map(name => `<span>${esc(name)}</span>`).join("")}</div>` : `<div class="policy-history-empty">未配置终态抄送人员</div>`}</section><div class="policy-detail-note"><strong>版本规则</strong><span>编辑保存会生成新的版本；在途审批继续使用受理时的审批人快照。</span></div></div>`;
    const footer = `<button class="btn" data-action="policy-version-history" data-policy-id="${esc(policy.id)}">版本记录</button><button class="btn primary" data-action="edit-approval-policy" data-policy-id="${esc(policy.id)}">编辑方案</button>`;
    return drawerFrame("审批方案详情", body, footer);
  }

  function renderPolicyVersionHistoryDrawer(drawer) {
    const policy = db.approvalPolicies.find(item => item.id === drawer.policyId);
    if (!policy) return drawerFrame("方案版本记录", `<div class="empty-state compact-empty"><div>审批方案已不存在</div></div>`, `<button class="btn primary" data-action="close-overlay">关闭</button>`);
    const versions = Array.isArray(policy.history) ? policy.history : [];
    const selectedVersionCode = versions.some(item => item.policyVersion === drawer.selectedVersion) ? drawer.selectedVersion : versions[0]?.policyVersion;
    const selectedIndex = Math.max(0, versions.findIndex(item => item.policyVersion === selectedVersionCode));
    const version = versions[selectedIndex] || null;
    if (!version) return drawerFrame("方案版本记录", `<div class="empty-state compact-empty"><div>暂无版本记录</div></div>`, `<button class="btn primary" data-action="close-overlay">关闭</button>`);
    const previous = versions[selectedIndex + 1] || null;
    const currentVersion = policy.policyVersion === version.policyVersion;
    const copyUsers = (version.copyUserIds || []).map(userId => {
      const user = db.users.find(item => item.userId === userId);
      return { name: user?.name || userId || "未选择", role: user?.role || "" };
    });
    const operation = policyOperation(version) || policyOperation(policy);
    const nodes = (version.nodes || []).map((node, index) => {
      const user = db.users.find(item => item.userId === node.approverUserId);
      const approverName = node.approverName || user?.name || node.approverUserId || "未选择";
      const approverRole = user?.role || "";
      return `<article class="policy-history-node"><span class="policy-history-node-index">${index + 1}</span><div class="policy-history-node-copy"><strong>${esc(approverName)}</strong>${approverRole ? `<span>${esc(approverRole)}</span>` : ""}</div><div class="policy-history-node-time"><span>处理方式</span><strong>${esc(policyHistoryTimeoutLabel(node))}</strong></div></article>`;
    }).join("") || `<div class="policy-history-empty">未配置审批节点</div>`;
    const list = versions.map(item => {
      const selected = item.policyVersion === version.policyVersion;
      const itemCurrent = policy.policyVersion === item.policyVersion;
      return `<button type="button" class="policy-history-version-item ${selected ? "active" : ""}" data-action="select-policy-history-version" data-policy-version="${esc(item.policyVersion)}" aria-pressed="${selected}"><span class="policy-history-version-dot ${itemCurrent ? "current" : ""}" aria-hidden="true"></span><span class="policy-history-version-copy"><span class="policy-history-version-head"><strong>${esc(policyHistoryVersionCode(item.policyVersion))}</strong>${itemCurrent ? `<em>生效版本</em>` : ""}</span></span></button>`;
    }).join("");
    const detail = `<div class="policy-history-detail-head"><div><span>版本详情</span><h3>${esc(policyHistoryVersionCode(version.policyVersion))}</h3><p>${esc(version.updatedAt || "-")} · ${esc(version.updatedBy || "-")}</p></div><div class="policy-history-detail-status"><span class="tag ${currentVersion ? "success" : ""}">${currentVersion ? "当前生效版本" : "历史版本"}</span></div></div><section class="policy-history-section policy-history-basic"><div class="policy-history-section-head"><div><h4>基本信息</h4></div></div><div class="policy-history-info-grid"><div><span>方案名称</span><strong>${esc(version.name || policy.name)}</strong></div><div><span>所属产品线</span><strong>${esc(policy.productLine)}</strong></div><div><span>审批操作</span><strong>${esc(approvalOperationLabel(operation))}</strong></div><div class="full"><span>方案说明</span><p>${esc(version.description || "未填写方案说明")}</p></div></div></section><section class="policy-history-section"><div class="policy-history-section-head"><div><h4>审批流程（${(version.nodes || []).length}级）</h4></div></div><div class="policy-history-node-list">${nodes}</div></section><section class="policy-history-section"><div class="policy-history-section-head"><div><h4>终态结果抄送（${copyUsers.length}人）</h4></div></div>${copyUsers.length ? `<div class="policy-history-copy-list">${copyUsers.map(user => `<span class="policy-history-copy-chip"><i aria-hidden="true">${esc(user.name.slice(0, 1))}</i><strong>${esc(user.name)}</strong>${user.role ? `<em> · ${esc(user.role)}</em>` : ""}</span>`).join("")}</div>` : `<div class="policy-history-empty">未配置终态抄送人员</div>`}</section><section class="policy-history-section policy-history-change-section"><div class="policy-history-section-head"><div><h4>版本变化</h4></div></div><ul class="policy-history-change-list">${policyHistoryChanges(previous, version).map(change => `<li>${esc(change)}</li>`).join("")}</ul></section>`;
    const body = `<div class="policy-history-shell"><aside class="policy-history-list"><div class="policy-history-list-head"><div><strong>版本列表</strong><span>共 ${versions.length} 个版本</span></div></div><div class="policy-history-version-list">${list}</div></aside><main class="policy-history-detail">${detail}</main></div>`;
    return drawerFrame("方案版本记录", body, `<button class="btn" data-action="close-overlay">关闭</button>`);
  }

  function renderDrawer() {
    const drawer = state.drawer;
    if (drawer.type === "approvalPolicy") return renderApprovalPolicyDrawer(drawer);
    if (drawer.type === "policyDetail") return renderApprovalPolicyDetailDrawer(drawer);
    if (drawer.type === "policyVersionHistory") return renderPolicyVersionHistoryDrawer(drawer);
    if (drawer.type === "approvalSimulation") return renderApprovalSimulation(drawer);
    if (drawer.type === "addVersion") return renderVersionFormDrawer("新增固件版本", null);
    if (drawer.type === "editVersion") return renderVersionFormDrawer("编辑固件版本", findVersion(drawer.version));
    if (drawer.type === "versionDetail") return renderVersionDetail(findVersion(drawer.version));
    if (drawer.type === "differentialTaskDetail") return renderDifferentialTaskDetail(drawer.taskId);
    if (drawer.type === "userDetail") return renderUserDetail(db.users[drawer.userIndex]);
    if (drawer.type === "userPermissions") return renderUserPermissions(db.users[drawer.userIndex]);
    return "";
  }

  function approvalPolicyPreviewDefinition(operation, productLine) {
    const definitions = {
      publish: {
        title: "固件版本发布",
        fields: [["所属产品线", productLine, false], ["发布固件版本", "提交时带入", true], ["测试报告", "发起人必须上传", true], ["会议纪要", "第 1 级审批时上传", true], ["适用机型", "提交时带入", true]],
        reasonLabel: "发布原因",
        boundary: "按方案配置顺序逐级审批，全部通过后系统自动正式发布"
      },
      rollback: {
        title: "固件版本回滚",
        fields: [["所属产品线", productLine, false], ["当前固件版本", "提交时带入", true], ["回滚目标版本", "系统自动锁定", true], ["APP 升级提醒", "提交时带入", true]],
        reasonLabel: "回滚原因",
        boundary: "在途审批人冻结，不支持替换或代理"
      },
      delist: {
        title: "固件版本下架",
        fields: [["所属产品线", productLine, false], ["下架固件版本", "当前发布版本", true], ["适用机型", "提交时带入", true], ["影响设备数", "提交时计算", true]],
        reasonLabel: "下架原因",
        boundary: "在途审批人冻结，不支持替换或代理"
      }
    };
    return definitions[operation] || null;
  }

  function renderApprovalPolicyPreview(drawer, nodes) {
    const draft = drawer.policyDraft;
    const previewOperation = draft.operation || draft.operations?.[0] || "";
    drawer.previewOperation = previewOperation;
    const definition = approvalPolicyPreviewDefinition(previewOperation, draft.productLine);
    const previewNodes = nodes.map((node, index) => {
      const names = nodeApproverIds(node).map(id => db.users.find(item => item.userId === id)?.name || id);
      return `<div class="dingtalk-node"><span>${index + 1}</span><div><strong>${esc(names.join("、") || "待选择审批人")}</strong><small>${names.length} 人或签 · 任一人通过流转</small><small>发起人可按需催办</small></div><em>${index ? "等待上一级" : "发起后待审批"}</em></div>`;
    }).join("");
    const firstApprover = nodeApproverIds(nodes[0]).map(id => db.users.find(user => user.userId === id)?.name || id).join("、") || "待选择第 1 级审批人";
    const card = definition ? `<article class="dingtalk-card"><header class="dingtalk-card-brand"><span class="dingtalk-approval-icon">审</span><strong>审批</strong><em>模板预览</em></header><h3><span>申请人</span>提交的${esc(definition.title)}</h3><div class="dingtalk-form-fields">${definition.fields.map(([label, value, dynamic]) => `<div><span>${esc(label)}</span><strong class="${dynamic ? "dynamic-value" : ""}">${esc(value)}</strong></div>`).join("")}</div><div class="dingtalk-request-meta"><div><span>当前审批人</span><strong class="${nodes[0]?.approverUserId ? "" : "dynamic-value"}">${esc(firstApprover)}</strong></div><div><span>${esc(definition.reasonLabel)}</span><strong class="dynamic-value">提交时带入</strong></div><div><span>申请时间</span><strong class="dynamic-value">提交时生成</strong></div></div><section class="dingtalk-flow"><div class="dingtalk-flow-head"><h4>审批流程</h4><span>${nodes.length} 级串行</span></div>${previewNodes}</section><div class="dingtalk-runtime-rule">${esc(definition.boundary)}；终态结果抄送 <strong data-policy-preview-copy-count>${(draft.copyUserIds || []).length}</strong> 人。</div><div class="dingtalk-platform-entry"><a href="#/approvalCenter" target="_blank" rel="noopener">审批中心</a></div></article>` : `<div class="dingtalk-preview-empty"><span class="dingtalk-approval-icon">审</span><strong>选择审批操作后显示模板</strong><p>发布、回滚和下架将使用不同的业务字段。</p></div>`;
    return `<aside class="dingtalk-preview" aria-label="平台审批任务预览"><div class="dingtalk-preview-head"><div class="dingtalk-preview-heading"><span class="dingtalk-preview-heading-icon" aria-hidden="true">${approvalPolicyIcon(previewOperation)}</span><div><strong>${annotatedLabel("平台审批任务预览", [["policy", "POL-R12"]])}</strong><span data-policy-preview-name>${esc(draft.name || "未命名审批方案")}</span></div></div><em class="policy-preview-operation">${esc(approvalOperationLabel(previewOperation))}</em></div><div class="dingtalk-preview-canvas">${card}</div></aside>`;
  }

  function renderApprovalPolicyDrawer(drawer) {
    const draft = drawer.policyDraft;
    const candidates = approvalPolicyCandidates(draft.productLine);
    const editingPolicy = drawer.policyId ? db.approvalPolicies.find(policy => policy.id === drawer.policyId) : null;
    const nodes = normalizeApprovalPolicyDraftNodes(draft);
    const nodeRows = nodes.map((node, index) => {
      const selectedUsers = candidates.filter(user => nodeApproverIds(node).includes(user.userId));
      const selectedUser = selectedUsers[0];
      const selectedSummary = selectedUsers.map(user => user.name).join("、");
      const pickerOpen = drawer.nodeUserPickerOpen === index;
      const options = candidates.map(user => {
        const selected = nodeApproverIds(node).includes(user.userId);
        const usedByAnotherNode = nodes.some((item, nodeIndex) => nodeIndex !== index && nodeApproverIds(item).includes(user.userId));
        const searchValue = `${user.name} ${user.role} ${user.userId}`.toLowerCase();
        return `<button type="button" class="policy-user-option ${selected ? "selected" : ""}" data-action="select-policy-node-user" data-node-index="${index}" data-user-id="${esc(user.userId)}" data-policy-user-search-value="${esc(searchValue)}" role="option" aria-selected="${selected}" ${usedByAnotherNode ? "disabled" : ""}><span class="policy-user-avatar">${esc(String(user.name || "用").slice(0, 1))}</span><span><strong>${esc(user.name)}</strong><small>${esc(user.role)} · ${esc(user.userId)}</small></span><em>${selected ? "已选择" : usedByAnotherNode ? "已配置" : ""}</em></button>`;
      }).join("");
      const picker = `<div class="policy-user-picker ${pickerOpen ? "open" : ""}"><button type="button" class="policy-user-picker-trigger ${selectedUser ? "has-value" : ""}" data-action="toggle-policy-node-user-picker" data-node-index="${index}" aria-haspopup="listbox" aria-expanded="${pickerOpen}" ${candidates.length ? "" : "disabled"}><span><strong class="${selectedUser ? "" : "placeholder"}">${esc(selectedSummary || "请选择一位或多位平台用户")}</strong><small>${selectedUser ? `${selectedUsers.length} 人或签 · 任一通过即可流转` : "支持搜索、多选；跨节点不可重复"}</small></span><i aria-hidden="true">⌄</i></button>${pickerOpen ? `<div class="policy-user-picker-popover"><label class="policy-user-search"><span aria-hidden="true">⌕</span><input type="search" data-policy-node-user-search="${index}" placeholder="搜索姓名、角色或用户 ID" aria-label="搜索${esc(approvalNodeTypeLabel(node.type, index + 1))}" autocomplete="off"></label><div class="policy-user-options" role="listbox" aria-multiselectable="true">${options}<div class="policy-user-empty hidden" data-policy-user-empty>未找到匹配用户</div></div></div>` : ""}</div>`;
      const stageLabel = index === 0 ? annotatedLabel(`第 ${index + 1} 级审批人`, [["policy", "POL-R06"]]) : `第 ${index + 1} 级审批人`;
      return `<div class="policy-node-row"><span class="policy-node-sequence">${index + 1}</span><div class="policy-node-approver"><span class="policy-node-stage-label">${stageLabel}</span>${picker}${state.errors[`policyNode${index}`] ? `<div class="error-text">${esc(state.errors[`policyNode${index}`])}</div>` : ""}</div><div class="policy-node-rule"><span>处理规则</span><strong>发起人可按需催办</strong><small>不设审批截止时间</small></div><button type="button" class="btn icon-btn policy-node-remove" data-action="remove-policy-node" data-node-index="${index}" aria-label="删除第 ${index + 1} 级审批节点" title="删除此审批节点" ${nodes.length === 1 ? "disabled" : ""}>×</button></div>`;
    }).join("");
    const candidateNotice = candidates.length ? "" : `<div class="policy-node-notice">该产品线暂无可选的启用平台用户，请先在用户列表维护所属产线和账号状态。</div>`;
    const versionText = editingPolicy ? `${editingPolicy.policyVersion}${drawer.dirty ? " · 有未保存修改" : ""}` : "保存后生成 V1";
    const operationLabel = approvalOperationLabel(draft.operation || draft.operations?.[0]);
    const basicSection = `<section class="policy-editor-section"><div class="policy-section-head"><div class="policy-section-heading"><span class="policy-editor-section-index">01</span><div><h3>${annotatedLabel("基本信息", [["policy", "POL-R01"], ["policy", "POL-R02"]])}</h3></div></div><em class="policy-editor-version" data-policy-version>${esc(versionText)}</em></div><div class="form-grid policy-basic-grid"><div class="form-field required"><label>方案名称</label><input class="field" maxlength="40" data-policy-name value="${esc(draft.name)}" placeholder="请输入审批方案名称">${state.errors.policyName ? `<div class="error-text">${esc(state.errors.policyName)}</div>` : ""}</div><div class="form-field required"><label>所属产品线</label><select class="select policy-readonly-select" disabled aria-label="所属产品线">${productLines.map(line => `<option value="${esc(line)}" ${line === draft.productLine ? "selected" : ""}>${esc(line)}</option>`).join("")}</select><div class="helper">当前为 ${esc(draft.productLine)} 产品线，不支持修改。</div></div><div class="form-field full"><div class="field-rule-row"><label>审批操作</label>${ruleAnnotation("policy", "POL-R04")}</div><div class="policy-fixed-operation"><strong>${esc(operationLabel)}</strong></div>${state.errors.policyOperations ? `<div class="error-text">${esc(state.errors.policyOperations)}</div>` : ""}</div><div class="form-field full"><label>方案说明 <span class="optional-label">（选填）</span></label><textarea class="textarea policy-description" maxlength="200" data-policy-description placeholder="说明该方案的适用场景">${esc(draft.description || "")}</textarea><div class="helper align-right">${String(draft.description || "").length} / 200</div>${state.errors.policyDescription ? `<div class="error-text">${esc(state.errors.policyDescription)}</div>` : ""}</div></div></section>`;
    const nodeSection = `<section class="policy-editor-section policy-editor-node-section"><div class="policy-section-head policy-node-head"><div class="policy-section-heading"><span class="policy-editor-section-index">02</span><div><h3>${annotatedLabel("审批节点", [["policy", "POL-R05"]])}</h3></div></div></div>${candidateNotice}${state.errors.policyNodes ? `<div class="error-text policy-section-error">${esc(state.errors.policyNodes)}</div>` : ""}<div class="policy-node-list">${nodeRows}</div><div class="policy-node-footer"><span class="action-with-rules"><button type="button" class="btn small" data-action="add-policy-node" ${nodes.length >= 5 ? "disabled" : ""}>＋ 添加审批节点</button>${ruleAnnotation("policy", "POL-R05")}</span><span class="policy-node-limit">当前 ${nodes.length} / 5 级${nodes.length >= 5 ? "，已达到上限" : ""}</span></div><p class="policy-editor-rule">节点按方案顺序流转；当前节点未处理时，发起人可手动催办。</p></section>`;
    const selectedCopyIds = draft.copyUserIds || [];
    const selectedCopyUsers = selectedCopyIds.map(userId => db.users.find(user => user.userId === userId) || { userId, name: userId, role: "历史用户" });
    const copyPickerOpen = Boolean(drawer.copyUserPickerOpen);
    const copyUserTab = drawer.copyUserTab === "selected" ? "selected" : "all";
    const copyUserSearch = String(drawer.copyUserSearch || "");
    const normalizedCopySearch = copyUserSearch.trim().toLowerCase();
    const visibleCopyCandidates = candidates.filter(user => {
      if (copyUserTab === "selected" && !selectedCopyIds.includes(user.userId)) return false;
      const searchValue = `${user.name} ${user.role} ${user.userId}`.toLowerCase();
      return !normalizedCopySearch || searchValue.includes(normalizedCopySearch);
    });
    const copyOptions = visibleCopyCandidates.map(user => {
      const selected = selectedCopyIds.includes(user.userId);
      const searchValue = `${user.name} ${user.role} ${user.userId}`.toLowerCase();
      return `<label class="policy-copy-option ${selected ? "selected" : ""}" data-policy-copy-search-value="${esc(searchValue)}"><input type="checkbox" data-policy-copy-user="${esc(user.userId)}" ${selected ? "checked" : ""}><span><strong>${esc(user.name)}</strong><small>${esc(user.role)} · ${esc(user.userId)}</small></span></label>`;
    }).join("");
    const copySummary = selectedCopyUsers.length ? `<div class="policy-copy-summary-list">${selectedCopyUsers.slice(0, 4).map(user => `<span class="policy-copy-chip"><span>${esc(user.name)}</span><button type="button" data-action="remove-policy-copy-user" data-user-id="${esc(user.userId)}" aria-label="移除抄送人 ${esc(user.name)}" title="移除">×</button></span>`).join("")}${selectedCopyUsers.length > 4 ? `<span class="policy-copy-more">+${selectedCopyUsers.length - 4} 人</span>` : ""}</div>` : `<span class="policy-copy-summary-empty">暂未选择抄送人</span>`;
    const copyEmptyText = !candidates.length ? "当前产品线暂无可选用户" : copyUserTab === "selected" && !selectedCopyIds.length ? "暂未选择抄送人" : "未找到匹配用户";
    const copySection = `<section class="policy-editor-section policy-copy-section"><div class="policy-section-head"><div class="policy-section-heading"><span class="policy-editor-section-index">03</span><div><h3>${annotatedLabel("终态结果抄送", [["policy", "POL-R08"]])}</h3></div></div><em class="policy-editor-version" data-policy-copy-count>已选择 ${selectedCopyIds.length} 人</em></div><div class="policy-copy-picker ${copyPickerOpen ? "open" : ""}"><button type="button" class="policy-copy-picker-trigger" data-action="toggle-policy-copy-picker" aria-haspopup="dialog" aria-expanded="${copyPickerOpen}" ${candidates.length ? "" : "disabled"}><span class="policy-copy-trigger-icon" aria-hidden="true">⌕</span><span><strong>${selectedCopyIds.length ? `已选择 ${selectedCopyIds.length} 名抄送人` : "选择抄送人员"}</strong><small>${selectedCopyIds.length ? "可继续搜索添加或取消选择" : "支持按姓名、角色或用户 ID 搜索"}</small></span><i aria-hidden="true">⌄</i></button>${copyPickerOpen ? `<div class="policy-copy-popover" role="dialog" aria-label="选择终态结果抄送人员"><label class="policy-copy-search"><span aria-hidden="true">⌕</span><input type="search" data-policy-copy-search value="${esc(copyUserSearch)}" placeholder="搜索姓名、角色或用户 ID" aria-label="搜索终态结果抄送用户" autocomplete="off"></label><div class="policy-copy-popover-toolbar"><div class="policy-copy-tabs" role="tablist" aria-label="抄送人筛选"><button type="button" class="${copyUserTab === "all" ? "active" : ""}" data-action="select-policy-copy-tab" data-tab="all" role="tab" aria-selected="${copyUserTab === "all"}">全部用户</button><button type="button" class="${copyUserTab === "selected" ? "active" : ""}" data-action="select-policy-copy-tab" data-tab="selected" role="tab" aria-selected="${copyUserTab === "selected"}">已选用户（${selectedCopyIds.length}）</button></div><button type="button" class="link-btn" data-action="clear-policy-copy-users" ${selectedCopyIds.length ? "" : "disabled"}>清空已选</button></div><div class="policy-copy-list">${copyOptions || `<div class="policy-copy-empty">${esc(copyEmptyText)}</div>`}</div><div class="policy-copy-popover-footer"><span>已选择 <strong>${selectedCopyIds.length}</strong> 人</span><button type="button" class="btn small primary" data-action="close-policy-copy-picker">完成</button></div></div>` : ""}</div><div class="policy-copy-summary">${copySummary}</div></section>`;
    const versionNote = `<section class="policy-editor-section policy-change-section"><div class="policy-section-head"><div class="policy-section-heading"><span class="policy-editor-section-index">04</span><div><h3>${annotatedLabel("版本记录", [["policy", "POL-R09"]])}</h3></div></div></div><div class="form-field ${editingPolicy ? "required" : ""}"><label>变更说明 ${editingPolicy ? "" : "<span class=\"optional-label\">（选填）</span>"}</label><textarea class="textarea policy-change-reason" maxlength="120" data-policy-change-reason placeholder="例如：调整第 2 级审批人">${esc(draft.changeReason || "")}</textarea><div class="helper align-right">${String(draft.changeReason || "").length} / 120</div>${state.errors.policyChangeReason ? `<div class="error-text">${esc(state.errors.policyChangeReason)}</div>` : ""}</div></section>`;
    const body = `<form id="approval-policy-form"><div class="policy-editor-layout"><main class="policy-editor-form">${basicSection}${nodeSection}${copySection}${versionNote}</main>${renderApprovalPolicyPreview(drawer, nodes)}</div></form>`;
    const saveButton = `<span class="action-with-rules"><button class="btn primary" type="button" data-action="save-approval-policy" ${editingPolicy && !drawer.dirty ? "disabled" : ""}>${editingPolicy ? "保存修改" : "保存方案"}</button>${ruleAnnotation("policy", "POL-R09")}</span>`;
    const footer = `<button class="btn" type="button" data-action="close-overlay">取消</button>${saveButton}`;
    return drawerFrame(editingPolicy ? "编辑审批方案" : "新建审批方案", body, footer);
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
    const header = `<div class="section-bar app-note-section-bar"><div><h3>${annotatedLabel("APP 固件版本更新说明", [["locale", "LOC-R09"]])}</h3><span class="subtle">已配置 ${configuredCount} / ${defaultLocaleIds.length} 种语言 · 英文兜底</span></div><div class="app-note-ai-actions"><div class="split-action"><button class="btn primary" type="button" data-action="ai-translate-notes" ${translating ? "disabled" : ""}>${translating ? "AI 翻译中..." : `AI 一键翻译（${Math.max(0, enabledCount - 1)}种）`}</button><button class="btn primary split-toggle" type="button" data-action="toggle-translation-targets" aria-label="选择适配语言" aria-expanded="${targetsOpen}" ${translating ? "disabled" : ""}>⌄</button>${targetPopover}</div>${hasAiDraft ? `<button class="btn" type="button" data-action="confirm-ai-notes">全部确认</button>` : ""}${headerRules}</div></div>${errorFor(revision ? "revisionRequired" : "appNotes")}`;
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
    const inheritedSource = !editing ? state.drawer.inheritedFromVersion : null;
    const inheritanceSummary = !editing ? `<div class="feature-inheritance-summary"><div><span class="inheritance-icon">↳</span><span>${inheritedSource ? `已继承版本 <strong>${esc(inheritedSource)}</strong> 的功能配置` : "已加载产品线默认必配功能"}</span></div><span>${associatedFeatures.length} 项，可继续调整</span>${ruleAnnotation("version", "VER-R18")}</div>` : "";
    const featurePointRows = associatedFeatures.map(feature => {
      const issue = featureAssociationIssue(feature, activeIdentifier().product);
      const displayStatus = featureVersionDisplayStatus(feature);
      return `<tr><td><div class="feature-point-name"><span class="feature-image-placeholder">${esc(feature.imageLabel || "功能")}</span><span><strong>${esc(feature.name)}</strong><small>${esc(feature.category || "-")}</small></span></div></td><td><div class="feature-config-version"><strong>${esc(feature.version || "-")}</strong><span class="tag ${displayStatus.className}">${esc(displayStatus.label)}</span></div><small class="table-subline">${esc(feature.versionDescription || "-")}</small>${issue ? `<small class="table-subline danger-text">${esc(issue)}</small>` : ""}</td></tr>`;
    }).join("");
    const formBody = `<form id="version-form" class="version-form">
      <input type="hidden" name="mode" value="${editing ? "edit" : "add"}">
      <input type="hidden" name="version" value="${esc(generatedVersion)}">
      <section class="version-form-section package-section">
        <div class="version-section-head"><div><h3>固件包与适用范围</h3><p>${esc(identifier.id)} · ${esc(identifier.product)}</p></div>${ruleAnnotations([["version", "VER-R01"], ["version", "VER-R06"], ["version", "VER-R13"]])}</div>
        <div class="package-scope-grid"><div>${packagePanel}${errorFor("file")}${errorFor("version")}</div><div class="form-field required version-model-field"><div class="field-rule-row"><label>适用机型</label>${ruleAnnotation("version", "VER-R14")}</div><select class="select" name="models" data-version-draft="models">${modelOptions.map(model => `<option value="${esc(model)}" ${model === formDraft.models ? "selected" : ""}>${esc(model)}</option>`).join("")}</select>${errorFor("models")}</div></div>
      </section>
      <section class="version-form-section feature-point-section">
        <div class="version-section-head"><div><h3>${annotatedLabel("功能项配置", [["version", "VER-R03"]])}</h3><p>必配 ${requiredCount} 项 · 可选 ${optionalCount} 项</p></div><span class="action-with-rules"><button class="btn primary small" type="button" data-action="add-associated-feature">配置功能项</button>${ruleAnnotation("version", "VER-R15")}</span></div>${inheritanceSummary}
        ${errorFor("associatedFeatures")}<div class="table-wrap"><table class="data-table associated-table compact-feature-table"><thead><tr><th>功能名称</th><th>配置版本</th></tr></thead><tbody>${featurePointRows}</tbody></table></div>${associatedFeatures.length ? "" : `<div class="empty-state compact-empty"><div>当前产品线暂无可配置功能</div></div>`}
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
    const associatedFeatures = version.associatedFeatures || [];
    const releaseRecords = releaseEventsForVersion(version);
    const effectiveEvent = releaseRecords.find(item => item.toVersion === version.version && ["publish", "rollback"].includes(item.action) && item.status !== "failed") || null;
    const effectiveTime = effectiveEvent?.effectiveAt || version.published || "未生效";
    const reminderText = effectiveEvent ? reminderLabel(effectiveEvent.reminderPolicy) : version.status === "unpublished" ? "发布时配置" : version.reminder || "不提醒";
    const fileName = String(version.url || "").split("/").pop() || "-";
    const statusClass = version.status === "current" ? "success" : ["withdrawn", "delisted"].includes(version.status) ? "danger" : version.status === "approval" ? "blue" : "";
    let tabContent = "";
    if (tab === "related") {
      const featureRows = associatedFeatures.map(feature => {
        const displayStatus = featureVersionDisplayStatus(feature);
        return `<tr><td><div class="feature-point-name"><span class="feature-image-placeholder">${esc(feature.imageLabel || "功能")}</span><strong>${esc(feature.name)}</strong></div></td><td>${esc(feature.category || "-")}</td><td><strong>${esc(feature.version || "-")}</strong></td><td><span class="tag ${displayStatus.className}">${esc(displayStatus.label)}</span></td><td>${esc(feature.versionDescription || "-")}</td></tr>`;
      }).join("");
      tabContent = `<div class="detail-section-toolbar"><div><strong>功能项配置</strong><span>发布时冻结 ${associatedFeatures.length} 项功能项配置</span></div></div>${associatedFeatures.length ? `<div class="table-wrap detail-table-wrap"><table class="data-table detail-content-table feature-point-detail-table"><thead><tr><th>功能名称</th><th>功能分类</th><th>配置版本</th><th>版本状态</th><th>版本说明</th></tr></thead><tbody>${featureRows}</tbody></table></div>` : `<div class="empty-state detail-empty-state"><div><div class="empty-illustration">▤</div><strong>未记录功能项配置</strong><span>该版本没有可展示的功能项快照</span></div></div>`}`;
    }
    if (tab === "approvals") {
      const rows = db.approvals.filter(item => item.version === version.version);
      tabContent = `<div class="detail-section-toolbar"><div><strong>审批日志</strong><span>共 ${rows.length} 条与当前版本关联的审批记录</span></div></div>${rows.length ? `<div class="approval-timeline">${rows.map(row => { const approvalTitle = row.event || (row.type === "rollback" ? "版本回滚" : row.type === "delist" ? "版本下架" : "正常发布"); const approvalStatus = row.approvalStatus || row.status; const approvalClass = approvalStatus === "已通过" ? "success" : /驳回|超时|过期|失效/.test(approvalStatus) ? "danger" : "blue"; const nodeChain = (row.tasks || []).map(task => `${task.sequence}. ${task.approverNameSnapshot}（${task.status}）`).join(" → "); return `<article class="approval-card"><div class="approval-card-head"><div><strong>${esc(approvalTitle)}审批</strong><span>${esc(row.submitTime)} · ${esc(row.policyVersion || "LEGACY")}</span></div><span class="tag ${approvalClass}">${esc(approvalStatus)}</span></div><div class="approval-meta"><span>提交人<strong>${esc(row.submitter)}</strong></span><span>审批链路<strong>${esc(nodeChain || row.approver)}</strong></span><span>审批时间<strong>${esc(row.approveTime)}</strong></span><span>执行状态<strong>${esc(row.executionStatus || "-")}</strong></span><span>说明<strong>${esc(row.note)}</strong></span></div>${row.id ? `<button class="link-btn approval-card-detail" data-action="open-approval-log" data-approval-id="${esc(row.id)}">查看审批详情</button>` : ""}</article>`; }).join("")}</div>` : `<div class="empty-state detail-empty-state"><div><div class="empty-illustration">▤</div><strong>暂无审批记录</strong></div></div>`}`;
    }
    if (tab === "appNotes") {
      const maintainable = !activeIdentifier().activeApproval && version.status === "current";
      const revisions = version.noteRevisions || [];
      const activeNotes = activeAppNotes(version.appReleaseNotes || {}, version.appNoteMeta || {});
      tabContent = `<div class="detail-section-toolbar"><div><strong>APP 固件版本更新说明</strong><span>已启用 ${Object.keys(activeNotes).length} 种语言，未匹配时使用英文说明</span></div>${maintainable ? `<button class="btn small primary" data-action="maintain-app-notes" data-version="${esc(version.version)}">维护文案</button>` : ""}</div><div class="table-wrap"><table class="data-table detail-content-table app-note-table"><thead><tr><th>语言</th><th>Locale</th><th>更新说明</th></tr></thead><tbody>${Object.entries(activeNotes).map(([locale, content]) => `<tr><td>${esc(localeName(locale))}</td><td>${esc(locale)}</td><td>${esc(content)}</td></tr>`).join("")}</tbody></table></div><div class="revision-list"><h4>文案修订记录</h4>${revisions.map(item => `<article><div><strong>${esc(item.operator)}</strong><span>${esc(item.time)}</span></div><p>${esc(item.reason)}</p><small>修订版本 R${item.recordVersion}</small></article>`).join("") || `<div class="empty-state compact-empty"><div>暂无修订记录</div></div>`}</div>`;
    }
    if (tab === "releases") {
      tabContent = `<div class="detail-section-toolbar"><div><strong>发布记录</strong><span>共 ${releaseRecords.length} 条版本生效或退出当前状态的记录</span></div></div>${releaseRecords.length ? `<div class="release-event-list">${releaseRecords.map(item => { const isRollback = item.action === "rollback"; const isDelist = item.action === "delist"; const actionLabel = isRollback ? "回滚恢复" : isDelist ? "版本下架" : "正常发布"; const direction = isDelist ? esc(item.fromVersion || version.version) : `${esc(item.fromVersion || "-")} → ${esc(item.toVersion || "-")}`; const eventStatus = item.status === "active" ? "当前生效" : item.status === "rolled_back" ? "已回滚" : item.status === "delisted" ? "已下架" : "历史事件"; return `<article><div class="release-event-mark ${item.action}">${isRollback ? "回" : isDelist ? "下" : "发"}</div><div><strong>${actionLabel} · ${direction}</strong><span>${esc(item.effectiveAt)} · ${esc(item.operator)}</span><small>${esc(eventStatus)}${isDelist ? "" : ` · ${esc(reminderLabel(item.reminderPolicy))}`}</small></div></article>`; }).join("")}</div>` : `<div class="empty-state detail-empty-state"><div><div class="empty-illustration">▤</div><strong>暂无发布记录</strong></div></div>`}`;
    }
    return drawerFrame("固件版本详情", `${ruleContextBar(["detail", tab === "appNotes" ? "locale" : "detail"])}<section class="version-detail-overview"><div class="version-detail-heading"><div><span>固件版本</span><h3>${esc(version.version)} <span class="tag ${statusClass}">${esc(versionStatusLabel(version.status))}</span></h3><p>固件标识 ${esc(activeIdentifier().id)} · 记录版本 R${Number(version.recordVersion || 1)}</p></div></div><div class="version-detail-summary"><div><span>适用机型</span><strong>${esc(version.models || "-")}</strong></div><div><span>关联设备</span><strong>${formatDeviceCount(version.associatedDeviceCount)} 台</strong></div><div><span>${effectiveEvent ? "最近生效时间" : "生效状态"}</span><strong>${esc(effectiveTime)}</strong></div><div><span>APP 提醒方式</span><strong>${esc(reminderText)}</strong></div></div><div class="version-detail-note"><span>平台发布说明</span><p>${esc(version.platformReleaseNotes || "-")}</p></div></section><section class="version-artifact-section"><div class="version-detail-section-head"><h3>固件包信息</h3><span>制品与修订信息</span></div><div class="version-artifact-grid"><div class="wide"><span>文件名</span><strong title="${esc(fileName)}">${esc(fileName)}</strong></div><div><span>文件大小</span><strong>${esc(version.size)} MB</strong></div><div class="wide"><span>MD5</span><strong class="mono-value">${esc(version.md5 || "-")}</strong></div><div><span>记录版本</span><strong>R${Number(version.recordVersion || 1)}</strong></div><div><span>创建人</span><strong>${esc(version.creator || "-")}</strong></div><div><span>创建时间</span><strong>${esc(version.created || version.updated || "-")}</strong></div><div><span>最后更新时间</span><strong>${esc(version.updated || "-")}</strong></div></div><div class="version-download-row"><div><span>下载地址</span><strong title="${esc(version.url)}">${esc(version.url)}</strong></div><div class="version-download-actions"><button class="btn icon-btn" title="复制下载地址" aria-label="复制下载地址" data-action="copy" data-copy="${esc(version.url)}">▣</button><a class="btn icon-btn" href="${esc(version.url)}" download title="下载固件" aria-label="下载固件">⇩</a></div></div></section><div class="tab-strip detail-tabs"><button class="tab ${tab === "related" ? "active" : ""}" data-action="detail-tab" data-tab="related">功能项配置</button><button class="tab ${tab === "appNotes" ? "active" : ""}" data-action="detail-tab" data-tab="appNotes">APP 更新说明</button><button class="tab ${tab === "releases" ? "active" : ""}" data-action="detail-tab" data-tab="releases">发布记录</button><button class="tab ${tab === "approvals" ? "active" : ""}" data-action="detail-tab" data-tab="approvals">审批日志</button></div><div class="detail-tab-content">${tabContent}</div>`);
  }

  function renderUserDetail(user) {
    const changeLogs = user.changeLogs || [];
    const lineTags = user.lines.length ? user.lines.map(line => `<span class="tag blue user-detail-line-tag">${esc(line)}</span>`).join("") : `<span class="user-detail-lines-empty">未配置所属产线</span>`;
    return drawerFrame("用户详情", `${ruleContextBar(["audit"])}<div class="detail-hero"><h3>${esc(user.name)}　<span class="tag blue">${esc(user.role)}</span> <span class="tag ${user.status === "active" ? "success" : ""}">${user.status === "active" ? "启用" : "停用"}</span></h3><p>${esc(user.userId)}</p></div><div class="drawer-section user-detail-lines"><h3>所属产线</h3><div class="user-detail-line-tags">${lineTags}</div></div><div class="form-grid" style="margin-top:20px"><div class="form-field"><label>创建时间</label><strong>${esc(user.created)}</strong></div><div class="form-field"><label>备注</label><strong>${esc(user.note || "-")}</strong></div></div><div class="drawer-section"><h3>权限范围</h3>${renderPermissionTable(db.roles.find(role => role.name === user.role) || db.roles[0], false, "detail")}</div><div class="drawer-section"><h3>变更日志</h3><div class="table-wrap"><table class="data-table detail-content-table"><thead><tr><th>变更时间</th><th>变更人</th><th>变更动作</th><th>变更内容</th></tr></thead><tbody>${changeLogs.map(log => `<tr><td>${esc(log.time)}</td><td>${esc(log.operator)}</td><td>${esc(log.action)}</td><td>${esc(log.content)}</td></tr>`).join("")}</tbody></table></div>${changeLogs.length ? "" : `<div class="empty-state compact-empty"><div><div class="empty-illustration">▤</div>暂无数据</div></div>`}</div>`);
  }

  function renderUserPermissions(user) {
    const draft = state.drawer.userDraft || { lines: [...user.lines], note: user.note, role: user.role, status: user.status };
    const selectedRole = db.roles.find(role => role.name === draft.role) || db.roles[0];
    return drawerFrame("权限配置", `${ruleContextBar(["audit"])}<form id="user-permissions-form"><div class="drawer-section" style="margin-top:0"><h3>基本信息</h3><div class="form-grid single"><div class="form-field required"><label>账号名称</label><input class="field" value="${esc(user.name)} · ${esc(user.userId)}" disabled></div><div class="form-field required"><label>账号状态</label><select class="select" data-change="user-status"><option value="active" ${draft.status === "active" ? "selected" : ""}>启用</option><option value="disabled" ${draft.status === "disabled" ? "selected" : ""}>停用</option></select><div class="helper">停用用户不能被新方案选择。承担在途审批节点时，不可停用或移出对应产线；本期不支持替换或代理。</div></div><div class="form-field required"><label>所属产线</label><div class="check-grid line-tags">${productLines.map(line => `<label class="check"><input type="checkbox" data-user-line="${esc(line)}" ${draft.lines.includes(line) ? "checked" : ""}>${esc(line)}</label>`).join("")}</div></div><div class="form-field"><label>备注</label><textarea class="textarea" data-user-note maxlength="200" placeholder="请输入备注说明信息，例如成员职责">${esc(draft.note)}</textarea><div class="helper align-right">${draft.note.length} / 200</div></div><div class="form-field required"><label>关联角色</label><select class="select" name="role" data-change="permission-role">${db.roles.map(role => `<option ${role.name === selectedRole.name ? "selected" : ""}>${esc(role.name)}</option>`).join("")}</select></div></div></div><div class="drawer-section"><h3>角色权限预览</h3>${renderPermissionTable(selectedRole, false, "user")}</div></form>`, `<button class="btn" data-action="close-overlay">取 消</button><button class="btn primary" type="submit" form="user-permissions-form">完 成</button>`);
  }

  function closeOverlay() {
    if (state.modal?.type === "materialPreview" || state.modal?.materialPreview) {
      if (state.modal.type === "materialPreview") state.modal = null;
      else delete state.modal.materialPreview;
      state.errors = {};
      renderShell();
      return;
    }
    state.modal = null;
    state.drawer = null;
    state.popover = null;
    state.errors = {};
    state.upload = null;
    renderShell();
  }

  function requestCloseOverlay(nextRoute = null) {
    const dirtyVersion = ["addVersion", "editVersion"].includes(state.drawer?.type) && state.drawer.dirty;
    const dirtyPolicy = state.drawer?.type === "approvalPolicy" && state.drawer.dirty;
    if ((dirtyVersion || dirtyPolicy) && !state.modal) {
      state.modal = { type: dirtyPolicy ? "discardApprovalPolicyChanges" : "discardVersionChanges", nextRoute };
      renderShell();
      return;
    }
    closeOverlay();
    if (nextRoute) navigate(nextRoute);
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
    if (config.reapplySourceId) { db = loadData(); }
    const identifier = activeIdentifier();
    const prior = approvalById(config.reapplySourceId);
    const actor = config.reapplySourceId ? centerUser(config.reapplyViewerId) : { userId: "submitter:汤彦珊", name: "汤彦珊" };
    if (config.reapplySourceId && (!prior || prior.firmwareId !== identifier.id || prior.type !== type || !centerCanReapply(prior, actor))) {
      toast("重新发起权限、当前业务或关联申请已变化，请刷新原审批后重新核对", "warning");
      return null;
    }
    if (identifier.activeApproval) {
      toast("当前固件标识已有生效审批，请先处理现有审批", "warning");
      return null;
    }
    const policy = activeApprovalPolicy(identifier.product, type);
    if (!policy) {
      toast(`当前产品线未配置${approvalOperationLabel(type)}审批方案，请联系系统管理员`, "warning");
      return null;
    }
    const policyNodeIssue = approvalPolicyNodeIssue(policy);
    if (policyNodeIssue) {
      toast(`当前审批方案不可用：${policyNodeIssue}，请联系系统管理员`, "warning");
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
    if (config.reapplySourceId) {
      const eligibility = type === "publish" ? versionPublishEligibility(identifier, target) : null;
      if (eligibility && !eligibility.allowed) { toast(eligibility.reason, "warning"); return null; }
      if ((isRollback && (!identifier.rollbackAvailable || config.targetVersion !== target.version)) || (isDelist && config.sourceReleaseId !== sourceEvent.id)) {
        toast("当前发布事件或目标已变化，请重新核对申请内容", "warning"); return null;
      }
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
      const reportError = materialValidation(config.testReportFiles, releaseMaterialRules.testReport);
      if (reportError || !config.testReportFiles?.length) {
        toast(reportError || "请上传测试报告后再提交正式发布审批", "warning");
        return null;
      }
    }
    if (policy.nodes.some(node => nodeApproverIds(node).some(id => db.users.find(user => user.userId === id)?.name === actor.name))) {
      toast("发起人不能审批自己的申请", "warning");
      return null;
    }
    const flowId = releaseId(isDelist ? "FLOW-DELIST" : isRollback ? "FLOW-ROLLBACK" : "FLOW-PUB");
    const submitTime = now();
    const tasks = policy.nodes.map((node, index) => ({
      sequence: index + 1,
      type: "generic",
      approverUserId: nodeApproverIds(node)[0],
      approverNameSnapshot: node.approverName,
      approvers: nodeApproverIds(node).map(id => ({ userId: id, name: db.users.find(user => user.userId === id)?.name || id })),
      status: index === 0 ? "审批中" : "未激活",
      startedAt: index === 0 ? submitTime : "-",
      deadlineAt: "-",
      completedAt: "-",
      replacementHistory: []
    }));
    const approval = {
      id: releaseId("APR"),
      version: target.version,
      event: isDelist ? "下架当前发布版本" : isRollback ? "撤销并回滚固件版本" : "发布当前固件版本",
      submitter: actor.name,
      submitterUserId: actor.userId,
      submitTime,
      approver: tasks[0]?.approverNameSnapshot || "-",
      status: "审批中",
      approvalStatus: "审批中",
      executionStatus: "未执行",
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
      testReportFiles: type === "publish" ? clone(config.testReportFiles || []) : [],
      meetingMinutesFiles: [],
      copyUserIds: clone(policy.copyUserIds || []),
      notificationStatus: [],
      snapshotRecordVersion: target.recordVersion,
      previousTargetStatus: isRollback || isDelist ? null : target.status,
      sourceReleaseId: sourceEvent?.id || null,
      flowId,
      productLine: identifier.product,
      policyId: policy.id,
      policyVersion: policy.policyVersion,
      policyNameSnapshot: policy.name,
      currentTaskIndex: 0,
      tasks
    };
    approval.instanceNo = approval.id;
    approval.readBy = [];
    if (prior && prior.firmwareId === identifier.id && prior.type === type) {
      approval.relatedApprovalId = prior.id;
      prior.relatedApprovalIds = [...(prior.relatedApprovalIds || []), approval.id];
    }
    recordApprovalNotification(approval, "第 1 级节点已激活", taskNames(tasks[0]));
    db.approvals.unshift(approval);
    identifier.activeApproval = { approvalId: approval.id, type, version: target.version };
    if (!isRollback && !isDelist) target.status = "approval";
    addOperation(isDelist ? "固件下架" : isRollback ? "固件回滚" : "固件申请", "提交审批", target.version, actor.name, "成功", `${policy.policyVersion}；${policy.levelCount} 级串行${prior ? `；关联原审批 ${prior.instanceNo}` : ""}${type === "publish" ? `；测试报告 ${config.testReportFiles.length} 个` : isDelist ? `；${config.reasonType}；当前版本在审批期间继续生效` : ""}`);
    addLifecycleEvent(identifier, { flowId, flowType: isDelist ? "delist" : isRollback ? "rollback" : "publish", flowStatus: "pending", fromVersion: current?.version || null, toVersion: isDelist ? null : target.version, stage: "approval", title: isDelist ? "提交下架审批" : isRollback ? "提交回滚审批" : "提交发布审批", operator: approval.submitter, result: "success", summary: `${isDelist ? `已锁定 ${target.version} R${target.recordVersion} 及影响范围` : `审批快照已锁定，目标版本 ${target.version}`}；采用 ${policy.policyVersion}，共 ${policy.levelCount} 级串行审批` });
    state.expandedLifecycleFlows = [flowId];
    persist();
    return approval;
  }

  function approveCurrentApprovalTask(approval, context = {}) {
    if (!approval || approval.approvalStatus !== "审批中") return { ok: false, message: "当前审批已结束" };
    const task = currentApprovalTask(approval);
    if (!task) return { ok: false, message: "当前没有可处理的审批节点" };
    if (context.expectedSequence && task.sequence !== context.expectedSequence) return { ok: false, message: "当前节点已由他人处理" };
    const actor = context.viewerId ? approvalViewerContext(approval, context.viewerId).viewer : taskPeople(task)[0];
    if (context.viewerId && !approvalViewerContext(approval, context.viewerId).canDecide) return { ok: false, message: "当前身份不能处理该节点" };
    if (approval.type === "publish" && task.sequence === 1) {
      const files = approval.meetingMinutesFiles || [];
      const materialError = materialValidation(files, releaseMaterialRules.meetingMinutes);
      if (materialError || !files.length) return { ok: false, message: materialError || "请先上传会议纪要附件" };
    }
    task.handledBy = actor.name;
    const identifier = db.identifiers.find(item => item.id === approval.firmwareId);
    const stamp = now();
    task.status = "已通过";
    task.siblingClosed = true;
    task.completedAt = stamp;
    task.decision = "通过";
    task.decisionNote = String(context.note || "").trim();
    approval.approver = task.handledBy;
    addOperation(approval.type === "delist" ? "固件下架" : approval.type === "rollback" ? "固件回滚" : "固件申请", `第 ${task.sequence} 级审批通过`, approval.version, actor.name, "成功", `${approval.policyVersion}；平台节点处理成功`);
    if (identifier) addLifecycleEvent(identifier, { flowId: approval.flowId, flowType: approval.type, flowStatus: "pending", fromVersion: approval.fromVersion, toVersion: approval.toVersion, stage: "approval", sequence: 10 + task.sequence, title: `第 ${task.sequence} 级审批通过`, operator: actor.name, operatorType: "平台审批", result: "success", summary: `${approval.policyVersion} 的第 ${task.sequence}/${approval.tasks.length} 级节点已通过` });
    const nextTask = approval.tasks[task.sequence];
    if (nextTask) {
      nextTask.status = "审批中";
      nextTask.startedAt = stamp;
      nextTask.deadlineAt = "-";
      approval.currentTaskIndex = nextTask.sequence - 1;
      approval.approver = nextTask.approverNameSnapshot;
      recordApprovalNotification(approval, `第 ${nextTask.sequence} 级节点已激活`, taskNames(nextTask));
      persist();
      return { ok: true, complete: false, task: nextTask };
    }
    approval.currentTaskIndex = approval.tasks.length - 1;
    approval.status = "已通过";
    approval.approvalStatus = "已通过";
    approval.approveTime = stamp;
    approval.executionStatus = "执行中";
    persist();
    return { ok: true, complete: true };
  }

  function executeApprovedRelease(approval) {
    const identifier = db.identifiers.find(item => item.id === approval.firmwareId);
    if (!identifier || identifier.activeApproval?.approvalId !== approval.id) return { ok: false, kind: "stale", message: "审批已失效，当前固件状态已发生变化" };
    const current = currentVersion(identifier);
    const stamp = now();
    const finalApprover = approval.tasks?.[approval.tasks.length - 1]?.approverNameSnapshot || approval.approver || "审批人";
    if (approval.type === "delist") {
      const target = identifier.versions.find(version => version.version === approval.fromVersion);
      const sourceEvent = activeRelease(identifier);
      if (!target || current?.version !== approval.fromVersion || target.status !== "current") return { ok: false, kind: "stale", message: "当前发布版本已变化，原下架审批失效" };
      if (Number(target.recordVersion) !== Number(approval.snapshotRecordVersion)) return { ok: false, kind: "stale", message: "当前版本记录已发生变化，原下架审批快照失效" };
      if (!sourceEvent || sourceEvent.id !== approval.sourceReleaseId || sourceEvent.status !== "active") return { ok: false, kind: "stale", message: "当前发布事件已变化，原下架审批失效" };
      addLifecycleEvent(identifier, { flowId: approval.flowId, flowType: "delist", flowStatus: "completed", fromVersion: target.version, toVersion: null, stage: "approval", title: "下架审批通过", time: stamp, operator: finalApprover, operatorType: "平台审批", result: "success", summary: "全部审批节点通过，当前版本及影响范围快照复检通过" });
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
      approval.status = "已通过";
      approval.approvalStatus = "已通过";
      approval.executionStatus = "执行成功";
      approval.approver = finalApprover;
      approval.approveTime = stamp;
      recordApprovalNotification(approval, "下架执行成功", terminalApprovalRecipients(approval));
      addOperation("固件下架", "下架生效", target.version, "发布服务", "成功", `${approval.reasonType}；当前发布版本已清空，固件包保留`);
      addLifecycleEvent(identifier, { flowId: approval.flowId, flowType: "delist", flowStatus: "completed", fromVersion: target.version, toVersion: null, stage: "delist", title: "停止提供当前发布版本", time: stamp, operator: "发布服务", operatorType: "系统", result: "success", summary: `${target.version} → 暂无当前发布版本；固件包与已升级设备不受影响` });
      addLifecycleEvent(identifier, { flowId: approval.flowId, flowType: "delist", flowStatus: "completed", fromVersion: target.version, toVersion: null, stage: "cache", title: "升级检查缓存失效", time: stamp, operator: "发布服务", operatorType: "系统", result: "success", summary: "新发起的升级检查不再返回该版本；OTA 已有任务不在本平台承诺停止" });
      persist();
      return { ok: true, version: target.version, type: "delist" };
    }
    const target = identifier.versions.find(version => version.version === approval.toVersion);
    if (!target || target.recordVersion !== approval.snapshotRecordVersion) return { ok: false, kind: "stale", message: "目标版本已发生变化，原审批快照失效" };
    if (approval.type === "publish") {
      if (target.status !== "approval" || (current?.version || null) !== (approval.fromVersion || null)) return { ok: false, kind: "stale", message: "当前发布版本已变化，原发布审批失效" };
      const featureError = featureConfigurationError(approval.associatedFeatures || [], identifier.product);
      if (featureError) return { ok: false, kind: "stale", message: `${featureError}，原发布审批失效` };
      addLifecycleEvent(identifier, { flowId: approval.flowId || releaseId("FLOW"), flowType: "publish", flowStatus: "active", fromVersion: approval.fromVersion, toVersion: approval.toVersion, stage: "approval", title: "发布审批通过", time: stamp, operator: finalApprover, operatorType: "平台审批", result: "success", summary: "全部审批节点通过，版本快照校验通过" });
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
      if (!identifier.rollbackAvailable || current?.version !== approval.fromVersion || identifier.rollbackTargetVersion !== target.version) return { ok: false, kind: "stale", message: "唯一回滚目标已变化，原回滚审批失效" };
      addLifecycleEvent(identifier, { flowId: approval.flowId || releaseId("FLOW"), flowType: "rollback", flowStatus: "active", fromVersion: approval.fromVersion, toVersion: approval.toVersion, stage: "approval", title: "回滚审批通过", time: stamp, operator: finalApprover, operatorType: "平台审批", result: "success", summary: "全部审批节点通过，版本快照校验通过" });
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
    approval.status = "已通过";
    approval.approvalStatus = "已通过";
    approval.executionStatus = "执行成功";
    approval.approver = finalApprover;
    approval.approveTime = stamp;
    recordApprovalNotification(approval, approval.type === "publish" ? "正式发布成功" : approval.type === "rollback" ? "回滚执行成功" : "下架执行成功", terminalApprovalRecipients(approval));
    persist();
    return { ok: true, version: target.version, type: approval.type };
  }

  function restorePublishApprovalTarget(approval) {
    if (approval?.type !== "publish") return;
    const identifier = db.identifiers.find(item => item.id === approval.firmwareId);
    const target = identifier?.versions.find(version => version.version === approval.toVersion);
    if (identifier?.activeApproval && identifier.activeApproval.approvalId !== approval.id) return;
    if (target?.status === "approval") target.status = approval.previousTargetStatus || "unpublished";
  }

  function rejectReleaseApproval(approval, rejectionReason = "", actor) {
    if (!approval || approval.approvalStatus !== "审批中") return { ok: false, message: "审批已结束" };
    if (!String(rejectionReason).trim()) return { ok: false, message: "驳回原因必填" };
    const task = currentApprovalTask(approval);
    approval.rejectionReason = rejectionReason;
    if (task) task.decision = "驳回";
    return closeApprovalInstance(approval, "已驳回", rejectionReason, actor || taskPeople(task)[0]?.name || "审批人");
  }

  function withdrawReleaseApproval(approval, reason, metadata = {}) {
    if (!approval || approval.approvalStatus !== "审批中") return { ok: false, message: "当前审批已结束，不能撤回" };
    if (!String(reason).trim()) return { ok: false, message: "撤回原因必填" };
    const task = currentApprovalTask(approval);
    approval.withdrawalReason = reason;
    approval.withdrawalReasonCode = metadata.code || approval.withdrawalReasonCode || "other";
    approval.withdrawalReasonLabel = metadata.label || withdrawalReasonLabel(approval.withdrawalReasonCode) || "其他";
    approval.withdrawalReasonNote = metadata.note || approval.withdrawalReasonNote || "";
    approval.withdrawnAt = now();
    return closeApprovalInstance(approval, "已撤回", reason, approval.submitter);
  }

  function retryApprovedReleaseExecution() {
    return { ok: false, message: "本期禁止在原审批实例重试，请重新发起审批" };
  }

  app.addEventListener("click", async event => {
    if (state.profileOpen && !event.target.closest(".profile-menu") && !event.target.closest(".profile-trigger")) {
      state.profileOpen = false;
      app.querySelector(".profile-menu")?.remove();
    }
    const routeButton = event.target.closest("[data-route]");
    if (routeButton) {
      if (state.drawer?.dirty && routeButton.dataset.route !== state.route) {
        requestCloseOverlay(routeButton.dataset.route);
        return;
      }
      navigate(routeButton.dataset.route);
      return;
    }
    const target = event.target.closest("[data-action]");
    if (!target) {
      if (state.drawer?.type === "approvalPolicy") {
        let pickerClosed = false;
        if (Number.isInteger(state.drawer.nodeUserPickerOpen) && !event.target.closest(".policy-user-picker")) {
          state.drawer.nodeUserPickerOpen = null;
          pickerClosed = true;
        }
        if (state.drawer.copyUserPickerOpen && !event.target.closest(".policy-copy-picker")) {
          state.drawer.copyUserPickerOpen = false;
          state.drawer.copyUserSearch = "";
          state.drawer.copyUserTab = "all";
          pickerClosed = true;
        }
        if (pickerClosed) {
          renderShell();
          return;
        }
      }
      const approvalDetail = activeApprovalDetail();
      if (approvalDetail?.viewerPickerOpen && !event.target.closest(".approval-viewer-switch")) {
        approvalDetail.viewerPickerOpen = false;
        renderShell();
        return;
      }
      if (state.modal?.type === "featurePicker" && (state.modal.versionOpen || state.modal.infoOpen) && !event.target.closest(".feature-version-select-wrap") && !event.target.closest(".feature-version-info-popover")) {
        state.modal.versionOpen = null;
        state.modal.infoOpen = null;
        renderShell();
        return;
      }
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
    if (handleApprovalCenterAction(action, target)) return;
    if (state.rulePanel && action !== "open-rule-panel" && action !== "close-rule-panel") dismissRulePopover();
    const popoverToggles = ["identifier-actions", "density-menu", "column-settings", "role-more", "user-line-filter", "role-user-line-filter"];
    if (state.popover && !popoverToggles.includes(action) && !event.target.closest(".action-popover")) state.popover = null;

    if (action === "toggle-approval-viewer" && activeApprovalDetail()) {
      const approvalDetail = activeApprovalDetail();
      approvalDetail.viewerPickerOpen = !approvalDetail.viewerPickerOpen;
      renderShell();
      return;
    }
    if (action === "select-approval-viewer" && activeApprovalDetail()) {
      const approvalDetail = activeApprovalDetail();
      const approval = approvalById(approvalDetail.approvalId);
      const option = approvalViewerOptions(approval).find(item => item.viewerId === target.dataset.viewerId);
      if (!option) return;
      approvalDetail.viewerId = option.viewerId;
      approvalDetail.viewerPickerOpen = false;
      approvalDetail.approvalNote = "";
      approvalDetail.rejectionReason = "";
      state.errors = {};
      renderShell();
      return;
    }

    if (action === "approval-scroll-section" && activeApprovalDetail()) {
      const section = app.querySelector(`[data-approval-section="${target.dataset.target}"]`);
      if (!section) return;
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

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
      if (state.modal?.type === "materialPreview") state.modal = null;
      else if (state.modal?.materialPreview) delete state.modal.materialPreview;
      else state.modal = null;
      state.errors = {};
      renderShell();
      return;
    }
    if (action === "back-to-version-approvals") {
      const approvalDetail = activeApprovalDetail();
      const returnDrawer = approvalDetail?.returnDrawer;
      if (!returnDrawer) {
        closeOverlay();
        return;
      }
      const restoreScrollTop = Number(returnDrawer.restoreScrollTop || 0);
      const nextDrawer = clone(returnDrawer);
      delete nextDrawer.restoreScrollTop;
      state.modal = null;
      state.drawer = nextDrawer;
      state.errors = {};
      renderShell();
      const drawerBody = app.querySelector(".drawer-body");
      if (drawerBody) drawerBody.scrollTop = restoreScrollTop;
      return;
    }
    if (action === "toggle-feature-version-menu" && state.modal?.type === "featurePicker") {
      const id = target.dataset.featureId;
      state.modal.versionOpen = state.modal.versionOpen === id ? null : id;
      state.modal.infoOpen = null;
      renderShell();
      return;
    }
    if (action === "select-feature-version" && state.modal?.type === "featurePicker") {
      const feature = associatedFeatureCatalog.find(item => item.id === target.dataset.featureId);
      const version = feature?.versions?.find(item => item.id === target.dataset.versionId);
      if (!feature || !version || !["published", "testing"].includes(version.status)) return;
      state.modal.versionSelections[target.dataset.featureId] = target.dataset.versionId;
      state.modal.versionOpen = null;
      state.modal.infoOpen = null;
      delete state.errors.featurePicker;
      renderShell();
      return;
    }
    if (action === "toggle-feature-version-info" && state.modal?.type === "featurePicker") {
      const id = target.dataset.featureId;
      state.modal.infoOpen = state.modal.infoOpen === id ? null : id;
      state.modal.versionOpen = null;
      renderShell();
      return;
    }
    if (action === "switch-feature-version" && state.modal?.type === "featurePicker") {
      state.modal.infoOpen = null;
      state.modal.versionOpen = target.dataset.featureId || null;
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
      const nextRoute = state.modal?.nextRoute || null;
      if (state.drawer) state.drawer.dirty = false;
      closeOverlay();
      if (nextRoute) navigate(nextRoute);
      return;
    }
    if (action === "select-policy-line") {
      state.selectedPolicyProductLine = target.dataset.productLine;
      state.selectedPolicyOperation = "";
      state.approvalPolicyPage = 1;
      renderShell();
      return;
    }
    if (action === "new-approval-policy") {
      state.errors = {};
      const productLine = state.selectedPolicyProductLine || productLines[0];
      const operation = approvalOperationCatalog.some(item => item.value === target.dataset.operation) ? target.dataset.operation : "publish";
      if (anyApprovalPolicy(productLine, operation)) {
        toast("该审批操作已有方案，请从卡片中编辑或查看版本记录", "warning");
        return;
      }
      state.selectedPolicyOperation = operation;
      state.drawer = { type: "approvalPolicy", policyId: null, policyDraft: newApprovalPolicyDraft(productLine, operation), previewOperation: operation, nodeUserPickerOpen: null, copyUserPickerOpen: false, copyUserTab: "all", copyUserSearch: "", dirty: false };
      renderShell();
      return;
    }
    if (action === "view-approval-policy") {
      const policy = db.approvalPolicies.find(item => item.id === target.dataset.policyId);
      if (!policy) return;
      state.modal = null;
      state.selectedPolicyOperation = policyOperation(policy);
      state.drawer = { type: "policyDetail", policyId: policy.id };
      renderShell();
      return;
    }
    if (action === "select-policy-operation") {
      const operation = target.dataset.operation;
      const productLine = state.selectedPolicyProductLine || productLines[0];
      const coverage = approvalOperationCatalog.some(item => item.value === operation) ? policyCoverage(productLine, operation) : null;
      if (!coverage) return;
      state.selectedPolicyOperation = operation;
      if (coverage.status === "unconfigured") {
        state.errors = {};
        const draft = newApprovalPolicyDraft(productLine, operation);
        state.drawer = { type: "approvalPolicy", policyId: null, policyDraft: draft, previewOperation: operation, nodeUserPickerOpen: null, copyUserPickerOpen: false, copyUserTab: "all", copyUserSearch: "", dirty: false };
        renderShell();
        return;
      }
      const policy = coverage.policies[0];
      state.modal = null;
      state.drawer = { type: "policyDetail", policyId: policy.id };
      renderShell();
      return;
    }
    if (action === "approval-policy-page") {
      state.approvalPolicyPage = Number(target.dataset.page) || 1;
      renderShell();
      return;
    }
    if (action === "select-policy-history-version") {
      if (state.drawer?.type !== "policyVersionHistory") return;
      state.drawer.selectedVersion = target.dataset.policyVersion || state.drawer.selectedVersion;
      renderShell();
      return;
    }
    if (action === "add-approval-policy") {
      state.errors = {};
      const productLine = state.selectedPolicyProductLine || productLines[0];
      const operation = approvalOperationCatalog.find(item => !anyApprovalPolicy(productLine, item.value))?.value || "publish";
      state.drawer = { type: "approvalPolicy", policyId: null, policyDraft: newApprovalPolicyDraft(productLine, operation), previewOperation: operation, nodeUserPickerOpen: null, copyUserPickerOpen: false, copyUserTab: "all", copyUserSearch: "", dirty: false };
      renderShell();
      return;
    }
    if (action === "edit-approval-policy") {
      const policy = db.approvalPolicies.find(item => item.id === target.dataset.policyId);
      if (!policy) return;
      state.errors = {};
      state.drawer = { type: "approvalPolicy", policyId: policy.id, policyDraft: { name: policy.name, productLine: policy.productLine, operation: policyOperation(policy), description: policy.description || "", operations: [policyOperation(policy)], levelCount: policy.levelCount, status: policy.status === "disabled" ? "disabled" : "enabled", copyUserIds: clone(policy.copyUserIds || []), changeReason: "", nodes: clone(policy.nodes) }, previewOperation: policyOperation(policy), nodeUserPickerOpen: null, copyUserPickerOpen: false, copyUserTab: "all", copyUserSearch: "", dirty: false };
      renderShell();
      return;
    }
    if (action === "toggle-approval-policy") {
      const policy = db.approvalPolicies.find(item => item.id === target.dataset.policyId);
      if (!policy) return;
      state.modal = { type: "approvalPolicyToggle", policyId: policy.id, nextStatus: policy.status === "disabled" ? "enabled" : "disabled" };
      renderShell();
      return;
    }
    if (action === "confirm-approval-policy-toggle") {
      const modal = state.modal;
      if (modal?.type !== "approvalPolicyToggle") return;
      const policy = db.approvalPolicies.find(item => item.id === modal.policyId);
      if (!policy) {
        closeOverlay();
        return;
      }
      if (modal.nextStatus === "enabled" && approvalPolicyNodeIssue(policy)) { toast(approvalPolicyNodeIssue(policy), "warning"); return; }
      policy.status = modal.nextStatus === "enabled" ? "enabled" : "disabled";
      policy.updatedAt = now();
      policy.updatedBy = "汤彦珊";
      addOperation("审批配置", policy.status === "enabled" ? "启用" : "停用", policy.name, "汤彦珊", "成功", `${policy.policyVersion}；${approvalOperationLabel(policyOperation(policy))}`);
      persist();
      state.modal = null;
      renderShell();
      toast(policy.status === "enabled" ? "审批方案已启用，后续新请求将进入审批" : "审批方案已停用，后续新申请将被阻断");
      return;
    }
    if (action === "select-policy-preview-operation") {
      if (state.drawer?.type !== "approvalPolicy") return;
      const operation = target.dataset.operation;
      if (!state.drawer.policyDraft.operations.includes(operation)) return;
      state.drawer.previewOperation = operation;
      renderShell();
      return;
    }
    if (action === "toggle-policy-node-user-picker") {
      if (state.drawer?.type !== "approvalPolicy") return;
      const nodeIndex = Number(target.dataset.nodeIndex);
      if (!Number.isInteger(nodeIndex) || !state.drawer.policyDraft.nodes[nodeIndex]) return;
      state.drawer.copyUserPickerOpen = false;
      state.drawer.copyUserSearch = "";
      state.drawer.copyUserTab = "all";
      state.drawer.nodeUserPickerOpen = state.drawer.nodeUserPickerOpen === nodeIndex ? null : nodeIndex;
      renderShell();
      if (state.drawer.nodeUserPickerOpen === nodeIndex) app.querySelector(`[data-policy-node-user-search="${nodeIndex}"]`)?.focus();
      return;
    }
    if (action === "select-policy-node-user") {
      if (state.drawer?.type !== "approvalPolicy") return;
      const nodeIndex = Number(target.dataset.nodeIndex);
      const user = approvalPolicyCandidates(state.drawer.policyDraft.productLine).find(item => item.userId === target.dataset.userId);
      const nodes = normalizeApprovalPolicyDraftNodes(state.drawer.policyDraft);
      if (!user || !nodes[nodeIndex]) return;
      if (nodes.some((node, index) => index !== nodeIndex && nodeApproverIds(node).includes(user.userId))) {
        toast("该用户已配置在其他审批节点", "warning");
        return;
      }
      const ids = nodeApproverIds(nodes[nodeIndex]);
      setNodeApprovers(nodes[nodeIndex], ids.includes(user.userId) ? ids.filter(id => id !== user.userId) : [...ids, user.userId]);
      const pickerQuery = app.querySelector(`[data-policy-node-user-search="${nodeIndex}"]`)?.value || "";
      markApprovalPolicyDirty();
      clearApprovalPolicyNodeErrors();
      renderShell();
      const pickerInput = app.querySelector(`[data-policy-node-user-search="${nodeIndex}"]`);
      if (pickerInput) { pickerInput.value = pickerQuery; pickerInput.dispatchEvent(new Event("input", { bubbles: true })); pickerInput.focus(); }
      return;
    }
    if (action === "toggle-policy-copy-picker") {
      if (state.drawer?.type !== "approvalPolicy") return;
      state.drawer.nodeUserPickerOpen = null;
      const opening = !state.drawer.copyUserPickerOpen;
      state.drawer.copyUserPickerOpen = opening;
      if (!opening) {
        state.drawer.copyUserSearch = "";
        state.drawer.copyUserTab = "all";
      }
      renderShell();
      if (state.drawer.copyUserPickerOpen) app.querySelector("[data-policy-copy-search]")?.focus({ preventScroll: true });
      return;
    }
    if (action === "close-policy-copy-picker") {
      if (state.drawer?.type !== "approvalPolicy") return;
      state.drawer.copyUserPickerOpen = false;
      state.drawer.copyUserSearch = "";
      state.drawer.copyUserTab = "all";
      renderShell();
      app.querySelector('[data-action="toggle-policy-copy-picker"]')?.focus();
      return;
    }
    if (action === "select-policy-copy-tab") {
      if (state.drawer?.type !== "approvalPolicy") return;
      state.drawer.copyUserTab = target.dataset.tab === "selected" ? "selected" : "all";
      renderShell();
      app.querySelector("[data-policy-copy-search]")?.focus({ preventScroll: true });
      return;
    }
    if (action === "remove-policy-copy-user") {
      if (state.drawer?.type !== "approvalPolicy") return;
      state.drawer.policyDraft.copyUserIds = (state.drawer.policyDraft.copyUserIds || []).filter(userId => userId !== target.dataset.userId);
      markApprovalPolicyDirty();
      renderShell();
      return;
    }
    if (action === "clear-policy-copy-users") {
      if (state.drawer?.type !== "approvalPolicy") return;
      state.drawer.policyDraft.copyUserIds = [];
      markApprovalPolicyDirty();
      renderShell();
      if (state.drawer.copyUserPickerOpen) app.querySelector("[data-policy-copy-search]")?.focus({ preventScroll: true });
      return;
    }
    if (action === "add-policy-node") {
      if (state.drawer?.type !== "approvalPolicy") return;
      const nodes = normalizeApprovalPolicyDraftNodes(state.drawer.policyDraft);
      if (nodes.length >= 5) {
        toast("审批节点最多配置 5 级", "warning");
        return;
      }
      nodes.push({ sequence: nodes.length + 1, type: "generic", approverUserId: "", approverName: "" });
      normalizeApprovalPolicyDraftNodes(state.drawer.policyDraft);
      clearApprovalPolicyNodeErrors();
      state.drawer.dirty = true;
      renderShell();
      return;
    }
    if (action === "remove-policy-node") {
      if (state.drawer?.type !== "approvalPolicy") return;
      const nodes = normalizeApprovalPolicyDraftNodes(state.drawer.policyDraft);
      if (nodes.length <= 1) {
        toast("审批方案至少保留 1 个审批节点", "warning");
        return;
      }
      const nodeIndex = Number(target.dataset.nodeIndex);
      if (!Number.isInteger(nodeIndex) || nodeIndex < 0 || nodeIndex >= nodes.length) return;
      nodes.splice(nodeIndex, 1);
      normalizeApprovalPolicyDraftNodes(state.drawer.policyDraft);
      clearApprovalPolicyNodeErrors();
      state.drawer.dirty = true;
      renderShell();
      toast("审批节点已删除，后续级数已自动调整");
      return;
    }
    if (action === "save-approval-policy") {
      saveApprovalPolicy();
      return;
    }
    if (action === "policy-version-history") {
      const policy = db.approvalPolicies.find(item => item.id === target.dataset.policyId);
      if (!policy) return;
      state.modal = null;
      state.drawer = { type: "policyVersionHistory", policyId: policy.id, selectedVersion: policy.history?.[0]?.policyVersion || policy.policyVersion };
      renderShell();
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
      const identifier = activeIdentifier();
      const baseline = configuredFeatureBaseline(identifier);
      const inheritedLocales = baseline.source
        ? enabledAppNoteLocales(normalizeAppNoteMeta(baseline.source.appNoteMeta, baseline.source.appReleaseNotes)).filter(locale => locale !== "zh")
        : [];
      const defaultTargets = inheritedLocales.length ? inheritedLocales : identifier.aiTranslationLocales || ["en"];
      state.drawer = { type: "addVersion", formDraft: { version: "", models: baseline.source?.models || identifier.models || "", note: "" }, associatedFeatures: ensureRequiredFeatureSnapshots(clone(baseline.features), identifier.product), inheritedFromVersion: baseline.source?.version || null, inheritanceType: baseline.type, appReleaseNotes: appNoteDraft(), appNoteMeta: normalizeAppNoteMeta({}, {}, defaultTargets), activeLocale: "zh", translationTargetsOpen: false, dirty: false };
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
      const revisionTime = now();
      version.updated = revisionTime;
      version.recordVersion = Number(version.recordVersion || 1) + 1;
      if (!Array.isArray(version.noteRevisions)) version.noteRevisions = [];
      version.noteRevisions.unshift({ time: revisionTime, operator: "汤彦珊", reason: state.modal.reason.trim(), before, after: { appReleaseNotes: clone(notes), appNoteMeta: clone(meta) }, recordVersion: version.recordVersion });
      addOperation("APP 更新说明", "修订", version.version);
      persist();
      state.modal = null;
      state.errors = {};
      renderShell();
      toast(version.status === "current" ? `APP 更新说明已修订，文案修订记录 R${version.recordVersion} 已生成` : `回滚目标文案已修订，文案修订记录 R${version.recordVersion} 已生成`);
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
      const reportError = materialValidation(state.modal.testReportFiles || [], releaseMaterialRules.testReport);
      if (reportError) state.errors.testReport = reportError;
      else if (!(state.modal.testReportFiles || []).length) state.errors.testReport = "请上传测试报告附件";
      if (Object.keys(state.errors).length) { renderShell(); return; }
      const approval = submitReleaseApproval("publish", state.modal);
      if (!approval) return;
      openApprovalDetail(approval.id);
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
      openApprovalDetail(approval.id);
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
      openApprovalDetail(approval.id);
      renderShell();
      return;
    }
    if (action === "view-active-approval") {
      const approvalId = activeIdentifier().activeApproval?.approvalId;
      if (!approvalId || !approvalById(approvalId)) { toast("当前没有进行中的审批", "warning"); return; }
      openApprovalDetail(approvalId);
      renderShell();
      return;
    }
    if (action === "preview-approval-material" || action === "download-approval-material") {
      const index = Number(target.dataset.materialIndex);
      const kind = target.dataset.materialKind;
      const approvalDetail = activeApprovalDetail();
      const approval = approvalDetail ? approvalById(approvalDetail.approvalId) : null;
      const centerApproval = approval || (!state.modal ? approvalById(state.center.selectedId) : null);
      const files = kind === "meetingMinutes" ? centerApproval?.meetingMinutesFiles : centerApproval?.testReportFiles || state.modal?.testReportFiles;
      const file = files?.[index];
      if (!file) { toast("附件记录不存在", "warning"); return; }
      if (approvalDetail || centerApproval) {
        state.modal = { type: "materialPreview", approvalId: centerApproval.id, materialKind: kind, materialIndex: index };
      } else if (state.modal) {
        state.modal.materialPreview = { materialKind: kind, materialIndex: index };
      } else {
        toast(`已打开附件快照：${file.name}`);
        return;
      }
      renderShell();
      return;
    }
    if (action === "remove-approval-material") {
      const index = Number(target.dataset.materialIndex);
      const kind = target.dataset.materialKind;
      if (kind === "testReport" && state.modal?.type === "publish") {
        state.modal.testReportFiles = (state.modal.testReportFiles || []).filter((_file, fileIndex) => fileIndex !== index);
        delete state.errors.testReport;
        renderShell();
        return;
      }
      if (kind === "meetingMinutes" && activeApprovalDetail()) {
        const approvalDetail = activeApprovalDetail();
        const approval = approvalById(approvalDetail.approvalId);
        const viewerContext = approvalViewerContext(approval, approvalDetail.viewerId);
        if (!viewerContext.canUploadMinutes) { toast("仅当前第 1 级审批人可修改会议纪要", "warning"); return; }
        approval.meetingMinutesFiles = (approval.meetingMinutesFiles || []).filter((_file, fileIndex) => fileIndex !== index);
        delete state.errors.meetingMinutes;
        persist();
        renderShell();
        return;
      }
      toast("审批材料快照不可修改", "warning");
      return;
    }
    if (action === "request-withdraw-approval") {
      db = loadData();
      const approvalDetail = activeApprovalDetail();
      const approval = approvalById(approvalDetail?.approvalId);
      const viewerContext = approvalViewerContext(approval, approvalDetail?.viewerId);
      if (!viewerContext.canWithdraw) { toast("仅审批发起人可撤回进行中的申请", "warning"); return; }
      state.errors = {};
      state.modal = { type: "withdrawApproval", approvalId: approval.id, viewerId: viewerContext.viewer.viewerId, withdrawalReasonCode: "", withdrawalReasonNote: "" };
      renderShell();
      return;
    }
    if (action === "cancel-withdraw-approval") {
      const approvalId = state.modal?.approvalId;
      const viewerId = state.modal?.viewerId;
      state.errors = {};
      restoreApprovalDetail(approvalId, viewerId);
      renderShell();
      return;
    }
    if (action === "confirm-withdraw-approval") {
      db = loadData();
      const approval = approvalById(state.modal?.approvalId);
      const viewerContext = approvalViewerContext(approval, state.modal?.viewerId);
      if (!viewerContext.canWithdraw) { toast("当前模拟账号无权撤回该申请", "warning"); return; }
      const reasonError = withdrawalReasonError(state.modal?.withdrawalReasonCode, state.modal?.withdrawalReasonNote);
      state.errors = {};
      if (reasonError) {
        state.errors.withdrawalReason = reasonError;
        renderShell();
        return;
      }
      const reason = withdrawalReasonText(state.modal.withdrawalReasonCode, state.modal.withdrawalReasonNote);
      const result = withdrawReleaseApproval(approval, reason, { code: state.modal.withdrawalReasonCode, label: withdrawalReasonLabel(state.modal.withdrawalReasonCode), note: state.modal.withdrawalReasonNote });
      if (!result.ok) { toast(result.message, "warning"); return; }
      restoreApprovalDetail(approval.id, viewerContext.viewer.viewerId);
      renderShell();
      toast("审批申请已撤回，本次流程已结束", "warning");
      return;
    }
    if (["replace-approval-task", "confirm-replace-approval-task"].includes(action)) {
      toast("本期不支持在途审批人替换、重新分派或临时代理", "warning");
      return;
    }
    if (action === "remind-approval") {
      db = loadData();
      const approvalDetail = activeApprovalDetail();
      const approval = approvalById(approvalDetail?.approvalId);
      const viewerContext = approvalViewerContext(approval, approvalDetail?.viewerId);
      if (approvalDetail?.reminderScope !== "mine" || !viewerContext.canRemind || !viewerContext.isSubmitter) { toast("仅在审批中心“我发起的”中提供催办", "warning"); return; }
      const result = sendApprovalReminder(approval, viewerContext.viewer.name);
      renderShell();
      toast(result.ok ? `已向 ${result.recipients.join("、")} 发送钉钉催办通知` : result.message, result.ok ? "success" : "warning");
      return;
    }
    if (action === "simulate-approval-approve") {
      db = loadData();
      const approvalDetail = activeApprovalDetail();
      const approval = approvalById(approvalDetail?.approvalId);
      const viewerContext = approvalViewerContext(approval, approvalDetail?.viewerId);
      if (!viewerContext.canDecide) { toast("仅当前节点审批人可执行审批", "warning"); return; }
      const progress = approveCurrentApprovalTask(approval, { note: approvalDetail.approvalNote, viewerId: viewerContext.viewer.viewerId });
      if (!progress.ok) { toast(progress.message, "warning"); return; }
      if (!progress.complete) {
        approvalDetail.approvalNote = "";
        approvalDetail.rejectionReason = "";
        state.errors = {};
        renderShell();
        toast(`第 ${progress.task.sequence} 级审批已激活`);
        return;
      }
      const result = finishApprovalExecution(approval);
      if (result.outcome === "stale") {
        renderShell();
        toast(`审批已失效：${approval.executionMessage}；须重新发起审批`, "warning");
        return;
      }
      if (result.outcome === "execution-failed") {
        renderShell();
        toast(`审批已通过，但执行失败：${approval.executionMessage}；须重新发起审批`, "warning");
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
    if (["retry-approved-execution", "confirm-admin-retry-execution", "terminate-approved-execution"].includes(action)) {
      toast("旧审批实例只读保留，请重新发起审批", "warning");
      return;
    }
    if (action === "simulate-approval-reject") {
      db = loadData();
      const approvalDetail = activeApprovalDetail();
      const approval = approvalById(approvalDetail?.approvalId);
      const viewerContext = approvalViewerContext(approval, approvalDetail?.viewerId);
      if (!viewerContext.canDecide) { toast("仅当前节点审批人可驳回申请", "warning"); return; }
      const reason = String(approvalDetail.rejectionReason || "").trim();
      if (!reason) {
        state.errors.rejectionReason = "驳回原因必填";
        renderShell();
        return;
      }
      const result = rejectReleaseApproval(approval, reason, viewerContext.viewer.name);
      if (!result.ok) { renderShell(); toast(result.message || "审批状态已变化，请刷新后重试", "warning"); return; }
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
        versionSelections: Object.fromEntries(state.drawer.associatedFeatures.map(feature => [feature.id, feature.featureVersionId || defaultConfigurableFeatureVersion(sourceFeatureBySnapshot(feature))?.id || ""]))
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
        defaultConfigurableFeatureVersion(feature) && !isRequiredFeature(feature)
      );
      const ids = matches.map(feature => feature.id);
      const allSelected = ids.every(id => state.modal.selectedIds.includes(id));
      state.modal.selectedIds = allSelected ? state.modal.selectedIds.filter(id => !ids.includes(id)) : [...new Set([...state.modal.selectedIds, ...ids])];
      if (!allSelected) matches.forEach(feature => {
        if (!state.modal.versionSelections[feature.id]) state.modal.versionSelections[feature.id] = defaultConfigurableFeatureVersion(feature)?.id || "";
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
      const featureError = featureConfigurationError(completedSnapshots, activeIdentifier().product, { allowTesting: true });
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
    if (action === "open-approval-log") {
      const approval = approvalById(target.dataset.approvalId);
      if (!approval) return;
      const returnDrawer = state.drawer?.type === "versionDetail"
        ? { ...clone(state.drawer), tab: "approvals", restoreScrollTop: app.querySelector(".drawer-body")?.scrollTop || 0 }
        : null;
      openApprovalDetail(approval.id, { returnDrawer });
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
    if (["firmware-page", "differential-task-page", "differential-package-page", "module-page", "operation-page", "approval-page", "approval-policy-page", "user-page"].includes(action)) {
      const key = { "firmware-page": "firmwarePage", "differential-task-page": "differentialTaskPage", "differential-package-page": "differentialPackagePage", "module-page": "modulePage", "operation-page": "operationPage", "approval-page": "approvalPage", "approval-policy-page": "approvalPolicyPage", "user-page": "userPage" }[action];
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
      state.drawer = { type: "userPermissions", userIndex, userDraft: { lines: [...user.lines], note: user.note, role: user.role, status: user.status } };
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
      if (changedRole.name !== "系统管理员") systemAdminOnlyActions.forEach(permission => { state.tempPermissions[`action-${permission}`] = false; });
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
    if (event.target.matches("[data-center-query]")) { state.center.draftQuery = event.target.value; return; }
    if (event.target.matches("[data-center-target]")) { state.center.draftTargetVersion = event.target.value; return; }
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
    const modalFieldHost = state.modal || activeApprovalDetail();
    if (event.target.dataset.modalField && modalFieldHost) {
      const field = event.target.dataset.modalField;
      modalFieldHost[field] = event.target.value;
      if (field === "withdrawalReasonCode" && event.target.value !== "other") modalFieldHost.withdrawalReasonNote = "";
      if (field === "centerReasonCode" && event.target.value !== "other") modalFieldHost.centerReasonNote = "";
      if (["rejectionReason", "withdrawalReason", "withdrawalReasonCode", "withdrawalReasonNote", "centerReason", "centerReasonCode", "centerReasonNote", "adminRetryReason"].includes(field)) {
        delete state.errors[field];
        event.target.closest(".form-field")?.querySelector(".error-text")?.remove();
      }
      if (["withdrawalReasonCode", "centerReasonCode"].includes(field)) {
        delete state.errors[field === "withdrawalReasonCode" ? "withdrawalReason" : "centerReason"];
        renderShell();
        return;
      }
    }
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
    if (event.target.matches("[data-feature-search]") && state.modal?.type === "featurePicker") {
      state.modal.query = event.target.value;
      renderShell();
      const search = app.querySelector("[data-feature-search]");
      if (search) {
        search.focus();
        search.setSelectionRange(search.value.length, search.value.length);
      }
      return;
    }
    if (event.target.matches("[data-user-note]") && state.drawer?.userDraft) state.drawer.userDraft.note = event.target.value;
    if (event.target.matches("[data-policy-name]") && state.drawer?.type === "approvalPolicy") {
      state.drawer.policyDraft.name = event.target.value;
      markApprovalPolicyDirty();
      delete state.errors.policyName;
      event.target.closest(".form-field")?.querySelector(".error-text")?.remove();
      const previewName = app.querySelector("[data-policy-preview-name]");
      if (previewName) previewName.textContent = event.target.value.trim() || "未命名审批方案";
    }
    if (event.target.matches("[data-policy-description]") && state.drawer?.type === "approvalPolicy") {
      state.drawer.policyDraft.description = event.target.value;
      markApprovalPolicyDirty();
      delete state.errors.policyDescription;
      const counter = event.target.closest(".form-field")?.querySelector(".helper.align-right");
      if (counter) counter.textContent = `${event.target.value.length} / 200`;
    }
    if (event.target.matches("[data-policy-change-reason]") && state.drawer?.type === "approvalPolicy") {
      state.drawer.policyDraft.changeReason = event.target.value;
      markApprovalPolicyDirty();
      delete state.errors.policyChangeReason;
      event.target.closest(".form-field")?.querySelector(".error-text")?.remove();
      const counter = event.target.closest(".form-field")?.querySelector(".helper.align-right");
      if (counter) counter.textContent = `${event.target.value.length} / 120`;
    }
    if (event.target.dataset.policyNodeUserSearch !== undefined && state.drawer?.type === "approvalPolicy") {
      const picker = event.target.closest(".policy-user-picker");
      const query = event.target.value.trim().toLowerCase();
      let visibleCount = 0;
      picker?.querySelectorAll("[data-policy-user-search-value]").forEach(option => {
        const visible = !query || option.dataset.policyUserSearchValue.includes(query);
        option.hidden = !visible;
        if (visible) visibleCount += 1;
      });
      const empty = picker?.querySelector("[data-policy-user-empty]");
      if (empty) empty.classList.toggle("hidden", visibleCount > 0);
      return;
    }
    if (event.target.matches("[data-policy-copy-search]") && state.drawer?.type === "approvalPolicy") {
      state.drawer.copyUserSearch = event.target.value;
      renderShell();
      const copySearch = app.querySelector("[data-policy-copy-search]");
      if (copySearch) {
        copySearch.focus({ preventScroll: true });
        copySearch.setSelectionRange(copySearch.value.length, copySearch.value.length);
      }
      return;
    }
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
    if (event.target.matches("[data-center-auto-next]")) { state.center.autoNext = event.target.checked; return; }
    if (["withdrawalReasonCode", "centerReasonCode"].includes(event.target.dataset.modalField)) {
      const host = state.modal || activeApprovalDetail();
      if (host) host[event.target.dataset.modalField] = event.target.value;
      delete state.errors[event.target.dataset.modalField === "withdrawalReasonCode" ? "withdrawalReason" : "centerReason"];
      renderShell();
      return;
    }
    if (event.target.dataset.centerFilter) {
      state.center.filters[event.target.dataset.centerFilter] = event.target.type === "checkbox" ? event.target.checked : event.target.value;
      state.center.selectedId = null; centerEnsureDefaultSelection(); renderShell(); return;
    }
    if (event.target.dataset.centerControl) {
      state.center[event.target.dataset.centerControl] = event.target.value;
      if (event.target.dataset.centerControl === "viewerId") { state.center.selectedId = null; state.center.exceptionScope = "todo"; centerEnsureDefaultSelection(); }
      renderShell(); return;
    }
    const target = event.target;
    if (target.dataset.change === "approval-top-product-line") {
      state.selectedPolicyProductLine = target.value;
      state.selectedPolicyOperation = "";
      state.approvalPolicyPage = 1;
      renderShell();
      return;
    }
    if (target.matches("[data-feature-category]") && state.modal?.type === "featurePicker") {
      state.modal.featureCategory = target.value;
      state.modal.versionOpen = null;
      state.modal.infoOpen = null;
      renderShell();
      return;
    }
    if (target.dataset.change === "policy-product-line") {
      if (state.drawer?.type === "approvalPolicy") {
        state.drawer.policyDraft.productLine = target.value;
        state.drawer.policyDraft.copyUserIds = [];
        state.drawer.policyDraft.nodes = [{ sequence: 1, type: "generic", approverUserId: "", approverName: "" }];
        state.drawer.dirty = true;
        state.errors = {};
      } else {
        state.selectedPolicyProductLine = target.value;
        state.approvalPolicyPage = 1;
      }
      renderShell();
      return;
    }
    if (target.dataset.policyOperation && state.drawer?.type === "approvalPolicy") {
      const operation = target.dataset.policyOperation;
      const selected = new Set(state.drawer.policyDraft.operations);
      if (target.checked) selected.add(operation);
      else selected.delete(operation);
      state.drawer.policyDraft.operations = approvalOperationCatalog.filter(item => selected.has(item.value)).map(item => item.value);
      normalizeApprovalPolicyDraftNodes(state.drawer.policyDraft);
      if (!state.drawer.policyDraft.operations.includes(state.drawer.previewOperation)) {
        state.drawer.previewOperation = state.drawer.policyDraft.operations[0] || "";
      }
      markApprovalPolicyDirty();
      delete state.errors.policyOperations;
      renderShell();
      return;
    }
    if (target.dataset.policyCopyUser && state.drawer?.type === "approvalPolicy") {
      const selected = new Set(state.drawer.policyDraft.copyUserIds || []);
      if (target.checked) selected.add(target.dataset.policyCopyUser);
      else selected.delete(target.dataset.policyCopyUser);
      state.drawer.policyDraft.copyUserIds = [...selected];
      markApprovalPolicyDirty();
      renderShell();
      app.querySelector("[data-policy-copy-search]")?.focus({ preventScroll: true });
      return;
    }
    if (target.dataset.policyNodeUser !== undefined && state.drawer?.type === "approvalPolicy") {
      const index = Number(target.dataset.policyNodeUser);
      const user = db.users.find(item => item.userId === target.value);
      state.drawer.policyDraft.nodes[index].approverUserId = target.value;
      state.drawer.policyDraft.nodes[index].approverName = user?.name || "";
      markApprovalPolicyDirty();
      clearApprovalPolicyNodeErrors();
      renderShell();
      return;
    }
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
    const modalFieldHost = state.modal || activeApprovalDetail();
    if (target.dataset.modalField && modalFieldHost) {
      modalFieldHost[target.dataset.modalField] = target.type === "checkbox" ? target.checked : target.value;
      if (target.dataset.modalField === "reminderPolicy") delete state.errors.reminderPolicy;
      if (target.dataset.modalField === "targetVersion" && state.modal?.type === "addDifferentialTask") {
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
      const pageKey = { firmware: "firmwarePage", differentialTasks: "differentialTaskPage", differentialPackages: "differentialPackagePage", modules: "modulePage", operations: "operationPage", approvals: "approvalPage", approvalPolicies: "approvalPolicyPage", users: "userPage" }[key];
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
        state.modal.versionSelections[id] = defaultConfigurableFeatureVersion(source)?.id || "";
      }
      delete state.errors.featurePicker;
      renderShell();
      return;
    }
    if (target.dataset.userLine && state.drawer?.userDraft) {
      const line = target.dataset.userLine;
      state.drawer.userDraft.lines = target.checked ? [...state.drawer.userDraft.lines, line] : state.drawer.userDraft.lines.filter(item => item !== line);
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
    if (target.dataset.change === "user-status" && state.drawer?.userDraft) {
      state.drawer.userDraft.status = target.value;
      return;
    }
    if (target.dataset.change === "permission-role" && state.drawer?.userDraft) {
      state.drawer.userDraft.role = target.value;
      renderShell();
      return;
    }
    if (target.id === "center-reapply-test-report" && state.modal?.type === "centerReapplyDraft") {
      const files = [...(target.files || [])].map(materialFileSnapshot);
      const issue = materialValidation(files, releaseMaterialRules.testReport);
      if (issue) state.errors.newTestReport = issue;
      else { state.modal.testReportFiles = files; delete state.errors.newTestReport; }
      renderShell(); return;
    }
    if (target.id === "test-report-file" && state.modal?.type === "publish") {
      const selected = [...(target.files || [])].map(materialFileSnapshot);
      const nextFiles = [...(state.modal.testReportFiles || []), ...selected];
      const error = materialValidation(nextFiles, releaseMaterialRules.testReport);
      if (error) {
        state.errors.testReport = error;
      } else {
        state.modal.testReportFiles = nextFiles;
        delete state.errors.testReport;
      }
      renderShell();
      return;
    }
    if (target.id === "meeting-minutes-file" && activeApprovalDetail()) {
      const approvalDetail = activeApprovalDetail();
      const approval = approvalById(approvalDetail.approvalId);
      const viewerContext = approvalViewerContext(approval, approvalDetail.viewerId);
      const task = viewerContext.activeTask;
      if (!viewerContext.canUploadMinutes) {
        toast("仅正式发布的当前第 1 级审批人可上传会议纪要", "warning");
        return;
      }
      const selected = [...(target.files || [])].map(materialFileSnapshot);
      const nextFiles = [...(approval.meetingMinutesFiles || []), ...selected];
      const error = materialValidation(nextFiles, releaseMaterialRules.meetingMinutes);
      if (error) {
        state.errors.meetingMinutes = error;
      } else {
        approval.meetingMinutesFiles = nextFiles;
        approvalDetail.meetingMinutesFiles = nextFiles;
        delete state.errors.meetingMinutes;
        addOperation("固件申请", "上传会议纪要", approval.version, task.approverNameSnapshot || "第 1 级审批人", "成功", `${nextFiles.length} 个附件，审批单 ${approval.instanceNo}`);
        persist();
      }
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
      const key = { "firmware-page": "firmwarePage", "differential-task-page": "differentialTaskPage", "differential-package-page": "differentialPackagePage", "module-page": "modulePage", "operation-page": "operationPage", "approval-page": "approvalPage", "approval-policy-page": "approvalPolicyPage", "user-page": "userPage" }[event.target.dataset.pageAction];
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
      let appNotesRevisionCreated = false;
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
      const featureError = featureConfigurationError(state.drawer.associatedFeatures, identifier.product, { allowTesting: true });
      if (featureError) state.errors.associatedFeatures = featureError;
      if (Object.keys(state.errors).length) {
        const firstLocaleError = Object.keys(state.errors).find(key => key.startsWith("locale-"));
        if (firstLocaleError) {
          state.drawer.activeLocale = firstLocaleError.slice("locale-".length);
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
        const changedNoteLocales = changedAppNoteLocales(before.appReleaseNotes, appReleaseNotes);
        const previousEnabledLocales = enabledAppNoteLocales(normalizeAppNoteMeta(before.appNoteMeta, before.appReleaseNotes));
        const nextEnabledLocales = enabledAppNoteLocales(appNoteMeta);
        const enabledLocalesChanged = !sameValues(previousEnabledLocales, nextEnabledLocales);
        const appNotesChanged = changedNoteLocales.length > 0 || enabledLocalesChanged;
        oldVersion.models = models;
        oldVersion.note = platformReleaseNotes;
        oldVersion.platformReleaseNotes = platformReleaseNotes;
        oldVersion.appReleaseNotes = clone(appReleaseNotes);
        oldVersion.appNoteMeta = clone(appNoteMeta);
        oldVersion.appNoteMeta.sourceText = appReleaseNotes.zh;
        oldVersion.featureConfigs = featureConfigs;
        oldVersion.associatedFeatures = clone(state.drawer.associatedFeatures || []);
        oldVersion.features = oldVersion.associatedFeatures.length;
        const revisionTime = now();
        oldVersion.updated = revisionTime;
        oldVersion.associatedDeviceCount = associatedDeviceCount(identifier, models);
        oldVersion.recordVersion = Number(oldVersion.recordVersion || 1) + 1;
        if (!Array.isArray(oldVersion.editRevisions)) oldVersion.editRevisions = [];
        oldVersion.editRevisions.unshift({ time: revisionTime, operator: "汤彦珊", recordVersion: oldVersion.recordVersion, before });
        if (appNotesChanged) {
          appNotesRevisionCreated = true;
          if (!Array.isArray(oldVersion.noteRevisions)) oldVersion.noteRevisions = [];
          const changedCopy = changedNoteLocales.map(localeName).join("、");
          const reason = changedCopy
            ? `通过固件版本编辑同步更新${changedCopy}文案${enabledLocalesChanged ? "及适配语言范围" : ""}`
            : "通过固件版本编辑调整文案适配语言范围";
          oldVersion.noteRevisions.unshift({
            time: revisionTime,
            operator: "汤彦珊",
            reason,
            before: { appReleaseNotes: clone(before.appReleaseNotes), appNoteMeta: clone(before.appNoteMeta) },
            after: { appReleaseNotes: clone(appReleaseNotes), appNoteMeta: clone(appNoteMeta) },
            recordVersion: oldVersion.recordVersion
          });
        }
        const featureChange = featureAssociationChangeSummary(before.associatedFeatures, oldVersion.associatedFeatures);
        addOperation("固件版本", "编辑", versionName, "汤彦珊", "成功", `编辑${versionStatusLabel(oldVersion.status)}元数据，生成修订记录 R${oldVersion.recordVersion}；功能项：${featureChange}${appNotesChanged ? "；APP 更新说明已同步生成文案修订记录" : ""}`);
      } else {
        identifier.versions.unshift({ version: versionName, url: `http://doraemon.camera666.com/${state.upload.name}`, size: state.upload.size, md5: state.upload.md5, models, associatedDeviceCount: associatedDeviceCount(identifier, models), features: (state.drawer.associatedFeatures || []).length, featureConfigs, associatedFeatures: clone(state.drawer.associatedFeatures || []), featureConfigOrigin: state.drawer.inheritedFromVersion ? "baseline-inherited" : "product-default", featureConfigSourceVersion: state.drawer.inheritedFromVersion || null, creator: "汤彦珊", note: platformReleaseNotes, platformReleaseNotes, appReleaseNotes: clone(appReleaseNotes), appNoteMeta: clone(appNoteMeta), noteRevisions: [], created: now(), updated: now(), latest: false, status: "unpublished", reminder: "不提醒", recordVersion: 1 });
        addOperation("固件版本", "新增", versionName, "汤彦珊", "成功", `功能项配置 ${(state.drawer.associatedFeatures || []).length} 项${state.drawer.inheritedFromVersion ? `，继承自 ${state.drawer.inheritedFromVersion}` : "，来源为产品线默认必配功能"}`);
      }
      identifier.aiTranslationLocales = enabledAppNoteLocales(appNoteMeta).filter(locale => locale !== "zh");
      persist();
      closeOverlay();
      toast(editing ? `固件版本已更新${appNotesRevisionCreated ? "，文案修订记录已同步生成" : ""}` : `固件版本 ${versionName} 已新增`);
      return;
    }

    if (form.id === "user-permissions-form") {
      const user = db.users[state.drawer.userIndex];
      const draft = state.drawer.userDraft;
      const lines = draft.lines;
      if (!lines.length) { toast("请至少选择一条所属产线", "warning"); return; }
      const blockedApprovals = db.approvals.filter(approval => approval.approvalStatus === "审批中" && approval.tasks?.some(task => taskPeople(task).some(person => person.userId === user.userId) && ["审批中", "未激活"].includes(task.status)) && (draft.status !== "active" || !draft.lines.includes(approval.productLine)));
      if (blockedApprovals.length) { toast(`该用户仍承担在途审批 ${blockedApprovals[0].version}，在途审批人不可替换，请先完成或结束审批`, "warning"); return; }
      const affectedPolicies = db.approvalPolicies.filter(policy => policy.nodes.some(node => nodeApproverIds(node).includes(user.userId)) && (!draft.lines.includes(policy.productLine) || draft.status !== "active"));
      if (affectedPolicies.length) { toast(`该用户仍被审批方案“${affectedPolicies[0].name}”使用，请先调整审批方案`, "warning"); return; }
      const note = String(draft.note || "").trim();
      const changes = [];
      if (!sameValues(user.lines, lines)) changes.push(`所属产线：${user.lines.join(" / ") || "无"} → ${lines.join(" / ")}`);
      if (user.status !== draft.status) changes.push(`账号状态：${user.status === "active" ? "启用" : "停用"} → ${draft.status === "active" ? "启用" : "停用"}`);
      if (user.role !== draft.role) changes.push(`关联角色：${user.role} → ${draft.role}`);
      if ((user.note || "") !== note) changes.push(`备注：${user.note || "无"} → ${note || "无"}`);
      user.lines = [...lines];
      user.status = draft.status;
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
    const nextRoute = routeFromHash();
    if (state.drawer?.dirty && nextRoute !== state.route) {
      history.replaceState(null, "", `#/${state.route}`);
      requestCloseOverlay(nextRoute);
      return;
    }
    state.route = nextRoute;
    state.modal = null;
    state.drawer = null;
    openApprovalDeepLink();
    renderShell();
  });

  window.addEventListener("beforeunload", event => {
    if (!state.drawer?.dirty) return;
    event.preventDefault();
    event.returnValue = "";
  });

  window.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    if (state.drawer?.type === "approvalPolicy" && Number.isInteger(state.drawer.nodeUserPickerOpen)) {
      state.drawer.nodeUserPickerOpen = null;
      renderShell();
      return;
    }
    if (state.drawer?.type === "approvalPolicy" && state.drawer.copyUserPickerOpen) {
      state.drawer.copyUserPickerOpen = false;
      state.drawer.copyUserSearch = "";
      state.drawer.copyUserTab = "all";
      renderShell();
      return;
    }
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

  window.addEventListener("storage", event => {
    if (event.key !== STORAGE_KEY) return;
    db = loadData();
    if (!state.modal && !state.drawer) renderShell();
  });
  window.addEventListener("keydown", event => {
    if (event.key === "Enter" && event.target.matches("[data-center-query], [data-center-target]")) {
      state.center.filters.query = state.center.draftQuery ?? state.center.filters.query;
      state.center.filters.targetVersion = state.center.draftTargetVersion ?? state.center.filters.targetVersion;
      state.center.selectedId = null;
      renderShell();
    }
  });
  openApprovalDeepLink();
  renderShell();
})();
