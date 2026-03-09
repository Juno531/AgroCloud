import pkg from './node_modules/.cache/pgtemp/node_modules/pg/lib/index.js';
const { Client } = pkg;
const client = new Client({ 
  connectionString: process.env.DATABASE_PUBLIC_URL, 
  ssl: { rejectUnauthorized: false } 
});
await client.connect();
// 현재 제약조건 확인
const res = await client.query(
  "SELECT conname, pg_get_constraintdef(c.oid) as def FROM pg_constraint c WHERE conname = 'attendance_records_status_check'"
);
console.log('제약조건:', JSON.stringify(res.rows, null, 2));
await client.end();
