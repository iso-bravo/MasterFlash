from datetime import time

def set_shift(current_time:time)->str:
    if time(7, 0) <= current_time <= time(16, 35):
        return 'First'
    elif time(16, 36) <= current_time or current_time <= time(1, 20):
        return 'Second'
    else:
        return 'Free' 
