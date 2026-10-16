-- NomerOk — обновление 23: адрес места по-русски (в открытых картах адреса чаще на грузинском или английском).
alter table public.places add column if not exists addr_ru text;
