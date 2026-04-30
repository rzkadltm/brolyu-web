# Security Policy

## Supported Versions

We release security patches for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| latest  | :white_check_mark: |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability in Brolyu, please disclose it responsibly by emailing us at **security@brolyu.com**. We will acknowledge receipt within 48 hours and aim to provide a fix within 7 days for critical issues.

Please include:

- A description of the vulnerability and its potential impact
- Steps to reproduce or proof-of-concept code
- Any suggested mitigations, if known

We appreciate responsible disclosure and will credit researchers in our release notes (unless you prefer to remain anonymous).

## Security Best Practices for Contributors

- Never commit secrets, API keys, or credentials
- Use environment variables for all sensitive configuration (see `.env.example`)
- Keep dependencies up to date and audit with `npm audit` before submitting PRs
- Follow OWASP guidelines when handling user data or authentication flows
- WebRTC signaling endpoints must enforce authentication and rate limiting
