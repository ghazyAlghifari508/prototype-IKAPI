import json
import zipfile
import os

SRC_PATH = r"docs\design\ikapi-marketplace-f06-digital-payment.figcraft"
DST_PATH = r"docs\design\ikapi-marketplace-f06-digital-payment.figcraft"

with zipfile.ZipFile(SRC_PATH, "r") as z:
    doc = json.loads(z.read("document.json").decode("utf-8"))

nodes = doc["nodes"]

HASH_PRIDE = "7e256dbd59e6051857bcc4499a9471ec97436d757d63d550eacbe648057e12a4"
HASH_FRANK = "3c7e1e5aa1805e1e8642ee78cfbf4e76de01af156d00a7415763d4d413fcec94"

def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip("#")
    if len(hex_str) == 6:
        r = int(hex_str[0:2], 16) / 255.0
        g = int(hex_str[2:4], 16) / 255.0
        b = int(hex_str[4:6], 16) / 255.0
        return {"r": r, "g": g, "b": b, "a": 1.0}
    elif len(hex_str) == 8:
        r = int(hex_str[0:2], 16) / 255.0
        g = int(hex_str[2:4], 16) / 255.0
        b = int(hex_str[4:6], 16) / 255.0
        a = int(hex_str[6:8], 16) / 255.0
        return {"r": r, "g": g, "b": b, "a": a}
    return {"r": 0.0, "g": 0.0, "b": 0.0, "a": 1.0}

def solid_fill(hex_str, opacity=1.0):
    return [{
        "type": "solid",
        "color": hex_to_rgb(hex_str),
        "opacity": float(opacity),
        "visible": True,
        "blend": "normal"
    }]

def solid_stroke(hex_str, opacity=1.0):
    return [{
        "type": "solid",
        "color": hex_to_rgb(hex_str),
        "opacity": float(opacity),
        "visible": True,
        "blend": "normal"
    }]

cur_id = 4000
while str(cur_id) in nodes:
    cur_id += 1

def alloc_id():
    global cur_id
    tid = cur_id
    cur_id += 1
    while str(cur_id) in nodes:
        cur_id += 1
    return tid

def clone_subtree(src_id, new_parent_id, tx=None, ty=None):
    src_node = nodes[str(src_id)]
    new_id = alloc_id()
    new_node = json.loads(json.dumps(src_node))
    new_node["id"] = new_id
    new_node["parent"] = new_parent_id
    if tx is not None or ty is not None:
        cur_tr = new_node.get("transform", [1.0, 0.0, 0.0, 1.0, 0.0, 0.0])
        new_node["transform"] = [cur_tr[0], cur_tr[1], cur_tr[2], cur_tr[3],
                                 float(tx) if tx is not None else cur_tr[4],
                                 float(ty) if ty is not None else cur_tr[5]]
    new_children = []
    for cid in src_node.get("children", []):
        new_children.append(clone_subtree(cid, new_id))
    if new_children:
        new_node["children"] = new_children
    nodes[str(new_id)] = new_node
    return new_id

def make_text(parent_id, name, characters, font_size=14, font_style="Regular",
              color="#1C1917", sizing_h="hug", sizing_v="hug", width=100.0, height=20.0,
              align="left", tx=0.0, ty=0.0):
    tid = alloc_id()
    node = {
        "id": tid,
        "name": name,
        "type": "text",
        "characters": characters,
        "style": {
            "font_family": "Inter",
            "font_style": font_style,
            "font_size": float(font_size),
            "line_height": {"unit": "auto"},
            "letter_spacing": {"unit": "percent", "value": 0.0},
            "decoration": "none",
            "case": "original"
        },
        "auto_resize": "widthAndHeight" if sizing_h == "hug" else "height",
        "parent": parent_id,
        "blend": "normal",
        "transform": [1.0, 0.0, 0.0, 1.0, float(tx), float(ty)],
        "width": float(width),
        "height": float(height),
        "fills": solid_fill(color),
        "child_layout": {
            "sizing_h": sizing_h,
            "sizing_v": sizing_v,
            "absolute": False,
            "grid_column_span": 0,
            "grid_row_span": 0
        }
    }
    nodes[str(tid)] = node
    return tid

def make_frame(parent_id, name, width, height, mode="vertical", gap=16.0,
               padding=[0.0, 0.0, 0.0, 0.0], fill_color=None, stroke_color=None,
               corner_radius=0.0, sizing_h="fill", sizing_v="hug",
               main_align="min", cross_align="min", tx=0.0, ty=0.0, clip=True):
    tid = alloc_id()
    node = {
        "id": tid,
        "name": name,
        "type": "frame",
        "parent": parent_id,
        "children": [],
        "transform": [1.0, 0.0, 0.0, 1.0, float(tx), float(ty)],
        "width": float(width),
        "height": float(height),
        "layout": {
            "mode": mode,
            "wrap": False,
            "gap": float(gap),
            "cross_gap": 10.0,
            "padding": [float(p) for p in padding],
            "main_align": main_align,
            "cross_align": cross_align,
            "content_align": "auto",
            "grid_columns": 2,
            "grid_rows": 2,
            "column_tracks": [],
            "row_tracks": [],
            "strokes_included": True,
            "reverse_z": False
        },
        "child_layout": {
            "sizing_h": sizing_h,
            "sizing_v": sizing_v,
            "absolute": False,
            "grid_column_span": 0,
            "grid_row_span": 0
        },
        "clip": clip
    }
    if fill_color:
        node["fills"] = solid_fill(fill_color)
    if stroke_color:
        node["strokes"] = solid_stroke(stroke_color)
        node["stroke_align"] = "inside"
        node["stroke_weight"] = 1.0
    if corner_radius > 0:
        node["corners"] = {
            "radii": [float(corner_radius)] * 4,
            "smoothing": 0.0
        }
    nodes[str(tid)] = node
    return tid

def make_button(parent_id, label, style="primary", width=140.0, height=40.0,
                target_dest=None, tx=0.0, ty=0.0):
    bid = alloc_id()
    if style == "primary":
        fill = "#0075DE"
        txt_color = "#FFFFFF"
        stroke = None
    elif style == "secondary":
        fill = "#FFFFFF"
        txt_color = "#1C1917"
        stroke = "#E7E5E4"
    elif style == "danger":
        fill = "#EF4444"
        txt_color = "#FFFFFF"
        stroke = None
    elif style == "disabled":
        fill = "#E7E5E4"
        txt_color = "#A8A29E"
        stroke = None
    elif style == "success":
        fill = "#16A34A"
        txt_color = "#FFFFFF"
        stroke = None
    else: # ghost
        fill = None
        txt_color = "#0075DE"
        stroke = None

    btn_node = {
        "id": bid,
        "name": f"Btn {label}",
        "type": "frame",
        "parent": parent_id,
        "children": [],
        "transform": [1.0, 0.0, 0.0, 1.0, float(tx), float(ty)],
        "width": float(width),
        "height": float(height),
        "layout": {
            "mode": "horizontal",
            "wrap": False,
            "gap": 8.0,
            "cross_gap": 10.0,
            "padding": [10.0, 16.0, 10.0, 16.0],
            "main_align": "center",
            "cross_align": "center",
            "content_align": "auto",
            "grid_columns": 2,
            "grid_rows": 2,
            "column_tracks": [],
            "row_tracks": [],
            "strokes_included": True,
            "reverse_z": False
        },
        "child_layout": {
            "sizing_h": "fixed" if width > 0 else "hug",
            "sizing_v": "fixed",
            "absolute": False,
            "grid_column_span": 0,
            "grid_row_span": 0
        },
        "corners": {"radii": [4.0, 4.0, 4.0, 4.0], "smoothing": 0.0},
        "clip": True
    }
    if fill:
        btn_node["fills"] = solid_fill(fill)
    if stroke:
        btn_node["strokes"] = solid_stroke(stroke)
        btn_node["stroke_align"] = "inside"
        btn_node["stroke_weight"] = 1.0

    if target_dest:
        btn_node["interactions"] = [{
            "trigger": {"type": "onClick"},
            "actions": [{"type": "navigate", "dest": target_dest}],
            "duration_ms": 300,
            "easing": "easeOut",
            "transition": {"type": "instant"}
        }]

    nodes[str(bid)] = btn_node

    txt_id = make_text(bid, "label", label, font_size=14, font_style="Medium",
                       color=txt_color, sizing_h="hug", sizing_v="hug",
                       width=width - 32, height=18, align="center", tx=16.0, ty=11.0)
    btn_node["children"].append(txt_id)
    return bid

def make_badge(parent_id, text, badge_type="warning", tx=0.0, ty=0.0):
    bg_map = {
        "success": ("#DCFCE7", "#166534"),
        "warning": ("#FEF3C7", "#92400E"),
        "danger": ("#FEE2E2", "#991B1B"),
        "neutral": ("#F3F4F6", "#4B5563")
    }
    bg_col, txt_col = bg_map.get(badge_type, ("#FEF3C7", "#92400E"))
    bid = alloc_id()
    badge_node = {
        "id": bid,
        "name": f"Badge / {text}",
        "type": "frame",
        "parent": parent_id,
        "children": [],
        "transform": [1.0, 0.0, 0.0, 1.0, float(tx), float(ty)],
        "width": 150.0,
        "height": 24.0,
        "fills": solid_fill(bg_col),
        "corners": {"radii": [4.0, 4.0, 4.0, 4.0], "smoothing": 0.0},
        "layout": {
            "mode": "horizontal",
            "wrap": False,
            "gap": 4.0,
            "cross_gap": 10.0,
            "padding": [4.0, 10.0, 4.0, 10.0],
            "main_align": "center",
            "cross_align": "center",
            "content_align": "auto",
            "grid_columns": 2,
            "grid_rows": 2,
            "column_tracks": [],
            "row_tracks": [],
            "strokes_included": True,
            "reverse_z": False
        },
        "child_layout": {
            "sizing_h": "hug",
            "sizing_v": "hug",
            "absolute": False,
            "grid_column_span": 0,
            "grid_row_span": 0
        },
        "clip": True
    }
    nodes[str(bid)] = badge_node
    txt_id = make_text(bid, "text", text, font_size=12, font_style="Medium",
                       color=txt_col, sizing_h="hug", sizing_v="hug",
                       width=130.0, height=16.0, tx=10.0, ty=4.0)
    badge_node["children"].append(txt_id)
    return bid

def make_book_row(parent_id, title, meta, price, image_hash, width=770.0, tx=0.0, ty=0.0):
    fid = make_frame(parent_id, f"Item / {title}", width=width, height=80.0,
                     mode="horizontal", gap=16.0, padding=[10.0, 0.0, 10.0, 0.0],
                     fill_color="#FFFFFF", cross_align="center", tx=tx, ty=ty)

    cid = alloc_id()
    cover_node = {
        "id": cid,
        "name": "cover",
        "type": "rectangle",
        "parent": fid,
        "transform": [1.0, 0.0, 0.0, 1.0, 0.0, 10.0],
        "width": 44.0,
        "height": 60.0,
        "fills": [
            {"type": "solid", "color": {"r": 0.95, "g": 0.95, "b": 0.95, "a": 1.0}, "opacity": 1.0, "visible": True, "blend": "normal"},
            {"type": "image", "image": image_hash, "scale_mode": "fill", "scale": 1.0, "rotation": 0, "crop": None,
             "filters": {"exposure": 0.0, "contrast": 0.0, "saturation": 0.0, "temperature": 0.0, "tint": 0.0, "highlights": 0.0, "shadows": 0.0},
             "opacity": 1.0, "visible": True, "blend": "normal"}
        ],
        "corners": {"radii": [4.0, 4.0, 4.0, 4.0], "smoothing": 0.0}
    }
    nodes[str(cid)] = cover_node
    nodes[str(fid)]["children"].append(cid)

    info_id = make_frame(fid, "info", width=width - 180.0, height=44.0, mode="vertical",
                         gap=4.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#FFFFFF", tx=60.0, ty=18.0)
    t1 = make_text(info_id, "title", title, font_size=14, font_style="Semi Bold", color="#1C1917",
                   sizing_h="fill", width=width - 180.0, height=18.0, tx=0.0, ty=0.0)
    t2 = make_text(info_id, "meta", meta, font_size=12, font_style="Regular", color="#78716C",
                   sizing_h="fill", width=width - 180.0, height=16.0, tx=0.0, ty=22.0)
    nodes[str(info_id)]["children"].extend([t1, t2])
    nodes[str(fid)]["children"].append(info_id)

    p_id = make_text(fid, "price", price, font_size=14, font_style="Semi Bold", color="#1C1917",
                     sizing_h="hug", width=100.0, height=18.0, align="right", tx=width - 100.0, ty=31.0)
    nodes[str(fid)]["children"].append(p_id)
    return fid

def make_price_summary_card(parent_id, width=428.0, subtotal="Rp 129.000", fee="Gratis",
                            total="Rp 129.000", order_id="IKAPI-DEMO-0001", tx=0.0, ty=0.0):
    cid = make_frame(parent_id, "Right Column / Summary", width=width, height=260.0, mode="vertical",
                     gap=14.0, padding=[24.0, 24.0, 24.0, 24.0], fill_color="#FFFFFF",
                     stroke_color="#E7E5E4", corner_radius=12.0, sizing_h="fixed", tx=tx, ty=ty)
    c_children = nodes[str(cid)]["children"]

    t_h = make_text(cid, "h", "Ringkasan Biaya", font_size=16, font_style="Semi Bold", color="#1C1917", tx=24.0, ty=24.0)
    c_children.append(t_h)

    cur_y = 56.0
    for label, val in [
        ("Nomor Pesanan", order_id),
        ("Subtotal Produk (2 buku)", subtotal),
        ("Biaya Layanan Midtrans", fee),
    ]:
        rf = make_frame(cid, f"row_{label}", width=width - 48.0, height=20.0, mode="horizontal",
                        gap=0.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#FFFFFF",
                        main_align="spaceBetween", cross_align="center", tx=24.0, ty=cur_y)
        l_txt = make_text(rf, "l", label, font_size=13, font_style="Regular", color="#78716C", tx=0.0, ty=0.0)
        v_txt = make_text(rf, "v", val, font_size=13, font_style="Medium", color="#1C1917", tx=width - 160.0, ty=0.0)
        nodes[str(rf)]["children"].extend([l_txt, v_txt])
        c_children.append(rf)
        cur_y += 28.0

    div_id = alloc_id()
    div_node = {
        "id": div_id,
        "name": "divider",
        "type": "line",
        "parent": cid,
        "transform": [1.0, 0.0, 0.0, 1.0, 24.0, cur_y],
        "width": width - 48.0,
        "height": 1.0,
        "strokes": solid_stroke("#E7E5E4"),
        "stroke_weight": 1.0
    }
    nodes[str(div_id)] = div_node
    c_children.append(div_id)
    cur_y += 12.0

    tot_f = make_frame(cid, "total_row", width=width - 48.0, height=32.0, mode="horizontal",
                       gap=0.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#FFFFFF",
                       main_align="spaceBetween", cross_align="center", tx=24.0, ty=cur_y)
    t_lbl = make_text(tot_f, "tot_l", "Total Pembayaran", font_size=15, font_style="Bold", color="#1C1917", tx=0.0, ty=6.0)
    t_val = make_text(tot_f, "tot_v", total, font_size=18, font_style="Bold", color="#0075DE", tx=width - 170.0, ty=4.0)
    nodes[str(tot_f)]["children"].extend([t_lbl, t_val])
    c_children.append(tot_f)

    return cid

def make_method_card(parent_id, title, subtitle, fee_text="Gratis", is_selected=False,
                     width=772.0, tx=0.0, ty=0.0, target_dest=None):
    card_bg = "#F0F7FF" if is_selected else "#FFFFFF"
    card_stroke = "#0075DE" if is_selected else "#E7E5E4"
    cid = make_frame(parent_id, f"Method / {title}", width=width, height=72.0, mode="horizontal",
                     gap=16.0, padding=[14.0, 20.0, 14.0, 20.0], fill_color=card_bg,
                     stroke_color=card_stroke, corner_radius=8.0, cross_align="center",
                     main_align="spaceBetween", tx=tx, ty=ty)

    if target_dest:
        nodes[str(cid)]["interactions"] = [{
            "trigger": {"type": "onClick"},
            "actions": [{"type": "navigate", "dest": target_dest}],
            "duration_ms": 300,
            "easing": "easeOut",
            "transition": {"type": "instant"}
        }]

    c_children = nodes[str(cid)]["children"]

    if width < 500.0:
        lg_w = width - 80.0
        info_w = lg_w - 36.0
        fee_x = width - 64.0
    else:
        lg_w = width - 180.0
        info_w = width - 220.0
        fee_x = width - 100.0

    left_f = make_frame(cid, "left_g", width=lg_w, height=44.0, mode="horizontal",
                        gap=14.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color=card_bg, cross_align="center", tx=16.0 if width < 500 else 20.0, ty=14.0)
    l_children = nodes[str(left_f)]["children"]

    r_id = alloc_id()
    radio_node = {
        "id": r_id,
        "name": "radio",
        "type": "ellipse",
        "parent": left_f,
        "transform": [1.0, 0.0, 0.0, 1.0, 0.0, 12.0],
        "width": 20.0,
        "height": 20.0,
        "fills": solid_fill("#0075DE" if is_selected else "#FFFFFF"),
        "strokes": solid_stroke("#0075DE" if is_selected else "#D1D5DB"),
        "stroke_weight": 2.0
    }
    nodes[str(r_id)] = radio_node
    l_children.append(r_id)

    info_f = make_frame(left_f, "info", width=info_w, height=40.0, mode="vertical",
                        gap=2.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color=card_bg, tx=34.0, ty=2.0)
    t1 = make_text(info_f, "t1", title, font_size=14, font_style="Semi Bold" if is_selected else "Medium",
                   color="#1C1917", sizing_h="fill", width=info_w, height=18.0, tx=0.0, ty=0.0)
    t2 = make_text(info_f, "t2", subtitle, font_size=12, font_style="Regular",
                   color="#78716C", sizing_h="fill", width=info_w, height=16.0, tx=0.0, ty=20.0)
    nodes[str(info_f)]["children"].extend([t1, t2])
    l_children.append(info_f)

    c_children.append(left_f)

    fee_t = make_text(cid, "fee", fee_text, font_size=12, font_style="Medium",
                      color="#059669" if fee_text == "Gratis" else "#78716C",
                      sizing_h="hug", width=60.0 if width < 500 else 80.0, height=16.0, align="right", tx=fee_x, ty=28.0)
    c_children.append(fee_t)

    return cid

def make_alert_banner(parent_id, text, alert_type="warning", width=820.0, tx=0.0, ty=0.0):
    bg_map = {
        "warning": ("#FFFBEB", "#B45309", "#FDE68A"),
        "danger": ("#FEF2F2", "#B91C1C", "#FECACA"),
        "info": ("#EFF6FF", "#1D4ED8", "#BFDBFE"),
        "success": ("#F0FDF4", "#15803D", "#BBF7D0")
    }
    bg, fg, border = bg_map.get(alert_type, ("#FFFBEB", "#B45309", "#FDE68A"))
    aid = make_frame(parent_id, f"Alert / {alert_type}", width=width, height=52.0, mode="horizontal",
                     gap=12.0, padding=[14.0, 18.0, 14.0, 18.0], fill_color=bg, stroke_color=border,
                     corner_radius=8.0, cross_align="center", tx=tx, ty=ty)
    a_children = nodes[str(aid)]["children"]

    icon_char = "⚠️" if alert_type in ["warning", "danger"] else "ℹ️"
    ic_t = make_text(aid, "icon", icon_char, font_size=16, font_style="Regular", color=fg, tx=18.0, ty=16.0)
    msg_t = make_text(aid, "msg", text, font_size=13, font_style="Medium", color=fg,
                      sizing_h="fill", width=width - 64.0, height=18.0, tx=42.0, ty=17.0)
    a_children.extend([ic_t, msg_t])
    return aid

def make_desktop_title_block(parent_id, bc_text, title_text, sub_text, bc_dest=None, tx=80.0, ty=36.0, title_color="#1C1917"):
    tb_id = make_frame(parent_id, "Title Block", width=1280.0, height=84.0, mode="vertical",
                       gap=6.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F6F5F4", tx=tx, ty=ty)
    tb_children = nodes[str(tb_id)]["children"]
    bc = make_text(tb_id, "bc", bc_text, font_size=13, font_style="Medium", color="#0075DE", tx=0.0, ty=0.0)
    if bc_dest:
        nodes[str(bc)]["interactions"] = [{
            "trigger": {"type": "onClick"},
            "actions": [{"type": "navigate", "dest": bc_dest}],
            "duration_ms": 300, "easing": "easeOut", "transition": {"type": "instant"}
        }]
    h1 = make_text(tb_id, "h1", title_text, font_size=24, font_style="Bold", color=title_color, tx=0.0, ty=24.0)
    sub = make_text(tb_id, "sub", sub_text, font_size=14, font_style="Regular", color="#78716C", tx=0.0, ty=58.0)
    tb_children.extend([bc, h1, sub])
    return tb_id

# Frame ID Constants
ID_SUM_DESK  = 2200
ID_SUM_MOB   = 2300
ID_METH_DEF  = 2400
ID_METH_MOB  = 2500
ID_METH_SEL  = 2600
ID_METH_ERR  = 2700
ID_INST_VA   = 2800
ID_INST_QRIS = 2900
ID_INST_EWAL = 3000
ID_INST_MOB  = 3100
ID_STAT_PEND = 3200
ID_STAT_PAID = 3300
ID_STAT_CANC = 3400
ID_STAT_EXPR = 3500
ID_REMINDER  = 3600

def create_desktop_frame(fid, name, height, page_x, page_y):
    node = {
        "id": fid,
        "name": name,
        "type": "frame",
        "parent": 2100,
        "children": [],
        "transform": [1.0, 0.0, 0.0, 1.0, float(page_x), float(page_y)],
        "width": 1440.0,
        "height": float(height),
        "fills": solid_fill("#F6F5F4"),
        "layout": {
            "mode": "vertical", "wrap": False, "gap": 0.0, "cross_gap": 10.0,
            "padding": [0.0, 0.0, 0.0, 0.0], "main_align": "min", "cross_align": "min",
            "content_align": "auto", "grid_columns": 2, "grid_rows": 2,
            "column_tracks": [], "row_tracks": [], "strokes_included": True, "reverse_z": False
        },
        "child_layout": {"sizing_h": "fixed", "sizing_v": "fixed", "absolute": False, "grid_column_span": 0, "grid_row_span": 0},
        "clip": True
    }
    nodes[str(fid)] = node
    return fid

def create_mobile_frame(fid, name, height, page_x, page_y):
    node = {
        "id": fid,
        "name": name,
        "type": "frame",
        "parent": 2100,
        "children": [],
        "transform": [1.0, 0.0, 0.0, 1.0, float(page_x), float(page_y)],
        "width": 390.0,
        "height": float(height),
        "fills": solid_fill("#F6F5F4"),
        "layout": {
            "mode": "vertical", "wrap": False, "gap": 0.0, "cross_gap": 10.0,
            "padding": [0.0, 0.0, 0.0, 0.0], "main_align": "min", "cross_align": "min",
            "content_align": "auto", "grid_columns": 2, "grid_rows": 2,
            "column_tracks": [], "row_tracks": [], "strokes_included": True, "reverse_z": False
        },
        "child_layout": {"sizing_h": "fixed", "sizing_v": "fixed", "absolute": False, "grid_column_span": 0, "grid_row_span": 0},
        "clip": True
    }
    nodes[str(fid)] = node
    return fid

# ==============================================================================
# FRAME 1: F06 / Payment Summary / Desktop (UC-14)
# ==============================================================================
def build_frame_1():
    fid = create_desktop_frame(ID_SUM_DESK, "F06 / Payment Summary / Desktop", 860.0, 0.0, 100.0)
    f_children = nodes[str(fid)]["children"]

    # Header
    hdr = clone_subtree(1960, fid, 0.0, 0.0)
    f_children.append(hdr)

    # Body
    body_id = make_frame(fid, "Summary Body", width=1440.0, height=688.0, mode="vertical",
                         gap=24.0, padding=[36.0, 80.0, 48.0, 80.0], fill_color="#F6F5F4", tx=0.0, ty=72.0)
    b_children = nodes[str(body_id)]["children"]

    # Title block
    tb = make_desktop_title_block(body_id, "← Kembali ke Checkout", "Ringkasan Pembayaran",
                                  "Periksa rincian pesanan dan selesaikan pembayaran sebelum batas waktu berakhir.",
                                  bc_dest=1959, tx=80.0, ty=36.0)
    b_children.append(tb)

    # Two columns
    cols_id = make_frame(body_id, "Two Columns", width=1280.0, height=550.0, mode="horizontal",
                         gap=32.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F6F5F4", tx=80.0, ty=136.0)
    cols_children = nodes[str(cols_id)]["children"]

    # Left Column (820px)
    left_id = make_frame(cols_id, "Left Column", width=820.0, height=530.0, mode="vertical",
                         gap=20.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F6F5F4", tx=0.0, ty=0.0)
    left_children = nodes[str(left_id)]["children"]

    # 1. 24-Hour Timer Alert Card
    timer_card = make_frame(left_id, "Timer Card (UC-14)", width=820.0, height=140.0, mode="vertical",
                            gap=10.0, padding=[20.0, 24.0, 20.0, 24.0], fill_color="#FFFFFF",
                            stroke_color="#E7E5E4", corner_radius=12.0, tx=0.0, ty=0.0)
    tc_children = nodes[str(timer_card)]["children"]

    t_row1 = make_frame(timer_card, "t_row1", width=772.0, height=24.0, mode="horizontal",
                        gap=0.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#FFFFFF",
                        main_align="spaceBetween", cross_align="center", tx=24.0, ty=20.0)
    t_lbl = make_text(t_row1, "t_lbl", "Batas Waktu Pembayaran (24 Jam)", font_size=14, font_style="Semi Bold", color="#1C1917", tx=0.0, ty=4.0)
    w_badge = make_badge(t_row1, "Menunggu Pembayaran", "warning", tx=590.0, ty=0.0)
    nodes[str(t_row1)]["children"].extend([t_lbl, w_badge])
    tc_children.append(t_row1)

    t_row2 = make_frame(timer_card, "t_row2", width=772.0, height=36.0, mode="horizontal",
                        gap=12.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#FFFFFF", cross_align="center", tx=24.0, ty=54.0)
    sisa_lbl = make_text(t_row2, "sisa", "Sisa Waktu Pembayaran:", font_size=14, font_style="Regular", color="#78716C", tx=0.0, ty=8.0)
    timer_val = make_text(t_row2, "timer_val", "23 : 59 : 45", font_size=26, font_style="Bold", color="#D97706", tx=170.0, ty=2.0)
    nodes[str(t_row2)]["children"].extend([sisa_lbl, timer_val])
    tc_children.append(t_row2)

    t_note = make_text(timer_card, "note", "Jatuh tempo: Besok, 06 November 2026 pukul 14:30 WIB. Pesanan otomatis dibatalkan jika tidak dibayar tepat waktu.",
                       font_size=12, font_style="Regular", color="#78716C", sizing_h="fill", width=772.0, height=16.0, tx=24.0, ty=100.0)
    tc_children.append(t_note)
    left_children.append(timer_card)

    # 2. Order Items Card
    items_card = make_frame(left_id, "Order Items Card", width=820.0, height=270.0, mode="vertical",
                            gap=12.0, padding=[24.0, 24.0, 24.0, 24.0], fill_color="#FFFFFF",
                            stroke_color="#E7E5E4", corner_radius=12.0, tx=0.0, ty=160.0)
    ic_children = nodes[str(items_card)]["children"]

    ih_row = make_frame(items_card, "ih_row", width=772.0, height=20.0, mode="horizontal",
                        gap=0.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#FFFFFF",
                        main_align="spaceBetween", cross_align="center", tx=24.0, ty=24.0)
    ih_title = make_text(ih_row, "ih_title", "Item Pesanan (2 judul e-book)", font_size=15, font_style="Semi Bold", color="#1C1917", tx=0.0, ty=2.0)
    ih_num = make_text(ih_row, "ih_num", "Nomor: IKAPI-DEMO-0001", font_size=13, font_style="Medium", color="#0075DE", tx=580.0, ty=3.0)
    nodes[str(ih_row)]["children"].extend([ih_title, ih_num])
    ic_children.append(ih_row)

    # Book Row 1
    br1 = make_book_row(items_card, "Pride and Prejudice", "Jane Austen • E-Book EPUB • 2 × Rp 45.000", "Rp 90.000", HASH_PRIDE, width=772.0, tx=24.0, ty=56.0)
    ic_children.append(br1)

    # Divider
    div_id = alloc_id()
    div_node = {
        "id": div_id, "name": "div", "type": "line", "parent": items_card,
        "transform": [1.0, 0.0, 0.0, 1.0, 24.0, 146.0], "width": 772.0, "height": 1.0,
        "strokes": solid_stroke("#E7E5E4"), "stroke_weight": 1.0
    }
    nodes[str(div_id)] = div_node
    ic_children.append(div_id)

    # Book Row 2
    br2 = make_book_row(items_card, "Frankenstein", "Mary Shelley • E-Book EPUB • 1 × Rp 39.000", "Rp 39.000", HASH_FRANK, width=772.0, tx=24.0, ty=158.0)
    ic_children.append(br2)

    left_children.append(items_card)
    cols_children.append(left_id)

    # Right Column (428px)
    right_id = make_frame(cols_id, "Right Column", width=428.0, height=400.0, mode="vertical",
                          gap=16.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F6F5F4", tx=852.0, ty=0.0)
    r_children = nodes[str(right_id)]["children"]

    summary_card = make_price_summary_card(right_id, width=428.0, subtotal="Rp 129.000", fee="Gratis", total="Rp 129.000", order_id="IKAPI-DEMO-0001", tx=0.0, ty=0.0)
    r_children.append(summary_card)

    # CTA Button -> Navigate to ID_METH_DEF (2400)
    btn_next = make_button(right_id, "Pilih Metode Pembayaran", style="primary", width=428.0, height=44.0, target_dest=ID_METH_DEF, tx=0.0, ty=276.0)
    r_children.append(btn_next)

    # Cancel Button -> Navigate to ID_STAT_CANC (3400)
    btn_cancel = make_button(right_id, "Batalkan Pesanan", style="danger", width=428.0, height=36.0, target_dest=ID_STAT_CANC, tx=0.0, ty=330.0)
    r_children.append(btn_cancel)

    cols_children.append(right_id)
    b_children.append(cols_id)
    f_children.append(body_id)

    # Footer
    ftr = clone_subtree(1989, fid, 0.0, 760.0)
    f_children.append(ftr)
    return fid

# ==============================================================================
# FRAME 2: F06 / Payment Summary / Mobile (UC-14)
# ==============================================================================
def build_frame_2():
    fid = create_mobile_frame(ID_SUM_MOB, "F06 / Payment Summary / Mobile", 920.0, 1500.0, 100.0)
    f_children = nodes[str(fid)]["children"]

    hdr = clone_subtree(1639, fid, 0.0, 0.0)
    f_children.append(hdr)

    body_id = make_frame(fid, "Mobile Body", width=390.0, height=782.0, mode="vertical",
                         gap=16.0, padding=[20.0, 16.0, 24.0, 16.0], fill_color="#F6F5F4", tx=0.0, ty=56.0)
    b_children = nodes[str(body_id)]["children"]

    # Title
    t1 = make_text(body_id, "h1", "Pembayaran Pesanan", font_size=20, font_style="Bold", color="#1C1917", tx=16.0, ty=20.0)
    t2 = make_text(body_id, "sub", "Nomor Pesanan: IKAPI-DEMO-0001", font_size=13, font_style="Medium", color="#0075DE", tx=16.0, ty=46.0)
    b_children.extend([t1, t2])

    # Timer Card Mobile
    t_card = make_frame(body_id, "Timer Card Mobile", width=358.0, height=110.0, mode="vertical",
                        gap=6.0, padding=[14.0, 16.0, 14.0, 16.0], fill_color="#FFFFFF",
                        stroke_color="#E7E5E4", corner_radius=8.0, tx=16.0, ty=76.0)
    tc_children = nodes[str(t_card)]["children"]
    badge = make_badge(t_card, "Menunggu Pembayaran", "warning", tx=16.0, ty=14.0)
    time_str = make_text(t_card, "time", "Sisa Waktu: 23:59:45", font_size=18, font_style="Bold", color="#D97706", tx=16.0, ty=44.0)
    dead_str = make_text(t_card, "dead", "Batas: Besok, 06 Nov 2026 14:30 WIB", font_size=11, font_style="Regular", color="#78716C", tx=16.0, ty=72.0)
    tc_children.extend([badge, time_str, dead_str])
    b_children.append(t_card)

    # Items Compact
    it_card = make_frame(body_id, "Items Compact", width=358.0, height=190.0, mode="vertical",
                         gap=10.0, padding=[16.0, 16.0, 16.0, 16.0], fill_color="#FFFFFF",
                         stroke_color="#E7E5E4", corner_radius=8.0, tx=16.0, ty=202.0)
    it_children = nodes[str(it_card)]["children"]
    it_title = make_text(it_card, "it_title", "Item Pesanan (2 Buku)", font_size=14, font_style="Semi Bold", color="#1C1917", tx=16.0, ty=16.0)
    br1 = make_book_row(it_card, "Pride and Prejudice", "2 × Rp 45.000", "Rp 90.000", HASH_PRIDE, width=326.0, tx=16.0, ty=42.0)
    br2 = make_book_row(it_card, "Frankenstein", "1 × Rp 39.000", "Rp 39.000", HASH_FRANK, width=326.0, tx=16.0, ty=114.0)
    it_children.extend([it_title, br1, br2])
    b_children.append(it_card)

    # Price summary compact
    sum_card = make_frame(body_id, "Sum Card", width=358.0, height=140.0, mode="vertical",
                          gap=8.0, padding=[16.0, 16.0, 16.0, 16.0], fill_color="#FFFFFF",
                          stroke_color="#E7E5E4", corner_radius=8.0, tx=16.0, ty=408.0)
    sc_children = nodes[str(sum_card)]["children"]
    st_txt = make_text(sum_card, "st", "Subtotal: Rp 129.000", font_size=13, font_style="Regular", color="#78716C", tx=16.0, ty=16.0)
    fee_txt = make_text(sum_card, "fee", "Biaya Layanan: Gratis", font_size=13, font_style="Regular", color="#059669", tx=16.0, ty=40.0)
    tot_txt = make_text(sum_card, "tot", "Total: Rp 129.000", font_size=16, font_style="Bold", color="#0075DE", tx=16.0, ty=70.0)
    sc_children.extend([st_txt, fee_txt, tot_txt])
    b_children.append(sum_card)

    # Actions
    btn_m = make_button(body_id, "Pilih Metode Pembayaran", style="primary", width=358.0, height=44.0, target_dest=ID_METH_MOB, tx=16.0, ty=564.0)
    btn_c = make_button(body_id, "Batalkan Pesanan", style="danger", width=358.0, height=38.0, target_dest=ID_STAT_CANC, tx=16.0, ty=616.0)
    b_children.extend([btn_m, btn_c])

    f_children.append(body_id)
    ftr = clone_subtree(1689, fid, 0.0, 838.0)
    f_children.append(ftr)
    return fid

# ==============================================================================
# FRAME 3: F06 / Payment Method / Desktop (Default) (UC-12)
# ==============================================================================
def build_frame_3():
    fid = create_desktop_frame(ID_METH_DEF, "F06 / Payment Method / Desktop (Default)", 980.0, 0.0, 1060.0)
    f_children = nodes[str(fid)]["children"]

    hdr = clone_subtree(1960, fid, 0.0, 0.0)
    f_children.append(hdr)

    body_id = make_frame(fid, "Method Body", width=1440.0, height=808.0, mode="vertical",
                         gap=24.0, padding=[36.0, 80.0, 48.0, 80.0], fill_color="#F6F5F4", tx=0.0, ty=72.0)
    b_children = nodes[str(body_id)]["children"]

    tb = make_desktop_title_block(body_id, "← Kembali ke Ringkasan", "Pilih Metode Pembayaran",
                                  "Pilih salah satu metode pembayaran digital melalui Midtrans untuk pesanan IKAPI-DEMO-0001.",
                                  bc_dest=ID_SUM_DESK, tx=80.0, ty=36.0)
    b_children.append(tb)

    cols_id = make_frame(body_id, "Two Columns", width=1280.0, height=670.0, mode="horizontal",
                         gap=32.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F6F5F4", tx=80.0, ty=136.0)
    cols_children = nodes[str(cols_id)]["children"]

    left_id = make_frame(cols_id, "Left Column", width=820.0, height=670.0, mode="vertical",
                         gap=16.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F6F5F4", tx=0.0, ty=0.0)
    left_children = nodes[str(left_id)]["children"]

    # Cat 1: Virtual Account
    cat1_t = make_text(left_id, "cat1", "Transfer Bank / Virtual Account (Verifikasi Otomatis)", font_size=14, font_style="Semi Bold", color="#1C1917", tx=0.0, ty=0.0)
    left_children.append(cat1_t)

    # Method 1: BCA VA (clicking selects it -> Frame 5 ID_METH_SEL)
    m1 = make_method_card(left_id, "BCA Virtual Account", "Bayar melalui ATM, m-BCA, atau KlikBCA", "Gratis", is_selected=False, width=820.0, tx=0.0, ty=28.0, target_dest=ID_METH_SEL)
    m2 = make_method_card(left_id, "Mandiri Virtual Account", "Bayar melalui Livin' by Mandiri atau ATM Mandiri", "Gratis", is_selected=False, width=820.0, tx=0.0, ty=108.0, target_dest=ID_METH_SEL)
    m3 = make_method_card(left_id, "BNI Virtual Account", "Bayar melalui BNI Mobile Banking atau ATM BNI", "Gratis", is_selected=False, width=820.0, tx=0.0, ty=188.0, target_dest=ID_METH_SEL)
    m4 = make_method_card(left_id, "BRI Virtual Account (BRIVA)", "Bayar melalui BRImo atau ATM BRI", "Gratis", is_selected=False, width=820.0, tx=0.0, ty=268.0, target_dest=ID_METH_SEL)
    left_children.extend([m1, m2, m3, m4])

    # Cat 2: QRIS
    cat2_t = make_text(left_id, "cat2", "QRIS (Pembayaran Instan)", font_size=14, font_style="Semi Bold", color="#1C1917", tx=0.0, ty=356.0)
    m5 = make_method_card(left_id, "QRIS (Semua E-Wallet & Mobile Banking)", "GoPay, OVO, DANA, LinkAja, BCA, ShopeePay", "Gratis", is_selected=False, width=820.0, tx=0.0, ty=384.0, target_dest=ID_METH_SEL)
    left_children.extend([cat2_t, m5])

    # Cat 3: E-Wallet
    cat3_t = make_text(left_id, "cat3", "E-Wallet / Uang Elektronik", font_size=14, font_style="Semi Bold", color="#1C1917", tx=0.0, ty=472.0)
    m6 = make_method_card(left_id, "GoPay", "Pembayaran instan langsung terhubung ke aplikasi GoPay", "Gratis", is_selected=False, width=820.0, tx=0.0, ty=500.0, target_dest=ID_METH_SEL)
    m7 = make_method_card(left_id, "ShopeePay", "Bayar langsung dengan saldo ShopeePay", "Gratis", is_selected=False, width=820.0, tx=0.0, ty=580.0, target_dest=ID_METH_SEL)
    left_children.extend([cat3_t, m6, m7])
    cols_children.append(left_id)

    # Right Column
    right_id = make_frame(cols_id, "Right Column", width=428.0, height=380.0, mode="vertical",
                          gap=16.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F6F5F4", tx=852.0, ty=0.0)
    r_children = nodes[str(right_id)]["children"]
    sc = make_price_summary_card(right_id, width=428.0, subtotal="Rp 129.000", fee="Gratis", total="Rp 129.000", order_id="IKAPI-DEMO-0001", tx=0.0, ty=0.0)
    r_children.append(sc)

    # Clicking without selection navigates to Frame 6 (Validation Error ID_METH_ERR)
    btn_pay = make_button(right_id, "Bayar Sekarang", style="disabled", width=428.0, height=44.0, target_dest=ID_METH_ERR, tx=0.0, ty=276.0)
    hint = make_text(right_id, "hint", "Silakan pilih salah satu metode pembayaran di sebelah kiri terlebih dahulu.", font_size=12, font_style="Regular", color="#78716C", tx=0.0, ty=330.0)
    r_children.extend([btn_pay, hint])
    cols_children.append(right_id)

    b_children.append(cols_id)
    f_children.append(body_id)

    ftr = clone_subtree(1989, fid, 0.0, 880.0)
    f_children.append(ftr)
    return fid

# ==============================================================================
# FRAME 4: F06 / Payment Method / Mobile (Default) (UC-12)
# ==============================================================================
def build_frame_4():
    fid = create_mobile_frame(ID_METH_MOB, "F06 / Payment Method / Mobile (Default)", 1100.0, 1500.0, 1060.0)
    f_children = nodes[str(fid)]["children"]

    hdr = clone_subtree(1639, fid, 0.0, 0.0)
    f_children.append(hdr)

    body_id = make_frame(fid, "Mobile Body", width=390.0, height=962.0, mode="vertical",
                         gap=14.0, padding=[20.0, 16.0, 24.0, 16.0], fill_color="#F6F5F4", tx=0.0, ty=56.0)
    b_children = nodes[str(body_id)]["children"]

    t1 = make_text(body_id, "h1", "Pilih Metode Pembayaran", font_size=18, font_style="Bold", color="#1C1917", tx=16.0, ty=20.0)
    b_children.append(t1)

    # Category VA
    c1 = make_text(body_id, "c1", "Virtual Account (Bank)", font_size=13, font_style="Semi Bold", color="#1C1917", tx=16.0, ty=54.0)
    m1 = make_method_card(body_id, "BCA Virtual Account", "Verifikasi otomatis 24 jam", "Gratis", False, width=358.0, tx=16.0, ty=76.0, target_dest=ID_METH_SEL)
    m2 = make_method_card(body_id, "Mandiri Virtual Account", "Verifikasi otomatis 24 jam", "Gratis", False, width=358.0, tx=16.0, ty=156.0, target_dest=ID_METH_SEL)
    m3 = make_method_card(body_id, "BRI Virtual Account", "Verifikasi otomatis 24 jam", "Gratis", False, width=358.0, tx=16.0, ty=236.0, target_dest=ID_METH_SEL)
    b_children.extend([c1, m1, m2, m3])

    # Category QRIS
    c2 = make_text(body_id, "c2", "QRIS", font_size=13, font_style="Semi Bold", color="#1C1917", tx=16.0, ty=324.0)
    m4 = make_method_card(body_id, "QRIS (Semua E-Wallet)", "GoPay, OVO, DANA, LinkAja", "Gratis", False, width=358.0, tx=16.0, ty=346.0, target_dest=ID_METH_SEL)
    b_children.extend([c2, m4])

    # Category E-Wallet
    c3 = make_text(body_id, "c3", "E-Wallet", font_size=13, font_style="Semi Bold", color="#1C1917", tx=16.0, ty=434.0)
    m5 = make_method_card(body_id, "GoPay", "Langsung ke aplikasi GoPay", "Gratis", False, width=358.0, tx=16.0, ty=456.0, target_dest=ID_METH_SEL)
    b_children.extend([c3, m5])

    # Total and Button
    tot_t = make_text(body_id, "tot", "Total: Rp 129.000", font_size=16, font_style="Bold", color="#0075DE", tx=16.0, ty=550.0)
    btn_m = make_button(body_id, "Bayar Sekarang", style="disabled", width=358.0, height=44.0, target_dest=ID_METH_ERR, tx=16.0, ty=580.0)
    b_children.extend([tot_t, btn_m])

    f_children.append(body_id)
    ftr = clone_subtree(1689, fid, 0.0, 1018.0)
    f_children.append(ftr)
    return fid

# ==============================================================================
# FRAME 5: F06 / Payment Method / Selected (UC-12)
# ==============================================================================
def build_frame_5():
    fid = create_desktop_frame(ID_METH_SEL, "F06 / Payment Method / Selected", 980.0, 0.0, 2140.0)
    f_children = nodes[str(fid)]["children"]

    hdr = clone_subtree(1960, fid, 0.0, 0.0)
    f_children.append(hdr)

    body_id = make_frame(fid, "Method Body", width=1440.0, height=808.0, mode="vertical",
                         gap=24.0, padding=[36.0, 80.0, 48.0, 80.0], fill_color="#F6F5F4", tx=0.0, ty=72.0)
    b_children = nodes[str(body_id)]["children"]

    tb = make_desktop_title_block(body_id, "← Kembali ke Ringkasan", "Pilih Metode Pembayaran",
                                  "Metode pembayaran terpilih: BCA Virtual Account. Klik 'Bayar Sekarang' untuk melanjutkan.",
                                  bc_dest=ID_SUM_DESK, tx=80.0, ty=36.0)
    b_children.append(tb)

    cols_id = make_frame(body_id, "Two Columns", width=1280.0, height=670.0, mode="horizontal",
                         gap=32.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F6F5F4", tx=80.0, ty=136.0)
    cols_children = nodes[str(cols_id)]["children"]

    left_id = make_frame(cols_id, "Left Column", width=820.0, height=670.0, mode="vertical",
                         gap=16.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F6F5F4", tx=0.0, ty=0.0)
    left_children = nodes[str(left_id)]["children"]

    cat1_t = make_text(left_id, "cat1", "Transfer Bank / Virtual Account (Verifikasi Otomatis)", font_size=14, font_style="Semi Bold", color="#1C1917", tx=0.0, ty=0.0)
    left_children.append(cat1_t)

    # BCA VA SELECTED!
    m1 = make_method_card(left_id, "BCA Virtual Account", "Bayar melalui ATM, m-BCA, atau KlikBCA", "Gratis", is_selected=True, width=820.0, tx=0.0, ty=28.0)
    m2 = make_method_card(left_id, "Mandiri Virtual Account", "Bayar melalui Livin' by Mandiri atau ATM Mandiri", "Gratis", is_selected=False, width=820.0, tx=0.0, ty=108.0)
    m3 = make_method_card(left_id, "BNI Virtual Account", "Bayar melalui BNI Mobile Banking atau ATM BNI", "Gratis", is_selected=False, width=820.0, tx=0.0, ty=188.0)
    m4 = make_method_card(left_id, "BRI Virtual Account (BRIVA)", "Bayar melalui BRImo atau ATM BRI", "Gratis", is_selected=False, width=820.0, tx=0.0, ty=268.0)
    left_children.extend([m1, m2, m3, m4])

    cat2_t = make_text(left_id, "cat2", "QRIS (Pembayaran Instan)", font_size=14, font_style="Semi Bold", color="#1C1917", tx=0.0, ty=356.0)
    m5 = make_method_card(left_id, "QRIS (Semua E-Wallet & Mobile Banking)", "GoPay, OVO, DANA, LinkAja, BCA, ShopeePay", "Gratis", is_selected=False, width=820.0, tx=0.0, ty=384.0, target_dest=ID_INST_QRIS)
    left_children.extend([cat2_t, m5])

    cat3_t = make_text(left_id, "cat3", "E-Wallet / Uang Elektronik", font_size=14, font_style="Semi Bold", color="#1C1917", tx=0.0, ty=472.0)
    m6 = make_method_card(left_id, "GoPay", "Pembayaran instan langsung terhubung ke aplikasi GoPay", "Gratis", is_selected=False, width=820.0, tx=0.0, ty=500.0, target_dest=ID_INST_EWAL)
    left_children.extend([cat3_t, m6])
    cols_children.append(left_id)

    # Right Column
    right_id = make_frame(cols_id, "Right Column", width=428.0, height=380.0, mode="vertical",
                          gap=16.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F6F5F4", tx=852.0, ty=0.0)
    r_children = nodes[str(right_id)]["children"]
    sc = make_price_summary_card(right_id, width=428.0, subtotal="Rp 129.000", fee="Gratis", total="Rp 129.000", order_id="IKAPI-DEMO-0001", tx=0.0, ty=0.0)
    r_children.append(sc)

    # ENABLED Button -> Navigates to ID_INST_VA (2800)
    btn_pay = make_button(right_id, "Bayar Sekarang (Rp 129.000)", style="primary", width=428.0, height=44.0, target_dest=ID_INST_VA, tx=0.0, ty=276.0)
    r_children.append(btn_pay)
    cols_children.append(right_id)

    b_children.append(cols_id)
    f_children.append(body_id)

    ftr = clone_subtree(1989, fid, 0.0, 880.0)
    f_children.append(ftr)
    return fid

# ==============================================================================
# FRAME 6: F06 / Payment Method / Validation Error (UC-12 Alt 1)
# ==============================================================================
def build_frame_6():
    fid = create_desktop_frame(ID_METH_ERR, "F06 / Payment Method / Validation Error", 1020.0, 1500.0, 2140.0)
    f_children = nodes[str(fid)]["children"]

    hdr = clone_subtree(1960, fid, 0.0, 0.0)
    f_children.append(hdr)

    body_id = make_frame(fid, "Method Body", width=1440.0, height=848.0, mode="vertical",
                         gap=20.0, padding=[32.0, 80.0, 48.0, 80.0], fill_color="#F6F5F4", tx=0.0, ty=72.0)
    b_children = nodes[str(body_id)]["children"]

    # Red Validation Alert Banner (exact copy from scenario_text.txt!)
    alert = make_alert_banner(body_id, "Silakan pilih salah satu metode pembayaran terlebih dahulu", alert_type="danger", width=1280.0, tx=80.0, ty=32.0)
    b_children.append(alert)

    tb = make_desktop_title_block(body_id, "← Kembali ke Ringkasan", "Pilih Metode Pembayaran",
                                  "Pilih salah satu metode pembayaran digital melalui Midtrans untuk pesanan IKAPI-DEMO-0001.",
                                  bc_dest=ID_SUM_DESK, tx=80.0, ty=96.0)
    b_children.append(tb)

    cols_id = make_frame(body_id, "Two Columns", width=1280.0, height=670.0, mode="horizontal",
                         gap=32.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F6F5F4", tx=80.0, ty=196.0)
    cols_children = nodes[str(cols_id)]["children"]

    left_id = make_frame(cols_id, "Left Column", width=820.0, height=670.0, mode="vertical",
                         gap=16.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F6F5F4", tx=0.0, ty=0.0)
    left_children = nodes[str(left_id)]["children"]

    cat1_t = make_text(left_id, "cat1", "Transfer Bank / Virtual Account (Verifikasi Otomatis)", font_size=14, font_style="Semi Bold", color="#1C1917", tx=0.0, ty=0.0)
    # Clicking any card clears error and selects it (navigates to Frame 5 ID_METH_SEL)
    m1 = make_method_card(left_id, "BCA Virtual Account", "Bayar melalui ATM, m-BCA, atau KlikBCA", "Gratis", False, width=820.0, tx=0.0, ty=28.0, target_dest=ID_METH_SEL)
    m2 = make_method_card(left_id, "Mandiri Virtual Account", "Bayar melalui Livin' by Mandiri atau ATM Mandiri", "Gratis", False, width=820.0, tx=0.0, ty=108.0, target_dest=ID_METH_SEL)
    m3 = make_method_card(left_id, "BNI Virtual Account", "Bayar melalui BNI Mobile Banking atau ATM BNI", "Gratis", False, width=820.0, tx=0.0, ty=188.0, target_dest=ID_METH_SEL)
    left_children.extend([cat1_t, m1, m2, m3])
    cols_children.append(left_id)

    right_id = make_frame(cols_id, "Right Column", width=428.0, height=380.0, mode="vertical",
                          gap=16.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F6F5F4", tx=852.0, ty=0.0)
    r_children = nodes[str(right_id)]["children"]
    sc = make_price_summary_card(right_id, width=428.0, subtotal="Rp 129.000", fee="Gratis", total="Rp 129.000", order_id="IKAPI-DEMO-0001", tx=0.0, ty=0.0)
    btn_pay = make_button(right_id, "Bayar Sekarang", style="disabled", width=428.0, height=44.0, target_dest=ID_METH_ERR, tx=0.0, ty=276.0)
    r_children.extend([sc, btn_pay])
    cols_children.append(right_id)

    b_children.append(cols_id)
    f_children.append(body_id)

    ftr = clone_subtree(1989, fid, 0.0, 920.0)
    f_children.append(ftr)
    return fid

# ==============================================================================
# FRAME 7: F06 / Payment Instructions / Bank Transfer VA (UC-12, UC-13)
# ==============================================================================
def build_frame_7():
    fid = create_desktop_frame(ID_INST_VA, "F06 / Payment Instructions / Bank Transfer VA", 1020.0, 0.0, 3220.0)
    f_children = nodes[str(fid)]["children"]

    hdr = clone_subtree(1960, fid, 0.0, 0.0)
    f_children.append(hdr)

    body_id = make_frame(fid, "Instructions Body", width=1440.0, height=848.0, mode="vertical",
                         gap=24.0, padding=[36.0, 80.0, 48.0, 80.0], fill_color="#F6F5F4", tx=0.0, ty=72.0)
    b_children = nodes[str(body_id)]["children"]

    tb = make_desktop_title_block(body_id, "← Ubah Metode Pembayaran", "Instruksi Pembayaran BCA Virtual Account",
                                  "Transfer tepat hingga digit terakhir sebelum batas waktu berakhir agar pembayaran terverifikasi otomatis.",
                                  bc_dest=ID_METH_DEF, tx=80.0, ty=36.0)
    b_children.append(tb)

    cols_id = make_frame(body_id, "Two Columns", width=1280.0, height=710.0, mode="horizontal",
                         gap=32.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F6F5F4", tx=80.0, ty=136.0)
    cols_children = nodes[str(cols_id)]["children"]

    # Left Column (820px)
    left_id = make_frame(cols_id, "Left Column", width=820.0, height=710.0, mode="vertical",
                         gap=20.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F6F5F4", tx=0.0, ty=0.0)
    left_children = nodes[str(left_id)]["children"]

    # VA Number & Amount Card
    va_card = make_frame(left_id, "VA Detail Card", width=820.0, height=220.0, mode="vertical",
                         gap=16.0, padding=[24.0, 24.0, 24.0, 24.0], fill_color="#FFFFFF",
                         stroke_color="#E7E5E4", corner_radius=12.0, tx=0.0, ty=0.0)
    vc_children = nodes[str(va_card)]["children"]

    # VA row
    r1 = make_frame(va_card, "r1", width=772.0, height=36.0, mode="horizontal",
                    gap=0.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#FFFFFF",
                    main_align="spaceBetween", cross_align="center", tx=24.0, ty=24.0)
    bca_name = make_text(r1, "bca", "BCA Virtual Account", font_size=16, font_style="Bold", color="#0075DE", tx=0.0, ty=8.0)
    t_badge = make_badge(r1, "Sisa Waktu: 23:58:12", "warning", tx=610.0, ty=6.0)
    nodes[str(r1)]["children"].extend([bca_name, t_badge])
    vc_children.append(r1)

    # VA Box
    va_box = make_frame(va_card, "va_box", width=772.0, height=54.0, mode="horizontal",
                        gap=0.0, padding=[12.0, 16.0, 12.0, 16.0], fill_color="#F9FAFB",
                        stroke_color="#E5E7EB", corner_radius=8.0, main_align="spaceBetween", cross_align="center", tx=24.0, ty=76.0)
    vb_children = nodes[str(va_box)]["children"]
    va_txt_f = make_frame(va_box, "va_txt_f", width=500.0, height=32.0, mode="vertical", gap=2.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F9FAFB", tx=16.0, ty=11.0)
    v_lbl = make_text(va_txt_f, "v_lbl", "Nomor Virtual Account:", font_size=11, font_style="Regular", color="#78716C", tx=0.0, ty=0.0)
    v_num = make_text(va_txt_f, "v_num", "88012 0812 3456 7890", font_size=18, font_style="Bold", color="#1C1917", tx=0.0, ty=14.0)
    nodes[str(va_txt_f)]["children"].extend([v_lbl, v_num])
    btn_copy1 = make_button(va_box, "Salin Nomor", style="secondary", width=120.0, height=32.0, tx=636.0, ty=11.0)
    vb_children.extend([va_txt_f, btn_copy1])
    vc_children.append(va_box)

    # Amount Box
    amt_box = make_frame(va_card, "amt_box", width=772.0, height=54.0, mode="horizontal",
                         gap=0.0, padding=[12.0, 16.0, 12.0, 16.0], fill_color="#F9FAFB",
                         stroke_color="#E5E7EB", corner_radius=8.0, main_align="spaceBetween", cross_align="center", tx=24.0, ty=142.0)
    ab_children = nodes[str(amt_box)]["children"]
    amt_txt_f = make_frame(amt_box, "amt_txt_f", width=500.0, height=32.0, mode="vertical", gap=2.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F9FAFB", tx=16.0, ty=11.0)
    a_lbl = make_text(amt_txt_f, "a_lbl", "Total Nominal yang Harus Ditransfer:", font_size=11, font_style="Regular", color="#78716C", tx=0.0, ty=0.0)
    a_num = make_text(amt_txt_f, "a_num", "Rp 129.000", font_size=18, font_style="Bold", color="#0075DE", tx=0.0, ty=14.0)
    nodes[str(amt_txt_f)]["children"].extend([a_lbl, a_num])
    btn_copy2 = make_button(amt_box, "Salin Jumlah", style="secondary", width=120.0, height=32.0, tx=636.0, ty=11.0)
    ab_children.extend([amt_txt_f, btn_copy2])
    vc_children.append(amt_box)

    left_children.append(va_card)

    # How to Pay Accordion Card
    guide_card = make_frame(left_id, "Payment Steps Card", width=820.0, height=310.0, mode="vertical",
                            gap=14.0, padding=[24.0, 24.0, 24.0, 24.0], fill_color="#FFFFFF",
                            stroke_color="#E7E5E4", corner_radius=12.0, tx=0.0, ty=240.0)
    gc_children = nodes[str(guide_card)]["children"]

    g_title = make_text(guide_card, "g_title", "Tata Cara Pembayaran", font_size=16, font_style="Semi Bold", color="#1C1917", tx=24.0, ty=24.0)
    gc_children.append(g_title)

    # Tab bar
    tab_bar = make_frame(guide_card, "tab_bar", width=772.0, height=36.0, mode="horizontal", gap=8.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#FFFFFF", tx=24.0, ty=54.0)
    t_mbca = make_button(tab_bar, "m-BCA (BCA Mobile)", style="primary", width=170.0, height=36.0, tx=0.0, ty=0.0)
    t_klik = make_button(tab_bar, "KlikBCA", style="secondary", width=110.0, height=36.0, tx=178.0, ty=0.0)
    t_atm = make_button(tab_bar, "ATM BCA", style="secondary", width=110.0, height=36.0, tx=296.0, ty=0.0)
    nodes[str(tab_bar)]["children"].extend([t_mbca, t_klik, t_atm])
    gc_children.append(tab_bar)

    # Steps
    cur_y = 104.0
    for idx, step_txt in enumerate([
        "1. Buka aplikasi BCA Mobile, pilih menu 'm-Transfer'.",
        "2. Pilih opsi 'BCA Virtual Account'.",
        "3. Masukkan 16 digit Nomor Virtual Account: 88012 0812 3456 7890.",
        "4. Periksa rincian pembayaran (IKAPI Marketplace - Rp 129.000).",
        "5. Masukkan PIN m-BCA Anda dan simpan bukti transaksi."
    ]):
        st_t = make_text(guide_card, f"s{idx}", step_txt, font_size=13, font_style="Regular", color="#44403C", tx=24.0, ty=cur_y)
        gc_children.append(st_t)
        cur_y += 28.0

    left_children.append(guide_card)
    cols_children.append(left_id)

    # Right Column: Midtrans Simulation Controls
    right_id = make_frame(cols_id, "Right Column / Midtrans Simulation", width=428.0, height=440.0, mode="vertical",
                          gap=16.0, padding=[24.0, 24.0, 24.0, 24.0], fill_color="#FFFFFF",
                          stroke_color="#E7E5E4", corner_radius=12.0, tx=852.0, ty=0.0)
    r_children = nodes[str(right_id)]["children"]

    sim_h = make_text(right_id, "sim_h", "Simulasi Pembayaran (Midtrans)", font_size=16, font_style="Semi Bold", color="#1C1917", tx=24.0, ty=24.0)
    sim_sub = make_text(right_id, "sim_sub", "Gunakan tombol di bawah ini untuk mensimulasikan webhook respons Midtrans:", font_size=13, font_style="Regular", color="#78716C", tx=24.0, ty=52.0)
    r_children.extend([sim_h, sim_sub])

    # 1. Success -> ID_STAT_PAID (3300)
    b_paid = make_button(right_id, "Simulasi Bayar Berhasil (Lunas)", style="success", width=380.0, height=44.0, target_dest=ID_STAT_PAID, tx=24.0, ty=100.0)
    # 2. Pending -> ID_STAT_PEND (3200)
    b_pend = make_button(right_id, "Cek Status Pembayaran", style="secondary", width=380.0, height=40.0, target_dest=ID_STAT_PEND, tx=24.0, ty=156.0)
    # 3. Expired -> ID_STAT_EXPR (3500)
    b_expr = make_button(right_id, "Simulasi Batas Waktu Habis", style="secondary", width=380.0, height=40.0, target_dest=ID_STAT_EXPR, tx=24.0, ty=208.0)
    # 4. Cancel -> ID_STAT_CANC (3400)
    b_canc = make_button(right_id, "Batalkan Pesanan", style="danger", width=380.0, height=38.0, target_dest=ID_STAT_CANC, tx=24.0, ty=260.0)
    r_children.extend([b_paid, b_pend, b_expr, b_canc])

    cols_children.append(right_id)
    b_children.append(cols_id)
    f_children.append(body_id)

    ftr = clone_subtree(1989, fid, 0.0, 920.0)
    f_children.append(ftr)
    return fid

# ==============================================================================
# FRAME 8: F06 / Payment Instructions / QRIS (UC-12, UC-13)
# ==============================================================================
def build_frame_8():
    fid = create_desktop_frame(ID_INST_QRIS, "F06 / Payment Instructions / QRIS", 1040.0, 1500.0, 3220.0)
    f_children = nodes[str(fid)]["children"]

    hdr = clone_subtree(1960, fid, 0.0, 0.0)
    f_children.append(hdr)

    body_id = make_frame(fid, "QRIS Body", width=1440.0, height=868.0, mode="vertical",
                         gap=24.0, padding=[36.0, 80.0, 48.0, 80.0], fill_color="#F6F5F4", tx=0.0, ty=72.0)
    b_children = nodes[str(body_id)]["children"]

    tb = make_desktop_title_block(body_id, "← Ubah Metode Pembayaran", "Instruksi Pembayaran QRIS",
                                  "Pindai kode QR menggunakan aplikasi e-wallet atau mobile banking apa saja yang mendukung QRIS.",
                                  bc_dest=ID_METH_DEF, tx=80.0, ty=36.0)
    b_children.append(tb)

    cols_id = make_frame(body_id, "Two Columns", width=1280.0, height=720.0, mode="horizontal",
                         gap=32.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F6F5F4", tx=80.0, ty=136.0)
    cols_children = nodes[str(cols_id)]["children"]

    # Left Column (820px) - QR Code Box
    left_id = make_frame(cols_id, "Left Column", width=820.0, height=720.0, mode="vertical",
                         gap=20.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F6F5F4", tx=0.0, ty=0.0)
    left_children = nodes[str(left_id)]["children"]

    qris_card = make_frame(left_id, "QRIS Display Card", width=820.0, height=440.0, mode="vertical",
                           gap=12.0, padding=[24.0, 24.0, 24.0, 24.0], fill_color="#FFFFFF",
                           stroke_color="#E7E5E4", corner_radius=12.0, cross_align="center", tx=0.0, ty=0.0)
    qc_children = nodes[str(qris_card)]["children"]

    q_logo = make_text(qris_card, "q_logo", "QRIS • Quick Response Code Indonesian Standard", font_size=14, font_style="Bold", color="#DC2626", tx=220.0, ty=24.0)
    qc_children.append(q_logo)

    # QR Graphic Placeholder Frame
    qr_box = make_frame(qris_card, "QR Graphic", width=220.0, height=220.0, mode="vertical",
                        gap=0.0, padding=[10.0, 10.0, 10.0, 10.0], fill_color="#000000", corner_radius=8.0, cross_align="center", tx=300.0, ty=58.0)
    qr_inner = make_frame(qr_box, "inner", width=200.0, height=200.0, fill_color="#FFFFFF", corner_radius=4.0, cross_align="center", tx=10.0, ty=10.0)
    qr_txt = make_text(qr_inner, "qr_sim", "▣ SCAN QRIS ▣\nIKAPI-DEMO-0001\nRp 129.000", font_size=14, font_style="Bold", color="#1C1917", align="center", tx=30.0, ty=70.0)
    nodes[str(qr_inner)]["children"].append(qr_txt)
    nodes[str(qr_box)]["children"].append(qr_inner)
    qc_children.append(qr_box)

    # Supported logos
    supp_t = make_text(qris_card, "supp", "Didukung: GoPay • OVO • DANA • LinkAja • BCA • ShopeePay • Livin'", font_size=12, font_style="Regular", color="#78716C", tx=200.0, ty=294.0)
    qc_children.append(supp_t)

    # QRIS Countdown Timer
    q_timer = make_frame(qris_card, "q_timer", width=400.0, height=36.0, mode="horizontal", gap=8.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#FFFFFF", main_align="center", cross_align="center", tx=210.0, ty=324.0)
    qt_lbl = make_text(q_timer, "qt_l", "Kode QR Kedaluwarsa dalam:", font_size=13, font_style="Regular", color="#78716C", tx=0.0, ty=8.0)
    qt_val = make_text(q_timer, "qt_v", "14 : 52", font_size=18, font_style="Bold", color="#DC2626", tx=220.0, ty=6.0)
    nodes[str(q_timer)]["children"].extend([qt_lbl, qt_val])
    qc_children.append(q_timer)

    btn_dl = make_button(qris_card, "Unduh QR Code", style="secondary", width=180.0, height=36.0, tx=320.0, ty=376.0)
    qc_children.append(btn_dl)
    left_children.append(qris_card)

    cols_children.append(left_id)

    # Right Column: Simulation Controls
    right_id = make_frame(cols_id, "Right Column / Simulation", width=428.0, height=360.0, mode="vertical",
                          gap=16.0, padding=[24.0, 24.0, 24.0, 24.0], fill_color="#FFFFFF",
                          stroke_color="#E7E5E4", corner_radius=12.0, tx=852.0, ty=0.0)
    r_children = nodes[str(right_id)]["children"]
    sc_t = make_text(right_id, "sc_t", "Simulasi Pembayaran QRIS", font_size=16, font_style="Semi Bold", color="#1C1917", tx=24.0, ty=24.0)
    sc_p = make_text(right_id, "sc_p", "Klik tombol di bawah ini untuk mensimulasikan scan dan pembayaran sukses dari e-wallet pembeli:", font_size=13, font_style="Regular", color="#78716C", tx=24.0, ty=52.0)
    r_children.extend([sc_t, sc_p])

    b_paid = make_button(right_id, "Simulasi Bayar Berhasil (Midtrans)", style="success", width=380.0, height=44.0, target_dest=ID_STAT_PAID, tx=24.0, ty=100.0)
    b_pend = make_button(right_id, "Cek Status Pembayaran", style="secondary", width=380.0, height=40.0, target_dest=ID_STAT_PEND, tx=24.0, ty=156.0)
    b_canc = make_button(right_id, "Batalkan Pesanan", style="danger", width=380.0, height=38.0, target_dest=ID_STAT_CANC, tx=24.0, ty=208.0)
    r_children.extend([b_paid, b_pend, b_canc])
    cols_children.append(right_id)

    b_children.append(cols_id)
    f_children.append(body_id)

    ftr = clone_subtree(1989, fid, 0.0, 940.0)
    f_children.append(ftr)
    return fid

# ==============================================================================
# FRAME 9: F06 / Payment Instructions / E-Wallet (UC-12, UC-13)
# ==============================================================================
def build_frame_9():
    fid = create_desktop_frame(ID_INST_EWAL, "F06 / Payment Instructions / E-Wallet", 960.0, 0.0, 4320.0)
    f_children = nodes[str(fid)]["children"]

    hdr = clone_subtree(1960, fid, 0.0, 0.0)
    f_children.append(hdr)

    body_id = make_frame(fid, "E-Wallet Body", width=1440.0, height=788.0, mode="vertical",
                         gap=24.0, padding=[36.0, 80.0, 48.0, 80.0], fill_color="#F6F5F4", tx=0.0, ty=72.0)
    b_children = nodes[str(body_id)]["children"]

    tb = make_desktop_title_block(body_id, "← Ubah Metode Pembayaran", "Instruksi Pembayaran GoPay",
                                  "Lanjutkan pembayaran langsung melalui aplikasi GoPay di ponsel Anda.",
                                  bc_dest=ID_METH_DEF, tx=80.0, ty=36.0)
    b_children.append(tb)

    cols_id = make_frame(body_id, "Two Columns", width=1280.0, height=640.0, mode="horizontal",
                         gap=32.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F6F5F4", tx=80.0, ty=136.0)
    cols_children = nodes[str(cols_id)]["children"]

    left_id = make_frame(cols_id, "Left Column", width=820.0, height=400.0, mode="vertical",
                         gap=20.0, padding=[24.0, 24.0, 24.0, 24.0], fill_color="#FFFFFF",
                         stroke_color="#E7E5E4", corner_radius=12.0, tx=0.0, ty=0.0)
    l_children = nodes[str(left_id)]["children"]

    gp_title = make_text(left_id, "gp_title", "Pembayaran Instan GoPay", font_size=18, font_style="Bold", color="#00AA13", tx=24.0, ty=24.0)
    gp_sub = make_text(left_id, "gp_sub", "Nominal Pembayaran: Rp 129.000 (Nomor Pesanan: IKAPI-DEMO-0001)", font_size=14, font_style="Medium", color="#1C1917", tx=24.0, ty=54.0)
    btn_gopay = make_button(left_id, "Buka Aplikasi GoPay (Deep-link)", style="primary", width=320.0, height=44.0, target_dest=ID_STAT_PAID, tx=24.0, ty=90.0)
    gp_note = make_text(left_id, "gp_note", "Jika membuka dari komputer desktop, Anda akan diarahkan ke QR Code GoPay untuk dipindai melalui ponsel.", font_size=12, font_style="Regular", color="#78716C", tx=24.0, ty=150.0)
    l_children.extend([gp_title, gp_sub, btn_gopay, gp_note])
    cols_children.append(left_id)

    right_id = make_frame(cols_id, "Right Column / Simulation", width=428.0, height=300.0, mode="vertical",
                          gap=16.0, padding=[24.0, 24.0, 24.0, 24.0], fill_color="#FFFFFF",
                          stroke_color="#E7E5E4", corner_radius=12.0, tx=852.0, ty=0.0)
    r_children = nodes[str(right_id)]["children"]
    b_paid = make_button(right_id, "Simulasi Bayar Berhasil (Midtrans)", style="success", width=380.0, height=44.0, target_dest=ID_STAT_PAID, tx=24.0, ty=24.0)
    b_canc = make_button(right_id, "Batalkan Pesanan", style="danger", width=380.0, height=38.0, target_dest=ID_STAT_CANC, tx=24.0, ty=80.0)
    r_children.extend([b_paid, b_canc])
    cols_children.append(right_id)

    b_children.append(cols_id)
    f_children.append(body_id)

    ftr = clone_subtree(1989, fid, 0.0, 860.0)
    f_children.append(ftr)
    return fid

# ==============================================================================
# FRAME 10: F06 / Payment Instructions / Mobile (QRIS) (UC-12, UC-13)
# ==============================================================================
def build_frame_10():
    fid = create_mobile_frame(ID_INST_MOB, "F06 / Payment Instructions / Mobile (QRIS)", 1000.0, 1500.0, 4320.0)
    f_children = nodes[str(fid)]["children"]

    hdr = clone_subtree(1639, fid, 0.0, 0.0)
    f_children.append(hdr)

    body_id = make_frame(fid, "Mobile Body", width=390.0, height=862.0, mode="vertical",
                         gap=14.0, padding=[20.0, 16.0, 24.0, 16.0], fill_color="#F6F5F4", tx=0.0, ty=56.0)
    b_children = nodes[str(body_id)]["children"]

    t1 = make_text(body_id, "h1", "Instruksi Pembayaran QRIS", font_size=18, font_style="Bold", color="#1C1917", tx=16.0, ty=20.0)
    b_children.append(t1)

    # QR Card Mobile
    q_card = make_frame(body_id, "QR Card Mobile", width=358.0, height=360.0, mode="vertical",
                        gap=10.0, padding=[16.0, 16.0, 16.0, 16.0], fill_color="#FFFFFF",
                        stroke_color="#E7E5E4", corner_radius=8.0, cross_align="center", tx=16.0, ty=54.0)
    qc_children = nodes[str(q_card)]["children"]

    q_logo = make_text(q_card, "q_logo", "QRIS • Rp 129.000", font_size=14, font_style="Bold", color="#DC2626", tx=110.0, ty=16.0)
    qr_box = make_frame(q_card, "QR Graphic", width=180.0, height=180.0, fill_color="#000000", corner_radius=6.0, cross_align="center", tx=89.0, ty=46.0)
    qr_inner = make_frame(qr_box, "inner", width=160.0, height=160.0, fill_color="#FFFFFF", corner_radius=4.0, cross_align="center", tx=10.0, ty=10.0)
    qr_txt = make_text(qr_inner, "qr_sim", "SCAN QRIS\nRp 129.000", font_size=13, font_style="Bold", color="#1C1917", align="center", tx=30.0, ty=55.0)
    nodes[str(qr_inner)]["children"].append(qr_txt)
    nodes[str(qr_box)]["children"].append(qr_inner)

    t_count = make_text(q_card, "t_count", "Sisa Waktu QR: 14:52", font_size=13, font_style="Bold", color="#DC2626", tx=115.0, ty=240.0)
    btn_dl = make_button(q_card, "Unduh QR Code", style="secondary", width=180.0, height=36.0, tx=89.0, ty=270.0)
    qc_children.extend([q_logo, qr_box, t_count, btn_dl])
    b_children.append(q_card)

    btn_paid = make_button(body_id, "Simulasi Bayar Berhasil (Midtrans)", style="success", width=358.0, height=44.0, target_dest=ID_STAT_PAID, tx=16.0, ty=430.0)
    btn_canc = make_button(body_id, "Batalkan Pesanan", style="danger", width=358.0, height=38.0, target_dest=ID_STAT_CANC, tx=16.0, ty=484.0)
    b_children.extend([btn_paid, btn_canc])

    f_children.append(body_id)
    ftr = clone_subtree(1689, fid, 0.0, 918.0)
    f_children.append(ftr)
    return fid

# ==============================================================================
# FRAME 11: F06 / Payment Status / Pending (UC-15)
# ==============================================================================
def build_frame_11():
    fid = create_desktop_frame(ID_STAT_PEND, "F06 / Payment Status / Pending", 780.0, 0.0, 5380.0)
    f_children = nodes[str(fid)]["children"]

    hdr = clone_subtree(1960, fid, 0.0, 0.0)
    f_children.append(hdr)

    body_id = make_frame(fid, "Pending Body", width=1440.0, height=608.0, mode="vertical",
                         gap=24.0, padding=[60.0, 80.0, 60.0, 80.0], fill_color="#F6F5F4",
                         cross_align="center", main_align="center", tx=0.0, ty=72.0)
    b_children = nodes[str(body_id)]["children"]

    card_id = make_frame(body_id, "Status Card Pending", width=640.0, height=360.0, mode="vertical",
                         gap=16.0, padding=[36.0, 36.0, 36.0, 36.0], fill_color="#FFFFFF",
                         stroke_color="#E7E5E4", corner_radius=12.0, tx=400.0, ty=124.0)
    c_children = nodes[str(card_id)]["children"]

    b1 = make_badge(card_id, "Menunggu Pembayaran", "warning", tx=36.0, ty=36.0)
    h1 = make_text(card_id, "h1", "Menunggu Konfirmasi Pembayaran", font_size=22, font_style="Bold", color="#1C1917", tx=36.0, ty=72.0)
    sub = make_text(card_id, "sub", "Kami sedang menunggu konfirmasi pembayaran dari Midtrans untuk pesanan IKAPI-DEMO-0001 (Rp 129.000). Halaman ini akan otomatis diperbarui.", font_size=14, font_style="Regular", color="#78716C", sizing_h="fill", width=568.0, height=36.0, tx=36.0, ty=106.0)
    t_rem = make_text(card_id, "t_rem", "Sisa waktu pembayaran: 23:45:00", font_size=14, font_style="Bold", color="#D97706", tx=36.0, ty=156.0)
    c_children.extend([b1, h1, sub, t_rem])

    act_f = make_frame(card_id, "act_f", width=568.0, height=44.0, mode="horizontal", gap=12.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#FFFFFF", tx=36.0, ty=196.0)
    b_sim = make_button(act_f, "Simulasi Bayar Berhasil", style="success", width=220.0, height=44.0, target_dest=ID_STAT_PAID, tx=0.0, ty=0.0)
    b_back = make_button(act_f, "Kembali ke Instruksi", style="secondary", width=180.0, height=44.0, target_dest=ID_INST_VA, tx=232.0, ty=0.0)
    nodes[str(act_f)]["children"].extend([b_sim, b_back])
    c_children.append(act_f)

    b_children.append(card_id)
    f_children.append(body_id)

    ftr = clone_subtree(1989, fid, 0.0, 680.0)
    f_children.append(ftr)
    return fid

# ==============================================================================
# FRAME 12: F06 / Payment Status / Paid (Lunas) (UC-13, UC-15)
# ==============================================================================
def build_frame_12():
    fid = create_desktop_frame(ID_STAT_PAID, "F06 / Payment Status / Paid (Lunas)", 860.0, 1500.0, 5380.0)
    f_children = nodes[str(fid)]["children"]

    hdr = clone_subtree(1960, fid, 0.0, 0.0)
    f_children.append(hdr)

    body_id = make_frame(fid, "Paid Body", width=1440.0, height=688.0, mode="vertical",
                         gap=24.0, padding=[50.0, 80.0, 50.0, 80.0], fill_color="#F6F5F4",
                         cross_align="center", main_align="center", tx=0.0, ty=72.0)
    b_children = nodes[str(body_id)]["children"]

    card_id = make_frame(body_id, "Receipt Card", width=680.0, height=520.0, mode="vertical",
                         gap=16.0, padding=[36.0, 36.0, 36.0, 36.0], fill_color="#FFFFFF",
                         stroke_color="#E7E5E4", corner_radius=12.0, tx=380.0, ty=84.0)
    c_children = nodes[str(card_id)]["children"]

    # Success Badge
    b1 = make_badge(card_id, "Lunas", "success", tx=36.0, ty=36.0)
    # Exact scenario_text.txt heading copy!
    h1 = make_text(card_id, "h1", "Pembayaran Berhasil, Buku Telah Ditambahkan ke Koleksi Anda",
                   font_size=20, font_style="Bold", color="#1C1917", sizing_h="fill", width=608.0, height=26.0, tx=36.0, ty=72.0)
    c_children.extend([b1, h1])

    # Receipt Info Box
    rc_box = make_frame(card_id, "rc_box", width=608.0, height=170.0, mode="vertical",
                        gap=8.0, padding=[16.0, 16.0, 16.0, 16.0], fill_color="#F9FAFB",
                        stroke_color="#E5E7EB", corner_radius=8.0, tx=36.0, ty=114.0)
    rc_b_children = nodes[str(rc_box)]["children"]
    cur_y = 16.0
    for l, v in [
        ("ID Transaksi Midtrans", "TRX-IKAPI-2026-0001"),
        ("Nomor Pesanan", "IKAPI-DEMO-0001"),
        ("Waktu Pembayaran", "05 November 2026, 14:32 WIB"),
        ("Metode Pembayaran", "BCA Virtual Account (Otomatis)"),
        ("Total Pembayaran", "Rp 129.000 (Lunas)")
    ]:
        row = make_frame(rc_box, f"r_{l}", width=576.0, height=18.0, mode="horizontal", gap=0.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F9FAFB", main_align="spaceBetween", cross_align="center", tx=16.0, ty=cur_y)
        t_l = make_text(row, "l", l, font_size=12, font_style="Regular", color="#78716C", tx=0.0, ty=0.0)
        t_v = make_text(row, "v", v, font_size=12, font_style="Medium", color="#1C1917", tx=300.0, ty=0.0)
        nodes[str(row)]["children"].extend([t_l, t_v])
        rc_b_children.append(row)
        cur_y += 26.0
    c_children.append(rc_box)

    # Purchased books mini list
    items_t = make_text(card_id, "items_t", "2 E-Book Siap Dibaca: Pride and Prejudice (2 eks) & Frankenstein (1 eks)", font_size=13, font_style="Semi Bold", color="#059669", tx=36.0, ty=300.0)
    c_children.append(items_t)

    # Action buttons
    act_f = make_frame(card_id, "act_f", width=608.0, height=44.0, mode="horizontal", gap=12.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#FFFFFF", tx=36.0, ty=336.0)
    # Primary CTA
    b_read = make_button(act_f, "Buka Koleksi Buku Saya", style="primary", width=220.0, height=44.0, tx=0.0, ty=0.0)
    # Secondary CTA
    b_inv = make_button(act_f, "Unduh Bukti Transaksi", style="secondary", width=190.0, height=44.0, tx=232.0, ty=0.0)
    nodes[str(act_f)]["children"].extend([b_read, b_inv])
    c_children.append(act_f)

    b_children.append(card_id)
    f_children.append(body_id)

    ftr = clone_subtree(1989, fid, 0.0, 760.0)
    f_children.append(ftr)
    return fid

# ==============================================================================
# FRAME 13: F06 / Payment Status / Cancelled (UC-14, UC-15)
# ==============================================================================
def build_frame_13():
    fid = create_desktop_frame(ID_STAT_CANC, "F06 / Payment Status / Cancelled (Dibatalkan)", 780.0, 0.0, 6340.0)
    f_children = nodes[str(fid)]["children"]

    hdr = clone_subtree(1960, fid, 0.0, 0.0)
    f_children.append(hdr)

    body_id = make_frame(fid, "Cancelled Body", width=1440.0, height=608.0, mode="vertical",
                         gap=24.0, padding=[60.0, 80.0, 60.0, 80.0], fill_color="#F6F5F4",
                         cross_align="center", main_align="center", tx=0.0, ty=72.0)
    b_children = nodes[str(body_id)]["children"]

    card_id = make_frame(body_id, "Status Card Cancelled", width=640.0, height=320.0, mode="vertical",
                         gap=16.0, padding=[36.0, 36.0, 36.0, 36.0], fill_color="#FFFFFF",
                         stroke_color="#E7E5E4", corner_radius=12.0, tx=400.0, ty=144.0)
    c_children = nodes[str(card_id)]["children"]

    b1 = make_badge(card_id, "Dibatalkan", "neutral", tx=36.0, ty=36.0)
    h1 = make_text(card_id, "h1", "Pesanan Dibatalkan", font_size=22, font_style="Bold", color="#1C1917", tx=36.0, ty=72.0)
    sub = make_text(card_id, "sub", "Pesanan IKAPI-DEMO-0001 telah dibatalkan atas permintaan pembeli. Tagihan pembayaran telah dinonaktifkan dan tidak ada dana yang dipotong.", font_size=14, font_style="Regular", color="#78716C", sizing_h="fill", width=568.0, height=36.0, tx=36.0, ty=106.0)
    c_children.extend([b1, h1, sub])

    act_f = make_frame(card_id, "act_f", width=568.0, height=44.0, mode="horizontal", gap=12.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#FFFFFF", tx=36.0, ty=164.0)
    b_reorder = make_button(act_f, "Pesan Ulang Buku Ini", style="primary", width=200.0, height=44.0, target_dest=ID_SUM_DESK, tx=0.0, ty=0.0)
    b_cat = make_button(act_f, "Kembali ke Katalog Buku", style="secondary", width=200.0, height=44.0, tx=212.0, ty=0.0)
    nodes[str(act_f)]["children"].extend([b_reorder, b_cat])
    c_children.append(act_f)

    b_children.append(card_id)
    f_children.append(body_id)

    ftr = clone_subtree(1989, fid, 0.0, 680.0)
    f_children.append(ftr)
    return fid

# ==============================================================================
# FRAME 14: F06 / Payment Status / Expired (UC-14, UC-15)
# ==============================================================================
def build_frame_14():
    fid = create_desktop_frame(ID_STAT_EXPR, "F06 / Payment Status / Expired (Kedaluwarsa)", 780.0, 1500.0, 6340.0)
    f_children = nodes[str(fid)]["children"]

    hdr = clone_subtree(1960, fid, 0.0, 0.0)
    f_children.append(hdr)

    body_id = make_frame(fid, "Expired Body", width=1440.0, height=608.0, mode="vertical",
                         gap=24.0, padding=[60.0, 80.0, 60.0, 80.0], fill_color="#F6F5F4",
                         cross_align="center", main_align="center", tx=0.0, ty=72.0)
    b_children = nodes[str(body_id)]["children"]

    card_id = make_frame(body_id, "Status Card Expired", width=640.0, height=320.0, mode="vertical",
                         gap=16.0, padding=[36.0, 36.0, 36.0, 36.0], fill_color="#FFFFFF",
                         stroke_color="#E7E5E4", corner_radius=12.0, tx=400.0, ty=144.0)
    c_children = nodes[str(card_id)]["children"]

    b1 = make_badge(card_id, "Kedaluwarsa", "danger", tx=36.0, ty=36.0)
    h1 = make_text(card_id, "h1", "Batas Waktu Pembayaran Berakhir", font_size=22, font_style="Bold", color="#1C1917", tx=36.0, ty=72.0)
    sub = make_text(card_id, "sub", "Batas waktu 24 jam untuk pesanan IKAPI-DEMO-0001 telah berakhir. Tagihan pembayaran otomatis dibatalkan oleh sistem. Anda dapat membuat pesanan baru.", font_size=14, font_style="Regular", color="#78716C", sizing_h="fill", width=568.0, height=36.0, tx=36.0, ty=106.0)
    c_children.extend([b1, h1, sub])

    act_f = make_frame(card_id, "act_f", width=568.0, height=44.0, mode="horizontal", gap=12.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#FFFFFF", tx=36.0, ty=164.0)
    b_new = make_button(act_f, "Buat Pesanan Baru", style="primary", width=200.0, height=44.0, target_dest=ID_SUM_DESK, tx=0.0, ty=0.0)
    b_cat = make_button(act_f, "Kembali ke Katalog Buku", style="secondary", width=200.0, height=44.0, tx=212.0, ty=0.0)
    nodes[str(act_f)]["children"].extend([b_new, b_cat])
    c_children.append(act_f)

    b_children.append(card_id)
    f_children.append(body_id)

    ftr = clone_subtree(1989, fid, 0.0, 680.0)
    f_children.append(ftr)
    return fid

# ==============================================================================
# FRAME 15: F06 / Reminder / One-Hour Reminder (UC-14 Alt 4)
# ==============================================================================
def build_frame_15():
    fid = create_desktop_frame(ID_REMINDER, "F06 / Reminder / One-Hour Reminder", 880.0, 0.0, 7220.0)
    f_children = nodes[str(fid)]["children"]

    hdr = clone_subtree(1960, fid, 0.0, 0.0)
    f_children.append(hdr)

    body_id = make_frame(fid, "Reminder Body", width=1440.0, height=708.0, mode="vertical",
                         gap=24.0, padding=[32.0, 80.0, 48.0, 80.0], fill_color="#F6F5F4", tx=0.0, ty=72.0)
    b_children = nodes[str(body_id)]["children"]

    # UC-14 Alt 4: One-Hour Urgent Reminder Banner!
    banner = make_alert_banner(body_id, "Pengingat: Pembayaran pesanan IKAPI-DEMO-0001 akan berakhir dalam 1 jam (Pukul 14:30 WIB). Segera selesaikan pembayaran untuk mengamankan buku Anda.",
                               alert_type="danger", width=1280.0, tx=80.0, ty=32.0)
    b_children.append(banner)

    tb = make_desktop_title_block(body_id, "← Kembali ke Ringkasan", "Segera Selesaikan Pembayaran Anda",
                                   "Pesanan IKAPI-DEMO-0001 tinggal memiliki waktu tersisa kurang dari 60 menit.",
                                   bc_dest=ID_SUM_DESK, tx=80.0, ty=96.0, title_color="#DC2626")
    b_children.append(tb)

    cols_id = make_frame(body_id, "Two Columns", width=1280.0, height=530.0, mode="horizontal",
                         gap=32.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F6F5F4", tx=80.0, ty=196.0)
    cols_children = nodes[str(cols_id)]["children"]

    left_id = make_frame(cols_id, "Left Column", width=820.0, height=500.0, mode="vertical",
                         gap=20.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F6F5F4", tx=0.0, ty=0.0)
    left_children = nodes[str(left_id)]["children"]

    # Red Urgent Timer Card
    t_card = make_frame(left_id, "Urgent Timer Card", width=820.0, height=160.0, mode="vertical",
                        gap=12.0, padding=[24.0, 24.0, 24.0, 24.0], fill_color="#FEF2F2",
                        stroke_color="#FECACA", corner_radius=12.0, tx=0.0, ty=0.0)
    tc_children = nodes[str(t_card)]["children"]
    t_lbl = make_text(t_card, "t_lbl", "PERINGATAN BATAS WAKTU TERSISA:", font_size=13, font_style="Bold", color="#DC2626", tx=24.0, ty=24.0)
    t_val = make_text(t_card, "t_val", "00 : 58 : 30", font_size=32, font_style="Bold", color="#DC2626", tx=24.0, ty=48.0)
    t_sub = make_text(t_card, "t_sub", "Pesanan Anda akan dibatalkan otomatis pada 14:30 WIB jika pembayaran belum diselesaikan.", font_size=13, font_style="Medium", color="#991B1B", tx=24.0, ty=104.0)
    tc_children.extend([t_lbl, t_val, t_sub])
    left_children.append(t_card)

    # Method card quick action
    q_act = make_frame(left_id, "Quick Action VA", width=820.0, height=180.0, mode="vertical",
                       gap=12.0, padding=[24.0, 24.0, 24.0, 24.0], fill_color="#FFFFFF",
                       stroke_color="#E7E5E4", corner_radius=12.0, tx=0.0, ty=180.0)
    qa_children = nodes[str(q_act)]["children"]
    qa_h = make_text(q_act, "qa_h", "BCA Virtual Account: 88012 0812 3456 7890", font_size=16, font_style="Bold", color="#1C1917", tx=24.0, ty=24.0)
    qa_m = make_text(q_act, "qa_m", "Total Tagihan: Rp 129.000", font_size=15, font_style="Semi Bold", color="#0075DE", tx=24.0, ty=54.0)
    btn_now = make_button(q_act, "Bayar Sekarang (Buka Instruksi)", style="primary", width=260.0, height=44.0, target_dest=ID_INST_VA, tx=24.0, ty=88.0)
    qa_children.extend([qa_h, qa_m, btn_now])
    left_children.append(q_act)

    cols_children.append(left_id)

    right_id = make_frame(cols_id, "Right Column", width=428.0, height=360.0, mode="vertical",
                          gap=16.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F6F5F4", tx=852.0, ty=0.0)
    r_children = nodes[str(right_id)]["children"]
    sc = make_price_summary_card(right_id, width=428.0, subtotal="Rp 129.000", fee="Gratis", total="Rp 129.000", order_id="IKAPI-DEMO-0001", tx=0.0, ty=0.0)
    r_children.append(sc)
    cols_children.append(right_id)

    b_children.append(cols_id)
    f_children.append(body_id)

    ftr = clone_subtree(1989, fid, 0.0, 780.0)
    f_children.append(ftr)
    return fid

print("Building all 15 frames...")
build_frame_1()
build_frame_2()
build_frame_3()
build_frame_4()
build_frame_5()
build_frame_6()
build_frame_7()
build_frame_8()
build_frame_9()
build_frame_10()
build_frame_11()
build_frame_12()
build_frame_13()
build_frame_14()
build_frame_15()

# Update page 2100 children list
page_children = [2021, 2022,
                 ID_SUM_DESK, ID_SUM_MOB,
                 ID_METH_DEF, ID_METH_MOB,
                 ID_METH_SEL, ID_METH_ERR,
                 ID_INST_VA, ID_INST_QRIS,
                 ID_INST_EWAL, ID_INST_MOB,
                 ID_STAT_PEND, ID_STAT_PAID,
                 ID_STAT_CANC, ID_STAT_EXPR,
                 ID_REMINDER]
nodes["2100"]["children"] = page_children

# Flows definition on page 2100
page_flows = [
    {"name": "F06 — Digital Payment Flow (Desktop)", "start": ID_SUM_DESK, "description": "Alur lengkap UC-12 hingga UC-15 desktop"},
    {"name": "F06 — Digital Payment Flow (Mobile)", "start": ID_SUM_MOB, "description": "Alur mobile pembayaran digital"}
]
nodes["2100"]["flows"] = page_flows

# Ensure clean serde serialization without nulls
for k, v in list(nodes.items()):
    if isinstance(v, dict):
        for sub_k in list(v.keys()):
            if v[sub_k] is None:
                del v[sub_k]

# Save updated document.json into DST_PATH
temp_zip = DST_PATH + ".tmp"
with zipfile.ZipFile(SRC_PATH, "r") as zin:
    with zipfile.ZipFile(temp_zip, "w", compression=zipfile.ZIP_DEFLATED) as zout:
        for item in zin.infolist():
            if item.filename != "document.json":
                zout.writestr(item, zin.read(item.filename))
        zout.writestr("document.json", json.dumps(doc).encode("utf-8"))

os.replace(temp_zip, DST_PATH)
print("Finished building F06 document successfully! All 15 frames generated.")
