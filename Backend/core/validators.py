"""
Shared image-upload validators.

Protocol: every image field in this project must accept modern formats
(AVIF, WebP) alongside the standard ones. AVIF isn't recognized by Pillow
out of the box, so `pillow-avif-plugin` is imported here (once, at process
start) to register the codec before any ImageField validation runs.
"""
import pillow_avif

from django.core.validators import FileExtensionValidator

IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'avif']
IMAGE_EXTENSIONS_WITH_GIF = IMAGE_EXTENSIONS + ['gif']

image_extension_validator = FileExtensionValidator(allowed_extensions=IMAGE_EXTENSIONS)
image_with_gif_extension_validator = FileExtensionValidator(allowed_extensions=IMAGE_EXTENSIONS_WITH_GIF)
