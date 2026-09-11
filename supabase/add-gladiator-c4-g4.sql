-- Adds the CFMOTO GLADIATOR C4 G4 to a live database. Safe to run more than once.
insert into public.products (slug, brand, category, name, price, homologation, cc, power, drive, short, specs, colors, tags, status, stock, featured, sort)
values (
  'cfmoto-gladiator-c4-g4', 'CFMOTO', 'ctyrkolky', 'GLADIATOR C4 G4', 150990, 'T3b', 409, '24,5 kW / 33 k', '4x4',
  '{"cs":"Praktická pracovní čtyřkolka s novým motorem 192: tišší chod, méně vibrací, uzávěrka předního diferenciálu.","en":"Practical utility ATV with the new 192 engine: quieter running, less vibration, lockable front differential."}'::jsonb,
  '[{"label":{"cs":"Motor","en":"Engine"},"value":"409 ccm, 1 válec, DOHC, 4 ventily, kapalinou chlazený, EFI"},{"label":{"cs":"Vrtání × zdvih","en":"Bore × stroke"},"value":"91 × 76,2 mm"},{"label":{"cs":"Převodovka","en":"Transmission"},"value":"CVT, L/H/N/R/P"},{"label":{"cs":"Pohon","en":"Drivetrain"},"value":"2WD / 4WD, uzávěrka předního diferenciálu"},{"label":{"cs":"Homologace","en":"Homologation"},"value":"T3b"}]'::jsonb,
  '["#1f1f1f","#5a6b3d","#c9c9c9"]'::jsonb, array['new']::text[], 'active', 2, false, 1
)
on conflict (slug) do update set name = excluded.name, price = excluded.price, short = excluded.short, specs = excluded.specs, cc = excluded.cc, power = excluded.power;
