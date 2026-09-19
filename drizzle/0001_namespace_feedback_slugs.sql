-- Feedback is now keyed by `collection/id` instead of a bare document id, so an
-- article and a reference doc with the same file name no longer share a counter.
-- Rows written before this change carry a bare id. A bare id cannot say which
-- collection it came from, so this migration assumes the template's own demo
-- content: the three reference docs are named explicitly, everything else was an
-- article. If you replaced the demo content, adjust the list below before running.
UPDATE `Feedback`
SET `slug` = CASE
  WHEN `slug` IN (
    'data-nova-advanced-analytics-reference',
    'data-nova-quick-start-guide',
    'data-nova-user-manual'
  ) THEN 'reference/' || `slug`
  ELSE 'articles/' || `slug`
END
WHERE `slug` NOT LIKE '%/%';
