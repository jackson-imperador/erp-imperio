# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-09

### Added
- FASE 33: Release Candidate (RC1) and Deploy Production setup.
- Dockerfiles for Backend (NestJS) and Frontend (Next.js).
- `docker-compose.yml` and `docker-compose.prod.yml` configured for production with PostgreSQL, Redis, MinIO, Nginx, Prometheus, and Grafana.
- Nginx Reverse Proxy with Gzip and Security Headers.
- Environment variables files (`.env.development`, `.env.homolog`, `.env.production`).
- CI/CD pipeline using GitHub Actions for build, lint, and test.
- Prometheus configuration for metrics scraping.
- Bash script (`scripts/backup.sh`) for automated backups of PostgreSQL and MinIO.
