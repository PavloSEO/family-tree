CREATE TABLE `albums` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`year` integer,
	`owner_id` text,
	`cover_photo_index` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `persons`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `login_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`ip` text NOT NULL,
	`login` text NOT NULL,
	`attempted_at` text NOT NULL,
	`success` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_login_ip` ON `login_attempts` (`ip`,`attempted_at`);--> statement-breakpoint
CREATE TABLE `persons` (
	`id` text PRIMARY KEY NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`patronymic` text,
	`maiden_name` text,
	`gender` text NOT NULL,
	`date_of_birth` text,
	`date_of_death` text,
	`birth_place` text,
	`current_location` text,
	`country` text,
	`main_photo` text,
	`bio` text,
	`occupation` text,
	`blood_type` text,
	`phone` text,
	`email` text,
	`localized_names` text,
	`hobbies` text,
	`social_links` text,
	`custom_fields` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_persons_name` ON `persons` (`first_name`,`last_name`);--> statement-breakpoint
CREATE TABLE `photos` (
	`id` text PRIMARY KEY NOT NULL,
	`album_id` text NOT NULL,
	`src` text NOT NULL,
	`thumbnail` text,
	`description` text,
	`date_taken` text,
	`year` integer,
	`location` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`album_id`) REFERENCES `albums`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_photos_album` ON `photos` (`album_id`);--> statement-breakpoint
CREATE TABLE `relationships` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`from_person_id` text NOT NULL,
	`to_person_id` text NOT NULL,
	`marriage_date` text,
	`divorce_date` text,
	`is_current_spouse` integer,
	`notes` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`from_person_id`) REFERENCES `persons`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`to_person_id`) REFERENCES `persons`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_rel_from` ON `relationships` (`from_person_id`);--> statement-breakpoint
CREATE INDEX `idx_rel_to` ON `relationships` (`to_person_id`);--> statement-breakpoint
CREATE INDEX `idx_rel_type` ON `relationships` (`type`);--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tagged_persons` (
	`id` text PRIMARY KEY NOT NULL,
	`photo_id` text NOT NULL,
	`person_id` text NOT NULL,
	`x` real NOT NULL,
	`y` real NOT NULL,
	`width` real NOT NULL,
	`height` real NOT NULL,
	FOREIGN KEY (`photo_id`) REFERENCES `photos`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`person_id`) REFERENCES `persons`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_tagged_photo` ON `tagged_persons` (`photo_id`);--> statement-breakpoint
CREATE INDEX `idx_tagged_person` ON `tagged_persons` (`person_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`login` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text NOT NULL,
	`linked_person_id` text,
	`status` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`last_login_at` text,
	FOREIGN KEY (`linked_person_id`) REFERENCES `persons`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_login_unique` ON `users` (`login`);