#!/usr/bin/env python3
"""
Certificate and keystore management for APK/AAB signing
"""
import os
import sys
import subprocess
from pathlib import Path
from datetime import datetime

CERTS_DIR = Path(__file__).parent / "certs"
LOG_DIR = Path(__file__).parent / "logs"

def log_message(message):
    """Log message to console and file"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_entry = f"[{timestamp}] {message}"
    print(log_entry)
    
    LOG_DIR.mkdir(exist_ok=True)
    with open(LOG_DIR / "cert.log", "a") as f:
        f.write(log_entry + "\n")

def create_keystore(keystore_path, keystore_pass, alias, alias_pass, validity_days=25550):
    """
    Create a new keystore for signing
    validity_days: default 70 years (25550 days)
    """
    CERTS_DIR.mkdir(exist_ok=True)
    
    if Path(keystore_path).exists():
        log_message(f"✓ Keystore already exists at {keystore_path}")
        return True
    
    log_message(f"🔐 Creating keystore: {keystore_path}")
    
    cmd = [
        "keytool",
        "-genkey",
        "-v",
        "-keystore", str(keystore_path),
        "-keyalg", "RSA",
        "-keysize", "2048",
        "-validity", str(validity_days),
        "-alias", alias,
        "-storepass", keystore_pass,
        "-keypass", alias_pass,
        "-dname", "CN=IoT Marketplace App, O=Your Company, L=Your City, ST=Your State, C=US"
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            log_message(f"✓ Keystore created successfully")
            log_message(f"  Location: {keystore_path}")
            log_message(f"  Alias: {alias}")
            return True
        else:
            log_message(f"✗ Keystore creation failed: {result.stderr}")
            return False
    except Exception as e:
        log_message(f"✗ Error creating keystore: {e}")
        return False

def list_keystore_info(keystore_path, keystore_pass):
    """List keystore information"""
    cmd = [
        "keytool",
        "-list",
        "-v",
        "-keystore", str(keystore_path),
        "-storepass", keystore_pass
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            log_message("🔍 Keystore Information:")
            print(result.stdout)
            return True
        else:
            log_message(f"✗ Failed to read keystore: {result.stderr}")
            return False
    except Exception as e:
        log_message(f"✗ Error reading keystore: {e}")
        return False

def validate_keystore(keystore_path, keystore_pass, alias):
    """Validate keystore exists and is readable"""
    if not Path(keystore_path).exists():
        log_message(f"✗ Keystore not found: {keystore_path}")
        return False
    
    cmd = [
        "keytool",
        "-list",
        "-keystore", str(keystore_path),
        "-storepass", keystore_pass,
        "-alias", alias
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            log_message(f"✓ Keystore validated successfully")
            return True
        else:
            log_message(f"✗ Keystore validation failed: {result.stderr}")
            return False
    except Exception as e:
        log_message(f"✗ Error validating keystore: {e}")
        return False

def main():
    log_message("=" * 60)
    log_message("Certificate Manager")
    log_message("=" * 60)
    
    keystore_path = CERTS_DIR / "iot_marketplace_app.keystore"
    
    # Create keystore with default credentials
    # CHANGE THESE IN PRODUCTION!
    keystore_pass = "iot_app_12345"
    alias = "iot_marketplace"
    alias_pass = "iot_app_12345"
    
    if not Path(keystore_path).exists():
        if create_keystore(str(keystore_path), keystore_pass, alias, alias_pass):
            log_message(f"✓ Keystore setup completed")
        else:
            sys.exit(1)
    
    # Display keystore info
    list_keystore_info(str(keystore_path), keystore_pass)
    
    log_message("=" * 60)

if __name__ == "__main__":
    main()
