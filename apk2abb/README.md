# APK to AAB Conversion Tool

Convert your Android APK files to Android App Bundle (AAB) format for Play Store deployment.

## Overview

This tool automates the conversion of APK files to AAB (Android App Bundle) format using Google's bundletool, without requiring Android Studio. It includes:

- ✅ Automated bundletool download
- ✅ Keystore and certificate management
- ✅ APK to AAB conversion
- ✅ AAB signing with security credentials
- ✅ Comprehensive logging

## Prerequisites

- **Java 11+**: Required by bundletool
  ```bash
  java -version
  ```
- **Python 3.8+**: Already configured via `/home/nithin/venv`
- **keytool**: Usually comes with Java (for certificate management)

## Directory Structure

```
apk2abb/
├── tools/              # Bundletool and other tools
├── certs/              # Keystores and certificates
├── output/             # Generated AAB files
├── logs/               # Log files
├── requirements.txt    # Python dependencies
├── setup.sh           # Initial setup script
├── download_bundletool.py  # Download and configure bundletool
├── cert_manager.py    # Certificate and keystore management
├── apk_to_aab.py      # Main conversion script
└── README.md          # This file
```

## Quick Start

### 1. Initial Setup

```bash
cd /home/nithin/Downloads/iot-app-main/apk2abb
chmod +x setup.sh
./setup.sh
```

This will:
- Install Python dependencies
- Download bundletool (v1.15.6)
- Create a keystore for signing

### 2. Convert APK to AAB

```bash
# Using the venv
source /home/nithin/venv/bin/activate
python apk_to_aab.py ../iot-marketplace-app.apk
```

The output AAB file will be created in the `output/` directory.

### 3. Check Results

Check the logs for detailed information:
```bash
tail -f logs/conversion.log
```

## Configuration

### Keystore Credentials

**Important**: Change these default credentials for production!

Edit `cert_manager.py`:
```python
keystore_pass = "iot_app_12345"        # Change this
alias = "iot_marketplace"              # Change this
alias_pass = "iot_app_12345"           # Change this
```

And update in `apk_to_aab.py`:
```python
self.keystore_pass = "iot_app_12345"   # Change this
self.key_pass = "iot_app_12345"        # Change this
```

### Bundletool Version

To use a different version, edit `download_bundletool.py`:
```python
BUNDLETOOL_VERSION = "1.15.6"  # Change version here
```

## Usage Examples

### Basic Conversion
```bash
python apk_to_aab.py ../iot-marketplace-app.apk
```

### Without Signing
```bash
python apk_to_aab.py ../iot-marketplace-app.apk --no-sign
```

### View Keystore Information
```bash
python cert_manager.py
```

## Output Files

- **output/iot_marketplace_app.aab** - Unsigned AAB
- **output/iot_marketplace_app-signed.aab** - Signed AAB (ready for Play Store)

## Logs

All operations are logged in:
- `logs/setup.log` - Setup operations
- `logs/cert.log` - Certificate operations
- `logs/conversion.log` - Conversion operations

## Troubleshooting

### Java Not Found
```bash
# Install Java
sudo apt-get install openjdk-11-jdk

# Verify installation
java -version
```

### Bundletool Download Failed
```bash
# Check internet connection
# Check logs/setup.log for details
# Try manual download from: https://github.com/google/bundletool/releases
```

### Keystore Issues
```bash
# List keystore contents
keytool -list -v -keystore certs/iot_marketplace_app.keystore -storepass iot_app_12345

# Delete and recreate if corrupted
rm certs/iot_marketplace_app.keystore
python cert_manager.py
```

### APK File Not Found
Ensure the APK path is correct:
```bash
# Check available APKs
ls -la ../iot-marketplace-app*.apk

# Use absolute path if needed
python apk_to_aab.py /home/nithin/Downloads/iot-app-main/iot-marketplace-app.apk
```

## Play Store Upload

Once you have the signed AAB file:

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app
3. Navigate to **Release → Production**
4. Click **Create New Release**
5. Upload the `.aab` file from `output/`
6. Review and publish

## Security Notes

🔒 **Important for Production:**

1. Keep keystore files secure - don't commit to version control
2. Change default keystore passwords
3. Back up your keystore file in a secure location
4. Keep the keystore password separate from the code
5. Consider using environment variables for passwords in production

## File Size Optimization

AAB files are typically smaller than APK files. To further optimize:

```bash
# Check APK size
ls -lh ../iot-marketplace-app.apk

# Check AAB size
ls -lh output/iot_marketplace_app.aab

# Play Store will generate optimized APKs from the AAB for each device
```

## References

- [Google Bundletool Documentation](https://developer.android.com/studio/command-line/bundletool)
- [Android App Bundle Format](https://developer.android.com/guide/app-bundle)
- [Play Console Help](https://support.google.com/googleplay/android-developer)

## Support

For issues with:
- **Bundletool**: Check [Google's repository](https://github.com/google/bundletool)
- **Certificates**: See Android's [key management](https://developer.android.com/studio/publish/app-signing) guide
- **This tool**: Check logs in the `logs/` directory

---

**Version**: 1.0.0  
**Last Updated**: 2026-02-15
