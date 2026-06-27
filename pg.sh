sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'hms2035';"
sudo -u postgres createdb feecollectionapp || true
cd /root/FeeCollectionApp
npx prisma db push
npx prisma generate
npx tsx seed-user.ts
