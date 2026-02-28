"""
Generate small "insight_*.csv" files from the main dataset.

Default input: docs/data/data.csv
Outputs: insight_1_loudness.csv ... insight_10_fitness.csv (alongside the input file)
"""

from __future__ import annotations

import argparse
from pathlib import Path

import pandas as pd


NEEDED_COLS = [
    "year",
    "release_date",
    "loudness",
    "danceability",
    "valence",
    "duration_ms",
    "explicit",
    "acousticness",
    "energy",
    "liveness",
    "speechiness",
    "mode",
]


def load_df(path: Path) -> pd.DataFrame:
    if path.suffix.lower() == ".parquet":
        return pd.read_parquet(path, columns=NEEDED_COLS)

    # Keep release_date as string (mix of YYYY and YYYY-MM-DD).
    return pd.read_csv(
        path,
        low_memory=False,
        usecols=NEEDED_COLS,
        dtype={"release_date": "string"},
    )


def prepare_grouping_cols(df: pd.DataFrame) -> pd.DataFrame:
    # Convert year to real numbers for grouping
    df["year"] = pd.to_numeric(df["year"], errors="coerce").astype("Int16")
    df = df.dropna(subset=["year"]).copy()
    df["year"] = df["year"].astype("int16")

    # Extract month for seasonality insights (1 = Jan, 12 = Dec)
    df["month"] = pd.to_datetime(df["release_date"], errors="coerce").dt.month.astype(
        "Int8"
    )

    return df


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--input",
        type=Path,
        default=Path(__file__).with_name("data.csv"),
        help="Path to input dataset (CSV or parquet). Default: docs/data/data.csv",
    )
    parser.add_argument(
        "--out-dir",
        type=Path,
        default=None,
        help="Output directory (default: alongside input file).",
    )
    args = parser.parse_args()

    input_path: Path = args.input
    if not input_path.exists():
        raise FileNotFoundError(f"Input not found: {input_path}")

    out_dir: Path = args.out_dir or input_path.parent
    out_dir.mkdir(parents=True, exist_ok=True)

    df = load_df(input_path)
    df = prepare_grouping_cols(df)

    # 1) Loudness War
    df_1 = df.groupby("year")["loudness"].mean().reset_index()
    df_1.to_csv(out_dir / "insight_1_loudness.csv", index=False)

    # 2) Sad Banger
    df_2 = df.groupby("year")[["danceability", "valence"]].mean().reset_index()
    df_2.to_csv(out_dir / "insight_2_sad_banger.csv", index=False)

    # 3) Attention Span (duration_sec)
    df_3 = df.groupby("year")["duration_ms"].mean().reset_index()
    df_3["duration_sec"] = (df_3["duration_ms"] / 1000).round().astype("int16")
    df_3[["year", "duration_sec"]].to_csv(out_dir / "insight_3_duration.csv", index=False)

    # 4) Explicit tipping point (ratio)
    df_4 = df.groupby("year")["explicit"].mean().reset_index()
    df_4.columns = ["year", "explicit_ratio"]
    df_4.to_csv(out_dir / "insight_4_explicit.csv", index=False)

    # 5) Seasonality curves (month 1-12)
    df_5 = df.groupby("month")[["valence", "acousticness", "energy"]].mean().reset_index()
    df_5.to_csv(out_dir / "insight_5_seasonality.csv", index=False)

    # 6) Live music "death"
    df_6 = df.groupby("year")["liveness"].mean().reset_index()
    df_6.to_csv(out_dir / "insight_6_liveness.csv", index=False)

    # 7) Complex vs simple (speechiness)
    df_7 = df.groupby("year")["speechiness"].mean().reset_index()
    df_7.to_csv(out_dir / "insight_7_speechiness.csv", index=False)

    # 8) Major/minor shift (ratio of major keys)
    df_8 = df.groupby("year")["mode"].mean().reset_index()
    df_8.columns = ["year", "major_key_ratio"]
    df_8.to_csv(out_dir / "insight_8_modes.csv", index=False)

    # 9) Organic vs synthetic (acousticness)
    df_9 = df.groupby("year")["acousticness"].mean().reset_index()
    df_9.to_csv(out_dir / "insight_9_acousticness.csv", index=False)

    # 10) Fitness correlation (energy vs danceability)
    df_10 = df.groupby("year")[["energy", "danceability"]].mean().reset_index()
    df_10.to_csv(out_dir / "insight_10_fitness.csv", index=False)

    print(f"Wrote 10 insight CSVs to: {out_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

