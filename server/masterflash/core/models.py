from django.db import models

class LinePress(models.Model):
    name = models.CharField(max_length=50)
    status = models.CharField(max_length=50)
    comments = models.TextField(null=True, blank=True)

class StatePress(models.Model):
    name = models.CharField(max_length=50)
    shift = models.CharField(max_length=50, null=True, blank=True)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField(null=True, blank=True)
    total_time = models.FloatField(null=True, blank=True)
    state = models.CharField(max_length=50)
    employee_number = models.IntegerField(null=True, blank=True)
    comments = models.TextField(null=True, blank=True)

class StateTroquelado(models.Model):
    name = models.CharField(max_length=50)
    shift = models.CharField(max_length=50, null=True, blank=True)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField(null=True, blank=True)
    total_time = models.FloatField(null=True, blank=True)
    state = models.CharField(max_length=50)
    employee_number = models.IntegerField(null=True, blank=True)
    comments = models.TextField(null=True, blank=True)

class StateBarwell(models.Model):
    name = models.CharField(max_length=50)
    shift = models.CharField(max_length=50, null=True, blank=True)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField(null=True, blank=True)
    total_time = models.FloatField(null=True, blank=True)
    state = models.CharField(max_length=50)
    employee_number = models.IntegerField(null=True, blank=True)
    comments = models.TextField(null=True, blank=True)