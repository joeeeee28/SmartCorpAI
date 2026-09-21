"""SmartCorp AI backend test suite.

These tests exercise the REAL knowledge pipeline and assert on task results
synchronously. The suite's established contract is eager Celery execution,
matching CI (CELERY_EAGER=True).

Enforce that contract here so the suite behaves identically regardless of
ambient environment. Production keeps CELERY_EAGER=False and uses the real
Celery worker.

The prefixed CELERY_TASK_ALWAYS_EAGER key is intentional: with Celery's
Django settings namespace, it overrides the corresponding Django setting
correctly.
"""
from config.celery import app as celery_app

celery_app.conf.update(
    CELERY_TASK_ALWAYS_EAGER=True,
    CELERY_TASK_EAGER_PROPAGATES=True,
)
