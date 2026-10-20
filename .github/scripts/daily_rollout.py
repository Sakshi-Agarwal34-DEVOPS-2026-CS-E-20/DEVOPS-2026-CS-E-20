#!/usr/bin/env python3
import json
import os
import subprocess
import sys

def run_cmd(cmd, check=True):
    print(f"Running: {' '.join(cmd)}")
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if result.stdout:
        print(result.stdout.strip())
    if result.stderr:
        print(result.stderr.strip(), file=sys.stderr)
    if check and result.returncode != 0:
        raise RuntimeError(f"Command failed with code {result.returncode}: {' '.join(cmd)}")
    return result

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    schedule_file = os.path.join(script_dir, "rollout_schedule.json")
    repo_root = os.path.abspath(os.path.join(script_dir, "..", ".."))

    os.chdir(repo_root)

    with open(schedule_file, "r", encoding="utf-8") as f:
        schedule = json.load(f)

    # Configure Git author
    run_cmd(["git", "config", "user.name", "Sakshi-Agarwal34"])
    run_cmd(["git", "config", "user.email", "agarwalseema61912@gmail.com"])

    # Ensure we have the latest branches
    run_cmd(["git", "fetch", "origin", "staging-rollout"])
    run_cmd(["git", "fetch", "origin", "main"])

    # Find the next pending day
    next_day = None
    for entry in schedule:
        day_num = entry["day"]
        files = entry["files"]
        # If any file in this day does not exist in working directory, this day is pending
        missing_files = [f for f in files if not os.path.exists(os.path.join(repo_root, f))]
        if missing_files:
            next_day = entry
            break

    if not next_day:
        print("All 10 days of rollout are complete! Nothing new to deploy.")
        return

    day_num = next_day["day"]
    files = next_day["files"]
    message = next_day["message"]

    print(f"\n==========================================")
    print(f"🚀 Deploying Day {day_num} / 10")
    print(f"Files: {files}")
    print(f"Commit: {message}")
    print(f"==========================================\n")

    # Checkout files from staging-rollout branch
    for file_path in files:
        run_cmd(["git", "checkout", "origin/staging-rollout", "--", file_path])
        run_cmd(["git", "add", file_path])

    # Commit and push
    commit_msg = f"{message} (Day {day_num} of 10)"
    run_cmd(["git", "commit", "-m", commit_msg])
    run_cmd(["git", "push", "origin", "main"])

    print(f"\n✅ Day {day_num} successfully committed and pushed to main!")

if __name__ == "__main__":
    main()
