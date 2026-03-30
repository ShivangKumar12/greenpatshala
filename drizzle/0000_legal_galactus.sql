CREATE TABLE `coupons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`description` varchar(500),
	`discount_type` varchar(20) NOT NULL,
	`discount_value` decimal(10,2) NOT NULL,
	`min_amount` decimal(10,2),
	`max_discount` decimal(10,2),
	`usage_limit` int,
	`used_count` int NOT NULL DEFAULT 0,
	`valid_from` datetime NOT NULL,
	`valid_until` datetime NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coupons_id` PRIMARY KEY(`id`),
	CONSTRAINT `coupons_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text NOT NULL,
	`thumbnail` varchar(500),
	`instructor_id` int NOT NULL,
	`category` varchar(100) NOT NULL,
	`level` varchar(50) NOT NULL,
	`duration` varchar(100) NOT NULL,
	`language` varchar(100) NOT NULL DEFAULT 'Hindi & English',
	`original_price` decimal(10,2) NOT NULL,
	`discount_price` decimal(10,2),
	`is_free` boolean NOT NULL DEFAULT false,
	`is_published` boolean NOT NULL DEFAULT false,
	`total_lessons` int NOT NULL DEFAULT 0,
	`total_students` int NOT NULL DEFAULT 0,
	`rating` decimal(3,2) DEFAULT '0.00',
	`total_reviews` int NOT NULL DEFAULT 0,
	`syllabus` json,
	`features` json,
	`requirements` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `courses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `current_affairs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`summary` text,
	`content` text NOT NULL,
	`category` varchar(100) NOT NULL,
	`tags` json,
	`thumbnail` varchar(500),
	`source` varchar(255),
	`source_url` varchar(500),
	`date` datetime NOT NULL,
	`importance` varchar(50) DEFAULT 'medium',
	`views` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `current_affairs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `enrollments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`course_id` int NOT NULL,
	`progress` int NOT NULL DEFAULT 0,
	`completed_lessons` int NOT NULL DEFAULT 0,
	`last_accessed_at` timestamp,
	`completed_at` timestamp,
	`certificate_url` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `enrollments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`organization` varchar(255) NOT NULL,
	`department` varchar(255),
	`location` varchar(255),
	`state` varchar(100),
	`positions` int,
	`qualifications` text,
	`experience` varchar(255),
	`salary` varchar(255),
	`age_limit` varchar(100),
	`application_fee` varchar(100),
	`description` text,
	`responsibilities` json,
	`requirements` json,
	`benefits` json,
	`apply_url` varchar(500),
	`last_date` datetime,
	`exam_date` datetime,
	`status` varchar(50) NOT NULL DEFAULT 'active',
	`views` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`type` varchar(50) NOT NULL,
	`link` varchar(500),
	`is_read` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`course_id` int,
	`order_id` varchar(255) NOT NULL,
	`payment_id` varchar(255),
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'INR',
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`method` varchar(50),
	`signature` varchar(500),
	`metadata` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quiz_id` int NOT NULL,
	`question` text NOT NULL,
	`options` json NOT NULL,
	`correct_answer` int NOT NULL,
	`explanation` text,
	`marks` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quiz_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`quiz_id` int NOT NULL,
	`score` int NOT NULL,
	`total_questions` int NOT NULL,
	`correct_answers` int NOT NULL,
	`wrong_answers` int NOT NULL,
	`skipped_answers` int NOT NULL,
	`time_taken` int NOT NULL,
	`answers` json NOT NULL,
	`is_passed` boolean NOT NULL,
	`completed_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quiz_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quizzes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text,
	`category` varchar(100) NOT NULL,
	`difficulty` varchar(50) NOT NULL,
	`duration` int NOT NULL,
	`total_marks` int NOT NULL,
	`passing_marks` int NOT NULL,
	`instructor_id` int NOT NULL,
	`course_id` int,
	`is_published` boolean NOT NULL DEFAULT false,
	`shuffle_questions` boolean NOT NULL DEFAULT true,
	`show_results` boolean NOT NULL DEFAULT true,
	`total_attempts` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quizzes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `study_materials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text,
	`subject` varchar(100) NOT NULL,
	`category` varchar(100) NOT NULL,
	`file_type` varchar(20) NOT NULL,
	`file_url` varchar(500) NOT NULL,
	`file_size` int,
	`total_pages` int,
	`thumbnail` varchar(500),
	`course_id` int,
	`is_paid` boolean NOT NULL DEFAULT false,
	`price` decimal(10,2),
	`downloads` int NOT NULL DEFAULT 0,
	`views` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `study_materials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255),
	`role` varchar(50) NOT NULL DEFAULT 'user',
	`avatar` varchar(500),
	`phone` varchar(20),
	`bio` text,
	`is_verified` boolean NOT NULL DEFAULT false,
	`email_verification_token` varchar(10),
	`reset_password_token` varchar(255),
	`reset_password_expires` datetime,
	`google_id` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
