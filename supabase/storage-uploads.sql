-- Rode no SQL Editor do Supabase (uma vez) para liberar upload de fotos do admin.

insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read uploads" on storage.objects;
create policy "Public read uploads"
on storage.objects for select
using (bucket_id = 'uploads');

drop policy if exists "Authenticated upload uploads" on storage.objects;
create policy "Authenticated upload uploads"
on storage.objects for insert
to authenticated
with check (bucket_id = 'uploads');

drop policy if exists "Authenticated update uploads" on storage.objects;
create policy "Authenticated update uploads"
on storage.objects for update
to authenticated
using (bucket_id = 'uploads');

drop policy if exists "Authenticated delete uploads" on storage.objects;
create policy "Authenticated delete uploads"
on storage.objects for delete
to authenticated
using (bucket_id = 'uploads');
