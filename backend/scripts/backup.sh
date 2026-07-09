#!/bin/bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql