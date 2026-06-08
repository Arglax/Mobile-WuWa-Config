# wuwa_ld — Wuthering Waves Log Decryptor

A minimal Python script that decrypts encrypted `Client.log` files from recent Wuthering Waves builds (confirmed working on v3.4 / 2026 sessions).

> **No dependencies. No install. Just Python.**

---

## ⚠️ Disclaimer

This tool is provided **for educational and personal research purposes only.**

- This project is not affiliated with, endorsed by, or connected to Kuro Games in any way.
- The encryption scheme documented here was reverse-engineered from observed file behavior. No proprietary source code was accessed or distributed.
- Use this tool only on log files you own or have the right to inspect (i.e., your own game session logs).
- The author **is not responsible** for any consequences arising from the use or misuse of this tool, including but not limited to account actions, data loss, or violations of Kuro Games' Terms of Service.
- This project **may or may not be updated** in the future. It is a best-effort, one-off release. The encryption scheme used by Kuro Games may change at any time, breaking this tool without notice.

---

## Requirements

- Python **3.6 or newer**
- No third-party packages needed — stdlib only

---

## Usage

There are two ways to use this script.

---

### Option A — Command Line (recommended)

Open a terminal/Command Prompt in the folder where `wuwa_ld.py` is saved, then run:

**Basic usage** (output auto-named next to input):
```bash
python wuwa_ld.py "C:\path\to\Client.log"
```

**Specify output path:**
```bash
python wuwa_ld.py "C:\path\to\Client.log" "C:\path\to\Client_decrypted.log"
```

**With verification** (checks that the first line looks like a valid WuWa log):
```bash
python wuwa_ld.py "C:\path\to\Client.log" --verify
```

**Overwrite existing output without error:**
```bash
python wuwa_ld.py "C:\path\to\Client.log" --force
```

**All flags at once:**
```bash
python wuwa_ld.py "C:\path\to\Client.log" "C:\path\to\output.log" --verify --force
```

---

### Option B — Edit the Script Directly

If you're not comfortable with the command line, open `wuwa_ld.py` in any text editor and scroll to the very bottom. You'll find this block:

```python
if __name__ == "__main__":
    input_file  = r"C:\path\to\your\Client.log"    # ← CHANGE THIS
    output_file = r"C:\path\to\your\output.log"    # ← CHANGE THIS  (or set to None)
```
1. Uncomment that whole block by removing the # at the start of those lines
2. Comment this line by adding a # in front of it
```python
main(none)
```
3. Replace `C:\path\to\your\Client.log` with the actual path to your encrypted log file.
4. Replace `C:\path\to\your\output.log` with where you want the decrypted file saved.
   - Or set `output_file = None` to auto-generate an output file in the same folder as the input.
5. Save the file, then double-click it or run `python wuwa_ld.py` from your terminal.

**Example:**
```python
if __name__ == "__main__":
    input_file  = r"D:\Games\WutheringWaves\Client\Saved\Logs\Client.log"
    output_file = r"D:\WuWaLogs\Client_decrypted.log"
```

> **Note on paths:** Use a raw string (`r"..."`) or double backslashes (`"C:\\path\\..."`) to avoid issues with Windows paths.

---

## Expected Output

A successful run looks like this:

```
Reading  : C:\path\to\Client.log
File size: 2,847,392 bytes
Decrypted: 2,847,395 bytes  (+ 3-byte UTF-8 BOM)
Verify ✓ : Log file open, 04/25/26 14:32:07
Saved to : C:\path\to\Client_decrypted.log
```

The output file is **UTF-8 with BOM**, the same format as unencrypted WuWa logs. You can open it with any text editor (Notepad, VS Code, Notepad++, etc.).

---

## How It Works (brief)

The encrypted log has a 3-byte header `[0x00, 0x54, 0x50]` followed by XOR-obfuscated body bytes. The XOR key used for each byte depends on whether the ciphertext byte is odd or even:

- **Odd byte** → XOR with `0xA5`
- **Even byte** → XOR with `0xEF`

Because XOR is symmetric and the key selection is determined by the ciphertext byte itself (not the plaintext), decryption is identical to encryption — no key storage or external state needed.

---

## Flags Reference

| Flag | Short | Description |
|------|-------|-------------|
| `--verify` | `-v` | Checks the first line of the decrypted output for a valid WuWa log header and prints the session timestamp |
| `--force` | `-f` | Overwrites the output file if it already exists (by default the script errors out to prevent accidental overwrite) |

---

## Known Limitations

- Tested on **v3.4 (2026)** builds only. Kuro Games may change the encryption scheme in future updates, which would definitely break this tool.
- The script does not handle partially-written or corrupted log files gracefully.
- This tool may **not** be actively maintained. If it breaks on a future update, it may simply stay broken.

---

## License

MIT — do whatever you want with it, just don't blame me if something goes wrong.

---

## Credits

- Reverse engineering & scripting idea: **Arglax**
- Assisted and generated by: Claude (Anthropic)
