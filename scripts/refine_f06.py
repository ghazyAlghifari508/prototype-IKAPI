import re

with open("scripts/build_full_f06.py", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update Frame 1
old_f1 = """    # Title block
    tb_id = make_frame(body_id, "Title Block", width=1280.0, height=54.0, mode="vertical",
                       gap=4.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F6F5F4", tx=80.0, ty=36.0)
    tb_children = nodes[str(tb_id)]["children"]
    bc = make_text(tb_id, "bc", "← Kembali ke Checkout", font_size=13, font_style="Medium", color="#0075DE", tx=0.0, ty=0.0)
    # Breadcrumb click interaction back to F05
    nodes[str(bc)]["interactions"] = [{
        "trigger": {"type": "onClick"},
        "actions": [{"type": "navigate", "dest": 1959}],
        "duration_ms": 300, "easing": "easeOut", "transition": {"type": "instant"}
    }]
    h1 = make_text(tb_id, "h1", "Ringkasan Pembayaran", font_size=24, font_style="Bold", color="#1C1917", tx=0.0, ty=18.0)
    sub = make_text(tb_id, "sub", "Periksa rincian pesanan dan selesaikan pembayaran sebelum batas waktu berakhir.", font_size=14, font_style="Regular", color="#78716C", tx=0.0, ty=44.0)
    tb_children.extend([bc, h1, sub])
    b_children.append(tb_id)

    # Two columns
    cols_id = make_frame(body_id, "Two Columns", width=1280.0, height=550.0, mode="horizontal",
                         gap=32.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F6F5F4", tx=80.0, ty=114.0)"""

new_f1 = """    # Title block
    tb = make_desktop_title_block(body_id, "← Kembali ke Checkout", "Ringkasan Pembayaran",
                                  "Periksa rincian pesanan dan selesaikan pembayaran sebelum batas waktu berakhir.",
                                  bc_dest=1959, tx=80.0, ty=36.0)
    b_children.append(tb)

    # Two columns
    cols_id = make_frame(body_id, "Two Columns", width=1280.0, height=550.0, mode="horizontal",
                         gap=32.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F6F5F4", tx=80.0, ty=136.0)"""

content = content.replace(old_f1, new_f1)

# 2. Update Frame 3
old_f3 = """    tb_id = make_frame(body_id, "Title Block", width=1280.0, height=54.0, mode="vertical",
                       gap=4.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F6F5F4", tx=80.0, ty=36.0)
    tb_children = nodes[str(tb_id)]["children"]
    bc = make_text(tb_id, "bc", "← Kembali ke Ringkasan", font_size=13, font_style="Medium", color="#0075DE", tx=0.0, ty=0.0)
    nodes[str(bc)]["interactions"] = [{"trigger": {"type": "onClick"}, "actions": [{"type": "navigate", "dest": ID_SUM_DESK}], "duration_ms": 300, "easing": "easeOut", "transition": {"type": "instant"}}]
    h1 = make_text(tb_id, "h1", "Pilih Metode Pembayaran", font_size=24, font_style="Bold", color="#1C1917", tx=0.0, ty=18.0)
    sub = make_text(tb_id, "sub", "Pilih salah satu metode pembayaran digital melalui Midtrans untuk pesanan IKAPI-DEMO-0001.", font_size=14, font_style="Regular", color="#78716C", tx=0.0, ty=44.0)
    tb_children.extend([bc, h1, sub])
    b_children.append(tb_id)

    cols_id = make_frame(body_id, "Two Columns", width=1280.0, height=670.0, mode="horizontal",
                         gap=32.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F6F5F4", tx=80.0, ty=114.0)"""

new_f3 = """    tb = make_desktop_title_block(body_id, "← Kembali ke Ringkasan", "Pilih Metode Pembayaran",
                                  "Pilih salah satu metode pembayaran digital melalui Midtrans untuk pesanan IKAPI-DEMO-0001.",
                                  bc_dest=ID_SUM_DESK, tx=80.0, ty=36.0)
    b_children.append(tb)

    cols_id = make_frame(body_id, "Two Columns", width=1280.0, height=670.0, mode="horizontal",
                         gap=32.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F6F5F4", tx=80.0, ty=136.0)"""

content = content.replace(old_f3, new_f3)

# 3. Update Frame 5
old_f5 = """    tb_id = make_frame(body_id, "Title Block", width=1280.0, height=54.0, mode="vertical",
                       gap=4.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F6F5F4", tx=80.0, ty=36.0)
    tb_children = nodes[str(tb_id)]["children"]
    bc = make_text(tb_id, "bc", "← Kembali ke Ringkasan", font_size=13, font_style="Medium", color="#0075DE", tx=0.0, ty=0.0)
    nodes[str(bc)]["interactions"] = [{"trigger": {"type": "onClick"}, "actions": [{"type": "navigate", "dest": ID_SUM_DESK}], "duration_ms": 300, "easing": "easeOut", "transition": {"type": "instant"}}]
    h1 = make_text(tb_id, "h1", "Pilih Metode Pembayaran", font_size=24, font_style="Bold", color="#1C1917", tx=0.0, ty=18.0)
    sub = make_text(tb_id, "sub", "Metode pembayaran terpilih: BCA Virtual Account. Klik 'Bayar Sekarang' untuk melanjutkan.", font_size=14, font_style="Regular", color="#78716C", tx=0.0, ty=44.0)
    tb_children.extend([bc, h1, sub])
    b_children.append(tb_id)

    cols_id = make_frame(body_id, "Two Columns", width=1280.0, height=670.0, mode="horizontal",
                         gap=32.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F6F5F4", tx=80.0, ty=114.0)"""

new_f5 = """    tb = make_desktop_title_block(body_id, "← Kembali ke Ringkasan", "Pilih Metode Pembayaran",
                                  "Metode pembayaran terpilih: BCA Virtual Account. Klik 'Bayar Sekarang' untuk melanjutkan.",
                                  bc_dest=ID_SUM_DESK, tx=80.0, ty=36.0)
    b_children.append(tb)

    cols_id = make_frame(body_id, "Two Columns", width=1280.0, height=670.0, mode="horizontal",
                         gap=32.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F6F5F4", tx=80.0, ty=136.0)"""

content = content.replace(old_f5, new_f5)

# 4. Update Frame 6
old_f6 = """    tb_id = make_frame(body_id, "Title Block", width=1280.0, height=54.0, mode="vertical",
                       gap=4.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F6F5F4", tx=80.0, ty=96.0)
    tb_children = nodes[str(tb_id)]["children"]
    bc = make_text(tb_id, "bc", "← Kembali ke Ringkasan", font_size=13, font_style="Medium", color="#0075DE", tx=0.0, ty=0.0)
    h1 = make_text(tb_id, "h1", "Pilih Metode Pembayaran", font_size=24, font_style="Bold", color="#1C1917", tx=0.0, ty=18.0)
    sub = make_text(tb_id, "sub", "Pilih salah satu metode pembayaran digital melalui Midtrans untuk pesanan IKAPI-DEMO-0001.", font_size=14, font_style="Regular", color="#78716C", tx=0.0, ty=44.0)
    tb_children.extend([bc, h1, sub])
    b_children.append(tb_id)

    cols_id = make_frame(body_id, "Two Columns", width=1280.0, height=670.0, mode="horizontal",
                         gap=32.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F6F5F4", tx=80.0, ty=164.0)"""

new_f6 = """    tb = make_desktop_title_block(body_id, "← Kembali ke Ringkasan", "Pilih Metode Pembayaran",
                                  "Pilih salah satu metode pembayaran digital melalui Midtrans untuk pesanan IKAPI-DEMO-0001.",
                                  bc_dest=ID_SUM_DESK, tx=80.0, ty=96.0)
    b_children.append(tb)

    cols_id = make_frame(body_id, "Two Columns", width=1280.0, height=670.0, mode="horizontal",
                         gap=32.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F6F5F4", tx=80.0, ty=196.0)"""

content = content.replace(old_f6, new_f6)

# 5. Update Frame 7
old_f7 = """    tb_id = make_frame(body_id, "Title Block", width=1280.0, height=54.0, mode="vertical",
                       gap=4.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F6F5F4", tx=80.0, ty=36.0)
    tb_children = nodes[str(tb_id)]["children"]
    bc = make_text(tb_id, "bc", "← Ubah Metode Pembayaran", font_size=13, font_style="Medium", color="#0075DE", tx=0.0, ty=0.0)
    nodes[str(bc)]["interactions"] = [{"trigger": {"type": "onClick"}, "actions": [{"type": "navigate", "dest": ID_METH_DEF}], "duration_ms": 300, "easing": "easeOut", "transition": {"type": "instant"}}]
    h1 = make_text(tb_id, "h1", "Instruksi Pembayaran BCA Virtual Account", font_size=24, font_style="Bold", color="#1C1917", tx=0.0, ty=18.0)
    sub = make_text(tb_id, "sub", "Transfer tepat hingga digit terakhir sebelum batas waktu berakhir agar pembayaran terverifikasi otomatis.", font_size=14, font_style="Regular", color="#78716C", tx=0.0, ty=44.0)
    tb_children.extend([bc, h1, sub])
    b_children.append(tb_id)

    cols_id = make_frame(body_id, "Two Columns", width=1280.0, height=710.0, mode="horizontal",
                         gap=32.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F6F5F4", tx=80.0, ty=114.0)"""

new_f7 = """    tb = make_desktop_title_block(body_id, "← Ubah Metode Pembayaran", "Instruksi Pembayaran BCA Virtual Account",
                                  "Transfer tepat hingga digit terakhir sebelum batas waktu berakhir agar pembayaran terverifikasi otomatis.",
                                  bc_dest=ID_METH_DEF, tx=80.0, ty=36.0)
    b_children.append(tb)

    cols_id = make_frame(body_id, "Two Columns", width=1280.0, height=710.0, mode="horizontal",
                         gap=32.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F6F5F4", tx=80.0, ty=136.0)"""

content = content.replace(old_f7, new_f7)

# 6. Update Frame 8
old_f8 = """    tb_id = make_frame(body_id, "Title Block", width=1280.0, height=54.0, mode="vertical",
                       gap=4.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F6F5F4", tx=80.0, ty=36.0)
    tb_children = nodes[str(tb_id)]["children"]
    bc = make_text(tb_id, "bc", "← Ubah Metode Pembayaran", font_size=13, font_style="Medium", color="#0075DE", tx=0.0, ty=0.0)
    nodes[str(bc)]["interactions"] = [{"trigger": {"type": "onClick"}, "actions": [{"type": "navigate", "dest": ID_METH_DEF}], "duration_ms": 300, "easing": "easeOut", "transition": {"type": "instant"}}]
    h1 = make_text(tb_id, "h1", "Instruksi Pembayaran QRIS", font_size=24, font_style="Bold", color="#1C1917", tx=0.0, ty=18.0)
    sub = make_text(tb_id, "sub", "Pindai kode QR menggunakan aplikasi e-wallet atau mobile banking apa saja yang mendukung QRIS.", font_size=14, font_style="Regular", color="#78716C", tx=0.0, ty=44.0)
    tb_children.extend([bc, h1, sub])
    b_children.append(tb_id)

    cols_id = make_frame(body_id, "Two Columns", width=1280.0, height=720.0, mode="horizontal",
                         gap=32.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F6F5F4", tx=80.0, ty=114.0)"""

new_f8 = """    tb = make_desktop_title_block(body_id, "← Ubah Metode Pembayaran", "Instruksi Pembayaran QRIS",
                                  "Pindai kode QR menggunakan aplikasi e-wallet atau mobile banking apa saja yang mendukung QRIS.",
                                  bc_dest=ID_METH_DEF, tx=80.0, ty=36.0)
    b_children.append(tb)

    cols_id = make_frame(body_id, "Two Columns", width=1280.0, height=720.0, mode="horizontal",
                         gap=32.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F6F5F4", tx=80.0, ty=136.0)"""

content = content.replace(old_f8, new_f8)

# 7. Update Frame 9
old_f9 = """    tb_id = make_frame(body_id, "Title Block", width=1280.0, height=54.0, mode="vertical",
                       gap=4.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F6F5F4", tx=80.0, ty=36.0)
    tb_children = nodes[str(tb_id)]["children"]
    bc = make_text(tb_id, "bc", "← Ubah Metode Pembayaran", font_size=13, font_style="Medium", color="#0075DE", tx=0.0, ty=0.0)
    nodes[str(bc)]["interactions"] = [{"trigger": {"type": "onClick"}, "actions": [{"type": "navigate", "dest": ID_METH_DEF}], "duration_ms": 300, "easing": "easeOut", "transition": {"type": "instant"}}]
    h1 = make_text(tb_id, "h1", "Instruksi Pembayaran GoPay", font_size=24, font_style="Bold", color="#1C1917", tx=0.0, ty=18.0)
    sub = make_text(tb_id, "sub", "Lanjutkan pembayaran langsung melalui aplikasi GoPay di ponsel Anda.", font_size=14, font_style="Regular", color="#78716C", tx=0.0, ty=44.0)
    tb_children.extend([bc, h1, sub])
    b_children.append(tb_id)

    cols_id = make_frame(body_id, "Two Columns", width=1280.0, height=640.0, mode="horizontal",
                         gap=32.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F6F5F4", tx=80.0, ty=114.0)"""

new_f9 = """    tb = make_desktop_title_block(body_id, "← Ubah Metode Pembayaran", "Instruksi Pembayaran GoPay",
                                  "Lanjutkan pembayaran langsung melalui aplikasi GoPay di ponsel Anda.",
                                  bc_dest=ID_METH_DEF, tx=80.0, ty=36.0)
    b_children.append(tb)

    cols_id = make_frame(body_id, "Two Columns", width=1280.0, height=640.0, mode="horizontal",
                         gap=32.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F6F5F4", tx=80.0, ty=136.0)"""

content = content.replace(old_f9, new_f9)

# 8. Update Frame 15
old_f15 = """    tb_id = make_frame(body_id, "Title Block", width=1280.0, height=54.0, mode="vertical",
                       gap=4.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F6F5F4", tx=80.0, ty=96.0)
    tb_children = nodes[str(tb_id)]["children"]
    bc = make_text(tb_id, "bc", "← Kembali ke Ringkasan", font_size=13, font_style="Medium", color="#0075DE", tx=0.0, ty=0.0)
    h1 = make_text(tb_id, "h1", "Segera Selesaikan Pembayaran Anda", font_size=24, font_style="Bold", color="#DC2626", tx=0.0, ty=18.0)
    sub = make_text(tb_id, "sub", "Pesanan IKAPI-DEMO-0001 tinggal memiliki waktu tersisa kurang dari 60 menit.", font_size=14, font_style="Regular", color="#78716C", tx=0.0, ty=44.0)
    tb_children.extend([bc, h1, sub])
    b_children.append(tb_id)

    cols_id = make_frame(body_id, "Two Columns", width=1280.0, height=530.0, mode="horizontal",
                         gap=32.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F6F5F4", tx=80.0, ty=164.0)"""

new_f15 = """    tb = make_desktop_title_block(body_id, "← Kembali ke Ringkasan", "Segera Selesaikan Pembayaran Anda",
                                   "Pesanan IKAPI-DEMO-0001 tinggal memiliki waktu tersisa kurang dari 60 menit.",
                                   bc_dest=ID_SUM_DESK, tx=80.0, ty=96.0, title_color="#DC2626")
    b_children.append(tb)

    cols_id = make_frame(body_id, "Two Columns", width=1280.0, height=530.0, mode="horizontal",
                         gap=32.0, padding=[0.0, 0.0, 0.0, 0.0], fill_color="#F6F5F4", tx=80.0, ty=196.0)"""

content = content.replace(old_f15, new_f15)

with open("scripts/build_full_f06.py", "w", encoding="utf-8") as f:
    f.write(content)

print("Updated build_full_f06.py successfully!")
