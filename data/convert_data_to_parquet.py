"""
Compress docs/data/data.csv by:
- rounding float columns (reduces text noise / improves compression)
- downcasting numeric columns (smaller in-memory + parquet footprint)
- converting repeated strings to categoricals (effective in parquet)

Outputs (in the same folder as input):
- data.parquet (brotli-compressed)  <-- highest impact
- data.csv.gz (optional)            <-- smaller CSV for compatibility
"""

from __future__ import annotations

import argparse
from pathlib import Path

import pandas as pd


FLOAT_COLS = [
    "valence",
    "acousticness",
    "danceability",
    "energy",
    "instrumentalness",
    "liveness",
    "loudness",
    "speechiness",
    "tempo",
]


def optimize_dataframe(df: pd.DataFrame, *, round_decimals: int) -> pd.DataFrame:
    # Round floats first (also shrinks CSV output and improves parquet compression)
    existing_float_cols = [c for c in FLOAT_COLS if c in df.columns]
    if existing_float_cols:
        df[existing_float_cols] = df[existing_float_cols].round(round_decimals)
        df[existing_float_cols] = df[existing_float_cols].astype("float32")

    # Downcast integers where ranges are known/safe
    for col, dtype in [
        ("year", "int16"),
        ("popularity", "int8"),
        ("key", "int8"),
        ("mode", "int8"),
        ("explicit", "int8"),
        ("duration_ms", "int32"),
    ]:
        if col in df.columns:
            # Use pandas nullable ints if NA shows up
            if df[col].isna().any():
                df[col] = df[col].astype(dtype.replace("int", "Int"))
            else:
                df[col] = df[col].astype(dtype)

    # Strings: artists repeats a lot; category helps parquet/pickle
    for col in ["artists"]:
        if col in df.columns:
            df[col] = df[col].astype("category")

    return df


def human_bytes(n: int) -> str:
    units = ["B", "KB", "MB", "GB", "TB"]
    size = float(n)
    for u in units:
        if size < 1024 or u == units[-1]:
            return f"{size:.2f} {u}"
        size /= 1024
    return f"{n} B"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--input",
        type=Path,
        default=Path(__file__).with_name("data.csv"),
        help="Path to input CSV (default: docs/data/data.csv)",
    )
    parser.add_argument(
        "--parquet",
        type=Path,
        default=None,
        help="Output parquet path (default: alongside input as data.parquet)",
    )
    parser.add_argument(
        "--write-gzip-csv",
        action="store_true",
        help="Also write a gzipped CSV (data.csv.gz) alongside the parquet.",
    )
    parser.add_argument(
        "--round",
        type=int,
        default=4,
        help="Decimal places to round float columns to (default: 4).",
    )
    args = parser.parse_args()

    input_csv = args.input
    if not input_csv.exists():
        raise FileNotFoundError(f"Input not found: {input_csv}")

    parquet_path = args.parquet or input_csv.with_suffix(".parquet")
    gzip_csv_path = input_csv.with_suffix(".csv.gz")

    in_size = input_csv.stat().st_size
    print(f"Input:  {input_csv}  ({human_bytes(in_size)})")

    # Keep release_date as string (mix of YYYY and YYYY-MM-DD)
    df = pd.read_csv(input_csv, low_memory=False, dtype={"release_date": "string"})
    df = optimize_dataframe(df, round_decimals=args.round)

    # Parquet (highest impact). Brotli gives strong reduction.
    df.to_parquet(parquet_path, index=False, compression="brotli")
    out_pq_size = parquet_path.stat().st_size
    print(f"Parquet: {parquet_path}  ({human_bytes(out_pq_size)})")

    if args.write_gzip_csv:
        df.to_csv(gzip_csv_path, index=False, compression="gzip")
        out_gz_size = gzip_csv_path.stat().st_size
        print(f"Gz CSV: {gzip_csv_path}  ({human_bytes(out_gz_size)})")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

