from django.contrib.auth.models import User
from analysis.models import Professor

def get_professor(self):
    return Professor.objects.get(email=self.email)

User.add_to_class("professor", property(get_professor))
