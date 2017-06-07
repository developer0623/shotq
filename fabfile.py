# coding: utf-8
import os
from fabric.api import cd, run, env, local
from fabric.context_managers import settings, prefix, shell_env, lcd
from fabric.decorators import roles


current_dir = os.path.dirname(__file__)
env.forward_agent = True
env.hosts = ['188.166.63.35']
env.user = 'web'
env.pull = 'git pull'
env.project_path = '/web/shootq-ui'
env.webpack_path = '/web/shootq-ui/Application'
env.activate = 'source /web/timer2/venv/bin/activate'
env.node_version = '6.9.1'
docker_registry = 'registry.gitlab.com/gearheart.io/shootq-ui'
default_oauth_url = 'http://shootq-base.test.gearheart.io'
default_api_url = 'http://shootq-base.test.gearheart.io/api/v1'
build_docker_file = './Application/Dockerfile-build'
dev_container_name = 'shootq-ui'


def dev():
    pass


def update(branch=None):
    with prefix('source /home/web/.nvm/nvm.sh'):
        with cd(env.project_path):
            if branch:
                run('git fetch')
                run('git checkout {}'.format(branch))
            run('git pull')
        with cd(env.webpack_path):
            run('npm i')
            with settings(warn_only=True):
                run('npm run build:prod')
        run('sudo service nginx restart -s')


def _generate_tag(tag=None):
    if tag is None:
        current_branch = local('git rev-parse --abbrev-ref HEAD', capture=True)
        tag = current_branch.replace('/', '_').replace('-', '_')
    return tag


def _get_docker_image_name(tag=None):
    tag = _generate_tag(tag=tag)
    return '{}:{}'.format(docker_registry, tag)


def docker_create_build_image(tag=None):
    tag = _generate_tag(tag=tag)
    build_image_name = 'shootq-ui-build:{}'.format(tag)
    local('docker build --file {} -t {} ./Application'.format(
        build_docker_file,
        build_image_name))


def docker_create_prod_image(tag=None, oauth_url=default_oauth_url,
                             api_url=default_api_url,
                             build_image_tag=None):
    image_name = _get_docker_image_name(tag=tag)
    tag = _generate_tag(tag=tag)
    build_image_name = 'shootq-ui-build:{}'.format(build_image_tag or tag)
    app_dir = '{}/Application'.format(current_dir)
    app_volume = '{}:/code/shootq-ui'.format(app_dir)
    envs = '-e "API_URL={}" -e "OAUTH_URL={}"'.format(api_url, oauth_url)
    local('docker run -it -v {0} {1} -u node --rm {2} run build:prod'.format(
        app_volume,
        envs,
        build_image_name))
    local('docker build -t {} ./Application'.format(image_name))


def docker_push_prod_image(tag=None):
    image_name = _get_docker_image_name(tag=tag)
    local('docker push {}'.format(image_name))


def update_do(tag=None, oauth_url=default_oauth_url, api_url=default_api_url):
    with shell_env(API_URL=default_api_url, OAUTH_URL=oauth_url):
        with lcd('./Application'):
            local('npm run build:prod')
    image_name = _get_docker_image_name(tag=tag)
    local('docker build -t {} ./Application'.format(image_name))
    local('docker push {}'.format(image_name))
    with settings(warn_only=True):
        run('docker stop {}'.format(dev_container_name))
        run('docker rm {}'.format(dev_container_name))
        run('docker system prune -a -f')
    run('docker run -it -p 8000:80 -d --name {} {}'.format(
        dev_container_name, image_name))
