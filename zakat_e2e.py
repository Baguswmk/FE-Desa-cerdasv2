import time
import os
from playwright.sync_api import sync_playwright

def run():
    print("[START] Starting Zakat E2E Playwright Automation Suite...")
    
    with sync_playwright() as p:
        # Launch browser in headless mode to run silently and reliably
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 800})
        
        # Capture console messages and errors
        page.on("console", lambda msg: print(f"Browser Console: [{msg.type}] {msg.text}"))
        page.on("pageerror", lambda err: print(f"Browser JS Error: {err}"))
        
        # Helper function to capture screenshots for easy verification
        def take_screenshot(name):
            os.makedirs("e2e_screenshots", exist_ok=True)
            page.screenshot(path=f"e2e_screenshots/{name}.png")
            print(f"[SCREENSHOT] Saved: e2e_screenshots/{name}.png")

        # ----------------------------------------------------
        # 1. ADMIN LOGIN
        # ----------------------------------------------------
        print("\n[STEP 1] Navigating to Admin Login...")
        page.goto("http://localhost:3000/login")
        page.wait_for_load_state("networkidle")
        take_screenshot("1_login_page")
        
        print("Filling Admin credentials...")
        page.fill("input[type='email']", "test_admin@desacerdas.com")
        page.fill("input[type='password']", "AdminPassword123!")
        take_screenshot("2_login_credentials_filled")
        
        # Click login button and wait for navigation
        page.click("button[type='submit']")
        print("Waiting for Admin Dashboard redirect...")
        page.wait_for_url("**/admin/dashboard", timeout=10000)
        page.wait_for_timeout(1000)  # Extra buffer to ensure storage is settled
        
        # ----------------------------------------------------
        # 2. NAVIGATE TO ZAKAT ADMIN
        # ----------------------------------------------------
        print("\n[STEP 2] Navigating to Zakat Admin Management Dashboard...")
        page.goto("http://localhost:3000/admin/zakat")
        page.wait_for_load_state("networkidle")
        take_screenshot("3_zakat_admin_dashboard")
        
        # Select Mosque E2E from dropdown
        print("Selecting 'Masjid E2E Al-Ikhlas'...")
        page.select_option("select", label="Masjid E2E Al-Ikhlas")
        page.wait_for_timeout(1000)
        take_screenshot("4_mosque_selected")
        
        # Search for Budiono E2E
        print("Searching for Muzakki 'Budiono'...")
        page.fill("input[placeholder='Cari KK / Nama Kepala Keluarga...']", "Budiono")
        page.wait_for_timeout(1000)
        take_screenshot("5_search_muzakki")
        
        # ----------------------------------------------------
        # 3. DIRECT OFFLINE PAYMENT RECORDING
        # ----------------------------------------------------
        print("\n[STEP 3] Triggering 'Catat Bayar' for Budiono E2E Family...")
        page.click("text=Catat Bayar")
        page.wait_for_timeout(1500)
        take_screenshot("6_direct_payment_modal")
        
        # Uncheck Ani E2E (4 souls -> 3 souls)
        print("Deselecting member 'Ani E2E' to dynamically reduce soul count...")
        page.click("text=Ani E2E")
        page.wait_for_timeout(500)
        take_screenshot("7_ani_deselected")
        
        # Toggle Setoran Beras
        print("Toggling payment method to 'Setoran Beras'...")
        page.click("text=Setoran Beras")
        page.wait_for_timeout(500)
        take_screenshot("8_payment_method_rice")
        
        # Toggle Setoran Uang back
        print("Toggling back to 'Setoran Uang'...")
        page.click("text=Setoran Uang")
        page.wait_for_timeout(500)
        
        # Open Lafadz Niat Zakat
        print("Expanding 'Lafadz Niat Zakat Fitrah' intent card...")
        page.click("text=Lafadz Niat Zakat Fitrah")
        page.wait_for_timeout(500)
        take_screenshot("9_lafadz_niat_active")
        
        # Save payment
        print("Saving payment transaction...")
        page.click("button:has-text('Simpan Pembayaran')")
        page.wait_for_timeout(2000)
        take_screenshot("10_payment_saved")
        
        # ----------------------------------------------------
        # 4. PUBLIC CLIENT LOOKUP BY KK
        # ----------------------------------------------------
        print("\n[STEP 4] Testing Public Zakat Calculator & KK Lookup...")
        page.goto("http://localhost:3000/zakat")
        page.wait_for_load_state("networkidle")
        take_screenshot("11_public_zakat_page")
        
        print("Switching calculator to Zakat Fitrah...")
        # Step 1: Select type by clicking the card containing the description
        page.click("text=Wajib saat Ramadan, per jiwa")
        page.wait_for_timeout(1000)
        
        # Step 2: Switch mode to "Cari Data KK"
        print("Switching to 'Cari Data KK' lookup mode...")
        page.click("text=Cari Data KK")
        page.wait_for_timeout(500)
        take_screenshot("12_kk_lookup_mode")
        
        # Search No KK
        print("Searching No KK '3201234567890123'...")
        page.fill("input[placeholder='Contoh: 320123XXXXXXXXXX']", "3201234567890123")
        page.click("button:has-text('Cari KK')")
        page.wait_for_timeout(2000)
        take_screenshot("13_kk_lookup_result")
        
        # Customize Local Rice Price
        print("Customizing local rice price to Rp 16.000...")
        page.fill("input[placeholder='Default: 15000']", "16000")
        page.wait_for_timeout(500)
        take_screenshot("14_custom_rice_price")
        
        # Click Hitung Zakat
        print("Calculating Zakat...")
        page.click("button:has-text('Hitung Zakat')")
        page.wait_for_timeout(1000)
        take_screenshot("15_calculation_result")
        
        # ----------------------------------------------------
        # 5. CITIZEN ONLINE PAYMENT INITIATION
        # ----------------------------------------------------
        print("\n[STEP 5] Initiating Public Zakat Online Payment...")
        page.click("text=Bayar Zakat")
        page.wait_for_timeout(1000)
        take_screenshot("16_public_payment_tab")
        
        print("Filling online payment form...")
        # Target elements precisely scoped under their HTML sibling labels
        page.fill("div:has(> label:has-text('Nama Muzakki')) input", "Muzakki E2E Online")
        page.select_option("div:has(> label:has-text('Jenis Zakat')) select", value="FITRAH")
        page.fill("div:has(> label:has-text('Jumlah (Rp)')) input", "80000")
        page.fill("div:has(> label:has-text('Jumlah Jiwa')) input", "2")
        page.fill("textarea", "Semoga berkah - E2E Test")
        
        # Upload a dummy proof of transfer image
        dummy_file = "dummy_proof.jpg"
        with open(dummy_file, "w") as f:
            f.write("dummy image data")
        
        print("Uploading proof of transfer...")
        page.set_input_files("input[type='file']", dummy_file)
        page.wait_for_timeout(500)
        take_screenshot("17_payment_form_filled")
        
        print("Submitting Zakat online payment...")
        # Target submit button
        page.click("button:has-text('Kirim Pembayaran Zakat')")
        page.wait_for_timeout(3500)
        take_screenshot("18_online_payment_submitted")
        
        # Remove dummy file
        if os.path.exists(dummy_file):
            os.remove(dummy_file)
            
        # ----------------------------------------------------
        # 6. ADMIN ONLINE PAYMENT APPROVAL
        # ----------------------------------------------------
        print("\n[STEP 6] Navigating to Zakat Admin to verify & approve payment...")
        page.goto("http://localhost:3000/admin/zakat")
        page.wait_for_load_state("networkidle")
        
        print("Switching to 'Verifikasi Bayar' tab...")
        page.click("text=Verifikasi Bayar")
        page.wait_for_timeout(2000)
        take_screenshot("19_admin_verification_list")
        
        # Verify and click Approve (the check circle button) in the row of Muzakki E2E Online
        print("Approving pending transaction...")
        page.click("tr:has-text('Muzakki E2E Online') button.bg-emerald-600")
        page.wait_for_timeout(1000)
        take_screenshot("20_confirm_approval_modal")
        
        page.click("text=Ya, Setujui")
        page.wait_for_timeout(2000)
        take_screenshot("21_approval_complete")
        
        # ----------------------------------------------------
        # 7. PENYALURAN MUSTAHIK (DISTRIBUTION)
        # ----------------------------------------------------
        print("\n[STEP 7] Testing Zakat Distribution to Mustahik...")
        page.click("button:has-text('Distribusi')")
        page.wait_for_timeout(2000)
        take_screenshot("22_admin_distribution_tab_clicked")
        
        # Wait up to 30s for manual distribution loading spinner to finish and button to appear
        print("Waiting for TabDistribusi to finish loading...")
        page.wait_for_selector("text=Catat Penyaluran")
        take_screenshot("22_admin_distribution_tab")
        
        print("Opening manual distribution recording form...")
        page.click("text=Catat Penyaluran")
        
        # Wait for the form inputs to render
        page.wait_for_selector("input[placeholder='Nama Penerima']")
        take_screenshot("23_distribution_form_open")
        
        print("Filling mustahik distribution data...")
        page.fill("input[placeholder='Nama Penerima']", "Penerima E2E Manual")
        page.fill("input[placeholder='16 Digit NIK']", "3201011234560001")
        page.select_option("div:has(> label:has-text('Kategori Asnaf')) select", label="Miskin")
        page.fill("input[placeholder='500000']", "100000")
        page.fill("input[placeholder='Contoh: Bantuan modal usaha ayam petelur']", "Bantuan Sembako E2E")
        take_screenshot("24_distribution_form_filled")
        
        print("Saving mustahik distribution...")
        page.click("text=Top Up")
        page.wait_for_timeout(3500)
        take_screenshot("25_distribution_saved")
        
        print("\n[COMPLETE] Zakat Full E2E Automated Suite completed successfully!")
        browser.close()

if __name__ == "__main__":
    run()
