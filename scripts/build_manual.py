from pathlib import Path
import re
from shutil import copyfile
from PIL import Image, ImageDraw, ImageFont

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, PageBreak,
    Table, TableStyle, Image as RLImage, KeepTogether, HRFlowable, Preformatted,
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT = Path(__file__).resolve().parents[1]
DOC = ROOT / "产品文档" / "固件管理_本期迭代用户操作手册.md"
SCREEN_DIR = ROOT / "output" / "screenshots"
PDF_DIR = ROOT / "output" / "pdf"
PDF_PATH = PDF_DIR / "固件管理_本期迭代用户操作手册.pdf"
LEGACY_DIR = Path("/tmp/pdfs/firmware-old")

SCREEN_DIR.mkdir(parents=True, exist_ok=True)
PDF_DIR.mkdir(parents=True, exist_ok=True)

FONT_PATH = "/System/Library/Fonts/STHeiti Medium.ttc"
FONT_LIGHT = "/System/Library/Fonts/STHeiti Light.ttc"
pdfmetrics.registerFont(TTFont("Heiti", FONT_PATH))
pdfmetrics.registerFont(TTFont("HeitiLight", FONT_LIGHT))

def f(size=22, bold=False):
    return ImageFont.truetype(FONT_PATH if bold else FONT_LIGHT, size=size)

def rounded(draw, xy, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)

def text(draw, xy, value, size=20, fill="#1f2937", bold=False, anchor=None):
    draw.text(xy, value, font=f(size, bold), fill=fill, anchor=anchor)

def line(draw, xy, fill="#e5e7eb", width=1):
    draw.line(xy, fill=fill, width=width)

def badge(draw, x, y, label, bg="#e8f3ff", fg="#1677ff"):
    w = max(58, len(label) * 18 + 24)
    rounded(draw, (x, y, x + w, y + 34), 17, bg)
    text(draw, (x + w / 2, y + 17), label, 16, fg, anchor="mm")
    return w

def frame(title, subtitle="当前原型示例"):
    im = Image.new("RGB", (1600, 980), "#f5f7fb")
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, 1600, 72), fill="#ffffff")
    d.rectangle((0, 0, 252, 980), fill="#111827")
    text(d, (34, 25), "运维系统", 22, "#ffffff", True)
    text(d, (278, 20), title, 28, "#111827", True)
    text(d, (278, 52), subtitle, 16, "#6b7280")
    nav = ["设备固件", "  固件列表", "  模组型号", "日志管理", "  操作日志", "  审批日志", "系统管理", "  用户列表", "  角色权限"]
    y = 116
    for item in nav:
        if item.startswith("  "):
            text(d, (34, y), item, 18, "#cbd5e1")
        else:
            text(d, (24, y), item, 18, "#94a3b8", True)
        y += 46
    return im, d

def save_mockups():
    # 01 list
    im, d = frame("固件列表")
    rounded(d, (282, 104, 1542, 186), 10, "#ffffff")
    text(d, (312, 128), "固件标识或版本号", 18, "#9ca3af")
    rounded(d, (770, 120, 1010, 168), 6, "#f8fafc", "#dbe3ef")
    text(d, (792, 132), "所属产品线：IPC", 18)
    rounded(d, (1375, 120, 1508, 168), 6, "#1677ff")
    text(d, (1442, 144), "新增标识", 18, "#ffffff", True, anchor="mm")
    rounded(d, (282, 210, 620, 926), 10, "#ffffff")
    text(d, (310, 238), "固件管理", 20, "#111827", True)
    labels = ["23.110.211", "23.100.111", "23.210.211", "23.120.211", "23.322.219", "23.220.211"]
    y = 290
    for idx, label in enumerate(labels):
        if idx == 0: rounded(d, (300, y - 12, 600, y + 44), 8, "#eaf3ff")
        text(d, (322, y), label, 18, "#1677ff" if idx == 0 else "#334155", idx == 0)
        y += 76
    rounded(d, (650, 210, 1542, 926), 10, "#ffffff")
    text(d, (680, 238), "23.110.211", 25, "#111827", True)
    badge(d, 1350, 228, "已配置")
    line(d, (680, 286, 1510, 286))
    for i, (k, v) in enumerate([("所属产品线", "IPC"), ("创建时间", "2025-11-28 00:37:53"), ("关联机型", "QD20-DK"), ("绑定设备数", "528 台")]):
        x = 680 + (i % 2) * 400; yy = 318 + (i // 2) * 54
        text(d, (x, yy), k, 16, "#94a3b8"); text(d, (x + 120, yy), v, 18, "#334155", True)
    text(d, (680, 462), "当前发布版本", 20, "#111827", True)
    rounded(d, (680, 502, 1510, 620), 8, "#f8fbff", "#dbeafe")
    text(d, (710, 530), "V", 26, "#1677ff", True); text(d, (752, 532), "23.110.211.13", 22, "#111827", True)
    badge(d, 1120, 524, "正式发布", "#e9f8ef", "#1b8f4d")
    text(d, (710, 572), "生效时间  2026-07-14 18:41:21", 16, "#64748b")
    text(d, (680, 676), "固件版本列表", 20, "#111827", True)
    rounded(d, (680, 714, 1510, 884), 8, "#ffffff", "#e5e7eb")
    for x, label in [(710,"固件版本号"),(940,"适用机型"),(1130,"功能项数"),(1270,"更新时间"),(1430,"操作")]:
        text(d, (x, 738), label, 15, "#94a3b8")
    line(d, (700, 770, 1490, 770))
    rows=[("23.110.211.13","QD20-DK","4","2026-07-13","详情"),("23.110.211.99","QD20","4","2026-09-08","详情 发布")]
    y=795
    for row in rows:
        for x, val in zip([710,940,1130,1270,1430],row): text(d,(x,y),val,16,"#334155")
        y += 40
    im.save(SCREEN_DIR / "01_firmware_list.png")

    # 02 identifier
    im, d = frame("新增固件标识")
    rounded(d, (520, 118, 1390, 890), 14, "#ffffff", "#dbe3ef")
    text(d, (570, 158), "新增固件标识", 28, "#111827", True)
    text(d, (570, 194), "创建后关联机型不可修改", 16, "#64748b")
    fields=[("固件标识", "23.110.211"),("所属产品线", "IPC"),("关联机型", "QD20-DK"),("网络类型", "仅4G"),("电量类型", "常电"),("架构类型", "新架构")]
    y=250
    for k,v in fields:
        text(d,(570,y),k,17,"#475569"); rounded(d,(780,y-10,1300,y+36),6,"#f8fafc","#dbe3ef"); text(d,(804,y+2),v,17,"#334155"); y+=76
    rounded(d,(570,730,1300,806),8,"#fff7ed","#fed7aa")
    text(d,(598,751),"提示：固件标识必须唯一；已存在发布事实或有效审批时不可删除。",16,"#9a5b13")
    rounded(d,(1080,830,1300,878),6,"#1677ff"); text(d,(1190,854),"确认",18,"#ffffff",True,anchor="mm")
    rounded(d,(960,830,1060,878),6,"#ffffff","#dbe3ef"); text(d,(1010,854),"取消",18,"#475569",anchor="mm")
    im.save(SCREEN_DIR / "02_new_identifier.png")

    # 03 version drawer
    im, d = frame("新增固件版本")
    rounded(d, (860, 92, 1545, 948), 0, "#ffffff", "#dbe3ef")
    text(d, (900, 130), "新增固件版本", 27, "#111827", True)
    text(d, (900, 165), "所属固件标识 23.110.211", 16, "#64748b")
    y=220
    for k,v in [("固件包", "firmware_VP_OTA_23.110.211.99.binpkg"),("版本号", "23.110.211.99（自动解析）"),("MD5", "7b6a...e91f"),("适用机型", "QD20"),("平台发布说明", "弱网稳定性优化与升级链路修复")]:
        text(d,(900,y),k,17,"#475569"); rounded(d,(1080,y-10,1490,y+40),6,"#f8fafc","#dbe3ef"); text(d,(1100,y+4),v,16,"#334155"); y+=84
    rounded(d,(900,660,1490,732),8,"#eef7ff"); text(d,(930,682),"下一步",17,"#1677ff",True); text(d,(930,710),"配置功能项和 APP 更新说明后再创建版本。",15,"#64748b")
    rounded(d,(1320,858,1490,908),6,"#1677ff"); text(d,(1405,883),"创建版本",17,"#ffffff",True,anchor="mm")
    im.save(SCREEN_DIR / "03_new_version_drawer.png")

    # 04 feature items
    im, d = frame("功能项配置")
    rounded(d,(360,120,1480,890),12,"#ffffff","#dbe3ef")
    text(d,(400,158),"配置功能项",28,"#111827",True)
    text(d,(400,194),"产品线：IPC  ·  必配功能不可移除",16,"#64748b")
    badge(d, 400, 230, "固件必配", "#fff3e8", "#d46b08")
    line(d,(400,282,1440,282))
    req=[("移动侦测","V3","已发布"),("夜视模式","V2","已发布"),("双向语音对讲","V2","已发布")]
    y=320
    for name,ver,status in req:
        text(d,(420,y),name,18,"#334155",True); text(d,(840,y),ver,17,"#334155"); badge(d,1040,y-10,status,"#e9f8ef","#1b8f4d"); text(d,(1280,y),"必配",16,"#d46b08"); y+=60
    badge(d,400,520,"可选功能", "#eef4ff", "#1677ff")
    y=600
    for name,ver,status in [("低功耗待机","V1","测试中"),("双向语音对讲扩展","V1","已发布")]:
        text(d,(420,y),name,18,"#334155",True); text(d,(840,y),ver,17,"#334155"); badge(d,1040,y-10,status,"#fff7ed" if status=="测试中" else "#e9f8ef", "#d46b08" if status=="测试中" else "#1b8f4d"); y+=60
    rounded(d,(400,784,1440,840),8,"#fff7ed"); text(d,(430,802),"测试中版本仅用于 OTA 验证，不能直接正式发布。",16,"#9a5b13")
    im.save(SCREEN_DIR / "04_feature_items.png")

    # 05 app notes
    im, d = frame("APP 更新说明")
    rounded(d,(360,110,1480,920),12,"#ffffff","#dbe3ef")
    text(d,(400,150),"APP 更新说明",28,"#111827",True)
    text(d,(400,188),"简体中文、英文必填；其他语言可选，未配置时使用英文兜底",16,"#64748b")
    langs=[("简体中文","confirmed"),("英文","confirmed"),("繁体中文","confirmed"),("日语","需更新"),("德语","未配置")]
    y=240
    for idx,(lang,status) in enumerate(langs):
        if idx==0: rounded(d,(400,y-10,630,y+52),8,"#eaf3ff")
        text(d,(425,y+10),lang,17,"#1677ff" if idx==0 else "#334155",idx==0)
        x=720; bg="#e9f8ef" if status=="confirmed" else ("#fff7ed" if status=="需更新" else "#f1f5f9"); fg="#1b8f4d" if status=="confirmed" else ("#d46b08" if status=="需更新" else "#64748b"); badge(d,x,y,status,bg,fg)
        rounded(d,(400,y+78,1420,y+150),6,"#f8fafc","#e5e7eb"); text(d,(425,y+100),"提升弱网环境下的连接稳定性，优化升级链路。" if lang!="英文" else "Improve connection stability on weak networks.",17,"#334155")
        y+=140
    rounded(d,(400,840,720,888),6,"#1677ff"); text(d,(560,864),"AI 一键翻译",17,"#ffffff",True,anchor="mm")
    rounded(d,(740,840,920,888),6,"#ffffff","#dbe3ef"); text(d,(830,864),"全部确认",17,"#334155",anchor="mm")
    im.save(SCREEN_DIR / "05_app_notes.png")

    # 06 publish approval
    im, d = frame("提交发布审批")
    rounded(d,(420,110,1460,920),14,"#ffffff","#dbe3ef")
    text(d,(470,150),"提交发布审批",28,"#111827",True)
    text(d,(470,188),"目标版本 23.110.211.99  ·  当前版本 23.110.211.13",16,"#64748b")
    line(d,(470,224,1410,224))
    text(d,(470,265),"APP 提醒方式",17,"#475569");
    for i,(label,bg,fg) in enumerate([("不提醒","#eaf3ff","#1677ff"),("弱提醒","#f8fafc","#64748b"),("强提醒","#f8fafc","#64748b"),("强制提醒","#f8fafc","#64748b")]):
        x=690+i*160; rounded(d,(x,245,x+135,290),6,bg,"#dbe3ef"); text(d,(x+67,267),label,16,fg,True if i==0 else False,anchor="mm")
    sections=[("功能项快照","4 项 · 必配 3 项 · 测试中 0 项"),("APP 文案快照","15 语言 · 中文/英文已确认"),("影响设备数","528 台")]
    y=340
    for k,v in sections:
        rounded(d,(470,y,1410,y+78),8,"#f8fafc","#e5e7eb"); text(d,(500,y+20),k,16,"#64748b"); text(d,(500,y+48),v,18,"#334155",True); y+=100
    rounded(d,(470,700,1410,782),8,"#eef7ff"); text(d,(500,722),"审批说明",16,"#1677ff",True); text(d,(500,751),"提交后目标版本、功能项、APP 文案和提醒方式将锁定；发布审批人不支持在途替换。",15,"#334155")
    rounded(d,(1220,840,1410,890),6,"#1677ff"); text(d,(1315,865),"提交审批",17,"#ffffff",True,anchor="mm")
    im.save(SCREEN_DIR / "06_publish_approval.png")

    # 07 version detail/logs
    im, d = frame("版本详情")
    rounded(d,(370,100,1500,930),12,"#ffffff","#dbe3ef")
    text(d,(410,140),"23.110.211.13",27,"#111827",True); badge(d,1240,124,"当前发布","#e9f8ef","#1b8f4d")
    tabs=["功能项配置","APP 更新说明","发布记录","审批日志"]
    x=410
    for i,t in enumerate(tabs):
        if i==0: rounded(d,(x,190,x+160,236),6,"#eaf3ff")
        text(d,(x+80,213),t,16,"#1677ff" if i==0 else "#64748b",i==0,anchor="mm"); x+=190
    line(d,(410,260,1460,260))
    text(d,(410,300),"审批日志",20,"#111827",True)
    logs=[("提交发布审批","张元/Alice","审批中","2026-09-08 11:08"),("一级审批","王测试","通过","2026-09-08 13:10"),("二级审批","李主管","待处理","-"),("发布执行","系统","待执行","-")]
    y=350
    for action,who,status,tm in logs:
        line(d,(430,y+32,1430,y+32)); text(d,(430,y),action,17,"#334155",True); text(d,(760,y),who,16,"#64748b"); badge(d,980,y-8,status,"#fff7ed" if status in ["审批中","待处理"] else "#e9f8ef","#d46b08" if status in ["审批中","待处理"] else "#1b8f4d"); text(d,(1210,y),tm,15,"#64748b"); y+=68
    rounded(d,(410,690,1430,820),8,"#f8fafc","#e5e7eb"); text(d,(440,716),"当前可执行操作",16,"#64748b"); text(d,(440,758),"撤销并回滚   下架   维护文案",18,"#1677ff",True)
    im.save(SCREEN_DIR / "07_version_detail_logs.png")

    # 08 differential
    im, d = frame("4G 在线差分")
    rounded(d,(300,110,1510,910),12,"#ffffff","#dbe3ef")
    text(d,(340,148),"4G 在线差分",28,"#111827",True); badge(d,1270,130,"4G 模组","#eef4ff","#1677ff")
    rounded(d,(340,205,1460,280),8,"#f8fafc","#e5e7eb"); text(d,(370,232),"差分任务名称",16,"#64748b"); text(d,(600,232),"4G_25.922.219_to_25.922.219.8",17,"#334155"); rounded(d,(1270,220,1430,264),6,"#1677ff"); text(d,(1350,242),"新建任务",16,"#ffffff",True,anchor="mm")
    text(d,(340,332),"差分任务",20,"#111827",True)
    cols=[("任务名称",340),("目标版本",720),("源版本数",940),("状态",1110),("完成时间",1250)]
    for k,x in cols: text(d,(x,372),k,15,"#94a3b8")
    rows=[("4G_25.922.219_to_8","25.922.219.8","3","已完成","2026-09-08"),("4G_25.922.219_to_7","25.922.219.7","2","已完成","2026-09-06"),("4G_25.922.219_to_6","25.922.219.6","1","失败","2026-09-05")]
    y=420
    for row in rows:
        line(d,(340,y+30,1430,y+30))
        for (val,x) in zip(row,[340,720,940,1110,1250]): text(d,(x,y),val,16,"#b42318" if val=="失败" else "#334155")
        y+=62
    rounded(d,(340,680,1430,810),8,"#eef7ff"); text(d,(370,708),"操作提示",16,"#1677ff",True); text(d,(370,746),"失败任务不在原任务上重试，需要重新创建差分任务。差分包删除后不能被新任务选择。",15,"#334155")
    im.save(SCREEN_DIR / "08_diff_module.png")

    # 09 users and roles
    im, d = frame("用户列表与角色权限")
    rounded(d,(300,110,1510,480),12,"#ffffff","#dbe3ef")
    text(d,(340,148),"用户列表",26,"#111827",True); rounded(d,(340,195,730,240),6,"#f8fafc","#dbe3ef"); text(d,(360,208),"账号名称或角色",16,"#9ca3af"); rounded(d,(760,195,900,240),6,"#1677ff"); text(d,(830,217),"查询",16,"#ffffff",True,anchor="mm")
    for x,k in [(340,"账号"),(580,"角色"),(800,"所属产品线"),(1080,"状态"),(1240,"操作")]: text(d,(x,292),k,15,"#94a3b8")
    user_rows=[("张元/Alice","产线主管","IPC、4G 模组","启用","详情 权限配置"),("李主管","测试人员","IPC","启用","详情 权限配置")]
    y=332
    for row in user_rows:
        line(d,(340,y+30,1430,y+30));
        for val,x in zip(row,[340,580,800,1080,1240]): text(d,(x,y),val,16,"#334155")
        y+=62
    rounded(d,(300,530,1510,900),12,"#ffffff","#dbe3ef")
    text(d,(340,568),"角色权限",26,"#111827",True)
    text(d,(340,624),"角色",15,"#94a3b8"); text(d,(700,624),"功能权限",15,"#94a3b8"); text(d,(1150,624),"关联用户",15,"#94a3b8")
    roles=[("系统管理员","全部菜单与管理权限","16 人"),("产线主管","发布、回滚、下架、日志","8 人"),("测试人员","版本维护、差分包","5 人")]
    y=670
    for role,perm,num in roles:
        line(d,(340,y+30,1430,y+30)); text(d,(340,y),role,17,"#334155",True); text(d,(700,y),perm,16,"#334155"); text(d,(1150,y),num,16,"#64748b"); y+=62
    im.save(SCREEN_DIR / "09_users_roles.png")

    # Copy selected original screenshots as reference images.
    for src_name, dst_name in [("page-3.png","legacy_page3.png"),("page-5.png","legacy_page5.png"),("page-6.png","legacy_page6.png"),("page-7.png","legacy_page7.png"),("page-8.png","legacy_page8.png"),("page-9.png","legacy_page9.png")]:
        src = LEGACY_DIR / src_name
        if src.exists(): copyfile(src, SCREEN_DIR / dst_name)

def parse_markdown(path):
    lines = path.read_text(encoding="utf-8").splitlines()
    story=[]; i=0; first_title=True
    while i < len(lines):
        line=lines[i]
        if not line.strip(): i+=1; continue
        if line == ">":
            i += 1
            continue
        if line.startswith("!["):
            alt=line.split("](",1)[0][2:]
            rel=line.split("](",1)[1].rstrip(")")
            img_path=(path.parent / rel).resolve()
            if img_path.exists():
                # Keep the screenshot aspect ratio while preventing a tall image from consuming a page.
                iw, ih = Image.open(img_path).size
                max_w, max_h = 165*mm, 92*mm
                scale = min(max_w / iw, max_h / ih)
                story.append(RLImage(str(img_path), width=iw*scale, height=ih*scale))
                story.append(Paragraph(alt, STYLES["Caption"]))
            i+=1; continue
        if line.startswith("# "):
            title=line[2:].strip()
            story.append(Paragraph(title, STYLES["Title"]))
            if first_title:
                story.append(Spacer(1, 3*mm)); story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e1"))); story.append(Spacer(1, 5*mm)); first_title=False
            i+=1; continue
        if line.startswith("## "):
            if story and len(story)>4: story.append(Spacer(1,2*mm))
            story.append(Paragraph(line[3:].strip(), STYLES["H1"]))
            i+=1; continue
        if line.startswith("### "):
            story.append(Paragraph(line[4:].strip(), STYLES["H2"]))
            i+=1; continue
        if line.startswith("> "):
            story.append(Paragraph(line[2:].strip(), STYLES["Note"]))
            i+=1; continue
        if line.startswith("```"):
            code=[]; i+=1
            while i<len(lines) and not lines[i].startswith("```"):
                code.append(lines[i]); i+=1
            i+=1; story.append(Preformatted("\n".join(code), STYLES["Code"]))
            continue
        if line.startswith("| "):
            tbl=[]
            while i<len(lines) and lines[i].startswith("|"):
                row=[c.strip() for c in lines[i].strip().strip("|").split("|")]
                if not all(set(c)<=set("-: ") for c in row): tbl.append(row)
                i+=1
            if tbl:
                data=[]
                for ri,row in enumerate(tbl):
                    data.append([Paragraph(c, STYLES["TableHead" if ri==0 else "Table"]) for c in row])
                widths=[165*mm/len(tbl[0])]*len(tbl[0])
                t=Table(data,colWidths=widths,repeatRows=1,hAlign="LEFT")
                t.setStyle(TableStyle([
                    ("BACKGROUND",(0,0),(-1,0),colors.HexColor("#eef2f7")),
                    ("GRID",(0,0),(-1,-1),0.35,colors.HexColor("#dbe3ef")),
                    ("VALIGN",(0,0),(-1,-1),"TOP"),
                    ("LEFTPADDING",(0,0),(-1,-1),6),("RIGHTPADDING",(0,0),(-1,-1),6),
                    ("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5),
                ]))
                story.append(Spacer(1,2*mm)); story.append(t); story.append(Spacer(1,3*mm))
            continue
        if line.startswith("- ") or line[:2].isdigit() and line[2:4]==". ":
            if line.startswith("- "):
                bullet = "• " + line[2:]
            else:
                bullet = line
            story.append(Paragraph(inline(bullet), STYLES["Bullet"]))
            i+=1; continue
        if line.startswith("图 "):
            story.append(Paragraph(line, STYLES["Caption"])); i+=1; continue
        if line.startswith("---"):
            story.append(Spacer(1,2*mm)); story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e5e7eb"))); i+=1; continue
        story.append(Paragraph(inline(line), STYLES["Body"]))
        i+=1
    return story

def inline(s):
    # Paragraph supports a small HTML subset. Escape only the characters that would break markup.
    s=s.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")
    while "**" in s:
        a=s.find("**"); b=s.find("**",a+2)
        if b<0: break
        s=s[:a]+"<b>"+s[a+2:b]+"</b>"+s[b+2:]
    s=re.sub(r"`([^`]*)`", r"<font name='Heiti'>\1</font>", s)
    return s

class ManualDoc(BaseDocTemplate):
    def __init__(self, filename, **kwargs):
        super().__init__(filename, pagesize=A4, **kwargs)
        frame=Frame(20*mm, 17*mm, 170*mm, 255*mm, id="normal", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        self.addPageTemplates([PageTemplate(id="manual", frames=frame, onPage=draw_page)])

def draw_page(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor("#e2e8f0")); canvas.setLineWidth(0.5)
    canvas.line(20*mm, 286*mm, 190*mm, 286*mm)
    canvas.setFont("HeitiLight", 8); canvas.setFillColor(colors.HexColor("#64748b"))
    canvas.drawString(20*mm, 290*mm, "固件管理 · 本期迭代用户操作手册")
    canvas.drawRightString(190*mm, 10*mm, f"{doc.page}")
    canvas.restoreState()

styles=getSampleStyleSheet()
STYLES={
    "Title": ParagraphStyle("Title", parent=styles["Title"], fontName="Heiti", fontSize=25, leading=32, textColor=colors.HexColor("#0f172a"), alignment=TA_CENTER, spaceAfter=6*mm),
    "H1": ParagraphStyle("H1", parent=styles["Heading1"], fontName="Heiti", fontSize=17, leading=24, textColor=colors.HexColor("#0f3d67"), spaceBefore=5*mm, spaceAfter=3*mm),
    "H2": ParagraphStyle("H2", parent=styles["Heading2"], fontName="Heiti", fontSize=13, leading=19, textColor=colors.HexColor("#1e293b"), spaceBefore=3*mm, spaceAfter=2*mm),
    "Body": ParagraphStyle("Body", parent=styles["BodyText"], fontName="HeitiLight", fontSize=9.3, leading=15, textColor=colors.HexColor("#334155"), spaceAfter=1.6*mm),
    "Bullet": ParagraphStyle("Bullet", parent=styles["BodyText"], fontName="HeitiLight", fontSize=9.1, leading=14, leftIndent=5*mm, firstLineIndent=-3*mm, textColor=colors.HexColor("#334155"), spaceAfter=1*mm),
    "Note": ParagraphStyle("Note", parent=styles["BodyText"], fontName="HeitiLight", fontSize=9.1, leading=14, textColor=colors.HexColor("#7c4a03"), backColor=colors.HexColor("#fff7ed"), borderColor=colors.HexColor("#fed7aa"), borderWidth=0.5, borderPadding=6, spaceBefore=2*mm, spaceAfter=2*mm),
    "Caption": ParagraphStyle("Caption", parent=styles["BodyText"], fontName="HeitiLight", fontSize=8, leading=12, alignment=TA_CENTER, textColor=colors.HexColor("#64748b"), spaceAfter=3*mm),
    "Table": ParagraphStyle("Table", parent=styles["BodyText"], fontName="HeitiLight", fontSize=7.8, leading=11, textColor=colors.HexColor("#334155")),
    "TableHead": ParagraphStyle("TableHead", parent=styles["BodyText"], fontName="Heiti", fontSize=7.8, leading=11, textColor=colors.HexColor("#334155")),
    "Code": ParagraphStyle("Code", parent=styles["Code"], fontName="HeitiLight", fontSize=8, leading=12, leftIndent=4*mm, backColor=colors.HexColor("#f8fafc"), borderColor=colors.HexColor("#e2e8f0"), borderWidth=0.5, borderPadding=6, spaceBefore=2*mm, spaceAfter=3*mm),
}

if __name__ == "__main__":
    save_mockups()
    story=parse_markdown(DOC)
    doc=ManualDoc(str(PDF_PATH), leftMargin=20*mm, rightMargin=20*mm, topMargin=20*mm, bottomMargin=17*mm, title="固件管理")
    doc.build(story)
    print(PDF_PATH)
