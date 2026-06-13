FROM mcr.microsoft.com/devcontainers/python:1-3.12-bookworm

# Install uv from the official image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv
COPY --from=ghcr.io/astral-sh/uv:latest /uvx /usr/local/bin/uvx

ENV UV_LINK_MODE=copy \
    UV_COMPILE_BYTECODE=1
