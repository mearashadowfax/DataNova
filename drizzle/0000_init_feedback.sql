CREATE TABLE `Feedback` (
	`slug` text PRIMARY KEY NOT NULL,
	`helpful` integer DEFAULT 0 NOT NULL,
	`notHelpful` integer DEFAULT 0 NOT NULL
);
