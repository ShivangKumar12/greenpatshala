-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Mar 30, 2026 at 11:43 PM
-- Server version: 8.0.30
-- PHP Version: 8.3.17

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `unchi_udaan_demo`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(150) NOT NULL,
  `description` text,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'UPSC', 'upsc', 'Union Public Service Commission exams including IAS, IPS, IFS, and other civil services.', 1, '2025-12-01 22:18:24', '2025-12-01 22:18:24'),
(2, 'SSC', 'ssc', 'Staff Selection Commission exams including CGL, CHSL, GD Constable, and others.', 1, '2025-12-01 22:18:24', '2025-12-01 22:18:24'),
(3, 'Banking', 'banking', 'Banking sector exams such as IBPS PO, SBI PO, IBPS Clerk, and RRB PO.', 1, '2025-12-01 22:18:24', '2025-12-01 22:18:24'),
(4, 'Railways', 'railways', 'Indian Railways recruitment exams including RRB NTPC and RRB Group D.', 1, '2025-12-01 22:18:24', '2025-12-01 22:18:24'),
(5, 'State PSC', 'state-psc', 'State Public Service Commission exams for various states across India.', 1, '2025-12-01 22:18:24', '2025-12-01 22:18:24'),
(6, 'test', 'test', NULL, 1, '2026-03-09 22:41:58', '2026-03-09 22:41:58');

-- --------------------------------------------------------

--
-- Table structure for table `certificates`
--

CREATE TABLE `certificates` (
  `id` int NOT NULL,
  `certificate_id` varchar(50) NOT NULL,
  `user_id` int NOT NULL,
  `template_id` int DEFAULT NULL,
  `type` varchar(20) NOT NULL,
  `course_id` int DEFAULT NULL,
  `quiz_id` int DEFAULT NULL,
  `attempt_id` int DEFAULT NULL,
  `user_name` varchar(255) NOT NULL,
  `item_name` varchar(500) NOT NULL,
  `achievement_text` text,
  `completion_date` datetime NOT NULL,
  `pdf_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `certificate_templates`
--

CREATE TABLE `certificate_templates` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `background_image` varchar(500) DEFAULT NULL,
  `fields` json NOT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `certificate_templates`
--

INSERT INTO `certificate_templates` (`id`, `name`, `background_image`, `fields`, `is_default`, `created_at`, `updated_at`) VALUES
(1, 'Royal Purple', NULL, '\"[{\\\"type\\\":\\\"{achievement_text}\\\",\\\"x\\\":171,\\\"y\\\":175,\\\"fontSize\\\":15,\\\"fontColor\\\":\\\"#7C3AED\\\",\\\"width\\\":500,\\\"height\\\":40},{\\\"type\\\":\\\"{user_name}\\\",\\\"x\\\":171,\\\"y\\\":230,\\\"fontSize\\\":38,\\\"fontColor\\\":\\\"#3B0764\\\",\\\"width\\\":500,\\\"height\\\":55},{\\\"type\\\":\\\"{course_name}\\\",\\\"x\\\":171,\\\"y\\\":305,\\\"fontSize\\\":21,\\\"fontColor\\\":\\\"#8B5CF6\\\",\\\"width\\\":500,\\\"height\\\":45},{\\\"type\\\":\\\"{completion_date}\\\",\\\"x\\\":171,\\\"y\\\":415,\\\"fontSize\\\":13,\\\"fontColor\\\":\\\"#6B7280\\\",\\\"width\\\":250,\\\"height\\\":30},{\\\"type\\\":\\\"{certificate_id}\\\",\\\"x\\\":421,\\\"y\\\":415,\\\"fontSize\\\":13,\\\"fontColor\\\":\\\"#9CA3AF\\\",\\\"width\\\":250,\\\"height\\\":30}]\"', 0, '2026-03-09 20:41:12', '2026-03-09 20:41:12');

-- --------------------------------------------------------

--
-- Table structure for table `coupons`
--

CREATE TABLE `coupons` (
  `id` int NOT NULL,
  `code` varchar(50) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `discount_type` varchar(20) NOT NULL,
  `discount_value` decimal(10,2) NOT NULL,
  `min_amount` decimal(10,2) DEFAULT NULL,
  `max_discount` decimal(10,2) DEFAULT NULL,
  `applicable_to` enum('all','course','quiz','material') DEFAULT 'all',
  `usage_limit` int DEFAULT NULL,
  `used_count` int NOT NULL DEFAULT '0',
  `valid_from` datetime NOT NULL,
  `valid_until` datetime NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT (now())
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `coupons`
--

INSERT INTO `coupons` (`id`, `code`, `description`, `discount_type`, `discount_value`, `min_amount`, `max_discount`, `applicable_to`, `usage_limit`, `used_count`, `valid_from`, `valid_until`, `is_active`, `created_at`) VALUES
(1, 'NEW20', 'sxdcfghjkl;', 'percentage', '50.00', NULL, '500.00', 'all', 50, 0, '2025-12-09 00:00:00', '2025-12-17 00:00:00', 1, '2025-12-09 10:52:24'),
(2, 'NEWYEAR50', '', 'percentage', '50.00', NULL, NULL, 'all', 50, 6, '2025-12-30 00:00:00', '2026-01-05 00:00:00', 1, '2025-12-30 19:48:37');

-- --------------------------------------------------------

--
-- Table structure for table `coupon_usage`
--

CREATE TABLE `coupon_usage` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `coupon_id` int NOT NULL,
  `used_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` int NOT NULL,
  `title` varchar(500) NOT NULL,
  `description` text NOT NULL,
  `thumbnail` varchar(500) DEFAULT NULL,
  `video_url` varchar(500) DEFAULT NULL,
  `instructor_id` int NOT NULL,
  `category` varchar(100) NOT NULL,
  `level` varchar(50) NOT NULL,
  `duration` varchar(100) NOT NULL,
  `language` varchar(100) NOT NULL DEFAULT 'Hindi & English',
  `original_price` decimal(10,2) NOT NULL,
  `discount_price` decimal(10,2) DEFAULT NULL,
  `access_duration_days` int DEFAULT '365',
  `is_lifetime_access` tinyint(1) DEFAULT '1',
  `is_free` tinyint(1) NOT NULL DEFAULT '0',
  `is_published` tinyint(1) NOT NULL DEFAULT '0',
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `total_lessons` int NOT NULL DEFAULT '0',
  `total_students` int NOT NULL DEFAULT '0',
  `rating` decimal(3,2) DEFAULT '0.00',
  `total_reviews` int NOT NULL DEFAULT '0',
  `syllabus` json DEFAULT NULL,
  `features` json DEFAULT NULL,
  `requirements` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  `pdfs` json DEFAULT NULL,
  `videos` json DEFAULT NULL,
  `certificate_eligible` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `title`, `description`, `thumbnail`, `video_url`, `instructor_id`, `category`, `level`, `duration`, `language`, `original_price`, `discount_price`, `access_duration_days`, `is_lifetime_access`, `is_free`, `is_published`, `is_featured`, `total_lessons`, `total_students`, `rating`, `total_reviews`, `syllabus`, `features`, `requirements`, `created_at`, `updated_at`, `pdfs`, `videos`, `certificate_eligible`) VALUES
(8, 'Final Test', 'Final Test', '/uploads/courses/thumbnails/80j9grpwfJk-HD-1767302927685-786981379.jpg', NULL, 2, 'UPSC', 'Beginner', '3', 'Hindi & English', '5000.00', '2499.00', 365, 1, 0, 1, 0, 1, 0, '0.00', 0, '[]', '[]', '[]', '2026-01-01 21:29:04', '2026-01-08 14:58:40', NULL, NULL, 0),
(9, 'Test', 'Bshsbwhehehehehe', '/uploads/courses/thumbnails/IMG-20260215-204217-1771960272850-233405142.png', NULL, 2, 'Railway', 'Beginner', 'U', 'Hindi & English', '5.00', NULL, 365, 1, 1, 1, 1, 0, 0, '0.00', 0, '[]', '[]', '[]', '2026-01-03 01:18:51', '2026-02-24 13:41:13', NULL, NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `course_files`
--

CREATE TABLE `course_files` (
  `id` int NOT NULL,
  `course_id` int NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_url` varchar(500) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `file_size` int DEFAULT NULL,
  `uploaded_by` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `current_affairs`
--

CREATE TABLE `current_affairs` (
  `id` int NOT NULL,
  `title` varchar(500) NOT NULL,
  `summary` text,
  `content` text NOT NULL,
  `category` varchar(100) NOT NULL,
  `tags` json DEFAULT NULL,
  `thumbnail` varchar(500) DEFAULT NULL,
  `source` varchar(255) DEFAULT NULL,
  `source_url` varchar(500) DEFAULT NULL,
  `date` datetime NOT NULL,
  `importance` varchar(50) DEFAULT 'medium',
  `views` int NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `current_affairs`
--

INSERT INTO `current_affairs` (`id`, `title`, `summary`, `content`, `category`, `tags`, `thumbnail`, `source`, `source_url`, `date`, `importance`, `views`, `created_at`, `updated_at`) VALUES
(2, 'India Semiconductor Mission: Tata Electronics and Powerchip Sign MoU for ₹91,000 Crore Fab Unit', 'Tata Electronics has partnered with Taiwan\'s Powerchip Semiconductor Manufacturing Corporation to establish India\'s first major semiconductor fabrication plant in Dholera, Gujarat, with an investment of ₹91,000 crore.', 'India is taking a giant leap toward self-reliance in semiconductor manufacturing with the announcement of a major fabrication (fab) unit in Dholera, Gujarat. Tata Electronics has signed a Memorandum of Understanding (MoU) with Taiwan\'s Powerchip Semiconductor Manufacturing Corporation (PSMC) to set up this facility with an investment of ₹91,000 crore.\r\n\r\n**Why is this significant?**\r\nSemiconductors are the backbone of modern electronics, used in everything from smartphones and computers to electric vehicles and defense systems. Currently, India imports nearly all its semiconductor chips, making this project crucial for national security and economic growth.\r\n\r\n**Key Features:**\r\n- The fab unit will manufacture chips on 28nm, 40nm, and 55nm technology nodes\r\n- Expected to create over 20,000 direct jobs and lakhs of indirect employment\r\n- Part of India\'s ₹76,000 crore semiconductor incentive scheme announced in 2021\r\n- The facility is expected to be operational by 2026-27\r\n\r\n**Exam Relevance:**\r\nThis development ties into multiple topics: Make in India initiative, Atmanirbhar Bharat, India-Taiwan relations, Gujarat\'s industrial development, and strategic autonomy in critical technologies.\r\n\r\n**Quick Facts for Exams:**\r\nQ1: Where is India\'s first major semiconductor fab unit being established?\r\nA1: Dholera, Gujarat\r\n\r\nQ2: Which Taiwanese company is partnering with Tata Electronics for this project?\r\nA2: Powerchip Semiconductor Manufacturing Corporation (PSMC)\r\n\r\nQ3: What is the total investment in this semiconductor project?\r\nA3: ₹91,000 crore\r\n\r\nQ4: What technology nodes will be used in this fab unit?\r\nA4: 28nm, 40nm, and 55nm technology nodes\r\n\r\nQ5: What is the target year for making the facility operational?\r\nA5: 2026-27', 'Economy', '[\"Semiconductors\", \"Make in India\", \"Tata Electronics\", \"Powerchip\", \"Dholera\", \"Gujarat\", \"Technology\", \"Manufacturing\"]', NULL, 'Press Information Bureau', 'https://pib.gov.in', '2025-12-01 00:00:00', 'high', 5, '2025-12-07 13:42:58', '2025-12-29 23:27:00'),
(3, 'Chandrayaan-4 Mission Approved: ISRO to Demonstrate Lunar Sample Return Technology', 'The Union Cabinet has approved ISRO\'s Chandrayaan-4 mission with a budget of ₹2,104 crore. This mission aims to demonstrate technologies for lunar sample collection and safe return to Earth, advancing India\'s deep space exploration capabilities.', 'Following the historic success of Chandrayaan-3, which made India the first country to land near the lunar south pole, the Indian Space Research Organisation (ISRO) is now preparing for its next ambitious mission: Chandrayaan-4. The Union Cabinet has approved this mission with a total budget allocation of ₹2,104 crore.\r\n\r\n**Mission Objectives:**\r\nChandrayaan-4 is a technology demonstrator mission aimed at developing and showcasing capabilities for:\r\n1. Landing on the Moon and collecting samples\r\n2. Launching from the lunar surface (a first for ISRO)\r\n3. Docking in lunar orbit\r\n4. Transferring samples between spacecraft\r\n5. Safely returning samples to Earth\r\n\r\n**Why is this important?**\r\nSample return missions provide scientists with actual lunar material for detailed laboratory analysis, which cannot be done by rovers alone. Only three countries (USA, USSR/Russia, and China) have successfully returned lunar samples. India will become the fourth.\r\n\r\n**Technical Innovation:**\r\nThe mission will use multiple modules:\r\n- Descender Module: For safe landing on the Moon\r\n- Ascender Module: To launch from the Moon with samples\r\n- Transfer Module: To carry samples in lunar orbit\r\n- Re-entry Module: To bring samples safely back to Earth\r\n\r\n**Timeline:**\r\nThe mission is expected to be launched by 2028-29, demonstrating critical technologies needed for future interplanetary missions, including the proposed Gaganyaan (human spaceflight) and Mars sample return missions.\r\n\r\n**Quick Facts for Exams:**\r\nQ1: What is the approved budget for Chandrayaan-4 mission?\r\nA1: ₹2,104 crore\r\n\r\nQ2: What is the primary objective of Chandrayaan-4?\r\nA2: To demonstrate lunar sample return technology\r\n\r\nQ3: How many countries have successfully returned lunar samples before India attempts this?\r\nA3: Three countries - USA, USSR/Russia, and China\r\n\r\nQ4: What are the four main modules of Chandrayaan-4?\r\nA4: Descender Module, Ascender Module, Transfer Module, and Re-entry Module\r\n\r\nQ5: By when is Chandrayaan-4 expected to be launched?\r\nA5: 2028-29', 'Science & Technology', '[\"ISRO\", \"Chandrayaan-4\", \"Space Mission\", \"Moon\", \"Sample Return\", \"Technology\", \"India\"]', NULL, 'ISRO Official', 'https://www.isro.gov.in', '2025-11-28 00:00:00', 'high', 0, '2025-12-07 13:42:58', '2025-12-07 13:42:58'),
(4, 'GST Council Recommends Rate Rationalization: Changes in Tax Slabs Across Multiple Sectors', 'The 54th GST Council meeting recommended significant changes to GST rates across various sectors, including reduction in rates for cancer drugs, increase in luxury items taxation, and clarification on online gaming taxation at 28%.', 'The Goods and Services Tax (GST) Council, chaired by Union Finance Minister Nirmala Sitharaman, held its 54th meeting and recommended several important changes to the GST rate structure, affecting common citizens, businesses, and specific sectors.\r\n\r\n**Major Recommendations:**\r\n\r\n**1. Healthcare Sector:**\r\n- Cancer treatment drugs to be exempted from GST (currently 5-12%)\r\n- Health and life insurance premiums for senior citizens to attract lower GST\r\n- Medical equipment for rare diseases exempt from GST\r\n\r\n**2. Increased Taxation:**\r\n- Luxury goods including high-end watches and shoes moved to 28% slab\r\n- Aerated beverages to continue at 28% with compensation cess\r\n- Online gaming, casinos, and horse racing confirmed at 28% (face value basis)\r\n\r\n**3. Rate Reductions:**\r\n- Certain food items moved from 12% to 5%\r\n- Essential medicines reduced to 5% from 12%\r\n- Agricultural equipment and implements reduced to 5%\r\n\r\n**Understanding GST Structure:**\r\nIndia\'s GST has four main tax slabs:\r\n- 5% (essential items)\r\n- 12% (standard goods)\r\n- 18% (most goods and services)\r\n- 28% (luxury and sin goods)\r\n\r\nPlus, special rates:\r\n- 0% (exempt category - basic food items, healthcare)\r\n- 0.25% (rough precious stones)\r\n- 3% (gold and precious metals)\r\n\r\n**Why is this significant?**\r\nThese changes reflect the government\'s attempt to balance revenue collection with social welfare, reducing burden on essential healthcare while ensuring adequate revenue from luxury consumption. The clarification on online gaming taxation is particularly important given the sector\'s rapid growth.\r\n\r\n**Impact Assessment:**\r\n- Estimated revenue loss from healthcare exemptions: ₹2,300 crore annually\r\n- Expected additional revenue from luxury goods: ₹5,000 crore annually\r\n- Online gaming sector taxation to contribute ₹8,000-10,000 crore annually\r\n\r\n**Quick Facts for Exams:**\r\nQ1: Who chairs the GST Council?\r\nA1: The Union Finance Minister (currently Nirmala Sitharaman)\r\n\r\nQ2: What are the four main GST tax slabs in India?\r\nA2: 5%, 12%, 18%, and 28%\r\n\r\nQ3: At what rate will online gaming be taxed?\r\nA3: 28% on face value\r\n\r\nQ4: What major exemption was recommended for healthcare?\r\nA4: Cancer treatment drugs to be exempted from GST\r\n\r\nQ5: Which constitutional amendment introduced GST in India?\r\nA5: 101st Constitutional Amendment Act, 2016 (implemented July 1, 2017)', 'Economy', '[\"GST\", \"Taxation\", \"GST Council\", \"Tax Reforms\", \"Finance\", \"Healthcare\", \"Luxury Goods\"]', NULL, 'Press Information Bureau', 'https://pib.gov.in', '2025-11-25 00:00:00', 'high', 1, '2025-12-07 13:42:58', '2026-01-01 21:13:59'),
(5, 'India-ASEAN Summit 2025: Comprehensive Strategic Partnership Upgraded with Focus on Indo-Pacific Cooperation', 'During the 21st India-ASEAN Summit, leaders upgraded the relationship to a Comprehensive Strategic Partnership and launched new initiatives in digital economy, renewable energy, and maritime security, with India committing $50 million for ASEAN-India cooperation projects.', 'The 21st India-ASEAN Summit marked a significant milestone in India\'s Act East Policy, with the relationship being elevated to a \"Comprehensive Strategic Partnership\" level, reflecting the deepening ties between India and the 10-nation Southeast Asian bloc.\r\n\r\n**Historical Context:**\r\nIndia\'s engagement with ASEAN began in 1992 with Sectoral Dialogue Partnership, progressed to Full Dialogue Partnership (1995), Summit Level Partnership (2002), and Strategic Partnership (2012). The current upgrade represents the highest level of institutional relationship.\r\n\r\n**Key Outcomes of the Summit:**\r\n\r\n**1. Economic Cooperation:**\r\n- Review of India-ASEAN Free Trade Agreement (FTA) to boost bilateral trade target to $300 billion by 2025\r\n- Current bilateral trade: $131 billion (2023-24)\r\n- Launch of India-ASEAN Digital Partnership for Industry 4.0\r\n- Cooperation in semiconductor supply chain development\r\n\r\n**2. Connectivity Initiatives:**\r\n- India-Myanmar-Thailand Trilateral Highway extension to Cambodia and Vietnam\r\n- Support for ASEAN Connectivity Master Plan 2025\r\n- Maritime connectivity through Sagarmala and ASEAN ports\r\n\r\n**3. Security Cooperation:**\r\n- Enhanced defense cooperation and joint maritime exercises\r\n- Collaboration on counter-terrorism and cyber security\r\n- Support for ASEAN\'s centrality in Indo-Pacific architecture\r\n\r\n**4. New Initiatives:**\r\n- India announced $50 million for ASEAN-India Project Development Fund\r\n- Launch of India-ASEAN Green Partnership for renewable energy\r\n- Establishment of ASEAN-India Centre for Digital Transformation\r\n\r\n**ASEAN Member Countries (Remember using mnemonic: \"MBIL TV CPS\"):**\r\n1. Myanmar\r\n2. Brunei\r\n3. Indonesia\r\n4. Laos\r\n5. Thailand\r\n6. Vietnam\r\n7. Cambodia\r\n8. Philippines\r\n9. Singapore\r\n10. Malaysia\r\n\r\n**Strategic Importance:**\r\nASEAN is India\'s fourth-largest trading partner and represents a market of 650 million people. The region is crucial for India\'s Indo-Pacific strategy and countering China\'s growing influence in Southeast Asia.\r\n\r\n**Quick Facts for Exams:**\r\nQ1: How many countries are members of ASEAN?\r\nA1: 10 countries\r\n\r\nQ2: What is the current level of India-ASEAN partnership after the 2025 summit?\r\nA2: Comprehensive Strategic Partnership\r\n\r\nQ3: What is the bilateral trade target between India and ASEAN by 2025?\r\nA3: $300 billion\r\n\r\nQ4: How much did India commit to the ASEAN-India Project Development Fund?\r\nA4: $50 million\r\n\r\nQ5: When did India become a Full Dialogue Partner of ASEAN?\r\nA5: 1995\r\n\r\nQ6: Name three ASEAN member countries.\r\nA6: Any three from: Myanmar, Brunei, Indonesia, Laos, Thailand, Vietnam, Cambodia, Philippines, Singapore, Malaysia', 'International Relations', '[\"ASEAN\", \"India\", \"Summit\", \"Act East Policy\", \"Indo-Pacific\", \"Trade\", \"Diplomacy\", \"Strategic Partnership\"]', NULL, 'Ministry of External Affairs', 'https://www.mea.gov.in', '2025-11-22 00:00:00', 'high', 0, '2025-12-07 13:42:58', '2025-12-07 13:42:58'),
(6, 'Supreme Court Clarifies Article 370 Status: Historic 5-Judge Constitution Bench Delivers Unanimous Verdict', 'The Supreme Court of India, in a unanimous decision by a 5-judge Constitution Bench, upheld the constitutional validity of the abrogation of Article 370 and the reorganization of Jammu & Kashmir into two Union Territories, settling one of India\'s most significant constitutional questions.', 'In a landmark judgment that will be studied for decades, the Supreme Court of India delivered its verdict on the constitutional validity of the Centre\'s actions regarding Article 370 of the Indian Constitution and the reorganization of the erstwhile state of Jammu & Kashmir.\r\n\r\n**Background:**\r\nOn August 5, 2019, the Government of India issued a Presidential Order under Article 370(3) to supersede the Constitution (Application to Jammu and Kashmir) Order, 1954, effectively making all provisions of the Indian Constitution applicable to J&K. Subsequently, the Jammu and Kashmir Reorganisation Act, 2019 was passed, bifurcating the state into two Union Territories: Jammu & Kashmir (with legislature) and Ladakh (without legislature).\r\n\r\n**What was Article 370?**\r\nArticle 370 was a \"temporary provision\" inserted in the Constitution granting special autonomous status to Jammu & Kashmir. It:\r\n- Limited Parliament\'s power to make laws for J&K\r\n- Allowed J&K to have its own Constitution\r\n- Restricted the application of the Indian Constitution to J&K\r\n- Required the J&K government\'s concurrence for extending Central laws\r\n\r\n**Key Points of the Supreme Court Judgment:**\r\n\r\n**1. Constitutional Validity:**\r\nThe 5-judge bench unanimously held that:\r\n- Article 370 could be modified or abrogated by the President\r\n- The Presidential Orders issued on August 5-6, 2019 were constitutionally valid\r\n- Article 370 was always intended to be temporary, not permanent\r\n\r\n**2. Reorganization Legitimacy:**\r\n- Parliament has the power under Article 3 to reorganize states\r\n- The conversion of J&K state into two Union Territories is constitutional\r\n- The procedure followed was in accordance with constitutional provisions\r\n\r\n**3. Statehood Restoration:**\r\nThe Court directed the Centre to:\r\n- Restore full statehood to Jammu & Kashmir \"at the earliest\"\r\n- Complete delimitation exercise by May 2025\r\n- Conduct assembly elections by September 2025\r\n\r\n**Legal Principles Established:**\r\n\r\n**Doctrine of Temporary Provisions:**\r\nThe Court clarified that Article 370\'s placement in Part XXI (Temporary, Transitional and Special Provisions) indicated its non-permanent nature.\r\n\r\n**Federal Structure:**\r\nThe judgment reaffirmed Parliament\'s power to reorganize states under Article 3, even in special category states.\r\n\r\n**Presidential Powers:**\r\nThe Court upheld the President\'s authority to issue constitutional orders under Article 370(3), even after the dissolution of the J&K Constituent Assembly in 1957.\r\n\r\n**Historical Significance:**\r\nThis judgment:\r\n- Settles a 70-year-old constitutional question\r\n- Has implications for federalism and Centre-state relations\r\n- Impacts India\'s approach to regional autonomy\r\n- Affects geopolitical dynamics in South Asia\r\n\r\n**Constitutional Articles Involved:**\r\n- Article 370: Special provisions for J&K (now inoperative)\r\n- Article 3: Power of Parliament to form new states\r\n- Article 356: President\'s Rule provisions\r\n- Article 367: Interpretation provisions\r\n\r\n**Quick Facts for Exams:**\r\nQ1: How many judges were on the Constitution Bench that decided the Article 370 case?\r\nA1: 5 judges (Constitution Bench)\r\n\r\nQ2: On what date was Article 370 effectively abrogated?\r\nA2: August 5, 2019\r\n\r\nQ3: Into how many Union Territories was J&K reorganized?\r\nA3: Two - Jammu & Kashmir (with legislature) and Ladakh (without legislature)\r\n\r\nQ4: Which Article of the Constitution gives Parliament the power to reorganize states?\r\nA4: Article 3\r\n\r\nQ5: By when did the Supreme Court direct assembly elections to be held in J&K?\r\nA5: By September 2025\r\n\r\nQ6: In which Part of the Constitution was Article 370 placed?\r\nA6: Part XXI (Temporary, Transitional and Special Provisions)\r\n\r\nQ7: What was the nature of the Supreme Court\'s verdict?\r\nA7: Unanimous (all 5 judges agreed)', 'Judiciary', '[\"Supreme Court\", \"Article 370\", \"Jammu Kashmir\", \"Constitution\", \"Landmark Judgment\", \"Constitutional Law\", \"Federalism\"]', NULL, 'Supreme Court of India', 'https://www.sci.gov.in', '2025-12-05 00:00:00', 'high', 4, '2025-12-07 13:42:58', '2026-01-01 21:11:19');

-- --------------------------------------------------------

--
-- Table structure for table `enrollments`
--

CREATE TABLE `enrollments` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `course_id` int NOT NULL,
  `progress` int NOT NULL DEFAULT '0',
  `completed_lessons` int NOT NULL DEFAULT '0',
  `last_accessed_at` timestamp NULL DEFAULT NULL,
  `access_granted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `access_expires_at` timestamp NULL DEFAULT NULL,
  `is_access_expired` tinyint(1) DEFAULT '0',
  `completed_at` timestamp NULL DEFAULT NULL,
  `certificate_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now())
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `enrollments`
--

INSERT INTO `enrollments` (`id`, `user_id`, `course_id`, `progress`, `completed_lessons`, `last_accessed_at`, `access_granted_at`, `access_expires_at`, `is_access_expired`, `completed_at`, `certificate_url`, `created_at`) VALUES
(1, 5, 2, 0, 0, NULL, '2026-01-08 19:28:22', NULL, 0, NULL, NULL, '2025-12-01 22:02:27'),
(2, 1, 2, 0, 0, NULL, '2026-01-08 19:28:22', NULL, 0, NULL, NULL, '2025-12-01 23:00:16'),
(3, 5, 3, 0, 0, NULL, '2026-01-08 19:28:22', NULL, 0, NULL, NULL, '2025-12-01 23:01:52'),
(4, 2, 1, 17, 2, '2025-12-02 04:41:01', '2026-01-08 19:28:22', NULL, 0, NULL, NULL, '2025-12-02 10:09:15'),
(5, 2, 2, 0, 0, NULL, '2026-01-08 19:28:22', NULL, 0, NULL, NULL, '2025-12-02 10:13:56'),
(6, 1, 1, 0, 0, NULL, '2026-01-08 19:28:22', NULL, 0, NULL, NULL, '2025-12-06 10:39:28'),
(7, 1, 7, 0, 0, NULL, '2026-01-08 19:28:22', NULL, 0, NULL, NULL, '2025-12-06 12:16:11'),
(8, 2, 7, 33, 1, '2025-12-09 15:18:21', '2026-01-08 19:28:22', NULL, 0, NULL, NULL, '2025-12-09 18:53:30'),
(9, 5, 7, 0, 0, NULL, '2026-01-08 19:28:22', NULL, 0, NULL, NULL, '2025-12-09 19:45:22'),
(10, 6, 7, 0, 0, NULL, '2026-01-08 19:28:22', NULL, 0, NULL, NULL, '2025-12-21 17:50:13'),
(11, 2, 3, 0, 0, NULL, '2026-01-08 19:28:22', NULL, 0, NULL, NULL, '2025-12-28 20:08:54'),
(12, 10, 7, 0, 0, NULL, '2026-01-08 19:28:22', NULL, 0, NULL, NULL, '2025-12-31 20:24:16'),
(13, 10, 4, 0, 0, NULL, '2026-01-08 19:28:22', NULL, 0, NULL, NULL, '2025-12-31 23:52:50'),
(14, 11, 7, 0, 0, NULL, '2026-01-08 19:28:22', NULL, 0, NULL, NULL, '2026-01-01 21:05:35'),
(15, 11, 4, 0, 0, NULL, '2026-01-08 19:28:22', NULL, 0, NULL, NULL, '2026-01-01 21:06:38'),
(16, 10, 8, 0, 0, NULL, '2026-01-08 19:28:22', NULL, 0, NULL, NULL, '2026-01-03 01:08:51'),
(17, 10, 9, 0, 0, NULL, '2026-01-08 19:28:22', NULL, 0, NULL, NULL, '2026-01-03 01:19:19'),
(18, 13, 9, 0, 0, NULL, '2026-01-08 19:28:22', NULL, 0, NULL, NULL, '2026-01-03 01:56:23'),
(19, 2, 8, 0, 0, NULL, '2026-01-24 14:02:45', NULL, 0, NULL, NULL, '2026-01-24 19:32:44'),
(20, 1, 9, 0, 0, NULL, '2026-02-25 18:49:51', NULL, 0, NULL, NULL, '2026-02-25 18:49:51'),
(21, 1, 8, 100, 1, '2026-03-09 15:57:42', '2026-03-09 21:27:31', NULL, 0, NULL, NULL, '2026-03-09 21:27:31');

-- --------------------------------------------------------

--
-- Table structure for table `feedbacks`
--

CREATE TABLE `feedbacks` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Anonymous',
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` int NOT NULL DEFAULT '5',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `user_id` int DEFAULT NULL,
  `is_public` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `feedbacks`
--

INSERT INTO `feedbacks` (`id`, `name`, `email`, `message`, `rating`, `status`, `user_id`, `is_public`, `created_at`, `updated_at`) VALUES
(2, 'Shivang kumar', NULL, 'Great Platform', 5, 'approved', NULL, 1, '2025-12-13 23:54:11', '2025-12-13 23:55:51'),
(3, 'Naman singh', NULL, 'very good', 5, 'approved', NULL, 1, '2025-12-28 11:33:35', '2025-12-28 11:34:20'),
(4, 'Abhishek Kumar', NULL, 'Excllent platform', 5, 'approved', NULL, 1, '2025-12-29 23:34:46', '2025-12-29 23:35:11'),
(5, 'Ritesh Kumar', NULL, 'Greatfull', 5, 'approved', NULL, 1, '2026-01-06 00:45:28', '2026-03-09 22:51:14'),
(6, 'Shivang kumar', NULL, 'greate', 5, 'approved', NULL, 1, '2026-03-09 22:51:33', '2026-03-09 22:51:40'),
(7, 'Naman singh', NULL, 'great', 5, 'approved', NULL, 1, '2026-03-09 22:51:59', '2026-03-09 22:52:09');

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` int NOT NULL,
  `title` varchar(500) NOT NULL,
  `organization` varchar(255) NOT NULL,
  `department` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `positions` int DEFAULT NULL,
  `qualifications` text,
  `experience` varchar(255) DEFAULT NULL,
  `salary` varchar(255) DEFAULT NULL,
  `age_limit` varchar(100) DEFAULT NULL,
  `application_fee` varchar(100) DEFAULT NULL,
  `description` text,
  `responsibilities` json DEFAULT NULL,
  `requirements` json DEFAULT NULL,
  `benefits` json DEFAULT NULL,
  `apply_url` varchar(500) DEFAULT NULL,
  `last_date` datetime DEFAULT NULL,
  `exam_date` datetime DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'active',
  `views` int NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `jobs`
--

INSERT INTO `jobs` (`id`, `title`, `organization`, `department`, `location`, `state`, `positions`, `qualifications`, `experience`, `salary`, `age_limit`, `application_fee`, `description`, `responsibilities`, `requirements`, `benefits`, `apply_url`, `last_date`, `exam_date`, `status`, `views`, `created_at`, `updated_at`) VALUES
(1, 'testing', 'cvbnm', 'State PSC', 'fghjkfghnjm', 'dfghnjkdfghnjm', 500, 'dfghnjkdfghnjmk,.', '0', '25000', '40', '500', 'asdcvbnmscvbnmdfgbnm', NULL, NULL, NULL, 'www.google.com', '2025-12-07 00:00:00', '2025-12-30 00:00:00', 'closed', 0, '2025-12-07 09:57:30', '2025-12-07 11:01:49'),
(2, 'IBPS PO Recruitment 2025 - Probationary Officer', 'IBPS', 'Banking', 'All India', 'All India', 4135, 'Graduate degree in any discipline from a recognized university', 'Freshers can apply', '₹23,700 - ₹42,020 per month', '20-30 years', '₹850 for General/OBC, ₹175 for SC/ST/PWD', 'Institute of Banking Personnel Selection (IBPS) invites online applications for recruitment of Probationary Officers in various participating banks. Selected candidates will undergo 2 years of training and will be placed in clerical/officer cadre.', '[\"Managing customer accounts and transactions\", \"Processing loan applications\", \"Cash handling and vault operations\", \"Customer relationship management\", \"Branch banking operations\"]', '[\"Bachelor degree from recognized university\", \"Proficiency in local language\", \"Computer knowledge required\", \"Age between 20-30 years as on 01-12-2025\"]', '[\"Attractive salary package with regular increments\", \"Medical benefits for self and family\", \"Pension and gratuity\", \"Housing loan at concessional rates\", \"Career growth opportunities\"]', 'https://ibps.in/po-recruitment-2025', '2025-12-31 23:59:59', '2026-02-15 10:00:00', 'closed', 0, '2025-12-07 10:28:08', '2025-12-07 11:01:38'),
(3, 'SSC CGL 2025 - Combined Graduate Level Examination', 'Staff Selection Commission', 'SSC', 'All India', 'All India', 17727, 'Bachelor Degree from a recognized University or equivalent', '0-2 years (depending on post)', '₹18,000 - ₹56,900 per month', '18-32 years (age relaxation for reserved categories)', '₹100 for General/OBC/EWS, Exempted for Women/SC/ST/PWD/Ex-Servicemen', 'Staff Selection Commission (SSC) conducts Combined Graduate Level (CGL) examination for recruitment to various Group B and Group C posts in Ministries/Departments/Organizations of Government of India. The examination is conducted in four tiers: Tier-I, Tier-II, Tier-III and Tier-IV.', '[\"Administrative support and office management\", \"Data entry and record maintenance\", \"Statistical analysis and reporting\", \"Taxation and revenue collection\", \"Audit and accounts management\"]', '[\"Graduate from recognized university\", \"Age limit: 18-32 years\", \"Computer proficiency required\", \"Typing speed: 35 wpm in English or 30 wpm in Hindi\"]', '[\"Central Government job security\", \"DA, HRA, and other allowances\", \"Medical facilities\", \"Pension and retirement benefits\", \"Leave Travel Concession (LTC)\"]', 'https://ssc.nic.in/cgl-2025', '2025-12-10 00:00:00', '2025-12-25 00:00:00', 'active', 1, '2025-12-07 10:28:08', '2026-02-25 18:50:39'),
(4, 'Railway Recruitment Board NTPC 2025 - Non-Technical Popular Categories', 'Railway Recruitment Board', 'Railway', 'All India', 'All India', 35281, '12th Pass / Graduate (depending on post)', 'Freshers can apply', '₹19,900 - ₹35,400 per month', '18-36 years (post-wise)', '₹500 for General/OBC, ₹250 for SC/ST/Ex-Servicemen/Women/PWD/Minorities', 'Railway Recruitment Boards invite applications for recruitment to Non-Technical Popular Categories (NTPC) posts under Graduate and Undergraduate categories. Posts include Commercial Apprentice, Station Master, Goods Guard, Senior Clerk, Junior Accountant, etc. The selection process includes Computer Based Test (CBT) Stage I & II, Typing Skill Test, and Document Verification.', '[\"Train operations and passenger services\", \"Ticket checking and revenue collection\", \"Station management and coordination\", \"Commercial operations handling\", \"Safety and security protocols\"]', '[\"10+2 or Graduation from recognized board/university\", \"Medical fitness as per Railway standards\", \"Typing speed requirement for clerical posts\", \"Knowledge of regional language preferred\"]', '[\"Job security in Indian Railways\", \"Free railway pass for self and family\", \"Medical facilities\", \"Government accommodation\", \"Pension and retirement benefits\", \"Career advancement opportunities\"]', 'https://rrbcdg.gov.in/ntpc-2025', '2026-01-15 23:59:59', '2026-04-20 09:00:00', 'active', 2, '2025-12-07 10:28:08', '2026-02-25 18:48:45'),
(5, 'UPSC Civil Services Examination 2025 (IAS/IPS/', 'Union Public Service Commission', 'UPSC', 'All India', 'All India', 1056, 'Bachelor Degree from a recognized university in any discipline', 'Freshers can apply', '₹56,100 - ₹2,50,000 per month (depending on service)', '21-32 years (age relaxation for reserved categories)', '₹100 (No fee for Female/SC/ST/PWD candidates)', 'Union Public Service Commission conducts Civil Services Examination for recruitment to various All India Services (IAS, IPS, IFS) and Central Services Group A and Group B. The examination is conducted in three stages: Preliminary, Mains, and Personality Test. This is one of the most prestigious competitive examinations in India.', '[\"Policy formulation and implementation\", \"Administrative decision making\", \"Law and order maintenance\", \"Revenue administration\", \"Diplomatic relations and foreign affairs\", \"District/state level governance\"]', '[\"Bachelor degree from recognized university\", \"Age: 21-32 years (relaxation for reserved categories)\", \"Number of attempts: 6 for General, 9 for OBC, Unlimited for SC/ST\", \"Physical standards for IPS service\"]', '[\"Highest level of administrative power\", \"Attractive salary with Grade Pay\", \"Official residence and staff\", \"Vehicle and driver facility\", \"Foreign posting opportunities\", \"Pension and retirement benefits\", \"Medical facilities for entire family\"]', 'https://upsc.gov.in/civil-services-2025', '2025-02-28 23:59:59', '2025-06-15 09:00:00', 'active', 0, '2025-12-07 10:28:08', '2025-12-07 10:56:07'),
(6, 'Indian Army Agniveer Recruitment Rally 2025 - General Duty/Technical/Clerk', 'Indian Army', 'Defence', 'Various Rally Locations', 'All India', 45000, '10th Pass / 12th Pass / Graduate (post-wise)', 'Freshers - No experience required', '₹30,000 - ₹40,000 per month (during service period)', '17.5 - 21 years', 'No application fee', 'Indian Army invites applications for Agniveer recruitment under Agnipath Scheme. Candidates will be enrolled for 4 years including training period. Various posts available: Agniveer General Duty, Agniveer Technical, Agniveer Clerk/Store Keeper Technical, Agniveer Tradesman. Physical fitness tests, medical examination, and written exam will be conducted. After 4 years, 25% will be retained in regular cadre.', '[\"Military operations and combat readiness\", \"Weapon handling and maintenance\", \"Physical fitness and drill\", \"Technical maintenance and support\", \"Administrative and clerical work\", \"Following military discipline and protocols\"]', '[\"Physical Standards: Height 160cm, Weight 50kg, Chest 77-82cm\", \"10th/12th pass from recognized board\", \"Age: 17.5 to 21 years\", \"Medical fitness as per Army standards\", \"Unmarried status required\", \"No criminal record\"]', '[\"Seva Nidhi Package of ₹11.71 lakh after 4 years\", \"Monthly salary ₹30,000-40,000\", \"Risk and hardship allowances\", \"Life insurance cover\", \"25% retention in regular Army\", \"Certificate of service\", \"Skill training and development\", \"Priority in other government jobs after service\"]', 'https://joinindianarmy.nic.in/agniveer-2025', '2025-01-31 23:59:59', '2025-03-15 06:00:00', 'active', 0, '2025-12-07 10:28:08', '2025-12-07 10:28:08'),
(7, 'test', 'rfgbhnjm', 'Teaching', 'derfgtbhnjm', 'decfvgbhnj', NULL, '', '', '', '', '', 'sdxcfgvbnhjmk,', NULL, NULL, NULL, 'https://www.google.com', '2025-12-31 00:00:00', '2026-01-01 00:00:00', 'active', 2, '2025-12-28 11:37:15', '2026-02-24 22:42:37');

-- --------------------------------------------------------

--
-- Table structure for table `lessons`
--

CREATE TABLE `lessons` (
  `id` int NOT NULL,
  `module_id` int NOT NULL,
  `course_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `content_type` varchar(50) NOT NULL,
  `video_url` varchar(500) DEFAULT NULL,
  `pdf_url` varchar(500) DEFAULT NULL,
  `text_content` text,
  `duration` int DEFAULT NULL,
  `order_index` int NOT NULL DEFAULT '0',
  `is_free` tinyint(1) NOT NULL DEFAULT '0',
  `is_published` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `lessons`
--

INSERT INTO `lessons` (`id`, `module_id`, `course_id`, `title`, `description`, `content_type`, `video_url`, `pdf_url`, `text_content`, `duration`, `order_index`, `is_free`, `is_published`, `created_at`, `updated_at`) VALUES
(36, 9, 8, 'Lesson Testing', 'Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing ', 'video', 'https://youtu.be/80j9grpwfJk?si=fcJPV70sWIsk_k8S', NULL, NULL, 5, 0, 0, 1, '2026-01-01 21:40:37', '2026-01-01 21:40:37');

-- --------------------------------------------------------

--
-- Table structure for table `lesson_progress`
--

CREATE TABLE `lesson_progress` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `lesson_id` int NOT NULL,
  `course_id` int NOT NULL,
  `is_completed` tinyint(1) NOT NULL DEFAULT '0',
  `progress_percentage` int NOT NULL DEFAULT '0',
  `last_position` int DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `lesson_progress`
--

INSERT INTO `lesson_progress` (`id`, `user_id`, `lesson_id`, `course_id`, `is_completed`, `progress_percentage`, `last_position`, `completed_at`, `created_at`, `updated_at`) VALUES
(4, 1, 36, 8, 1, 100, NULL, '2026-03-09 15:57:42', '2026-03-09 21:27:41', '2026-03-09 21:27:41');

-- --------------------------------------------------------

--
-- Table structure for table `modules`
--

CREATE TABLE `modules` (
  `id` int NOT NULL,
  `course_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `order_index` int NOT NULL DEFAULT '0',
  `is_published` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `modules`
--

INSERT INTO `modules` (`id`, `course_id`, `title`, `description`, `order_index`, `is_published`, `created_at`, `updated_at`) VALUES
(9, 8, 'Module 1', 'Auto-generated module', 0, 1, '2026-01-01 21:40:37', '2026-01-01 21:40:37');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(50) NOT NULL,
  `link` varchar(500) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT (now())
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `course_id` int DEFAULT NULL,
  `quiz_id` int DEFAULT NULL,
  `study_material_id` int DEFAULT NULL,
  `order_id` varchar(255) NOT NULL,
  `transaction_id` varchar(255) NOT NULL,
  `payment_id` varchar(255) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'INR',
  `status` varchar(50) NOT NULL DEFAULT 'pending',
  `method` varchar(50) DEFAULT NULL,
  `signature` varchar(500) DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `user_id`, `course_id`, `quiz_id`, `study_material_id`, `order_id`, `transaction_id`, `payment_id`, `amount`, `currency`, `status`, `method`, `signature`, `metadata`, `created_at`, `updated_at`) VALUES
(1, 5, 2, NULL, NULL, 'order_RmVIc4hWojJzKK', 'TXN202512020328090001', NULL, '8999.00', 'INR', 'pending', NULL, NULL, '{\"couponId\": null, \"courseId\": 2, \"baseAmount\": 8999, \"couponCode\": null, \"finalAmount\": 8999}', '2025-12-01 21:58:09', '2025-12-08 12:19:02'),
(2, 5, 2, NULL, NULL, 'order_RmVJk0fL1Sd6Z2', 'TXN202512020329130002', NULL, '8999.00', 'INR', 'pending', NULL, NULL, '{\"couponId\": null, \"courseId\": 2, \"baseAmount\": 8999, \"couponCode\": null, \"finalAmount\": 8999}', '2025-12-01 21:59:13', '2025-12-08 12:19:02'),
(3, 5, 2, NULL, NULL, 'order_RmVKNPdzu587GF', 'TXN202512020329490003', NULL, '8999.00', 'INR', 'pending', NULL, NULL, '{\"couponId\": null, \"courseId\": 2, \"baseAmount\": 8999, \"couponCode\": null, \"finalAmount\": 8999}', '2025-12-01 21:59:49', '2025-12-08 12:19:02'),
(4, 5, 2, NULL, NULL, 'order_RmVMTTyDIywUgr', 'TXN202512020331480004', 'pay_RmVMtPSmddJJAW', '8999.00', 'INR', 'success', NULL, 'd42865069d6c3986b64c2a1da8e6f81e5b4f20d8df627779941d6f27aa999c96', '{\"couponId\": null, \"courseId\": 2, \"baseAmount\": 8999, \"couponCode\": null, \"finalAmount\": 8999}', '2025-12-01 22:01:48', '2025-12-08 12:19:02'),
(5, 5, 3, NULL, NULL, 'order_RmWNVafQmWYTKk', 'TXN202512020431280005', 'pay_RmWNffEDLcOiIh', '5999.00', 'INR', 'success', NULL, '1ab7eb357d4cf914e653c2c9a69aed525635e9dbb4283c9e4f7f70a53b19728b', '{\"couponId\": null, \"courseId\": 3, \"baseAmount\": 5999, \"couponCode\": null, \"finalAmount\": 5999}', '2025-12-01 23:01:28', '2025-12-08 12:19:02'),
(6, 2, 1, NULL, NULL, 'order_RmhkTePjmSQMDj', 'TXN202512021538510006', 'pay_RmhkeDRo6v3812', '29999.00', 'INR', 'success', NULL, 'c28f2467f356d53e7a7a47ea443aadb801cb3ac25381518940c282c7f72255a5', '{\"couponId\": null, \"courseId\": 1, \"baseAmount\": 29999, \"couponCode\": null, \"finalAmount\": 29999}', '2025-12-02 10:08:51', '2025-12-08 12:19:02'),
(7, 2, 2, NULL, NULL, 'order_RmhpQQt6m1eDeE', 'TXN202512021543320007', 'pay_Rmhpa7De3Hj9RV', '8999.00', 'INR', 'success', NULL, '34306c573ed72974f68d3e549ca6458b8b466bbb8f0951444f84f31242d0b8a9', '{\"couponId\": null, \"courseId\": 2, \"baseAmount\": 8999, \"couponCode\": null, \"finalAmount\": 8999}', '2025-12-02 10:13:32', '2025-12-08 12:19:02'),
(8, 2, 4, NULL, NULL, 'order_RmkznDxDQMn5QD', 'TXN202512021849250008', NULL, '2999.00', 'INR', 'pending', NULL, NULL, '{\"couponId\": null, \"courseId\": 4, \"baseAmount\": 2999, \"couponCode\": null, \"finalAmount\": 2999}', '2025-12-02 13:19:25', '2025-12-08 12:19:02'),
(9, 1, 5, NULL, NULL, 'order_RnFEzTMCIZeSdc', 'TXN202512040024370009', NULL, '17999.00', 'INR', 'pending', NULL, NULL, '{\"couponId\": null, \"courseId\": 5, \"baseAmount\": 17999, \"couponCode\": null, \"finalAmount\": 17999}', '2025-12-03 18:54:37', '2025-12-08 12:19:02'),
(10, 5, NULL, NULL, NULL, 'order_RnFdCPunuVYKk7', 'TXN202512040047320010', NULL, '299.00', 'INR', 'pending', NULL, NULL, '{\"quizId\": 5, \"couponId\": null, \"baseAmount\": 299, \"couponCode\": null, \"finalAmount\": 299}', '2025-12-03 19:17:32', '2025-12-08 12:19:02'),
(11, 5, NULL, NULL, NULL, 'order_RnFdNlKBBQIaoZ', 'TXN202512040047420011', 'pay_RnFdYSrRwCK8tH', '299.00', 'INR', 'success', NULL, 'de007e5ae942ee0966ed8ead356718249b977cfee34aa9cead5fd936f75c60b0', '{\"quizId\": 5, \"couponId\": null, \"baseAmount\": 299, \"couponCode\": null, \"finalAmount\": 299}', '2025-12-03 19:17:42', '2025-12-08 12:19:02'),
(12, 5, NULL, NULL, NULL, 'order_RndajFXpJ8cnHQ', 'TXN202512050013510012', 'pay_Rndb3XH6OEfLpe', '299.00', 'INR', 'success', NULL, 'ab4670df82f536752bc0874a447d4d555f8a145e99bcea961e3840750574864d', '{\"quizId\": 5, \"couponId\": null, \"baseAmount\": 299, \"couponCode\": null, \"finalAmount\": 299}', '2025-12-04 18:43:51', '2025-12-08 12:19:02'),
(13, 5, NULL, 5, NULL, 'order_RndkLemMtl5vwj', 'TXN202512050022570013', 'pay_RndkWjhJZTcd0x', '299.00', 'INR', 'success', NULL, '187c1e5eeb29d794611e37043ec22b49ebaead39fd6492f3ec79302e14965ac0', '{\"quizId\": 5, \"couponId\": null, \"baseAmount\": 299, \"couponCode\": null, \"finalAmount\": 299}', '2025-12-04 18:52:57', '2025-12-08 12:19:02'),
(14, 5, NULL, 5, NULL, 'order_RndnA2X5uNxjAZ', 'TXN202512050025370014', 'pay_RndnKtK10TC6mh', '299.00', 'INR', 'success', NULL, 'b269c161d3ddb21e567565ea0c6c83c0be3d160b81d7c176166d1ca1f6e19013', '{\"quizId\": 5, \"couponId\": null, \"baseAmount\": 299, \"couponCode\": null, \"finalAmount\": 299}', '2025-12-04 18:55:37', '2025-12-08 12:19:02'),
(15, 5, NULL, 5, NULL, 'order_RndtTr9Si2YkU4', 'TXN202512050031360015', 'pay_Rndtdh3jaw2cAK', '299.00', 'INR', 'success', NULL, '20813c0d8f3b6548ba9457da52c625b06db7c12d818763042cb0c90a1cfb3333', '{\"quizId\": 5, \"couponId\": null, \"baseAmount\": 299, \"couponCode\": null, \"finalAmount\": 299}', '2025-12-04 19:01:36', '2025-12-08 12:19:02'),
(16, 5, NULL, 5, NULL, 'order_Rndwq9M1nCGkpp', 'TXN202512050034470016', 'pay_Rndx07Kyvzn0wg', '299.00', 'INR', 'success', NULL, '8d904eeccb3c132494fe94974f3a80b6c2802939677035cfcccc80f4a5e29f3d', '{\"quizId\": 5, \"couponId\": null, \"baseAmount\": 299, \"couponCode\": null, \"finalAmount\": 299}', '2025-12-04 19:04:47', '2025-12-08 12:19:02'),
(17, 5, NULL, 5, NULL, 'order_Rne1yNa6kLJGYP', 'TXN202512050039380017', 'pay_Rne29Tnohi5FH7', '299.00', 'INR', 'success', NULL, '0bbc7723dda02ad1d9dc6ddefd47fdde589d4db097d91afe3015e25a0cb6cb0e', '{\"quizId\": 5, \"couponId\": null, \"baseAmount\": 299, \"couponCode\": null, \"finalAmount\": 299}', '2025-12-04 19:09:38', '2025-12-08 12:19:02'),
(19, 5, NULL, 5, NULL, 'order_Rne6sShyC767T6', 'TXN202512050044170019', 'pay_Rne7265VqnFBrJ', '299.00', 'INR', 'success', NULL, '63c9209aca2bc795aaf803f6ae8476bc2d3ad00dfe34870b0812af52f5ea7906', '{\"quizId\": 5, \"couponId\": null, \"baseAmount\": 299, \"couponCode\": null, \"finalAmount\": 299}', '2025-12-04 19:14:17', '2025-12-08 12:19:02'),
(20, 1, 1, NULL, NULL, 'order_RoIOo6ymfqiuu7', 'TXN202512061609000020', 'pay_RoIP21pZpB6tsd', '999.00', 'INR', 'success', NULL, '465f0c2ed7cb88da56f1763d2acf83c84fb136d010a1feccea82c28e8e8d301f', '{\"couponId\": null, \"courseId\": 1, \"baseAmount\": 999, \"couponCode\": null, \"finalAmount\": 999}', '2025-12-06 10:39:00', '2025-12-08 12:19:02'),
(21, 1, 7, NULL, NULL, 'order_RoK2xtUinFVNdh', 'TXN202512061745420021', 'pay_RoK3CgSOFHbZLJ', '9.00', 'INR', 'success', NULL, '3b485b6cde6579a2f1a60fb50e1cfd5fbf836a1bce6c5a050660c0585c2d7b59', '{\"couponId\": null, \"courseId\": 7, \"baseAmount\": 9, \"couponCode\": null, \"finalAmount\": 9}', '2025-12-06 12:15:42', '2025-12-08 12:19:02'),
(22, 2, NULL, 9, NULL, 'order_RoSEMcqvI0SrOt', 'TXN202512070146030022', 'pay_RoSEZ6BC8Ay5nP', '100.00', 'INR', 'success', NULL, 'f5607677067473d5d7669250ec3fbe30a9f4dce86bc80475e5c6bf9e65d9c007', '{\"quizId\": 9, \"couponId\": null, \"baseAmount\": 100, \"couponCode\": null, \"finalAmount\": 100}', '2025-12-06 20:16:03', '2025-12-08 12:19:02'),
(23, 2, NULL, 5, NULL, 'order_RoSpdeToo0nJho', 'TXN202512070221200023', 'pay_RoSpnmuQcTuHxw', '299.00', 'INR', 'success', NULL, 'cdb1c4c4f936eaf5285afd2891c8a2830b248b9621b112336db1a65234ce7a64', '{\"quizId\": 5, \"couponId\": null, \"baseAmount\": 299, \"couponCode\": null, \"finalAmount\": 299}', '2025-12-06 20:51:20', '2025-12-08 12:19:02'),
(24, 2, NULL, 12, NULL, 'order_RoSsLwNMfRSbss', 'TXN202512070223540024', 'pay_RoSsUfYNVnHVol', '99.00', 'INR', 'success', NULL, '22617fb0f7dde5308d0c85ec05c66527135f2a35b00193c79f2eab142cb5774e', '{\"quizId\": 12, \"couponId\": null, \"baseAmount\": 99, \"couponCode\": null, \"finalAmount\": 99}', '2025-12-06 20:53:54', '2025-12-08 12:19:02'),
(25, 2, NULL, 5, NULL, 'order_RoT5CDpndoM1mz', 'TXN202512070236040025', 'pay_RoT5QLYUes7flE', '299.00', 'INR', 'success', NULL, '468b07d7bf70e7a5c601f5a1b3b83c0e632b887d665ef06187d17ab5c49756b5', '{\"quizId\": 5, \"couponId\": null, \"baseAmount\": 299, \"couponCode\": null, \"finalAmount\": 299}', '2025-12-06 21:06:04', '2025-12-08 12:19:02'),
(26, 2, NULL, 13, NULL, 'order_RoTGU4QP7Ij59b', 'TXN202512070246450026', 'pay_RoTGfR9MAx4kM8', '9.00', 'INR', 'success', NULL, '49820efe78823ecf891c55e97b1fd92b36c546058a45789b85d1390567bda34d', '{\"quizId\": 13, \"couponId\": null, \"baseAmount\": 9, \"couponCode\": null, \"finalAmount\": 9}', '2025-12-06 21:16:45', '2025-12-08 12:19:02'),
(27, 2, 7, NULL, NULL, 'order_RpcQ100fPxYtuH', 'TXN_COURSE_7_2_1765306380923', 'pay_RpcQEvczqMcZOh', '99.00', 'INR', 'success', NULL, '956d3d287ecc6a8f41dfd0feabc438167ca4f62c01fcb609112575093d664e12', '{\"couponId\": null, \"courseId\": 7, \"baseAmount\": 99, \"couponCode\": null, \"finalAmount\": 99}', '2025-12-09 18:53:00', '2025-12-09 18:53:30'),
(28, 5, 7, NULL, NULL, 'order_RpdIUnxfxfVh6f', 'TXN_COURSE_7_5_1765309475479', 'pay_RpdJ2YmE38IWVa', '99.00', 'INR', 'success', NULL, '68548ce0dce9d01a96a0366f16f6968452fdd9c1b40ee671d636a74d6bd4fdad', '{\"couponId\": null, \"courseId\": 7, \"baseAmount\": 99, \"couponCode\": null, \"finalAmount\": 99}', '2025-12-09 19:44:35', '2025-12-09 19:45:22'),
(29, 5, NULL, 12, NULL, 'order_RpfjV4WI343Xdq', 'TXN_QUIZ_12_5_1765318052609', NULL, '99.00', 'INR', 'pending', NULL, NULL, '{\"quizId\": 12, \"couponId\": null, \"baseAmount\": 99, \"couponCode\": null, \"finalAmount\": 99}', '2025-12-09 22:07:32', '2025-12-09 22:07:32'),
(30, 5, NULL, 12, NULL, 'order_RpgEqIY5lu7VP3', 'TXN_QUIZ_12_5_1765319832739', NULL, '99.00', 'INR', 'pending', NULL, NULL, '{\"quizId\": 12, \"couponId\": null, \"baseAmount\": 99, \"couponCode\": null, \"finalAmount\": 99}', '2025-12-09 22:37:12', '2025-12-09 22:37:12'),
(31, 5, NULL, NULL, 3, 'order_Rpgcs1KPUt1yYX', 'TXN_SM_3_5_1765321197512', 'pay_Rpgd2uEBKQrN0O', '399.00', 'INR', 'success', NULL, '36f0b34a7b33afbc8b1c7711a131f76dc3e01f681b20450ae63a5b7894e90a30', '{\"couponId\": null, \"baseAmount\": 399, \"couponCode\": null, \"finalAmount\": 399, \"studyMaterialId\": 3}', '2025-12-09 22:59:57', '2025-12-09 23:00:22'),
(32, 2, NULL, NULL, 5, 'order_RpgfYounqHLAfP', 'TXN_SM_5_2_1765321350289', NULL, '499.00', 'INR', 'pending', NULL, NULL, '{\"couponId\": null, \"baseAmount\": 499, \"couponCode\": null, \"finalAmount\": 499, \"studyMaterialId\": 5}', '2025-12-09 23:02:30', '2025-12-09 23:02:30'),
(33, 2, NULL, NULL, 5, 'order_RpgfbijliQpDm5', 'TXN_SM_5_2_1765321352958', NULL, '499.00', 'INR', 'pending', NULL, NULL, '{\"couponId\": null, \"baseAmount\": 499, \"couponCode\": null, \"finalAmount\": 499, \"studyMaterialId\": 5}', '2025-12-09 23:02:32', '2025-12-09 23:02:32'),
(34, 2, NULL, NULL, 5, 'order_RpgflZOEydwuVp', 'TXN_SM_5_2_1765321361965', NULL, '499.00', 'INR', 'pending', NULL, NULL, '{\"couponId\": null, \"baseAmount\": 499, \"couponCode\": null, \"finalAmount\": 499, \"studyMaterialId\": 5}', '2025-12-09 23:02:41', '2025-12-09 23:02:41'),
(35, 2, NULL, NULL, 5, 'order_RpgfunLeEbsRqn', 'TXN_SM_5_2_1765321370423', NULL, '499.00', 'INR', 'pending', NULL, NULL, '{\"couponId\": null, \"baseAmount\": 499, \"couponCode\": null, \"finalAmount\": 499, \"studyMaterialId\": 5}', '2025-12-09 23:02:50', '2025-12-09 23:02:50'),
(36, 2, NULL, NULL, 5, 'order_RpgfyBjut56KD8', 'TXN_SM_5_2_1765321373541', NULL, '499.00', 'INR', 'pending', NULL, NULL, '{\"couponId\": null, \"baseAmount\": 499, \"couponCode\": null, \"finalAmount\": 499, \"studyMaterialId\": 5}', '2025-12-09 23:02:53', '2025-12-09 23:02:53'),
(37, 2, NULL, NULL, 5, 'order_RpgfzYOGpFucpq', 'TXN_SM_5_2_1765321374782', NULL, '499.00', 'INR', 'pending', NULL, NULL, '{\"couponId\": null, \"baseAmount\": 499, \"couponCode\": null, \"finalAmount\": 499, \"studyMaterialId\": 5}', '2025-12-09 23:02:54', '2025-12-09 23:02:54'),
(38, 2, NULL, NULL, 3, 'order_RpggFjrjMktTOD', 'TXN_SM_3_2_1765321389610', NULL, '399.00', 'INR', 'pending', NULL, NULL, '{\"couponId\": null, \"baseAmount\": 399, \"couponCode\": null, \"finalAmount\": 399, \"studyMaterialId\": 3}', '2025-12-09 23:03:09', '2025-12-09 23:03:09'),
(39, 2, NULL, NULL, 3, 'order_RpggLHbFst0ecP', 'TXN_SM_3_2_1765321394727', NULL, '399.00', 'INR', 'pending', NULL, NULL, '{\"couponId\": null, \"baseAmount\": 399, \"couponCode\": null, \"finalAmount\": 399, \"studyMaterialId\": 3}', '2025-12-09 23:03:14', '2025-12-09 23:03:14'),
(40, 2, NULL, NULL, 5, 'order_RpzjhGcjSGR6ai', 'TXN_SM_5_2_1765388495706', NULL, '499.00', 'INR', 'pending', NULL, NULL, '{\"couponId\": null, \"baseAmount\": 499, \"couponCode\": null, \"finalAmount\": 499, \"studyMaterialId\": 5}', '2025-12-10 17:41:35', '2025-12-10 17:41:35'),
(41, 2, NULL, NULL, 5, 'order_RpzjkZYQEXaPFa', 'TXN_SM_5_2_1765388498696', NULL, '499.00', 'INR', 'pending', NULL, NULL, '{\"couponId\": null, \"baseAmount\": 499, \"couponCode\": null, \"finalAmount\": 499, \"studyMaterialId\": 5}', '2025-12-10 17:41:38', '2025-12-10 17:41:38'),
(42, 2, NULL, NULL, 5, 'order_RpzjtynHTSKjoQ', 'TXN_SM_5_2_1765388507317', NULL, '499.00', 'INR', 'pending', NULL, NULL, '{\"couponId\": null, \"baseAmount\": 499, \"couponCode\": null, \"finalAmount\": 499, \"studyMaterialId\": 5}', '2025-12-10 17:41:47', '2025-12-10 17:41:47'),
(43, 2, NULL, NULL, 3, 'order_Rpzk0nAUMAchYs', 'TXN_SM_3_2_1765388513560', NULL, '399.00', 'INR', 'pending', NULL, NULL, '{\"couponId\": null, \"baseAmount\": 399, \"couponCode\": null, \"finalAmount\": 399, \"studyMaterialId\": 3}', '2025-12-10 17:41:53', '2025-12-10 17:41:53'),
(44, 2, NULL, NULL, 3, 'order_Rpzk37IL3GeEy7', 'TXN_SM_3_2_1765388515698', NULL, '399.00', 'INR', 'pending', NULL, NULL, '{\"couponId\": null, \"baseAmount\": 399, \"couponCode\": null, \"finalAmount\": 399, \"studyMaterialId\": 3}', '2025-12-10 17:41:55', '2025-12-10 17:41:55'),
(45, 2, NULL, NULL, 3, 'order_Rpzk4Fzqh8X3OB', 'TXN_SM_3_2_1765388516730', NULL, '399.00', 'INR', 'pending', NULL, NULL, '{\"couponId\": null, \"baseAmount\": 399, \"couponCode\": null, \"finalAmount\": 399, \"studyMaterialId\": 3}', '2025-12-10 17:41:56', '2025-12-10 17:41:56'),
(46, 2, NULL, NULL, 3, 'order_Rpzk5B0zLwnBOz', 'TXN_SM_3_2_1765388517576', NULL, '399.00', 'INR', 'pending', NULL, NULL, '{\"couponId\": null, \"baseAmount\": 399, \"couponCode\": null, \"finalAmount\": 399, \"studyMaterialId\": 3}', '2025-12-10 17:41:57', '2025-12-10 17:41:57'),
(47, 5, NULL, 13, NULL, 'order_RrFMyhXsEDy9pi', 'TXN_QUIZ_13_5_1765661891890', 'pay_RrFN9fynInmxMa', '9.00', 'INR', 'success', NULL, 'a9e9feb0ba6423f321b0aa1ca35f2e5b1d75021356add76843146e6a888706c4', '{\"quizId\": 13, \"couponId\": null, \"baseAmount\": 9, \"couponCode\": null, \"finalAmount\": 9}', '2025-12-13 21:38:11', '2025-12-13 21:38:37'),
(48, 5, NULL, 12, NULL, 'order_RrJaobYpUm2Wl4', 'TXN_QUIZ_12_5_1765676764229', NULL, '99.00', 'INR', 'pending', NULL, NULL, '{\"quizId\": 12, \"couponId\": null, \"baseAmount\": 99, \"couponCode\": null, \"finalAmount\": 99}', '2025-12-14 01:46:04', '2025-12-14 01:46:04'),
(49, 2, NULL, NULL, 3, 'order_RrppVNKpWR4KJ7', 'TXN_SM_3_2_1765790290372', NULL, '399.00', 'INR', 'pending', NULL, NULL, '{\"couponId\": null, \"baseAmount\": 399, \"couponCode\": null, \"finalAmount\": 399, \"studyMaterialId\": 3}', '2025-12-15 09:18:10', '2025-12-15 09:18:10'),
(50, 2, NULL, NULL, 3, 'order_RrppYC6TNrj77N', 'TXN_SM_3_2_1765790293220', NULL, '399.00', 'INR', 'pending', NULL, NULL, '{\"couponId\": null, \"baseAmount\": 399, \"couponCode\": null, \"finalAmount\": 399, \"studyMaterialId\": 3}', '2025-12-15 09:18:13', '2025-12-15 09:18:13'),
(51, 2, NULL, NULL, 3, 'order_RrppqLY85URJFI', 'TXN_SM_3_2_1765790309550', NULL, '399.00', 'INR', 'pending', NULL, NULL, '{\"couponId\": null, \"baseAmount\": 399, \"couponCode\": null, \"finalAmount\": 399, \"studyMaterialId\": 3}', '2025-12-15 09:18:29', '2025-12-15 09:18:29'),
(52, 2, NULL, NULL, 3, 'order_Rrpq7QKzwL4vSB', 'TXN_SM_3_2_1765790325404', NULL, '399.00', 'INR', 'pending', NULL, NULL, '{\"couponId\": null, \"baseAmount\": 399, \"couponCode\": null, \"finalAmount\": 399, \"studyMaterialId\": 3}', '2025-12-15 09:18:45', '2025-12-15 09:18:45'),
(53, 2, NULL, NULL, 3, 'order_RrpqAtU3TmsLLT', 'TXN_SM_3_2_1765790328372', NULL, '399.00', 'INR', 'pending', NULL, NULL, '{\"couponId\": null, \"baseAmount\": 399, \"couponCode\": null, \"finalAmount\": 399, \"studyMaterialId\": 3}', '2025-12-15 09:18:48', '2025-12-15 09:18:48'),
(54, 2, NULL, NULL, 3, 'order_RrpsOppiy6s81e', 'TXN_SM_3_2_1765790454777', NULL, '399.00', 'INR', 'pending', NULL, NULL, '{\"couponId\": null, \"baseAmount\": 399, \"couponCode\": null, \"finalAmount\": 399, \"studyMaterialId\": 3}', '2025-12-15 09:20:54', '2025-12-15 09:20:54'),
(55, 2, NULL, NULL, 3, 'order_RrpscYF3w1hJKf', 'TXN_SM_3_2_1765790467310', NULL, '399.00', 'INR', 'pending', NULL, NULL, '{\"couponId\": null, \"baseAmount\": 399, \"couponCode\": null, \"finalAmount\": 399, \"studyMaterialId\": 3}', '2025-12-15 09:21:07', '2025-12-15 09:21:07'),
(56, 2, NULL, NULL, 3, 'order_RrpsrA50tXqeh4', 'TXN_SM_3_2_1765790480704', NULL, '399.00', 'INR', 'pending', NULL, NULL, '{\"couponId\": null, \"baseAmount\": 399, \"couponCode\": null, \"finalAmount\": 399, \"studyMaterialId\": 3}', '2025-12-15 09:21:20', '2025-12-15 09:21:20'),
(57, 2, NULL, NULL, 3, 'order_RrpzXLY2b9ETvS', 'TXN_SM_3_2_1765790860140', 'pay_RrpziAEnjtxxcu', '399.00', 'INR', 'success', NULL, '703ab0cee7a1b156d82367d8c9296ca26c32e95d5cca300819d74a7eb677d30a', '{\"couponId\": null, \"baseAmount\": 399, \"couponCode\": null, \"finalAmount\": 399, \"studyMaterialId\": 3}', '2025-12-15 09:27:40', '2025-12-15 09:28:05'),
(58, 2, NULL, NULL, 5, 'order_RrrtHKCeiv4YNb', 'TXN_SM_5_2_1765797547893', 'pay_RrrtSgRzlLlb0G', '499.00', 'INR', 'success', NULL, 'e2e3b8d8018f7bc488a48dfd2f9b5e3a1b4b84666587ce8fd8e554027de883b8', '{\"couponId\": null, \"baseAmount\": 499, \"couponCode\": null, \"finalAmount\": 499, \"studyMaterialId\": 5}', '2025-12-15 11:19:07', '2025-12-15 11:19:35'),
(59, 6, NULL, NULL, 3, 'order_Rrs1NcM9UzRORO', 'TXN_SM_3_6_1765798008036', 'pay_Rrs1XGJWIpzJAP', '399.00', 'INR', 'success', NULL, 'd91c0f9adccb683a691d563f0bda8a55ac759211459f363f34fa00de3e0194eb', '{\"couponId\": null, \"baseAmount\": 399, \"couponCode\": null, \"finalAmount\": 399, \"studyMaterialId\": 3}', '2025-12-15 11:26:48', '2025-12-15 11:27:11'),
(60, 6, 7, NULL, NULL, 'order_RuLkgA4pkLzsJO', 'TXN_COURSE_7_6_1766339386426', 'pay_RuLksDCzDQU8Kp', '99.00', 'INR', 'success', NULL, '992bab9794a964434d1fa3920b23eb21aeb61763b3c0684604f74b896eb01a3f', '{\"couponId\": null, \"courseId\": 7, \"baseAmount\": 99, \"couponCode\": null, \"finalAmount\": 99}', '2025-12-21 17:49:46', '2025-12-21 17:50:13'),
(61, 2, NULL, 14, NULL, 'order_Rx8qoJSgeY6fCA', 'TXN_QUIZ_14_2_1766948975096', NULL, '85.00', 'INR', 'pending', NULL, NULL, '{\"quizId\": 14, \"couponId\": null, \"baseAmount\": 85, \"couponCode\": null, \"finalAmount\": 85}', '2025-12-28 19:09:35', '2025-12-28 19:09:35'),
(62, 2, NULL, 4, NULL, 'order_Rx9M8aKuWuNjpi', 'TXN_QUIZ_4_2_1766950754466', 'pay_Rx9MQWiGA6F0sM', '50.00', 'INR', 'success', NULL, 'e0410e2a6839e20da3a9c4e84d6b8a81d4905228e90dab01fa21f31b1663d194', '{\"quizId\": 4, \"couponId\": null, \"baseAmount\": 50, \"couponCode\": null, \"finalAmount\": 50}', '2025-12-28 19:39:14', '2025-12-28 19:39:46'),
(63, 10, NULL, 4, NULL, 'order_RyLgq8xLIkYVPN', 'TXN_QUIZ_4_10_1767212529752', 'pay_RyLhSwCb0jLy2S', '50.00', 'INR', 'success', NULL, '9e4e06878b48d14a31a373b30c843f02f8e9197e2fcdc951671b2cb22a967d97', '{\"quizId\": 4, \"couponId\": null, \"baseAmount\": 50, \"couponCode\": null, \"finalAmount\": 50}', '2025-12-31 20:22:09', '2025-12-31 20:23:00'),
(64, 10, 7, NULL, NULL, 'order_RyLiTPptY1TuuT', 'TXN_COURSE_7_10_1767212622535', 'pay_RyLin5XoWFZ27F', '49.00', 'INR', 'success', NULL, '977567c12bb7e7681dd69cfaa84e6e3316d579ff5264a64d711321674ad65596', '{\"couponId\": 2, \"courseId\": 7, \"baseAmount\": 99, \"couponCode\": \"NEWYEAR50\", \"finalAmount\": 49}', '2025-12-31 20:23:42', '2025-12-31 20:24:16'),
(65, 10, NULL, 13, NULL, 'order_RyNFkbvCMKb5og', 'TXN_QUIZ_13_10_1767218034299', NULL, '9.00', 'INR', 'pending', NULL, NULL, '{\"quizId\": 13, \"couponId\": null, \"baseAmount\": 9, \"couponCode\": null, \"finalAmount\": 9}', '2025-12-31 21:53:54', '2025-12-31 21:53:54'),
(66, 10, NULL, NULL, 5, 'order_RyNX38b0GShoPE', 'TXN_SM_5_10_1767219016853', NULL, '499.00', 'INR', 'pending', NULL, NULL, '{\"couponId\": null, \"baseAmount\": 499, \"couponCode\": null, \"finalAmount\": 499, \"studyMaterialId\": 5}', '2025-12-31 22:10:16', '2025-12-31 22:10:16'),
(67, 10, NULL, NULL, 5, 'order_RyNy6HjphwoP3I', 'TXN_SM_5_10_1767220553600', NULL, '499.00', 'INR', 'pending', NULL, NULL, '{\"couponId\": null, \"baseAmount\": 499, \"couponCode\": null, \"finalAmount\": 499, \"studyMaterialId\": 5}', '2025-12-31 22:35:53', '2025-12-31 22:35:53'),
(68, 10, 4, NULL, NULL, 'order_RyOqbA3ev5rgG5', 'TXN_COURSE_4_10_1767223648829', NULL, '1499.50', 'INR', 'pending', NULL, NULL, '{\"couponId\": 2, \"courseId\": 4, \"baseAmount\": 2999, \"couponCode\": \"NEWYEAR50\", \"finalAmount\": 1499.5}', '2025-12-31 23:27:28', '2025-12-31 23:27:28'),
(69, 10, NULL, 13, NULL, 'order_RyOqwpQTsUF4l2', 'TXN_QUIZ_13_10_1767223668669', NULL, '4.50', 'INR', 'pending', NULL, NULL, '{\"quizId\": 13, \"couponId\": 2, \"baseAmount\": 9, \"couponCode\": \"NEWYEAR50\", \"finalAmount\": 4.5}', '2025-12-31 23:27:48', '2025-12-31 23:27:48'),
(70, 10, NULL, 14, NULL, 'order_RyP1coZo1Dggbz', 'TXN_QUIZ_14_10_1767224275140', NULL, '42.50', 'INR', 'pending', NULL, NULL, '{\"quizId\": 14, \"couponId\": 2, \"baseAmount\": 85, \"couponCode\": \"NEWYEAR50\", \"finalAmount\": 42.5}', '2025-12-31 23:37:55', '2025-12-31 23:37:55'),
(71, 10, 4, NULL, NULL, 'order_RyP1yiXPYsaU3W', 'TXN_COURSE_4_10_1767224295208', NULL, '1499.50', 'INR', 'pending', NULL, NULL, '{\"couponId\": 2, \"courseId\": 4, \"baseAmount\": 2999, \"couponCode\": \"NEWYEAR50\", \"finalAmount\": 1499.5}', '2025-12-31 23:38:15', '2025-12-31 23:38:15'),
(72, 10, NULL, NULL, 1, 'order_RyPAAUrxYXDvpC', 'TXN_SM_1_10_1767224760406', 'pay_RyPAL7x17ocKEu', '250.00', 'INR', 'success', NULL, '44a6111f2ff9a8c5d4a9c2b3e87045afddf21eedac424ee780871e4052a3d305', '{\"couponId\": 2, \"baseAmount\": 500, \"couponCode\": \"NEWYEAR50\", \"finalAmount\": 250, \"studyMaterialId\": 1}', '2025-12-31 23:46:00', '2025-12-31 23:46:25'),
(73, 10, NULL, 14, NULL, 'order_RyPBAG68k3qVsI', 'TXN_QUIZ_14_10_1767224816969', 'pay_RyPBLoNl1VVpqB', '85.00', 'INR', 'success', NULL, '79ce8ef631f5751866d86c88171303aca94ba4277394156706d7ccbbdc23c181', '{\"quizId\": 14, \"couponId\": null, \"baseAmount\": 85, \"couponCode\": null, \"finalAmount\": 85}', '2025-12-31 23:46:56', '2025-12-31 23:47:23'),
(74, 10, 4, NULL, NULL, 'order_RyPGvdGxfO6DpV', 'TXN_COURSE_4_10_1767225144387', 'pay_RyPH7YZoI6NQzY', '1499.50', 'INR', 'success', NULL, 'aa65eb4d05e5c6c9643c98da5b79c7df661e33ef86c4a6622de7e1e9930cfb06', '{\"couponId\": 2, \"courseId\": 4, \"baseAmount\": 2999, \"couponCode\": \"NEWYEAR50\", \"finalAmount\": 1499.5}', '2025-12-31 23:52:24', '2025-12-31 23:52:50'),
(75, 10, NULL, 13, NULL, 'order_RyPHvELcp1Gr7R', 'TXN_QUIZ_13_10_1767225200802', 'pay_RyPI4plsZEYkds', '4.50', 'INR', 'success', NULL, '37e36356785ddcc608c045ec14f903bfff0c35200e0dbd9288eca79823499de3', '{\"quizId\": 13, \"couponId\": 2, \"baseAmount\": 9, \"couponCode\": \"NEWYEAR50\", \"finalAmount\": 4.5}', '2025-12-31 23:53:20', '2025-12-31 23:53:44'),
(76, 10, NULL, NULL, 1, 'order_RyPIonXVWKA2hY', 'TXN_SM_1_10_1767225251724', 'pay_RyPIxZuLpy6nc7', '250.00', 'INR', 'success', NULL, '650b86698dbb21279bf6bc79b6adffc2254a91592f92ae3785fe1572d76cb619', '{\"couponId\": 2, \"baseAmount\": 500, \"couponCode\": \"NEWYEAR50\", \"finalAmount\": 250, \"studyMaterialId\": 1}', '2025-12-31 23:54:11', '2025-12-31 23:54:34'),
(77, 2, NULL, 14, NULL, 'order_RyPJf6loymX5qf', 'TXN_QUIZ_14_2_1767225299642', 'pay_RyPJvwhGwhNkAY', '85.00', 'INR', 'success', NULL, '59f6ee0c9026528a789d92c07e3845e9bbb3c7b5ec46e1b859c834d511959e36', '{\"quizId\": 14, \"couponId\": null, \"baseAmount\": 85, \"couponCode\": null, \"finalAmount\": 85}', '2025-12-31 23:54:59', '2025-12-31 23:55:30'),
(78, 2, NULL, NULL, 1, 'order_RyPSFzuITvQY6O', 'TXN_SM_1_2_1767225787838', 'pay_RyPSQuIkZ25JNy', '500.00', 'INR', 'success', NULL, '4df32dad590d918412a48a6d8160b3909cac68176f9093c2ee98c6fffe2d31d3', '{\"couponId\": null, \"baseAmount\": 500, \"couponCode\": null, \"finalAmount\": 500, \"studyMaterialId\": 1}', '2026-01-01 00:03:07', '2026-01-01 00:03:33'),
(79, 2, NULL, NULL, 2, 'order_RyPaY8fzbvlW0P', 'TXN_SM_2_2_1767226258849', 'pay_RyPahlkd36bm00', '200.00', 'INR', 'success', NULL, '2511b1d42c844f307459cc783b97983ab8bd1a1b5ad9cb44f9a4d1f71f81a04e', '{\"couponId\": null, \"baseAmount\": 200, \"couponCode\": null, \"finalAmount\": 200, \"studyMaterialId\": 2}', '2026-01-01 00:10:58', '2026-01-01 00:11:23'),
(80, 10, NULL, 12, NULL, 'order_RyPc6Cazo8n4qa', 'TXN_QUIZ_12_10_1767226346857', 'pay_RyPcGF0rzICRrY', '99.00', 'INR', 'success', NULL, 'd60d477788eef7e3fadbbfdcf448362dcb2130249a6a0e1e645124bb182c2dd3', '{\"quizId\": 12, \"couponId\": null, \"baseAmount\": 99, \"couponCode\": null, \"finalAmount\": 99}', '2026-01-01 00:12:26', '2026-01-01 00:12:51'),
(81, 10, NULL, NULL, 2, 'order_RyPx6zOCjemzUX', 'TXN_SM_2_10_1767227540419', 'pay_RyPxHaU2aUGAnF', '200.00', 'INR', 'success', NULL, '6a94b085b94418b0056c3665f351c9953aae28a818785ea2acabcc3b131d5a3f', '{\"couponId\": null, \"baseAmount\": 200, \"couponCode\": null, \"finalAmount\": 200, \"studyMaterialId\": 2}', '2026-01-01 00:32:20', '2026-01-01 00:32:45'),
(82, 11, 7, NULL, NULL, 'order_RykruFjv7lhQYI', 'TXN_COURSE_7_11_1767301198663', NULL, '49.50', 'INR', 'pending', NULL, NULL, '{\"couponId\": 2, \"courseId\": 7, \"baseAmount\": 99, \"couponCode\": \"NEWYEAR50\", \"finalAmount\": 49.5}', '2026-01-01 20:59:58', '2026-01-01 20:59:58'),
(83, 11, 7, NULL, NULL, 'order_RykxOOcwE7L1ly', 'TXN_COURSE_7_11_1767301510271', 'pay_RykxZSS8mxq0KD', '99.00', 'INR', 'success', NULL, '1dbd2b853d2a2e37d50c96423d06feaf023652713f20ac1b8899edbee69f0aa8', '{\"couponId\": null, \"courseId\": 7, \"baseAmount\": 99, \"couponCode\": null, \"finalAmount\": 99}', '2026-01-01 21:05:10', '2026-01-01 21:05:35'),
(84, 11, 4, NULL, NULL, 'order_RykyXQoVbvE099', 'TXN_COURSE_4_11_1767301575344', 'pay_Rykyg6hVatKVsf', '1499.50', 'INR', 'success', NULL, 'bc2747edaec1a7a57e04850702ce456f6b62c880026f91ead7e4efce18992560', '{\"couponId\": 2, \"courseId\": 4, \"baseAmount\": 2999, \"couponCode\": \"NEWYEAR50\", \"finalAmount\": 1499.5}', '2026-01-01 21:06:15', '2026-01-01 21:06:38'),
(85, 11, NULL, 14, NULL, 'order_Ryl0HZUn91JRyv', 'TXN_QUIZ_14_11_1767301674455', 'pay_Ryl0T0CtbgY3jO', '42.50', 'INR', 'success', NULL, '00686bff836ecbca4ee8af5a1309d44bc3d74d007cc6ef2a68471283c20134f3', '{\"quizId\": 14, \"couponId\": 2, \"baseAmount\": 85, \"couponCode\": \"NEWYEAR50\", \"finalAmount\": 42.5}', '2026-01-01 21:07:54', '2026-01-01 21:08:20'),
(86, 11, NULL, 13, NULL, 'order_Ryl1NbvKmsQZh7', 'TXN_QUIZ_13_11_1767301736748', 'pay_Ryl1ZMXZ1UtXAL', '4.50', 'INR', 'success', NULL, '7a7e16de52494731a3baa534fc3f9bc188980d01241e4984ffb985d57feef926', '{\"quizId\": 13, \"couponId\": 2, \"baseAmount\": 9, \"couponCode\": \"NEWYEAR50\", \"finalAmount\": 4.5}', '2026-01-01 21:08:56', '2026-01-01 21:09:23'),
(87, 11, NULL, NULL, 1, 'order_Ryl2Mjan45RApH', 'TXN_SM_1_11_1767301792750', 'pay_Ryl2W8vchmLe1t', '500.00', 'INR', 'success', NULL, '01b7bbab1e6e343cfe42c782b4d7c4f6b0ab02650c7616dde34278ef2afce373', '{\"couponId\": null, \"baseAmount\": 500, \"couponCode\": null, \"finalAmount\": 500, \"studyMaterialId\": 1}', '2026-01-01 21:09:52', '2026-01-01 21:10:17'),
(88, 11, NULL, NULL, 2, 'order_Ryl32gLFmh0ZL8', 'TXN_SM_2_11_1767301831176', 'pay_Ryl3BCYvscxkns', '200.00', 'INR', 'success', NULL, '20f5a56469f073ef61a29a0a13af2a311fe639f0d54d108976aa82ce83f865d0', '{\"couponId\": null, \"baseAmount\": 200, \"couponCode\": null, \"finalAmount\": 200, \"studyMaterialId\": 2}', '2026-01-01 21:10:31', '2026-01-01 21:10:56'),
(89, 10, NULL, 15, NULL, 'order_RyleHj8Yi9BLS0', 'TXN_QUIZ_15_10_1767303946596', 'pay_RyleTqhxMwCNwI', '5.00', 'INR', 'success', NULL, '02985d8e769901ea71860bb43c0774ea39b41655c2590dfb80ee7d728cbb2b5b', '{\"quizId\": 15, \"couponId\": null, \"baseAmount\": 5, \"couponCode\": null, \"finalAmount\": 5}', '2026-01-01 21:45:46', '2026-01-01 21:46:12'),
(90, 10, NULL, 19, NULL, 'order_Rz55Edf6dchTwi', 'TXN_QUIZ_19_10_1767372387684', NULL, '231.00', 'INR', 'pending', NULL, NULL, '{\"quizId\": 19, \"couponId\": null, \"baseAmount\": 231, \"couponCode\": null, \"finalAmount\": 231}', '2026-01-02 16:46:27', '2026-01-02 16:46:27'),
(91, 10, NULL, 19, NULL, 'order_Rz55WPxFKz0o4T', 'TXN_QUIZ_19_10_1767372403997', NULL, '115.50', 'INR', 'pending', NULL, NULL, '{\"quizId\": 19, \"couponId\": 2, \"baseAmount\": 231, \"couponCode\": \"NEWYEAR50\", \"finalAmount\": 115.5}', '2026-01-02 16:46:43', '2026-01-02 16:46:43'),
(92, 10, 8, NULL, NULL, 'free_TXN_FREE_COURSE_8_10_1767402531890', 'TXN_FREE_COURSE_8_10_1767402531890', 'free_coupon', '0.00', 'INR', 'success', NULL, NULL, '{\"isFree\": true, \"couponId\": 3, \"courseId\": 8, \"discount\": 2499, \"baseAmount\": 2499, \"couponCode\": \"FREE100\", \"finalAmount\": 0}', '2026-01-03 01:08:51', '2026-01-03 01:08:51'),
(93, 10, NULL, 19, NULL, 'free_TXN_FREE_QUIZ_19_10_1767402716579', 'TXN_FREE_QUIZ_19_10_1767402716579', 'free_coupon', '0.00', 'INR', 'success', NULL, NULL, '{\"isFree\": true, \"quizId\": 19, \"couponId\": 3, \"discount\": 231, \"baseAmount\": 231, \"couponCode\": \"FREE100\", \"finalAmount\": 0}', '2026-01-03 01:11:56', '2026-01-03 01:11:56'),
(94, 10, NULL, NULL, 3, 'free_TXN_FREE_SM_3_10_1767403067392', 'TXN_FREE_SM_3_10_1767403067392', 'free_coupon', '0.00', 'INR', 'success', NULL, NULL, '{\"isFree\": true, \"couponId\": 3, \"discount\": 399, \"baseAmount\": 399, \"couponCode\": \"FREE100\", \"finalAmount\": 0, \"studyMaterialId\": 3}', '2026-01-03 01:17:47', '2026-01-03 01:17:47'),
(95, 10, 9, NULL, NULL, 'free_TXN_FREE_COURSE_9_10_1767403159745', 'TXN_FREE_COURSE_9_10_1767403159745', 'free_coupon', '0.00', 'INR', 'success', NULL, NULL, '{\"isFree\": true, \"couponId\": 3, \"courseId\": 9, \"discount\": 500, \"baseAmount\": 500, \"couponCode\": \"FREE100\", \"finalAmount\": 0}', '2026-01-03 01:19:19', '2026-01-03 01:19:19'),
(97, 5, NULL, 15, NULL, 'order_RzEXmN6ik45NCu', 'TXN_QUIZ_15_5_1767405703491', 'pay_RzEXzhM1TcnJ5g', '5.00', 'INR', 'success', NULL, '6f855f31156c48f7680492b74bb31f6e7de847a54793d65fba701445b4af4c42', '{\"quizId\": 15, \"couponId\": null, \"discount\": 0, \"baseAmount\": 5, \"couponCode\": null, \"finalAmount\": 5}', '2026-01-03 02:01:43', '2026-01-03 02:02:10'),
(99, 2, NULL, 15, NULL, 'order_RzFNEUNkTLo4Ml', 'TXN_QUIZ_15_2_1767408625934', 'pay_RzFNNzr2CbrzJG', '5.00', 'INR', 'success', NULL, 'fc65263ad6dcc4024aaa185067747e8550bdbd8a851ede46bbc6178d19495e88', '{\"quizId\": 15, \"couponId\": null, \"discount\": 0, \"baseAmount\": 5, \"couponCode\": null, \"finalAmount\": 5}', '2026-01-03 02:50:25', '2026-01-03 02:50:50'),
(102, 2, 8, NULL, NULL, 'order_S7pf5lxZT4Qrps', 'TXN_COURSE_8_2_1769283139676', 'pay_S7pfFoHKci4VBC', '2499.00', 'INR', 'success', NULL, '7ebbaf9f46c8a9790bc6ac712378c50d75df32bd44b3dc80d9fb07362ef0caa2', '{\"couponId\": null, \"courseId\": 8, \"discount\": 0, \"baseAmount\": 2499, \"couponCode\": null, \"finalAmount\": 2499}', '2026-01-24 19:32:19', '2026-01-24 19:32:44'),
(103, 1, 8, NULL, NULL, 'order_SPH7WqEuTQeUPv', 'TXN_COURSE_8_1_1773091618580', 'pay_SPH7m0uqRj91mF', '2499.00', 'INR', 'success', NULL, 'e66c75e1597670e1bde41b10eb08603a80fff45a430b0aa41c835f13b4281d53', '{\"couponId\": null, \"courseId\": 8, \"baseAmount\": 2499, \"couponCode\": null, \"finalAmount\": 2499}', '2026-03-09 21:26:58', '2026-03-09 21:27:31');

-- --------------------------------------------------------

--
-- Table structure for table `questions`
--

CREATE TABLE `questions` (
  `id` int NOT NULL,
  `quiz_id` int NOT NULL,
  `question` text NOT NULL,
  `options` json NOT NULL,
  `correct_answer` json NOT NULL,
  `explanation` text,
  `marks` int NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `question_type` varchar(50) NOT NULL DEFAULT 'mcq',
  `question_image` varchar(500) DEFAULT NULL,
  `negative_marks` decimal(3,2) DEFAULT '0.00',
  `difficulty` varchar(50) DEFAULT 'medium',
  `order_index` int NOT NULL DEFAULT '0',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `questions`
--

INSERT INTO `questions` (`id`, `quiz_id`, `question`, `options`, `correct_answer`, `explanation`, `marks`, `created_at`, `question_type`, `question_image`, `negative_marks`, `difficulty`, `order_index`, `updated_at`) VALUES
(2, 4, 'What is the capital of India?', '[\"Mumbai\", \"New Delhi\", \"Kolkata\", \"Chennai\"]', '1', NULL, 10, '2025-12-03 18:34:00', 'mcq', NULL, '0.00', 'medium', 0, '2025-12-06 18:57:14'),
(3, 4, 'Who wrote the national anthem of India?', '[\"Mahatma Gandhi\", \"Rabindranath Tagore\", \"Jawaharlal Nehru\", \"Subhash Chandra Bose\"]', '1', NULL, 10, '2025-12-03 18:34:00', 'mcq', NULL, '0.00', 'medium', 0, '2025-12-06 18:57:14'),
(4, 4, 'How many states are there in India?', '[\"28\", \"29\", \"30\", \"27\"]', '0', NULL, 10, '2025-12-03 18:34:00', 'mcq', NULL, '0.00', 'medium', 0, '2025-12-06 18:57:14'),
(5, 4, 'What is the largest planet in our solar system?', '[\"Earth\", \"Mars\", \"Jupiter\", \"Saturn\"]', '2', NULL, 10, '2025-12-03 18:34:00', 'mcq', NULL, '0.00', 'medium', 0, '2025-12-06 18:57:14'),
(6, 4, 'What is the national animal of India?', '[\"Lion\", \"Elephant\", \"Tiger\", \"Peacock\"]', '2', NULL, 10, '2025-12-03 18:34:00', 'mcq', NULL, '0.00', 'medium', 0, '2025-12-06 18:57:14'),
(17, 15, 'What is you name', '\"[\\\"test 1\\\",\\\"test 2\\\",\\\"test 3\\\",\\\"test 4\\\"]\"', '\"0\"', NULL, 50, '2026-01-01 21:45:06', 'mcq', NULL, '0.00', 'medium', 0, '2026-01-03 02:17:57'),
(27, 19, 'भारत के संविधान में चुनाव प्रणाली का प्रावधान किन अनुच्छेदों में किया गया है?', '[\"अनुच्छेद 256–259\", \"अनुच्छेद 274–279\", \"अनुच्छेद 124–128\", \"अनुच्छेद 324–329\"]', '3', NULL, 1, '2026-01-01 22:12:46', 'mcq', NULL, '0.00', 'medium', 1, '2026-01-01 22:12:46'),
(28, 19, '‘नशीबा’ शब्द में निम्नलिखित में से कौन-सा प्रत्यय है?', '[\"इक\", \"शीबा\", \"ईबा\", \"बा\"]', '[]', NULL, 1, '2026-01-01 22:12:46', 'mcq', NULL, '0.00', 'medium', 2, '2026-01-01 22:12:46'),
(29, 19, '‘Systema Naturae’ नामक पुस्तक किसने लिखी है?', '[\"डार्विन\", \"लिनियस\", \"विलियम रिटर\", \"एडम स्मिथ\"]', '1', NULL, 1, '2026-01-01 22:12:46', 'mcq', NULL, '0.00', 'medium', 3, '2026-01-01 22:12:46'),
(30, 19, 'माधवपुर घेड मेला किस राज्य में आयोजित किया जाता है?', '[\"झारखंड\", \"बिहार\", \"गुजरात\", \"मध्य प्रदेश\"]', '2', NULL, 1, '2026-01-01 22:12:46', 'mcq', NULL, '0.00', 'medium', 4, '2026-01-01 22:12:46'),
(31, 19, 'निम्नलिखित में से कौन-सा ग्रह सबसे बड़ा है?', '[\"पृथ्वी\", \"मंगल\", \"बृहस्पति\", \"शनि\"]', '2', NULL, 1, '2026-01-01 22:12:46', 'mcq', NULL, '0.00', 'easy', 5, '2026-01-01 22:12:46'),
(32, 19, 'भारत की सबसे लंबी नदी कौन-सी है?', '[\"यमुना\", \"गंगा\", \"गोदावरी\", \"नर्मदा\"]', '1', NULL, 1, '2026-01-01 22:12:46', 'mcq', NULL, '0.00', 'easy', 6, '2026-01-01 22:12:46'),
(33, 19, 'मानव शरीर में कितनी पसलियाँ होती हैं?', '[\"20\", \"22\", \"24\", \"26\"]', '2', NULL, 1, '2026-01-01 22:12:46', 'mcq', NULL, '0.00', 'easy', 7, '2026-01-01 22:12:46'),
(34, 19, 'भारत के पहले राष्ट्रपति कौन थे?', '[\"डॉ. राजेंद्र प्रसाद\", \"डॉ. सर्वपल्ली राधाकृष्णन\", \"जवाहरलाल नेहरू\", \"डॉ. भीमराव अंबेडकर\"]', '0', NULL, 1, '2026-01-01 22:12:46', 'mcq', NULL, '0.00', 'easy', 8, '2026-01-01 22:12:46'),
(35, 19, 'कौन-सा विटामिन आँखों के लिए आवश्यक है?', '[\"विटामिन A\", \"विटामिन B\", \"विटामिन C\", \"विटामिन D\"]', '0', NULL, 1, '2026-01-01 22:12:46', 'mcq', NULL, '0.00', 'easy', 9, '2026-01-01 22:12:46'),
(36, 19, 'ताजमहल किस नदी के किनारे स्थित है?', '[\"गंगा\", \"यमुना\", \"गोदावरी\", \"नर्मदा\"]', '1', NULL, 1, '2026-01-01 22:12:46', 'mcq', NULL, '0.00', 'easy', 10, '2026-01-01 22:12:46'),
(37, 19, 'AB रक्त समूह में कौन-सी विशेषता होती है?', '[\"सार्वभौमिक दाता\", \"सार्वभौमिक ग्राही\", \"केवल A से ले सकता है\", \"केवल B से ले सकता है\"]', '1', NULL, 1, '2026-01-01 22:12:46', 'mcq', NULL, '0.00', 'medium', 11, '2026-01-01 22:12:46'),
(38, 19, 'श्वेत प्रकाश का अपने विभिन्न रंगों में विभाजन कहलाता है?', '[\"परावर्तन\", \"अपवर्तन\", \"वर्ण विक्षेपण\", \"प्रकीर्णन\"]', '2', NULL, 1, '2026-01-01 22:12:46', 'mcq', NULL, '0.00', 'medium', 12, '2026-01-01 22:12:46'),
(39, 19, 'Reject का विलोम शब्द क्या है?', '[\"Refuse\", \"Allow\", \"Deny\", \"Oppose\"]', '1', NULL, 1, '2026-01-01 22:12:46', 'mcq', NULL, '0.00', 'medium', 13, '2026-01-01 22:12:46'),
(40, 19, 'प्रांतों में द्वैध शासन किस अधिनियम से लागू हुआ?', '[\"1919 अधिनियम\", \"1909 अधिनियम\", \"1935 अधिनियम\", \"1947 अधिनियम\"]', '0', NULL, 1, '2026-01-01 22:12:46', 'mcq', NULL, '0.00', 'medium', 14, '2026-01-01 22:12:46'),
(41, 19, 'भारत का प्रथम भाषायी राज्य कौन-सा था?', '[\"तमिलनाडु\", \"आंध्र प्रदेश\", \"केरल\", \"महाराष्ट्र\"]', '1', NULL, 1, '2026-01-01 22:12:46', 'mcq', NULL, '0.00', 'medium', 15, '2026-01-01 22:12:46'),
(42, 19, 'ओम का नियम किससे संबंधित है?', '[\"विद्युत धारा\", \"चुंबकत्व\", \"ऊष्मा\", \"प्रकाश\"]', '0', NULL, 1, '2026-01-01 22:12:46', 'mcq', NULL, '0.00', 'easy', 16, '2026-01-01 22:12:46'),
(43, 19, 'भारतीय संविधान में कितनी अनुसूचियाँ हैं?', '[\"10\", \"12\", \"14\", \"16\"]', '1', NULL, 1, '2026-01-01 22:12:46', 'mcq', NULL, '0.00', 'medium', 17, '2026-01-01 22:12:46'),
(44, 19, 'किस गैस को हँसाने वाली गैस कहा जाता है?', '[\"ऑक्सीजन\", \"नाइट्रोजन\", \"नाइट्रस ऑक्साइड\", \"कार्बन डाइऑक्साइड\"]', '2', NULL, 1, '2026-01-01 22:12:46', 'mcq', NULL, '0.00', 'easy', 18, '2026-01-01 22:12:46'),
(45, 19, 'बिहार का राजकीय पशु कौन-सा है?', '[\"हाथी\", \"बाघ\", \"गाय\", \"हिरण\"]', '1', NULL, 1, '2026-01-01 22:12:46', 'mcq', NULL, '0.00', 'easy', 19, '2026-01-01 22:12:46'),
(46, 19, 'भारतीय राष्ट्रीय ध्वज में कितने रंग होते हैं?', '[\"2\", \"3\", \"4\", \"5\"]', '1', NULL, 1, '2026-01-01 22:12:46', 'mcq', NULL, '0.00', 'easy', 20, '2026-01-01 22:12:46'),
(47, 19, 'वसुंधरा शिखर सम्मेलन (Earth Summit) कहाँ आयोजित हुआ था?', '[\"अमेरिका\", \"कनाडा\", \"ब्राज़ील\", \"जर्मनी\"]', '2', NULL, 1, '2026-01-01 22:13:36', 'mcq', NULL, '0.00', 'medium', 21, '2026-01-01 22:13:36'),
(48, 19, 'सुंदरवन किस राज्य में स्थित है?', '[\"ओडिशा\", \"पश्चिम बंगाल\", \"असम\", \"आंध्र प्रदेश\"]', '1', NULL, 1, '2026-01-01 22:13:36', 'mcq', NULL, '0.00', 'easy', 22, '2026-01-01 22:13:36'),
(49, 19, 'सामंत प्रथा का विकास किस काल में हुआ?', '[\"मौर्य काल\", \"गुप्त काल\", \"मध्यकाल\", \"आधुनिक काल\"]', '2', NULL, 1, '2026-01-01 22:13:36', 'mcq', NULL, '0.00', 'medium', 23, '2026-01-01 22:13:36'),
(50, 19, 'एथीन (Ethene) अणु की आकृति कैसी होती है?', '[\"रेखीय\", \"चतुष्फलक\", \"समतली त्रिकोणीय\", \"अष्टफलक\"]', '2', NULL, 1, '2026-01-01 22:13:36', 'mcq', NULL, '0.00', 'medium', 24, '2026-01-01 22:13:36'),
(51, 19, '06–14 वर्ष के बच्चों को शिक्षा का अधिकार किस संशोधन से मिला?', '[\"82वाँ\", \"86वाँ\", \"91वाँ\", \"93वाँ\"]', '1', NULL, 1, '2026-01-01 22:13:36', 'mcq', NULL, '0.00', 'medium', 25, '2026-01-01 22:13:36'),
(52, 19, 'ओम का नियम किस वर्ष प्रतिपादित किया गया था?', '[\"1827\", \"1830\", \"1840\", \"1850\"]', '0', NULL, 1, '2026-01-01 22:13:36', 'mcq', NULL, '0.00', 'medium', 26, '2026-01-01 22:13:36'),
(53, 19, 'निम्नलिखित में से कौन यंत्र दाब मापने के लिए प्रयोग किया जाता है?', '[\"एमीटर\", \"वोल्टमीटर\", \"बैरोमीटर\", \"गैल्वेनोमीटर\"]', '2', NULL, 1, '2026-01-01 22:13:36', 'mcq', NULL, '0.00', 'easy', 27, '2026-01-01 22:13:36'),
(54, 19, 'भारतीय संविधान का कौन-सा अनुच्छेद निर्वाचन आयोग से संबंधित है?', '[\"अनुच्छेद 280\", \"अनुच्छेद 324\", \"अनुच्छेद 356\", \"अनुच्छेद 370\"]', '1', NULL, 1, '2026-01-01 22:13:36', 'mcq', NULL, '0.00', 'medium', 28, '2026-01-01 22:13:36'),
(55, 19, '“अंधेर नगरी” नाटक के लेखक कौन हैं?', '[\"जयशंकर प्रसाद\", \"भारतेंदु हरिश्चंद्र\", \"महादेवी वर्मा\", \"रामधारी सिंह दिनकर\"]', '1', NULL, 1, '2026-01-01 22:13:36', 'mcq', NULL, '0.00', 'medium', 29, '2026-01-01 22:13:36'),
(56, 19, 'कोशिका में अपशिष्ट पदार्थों का नाश कौन करता है?', '[\"माइटोकॉन्ड्रिया\", \"गॉल्जी तंत्र\", \"लाइसोजोम\", \"राइबोसोम\"]', '2', NULL, 1, '2026-01-01 22:13:36', 'mcq', NULL, '0.00', 'easy', 30, '2026-01-01 22:13:36'),
(57, 19, 'भारत का सबसे बड़ा राज्य क्षेत्रफल की दृष्टि से कौन-सा है?', '[\"उत्तर प्रदेश\", \"मध्य प्रदेश\", \"राजस्थान\", \"महाराष्ट्र\"]', '2', NULL, 1, '2026-01-01 22:13:36', 'mcq', NULL, '0.00', 'easy', 31, '2026-01-01 22:13:36'),
(58, 19, 'कौन-सा विटामिन रक्त के थक्के बनने में सहायक होता है?', '[\"विटामिन A\", \"विटामिन B\", \"विटामिन C\", \"विटामिन K\"]', '3', NULL, 1, '2026-01-01 22:13:36', 'mcq', NULL, '0.00', 'easy', 32, '2026-01-01 22:13:36'),
(59, 19, 'भारत में योजना आयोग का गठन किस वर्ष हुआ?', '[\"1947\", \"1950\", \"1951\", \"1952\"]', '1', NULL, 1, '2026-01-01 22:13:36', 'mcq', NULL, '0.00', 'medium', 33, '2026-01-01 22:13:36'),
(60, 19, 'मानव हृदय में कितने कक्ष होते हैं?', '[\"2\", \"3\", \"4\", \"5\"]', '2', NULL, 1, '2026-01-01 22:13:36', 'mcq', NULL, '0.00', 'easy', 34, '2026-01-01 22:13:36'),
(61, 19, 'भारत का राष्ट्रीय खेल क्या है?', '[\"क्रिकेट\", \"हॉकी\", \"कबड्डी\", \"फुटबॉल\"]', '1', NULL, 1, '2026-01-01 22:13:36', 'mcq', NULL, '0.00', 'easy', 35, '2026-01-01 22:13:36'),
(62, 19, 'पृथ्वी का सबसे नज़दीकी ग्रह कौन-सा है?', '[\"शुक्र\", \"मंगल\", \"बुध\", \"बृहस्पति\"]', '2', NULL, 1, '2026-01-01 22:13:36', 'mcq', NULL, '0.00', 'medium', 36, '2026-01-01 22:13:36'),
(63, 19, 'कौन-सा अम्ल पेट में पाया जाता है?', '[\"सल्फ्यूरिक अम्ल\", \"हाइड्रोक्लोरिक अम्ल\", \"नाइट्रिक अम्ल\", \"एसीटिक अम्ल\"]', '1', NULL, 1, '2026-01-01 22:13:36', 'mcq', NULL, '0.00', 'easy', 37, '2026-01-01 22:13:36'),
(64, 19, 'भारत का सबसे ऊँचा पर्वत शिखर कौन-सा है?', '[\"कंचनजंघा\", \"नंदा देवी\", \"माउंट एवरेस्ट\", \"धौलागिरी\"]', '0', NULL, 1, '2026-01-01 22:13:36', 'mcq', NULL, '0.00', 'medium', 38, '2026-01-01 22:13:36'),
(65, 19, 'भारतीय रिज़र्व बैंक की स्थापना कब हुई?', '[\"1930\", \"1932\", \"1935\", \"1947\"]', '2', NULL, 1, '2026-01-01 22:13:36', 'mcq', NULL, '0.00', 'medium', 39, '2026-01-01 22:13:36'),
(66, 19, 'किस धातु को “तरल धातु” कहा जाता है?', '[\"लोहा\", \"ताँबा\", \"पारा\", \"एल्युमिनियम\"]', '2', NULL, 1, '2026-01-01 22:13:36', 'mcq', NULL, '0.00', 'easy', 40, '2026-01-01 22:13:36'),
(67, 19, 'भारत के किस राज्य की सीमा सबसे अधिक राज्यों से लगती है?', '[\"उत्तर प्रदेश\", \"मध्य प्रदेश\", \"राजस्थान\", \"महाराष्ट्र\"]', '1', NULL, 1, '2026-01-01 22:14:30', 'mcq', NULL, '0.00', 'medium', 41, '2026-01-01 22:14:30'),
(68, 19, 'किस विटामिन की कमी से स्कर्वी रोग होता है?', '[\"विटामिन A\", \"विटामिन B\", \"विटामिन C\", \"विटामिन D\"]', '2', NULL, 1, '2026-01-01 22:14:30', 'mcq', NULL, '0.00', 'easy', 42, '2026-01-01 22:14:30'),
(69, 19, 'भारतीय संविधान में आपातकाल का प्रावधान किस भाग में है?', '[\"भाग XVIII\", \"भाग XVII\", \"भाग XIX\", \"भाग XX\"]', '0', NULL, 1, '2026-01-01 22:14:30', 'mcq', NULL, '0.00', 'medium', 43, '2026-01-01 22:14:30'),
(70, 19, 'कौन-सा ग्रह “लाल ग्रह” कहलाता है?', '[\"शुक्र\", \"मंगल\", \"बृहस्पति\", \"बुध\"]', '1', NULL, 1, '2026-01-01 22:14:30', 'mcq', NULL, '0.00', 'easy', 44, '2026-01-01 22:14:30'),
(71, 19, 'भारतीय संविधान का निर्माण किस वर्ष पूरा हुआ?', '[\"1947\", \"1949\", \"1950\", \"1952\"]', '1', NULL, 1, '2026-01-01 22:14:30', 'mcq', NULL, '0.00', 'medium', 45, '2026-01-01 22:14:30'),
(72, 19, 'कौन-सा अंग इंसुलिन का स्राव करता है?', '[\"यकृत\", \"अग्न्याशय\", \"प्लीहा\", \"गुर्दा\"]', '1', NULL, 1, '2026-01-01 22:14:30', 'mcq', NULL, '0.00', 'easy', 46, '2026-01-01 22:14:30'),
(73, 19, 'भारत का राष्ट्रीय वृक्ष कौन-सा है?', '[\"बरगद\", \"नीम\", \"पीपल\", \"अशोक\"]', '0', NULL, 1, '2026-01-01 22:14:30', 'mcq', NULL, '0.00', 'easy', 47, '2026-01-01 22:14:30'),
(74, 19, 'भारत में हरित क्रांति के जनक किसे कहा जाता है?', '[\"एम. एस. स्वामीनाथन\", \"नॉर्मन बोरलॉग\", \"वर्गीज कुरियन\", \"सी. सुब्रमण्यम\"]', '0', NULL, 1, '2026-01-01 22:14:30', 'mcq', NULL, '0.00', 'medium', 48, '2026-01-01 22:14:30'),
(75, 19, 'किस नदी को “बिहार का शोक” कहा जाता है?', '[\"गंगा\", \"कोसी\", \"सोन\", \"गंडक\"]', '1', NULL, 1, '2026-01-01 22:14:30', 'mcq', NULL, '0.00', 'easy', 49, '2026-01-01 22:14:30'),
(76, 19, 'मानव शरीर का सबसे बड़ा अंग कौन-सा है?', '[\"यकृत\", \"त्वचा\", \"हृदय\", \"फेफड़ा\"]', '1', NULL, 1, '2026-01-01 22:14:30', 'mcq', NULL, '0.00', 'easy', 50, '2026-01-01 22:14:30'),
(77, 19, 'भारतीय राष्ट्रीय कांग्रेस की स्थापना कब हुई?', '[\"1885\", \"1890\", \"1905\", \"1915\"]', '0', NULL, 1, '2026-01-01 22:14:30', 'mcq', NULL, '0.00', 'medium', 51, '2026-01-01 22:14:30'),
(78, 19, 'कौन-सा धातु बिजली का अच्छा सुचालक है?', '[\"लोहा\", \"ताँबा\", \"सीसा\", \"जस्ता\"]', '1', NULL, 1, '2026-01-01 22:14:30', 'mcq', NULL, '0.00', 'easy', 52, '2026-01-01 22:14:30'),
(79, 19, 'भारतीय संसद के कितने सदन हैं?', '[\"एक\", \"दो\", \"तीन\", \"चार\"]', '1', NULL, 1, '2026-01-01 22:14:30', 'mcq', NULL, '0.00', 'easy', 53, '2026-01-01 22:14:30'),
(80, 19, '“जन गण मन” के रचयिता कौन हैं?', '[\"महात्मा गांधी\", \"बंकिम चंद्र चट्टोपाध्याय\", \"रवींद्रनाथ टैगोर\", \"सुभाष चंद्र बोस\"]', '2', NULL, 1, '2026-01-01 22:14:30', 'mcq', NULL, '0.00', 'easy', 54, '2026-01-01 22:14:30'),
(81, 19, 'कौन-सा देश क्षेत्रफल की दृष्टि से सबसे बड़ा है?', '[\"अमेरिका\", \"चीन\", \"रूस\", \"कनाडा\"]', '2', NULL, 1, '2026-01-01 22:14:30', 'mcq', NULL, '0.00', 'easy', 55, '2026-01-01 22:14:30'),
(82, 19, 'पौधों में भोजन का निर्माण कहाँ होता है?', '[\"जड़\", \"तना\", \"पत्ती\", \"फूल\"]', '2', NULL, 1, '2026-01-01 22:14:30', 'mcq', NULL, '0.00', 'easy', 56, '2026-01-01 22:14:30'),
(83, 19, 'भारतीय रिज़र्व बैंक का मुख्यालय कहाँ है?', '[\"नई दिल्ली\", \"कोलकाता\", \"मुंबई\", \"चेन्नई\"]', '2', NULL, 1, '2026-01-01 22:14:30', 'mcq', NULL, '0.00', 'medium', 57, '2026-01-01 22:14:30'),
(84, 19, 'किस ग्रह के सबसे अधिक उपग्रह हैं?', '[\"शनि\", \"बृहस्पति\", \"मंगल\", \"अरुण\"]', '0', NULL, 1, '2026-01-01 22:14:30', 'mcq', NULL, '0.00', 'medium', 58, '2026-01-01 22:14:30'),
(85, 19, 'भारतीय संविधान में मौलिक अधिकार कितने हैं?', '[\"5\", \"6\", \"7\", \"8\"]', '1', NULL, 1, '2026-01-01 22:14:30', 'mcq', NULL, '0.00', 'medium', 59, '2026-01-01 22:14:30'),
(86, 19, 'किस धातु का प्रयोग थर्मामीटर में किया जाता है?', '[\"ताँबा\", \"पारा\", \"एल्युमिनियम\", \"लोहा\"]', '1', NULL, 1, '2026-01-01 22:14:30', 'mcq', NULL, '0.00', 'easy', 60, '2026-01-01 22:14:30'),
(87, 19, 'भारत के पहले प्रधानमंत्री कौन थे?', '[\"महात्मा गांधी\", \"जवाहरलाल नेहरू\", \"लाल बहादुर शास्त्री\", \"सरदार पटेल\"]', '1', NULL, 1, '2026-01-01 22:15:32', 'mcq', NULL, '0.00', 'easy', 61, '2026-01-01 22:15:32'),
(88, 19, 'किस विटामिन की कमी से रतौंधी रोग होता है?', '[\"विटामिन A\", \"विटामिन B\", \"विटामिन C\", \"विटामिन D\"]', '0', NULL, 1, '2026-01-01 22:15:32', 'mcq', NULL, '0.00', 'easy', 62, '2026-01-01 22:15:32'),
(89, 19, 'भारतीय संविधान में “धर्मनिरपेक्ष” शब्द किस संशोधन द्वारा जोड़ा गया?', '[\"42वाँ\", \"44वाँ\", \"52वाँ\", \"61वाँ\"]', '0', NULL, 1, '2026-01-01 22:15:32', 'mcq', NULL, '0.00', 'medium', 63, '2026-01-01 22:15:32'),
(90, 19, 'पृथ्वी के वायुमंडल में सर्वाधिक मात्रा में कौन-सी गैस पायी जाती है?', '[\"ऑक्सीजन\", \"कार्बन डाइऑक्साइड\", \"नाइट्रोजन\", \"हाइड्रोजन\"]', '2', NULL, 1, '2026-01-01 22:15:32', 'mcq', NULL, '0.00', 'easy', 64, '2026-01-01 22:15:32'),
(91, 19, 'भारत का राष्ट्रीय पक्षी कौन-सा है?', '[\"तोता\", \"मोर\", \"कबूतर\", \"कोयल\"]', '1', NULL, 1, '2026-01-01 22:15:32', 'mcq', NULL, '0.00', 'easy', 65, '2026-01-01 22:15:32'),
(92, 19, 'मानव शरीर में रक्त का शुद्धिकरण कौन करता है?', '[\"हृदय\", \"यकृत\", \"गुर्दा\", \"फेफड़ा\"]', '2', NULL, 1, '2026-01-01 22:15:32', 'mcq', NULL, '0.00', 'easy', 66, '2026-01-01 22:15:32'),
(93, 19, 'भारत का सबसे बड़ा बाँध कौन-सा है?', '[\"भाखड़ा नांगल\", \"हीराकुंड\", \"तेहरी\", \"सरदार सरोवर\"]', '0', NULL, 1, '2026-01-01 22:15:32', 'mcq', NULL, '0.00', 'medium', 67, '2026-01-01 22:15:32'),
(94, 19, 'किस धातु का उपयोग सिक्के बनाने में किया जाता है?', '[\"लोहा\", \"ताँबा\", \"जस्ता\", \"सोना\"]', '1', NULL, 1, '2026-01-01 22:15:32', 'mcq', NULL, '0.00', 'easy', 68, '2026-01-01 22:15:32'),
(95, 19, 'भारतीय संविधान की प्रस्तावना में कितने आदर्श शब्द हैं?', '[\"4\", \"5\", \"6\", \"7\"]', '2', NULL, 1, '2026-01-01 22:15:32', 'mcq', NULL, '0.00', 'medium', 69, '2026-01-01 22:15:32'),
(96, 19, 'किस ग्रह के चारों ओर वलय (Ring) पाए जाते हैं?', '[\"मंगल\", \"बृहस्पति\", \"शनि\", \"अरुण\"]', '2', NULL, 1, '2026-01-01 22:15:32', 'mcq', NULL, '0.00', 'easy', 70, '2026-01-01 22:15:32'),
(97, 19, 'भारत का सबसे ऊँचा जलप्रपात कौन-सा है?', '[\"जोग जलप्रपात\", \"कुंचिकल जलप्रपात\", \"दूधसागर\", \"शिवसमुद्रम\"]', '1', NULL, 1, '2026-01-01 22:15:32', 'mcq', NULL, '0.00', 'medium', 71, '2026-01-01 22:15:32'),
(98, 19, 'भारतीय संविधान में राज्यसभा के सदस्यों का कार्यकाल कितने वर्ष का होता है?', '[\"4 वर्ष\", \"5 वर्ष\", \"6 वर्ष\", \"7 वर्ष\"]', '2', NULL, 1, '2026-01-01 22:15:32', 'mcq', NULL, '0.00', 'medium', 72, '2026-01-01 22:15:32'),
(99, 19, 'कौन-सा अम्ल सिरके में पाया जाता है?', '[\"लैक्टिक अम्ल\", \"एसीटिक अम्ल\", \"सिट्रिक अम्ल\", \"ऑक्सेलिक अम्ल\"]', '1', NULL, 1, '2026-01-01 22:15:32', 'mcq', NULL, '0.00', 'easy', 73, '2026-01-01 22:15:32'),
(100, 19, 'भारत का सबसे छोटा राज्य क्षेत्रफल की दृष्टि से कौन-सा है?', '[\"गोवा\", \"सिक्किम\", \"त्रिपुरा\", \"मिजोरम\"]', '0', NULL, 1, '2026-01-01 22:15:32', 'mcq', NULL, '0.00', 'easy', 74, '2026-01-01 22:15:32'),
(101, 19, 'कौन-सा ग्रह सूर्य के सबसे निकट है?', '[\"शुक्र\", \"बुध\", \"मंगल\", \"पृथ्वी\"]', '1', NULL, 1, '2026-01-01 22:15:32', 'mcq', NULL, '0.00', 'easy', 75, '2026-01-01 22:15:32'),
(102, 19, 'भारत का राष्ट्रीय फूल कौन-सा है?', '[\"गुलाब\", \"कमल\", \"सूरजमुखी\", \"लिली\"]', '1', NULL, 1, '2026-01-01 22:15:32', 'mcq', NULL, '0.00', 'easy', 76, '2026-01-01 22:15:32'),
(103, 19, 'मानव शरीर में सबसे कठोर पदार्थ कौन-सा है?', '[\"हड्डी\", \"दाँत\", \"नाखून\", \"त्वचा\"]', '1', NULL, 1, '2026-01-01 22:15:32', 'mcq', NULL, '0.00', 'easy', 77, '2026-01-01 22:15:32'),
(104, 19, 'किस खेल को “मैदान का शतरंज” कहा जाता है?', '[\"फुटबॉल\", \"क्रिकेट\", \"हॉकी\", \"शतरंज\"]', '2', NULL, 1, '2026-01-01 22:15:32', 'mcq', NULL, '0.00', 'medium', 78, '2026-01-01 22:15:32'),
(105, 19, 'भारतीय संविधान का संरक्षक किसे कहा जाता है?', '[\"प्रधानमंत्री\", \"राष्ट्रपति\", \"संसद\", \"सर्वोच्च न्यायालय\"]', '3', NULL, 1, '2026-01-01 22:15:32', 'mcq', NULL, '0.00', 'medium', 79, '2026-01-01 22:15:32'),
(106, 19, 'किस गैस को “आँसू गैस” कहा जाता है?', '[\"क्लोरीन\", \"अमोनिया\", \"क्लोरोएसीटोन\", \"नाइट्रोजन\"]', '2', NULL, 1, '2026-01-01 22:15:32', 'mcq', NULL, '0.00', 'medium', 80, '2026-01-01 22:15:32'),
(107, 19, 'भारत का राष्ट्रीय गान कितनी पंक्तियों का है?', '[\"4\", \"5\", \"6\", \"7\"]', '2', NULL, 1, '2026-01-01 22:16:25', 'mcq', NULL, '0.00', 'easy', 81, '2026-01-01 22:16:25'),
(108, 19, 'कौन-सा विटामिन हड्डियों के लिए आवश्यक है?', '[\"विटामिन A\", \"विटामिन B\", \"विटामिन C\", \"विटामिन D\"]', '3', NULL, 1, '2026-01-01 22:16:25', 'mcq', NULL, '0.00', 'easy', 82, '2026-01-01 22:16:25'),
(109, 19, 'भारत में पंचायती राज व्यवस्था किस संशोधन द्वारा लागू की गई?', '[\"61वाँ\", \"73वाँ\", \"74वाँ\", \"86वाँ\"]', '1', NULL, 1, '2026-01-01 22:16:25', 'mcq', NULL, '0.00', 'medium', 83, '2026-01-01 22:16:25'),
(110, 19, 'मानव शरीर में सबसे छोटी हड्डी कौन-सी है?', '[\"स्टेपीज\", \"मेलियस\", \"इनकस\", \"फीमर\"]', '0', NULL, 1, '2026-01-01 22:16:25', 'mcq', NULL, '0.00', 'medium', 84, '2026-01-01 22:16:25'),
(111, 19, 'कौन-सा ग्रह “संध्या तारा” कहलाता है?', '[\"मंगल\", \"बुध\", \"शुक्र\", \"बृहस्पति\"]', '2', NULL, 1, '2026-01-01 22:16:25', 'mcq', NULL, '0.00', 'easy', 85, '2026-01-01 22:16:25'),
(112, 19, 'भारतीय संविधान में उपराष्ट्रपति का चुनाव कौन करता है?', '[\"लोकसभा\", \"राज्यसभा\", \"संसद\", \"निर्वाचन मंडल\"]', '3', NULL, 1, '2026-01-01 22:16:25', 'mcq', NULL, '0.00', 'medium', 86, '2026-01-01 22:16:25'),
(113, 19, 'किस धातु को “भविष्य की धातु” कहा जाता है?', '[\"लोहा\", \"ताँबा\", \"एल्युमिनियम\", \"सोना\"]', '2', NULL, 1, '2026-01-01 22:16:25', 'mcq', NULL, '0.00', 'medium', 87, '2026-01-01 22:16:25'),
(114, 19, 'भारत का राष्ट्रीय जलीय जीव कौन-सा है?', '[\"मगरमच्छ\", \"डॉल्फ़िन\", \"कछुआ\", \"मछली\"]', '1', NULL, 1, '2026-01-01 22:16:25', 'mcq', NULL, '0.00', 'easy', 88, '2026-01-01 22:16:25'),
(115, 19, 'किस देश को “उगते सूरज का देश” कहा जाता है?', '[\"चीन\", \"जापान\", \"कोरिया\", \"थाईलैंड\"]', '1', NULL, 1, '2026-01-01 22:16:25', 'mcq', NULL, '0.00', 'easy', 89, '2026-01-01 22:16:25'),
(116, 19, 'मानव रक्त का लाल रंग किसके कारण होता है?', '[\"प्लाज़्मा\", \"हीमोग्लोबिन\", \"ऑक्सीजन\", \"लौह\"]', '1', NULL, 1, '2026-01-01 22:16:25', 'mcq', NULL, '0.00', 'easy', 90, '2026-01-01 22:16:25'),
(117, 19, 'भारत में सबसे अधिक वर्षा किस स्थान पर होती है?', '[\"दार्जिलिंग\", \"चेरापूंजी\", \"मौसिनराम\", \"शिलांग\"]', '2', NULL, 1, '2026-01-01 22:16:25', 'mcq', NULL, '0.00', 'medium', 91, '2026-01-01 22:16:25'),
(118, 19, 'कौन-सा अंग मानव शरीर में रक्त को पंप करता है?', '[\"फेफड़ा\", \"मस्तिष्क\", \"हृदय\", \"यकृत\"]', '2', NULL, 1, '2026-01-01 22:16:25', 'mcq', NULL, '0.00', 'easy', 92, '2026-01-01 22:16:25'),
(119, 19, 'भारत का राष्ट्रीय प्रतीक किससे लिया गया है?', '[\"हड़प्पा\", \"सारनाथ\", \"तक्षशिला\", \"मथुरा\"]', '1', NULL, 1, '2026-01-01 22:16:25', 'mcq', NULL, '0.00', 'medium', 93, '2026-01-01 22:16:25'),
(120, 19, 'किस अम्ल का उपयोग कार बैटरी में किया जाता है?', '[\"हाइड्रोक्लोरिक\", \"नाइट्रिक\", \"सल्फ्यूरिक\", \"एसीटिक\"]', '2', NULL, 1, '2026-01-01 22:16:25', 'mcq', NULL, '0.00', 'easy', 94, '2026-01-01 22:16:25'),
(121, 19, 'भारत का सबसे लंबा रेलवे प्लेटफ़ॉर्म कहाँ है?', '[\"खड़गपुर\", \"गोरखपुर\", \"इलाहाबाद\", \"पटना\"]', '1', NULL, 1, '2026-01-01 22:16:25', 'mcq', NULL, '0.00', 'medium', 95, '2026-01-01 22:16:25'),
(122, 19, 'किस ग्रह को “नीला ग्रह” कहा जाता है?', '[\"पृथ्वी\", \"अरुण\", \"वरुण\", \"नेपच्यून\"]', '0', NULL, 1, '2026-01-01 22:16:25', 'mcq', NULL, '0.00', 'easy', 96, '2026-01-01 22:16:25'),
(123, 19, 'मानव शरीर में भोजन का पाचन मुख्यतः कहाँ होता है?', '[\"आमाशय\", \"यकृत\", \"छोटी आँत\", \"बड़ी आँत\"]', '2', NULL, 1, '2026-01-01 22:16:25', 'mcq', NULL, '0.00', 'easy', 97, '2026-01-01 22:16:25'),
(124, 19, 'भारत का राष्ट्रीय फल कौन-सा है?', '[\"सेब\", \"केला\", \"आम\", \"संतरा\"]', '2', NULL, 1, '2026-01-01 22:16:25', 'mcq', NULL, '0.00', 'easy', 98, '2026-01-01 22:16:25'),
(125, 19, 'किस धातु को जंग लगती है?', '[\"सोना\", \"ताँबा\", \"लोहा\", \"चाँदी\"]', '2', NULL, 1, '2026-01-01 22:16:25', 'mcq', NULL, '0.00', 'easy', 99, '2026-01-01 22:16:25'),
(126, 19, 'भारत का राष्ट्रीय गीत कौन-सा है?', '[\"जन गण मन\", \"वंदे मातरम्\", \"सारे जहाँ से अच्छा\", \"ऐ मेरे वतन के लोगों\"]', '1', NULL, 1, '2026-01-01 22:16:25', 'mcq', NULL, '0.00', 'easy', 100, '2026-01-01 22:16:25'),
(127, 22, 'हाल हाल ही में ब्रज प्रहार अभ्यास 2025 निम्नलिखित में से किन दो देशों के बीच किया गया है?', '\"[\\\"भारत और अमेरिका \\\",\\\"भारत और जापान \\\",\\\"भारत और ब्रिटेन \\\",\\\"भारत और दक्षिण कोरिया \\\"]\"', '\"[0]\"', 'सही उतर _ भारत और अमेरिका\nसाइक्लोन अभ्यास _भारत और मिस्र', 1, '2026-01-02 17:11:44', 'multiple_answer', NULL, '0.00', 'medium', 0, '2026-01-02 17:11:44'),
(128, 22, 'निम्नलिखित में से भारतीय रिजर्व बैंक का राष्ट्रीयकरण किस वर्ष किया गया था?', '\"[\\\"वर्ष 1950 \\\",\\\"वर्ष 1949 \\\",\\\"वर्ष 1936\\\",\\\"वर्ष 1935\\\"]\"', '\"[1]\"', 'भारतीय रिजर्व बैंक का मुख्यालय मुंबई में अवस्थित है।\nअभी वर्तमान में  भारतीय रिजर्व बैंक के गवर्नर शक्तिकांत दास हैं ।', 1, '2026-01-02 17:23:00', 'multiple_answer', NULL, '0.00', 'medium', 1, '2026-01-02 17:23:00'),
(129, 22, 'निम्नलिखित में से नीचे दिए गए कथनों में कौन सा कथन सही है?\n(A) पारिस्थितिकी तंत्र में संख्या पिरामिड का पिरामिड उल्टा और सीधे दोनों बनते हैं ।\n(B) ऊर्जा का पिरामिड हमेशा सीधा बनता है ।', '\"[\\\"A,B दोनों कथन सही है।\\\",\\\"केवल A सही है।\\\",\\\"केवल B सही है।\\\",\\\"A और B दोनों कथन असत्य है।\\\"]\"', '\"[0]\"', NULL, 1, '2026-01-02 17:32:09', 'multiple_answer', NULL, '0.00', 'medium', 2, '2026-01-02 17:32:09'),
(130, 15, 'Test', '\"[\\\"Test\\\",\\\"Teste\\\",\\\"Tesss\\\",\\\"Hdydy\\\"]\"', '\"0\"', NULL, 50, '2026-01-03 01:01:51', 'mcq', NULL, '0.00', 'medium', 1, '2026-01-03 02:18:15'),
(131, 22, 'हाल ही में कौन सा राष्ट्रीय उद्यान पूर्णतः सौर ऊर्जा से संचालित राष्ट्रीय उद्यान बना है?', '\"[\\\"काजीरंगा राष्ट्रीय उद्यान \\\",\\\"बन्नेरघट्टा राष्ट्रीय उद्यान\\\",\\\"माधव राष्ट्रीय उद्यान\\\",\\\"सिमलीपाल राष्ट्रीय उद्यान\\\"]\"', '\"[1]\"', 'बन्नेरघट्टा राष्ट्रीय उद्यान भारत के कर्नाटक राज्य में अवस्थित है!\nयह उद्यान तितली के लिए प्रसिद्ध है.!', 1, '2026-01-03 01:37:56', 'multiple_answer', NULL, '0.00', 'medium', 3, '2026-01-03 01:37:56'),
(132, 22, 'निम्नलिखित में से प्रसिद्ध एटलस पर्वत किस महाद्वीप में अवस्थित है?', '\"[\\\"उत्तरी अमेरिका\\\",\\\"दक्षिण अमेरिका\\\",\\\"अफ्रीका\\\",\\\"यूरोप \\\"]\"', '\"[2]\"', 'इस पर्वत श्रृंखला का नाम ग्रीक प्रारंभिक कथाओं के टाइटन एटलस के नाम पर रखा गया है!', 1, '2026-01-03 01:40:05', 'multiple_answer', NULL, '0.00', 'medium', 4, '2026-01-03 01:40:05'),
(133, 22, 'निम्नलिखित में से एक तरंग के सिर्फ एक दिशा में कंपन के प्रतिबन्ध की घटना को क्या कहा जाता है?', '\"[\\\"प्रकाश का व्यतिकरण \\\",\\\"प्रकाश का परावर्तन\\\",\\\"प्रकाश का विचलन\\\",\\\"प्रकाश का ध्रुवण \\\"]\"', '\"[3]\"', NULL, 1, '2026-01-03 01:41:43', 'multiple_answer', NULL, '0.00', 'medium', 5, '2026-01-03 01:41:43'),
(134, 22, 'प्रधानमंत्री इंदिरा गांधी द्वारा शुरू किए गए 20 सूत्री कार्यक्रम की स्थापना किस पंचवर्षीय योजना काल के दौरान की गई थी?', '\"[\\\"चौथी पंचवर्षीय योजना\\\",\\\"तीसरी पंचवर्षीय योजना\\\",\\\"पांचवी पंचवर्षीय योजना\\\",\\\"दूसरी पंचवर्षीय योजना \\\"]\"', '\"[2]\"', 'इस योजना को वर्ष 1975 में शुरू किया गया था!', 1, '2026-01-03 01:43:27', 'multiple_answer', NULL, '0.00', 'medium', 6, '2026-01-03 01:43:27'),
(135, 22, 'एक वस्तु के मूल्य में 20% की छूट देने के बाद भी 10% का लाभ होता है,अंकित मूल्य क्रय मूल्य से कितना प्रतिशत अधिक है?', '\"[\\\"40% \\\",\\\"12%\\\",\\\"12.5%\\\",\\\"37.5%\\\"]\"', '\"[3]\"', NULL, 1, '2026-01-03 01:45:23', 'multiple_answer', NULL, '0.00', 'medium', 7, '2026-01-03 01:45:23'),
(136, 22, 'निम्नलिखित में से गंगा नदी बिहार के कितने जिलों से होकर गुजरती है?', '\"[\\\"23\\\",\\\"10\\\",\\\"12\\\",\\\"11\\\"]\"', '\"[2]\"', NULL, 1, '2026-01-03 01:46:48', 'multiple_answer', NULL, '0.00', 'medium', 8, '2026-01-03 01:46:48'),
(137, 22, 'निम्नलिखित में से अंतरिक्ष से सीधे स्मार्टफोन वॉइस कॉल सक्षम करने के लिए इसरो किस उपग्रह को लॉन्च करने की योजना बना रही है?', '\"[\\\"ब्लू बर्ड सैटेलाइट \\\",\\\"आर्टेमिस उपग्रह \\\",\\\"स्टार लिक सैटलाइट \\\",\\\"उपयुक्त में से सभी \\\"]\"', '\"[0]\"', 'इसरो एक अमेरिकी संचार उपग्रह प्रक्षेपित करने की योजना बना रहा है जिससे अंतरिक्ष से सीधे स्मार्टफोन कॉल संभव हो सकेगा या पहली बार होगा जब किसी अमेरिकी कंपनी का बड़ा पैमाने का उपग्रह भारतीय रॉकेट से प्रक्षेपित किया जाएगा!', 1, '2026-01-03 01:49:31', 'multiple_answer', NULL, '0.00', 'medium', 9, '2026-01-03 01:49:31'),
(138, 22, 'निम्नलिखित में से महात्मा गांधी द्वारा नवंबर 1909 में इंग्लैंड से दक्षिण अफ्रीका की यात्रा के दौरान कौन सा पुस्तक लिखा गया था?', '\"[\\\"यंग इंडिया \\\",\\\"हिंद स्वराज\\\",\\\"नवजीवन\\\",\\\"इंडियन ओपिनियन\\\"]\"', '\"[1]\"', 'हिंद स्वराज पुस्तक पर वर्ष 1910 में ब्रिटिश सरकार द्वारा प्रतिबंध लगाया गया था क्योंकि इसमें भारत के शाही शासन से स्वतंत्रता का आह्वान किया गया था!\n\n महात्मा गांधी का घोषणा पत्र ओम प्रशासन द्वारा प्रकाशित किया गया था!', 1, '2026-01-03 01:52:33', 'multiple_answer', NULL, '0.00', 'medium', 10, '2026-01-03 01:52:33'),
(139, 22, 'निम्नलिखित में से इक्ता प्रणाली को किसी सल्तनत कालीन शासक ने समाप्त कर दिया था?', '\"[\\\"फिरोज शाह तुगलक \\\",\\\"अलाउद्दीन खिलजी\\\",\\\"कुतुबुद्दीन ऐबक \\\",\\\"इल्तुतमिश \\\"]\"', '\"[1]\"', 'इक्ता प्रणाली इल्तुतमिश के शासनकाल के दौरान शुरू की गई थी अलाउद्दीन खिलजी ने इसको अपने शासनकाल में समाप्त कर दिया था!', 1, '2026-01-03 01:57:41', 'multiple_answer', NULL, '0.00', 'medium', 11, '2026-01-03 01:57:41'),
(140, 22, 'निम्नलिखित में से किस प्रक्रिया के अंतर्गत कोशिका झिल्ली में गैसीय विनिमय होता है?', '\"[\\\"विसरण\\\",\\\"परासरण \\\",\\\"अंतः शवश्न \\\",\\\"अवशोषण \\\"]\"', '\"[0]\"', NULL, 1, '2026-01-03 01:59:18', 'multiple_answer', NULL, '0.00', 'medium', 12, '2026-01-03 01:59:18'),
(141, 22, 'निम्नलिखित में से किस वर्ष से प्रत्येक वर्ष में 22 अप्रैल को विश्व पृथ्वी दिवस मनाया जा रहा है?', '\"[\\\"वर्ष 1950 \\\",\\\"वर्ष 1949 \\\",\\\"वर्ष 1970\\\",\\\"वर्ष 1972\\\"]\"', '\"[2]\"', NULL, 1, '2026-01-05 16:10:31', 'multiple_answer', NULL, '0.00', 'medium', 13, '2026-01-05 16:10:31'),
(142, 22, 'निम्नलिखित में से वर्ष 1988 ईस्वी में सेबी की स्थापना की गई थी इसका मुख्यालय कहां में अवस्थित है?', '\"[\\\"नई दिल्ली\\\",\\\"हैदराबाद \\\",\\\"मुंबई \\\",\\\"कोलकाता \\\"]\"', '\"[]\"', '22 जून को विश्व ऊंट दिवस और विश्व वर्षा वन दिवस मनाया जाता है!', 1, '2026-01-05 16:14:20', 'multiple_answer', NULL, '0.00', 'medium', 14, '2026-01-05 16:14:20'),
(143, 22, 'निम्नलिखित में से सामाजिक ,आर्थिक एवं राजनीतिक न्याय के तत्वों को किस देश के क्रांति आंदोलन से लिया गया है?', '\"[\\\"1917 ई की रूसी क्रांति\\\",\\\"बोल्शेविक क्रांति\\\",\\\"फ्रांसीसी क्रांति\\\",\\\"उपर्युक्त में से कोई नहीं\\\"]\"', '\"[0]\"', 'भारतीय संविधान की प्रस्तावना में सामाजिक न्याय ,आर्थिक न्याय और राजनीतिक न्याय का उल्लेख मिलता है।', 1, '2026-01-05 16:17:09', 'multiple_answer', NULL, '0.00', 'medium', 15, '2026-01-05 16:17:09'),
(144, 22, 'निम्नलिखित में से\" हिप्पोकैंप \"किस ग्रह का चंद्रमा का नाम है?', '\"[\\\"बृहस्पति ग्रह\\\",\\\"शनि ग्रह\\\",\\\"नेपच्यून ग्रह(वरुण गृह)\\\",\\\"शुक्र ग्रह\\\"]\"', '\"[2]\"', 'नेपच्यून ग्रह का सबसे छोटा उपग्रह नेय्याद है।', 1, '2026-01-05 16:19:52', 'multiple_answer', NULL, '0.00', 'medium', 16, '2026-01-05 16:19:52'),
(145, 22, 'निम्नलिखित में से वह कौन सा ग्रह है जो हरे रंग का है जिसके चारों ओर अति शीतल मिथेन का बादल छाया हुआ है?', '\"[\\\"शनि ग्रह\\\",\\\"वरुण ग्रह\\\",\\\"बृहस्पति ग्रह\\\",\\\"मंगल ग्रह \\\"]\"', '\"[1]\"', 'वरुण ग्रह की खोज जॉन गाले ने 1846 ईस्वी में किया था', 1, '2026-01-05 16:23:00', 'multiple_answer', NULL, '0.00', 'medium', 17, '2026-01-05 16:23:00'),
(146, 22, 'निम्नलिखित में से लोक स्वास्थ्य ,सिंचाई ,क्रय विक्रय एवं लोकव्यवस्था किस सूची के अंतर्गत आते हैं?', '\"[\\\"राज्य सूची \\\",\\\"समवर्ती सूची \\\",\\\"संघ सूची \\\",\\\"उपर्युक्त में से सभी \\\"]\"', '\"[0]\"', NULL, 1, '2026-01-05 16:25:26', 'multiple_answer', NULL, '0.00', 'medium', 18, '2026-01-05 16:25:26'),
(147, 22, 'निम्नलिखित में से विद्युत चुंबकीय प्रेरण के द्वितीय नियम को किस नियम के नाम से भी जाना जाता है?', '\"[\\\"लेंज का नियम\\\",\\\"फराडे का नियम\\\",\\\"न्यूटन के गति नियम\\\",\\\"कूलंब का नियम\\\"]\"', '\"[0]\"', 'विद्युत चुंबकीय प्रेरण की खोज फराडे ने वर्ष 1831 ईस्वी में किया था।', 1, '2026-01-06 01:26:05', 'multiple_answer', NULL, '0.00', 'medium', 19, '2026-01-06 01:26:05'),
(148, 22, 'निम्नलिखित में से\" विस्के की खाड़ी \"किन दो देशों के साथ तटीय सीमा साझा करती है?', '\"[\\\"जर्मनी और इटली\\\",\\\"स्पेन और इटली\\\",\\\"ब्रिटेन और फ्रांस\\\",\\\"स्पेन और फ्रांस\\\"]\"', '\"[3]\"', 'हृदय के लिए कृत्रिम पेशमेकर ,डायनेमो ट्रांसफार्मर आदि विद्युत चुंबकीय प्रेरण के सिद्धांत पर कार्य करता है।', 1, '2026-01-06 01:28:04', 'multiple_answer', NULL, '0.00', 'medium', 20, '2026-01-06 01:28:04'),
(149, 22, 'निम्नलिखित में से कालिदास की किस कृति में मालव देश की राजकुमारी मालविका तथा विदिशा के राजकुमार अग्निमित्र का प्रेम व उनके विवाह का वर्णन है?', '\"[\\\"मेघदूतम\\\",\\\"कुमारसंभवम्\\\",\\\"मालविका अग्निमित्र\\\",\\\"रघुवंशम\\\"]\"', '\"[2]\"', 'मालविका अग्निमित्र के लेखक कालिदास हैं।', 1, '2026-01-06 01:29:50', 'multiple_answer', NULL, '0.00', 'medium', 21, '2026-01-06 01:29:50'),
(150, 22, 'हाल ही में किस देश में \"याला ग्लेशियर \"को आधिकारिक रूप से मृत घोषित किया गया है?', '\"[\\\"संयुक्त राज्य अमेरिका\\\",\\\"भूटान\\\",\\\"जापान\\\",\\\"नेपाल\\\"]\"', '\"[3]\"', NULL, 1, '2026-01-06 18:12:56', 'multiple_answer', NULL, '0.00', 'medium', 22, '2026-01-06 18:12:56'),
(151, 22, 'हाल ही में किस राज्य में भारतीय तटरक्षक बल में \"ऑपरेशन ओलिविया \"चलाया है?', '\"[\\\"गुजरात\\\",\\\"छत्तीसगढ़\\\",\\\"उड़ीसा\\\",\\\"आंध्र प्रदेश\\\"]\"', '\"[2]\"', NULL, 1, '2026-01-06 18:14:01', 'multiple_answer', NULL, '0.00', 'medium', 23, '2026-01-06 18:14:01'),
(152, 22, 'निम्नलिखित में से पदार्थ की प्रकृति के बारे में मूल सिद्धांत किसने प्रतिपादित किया था?', '\"[\\\"जॉन डाल्टन\\\",\\\"लेवायसिये \\\",\\\"नीलबोहर\\\",\\\"मेंडल \\\"]\"', '\"[0]\"', 'जॉन डाल्टन ने वर्ष 1808 ईस्वी में सबसे पहले पदार्थ के परमाणु सिद्धांत का प्रस्ताव रखा और उसका नाम डाल्टन का परमाणु सिद्धांत दिया गया!', 1, '2026-01-06 18:33:52', 'multiple_answer', NULL, '0.00', 'medium', 24, '2026-01-06 18:33:52'),
(153, 22, 'निम्नलिखित में से प्रथम विश्व युद्ध के समाप्ति के बाद लीग ऑफ नेशंस की स्थापना वुडरो विल्सन के द्वारा किस वर्ष किया गया था?', '\"[\\\"वर्ष 1820\\\",\\\"वर्ष 1920\\\",\\\"वर्ष 1918\\\",\\\"वर्ष 1915\\\"]\"', '\"[1]\"', 'लीग ऑफ नेशंस एक अंतरराष्ट्रीय राजनीतिक समूह था जो प्रथम विश्व युद्ध के अंत के बाद गठित और विकसित हुआ था!', 1, '2026-01-06 18:36:18', 'multiple_answer', NULL, '0.00', 'medium', 25, '2026-01-06 18:36:18'),
(154, 22, '₹6000 वाले के उत्पाद को किस मूल पर अंकित किया जाए की 10% छूट देने के बाद विक्रेता को 20% का लाभ हो?', '\"[\\\"₹7500\\\",\\\"₹3000\\\",\\\"₹6000\\\",\\\"₹8000\\\"]\"', '\"[3]\"', NULL, 1, '2026-01-06 18:38:10', 'multiple_answer', NULL, '0.00', 'medium', 26, '2026-01-06 18:38:10'),
(155, 22, 'किस मुगल बादशाह ने अपने वश में कश्मीर को एक अलग सूबे के रूप में बनाया जिसकी सत्ता श्रीनगर में थी?', '\"[\\\"अकबर \\\",\\\"जहांगीर \\\",\\\"शाहजहाँ \\\",\\\"बाबर \\\"]\"', '\"[2]\"', 'मुगल बादशाह अकबर ने 1586 ईस्वी में कश्मीर को अपने कबूल सूबे में कर लिया था', 1, '2026-01-06 18:40:29', 'multiple_answer', NULL, '0.00', 'medium', 27, '2026-01-06 18:40:29');

-- --------------------------------------------------------

--
-- Table structure for table `quizzes`
--

CREATE TABLE `quizzes` (
  `id` int NOT NULL,
  `title` varchar(500) NOT NULL,
  `description` text,
  `category` varchar(100) NOT NULL,
  `difficulty` varchar(50) NOT NULL,
  `duration` int NOT NULL,
  `total_marks` int NOT NULL,
  `passing_marks` int NOT NULL,
  `price` decimal(10,2) DEFAULT '0.00',
  `discount_price` decimal(10,2) DEFAULT NULL,
  `access_duration_days` int DEFAULT '365',
  `is_lifetime_access` tinyint(1) DEFAULT '1',
  `instructor_id` int NOT NULL,
  `course_id` int DEFAULT NULL,
  `subject_id` int DEFAULT NULL,
  `chapter_id` int DEFAULT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT '0',
  `is_scheduled` tinyint(1) DEFAULT '0',
  `results_declared` tinyint(1) DEFAULT '0',
  `results_declaration_time` datetime DEFAULT NULL,
  `shuffle_questions` tinyint(1) NOT NULL DEFAULT '1',
  `show_results` tinyint(1) NOT NULL DEFAULT '1',
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `total_attempts` int NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  `thumbnail` varchar(500) DEFAULT NULL,
  `is_free` tinyint(1) NOT NULL DEFAULT '0',
  `free_questions_count` int NOT NULL DEFAULT '0',
  `negative_marking` tinyint(1) NOT NULL DEFAULT '0',
  `negative_marks_per_question` decimal(3,2) DEFAULT '0.00',
  `allow_review` tinyint(1) NOT NULL DEFAULT '1',
  `show_answer_key` tinyint(1) NOT NULL DEFAULT '1',
  `certificate_eligible` tinyint(1) NOT NULL DEFAULT '0',
  `attempts_allowed` int DEFAULT '1',
  `total_students` int NOT NULL DEFAULT '0',
  `is_featured` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `quizzes`
--

INSERT INTO `quizzes` (`id`, `title`, `description`, `category`, `difficulty`, `duration`, `total_marks`, `passing_marks`, `price`, `discount_price`, `access_duration_days`, `is_lifetime_access`, `instructor_id`, `course_id`, `subject_id`, `chapter_id`, `is_published`, `is_scheduled`, `results_declared`, `results_declaration_time`, `shuffle_questions`, `show_results`, `start_time`, `end_time`, `total_attempts`, `created_at`, `updated_at`, `thumbnail`, `is_free`, `free_questions_count`, `negative_marking`, `negative_marks_per_question`, `allow_review`, `show_answer_key`, `certificate_eligible`, `attempts_allowed`, `total_students`, `is_featured`) VALUES
(4, 'General Knowledge Quiz - Free', 'Test your general knowledge with this comprehensive quiz covering various topics', 'General Knowledge', 'Easy', 10, 50, 30, '50.00', NULL, 365, 1, 1, NULL, NULL, NULL, 0, 0, 0, NULL, 1, 1, NULL, NULL, 1, '2025-12-03 18:33:59', '2026-01-01 21:42:58', NULL, 1, 2, 0, '0.00', 1, 1, 0, 1, 0, 0),
(15, 'Final Testing', 'testing testing testing testing testing testing testing testing testing testing testing', 'State PSC', 'hard', 60, 100, 80, '50.00', '5.00', 365, 1, 2, NULL, NULL, NULL, 1, 0, 0, NULL, 1, 1, NULL, NULL, 13, '2026-01-01 21:44:09', '2026-01-05 16:11:36', NULL, 0, 0, 0, '0.00', 1, 1, 0, 50, 0, 0),
(19, 'Bihar Police Test Series – Set 12', '100 MCQs for Bihar Police Exam Preparation', 'Other', 'medium', 120, 100, 70, '500.00', '5.00', 365, 1, 2, NULL, NULL, NULL, 1, 0, 0, NULL, 1, 1, NULL, NULL, 0, '2026-01-01 22:02:18', '2026-01-05 16:53:13', NULL, 0, 10, 1, '0.25', 1, 1, 0, 1, 0, 0),
(20, 'BIHAR DAROGA TEST SERIES', 'बिहार दारोगा से संबंधित महत्वपूर्ण प्रश्न।।', 'Other', 'medium', 120, 200, 60, '0.00', NULL, 365, 1, 2, NULL, NULL, NULL, 0, 0, 0, NULL, 1, 1, NULL, NULL, 0, '2026-01-02 15:23:57', '2026-01-02 15:23:57', NULL, 1, 0, 1, '0.25', 1, 1, 0, 1, 0, 0),
(21, 'ऊंची उड़ान', 'बिहार दरोगा', 'Other', 'medium', 120, 200, 60, '0.00', NULL, 365, 1, 12, NULL, NULL, NULL, 0, 1, 0, NULL, 1, 1, '2026-01-04 05:30:00', '2026-01-04 06:31:00', 0, '2026-01-02 16:27:06', '2026-01-02 16:27:06', NULL, 1, 0, 1, '0.00', 1, 1, 1, 1, 0, 0),
(22, 'ऊंची उड़ान', 'बिहार दरोगा प्रीलिम्स टेस्ट', 'Other', 'medium', 120, 200, 62, '0.00', NULL, 365, 1, 12, NULL, 1, 1, 1, 1, 0, NULL, 1, 1, '2026-01-04 03:30:00', '2026-01-05 05:30:00', 1, '2026-01-02 17:07:28', '2026-03-09 22:30:36', NULL, 1, 0, 1, '0.00', 1, 1, 1, 1, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `quiz_access`
--

CREATE TABLE `quiz_access` (
  `id` int NOT NULL,
  `userId` int NOT NULL,
  `quizId` int NOT NULL,
  `accessGrantedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `accessExpiresAt` timestamp NULL DEFAULT NULL,
  `isLifetimeAccess` tinyint(1) DEFAULT '0',
  `isAccessExpired` tinyint(1) DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `quiz_access`
--

INSERT INTO `quiz_access` (`id`, `userId`, `quizId`, `accessGrantedAt`, `accessExpiresAt`, `isLifetimeAccess`, `isAccessExpired`, `createdAt`, `updatedAt`) VALUES
(1, 5, 19, '2026-03-09 23:44:18', NULL, 0, 0, '2026-03-09 23:44:18', '2026-03-09 23:44:18');

-- --------------------------------------------------------

--
-- Table structure for table `quiz_attempts`
--

CREATE TABLE `quiz_attempts` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `quiz_id` int NOT NULL,
  `score` int NOT NULL,
  `total_questions` int NOT NULL,
  `correct_answers` int NOT NULL,
  `wrong_answers` int NOT NULL,
  `skipped_answers` int NOT NULL,
  `time_taken` int NOT NULL,
  `answers` json NOT NULL,
  `is_passed` tinyint(1) NOT NULL,
  `status` varchar(50) DEFAULT 'submitted',
  `result_viewed` tinyint(1) DEFAULT '0',
  `completed_at` timestamp NOT NULL DEFAULT (now()),
  `percentage` decimal(5,2) DEFAULT NULL,
  `rank` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `quiz_attempts`
--

INSERT INTO `quiz_attempts` (`id`, `user_id`, `quiz_id`, `score`, `total_questions`, `correct_answers`, `wrong_answers`, `skipped_answers`, `time_taken`, `answers`, `is_passed`, `status`, `result_viewed`, `completed_at`, `percentage`, `rank`) VALUES
(3, 5, 4, 10, 5, 1, 3, 1, 18, '\"[{\\\"questionId\\\":2,\\\"selectedOption\\\":2,\\\"correctAnswer\\\":1,\\\"isCorrect\\\":false,\\\"marks\\\":0},{\\\"questionId\\\":6,\\\"selectedOption\\\":3,\\\"correctAnswer\\\":2,\\\"isCorrect\\\":false,\\\"marks\\\":0},{\\\"questionId\\\":3,\\\"selectedOption\\\":1,\\\"correctAnswer\\\":1,\\\"isCorrect\\\":true,\\\"marks\\\":10},{\\\"questionId\\\":4,\\\"selectedOption\\\":3,\\\"correctAnswer\\\":0,\\\"isCorrect\\\":false,\\\"marks\\\":0},{\\\"questionId\\\":5,\\\"selectedOption\\\":null,\\\"correctAnswer\\\":2,\\\"isCorrect\\\":false,\\\"marks\\\":0}]\"', 0, 'submitted', 1, '2025-12-04 18:45:03', NULL, NULL),
(9, 10, 15, 0, 1, 0, 1, 0, 1, '\"[{\\\"questionId\\\":17,\\\"selectedOption\\\":2,\\\"correctAnswer\\\":0,\\\"isCorrect\\\":false,\\\"marks\\\":0}]\"', 0, 'submitted', 0, '2026-01-01 21:49:07', '0.00', NULL),
(10, 2, 22, 0, 3, 0, 3, 0, 5, '\"[{\\\"questionId\\\":129,\\\"selectedOption\\\":1,\\\"correctAnswer\\\":[0],\\\"isCorrect\\\":false,\\\"marks\\\":0},{\\\"questionId\\\":128,\\\"selectedOption\\\":3,\\\"correctAnswer\\\":[1],\\\"isCorrect\\\":false,\\\"marks\\\":0},{\\\"questionId\\\":127,\\\"selectedOption\\\":1,\\\"correctAnswer\\\":[0],\\\"isCorrect\\\":false,\\\"marks\\\":0}]\"', 0, 'submitted', 1, '2026-01-03 01:03:19', '0.00', NULL),
(11, 5, 15, 0, 2, 0, 2, 0, 3, '\"[{\\\"questionId\\\":130,\\\"selectedOption\\\":2,\\\"correctAnswer\\\":0,\\\"isCorrect\\\":false,\\\"marks\\\":0},{\\\"questionId\\\":17,\\\"selectedOption\\\":3,\\\"correctAnswer\\\":0,\\\"isCorrect\\\":false,\\\"marks\\\":0}]\"', 0, 'submitted', 0, '2026-01-03 02:02:17', '0.00', NULL),
(12, 5, 15, 0, 2, 0, 2, 0, 2, '\"[{\\\"questionId\\\":17,\\\"selectedOption\\\":2,\\\"correctAnswer\\\":0,\\\"isCorrect\\\":false,\\\"marks\\\":0},{\\\"questionId\\\":130,\\\"selectedOption\\\":1,\\\"correctAnswer\\\":0,\\\"isCorrect\\\":false,\\\"marks\\\":0}]\"', 0, 'submitted', 0, '2026-01-03 02:16:42', '0.00', NULL),
(13, 5, 15, 1, 2, 1, 1, 0, 1, '\"[{\\\"questionId\\\":17,\\\"selectedOption\\\":3,\\\"correctAnswer\\\":0,\\\"isCorrect\\\":false,\\\"marks\\\":0},{\\\"questionId\\\":130,\\\"selectedOption\\\":0,\\\"correctAnswer\\\":0,\\\"isCorrect\\\":true,\\\"marks\\\":1}]\"', 0, 'submitted', 0, '2026-01-03 02:17:01', '50.00', NULL),
(14, 5, 15, 100, 2, 2, 0, 0, 7, '\"[{\\\"questionId\\\":130,\\\"selectedOption\\\":0,\\\"correctAnswer\\\":0,\\\"isCorrect\\\":true,\\\"marks\\\":50},{\\\"questionId\\\":17,\\\"selectedOption\\\":0,\\\"correctAnswer\\\":0,\\\"isCorrect\\\":true,\\\"marks\\\":50}]\"', 1, 'submitted', 0, '2026-01-03 02:18:41', '100.00', NULL),
(15, 5, 15, 50, 2, 1, 1, 0, 2, '\"[{\\\"questionId\\\":17,\\\"selectedOption\\\":0,\\\"correctAnswer\\\":0,\\\"isCorrect\\\":true,\\\"marks\\\":50},{\\\"questionId\\\":130,\\\"selectedOption\\\":2,\\\"correctAnswer\\\":0,\\\"isCorrect\\\":false,\\\"marks\\\":0}]\"', 0, 'submitted', 1, '2026-01-03 02:19:02', '50.00', NULL),
(16, 5, 15, 50, 2, 1, 1, 0, 2, '\"[{\\\"questionId\\\":17,\\\"selectedOption\\\":0,\\\"correctAnswer\\\":0,\\\"isCorrect\\\":true,\\\"marks\\\":50},{\\\"questionId\\\":130,\\\"selectedOption\\\":2,\\\"correctAnswer\\\":0,\\\"isCorrect\\\":false,\\\"marks\\\":0}]\"', 0, 'submitted', 0, '2026-01-03 02:29:10', '50.00', NULL),
(17, 5, 15, 0, 2, 0, 2, 0, 1, '\"[{\\\"questionId\\\":17,\\\"selectedOption\\\":3,\\\"correctAnswer\\\":0,\\\"isCorrect\\\":false,\\\"marks\\\":0},{\\\"questionId\\\":130,\\\"selectedOption\\\":2,\\\"correctAnswer\\\":0,\\\"isCorrect\\\":false,\\\"marks\\\":0}]\"', 0, 'submitted', 0, '2026-01-03 02:32:11', '0.00', NULL),
(18, 5, 15, 0, 2, 0, 2, 0, 2, '\"[{\\\"questionId\\\":130,\\\"selectedOption\\\":3,\\\"correctAnswer\\\":0,\\\"isCorrect\\\":false,\\\"marks\\\":0},{\\\"questionId\\\":17,\\\"selectedOption\\\":2,\\\"correctAnswer\\\":0,\\\"isCorrect\\\":false,\\\"marks\\\":0}]\"', 0, 'submitted', 0, '2026-01-03 02:33:31', '0.00', NULL),
(19, 2, 15, 50, 2, 1, 1, 0, 8, '\"[{\\\"questionId\\\":17,\\\"selectedOption\\\":0,\\\"correctAnswer\\\":0,\\\"isCorrect\\\":true,\\\"marks\\\":50},{\\\"questionId\\\":130,\\\"selectedOption\\\":2,\\\"correctAnswer\\\":0,\\\"isCorrect\\\":false,\\\"marks\\\":0}]\"', 0, 'submitted', 1, '2026-01-03 02:51:03', '50.00', NULL),
(20, 5, 15, 100, 2, 2, 0, 0, 5, '\"[{\\\"questionId\\\":17,\\\"selectedOption\\\":0,\\\"correctAnswer\\\":0,\\\"isCorrect\\\":true,\\\"marks\\\":50},{\\\"questionId\\\":130,\\\"selectedOption\\\":0,\\\"correctAnswer\\\":0,\\\"isCorrect\\\":true,\\\"marks\\\":50}]\"', 1, 'submitted', 0, '2026-01-03 02:51:40', '100.00', NULL),
(21, 10, 15, 50, 2, 1, 1, 0, 2, '\"[{\\\"questionId\\\":17,\\\"selectedOption\\\":0,\\\"correctAnswer\\\":0,\\\"isCorrect\\\":true,\\\"marks\\\":50},{\\\"questionId\\\":130,\\\"selectedOption\\\":2,\\\"correctAnswer\\\":0,\\\"isCorrect\\\":false,\\\"marks\\\":0}]\"', 0, 'submitted', 1, '2026-01-03 02:54:02', '50.00', NULL),
(22, 2, 15, 50, 2, 1, 0, 1, 2, '\"[{\\\"questionId\\\":17,\\\"selectedOption\\\":0,\\\"correctAnswer\\\":0,\\\"isCorrect\\\":true,\\\"marks\\\":50},{\\\"questionId\\\":130,\\\"selectedOption\\\":null,\\\"correctAnswer\\\":0,\\\"isCorrect\\\":false,\\\"marks\\\":0}]\"', 0, 'submitted', 0, '2026-01-05 16:11:36', '50.00', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `site_settings`
--

CREATE TABLE `site_settings` (
  `id` int NOT NULL,
  `site_name` varchar(255) NOT NULL DEFAULT 'Unchi Udaan',
  `logo` varchar(500) DEFAULT NULL,
  `favicon` varchar(500) DEFAULT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `contact_phone` varchar(50) DEFAULT NULL,
  `contact_address` text,
  `facebook_url` varchar(500) DEFAULT NULL,
  `instagram_url` varchar(500) DEFAULT NULL,
  `linkedin_url` varchar(500) DEFAULT NULL,
  `whatsapp_number` varchar(50) DEFAULT NULL,
  `telegram_url` varchar(500) DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text,
  `meta_keywords` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `site_settings`
--

INSERT INTO `site_settings` (`id`, `site_name`, `logo`, `favicon`, `contact_email`, `contact_phone`, `contact_address`, `facebook_url`, `instagram_url`, `linkedin_url`, `whatsapp_number`, `telegram_url`, `meta_title`, `meta_description`, `meta_keywords`, `created_at`, `updated_at`) VALUES
(1, 'Unchi Udaa', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'sdfgvbhjnm', NULL, NULL, '2025-12-08 11:46:39', '2025-12-14 16:53:10');

-- --------------------------------------------------------

--
-- Table structure for table `study_materials`
--

CREATE TABLE `study_materials` (
  `id` int NOT NULL,
  `title` varchar(500) NOT NULL,
  `description` text,
  `subject` varchar(100) NOT NULL,
  `category` varchar(100) NOT NULL,
  `file_type` varchar(20) NOT NULL,
  `file_url` varchar(500) NOT NULL,
  `file_size` int DEFAULT NULL,
  `total_pages` int DEFAULT NULL,
  `thumbnail` varchar(500) DEFAULT NULL,
  `instructor_id` int DEFAULT NULL,
  `course_id` int DEFAULT NULL,
  `is_paid` tinyint(1) NOT NULL DEFAULT '0',
  `price` decimal(10,2) DEFAULT NULL,
  `discount_price` decimal(10,2) DEFAULT NULL,
  `downloads` int NOT NULL DEFAULT '0',
  `is_published` tinyint(1) NOT NULL DEFAULT '1',
  `views` int NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `study_materials`
--

INSERT INTO `study_materials` (`id`, `title`, `description`, `subject`, `category`, `file_type`, `file_url`, `file_size`, `total_pages`, `thumbnail`, `instructor_id`, `course_id`, `is_paid`, `price`, `discount_price`, `downloads`, `is_published`, `views`, `created_at`, `updated_at`) VALUES
(1, 'Complete Indian History Notes for UPSC - Ancient to Modern', 'Comprehensive handwritten notes covering Ancient India (Indus Valley to Gupta Period), Medieval India (Delhi Sultanate to Mughal Empire), and Modern India (British Rule to Independence). Includes important dates, key personalities, major events, causes and effects of historical movements. Perfect for UPSC Prelims and Mains preparation. Contains maps, timelines, and practice questions at the end of each section.', 'History', 'UPSC', 'pdf', '/uploads/study-materials/quiz-5-results-1765191066313-323019821.pdf', 2768, 2, '/uploads/thumbnails/gettyimages-1322433208-612x612-1767121820672-210799152.jpg', NULL, NULL, 1, '500.00', NULL, 12, 1, 9, '2025-12-07 14:41:56', '2026-01-05 16:40:02'),
(2, 'Quantitative Aptitude Complete Formula Book - All Banking & SSC Exams', 'Quick reference formula book covering all topics: Number System, HCF & LCM, Percentages, Profit & Loss, Simple & Compound Interest, Time & Work, Time Speed Distance, Ratio & Proportion, Algebra, Geometry, Mensuration, and Data Interpretation. Each formula explained with shortcuts and solved examples. Includes 500+ practice questions with detailed solutions. Essential for SBI PO, IBPS, SSC CGL, SSC CHSL, Railway exams.', 'Maths', 'Banking', 'pdf', 'https://example.com/study-materials/quantitative-aptitude-formulas.pdf', 8388608, 156, 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400', NULL, NULL, 1, '200.00', NULL, 3, 1, 3, '2025-12-07 14:41:56', '2026-01-01 21:10:27'),
(3, 'Indian Geography Complete Guide - Physical, Economic & Human Geography', 'Premium comprehensive guide covering: Physical Geography (Mountains, Plateaus, Plains, Rivers, Climate, Soils, Vegetation), Economic Geography (Agriculture, Industries, Minerals, Energy Resources, Transportation), and Human Geography (Population, Demographics, Urbanization). Includes 50+ colored maps, 100+ diagrams, state-wise analysis, and 1000+ MCQs with explanations. Updated with latest government data and reports. Perfect for UPSC, State PCS, SSC exams.', 'Geography', 'UPSC', 'pdf', 'https://example.com/study-materials/indian-geography-complete.pdf', 31457280, 425, 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=400', NULL, NULL, 1, '399.00', NULL, 1, 1, 11, '2025-12-07 14:41:56', '2026-01-03 01:17:42'),
(4, 'English Grammar & Vocabulary Builder - Complete Guide for Competitive Exams', 'Complete English preparation resource covering: Parts of Speech, Tenses, Voice (Active & Passive), Narration (Direct & Indirect), Articles, Prepositions, Conjunctions, Sentence Correction, Error Detection, Fill in the Blanks, Cloze Test, Reading Comprehension strategies. Includes 3000+ vocabulary words with meanings, synonyms, antonyms, usage in sentences. 500+ idioms and phrases, 200+ one-word substitutions. Perfect for SSC CGL, Bank PO, Railway, Defence exams.', 'English', 'SSC', 'pdf', 'https://example.com/study-materials/english-grammar-vocabulary.pdf', 12582912, 234, 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400', NULL, NULL, 0, NULL, NULL, 0, 1, 0, '2025-12-07 14:41:56', '2025-12-07 14:41:56'),
(5, 'Indian Polity & Constitution - Premium Notes for UPSC & State PCS', 'Most comprehensive polity notes covering: Historical Background, Making of Constitution, Salient Features, Preamble, Fundamental Rights & Duties, DPSP, Union Executive (President, PM, Council of Ministers), Parliament (Lok Sabha, Rajya Sabha), Judiciary (Supreme Court, High Courts), Federalism, Centre-State Relations, Local Government (Panchayati Raj, Municipalities), Constitutional Bodies, Non-Constitutional Bodies, Emergency Provisions, Amendment Procedures, Important Constitutional Amendments (1st to 105th). Includes all landmark Supreme Court judgments, important Articles, Schedules explained, comparison with other countries. 800+ MCQs with detailed explanations. Updated with latest amendments and judgments till 2024.', 'Polity', 'UPSC', 'pdf', 'https://example.com/study-materials/indian-polity-constitution.pdf', 20971520, 356, 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400', NULL, NULL, 1, '499.00', NULL, 1, 1, 3, '2025-12-07 14:41:56', '2025-12-31 23:40:45'),
(6, 'General Science One-Liner Notes - Physics, Chemistry, Biology Quick Revision', 'Quick revision notes in one-liner format covering: Physics (Units, Motion, Force, Energy, Light, Sound, Electricity, Magnetism), Chemistry (Matter, Elements, Compounds, Acids-Bases, Metals, Chemical Reactions), Biology (Cell, Human Body Systems, Nutrition, Diseases, Plants, Genetics, Evolution). Perfect for last-minute revision before Railway RRB, SSC, Police, Defence exams. Contains 2000+ one-liners, important discoveries, scientists, Nobel Prize winners, latest developments in science.', 'Science', 'Railways', 'pdf', 'https://example.com/study-materials/general-science-one-liners.pdf', 5242880, 98, 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400', NULL, NULL, 0, NULL, NULL, 0, 1, 0, '2025-12-07 14:41:56', '2025-12-07 14:41:56'),
(7, 'Indian Economy - Latest Updates, Budget 2024-25 & Economic Survey Analysis', 'Premium economy material covering: Economic Concepts (GDP, GNP, Inflation, Fiscal Policy, Monetary Policy), Indian Economic Development (Planning, Five Year Plans, NITI Aayog), Sectors (Agriculture, Industry, Services), Financial System (RBI, Banking, Money Market, Capital Market, Insurance), Budget 2024-25 complete analysis, Economic Survey 2023-24 detailed coverage, Latest Government Schemes (PM-KISAN, Ayushman Bharat, Make in India, Digital India), International Organizations (IMF, World Bank, WTO, ADB), Current Economic Issues. Includes 50+ graphs, 30+ tables, 500+ MCQs. Updated till November 2024.', 'Economy', 'UPSC', 'pdf', 'https://example.com/study-materials/indian-economy-current-updates.pdf', 18874368, 298, 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400', NULL, NULL, 0, '0.00', NULL, 1, 1, 0, '2025-12-07 14:41:56', '2025-12-30 19:49:04');

-- --------------------------------------------------------

--
-- Table structure for table `study_material_purchases`
--

CREATE TABLE `study_material_purchases` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `study_material_id` int NOT NULL,
  `payment_id` int NOT NULL,
  `purchase_price` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `study_material_purchases`
--

INSERT INTO `study_material_purchases` (`id`, `user_id`, `study_material_id`, `payment_id`, `purchase_price`, `created_at`) VALUES
(1, 5, 3, 31, '399.00', '2025-12-09 23:00:22'),
(2, 2, 3, 57, '399.00', '2025-12-15 09:28:05'),
(3, 2, 5, 58, '499.00', '2025-12-15 11:19:35'),
(4, 6, 3, 59, '399.00', '2025-12-15 11:27:11'),
(5, 10, 1, 76, '250.00', '2025-12-31 23:54:34'),
(6, 2, 1, 78, '500.00', '2026-01-01 00:03:33'),
(7, 2, 2, 79, '200.00', '2026-01-01 00:11:23'),
(8, 10, 2, 81, '200.00', '2026-01-01 00:32:45'),
(9, 11, 1, 87, '500.00', '2026-01-01 21:10:17'),
(10, 11, 2, 88, '200.00', '2026-01-01 21:10:56'),
(11, 10, 3, 94, '0.00', '2026-01-03 01:17:47');

-- --------------------------------------------------------

--
-- Table structure for table `subcategories`
--

CREATE TABLE `subcategories` (
  `id` int NOT NULL,
  `category_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(150) NOT NULL,
  `description` text,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `order_index` int NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `subcategories`
--

INSERT INTO `subcategories` (`id`, `category_id`, `name`, `slug`, `description`, `is_active`, `order_index`, `created_at`, `updated_at`) VALUES
(1, 6, 'test1', 'test1', NULL, 1, 0, '2026-03-09 22:42:11', '2026-03-09 22:42:11');

-- --------------------------------------------------------

--
-- Table structure for table `testimonials`
--

CREATE TABLE `testimonials` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` int NOT NULL DEFAULT '5',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `display_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `testimonials`
--

INSERT INTO `testimonials` (`id`, `name`, `role`, `avatar`, `content`, `rating`, `is_active`, `display_order`, `created_at`, `updated_at`) VALUES
(6, 'Amit Kumar', 'Bihar Police SI 2023 – चयनित', 'AK', 'मैं एक साधारण ग्रामीण परिवार से हूँ। नियमित पढ़ाई, मॉक टेस्ट और सही मार्गदर्शन की वजह से मैं बिहार पुलिस सब-इंस्पेक्टर की परीक्षा पास कर पाया। यह प्लेटफॉर्म मेरी तैयारी का मजबूत आधार बना।', 5, 1, 1, '2026-01-08 20:33:24', '2026-01-08 20:35:12'),
(7, 'Pooja Singh', 'BPSC 68th – सफल उम्मीदवार', 'PS', 'BPSC की तैयारी के दौरान सही स्टडी मटीरियल और निरंतर अभ्यास ने मेरी सोच को मजबूत किया। यहाँ के टेस्ट और नोट्स ने मुझे आत्मविश्वास दिया।', 5, 1, 2, '2026-01-08 20:33:24', '2026-01-08 20:35:16'),
(8, 'Rahul Verma', 'Bihar SSC Graduate Level – चयनित', 'RV', 'मैं कई बार असफल हुआ लेकिन हार नहीं मानी। इस प्लेटफॉर्म से जुड़कर मेरी तैयारी सही दिशा में गई और अंततः सफलता मिली।', 5, 1, 3, '2026-01-08 20:33:24', '2026-01-08 20:35:21'),
(9, 'Neha Kumari', 'Bihar Teacher Recruitment (TRE 2.0) – चयन', 'NK', 'शिक्षक बनना मेरा सपना था। सिलेबस आधारित पढ़ाई और नियमित रिवीजन ने मुझे बिहार शिक्षक भर्ती परीक्षा में सफल बनाया।', 5, 1, 4, '2026-01-08 20:33:24', '2026-01-08 20:35:25'),
(10, 'Saurabh Mishra', 'Bihar Daroga (Police SI) – चयन', 'SM', 'डिसिप्लिन और सही रणनीति ही सफलता की कुंजी है। यहाँ मिले गाइडेंस और टेस्ट सीरीज ने मेरी तैयारी को मजबूत किया।', 5, 1, 5, '2026-01-08 20:33:24', '2026-01-08 20:35:41'),
(11, 'Anjali Rani', 'Bihar Panchayat Secretary – चयन', 'AR', 'कम समय में सही कंटेंट और स्मार्ट स्टडी की वजह से मैं पंचायत सचिव की परीक्षा पास कर पाई।', 5, 1, 6, '2026-01-08 20:33:24', '2026-01-08 20:35:46'),
(12, 'Vikash Kumar', 'Bihar Clerk (SSC Inter Level) – चयन', 'VK', 'मैंने बेसिक से शुरुआत की। नियमित टेस्ट और एनालिसिस से मेरी गलतियाँ सुधरीं और अंततः सफलता मिली।', 5, 1, 7, '2026-01-08 20:33:24', '2026-01-08 20:35:37'),
(13, 'Ritu Sharma', 'Bihar Lady Supervisor – चयन', 'RS', 'सही दिशा और निरंतर अभ्यास से कुछ भी संभव है। इस प्लेटफॉर्म ने मेरी तैयारी को आसान बनाया।', 5, 1, 8, '2026-01-08 20:33:24', '2026-01-08 20:35:29'),
(14, 'Deepak Yadav', 'Bihar JE (Junior Engineer) – चयन', 'DY', 'टेक्निकल विषयों की स्पष्ट समझ और प्रैक्टिस सेट्स ने मेरी तैयारी को परीक्षा के स्तर तक पहुँचाया।', 5, 1, 9, '2026-01-08 20:33:24', '2026-01-08 20:35:33'),
(15, 'Shalini Gupta', 'Bihar Health Department ANM – चयन', 'SG', 'मेहनत, सही स्टडी प्लान और निरंतर अभ्यास से मैंने ANM परीक्षा पास की। यह प्लेटफॉर्म मेरे सफर का महत्वपूर्ण हिस्सा रहा।', 5, 1, 10, '2026-01-08 20:33:24', '2026-01-08 20:35:51');

-- --------------------------------------------------------

--
-- Table structure for table `test_chapters`
--

CREATE TABLE `test_chapters` (
  `id` int NOT NULL,
  `subject_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `order_index` int NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `test_chapters`
--

INSERT INTO `test_chapters` (`id`, `subject_id`, `name`, `slug`, `description`, `is_active`, `order_index`, `created_at`, `updated_at`) VALUES
(1, 1, 'Aryabhatt', 'aryabhatt', NULL, 1, 0, '2026-03-09 22:21:16', '2026-03-09 22:21:16');

-- --------------------------------------------------------

--
-- Table structure for table `test_subjects`
--

CREATE TABLE `test_subjects` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `thumbnail` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `order_index` int NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `test_subjects`
--

INSERT INTO `test_subjects` (`id`, `name`, `slug`, `description`, `thumbnail`, `is_active`, `order_index`, `created_at`, `updated_at`) VALUES
(1, 'History', 'history', NULL, NULL, 1, 0, '2026-03-09 22:20:57', '2026-03-09 22:20:57');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'user',
  `avatar` varchar(500) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `bio` text,
  `is_verified` tinyint(1) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `email_notifications` tinyint(1) DEFAULT '1',
  `course_updates` tinyint(1) DEFAULT '1',
  `quiz_reminders` tinyint(1) DEFAULT '1',
  `two_factor_enabled` tinyint(1) DEFAULT '0',
  `two_factor_secret` varchar(255) DEFAULT NULL,
  `email_verification_token` varchar(10) DEFAULT NULL,
  `reset_password_token` varchar(255) DEFAULT NULL,
  `reset_password_expires` datetime DEFAULT NULL,
  `google_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  `last_login_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `avatar`, `phone`, `bio`, `is_verified`, `is_active`, `email_notifications`, `course_updates`, `quiz_reminders`, `two_factor_enabled`, `two_factor_secret`, `email_verification_token`, `reset_password_token`, `reset_password_expires`, `google_id`, `created_at`, `updated_at`, `last_login_at`) VALUES
(1, 'Shivang Kumar', 'shivangkumar018@gmail.com', '$2b$12$amJuIRymb1W2gLy7Boq05eqKpIEHMWex323jbdVhJkCa2LvKIyLoi', 'user', 'https://lh3.googleusercontent.com/a/ACg8ocK7kdHKkbeKh9iRwMKmGzJ8S4GdjhXYXcZeaKMtCJFrGysITzod=s96-c', NULL, NULL, 1, 1, 1, 1, 1, 0, NULL, NULL, '31566a0cb8699955ab29ddfc920d7b97024aa9d2d9481113c320484b43a422ab', '2025-12-01 21:43:40', '104352622747195237491', '2025-12-01 01:08:04', '2025-12-21 15:52:20', NULL),
(2, 'Admin User', 'admin@unchiudaan.com', '$2b$12$inHs7fI4F2dIWooJMieOBOFeS5nS9HZvNvdV6KvjUi5Tz36THJyY.', 'admin', NULL, NULL, NULL, 1, 1, 1, 1, 1, 0, NULL, NULL, NULL, NULL, NULL, '2025-12-01 01:26:36', '2025-12-01 01:45:21', NULL),
(5, 'Shivang', 'shivangkumarcgc@gmail.com', '$2b$12$D98Nkk4RH9.6c1Ep/PdZ0OiyUrbN0E5vbNdeoo6RVt4RCcSLfOMh2', 'user', 'https://lh3.googleusercontent.com/a/ACg8ocI5KhdS1SsZa_bPcMOj5HwsBR6-qwHcRPtUbSdx85tuOE7Jh-I=s96-c', NULL, NULL, 1, 1, 1, 1, 1, 1, 'b4e834972b62caba4d8df6c04aa8f40fd8da2e77', NULL, 'c2c1b82a6e5290261305776aa8ab368662791fc3d4f9882f8f6359f3264b2b51', '2026-01-02 01:16:10', '103707202090418173962', '2025-12-01 20:44:53', '2026-01-02 00:16:10', NULL),
(6, 'Instructor Use', 'instructor@unchiudaan.com', '$2b$12$UYPxWq69rto1FXdzQuQt9uBMIkrDkYHu45VrOQ6RCKvcT3Gzsbm3m', 'instructor', NULL, '9852001237', NULL, 1, 1, 1, 1, 1, 0, NULL, NULL, NULL, NULL, NULL, '2025-12-10 20:45:12', '2025-12-12 17:36:06', NULL),
(7, 'Test', 'test@gmail.com', '$2b$12$0mEOg/UNgd9bz9RV6DcQB.Xgqw8hRk5Ky/c8CRuFU58iDDnd3Pxfm', 'admin', NULL, '+919852001237', NULL, 1, 1, 1, 1, 1, 0, NULL, NULL, NULL, NULL, NULL, '2025-12-12 15:03:57', '2025-12-12 20:34:17', NULL),
(8, 'Shivang Kumar', 'shivangkumar98@gmail.com', '$2b$12$TLt25JxGIDlE/B1SILXyvuLhfJOIBBPN1vv2ACcZzRDtNHugjQTwm', 'user', NULL, NULL, NULL, 0, 1, 1, 1, 1, 0, NULL, '666294', NULL, NULL, NULL, '2025-12-14 01:44:25', '2025-12-14 01:44:25', NULL),
(9, 'Shivang Kumar', 'shivangkumar9852@gmail.com', '$2b$12$Qi2WTO7XS6R/IJBKYRq23.ONSK/96WJ4kRNFB9i7kNxbv1joxRDB2', 'user', NULL, NULL, NULL, 0, 1, 1, 1, 1, 0, NULL, '640082', NULL, NULL, NULL, '2025-12-14 01:44:59', '2025-12-14 01:44:59', NULL),
(10, 'Shivang Kumar', 'cec231366.cse.cec@cgc.edu.in', '$2b$12$9D1JcweCgZRh1EiHelP2kuLzoSIYiWNOH1CUGZaU0C4VeGk3qe7Bu', 'user', NULL, NULL, NULL, 1, 1, 1, 1, 1, 1, 'e4f52164288d2efce49963bda5e1d520eca5b438', NULL, NULL, NULL, NULL, '2025-12-31 20:19:04', '2026-01-01 20:57:32', NULL),
(11, 'Akash Yadav', 'akashay3846487@gmail.com', '$2b$12$J2K2wp5R9EFW5zaFqscfnuiJkWZx8m4j./y5hNbCjsdw3rh455/O.', 'user', NULL, NULL, NULL, 1, 1, 1, 1, 1, 0, NULL, NULL, NULL, NULL, NULL, '2026-01-01 20:42:35', '2026-01-01 20:42:52', NULL),
(12, 'Instructor 1', 'instructor1@gmail.com', '$2b$12$RKNtnCD3jUo4jizhjpC9me3sZ/bkD4BqcD7xsg6lYeL2EMrMHtmqS', 'instructor', NULL, '9852001237', NULL, 1, 1, 1, 1, 1, 0, NULL, NULL, NULL, NULL, NULL, '2026-01-01 18:21:42', '2026-03-09 20:36:23', NULL),
(13, 'Shivang Kumar', 'nitusharmaprc@gmail.com', '$2b$12$urHv69JcRNBxQ1ICREPlg.U8hhN9LPbtcHIVzrzTbJAy0no4cafO6', 'user', NULL, NULL, NULL, 1, 1, 1, 1, 1, 0, NULL, NULL, NULL, NULL, NULL, '2026-01-03 01:54:35', '2026-01-03 01:54:50', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `certificates`
--
ALTER TABLE `certificates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `certificate_id_unique` (`certificate_id`);

--
-- Indexes for table `certificate_templates`
--
ALTER TABLE `certificate_templates`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `coupons_code_unique` (`code`);

--
-- Indexes for table `coupon_usage`
--
ALTER TABLE `coupon_usage`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_coupon_unique` (`user_id`,`coupon_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_coupon_id` (`coupon_id`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `course_files`
--
ALTER TABLE `course_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `uploaded_by` (`uploaded_by`),
  ADD KEY `idx_course_id` (`course_id`);

--
-- Indexes for table `current_affairs`
--
ALTER TABLE `current_affairs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `enrollments`
--
ALTER TABLE `enrollments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_enrollments_expires` (`access_expires_at`,`is_access_expired`);

--
-- Indexes for table `feedbacks`
--
ALTER TABLE `feedbacks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_is_public` (`is_public`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `lessons`
--
ALTER TABLE `lessons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `module_id` (`module_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `lesson_progress`
--
ALTER TABLE `lesson_progress`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_lesson` (`user_id`,`lesson_id`),
  ADD KEY `lesson_id` (`lesson_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `modules`
--
ALTER TABLE `modules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `questions`
--
ALTER TABLE `questions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `quizzes`
--
ALTER TABLE `quizzes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_quizzes_subject_id` (`subject_id`),
  ADD KEY `idx_quizzes_chapter_id` (`chapter_id`);

--
-- Indexes for table `quiz_access`
--
ALTER TABLE `quiz_access`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_quiz` (`userId`,`quizId`),
  ADD KEY `quizId` (`quizId`),
  ADD KEY `idx_quiz_access_expires` (`accessExpiresAt`,`isAccessExpired`);

--
-- Indexes for table `quiz_attempts`
--
ALTER TABLE `quiz_attempts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `site_settings`
--
ALTER TABLE `site_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `study_materials`
--
ALTER TABLE `study_materials`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `study_material_purchases`
--
ALTER TABLE `study_material_purchases`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `subcategories`
--
ALTER TABLE `subcategories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_subcategories_category_id` (`category_id`);

--
-- Indexes for table `testimonials`
--
ALTER TABLE `testimonials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_is_active` (`is_active`),
  ADD KEY `idx_display_order` (`display_order`);

--
-- Indexes for table `test_chapters`
--
ALTER TABLE `test_chapters`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_test_chapters_subject_id` (`subject_id`);

--
-- Indexes for table `test_subjects`
--
ALTER TABLE `test_subjects`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `certificates`
--
ALTER TABLE `certificates`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `certificate_templates`
--
ALTER TABLE `certificate_templates`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `coupons`
--
ALTER TABLE `coupons`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `coupon_usage`
--
ALTER TABLE `coupon_usage`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `course_files`
--
ALTER TABLE `course_files`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `current_affairs`
--
ALTER TABLE `current_affairs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `enrollments`
--
ALTER TABLE `enrollments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `feedbacks`
--
ALTER TABLE `feedbacks`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `lessons`
--
ALTER TABLE `lessons`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `lesson_progress`
--
ALTER TABLE `lesson_progress`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `modules`
--
ALTER TABLE `modules`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=105;

--
-- AUTO_INCREMENT for table `questions`
--
ALTER TABLE `questions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=156;

--
-- AUTO_INCREMENT for table `quizzes`
--
ALTER TABLE `quizzes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `quiz_access`
--
ALTER TABLE `quiz_access`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `quiz_attempts`
--
ALTER TABLE `quiz_attempts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `site_settings`
--
ALTER TABLE `site_settings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `study_materials`
--
ALTER TABLE `study_materials`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `study_material_purchases`
--
ALTER TABLE `study_material_purchases`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `subcategories`
--
ALTER TABLE `subcategories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `testimonials`
--
ALTER TABLE `testimonials`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `test_chapters`
--
ALTER TABLE `test_chapters`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `test_subjects`
--
ALTER TABLE `test_subjects`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `coupon_usage`
--
ALTER TABLE `coupon_usage`
  ADD CONSTRAINT `coupon_usage_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `coupon_usage_ibfk_2` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `course_files`
--
ALTER TABLE `course_files`
  ADD CONSTRAINT `course_files_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `course_files_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `lessons`
--
ALTER TABLE `lessons`
  ADD CONSTRAINT `lessons_ibfk_1` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `lessons_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `lesson_progress`
--
ALTER TABLE `lesson_progress`
  ADD CONSTRAINT `lesson_progress_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `lesson_progress_ibfk_2` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `lesson_progress_ibfk_3` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `modules`
--
ALTER TABLE `modules`
  ADD CONSTRAINT `modules_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `quiz_access`
--
ALTER TABLE `quiz_access`
  ADD CONSTRAINT `quiz_access_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `quiz_access_ibfk_2` FOREIGN KEY (`quizId`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
