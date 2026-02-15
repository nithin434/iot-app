#!/usr/bin/env python3
"""
Download and setup bundletool for APK to AAB conversion
"""
import os
import sys
import urllib.request
import zipfile
from pathlib import Path
from datetime import datetime

BUNDLETOOL_VERSION = "1.15.6"
BUNDLETOOL_URL = f"https://github.com/google/bundletool/releases/download/{BUNDLETOOL_VERSION}/bundletool-all-{BUNDLETOOL_VERSION}.jar"
TOOLS_DIR = Path(__file__).parent / "tools"
BUNDLETOOL_JAR = TOOLS_DIR / "bundletool.jar"
LOG_DIR = Path(__file__).parent / "logs"

def log_message(message):
    """Log message to console and file"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_entry = f"[{timestamp}] {message}"
    print(log_entry)
    
    LOG_DIR.mkdir(exist_ok=True)
    with open(LOG_DIR / "setup.log", "a") as f:
        f.write(log_entry + "\n")

def download_bundletool():
    """Download bundletool jar file"""
    TOOLS_DIR.mkdir(exist_ok=True)
    
    if BUNDLETOOL_JAR.exists():
        log_message(f"✓ Bundletool already exists at {BUNDLETOOL_JAR}")
        return True
    
    log_message(f"📥 Downloading bundletool {BUNDLETOOL_VERSION}...")
    
    try:
        def progress_hook(block_num, block_size, total_size):
            downloaded = block_num * block_size
            percent = min(100, int((downloaded / total_size) * 100))
            print(f"\r  Progress: {percent}%", end="", flush=True)
        
        urllib.request.urlretrieve(BUNDLETOOL_URL, BUNDLETOOL_JAR, progress_hook)
        print()  # New line after progress
        log_message(f"✓ Downloaded bundletool to {BUNDLETOOL_JAR}")
        return True
        
    except Exception as e:
        log_message(f"✗ Failed to download bundletool: {e}")
        return False

def check_java():
    """Check if Java is installed"""
    ret = os.system("java -version > /dev/null 2>&1")
    if ret == 0:
        log_message("✓ Java is installed")
        return True
    else:
        log_message("✗ Java is NOT installed. Install Java 11+ to proceed.")
        return False

def main():
    log_message("=" * 60)
    log_message("APK to AAB Conversion - Setup")
    log_message("=" * 60)
    
    # Check Java
    if not check_java():
        sys.exit(1)
    
    # Download bundletool
    if not download_bundletool():
        sys.exit(1)
    
    log_message("=" * 60)
    log_message("✓ Setup completed successfully!")
    log_message("=" * 60)

if __name__ == "__main__":
    main()
