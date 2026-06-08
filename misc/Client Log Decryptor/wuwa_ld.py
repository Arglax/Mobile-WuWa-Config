#!/usr/bin/env python3
"""
wuwa_ld.py  —  Wuthering Waves Log Decryptor
==============================================
Decrypts encrypted Wuthering Waves client.log files produced by recent
Kuro Games builds (confirmed: v3.4 / 2026 session).

Encryption scheme (reverse-engineered):
  - File header: 3 bytes  [0x00, 0x54, 0x50]  ("TP" marker)
  - Body:  each byte `e` is XOR-obfuscated based on its own LSB:
        if e is ODD  (e & 1 == 1):  plain = e ^ 0xA5
        if e is EVEN (e & 1 == 0):  plain = e ^ 0xEF
    Equivalently on the encryption side, the key depends on the plain byte LSB:
        even plain byte -> key 0xA5   (0xA5 is odd, so it flips the LSB)
        odd  plain byte -> key 0xEF   (0xEF is odd, so it flips the LSB)
    This means the enc/plain LSBs are always complementary, making decryption
    unambiguous without needing the original plain byte.

Output is UTF-8 with BOM, matching the original unencrypted log format.

─────────────────────────────────────────────────────────────────
  HOW TO USE THIS SCRIPT  (edit the bottom section)
─────────────────────────────────────────────────────────────────
  Option A — Run from the command line:

      python wuwa_ld.py "C:/path/to/Client.log"
      python wuwa_ld.py "C:/path/to/Client.log" "C:/path/to/output.log"
      python wuwa_ld.py "C:/path/to/Client.log" --verify
      python wuwa_ld.py "C:/path/to/Client.log" --force   # overwrite existing output

  Option B — Edit the __main__ block at the bottom of this file:

      input_file  = r"C:\path\to\your\Client.log"   # ← change this
      output_file = r"C:\path\to\output.log"         # ← change this, or set to None for auto
─────────────────────────────────────────────────────────────────

Dependencies:  Python 3.6+  (stdlib only, no third-party packages needed)

Author:  Arglax / WuWa-Config project  (https://github.dev/Arglax/Mobile-WuWa-Config)
Prompted to: Claude (Anthropic)
License: MIT
"""

import sys
import os
import argparse

# ── Constants ─────────────────────────────────────────────────────────────────

HEADER_MAGIC = bytes([0x00, 0x54, 0x50])   # null + "TP"
HEADER_LEN   = 3
KEY_ODD_ENC  = 0xA5   # XOR key applied when the ciphertext byte is ODD
KEY_EVEN_ENC = 0xEF   # XOR key applied when the ciphertext byte is EVEN
UTF8_BOM     = b"\xef\xbb\xbf"


# ── Core logic ────────────────────────────────────────────────────────────────

def is_encrypted(data: bytes) -> bool:
    """Return True if *data* begins with the known 3-byte header."""
    return data[:HEADER_LEN] == HEADER_MAGIC


def decrypt(data: bytes) -> bytes:
    """
    Decrypt a full encrypted log file (bytes) and return the plaintext bytes
    (UTF-8 with BOM prepended).

    Raises ValueError if the magic header is missing.
    """
    if not is_encrypted(data):
        raise ValueError(
            f"Unexpected header bytes: {data[:HEADER_LEN].hex()}. "
            "Are you sure this file is encrypted?"
        )

    body = data[HEADER_LEN:]

    # Vectorised decode: build a 256-entry lookup table for speed.
    # For each possible ciphertext byte value e (0–255):
    #   plain = e ^ KEY_ODD_ENC  if e is odd
    #   plain = e ^ KEY_EVEN_ENC if e is even
    lut = bytes(
        (e ^ KEY_ODD_ENC) if (e & 1) else (e ^ KEY_EVEN_ENC)
        for e in range(256)
    )

    plaintext = bytes(lut[e] for e in body)
    return UTF8_BOM + plaintext


# ── CLI ───────────────────────────────────────────────────────────────────────

def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        description="Decrypt an encrypted Wuthering Waves client.log file.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    p.add_argument(
        "input",
        metavar="ENCRYPTED_LOG",
        help="Path to the encrypted log file (e.g. Client.log).",
    )
    p.add_argument(
        "output",
        metavar="OUTPUT_FILE",
        nargs="?",
        default=None,
        help=(
            "Destination path for the decrypted log. "
            "Defaults to <input_stem>_decrypted<input_ext> in the same directory."
        ),
    )
    p.add_argument(
        "--force", "-f",
        action="store_true",
        help="Overwrite the output file if it already exists.",
    )
    p.add_argument(
        "--verify", "-v",
        action="store_true",
        help='Check that the decrypted output starts with "Log file open" and print the session timestamp.',
    )
    return p


def default_output_path(input_path: str) -> str:
    base, ext = os.path.splitext(input_path)
    return f"{base}_decrypted{ext}"


def main(argv=None):
    parser = build_parser()
    args = parser.parse_args(argv)

    input_path = os.path.abspath(args.input)
    if not os.path.isfile(input_path):
        parser.error(f"Input file not found: {input_path}")

    output_path = os.path.abspath(
        args.output if args.output else default_output_path(input_path)
    )

    if os.path.exists(output_path) and not args.force:
        parser.error(
            f"Output file already exists: {output_path}\n"
            "Use --force / -f to overwrite."
        )

    print(f"Reading  : {input_path}")
    with open(input_path, "rb") as fh:
        enc_data = fh.read()

    print(f"File size: {len(enc_data):,} bytes")

    try:
        plain_data = decrypt(enc_data)
    except ValueError as exc:
        print(f"\nERROR: {exc}", file=sys.stderr)
        sys.exit(1)

    print(f"Decrypted: {len(plain_data):,} bytes  (+ 3-byte UTF-8 BOM)")

    if args.verify:
        try:
            first_line = plain_data[3:].split(b"\n", 1)[0].decode("utf-8", errors="replace")
            if "Log file open" in first_line:
                print(f"Verify ✓ : {first_line.strip()}")
            else:
                print(f"Verify ✗ : First line does not look like a WuWa log header.")
                print(f"           Got: {first_line[:120]!r}")
        except Exception as exc:
            print(f"Verify ✗ : Could not read first line: {exc}")

    with open(output_path, "wb") as fh:
        fh.write(plain_data)

    print(f"Saved to : {output_path}")


# ── Direct-run template (edit paths here if not using the command line) ───────
#
#   1. Set input_file  to the full path of your encrypted Client.log
#   2. Set output_file to where you want the decrypted file saved,
#      OR set it to None to auto-generate a name next to the input file.
#   3. Run the script: python wuwa_ld.py
#
if __name__ == "__main__":
    input_file  = r"C:\path\to\your\Client.log"    # ← CHANGE THIS
    output_file = r"C:\path\to\your\output.log"    # ← CHANGE THIS  (or set to None)

    args = [input_file]
    if output_file:
        args.append(output_file)
    args.append("--verify")
    args.append("--force")   # re-running won't error if the output already exists

    main(args)
