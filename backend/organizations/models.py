from django.db import models
from django.utils.text import slugify


class Organization(models.Model):
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.name)[:240] or 'org'
            candidate, i = base, 1
            while Organization.objects.filter(slug=candidate).exclude(pk=self.pk).exists():
                i += 1
                candidate = f'{base}-{i}'
            self.slug = candidate
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.name


class Department(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='departments')
    name = models.CharField(max_length=255)
    head = models.ForeignKey('accounts.User', null=True, blank=True, on_delete=models.SET_NULL, related_name='headed_departments')
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['name']
        constraints = [models.UniqueConstraint(fields=['organization', 'name'], name='uniq_dept_per_org')]

    def __str__(self) -> str:
        return f'{self.organization.slug}/{self.name}'
