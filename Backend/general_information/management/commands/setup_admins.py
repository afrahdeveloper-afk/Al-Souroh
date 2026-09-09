import os
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Create superusers from environment variables'

    def handle(self, *args, **options):
        dev_username = os.environ.get('DEV_SUPERUSER_USERNAME')
        dev_email = os.environ.get('DEV_SUPERUSER_EMAIL')
        dev_password = os.environ.get('DEV_SUPERUSER_PASSWORD')

        if dev_username and dev_email and dev_password:
            if not User.objects.filter(username=dev_username).exists():
                User.objects.create_superuser(username=dev_username, email=dev_email, password=dev_password)
                self.stdout.write(self.style.SUCCESS(f"Successfully created dev superuser: {dev_username}"))
            else:
                user = User.objects.get(username=dev_username)
                user.set_password(dev_password)
                user.email = dev_email
                user.is_superuser = True
                user.is_staff = True
                user.save()
                self.stdout.write(self.style.SUCCESS(f"Updated dev superuser: {dev_username}"))
        else:
            self.stdout.write(self.style.WARNING("DEV_SUPERUSER_* environment variables missing. Skipping dev superuser creation."))

        client_username = os.environ.get('CLIENT_ADMIN_USERNAME')
        client_email = os.environ.get('CLIENT_ADMIN_EMAIL')
        client_password = os.environ.get('CLIENT_ADMIN_PASSWORD')

        if client_username and client_email and client_password:
            if not User.objects.filter(username=client_username).exists():
                User.objects.create_superuser(username=client_username, email=client_email, password=client_password)
                self.stdout.write(self.style.SUCCESS(f"Successfully created client admin: {client_username}"))
            else:
                user = User.objects.get(username=client_username)
                user.set_password(client_password)
                user.email = client_email
                user.is_superuser = True
                user.is_staff = True
                user.save()
                self.stdout.write(self.style.SUCCESS(f"Updated client admin: {client_username}"))
        else:
            self.stdout.write(self.style.WARNING("CLIENT_ADMIN_* environment variables missing. Skipping client admin creation."))
