-- =====================================================================
-- Шаҳри Покиза — Seed Data for Demonstrations & Testing
-- Contains realistic municipal data for Khujand and Dushanbe
-- =====================================================================

-- 1. Profiles (Demo users for competition evaluation)
-- Note: Replace with real auth user UUIDs upon Supabase Auth registration
INSERT INTO public.profiles (id, display_name, role, account_status, phone, created_at)
VALUES 
    ('a0000000-0000-0000-0000-000000000001', 'Фаррух Назаров (Мудири бахши коммуналӣ)', 'admin', 'active', '+992 92 777 0001', NOW() - INTERVAL '30 days'),
    ('b0000000-0000-0000-0000-000000000002', 'Рустам Қосимов (Бригадаи зудамал №4)', 'sanitation_worker', 'active', '+992 92 777 0002', NOW() - INTERVAL '20 days'),
    ('b0000000-0000-0000-0000-000000000003', 'Шерзод Шарифов (Муҳандиси партовкаш)', 'sanitation_worker', 'active', '+992 92 777 0003', NOW() - INTERVAL '15 days'),
    ('c0000000-0000-0000-0000-000000000004', 'Малика Саидова (Эко-фаъол)', 'public_user', 'active', '+992 92 777 0004', NOW() - INTERVAL '10 days'),
    ('c0000000-0000-0000-0000-000000000005', 'Ҷамшед Аҳмадов (Сокини шаҳр)', 'public_user', 'active', '+992 92 777 0005', NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

-- 2. Containers (Khujand Smart Containers)
INSERT INTO public.containers (id, name_or_number, city, street, address_description, latitude, longitude, current_status, fill_percentage, waste_type, last_inspection)
VALUES
    ('CNT-KHJ-01', 'Қуттии ҳушманд №101', 'Хуҷанд', 'хиёбони Исмоили Сомонӣ', 'Назди Боғи фарҳангии Камоли Хуҷандӣ', 40.2858, 69.6225, 'normal', 35, 'recyclable', NOW() - INTERVAL '2 hours'),
    ('CNT-KHJ-02', 'Қуттии ҳушманд №102', 'Хуҷанд', 'кӯчаи Шарқ', 'Бозори Панҷшанбе, даромадгоҳи марказӣ', 40.2831, 69.6272, 'overflowing', 92, 'mixed', NOW() - INTERVAL '25 minutes'),
    ('CNT-KHJ-03', 'Қуттии ҳушманд №103', 'Хуҷанд', 'маҳаллаи 19', 'Рӯ ба рӯи бинои истиқоматии 14', 40.2725, 69.6450, 'normal', 58, 'organic', NOW() - INTERVAL '4 hours'),
    ('CNT-KHJ-04', 'Қуттии ҳушманд №104', 'Хуҷанд', 'кӯчаи Раҳим Ҷалил', 'Майдони Ситораҳо, нуқтаи ҷудокунии партов', 40.2912, 69.6189, 'maintenance', 15, 'recyclable', NOW() - INTERVAL '1 day'),
    ('CNT-KHJ-05', 'Қуттии ҳушманд №105', 'Хуҷанд', 'хиёбони Раҳмон Набиев', 'Соҳили рости дарёи Сир, гулгашти пиёдагард', 40.2880, 69.6295, 'normal', 45, 'mixed', NOW() - INTERVAL '3 hours'),
    ('CNT-DSH-06', 'Қуттии ҳушманд №201', 'Душанбе', 'хиёбони Рӯдакӣ', 'Майдони Истиқлол, канори шимолӣ', 38.5737, 68.7844, 'normal', 40, 'recyclable', NOW() - INTERVAL '1 hour')
ON CONFLICT (id) DO NOTHING;

-- 3. Camera Devices
INSERT INTO public.camera_devices (id, name, location, city, latitude, longitude, status, stream_url, adapter_type, last_connection)
VALUES
    ('CAM-01-PANJ', 'Камераи назоратии Бозори Панҷшанбе', 'Хуҷанд, кӯчаи Шарқ, сутуни №14', 'Хуҷанд', 40.2832, 69.6274, 'online', 'rtsp://cam1.khujand.tj/stream/live', 'browser_demo', NOW()),
    ('CAM-02-SOMON', 'Камераи хиёбони Исмоили Сомонӣ', 'Хуҷанд, назди театри Камоли Хуҷандӣ', 'Хуҷанд', 40.2855, 69.6220, 'online', 'rtsp://cam2.khujand.tj/stream/live', 'browser_demo', NOW()),
    ('CAM-03-M19', 'Камераи маҳаллаи 19', 'Хуҷанд, назди муассисаи таҳсилоти миёна', 'Хуҷанд', 40.2723, 69.6455, 'online', 'rtsp://cam3.khujand.tj/stream/live', 'upload_stream', NOW() - INTERVAL '10 minutes')
ON CONFLICT (id) DO NOTHING;

-- 4. Incidents
INSERT INTO public.incidents (id, category, city, address, latitude, longitude, description, photograph_path, ai_analysis_result, confidence_score, priority, status, reporter_id, assigned_worker_id, reported_at, resolved_at)
VALUES
    ('INC-2026-001', 'overflowing_bin', 'Хуҷанд', 'кӯчаи Шарқ, бозори Панҷшанбе', 40.2831, 69.6272, 'Қуттии партов пур шудааст ва партовҳо ба замин рехтаанд', '/src/assets/images/waste_container_smart_sensor_1792953900323.jpg', '{"category": "overflowing_bin", "description": "Қуттии партов ба андозаи 90% пур буда, халтаҳои партов берун аз қуттӣ қарор доранд", "confidence": 0.94, "visible_evidence": ["Қуттии партов пур аст", "Партовҳои рехташуда дар атроф"], "recommended_action": "Ирсоли фаврии мошини партовкаш ва тозакунӣ", "needs_human_review": false}', 0.94, 'high', 'assigned', 'c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '2 hours', NULL),
    ('INC-2026-002', 'garbage_outside', 'Хуҷанд', 'хиёбони Раҳмон Набиев 45', 40.2882, 69.6298, 'Партовҳои сохтмонӣ дар паҳлӯи қуттӣ партофта шудаанд', '/src/assets/images/cctv_waste_monitoring_camera_1792953898985.jpg', '{"category": "garbage_outside", "description": "Берун аз қуттии партов партовҳои бесоҳиб ва қуттиҳои картонӣ гузошта шудаанд", "confidence": 0.88, "visible_evidence": ["Қуттиҳои картонӣ дар пиёдароҳ", "Партовҳои бесоҳиб"], "recommended_action": "Бригадаи махсус барои кашонидани картон ва партовҳои калонҳаҷм", "needs_human_review": true}', 0.88, 'medium', 'under_review', 'c0000000-0000-0000-0000-000000000005', NULL, NOW() - INTERVAL '1 hour', NULL),
    ('INC-2026-003', 'litter_scattered', 'Хуҷанд', 'Боғи Камоли Хуҷандӣ, гулгашти шимолӣ', 40.2862, 69.6228, 'Тозакунии саривақтӣ анҷом дода шуд', '/src/assets/images/hero_smart_city_khujand_1792953898192.jpg', '{"category": "litter_scattered", "description": "Партовҳои хурди пластикӣ дар гулгашт", "confidence": 0.91, "visible_evidence": ["Шишаҳои пластикӣ дар замин"], "recommended_action": "Тозакунии дастӣ аз ҷониби корманди минтақа", "needs_human_review": false}', 0.91, 'low', 'resolved', 'c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '1 day', NOW() - INTERVAL '18 hours')
ON CONFLICT (id) DO NOTHING;

-- 5. Camera Events
INSERT INTO public.camera_events (id, camera_id, event_category, timestamp, incident_id, evidence_image_path, review_status, notes)
VALUES
    ('EVT-01', 'CAM-01-PANJ', 'overflowing_bin', NOW() - INTERVAL '2 hours 15 minutes', 'INC-2026-001', '/src/assets/images/cctv_waste_monitoring_camera_1792953898985.jpg', 'confirmed', 'Камераи №1 ҳолати пуршавии беш аз 90%-ро сабт намуд'),
    ('EVT-02', 'CAM-02-SOMON', 'garbage_outside', NOW() - INTERVAL '50 minutes', 'INC-2026-002', '/src/assets/images/waste_container_smart_sensor_1792953900323.jpg', 'pending_review', 'Сабти ҳаракат дар назди қуттии партов ва партофтани қуттиҳои калон')
ON CONFLICT (id) DO NOTHING;

-- 6. Cleanup Tasks
INSERT INTO public.cleanup_tasks (id, incident_id, assigned_worker_id, status, before_photo_path, after_photo_path, worker_notes, completed_at)
VALUES
    ('TSK-101', 'INC-2026-001', 'b0000000-0000-0000-0000-000000000002', 'in_progress', '/src/assets/images/waste_container_smart_sensor_1792953900323.jpg', NULL, 'Бригада ба ҷойи ҳодиса ҳозир шуд, холӣ кардани қуттӣ оғоз гардид', NULL),
    ('TSK-100', 'INC-2026-003', 'b0000000-0000-0000-0000-000000000002', 'completed', '/src/assets/images/waste_container_smart_sensor_1792953900323.jpg', '/src/assets/images/hero_smart_city_khujand_1792953898192.jpg', 'Атрофи гулгашт пурра рӯбучин ва тоза карда шуд', NOW() - INTERVAL '18 hours')
ON CONFLICT (id) DO NOTHING;

-- 7. Notifications
INSERT INTO public.notifications (id, recipient_id, title, message, related_incident_id, read_status, created_at)
VALUES
    ('NOTIF-01', 'b0000000-0000-0000-0000-000000000002', 'Супориши нав ба қайд гирифта шуд', 'Ҳодисаи INC-2026-001 дар Бозори Панҷшанбе ба шумо вобаста карда шуд.', 'INC-2026-001', false, NOW() - INTERVAL '2 hours'),
    ('NOTIF-02', 'c0000000-0000-0000-0000-000000000004', 'Ҳисоботи шумо қабул гардид', 'Барои хабар додани ҳолати ифлосшавӣ ба шумо 25 эко-хол дода шуд!', 'INC-2026-001', true, NOW() - INTERVAL '1 hour 45 minutes')
ON CONFLICT (id) DO NOTHING;

-- 8. Eco Points
INSERT INTO public.eco_points (id, user_id, points, reason, related_incident_id, verification_status, created_at)
VALUES
    ('ECO-01', 'c0000000-0000-0000-0000-000000000004', 25, 'Ҳисоботи тасдиқшудаи қуттии пуршуда дар Панҷшанбе', 'INC-2026-001', 'approved', NOW() - INTERVAL '1 hour 45 minutes'),
    ('ECO-02', 'c0000000-0000-0000-0000-000000000005', 15, 'Ҳисоботи партови бесоҳиб дар соҳили дарёи Сир', 'INC-2026-002', 'pending', NOW() - INTERVAL '50 minutes')
ON CONFLICT (id) DO NOTHING;

-- 9. Audit Logs
INSERT INTO public.audit_logs (id, actor_id, action, affected_record, details, timestamp)
VALUES
    ('LOG-01', 'a0000000-0000-0000-0000-000000000001', 'INCIDENT_ASSIGNED', 'INC-2026-001', '{"assigned_to": "Рустам Қосимов", "priority": "high"}', NOW() - INTERVAL '2 hours'),
    ('LOG-02', 'b0000000-0000-0000-0000-000000000002', 'TASK_STATUS_UPDATED', 'TSK-101', '{"status": "in_progress"}', NOW() - INTERVAL '1 hour 15 minutes'),
    ('LOG-03', 'a0000000-0000-0000-0000-000000000001', 'CAMERA_EVENT_CONFIRMED', 'EVT-01', '{"result": "incident_created"}', NOW() - INTERVAL '2 hours 10 minutes')
ON CONFLICT (id) DO NOTHING;
