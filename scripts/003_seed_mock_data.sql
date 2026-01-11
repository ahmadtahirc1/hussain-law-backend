-- NOTE: This script adds mock data for testing and development
-- Before running in production, delete this file and populate with real data

-- Insert test users (using predefined UUIDs for reference)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, 'lawyer@example.com', crypt('Password123!', gen_salt('bf')), NOW(), NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'client@example.com', crypt('Password123!', gen_salt('bf')), NOW(), NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333'::uuid, 'staff@example.com', crypt('Password123!', gen_salt('bf')), NOW(), NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Insert user profiles
INSERT INTO public.profiles (id, first_name, last_name, role, email, phone_number, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, 'Ahmed', 'Hussain', 'lawyer', 'lawyer@example.com', '+92-300-1234567', NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'Ali', 'Khan', 'client', 'client@example.com', '+92-300-2345678', NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333'::uuid, 'Sarah', 'Ahmed', 'staff', 'staff@example.com', '+92-300-3456789', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Insert sample cases
INSERT INTO public.cases (id, case_number, title, description, client_id, lawyer_id, status, case_type, filing_date, next_hearing_date, notes, created_at, updated_at)
VALUES
  (
    '44444444-4444-4444-4444-444444444444'::uuid,
    'CASE-2024-001',
    'Property Dispute - Karachi',
    'Property ownership dispute between two parties regarding commercial property in Karachi',
    '22222222-2222-2222-2222-222222222222'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'open',
    'Property',
    '2024-01-15'::date,
    '2024-02-28'::date,
    'Initial consultation completed. Documentation review in progress.',
    NOW(),
    NOW()
  ),
  (
    '55555555-5555-5555-5555-555555555555'::uuid,
    'CASE-2024-002',
    'Contract Breach - Lahore',
    'Commercial contract dispute involving breach of terms and conditions',
    '22222222-2222-2222-2222-222222222222'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'in-progress',
    'Commercial',
    '2023-11-10'::date,
    '2024-03-15'::date,
    'Negotiation phase with opposing counsel. Settlement discussions ongoing.',
    NOW(),
    NOW()
  )
ON CONFLICT (case_number) DO NOTHING;

-- Insert sample appointments
INSERT INTO public.appointments (id, case_id, client_id, lawyer_id, title, description, appointment_date, duration_minutes, status, notes, created_at, updated_at)
VALUES
  (
    '66666666-6666-6666-6666-666666666666'::uuid,
    '44444444-4444-4444-4444-444444444444'::uuid,
    '22222222-2222-2222-2222-222222222222'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Case Review Meeting',
    'Detailed review of property documents and legal strategy',
    '2024-02-15 10:00:00+00'::timestamp with time zone,
    90,
    'scheduled',
    'Bring original property deeds and sale agreement',
    NOW(),
    NOW()
  ),
  (
    '77777777-7777-7777-7777-777777777777'::uuid,
    '55555555-5555-5555-5555-555555555555'::uuid,
    '22222222-2222-2222-2222-222222222222'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Settlement Discussion',
    'Meeting to discuss settlement proposal with opposing party',
    '2024-02-20 14:00:00+00'::timestamp with time zone,
    60,
    'scheduled',
    'Bring calculator and settlement offer documents',
    NOW(),
    NOW()
  )
ON CONFLICT DO NOTHING;

-- Insert sample documents
INSERT INTO public.documents (id, case_id, uploaded_by, file_name, file_path, file_type, file_size, document_type, description, created_at, updated_at)
VALUES
  (
    '88888888-8888-8888-8888-888888888888'::uuid,
    '44444444-4444-4444-4444-444444444444'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'property_deed.pdf',
    '/documents/case-001/property_deed.pdf',
    'application/pdf',
    524288,
    'Legal Document',
    'Original property deed for the disputed property',
    NOW(),
    NOW()
  ),
  (
    '99999999-9999-9999-9999-999999999999'::uuid,
    '44444444-4444-4444-4444-444444444444'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'sale_agreement.pdf',
    '/documents/case-001/sale_agreement.pdf',
    'application/pdf',
    458752,
    'Legal Document',
    'Sale agreement copy for reference',
    NOW(),
    NOW()
  )
ON CONFLICT DO NOTHING;

-- Insert sample case updates
INSERT INTO public.case_updates (id, case_id, updated_by, title, description, update_type, created_at)
VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
    '44444444-4444-4444-4444-444444444444'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Case Opened',
    'Property dispute case registered and assigned to Ahmed Hussain',
    'status',
    NOW()
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
    '44444444-4444-4444-4444-444444444444'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Documents Received',
    'Client submitted property deed and sale agreement for review',
    'document',
    NOW() - INTERVAL '1 day'
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid,
    '55555555-5555-5555-5555-555555555555'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Settlement Offer Received',
    'Opposing counsel submitted initial settlement proposal',
    'settlement',
    NOW() - INTERVAL '2 days'
  )
ON CONFLICT DO NOTHING;
