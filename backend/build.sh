set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate
# Ensure media upload directories exist (Render ephemeral disk)
mkdir -p media/profile
mkdir -p media/projects
mkdir -p media/resume