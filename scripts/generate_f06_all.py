import json
import zipfile
import os

SRC_PATH = r"docs\design\ikapi-marketplace-f05-cart-checkout.figcraft"
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

    left_f = make_frame(cid, "left_g", width=width - 180.0, height=44.0, mode="horizontal",
                        gap=14.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color=card_bg, cross_align="center", tx=20.0, ty=14.0)
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

    info_f = make_frame(left_f, "info", width=width - 220.0, height=40.0, mode="vertical",
                        gap=2.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color=card_bg, tx=34.0, ty=2.0)
    t1 = make_text(info_f, "t1", title, font_size=14, font_style="Semi Bold" if is_selected else "Medium",
                   color="#1C1917", sizing_h="fill", width=width - 220.0, height=18.0, tx=0.0, ty=0.0)
    t2 = make_text(info_f, "t2", subtitle, font_size=12, font_style="Regular",
                   color="#78716C", sizing_h="fill", width=width - 220.0, height=16.0, tx=0.0, ty=20.0)
    nodes[str(info_f)]["children"].extend([t1, t2])
    l_children.append(info_f)

    c_children.append(left_f)

    fee_t = make_text(cid, "fee", fee_text, font_size=12, font_style="Medium",
                      color="#059669" if fee_text == "Gratis" else "#78716C",
                      sizing_h="hug", width=80.0, height=16.0, align="right", tx=width - 100.0, ty=28.0)
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

# Pre-defined known Frame IDs
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

print("Base definitions ready.")
