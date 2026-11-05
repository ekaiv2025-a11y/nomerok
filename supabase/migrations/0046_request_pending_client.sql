-- NomerOk — обновление 46: заявка ждёт, пока клиент подключит Telegram или войдёт на сайт.
-- До подтверждения её не получают специалисты и её нет в ленте «Кого ищут сейчас».
alter table public.requests add column if not exists pending_client boolean not null default false;
