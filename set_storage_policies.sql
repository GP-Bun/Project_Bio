-- Cho phép upload file mới vào cả hai bucket
create policy "Allow insert videos" on storage.objects for insert with check (bucket_id = 'videos');
create policy "Allow insert thumbnails" on storage.objects for insert with check (bucket_id = 'thumbnails');

-- Tùy chọn: Cho phép cập nhật và xóa (để test)
create policy "Allow update videos" on storage.objects for update using (bucket_id = 'videos');
create policy "Allow delete videos" on storage.objects for delete using (bucket_id = 'videos');

create policy "Allow update thumbnails" on storage.objects for update using (bucket_id = 'thumbnails');
create policy "Allow delete thumbnails" on storage.objects for delete using (bucket_id = 'thumbnails');
