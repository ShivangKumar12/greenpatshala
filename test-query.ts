import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from './server/config/db';
import { quizzes, questions, quiz_access } from './shared/schema';

async function testQuery() {
    try {
        console.log("Starting query...");
        const conditions: any[] = [eq(quizzes.is_published, 1)];

        // Base quiz data
        const baseQuizzes = await db
            .select({
                id: quizzes.id,
                title: quizzes.title,
                description: quizzes.description,
                category: quizzes.category,
                difficulty: quizzes.difficulty,
                duration: quizzes.duration,
                total_marks: quizzes.total_marks,
                passing_marks: quizzes.passing_marks,
                price: quizzes.price,
                discount_price: quizzes.discount_price,
                freeQuestionsCount: quizzes.freeQuestionsCount,
                is_published: quizzes.is_published,
                is_scheduled: quizzes.is_scheduled,
                start_time: quizzes.start_time,
                end_time: quizzes.end_time,
                total_attempts: quizzes.total_attempts,
                created_at: quizzes.created_at,
            })
            .from(quizzes)
            .where(and(...conditions))
            .orderBy(desc(quizzes.created_at));

        console.log("baseQuizzes:", baseQuizzes.length);
        process.exit(0);
    } catch (error) {
        console.error("QUERY ERROR:", error);
        process.exit(1);
    }
}

testQuery();
