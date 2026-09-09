import io
import os
import shutil
import tempfile

from PIL import Image

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from .models import (
    HomePageImages,
    AboutUsImages,
    ServicesPageImage,
    ProjectsPageImage,
    NewsPageImage,
    ContactUsPageImage,
)

User = get_user_model()


def make_image_file(name='image.png', color='red', fmt='PNG'):
    buf = io.BytesIO()
    Image.new('RGB', (2, 2), color=color).save(buf, format=fmt)
    buf.seek(0)
    return SimpleUploadedFile(name, buf.read(), content_type=f'image/{fmt.lower()}')


def make_invalid_file(name='not-an-image.txt'):
    return SimpleUploadedFile(name, b'plain text content, not an image', content_type='text/plain')


class SingletonImagesEndpointTestsBase(TestCase):
    """
    Shared behavior contract for every static-images singleton endpoint.
    Concrete subclasses (built by `_make_case` below) set model / url_name / field_names.
    """
    model = None
    url_name = None
    field_names = None

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        if cls is SingletonImagesEndpointTestsBase:
            return
        cls._media_root = tempfile.mkdtemp()
        cls._override = override_settings(MEDIA_ROOT=cls._media_root)
        cls._override.enable()

    @classmethod
    def tearDownClass(cls):
        if cls is not SingletonImagesEndpointTestsBase:
            cls._override.disable()
            shutil.rmtree(cls._media_root, ignore_errors=True)
        super().tearDownClass()

    def setUp(self):
        if self.model is None:
            self.skipTest('base class')
        self.url = reverse(self.url_name)
        self.user = User.objects.create_user(username='tester', password='pass12345')
        self.client = APIClient()

    def _valid_payload(self, seed=''):
        return {name: make_image_file(f'{name}{seed}.png') for name in self.field_names}

    def _create_instance(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(self.url, self._valid_payload(), format='multipart')
        assert response.status_code == status.HTTP_201_CREATED, response.data
        self.client.force_authenticate(None)
        return self.model.objects.first()


    def test_get_when_empty_returns_empty_object(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {})

    def test_get_is_public_and_returns_all_fields(self):
        self._create_instance()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for name in self.field_names:
            self.assertIn(name, response.data)
            self.assertTrue(response.data[name])


    def test_post_requires_authentication(self):
        response = self.client.post(self.url, self._valid_payload(), format='multipart')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(self.model.objects.exists())

    def test_post_creates_when_authenticated(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(self.url, self._valid_payload(), format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(self.model.objects.count(), 1)

    def test_post_fails_when_already_exists(self):
        self._create_instance()
        self.client.force_authenticate(self.user)
        response = self.client.post(self.url, self._valid_payload('-2'), format='multipart')
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(self.model.objects.count(), 1)

    def test_post_fails_with_missing_required_field(self):
        self.client.force_authenticate(self.user)
        payload = self._valid_payload()
        missing = self.field_names[0]
        payload.pop(missing)
        response = self.client.post(self.url, payload, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(missing, response.data)
        self.assertFalse(self.model.objects.exists())

    def test_post_fails_with_non_image_content(self):
        self.client.force_authenticate(self.user)
        payload = self._valid_payload()
        payload[self.field_names[0]] = make_invalid_file()
        response = self.client.post(self.url, payload, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(self.model.objects.exists())

    def test_post_fails_with_disallowed_extension_on_real_image(self):
        self.client.force_authenticate(self.user)
        payload = self._valid_payload()
        payload[self.field_names[0]] = make_image_file(name='sneaky.bmp')
        response = self.client.post(self.url, payload, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(self.model.objects.exists())

    def test_post_accepts_webp_and_avif(self):
        self.client.force_authenticate(self.user)
        payload = self._valid_payload()
        payload[self.field_names[0]] = make_image_file(name='modern.webp', fmt='WEBP')
        if len(self.field_names) > 1:
            payload[self.field_names[1]] = make_image_file(name='modern.avif', fmt='AVIF')
        response = self.client.post(self.url, payload, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)


    def test_put_fails_when_not_created(self):
        self.client.force_authenticate(self.user)
        response = self.client.put(self.url, self._valid_payload(), format='multipart')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_put_requires_authentication(self):
        self._create_instance()
        response = self.client.put(self.url, self._valid_payload('-2'), format='multipart')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_put_replaces_all_files_and_deletes_old_ones(self):
        instance = self._create_instance()
        old_paths = [getattr(instance, name).path for name in self.field_names]
        for path in old_paths:
            self.assertTrue(os.path.isfile(path))

        self.client.force_authenticate(self.user)
        response = self.client.put(self.url, self._valid_payload('-2'), format='multipart')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        for path in old_paths:
            self.assertFalse(os.path.isfile(path), f'old file {path} should have been deleted')

        instance.refresh_from_db()
        for name in self.field_names:
            self.assertTrue(os.path.isfile(getattr(instance, name).path))


    def test_patch_fails_when_not_created(self):
        self.client.force_authenticate(self.user)
        response = self.client.patch(
            self.url, {self.field_names[0]: make_image_file()}, format='multipart'
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_patch_requires_authentication(self):
        self._create_instance()
        response = self.client.patch(
            self.url, {self.field_names[0]: make_image_file()}, format='multipart'
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_patch_replaces_only_targeted_field(self):
        if len(self.field_names) < 2:
            self.skipTest('needs at least two image fields to prove others are left untouched')
        instance = self._create_instance()
        target = self.field_names[0]
        untouched = self.field_names[-1]
        old_target_path = getattr(instance, target).path
        old_untouched_path = getattr(instance, untouched).path

        self.client.force_authenticate(self.user)
        response = self.client.patch(
            self.url, {target: make_image_file('replacement.png')}, format='multipart'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        instance.refresh_from_db()
        self.assertFalse(os.path.isfile(old_target_path))
        self.assertTrue(os.path.isfile(getattr(instance, target).path))
        self.assertEqual(getattr(instance, untouched).path, old_untouched_path)
        self.assertTrue(os.path.isfile(old_untouched_path))


    def test_delete_fails_when_not_created(self):
        self.client.force_authenticate(self.user)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_requires_authentication(self):
        self._create_instance()
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(self.model.objects.count(), 1)

    def test_delete_removes_record_and_files_from_disk(self):
        instance = self._create_instance()
        paths = [getattr(instance, name).path for name in self.field_names]

        self.client.force_authenticate(self.user)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(self.model.objects.exists())
        for path in paths:
            self.assertFalse(os.path.isfile(path))


def _make_case(name, model, url_name, field_names):
    return type(name, (SingletonImagesEndpointTestsBase,), {
        'model': model,
        'url_name': url_name,
        'field_names': field_names,
    })


HomePageImagesEndpointTests = _make_case(
    'HomePageImagesEndpointTests', HomePageImages, 'static-images-home-page',
    [
        'first_step_image', 'second_step_image', 'third_step_image', 'fourth_step_image',
        'story_image', 'case_study_before_image', 'case_study_after_image',
        'process_image_first', 'process_image_second', 'process_image_third',
        'process_image_fourth', 'process_image_fifth', 'process_image_sixth', 'end_image',
    ],
)

AboutUsImagesEndpointTests = _make_case(
    'AboutUsImagesEndpointTests', AboutUsImages, 'static-images-about-us',
    ['main_image', 'center_image_first', 'center_image_second', 'center_image_third', 'center_image_fourth'],
)

ServicesPageImageEndpointTests = _make_case(
    'ServicesPageImageEndpointTests', ServicesPageImage, 'static-images-services', ['main_image'],
)

ProjectsPageImageEndpointTests = _make_case(
    'ProjectsPageImageEndpointTests', ProjectsPageImage, 'static-images-projects', ['main_image'],
)

NewsPageImageEndpointTests = _make_case(
    'NewsPageImageEndpointTests', NewsPageImage, 'static-images-news', ['main_image'],
)

ContactUsPageImageEndpointTests = _make_case(
    'ContactUsPageImageEndpointTests', ContactUsPageImage, 'static-images-contact-us', ['main_image'],
)
