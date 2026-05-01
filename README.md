# GitHub Branch Manager

A small utility for keeping a GitHub repository's branch list tidy — list, audit, and prune branches without clicking through the GitHub UI one at a time.

## Stack

- **Language:** C# / .NET (console)
- **GitHub access:** Octokit.NET (via a Personal Access Token)
- **Configuration:** appsettings + user secrets
- **Logging:** Microsoft.Extensions.Logging

## What it does

A focused tool aimed at the moment when a long-running repo has accumulated dozens of stale branches and someone has to decide what's safe to remove. Typical commands:

- **List** every branch with its last-commit author, last-commit date, and merged-into-default state.
- **Filter** for branches that are merged into `main`, branches older than N days, or branches matching a name pattern.
- **Delete** the filtered set in bulk after a confirmation prompt — or run with `--dry-run` to preview.
- **Audit** the remaining branches to spot ones that are behind / ahead of the default by an unhealthy margin.

The point is to make a routine clean-up a one-command operation rather than a thirty-tab afternoon.

## Running locally

```bash
# 1. Provide a token with `repo` (or `public_repo` for public-only) scope
dotnet user-secrets set "GitHub:Token" "ghp_…"

# 2. Point it at a repo
dotnet run -- list   --owner ipelengmekgwe --repo my-repo
dotnet run -- prune  --owner ipelengmekgwe --repo my-repo --merged --dry-run
```

## Status

A working pet-tool I reach for occasionally. Not packaged for distribution; treat as a small productivity helper rather than a polished CLI. Open to extending with a watch-mode that warns when a stale branch crosses an age threshold.

---

Part of [Ipeleng's portfolio](https://github.com/ipelengmekgwe/portfolio).
