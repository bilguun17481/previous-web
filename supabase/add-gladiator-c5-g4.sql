-- Adds the CFMOTO GLADIATOR C5 G4 EPS to a live database. Safe to run more than once.
insert into public.products (slug, brand, category, name, price, homologation, cc, power, drive, short, specs, colors, tags, status, stock, featured, sort)
values (
  'cfmoto-gladiator-c5-g4', 'CFMOTO', 'ctyrkolky', 'GLADIATOR C5 G4 EPS', 160990, 'T3b', 499, '29 kW / 39 k', '4x4',
  '{"cs":"Silnější sourozenec C4: motor 499 ccm, posilovač řízení a uzávěrka předního diferenciálu. Verze s ABS za 170 990 Kč.","en":"The C4''s bigger sibling: 499 cc engine, power steering and a lockable front differential. ABS version at 170 990 Kč."}'::jsonb,
  '[{"label":{"cs":"Motor","en":"Engine"},"value":"499 ccm, 1 válec, SOHC, 4 ventily, kapalinou chlazený, EFI"},{"label":{"cs":"Vrtání × zdvih","en":"Bore × stroke"},"value":"92 × 75 mm"},{"label":{"cs":"Převodovka","en":"Transmission"},"value":"CVT, L/H/N/R/P"},{"label":{"cs":"Pohon","en":"Drivetrain"},"value":"2WD / 4WD, uzávěrka předního diferenciálu"},{"label":{"cs":"Řízení","en":"Steering"},"value":"Elektrický posilovač EPS"},{"label":{"cs":"Homologace","en":"Homologation"},"value":"T3b"}]'::jsonb,
  '["#1f1f1f","#5a6b3d","#c9c9c9"]'::jsonb, array['new']::text[], 'active', 2, false, 2
)
on conflict (slug) do update set name = excluded.name, price = excluded.price, short = excluded.short, specs = excluded.specs, cc = excluded.cc, power = excluded.power;
