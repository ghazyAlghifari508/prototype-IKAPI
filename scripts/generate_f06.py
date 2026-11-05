import zipfile
import json
import os

DOC_PATH = "docs/design/ikapi-marketplace-f06-digital-payment.figcraft"

def run():
    with zipfile.ZipFile(DOC_PATH, 'r') as z:
        doc = json.loads(z.read('document.json'))
        # keep image files and thumbnail
        image_files = {name: z.read(name) for name in z.namelist() if name != 'document.json'}

    nodes = doc['nodes']
    next_id = doc['next_id']

    def alloc_id():
        nonlocal next_id
        tid = next_id
        next_id += 1
        return tid

    def color_fill(hex_str, opacity=1.0):
        hex_str = hex_str.lstrip('#')
        r = int(hex_str[0:2], 16) / 255.0
        g = int(hex_str[2:4], 16) / 255.0
        b = int(hex_str[4:6], 16) / 255.0
        return [{'type': 'solid', 'color': {'r': r, 'g': g, 'b': b, 'a': 1.0}, 'opacity': opacity, 'visible': True, 'blend': 'normal'}]

    def stroke_line(hex_str, opacity=1.0):
        hex_str = hex_str.lstrip('#')
        r = int(hex_str[0:2], 16) / 255.0
        g = int(hex_str[2:4], 16) / 255.0
        b = int(hex_str[4:6], 16) / 255.0
        return [{'type': 'solid', 'color': {'r': r, 'g': g, 'b': b, 'a': 1.0}, 'opacity': opacity, 'visible': True, 'blend': 'normal'}]

    def corners(r):
        return {'radii': [float(r)] * 4, 'smoothing': 0.0}

    def layout_box(mode='vertical', gap=16.0, padding=(24.0, 24.0, 24.0, 24.0), main_align='min', cross_align='min', wrap=False):
        return {
            'mode': mode,
            'wrap': wrap,
            'gap': float(gap),
            'cross_gap': 10.0,
            'padding': [float(p) for p in padding],
            'main_align': main_align,
            'cross_align': cross_align,
            'content_align': 'auto',
            'grid_columns': 2,
            'grid_rows': 2,
            'column_tracks': [],
            'row_tracks': [],
            'strokes_included': True,
            'reverse_z': False
        }

    def child_layout(sizing_h='fill', sizing_v='hug', absolute=False):
        return {
            'sizing_h': sizing_h,
            'sizing_v': sizing_v,
            'absolute': absolute,
            'min_w': None,
            'max_w': None,
            'min_h': None,
            'max_h': None,
            'grid_column': None,
            'grid_row': None,
            'grid_column_span': 0,
            'grid_row_span': 0
        }

    def add_text(parent_id, name, characters, font_size=14, font_style='Regular', hex_color='#1C1917', sizing_h='fill', sizing_v='hug', width=100.0, height=20.0, align='left'):
        tid = alloc_id()
        node = {
            'id': tid,
            'name': name,
            'type': 'text',
            'characters': characters,
            'style': {
                'font_family': 'Inter',
                'font_style': font_style,
                'font_size': float(font_size),
                'line_height': {'unit': 'auto'},
                'letter_spacing': {'unit': 'percent', 'value': 0.0},
                'decoration': 'none',
                'case': 'original'
            },
            'auto_resize': 'widthAndHeight' if sizing_h == 'hug' else 'height',
            'parent': parent_id,
            'blend': 'normal',
            'transform': [1.0, 0.0, 0.0, 1.0, 0.0, 0.0],
            'width': float(width),
            'height': float(height),
            'fills': color_fill(hex_color),
            'child_layout': child_layout(sizing_h=sizing_h, sizing_v=sizing_v)
        }
        nodes[str(tid)] = {k: v for k, v in node.items() if v is not None}
        return tid

    def add_rect(parent_id, name, width, height, hex_fill='#E7E5E4', radius=0.0, image_hash=None, sizing_h='fixed', sizing_v='fixed'):
        tid = alloc_id()
        fills = color_fill(hex_fill)
        if image_hash:
            fills.append({
                'type': 'image',
                'image': image_hash,
                'scale_mode': 'fill',
                'scale': 1.0,
                'rotation': 0,
                'crop': None,
                'filters': {'exposure': 0.0, 'contrast': 0.0, 'saturation': 0.0, 'temperature': 0.0, 'tint': 0.0, 'highlights': 0.0, 'shadows': 0.0},
                'opacity': 1.0,
                'visible': True,
                'blend': 'normal'
            })
        node = {
            'id': tid,
            'name': name,
            'type': 'rectangle',
            'parent': parent_id,
            'blend': 'normal',
            'transform': [1.0, 0.0, 0.0, 1.0, 0.0, 0.0],
            'width': float(width),
            'height': float(height),
            'fills': fills,
            'corners': corners(radius) if radius > 0 else None,
            'child_layout': child_layout(sizing_h=sizing_h, sizing_v=sizing_v)
        }
        nodes[str(tid)] = {k: v for k, v in node.items() if v is not None}
        return tid

    def add_frame(parent_id, name, width=100.0, height=100.0, hex_fill='#FFFFFF', stroke_hex=None, radius=0.0, layout=None, sizing_h='fill', sizing_v='hug', interactions=None):
        tid = alloc_id()
        node = {
            'id': tid,
            'name': name,
            'type': 'frame',
            'parent': parent_id,
            'children': [],
            'transform': [1.0, 0.0, 0.0, 1.0, 0.0, 0.0],
            'width': float(width),
            'height': float(height),
            'fills': color_fill(hex_fill) if hex_fill else [],
            'strokes': stroke_line(stroke_hex) if stroke_hex else None,
            'corners': corners(radius) if radius > 0 else None,
            'layout': layout,
            'child_layout': child_layout(sizing_h=sizing_h, sizing_v=sizing_v),
            'clip': True
        }
        if interactions:
            node['interactions'] = interactions
        nodes[str(tid)] = {k: v for k, v in node.items() if v is not None}
        return tid

    # Reusable Component Builders
    def build_header_desktop(parent_id):
        header_id = add_frame(parent_id, "Header / F06", 1440, 72, '#FFFFFF', stroke_hex='#E7E5E4',
                              layout=layout_box('horizontal', gap=0, padding=(16, 80, 16, 80), main_align='spaceBetween', cross_align='center'),
                              sizing_h='fill', sizing_v='fixed')

        # Left brand
        brand_id = add_frame(header_id, "Brand Group", 260, 32, None, layout=layout_box('horizontal', gap=10, padding=(0,0,0,0), main_align='min', cross_align='center'), sizing_h='hug', sizing_v='hug')
        t1 = add_text(brand_id, "logo_text", "IKAPI JAWA BARAT", 18, 'Bold', '#1C1917', sizing_h='hug')
        tag_id = add_frame(brand_id, "Tag", 50, 18, '#F5F5F4', radius=4, layout=layout_box('horizontal', gap=0, padding=(2,6,2,6), main_align='center', cross_align='center'), sizing_h='hug', sizing_v='hug')
        t2 = add_text(tag_id, "tag_text", "E-BOOK", 10, 'Bold', '#78716C', sizing_h='hug')
        nodes[str(tag_id)]['children'] = [t2]
        nodes[str(brand_id)]['children'] = [t1, tag_id]

        # Middle nav
        nav_id = add_frame(header_id, "Nav Links", 440, 20, None, layout=layout_box('horizontal', gap=32, padding=(0,0,0,0), main_align='min', cross_align='center'), sizing_h='hug', sizing_v='hug')
        n1 = add_text(nav_id, "nav_home", "Beranda", 14, 'Regular', '#78716C', sizing_h='hug')
        n2 = add_text(nav_id, "nav_cat", "Katalog Buku", 14, 'Regular', '#78716C', sizing_h='hug')
        n3 = add_text(nav_id, "nav_pub", "Penerbit Anggota", 14, 'Regular', '#78716C', sizing_h='hug')
        n4 = add_text(nav_id, "nav_abt", "Tentang Kami", 14, 'Regular', '#78716C', sizing_h='hug')
        nodes[str(nav_id)]['children'] = [n1, n2, n3, n4]

        # Right actions
        act_id = add_frame(header_id, "Nav Actions", 240, 32, None, layout=layout_box('horizontal', gap=16, padding=(0,0,0,0), main_align='min', cross_align='center'), sizing_h='hug', sizing_v='hug')
        cart_badge = add_frame(act_id, "Cart Nav", 90, 30, '#FFFFFF', stroke_hex='#E7E5E4', radius=4, layout=layout_box('horizontal', gap=6, padding=(6,10,6,10), main_align='center', cross_align='center'), sizing_h='hug', sizing_v='hug')
        cb_txt = add_text(cart_badge, "cart_txt", "🛒 Keranjang (0)", 13, 'Regular', '#1C1917', sizing_h='hug')
        nodes[str(cart_badge)]['children'] = [cb_txt]

        masuk_btn = add_frame(act_id, "Btn Akun", 110, 32, '#F5F5F4', stroke_hex='#E7E5E4', radius=4, layout=layout_box('horizontal', gap=6, padding=(6,12,6,12), main_align='center', cross_align='center'), sizing_h='hug', sizing_v='hug')
        mb_txt = add_text(masuk_btn, "acc_txt", "👤 Akun Pembeli", 13, 'Semi Bold', '#1C1917', sizing_h='hug')
        nodes[str(masuk_btn)]['children'] = [mb_txt]
        nodes[str(act_id)]['children'] = [cart_badge, masuk_btn]

        nodes[str(header_id)]['children'] = [brand_id, nav_id, act_id]
        return header_id

    def build_header_mobile(parent_id):
        header_id = add_frame(parent_id, "Header / F06 Mobile", 390, 56, '#FFFFFF', stroke_hex='#E7E5E4',
                              layout=layout_box('horizontal', gap=0, padding=(12, 16, 12, 16), main_align='spaceBetween', cross_align='center'),
                              sizing_h='fill', sizing_v='fixed')
        brand_id = add_frame(header_id, "Brand Group Mobile", 180, 24, None, layout=layout_box('horizontal', gap=6, padding=(0,0,0,0), main_align='min', cross_align='center'), sizing_h='hug', sizing_v='hug')
        t1 = add_text(brand_id, "logo_text", "IKAPI JABAR", 16, 'Bold', '#1C1917', sizing_h='hug')
        nodes[str(brand_id)]['children'] = [t1]

        act_id = add_frame(header_id, "Nav Actions Mobile", 120, 28, None, layout=layout_box('horizontal', gap=8, padding=(0,0,0,0), main_align='min', cross_align='center'), sizing_h='hug', sizing_v='hug')
        t2 = add_text(act_id, "cart_icon", "🛒 (0)", 13, 'Regular', '#78716C', sizing_h='hug')
        t3 = add_text(act_id, "menu_icon", "☰", 16, 'Regular', '#1C1917', sizing_h='hug')
        nodes[str(act_id)]['children'] = [t2, t3]
        nodes[str(header_id)]['children'] = [brand_id, act_id]
        return header_id

    def build_footer_desktop(parent_id):
        footer_id = add_frame(parent_id, "Footer / F06", 1440, 90, '#FFFFFF', stroke_hex='#E7E5E4',
                              layout=layout_box('horizontal', gap=0, padding=(32, 80, 32, 80), main_align='spaceBetween', cross_align='center'),
                              sizing_h='fill', sizing_v='fixed')
        t1 = add_text(footer_id, "copy", "IKAPI Jawa Barat © 2026. Hak Cipta Dilindungi.", 13, 'Regular', '#78716C', sizing_h='hug')
        t2 = add_text(footer_id, "motto", "Penerbitan Beretika • Literasi Jawa Barat Bermartabat", 13, 'Regular', '#A8A29E', sizing_h='hug')
        nodes[str(footer_id)]['children'] = [t1, t2]
        return footer_id

    def build_footer_mobile(parent_id):
        footer_id = add_frame(parent_id, "Footer / F06 Mobile", 390, 80, '#FFFFFF', stroke_hex='#E7E5E4',
                              layout=layout_box('vertical', gap=4, padding=(20, 16, 20, 16), main_align='min', cross_align='min'),
                              sizing_h='fill', sizing_v='fixed')
        t1 = add_text(footer_id, "copy", "IKAPI Jawa Barat © 2026.", 12, 'Regular', '#78716C', sizing_h='hug')
        t2 = add_text(footer_id, "motto", "Penerbitan Beretika • Literasi Jawa Barat Bermartabat", 11, 'Regular', '#A8A29E', sizing_h='hug')
        nodes[str(footer_id)]['children'] = [t1, t2]
        return footer_id

    def build_status_badge(parent_id, status_type):
        configs = {
            'pending': ('Menunggu Pembayaran', '#D97706', '#FEF3C7', '#FDE68A'),
            'paid': ('Lunas', '#15803D', '#DCFCE7', '#86EFAC'),
            'cancelled': ('Dibatalkan', '#DC2626', '#FEE2E2', '#FECACA'),
            'expired': ('Kedaluwarsa', '#78716C', '#F5F5F4', '#E7E5E4'),
            'failed': ('Gagal', '#DC2626', '#FEE2E2', '#FECACA')
        }
        label, txt_col, bg_col, bdr_col = configs.get(status_type, ('Status', '#1C1917', '#F5F5F4', '#E7E5E4'))
        badge_id = add_frame(parent_id, f"Status / {label}", 140, 26, bg_col, stroke_hex=bdr_col, radius=13,
                             layout=layout_box('horizontal', gap=6, padding=(4, 12, 4, 12), main_align='center', cross_align='center'),
                             sizing_h='hug', sizing_v='hug')
        dot_id = add_rect(badge_id, "dot", 7, 7, txt_col, radius=4)
        t_id = add_text(badge_id, "lbl", label, 12, 'Semi Bold', txt_col, sizing_h='hug')
        nodes[str(badge_id)]['children'] = [dot_id, t_id]
        return badge_id

    def build_book_row(parent_id, title, meta, price_str, img_hash):
        row_id = add_frame(parent_id, f"Item / {title}", 770, 76, None,
                           layout=layout_box('horizontal', gap=14, padding=(8, 0, 8, 0), main_align='min', cross_align='center'),
                           sizing_h='fill', sizing_v='hug')
        cover_id = add_rect(row_id, "cover", 44, 62, '#F5F5F4', radius=4, image_hash=img_hash)
        info_id = add_frame(row_id, "info", 540, 40, None, layout=layout_box('vertical', gap=4, padding=(0,0,0,0), main_align='center', cross_align='min'), sizing_h='fill', sizing_v='hug')
        t1 = add_text(info_id, "title", title, 14, 'Semi Bold', '#1C1917', sizing_h='fill')
        t2 = add_text(info_id, "meta", meta, 12, 'Regular', '#78716C', sizing_h='fill')
        nodes[str(info_id)]['children'] = [t1, t2]
        pr_id = add_text(row_id, "price", price_str, 14, 'Semi Bold', '#1C1917', sizing_h='hug')
        nodes[str(row_id)]['children'] = [cover_id, info_id, pr_id]
        return row_id

    # Create Page 06
    page_id = 2100
    page_name = "06 — Digital Payment / F06"
    doc['pages'].append(page_id)
    doc['current_page'] = page_id

    page_node = {
        'id': page_id,
        'name': page_name,
        'type': 'page',
        'background': {'r': 0.9607843, 'g': 0.9607843, 'b': 0.9607843, 'a': 1.0},
        'flows': [
            {'name': 'F06 — Digital Payment Flow (Desktop)', 'start': 2200, 'description': 'Alur lengkap UC-12 hingga UC-15'},
            {'name': 'F06 — Digital Payment Flow (Mobile)', 'start': 2300, 'description': 'Alur mobile pembayaran digital'}
        ],
        'prototype': {'device': 'None', 'background': {'r': 0.11764706, 'g': 0.11764706, 'b': 0.11764706, 'a': 1.0}, 'rotation': 'portrait'},
        'children': [],
        'width': 0.0,
        'height': 0.0
    }
    nodes[str(page_id)] = page_node

    # Header canvas title text
    t_title_id = add_text(page_id, 'Title / F06', 'F06 — Digital Payment & Midtrans Simulation', 32, 'Bold', '#1C1917', sizing_h='hug')
    nodes[str(t_title_id)]['transform'] = [1.0, 0.0, 0.0, 1.0, 0.0, 0.0]
    t_sub_id = add_text(page_id, 'Subtitle / F06', 'UC-12 (Pilih Metode), UC-13 (Midtrans), UC-14 (Total & Batas Waktu), UC-15 (Status Pembayaran)', 16, 'Medium', '#78716C', sizing_h='hug')
    nodes[str(t_sub_id)]['transform'] = [1.0, 0.0, 0.0, 1.0, 0.0, 48.0]
    page_node['children'].extend([t_title_id, t_sub_id])

    # Connect F05 (1959) button 1987 to F06 Payment Summary (2200)
    if '1987' in nodes:
        nodes['1987']['interactions'] = [{
            'trigger': {'type': 'onClick'},
            'actions': [{'type': 'navigate', 'dest': 2200}],
            'transition': {'type': 'instant'},
            'duration_ms': 300,
            'easing': 'easeOut'
        }]

    # ==========================================
    # 1. FRAME: F06 / Payment Summary / Desktop
    # ==========================================
    f1_id = 2200
    next_id = max(next_id, 2201)
    f1 = {
        'id': f1_id, 'name': 'F06 / Payment Summary / Desktop', 'type': 'frame', 'parent': page_id, 'children': [],
        'transform': [1.0, 0.0, 0.0, 1.0, 0.0, 100.0], 'width': 1440.0, 'height': 780.0,
        'fills': color_fill('#F6F5F4'), 'layout': layout_box('vertical', gap=0, padding=(0,0,0,0)),
        'child_layout': child_layout('fixed', 'hug'), 'clip': True
    }
    nodes[str(f1_id)] = f1
    page_node['children'].append(f1_id)

    f1_hdr = build_header_desktop(f1_id)
    f1_body = add_frame(f1_id, "Summary Body", 1440, 580, '#F6F5F4', layout=layout_box('vertical', gap=24, padding=(36, 80, 48, 80)), sizing_h='fill', sizing_v='hug')

    # Breadcrumb & Title
    f1_top = add_frame(f1_body, "Title Block", 1280, 50, None, layout=layout_box('vertical', gap=4, padding=(0,0,0,0)), sizing_h='fill', sizing_v='hug')
    bc = add_text(f1_top, "bc", "← Kembali ke Checkout", 13, 'Medium', '#0075DE', sizing_h='hug')
    t_h1 = add_text(f1_top, "h1", "Pembayaran Pesanan", 24, 'Bold', '#1C1917', sizing_h='fill')
    t_sub = add_text(f1_top, "sub", "Periksa rincian pesanan dan selesaikan pembayaran sebelum batas waktu berakhir.", 14, 'Regular', '#78716C', sizing_h='fill')
    nodes[str(f1_top)]['children'] = [bc, t_h1, t_sub]

    # Two columns
    f1_cols = add_frame(f1_body, "Two Columns", 1280, 480, None, layout=layout_box('horizontal', gap=32, padding=(0,0,0,0)), sizing_h='fill', sizing_v='hug')

    # Left Column
    f1_left = add_frame(f1_cols, "Left Column", 820, 460, None, layout=layout_box('vertical', gap=16, padding=(0,0,0,0)), sizing_h='fill', sizing_v='hug')

    # Card 1: Order info & Deadline
    c1 = add_frame(f1_left, "Order Info Card", 820, 160, '#FFFFFF', stroke_hex='#E7E5E4', radius=12, layout=layout_box('vertical', gap=16, padding=(24,24,24,24)), sizing_h='fill', sizing_v='hug')
    c1_top = add_frame(c1, "Top Row", 772, 28, None, layout=layout_box('horizontal', gap=0, padding=(0,0,0,0), main_align='spaceBetween', cross_align='center'), sizing_h='fill', sizing_v='hug')
    c1_ord = add_text(c1_top, "ord_id", "Nomor Pesanan: IKAPI-DEMO-0001", 15, 'Bold', '#1C1917', sizing_h='hug')
    c1_badge = build_status_badge(c1_top, 'pending')
    nodes[str(c1_top)]['children'] = [c1_ord, c1_badge]

    c1_dl = add_frame(c1, "Countdown Banner", 772, 60, '#FFFBEB', stroke_hex='#FDE68A', radius=8, layout=layout_box('horizontal', gap=0, padding=(12,16,12,16), main_align='spaceBetween', cross_align='center'), sizing_h='fill', sizing_v='hug')
    c1_dl_txt = add_frame(c1_dl, "dl_txt", 400, 36, None, layout=layout_box('vertical', gap=2, padding=(0,0,0,0), main_align='center'), sizing_h='hug', sizing_v='hug')
    d1 = add_text(c1_dl_txt, "lbl1", "Batas Waktu Pembayaran (24 Jam)", 13, 'Bold', '#92400E', sizing_h='hug')
    d2 = add_text(c1_dl_txt, "lbl2", "Jatuh tempo: 06 November 2026, 14:30 WIB", 12, 'Regular', '#B45309', sizing_h='hug')
    nodes[str(c1_dl_txt)]['children'] = [d1, d2]

    c1_timer = add_frame(c1_dl, "Timer Box", 140, 36, '#FEF3C7', radius=6, layout=layout_box('horizontal', gap=0, padding=(6,12,6,12), main_align='center', cross_align='center'), sizing_h='hug', sizing_v='hug')
    c1_clock = add_text(c1_timer, "clock", "23 : 59 : 45", 16, 'Bold', '#B45309', sizing_h='hug')
    nodes[str(c1_timer)]['children'] = [c1_clock]
    nodes[str(c1_dl)]['children'] = [c1_dl_txt, c1_timer]
    nodes[str(c1)]['children'] = [c1_top, c1_dl]

    # Card 2: Items
    c2 = add_frame(f1_left, "Items Card", 820, 240, '#FFFFFF', stroke_hex='#E7E5E4', radius=12, layout=layout_box('vertical', gap=12, padding=(24,24,24,24)), sizing_h='fill', sizing_v='hug')
    c2_lbl = add_text(c2, "card_lbl", "Daftar E-Book (2 Judul, 3 Item)", 15, 'Semi Bold', '#1C1917', sizing_h='fill')
    r1 = build_book_row(c2, "Pride and Prejudice", "Jane Austen · Standard Ebooks · 2 eksemplar digital", "Rp 90.000", "7e256dbd59e6051857bcc4499a9471ec97436d757d63d550eacbe648057e12a4")
    sep1 = add_rect(c2, "sep", 772, 1, '#E7E5E4')
    r2 = build_book_row(c2, "Frankenstein", "Mary Shelley · Standard Ebooks · 1 eksemplar digital", "Rp 39.000", "3c7e1e5aa1805e1e8642ee78cfbf4e76de01af156d00a7415763d4d413fcec94")
    nodes[str(c2)]['children'] = [c2_lbl, r1, sep1, r2]
    nodes[str(f1_left)]['children'] = [c1, c2]

    # Right Column
    f1_right = add_frame(f1_cols, "Right Column", 428, 360, '#FFFFFF', stroke_hex='#E7E5E4', radius=12, layout=layout_box('vertical', gap=16, padding=(24,24,24,24)), sizing_h='fixed', sizing_v='hug')
    r_lbl = add_text(f1_right, "r_lbl", "Ringkasan Pembayaran", 16, 'Semi Bold', '#1C1917', sizing_h='fill')

    # Subtotal rows
    st1 = add_frame(f1_right, "Subtotal Row", 380, 20, None, layout=layout_box('horizontal', gap=0, padding=(0,0,0,0), main_align='spaceBetween'), sizing_h='fill', sizing_v='hug')
    s1_l = add_text(st1, "lbl", "Subtotal Buku", 14, 'Regular', '#78716C', sizing_h='hug')
    s1_v = add_text(st1, "val", "Rp 129.000", 14, 'Regular', '#1C1917', sizing_h='hug')
    nodes[str(st1)]['children'] = [s1_l, s1_v]

    st2 = add_frame(f1_right, "Diskon Row", 380, 20, None, layout=layout_box('horizontal', gap=0, padding=(0,0,0,0), main_align='spaceBetween'), sizing_h='fill', sizing_v='hug')
    s2_l = add_text(st2, "lbl", "Potongan Diskon", 14, 'Regular', '#78716C', sizing_h='hug')
    s2_v = add_text(st2, "val", "Rp 0", 14, 'Regular', '#78716C', sizing_h='hug')
    nodes[str(st2)]['children'] = [s2_l, s2_v]

    st3 = add_frame(f1_right, "Biaya Row", 380, 20, None, layout=layout_box('horizontal', gap=0, padding=(0,0,0,0), main_align='spaceBetween'), sizing_h='fill', sizing_v='hug')
    s3_l = add_text(st3, "lbl", "Biaya Layanan", 14, 'Regular', '#78716C', sizing_h='hug')
    s3_v = add_text(st3, "val", "Gratis", 14, 'Semi Bold', '#15803D', sizing_h='hug')
    nodes[str(st3)]['children'] = [s3_l, s3_v]

    sep2 = add_rect(f1_right, "sep", 380, 1, '#E7E5E4')

    tot_row = add_frame(f1_right, "Total Row", 380, 26, None, layout=layout_box('horizontal', gap=0, padding=(0,0,0,0), main_align='spaceBetween', cross_align='center'), sizing_h='fill', sizing_v='hug')
    t_tot_l = add_text(tot_row, "lbl", "Total Pembayaran", 15, 'Semi Bold', '#1C1917', sizing_h='hug')
    t_tot_v = add_text(tot_row, "val", "Rp 129.000", 20, 'Bold', '#0075DE', sizing_h='hug')
    nodes[str(tot_row)]['children'] = [t_tot_l, t_tot_v]

    # Primary Action Button -> connects to Payment Method (2400)
    cta_btn = add_frame(f1_right, "Btn Pilih Metode", 380, 44, '#0075DE', radius=8,
                        layout=layout_box('horizontal', gap=8, padding=(12, 16, 12, 16), main_align='center', cross_align='center'),
                        sizing_h='fill', sizing_v='fixed',
                        interactions=[{
                            'trigger': {'type': 'onClick'},
                            'actions': [{'type': 'navigate', 'dest': 2400}],
                            'transition': {'type': 'instant'},
                            'duration_ms': 300,
                            'easing': 'easeOut'
                        }])
    cta_t = add_text(cta_btn, "cta_txt", "Pilih Metode Pembayaran →", 14, 'Semi Bold', '#FFFFFF', sizing_h='hug')
    nodes[str(cta_btn)]['children'] = [cta_t]

    # Cancel action -> connects to Cancelled state (3100)
    cancel_btn = add_frame(f1_right, "Btn Batal", 380, 24, None,
                           layout=layout_box('horizontal', gap=0, padding=(4, 0, 4, 0), main_align='center', cross_align='center'),
                           sizing_h='fill', sizing_v='hug',
                           interactions=[{
                               'trigger': {'type': 'onClick'},
                               'actions': [{'type': 'navigate', 'dest': 3100}],
                               'transition': {'type': 'instant'},
                               'duration_ms': 300,
                               'easing': 'easeOut'
                           }])
    c_txt = add_text(cancel_btn, "c_txt", "Batalkan Pesanan Ini", 13, 'Medium', '#DC2626', sizing_h='hug')
    nodes[str(cancel_btn)]['children'] = [c_txt]

    sec_note = add_text(f1_right, "sec_note", "🔒 Pembayaran resmi & terenkripsi oleh Midtrans", 11, 'Regular', '#78716C', sizing_h='fill', align='center')

    nodes[str(f1_right)]['children'] = [r_lbl, st1, st2, st3, sep2, tot_row, cta_btn, cancel_btn, sec_note]
    nodes[str(f1_cols)]['children'] = [f1_left, f1_right]
    nodes[str(f1_body)]['children'] = [f1_top, f1_cols]

    f1_ftr = build_footer_desktop(f1_id)
    f1['children'] = [f1_hdr, f1_body, f1_ftr]

    # Save document updates
    doc['next_id'] = next_id
    doc_json_bytes = json.dumps(doc, ensure_ascii=False, indent=None).encode('utf-8')
    with zipfile.ZipFile(DOC_PATH, 'w', compression=zipfile.ZIP_DEFLATED) as z:
        z.writestr('document.json', doc_json_bytes)
        for name, data in image_files.items():
            z.writestr(name, data)
    print("Initial Frame 2200 injected successfully. Next ID:", next_id)

if __name__ == '__main__':
    run()
