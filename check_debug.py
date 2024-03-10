import sys


def check_debug_in_settings(file_path='basilandthyme/settings.py'):
    with open(file_path) as file:
        if 'DEBUG = True' in file.read():
            print(f'DEBUG is set to True in {file_path}, commit aborted.')
            return 1
    return 0


if __name__ == '__main__':
    sys.exit(check_debug_in_settings())
