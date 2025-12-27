# Ramblings of a Coder's Mind (Source)

Source for the "Ramblings of a Coder's Mind" blog that's hosted at [karun.me](https://karun.me) (previously [blog.karun.me](https://blog.karun.me) and [karunab.com](https://karunab.com))

## Quick Start

```bash
./scripts/setup.sh   # One-time setup (installs Ruby 3.2, just, dependencies)
just run             # Start dev server at http://localhost:4000
```

Run `just --list` to see all available commands.

## Local Development

See [docs/context/DEVELOPMENT.md](docs/context/DEVELOPMENT.md) for detailed documentation.

### Common Commands

```bash
just run              # Start dev server (~1s startup)
just test             # Run all tests (lint + e2e)
just lint             # Run all linters
just new-post "Title" # Create a new blog post
```

### Without `just`

If you prefer not to install `just`, you can use the underlying scripts directly:

```bash
./local_run_native.sh              # Start dev server
npm test                           # Run all tests
./scripts/new-post.sh "Title"      # Create a new blog post
```
