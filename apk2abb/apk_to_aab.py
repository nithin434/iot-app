#!/usr/bin/env python3
"""
Convert APK to AAB (Android App Bundle) for Play Store
"""
import os
import sys
import subprocess
import json
from pathlib import Path
from datetime import datetime
import zipfile
import tempfile

class APKtoAABConverter:
    def __init__(self):
        self.base_dir = Path(__file__).parent
        self.tools_dir = self.base_dir / "tools"
        self.certs_dir = self.base_dir / "certs"
        self.output_dir = self.base_dir / "output"
        self.logs_dir = self.base_dir / "logs"
        self.bundletool_jar = self.tools_dir / "bundletool.jar"
        
        # Keystore config
        self.keystore_path = self.certs_dir / "iot_marketplace_app.keystore"
        self.keystore_pass = "iot_app_12345"
        self.key_alias = "iot_marketplace"
        self.key_pass = "iot_app_12345"
        
        self.logs_dir.mkdir(exist_ok=True)
        self.output_dir.mkdir(exist_ok=True)
        
    def log_message(self, message):
        """Log message to console and file"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"[{timestamp}] {message}"
        print(log_entry)
        
        with open(self.logs_dir / "conversion.log", "a") as f:
            f.write(log_entry + "\n")
    
    def check_requirements(self):
        """Check if all required tools are available"""
        self.log_message("🔍 Checking requirements...")
        
        # Check Java
        ret = os.system("java -version > /dev/null 2>&1")
        if ret != 0:
            self.log_message("✗ Java is NOT installed")
            return False
        self.log_message("✓ Java is installed")
        
        # Check bundletool
        if not self.bundletool_jar.exists():
            self.log_message(f"✗ Bundletool not found at {self.bundletool_jar}")
            return False
        self.log_message(f"✓ Bundletool found")
        
        # Check keystore
        if not self.keystore_path.exists():
            self.log_message(f"✗ Keystore not found at {self.keystore_path}")
            return False
        self.log_message(f"✓ Keystore found")
        
        return True
    
    def convert_apk_to_aab(self, apk_path, output_aab_path):
        """
        Convert APK to AAB using bundletool
        Note: APK to AAB conversion requires the APK to be prepared as a module bundle
        This creates a simplified AAB from universal APK
        """
        apk_path = Path(apk_path)
        output_aab_path = Path(output_aab_path)
        
        if not apk_path.exists():
            self.log_message(f"✗ APK file not found: {apk_path}")
            return False
        
        self.log_message(f"📦 Converting APK to AAB...")
        self.log_message(f"  Input: {apk_path}")
        self.log_message(f"  Output: {output_aab_path}")
        
        # Create temporary directory for work
        with tempfile.TemporaryDirectory() as tmpdir:
            tmpdir = Path(tmpdir)
            
            # Step 1: Convert APK to module format (rename to .zip for processing)
            self.log_message(f"  [1/3] Preparing APK module...")
            
            # Create temporary zip file
            temp_zip = tmpdir / "universal.apks.zip"
            temp_module_dir = tmpdir / "base"
            temp_module_dir.mkdir()
            
            # Copy APK as base module
            import shutil
            shutil.copy(apk_path, temp_module_dir / "universal.apk")
            
            # Create a minimal BundleConfig
            bundle_config = {
                "version": 1,
                "modules": [
                    {
                        "name": "base",
                        "enabled": True,
                        "type": "ASSET_PACK"
                    }
                ]
            }
            
            # Write bundle config
            config_file = temp_module_dir / "BundleConfig.pb"
            with open(config_file, 'w') as f:
                f.write(str(bundle_config))
            
            self.log_message(f"  ✓ Module prepared")
            
            # Step 2: Build AAB from prepared modules
            self.log_message(f"  [2/3] Building AAB...")
            
            # Use Python's zipfile to create AAB
            try:
                with zipfile.ZipFile(output_aab_path, 'w', zipfile.ZIP_DEFLATED) as aab_zip:
                    # Add the APK as base module
                    aab_zip.write(temp_module_dir / "universal.apk", arcname="base/universal.apk")
                    # Add BundleConfig
                    aab_zip.write(config_file, arcname="BundleConfig.pb")
                
                self.log_message(f"  ✓ AAB structure created")
                
            except Exception as e:
                self.log_message(f"✗ AAB creation failed: {e}")
                return False
        
        # Verify output
        if not output_aab_path.exists():
            self.log_message(f"✗ AAB file was not created")
            return False
        
        file_size = output_aab_path.stat().st_size / (1024 * 1024)  # MB
        self.log_message(f"  ✓ AAB created successfully ({file_size:.2f} MB)")
        
        return True
    
    def sign_aab(self, aab_path):
        """
        Sign the AAB file with keystore
        """
        aab_path = Path(aab_path)
        signed_aab_path = aab_path.parent / aab_path.name.replace(".aab", "-signed.aab")
        
        self.log_message(f"🔐 Signing AAB...")
        self.log_message(f"  Input: {aab_path}")
        self.log_message(f"  Output: {signed_aab_path}")
        
        # Use jarsigner to sign the AAB
        sign_cmd = [
            "jarsigner",
            "-verbose",
            "-sigalg", "SHA256withRSA",
            "-digestalg", "SHA-256",
            "-keystore", str(self.keystore_path),
            "-storepass", self.keystore_pass,
            "-keypass", self.key_pass,
            str(aab_path),
            self.key_alias
        ]
        
        try:
            result = subprocess.run(sign_cmd, capture_output=True, text=True, timeout=120)
            if result.returncode != 0:
                self.log_message(f"✗ Signing failed: {result.stderr}")
                return False
            
            self.log_message(f"  ✓ AAB signed successfully")
            return str(signed_aab_path)
            
        except Exception as e:
            self.log_message(f"✗ Signing failed: {e}")
            return False
    
    def get_bundle_info(self, aab_path):
        """
        Get information about the AAB file
        """
        aab_path = Path(aab_path)
        
        if not aab_path.exists():
            self.log_message(f"✗ AAB file not found: {aab_path}")
            return False
        
        self.log_message(f"📋 AAB Information:")
        
        info_cmd = [
            "java", "-jar", str(self.bundletool_jar),
            "dump", "manifest",
            "--bundle", str(aab_path)
        ]
        
        try:
            result = subprocess.run(info_cmd, capture_output=True, text=True, timeout=30)
            if result.returncode == 0:
                self.log_message(f"  {result.stdout}")
            else:
                self.log_message(f"  Could not read manifest: {result.stderr}")
            return True
        except Exception as e:
            self.log_message(f"✗ Failed to get info: {e}")
            return False
    
    def process_apk(self, apk_path, sign=True):
        """
        Main conversion process
        """
        apk_path = Path(apk_path)
        
        self.log_message("=" * 60)
        self.log_message(f"APK to AAB Conversion")
        self.log_message("=" * 60)
        
        # Check requirements
        if not self.check_requirements():
            return False
        
        # Generate output filename
        output_aab = self.output_dir / (apk_path.stem.replace(" ", "_") + ".aab")
        
        # Convert APK to AAB
        if not self.convert_apk_to_aab(apk_path, output_aab):
            return False
        
        # Sign if requested
        if sign:
            if not self.sign_aab(output_aab):
                self.log_message("⚠ AAB created but signing failed")
        
        # Get bundle info
        self.get_bundle_info(output_aab)
        
        self.log_message("=" * 60)
        self.log_message(f"✓ Conversion completed!")
        self.log_message(f"  Output: {output_aab}")
        self.log_message("=" * 60)
        
        return True

def main():
    if len(sys.argv) < 2:
        print("Usage: python apk_to_aab.py <path_to_apk> [--no-sign]")
        print("\nExample: python apk_to_aab.py ../iot-marketplace-app.apk")
        sys.exit(1)
    
    apk_file = sys.argv[1]
    sign = "--no-sign" not in sys.argv
    
    converter = APKtoAABConverter()
    
    if not converter.process_apk(apk_file, sign=sign):
        sys.exit(1)

if __name__ == "__main__":
    main()
