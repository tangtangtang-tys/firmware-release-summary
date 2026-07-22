# 原型版本 v1.15-ding-entry-current-release-20260717

- 封存时间：2026-07-17
- 版本状态：待视觉复核
- 上一版本：`v1.14-date-grouped-release-log-20260717`
- 版本定位：发布日志只读审计，DING 操作统一至当前发布版本

## 核心变更

1. 发布日志移除“发送 DING”“发送中”和“查看 DING”等操作按钮。
2. 发布日志继续展示每次发布或回滚事件的 DING 状态、通知步骤和失败信息。
3. 当前发布版本的 DING 状态区域成为唯一操作入口：未发送时可发送一次，终态时可查看记录。
4. 发送中不展示操作，避免并发创建或重复触发通知任务。
5. 发布日志未发送说明和发布审批边界文案统一指向当前发布版本。
6. 当前发布版本 DING 状态与操作按钮使用稳定横向布局，避免状态文字与入口挤压。
7. 产品文档明确发布日志是只读审计视图，不承担业务操作。

## 验证结果

- JavaScript 语法检查通过。
- 93 个不同静态操作入口均有处理分支。
- 发布日志模板不再包含 `send-ding`、`view-ding-record` 或操作容器。
- `send-ding` 与 `view-ding-record` 仅由当前发布版本区域渲染。
- Git 差异格式检查通过。
- 根目录与本快照核心文件一致。
- 本次为局部交互收敛，内置浏览器当前停留在本地文件页，视觉结果需刷新页面查看。

## 文件校验

| 文件 | SHA-256 |
| --- | --- |
| `index.html` | `862b2b413823e6e9ecb039f35de2423d74f740de9ec36d85f745da7bb0d07ff7` |
| `app.js` | `ae12866b15f8a6e98b571a45debb26e7c4d0addb1ce3cc8e4937072512e9bc57` |
| `styles.css` | `dcbb065616d3ded8b4d1bfe0e503ea8bf081c12cf5bb590b5abfb9a9a3b7baa7` |
| `产品原型版本记录.md` | `bee7377fcbd727df00cfbc235b60d7736d1b5dd4aa0d31b33466535c789b399a` |
| `assets/app-device-camera.png` | `365cf122ca567d5e226c11d1a80eb587596646a6e66430a7da761e9e8ae3a6be` |
| `产品文档/固件多语言配置_版本回滚与DING通知_产品方案.md` | `9d43281099765d2574b564d94541e51ed346727d9f70141808e6c4174d1caaed` |
| `产品文档/固件版本回滚_业务流程与弹窗设计方案.md` | `de153e6ea07faf69db1df1a597565804ce9b8840296283a28972f9845c4cfdd3` |
| `产品文档/固件多语言发布与版本回滚_业务链路流程图.md` | `102fb1241c92befb94fa5ae4b1b493f496077860ba31d768100728cdeaea84bf` |

## 恢复说明

- 恢复本版本：用本目录中的 `index.html`、`app.js`、`styles.css`、`产品原型版本记录.md`、`assets/` 和 `产品文档/` 覆盖项目根目录同名内容。
- 恢复上一版本：使用 `prototype-versions/v1.14-date-grouped-release-log-20260717/` 中的文件。
