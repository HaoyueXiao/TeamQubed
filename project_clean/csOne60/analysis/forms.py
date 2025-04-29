from django import forms

class StudentCSVUploadForm(forms.Form):
    csv_file = forms.FileField()

class TestTakenUploadForm(forms.Form):
    csv_file = forms.FileField(label="Upload CSV for Exam Scores")
