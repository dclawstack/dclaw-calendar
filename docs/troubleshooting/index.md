# Troubleshooting

Common issues and solutions for DClaw Calendar.

## Quick Diagnostics

```bash
# Check app pods
kubectl get pods -n dclaw-calendar

# Check logs
kubectl logs -n dclaw-calendar deployment/dclaw-calendar-backend

# Check database
kubectl get clusters -n dclaw-calendar
```

## Sections

- [Common Issues](./common-issues)
- [FAQ](./faq)
