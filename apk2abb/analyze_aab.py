#!/usr/bin/env python3
"""
Quick utility to display AAB file information
"""
import os
import sys
import zipfile
from pathlib import Path
from datetime import datetime

def analyze_aab(aab_path):
    """Analyze and display AAB file information"""
    aab_path = Path(aab_path)
    
    if not aab_path.exists():
        print(f"✗ AAB file not found: {aab_path}")
        return False
    
    print("=" * 60)
    print(f"AAB File Information: {aab_path.name}")
    print("=" * 60)
    
    # File info
    stat = aab_path.stat()
    size_mb = stat.st_size / (1024 * 1024)
    size_kb = stat.st_size / 1024
    
    print(f"\n📦 File Details:")
    print(f"  Size: {size_mb:.2f} MB ({size_kb:.0f} KB)")
    print(f"  Modified: {datetime.fromtimestamp(stat.st_mtime).strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"  Permissions: {oct(stat.st_mode)[-3:]}")
    
    # Analyze ZIP structure
    try:
        with zipfile.ZipFile(aab_path, 'r') as z:
            files = z.namelist()
            
            print(f"\n📂 Archive Contents ({len(files)} files):")
            
            # Group by module
            modules = {}
            for file in files:
                parts = file.split('/')
                if len(parts) > 0:
                    module = parts[0]
                    if module not in modules:
                        modules[module] = []
                    modules[module].append(file)
            
            for module in sorted(modules.keys()):
                print(f"  ├─ {module}/")
                for file in sorted(modules[module])[:5]:
                    print(f"  │  ├─ {file}")
                if len(modules[module]) > 5:
                    print(f"  │  └─ ... and {len(modules[module]) - 5} more")
        
        print(f"\n✓ AAB file is valid")
        return True
        
    except zipfile.BadZipFile:
        print(f"✗ AAB file is not a valid ZIP archive")
        return False
    except Exception as e:
        print(f"✗ Error analyzing AAB: {e}")
        return False

def main():
    if len(sys.argv) < 2:
        print("Usage: python analyze_aab.py <path_to_aab>")
        print("\nExample: python analyze_aab.py output/iot-marketplace-app.aab")
        sys.exit(1)
    
    aab_file = sys.argv[1]
    
    if not analyze_aab(aab_file):
        sys.exit(1)

if __name__ == "__main__":
    main()
