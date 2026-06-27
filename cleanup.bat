@echo off
move "hero image.png" "frontend\public\hero_image.png"
move "logo.png" "frontend\public\logo.png"
del what_to_do.md
rmdir datasets
move fetch_real_boundaries.py scripts\
