import logging
import os

from django.core.management.base import CommandError
from django.db.models import Sum

from kolibri.core.content.models import ChannelMetadata
from kolibri.core.content.models import LocalFile
from kolibri.core.content.utils.content_delete import delete_metadata
from kolibri.core.content.utils.paths import get_content_database_file_path
from kolibri.core.tasks.management.commands.base import AsyncCommand
from kolibri.core.tasks.utils import get_current_job
from kolibri.core.utils.lock import db_lock

logger = logging.getLogger(__name__)


class Command(AsyncCommand):
    def add_arguments(self, parser):
        parser.add_argument("channel_id", type=str)
        # However, some optional arguments apply to both groups. Add them here!
        node_ids_help_text = """
        Specify one or more node IDs to delete. Only these ContentNodes and descendants will be deleted.

        e.g.

        kolibri manage deletecontent --node_ids <id1>,<id2>,[<ids>,...] <channel id>
        """
        parser.add_argument(
            "--node_ids",
            "-n",
            # Split the comma separated string we get, into a list of strings
            type=lambda x: x.split(","),
            default=[],
            required=False,
            dest="node_ids",
            help=node_ids_help_text,
        )

        exclude_node_ids_help_text = """
        Specify one or more node IDs to exclude. Descendants of these node IDs will be not be deleted.

        e.g.

        kolibri manage deletecontent --exclude_node_ids <id1>,<id2>,[<ids>,...] <channel id>
        """
        parser.add_argument(
            "--exclude_node_ids",
            # Split the comma separated string we get, into a list of string
            type=lambda x: x.split(","),
            default=[],
            required=False,
            dest="exclude_node_ids",
            help=exclude_node_ids_help_text,
        )
        parser.add_argument(
            "-f",
            "--force_delete",
            action="store_true",
            dest="force_delete",
            default=False,
            help="Ensure removal of files",
        )

        parser.add_argument(
            "--ignore_admin_flags",
            action="store_false",
            dest="ignore_admin_flags",
            default=True,
            help="Don't modify admin_imported values when deleting content",
        )

        parser.add_argument(
            "--update_content_requests",
            action="store_false",
            dest="update_content_requests",
            default=True,
            help="Don't modify the status of ContentRequests pointing at the deleted content",
        )

    def handle_async(self, *args, **options):
        channel_id = options["channel_id"]
        node_ids = options["node_ids"]
        exclude_node_ids = options["exclude_node_ids"]
        force_delete = options["force_delete"]
        ignore_admin_flags = options["ignore_admin_flags"]
        update_content_requests = options["update_content_requests"]

        try:
            channel = ChannelMetadata.objects.get(pk=channel_id)
        except ChannelMetadata.DoesNotExist:
            raise CommandError(
                "Channel matching id {id} does not exist".format(id=channel_id)
            )

        (total_resource_number, delete_all_metadata,) = delete_metadata(
            channel,
            node_ids,
            exclude_node_ids,
            force_delete,
            ignore_admin_flags,
            update_content_requests,
        )
        unused_files = LocalFile.objects.get_unused_files()
        # Get the number of files that are being deleted
        unused_files_count = unused_files.count()
        deleted_bytes = unused_files.aggregate(size=Sum("file_size"))["size"] or 0

        job = get_current_job()
        if job:
            job.extra_metadata["file_size"] = deleted_bytes
            job.extra_metadata["total_resources"] = total_resource_number
            job.save_meta()
        progress_extra_data = {"channel_id": channel_id}
        additional_progress = sum((1, bool(delete_all_metadata)))
        total_progress = 0
        target_progress = unused_files_count + additional_progress
        with self.start_progress(total=target_progress) as progress_update:

            for _ in LocalFile.objects.delete_unused_files():
                progress_update(1, progress_extra_data)
                total_progress += 1

            with db_lock():
                LocalFile.objects.delete_orphan_file_objects()

            progress_update(1, progress_extra_data)

            if delete_all_metadata:
                try:
                    os.remove(get_content_database_file_path(channel_id))
                except OSError:
                    pass

                progress_update(1, progress_extra_data)

            progress_update(target_progress - total_progress, progress_extra_data)
