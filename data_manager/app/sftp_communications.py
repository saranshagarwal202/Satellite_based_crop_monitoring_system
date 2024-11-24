import paramiko
from os import environ, path
from logging import getLogger



def _sftp_exists_(sftp, path):
    try:
        sftp.stat(path)
        return True
    except FileNotFoundError:
        return False


def _sftp_mkdir_(sftp, remote_directory):
    """Change to this directory, recursively making new folders if needed.
    Returns True if any folders were created."""
    if remote_directory == '/':
        # absolute path so change directory to root
        sftp.chdir('/')
        return
    if remote_directory == '':
        # top-level relative directory must exist
        return
    try:
        sftp.chdir(remote_directory)  # sub-directory exists
    except IOError:
        dirname, basename = path.split(remote_directory.rstrip('/'))
        _sftp_mkdir_(sftp, dirname)  # make parent directories
        sftp.mkdir(basename)  # sub-directory missing, so created it
        sftp.chdir(basename)
        return True

def save_tif(image: bytes, imageId: str, userId: str, projectId: str):
    logger = getLogger()
    try:
        transport = paramiko.Transport(
            (environ.get("SFTP_HOST"), int(environ.get("SFTP_PORT"))))
        transport.connect(None, environ.get("SFTP_USER"),
                          environ.get("SFTP_PASS"))
        sftp = paramiko.SFTPClient.from_transport(transport)
        if not _sftp_exists_(sftp, f"/upload/crop_yield_prediction/{userId}/{projectId}/"):
            _sftp_mkdir_(sftp, f"/upload/crop_yield_prediction/{userId}/{projectId}/")
        file = sftp.open(f"/upload/crop_yield_prediction/{userId}/{projectId}/{imageId}.tif", "wb")
        file.write(image)

        file.close()
        sftp.close()
        transport.close()

    except BaseException as e:
        try:
            sftp.close()
        except BaseException:
            pass
        try:
            transport.close()
        except BaseException:
            pass
        logger.error(f"userId: {userId} projectId: {projectId} imageId: {imageId} failed to save tif in sftp.")
        raise e

def save_png(image: bytes, image_type: str, imageId: str, userId: str, projectId: str):
    logger = getLogger()
    try:
        transport = paramiko.Transport(
            (environ.get("SFTP_HOST"), int(environ.get("SFTP_PORT"))))
        transport.connect(None, environ.get("SFTP_USER"),
                          environ.get("SFTP_PASS"))
        sftp = paramiko.SFTPClient.from_transport(transport)
        if not _sftp_exists_(sftp, f"/upload/crop_yield_prediction/{userId}/{projectId}/"):
            _sftp_mkdir_(sftp, f"/upload/crop_yield_prediction/{userId}/{projectId}/")
        file = sftp.open(f"/upload/crop_yield_prediction/{userId}/{projectId}/{imageId}.{image_type}.png", "wb")
        file.write(image)

        file.close()
        sftp.close()
        transport.close()

    except BaseException as e:
        try:
            sftp.close()
        except BaseException:
            pass
        try:
            transport.close()
        except BaseException:
            pass
        logger.error(f"userId: {userId} projectId: {projectId} imageId: {imageId} failed to save tif in sftp.")
        raise e

def load_png(image_type: str, imageId: str, userId: str, projectId: str):
    logger = getLogger()

    try:
        imageId = imageId.replace('-', '')
        transport = paramiko.Transport(
            (environ.get("SFTP_HOST"), int(environ.get("SFTP_PORT"))))
        transport.connect(None, environ.get("SFTP_USER"),
                          environ.get("SFTP_PASS"))
        sftp = paramiko.SFTPClient.from_transport(transport)

        # imageId is a string here like '2023-05-17' reference an image
        files_image_ids = sftp.listdir(f"/upload/crop_yield_prediction/{userId}/{projectId}/")
        for file_name in files_image_ids:
            file_splitted = file_name.split('.')
            if len(file_splitted)==3:
                if file_splitted[1]==image_type and file_splitted[0][:8] == imageId:
                    
                    found_file_name = file_name
                    break

        file = sftp.open(f"/upload/crop_yield_prediction/{userId}/{projectId}/{found_file_name}", "rb")
        image = file.read()

        file.close()
        sftp.close()
        transport.close()

        return image

    except BaseException as e:
        try:
            sftp.close()
        except BaseException:
            pass
        try:
            transport.close()
        except BaseException:
            pass
        logger.error(f"userId: {userId} projectId: {projectId} imageId: {imageId} failed to save tif in sftp.")
        raise e


def _sftp_exists_(sftp, path):
    try:
        sftp.stat(path)
        return True
    except FileNotFoundError:
        return False
